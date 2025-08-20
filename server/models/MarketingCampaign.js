const mongoose = require('mongoose');

const marketingCampaignSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Campaign name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  type: {
    type: String,
    required: [true, 'Campaign type is required'],
    enum: {
      values: ['email', 'sms', 'mailchimp'],
      message: 'Type must be one of: email, sms, mailchimp'
    }
  },
  status: {
    type: String,
    required: [true, 'Status is required'],
    enum: {
      values: ['draft', 'scheduled', 'sent', 'failed', 'paused'],
      message: 'Status must be one of: draft, scheduled, sent, failed, paused'
    },
    default: 'draft'
  },
  subject: {
    type: String,
    trim: true,
    maxlength: [500, 'Subject cannot exceed 500 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    trim: true
  },
  recipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  }],
  recipientCount: {
    type: Number,
    default: 0,
    min: [0, 'Recipient count cannot be negative']
  },
  sentCount: {
    type: Number,
    default: 0,
    min: [0, 'Sent count cannot be negative']
  },
  openedCount: {
    type: Number,
    default: 0,
    min: [0, 'Opened count cannot be negative']
  },
  clickedCount: {
    type: Number,
    default: 0,
    min: [0, 'Clicked count cannot be negative']
  },
  deliveredCount: {
    type: Number,
    default: 0,
    min: [0, 'Delivered count cannot be negative']
  },
  failedCount: {
    type: Number,
    default: 0,
    min: [0, 'Failed count cannot be negative']
  },
  scheduledAt: {
    type: Date
  },
  sentAt: {
    type: Date
  },
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MarketingTemplate'
  },
  tags: [{
    type: String,
    trim: true
  }],
  metadata: {
    type: Map,
    of: String
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

// Indexes for efficient queries
marketingCampaignSchema.index({ status: 1, type: 1, createdAt: -1 });
marketingCampaignSchema.index({ scheduledAt: 1, status: 1 });
marketingCampaignSchema.index({ createdBy: 1, createdAt: -1 });

// Virtual for delivery rate
marketingCampaignSchema.virtual('deliveryRate').get(function() {
  if (this.recipientCount === 0) return 0;
  return (this.deliveredCount / this.recipientCount) * 100;
});

// Virtual for open rate
marketingCampaignSchema.virtual('openRate').get(function() {
  if (this.sentCount === 0) return 0;
  return (this.openedCount / this.sentCount) * 100;
});

// Virtual for click rate
marketingCampaignSchema.virtual('clickRate').get(function() {
  if (this.openedCount === 0) return 0;
  return (this.clickedCount / this.openedCount) * 100;
});

// Method to update campaign status
marketingCampaignSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  if (newStatus === 'sent') {
    this.sentAt = new Date();
  }
  return this.save();
};

// Method to increment metrics
marketingCampaignSchema.methods.incrementMetric = function(metric, count = 1) {
  this[metric] += count;
  return this.save();
};

// Static method to get campaign statistics
marketingCampaignSchema.statics.getStats = function() {
  return this.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: null,
        totalCampaigns: { $sum: 1 },
        activeCampaigns: {
          $sum: {
            $cond: [
              { $in: ['$status', ['draft', 'scheduled']] },
              1,
              0
            ]
          }
        },
        totalRecipients: { $sum: '$recipientCount' },
        totalSent: { $sum: '$sentCount' },
        totalOpened: { $sum: '$openedCount' },
        totalClicked: { $sum: '$clickedCount' },
        totalDelivered: { $sum: '$deliveredCount' },
        totalFailed: { $sum: '$failedCount' }
      }
    }
  ]);
};

// Static method to get campaigns by type
marketingCampaignSchema.statics.getByType = function(type) {
  return this.find({ type, isActive: true })
    .populate('createdBy', 'name email')
    .populate('template', 'name')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('MarketingCampaign', marketingCampaignSchema);
