const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['marketing', 'sales', 'collections', 'appointments', 'follow_up', 'research', 'other'],
    required: [true, 'Task type is required']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Technician',
    required: [true, 'Task must be assigned to a technician']
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Task must have an assigner']
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  startDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  estimatedDuration: {
    type: Number, // in minutes
    min: [0, 'Duration cannot be negative']
  },
  actualDuration: {
    type: Number, // in minutes
    min: [0, 'Duration cannot be negative']
  },
  progress: {
    type: Number,
    min: [0, 'Progress cannot be negative'],
    max: [100, 'Progress cannot exceed 100%'],
    default: 0
  },
  notes: [{
    content: {
      type: String,
      required: true,
      trim: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  relatedTasks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }],
  outcome: {
    type: String,
    enum: ['successful', 'unsuccessful', 'partial', 'rescheduled', 'other'],
    default: 'other'
  },
  result: {
    type: String,
    trim: true
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  reminderSent: {
    type: Boolean,
    default: false
  },
  // Collections-specific fields
  collectionsType: {
    type: String,
    enum: ['payment_reminder', 'overdue_notice', 'payment_plan', 'negotiation', 'legal_action', 'other'],
    required: function() {
      return this.type === 'collections';
    }
  },
  amount: {
    type: Number,
    min: [0, 'Amount cannot be negative'],
    required: function() {
      return this.type === 'collections';
    }
  },
  paymentTerms: {
    type: String,
    maxlength: 200,
    trim: true
  },
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice'
  },
  paymentPlan: {
    totalAmount: {
      type: Number,
      min: [0, 'Total amount cannot be negative']
    },
    installmentAmount: {
      type: Number,
      min: [0, 'Installment amount cannot be negative']
    },
    numberOfInstallments: {
      type: Number,
      min: [1, 'Number of installments must be at least 1']
    },
    installmentFrequency: {
      type: String,
      enum: ['weekly', 'bi-weekly', 'monthly', 'quarterly'],
      default: 'monthly'
    },
    nextPaymentDate: {
      type: Date
    },
    paymentsMade: {
      type: Number,
      default: 0,
      min: [0, 'Payments made cannot be negative']
    },
    totalPaid: {
      type: Number,
      default: 0,
      min: [0, 'Total paid cannot be negative']
    },
    lastReminderSent: {
      type: Date
    },
    reminderFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'bi-weekly', 'monthly'],
      default: 'weekly'
    }
  },
  communicationHistory: [{
    method: {
      type: String,
      enum: ['phone', 'email', 'sms', 'in_person', 'letter'],
      required: true
    },
    direction: {
      type: String,
      enum: ['inbound', 'outbound'],
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    summary: {
      type: String,
      trim: true
    },
    outcome: {
      type: String,
      enum: ['no_answer', 'left_message', 'spoke_to_customer', 'payment_promised', 'payment_made', 'refused', 'other']
    },
    nextAction: {
      type: String,
      trim: true
    },
    nextActionDate: {
      type: Date
    }
  }],
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  lastContactDate: {
    type: Date
  },
  nextContactDate: {
    type: Date
  },
  escalationLevel: {
    type: Number,
    min: [1, 'Escalation level must be at least 1'],
    max: [5, 'Escalation level cannot exceed 5'],
    default: 1
  },
  
  // Automated reminders system
  automatedReminders: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'letter', 'phone'],
      required: true
    },
    scheduledDate: {
      type: Date,
      required: true
    },
    sentDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['pending', 'sent', 'failed', 'cancelled'],
      default: 'pending'
    },
    template: {
      type: String,
      default: 'default'
    },
    recipient: {
      type: String,
      enum: ['customer', 'assigned_user', 'manager'],
      default: 'customer'
    },
    message: {
      type: String
    },
    errorMessage: {
      type: String
    }
  }],
  
  // Escalation rules and tracking
  escalationRules: [{
    triggerDays: {
      type: Number,
      required: true
    }, // Days overdue to trigger
    action: {
      type: String,
      enum: ['notify_manager', 'change_priority', 'assign_to_specialist', 'legal_review'],
      required: true
    },
    executed: {
      type: Boolean,
      default: false
    },
    executedAt: {
      type: Date
    },
    executedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Collections-specific metadata
  lastReminderDate: {
    type: Date
  },
  nextReminderDate: {
    type: Date
  },
  reminderCount: {
    type: Number,
    default: 0
  },
  maxReminders: {
    type: Number,
    default: 5
  },
  autoEscalate: {
    type: Boolean,
    default: true
  },
  escalationThreshold: {
    type: Number,
    default: 30
  }, // Days overdue before escalation
  legalDocuments: [{
    documentType: {
      type: String,
      enum: ['payment_agreement', 'demand_letter', 'legal_notice', 'court_filing', 'other'],
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'archived'],
      default: 'active'
    },
    tags: [{
      type: String
    }],
    description: {
      type: String,
      trim: true
    }
  }],
  auditTrail: [{
    action: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    performedAt: {
      type: Date,
      default: Date.now
    },
    previousValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

// Index for better query performance
taskSchema.index({ assignedTo: 1, status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ type: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ customer: 1 });
taskSchema.index({ followUpDate: 1 });
taskSchema.index({ collectionsType: 1 });
taskSchema.index({ riskLevel: 1 });
taskSchema.index({ escalationLevel: 1 });
taskSchema.index({ nextContactDate: 1 });

// Enhanced collections indexes
taskSchema.index({ 'automatedReminders.scheduledDate': 1, 'automatedReminders.status': 1 });
taskSchema.index({ 'paymentPlan.nextPaymentDate': 1 });
taskSchema.index({ lastReminderDate: 1 });
taskSchema.index({ nextReminderDate: 1 });
taskSchema.index({ reminderCount: 1 });
taskSchema.index({ 'escalationRules.executed': 1, 'escalationRules.triggerDays': 1 });
taskSchema.index({ 'legalDocuments.status': 1, 'legalDocuments.expiresAt': 1 });

// Virtual for overdue tasks
taskSchema.virtual('isOverdue').get(function() {
  return this.dueDate < new Date() && this.status !== 'completed';
});

// Virtual for time remaining
taskSchema.virtual('timeRemaining').get(function() {
  if (this.status === 'completed') return 0;
  const now = new Date();
  const due = new Date(this.dueDate);
  return Math.max(0, due - now);
});

// Virtual for collections balance
taskSchema.virtual('balanceRemaining').get(function() {
  if (this.type !== 'collections' || !this.amount) return 0;
  if (this.paymentPlan && this.paymentPlan.totalAmount) {
    return this.paymentPlan.totalAmount - this.paymentPlan.totalPaid;
  }
  return this.amount;
});

// Method to update progress
taskSchema.methods.updateProgress = function(progress) {
  this.progress = Math.max(0, Math.min(100, progress));
  if (this.progress === 100 && this.status !== 'completed') {
    this.status = 'completed';
    this.completedDate = new Date();
  }
  return this.save();
};

// Method to add note
taskSchema.methods.addNote = function(content, userId) {
  this.notes.push({
    content,
    createdBy: userId
  });
  return this.save();
};

// Method to add communication record
taskSchema.methods.addCommunication = function(communicationData, userId) {
  this.communicationHistory.push({
    ...communicationData,
    performedBy: userId
  });
  this.lastContactDate = new Date();
  return this.save();
};

// Method to add audit trail entry
taskSchema.methods.addAuditEntry = function(action, description, userId, previousValue = null, newValue = null) {
  this.auditTrail.push({
    action,
    description,
    performedBy: userId,
    previousValue,
    newValue
  });
  return this.save();
};

// Method to update payment plan
taskSchema.methods.updatePaymentPlan = function(paymentAmount, userId) {
  if (this.paymentPlan) {
    this.paymentPlan.paymentsMade += 1;
    this.paymentPlan.totalPaid += paymentAmount;
    
    // Calculate next payment date
    const nextPaymentDate = new Date(this.paymentPlan.nextPaymentDate);
    switch (this.paymentPlan.installmentFrequency) {
      case 'weekly':
        nextPaymentDate.setDate(nextPaymentDate.getDate() + 7);
        break;
      case 'bi-weekly':
        nextPaymentDate.setDate(nextPaymentDate.getDate() + 14);
        break;
      case 'monthly':
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 3);
        break;
    }
    this.paymentPlan.nextPaymentDate = nextPaymentDate;
    
    // Add audit entry
    this.addAuditEntry(
      'payment_received',
      `Payment of $${paymentAmount.toFixed(2)} received`,
      userId,
      this.paymentPlan.totalPaid - paymentAmount,
      this.paymentPlan.totalPaid
    );
  }
  return this.save();
};

// Method to schedule automated reminder
taskSchema.methods.scheduleReminder = function(type, scheduledDate, template = 'default', recipient = 'customer') {
  if (this.reminderCount >= this.maxReminders) {
    throw new Error('Maximum reminders reached for this task');
  }
  
  this.automatedReminders.push({
    type,
    scheduledDate,
    template,
    recipient,
    status: 'pending'
  });
  
  this.nextReminderDate = scheduledDate;
  this.reminderCount += 1;
  
  return this.save();
};

// Method to mark reminder as sent
taskSchema.methods.markReminderSent = function(reminderId, message = null, errorMessage = null) {
  const reminder = this.automatedReminders.id(reminderId);
  if (reminder) {
    reminder.status = errorMessage ? 'failed' : 'sent';
    reminder.sentDate = new Date();
    reminder.message = message;
    reminder.errorMessage = errorMessage;
    
    this.lastReminderDate = new Date();
    
    // Calculate next reminder date based on frequency
    if (this.paymentPlan && this.paymentPlan.reminderFrequency) {
      const nextDate = new Date();
      switch (this.paymentPlan.reminderFrequency) {
        case 'daily':
          nextDate.setDate(nextDate.getDate() + 1);
          break;
        case 'weekly':
          nextDate.setDate(nextDate.getDate() + 7);
          break;
        case 'bi-weekly':
          nextDate.setDate(nextDate.getDate() + 14);
          break;
        case 'monthly':
          nextDate.setMonth(nextDate.getMonth() + 1);
          break;
      }
      this.nextReminderDate = nextDate;
    }
    
    return this.save();
  }
  throw new Error('Reminder not found');
};

// Method to check and execute escalation rules
taskSchema.methods.checkEscalation = function(userId) {
  if (!this.autoEscalate || this.status === 'completed') {
    return false;
  }
  
  const daysOverdue = Math.floor((new Date() - new Date(this.dueDate)) / (1000 * 60 * 60 * 24));
  
  for (const rule of this.escalationRules) {
    if (daysOverdue >= rule.triggerDays && !rule.executed) {
      // Execute escalation action
      rule.executed = true;
      rule.executedAt = new Date();
      rule.executedBy = userId;
      
      switch (rule.action) {
        case 'notify_manager':
          // Logic to notify manager
          break;
        case 'change_priority':
          if (this.priority !== 'urgent') {
            this.priority = 'urgent';
          }
          break;
        case 'assign_to_specialist':
          // Logic to reassign to specialist
          break;
        case 'legal_review':
          this.escalationLevel = Math.min(5, this.escalationLevel + 1);
          break;
      }
      
      this.addAuditEntry(
        'escalation_executed',
        `Escalation rule executed: ${rule.action} after ${rule.triggerDays} days overdue`,
        userId
      );
      
      return true;
    }
  }
  
  return false;
};

// Method to add legal document
taskSchema.methods.addLegalDocument = function(documentData, userId) {
  this.legalDocuments.push({
    ...documentData,
    uploadedBy: userId,
    uploadedAt: new Date(),
    status: 'active'
  });
  
  this.addAuditEntry(
    'document_uploaded',
    `Legal document uploaded: ${documentData.originalName}`,
    userId
  );
  
  return this.save();
};

// Static method to get tasks by user
taskSchema.statics.getTasksByUser = function(userId, status = null) {
  const query = { assignedTo: userId };
  if (status) query.status = status;
  return this.find(query).populate('customer', 'businessName contactPerson.name');
};

// Static method to get overdue tasks
taskSchema.statics.getOverdueTasks = function() {
  return this.find({
    dueDate: { $lt: new Date() },
    status: { $ne: 'completed' }
  }).populate('assignedTo', 'name email');
};

// Static method to get collections tasks by risk level
taskSchema.statics.getCollectionsByRiskLevel = function(riskLevel = null) {
  const query = { type: 'collections' };
  if (riskLevel) query.riskLevel = riskLevel;
  return this.find(query)
    .populate('customer', 'businessName contactPerson.name')
    .populate('assignedTo', 'name email')
    .sort({ priority: -1, dueDate: 1 });
};

// Static method to get overdue collections
taskSchema.statics.getOverdueCollections = function() {
  return this.find({
    type: 'collections',
    dueDate: { $lt: new Date() },
    status: { $ne: 'completed' }
  })
    .populate('customer', 'businessName contactPerson.name')
    .populate('assignedTo', 'name email')
    .sort({ dueDate: 1 });
};

module.exports = mongoose.model('Task', taskSchema);
