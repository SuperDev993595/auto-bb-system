const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const Reminder = require('../models/Reminder');
const Customer = require('../models/Customer');
const Appointment = require('../models/Appointment');

// Validation schemas
const reminderSchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().allow('', null),
  type: Joi.string().valid('appointment', 'service_due', 'follow_up', 'payment', 'custom').required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  dueDate: Joi.date().required(),
  reminderDate: Joi.date().required(),
  frequency: Joi.string().valid('once', 'daily', 'weekly', 'monthly', 'yearly').default('once'),
  customerId: Joi.string().allow(null),
  appointmentId: Joi.string().allow(null),
  assignedTo: Joi.string().allow(null),
  status: Joi.string().valid('pending', 'sent', 'acknowledged', 'completed', 'cancelled').default('pending'),
  notificationMethods: Joi.array().items(Joi.string().valid('email', 'sms', 'push', 'in_app')).min(1).required(),
  notes: Joi.string().allow('', null)
});

// Get all reminders with pagination and filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, priority, assignedTo, startDate, endDate, search } = req.query;
    
    const filter = {};
    
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (priority) filter.priority = priority;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (startDate || endDate) {
      filter.dueDate = {};
      if (startDate) filter.dueDate.$gte = new Date(startDate);
      if (endDate) filter.dueDate.$lte = new Date(endDate);
    }
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const totalDocs = await Reminder.countDocuments(filter);
    const totalPages = Math.ceil(totalDocs / limitNum);

    // Get reminders with pagination
    const reminders = await Reminder.find(filter)
      .populate('customer', 'name email phone')
      .populate('appointment', 'date time service')
      .populate('assignedTo', 'name email')
      .sort({ dueDate: 1 })
      .skip(skip)
      .limit(limitNum);
    
    res.json({
      success: true,
      data: reminders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalDocs: totalDocs,
        totalPages: totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reminders' });
  }
});

// Get single reminder by ID
router.get('/view/:id', authenticateToken, async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id)
      .populate('customer', 'name email phone address')
      .populate('appointment', 'date time service notes')
      .populate('assignedTo', 'name email');

    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    res.json({ success: true, data: reminder });
  } catch (error) {
    console.error('Error fetching reminder:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reminder' });
  }
});

// Create new reminder
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { error, value } = reminderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    // Check if customer exists (if provided)
    if (value.customerId) {
      const customer = await Customer.findById(value.customerId);
      if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
      }
    }

    // Check if appointment exists (if provided)
    if (value.appointmentId) {
      const appointment = await Appointment.findById(value.appointmentId);
      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }
    }

    // Map customerId to customer field for database
    const reminderData = { ...value };
    if (reminderData.customerId) {
      reminderData.customer = reminderData.customerId;
      delete reminderData.customerId;
    }

    const reminder = new Reminder({
      ...reminderData,
      createdBy: req.user.id
    });

    await reminder.save();
    await reminder.populate('customer', 'name email phone');

    res.status(201).json({ success: true, data: reminder });
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ success: false, message: 'Failed to create reminder' });
  }
});

// Update reminder
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { error, value } = reminderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    // Check if customer exists (if provided)
    if (value.customerId) {
      const customer = await Customer.findById(value.customerId);
      if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
      }
    }

    // Check if appointment exists (if provided)
    if (value.appointmentId) {
      const appointment = await Appointment.findById(value.appointmentId);
      if (!appointment) {
        return res.status(404).json({ success: false, message: 'Appointment not found' });
      }
    }

    // Map customerId to customer field for database
    const updateData = { ...value };
    if (updateData.customerId) {
      updateData.customer = updateData.customerId;
      delete updateData.customerId;
    }

    Object.assign(reminder, updateData);
    reminder.updatedBy = req.user.id;
    reminder.updatedAt = Date.now();

    await reminder.save();
    await reminder.populate('customer', 'name email phone');

    res.json({ success: true, data: reminder });
  } catch (error) {
    console.error('Error updating reminder:', error);
    res.status(500).json({ success: false, message: 'Failed to update reminder' });
  }
});

// Delete reminder
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    await Reminder.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error('Error deleting reminder:', error);
    res.status(500).json({ success: false, message: 'Failed to delete reminder' });
  }
});

// Mark reminder as sent
router.post('/:id/mark-sent', authenticateToken, async (req, res) => {
  try {
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    reminder.markAsSent();
    await reminder.save();
    await reminder.populate('customer', 'name email phone');

    res.json({ success: true, data: reminder });
  } catch (error) {
    console.error('Error marking reminder as sent:', error);
    res.status(500).json({ success: false, message: 'Failed to mark reminder as sent' });
  }
});

// Acknowledge reminder
router.post('/:id/acknowledge', authenticateToken, async (req, res) => {
  try {
    const { notes } = req.body;
    
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    reminder.acknowledge(req.user.id, notes);
    await reminder.save();
    await reminder.populate('customer', 'name email phone');

    res.json({ success: true, data: reminder });
  } catch (error) {
    console.error('Error acknowledging reminder:', error);
    res.status(500).json({ success: false, message: 'Failed to acknowledge reminder' });
  }
});

// Complete reminder
router.post('/:id/complete', authenticateToken, async (req, res) => {
  try {
    const { notes } = req.body;
    
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    reminder.complete(req.user.id, notes);
    await reminder.save();
    await reminder.populate('customer', 'name email phone');

    res.json({ success: true, data: reminder });
  } catch (error) {
    console.error('Error completing reminder:', error);
    res.status(500).json({ success: false, message: 'Failed to complete reminder' });
  }
});

// Cancel reminder
router.post('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const reminder = await Reminder.findById(req.params.id);
    if (!reminder) {
      return res.status(404).json({ success: false, message: 'Reminder not found' });
    }

    reminder.cancel(req.user.id, reason);
    await reminder.save();
    await reminder.populate('customer', 'name email phone');

    res.json({ success: true, data: reminder });
  } catch (error) {
    console.error('Error cancelling reminder:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel reminder' });
  }
});

// Get upcoming reminders
router.get('/upcoming/list', authenticateToken, async (req, res) => {
  try {
    const { days = 7, assignedTo } = req.query;
    
    const filter = {
      status: { $in: ['pending', 'sent'] },
      dueDate: { 
        $gte: new Date(),
        $lte: new Date(Date.now() + parseInt(days) * 24 * 60 * 60 * 1000)
      }
    };

    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    const reminders = await Reminder.find(filter)
      .populate('customer', 'name email phone')
      .populate('appointment', 'date time service')
      .populate('assignedTo', 'name email')
      .sort({ dueDate: 1 })
      .limit(50);

    res.json({ success: true, data: reminders });
  } catch (error) {
    console.error('Error fetching upcoming reminders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch upcoming reminders' });
  }
});

// Get overdue reminders
router.get('/overdue/list', authenticateToken, async (req, res) => {
  try {
    const { assignedTo } = req.query;
    
    const filter = {
      status: { $in: ['pending', 'sent'] },
      dueDate: { $lt: new Date() }
    };

    if (assignedTo) {
      filter.assignedTo = assignedTo;
    }

    const reminders = await Reminder.find(filter)
      .populate('customer', 'name email phone')
      .populate('appointment', 'date time service')
      .populate('assignedTo', 'name email')
      .sort({ dueDate: 1 })
      .limit(50);

    res.json({ success: true, data: reminders });
  } catch (error) {
    console.error('Error fetching overdue reminders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch overdue reminders' });
  }
});

// Get reminder statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const stats = await Reminder.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalReminders: { $sum: 1 },
          pendingCount: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          sentCount: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
          completedCount: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          cancelledCount: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } }
        }
      }
    ]);

    const typeStats = await Reminder.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          completedCount: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
        }
      }
    ]);

    const priorityStats = await Reminder.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
          overdueCount: { 
            $sum: { 
              $cond: [
                { $and: [
                  { $lt: ['$dueDate', new Date()] },
                  { $in: ['$status', ['pending', 'sent']] }
                ]}, 
                1, 
                0 
              ] 
            } 
          }
        }
      }
    ]);

    const monthlyStats = await Reminder.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          completedCount: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalReminders: 0,
          pendingCount: 0,
          sentCount: 0,
          completedCount: 0,
          cancelledCount: 0
        },
        byType: typeStats,
        byPriority: priorityStats,
        monthly: monthlyStats
      }
    });
  } catch (error) {
    console.error('Error fetching reminder stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reminder statistics' });
  }
});

// Get notification settings
router.get('/notification-settings', authenticateToken, async (req, res) => {
  try {
    // Get notification settings from database or return defaults
    const settings = {
      email: {
        enabled: true,
        templates: {
          appointment: {
            subject: 'Appointment Reminder',
            body: 'Dear {{customerName}}, this is a reminder for your appointment on {{date}} at {{time}}.'
          },
          service_due: {
            subject: 'Service Due Reminder',
            body: 'Dear {{customerName}}, your vehicle is due for service. Please schedule an appointment.'
          },
          follow_up: {
            subject: 'Follow-up Reminder',
            body: 'Dear {{customerName}}, this is a follow-up reminder for {{description}}.'
          },
          payment: {
            subject: 'Payment Reminder',
            body: 'Dear {{customerName}}, please note that payment is due for invoice #{{invoiceNumber}}.'
          }
        }
      },
      sms: {
        enabled: false,
        templates: {
          appointment: 'Reminder: Your appointment is scheduled for {{date}} at {{time}}.',
          service_due: 'Your vehicle is due for service. Please call us to schedule.',
          follow_up: 'Follow-up reminder: {{description}}',
          payment: 'Payment reminder: Invoice #{{invoiceNumber}} is due.'
        }
      },
      push: {
        enabled: true,
        templates: {
          appointment: 'Appointment reminder: {{date}} at {{time}}',
          service_due: 'Service due reminder',
          follow_up: 'Follow-up: {{description}}',
          payment: 'Payment due: Invoice #{{invoiceNumber}}'
        }
      },
      in_app: {
        enabled: true,
        templates: {
          appointment: 'Appointment reminder for {{date}}',
          service_due: 'Service due reminder',
          follow_up: 'Follow-up reminder',
          payment: 'Payment reminder'
        }
      },
      timing: {
        appointment: {
          advance_notice: 24, // hours
          frequency: 'once'
        },
        service_due: {
          advance_notice: 168, // 1 week
          frequency: 'weekly'
        },
        follow_up: {
          advance_notice: 72, // 3 days
          frequency: 'once'
        },
        payment: {
          advance_notice: 24, // 1 day
          frequency: 'daily'
        }
      },
      business_hours: {
        start: '08:00',
        end: '18:00',
        timezone: 'America/New_York',
        send_outside_hours: false
      }
    };

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notification settings' });
  }
});

// Update notification settings
router.put('/notification-settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      email,
      sms,
      push,
      in_app,
      timing,
      business_hours
    } = req.body;

    // Validate the settings structure
    const settingsSchema = Joi.object({
      email: Joi.object({
        enabled: Joi.boolean(),
        templates: Joi.object({
          appointment: Joi.object({
            subject: Joi.string(),
            body: Joi.string()
          }),
          service_due: Joi.object({
            subject: Joi.string(),
            body: Joi.string()
          }),
          follow_up: Joi.object({
            subject: Joi.string(),
            body: Joi.string()
          }),
          payment: Joi.object({
            subject: Joi.string(),
            body: Joi.string()
          })
        })
      }),
      sms: Joi.object({
        enabled: Joi.boolean(),
        templates: Joi.object({
          appointment: Joi.string(),
          service_due: Joi.string(),
          follow_up: Joi.string(),
          payment: Joi.string()
        })
      }),
      push: Joi.object({
        enabled: Joi.boolean(),
        templates: Joi.object({
          appointment: Joi.string(),
          service_due: Joi.string(),
          follow_up: Joi.string(),
          payment: Joi.string()
        })
      }),
      in_app: Joi.object({
        enabled: Joi.boolean(),
        templates: Joi.object({
          appointment: Joi.string(),
          service_due: Joi.string(),
          follow_up: Joi.string(),
          payment: Joi.string()
        })
      }),
      timing: Joi.object({
        appointment: Joi.object({
          advance_notice: Joi.number(),
          frequency: Joi.string().valid('once', 'daily', 'weekly', 'monthly')
        }),
        service_due: Joi.object({
          advance_notice: Joi.number(),
          frequency: Joi.string().valid('once', 'daily', 'weekly', 'monthly')
        }),
        follow_up: Joi.object({
          advance_notice: Joi.number(),
          frequency: Joi.string().valid('once', 'daily', 'weekly', 'monthly')
        }),
        payment: Joi.object({
          advance_notice: Joi.number(),
          frequency: Joi.string().valid('once', 'daily', 'weekly', 'monthly')
        })
      }),
      business_hours: Joi.object({
        start: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        end: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
        timezone: Joi.string(),
        send_outside_hours: Joi.boolean()
      })
    });

    const { error } = settingsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    // Here you would typically save the settings to a database
    // For now, we'll just return the updated settings
    const updatedSettings = {
      email: email || {},
      sms: sms || {},
      push: push || {},
      in_app: in_app || {},
      timing: timing || {},
      business_hours: business_hours || {}
    };

    res.json({ success: true, data: updatedSettings, message: 'Notification settings updated successfully' });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ success: false, message: 'Failed to update notification settings' });
  }
});

// Test notification settings
router.post('/notification-settings/test', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { method, template, customerId } = req.body;

    if (!method || !template) {
      return res.status(400).json({ success: false, message: 'Method and template are required' });
    }

    // Validate method
    const validMethods = ['email', 'sms', 'push', 'in_app'];
    if (!validMethods.includes(method)) {
      return res.status(400).json({ success: false, message: 'Invalid notification method' });
    }

    // Validate template
    const validTemplates = ['appointment', 'service_due', 'follow_up', 'payment'];
    if (!validTemplates.includes(template)) {
      return res.status(400).json({ success: false, message: 'Invalid template type' });
    }

    // Here you would typically send a test notification
    // For now, we'll just return a success response
    res.json({ 
      success: true, 
      message: `Test ${method} notification sent successfully using ${template} template`,
      data: {
        method,
        template,
        sent_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error testing notification settings:', error);
    res.status(500).json({ success: false, message: 'Failed to test notification settings' });
  }
});

// Bulk create reminders (for recurring reminders)
router.post('/bulk', authenticateToken, async (req, res) => {
  try {
    const { reminders } = req.body;
    
    if (!Array.isArray(reminders) || reminders.length === 0) {
      return res.status(400).json({ success: false, message: 'Reminders array is required' });
    }

    const createdReminders = [];
    const errors = [];

    for (let i = 0; i < reminders.length; i++) {
      try {
        const { error, value } = reminderSchema.validate(reminders[i]);
        if (error) {
          errors.push({ index: i, error: error.details[0].message });
          continue;
        }

        // Check if customer exists (if provided)
        if (value.customerId) {
          const customer = await Customer.findById(value.customerId);
          if (!customer) {
            errors.push({ index: i, error: 'Customer not found' });
            continue;
          }
        }

        const reminder = new Reminder({
          ...value,
          createdBy: req.user.id
        });

        await reminder.save();
        await reminder.populate('customer', 'name email phone');
        createdReminders.push(reminder);
      } catch (error) {
        errors.push({ index: i, error: error.message });
      }
    }

    res.status(201).json({
      success: true,
      data: createdReminders,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error creating bulk reminders:', error);
    res.status(500).json({ success: false, message: 'Failed to create bulk reminders' });
  }
});

module.exports = router;
