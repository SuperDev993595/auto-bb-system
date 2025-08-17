const express = require('express');
const Joi = require('joi');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const smsService = require('../services/smsService');
const Customer = require('../models/Customer');

const router = express.Router();

// Validation schemas
const sendSMSSchema = Joi.object({
  to: Joi.string().required(),
  message: Joi.string().min(1).max(1600).required(), // SMS character limit
  scheduledAt: Joi.date().optional(),
  priority: Joi.string().valid('low', 'normal', 'high').default('normal'),
  customData: Joi.object().optional()
});

const bulkSMSSchema = Joi.object({
  recipients: Joi.array().items(Joi.object({
    phone: Joi.string().required(),
    name: Joi.string().optional(),
    customData: Joi.object().optional()
  })).min(1).required(),
  message: Joi.string().min(1).max(1600).required(),
  scheduledAt: Joi.date().optional(),
  priority: Joi.string().valid('low', 'normal', 'high').default('normal')
});

const customerSMSSchema = Joi.object({
  customerIds: Joi.array().items(Joi.string()).min(1).required(),
  message: Joi.string().min(1).max(1600).required(),
  scheduledAt: Joi.date().optional(),
  priority: Joi.string().valid('low', 'normal', 'high').default('normal'),
  template: Joi.string().optional()
});

// @route   POST /api/sms/send
// @desc    Send a single SMS
// @access  Private
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { error, value } = sendSMSSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Validate and format phone number
    const formattedPhone = smsService.formatPhoneNumber(value.to);
    if (!smsService.validatePhoneNumber(formattedPhone)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid phone number format'
      });
    }

    let result;
    if (value.scheduledAt) {
      result = await smsService.sendScheduledSMS(
        formattedPhone,
        value.message,
        value.scheduledAt,
        {
          priority: value.priority,
          customData: value.customData,
          sentBy: req.user.id
        }
      );
    } else {
      result = await smsService.sendSMS(
        formattedPhone,
        value.message,
        {
          priority: value.priority,
          customData: value.customData,
          sentBy: req.user.id
        }
      );
    }

    res.json({
      success: true,
      message: 'SMS sent successfully',
      data: result
    });

  } catch (error) {
    console.error('Send SMS error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send SMS'
    });
  }
});

// @route   POST /api/sms/bulk
// @desc    Send bulk SMS to multiple recipients
// @access  Private
router.post('/bulk', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { error, value } = bulkSMSSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Validate and format phone numbers
    const validatedRecipients = [];
    const invalidRecipients = [];

    for (const recipient of value.recipients) {
      const formattedPhone = smsService.formatPhoneNumber(recipient.phone);
      if (smsService.validatePhoneNumber(formattedPhone)) {
        validatedRecipients.push({
          ...recipient,
          phone: formattedPhone
        });
      } else {
        invalidRecipients.push({
          phone: recipient.phone,
          error: 'Invalid phone number format'
        });
      }
    }

    if (validatedRecipients.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid phone numbers provided'
      });
    }

    const result = await smsService.sendBulkSMS(
      validatedRecipients,
      value.message,
      {
        priority: value.priority,
        scheduledAt: value.scheduledAt,
        sentBy: req.user.id
      }
    );

    // Add invalid recipients to errors
    result.errors = [...result.errors, ...invalidRecipients];

    res.json({
      success: true,
      message: 'Bulk SMS sent successfully',
      data: result
    });

  } catch (error) {
    console.error('Bulk SMS error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send bulk SMS'
    });
  }
});

// @route   POST /api/sms/customers
// @desc    Send SMS to customers by customer IDs
// @access  Private
router.post('/customers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { error, value } = customerSMSSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Get customers with phone numbers
    const customers = await Customer.find({
      _id: { $in: value.customerIds },
      'contactPerson.phone': { $exists: true, $ne: '' }
    }).select('contactPerson.name contactPerson.phone');

    if (customers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No customers found with valid phone numbers'
      });
    }

    // Prepare recipients
    const recipients = customers.map(customer => ({
      phone: customer.contactPerson.phone,
      name: customer.contactPerson.name,
      customerId: customer._id,
      customData: {
        customerId: customer._id,
        customerName: customer.contactPerson.name
      }
    }));

    // Process message template if provided
    let message = value.message;
    if (value.template) {
      // Apply template variables
      message = message.replace(/\{\{customerName\}\}/g, '{{customerName}}');
    }

    const result = await smsService.sendBulkSMS(
      recipients,
      message,
      {
        priority: value.priority,
        scheduledAt: value.scheduledAt,
        sentBy: req.user.id,
        template: value.template
      }
    );

    res.json({
      success: true,
      message: 'Customer SMS sent successfully',
      data: {
        ...result,
        totalCustomers: customers.length,
        customersWithPhones: customers.length
      }
    });

  } catch (error) {
    console.error('Customer SMS error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to send customer SMS'
    });
  }
});

// @route   GET /api/sms/status/:messageId
// @desc    Get SMS delivery status
// @access  Private
router.get('/status/:messageId', authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const status = await smsService.getDeliveryStatus(messageId);
    
    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('Get SMS status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get SMS status'
    });
  }
});

// @route   GET /api/sms/templates
// @desc    Get SMS templates
// @access  Private
router.get('/templates', authenticateToken, async (req, res) => {
  try {
    // Mock SMS templates - in real app, these would be in database
    const templates = [
      {
        id: '1',
        name: 'Appointment Reminder',
        message: 'Hi {{customerName}}, your appointment is scheduled for {{appointmentDate}} at {{appointmentTime}}. Please arrive 10 minutes early. Reply STOP to unsubscribe.',
        variables: ['customerName', 'appointmentDate', 'appointmentTime'],
        category: 'appointments'
      },
      {
        id: '2',
        name: 'Service Due Reminder',
        message: 'Hi {{customerName}}, your {{vehicleInfo}} is due for service. Current mileage: {{currentMileage}}. Call us to schedule: {{businessPhone}}.',
        variables: ['customerName', 'vehicleInfo', 'currentMileage', 'businessPhone'],
        category: 'service'
      },
      {
        id: '3',
        name: 'Payment Reminder',
        message: 'Hi {{customerName}}, payment for invoice #{{invoiceNumber}} is due on {{dueDate}}. Amount: ${{amount}}. Pay online: {{paymentLink}}.',
        variables: ['customerName', 'invoiceNumber', 'dueDate', 'amount', 'paymentLink'],
        category: 'billing'
      },
      {
        id: '4',
        name: 'Service Completion',
        message: 'Hi {{customerName}}, your vehicle service is complete and ready for pickup. Total: ${{totalAmount}}. Thank you for choosing {{businessName}}!',
        variables: ['customerName', 'totalAmount', 'businessName'],
        category: 'service'
      },
      {
        id: '5',
        name: 'Follow-up',
        message: 'Hi {{customerName}}, how was your recent service experience? We value your feedback. Call us: {{businessPhone}}.',
        variables: ['customerName', 'businessPhone'],
        category: 'follow-up'
      }
    ];

    res.json({
      success: true,
      data: templates
    });

  } catch (error) {
    console.error('Get SMS templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get SMS templates'
    });
  }
});

// @route   POST /api/sms/templates
// @desc    Create SMS template
// @access  Private
router.post('/templates', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, message, variables, category } = req.body;

    if (!name || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name and message are required'
      });
    }

    // In a real app, save to database
    const template = {
      id: Date.now().toString(),
      name,
      message,
      variables: variables || [],
      category: category || 'general',
      createdBy: req.user.id,
      createdAt: new Date()
    };

    res.status(201).json({
      success: true,
      message: 'SMS template created successfully',
      data: template
    });

  } catch (error) {
    console.error('Create SMS template error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create SMS template'
    });
  }
});

// @route   GET /api/sms/analytics
// @desc    Get SMS analytics
// @access  Private
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Mock analytics data - in real app, this would come from database
    const analytics = {
      overview: {
        totalSent: 1250,
        delivered: 1180,
        failed: 70,
        deliveryRate: 94.4
      },
      recentActivity: [
        {
          id: '1',
          type: 'sms_sent',
          recipient: '+1234567890',
          message: 'Appointment reminder sent',
          timestamp: new Date(Date.now() - 3600000)
        },
        {
          id: '2',
          type: 'sms_delivered',
          recipient: '+1234567890',
          message: 'Appointment reminder delivered',
          timestamp: new Date(Date.now() - 7200000)
        }
      ],
      topTemplates: [
        { name: 'Appointment Reminder', sent: 450, deliveryRate: 95.2 },
        { name: 'Service Due Reminder', sent: 320, deliveryRate: 93.8 },
        { name: 'Payment Reminder', sent: 280, deliveryRate: 94.6 }
      ],
      providerStats: {
        twilio: { sent: 800, delivered: 760, failed: 40 },
        nexmo: { sent: 300, delivered: 285, failed: 15 },
        'aws-sns': { sent: 150, delivered: 135, failed: 15 }
      }
    };

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Get SMS analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get SMS analytics'
    });
  }
});

// @route   POST /api/sms/webhook
// @desc    Handle SMS webhooks from providers
// @access  Public
router.post('/webhook', async (req, res) => {
  try {
    const { provider } = req.query;
    
    // Handle different provider webhooks
    switch (provider) {
      case 'twilio':
        // Handle Twilio webhook
        console.log('Twilio webhook:', req.body);
        break;
      case 'nexmo':
        // Handle Nexmo webhook
        console.log('Nexmo webhook:', req.body);
        break;
      default:
        console.log('Unknown provider webhook:', req.body);
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('SMS webhook error:', error);
    res.status(500).json({ success: false });
  }
});

module.exports = router;
