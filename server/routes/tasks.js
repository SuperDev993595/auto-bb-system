const express = require('express');
const Joi = require('joi');
const Task = require('../models/Task');
const User = require('../models/User');
const { requireAdmin, requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const taskSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(1000).optional(),
  type: Joi.string().valid('marketing', 'sales', 'collections', 'appointments', 'follow_up', 'research', 'other').required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  assignedTo: Joi.string().required(),
  customer: Joi.string().optional(),
  dueDate: Joi.date().required(),
  estimatedDuration: Joi.number().min(0).optional(),
  tags: Joi.array().items(Joi.string()).optional()
});

const taskUpdateSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  description: Joi.string().max(1000).optional(),
  type: Joi.string().valid('marketing', 'sales', 'collections', 'appointments', 'follow_up', 'research', 'other').optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  status: Joi.string().valid('pending', 'in_progress', 'completed', 'cancelled').optional(),
  assignedTo: Joi.string().optional(),
  customer: Joi.string().optional(),
  dueDate: Joi.date().optional(),
  progress: Joi.number().min(0).max(100).optional(),
  actualDuration: Joi.number().min(0).optional(),
  outcome: Joi.string().valid('successful', 'unsuccessful', 'partial', 'rescheduled', 'other').optional(),
  result: Joi.string().max(500).optional(),
  followUpRequired: Joi.boolean().optional(),
  followUpDate: Joi.date().optional(),
  tags: Joi.array().items(Joi.string()).optional()
});

// @route   GET /api/tasks
// @desc    Get all tasks with filtering and pagination
// @access  Private
router.get('/', requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      priority,
      assignedTo,
      customer,
      search,
      sortBy = 'dueDate',
      sortOrder = 'asc'
    } = req.query;

    // Build query
    const query = {};
    
    // Filter by assigned user (Sub Admins can only see their own tasks)
    if (req.user.role === 'sub_admin') {
      query.assignedTo = req.user.id;
    } else if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    if (status) query.status = status;
    if (type) query.type = type;
    if (priority) query.priority = priority;
    if (customer) query.customer = customer;

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
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name')
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
        tasks,
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
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/tasks/:id
// @desc    Get single task by ID
// @access  Private
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name')
      .populate('customer', 'businessName contactPerson.name')
      .populate('notes.createdBy', 'name');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user has access to this task
    if (req.user.role === 'sub_admin' && task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { task }
    });

  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/tasks
// @desc    Create new task (Super Admin only)
// @access  Private (Super Admin)
router.post('/', requireSuperAdmin, async (req, res) => {
  try {
    // Validate input
    const { error, value } = taskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Check if assigned user exists and is active
    const assignedUser = await User.findById(value.assignedTo);
    if (!assignedUser || !assignedUser.isActive) {
      return res.status(400).json({
        success: false,
        message: 'Assigned user not found or inactive'
      });
    }

    // Create new task
    const task = new Task({
      ...value,
      assignedBy: req.user.id,
      startDate: new Date()
    });

    await task.save();

    // Populate references
    await task.populate('assignedTo', 'name email');
    await task.populate('assignedBy', 'name');
    if (task.customer) {
      await task.populate('customer', 'businessName contactPerson.name');
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task }
    });

  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/tasks/:id
// @desc    Update task
// @access  Private
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    // Validate input
    const { error, value } = taskUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user has access to update this task
    if (req.user.role === 'sub_admin' && task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update task
    Object.assign(task, value);
    
    // Handle status changes
    if (value.status === 'completed' && task.status !== 'completed') {
      task.completedDate = new Date();
    } else if (value.status === 'in_progress' && task.status !== 'in_progress') {
      task.startDate = new Date();
    }

    await task.save();

    // Populate references
    await task.populate('assignedTo', 'name email');
    await task.populate('assignedBy', 'name');
    if (task.customer) {
      await task.populate('customer', 'businessName contactPerson.name');
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task }
    });

  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/tasks/:id
// @desc    Delete task (Super Admin only)
// @access  Private (Super Admin)
router.delete('/:id', requireSuperAdmin, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    await task.remove();

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/tasks/:id/notes
// @desc    Add note to task
// @access  Private
router.post('/:id/notes', requireAdmin, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Note content is required'
      });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user has access to this task
    if (req.user.role === 'sub_admin' && task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Add note
    await task.addNote(content, req.user.id);

    // Populate references
    await task.populate('assignedTo', 'name email');
    await task.populate('assignedBy', 'name');
    await task.populate('notes.createdBy', 'name');
    if (task.customer) {
      await task.populate('customer', 'businessName contactPerson.name');
    }

    res.json({
      success: true,
      message: 'Note added successfully',
      data: { task }
    });

  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/tasks/:id/progress
// @desc    Update task progress
// @access  Private
router.put('/:id/progress', requireAdmin, async (req, res) => {
  try {
    const { progress } = req.body;

    if (progress === undefined || progress < 0 || progress > 100) {
      return res.status(400).json({
        success: false,
        message: 'Progress must be between 0 and 100'
      });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Check if user has access to this task
    if (req.user.role === 'sub_admin' && task.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update progress
    await task.updateProgress(progress);

    // Populate references
    await task.populate('assignedTo', 'name email');
    await task.populate('assignedBy', 'name');
    if (task.customer) {
      await task.populate('customer', 'businessName contactPerson.name');
    }

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: { task }
    });

  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/tasks/stats/overview
// @desc    Get task statistics
// @access  Private
router.get('/stats/overview', requireAdmin, async (req, res) => {
  try {
    const { assignedTo } = req.query;
    
    // Build query
    const query = {};
    if (req.user.role === 'sub_admin') {
      query.assignedTo = req.user.id;
    } else if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    const stats = await Task.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          pendingTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          inProgressTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
          },
          completedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          overdueTasks: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lt: ['$dueDate', new Date()] },
                    { $ne: ['$status', 'completed'] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const typeStats = await Task.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const priorityStats = await Task.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalTasks: 0,
          pendingTasks: 0,
          inProgressTasks: 0,
          completedTasks: 0,
          overdueTasks: 0
        },
        typeStats,
        priorityStats
      }
    });

  } catch (error) {
    console.error('Get task stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/tasks/overdue
// @desc    Get overdue tasks
// @access  Private
router.get('/overdue', requireAdmin, async (req, res) => {
  try {
    const query = {
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' }
    };

    // Filter by assigned user
    if (req.user.role === 'sub_admin') {
      query.assignedTo = req.user.id;
    }

    const overdueTasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('customer', 'businessName contactPerson.name')
      .sort({ dueDate: 1 });

    res.json({
      success: true,
      data: { overdueTasks }
    });

  } catch (error) {
    console.error('Get overdue tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
