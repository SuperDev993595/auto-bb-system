const mongoose = require('mongoose');

const smsSchema = new mongoose.Schema({
  to: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 1600
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'failed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high'],
    default: 'normal'
  },
  scheduledAt: {
    type: Date,
    default: null
  },
  sentAt: {
    type: Date,
    default: null
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  errorMessage: {
    type: String,
    default: null
  },
  provider: {
    type: String,
    default: 'mock' // 'twilio', 'aws-sns', etc.
  },
  providerMessageId: {
    type: String,
    default: null
  },
  cost: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
smsSchema.index({ to: 1 });
smsSchema.index({ status: 1 });
smsSchema.index({ sentAt: -1 });
smsSchema.index({ createdBy: 1 });
smsSchema.index({ isActive: 1 });

// Virtual for delivery time
smsSchema.virtual('deliveryTime').get(function() {
  if (this.sentAt && this.deliveredAt) {
    return this.deliveredAt - this.sentAt;
  }
  return null;
});

// Methods
smsSchema.methods.updateStatus = function(status, additionalData = {}) {
  this.status = status;
  
  if (status === 'sent' && !this.sentAt) {
    this.sentAt = new Date();
  }
  
  if (status === 'delivered' && !this.deliveredAt) {
    this.deliveredAt = new Date();
  }
  
  if (additionalData.errorMessage) {
    this.errorMessage = additionalData.errorMessage;
  }
  
  if (additionalData.providerMessageId) {
    this.providerMessageId = additionalData.providerMessageId;
  }
  
  if (additionalData.cost) {
    this.cost = additionalData.cost;
  }
  
  return this.save();
};

// Static methods
smsSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: null,
        totalSent: { $sum: 1 },
        delivered: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] 
          } 
        },
        failed: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] 
          } 
        },
        pending: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] 
          } 
        },
        totalCost: { $sum: '$cost' }
      }
    }
  ]);
};

smsSchema.statics.getDeliveryRate = function() {
  return this.aggregate([
    {
      $match: { 
        isActive: true,
        status: { $in: ['delivered', 'failed'] }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        delivered: { 
          $sum: { 
            $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] 
          } 
        }
      }
    },
    {
      $project: {
        deliveryRate: {
          $multiply: [
            { $divide: ['$delivered', '$total'] },
            100
          ]
        }
      }
    }
  ]);
};

module.exports = mongoose.model('SMS', smsSchema);
