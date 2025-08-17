const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
  level: {
    type: String,
    enum: ['info', 'warning', 'error', 'debug', 'security'],
    default: 'info'
  },
  category: {
    type: String,
    enum: ['auth', 'user', 'customer', 'appointment', 'task', 'system', 'security', 'backup', 'email', 'sms'],
    required: true
  },
  action: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userEmail: String,
  userRole: String,
  ipAddress: String,
  userAgent: String,
  resource: {
    type: String,
    enum: ['customer', 'appointment', 'task', 'user', 'system', 'email', 'sms', 'backup'],
    required: true
  },
  resourceId: mongoose.Schema.Types.ObjectId,
  metadata: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  sessionId: String,
  requestId: String
}, {
  timestamps: true
});

// Indexes for efficient querying
systemLogSchema.index({ timestamp: -1 });
systemLogSchema.index({ level: 1, timestamp: -1 });
systemLogSchema.index({ category: 1, timestamp: -1 });
systemLogSchema.index({ userId: 1, timestamp: -1 });
systemLogSchema.index({ resource: 1, resourceId: 1 });

// Static methods for common logging operations
systemLogSchema.statics.logInfo = function(category, action, message, options = {}) {
  return this.create({
    level: 'info',
    category,
    action,
    message,
    ...options
  });
};

systemLogSchema.statics.logWarning = function(category, action, message, options = {}) {
  return this.create({
    level: 'warning',
    category,
    action,
    message,
    ...options
  });
};

systemLogSchema.statics.logError = function(category, action, message, options = {}) {
  return this.create({
    level: 'error',
    category,
    action,
    message,
    ...options
  });
};

systemLogSchema.statics.logSecurity = function(category, action, message, options = {}) {
  return this.create({
    level: 'security',
    category,
    action,
    message,
    ...options
  });
};

// Method to get logs with filtering
systemLogSchema.statics.getLogs = function(filters = {}, page = 1, limit = 50) {
  const query = {};
  
  if (filters.level) query.level = filters.level;
  if (filters.category) query.category = filters.category;
  if (filters.userId) query.userId = filters.userId;
  if (filters.resource) query.resource = filters.resource;
  if (filters.startDate) query.timestamp = { $gte: new Date(filters.startDate) };
  if (filters.endDate) {
    if (query.timestamp) {
      query.timestamp.$lte = new Date(filters.endDate);
    } else {
      query.timestamp = { $lte: new Date(filters.endDate) };
    }
  }
  if (filters.search) {
    query.$or = [
      { message: { $regex: filters.search, $options: 'i' } },
      { action: { $regex: filters.search, $options: 'i' } }
    ];
  }

  const skip = (page - 1) * limit;
  
  return Promise.all([
    this.find(query).sort({ timestamp: -1 }).skip(skip).limit(limit).populate('userId', 'email role'),
    this.countDocuments(query)
  ]);
};

// Method to clean old logs
systemLogSchema.statics.cleanOldLogs = function(daysToKeep = 90) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  return this.deleteMany({ timestamp: { $lt: cutoffDate } });
};

// Method to get system statistics
systemLogSchema.statics.getSystemStats = function(days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    { $match: { timestamp: { $gte: startDate } } },
    {
      $group: {
        _id: {
          level: '$level',
          category: '$category',
          date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.date',
        levels: {
          $push: {
            level: '$_id.level',
            category: '$_id.category',
            count: '$count'
          }
        },
        totalCount: { $sum: '$count' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

module.exports = mongoose.model('SystemLog', systemLogSchema);
