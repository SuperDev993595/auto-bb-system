const express = require('express');
const Joi = require('joi');
const User = require('../models/User');
const { requireSuperAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const userSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('super_admin', 'sub_admin').default('sub_admin'),
  phone: Joi.string().optional(),
  permissions: Joi.object({
    customers: Joi.boolean().default(true),
    appointments: Joi.boolean().default(true),
    marketing: Joi.boolean().default(true),
    sales: Joi.boolean().default(true),
    collections: Joi.boolean().default(true),
    tasks: Joi.boolean().default(true),
    reports: Joi.boolean().default(true)
  }).optional()
});

const userUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  role: Joi.string().valid('super_admin', 'sub_admin').optional(),
  isActive: Joi.boolean().optional(),
  permissions: Joi.object({
    customers: Joi.boolean(),
    appointments: Joi.boolean(),
    marketing: Joi.boolean(),
    sales: Joi.boolean(),
    collections: Joi.boolean(),
    tasks: Joi.boolean(),
    reports: Joi.boolean()
  }).optional()
});

// @route   GET /api/users
// @desc    Get all users (Super Admin only)
// @access  Private (Super Admin)
router.get('/', requireSuperAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      isActive,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count
    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalUsers: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get single user (Super Admin only)
// @access  Private (Super Admin)
router.get('/:id', requireSuperAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/users
// @desc    Create new user (Super Admin only)
// @access  Private (Super Admin)
router.post('/', requireSuperAdmin, async (req, res) => {
  try {
    // Validate input
    const { error, value } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: value.email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Create new user
    const user = new User(value);
    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user: userResponse }
    });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user (Super Admin only)
// @access  Private (Super Admin)
router.put('/:id', requireSuperAdmin, async (req, res) => {
  try {
    // Validate input
    const { error, value } = userUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email already exists (if updating email)
    if (value.email && value.email !== user.email) {
      const existingUser = await User.findOne({ email: value.email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
    }

    // Update user
    Object.assign(user, value);
    await user.save();

    // Remove password from response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user: userResponse }
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (Super Admin only)
// @access  Private (Super Admin)
router.delete('/:id', requireSuperAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting the last Super Admin
    if (user.role === 'super_admin') {
      const superAdminCount = await User.countDocuments({ role: 'super_admin' });
      if (superAdminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last Super Admin'
        });
      }
    }

    await user.remove();

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/:id/password
// @desc    Change user password (Super Admin only)
// @access  Private (Super Admin)
router.put('/:id/password', requireSuperAdmin, async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/stats/overview
// @desc    Get user statistics (Super Admin only)
// @access  Private (Super Admin)
router.get('/stats/overview', requireSuperAdmin, async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          superAdmins: {
            $sum: { $cond: [{ $eq: ['$role', 'super_admin'] }, 1, 0] }
          },
          subAdmins: {
            $sum: { $cond: [{ $eq: ['$role', 'sub_admin'] }, 1, 0] }
          },
          activeUsers: {
            $sum: { $cond: ['$isActive', 1, 0] }
          },
          inactiveUsers: {
            $sum: { $cond: ['$isActive', 0, 1] }
          }
        }
      }
    ]);

    // Get recent users
    const recentUsers = await User.find()
      .select('name email role isActive createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalUsers: 0,
          superAdmins: 0,
          subAdmins: 0,
          activeUsers: 0,
          inactiveUsers: 0
        },
        recentUsers
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
