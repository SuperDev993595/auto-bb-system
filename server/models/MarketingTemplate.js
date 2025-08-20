const mongoose = require('mongoose');

const marketingTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true,
    maxlength: [200, 'Name cannot exceed 200 characters']
  },
  type: {
    type: String,
    required: [true, 'Template type is required'],
    enum: {
      values: ['email', 'sms'],
      message: 'Type must be one of: email, sms'
    }
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
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  variables: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    defaultValue: {
      type: String,
      trim: true
    }
  }],
  category: {
    type: String,
    trim: true,
    maxlength: [100, 'Category cannot exceed 100 characters']
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  usageCount: {
    type: Number,
    default: 0,
    min: [0, 'Usage count cannot be negative']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required']
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
marketingTemplateSchema.index({ type: 1, isActive: 1 });
marketingTemplateSchema.index({ category: 1, isActive: 1 });
marketingTemplateSchema.index({ createdBy: 1, createdAt: -1 });

// Method to increment usage count
marketingTemplateSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  return this.save();
};

// Static method to get templates by type
marketingTemplateSchema.statics.getByType = function(type) {
  return this.find({ type, isActive: true })
    .populate('createdBy', 'name email')
    .sort({ usageCount: -1, createdAt: -1 });
};

// Static method to get popular templates
marketingTemplateSchema.statics.getPopular = function(limit = 10) {
  return this.find({ isActive: true })
    .populate('createdBy', 'name email')
    .sort({ usageCount: -1 })
    .limit(limit);
};

module.exports = mongoose.model('MarketingTemplate', marketingTemplateSchema);
