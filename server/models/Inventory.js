const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  partNumber: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  sku: {
    type: String,
    trim: true,
    unique: true,
    sparse: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'engine_parts',
      'brake_system',
      'electrical',
      'suspension',
      'transmission',
      'cooling_system',
      'fuel_system',
      'exhaust_system',
      'interior',
      'exterior',
      'tools',
      'supplies',
      'fluids',
      'other'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true
  },
  manufacturer: {
    type: String,
    trim: true
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    enum: ['piece', 'box', 'set', 'kit', 'liter', 'gallon', 'foot', 'meter', 'other'],
    default: 'piece'
  },
  costPrice: {
    type: Number,
    required: [true, 'Cost price is required'],
    min: [0, 'Cost price cannot be negative']
  },
  sellingPrice: {
    type: Number,
    required: [true, 'Selling price is required'],
    min: [0, 'Selling price cannot be negative']
  },
  currentStock: {
    type: Number,
    required: [true, 'Current stock is required'],
    min: [0, 'Current stock cannot be negative'],
    default: 0
  },
  minimumStock: {
    type: Number,
    required: [true, 'Minimum stock is required'],
    min: [0, 'Minimum stock cannot be negative'],
    default: 0
  },
  maximumStock: {
    type: Number,
    min: [0, 'Maximum stock cannot be negative']
  },
  location: {
    warehouse: {
      type: String,
      trim: true
    },
    shelf: {
      type: String,
      trim: true
    },
    bin: {
      type: String,
      trim: true
    }
  },
  supplier: {
    name: {
      type: String,
      trim: true
    },
    contact: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const inventoryTransactionSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: true
  },
  type: {
    type: String,
    enum: ['in', 'out', 'adjustment', 'return', 'damage', 'transfer'],
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  previousStock: {
    type: Number,
    required: true
  },
  newStock: {
    type: Number,
    required: true
  },
  unitPrice: {
    type: Number,
    min: [0, 'Unit price cannot be negative']
  },
  totalValue: {
    type: Number,
    min: [0, 'Total value cannot be negative']
  },
  reference: {
    type: String,
    trim: true
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const purchaseOrderSchema = new mongoose.Schema({
  poNumber: {
    type: String,
    required: true,
    unique: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  items: [{
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InventoryItem',
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    unitPrice: {
      type: Number,
      required: true,
      min: [0, 'Unit price cannot be negative']
    },
    totalPrice: {
      type: Number,
      required: true,
      min: [0, 'Total price cannot be negative']
    },
    received: {
      type: Number,
      default: 0,
      min: [0, 'Received quantity cannot be negative']
    }
  }],
  status: {
    type: String,
    enum: ['draft', 'sent', 'confirmed', 'partial', 'received', 'cancelled'],
    default: 'draft'
  },
  orderDate: {
    type: Date,
    default: Date.now
  },
  expectedDeliveryDate: {
    type: Date
  },
  actualDeliveryDate: {
    type: Date
  },
  subtotal: {
    type: Number,
    default: 0,
    min: [0, 'Subtotal cannot be negative']
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative']
  },
  shipping: {
    type: Number,
    default: 0,
    min: [0, 'Shipping cannot be negative']
  },
  total: {
    type: Number,
    default: 0,
    min: [0, 'Total cannot be negative']
  },
  notes: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
inventoryItemSchema.index({ name: 1 });
inventoryItemSchema.index({ partNumber: 1 });
inventoryItemSchema.index({ sku: 1 });
inventoryItemSchema.index({ category: 1 });
inventoryItemSchema.index({ isActive: 1 });
inventoryItemSchema.index({ currentStock: 1 });

inventoryTransactionSchema.index({ item: 1 });
inventoryTransactionSchema.index({ type: 1 });
inventoryTransactionSchema.index({ createdAt: -1 });
inventoryTransactionSchema.index({ referenceId: 1 });

purchaseOrderSchema.index({ poNumber: 1 });
purchaseOrderSchema.index({ 'supplier.name': 1 });
purchaseOrderSchema.index({ status: 1 });
purchaseOrderSchema.index({ orderDate: -1 });

// Text indexes for search functionality
inventoryItemSchema.index({
  name: 'text',
  partNumber: 'text',
  sku: 'text',
  description: 'text',
  brand: 'text',
  manufacturer: 'text'
});

purchaseOrderSchema.index({
  poNumber: 'text',
  'supplier.name': 'text',
  notes: 'text'
});

// Virtual for inventory item stock status
inventoryItemSchema.virtual('stockStatus').get(function() {
  if (this.currentStock <= 0) return 'out_of_stock';
  if (this.currentStock <= this.minimumStock) return 'low_stock';
  if (this.maximumStock && this.currentStock >= this.maximumStock) return 'overstocked';
  return 'in_stock';
});

inventoryItemSchema.virtual('stockValue').get(function() {
  return this.currentStock * this.costPrice;
});

// Methods for inventory items
inventoryItemSchema.methods.addStock = function(quantity, unitPrice = null, reference = null, referenceId = null, notes = null) {
  const previousStock = this.currentStock;
  this.currentStock += quantity;
  
  // Create transaction record
  const transaction = new InventoryTransaction({
    item: this._id,
    type: 'in',
    quantity: quantity,
    previousStock: previousStock,
    newStock: this.currentStock,
    unitPrice: unitPrice || this.costPrice,
    totalValue: quantity * (unitPrice || this.costPrice),
    reference: reference,
    referenceId: referenceId,
    notes: notes,
    createdBy: this.createdBy
  });
  
  return Promise.all([this.save(), transaction.save()]);
};

inventoryItemSchema.methods.removeStock = function(quantity, unitPrice = null, reference = null, referenceId = null, notes = null) {
  if (this.currentStock < quantity) {
    throw new Error('Insufficient stock');
  }
  
  const previousStock = this.currentStock;
  this.currentStock -= quantity;
  
  // Create transaction record
  const transaction = new InventoryTransaction({
    item: this._id,
    type: 'out',
    quantity: quantity,
    previousStock: previousStock,
    newStock: this.currentStock,
    unitPrice: unitPrice || this.sellingPrice,
    totalValue: quantity * (unitPrice || this.sellingPrice),
    reference: reference,
    referenceId: referenceId,
    notes: notes,
    createdBy: this.createdBy
  });
  
  return Promise.all([this.save(), transaction.save()]);
};

inventoryItemSchema.methods.adjustStock = function(newQuantity, reason = null) {
  const previousStock = this.currentStock;
  const difference = newQuantity - previousStock;
  
  this.currentStock = newQuantity;
  
  // Create transaction record
  const transaction = new InventoryTransaction({
    item: this._id,
    type: 'adjustment',
    quantity: difference,
    previousStock: previousStock,
    newStock: this.currentStock,
    notes: reason,
    createdBy: this.createdBy
  });
  
  return Promise.all([this.save(), transaction.save()]);
};

// Methods for purchase orders
purchaseOrderSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  this.total = this.subtotal + this.tax + this.shipping;
  return this;
};

purchaseOrderSchema.methods.receiveItems = function(receivedItems) {
  let allReceived = true;
  
  this.items.forEach(item => {
    const receivedItem = receivedItems.find(ri => ri.itemId.toString() === item.item.toString());
    if (receivedItem) {
      item.received += receivedItem.quantity;
    }
    if (item.received < item.quantity) {
      allReceived = false;
    }
  });
  
  if (allReceived) {
    this.status = 'received';
    this.actualDeliveryDate = new Date();
  } else {
    this.status = 'partial';
  }
  
  return this.save();
};

// Pre-save middleware
purchaseOrderSchema.pre('save', function(next) {
  if (this.isModified('items')) {
    this.calculateTotals();
  }
  next();
});

// Generate PO number
purchaseOrderSchema.pre('save', function(next) {
  if (this.isNew && (!this.poNumber || this.poNumber.trim() === '')) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.poNumber = `PO-${year}${month}${day}-${random}`;
  }
  next();
});

const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);
const InventoryTransaction = mongoose.model('InventoryTransaction', inventoryTransactionSchema);
const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);

module.exports = {
  InventoryItem,
  InventoryTransaction,
  PurchaseOrder
};
