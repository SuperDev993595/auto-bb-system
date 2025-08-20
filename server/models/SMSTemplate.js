const mongoose = require('mongoose');

const smsTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 1600
  },
  variables: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    required: true,
    enum: ['appointment', 'reminder', 'promotion', 'notification', 'custom'],
    default: 'custom'
  },
  description: {
    type: String,
    maxlength: 500,
    default: ''
  },
  usageCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

smsTemplateSchema.index({ name: 1 });
smsTemplateSchema.index({ category: 1 });
smsTemplateSchema.index({ isActive: 1 });

smsTemplateSchema.methods.incrementUsage = function() {
  this.usageCount += 1;
  return this.save();
};

smsTemplateSchema.methods.renderMessage = function(variables = {}) {
  let message = this.message;
  this.variables.forEach(variable => {
    const placeholder = `{{${variable}}}`;
    const value = variables[variable] || '';
    message = message.replace(new RegExp(placeholder, 'g'), value);
  });
  return message;
};

smsTemplateSchema.statics.getByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ usageCount: -1, name: 1 });
};

smsTemplateSchema.statics.getPopular = function(limit = 10) {
  return this.find({ isActive: true }).sort({ usageCount: -1 }).limit(limit);
};

module.exports = mongoose.model('SMSTemplate', smsTemplateSchema);
