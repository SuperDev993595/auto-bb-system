const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  // Vehicle information
  year: {
    type: Number,
    required: [true, 'Vehicle year is required'],
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  make: {
    type: String,
    required: [true, 'Vehicle make is required'],
    trim: true,
    maxlength: 50
  },
  model: {
    type: String,
    required: [true, 'Vehicle model is required'],
    trim: true,
    maxlength: 50
  },
  vin: {
    type: String,
    required: [true, 'VIN is required'],
    unique: true,
    trim: true,
    minlength: 8,
    maxlength: 17,
    uppercase: true
  },
  licensePlate: {
    type: String,
    required: [true, 'License plate is required'],
    trim: true,
    maxlength: 20,
    uppercase: true
  },
  color: {
    type: String,
    required: [true, 'Vehicle color is required'],
    trim: true,
    maxlength: 30
  },
  mileage: {
    type: Number,
    required: [true, 'Mileage is required'],
    min: [0, 'Mileage cannot be negative']
  },
  engineType: {
    type: String,
    trim: true,
    maxlength: 50
  },
  transmission: {
    type: String,
    enum: ['automatic', 'manual', 'cvt', 'other'],
    default: 'automatic'
  },
  fuelType: {
    type: String,
    enum: ['gasoline', 'diesel', 'hybrid', 'electric', 'other'],
    default: 'gasoline'
  },
  lastServiceDate: {
    type: Date
  },
  nextServiceDate: {
    type: Date
  },
  lastServiceMileage: {
    type: Number,
    min: 0
  },
  nextServiceMileage: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance'],
    default: 'active'
  },
  notes: {
    type: String,
    maxlength: 500
  },
  
  // Reference to customer who owns this vehicle
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Vehicle must belong to a customer']
  },
  
  // Created by
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
vehicleSchema.index({ customer: 1 });
vehicleSchema.index({ vin: 1 });
vehicleSchema.index({ licensePlate: 1 });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ nextServiceDate: 1 });

// Virtual for full vehicle name
vehicleSchema.virtual('fullName').get(function() {
  return `${this.year} ${this.make} ${this.model}`;
});

// Ensure virtual fields are serialized
vehicleSchema.set('toJSON', { virtuals: true });
vehicleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
