const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  serviceType: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  items: [{
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  tax: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    min: 0,
    default: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['draft', 'sent', 'paid', 'pending', 'overdue', 'cancelled'],
    default: 'draft'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'check', 'bank_transfer', 'online'],
    required: function() { return this.status === 'paid'; }
  },
  paymentDate: {
    type: Date,
    required: function() { return this.status === 'paid'; }
  },
  paymentReference: {
    type: String,
    trim: true,
    maxlength: 100
  },
  payments: [{
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['cash', 'credit_card', 'debit_card', 'check', 'bank_transfer', 'online']
    },
    reference: {
      type: String,
      trim: true,
      maxlength: 100
    },
    notes: {
      type: String,
      maxlength: 500
    },
    date: {
      type: Date,
      default: Date.now
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  totalPaid: {
    type: Number,
    default: 0,
    min: 0
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  paidDate: {
    type: Date
  },
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    maxlength: 1000
  },
  terms: {
    type: String,
    maxlength: 500,
    default: 'Payment due within 30 days'
  },
  sentDate: {
    type: Date
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderDate: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
invoiceSchema.index({ customerId: 1, date: -1 });
invoiceSchema.index({ invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ status: 1 });
invoiceSchema.index({ dueDate: 1 });

// Virtual for invoice summary
invoiceSchema.virtual('summary').get(function() {
  return `${this.invoiceNumber} - ${this.serviceType} - $${this.total.toFixed(2)}`;
});

// Virtual for days overdue
invoiceSchema.virtual('daysOverdue').get(function() {
  if (this.status === 'overdue' && this.dueDate) {
    const today = new Date();
    const dueDate = new Date(this.dueDate);
    const diffTime = today - dueDate;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for vehicle (to match frontend expectations)
invoiceSchema.virtual('vehicle').get(function() {
  if (this.vehicleId) {
    return {
      make: this.vehicleId.make,
      model: this.vehicleId.model,
      year: this.vehicleId.year,
      vin: this.vehicleId.vin,
      licensePlate: this.vehicleId.licensePlate
    };
  }
  return null;
});

// Virtual for customer (to match frontend expectations)
invoiceSchema.virtual('customer').get(function() {
  if (this.customerId) {
    return {
      _id: this.customerId._id,
      name: this.customerId.name,
      email: this.customerId.email,
      phone: this.customerId.phone
    };
  }
  return null;
});

// Ensure virtual fields are serialized
invoiceSchema.set('toJSON', { virtuals: true });
invoiceSchema.set('toObject', { virtuals: true });

// Pre-save middleware to calculate totals and generate invoice number
invoiceSchema.pre('save', function(next) {
  // Generate invoice number if not provided
  if (!this.invoiceNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.invoiceNumber = `INV-${year}${month}${day}-${random}`;
  }

  // Calculate item totals
  this.items.forEach(item => {
    item.total = item.quantity * item.unitPrice;
  });

  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);

  // Calculate total with tax and discount
  this.total = this.subtotal + this.tax - this.discount;

  // Set due date if not provided
  if (!this.dueDate) {
    this.dueDate = new Date(this.date.getTime() + (30 * 24 * 60 * 60 * 1000)); // 30 days from date
  }

  // Update status based on due date
  if (this.status === 'sent' && this.dueDate < new Date() && this.status !== 'paid') {
    this.status = 'overdue';
  }

  this.updatedAt = new Date();
  next();
});

// Static method to generate unique invoice number
invoiceSchema.statics.generateInvoiceNumber = async function() {
  let invoiceNumber;
  let isUnique = false;
  
  while (!isUnique) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    invoiceNumber = `INV-${year}${month}${day}-${random}`;
    
    const existing = await this.findOne({ invoiceNumber });
    if (!existing) {
      isUnique = true;
    }
  }
  
  return invoiceNumber;
};

module.exports = mongoose.model('Invoice', invoiceSchema);
