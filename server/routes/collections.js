const express = require('express');
const Joi = require('joi');
const Task = require('../models/Task');
const Customer = require('../models/Customer');
const Invoice = require('../models/Invoice');
const { requireAdmin } = require('../middleware/auth');
const automatedRemindersService = require('../services/automatedRemindersService');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Validation schemas
const collectionsTaskSchema = Joi.object({
  customer: Joi.string().required(),
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(1000).optional(),
  collectionsType: Joi.string().valid('payment_reminder', 'overdue_notice', 'payment_plan', 'negotiation', 'legal_action', 'other').required(),
  amount: Joi.number().min(0).required(),
  dueDate: Joi.date().required(),
  assignedTo: Joi.string().required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  paymentTerms: Joi.string().max(200).optional(),
  invoice: Joi.string().optional(),
  riskLevel: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
  escalationLevel: Joi.number().min(1).max(5).default(1),
  paymentPlan: Joi.object({
    totalAmount: Joi.number().min(0).required(),
    installmentAmount: Joi.number().min(0).required(),
    numberOfInstallments: Joi.number().min(1).required(),
    installmentFrequency: Joi.string().valid('weekly', 'bi-weekly', 'monthly', 'quarterly').default('monthly'),
    nextPaymentDate: Joi.date().required()
  }).optional()
});

const communicationSchema = Joi.object({
  method: Joi.string().valid('phone', 'email', 'sms', 'in_person', 'letter').required(),
  direction: Joi.string().valid('inbound', 'outbound').required(),
  summary: Joi.string().max(500).required(),
  outcome: Joi.string().valid('no_answer', 'left_message', 'spoke_to_customer', 'payment_promised', 'payment_made', 'refused', 'other').required(),
  nextAction: Joi.string().max(200).optional(),
  nextActionDate: Joi.date().optional()
});

const paymentPlanUpdateSchema = Joi.object({
  paymentAmount: Joi.number().min(0.01).required()
});

const reminderSchema = Joi.object({
  type: Joi.string().valid('email', 'sms', 'letter', 'phone').required(),
  scheduledDate: Joi.date().required(),
  template: Joi.string().default('default'),
  recipient: Joi.string().valid('customer', 'assigned_user', 'manager').default('customer')
});

const documentUploadSchema = Joi.object({
  documentType: Joi.string().valid('payment_agreement', 'demand_letter', 'legal_notice', 'court_filing', 'other').required(),
  description: Joi.string().max(500).optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  expiresAt: Joi.date().optional()
});

// @route   GET /api/collections
// @desc    Get all collections tasks
// @access  Private
router.get('/', requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      customer,
      assignedTo,
      collectionsType,
      status,
      riskLevel,
      search,
      sortBy = 'dueDate',
      sortOrder = 'asc'
    } = req.query;

    // Build query
    const query = { type: 'collections' };

    // Filter by assigned user (Sub Admins can only see their own tasks)
    if (req.user.role === 'sub_admin') {
      query.assignedTo = req.user.id;
    } else if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    if (customer) query.customer = customer;
    if (collectionsType) query.collectionsType = collectionsType;
    if (status) query.status = status;
    if (riskLevel) query.riskLevel = riskLevel;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const collectionsTasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('customer', 'businessName contactPerson.name')
      .populate('invoice', 'invoiceNumber total')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count
    const total = await Task.countDocuments(query);

    res.json({
      success: true,
      data: {
        collectionsTasks,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalTasks: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get collections tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/collections
// @desc    Create new collections task
// @access  Private
router.post('/', requireAdmin, async (req, res) => {
  try {
    // Validate input
    const { error, value } = collectionsTaskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Check if customer exists
    const customer = await Customer.findById(value.customer);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if invoice exists if provided
    if (value.invoice) {
      const invoice = await Invoice.findById(value.invoice);
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found'
        });
      }
    }

    // Create collections task
    const collectionsTask = new Task({
      ...value,
      type: 'collections',
      assignedBy: req.user.id
    });

    await collectionsTask.save();

    // Add audit trail entry
    await collectionsTask.addAuditEntry(
      'task_created',
      'Collections task created',
      req.user.id
    );

    // Populate references
    await collectionsTask.populate('assignedTo', 'name email');
    await collectionsTask.populate('customer', 'businessName contactPerson.name');
    if (collectionsTask.invoice) {
      await collectionsTask.populate('invoice', 'invoiceNumber total');
    }

    res.status(201).json({
      success: true,
      message: 'Collections task created successfully',
      data: { collectionsTask }
    });

  } catch (error) {
    console.error('Create collections task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/collections/:id
// @desc    Update collections task
// @access  Private
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Find the task
    const task = await Task.findById(id);
    if (!task || task.type !== 'collections') {
      return res.status(404).json({
        success: false,
        message: 'Collections task not found'
      });
    }

    // Store previous values for audit trail
    const previousValues = {};
    Object.keys(updateData).forEach(key => {
      if (task[key] !== undefined) {
        previousValues[key] = task[key];
      }
    });

    // Update the task
    Object.assign(task, updateData);
    await task.save();

    // Add audit trail entry
    await task.addAuditEntry(
      'task_updated',
      'Collections task updated',
      req.user.id,
      previousValues,
      updateData
    );

    // Populate references
    await task.populate('assignedTo', 'name email');
    await task.populate('customer', 'businessName contactPerson.name');
    if (task.invoice) {
      await task.populate('invoice', 'invoiceNumber total');
    }

    res.json({
      success: true,
      message: 'Collections task updated successfully',
      data: { collectionsTask: task }
    });

  } catch (error) {
    console.error('Update collections task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/collections/:id/communication
// @desc    Add communication record to collections task
// @access  Private
router.post('/:id/communication', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = communicationSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const task = await Task.findById(id);
    if (!task || task.type !== 'collections') {
      return res.status(404).json({
        success: false,
        message: 'Collections task not found'
      });
    }

    // Add communication record
    await task.addCommunication(value, req.user.id);

    // Update next contact date if provided
    if (value.nextActionDate) {
      task.nextContactDate = value.nextActionDate;
      await task.save();
    }

    res.json({
      success: true,
      message: 'Communication record added successfully',
      data: { communication: value }
    });

  } catch (error) {
    console.error('Add communication error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/collections/:id/payment
// @desc    Record payment for collections task
// @access  Private
router.post('/:id/payment', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = paymentPlanUpdateSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const task = await Task.findById(id);
    if (!task || task.type !== 'collections') {
      return res.status(404).json({
        success: false,
        message: 'Collections task not found'
      });
    }

    if (!task.paymentPlan) {
      return res.status(400).json({
        success: false,
        message: 'No payment plan found for this task'
      });
    }

    // Update payment plan
    await task.updatePaymentPlan(value.paymentAmount, req.user.id);

    res.json({
      success: true,
      message: 'Payment recorded successfully',
      data: { 
        paymentAmount: value.paymentAmount,
        totalPaid: task.paymentPlan.totalPaid,
        nextPaymentDate: task.paymentPlan.nextPaymentDate
      }
    });

  } catch (error) {
    console.error('Record payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/collections/overdue
// @desc    Get overdue collections
// @access  Private
router.get('/overdue', requireAdmin, async (req, res) => {
  try {
    const query = {
      type: 'collections',
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' }
    };

    // Filter by assigned user
    if (req.user.role === 'sub_admin') {
      query.assignedTo = req.user.id;
    }

    const overdueCollections = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('customer', 'businessName contactPerson.name')
      .populate('invoice', 'invoiceNumber total')
      .sort({ dueDate: 1 });

    // Calculate total overdue amount
    const totalOverdue = overdueCollections.reduce((sum, task) => sum + (task.amount || 0), 0);

    res.json({
      success: true,
      data: {
        overdueCollections,
        totalOverdue,
        count: overdueCollections.length
      }
    });

  } catch (error) {
    console.error('Get overdue collections error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/collections/stats
// @desc    Get collections statistics
// @access  Private
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate, assignedTo } = req.query;

    const query = { type: 'collections' };

    // Filter by assigned user
    if (req.user.role === 'sub_admin') {
      query.assignedTo = req.user.id;
    } else if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    // Date range filter
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get collections by type
    const collectionsTypeStats = await Task.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$collectionsType',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get collections by risk level
    const riskLevelStats = await Task.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$riskLevel',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          completed: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          }
        }
      }
    ]);

    // Get overall stats
    const overallStats = await Task.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          completedAmount: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] }
          },
          overdueTasks: {
            $sum: { $cond: [{ $and: [{ $lt: ['$dueDate', new Date()] }, { $ne: ['$status', 'completed'] }] }, 1, 0] }
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        collectionsTypeStats,
        riskLevelStats,
        overallStats: overallStats[0] || {
          totalTasks: 0,
          totalAmount: 0,
          completedTasks: 0,
          completedAmount: 0,
          overdueTasks: 0
        }
      }
    });

  } catch (error) {
    console.error('Get collections stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/collections/customer/:customerId
// @desc    Get collections tasks for a specific customer
// @access  Private
router.get('/customer/:customerId', requireAdmin, async (req, res) => {
  try {
    const { customerId } = req.params;

    const collectionsTasks = await Task.find({
      type: 'collections',
      customer: customerId
    })
      .populate('assignedTo', 'name email')
      .populate('invoice', 'invoiceNumber total')
      .sort({ createdAt: -1 });

    const totalOutstanding = collectionsTasks
      .filter(task => task.status !== 'completed')
      .reduce((sum, task) => sum + (task.amount || 0), 0);

    res.json({
      success: true,
      data: {
        collectionsTasks,
        totalOutstanding,
        count: collectionsTasks.length
      }
    });

  } catch (error) {
    console.error('Get customer collections error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/collections/risk-level/:level
// @desc    Get collections tasks by risk level
// @access  Private
router.get('/risk-level/:level', requireAdmin, async (req, res) => {
  try {
    const { level } = req.params;
    const query = { type: 'collections', riskLevel: level };

    // Filter by assigned user
    if (req.user.role === 'sub_admin') {
      query.assignedTo = req.user.id;
    }

    const collectionsTasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('customer', 'businessName contactPerson.name')
      .populate('invoice', 'invoiceNumber total')
      .sort({ priority: -1, dueDate: 1 });

    res.json({
      success: true,
      data: {
        collectionsTasks,
        count: collectionsTasks.length
      }
    });

  } catch (error) {
    console.error('Get collections by risk level error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/collections/:id/reminders
// @desc    Schedule a reminder for a collections task
// @access  Private
router.post('/:id/reminders', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = reminderSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const result = await automatedRemindersService.scheduleReminder(id, value);
    
    res.json({
      success: true,
      message: 'Reminder scheduled successfully',
      data: { reminder: result.task.automatedReminders[result.task.automatedReminders.length - 1] }
    });

  } catch (error) {
    console.error('Schedule reminder error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @route   GET /api/collections/:id/reminders
// @desc    Get all reminders for a collections task
// @access  Private
router.get('/:id/reminders', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const reminders = await automatedRemindersService.getTaskReminders(id);
    
    res.json({
      success: true,
      data: { reminders }
    });

  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @route   DELETE /api/collections/:id/reminders/:reminderId
// @desc    Cancel a scheduled reminder
// @access  Private
router.delete('/:id/reminders/:reminderId', requireAdmin, async (req, res) => {
  try {
    const { id, reminderId } = req.params;
    await automatedRemindersService.cancelReminder(id, reminderId);
    
    res.json({
      success: true,
      message: 'Reminder cancelled successfully'
    });

  } catch (error) {
    console.error('Cancel reminder error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @route   POST /api/collections/:id/documents
// @desc    Upload a legal document for a collections task
// @access  Private
router.post('/:id/documents', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = documentUploadSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Handle file upload
    const upload = multer({
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(__dirname, '..', 'uploads', 'legal-documents');
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, 'legal-doc-' + uniqueSuffix + path.extname(file.originalname));
        }
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = /pdf|doc|docx|txt/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) {
          cb(null, true);
        } else {
          cb(new Error('Only PDF, DOC, DOCX, and TXT files are allowed'));
        }
      },
      limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
      }
    }).single('document');

    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No document file provided'
        });
      }

      const task = await Task.findById(id);
      if (!task || task.type !== 'collections') {
        return res.status(404).json({
          success: false,
          message: 'Collections task not found'
        });
      }

      const documentData = {
        originalName: req.file.originalname,
        fileName: req.file.filename,
        filePath: req.file.path,
        documentType: value.documentType,
        description: value.description,
        tags: value.tags || [],
        expiresAt: value.expiresAt
      };

      await task.addLegalDocument(documentData, req.user.id);
      
      res.json({
        success: true,
        message: 'Document uploaded successfully',
        data: { document: documentData }
      });
    });

  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @route   GET /api/collections/:id/documents
// @desc    Get all legal documents for a collections task
// @access  Private
router.get('/:id/documents', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);
    
    if (!task || task.type !== 'collections') {
      return res.status(404).json({
        success: false,
        message: 'Collections task not found'
      });
    }

    res.json({
      success: true,
      data: { documents: task.legalDocuments }
    });

  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
});

// @route   GET /api/collections/aging-report
// @desc    Get aging report for collections
// @access  Private
router.get('/aging-report', requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate, assignedTo } = req.query;
    
    const query = { type: 'collections', status: { $ne: 'completed' } };
    
    // Filter by assigned user
    if (req.user.role === 'sub_admin') {
      query.assignedTo = req.user.id;
    } else if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    // Date range filter
    if (startDate && endDate) {
      query.dueDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const now = new Date();
    const agingReport = await Task.aggregate([
      { $match: query },
      {
        $addFields: {
          daysOverdue: {
            $floor: {
              $divide: [
                { $subtract: [now, '$dueDate'] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }
      },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $lt: ['$daysOverdue', 0] }, then: 'current' },
                { case: { $lt: ['$daysOverdue', 30] }, then: '1-30_days' },
                { case: { $lt: ['$daysOverdue', 60] }, then: '31-60_days' },
                { case: { $lt: ['$daysOverdue', 90] }, then: '61-90_days' },
                { case: { $lt: ['$daysOverdue', 120] }, then: '91-120_days' }
              ],
              default: 'over_120_days'
            }
          },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          averageDays: { $avg: '$daysOverdue' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json({
      success: true,
      data: { agingReport }
    });

  } catch (error) {
    console.error('Get aging report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/collections/performance-metrics
// @desc    Get performance metrics for collections
// @access  Private
router.get('/performance-metrics', requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate, assignedTo } = req.query;
    
    const query = { type: 'collections' };
    
    // Filter by assigned user
    if (req.user.role === 'sub_admin') {
      query.assignedTo = req.user.id;
    } else if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    // Date range filter
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const performanceMetrics = await Task.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
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
          },
          highRiskTasks: {
            $sum: { $cond: [{ $in: ['$riskLevel', ['high', 'critical']] }, 1, 0] }
          },
          highRiskAmount: {
            $sum: { $cond: [{ $in: ['$riskLevel', ['high', 'critical']] }, '$amount', 0] }
          }
        }
      }
    ]);

    const metrics = performanceMetrics[0] || {
      totalTasks: 0,
      totalAmount: 0,
      completedTasks: 0,
      completedAmount: 0,
      overdueTasks: 0,
      overdueAmount: 0,
      highRiskTasks: 0,
      highRiskAmount: 0
    };

    // Calculate additional metrics
    const recoveryRate = metrics.totalAmount > 0 ? (metrics.completedAmount / metrics.totalAmount) * 100 : 0;
    const overdueRate = metrics.totalAmount > 0 ? (metrics.overdueAmount / metrics.totalAmount) * 100 : 0;
    const highRiskRate = metrics.totalAmount > 0 ? (metrics.highRiskAmount / metrics.totalAmount) * 100 : 0;

    res.json({
      success: true,
      data: {
        ...metrics,
        recoveryRate: Math.round(recoveryRate * 100) / 100,
        overdueRate: Math.round(overdueRate * 100) / 100,
        highRiskRate: Math.round(highRiskRate * 100) / 100
      }
    });

  } catch (error) {
    console.error('Get performance metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
