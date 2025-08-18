const express = require('express');
const Joi = require('joi');
const { ServiceCatalog, WorkOrder, Technician } = require('../models/Service');
const Customer = require('../models/Customer');
const { requireAnyAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const serviceCatalogSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().optional(),
  category: Joi.string().valid('maintenance', 'repair', 'diagnostic', 'inspection', 'emergency', 'preventive', 'other').required(),
  estimatedDuration: Joi.number().min(15).required(),
  laborRate: Joi.number().min(0).required(),
  parts: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    partNumber: Joi.string().optional(),
    quantity: Joi.number().min(1).required(),
    unitPrice: Joi.number().min(0).required(),
    totalPrice: Joi.number().min(0).required(),
    inStock: Joi.boolean().default(true)
  })).optional(),
  isActive: Joi.boolean().default(true)
});

const workOrderSchema = Joi.object({
  customer: Joi.string().required(),
  vehicle: Joi.object({
    make: Joi.string().required(),
    model: Joi.string().required(),
    year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).required(),
    vin: Joi.string().optional(),
    licensePlate: Joi.string().optional(),
    mileage: Joi.number().min(0).optional()
  }).required(),
  services: Joi.array().items(Joi.object({
    service: Joi.string().required(),
    description: Joi.string().optional(),
    laborHours: Joi.number().min(0).required(),
    laborRate: Joi.number().min(0).required(),
    parts: Joi.array().items(Joi.object({
      name: Joi.string().required(),
      partNumber: Joi.string().optional(),
      quantity: Joi.number().min(1).required(),
      unitPrice: Joi.number().min(0).required(),
      totalPrice: Joi.number().min(0).required(),
      inStock: Joi.boolean().default(true)
    })).optional(),
    totalCost: Joi.number().min(0).required()
  })).min(1).required(),
  technician: Joi.string().required(),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  estimatedStartDate: Joi.date().optional(),
  estimatedCompletionDate: Joi.date().optional(),
  notes: Joi.string().optional(),
  customerNotes: Joi.string().optional()
});

const technicianSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string().optional(),
  hourlyRate: Joi.number().min(0).required(),
  specializations: Joi.array().items(Joi.string()).optional(),
  certifications: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    issuingAuthority: Joi.string().optional(),
    issueDate: Joi.date().optional(),
    expiryDate: Joi.date().optional()
  })).optional(),
  isActive: Joi.boolean().default(true)
});

// Service Catalog Routes
// @route   GET /api/services/catalog
// @desc    Get all service catalog items
// @access  Private
router.get('/catalog', requireAnyAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      isActive,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build query
    const query = {};

    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const services = await ServiceCatalog.find(query)
      .populate('createdBy', 'name email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count
    const total = await ServiceCatalog.countDocuments(query);

    res.json({
      success: true,
      data: {
        services,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalServices: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get service catalog error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/services/catalog
// @desc    Create new service catalog item
// @access  Private
router.post('/catalog', requireAnyAdmin, async (req, res) => {
  try {
    // Validate input
    const { error, value } = serviceCatalogSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Create service
    const service = new ServiceCatalog({
      ...value,
      createdBy: req.user.id
    });

    await service.save();

    // Populate references
    await service.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: { service }
    });

  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/services/catalog/:id
// @desc    Update service catalog item
// @access  Private
router.put('/catalog/:id', requireAnyAdmin, async (req, res) => {
  try {
    // Validate input
    const { error, value } = serviceCatalogSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const service = await ServiceCatalog.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Update service
    Object.assign(service, value);
    await service.save();

    // Populate references
    await service.populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Service updated successfully',
      data: { service }
    });

  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/services/catalog/:id
// @desc    Delete service catalog item
// @access  Private
router.delete('/catalog/:id', requireAnyAdmin, async (req, res) => {
  try {
    const service = await ServiceCatalog.findById(req.params.id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    await ServiceCatalog.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Service deleted successfully'
    });

  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Work Orders Routes
// @route   GET /api/services/workorders
// @desc    Get all work orders
// @access  Private
router.get('/workorders', requireAnyAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      technician,
      customer,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (technician) query.technician = technician;
    if (customer) query.customer = customer;

    if (search) {
      query.$or = [
        { workOrderNumber: { $regex: search, $options: 'i' } },
        { 'vehicle.make': { $regex: search, $options: 'i' } },
        { 'vehicle.model': { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const workOrders = await WorkOrder.find(query)
      .populate('customer', 'businessName contactPerson')
      .populate('technician', 'name email')
      .populate('services.service', 'name description')
      .populate('createdBy', 'name email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count
    const total = await WorkOrder.countDocuments(query);

    res.json({
      success: true,
      data: {
        workOrders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalWorkOrders: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get work orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/services/workorders
// @desc    Create new work order
// @access  Private
router.post('/workorders', requireAnyAdmin, async (req, res) => {
  try {
    // Validate input
    const { error, value } = workOrderSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Check if customer exists
    const customer = await Customer.findById(value.customer);
    if (!customer) {
      return res.status(400).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Check if technician exists
    const technician = await Technician.findById(value.technician);
    if (!technician) {
      return res.status(400).json({
        success: false,
        message: 'Technician not found'
      });
    }

    // Create work order
    const workOrder = new WorkOrder({
      ...value,
      createdBy: req.user.id
    });

    await workOrder.save();

    // Populate references
    await workOrder.populate('customer', 'businessName contactPerson');
    await workOrder.populate('technician', 'name email');
    await workOrder.populate('services.service', 'name description');
    await workOrder.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Work order created successfully',
      data: { workOrder }
    });

  } catch (error) {
    console.error('Create work order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/services/workorders/:id/status
// @desc    Update work order status
// @access  Private
router.put('/workorders/:id/status', requireAnyAdmin, async (req, res) => {
  try {
    const { status, notes } = req.body;

    const workOrder = await WorkOrder.findById(req.params.id);
    if (!workOrder) {
      return res.status(404).json({
        success: false,
        message: 'Work order not found'
      });
    }

    await workOrder.updateStatus(status, notes);

    // Populate references
    await workOrder.populate('customer', 'businessName contactPerson');
    await workOrder.populate('technician', 'name email');
    await workOrder.populate('services.service', 'name description');
    await workOrder.populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Work order status updated successfully',
      data: { workOrder }
    });

  } catch (error) {
    console.error('Update work order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Technicians Routes
// @route   GET /api/services/technicians
// @desc    Get all technicians
// @access  Private
router.get('/technicians', requireAnyAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      isActive,
      search,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    // Build query
    const query = {};

    if (isActive !== undefined) query.isActive = isActive === 'true';

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { specializations: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const technicians = await Technician.find(query)
      .populate('createdBy', 'name email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count
    const total = await Technician.countDocuments(query);

    res.json({
      success: true,
      data: {
        technicians,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalTechnicians: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get technicians error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/services/technicians
// @desc    Create new technician
// @access  Private
router.post('/technicians', requireAnyAdmin, async (req, res) => {
  try {
    // Validate input
    const { error, value } = technicianSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Create technician
    const technician = new Technician({
      ...value,
      createdBy: req.user.id
    });

    await technician.save();

    // Populate references
    await technician.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Technician created successfully',
      data: { technician }
    });

  } catch (error) {
    console.error('Create technician error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/services/technicians/:id
// @desc    Update technician
// @access  Private
router.put('/technicians/:id', requireAnyAdmin, async (req, res) => {
  try {
    // Validate input
    const { error, value } = technicianSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const technician = await Technician.findById(req.params.id);
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }

    // Update technician
    Object.assign(technician, value);
    await technician.save();

    // Populate references
    await technician.populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Technician updated successfully',
      data: { technician }
    });

  } catch (error) {
    console.error('Update technician error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/services/technicians/:id
// @desc    Delete technician
// @access  Private
router.delete('/technicians/:id', requireAnyAdmin, async (req, res) => {
  try {
    const technician = await Technician.findById(req.params.id);
    if (!technician) {
      return res.status(404).json({
        success: false,
        message: 'Technician not found'
      });
    }

    await Technician.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Technician deleted successfully'
    });

  } catch (error) {
    console.error('Delete technician error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
