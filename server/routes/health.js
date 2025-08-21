const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { logger } = require('../middleware/logging');
const { getCacheStats } = require('../middleware/cache');
const os = require('os');

// @route   GET /api/health
// @desc    Basic health check
// @access  Public
router.get('/', async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    };

    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    logger.error('Health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Health check failed'
    });
  }
});

// @route   GET /api/health/detailed
// @desc    Detailed health check with system metrics
// @access  Private
router.get('/detailed', async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Database health check
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    const dbLatency = await checkDatabaseLatency();
    
    // System metrics
    const systemMetrics = {
      memory: {
        used: process.memoryUsage().heapUsed,
        total: process.memoryUsage().heapTotal,
        external: process.memoryUsage().external,
        rss: process.memoryUsage().rss
      },
      cpu: {
        loadAverage: os.loadavg(),
        uptime: os.uptime(),
        platform: os.platform(),
        arch: os.arch()
      },
      process: {
        pid: process.pid,
        nodeVersion: process.version,
        uptime: process.uptime()
      }
    };
    
    // Cache statistics
    const cacheStats = getCacheStats();
    
    // Response time
    const responseTime = Date.now() - startTime;
    
    const detailedHealth = {
      status: dbStatus === 'connected' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      database: {
        status: dbStatus,
        latency: dbLatency
      },
      system: systemMetrics,
      cache: cacheStats,
      responseTime: `${responseTime}ms`
    };

    res.json({
      success: true,
      data: detailedHealth
    });
  } catch (error) {
    logger.error('Detailed health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Detailed health check failed',
      error: error.message
    });
  }
});

// @route   GET /api/health/ready
// @desc    Readiness probe for Kubernetes
// @access  Public
router.get('/ready', async (req, res) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database not ready'
      });
    }
    
    // Check if we can perform a simple database operation
    await mongoose.connection.db.admin().ping();
    
    res.json({
      success: true,
      message: 'Service is ready'
    });
  } catch (error) {
    logger.error('Readiness check error:', error);
    res.status(503).json({
      success: false,
      message: 'Service not ready'
    });
  }
});

// @route   GET /api/health/live
// @desc    Liveness probe for Kubernetes
// @access  Public
router.get('/live', (req, res) => {
  res.json({
    success: true,
    message: 'Service is alive'
  });
});

// Helper function to check database latency
async function checkDatabaseLatency() {
  const start = Date.now();
  try {
    await mongoose.connection.db.admin().ping();
    return Date.now() - start;
  } catch (error) {
    return -1; // Error
  }
}

module.exports = router;
