const mongoose = require('mongoose');

const systemHealthSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['healthy', 'warning', 'critical', 'offline'],
    default: 'healthy'
  },
  metrics: {
    cpu: {
      usage: Number, // Percentage
      load: Number,
      temperature: Number
    },
    memory: {
      total: Number, // Bytes
      used: Number, // Bytes
      free: Number, // Bytes
      usage: Number // Percentage
    },
    disk: {
      total: Number, // Bytes
      used: Number, // Bytes
      free: Number, // Bytes
      usage: Number // Percentage
    },
    network: {
      bytesIn: Number,
      bytesOut: Number,
      packetsIn: Number,
      packetsOut: Number,
      errors: Number
    },
    database: {
      connections: Number,
      activeConnections: Number,
      idleConnections: Number,
      queryTime: Number, // Average query time in ms
      slowQueries: Number
    },
    application: {
      uptime: Number, // Seconds
      memoryUsage: Number, // Bytes
      cpuUsage: Number, // Percentage
      activeUsers: Number,
      requestsPerMinute: Number,
      averageResponseTime: Number, // ms
      errorRate: Number // Percentage
    }
  },
  alerts: [{
    type: {
      type: String,
      enum: ['cpu', 'memory', 'disk', 'network', 'database', 'application'],
      required: true
    },
    level: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    threshold: Number,
    currentValue: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  services: [{
    name: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['running', 'stopped', 'error', 'unknown'],
      default: 'unknown'
    },
    responseTime: Number, // ms
    lastCheck: Date,
    error: String
  }],
  checks: {
    database: {
      status: {
        type: String,
        enum: ['healthy', 'warning', 'critical', 'offline'],
        default: 'healthy'
      },
      responseTime: Number,
      lastCheck: Date,
      error: String
    },
    email: {
      status: {
        type: String,
        enum: ['healthy', 'warning', 'critical', 'offline'],
        default: 'healthy'
      },
      responseTime: Number,
      lastCheck: Date,
      error: String
    },
    sms: {
      status: {
        type: String,
        enum: ['healthy', 'warning', 'critical', 'offline'],
        default: 'healthy'
      },
      responseTime: Number,
      lastCheck: Date,
      error: String
    },
    fileStorage: {
      status: {
        type: String,
        enum: ['healthy', 'warning', 'critical', 'offline'],
        default: 'healthy'
      },
      responseTime: Number,
      lastCheck: Date,
      error: String
    }
  },
  recommendations: [{
    type: {
      type: String,
      enum: ['optimization', 'scaling', 'maintenance', 'security'],
      required: true
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: String,
    action: String,
    estimatedImpact: String
  }]
}, {
  timestamps: true
});

// Indexes
systemHealthSchema.index({ timestamp: -1 });
systemHealthSchema.index({ status: 1, timestamp: -1 });
systemHealthSchema.index({ 'alerts.level': 1, timestamp: -1 });

// Virtual for overall health score
systemHealthSchema.virtual('healthScore').get(function() {
  let score = 100;
  
  // Deduct points for critical alerts
  const criticalAlerts = this.alerts.filter(alert => alert.level === 'critical').length;
  score -= criticalAlerts * 20;
  
  // Deduct points for warnings
  const warningAlerts = this.alerts.filter(alert => alert.level === 'warning').length;
  score -= warningAlerts * 10;
  
  // Deduct points for high resource usage
  if (this.metrics.cpu.usage > 90) score -= 15;
  else if (this.metrics.cpu.usage > 80) score -= 10;
  else if (this.metrics.cpu.usage > 70) score -= 5;
  
  if (this.metrics.memory.usage > 90) score -= 15;
  else if (this.metrics.memory.usage > 80) score -= 10;
  else if (this.metrics.memory.usage > 70) score -= 5;
  
  if (this.metrics.disk.usage > 90) score -= 15;
  else if (this.metrics.disk.usage > 80) score -= 10;
  else if (this.metrics.disk.usage > 70) score -= 5;
  
  return Math.max(0, score);
});

// Static methods
systemHealthSchema.statics.getLatestHealth = function() {
  return this.findOne().sort({ timestamp: -1 });
};

systemHealthSchema.statics.getHealthHistory = function(hours = 24) {
  const startTime = new Date();
  startTime.setHours(startTime.getHours() - hours);
  
  return this.find({ timestamp: { $gte: startTime } })
    .sort({ timestamp: 1 })
    .select('timestamp status metrics.cpu.usage metrics.memory.usage metrics.disk.usage');
};

systemHealthSchema.statics.getHealthStats = function(days = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.aggregate([
    { $match: { timestamp: { $gte: startDate } } },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          status: '$status'
        },
        count: { $sum: 1 },
        avgCpuUsage: { $avg: '$metrics.cpu.usage' },
        avgMemoryUsage: { $avg: '$metrics.memory.usage' },
        avgDiskUsage: { $avg: '$metrics.disk.usage' },
        avgResponseTime: { $avg: '$metrics.application.averageResponseTime' }
      }
    },
    {
      $group: {
        _id: '$_id.date',
        statuses: {
          $push: {
            status: '$_id.status',
            count: '$count'
          }
        },
        avgCpuUsage: { $avg: '$avgCpuUsage' },
        avgMemoryUsage: { $avg: '$avgMemoryUsage' },
        avgDiskUsage: { $avg: '$avgDiskUsage' },
        avgResponseTime: { $avg: '$avgResponseTime' }
      }
    },
    { $sort: { _id: 1 } }
  ]);
};

systemHealthSchema.statics.getActiveAlerts = function() {
  return this.aggregate([
    { $unwind: '$alerts' },
    { $match: { 'alerts.level': { $in: ['warning', 'critical'] } } },
    { $sort: { 'alerts.timestamp': -1 } },
    { $limit: 50 }
  ]);
};

systemHealthSchema.statics.cleanOldRecords = function(daysToKeep = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  return this.deleteMany({ timestamp: { $lt: cutoffDate } });
};

// Instance methods
systemHealthSchema.methods.addAlert = function(type, level, message, threshold = null, currentValue = null) {
  this.alerts.push({
    type,
    level,
    message,
    threshold,
    currentValue,
    timestamp: new Date()
  });
  
  // Update overall status based on alerts
  const criticalAlerts = this.alerts.filter(alert => alert.level === 'critical').length;
  const warningAlerts = this.alerts.filter(alert => alert.level === 'warning').length;
  
  if (criticalAlerts > 0) {
    this.status = 'critical';
  } else if (warningAlerts > 0) {
    this.status = 'warning';
  } else {
    this.status = 'healthy';
  }
  
  return this.save();
};

systemHealthSchema.methods.updateServiceStatus = function(serviceName, status, responseTime = null, error = null) {
  const service = this.services.find(s => s.name === serviceName);
  if (service) {
    service.status = status;
    service.responseTime = responseTime;
    service.lastCheck = new Date();
    service.error = error;
  } else {
    this.services.push({
      name: serviceName,
      status,
      responseTime,
      lastCheck: new Date(),
      error
    });
  }
  
  return this.save();
};

// Pre-save middleware to update status based on metrics
systemHealthSchema.pre('save', function(next) {
  // Check if any metrics are in critical range
  if (this.metrics.cpu.usage > 95 || this.metrics.memory.usage > 95 || this.metrics.disk.usage > 95) {
    this.status = 'critical';
  } else if (this.metrics.cpu.usage > 80 || this.metrics.memory.usage > 80 || this.metrics.disk.usage > 80) {
    this.status = 'warning';
  }
  
  next();
});

module.exports = mongoose.model('SystemHealth', systemHealthSchema);
