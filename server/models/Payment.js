const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  // Payment information
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  date: {
    type: Date,
    required: [true, 'Payment date is required'],
    default: Date.now
  },
  method: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['cash', 'card', 'check', 'bank_transfer', 'online', 'other'],
    default: 'cash'
  },
  reference: {
    type: String,
    trim: true,
    maxlength: 100
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'completed'
  },
  
  // Reference to customer who made this payment
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Payment must belong to a customer']
  },
  
  // Reference to invoice if this payment is for an invoice
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  
  // Reference to appointment if this payment is for an appointment
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  
  // Created by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Payment must have a creator']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
paymentSchema.index({ customer: 1, date: -1 });
paymentSchema.index({ date: -1 });
paymentSchema.index({ method: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdBy: 1 });

// Virtual for formatted amount
paymentSchema.virtual('formattedAmount').get(function() {
  return `$${this.amount.toFixed(2)}`;
});

// Virtual for formatted date
paymentSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString();
});

// Ensure virtual fields are serialized
paymentSchema.set('toJSON', { virtuals: true });
paymentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Payment', paymentSchema);
