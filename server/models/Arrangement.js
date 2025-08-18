const mongoose = require('mongoose');

const arrangementSchema = new mongoose.Schema({
  // Arrangement information
  date: {
    type: Date,
    required: [true, 'Arrangement date is required'],
    default: Date.now
  },
  amount: {
    type: Number,
    required: [true, 'Arrangement amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['installment', 'payment_plan', 'deferred', 'other'],
    default: 'installment'
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  
  // Reference to customer
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Arrangement must belong to a customer']
  },
  
  // Reference to invoice if this arrangement is for an invoice
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  
  // Created by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Arrangement must have a creator']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
arrangementSchema.index({ customer: 1, date: -1 });
arrangementSchema.index({ dueDate: 1 });
arrangementSchema.index({ status: 1 });
arrangementSchema.index({ createdBy: 1 });

// Virtual for formatted amount
arrangementSchema.virtual('formattedAmount').get(function() {
  return `$${this.amount.toFixed(2)}`;
});

// Virtual for formatted date
arrangementSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString();
});

// Ensure virtual fields are serialized
arrangementSchema.set('toJSON', { virtuals: true });
arrangementSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Arrangement', arrangementSchema);
