const express = require('express');
const Joi = require('joi');
const Appointment = require('../models/Appointment');
const Customer = require('../models/Customer');
const User = require('../models/User');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const appointmentSchema = Joi.object({
  customer: Joi.string().required(),
  vehicle: Joi.object({
    make: Joi.string().required(),
    model: Joi.string().required(),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).required(),
    vin: Joi.string().optional(),
    licensePlate: Joi.string().optional(),
    mileage: Joi.number().min(0).optional()
  }).required(),
  serviceType: Joi.string().valid(
    'oil_change', 'tire_rotation', 'brake_service', 'engine_repair',
    'transmission_service', 'electrical_repair', 'diagnostic',
    'inspection', 'maintenance', 'emergency_repair', 'other'
  ).required(),
  serviceDescription: Joi.string().required(),
  scheduledDate: Joi.date().required(),
  scheduledTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  estimatedDuration: Joi.number().min(15).max(480).required(), // 15 minutes to 8 hours
  assignedTo: Joi.string().required(),
  technician: Joi.string().optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  notes: Joi.string().optional(),
  customerNotes: Joi.string().optional(),
  partsRequired: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    partNumber: Joi.string().optional(),
    quantity: Joi.number().min(1).required(),
    cost: Joi.number().min(0).optional(),
    inStock: Joi.boolean().default(false)
  })).optional(),
  tags: Joi.array().items(Joi.string()).optional()
});

const appointmentUpdateSchema = Joi.object({
  vehicle: Joi.object({
    make: Joi.string().optional(),
    model: Joi.string().optional(),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).optional(),
    vin: Joi.string().optional(),
    licensePlate: Joi.string().optional(),
    mileage: Joi.number().min(0).optional()
  }).optional(),
  serviceType: Joi.string().valid(
    'oil_change', 'tire_rotation', 'brake_service', 'engine_repair',
    'transmission_service', 'electrical_repair', 'diagnostic',
    'inspection', 'maintenance', 'emergency_repair', 'other'
  ).optional(),
  serviceDescription: Joi.string().optional(),
  scheduledDate: Joi.date().optional(),
  scheduledTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  estimatedDuration: Joi.number().min(15).max(480).optional(),
  status: Joi.string().valid('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show').optional(),
  assignedTo: Joi.string().optional(),
  technician: Joi.string().optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
  notes: Joi.string().optional(),
  customerNotes: Joi.string().optional(),
  partsRequired: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    partNumber: Joi.string().optional(),
    quantity: Joi.number().min(1).required(),
    cost: Joi.number().min(0).optional(),
    inStock: Joi.boolean().default(false)
  })).optional(),
  actualDuration: Joi.number().min(0).optional(),
  completionNotes: Joi.string().optional(),
  actualCost: Joi.object({
    parts: Joi.number().min(0).optional(),
    labor: Joi.number().min(0).optional(),
    total: Joi.number().min(0).optional()
  }).optional(),
  tags: Joi.array().items(Joi.string()).optional()
});

// @route   GET /api/appointments
// @desc    Get all appointments with filtering and pagination
// @access  Private
router.get('/', requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      customer,
      assignedTo,
      technician,
      date,
      status,
      serviceType,
      priority,
      search,
      sortBy = 'scheduledDate',
      sortOrder = 'asc'
    } = req.query;

    // Build query
    const query = {};

    // Filter by assigned user (Sub Admins can only see their own appointments)
    if (req.user.role === 'admin') {
      query.assignedTo = req.user.id;
    } else if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    if (customer) query.customer = customer;
    if (technician) query.technician = technician;
    if (status) query.status = status;
    if (serviceType) query.serviceType = serviceType;
    if (priority) query.priority = priority;

    // Date filter
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));
      query.scheduledDate = { $gte: startOfDay, $lte: endOfDay };
    }

    if (search) {
      query.$or = [
        { serviceDescription: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } },
        { 'vehicle.make': { $regex: search, $options: 'i' } },
        { 'vehicle.model': { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const appointments = await Appointment.find(query)
      .populate('assignedTo', 'name email')
      .populate('technician', 'name email')
      .populate('customer', 'businessName contactPerson.name contactPerson.phone')
      .populate('createdBy', 'name')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count
    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      data: {
        appointments,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalAppointments: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/appointments/:id
// @desc    Get single appointment
// @access  Private
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('technician', 'name email')
      .populate('customer', 'businessName contactPerson.name contactPerson.phone contactPerson.email')
      .populate('createdBy', 'name')
      .populate('attachments.uploadedBy', 'name');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user has access to this appointment
    if (req.user.role === 'admin' && appointment.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { appointment }
    });

  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/appointments
// @desc    Create new appointment
// @access  Private
router.post('/', requireAdmin, async (req, res) => {
  try {
    // Validate input
    const { error, value } = appointmentSchema.validate(req.body);
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

    // Check if assigned user exists
    const assignedUser = await User.findById(value.assignedTo);
    if (!assignedUser) {
      return res.status(404).json({
        success: false,
        message: 'Assigned user not found'
      });
    }

    // Check if technician exists (if provided)
    if (value.technician) {
      const technician = await User.findById(value.technician);
      if (!technician) {
        return res.status(404).json({
          success: false,
          message: 'Technician not found'
        });
      }
    }

    // Create appointment
    const appointment = new Appointment({
      ...value,
      createdBy: req.user.id
    });

    // Check for scheduling conflicts
    const conflicts = await appointment.checkConflicts();
    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Scheduling conflict detected',
        data: { conflicts }
      });
    }

    await appointment.save();

    // Populate references
    await appointment.populate('assignedTo', 'name email');
    await appointment.populate('technician', 'name email');
    await appointment.populate('customer', 'businessName contactPerson.name');
    await appointment.populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: { appointment }
    });

  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    // Validate input
    const { error, value } = appointmentUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user has access to this appointment
    if (req.user.role === 'admin' && appointment.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update appointment
    Object.assign(appointment, value);
    
    // If updating schedule, check for conflicts
    if (value.scheduledDate || value.scheduledTime || value.estimatedDuration) {
      const conflicts = await appointment.checkConflicts();
      if (conflicts.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Scheduling conflict detected',
          data: { conflicts }
        });
      }
    }

    await appointment.save();

    // Populate references
    await appointment.populate('assignedTo', 'name email');
    await appointment.populate('technician', 'name email');
    await appointment.populate('customer', 'businessName contactPerson.name');
    await appointment.populate('createdBy', 'name');

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: { appointment }
    });

  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Delete appointment
// @access  Private
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user has access to this appointment
    if (req.user.role === 'admin' && appointment.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await Appointment.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Appointment deleted successfully'
    });

  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/appointments/calendar/:date
// @desc    Get appointments for calendar view
// @access  Private
router.get('/calendar/:date', requireAdmin, async (req, res) => {
  try {
    const { date } = req.params;
    const { assignedTo } = req.query;

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const query = {
      scheduledDate: { $gte: startOfDay, $lte: endOfDay }
    };

    // Filter by assigned user
    if (req.user.role === 'admin') {
      query.assignedTo = req.user.id;
    } else if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    const appointments = await Appointment.find(query)
      .populate('assignedTo', 'name email')
      .populate('technician', 'name email')
      .populate('customer', 'businessName contactPerson.name')
      .sort({ scheduledTime: 1 })
      .exec();

    res.json({
      success: true,
      data: { appointments }
    });

  } catch (error) {
    console.error('Get calendar appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/appointments/stats
// @desc    Get appointment statistics
// @access  Private
router.get('/stats/overview', requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = {};
    
    // Date range filter
    if (startDate && endDate) {
      query.scheduledDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Filter by assigned user for Sub Admins
    if (req.user.role === 'admin') {
      query.assignedTo = req.user.id;
    }

    const stats = await Appointment.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          scheduled: { $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] } },
          confirmed: { $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] } },
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          noShow: { $sum: { $cond: [{ $eq: ['$status', 'no_show'] }, 1, 0] } },
          totalRevenue: { $sum: '$actualCost.total' },
          avgDuration: { $avg: '$actualDuration' }
        }
      }
    ]);

    res.json({
      success: true,
      data: { stats: stats[0] || {} }
    });

  } catch (error) {
    console.error('Get appointment stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
