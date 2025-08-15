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

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const totalDocs = await Invoice.countDocuments(filter);
    const totalPages = Math.ceil(totalDocs / limitNum);

    // Get invoices with pagination
    const invoices = await Invoice.find(filter)
      .populate('customer', 'name email phone')
      .populate('items.reference', 'name description')
      .sort({ issueDate: -1 })
      .skip(skip)
      .limit(limitNum);
    
    res.json({
      success: true,
      data: invoices,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalDocs: totalDocs,
        totalPages: totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch invoices' });
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
          totalAmount: { $sum: '$total' },
          totalPaid: { $sum: '$paidAmount' },
          totalOutstanding: { $sum: { $subtract: ['$total', '$paidAmount'] } },
          avgInvoiceValue: { $avg: '$total' }
        }
      }
    ]);

    const statusStats = await Invoice.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' }
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
          totalAmount: { $sum: '$total' },
          totalPaid: { $sum: '$paidAmount' }
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

// Get invoice templates
router.get('/templates', authenticateToken, async (req, res) => {
  try {
    // Sample invoice templates
    const templates = [
      {
        id: 'standard',
        name: 'Standard Invoice',
        description: 'Basic invoice template for general services',
        fields: [
          { name: 'invoiceNumber', type: 'text', required: true, label: 'Invoice Number' },
          { name: 'issueDate', type: 'date', required: true, label: 'Issue Date' },
          { name: 'dueDate', type: 'date', required: true, label: 'Due Date' },
          { name: 'customerId', type: 'select', required: true, label: 'Customer' },
          { name: 'items', type: 'array', required: true, label: 'Items' },
          { name: 'subtotal', type: 'number', required: true, label: 'Subtotal' },
          { name: 'taxAmount', type: 'number', required: true, label: 'Tax Amount' },
          { name: 'totalAmount', type: 'number', required: true, label: 'Total Amount' },
          { name: 'notes', type: 'textarea', required: false, label: 'Notes' },
          { name: 'terms', type: 'textarea', required: false, label: 'Terms & Conditions' }
        ],
        defaultValues: {
          paymentTerms: 'Net 30',
          status: 'draft',
          taxRate: 0
        }
      },
      {
        id: 'detailed',
        name: 'Detailed Invoice',
        description: 'Comprehensive invoice template with detailed breakdown',
        fields: [
          { name: 'invoiceNumber', type: 'text', required: true, label: 'Invoice Number' },
          { name: 'issueDate', type: 'date', required: true, label: 'Issue Date' },
          { name: 'dueDate', type: 'date', required: true, label: 'Due Date' },
          { name: 'customerId', type: 'select', required: true, label: 'Customer' },
          { name: 'items', type: 'array', required: true, label: 'Items' },
          { name: 'subtotal', type: 'number', required: true, label: 'Subtotal' },
          { name: 'discountAmount', type: 'number', required: false, label: 'Discount Amount' },
          { name: 'taxAmount', type: 'number', required: true, label: 'Tax Amount' },
          { name: 'totalAmount', type: 'number', required: true, label: 'Total Amount' },
          { name: 'paymentTerms', type: 'select', required: false, label: 'Payment Terms' },
          { name: 'notes', type: 'textarea', required: false, label: 'Notes' },
          { name: 'terms', type: 'textarea', required: false, label: 'Terms & Conditions' }
        ],
        defaultValues: {
          paymentTerms: 'Net 30',
          status: 'draft',
          taxRate: 0,
          discountType: 'fixed',
          discountValue: 0
        }
      },
      {
        id: 'service',
        name: 'Service Invoice',
        description: 'Specialized template for service-based invoices',
        fields: [
          { name: 'invoiceNumber', type: 'text', required: true, label: 'Invoice Number' },
          { name: 'issueDate', type: 'date', required: true, label: 'Issue Date' },
          { name: 'dueDate', type: 'date', required: true, label: 'Due Date' },
          { name: 'customerId', type: 'select', required: true, label: 'Customer' },
          { name: 'items', type: 'array', required: true, label: 'Services' },
          { name: 'subtotal', type: 'number', required: true, label: 'Subtotal' },
          { name: 'taxAmount', type: 'number', required: true, label: 'Tax Amount' },
          { name: 'totalAmount', type: 'number', required: true, label: 'Total Amount' },
          { name: 'notes', type: 'textarea', required: false, label: 'Service Notes' }
        ],
        defaultValues: {
          paymentTerms: 'Net 15',
          status: 'draft',
          taxRate: 0
        }
      }
    ];

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    console.error('Error fetching invoice templates:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch invoice templates' });
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

// Mark overdue invoices
router.post('/mark-overdue', authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    
    // Find all sent invoices that are past due date
    const overdueInvoices = await Invoice.find({
      status: 'sent',
      dueDate: { $lt: today }
    });

    // Update their status to overdue
    const updatePromises = overdueInvoices.map(invoice => {
      invoice.status = 'overdue';
      return invoice.save();
    });

    await Promise.all(updatePromises);

    // Fetch updated invoices
    const updatedInvoices = await Invoice.find()
      .populate('customer', 'name email phone')
      .populate('items.reference', 'name description')
      .sort({ issueDate: -1 });

    res.json({ 
      success: true, 
      message: `${overdueInvoices.length} invoices marked as overdue`,
      data: updatedInvoices
    });
  } catch (error) {
    console.error('Error marking overdue invoices:', error);
    res.status(500).json({ success: false, message: 'Failed to mark overdue invoices' });
  }
});

module.exports = router;
