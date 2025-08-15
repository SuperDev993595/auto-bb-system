const mongoose = require('mongoose');

const mailChimpCampaignSchema = new mongoose.Schema({
  // MailChimp campaign ID
  campaignId: {
    type: String,
    required: true,
    unique: true
  },

  // Campaign details
  name: {
    type: String,
    required: true,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['regular', 'plaintext', 'absplit', 'rss', 'variate'],
    default: 'regular'
  },

  // Campaign content
  content: {
    html: {
      type: String,
      trim: true
    },
    plainText: {
      type: String,
      trim: true
    },
    template: {
      type: String,
      trim: true
    }
  },

  // Campaign settings
  settings: {
    title: {
      type: String,
      trim: true
    },
    fromName: {
      type: String,
      required: true,
      trim: true
    },
    fromEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    replyTo: {
      type: String,
      trim: true,
      lowercase: true
    },
    toName: {
      type: String,
      trim: true
    },
    autoFooter: {
      type: Boolean,
      default: true
    },
    inlineCss: {
      type: Boolean,
      default: false
    },
    autoTweet: {
      type: Boolean,
      default: false
    },
    fbComments: {
      type: Boolean,
      default: false
    },
    timewarp: {
      type: Boolean,
      default: false
    },
    templateId: {
      type: Number
    },
    dragAndDrop: {
      type: Boolean,
      default: true
    }
  },

  // Tracking settings
  tracking: {
    opens: {
      type: Boolean,
      default: true
    },
    htmlClicks: {
      type: Boolean,
      default: true
    },
    textClicks: {
      type: Boolean,
      default: false
    },
    goalTracking: {
      type: Boolean,
      default: false
    },
    ecomm360: {
      type: Boolean,
      default: false
    },
    googleAnalytics: {
      type: String,
      trim: true
    },
    clicktale: {
      type: String,
      trim: true
    }
  },

  // Recipients
  recipients: {
    listId: {
      type: String,
      required: true
    },
    listName: {
      type: String,
      trim: true
    },
    segmentText: {
      type: String,
      trim: true
    },
    recipientCount: {
      type: Number,
      default: 0
    }
  },

  // Schedule settings
  schedule: {
    hour: {
      type: Number,
      min: 0,
      max: 23
    },
    dailySend: {
      type: Object
    },
    weeklySend: {
      type: Object
    },
    monthlySend: {
      type: Object
    }
  },

  // Campaign status
  status: {
    type: String,
    enum: ['save', 'paused', 'schedule', 'sending', 'sent', 'cancelled'],
    default: 'save'
  },

  // Send time
  sendTime: {
    type: Date
  },

  // Archive URL
  archiveUrl: {
    type: String,
    trim: true
  },

  // Analytics
  analytics: {
    opens: {
      type: Number,
      default: 0
    },
    openRate: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    clickRate: {
      type: Number,
      default: 0
    },
    bounces: {
      type: Number,
      default: 0
    },
    bounceRate: {
      type: Number,
      default: 0
    },
    unsubscribes: {
      type: Number,
      default: 0
    },
    unsubRate: {
      type: Number,
      default: 0
    }
  },

  // Campaign metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true
  },
  lastSynced: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
mailChimpCampaignSchema.index({ campaignId: 1 });
mailChimpCampaignSchema.index({ status: 1 });
mailChimpCampaignSchema.index({ type: 1 });
mailChimpCampaignSchema.index({ createdBy: 1 });
mailChimpCampaignSchema.index({ sendTime: -1 });
mailChimpCampaignSchema.index({ createdAt: -1 });

// Text index for search functionality
mailChimpCampaignSchema.index({
  name: 'text',
  subject: 'text',
  notes: 'text'
});

// Virtual for performance score
mailChimpCampaignSchema.virtual('performanceScore').get(function() {
  if (this.status !== 'sent' || !this.analytics) {
    return 0;
  }

  let score = 0;
  
  // Open rate scoring (max 40 points)
  if (this.analytics.openRate >= 25) score += 40;
  else if (this.analytics.openRate >= 20) score += 30;
  else if (this.analytics.openRate >= 15) score += 20;
  else if (this.analytics.openRate >= 10) score += 10;
  
  // Click rate scoring (max 30 points)
  if (this.analytics.clickRate >= 5) score += 30;
  else if (this.analytics.clickRate >= 3) score += 20;
  else if (this.analytics.clickRate >= 2) score += 15;
  else if (this.analytics.clickRate >= 1) score += 10;
  
  // Bounce rate scoring (max 20 points) - lower is better
  if (this.analytics.bounceRate <= 1) score += 20;
  else if (this.analytics.bounceRate <= 2) score += 15;
  else if (this.analytics.bounceRate <= 3) score += 10;
  else if (this.analytics.bounceRate <= 5) score += 5;
  
  // Unsubscribe rate scoring (max 10 points) - lower is better
  if (this.analytics.unsubRate <= 0.1) score += 10;
  else if (this.analytics.unsubRate <= 0.2) score += 8;
  else if (this.analytics.unsubRate <= 0.3) score += 5;
  else if (this.analytics.unsubRate <= 0.5) score += 2;
  
  return Math.min(score, 100); // Cap at 100
});

// Methods
mailChimpCampaignSchema.methods.updateAnalytics = function(analyticsData) {
  this.analytics = {
    ...this.analytics,
    ...analyticsData
  };
  this.lastSynced = new Date();
  return this.save();
};

mailChimpCampaignSchema.methods.updateDeliveryStatus = function(status, sendTime = null) {
  this.status = status;
  if (sendTime) {
    this.sendTime = sendTime;
  }
  this.lastSynced = new Date();
  return this.save();
};

// Pre-save middleware
mailChimpCampaignSchema.pre('save', function(next) {
  // Update lastSynced on any change
  this.lastSynced = new Date();
  next();
});

module.exports = mongoose.model('MailChimpCampaign', mailChimpCampaignSchema);
