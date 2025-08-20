const express = require('express');
const Joi = require('joi');
const smsService = require('../services/smsService');
const { requireAnyAdmin } = require('../middleware/auth');
const router = express.Router();

// Validation schemas
const sendSMSSchema = Joi.object({
  to: Joi.string().required(),
  message: Joi.string().max(1600).required(),
  scheduledAt: Joi.date().optional(),
  priority: Joi.string().valid('low', 'normal', 'high').default('normal')
});

const bulkSMSSchema = Joi.object({
  recipients: Joi.array().items(
    Joi.object({
      phone: Joi.string().required()
    })
  ).min(1).required(),
  message: Joi.string().max(1600).required(),
  scheduledAt: Joi.date().optional(),
  priority: Joi.string().valid('low', 'normal', 'high').default('normal')
});

const templateSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  message: Joi.string().max(1600).required(),
  variables: Joi.array().items(Joi.string()).optional(),
  category: Joi.string().valid('appointment', 'reminder', 'promotion', 'notification', 'custom').default('custom'),
  description: Joi.string().max(500).optional()
});

// @route   POST /api/sms/send
// @desc    Send single SMS
// @access  Private
router.post('/send', requireAnyAdmin, async (req, res) => {
  try {
    const { error, value } = sendSMSSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const result = await smsService.sendSMS(value, req.user.id);
    
    res.json({
      success: true,
      message: 'SMS sent successfully',
      data: result.data
    });
  } catch (error) {
    console.error('Send SMS error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send SMS' 
    });
  }
});

// @route   POST /api/sms/bulk
// @desc    Send bulk SMS
// @access  Private
router.post('/bulk', requireAnyAdmin, async (req, res) => {
  try {
    const { error, value } = bulkSMSSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const result = await smsService.sendBulkSMS(
      value.recipients, 
      value.message, 
      {
        priority: value.priority,
        scheduledAt: value.scheduledAt
      }, 
      req.user.id
    );
    
    res.json({
      success: true,
      message: `Bulk SMS sent to ${result.data.successful} recipients`,
      data: result.data
    });
  } catch (error) {
    console.error('Bulk SMS error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send bulk SMS' 
    });
  }
});

// @route   GET /api/sms/history
// @desc    Get SMS history
// @access  Private
router.get('/history', requireAnyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, to } = req.query;
    const filters = {};
    
    if (status) filters.status = status;
    if (to) filters.to = to;

    const result = await smsService.getHistory(filters, parseInt(page), parseInt(limit));
    
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Get SMS history error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get SMS history' 
    });
  }
});

// @route   GET /api/sms/analytics
// @desc    Get SMS analytics
// @access  Private
router.get('/analytics', requireAnyAdmin, async (req, res) => {
  try {
    const stats = await smsService.getStats();
    
    res.json({
      success: true,
      data: {
        overview: stats
      }
    });
  } catch (error) {
    console.error('Get SMS analytics error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get SMS analytics' 
    });
  }
});

// @route   GET /api/sms/templates
// @desc    Get SMS templates
// @access  Private
router.get('/templates', requireAnyAdmin, async (req, res) => {
  try {
    const { category } = req.query;
    const filters = {};
    
    if (category) filters.category = category;

    const templates = await smsService.getTemplates(filters);
    
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
router.post('/templates', requireAnyAdmin, async (req, res) => {
  try {
    const { error, value } = templateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const template = await smsService.createTemplate(value, req.user.id);
    
    res.status(201).json({
      success: true,
      message: 'Template created successfully',
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

// @route   POST /api/sms/templates/:id/use
// @desc    Use SMS template
// @access  Private
router.post('/templates/:id/use', requireAnyAdmin, async (req, res) => {
  try {
    const { variables = {} } = req.body;
    const templateId = req.params.id;

    const result = await smsService.useTemplate(templateId, variables);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Use SMS template error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to use SMS template' 
    });
  }
});

module.exports = router;
