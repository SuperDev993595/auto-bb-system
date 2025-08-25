const mongoose = require('mongoose');

const membershipPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  tier: {
    type: String,
    enum: ['basic', 'premium', 'vip', 'enterprise'],
    required: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'quarterly', 'yearly'],
    default: 'monthly'
  },
  features: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    included: {
      type: Boolean,
      default: true
    }
  }],
  benefits: {
    discountPercentage: {
      type: Number,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%'],
      default: 0
    },
    priorityBooking: {
      type: Boolean,
      default: false
    },
    freeInspections: {
      type: Number,
      default: 0
    },
    roadsideAssistance: {
      type: Boolean,
      default: false
    },
    extendedWarranty: {
      type: Boolean,
      default: false
    },
    conciergeService: {
      type: Boolean,
      default: false
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxVehicles: {
    type: Number,
    default: 1
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
membershipPlanSchema.index({ tier: 1, isActive: 1 });
membershipPlanSchema.index({ price: 1 });

module.exports = mongoose.model('MembershipPlan', membershipPlanSchema);
