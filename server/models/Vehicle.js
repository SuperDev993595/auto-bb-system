const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  year: {
    type: Number,
    required: true,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  make: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  model: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  vin: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 17,
    maxlength: 17,
    uppercase: true
  },
  licensePlate: {
    type: String,
    required: true,
    trim: true,
    maxlength: 20,
    uppercase: true
  },
  color: {
    type: String,
    required: true,
    trim: true,
    maxlength: 30
  },
  mileage: {
    type: Number,
    required: true,
    min: 0
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
vehicleSchema.index({ customerId: 1, createdAt: -1 });
vehicleSchema.index({ vin: 1 }, { unique: true });
vehicleSchema.index({ licensePlate: 1 });

// Virtual for full vehicle name
vehicleSchema.virtual('fullName').get(function() {
  return `${this.year} ${this.make} ${this.model}`;
});

// Ensure virtual fields are serialized
vehicleSchema.set('toJSON', { virtuals: true });
vehicleSchema.set('toObject', { virtuals: true });

// Pre-save middleware to update timestamps
vehicleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Vehicle', vehicleSchema);
