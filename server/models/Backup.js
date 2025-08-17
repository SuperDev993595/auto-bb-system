const mongoose = require('mongoose');

const backupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['full', 'incremental', 'differential'],
    default: 'full'
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  size: {
    type: Number, // Size in bytes
    default: 0
  },
  location: {
    type: String,
    required: true
  },
  format: {
    type: String,
    enum: ['json', 'bson', 'sql', 'zip'],
    default: 'json'
  },
  compression: {
    type: Boolean,
    default: true
  },
  encryption: {
    type: Boolean,
    default: false
  },
  encryptionKey: String,
  collections: [{
    type: String
  }],
  excludedCollections: [{
    type: String
  }],
  metadata: {
    totalDocuments: Number,
    totalCollections: Number,
    databaseVersion: String,
    backupVersion: String
  },
  schedule: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'manual'],
      default: 'manual'
    },
    time: String, // HH:MM format
    dayOfWeek: Number, // 0-6 for weekly
    dayOfMonth: Number, // 1-31 for monthly
    enabled: {
      type: Boolean,
      default: false
    }
  },
  retention: {
    days: {
      type: Number,
      default: 30
    },
    maxBackups: {
      type: Number,
      default: 10
    }
  },
  startedAt: Date,
  completedAt: Date,
  duration: Number, // Duration in milliseconds
  error: {
    message: String,
    stack: String,
    code: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  verifiedAt: Date,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  checksum: String,
  notes: String
}, {
  timestamps: true
});

// Indexes
backupSchema.index({ status: 1, createdAt: -1 });
backupSchema.index({ type: 1, createdAt: -1 });
backupSchema.index({ createdBy: 1, createdAt: -1 });
backupSchema.index({ 'schedule.enabled': 1 });

// Virtual for formatted size
backupSchema.virtual('formattedSize').get(function() {
  if (this.size === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(this.size) / Math.log(1024));
  return `${(this.size / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
});

// Virtual for duration in human readable format
backupSchema.virtual('formattedDuration').get(function() {
  if (!this.duration) return 'N/A';
  
  const seconds = Math.floor(this.duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
});

// Static methods
backupSchema.statics.getBackupStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalSize: { $sum: '$size' },
        avgDuration: { $avg: '$duration' }
      }
    }
  ]);
};

backupSchema.statics.getRecentBackups = function(limit = 10) {
  return this.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('createdBy', 'email role')
    .populate('verifiedBy', 'email role');
};

backupSchema.statics.getScheduledBackups = function() {
  return this.find({ 'schedule.enabled': true });
};

backupSchema.statics.cleanOldBackups = function() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90); // Default 90 days
  
  return this.find({
    createdAt: { $lt: cutoffDate },
    status: { $in: ['completed', 'failed'] }
  });
};

// Instance methods
backupSchema.methods.markAsStarted = function() {
  this.status = 'in_progress';
  this.startedAt = new Date();
  return this.save();
};

backupSchema.methods.markAsCompleted = function(size, duration, metadata = {}) {
  this.status = 'completed';
  this.completedAt = new Date();
  this.size = size;
  this.duration = duration;
  this.metadata = { ...this.metadata, ...metadata };
  return this.save();
};

backupSchema.methods.markAsFailed = function(error) {
  this.status = 'failed';
  this.completedAt = new Date();
  this.error = {
    message: error.message,
    stack: error.stack,
    code: error.code
  };
  return this.save();
};

backupSchema.methods.verify = function(userId, checksum) {
  this.verified = true;
  this.verifiedAt = new Date();
  this.verifiedBy = userId;
  this.checksum = checksum;
  return this.save();
};

// Pre-save middleware to generate backup name if not provided
backupSchema.pre('save', function(next) {
  if (!this.name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    this.name = `backup-${this.type}-${timestamp}`;
  }
  next();
});

module.exports = mongoose.model('Backup', backupSchema);
