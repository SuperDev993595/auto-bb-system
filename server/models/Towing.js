const mongoose = require('mongoose');

const towingSchema = new mongoose.Schema({
  // Towing information
  date: {
    type: Date,
    required: [true, 'Towing date is required'],
    default: Date.now
  },
  location: {
    type: String,
    required: [true, 'Towing location is required'],
    trim: true,
    maxlength: 200
  },
  destination: {
    type: String,
    trim: true,
    maxlength: 200
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  cost: {
    type: Number,
    min: [0, 'Cost cannot be negative'],
    default: 0
  },
  vehicle: {
    type: String,
    trim: true,
    maxlength: 100
  },
  
  // Reference to customer
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Towing record must belong to a customer']
  },
  
  // Reference to vehicle if this towing is for a specific vehicle
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle'
  },
  
  // Created by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Towing record must have a creator']
  }
}, {
  timestamps: true
});

// Indexes for better query performance
towingSchema.index({ customer: 1, date: -1 });
towingSchema.index({ date: -1 });
towingSchema.index({ status: 1 });
towingSchema.index({ createdBy: 1 });

// Virtual for formatted cost
towingSchema.virtual('formattedCost').get(function() {
  return `$${this.cost.toFixed(2)}`;
});

// Virtual for formatted date
towingSchema.virtual('formattedDate').get(function() {
  return this.date.toLocaleDateString();
});

// Ensure virtual fields are serialized
towingSchema.set('toJSON', { virtuals: true });
towingSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Towing', towingSchema);
