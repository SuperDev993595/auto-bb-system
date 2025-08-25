const mongoose = require('mongoose');

const warrantySchema = new mongoose.Schema({
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: [true, 'Customer is required']
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle is required']
  },
  warrantyType: {
    type: String,
    enum: ['manufacturer', 'extended', 'powertrain', 'bumper_to_bumper', 'custom'],
    required: true
  },
  name: {
    type: String,
    required: [true, 'Warranty name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required'],
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  mileageLimit: {
    type: Number,
    min: [0, 'Mileage limit cannot be negative']
  },
  currentMileage: {
    type: Number,
    default: 0,
    min: [0, 'Current mileage cannot be negative']
  },
  coverage: {
    engine: {
      type: Boolean,
      default: false
    },
    transmission: {
      type: Boolean,
      default: false
    },
    electrical: {
      type: Boolean,
      default: false
    },
    suspension: {
      type: Boolean,
      default: false
    },
    brakes: {
      type: Boolean,
      default: false
    },
    cooling: {
      type: Boolean,
      default: false
    },
    fuel: {
      type: Boolean,
      default: false
    },
    exhaust: {
      type: Boolean,
      default: false
    },
    interior: {
      type: Boolean,
      default: false
    },
    exterior: {
      type: Boolean,
      default: false
    }
  },
  deductible: {
    type: Number,
    min: [0, 'Deductible cannot be negative'],
    default: 0
  },
  maxClaimAmount: {
    type: Number,
    min: [0, 'Max claim amount cannot be negative']
  },
  totalClaims: {
    type: Number,
    default: 0,
    min: [0, 'Total claims cannot be negative']
  },
  totalClaimAmount: {
    type: Number,
    default: 0,
    min: [0, 'Total claim amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled', 'suspended'],
    default: 'active'
  },
  provider: {
    name: {
      type: String,
      trim: true
    },
    contact: {
      phone: String,
      email: String,
      address: String
    }
  },
  terms: {
    type: String,
    trim: true
  },
  exclusions: [{
    type: String,
    trim: true
  }],
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
warrantySchema.index({ customer: 1, status: 1 });
warrantySchema.index({ vehicle: 1, status: 1 });
warrantySchema.index({ endDate: 1 });
warrantySchema.index({ warrantyType: 1 });

// Virtual for warranty status
warrantySchema.virtual('isExpired').get(function() {
  return this.endDate < new Date();
});

// Virtual for days until expiration
warrantySchema.virtual('daysUntilExpiration').get(function() {
  const now = new Date();
  const expiration = new Date(this.endDate);
  const diffTime = expiration - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for mileage remaining
warrantySchema.virtual('mileageRemaining').get(function() {
  if (!this.mileageLimit) return null;
  return Math.max(0, this.mileageLimit - this.currentMileage);
});

// Ensure virtual fields are serialized
warrantySchema.set('toJSON', { virtuals: true });
warrantySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Warranty', warrantySchema);
