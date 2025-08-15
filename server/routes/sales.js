const express = require('express');
const Joi = require('joi');
const Task = require('../models/Task');
const Customer = require('../models/Customer');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const salesTaskSchema = Joi.object({
  customer: Joi.string().required(),
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(1000).optional(),
  salesType: Joi.string().valid('lead_generation', 'proposal', 'negotiation', 'closing', 'follow_up', 'presentation', 'other').required(),
  dealValue: Joi.number().min(0).optional(),
  probability: Joi.number().min(0).max(100).optional(),
  dueDate: Joi.date().required(),
  assignedTo: Joi.string().required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  expectedRevenue: Joi.number().min(0).optional()
});

// @route   GET /api/sales
// @desc    Get all sales tasks
// @access  Private
router.get('/', requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      customer,
      assignedTo,
      salesType,
      status,
      search,
      sortBy = 'dueDate',
      sortOrder = 'asc'
    } = req.query;

    // Build query
    const query = { type: 'sales' };

    // Filter by assigned user (Sub Admins can only see their own tasks)
    if (req.user.role === 'sub_admin') {
      query.assignedTo = req.user.id;
    } else if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    if (customer) query.customer = customer;
    if (salesType) query.salesType = salesType;
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
    const salesTasks = await Task.find(query)
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
        salesTasks,
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
    console.error('Get sales tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/sales
// @desc    Create new sales task
// @access  Private
router.post('/', requireAdmin, async (req, res) => {
  try {
    // Validate input
    const { error, value } = salesTaskSchema.validate(req.body);
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

    // Create sales task
    const salesTask = new Task({
      ...value,
      type: 'sales',
      assignedBy: req.user.id
    });

    await salesTask.save();

    // Populate references
    await salesTask.populate('assignedTo', 'name email');
    await salesTask.populate('customer', 'businessName contactPerson.name');

    res.status(201).json({
      success: true,
      message: 'Sales task created successfully',
      data: { salesTask }
    });

  } catch (error) {
    console.error('Create sales task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/sales/pipeline
// @desc    Get sales pipeline
// @access  Private
router.get('/pipeline', requireAdmin, async (req, res) => {
  try {
    const { assignedTo } = req.query;

    const query = { type: 'sales' };

    // Filter by assigned user
    if (req.user.role === 'sub_admin') {
      query.assignedTo = req.user.id;
    } else if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    // Get sales tasks by type (pipeline stages)
    const pipeline = await Task.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$salesType',
          count: { $sum: 1 },
          totalValue: { $sum: '$dealValue' },
          avgProbability: { $avg: '$probability' }
        }
      }
    ]);

    // Get total pipeline value
    const totalValue = await Task.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalValue: { $sum: '$dealValue' },
          weightedValue: { $sum: { $multiply: ['$dealValue', { $divide: ['$probability', 100] }] } }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        pipeline,
        totalValue: totalValue[0] || { totalValue: 0, weightedValue: 0 }
      }
    });

  } catch (error) {
    console.error('Get sales pipeline error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
