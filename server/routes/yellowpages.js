const express = require('express');
const Joi = require('joi');
const YellowPagesData = require('../models/YellowPagesData');
const Customer = require('../models/Customer');
const User = require('../models/User');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const yellowPagesDataSchema = Joi.object({
  businessName: Joi.string().required(),
  category: Joi.string().required(),
  subcategory: Joi.string().optional(),
  contact: Joi.object({
    phone: Joi.string().optional(),
    email: Joi.string().email().optional(),
    website: Joi.string().uri().optional()
  }).optional(),
  address: Joi.object({
    street: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    zipCode: Joi.string().optional()
  }).optional(),
  businessInfo: Joi.object({
    yearsInBusiness: Joi.number().min(0).optional(),
    employeeCount: Joi.string().optional(),
    services: Joi.array().items(Joi.string()).optional(),
    specialties: Joi.array().items(Joi.string()).optional()
  }).optional(),
  reviews: Joi.object({
    averageRating: Joi.number().min(0).max(5).optional(),
    totalReviews: Joi.number().min(0).optional()
  }).optional()
});

const leadUpdateSchema = Joi.object({
  status: Joi.string().valid('new', 'contacted', 'interested', 'not_interested', 'converted', 'lost').optional(),
  assignedTo: Joi.string().optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  notes: Joi.string().optional()
});

const contactAttemptSchema = Joi.object({
  method: Joi.string().valid('phone', 'email', 'in_person', 'social_media', 'other').required(),
  outcome: Joi.string().valid('no_answer', 'left_message', 'spoke_to_decision_maker', 'not_interested', 'interested', 'follow_up_needed', 'converted').required(),
  notes: Joi.string().optional(),
  nextFollowUp: Joi.date().optional()
});

// @route   GET /api/yellowpages
// @desc    Get all YellowPages data with filtering and pagination
// @access  Private
router.get('/', requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      assignedTo,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    // Filter by assigned user (Sub Admins can only see their own leads)
    if (req.user.role === 'sub_admin') {
      query.$or = [
        { 'leadInfo.assignedTo': req.user.id },
        { 'leadInfo.status': 'new' }
      ];
    } else if (assignedTo) {
      query['leadInfo.assignedTo'] = assignedTo;
    }

    if (status) query['leadInfo.status'] = status;
    if (priority) query['leadInfo.priority'] = priority;
    if (category) query.category = category;

    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { 'contact.phone': { $regex: search, $options: 'i' } },
        { 'contact.email': { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
        { 'address.state': { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const yellowPagesData = await YellowPagesData.find(query)
      .populate('leadInfo.assignedTo', 'name email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count
    const total = await YellowPagesData.countDocuments(query);

    res.json({
      success: true,
      data: {
        yellowPagesData,
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
    console.error('Get YellowPages data error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/yellowpages/:id
// @desc    Get single YellowPages record
// @access  Private
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const record = await YellowPagesData.findById(req.params.id)
      .populate('leadInfo.assignedTo', 'name email');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    // Check if user has access to this record
    if (req.user.role === 'sub_admin' && 
        record.leadInfo.assignedTo && 
        record.leadInfo.assignedTo._id.toString() !== req.user.id &&
        record.leadInfo.status !== 'new') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { record }
    });

  } catch (error) {
    console.error('Get YellowPages record error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/yellowpages/search
// @desc    Search YellowPages (simulated)
// @access  Private
router.post('/search', requireAdmin, async (req, res) => {
  try {
    const { keywords, location, radius, category } = req.body;

    // This is a simulated search - in a real implementation, you would integrate with YellowPages API
    // For now, we'll return mock data based on the search parameters
    
    const mockResults = [
      {
        businessName: `${keywords || 'Auto'} Repair Shop`,
        category: category || 'Automotive',
        contact: {
          phone: '(555) 123-4567',
          email: 'info@autorepair.com',
          website: 'https://autorepair.com'
        },
        address: {
          street: '123 Main St',
          city: location?.split(',')[0] || 'Anytown',
          state: location?.split(',')[1]?.trim() || 'ST',
          zipCode: '12345'
        },
        businessInfo: {
          yearsInBusiness: 15,
          employeeCount: '5-10',
          services: ['Oil Change', 'Brake Service', 'Engine Repair']
        },
        reviews: {
          averageRating: 4.5,
          totalReviews: 127
        }
      },
      {
        businessName: `${keywords || 'Car'} Service Center`,
        category: category || 'Automotive',
        contact: {
          phone: '(555) 987-6543',
          email: 'service@carservice.com',
          website: 'https://carservice.com'
        },
        address: {
          street: '456 Oak Ave',
          city: location?.split(',')[0] || 'Anytown',
          state: location?.split(',')[1]?.trim() || 'ST',
          zipCode: '12345'
        },
        businessInfo: {
          yearsInBusiness: 8,
          employeeCount: '3-5',
          services: ['Tire Rotation', 'Diagnostic', 'Transmission Service']
        },
        reviews: {
          averageRating: 4.2,
          totalReviews: 89
        }
      }
    ];

    res.json({
      success: true,
      message: 'Search completed successfully',
      data: {
        results: mockResults,
        searchParams: { keywords, location, radius, category }
      }
    });

  } catch (error) {
    console.error('YellowPages search error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/yellowpages/bulk-import
// @desc    Bulk import YellowPages data
// @access  Private
router.post('/bulk-import', requireAdmin, async (req, res) => {
  try {
    const { records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Records array is required'
      });
    }

    // Validate each record
    for (const record of records) {
      const { error } = yellowPagesDataSchema.validate(record);
      if (error) {
        return res.status(400).json({
          success: false,
          message: `Invalid record: ${error.details[0].message}`
        });
      }
    }

    // Create records with lead information
    const recordsToInsert = records.map(record => ({
      ...record,
      leadInfo: {
        status: 'new',
        priority: 'medium',
        contactAttempts: [],
        notes: 'Imported from YellowPages'
      }
    }));

    const insertedRecords = await YellowPagesData.insertMany(recordsToInsert);

    res.status(201).json({
      success: true,
      message: `${insertedRecords.length} records imported successfully`,
      data: {
        importedCount: insertedRecords.length,
        records: insertedRecords
      }
    });

  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/yellowpages/:id/lead
// @desc    Update lead information
// @access  Private
router.put('/:id/lead', requireAdmin, async (req, res) => {
  try {
    // Validate input
    const { error, value } = leadUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const record = await YellowPagesData.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    // Check if user has access to this record
    if (req.user.role === 'sub_admin' && 
        record.leadInfo.assignedTo && 
        record.leadInfo.assignedTo.toString() !== req.user.id &&
        record.leadInfo.status !== 'new') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update lead information
    if (value.status) record.leadInfo.status = value.status;
    if (value.priority) record.leadInfo.priority = value.priority;
    if (value.notes) record.leadInfo.notes = value.notes;
    
    if (value.assignedTo) {
      // Check if user exists
      const user = await User.findById(value.assignedTo);
      if (!user) {
        return res.status(400).json({
          success: false,
          message: 'User not found'
        });
      }
      record.leadInfo.assignedTo = value.assignedTo;
    }

    await record.save();

    // Populate references
    await record.populate('leadInfo.assignedTo', 'name email');

    res.json({
      success: true,
      message: 'Lead information updated successfully',
      data: { record }
    });

  } catch (error) {
    console.error('Update lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/yellowpages/:id/contact-attempt
// @desc    Add contact attempt
// @access  Private
router.post('/:id/contact-attempt', requireAdmin, async (req, res) => {
  try {
    // Validate input
    const { error, value } = contactAttemptSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const record = await YellowPagesData.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    // Check if user has access to this record
    if (req.user.role === 'sub_admin' && 
        record.leadInfo.assignedTo && 
        record.leadInfo.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Add contact attempt
    const contactAttempt = {
      date: new Date(),
      method: value.method,
      outcome: value.outcome,
      notes: value.notes,
      nextFollowUp: value.nextFollowUp
    };

    record.leadInfo.contactAttempts.push(contactAttempt);

    // Update status based on outcome
    if (value.outcome === 'converted') {
      record.leadInfo.status = 'converted';
    } else if (value.outcome === 'not_interested') {
      record.leadInfo.status = 'not_interested';
    } else if (value.outcome === 'interested') {
      record.leadInfo.status = 'interested';
    } else if (value.outcome === 'spoke_to_decision_maker') {
      record.leadInfo.status = 'contacted';
    }

    await record.save();

    res.json({
      success: true,
      message: 'Contact attempt added successfully',
      data: { contactAttempt }
    });

  } catch (error) {
    console.error('Add contact attempt error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/yellowpages/:id/convert-to-customer
// @desc    Convert lead to customer
// @access  Private
router.post('/:id/convert-to-customer', requireAdmin, async (req, res) => {
  try {
    const { customerData } = req.body;

    const record = await YellowPagesData.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Record not found'
      });
    }

    // Check if user has access to this record
    if (req.user.role === 'sub_admin' && 
        record.leadInfo.assignedTo && 
        record.leadInfo.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Create customer from YellowPages data
    const customer = new Customer({
      businessName: record.businessName,
      contactPerson: {
        name: customerData.contactPerson?.name || 'Contact Person',
        email: record.contact.email || customerData.contactPerson?.email,
        phone: record.contact.phone || customerData.contactPerson?.phone,
        position: customerData.contactPerson?.position || 'Owner'
      },
      address: {
        street: record.address.street || customerData.address?.street,
        city: record.address.city || customerData.address?.city,
        state: record.address.state || customerData.address?.state,
        zipCode: record.address.zipCode || customerData.address?.zipCode
      },
      businessInfo: {
        industry: record.category,
        website: record.contact.website,
        notes: `Converted from YellowPages lead. Original business: ${record.businessName}`
      },
      status: 'active',
      source: 'yellowpages',
      assignedTo: req.user.id
    });

    await customer.save();

    // Update YellowPages record
    record.leadInfo.status = 'converted';
    record.leadInfo.convertedToCustomer = customer._id;
    await record.save();

    res.json({
      success: true,
      message: 'Lead converted to customer successfully',
      data: { 
        customer,
        originalRecord: record
      }
    });

  } catch (error) {
    console.error('Convert to customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
