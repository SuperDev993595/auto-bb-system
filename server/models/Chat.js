const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  // Customer information
  customer: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    sessionId: {
      type: String,
      required: true
    }
  },

  // Chat details
  subject: {
    type: String,
    maxlength: 200,
    trim: true
  },
  category: {
    type: String,
    enum: ['general', 'service', 'billing', 'technical', 'complaint', 'other'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Chat status
  status: {
    type: String,
    enum: ['waiting', 'active', 'resolved', 'closed'],
    default: 'waiting'
  },

  // Assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Messages
  messages: [{
    sender: {
      name: {
        type: String,
        required: true,
        trim: true
      },
      email: {
        type: String,
        trim: true,
        lowercase: true
      }
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text'
    },
    attachments: [{
      filename: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      },
      type: {
        type: String,
        required: true
      },
      size: {
        type: Number
      }
    }],
    isRead: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Transfer history
  transferHistory: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reason: {
      type: String,
      trim: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  }],

  // Rating
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: {
      type: String,
      trim: true
    },
    date: {
      type: Date,
      default: Date.now
    }
  },

  // Activity tracking
  lastActivity: {
    type: Date,
    default: Date.now
  },
  firstResponseTime: {
    type: Date
  },
  resolutionTime: {
    type: Date
  },

  // Tags and notes
  tags: [{
    type: String,
    trim: true
  }],
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
chatSchema.index({ status: 1 });
chatSchema.index({ category: 1 });
chatSchema.index({ priority: 1 });
chatSchema.index({ assignedTo: 1 });
chatSchema.index({ 'customer.sessionId': 1 });
chatSchema.index({ lastActivity: -1 });
chatSchema.index({ createdAt: -1 });

// Text index for search functionality
chatSchema.index({
  'customer.name': 'text',
  'customer.email': 'text',
  subject: 'text',
  'messages.content': 'text'
});

// Virtual for unread message count
chatSchema.virtual('unreadCount').get(function() {
  return this.messages.filter(message => !message.isRead && message.sender.name === 'Customer').length;
});

// Virtual for last message
chatSchema.virtual('lastMessage').get(function() {
  if (this.messages.length === 0) return null;
  return this.messages[this.messages.length - 1];
});

// Virtual for response time
chatSchema.virtual('responseTime').get(function() {
  if (!this.firstResponseTime || !this.createdAt) return null;
  return this.firstResponseTime.getTime() - this.createdAt.getTime();
});

// Virtual for resolution time
chatSchema.virtual('resolutionDuration').get(function() {
  if (!this.resolutionTime || !this.createdAt) return null;
  return this.resolutionTime.getTime() - this.createdAt.getTime();
});

// Methods
chatSchema.methods.addMessage = function(messageData) {
  const message = {
    sender: messageData.sender,
    content: messageData.content,
    messageType: messageData.messageType || 'text',
    attachments: messageData.attachments || [],
    isRead: false,
    createdAt: new Date()
  };

  this.messages.push(message);
  this.lastActivity = new Date();

  // Set first response time if this is the first agent response
  if (!this.firstResponseTime && messageData.sender.name !== 'Customer') {
    this.firstResponseTime = new Date();
  }

  // Update status if it was waiting
  if (this.status === 'waiting') {
    this.status = 'active';
  }

  return this.save();
};

chatSchema.methods.markAsRead = function(messageIds = null) {
  if (messageIds) {
    // Mark specific messages as read
    this.messages.forEach(message => {
      if (messageIds.includes(message._id.toString())) {
        message.isRead = true;
      }
    });
  } else {
    // Mark all messages as read
    this.messages.forEach(message => {
      message.isRead = true;
    });
  }

  return this.save();
};

chatSchema.methods.assignTo = function(userId, reason = '') {
  const previousAssignee = this.assignedTo;
  
  this.assignedTo = userId;
  this.status = 'active';
  this.lastActivity = new Date();

  // Add transfer record
  this.transferHistory.push({
    from: previousAssignee,
    to: userId,
    reason: reason,
    date: new Date()
  });

  // Add system message
  this.messages.push({
    sender: {
      name: 'System',
      email: 'system@autocrm.com'
    },
    content: `Chat transferred${reason ? ` - ${reason}` : ''}`,
    messageType: 'system',
    isRead: false,
    createdAt: new Date()
  });

  return this.save();
};

chatSchema.methods.resolve = function(notes = '') {
  this.status = 'resolved';
  this.resolutionTime = new Date();
  this.lastActivity = new Date();
  this.notes = notes;

  // Add resolution message
  this.messages.push({
    sender: {
      name: 'System',
      email: 'system@autocrm.com'
    },
    content: 'Chat resolved',
    messageType: 'system',
    isRead: false,
    createdAt: new Date()
  });

  return this.save();
};

chatSchema.methods.close = function() {
  this.status = 'closed';
  this.lastActivity = new Date();

  // Add close message
  this.messages.push({
    sender: {
      name: 'System',
      email: 'system@autocrm.com'
    },
    content: 'Chat closed',
    messageType: 'system',
    isRead: false,
    createdAt: new Date()
  });

  return this.save();
};

chatSchema.methods.addRating = function(score, feedback = '') {
  this.rating = {
    score: score,
    feedback: feedback,
    date: new Date()
  };

  return this.save();
};

// Pre-save middleware
chatSchema.pre('save', function(next) {
  // Update lastActivity on any change
  this.lastActivity = new Date();
  next();
});

module.exports = mongoose.model('Chat', chatSchema);
