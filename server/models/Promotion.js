const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Promotion title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Promotion description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  type: {
    type: String,
    required: [true, 'Promotion type is required'],
    enum: {
      values: ['discount', 'service', 'referral', 'seasonal'],
      message: 'Type must be one of: discount, service, referral, seasonal'
    }
  },
  discountValue: {
    type: Number,
    required: [true, 'Discount value is required'],
    min: [0, 'Discount value cannot be negative']
  },
  discountType: {
    type: String,
    required: [true, 'Discount type is required'],
    enum: {
      values: ['percentage', 'fixed'],
      message: 'Discount type must be percentage or fixed'
    }
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['active', 'scheduled', 'ended', 'paused'],
      message: 'Status must be one of: active, scheduled, ended, paused'
    },
    default: 'scheduled'
  },
  targetAudience: {
    type: String,
    required: [true, 'Target audience is required'],
    trim: true
  },
  usageCount: {
    type: Number,
    default: 0,
    min: [0, 'Usage count cannot be negative']
  },
  maxUsage: {
    type: Number,
    min: [1, 'Max usage must be at least 1']
  },
  conditions: {
    type: String,
    trim: true,
    maxlength: [500, 'Conditions cannot exceed 500 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
promotionSchema.index({ status: 1, startDate: 1, endDate: 1 });
promotionSchema.index({ type: 1, status: 1 });

// Virtual for checking if promotion is currently active
promotionSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  return this.status === 'active' && 
         this.startDate <= now && 
         this.endDate >= now &&
         (!this.maxUsage || this.usageCount < this.maxUsage);
});

// Method to increment usage count
promotionSchema.methods.incrementUsage = function() {
  if (this.maxUsage && this.usageCount >= this.maxUsage) {
    throw new Error('Promotion usage limit reached');
  }
  this.usageCount += 1;
  return this.save();
};

// Method to update status based on dates
promotionSchema.methods.updateStatus = function() {
  const now = new Date();
  
  if (this.endDate < now) {
    this.status = 'ended';
  } else if (this.startDate <= now && this.endDate >= now && this.status === 'scheduled') {
    this.status = 'active';
  }
  
  return this.save();
};

// Static method to get active promotions
promotionSchema.statics.getActivePromotions = function() {
  const now = new Date();
  return this.find({
    status: 'active',
    startDate: { $lte: now },
    endDate: { $gte: now },
    isActive: true
  });
};

// Static method to get promotion statistics
promotionSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: null,
        totalPromotions: { $sum: 1 },
        activePromotions: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'active'] },
              1,
              0
            ]
          }
        },
        scheduledPromotions: {
          $sum: {
            $cond: [
              { $eq: ['$status', 'scheduled'] },
              1,
              0
            ]
          }
        },
        totalUsage: { $sum: '$usageCount' },
        avgDiscountValue: { $avg: '$discountValue' }
      }
    }
  ]);
};

module.exports = mongoose.model('Promotion', promotionSchema);
