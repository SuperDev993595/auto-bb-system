const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Reminder title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: [
      'appointment',
      'service_due',
      'follow_up',
      'payment_due',
      'maintenance',
      'inspection',
      'custom'
    ],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'sent', 'acknowledged', 'completed', 'cancelled'],
    default: 'pending'
  },
  reminderDate: {
    type: Date,
    required: true
  },
  dueDate: {
    type: Date
  },
  frequency: {
    type: String,
    enum: ['once', 'daily', 'weekly', 'monthly', 'yearly'],
    default: 'once'
  },
  repeatUntil: {
    type: Date
  },
  lastSent: {
    type: Date
  },
  nextReminder: {
    type: Date
  },
  sentCount: {
    type: Number,
    default: 0
  },
  maxSends: {
    type: Number,
    default: 3
  },
  // Related entities
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  workOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorkOrder'
  },
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  vehicle: {
    make: {
      type: String,
      trim: true
    },
    model: {
      type: String,
      trim: true
    },
    year: {
      type: Number
    },
    vin: {
      type: String,
      trim: true
    }
  },
  // Notification methods array
  notificationMethods: {
    type: [String],
    enum: ['email', 'sms', 'push', 'in_app'],
    default: ['email']
  },
  // Notification settings
  notifications: {
    email: {
      enabled: {
        type: Boolean,
        default: true
      },
      template: {
        type: String,
        trim: true
      },
      sentAt: {
        type: Date
      }
    },
    sms: {
      enabled: {
        type: Boolean,
        default: false
      },
      template: {
        type: String,
        trim: true
      },
      sentAt: {
        type: Date
      }
    },
    push: {
      enabled: {
        type: Boolean,
        default: false
      },
      sentAt: {
        type: Date
      }
    }
  },
  // Action settings
  actions: {
    autoCreateTask: {
      type: Boolean,
      default: false
    },
    autoCreateAppointment: {
      type: Boolean,
      default: false
    },
    autoSendInvoice: {
      type: Boolean,
      default: false
    }
  },
  // Custom data
  customData: {
    type: mongoose.Schema.Types.Mixed
  },
  notes: {
    type: String,
    trim: true
  },
  // Assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
reminderSchema.index({ type: 1 });
reminderSchema.index({ status: 1 });
reminderSchema.index({ priority: 1 });
reminderSchema.index({ reminderDate: 1 });
reminderSchema.index({ dueDate: 1 });
reminderSchema.index({ nextReminder: 1 });
reminderSchema.index({ customer: 1 });
reminderSchema.index({ assignedTo: 1 });
reminderSchema.index({ createdBy: 1 });
reminderSchema.index({ createdAt: -1 });

// Text indexes for search functionality
reminderSchema.index({
  title: 'text',
  description: 'text',
  notes: 'text'
});

// Virtual for overdue status
reminderSchema.virtual('isOverdue').get(function() {
  if (this.status === 'completed' || this.status === 'cancelled') {
    return false;
  }
  if (!this.dueDate) return false;
  const now = new Date();
  const dueDate = new Date(this.dueDate);
  return now > dueDate;
});

// Virtual for overdue days
reminderSchema.virtual('overdueDays').get(function() {
  if (!this.isOverdue) return 0;
  const now = new Date();
  const dueDate = new Date(this.dueDate);
  return Math.floor((now - dueDate) / (1000 * 60 * 60 * 24));
});

// Virtual for next reminder days
reminderSchema.virtual('nextReminderDays').get(function() {
  if (!this.nextReminder) return null;
  const now = new Date();
  const nextReminder = new Date(this.nextReminder);
  return Math.floor((nextReminder - now) / (1000 * 60 * 60 * 24));
});

// Methods for reminders
reminderSchema.methods.markAsSent = function(notificationType = 'email') {
  this.lastSent = new Date();
  this.sentCount += 1;
  
  if (notificationType === 'email') {
    this.notifications.email.sentAt = new Date();
  } else if (notificationType === 'sms') {
    this.notifications.sms.sentAt = new Date();
  } else if (notificationType === 'push') {
    this.notifications.push.sentAt = new Date();
  }
  
  // Calculate next reminder if frequency is set
  if (this.frequency !== 'once' && this.sentCount < this.maxSends) {
    this.calculateNextReminder();
  } else {
    this.status = 'sent';
  }
  
  return this.save();
};

reminderSchema.methods.acknowledge = function() {
  this.status = 'acknowledged';
  return this.save();
};

reminderSchema.methods.complete = function() {
  this.status = 'completed';
  return this.save();
};

reminderSchema.methods.cancel = function() {
  this.status = 'cancelled';
  return this.save();
};

reminderSchema.methods.calculateNextReminder = function() {
  if (this.frequency === 'once') {
    this.nextReminder = null;
    return;
  }
  
  const now = new Date();
  let nextDate = new Date(this.reminderDate);
  
  // Calculate next date based on frequency
  switch (this.frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + 1);
      break;
    case 'weekly':
      nextDate.setDate(nextDate.getDate() + 7);
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + 1);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + 1);
      break;
  }
  
  // Check if we've reached the repeat until date
  if (this.repeatUntil && nextDate > this.repeatUntil) {
    this.status = 'sent';
    this.nextReminder = null;
  } else {
    this.nextReminder = nextDate;
    this.status = 'pending';
  }
};

reminderSchema.methods.shouldSend = function() {
  if (this.status !== 'pending') {
    return false;
  }
  
  if (this.sentCount >= this.maxSends) {
    return false;
  }
  
  const now = new Date();
  const reminderDate = new Date(this.reminderDate);
  
  return now >= reminderDate;
};

// Pre-save middleware
reminderSchema.pre('save', function(next) {
  // Set initial next reminder if not set
  if (this.isNew && !this.nextReminder) {
    this.nextReminder = this.reminderDate;
  }
  
  // Update next reminder when reminder date changes
  if (this.isModified('reminderDate') && this.frequency !== 'once') {
    this.calculateNextReminder();
  }
  
  next();
});

module.exports = mongoose.model('Reminder', reminderSchema);
