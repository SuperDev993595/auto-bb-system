const express = require('express');
const Joi = require('joi');
const Task = require('../models/Task');
const Customer = require('../models/Customer');
const { requireAdmin } = require('../middleware/auth');

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
  paymentTerms: Joi.string().max(200).optional()
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

    // Create collections task
    const collectionsTask = new Task({
      ...value,
      type: 'collections',
      assignedBy: req.user.id
    });

    await collectionsTask.save();

    // Populate references
    await collectionsTask.populate('assignedTo', 'name email');
    await collectionsTask.populate('customer', 'businessName contactPerson.name');

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
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        collectionsTypeStats,
        overallStats: overallStats[0] || {
          totalTasks: 0,
          totalAmount: 0,
          completedTasks: 0,
          completedAmount: 0
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

module.exports = router;
