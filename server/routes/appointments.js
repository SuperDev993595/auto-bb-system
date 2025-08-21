const express = require('express');
const Joi = require('joi');
const Appointment = require('../models/Appointment');
const Customer = require('../models/Customer');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const { Service } = require('../models/Service');
const { Technician } = require('../models/Service');
const { requireAnyAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const appointmentSchema = Joi.object({
  customerId: Joi.string().required(),
  vehicleId: Joi.string().optional(),
  serviceType: Joi.string().required(),
  date: Joi.date().required(),
  time: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  notes: Joi.string().optional(),
  status: Joi.string().valid('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show').default('scheduled'),
  // Legacy fields for backward compatibility
  customer: Joi.string().optional(),
  vehicle: Joi.string().optional(),
  serviceDescription: Joi.string().optional(),
  scheduledDate: Joi.date().optional(),
  scheduledTime: Joi.string().optional(),
  estimatedDuration: Joi.number().min(15).max(480).optional(),
  assignedTo: Joi.string().optional(),
  technician: Joi.string().optional(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
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
  vehicle: Joi.string().optional(), // Vehicle ID reference
  serviceType: Joi.string().optional(), // ObjectId reference to ServiceCatalog
  serviceDescription: Joi.string().optional(),
  scheduledDate: Joi.date().optional(),
  scheduledTime: Joi.string().pattern(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  estimatedDuration: Joi.number().min(15).max(480).optional(),
  status: Joi.string().valid('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show').optional(),
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
router.get('/', requireAnyAdmin, async (req, res) => {
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
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const appointments = await Appointment.find(query)
      .populate('assignedTo', 'name email')
      .populate('technician', 'name email specializations')
      .populate('customer', 'name email phone businessName')
      .populate('vehicle', 'year make model vin licensePlate mileage')
      .populate('serviceType', 'name category estimatedDuration')
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

// @route   GET /api/appointments/vehicles
// @desc    Get all vehicles for appointment creation (admin access)
// @access  Private
router.get('/vehicles', requireAnyAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      customer,
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    if (customer) query.customer = customer;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { make: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { vin: { $regex: search, $options: 'i' } },
        { licensePlate: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const vehicles = await Vehicle.find(query)
      .populate('customer', 'name email businessName')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Transform vehicles to match frontend expectations
    const transformedVehicles = vehicles.map(vehicle => ({
      id: vehicle._id,
      year: vehicle.year,
      make: vehicle.make,
      model: vehicle.model,
      vin: vehicle.vin,
      licensePlate: vehicle.licensePlate,
      color: vehicle.color,
      mileage: vehicle.mileage,
      status: vehicle.status,
      fuelType: vehicle.fuelType,
      transmission: vehicle.transmission,
      lastServiceDate: vehicle.lastServiceDate,
      nextServiceDate: vehicle.nextServiceDate,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt,
      customer: vehicle.customer
    }));

    // Get total count
    const total = await Vehicle.countDocuments(query);

    res.json({
      success: true,
      data: {
        vehicles: transformedVehicles,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalVehicles: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching vehicles for appointments:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// @route   POST /api/appointments/vehicles
// @desc    Create a new vehicle for appointment creation (admin access)
// @access  Private
router.post('/vehicles', requireAnyAdmin, async (req, res) => {
  try {
    const {
      year,
      make,
      model,
      vin,
      licensePlate,
      color,
      mileage,
      status,
      customer
    } = req.body;

    // Validate required fields
    if (!year || !make || !model || !customer) {
      return res.status(400).json({
        success: false,
        message: 'Year, make, model, and customer are required'
      });
    }

         // Check if VIN already exists
     if (vin && vin !== 'N/A') {
       const existingVehicle = await Vehicle.findOne({ vin: vin });
       if (existingVehicle) {
         return res.status(400).json({
           success: false,
           message: `Vehicle with VIN ${vin} already exists`
         });
       }
     }

     // Generate unique VIN if not provided or if it's 'N/A'
     let finalVin = vin;
     if (!finalVin || finalVin === 'N/A') {
       // Generate a unique VIN based on timestamp and random number
       const timestamp = Date.now().toString();
       const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
       finalVin = `GEN${timestamp.slice(-8)}${random}`;
     }

     // Create new vehicle
     const newVehicle = new Vehicle({
       year,
       make,
       model,
       vin: finalVin,
       licensePlate: licensePlate || 'N/A',
       color: color || 'Unknown',
       mileage: mileage || 0,
       status: status || 'active',
       customer
     });

     const savedVehicle = await newVehicle.save();

    // Populate customer information
    await savedVehicle.populate('customer', 'name email businessName');

    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: {
        vehicle: {
          id: savedVehicle._id,
          year: savedVehicle.year,
          make: savedVehicle.make,
          model: savedVehicle.model,
          vin: savedVehicle.vin,
          licensePlate: savedVehicle.licensePlate,
          color: savedVehicle.color,
          mileage: savedVehicle.mileage,
          status: savedVehicle.status,
          customer: savedVehicle.customer,
          createdAt: savedVehicle.createdAt,
          updatedAt: savedVehicle.updatedAt
        }
      }
    });
  } catch (error) {
    console.error('Error creating vehicle for appointments:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// @route   GET /api/appointments/customers
// @desc    Get all customers for appointment creation (admin access)
// @access  Private
router.get('/customers', requireAnyAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 100,
      search,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    if (status) query.status = status;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { businessName: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const customers = await Customer.find(query)
      .populate('userId', 'name email phone businessName')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Transform customers to match frontend expectations
    const transformedCustomers = customers.map(customer => ({
      id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      businessName: customer.businessName,
      status: customer.status,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt
    }));

    // Get total count
    const total = await Customer.countDocuments(query);

    res.json({
      success: true,
      data: {
        customers: transformedCustomers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalCustomers: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching customers for appointments:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// @route   GET /api/appointments/:id
// @desc    Get single appointment
// @access  Private
router.get('/:id', requireAnyAdmin, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('technician', 'name email specializations')
      .populate('customer', 'name email phone businessName')
      .populate('vehicle', 'year make model vin licensePlate mileage')
      .populate('serviceType', 'name category estimatedDuration')
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
router.post('/', requireAnyAdmin, async (req, res) => {
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
    const customer = await Customer.findById(value.customerId || value.customer);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if vehicle exists and belongs to customer (if provided)
    if (value.vehicleId || value.vehicle) {
      const Vehicle = require('../models/Vehicle');
      const vehicle = await Vehicle.findOne({ 
        _id: value.vehicleId || value.vehicle, 
        customer: value.customerId || value.customer 
      });
      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: 'Vehicle not found or does not belong to customer'
        });
      }
    }

    // Check if assigned user exists (if provided)
    if (value.assignedTo) {
      const assignedUser = await User.findById(value.assignedTo);
      if (!assignedUser) {
        return res.status(404).json({
          success: false,
          message: 'Assigned user not found'
        });
      }
    }

    // Check if technician exists (if provided)
    if (value.technician) {
      const technician = await Technician.findById(value.technician);
      if (!technician) {
        return res.status(404).json({
          success: false,
          message: 'Technician not found'
        });
      }
    }

    // Create appointment with field mapping
    const appointmentData = {
      customer: value.customerId || value.customer,
      vehicle: value.vehicleId || value.vehicle,
      serviceType: value.serviceType,
      serviceDescription: value.serviceDescription || value.serviceType,
      scheduledDate: value.date || value.scheduledDate,
      scheduledTime: value.time || value.scheduledTime,
      estimatedDuration: value.estimatedDuration || 60, // Default 1 hour
      assignedTo: value.assignedTo || req.user.id,
      technician: value.technician,
      priority: value.priority,
      status: value.status,
      notes: value.notes,
      customerNotes: value.customerNotes,
      partsRequired: value.partsRequired,
      tags: value.tags,
      createdBy: req.user.id
    };

    const appointment = new Appointment(appointmentData);



    await appointment.save();

    // Populate references
    await appointment.populate('assignedTo', 'name email');
    await appointment.populate('technician', 'name email specializations');
    await appointment.populate('customer', 'name email phone businessName');
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
router.put('/:id', requireAnyAdmin, async (req, res) => {
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

    // Update appointment using findByIdAndUpdate to avoid validation issues with existing data
    const updatedAppointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true, runValidators: false }
    );

    // Populate references
    await updatedAppointment.populate('assignedTo', 'name email');
    await updatedAppointment.populate('technician', 'name email specializations');
    await updatedAppointment.populate('customer', 'name email phone businessName');
    await updatedAppointment.populate('vehicle', 'year make model vin licensePlate mileage');
    await updatedAppointment.populate('serviceType', 'name category estimatedDuration');
    await updatedAppointment.populate('createdBy', 'name');

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: { appointment: updatedAppointment }
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
router.delete('/:id', requireAnyAdmin, async (req, res) => {
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
router.get('/calendar/:date', requireAnyAdmin, async (req, res) => {
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
      .populate('technician', 'name email specializations')
      .populate('customer', 'name email phone businessName')
      .populate('vehicle', 'year make model vin licensePlate mileage')
      .populate('serviceType', 'name category estimatedDuration')
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
router.get('/stats/overview', requireAnyAdmin, async (req, res) => {
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
          inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          noShow: { $sum: { $cond: [{ $eq: ['$status', 'no-show'] }, 1, 0] } },
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
