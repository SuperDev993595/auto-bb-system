const express = require('express');
const Joi = require('joi');
const { authenticateToken, requireCustomer } = require('../middleware/auth');
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Appointment = require('../models/Appointment');
const { Service } = require('../models/Service');
const Invoice = require('../models/Invoice');
const Message = require('../models/Message');
const Notification = require('../models/Notification');
const notificationService = require('../services/notificationService');

const router = express.Router();

// Validation schemas
const vehicleSchema = Joi.object({
  year: Joi.number().integer().min(1900).max(new Date().getFullYear() + 1).required(),
  make: Joi.string().min(1).max(50).required(),
  model: Joi.string().min(1).max(50).required(),
  vin: Joi.string().min(17).max(17).required(),
  licensePlate: Joi.string().min(1).max(20).required(),
  color: Joi.string().min(1).max(30).required(),
  mileage: Joi.number().integer().min(0).required(),
  status: Joi.string().valid('active', 'inactive', 'maintenance').default('active')
});

const appointmentSchema = Joi.object({
  date: Joi.string().required(),
  time: Joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
  serviceType: Joi.string().min(1).max(100).required(),
  vehicleId: Joi.string().required(),
  notes: Joi.string().max(500).allow('').optional(),
  status: Joi.string().valid('scheduled', 'in-progress', 'completed', 'cancelled').default('scheduled')
});

const messageSchema = Joi.object({
  subject: Joi.string().min(1).max(200).required(),
  message: Joi.string().min(1).max(2000).required(),
  type: Joi.string().valid('appointment', 'reminder', 'general', 'service', 'support').default('general'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  relatedAppointment: Joi.string().optional(),
  relatedVehicle: Joi.string().optional()
});

// Get customer profile
router.get('/profile', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        user,
        profile: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          businessName: user.businessName || '',
          address: user.address || {
            street: '',
            city: '',
            state: '',
            zipCode: ''
          },
          preferences: user.preferences || {
            notifications: { email: true, sms: true, push: false },
            reminders: { appointments: true, maintenance: true, payments: true },
            privacy: { shareData: false, marketing: false }
          },
          createdAt: user.createdAt,
          lastLogin: user.lastLogin || user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update customer profile
router.put('/profile', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { name, email, phone, businessName, address, preferences } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phone) updateData.phone = phone;
    if (businessName !== undefined) updateData.businessName = businessName;
    if (address) updateData.address = address;
    if (preferences) updateData.preferences = preferences;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Error updating customer profile:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get customer vehicles
router.get('/vehicles', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ customerId: req.user.id }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: { vehicles }
    });
  } catch (error) {
    console.error('Error fetching customer vehicles:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Add new vehicle
router.post('/vehicles', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { error, value } = vehicleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const vehicle = new Vehicle({
      ...value,
      customerId: req.user.id
    });

    await vehicle.save();

    res.status(201).json({
      success: true,
      message: 'Vehicle added successfully',
      data: { vehicle }
    });
  } catch (error) {
    console.error('Error adding vehicle:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update vehicle
router.put('/vehicles/:id', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { error, value } = vehicleSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const vehicle = await Vehicle.findOneAndUpdate(
      { _id: req.params.id, customerId: req.user.id },
      value,
      { new: true, runValidators: true }
    );

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    res.json({
      success: true,
      message: 'Vehicle updated successfully',
      data: { vehicle }
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Delete vehicle
router.delete('/vehicles/:id', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const vehicle = await Vehicle.findOneAndDelete({
      _id: req.params.id,
      customerId: req.user.id
    });

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found' });
    }

    res.json({
      success: true,
      message: 'Vehicle deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get customer appointments
router.get('/appointments', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const appointments = await Appointment.find({ customer: req.user.id })
      .sort({ scheduledDate: -1, scheduledTime: -1 });
    
    // Transform appointments to match frontend expectations
    const transformedAppointments = appointments.map(appointment => ({
      id: appointment._id,
      date: appointment.scheduledDate.toISOString().split('T')[0],
      time: appointment.scheduledTime,
      serviceType: appointment.serviceDescription,
      vehicleId: appointment.vehicle?.vin || '', // Use VIN as vehicle identifier
      vehicleInfo: `${appointment.vehicle?.year} ${appointment.vehicle?.make} ${appointment.vehicle?.model}`,
      status: appointment.status,
      estimatedDuration: `${appointment.estimatedDuration} minutes`,
      notes: appointment.notes,
      technician: appointment.technician,
      totalCost: appointment.estimatedCost?.total || 0,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt
    }));
    
    res.json({
      success: true,
      data: { appointments: transformedAppointments }
    });
  } catch (error) {
    console.error('Error fetching customer appointments:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Create new appointment
router.post('/appointments', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { error, value } = appointmentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    // Verify vehicle belongs to customer
    const vehicle = await Vehicle.findOne({
      _id: value.vehicleId,
      customerId: req.user.id
    });

    if (!vehicle) {
      return res.status(400).json({ success: false, message: 'Invalid vehicle' });
    }

    // Map service type to enum values
    const serviceTypeMap = {
      'Oil Change & Inspection': 'maintenance',
      'Brake Service': 'brake_service',
      'Tire Rotation': 'tire_rotation',
      'Tire Replacement': 'tire_rotation',
      'Battery Replacement': 'electrical_repair',
      'Air Filter Replacement': 'maintenance',
      'Spark Plug Replacement': 'engine_repair',
      'Transmission Service': 'transmission_service',
      'Coolant Flush': 'maintenance',
      'Power Steering Service': 'maintenance',
      'Suspension Service': 'maintenance',
      'Exhaust System Repair': 'engine_repair',
      'Electrical System Repair': 'electrical_repair',
      'AC/Heating Service': 'maintenance',
      'Diagnostic Service': 'diagnostic',
      'Custom Service': 'other'
    };

    // Create appointment with proper field mapping
    const appointment = new Appointment({
      customer: req.user.id,
      vehicle: {
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        vin: vehicle.vin,
        licensePlate: vehicle.licensePlate,
        mileage: vehicle.mileage
      },
      serviceType: serviceTypeMap[value.serviceType] || 'other',
      serviceDescription: value.serviceType,
      scheduledDate: new Date(value.date),
      scheduledTime: value.time,
      estimatedDuration: 60, // Default 1 hour
      status: value.status || 'scheduled',
      createdBy: req.user.id,
      assignedTo: req.user.id, // For now, assign to the customer (will be updated by admin)
      notes: value.notes,
      priority: 'medium'
    });

    await appointment.save();

    res.status(201).json({
      success: true,
      message: 'Appointment scheduled successfully',
      data: { appointment }
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update appointment
router.put('/appointments/:id', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { error, value } = appointmentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    // Verify vehicle belongs to customer
    const vehicle = await Vehicle.findOne({
      _id: value.vehicleId,
      customerId: req.user.id
    });

    if (!vehicle) {
      return res.status(400).json({ success: false, message: 'Invalid vehicle' });
    }

    // Map service type to enum values
    const serviceTypeMap = {
      'Oil Change & Inspection': 'maintenance',
      'Brake Service': 'brake_service',
      'Tire Rotation': 'tire_rotation',
      'Tire Replacement': 'tire_rotation',
      'Battery Replacement': 'electrical_repair',
      'Air Filter Replacement': 'maintenance',
      'Spark Plug Replacement': 'engine_repair',
      'Transmission Service': 'transmission_service',
      'Coolant Flush': 'maintenance',
      'Power Steering Service': 'maintenance',
      'Suspension Service': 'maintenance',
      'Exhaust System Repair': 'engine_repair',
      'Electrical System Repair': 'electrical_repair',
      'AC/Heating Service': 'maintenance',
      'Diagnostic Service': 'diagnostic',
      'Custom Service': 'other'
    };

    const updateData = {
      vehicle: {
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        vin: vehicle.vin,
        licensePlate: vehicle.licensePlate,
        mileage: vehicle.mileage
      },
      serviceType: serviceTypeMap[value.serviceType] || 'other',
      serviceDescription: value.serviceType,
      scheduledDate: new Date(value.date),
      scheduledTime: value.time,
      notes: value.notes
    };

    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, customer: req.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: { appointment }
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Confirm appointment
router.put('/appointments/:id/confirm', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, customer: req.user.id, status: 'scheduled' },
      { 
        status: 'confirmed',
        confirmedAt: new Date(),
        confirmedBy: req.user.id
      },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found or already confirmed' });
    }

    res.json({
      success: true,
      message: 'Appointment confirmed successfully',
      data: { appointment }
    });
  } catch (error) {
    console.error('Error confirming appointment:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Cancel appointment
router.delete('/appointments/:id', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const appointment = await Appointment.findOneAndUpdate(
      { _id: req.params.id, customer: req.user.id },
      { status: 'cancelled' },
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: { appointment }
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get customer service history
router.get('/services', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const services = await Service.find({ customerId: req.user.id })
      .populate('vehicleId', 'year make model')
      .sort({ date: -1 });
    
    res.json({
      success: true,
      data: { services }
    });
  } catch (error) {
    console.error('Error fetching customer services:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get customer invoices
router.get('/invoices', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const invoices = await Invoice.find({ customerId: req.user.id })
      .populate('appointmentId', 'date serviceType')
      .populate('vehicleId', 'year make model')
      .sort({ date: -1 });
    
    res.json({
      success: true,
      data: { invoices }
    });
  } catch (error) {
    console.error('Error fetching customer invoices:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Process payment for invoice
router.post('/invoices/:id/pay', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { paymentMethod, paymentReference } = req.body;
    
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      customerId: req.user.id
    });

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({ success: false, message: 'Invoice is already paid' });
    }

    // Update invoice with payment information
    invoice.status = 'paid';
    invoice.paymentDate = new Date();
    invoice.paymentMethod = paymentMethod || 'online';
    invoice.paymentReference = paymentReference || `PAY-${Date.now()}`;

    await invoice.save();

    res.json({
      success: true,
      message: 'Payment processed successfully',
      data: { invoice }
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Download invoice PDF
router.get('/invoices/:id/download', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({
      _id: req.params.id,
      customerId: req.user.id
    }).populate('vehicleId', 'year make model');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    // For now, return a simple JSON response
    // In a real implementation, you would generate a PDF here
    res.json({
      success: true,
      message: 'Invoice download initiated',
      data: { 
        invoice,
        downloadUrl: `/api/customers/invoices/${invoice._id}/pdf`
      }
    });
  } catch (error) {
    console.error('Error downloading invoice:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get customer messages
router.get('/messages', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, isRead } = req.query;
    const skip = (page - 1) * limit;

    const filter = { customerId: req.user.id };
    if (type) filter.type = type;
    if (isRead !== undefined) filter.isRead = isRead === 'true';

    const messages = await Message.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('relatedAppointment', 'date time serviceType')
      .populate('relatedVehicle', 'year make model');

    const total = await Message.countDocuments(filter);

    res.json({
      success: true,
      data: { 
        messages,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching customer messages:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Send new message
router.post('/messages', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { error, value } = messageSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const message = new Message({
      ...value,
      customerId: req.user.id,
      from: 'customer',
      fromName: user.name || user.email,
      isRead: false
    });

    await message.save();

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message }
    });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Mark message as read
router.put('/messages/:id/read', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      { _id: req.params.id, customerId: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.json({
      success: true,
      message: 'Message marked as read',
      data: { message }
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Delete message
router.delete('/messages/:id', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const message = await Message.findOneAndDelete({
      _id: req.params.id,
      customerId: req.user.id
    });

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get customer dashboard data
router.get('/dashboard', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const customerId = req.user.id;

    // Get counts
    const vehicleCount = await Vehicle.countDocuments({ customerId });
    const appointmentCount = await Appointment.countDocuments({ customer: customerId });
    const serviceCount = await Service.countDocuments({ customerId });
    const invoiceCount = await Invoice.countDocuments({ customerId });

    // Get recent appointments
    const recentAppointments = await Appointment.find({ customer: customerId })
      .sort({ scheduledDate: -1, scheduledTime: -1 })
      .limit(5);

    // Get upcoming appointments
    const upcomingAppointments = await Appointment.find({
      customer: customerId,
      scheduledDate: { $gte: new Date() },
      status: 'scheduled'
    })
      .sort({ scheduledDate: 1, scheduledTime: 1 })
      .limit(5);

    // Get recent services
    const recentServices = await Service.find({ customerId })
      .populate('vehicleId', 'year make model')
      .sort({ date: -1 })
      .limit(5);

    // Get outstanding invoices
    const outstandingInvoices = await Invoice.find({
      customerId,
      status: { $in: ['pending', 'overdue'] }
    })
      .populate('vehicleId', 'year make model')
      .sort({ dueDate: 1 });

    const totalOutstanding = outstandingInvoices.reduce((sum, invoice) => sum + invoice.total, 0);

    res.json({
      success: true,
      data: {
        stats: {
          vehicles: vehicleCount,
          appointments: appointmentCount,
          services: serviceCount,
          invoices: invoiceCount,
          outstandingAmount: totalOutstanding
        },
        recentAppointments,
        upcomingAppointments,
        recentServices,
        outstandingInvoices
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get customer notifications
router.get('/notifications', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = { customer: req.user.id };
    if (type) filter.type = type;
    if (status) filter.status = status;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Notification.countDocuments(filter);
    const unreadCount = await notificationService.getUnreadCount(req.user.id);

    res.json({
      success: true,
      data: { 
        notifications,
        unreadCount,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching customer notifications:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: { notification }
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Mark all notifications as read
router.put('/notifications/read-all', authenticateToken, requireCustomer, async (req, res) => {
  try {
    await Notification.updateMany(
      { 
        customer: req.user.id,
        status: { $in: ['sent', 'delivered'] }
      },
      { 
        status: 'read',
        readAt: new Date()
      }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
