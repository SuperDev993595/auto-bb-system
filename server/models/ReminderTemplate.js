const mongoose = require('mongoose');

const reminderTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Template name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['appointment', 'service_due', 'follow_up', 'payment', 'custom'],
    required: true
  },
  subject: {
    type: String,
    required: [true, 'Template subject is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Template message is required'],
    trim: true
  },
  timing: {
    value: {
      type: Number,
      required: true,
      min: 1
    },
    unit: {
      type: String,
      enum: ['minutes', 'hours', 'days', 'weeks'],
      required: true
    },
    when: {
      type: String,
      enum: ['before', 'after'],
      required: true
    }
  },
  methods: {
    type: [String],
    enum: ['email', 'sms'],
    required: true,
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'At least one notification method is required'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
reminderTemplateSchema.index({ type: 1 });
reminderTemplateSchema.index({ isActive: 1 });
reminderTemplateSchema.index({ createdBy: 1 });
reminderTemplateSchema.index({ createdAt: -1 });

// Text indexes for search functionality
reminderTemplateSchema.index({
  name: 'text',
  subject: 'text',
  message: 'text'
});

module.exports = mongoose.model('ReminderTemplate', reminderTemplateSchema);
