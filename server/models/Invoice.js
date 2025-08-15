const mongoose = require('mongoose');

const invoiceItemSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['service', 'part', 'labor', 'other'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
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
  reference: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'referenceModel'
  },
  referenceModel: {
    type: String,
    enum: ['ServiceCatalog', 'InventoryItem', 'WorkOrder']
  }
}, {
  timestamps: true
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  workOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkOrder'
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  vehicle: {
    make: {
      type: String,
      required: true,
      trim: true
    },
    model: {
      type: String,
      required: true,
      trim: true
    },
    year: {
      type: Number,
      required: true
    },
    vin: {
      type: String,
      trim: true
    },
    licensePlate: {
      type: String,
      trim: true
    }
  },
  items: [invoiceItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  taxRate: {
    type: Number,
    default: 0,
    min: [0, 'Tax rate cannot be negative'],
    max: [100, 'Tax rate cannot exceed 100%']
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: [0, 'Tax amount cannot be negative']
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed', 'none'],
    default: 'none'
  },
  discountValue: {
    type: Number,
    default: 0,
    min: [0, 'Discount value cannot be negative']
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: [0, 'Discount amount cannot be negative']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded'],
    default: 'draft'
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  paidDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'check', 'credit_card', 'debit_card', 'bank_transfer', 'online', 'other'],
    trim: true
  },
  paymentReference: {
    type: String,
    trim: true
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: [0, 'Paid amount cannot be negative']
  },
  balance: {
    type: Number,
    default: 0,
    min: [0, 'Balance cannot be negative']
  },
  notes: {
    type: String,
    trim: true
  },
  terms: {
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
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ customer: 1 });
invoiceSchema.index({ workOrder: 1 });
invoiceSchema.index({ appointment: 1 });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ issueDate: -1 });
invoiceSchema.index({ dueDate: 1 });
invoiceSchema.index({ 'vehicle.licensePlate': 1 });

// Text indexes for search functionality
invoiceSchema.index({
  invoiceNumber: 'text',
  'vehicle.make': 'text',
  'vehicle.model': 'text',
  'vehicle.licensePlate': 'text',
  notes: 'text'
});

// Virtual for invoice age
invoiceSchema.virtual('age').get(function() {
  if (!this.issueDate) return 0;
  const now = new Date();
  const issueDate = new Date(this.issueDate);
  return Math.floor((now - issueDate) / (1000 * 60 * 60 * 24));
});

// Virtual for overdue status
invoiceSchema.virtual('isOverdue').get(function() {
  if (this.status === 'paid' || this.status === 'cancelled' || this.status === 'refunded') {
    return false;
  }
  if (!this.dueDate) return false;
  const now = new Date();
  const dueDate = new Date(this.dueDate);
  return now > dueDate;
});

// Virtual for overdue days
invoiceSchema.virtual('overdueDays').get(function() {
  if (!this.isOverdue) return 0;
  const now = new Date();
  const dueDate = new Date(this.dueDate);
  return Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
});

// Methods for invoices
invoiceSchema.methods.calculateTotals = function() {
  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  
  // Calculate tax
  this.taxAmount = (this.subtotal * this.taxRate) / 100;
  
  // Calculate discount
  if (this.discountType === 'percentage') {
    this.discountAmount = (this.subtotal * this.discountValue) / 100;
  } else if (this.discountType === 'fixed') {
    this.discountAmount = this.discountValue;
  } else {
    this.discountAmount = 0;
  }
  
  // Calculate total
  this.total = this.subtotal + this.taxAmount - this.discountAmount;
  
  // Calculate balance
  this.balance = this.total - this.paidAmount;
  
  return this;
};

invoiceSchema.methods.addPayment = function(amount, method = null, reference = null) {
  this.paidAmount += amount;
  this.balance = this.total - this.paidAmount;
  
  if (method) {
    this.paymentMethod = method;
  }
  
  if (reference) {
    this.paymentReference = reference;
  }
  
  if (this.balance <= 0) {
    this.status = 'paid';
    this.paidDate = new Date();
  }
  
  return this.save();
};

invoiceSchema.methods.markAsSent = function() {
  this.status = 'sent';
  return this.save();
};

invoiceSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

// Pre-save middleware
invoiceSchema.pre('save', function(next) {
  if (this.isModified('items') || this.isModified('taxRate') || this.isModified('discountType') || this.isModified('discountValue')) {
    this.calculateTotals();
  }
  next();
});

// Generate invoice number
invoiceSchema.pre('save', function(next) {
  if (this.isNew && !this.invoiceNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.invoiceNumber = `INV-${year}${month}${day}-${random}`;
  }
  next();
});

// Pre-save middleware to calculate totals for invoice items
invoiceItemSchema.pre('save', function(next) {
  if (this.isModified('quantity') || this.isModified('unitPrice')) {
    this.totalPrice = this.quantity * this.unitPrice;
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
