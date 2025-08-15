const express = require('express');
const Joi = require('joi');
const { InventoryItem, InventoryTransaction, PurchaseOrder } = require('../models/Inventory');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const inventoryItemSchema = Joi.object({
  name: Joi.string().required(),
  partNumber: Joi.string().optional(),
  sku: Joi.string().optional(),
  category: Joi.string().valid(
    'engine_parts', 'brake_system', 'electrical', 'suspension', 'transmission',
    'cooling_system', 'fuel_system', 'exhaust_system', 'interior', 'exterior',
    'tools', 'supplies', 'fluids', 'other'
  ).required(),
  subcategory: Joi.string().optional(),
  description: Joi.string().optional(),
  brand: Joi.string().optional(),
  manufacturer: Joi.string().optional(),
  unit: Joi.string().valid('piece', 'box', 'set', 'kit', 'liter', 'gallon', 'foot', 'meter', 'other').default('piece'),
  costPrice: Joi.number().min(0).required(),
  sellingPrice: Joi.number().min(0).required(),
  currentStock: Joi.number().min(0).default(0),
  minimumStock: Joi.number().min(0).default(0),
  maximumStock: Joi.number().min(0).optional(),
  location: Joi.object({
    warehouse: Joi.string().optional(),
    shelf: Joi.string().optional(),
    bin: Joi.string().optional()
  }).optional(),
  supplier: Joi.object({
    name: Joi.string().optional(),
    contact: Joi.string().optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    website: Joi.string().optional()
  }).optional(),
  isActive: Joi.boolean().default(true)
});

const purchaseOrderSchema = Joi.object({
  supplier: Joi.object({
    name: Joi.string().required(),
    contact: Joi.string().optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional()
  }).required(),
  items: Joi.array().items(Joi.object({
    item: Joi.string().required(),
    quantity: Joi.number().min(1).required(),
    unitPrice: Joi.number().min(0).required(),
    totalPrice: Joi.number().min(0).required()
  })).min(1).required(),
  expectedDeliveryDate: Joi.date().optional(),
  tax: Joi.number().min(0).default(0),
  shipping: Joi.number().min(0).default(0),
  notes: Joi.string().optional()
});

// Inventory Items Routes
// @route   GET /api/inventory/items
// @desc    Get all inventory items
// @access  Private
router.get('/items', requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      stockStatus,
      isActive,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build query
    const query = {};

    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    if (stockStatus) {
      switch (stockStatus) {
        case 'out_of_stock':
          query.currentStock = 0;
          break;
        case 'low_stock':
          query.$expr = { $lte: ['$currentStock', '$minimumStock'] };
          break;
        case 'in_stock':
          query.$expr = { $gt: ['$currentStock', 0] };
          break;
      }
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { partNumber: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const items = await InventoryItem.find(query)
      .populate('createdBy', 'name email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count
    const total = await InventoryItem.countDocuments(query);

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get inventory items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/inventory/items
// @desc    Create new inventory item
// @access  Private
router.post('/items', requireAdmin, async (req, res) => {
  try {
    // Validate input
    const { error, value } = inventoryItemSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Create inventory item
    const item = new InventoryItem({
      ...value,
      createdBy: req.user.id
    });

    await item.save();

    // Populate references
    await item.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Inventory item created successfully',
      data: { item }
    });

  } catch (error) {
    console.error('Create inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/inventory/items/:id
// @desc    Update inventory item
// @access  Private
router.put('/items/:id', requireAdmin, async (req, res) => {
  try {
    // Validate input
    const { error, value } = inventoryItemSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    // Update item
    Object.assign(item, value);
    await item.save();

    // Populate references
    await item.populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Inventory item updated successfully',
      data: { item }
    });

  } catch (error) {
    console.error('Update inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/inventory/items/:id/stock
// @desc    Add stock to inventory item
// @access  Private
router.post('/items/:id/stock', requireAdmin, async (req, res) => {
  try {
    const { quantity, unitPrice, reference, notes } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0'
      });
    }

    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    await item.addStock(quantity, unitPrice, reference, null, notes);

    res.json({
      success: true,
      message: 'Stock added successfully',
      data: { item }
    });

  } catch (error) {
    console.error('Add stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/inventory/items/:id/remove-stock
// @desc    Remove stock from inventory item
// @access  Private
router.post('/items/:id/remove-stock', requireAdmin, async (req, res) => {
  try {
    const { quantity, unitPrice, reference, notes } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be greater than 0'
      });
    }

    const item = await InventoryItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    await item.removeStock(quantity, unitPrice, reference, null, notes);

    res.json({
      success: true,
      message: 'Stock removed successfully',
      data: { item }
    });

  } catch (error) {
    console.error('Remove stock error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// Purchase Orders Routes
// @route   GET /api/inventory/purchase-orders
// @desc    Get all purchase orders
// @access  Private
router.get('/purchase-orders', requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      search,
      sortBy = 'orderDate',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    if (status) query.status = status;

    if (search) {
      query.$or = [
        { poNumber: { $regex: search, $options: 'i' } },
        { 'supplier.name': { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const purchaseOrders = await PurchaseOrder.find(query)
      .populate('items.item', 'name partNumber sku')
      .populate('createdBy', 'name email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count
    const total = await PurchaseOrder.countDocuments(query);

    res.json({
      success: true,
      data: {
        purchaseOrders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalPurchaseOrders: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get purchase orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/inventory/purchase-orders
// @desc    Create new purchase order
// @access  Private
router.post('/purchase-orders', requireAdmin, async (req, res) => {
  try {
    // Validate input
    const { error, value } = purchaseOrderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Create purchase order
    const purchaseOrder = new PurchaseOrder({
      ...value,
      createdBy: req.user.id
    });

    await purchaseOrder.save();

    // Populate references
    await purchaseOrder.populate('items.item', 'name partNumber sku');
    await purchaseOrder.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Purchase order created successfully',
      data: { purchaseOrder }
    });

  } catch (error) {
    console.error('Create purchase order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
