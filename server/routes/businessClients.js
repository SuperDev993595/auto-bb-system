const express = require('express');
const Joi = require('joi');
const { authenticateToken, requireAnyAdmin } = require('../middleware/auth');
const BusinessClient = require('../models/BusinessClient');
const User = require('../models/User');

const router = express.Router();

// Validation schemas
const businessClientSchema = Joi.object({
  businessName: Joi.string().min(1).max(100).required(),
  businessType: Joi.string().valid('auto_repair', 'tire_shop', 'oil_change', 'brake_shop', 'general_repair', 'dealership', 'specialty_shop', 'other').default('auto_repair'),
  contactPerson: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    title: Joi.string().max(100).optional(),
    email: Joi.string().email().required(),
    phone: Joi.string().min(10).max(20).required()
  }).required(),
  address: Joi.object({
    street: Joi.string().min(1).max(200).required(),
    city: Joi.string().min(1).max(100).required(),
    state: Joi.string().min(1).max(50).required(),
    zipCode: Joi.string().min(5).max(10).required(),
    country: Joi.string().default('USA')
  }).required(),
  businessInfo: Joi.object({
    yearsInBusiness: Joi.number().min(0).optional(),
    employeeCount: Joi.number().min(1).optional(),
    website: Joi.string().uri().optional(),
    hours: Joi.string().max(200).optional(),
    services: Joi.array().items(Joi.string()).optional(),
    specialties: Joi.array().items(Joi.string()).optional(),
    certifications: Joi.array().items(Joi.string()).optional()
  }).optional(),
  subscription: Joi.object({
    plan: Joi.string().valid('basic', 'professional', 'enterprise', 'custom').default('basic'),
    billingCycle: Joi.string().valid('monthly', 'quarterly', 'annually').default('monthly'),
    monthlyFee: Joi.number().min(0).default(0),
    features: Joi.array().items(Joi.string()).optional()
  }).optional(),
  branding: Joi.object({
    logo: Joi.string().optional(),
    primaryColor: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#3B82F6'),
    secondaryColor: Joi.string().pattern(/^#[0-9A-F]{6}$/i).default('#1F2937'),
    companyName: Joi.string().max(100).optional(),
    tagline: Joi.string().max(200).optional(),
    customDomain: Joi.string().domain().optional()
  }).optional(),
  settings: Joi.object({
    timezone: Joi.string().default('America/New_York'),
    currency: Joi.string().default('USD'),
    dateFormat: Joi.string().default('MM/DD/YYYY'),
    timeFormat: Joi.string().valid('12h', '24h').default('12h'),
    notifications: Joi.object({
      email: Joi.boolean().default(true),
      sms: Joi.boolean().default(true),
      push: Joi.boolean().default(true)
    }).optional()
  }).optional(),
  status: Joi.string().valid('active', 'inactive', 'pending', 'suspended').default('pending'),
  source: Joi.string().valid('direct', 'referral', 'advertising', 'partnership', 'other').default('direct'),
  notes: Joi.string().max(1000).optional()
});

const updateBusinessClientSchema = Joi.object({
  businessName: Joi.string().min(1).max(100).optional(),
  businessType: Joi.string().valid('auto_repair', 'tire_shop', 'oil_change', 'brake_shop', 'general_repair', 'dealership', 'specialty_shop', 'other').optional(),
  contactPerson: Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    title: Joi.string().max(100).optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().min(10).max(20).optional()
  }).optional(),
  address: Joi.object({
    street: Joi.string().min(1).max(200).optional(),
    city: Joi.string().min(1).max(100).optional(),
    state: Joi.string().min(1).max(50).optional(),
    zipCode: Joi.string().min(5).max(10).optional(),
    country: Joi.string().optional()
  }).optional(),
  businessInfo: Joi.object({
    yearsInBusiness: Joi.number().min(0).optional(),
    employeeCount: Joi.number().min(1).optional(),
    website: Joi.string().uri().optional(),
    hours: Joi.string().max(200).optional(),
    services: Joi.array().items(Joi.string()).optional(),
    specialties: Joi.array().items(Joi.string()).optional(),
    certifications: Joi.array().items(Joi.string()).optional()
  }).optional(),
  subscription: Joi.object({
    plan: Joi.string().valid('basic', 'professional', 'enterprise', 'custom').optional(),
    status: Joi.string().valid('active', 'trial', 'suspended', 'cancelled', 'expired').optional(),
    billingCycle: Joi.string().valid('monthly', 'quarterly', 'annually').optional(),
    monthlyFee: Joi.number().min(0).optional(),
    features: Joi.array().items(Joi.string()).optional()
  }).optional(),
  branding: Joi.object({
    logo: Joi.string().optional(),
    primaryColor: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
    secondaryColor: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
    companyName: Joi.string().max(100).optional(),
    tagline: Joi.string().max(200).optional(),
    customDomain: Joi.string().domain().optional()
  }).optional(),
  settings: Joi.object({
    timezone: Joi.string().optional(),
    currency: Joi.string().optional(),
    dateFormat: Joi.string().optional(),
    timeFormat: Joi.string().valid('12h', '24h').optional(),
    notifications: Joi.object({
      email: Joi.boolean().optional(),
      sms: Joi.boolean().optional(),
      push: Joi.boolean().optional()
    }).optional()
  }).optional(),
  status: Joi.string().valid('active', 'inactive', 'pending', 'suspended').optional(),
  notes: Joi.string().max(1000).optional()
});

// @route   GET /api/business-clients
// @desc    Get all business clients with filtering and pagination
// @access  Private (Admin only)
router.get('/', authenticateToken, requireAnyAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      businessType,
      subscriptionStatus,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { 'contactPerson.name': { $regex: search, $options: 'i' } },
        { 'contactPerson.email': { $regex: search, $options: 'i' } },
        { 'address.city': { $regex: search, $options: 'i' } },
        { 'address.state': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) query.status = status;
    if (businessType) query.businessType = businessType;
    if (subscriptionStatus) query['subscription.status'] = subscriptionStatus;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query
    const [businessClients, total] = await Promise.all([
      BusinessClient.find(query)
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      BusinessClient.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      success: true,
      data: {
        businessClients,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching business clients:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch business clients'
    });
  }
});

// @route   GET /api/business-clients/:id
// @desc    Get business client by ID
// @access  Private (Admin only)
router.get('/:id', authenticateToken, requireAnyAdmin, async (req, res) => {
  try {
    const businessClient = await BusinessClient.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email');

    if (!businessClient) {
      return res.status(404).json({
        success: false,
        message: 'Business client not found'
      });
    }

    res.json({
      success: true,
      data: { businessClient }
    });

  } catch (error) {
    console.error('Error fetching business client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch business client'
    });
  }
});

// @route   POST /api/business-clients
// @desc    Create new business client
// @access  Private (Admin only)
router.post('/', authenticateToken, requireAnyAdmin, async (req, res) => {
  try {
    const { error, value } = businessClientSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Check if business client with same email already exists
    const existingClient = await BusinessClient.findOne({
      'contactPerson.email': value.contactPerson.email
    });

    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: 'Business client with this email already exists'
      });
    }

    // Set trial end date (30 days from now)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 30);

    const businessClient = new BusinessClient({
      ...value,
      subscription: {
        ...value.subscription,
        endDate: trialEndDate
      },
      createdBy: req.user.id
    });

    await businessClient.save();

    // Populate references
    await businessClient.populate('assignedTo', 'name email');
    await businessClient.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Business client created successfully',
      data: { businessClient }
    });

  } catch (error) {
    console.error('Error creating business client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create business client'
    });
  }
});

// @route   PUT /api/business-clients/:id
// @desc    Update business client
// @access  Private (Admin only)
router.put('/:id', authenticateToken, requireAnyAdmin, async (req, res) => {
  try {
    const { error, value } = updateBusinessClientSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const businessClient = await BusinessClient.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email')
     .populate('createdBy', 'name email');

    if (!businessClient) {
      return res.status(404).json({
        success: false,
        message: 'Business client not found'
      });
    }

    res.json({
      success: true,
      message: 'Business client updated successfully',
      data: { businessClient }
    });

  } catch (error) {
    console.error('Error updating business client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update business client'
    });
  }
});

// @route   DELETE /api/business-clients/:id
// @desc    Delete business client
// @access  Private (Admin only)
router.delete('/:id', authenticateToken, requireAnyAdmin, async (req, res) => {
  try {
    const businessClient = await BusinessClient.findById(req.params.id);

    if (!businessClient) {
      return res.status(404).json({
        success: false,
        message: 'Business client not found'
      });
    }

    // Check if there are users associated with this business client
    const associatedUsers = await User.find({ businessClientId: req.params.id });
    if (associatedUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete business client with associated users. Please remove users first.'
      });
    }

    await BusinessClient.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Business client deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting business client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete business client'
    });
  }
});

// @route   POST /api/business-clients/:id/activate
// @desc    Activate business client subscription
// @access  Private (Admin only)
router.post('/:id/activate', authenticateToken, requireAnyAdmin, async (req, res) => {
  try {
    const { subscriptionEndDate, plan, monthlyFee } = req.body;

    const businessClient = await BusinessClient.findById(req.params.id);
    if (!businessClient) {
      return res.status(404).json({
        success: false,
        message: 'Business client not found'
      });
    }

    businessClient.subscription.status = 'active';
    businessClient.subscription.plan = plan || businessClient.subscription.plan;
    businessClient.subscription.monthlyFee = monthlyFee || businessClient.subscription.monthlyFee;
    
    if (subscriptionEndDate) {
      businessClient.subscription.endDate = new Date(subscriptionEndDate);
    } else {
      // Set to 1 year from now if no end date provided
      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);
      businessClient.subscription.endDate = endDate;
    }

    businessClient.status = 'active';
    await businessClient.save();

    res.json({
      success: true,
      message: 'Business client activated successfully',
      data: { businessClient }
    });

  } catch (error) {
    console.error('Error activating business client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate business client'
    });
  }
});

// @route   POST /api/business-clients/:id/suspend
// @desc    Suspend business client subscription
// @access  Private (Admin only)
router.post('/:id/suspend', authenticateToken, requireAnyAdmin, async (req, res) => {
  try {
    const businessClient = await BusinessClient.findById(req.params.id);
    if (!businessClient) {
      return res.status(404).json({
        success: false,
        message: 'Business client not found'
      });
    }

    businessClient.subscription.status = 'suspended';
    businessClient.status = 'suspended';
    await businessClient.save();

    res.json({
      success: true,
      message: 'Business client suspended successfully',
      data: { businessClient }
    });

  } catch (error) {
    console.error('Error suspending business client:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to suspend business client'
    });
  }
});

// @route   GET /api/business-clients/stats/overview
// @desc    Get business clients statistics
// @access  Private (Admin only)
router.get('/stats/overview', authenticateToken, requireAnyAdmin, async (req, res) => {
  try {
    const [
      totalClients,
      activeClients,
      trialClients,
      suspendedClients,
      newThisMonth,
      expiringThisMonth
    ] = await Promise.all([
      BusinessClient.countDocuments(),
      BusinessClient.countDocuments({ 'subscription.status': 'active' }),
      BusinessClient.countDocuments({ 'subscription.status': 'trial' }),
      BusinessClient.countDocuments({ 'subscription.status': 'suspended' }),
      BusinessClient.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      }),
      BusinessClient.countDocuments({
        'subscription.endDate': {
          $gte: new Date(),
          $lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
        },
        'subscription.status': { $in: ['active', 'trial'] }
      })
    ]);

    // Calculate monthly recurring revenue
    const activeSubscriptions = await BusinessClient.find({
      'subscription.status': 'active'
    }).select('subscription.monthlyFee');

    const mrr = activeSubscriptions.reduce((total, client) => {
      return total + (client.subscription.monthlyFee || 0);
    }, 0);

    res.json({
      success: true,
      data: {
        totalClients,
        activeClients,
        trialClients,
        suspendedClients,
        newThisMonth,
        expiringThisMonth,
        monthlyRecurringRevenue: mrr
      }
    });

  } catch (error) {
    console.error('Error fetching business client stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch business client statistics'
    });
  }
});

module.exports = router;
