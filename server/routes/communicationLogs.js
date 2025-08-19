const express = require('express');
const router = express.Router();
const CommunicationLog = require('../models/CommunicationLog');
const { authenticateToken } = require('../middleware/auth');
const Joi = require('joi');

// Validation schema for creating communication log
const createCommunicationLogSchema = Joi.object({
  customerId: Joi.string().required(),
  customerName: Joi.string().required(),
  date: Joi.string().required(),
  time: Joi.string().required(),
  type: Joi.string().valid('phone', 'email', 'in-person', 'sms').required(),
  direction: Joi.string().valid('inbound', 'outbound').required(),
  subject: Joi.string().allow('', null),
  content: Joi.string().required(),
  outcome: Joi.string().valid('resolved', 'follow-up-needed', 'appointment-scheduled', 'no-answer', 'callback-requested').required(),
  employeeName: Joi.string().required(),
  priority: Joi.string().valid('low', 'medium', 'high').required(),
  relatedService: Joi.string().allow('', null)
});

// Validation schema for updating communication log
const updateCommunicationLogSchema = Joi.object({
  customerId: Joi.string(),
  customerName: Joi.string(),
  date: Joi.string(),
  time: Joi.string(),
  type: Joi.string().valid('phone', 'email', 'in-person', 'sms'),
  direction: Joi.string().valid('inbound', 'outbound'),
  subject: Joi.string().allow('', null),
  content: Joi.string(),
  outcome: Joi.string().valid('resolved', 'follow-up-needed', 'appointment-scheduled', 'no-answer', 'callback-requested'),
  employeeName: Joi.string(),
  priority: Joi.string().valid('low', 'medium', 'high'),
  relatedService: Joi.string().allow('', null)
});

// Get all communication logs with filtering and pagination
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      type,
      outcome,
      customerId,
      dateFrom,
      dateTo,
      page = 1,
      limit = 10
    } = req.query;

    // Build filter object
    const filter = {};
    
    if (type && type !== 'all') {
      filter.type = type;
    }
    
    if (outcome && outcome !== 'all') {
      filter.outcome = outcome;
    }
    
    if (customerId) {
      filter.customerId = customerId;
    }
    
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = dateFrom;
      if (dateTo) filter.date.$lte = dateTo;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Get total count for pagination
    const total = await CommunicationLog.countDocuments(filter);
    
    // Get communication logs
    const logs = await CommunicationLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('customerId', 'name');

    // Calculate pagination info
    const totalPages = Math.ceil(total / parseInt(limit));
    const hasNextPage = parseInt(page) < totalPages;
    const hasPrevPage = parseInt(page) > 1;

    res.json({
      success: true,
      data: logs,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: total,
        hasNextPage,
        hasPrevPage
      }
    });
  } catch (error) {
    console.error('Error fetching communication logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch communication logs'
    });
  }
});

// Get communication log statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await CommunicationLog.aggregate([
      {
        $group: {
          _id: null,
          totalContacts: { $sum: 1 },
          phoneCalls: {
            $sum: { $cond: [{ $eq: ['$type', 'phone'] }, 1, 0] }
          },
          emails: {
            $sum: { $cond: [{ $eq: ['$type', 'email'] }, 1, 0] }
          },
          followUpsNeeded: {
            $sum: { $cond: [{ $eq: ['$outcome', 'follow-up-needed'] }, 1, 0] }
          },
          resolved: {
            $sum: { $cond: [{ $eq: ['$outcome', 'resolved'] }, 1, 0] }
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalContacts: 0,
      phoneCalls: 0,
      emails: 0,
      followUpsNeeded: 0,
      resolved: 0
    };

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching communication stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch communication statistics'
    });
  }
});

// Get single communication log by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const log = await CommunicationLog.findById(req.params.id)
      .populate('customerId', 'name');

    if (!log) {
      return res.status(404).json({
        success: false,
        message: 'Communication log not found'
      });
    }

    res.json({
      success: true,
      data: log
    });
  } catch (error) {
    console.error('Error fetching communication log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch communication log'
    });
  }
});

// Create new communication log
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Validate request body
    const { error, value } = createCommunicationLogSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Create communication log
    const communicationLog = new CommunicationLog({
      customerId: value.customerId,
      customerName: value.customerName,
      date: value.date,
      time: value.time,
      type: value.type,
      direction: value.direction,
      subject: value.subject,
      content: value.content,
      outcome: value.outcome,
      employeeId: req.user.id, // Use authenticated user as employee
      employeeName: value.employeeName,
      priority: value.priority,
      relatedService: value.relatedService
    });

    await communicationLog.save();

    // Populate customer info
    await communicationLog.populate('customerId', 'name');

    res.status(201).json({
      success: true,
      message: 'Communication log created successfully',
      data: communicationLog
    });
  } catch (error) {
    console.error('Error creating communication log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create communication log'
    });
  }
});

// Update communication log
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // Validate request body
    const { error, value } = updateCommunicationLogSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Find and update communication log
    const communicationLog = await CommunicationLog.findByIdAndUpdate(
      req.params.id,
      {
        customerId: value.customerId,
        customerName: value.customerName,
        date: value.date,
        time: value.time,
        type: value.type,
        direction: value.direction,
        subject: value.subject,
        content: value.content,
        outcome: value.outcome,
        employeeName: value.employeeName,
        priority: value.priority,
        relatedService: value.relatedService
      },
      { new: true, runValidators: true }
    ).populate('customerId', 'name');

    if (!communicationLog) {
      return res.status(404).json({
        success: false,
        message: 'Communication log not found'
      });
    }

    res.json({
      success: true,
      message: 'Communication log updated successfully',
      data: communicationLog
    });
  } catch (error) {
    console.error('Error updating communication log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update communication log'
    });
  }
});

// Delete communication log
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const communicationLog = await CommunicationLog.findByIdAndDelete(req.params.id);

    if (!communicationLog) {
      return res.status(404).json({
        success: false,
        message: 'Communication log not found'
      });
    }

    res.json({
      success: true,
      message: 'Communication log deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting communication log:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete communication log'
    });
  }
});

module.exports = router;
