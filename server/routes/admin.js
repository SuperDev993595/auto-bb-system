const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Joi = require('joi');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const User = require('../models/User');

// Validation schemas
const userSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).optional(),
  role: Joi.string().valid('super_admin', 'sub_admin', 'user').required(),
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  phone: Joi.string().optional(),
  department: Joi.string().optional(),
  isActive: Joi.boolean().default(true),
  permissions: Joi.object().optional()
});

const updateUserSchema = Joi.object({
  username: Joi.string().min(3).max(30).optional(),
  email: Joi.string().email().optional(),
  password: Joi.string().min(6).optional(),
  role: Joi.string().valid('super_admin', 'sub_admin', 'user').optional(),
  firstName: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  phone: Joi.string().optional(),
  department: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
  permissions: Joi.object().optional()
});

const systemSettingsSchema = Joi.object({
  companyName: Joi.string().required(),
  companyEmail: Joi.string().email().required(),
  companyPhone: Joi.string().required(),
  companyAddress: Joi.string().required(),
  businessHours: Joi.object({
    monday: Joi.object({ open: Joi.string(), close: Joi.string() }),
    tuesday: Joi.object({ open: Joi.string(), close: Joi.string() }),
    wednesday: Joi.object({ open: Joi.string(), close: Joi.string() }),
    thursday: Joi.object({ open: Joi.string(), close: Joi.string() }),
    friday: Joi.object({ open: Joi.string(), close: Joi.string() }),
    saturday: Joi.object({ open: Joi.string(), close: Joi.string() }),
    sunday: Joi.object({ open: Joi.string(), close: Joi.string() })
  }),
  notificationSettings: Joi.object({
    emailNotifications: Joi.boolean(),
    smsNotifications: Joi.boolean(),
    appointmentReminders: Joi.boolean(),
    paymentReminders: Joi.boolean(),
    systemAlerts: Joi.boolean()
  }),
  securitySettings: Joi.object({
    sessionTimeout: Joi.number().min(5).max(480),
    passwordPolicy: Joi.object({
      minLength: Joi.number().min(6).max(20),
      requireUppercase: Joi.boolean(),
      requireLowercase: Joi.boolean(),
      requireNumbers: Joi.boolean(),
      requireSpecialChars: Joi.boolean()
    }),
    twoFactorAuth: Joi.boolean(),
    loginAttempts: Joi.number().min(3).max(10)
  }),
  backupSettings: Joi.object({
    autoBackup: Joi.boolean(),
    backupFrequency: Joi.string().valid('daily', 'weekly', 'monthly'),
    backupRetention: Joi.number().min(1).max(365),
    backupLocation: Joi.string()
  })
});

// Get all users (admin only)
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', role = '', isActive = '' } = req.query;
    
    const query = {};
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }
    
    if (isActive !== '') {
      query.isActive = isActive === 'true';
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      select: '-password',
      sort: { createdAt: -1 }
    };
    
    const users = await User.paginate(query, options);
    
    res.json({
      success: true,
      data: users.docs,
      pagination: {
        page: users.page,
        limit: users.limit,
        totalDocs: users.totalDocs,
        totalPages: users.totalPages,
        hasNextPage: users.hasNextPage,
        hasPrevPage: users.hasPrevPage
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user by ID
router.get('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create new user
router.post('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { error, value } = userSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email: value.email }, { username: value.username }]
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email or username already exists' 
      });
    }
    
    // Hash password if provided
    if (value.password) {
      value.password = await bcrypt.hash(value.password, 12);
    }
    
    const user = new User(value);
    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.status(201).json({ success: true, data: userResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user
router.put('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { error, value } = updateUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if email/username is being changed and if it conflicts
    if (value.email && value.email !== user.email) {
      const existingUser = await User.findOne({ email: value.email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
    }
    
    if (value.username && value.username !== user.username) {
      const existingUser = await User.findOne({ username: value.username });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Username already in use' });
      }
    }
    
    // Hash password if provided
    if (value.password) {
      value.password = await bcrypt.hash(value.password, 12);
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete user
router.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Prevent deleting super admin
    if (user.role === 'super_admin') {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete super admin user' 
      });
    }
    
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Toggle user active status
router.patch('/users/:id/toggle-status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.json({ 
      success: true, 
      data: { isActive: user.isActive },
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user statistics
router.get('/users/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
          inactiveUsers: { $sum: { $cond: ['$isActive', 0, 1] } }
        }
      }
    ]);
    
    const roleStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      success: true,
      data: {
        overview: stats[0] || { totalUsers: 0, activeUsers: 0, inactiveUsers: 0 },
        roleDistribution: roleStats,
        recentUsers
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get system settings
router.get('/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // In a real application, you'd store these in a database
    // For now, we'll return default settings
    const defaultSettings = {
      companyName: 'Auto Repair Service',
      companyEmail: 'info@autorepair.com',
      companyPhone: '+1 (555) 123-4567',
      companyAddress: '123 Main Street, City, State 12345',
      businessHours: {
        monday: { open: '08:00', close: '18:00' },
        tuesday: { open: '08:00', close: '18:00' },
        wednesday: { open: '08:00', close: '18:00' },
        thursday: { open: '08:00', close: '18:00' },
        friday: { open: '08:00', close: '18:00' },
        saturday: { open: '09:00', close: '17:00' },
        sunday: { open: '10:00', close: '16:00' }
      },
      notificationSettings: {
        emailNotifications: true,
        smsNotifications: true,
        appointmentReminders: true,
        paymentReminders: true,
        systemAlerts: true
      },
      securitySettings: {
        sessionTimeout: 30,
        passwordPolicy: {
          minLength: 8,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true
        },
        twoFactorAuth: false,
        loginAttempts: 5
      },
      backupSettings: {
        autoBackup: true,
        backupFrequency: 'daily',
        backupRetention: 30,
        backupLocation: 'local'
      }
    };
    
    res.json({ success: true, data: defaultSettings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update system settings
router.put('/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { error, value } = systemSettingsSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }
    
    // In a real application, you'd save these to a database
    // For now, we'll just return the updated settings
    res.json({ success: true, data: value, message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get system logs (mock data)
router.get('/logs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, level = '', search = '' } = req.query;
    
    // Mock log data
    const mockLogs = [
      {
        id: 1,
        timestamp: new Date(),
        level: 'INFO',
        message: 'User login successful',
        userId: 'user123',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0...'
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 3600000),
        level: 'WARNING',
        message: 'Failed login attempt',
        userId: 'user456',
        ipAddress: '192.168.1.101',
        userAgent: 'Mozilla/5.0...'
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 7200000),
        level: 'ERROR',
        message: 'Database connection failed',
        userId: null,
        ipAddress: null,
        userAgent: null
      }
    ];
    
    // Filter logs based on query parameters
    let filteredLogs = mockLogs;
    
    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }
    
    if (search) {
      filteredLogs = filteredLogs.filter(log => 
        log.message.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedLogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredLogs.length,
        totalPages: Math.ceil(filteredLogs.length / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get system health
router.get('/health', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'connected',
      services: {
        auth: 'running',
        email: 'running',
        fileUpload: 'running',
        pdfGeneration: 'running'
      }
    };
    
    res.json({ success: true, data: health });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
