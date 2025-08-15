const express = require('express');
const Joi = require('joi');
const Customer = require('../models/Customer');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const customerSchema = Joi.object({
  businessName: Joi.string().min(2).max(100).required(),
  contactPerson: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    title: Joi.string().max(50).optional(),
    phone: Joi.string().required(),
    email: Joi.string().email().optional()
  }).required(),
  address: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required()
  }).required(),
  businessInfo: Joi.object({
    businessType: Joi.string().valid('auto_repair', 'tire_shop', 'oil_change', 'brake_shop', 'general_repair', 'other').default('auto_repair'),
    yearsInBusiness: Joi.number().min(0).optional(),
    employeeCount: Joi.number().min(1).optional(),
    website: Joi.string().uri().optional(),
    hours: Joi.string().optional()
  }).optional(),
  notes: Joi.string().optional(),
  preferences: Joi.object({
    preferredContactMethod: Joi.string().valid('phone', 'email', 'text').default('phone'),
    preferredContactTime: Joi.string().valid('morning', 'afternoon', 'evening', 'anytime').default('anytime'),
    specialInstructions: Joi.string().optional()
  }).optional(),
  status: Joi.string().valid('active', 'inactive', 'prospect', 'former').default('prospect'),
  source: Joi.string().valid('yellowpages', 'referral', 'website', 'cold_call', 'other').default('other'),
  assignedTo: Joi.string().optional()
});

// @route   GET /api/customers
// @desc    Get all customers with filtering and pagination
// @access  Private
router.get('/', requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      assignedTo,
      city,
      state,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { 'contactPerson.name': { $regex: search, $options: 'i' } },
        { 'contactPerson.phone': { $regex: search, $options: 'i' } },
        { 'contactPerson.email': { $regex: search, $options: 'i' } }
      ];
    }

    if (status) query.status = status;
    if (assignedTo) query.assignedTo = assignedTo;
    if (city) query['address.city'] = { $regex: city, $options: 'i' };
    if (state) query['address.state'] = { $regex: state, $options: 'i' };

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const customers = await Customer.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count
    const total = await Customer.countDocuments(query);

    res.json({
      success: true,
      data: {
        customers,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalCustomers: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/customers/stats/overview
// @desc    Get customer statistics
// @access  Private
router.get('/stats/overview', requireAdmin, async (req, res) => {
  try {
    const stats = await Customer.aggregate([
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          activeCustomers: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          prospectCustomers: {
            $sum: { $cond: [{ $eq: ['$status', 'prospect'] }, 1, 0] }
          },
          inactiveCustomers: {
            $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
          }
        }
      }
    ]);

    const sourceStats = await Customer.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      }
    ]);

    const stateStats = await Customer.aggregate([
      {
        $group: {
          _id: '$address.state',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalCustomers: 0,
          activeCustomers: 0,
          prospectCustomers: 0,
          inactiveCustomers: 0
        },
        sourceStats,
        stateStats
      }
    });

  } catch (error) {
    console.error('Get customer stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/customers/:id
// @desc    Get single customer by ID
// @access  Private
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    console.log('req.params.id', req.params.id);
    const customer = await Customer.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name')
      .populate('communicationLogs.createdBy', 'name');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    res.json({
      success: true,
      data: { customer }
    });

  } catch (error) {
    console.error('Get customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/customers
// @desc    Create new customer
// @access  Private
router.post('/', requireAdmin, async (req, res) => {
  try {
    // Validate input
    const { error, value } = customerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Check if customer already exists (by phone or email)
    const existingCustomer = await Customer.findOne({
      $or: [
        { 'contactPerson.phone': value.contactPerson.phone },
        { 'contactPerson.email': value.contactPerson.email }
      ]
    });

    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: 'Customer with this phone or email already exists'
      });
    }

    // Create new customer
    const customer = new Customer({
      ...value,
      createdBy: req.user.id,
      assignedTo: value.assignedTo || req.user.id
    });

    await customer.save();

    // Populate references
    await customer.populate('assignedTo', 'name email');
    await customer.populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: { customer }
    });

  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/customers/:id
// @desc    Update customer
// @access  Private
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    // Validate input
    const { error, value } = customerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Update customer
    Object.assign(customer, value);
    await customer.save();

    // Populate references
    await customer.populate('assignedTo', 'name email');
    await customer.populate('createdBy', 'name');

    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: { customer }
    });

  } catch (error) {
    console.error('Update customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/customers/:id
// @desc    Delete customer
// @access  Private
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    await customer.remove();

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });

  } catch (error) {
    console.error('Delete customer error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/customers/:id/vehicles
// @desc    Add vehicle to customer
// @access  Private
router.post('/:id/vehicles', requireAdmin, async (req, res) => {
  try {
    const { make, model, year, vin, licensePlate, mileage, color, engineType, transmission } = req.body;

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    customer.vehicles.push({
      make,
      model,
      year,
      vin,
      licensePlate,
      mileage,
      color,
      engineType,
      transmission
    });

    await customer.save();

    res.json({
      success: true,
      message: 'Vehicle added successfully',
      data: { customer }
    });

  } catch (error) {
    console.error('Add vehicle error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/customers/:id/communication
// @desc    Add communication log
// @access  Private
router.post('/:id/communication', requireAdmin, async (req, res) => {
  try {
    const {
      type,
      direction,
      subject,
      content,
      duration,
      outcome,
      followUpRequired,
      followUpDate
    } = req.body;

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    customer.communicationLogs.push({
      type,
      direction,
      subject,
      content,
      duration,
      outcome,
      followUpRequired,
      followUpDate,
      createdBy: req.user.id
    });

    // Update last contact
    customer.lastContact = new Date();
    if (followUpRequired && followUpDate) {
      customer.nextFollowUp = followUpDate;
    }

    await customer.save();

    // Populate the new communication log
    await customer.populate('communicationLogs.createdBy', 'name');

    res.json({
      success: true,
      message: 'Communication log added successfully',
      data: { customer }
    });

  } catch (error) {
    console.error('Add communication log error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
