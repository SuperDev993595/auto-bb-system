const express = require('express');
const Joi = require('joi');
const SalesRecord = require('../models/SalesRecord');
const Customer = require('../models/Customer');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const salesRecordSchema = Joi.object({
  customer: Joi.string().required(),
  salesType: Joi.string().valid('product', 'service', 'package', 'consultation', 'other').required(),
  items: Joi.array().items(Joi.object({
    name: Joi.string().min(1).max(200).required(),
    description: Joi.string().max(500).optional(),
    category: Joi.string().max(100).optional(),
    quantity: Joi.number().min(1).required(),
    unitPrice: Joi.number().min(0).required(),
    totalPrice: Joi.number().min(0).required(),
    inventoryItem: Joi.string().optional(),
    service: Joi.string().optional()
  })).min(1).required(),
  subtotal: Joi.number().min(0).required(),
  tax: Joi.number().min(0).default(0),
  discount: Joi.number().min(0).default(0),
  total: Joi.number().min(0).required(),
  paymentStatus: Joi.string().valid('pending', 'partial', 'paid', 'refunded').default('pending'),
  paymentMethod: Joi.string().valid('cash', 'credit_card', 'debit_card', 'check', 'bank_transfer', 'online', 'other').optional(),
  paymentDate: Joi.date().optional(),
  paymentReference: Joi.string().max(100).optional(),
  salesSource: Joi.string().valid('walk_in', 'phone', 'online', 'referral', 'marketing_campaign', 'repeat_customer', 'other').default('walk_in'),
  convertedFromLead: Joi.boolean().default(false),
  originalLeadId: Joi.string().optional(),
  status: Joi.string().valid('draft', 'confirmed', 'completed', 'cancelled', 'refunded').default('draft'),
  saleDate: Joi.date().default(Date.now),
  notes: Joi.string().max(1000).optional(),
  nextFollowUp: Joi.date().optional(),
  warranty: Joi.object({
    hasWarranty: Joi.boolean().default(false),
    warrantyPeriod: Joi.number().min(0).optional(),
    warrantyExpiry: Joi.date().optional(),
    warrantyNotes: Joi.string().max(500).optional()
  }).optional()
});

const updateSalesRecordSchema = Joi.object({
  customer: Joi.string().optional(),
  salesType: Joi.string().valid('product', 'service', 'package', 'consultation', 'other').optional(),
  items: Joi.array().items(Joi.object({
    name: Joi.string().min(1).max(200).required(),
    description: Joi.string().max(500).optional(),
    category: Joi.string().max(100).optional(),
    quantity: Joi.number().min(1).required(),
    unitPrice: Joi.number().min(0).required(),
    totalPrice: Joi.number().min(0).required(),
    inventoryItem: Joi.string().optional(),
    service: Joi.string().optional()
  })).min(1).optional(),
  subtotal: Joi.number().min(0).optional(),
  tax: Joi.number().min(0).optional(),
  discount: Joi.number().min(0).optional(),
  total: Joi.number().min(0).optional(),
  paymentStatus: Joi.string().valid('pending', 'partial', 'paid', 'refunded').optional(),
  paymentMethod: Joi.string().valid('cash', 'credit_card', 'debit_card', 'check', 'bank_transfer', 'online', 'other').optional(),
  paymentDate: Joi.date().optional(),
  paymentReference: Joi.string().max(100).optional(),
  salesSource: Joi.string().valid('walk_in', 'phone', 'online', 'referral', 'marketing_campaign', 'repeat_customer', 'other').optional(),
  status: Joi.string().valid('draft', 'confirmed', 'completed', 'cancelled', 'refunded').optional(),
  saleDate: Joi.date().optional(),
  notes: Joi.string().max(1000).optional(),
  nextFollowUp: Joi.date().optional(),
  warranty: Joi.object({
    hasWarranty: Joi.boolean().optional(),
    warrantyPeriod: Joi.number().min(0).optional(),
    warrantyExpiry: Joi.date().optional(),
    warrantyNotes: Joi.string().max(500).optional()
  }).optional()
});

// @route   GET /api/sales-records
// @desc    Get all sales records with filtering and pagination
// @access  Private
router.get('/', requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      customer,
      salesPerson,
      salesType,
      status,
      paymentStatus,
      salesSource,
      startDate,
      endDate,
      search,
      sortBy = 'saleDate',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    // Filter by assigned user (Sub Admins can only see their own sales)
    if (req.user.role === 'admin') {
      query.salesPerson = req.user.id;
    } else if (salesPerson) {
      query.salesPerson = salesPerson;
    }

    if (customer) query.customer = customer;
    if (salesType) query.salesType = salesType;
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (salesSource) query.salesSource = salesSource;

    // Date range filter
    if (startDate || endDate) {
      query.saleDate = {};
      if (startDate) query.saleDate.$gte = new Date(startDate);
      if (endDate) query.saleDate.$lte = new Date(endDate);
    }

    // Search functionality
    if (search) {
      query.$or = [
        { recordNumber: { $regex: search, $options: 'i' } },
        { 'items.name': { $regex: search, $options: 'i' } },
        { 'items.description': { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { 'followUpNotes.content': { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const salesRecords = await SalesRecord.find(query)
      .populate('customer', 'businessName contactPerson.name email phone')
      .populate('salesPerson', 'name email')
      .populate('inventoryItem', 'name partNumber')
      .populate('service', 'name description')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count
    const total = await SalesRecord.countDocuments(query);

    res.json({
      success: true,
      data: {
        salesRecords,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalRecords: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get sales records error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/sales-records/:id
// @desc    Get single sales record by ID
// @access  Private
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const salesRecord = await SalesRecord.findById(req.params.id)
      .populate('customer', 'businessName contactPerson.name email phone address')
      .populate('salesPerson', 'name email')
      .populate('inventoryItem', 'name partNumber sku')
      .populate('service', 'name description')
      .populate('originalLeadId', 'title description');

    if (!salesRecord) {
      return res.status(404).json({
        success: false,
        message: 'Sales record not found'
      });
    }

    res.json({
      success: true,
      data: { salesRecord }
    });

  } catch (error) {
    console.error('Get sales record error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/sales-records
// @desc    Create new sales record
// @access  Private
router.post('/', requireAdmin, async (req, res) => {
  try {
    // Validate input
    const { error, value } = salesRecordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Check if customer exists
    const customer = await Customer.findById(value.customer);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Create sales record
    const salesRecord = new SalesRecord({
      ...value,
      salesPerson: req.user.id,
      createdBy: req.user.id
    });

    await salesRecord.save();

    // Populate references
    await salesRecord.populate('customer', 'businessName contactPerson.name email phone');
    await salesRecord.populate('salesPerson', 'name email');

    res.status(201).json({
      success: true,
      message: 'Sales record created successfully',
      data: { salesRecord }
    });

  } catch (error) {
    console.error('Create sales record error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/sales-records/:id
// @desc    Update sales record
// @access  Private
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    // Validate input
    const { error, value } = updateSalesRecordSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Check if sales record exists
    const salesRecord = await SalesRecord.findById(req.params.id);
    if (!salesRecord) {
      return res.status(404).json({
        success: false,
        message: 'Sales record not found'
      });
    }

    // Check if customer exists (if being updated)
    if (value.customer) {
      const customer = await Customer.findById(value.customer);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }
    }

    // Update sales record
    const updatedSalesRecord = await SalesRecord.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true, runValidators: true }
    ).populate('customer', 'businessName contactPerson.name email phone')
     .populate('salesPerson', 'name email');

    res.json({
      success: true,
      message: 'Sales record updated successfully',
      data: { salesRecord: updatedSalesRecord }
    });

  } catch (error) {
    console.error('Update sales record error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/sales-records/:id
// @desc    Delete sales record
// @access  Private
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const salesRecord = await SalesRecord.findById(req.params.id);
    if (!salesRecord) {
      return res.status(404).json({
        success: false,
        message: 'Sales record not found'
      });
    }

    await SalesRecord.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Sales record deleted successfully'
    });

  } catch (error) {
    console.error('Delete sales record error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/sales-records/:id/follow-up
// @desc    Add follow-up note to sales record
// @access  Private
router.post('/:id/follow-up', requireAdmin, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Follow-up content is required'
      });
    }

    const salesRecord = await SalesRecord.findById(req.params.id);
    if (!salesRecord) {
      return res.status(404).json({
        success: false,
        message: 'Sales record not found'
      });
    }

    await salesRecord.addFollowUpNote(content, req.user.id);

    res.json({
      success: true,
      message: 'Follow-up note added successfully'
    });

  } catch (error) {
    console.error('Add follow-up note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/sales-records/:id/payment
// @desc    Update payment status
// @access  Private
router.put('/:id/payment', requireAdmin, async (req, res) => {
  try {
    const { paymentStatus, paymentMethod, paymentDate } = req.body;

    const salesRecord = await SalesRecord.findById(req.params.id);
    if (!salesRecord) {
      return res.status(404).json({
        success: false,
        message: 'Sales record not found'
      });
    }

    await salesRecord.updatePaymentStatus(paymentStatus, paymentMethod, paymentDate);

    res.json({
      success: true,
      message: 'Payment status updated successfully'
    });

  } catch (error) {
    console.error('Update payment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/sales-records/stats/overview
// @desc    Get sales statistics overview
// @access  Private
router.get('/stats/overview', requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate, salesPerson } = req.query;

    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), 0, 1);
    const end = endDate ? new Date(endDate) : new Date();

    const stats = await SalesRecord.getSalesStats(start, end, salesPerson);
    const result = stats[0] || {
      totalSales: 0,
      totalRevenue: 0,
      totalItems: 0,
      avgSaleValue: 0
    };

    // Get additional stats
    const salesByType = await SalesRecord.aggregate([
      {
        $match: {
          saleDate: { $gte: start, $lte: end },
          ...(salesPerson && { salesPerson })
        }
      },
      {
        $group: {
          _id: '$salesType',
          count: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      }
    ]);

    const salesByStatus = await SalesRecord.aggregate([
      {
        $match: {
          saleDate: { $gte: start, $lte: end },
          ...(salesPerson && { salesPerson })
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: result,
        salesByType,
        salesByStatus
      }
    });

  } catch (error) {
    console.error('Get sales stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/sales-records/customer/:customerId
// @desc    Get sales records for a specific customer
// @access  Private
router.get('/customer/:customerId', requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const salesRecords = await SalesRecord.find({ customer: req.params.customerId })
      .populate('salesPerson', 'name email')
      .sort({ saleDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await SalesRecord.countDocuments({ customer: req.params.customerId });

    res.json({
      success: true,
      data: {
        salesRecords,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalRecords: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get customer sales records error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
