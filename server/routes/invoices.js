const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const ServiceCatalog = require('../models/Service');
const InventoryItem = require('../models/Inventory');

// Validation schemas
const invoiceItemSchema = Joi.object({
  itemType: Joi.string().valid('service', 'product').required(),
  itemId: Joi.string().required(),
  description: Joi.string().required(),
  quantity: Joi.number().positive().required(),
  unitPrice: Joi.number().positive().required(),
  discount: Joi.number().min(0).default(0),
  tax: Joi.number().min(0).default(0)
});

const invoiceSchema = Joi.object({
  customerId: Joi.string().required(),
  invoiceNumber: Joi.string().required(),
  issueDate: Joi.date().default(Date.now),
  dueDate: Joi.date().required(),
  items: Joi.array().items(invoiceItemSchema).min(1).required(),
  subtotal: Joi.number().positive().required(),
  taxAmount: Joi.number().min(0).required(),
  discountAmount: Joi.number().min(0).default(0),
  totalAmount: Joi.number().positive().required(),
  status: Joi.string().valid('draft', 'sent', 'paid', 'overdue', 'cancelled').default('draft'),
  paymentTerms: Joi.string().default('Net 30'),
  notes: Joi.string().allow('', null),
  terms: Joi.string().allow('', null)
});

// Get all invoices with pagination and filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, customerId, startDate, endDate, search } = req.query;
    
    const filter = {};
    
    if (status) filter.status = status;
    if (customerId) filter.customerId = customerId;
    if (startDate || endDate) {
      filter.issueDate = {};
      if (startDate) filter.issueDate.$gte = new Date(startDate);
      if (endDate) filter.issueDate.$lte = new Date(endDate);
    }
    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: [
        { path: 'customer', select: 'name email phone' },
        { path: 'items.itemId', select: 'name description' }
      ],
      sort: { issueDate: -1 }
    };

    const invoices = await Invoice.paginate(filter, options);
    
    res.json({
      success: true,
      data: invoices.docs,
      pagination: {
        page: invoices.page,
        limit: invoices.limit,
        totalDocs: invoices.totalDocs,
        totalPages: invoices.totalPages,
        hasNextPage: invoices.hasNextPage,
        hasPrevPage: invoices.hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch invoices' });
  }
});

// Get single invoice by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate('customer', 'name email phone address')
      .populate('items.itemId', 'name description price');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.json({ success: true, data: invoice });
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch invoice' });
  }
});

// Create new invoice
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = invoiceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    // Check if customer exists
    const customer = await Customer.findById(value.customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Check if invoice number is unique
    const existingInvoice = await Invoice.findOne({ invoiceNumber: value.invoiceNumber });
    if (existingInvoice) {
      return res.status(400).json({ success: false, message: 'Invoice number already exists' });
    }

    // Validate items
    for (const item of value.items) {
      if (item.itemType === 'service') {
        const service = await ServiceCatalog.findById(item.itemId);
        if (!service) {
          return res.status(400).json({ success: false, message: `Service with ID ${item.itemId} not found` });
        }
      } else if (item.itemType === 'product') {
        const product = await InventoryItem.findById(item.itemId);
        if (!product) {
          return res.status(400).json({ success: false, message: `Product with ID ${item.itemId} not found` });
        }
      }
    }

    const invoice = new Invoice({
      ...value,
      createdBy: req.user.id
    });

    await invoice.save();
    await invoice.populate('customer', 'name email phone');

    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ success: false, message: 'Failed to create invoice' });
  }
});

// Update invoice
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { error, value } = invoiceSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // Check if customer exists
    const customer = await Customer.findById(value.customerId);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Check if invoice number is unique (excluding current invoice)
    const existingInvoice = await Invoice.findOne({ 
      invoiceNumber: value.invoiceNumber, 
      _id: { $ne: req.params.id } 
    });
    if (existingInvoice) {
      return res.status(400).json({ success: false, message: 'Invoice number already exists' });
    }

    // Validate items
    for (const item of value.items) {
      if (item.itemType === 'service') {
        const service = await ServiceCatalog.findById(item.itemId);
        if (!service) {
          return res.status(400).json({ success: false, message: `Service with ID ${item.itemId} not found` });
        }
      } else if (item.itemType === 'product') {
        const product = await InventoryItem.findById(item.itemId);
        if (!product) {
          return res.status(400).json({ success: false, message: `Product with ID ${item.itemId} not found` });
        }
      }
    }

    Object.assign(invoice, value);
    invoice.updatedBy = req.user.id;
    invoice.updatedAt = Date.now();

    await invoice.save();
    await invoice.populate('customer', 'name email phone');

    res.json({ success: true, data: invoice });
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ success: false, message: 'Failed to update invoice' });
  }
});

// Delete invoice
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // Only allow deletion of draft invoices
    if (invoice.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Only draft invoices can be deleted' });
    }

    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ success: false, message: 'Failed to delete invoice' });
  }
});

// Add payment to invoice
router.post('/:id/payments', authenticateToken, async (req, res) => {
  try {
    const { amount, paymentMethod, reference, notes } = req.body;
    
    const paymentSchema = Joi.object({
      amount: Joi.number().positive().required(),
      paymentMethod: Joi.string().valid('cash', 'credit_card', 'bank_transfer', 'check', 'online').required(),
      reference: Joi.string().allow('', null),
      notes: Joi.string().allow('', null)
    });

    const { error } = paymentSchema.validate({ amount, paymentMethod, reference, notes });
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Invoice is already fully paid' });
    }

    const payment = {
      amount,
      paymentMethod,
      reference,
      notes,
      date: new Date(),
      processedBy: req.user.id
    };

    invoice.payments.push(payment);
    invoice.totalPaid = invoice.payments.reduce((sum, payment) => sum + payment.amount, 0);
    
    // Update status based on payment
    if (invoice.totalPaid >= invoice.totalAmount) {
      invoice.status = 'paid';
      invoice.paidDate = new Date();
    } else if (invoice.dueDate < new Date() && invoice.status !== 'overdue') {
      invoice.status = 'overdue';
    }

    await invoice.save();
    await invoice.populate('customer', 'name email phone');

    res.json({ success: true, data: invoice });
  } catch (error) {
    console.error('Error adding payment:', error);
    res.status(500).json({ success: false, message: 'Failed to add payment' });
  }
});

// Send invoice (update status to sent)
router.post('/:id/send', authenticateToken, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (invoice.status !== 'draft') {
      return res.status(400).json({ success: false, message: 'Only draft invoices can be sent' });
    }

    invoice.status = 'sent';
    invoice.sentDate = new Date();
    invoice.sentBy = req.user.id;

    await invoice.save();
    await invoice.populate('customer', 'name email phone');

    res.json({ success: true, data: invoice });
  } catch (error) {
    console.error('Error sending invoice:', error);
    res.status(500).json({ success: false, message: 'Failed to send invoice' });
  }
});

// Get invoice statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const filter = {};
    if (startDate || endDate) {
      filter.issueDate = {};
      if (startDate) filter.issueDate.$gte = new Date(startDate);
      if (endDate) filter.issueDate.$lte = new Date(endDate);
    }

    const stats = await Invoice.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$totalPaid' },
          totalOutstanding: { $sum: { $subtract: ['$totalAmount', '$totalPaid'] } },
          avgInvoiceValue: { $avg: '$totalAmount' }
        }
      }
    ]);

    const statusStats = await Invoice.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);

    const monthlyStats = await Invoice.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$issueDate' },
            month: { $month: '$issueDate' }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$totalPaid' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalInvoices: 0,
          totalAmount: 0,
          totalPaid: 0,
          totalOutstanding: 0,
          avgInvoiceValue: 0
        },
        byStatus: statusStats,
        monthly: monthlyStats
      }
    });
  } catch (error) {
    console.error('Error fetching invoice stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch invoice statistics' });
  }
});

module.exports = router;
