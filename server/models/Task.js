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
  }
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

module.exports = mongoose.model('Task', taskSchema);
