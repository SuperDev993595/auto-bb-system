const express = require('express');
const Joi = require('joi');
const Task = require('../models/Task');
const Customer = require('../models/Customer');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const marketingTaskSchema = Joi.object({
  customer: Joi.string().optional(),
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(1000).optional(),
  marketingType: Joi.string().valid('email', 'phone', 'social_media', 'direct_mail', 'advertising', 'promotion', 'other').required(),
  targetAudience: Joi.string().max(200).optional(),
  budget: Joi.number().min(0).optional(),
  dueDate: Joi.date().required(),
  assignedTo: Joi.string().required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  expectedOutcome: Joi.string().max(500).optional()
});

// @route   GET /api/marketing
// @desc    Get all marketing tasks
// @access  Private
router.get('/', requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      customer,
      assignedTo,
      marketingType,
      status,
      search,
      sortBy = 'dueDate',
      sortOrder = 'asc'
    } = req.query;

    // Build query
    const query = { type: 'marketing' };

    // Filter by assigned user (Sub Admins can only see their own tasks)
    if (req.user.role === 'sub_admin') {
      query.assignedTo = req.user.id;
    } else if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    if (customer) query.customer = customer;
    if (marketingType) query.marketingType = marketingType;
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
    const marketingTasks = await Task.find(query)
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
        marketingTasks,
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
    console.error('Get marketing tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/marketing
// @desc    Create new marketing task
// @access  Private
router.post('/', requireAdmin, async (req, res) => {
  try {
    // Validate input
    const { error, value } = marketingTaskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Check if customer exists (if provided)
    if (value.customer) {
      const customer = await Customer.findById(value.customer);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }
    }

    // Create marketing task
    const marketingTask = new Task({
      ...value,
      type: 'marketing',
      assignedBy: req.user.id
    });

    await marketingTask.save();

    // Populate references
    await marketingTask.populate('assignedTo', 'name email');
    if (marketingTask.customer) {
      await marketingTask.populate('customer', 'businessName contactPerson.name');
    }

    res.status(201).json({
      success: true,
      message: 'Marketing task created successfully',
      data: { marketingTask }
    });

  } catch (error) {
    console.error('Create marketing task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/marketing/stats
// @desc    Get marketing statistics
// @access  Private
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate, assignedTo } = req.query;

    const query = { type: 'marketing' };

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

    // Get marketing tasks by type
    const marketingTypeStats = await Task.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$marketingType',
          count: { $sum: 1 },
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
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          totalBudget: { $sum: '$budget' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        marketingTypeStats,
        overallStats: overallStats[0] || {
          totalTasks: 0,
          completedTasks: 0,
          totalBudget: 0
        }
      }
    });

  } catch (error) {
    console.error('Get marketing stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
