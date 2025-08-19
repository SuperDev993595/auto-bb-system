const express = require('express');
const Joi = require('joi');
const { InventoryItem, InventoryTransaction, PurchaseOrder } = require('../models/Inventory');
const { requireAnyAdmin } = require('../middleware/auth');

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
  poNumber: Joi.string().optional(),
  supplier: Joi.string().required(),
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

// Supplier Routes
// @route   GET /api/inventory/suppliers
// @desc    Get suppliers
// @access  Private
router.get('/suppliers', requireAnyAdmin, async (req, res) => {
  try {
    const suppliers = await require('../models/Supplier').find({ isActive: true });

    res.json({
      success: true,
      data: { suppliers }
    });

  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/inventory/suppliers
// @desc    Create new supplier
// @access  Private
router.post('/suppliers', requireAnyAdmin, async (req, res) => {
  try {
    const {
      name,
      contactPerson,
      address,
      email,
      phone,
      website,
      paymentTerms,
      taxId,
      rating,
      categories,
      notes
    } = req.body;

    // Validate required fields
    if (!name || !contactPerson) {
      return res.status(400).json({
        success: false,
        message: 'Name and contact person are required'
      });
    }

    // Create supplier
    const supplier = new (require('../models/Supplier'))({
      name,
      contactPerson: {
        name: contactPerson,
        email: email || '',
        phone: phone || '',
        position: ''
      },
      address: address || {},
      email,
      phone,
      website,
      paymentTerms,
      taxId,
      rating,
      categories: categories || [],
      notes,
      createdBy: req.user.id
    });

    await supplier.save();

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: { supplier }
    });

  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/inventory/suppliers/:id
// @desc    Update supplier
// @access  Private
router.put('/suppliers/:id', requireAnyAdmin, async (req, res) => {
  try {
    const {
      name,
      contactPerson,
      address,
      email,
      phone,
      website,
      paymentTerms,
      taxId,
      rating,
      categories,
      notes
    } = req.body;

    const supplier = await require('../models/Supplier').findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Update supplier
    supplier.name = name || supplier.name;
    supplier.contactPerson = {
      name: contactPerson || supplier.contactPerson.name,
      email: email || supplier.contactPerson.email,
      phone: phone || supplier.contactPerson.phone,
      position: supplier.contactPerson.position
    };
    supplier.address = address || supplier.address;
    supplier.email = email || supplier.email;
    supplier.phone = phone || supplier.phone;
    supplier.website = website || supplier.website;
    supplier.paymentTerms = paymentTerms || supplier.paymentTerms;
    supplier.taxId = taxId || supplier.taxId;
    supplier.rating = rating || supplier.rating;
    supplier.categories = categories || supplier.categories;
    supplier.notes = notes || supplier.notes;
    supplier.updatedBy = req.user.id;

    await supplier.save();

    res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: { supplier }
    });

  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/inventory/suppliers/:id
// @desc    Delete supplier
// @access  Private
router.delete('/suppliers/:id', requireAnyAdmin, async (req, res) => {
  try {
    const supplier = await require('../models/Supplier').findById(req.params.id);

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    // Check if supplier is used in any inventory items
    const usedInInventory = await InventoryItem.findOne({ 'supplier.name': supplier.name });
    if (usedInInventory) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete supplier that is used in inventory items'
      });
    }

    // Soft delete by setting isActive to false
    supplier.isActive = false;
    supplier.updatedBy = req.user.id;
    await supplier.save();

    res.json({
      success: true,
      message: 'Supplier deleted successfully'
    });

  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Inventory Items Routes
// @route   GET /api/inventory/items
// @desc    Get all inventory items
// @access  Private
router.get('/items', requireAnyAdmin, async (req, res) => {
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
router.post('/items', requireAnyAdmin, async (req, res) => {
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
router.put('/items/:id', requireAnyAdmin, async (req, res) => {
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
router.post('/items/:id/stock', requireAnyAdmin, async (req, res) => {
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
router.post('/items/:id/remove-stock', requireAnyAdmin, async (req, res) => {
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
router.get('/purchase-orders', requireAnyAdmin, async (req, res) => {
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
      .populate('supplier', 'name contactPerson email phone')
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
router.post('/purchase-orders', requireAnyAdmin, async (req, res) => {
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
    await purchaseOrder.populate('supplier', 'name contactPerson email phone');
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

// @route   GET /api/inventory/items/:id
// @desc    Get inventory item by ID
// @access  Private
router.get('/items/:id', requireAnyAdmin, async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id)
      .populate('supplier', 'name email phone');

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    res.json({
      success: true,
      data: { item }
    });

  } catch (error) {
    console.error('Get inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/inventory/items/:id
// @desc    Delete inventory item
// @access  Private
router.delete('/items/:id', requireAnyAdmin, async (req, res) => {
  try {
    const item = await InventoryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    await InventoryItem.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Inventory item deleted successfully'
    });

  } catch (error) {
    console.error('Delete inventory item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/inventory/items/:id/adjust-stock
// @desc    Adjust stock for inventory item
// @access  Private
router.post('/items/:id/adjust-stock', requireAnyAdmin, async (req, res) => {
  try {
    const { quantity, reason, notes } = req.body;

    const item = await InventoryItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    const previousQuantity = item.currentStock;
    item.currentStock += quantity;

    if (item.currentStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reduce stock below 0'
      });
    }

    await item.save();

    // Create transaction record
    const transaction = new InventoryTransaction({
      item: item._id,
      type: quantity > 0 ? 'in' : 'out',
      quantity: Math.abs(quantity),
      previousQuantity,
      newQuantity: item.currentStock,
      reason,
      notes,
      performedBy: req.user.id,
      cost: item.costPrice * Math.abs(quantity)
    });

    await transaction.save();

    res.json({
      success: true,
      message: 'Stock adjusted successfully',
      data: { item, transaction }
    });

  } catch (error) {
    console.error('Adjust stock error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/inventory/items/low-stock
// @desc    Get low stock items
// @access  Private
router.get('/items/low-stock', requireAnyAdmin, async (req, res) => {
  try {
    const items = await InventoryItem.find({
      $expr: { $lte: ['$currentStock', '$minimumStock'] },
      isActive: true
    }).populate('supplier', 'name email phone');

    res.json({
      success: true,
      data: { items }
    });

  } catch (error) {
    console.error('Get low stock items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/inventory/items/out-of-stock
// @desc    Get out of stock items
// @access  Private
router.get('/items/out-of-stock', requireAnyAdmin, async (req, res) => {
  try {
    const items = await InventoryItem.find({
      currentStock: 0,
      isActive: true
    }).populate('supplier', 'name email phone');

    res.json({
      success: true,
      data: { items }
    });

  } catch (error) {
    console.error('Get out of stock items error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/inventory/items/stats/overview
// @desc    Get inventory overview stats
// @access  Private
router.get('/items/stats/overview', requireAnyAdmin, async (req, res) => {
  try {
    const totalItems = await InventoryItem.countDocuments({ isActive: true });
    const lowStockItems = await InventoryItem.countDocuments({
      $expr: { $lte: ['$currentStock', '$minimumStock'] },
      isActive: true
    });
    const outOfStockItems = await InventoryItem.countDocuments({
      currentStock: 0,
      isActive: true
    });

    const totalValue = await InventoryItem.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$currentStock', '$costPrice'] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalItems,
        lowStockItems,
        outOfStockItems,
        totalValue: totalValue.length > 0 ? totalValue[0].totalValue : 0
      }
    });

  } catch (error) {
    console.error('Get inventory stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/inventory/transactions
// @desc    Get inventory transactions
// @access  Private
router.get('/transactions', requireAnyAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      type,
      itemId,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    if (type) query.type = type;
    if (itemId) query.item = itemId;

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const transactions = await InventoryTransaction.find(query)
      .populate('item', 'name partNumber sku')
      .populate('performedBy', 'name email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count
    const total = await InventoryTransaction.countDocuments(query);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalTransactions: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/inventory/transactions/:id
// @desc    Get transaction by ID
// @access  Private
router.get('/transactions/:id', requireAnyAdmin, async (req, res) => {
  try {
    const transaction = await InventoryTransaction.findById(req.params.id)
      .populate('item', 'name partNumber sku')
      .populate('performedBy', 'name email');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: { transaction }
    });

  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/inventory/transactions
// @desc    Create inventory transaction
// @access  Private
router.post('/transactions', requireAnyAdmin, async (req, res) => {
  try {
    const { itemId, type, quantity, reason, notes, cost } = req.body;

    const item = await InventoryItem.findById(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Inventory item not found'
      });
    }

    const previousQuantity = item.currentStock;
    let newQuantity = previousQuantity;

    if (type === 'in' || type === 'return') {
      newQuantity += quantity;
    } else if (type === 'out' || type === 'damage') {
      newQuantity -= quantity;
      if (newQuantity < 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot reduce stock below 0'
        });
      }
    }

    // Update item stock
    item.currentStock = newQuantity;
    await item.save();

    // Create transaction
    const transaction = new InventoryTransaction({
      item: itemId,
      type,
      quantity,
      previousQuantity,
      newQuantity,
      reason,
      notes,
      performedBy: req.user.id,
      cost: cost || (item.costPrice * quantity)
    });

    await transaction.save();

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: { transaction, item }
    });

  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/inventory/transactions/stats/overview
// @desc    Get transaction stats overview
// @access  Private
router.get('/transactions/stats/overview', requireAnyAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const totalTransactions = await InventoryTransaction.countDocuments(query);
    const totalIn = await InventoryTransaction.aggregate([
      { $match: { ...query, type: { $in: ['in', 'return'] } } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);
    const totalOut = await InventoryTransaction.aggregate([
      { $match: { ...query, type: { $in: ['out', 'damage'] } } },
      { $group: { _id: null, total: { $sum: '$quantity' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalTransactions,
        totalIn: totalIn.length > 0 ? totalIn[0].total : 0,
        totalOut: totalOut.length > 0 ? totalOut[0].total : 0
      }
    });

  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/inventory/purchase-orders/:id
// @desc    Get purchase order by ID
// @access  Private
router.get('/purchase-orders/:id', requireAnyAdmin, async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id)
      .populate('items.item', 'name partNumber sku')
      .populate('supplier', 'name contactPerson email phone')
      .populate('createdBy', 'name email');

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    res.json({
      success: true,
      data: { purchaseOrder }
    });

  } catch (error) {
    console.error('Get purchase order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/inventory/purchase-orders/:id
// @desc    Update purchase order
// @access  Private
router.put('/purchase-orders/:id', requireAnyAdmin, async (req, res) => {
  try {
    const { error, value } = purchaseOrderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const purchaseOrder = await PurchaseOrder.findById(req.params.id);

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    Object.assign(purchaseOrder, value);
    await purchaseOrder.save();

    await purchaseOrder.populate('items.item', 'name partNumber sku');
    await purchaseOrder.populate('supplier', 'name contactPerson email phone');
    await purchaseOrder.populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Purchase order updated successfully',
      data: { purchaseOrder }
    });

  } catch (error) {
    console.error('Update purchase order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/inventory/purchase-orders/:id
// @desc    Delete purchase order
// @access  Private
router.delete('/purchase-orders/:id', requireAnyAdmin, async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findById(req.params.id);

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    await PurchaseOrder.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Purchase order deleted successfully'
    });

  } catch (error) {
    console.error('Delete purchase order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/inventory/purchase-orders/:id/receive
// @desc    Receive purchase order items
// @access  Private
router.post('/purchase-orders/:id/receive', requireAnyAdmin, async (req, res) => {
  try {
    const { receivedItems } = req.body;

    const purchaseOrder = await PurchaseOrder.findById(req.params.id);

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    // Update received items and add to inventory
    for (const receivedItem of receivedItems) {
      const poItem = purchaseOrder.items.find(item => item.item.toString() === receivedItem.itemId);
      if (poItem) {
        poItem.receivedQuantity = (poItem.receivedQuantity || 0) + receivedItem.quantity;
      }

      // Add to inventory
      const inventoryItem = await InventoryItem.findById(receivedItem.itemId);
      if (inventoryItem) {
        inventoryItem.currentStock += receivedItem.quantity;
        await inventoryItem.save();

        // Create transaction
        const transaction = new InventoryTransaction({
          item: receivedItem.itemId,
          type: 'in',
          quantity: receivedItem.quantity,
          previousQuantity: inventoryItem.currentStock - receivedItem.quantity,
          newQuantity: inventoryItem.currentStock,
          reason: 'Purchase order received',
          reference: purchaseOrder.poNumber,
          performedBy: req.user.id,
          cost: receivedItem.unitPrice * receivedItem.quantity
        });

        await transaction.save();
      }
    }

    // Update purchase order status
    const allReceived = purchaseOrder.items.every(item => 
      (item.receivedQuantity || 0) >= item.quantity
    );
    
    if (allReceived) {
      purchaseOrder.status = 'received';
    } else {
      purchaseOrder.status = 'partially_received';
    }

    await purchaseOrder.save();

    res.json({
      success: true,
      message: 'Purchase order items received successfully',
      data: { purchaseOrder }
    });

  } catch (error) {
    console.error('Receive purchase order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/inventory/purchase-orders/stats/overview
// @desc    Get purchase order stats overview
// @access  Private
router.get('/purchase-orders/stats/overview', requireAnyAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const totalOrders = await PurchaseOrder.countDocuments(query);
    const pendingOrders = await PurchaseOrder.countDocuments({ ...query, status: 'pending' });
    const receivedOrders = await PurchaseOrder.countDocuments({ ...query, status: 'received' });

    const totalValue = await PurchaseOrder.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        receivedOrders,
        totalValue: totalValue.length > 0 ? totalValue[0].total : 0
      }
    });

  } catch (error) {
    console.error('Get purchase order stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});



// @route   GET /api/inventory/categories
// @desc    Get inventory categories
// @access  Private
router.get('/categories', requireAnyAdmin, async (req, res) => {
  try {
    const categories = [
      'engine_parts', 'brake_system', 'electrical', 'suspension', 'transmission',
      'cooling_system', 'fuel_system', 'exhaust_system', 'interior', 'exterior',
      'tools', 'supplies', 'fluids', 'other'
    ];

    res.json({
      success: true,
      data: { categories }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/inventory/locations
// @desc    Get inventory locations
// @access  Private
router.get('/locations', requireAnyAdmin, async (req, res) => {
  try {
    const locations = await InventoryItem.distinct('location.warehouse');

    res.json({
      success: true,
      data: { locations }
    });

  } catch (error) {
    console.error('Get locations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
