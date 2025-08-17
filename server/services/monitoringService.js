const os = require('os');
const mongoose = require('mongoose');
const SystemHealth = require('../models/SystemHealth');
const SystemLog = require('../models/SystemLog');

class MonitoringService {
  constructor() {
    this.monitoringInterval = null;
    this.isMonitoring = false;
    this.thresholds = {
      cpu: { warning: 70, critical: 90 },
      memory: { warning: 80, critical: 95 },
      disk: { warning: 85, critical: 95 },
      responseTime: { warning: 2000, critical: 5000 },
      errorRate: { warning: 5, critical: 10 }
    };
  }

  startMonitoring(intervalMinutes = 5) {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(async () => {
      await this.collectMetrics();
    }, intervalMinutes * 60 * 1000);

    // Collect initial metrics
    this.collectMetrics();

    SystemLog.logInfo('system', 'monitoring_started', 
      `System monitoring started with ${intervalMinutes} minute intervals`);
  }

  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;

    SystemLog.logInfo('system', 'monitoring_stopped', 'System monitoring stopped');
  }

  async collectMetrics() {
    try {
      const metrics = await this.gatherSystemMetrics();
      const healthRecord = new SystemHealth({
        metrics,
        status: this.determineOverallStatus(metrics)
      });

      // Check for alerts
      await this.checkAlerts(healthRecord, metrics);
      
      // Generate recommendations
      await this.generateRecommendations(healthRecord, metrics);

      await healthRecord.save();

      SystemLog.logInfo('system', 'metrics_collected', 
        `System metrics collected - Status: ${healthRecord.status}`, {
        metadata: {
          cpuUsage: metrics.cpu.usage,
          memoryUsage: metrics.memory.usage,
          diskUsage: metrics.disk.usage
        }
      });

    } catch (error) {
      SystemLog.logError('system', 'metrics_collection_failed', 
        `Failed to collect system metrics: ${error.message}`, {
        metadata: { error: error.message }
      });
    }
  }

  async gatherSystemMetrics() {
    const cpuUsage = await this.getCpuUsage();
    const memoryInfo = this.getMemoryInfo();
    const diskInfo = await this.getDiskInfo();
    const networkInfo = this.getNetworkInfo();
    const databaseInfo = await this.getDatabaseInfo();
    const applicationInfo = await this.getApplicationInfo();

    return {
      cpu: {
        usage: cpuUsage,
        load: os.loadavg()[0],
        temperature: 0 // Would need hardware monitoring for this
      },
      memory: memoryInfo,
      disk: diskInfo,
      network: networkInfo,
      database: databaseInfo,
      application: applicationInfo
    };
  }

  async getCpuUsage() {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;

    cpus.forEach(cpu => {
      for (const type in cpu.times) {
        totalTick += cpu.times[type];
      }
      totalIdle += cpu.times.idle;
    });

    const idle = totalIdle / cpus.length;
    const total = totalTick / cpus.length;
    const usage = 100 - (100 * idle / total);

    return Math.round(usage * 100) / 100;
  }

  getMemoryInfo() {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    const usage = (used / total) * 100;

    return {
      total,
      used,
      free,
      usage: Math.round(usage * 100) / 100
    };
  }

  async getDiskInfo() {
    // This is a simplified version - in production you'd use a library like 'diskusage'
    const total = 100 * 1024 * 1024 * 1024; // 100GB example
    const used = 60 * 1024 * 1024 * 1024; // 60GB example
    const free = total - used;
    const usage = (used / total) * 100;

    return {
      total,
      used,
      free,
      usage: Math.round(usage * 100) / 100
    };
  }

  getNetworkInfo() {
    // This is a simplified version - in production you'd track actual network stats
    return {
      bytesIn: 0,
      bytesOut: 0,
      packetsIn: 0,
      packetsOut: 0,
      errors: 0
    };
  }

  async getDatabaseInfo() {
    try {
      const db = mongoose.connection.db;
      const adminDb = db.admin();
      const serverStatus = await adminDb.serverStatus();

      return {
        connections: serverStatus.connections?.current || 0,
        activeConnections: serverStatus.connections?.active || 0,
        idleConnections: serverStatus.connections?.available || 0,
        queryTime: 0, // Would need to track query performance
        slowQueries: 0 // Would need to track slow queries
      };
    } catch (error) {
      return {
        connections: 0,
        activeConnections: 0,
        idleConnections: 0,
        queryTime: 0,
        slowQueries: 0
      };
    }
  }

  async getApplicationInfo() {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    // Get active users (simplified - would need session tracking)
    const activeUsers = await this.getActiveUsers();

    return {
      uptime,
      memoryUsage: memoryUsage.heapUsed,
      cpuUsage: 0, // Would need to track process CPU usage over time
      activeUsers,
      requestsPerMinute: 0, // Would need to track request rate
      averageResponseTime: 0, // Would need to track response times
      errorRate: 0 // Would need to track error rates
    };
  }

  async getActiveUsers() {
    // This is a simplified version - in production you'd track actual active sessions
    try {
      const activeSessions = await mongoose.connection.db
        .collection('sessions')
        .countDocuments({ 
          lastAccess: { $gte: new Date(Date.now() - 30 * 60 * 1000) } // Last 30 minutes
        });
      return activeSessions;
    } catch (error) {
      return 0;
    }
  }

  determineOverallStatus(metrics) {
    const { cpu, memory, disk } = metrics;

    if (cpu.usage > this.thresholds.cpu.critical || 
        memory.usage > this.thresholds.memory.critical || 
        disk.usage > this.thresholds.disk.critical) {
      return 'critical';
    }

    if (cpu.usage > this.thresholds.cpu.warning || 
        memory.usage > this.thresholds.memory.warning || 
        disk.usage > this.thresholds.disk.warning) {
      return 'warning';
    }

    return 'healthy';
  }

  async checkAlerts(healthRecord, metrics) {
    const { cpu, memory, disk, application } = metrics;

    // CPU alerts
    if (cpu.usage > this.thresholds.cpu.critical) {
      await healthRecord.addAlert('cpu', 'critical', 
        `CPU usage is critically high: ${cpu.usage}%`, 
        this.thresholds.cpu.critical, cpu.usage);
    } else if (cpu.usage > this.thresholds.cpu.warning) {
      await healthRecord.addAlert('cpu', 'warning', 
        `CPU usage is high: ${cpu.usage}%`, 
        this.thresholds.cpu.warning, cpu.usage);
    }

    // Memory alerts
    if (memory.usage > this.thresholds.memory.critical) {
      await healthRecord.addAlert('memory', 'critical', 
        `Memory usage is critically high: ${memory.usage}%`, 
        this.thresholds.memory.critical, memory.usage);
    } else if (memory.usage > this.thresholds.memory.warning) {
      await healthRecord.addAlert('memory', 'warning', 
        `Memory usage is high: ${memory.usage}%`, 
        this.thresholds.memory.warning, memory.usage);
    }

    // Disk alerts
    if (disk.usage > this.thresholds.disk.critical) {
      await healthRecord.addAlert('disk', 'critical', 
        `Disk usage is critically high: ${disk.usage}%`, 
        this.thresholds.disk.critical, disk.usage);
    } else if (disk.usage > this.thresholds.disk.warning) {
      await healthRecord.addAlert('disk', 'warning', 
        `Disk usage is high: ${disk.usage}%`, 
        this.thresholds.disk.warning, disk.usage);
    }

    // Application alerts
    if (application.averageResponseTime > this.thresholds.responseTime.critical) {
      await healthRecord.addAlert('application', 'critical', 
        `Response time is critically slow: ${application.averageResponseTime}ms`, 
        this.thresholds.responseTime.critical, application.averageResponseTime);
    } else if (application.averageResponseTime > this.thresholds.responseTime.warning) {
      await healthRecord.addAlert('application', 'warning', 
        `Response time is slow: ${application.averageResponseTime}ms`, 
        this.thresholds.responseTime.warning, application.averageResponseTime);
    }

    if (application.errorRate > this.thresholds.errorRate.critical) {
      await healthRecord.addAlert('application', 'critical', 
        `Error rate is critically high: ${application.errorRate}%`, 
        this.thresholds.errorRate.critical, application.errorRate);
    } else if (application.errorRate > this.thresholds.errorRate.warning) {
      await healthRecord.addAlert('application', 'warning', 
        `Error rate is high: ${application.errorRate}%`, 
        this.thresholds.errorRate.warning, application.errorRate);
    }
  }

  async generateRecommendations(healthRecord, metrics) {
    const { cpu, memory, disk, application } = metrics;
    const recommendations = [];

    // CPU recommendations
    if (cpu.usage > 80) {
      recommendations.push({
        type: 'optimization',
        priority: cpu.usage > 90 ? 'critical' : 'high',
        title: 'High CPU Usage',
        description: `CPU usage is at ${cpu.usage}%. Consider optimizing database queries, implementing caching, or scaling the application.`,
        action: 'Review and optimize database queries, implement Redis caching, consider horizontal scaling',
        estimatedImpact: 'High - Will improve application performance and reduce response times'
      });
    }

    // Memory recommendations
    if (memory.usage > 80) {
      recommendations.push({
        type: 'optimization',
        priority: memory.usage > 90 ? 'critical' : 'high',
        title: 'High Memory Usage',
        description: `Memory usage is at ${memory.usage}%. Consider implementing memory optimization strategies.`,
        action: 'Implement memory pooling, optimize data structures, consider increasing server memory',
        estimatedImpact: 'High - Will prevent memory-related crashes and improve stability'
      });
    }

    // Disk recommendations
    if (disk.usage > 80) {
      recommendations.push({
        type: 'maintenance',
        priority: disk.usage > 90 ? 'critical' : 'high',
        title: 'High Disk Usage',
        description: `Disk usage is at ${disk.usage}%. Consider cleaning up old files and implementing log rotation.`,
        action: 'Implement log rotation, clean up old backups, consider increasing disk space',
        estimatedImpact: 'Medium - Will prevent disk space issues and improve system reliability'
      });
    }

    // Performance recommendations
    if (application.averageResponseTime > 2000) {
      recommendations.push({
        type: 'optimization',
        priority: 'high',
        title: 'Slow Response Times',
        description: `Average response time is ${application.averageResponseTime}ms. Consider performance optimizations.`,
        action: 'Implement database indexing, optimize API endpoints, consider CDN for static assets',
        estimatedImpact: 'High - Will significantly improve user experience'
      });
    }

    // Security recommendations
    recommendations.push({
      type: 'security',
      priority: 'medium',
      title: 'Regular Security Updates',
      description: 'Ensure all dependencies and system packages are up to date.',
      action: 'Schedule regular security updates, implement automated vulnerability scanning',
      estimatedImpact: 'High - Will protect against security vulnerabilities'
    });

    healthRecord.recommendations = recommendations;
  }

  async getSystemHealth() {
    const latestHealth = await SystemHealth.getLatestHealth();
    const healthHistory = await SystemHealth.getHealthHistory(24);
    const healthStats = await SystemHealth.getHealthStats(7);
    const activeAlerts = await SystemHealth.getActiveAlerts();

    return {
      current: latestHealth,
      history: healthHistory,
      stats: healthStats,
      alerts: activeAlerts
    };
  }

  async getServiceStatus() {
    const latestHealth = await SystemHealth.getLatestHealth();
    if (!latestHealth) {
      return { status: 'unknown', services: [] };
    }

    return {
      status: latestHealth.status,
      services: latestHealth.services,
      checks: latestHealth.checks
    };
  }

  async updateServiceStatus(serviceName, status, responseTime = null, error = null) {
    const latestHealth = await SystemHealth.getLatestHealth();
    if (latestHealth) {
      await latestHealth.updateServiceStatus(serviceName, status, responseTime, error);
    }
  }

  setThresholds(newThresholds) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  getThresholds() {
    return this.thresholds;
  }

  isMonitoringActive() {
    return this.isMonitoring;
  }
}

module.exports = new MonitoringService();
