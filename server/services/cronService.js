const cron = require('node-cron');
const automatedRemindersService = require('./automatedRemindersService');
const Task = require('../models/Task');

class CronService {
  constructor() {
    this.jobs = [];
  }

  /**
   * Start all cron jobs
   */
  start() {
    console.log('Starting cron jobs...');
    
    // Process automated reminders every 15 minutes
    this.jobs.push(
      cron.schedule('*/15 * * * *', async () => {
        try {
          console.log('Running automated reminders job...');
          await automatedRemindersService.processPendingReminders();
        } catch (error) {
          console.error('Automated reminders job failed:', error);
        }
      })
    );

    // Check for escalation rules every hour
    this.jobs.push(
      cron.schedule('0 * * * *', async () => {
        try {
          console.log('Running escalation check job...');
          await this.checkEscalations();
        } catch (error) {
          console.error('Escalation check job failed:', error);
        }
      })
    );

    // Daily cleanup and maintenance at 2 AM
    this.jobs.push(
      cron.schedule('0 2 * * *', async () => {
        try {
          console.log('Running daily maintenance job...');
          await this.dailyMaintenance();
        } catch (error) {
          console.error('Daily maintenance job failed:', error);
        }
      })
    );

    // Weekly performance report generation on Sundays at 6 AM
    this.jobs.push(
      cron.schedule('0 6 * * 0', async () => {
        try {
          console.log('Running weekly performance report job...');
          await this.generateWeeklyReport();
        } catch (error) {
          console.error('Weekly performance report job failed:', error);
        }
      })
    );

    console.log(`Started ${this.jobs.length} cron jobs`);
  }

  /**
   * Stop all cron jobs
   */
  stop() {
    console.log('Stopping cron jobs...');
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
    console.log('All cron jobs stopped');
  }

  /**
   * Check for tasks that need escalation
   */
  async checkEscalations() {
    try {
      const overdueTasks = await Task.find({
        type: 'collections',
        status: { $ne: 'completed' },
        dueDate: { $lt: new Date() },
        autoEscalate: true
      }).populate('assignedTo', 'name email')
        .populate('assignedBy', 'name email');

      console.log(`Found ${overdueTasks.length} overdue tasks to check for escalation`);

      for (const task of overdueTasks) {
        try {
          const escalated = await task.checkEscalation(task.assignedBy?._id || task.assignedTo?._id);
          if (escalated) {
            console.log(`Task ${task._id} escalated automatically`);
          }
        } catch (error) {
          console.error(`Error checking escalation for task ${task._id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error in escalation check job:', error);
    }
  }

  /**
   * Daily maintenance tasks
   */
  async dailyMaintenance() {
    try {
      // Update document statuses (check for expired documents)
      const expiredDocuments = await Task.updateMany(
        {
          'legalDocuments.expiresAt': { $lt: new Date() },
          'legalDocuments.status': 'active'
        },
        {
          $set: { 'legalDocuments.$.status': 'expired' }
        }
      );

      console.log(`Updated ${expiredDocuments.modifiedCount} expired documents`);

      // Clean up old audit trail entries (keep last 1000 entries per task)
      const tasksWithLongAuditTrails = await Task.find({
        $expr: { $gt: [{ $size: '$auditTrail' }, 1000] }
      });

      for (const task of tasksWithLongAuditTrails) {
        if (task.auditTrail.length > 1000) {
          task.auditTrail = task.auditTrail.slice(-1000);
          await task.save();
        }
      }

      console.log(`Cleaned up audit trails for ${tasksWithLongAuditTrails.length} tasks`);

      // Archive completed tasks older than 1 year
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      const archivedTasks = await Task.updateMany(
        {
          type: 'collections',
          status: 'completed',
          completedDate: { $lt: oneYearAgo }
        },
        {
          $set: { archived: true, archivedAt: new Date() }
        }
      );

      console.log(`Archived ${archivedTasks.modifiedCount} old completed tasks`);

    } catch (error) {
      console.error('Error in daily maintenance job:', error);
    }
  }

  /**
   * Generate weekly performance report
   */
  async generateWeeklyReport() {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const weeklyStats = await Task.aggregate([
        {
          $match: {
            type: 'collections',
            createdAt: { $gte: oneWeekAgo }
          }
        },
        {
          $group: {
            _id: null,
            newTasks: { $sum: 1 },
            newAmount: { $sum: '$amount' },
            completedTasks: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            completedAmount: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] }
            },
            overdueTasks: {
              $sum: { $cond: [{ $and: [{ $lt: ['$dueDate', new Date()] }, { $ne: ['$status', 'completed'] }] }, 1, 0] }
            },
            overdueAmount: {
              $sum: { $cond: [{ $and: [{ $lt: ['$dueDate', new Date()] }, { $ne: ['$status', 'completed'] }] }, '$amount', 0] }
            }
          }
        }
      ]);

      const stats = weeklyStats[0] || {
        newTasks: 0,
        newAmount: 0,
        completedTasks: 0,
        completedAmount: 0,
        overdueTasks: 0,
        overdueAmount: 0
      };

      console.log('Weekly Collections Performance Report:');
      console.log(`New Tasks: ${stats.newTasks} ($${stats.newAmount})`);
      console.log(`Completed Tasks: ${stats.completedTasks} ($${stats.completedAmount})`);
      console.log(`Overdue Tasks: ${stats.overdueTasks} ($${stats.overdueAmount})`);

      // TODO: Send report to managers via email
      // This would integrate with the email service

    } catch (error) {
      console.error('Error generating weekly report:', error);
    }
  }

  /**
   * Get status of all cron jobs
   */
  getStatus() {
    return {
      active: this.jobs.length > 0,
      jobCount: this.jobs.length,
      jobs: this.jobs.map((job, index) => ({
        id: index,
        running: job.running
      }))
    };
  }
}

module.exports = new CronService();
