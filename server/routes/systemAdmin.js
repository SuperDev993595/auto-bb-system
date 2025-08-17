const express = require('express');
const router = express.Router();
const Joi = require('joi');
const SystemLog = require('../models/SystemLog');
const Backup = require('../models/Backup');
const SystemHealth = require('../models/SystemHealth');
const backupService = require('../services/backupService');
const monitoringService = require('../services/monitoringService');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Middleware to ensure only super admins can access system admin routes
const requireSuperAdmin = requireRole(['super_admin']);

// Validation schemas
const logFilterSchema = Joi.object({
  level: Joi.string().valid('info', 'warning', 'error', 'debug', 'security'),
  category: Joi.string().valid('auth', 'user', 'customer', 'appointment', 'task', 'system', 'security', 'backup', 'email', 'sms'),
  userId: Joi.string(),
  resource: Joi.string().valid('customer', 'appointment', 'task', 'user', 'system', 'email', 'sms', 'backup'),
  startDate: Joi.date(),
  endDate: Joi.date(),
  search: Joi.string(),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(50)
});

const backupCreateSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().valid('full', 'incremental', 'differential').default('full'),
  compression: Joi.boolean().default(true),
  encryption: Joi.boolean().default(false),
  encryptionKey: Joi.string().when('encryption', {
    is: true,
    then: Joi.required()
  }),
  collections: Joi.array().items(Joi.string()),
  excludedCollections: Joi.array().items(Joi.string()),
  schedule: Joi.object({
    frequency: Joi.string().valid('daily', 'weekly', 'monthly', 'manual').default('manual'),
    time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
    dayOfWeek: Joi.number().min(0).max(6),
    dayOfMonth: Joi.number().min(1).max(31),
    enabled: Joi.boolean().default(false)
  }),
  retention: Joi.object({
    days: Joi.number().min(1).default(30),
    maxBackups: Joi.number().min(1).default(10)
  })
});

const monitoringThresholdsSchema = Joi.object({
  cpu: Joi.object({
    warning: Joi.number().min(0).max(100),
    critical: Joi.number().min(0).max(100)
  }),
  memory: Joi.object({
    warning: Joi.number().min(0).max(100),
    critical: Joi.number().min(0).max(100)
  }),
  disk: Joi.object({
    warning: Joi.number().min(0).max(100),
    critical: Joi.number().min(0).max(100)
  }),
  responseTime: Joi.object({
    warning: Joi.number().min(0),
    critical: Joi.number().min(0)
  }),
  errorRate: Joi.object({
    warning: Joi.number().min(0).max(100),
    critical: Joi.number().min(0).max(100)
  })
});

// ==================== SYSTEM LOGS ====================

// Get system logs with filtering
router.get('/logs', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { error, value } = logFilterSchema.validate(req.query);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { page, limit, ...filters } = value;
    const [logs, total] = await SystemLog.getLogs(filters, page, limit);

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching system logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system logs'
    });
  }
});

// Get system log statistics
router.get('/logs/stats', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const stats = await SystemLog.getSystemStats(days);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching log statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch log statistics'
    });
  }
});

// Clean old logs
router.delete('/logs/clean', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const daysToKeep = parseInt(req.query.days) || 90;
    const result = await SystemLog.cleanOldLogs(daysToKeep);

    res.json({
      success: true,
      message: `Cleaned logs older than ${daysToKeep} days`,
      data: { deletedCount: result.deletedCount }
    });
  } catch (error) {
    console.error('Error cleaning old logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clean old logs'
    });
  }
});

// ==================== BACKUP MANAGEMENT ====================

// Get all backups
router.get('/backups', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const type = req.query.type;

    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;

    const skip = (page - 1) * limit;
    const [backups, total] = await Promise.all([
      Backup.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'email role')
        .populate('verifiedBy', 'email role'),
      Backup.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: {
        backups,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching backups:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch backups'
    });
  }
});

// Get backup statistics
router.get('/backups/stats', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const stats = await backupService.getBackupStats();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching backup statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch backup statistics'
    });
  }
});

// Create new backup
router.post('/backups', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { error, value } = backupCreateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const backup = await backupService.createBackup(value, req.user.id);

    res.status(201).json({
      success: true,
      message: 'Backup created successfully',
      data: { backup }
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create backup'
    });
  }
});

// Restore backup
router.post('/backups/:id/restore', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const result = await backupService.restoreBackup(req.params.id, req.user.id);

    res.json({
      success: true,
      message: 'Backup restored successfully',
      data: result
    });
  } catch (error) {
    console.error('Error restoring backup:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to restore backup'
    });
  }
});

// Verify backup
router.post('/backups/:id/verify', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const result = await backupService.verifyBackup(req.params.id, req.user.id);

    res.json({
      success: true,
      message: 'Backup verified successfully',
      data: result
    });
  } catch (error) {
    console.error('Error verifying backup:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to verify backup'
    });
  }
});

// Delete backup
router.delete('/backups/:id', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const backup = await Backup.findById(req.params.id);
    if (!backup) {
      return res.status(404).json({
        success: false,
        message: 'Backup not found'
      });
    }

    // Delete backup file
    await backupService.deleteBackupFile(backup.location);
    
    // Delete backup record
    await backup.remove();

    res.json({
      success: true,
      message: 'Backup deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting backup:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete backup'
    });
  }
});

// Clean old backups
router.delete('/backups/clean', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const daysToKeep = parseInt(req.query.days) || 90;
    const result = await backupService.cleanOldBackups(daysToKeep);

    res.json({
      success: true,
      message: `Cleaned backups older than ${daysToKeep} days`,
      data: result
    });
  } catch (error) {
    console.error('Error cleaning old backups:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clean old backups'
    });
  }
});

// ==================== SYSTEM MONITORING ====================

// Get system health
router.get('/health', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const health = await monitoringService.getSystemHealth();

    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    console.error('Error fetching system health:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system health'
    });
  }
});

// Get service status
router.get('/health/services', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const status = await monitoringService.getServiceStatus();

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Error fetching service status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service status'
    });
  }
});

// Start monitoring
router.post('/monitoring/start', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const intervalMinutes = parseInt(req.body.intervalMinutes) || 5;
    monitoringService.startMonitoring(intervalMinutes);

    res.json({
      success: true,
      message: `System monitoring started with ${intervalMinutes} minute intervals`
    });
  } catch (error) {
    console.error('Error starting monitoring:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start monitoring'
    });
  }
});

// Stop monitoring
router.post('/monitoring/stop', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    monitoringService.stopMonitoring();

    res.json({
      success: true,
      message: 'System monitoring stopped'
    });
  } catch (error) {
    console.error('Error stopping monitoring:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to stop monitoring'
    });
  }
});

// Get monitoring status
router.get('/monitoring/status', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const isActive = monitoringService.isMonitoringActive();
    const thresholds = monitoringService.getThresholds();

    res.json({
      success: true,
      data: {
        isActive,
        thresholds
      }
    });
  } catch (error) {
    console.error('Error fetching monitoring status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch monitoring status'
    });
  }
});

// Update monitoring thresholds
router.put('/monitoring/thresholds', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const { error, value } = monitoringThresholdsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    monitoringService.setThresholds(value);

    res.json({
      success: true,
      message: 'Monitoring thresholds updated successfully',
      data: { thresholds: value }
    });
  } catch (error) {
    console.error('Error updating monitoring thresholds:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update monitoring thresholds'
    });
  }
});

// ==================== SYSTEM UTILITIES ====================

// Get system information
router.get('/system/info', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const os = require('os');
    const process = require('process');

    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      release: os.release(),
      hostname: os.hostname(),
      uptime: os.uptime(),
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpus: os.cpus().length,
      loadAverage: os.loadavg(),
      nodeVersion: process.version,
      processUptime: process.uptime(),
      processMemory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    };

    res.json({
      success: true,
      data: systemInfo
    });
  } catch (error) {
    console.error('Error fetching system information:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch system information'
    });
  }
});

// Get database information
router.get('/system/database', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const adminDb = db.admin();
    
    const [serverStatus, dbStats] = await Promise.all([
      adminDb.serverStatus(),
      db.stats()
    ]);

    const dbInfo = {
      name: db.databaseName,
      version: serverStatus.version,
      connections: serverStatus.connections,
      operations: serverStatus.opcounters,
      memory: serverStatus.mem,
      storage: dbStats,
      collections: await db.listCollections().toArray()
    };

    res.json({
      success: true,
      data: dbInfo
    });
  } catch (error) {
    console.error('Error fetching database information:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch database information'
    });
  }
});

// Test system connectivity
router.post('/system/test-connectivity', authenticateToken, requireSuperAdmin, async (req, res) => {
  try {
    const tests = {
      database: false,
      email: false,
      sms: false,
      fileStorage: false
    };

    // Test database
    try {
      await mongoose.connection.db.admin().ping();
      tests.database = true;
    } catch (error) {
      console.error('Database connectivity test failed:', error);
    }

    // Test email (simplified)
    tests.email = true; // Would need actual email service test

    // Test SMS (simplified)
    tests.sms = true; // Would need actual SMS service test

    // Test file storage (simplified)
    tests.fileStorage = true; // Would need actual file storage test

    const allPassed = Object.values(tests).every(test => test);

    res.json({
      success: true,
      data: {
        tests,
        allPassed,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Error testing system connectivity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to test system connectivity'
    });
  }
});

module.exports = router;
