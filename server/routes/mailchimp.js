const express = require('express');
const Joi = require('joi');
const MailChimpCampaign = require('../models/MailChimpCampaign');
const Customer = require('../models/Customer');
const { requireAnyAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const campaignSchema = Joi.object({
  name: Joi.string().required(),
  subject: Joi.string().required(),
  type: Joi.string().valid('regular', 'plaintext', 'absplit', 'rss', 'variate').default('regular'),
  content: Joi.object({
    html: Joi.string().optional(),
    plainText: Joi.string().optional(),
    template: Joi.string().optional()
  }).optional(),
  settings: Joi.object({
    title: Joi.string().optional(),
    fromName: Joi.string().required(),
    fromEmail: Joi.string().email().required(),
    replyTo: Joi.string().email().optional(),
    toName: Joi.string().optional(),
    autoFooter: Joi.boolean().default(true),
    inlineCss: Joi.boolean().default(false),
    autoTweet: Joi.boolean().default(false),
    fbComments: Joi.boolean().default(false),
    timewarp: Joi.boolean().default(false),
    templateId: Joi.number().optional(),
    dragAndDrop: Joi.boolean().default(true)
  }).required(),
  tracking: Joi.object({
    opens: Joi.boolean().default(true),
    htmlClicks: Joi.boolean().default(true),
    textClicks: Joi.boolean().default(false),
    goalTracking: Joi.boolean().default(false),
    ecomm360: Joi.boolean().default(false),
    googleAnalytics: Joi.string().optional(),
    clicktale: Joi.string().optional()
  }).optional(),
  recipients: Joi.object({
    listId: Joi.string().required(),
    listName: Joi.string().optional(),
    segmentText: Joi.string().optional(),
    recipientCount: Joi.number().default(0)
  }).required(),
  schedule: Joi.object({
    hour: Joi.number().min(0).max(23).optional(),
    dailySend: Joi.object().optional(),
    weeklySend: Joi.object().optional(),
    monthlySend: Joi.object().optional()
  }).optional(),
  sendTime: Joi.date().optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  notes: Joi.string().optional()
});

const campaignUpdateSchema = Joi.object({
  name: Joi.string().optional(),
  subject: Joi.string().optional(),
  type: Joi.string().valid('regular', 'plaintext', 'absplit', 'rss', 'variate').optional(),
  content: Joi.object({
    html: Joi.string().optional(),
    plainText: Joi.string().optional(),
    template: Joi.string().optional()
  }).optional(),
  settings: Joi.object({
    title: Joi.string().optional(),
    fromName: Joi.string().optional(),
    fromEmail: Joi.string().email().optional(),
    replyTo: Joi.string().email().optional(),
    toName: Joi.string().optional(),
    autoFooter: Joi.boolean().optional(),
    inlineCss: Joi.boolean().optional(),
    autoTweet: Joi.boolean().optional(),
    fbComments: Joi.boolean().optional(),
    timewarp: Joi.boolean().optional(),
    templateId: Joi.number().optional(),
    dragAndDrop: Joi.boolean().optional()
  }).optional(),
  tracking: Joi.object({
    opens: Joi.boolean().optional(),
    htmlClicks: Joi.boolean().optional(),
    textClicks: Joi.boolean().optional(),
    goalTracking: Joi.boolean().optional(),
    ecomm360: Joi.boolean().optional(),
    googleAnalytics: Joi.string().optional(),
    clicktale: Joi.string().optional()
  }).optional(),
  recipients: Joi.object({
    listId: Joi.string().optional(),
    listName: Joi.string().optional(),
    segmentText: Joi.string().optional(),
    recipientCount: Joi.number().optional()
  }).optional(),
  schedule: Joi.object({
    hour: Joi.number().min(0).max(23).optional(),
    dailySend: Joi.object().optional(),
    weeklySend: Joi.object().optional(),
    monthlySend: Joi.object().optional()
  }).optional(),
  sendTime: Joi.date().optional(),
  status: Joi.string().valid('save', 'paused', 'schedule', 'sending', 'sent', 'cancelled').optional(),
  tags: Joi.array().items(Joi.string()).optional(),
  notes: Joi.string().optional()
});

// @route   GET /api/mailchimp/campaigns
// @desc    Get all MailChimp campaigns with filtering and pagination
// @access  Private
router.get('/campaigns', requireAnyAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    // Filter by created user (Sub Admins can only see their own campaigns)
    if (req.user.role === 'admin') {
      query.createdBy = req.user.id;
    }

    if (status) query.status = status;
    if (type) query.type = type;

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { notes: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const campaigns = await MailChimpCampaign.find(query)
      .populate('createdBy', 'name email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count
    const total = await MailChimpCampaign.countDocuments(query);

    res.json({
      success: true,
      data: {
        campaigns,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalCampaigns: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get MailChimp campaigns error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/mailchimp/campaigns/:id
// @desc    Get single MailChimp campaign
// @access  Private
router.get('/campaigns/:id', requireAnyAdmin, async (req, res) => {
  try {
    const campaign = await MailChimpCampaign.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check if user has access to this campaign
    if (req.user.role === 'admin' && campaign.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { campaign }
    });

  } catch (error) {
    console.error('Get MailChimp campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/mailchimp/campaigns
// @desc    Create new MailChimp campaign
// @access  Private
router.post('/campaigns', requireAnyAdmin, async (req, res) => {
  try {
    // Validate input
    const { error, value } = campaignSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Generate unique campaign ID
    const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create campaign
    const campaign = new MailChimpCampaign({
      ...value,
      campaignId,
      createdBy: req.user.id
    });

    await campaign.save();

    // Populate references
    await campaign.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: { campaign }
    });

  } catch (error) {
    console.error('Create MailChimp campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/mailchimp/campaigns/:id
// @desc    Update MailChimp campaign
// @access  Private
router.put('/campaigns/:id', requireAnyAdmin, async (req, res) => {
  try {
    // Validate input
    const { error, value } = campaignUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const campaign = await MailChimpCampaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check if user has access to this campaign
    if (req.user.role === 'admin' && campaign.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update campaign
    Object.assign(campaign, value);
    await campaign.save();

    // Populate references
    await campaign.populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Campaign updated successfully',
      data: { campaign }
    });

  } catch (error) {
    console.error('Update MailChimp campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/mailchimp/campaigns/:id
// @desc    Delete MailChimp campaign
// @access  Private
router.delete('/campaigns/:id', requireAnyAdmin, async (req, res) => {
  try {
    const campaign = await MailChimpCampaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check if user has access to this campaign
    if (req.user.role === 'admin' && campaign.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await MailChimpCampaign.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });

  } catch (error) {
    console.error('Delete MailChimp campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/mailchimp/campaigns/:id/send
// @desc    Send MailChimp campaign
// @access  Private
router.post('/campaigns/:id/send', requireAnyAdmin, async (req, res) => {
  try {
    const campaign = await MailChimpCampaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    // Check if user has access to this campaign
    if (req.user.role === 'admin' && campaign.createdBy.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update campaign status to sent
    campaign.status = 'sent';
    campaign.sendTime = new Date();
    await campaign.save();

    res.json({
      success: true,
      message: 'Campaign sent successfully',
      data: { campaign }
    });

  } catch (error) {
    console.error('Send MailChimp campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/mailchimp/customers
// @desc    Get customers for email list
// @access  Private
router.get('/customers', requireAnyAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search,
      status
    } = req.query;

    // Build query
    const query = {};

    if (status) query.status = status;

    if (search) {
      query.$or = [
        { businessName: { $regex: search, $options: 'i' } },
        { 'contactPerson.name': { $regex: search, $options: 'i' } },
        { 'contactPerson.email': { $regex: search, $options: 'i' } }
      ];
    }

    // Execute query with pagination
    const customers = await Customer.find(query)
      .select('businessName contactPerson status')
      .sort({ businessName: 1 })
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
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalCustomers: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get customers for email list error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/mailchimp/stats/overview
// @desc    Get MailChimp statistics
// @access  Private
router.get('/stats/overview', requireAnyAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = {};
    
    // Date range filter
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Filter by created user for Sub Admins
    if (req.user.role === 'admin') {
      query.createdBy = req.user.id;
    }

    const stats = await MailChimpCampaign.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          sent: { $sum: { $cond: [{ $eq: ['$status', 'sent'] }, 1, 0] } },
          scheduled: { $sum: { $cond: [{ $eq: ['$status', 'schedule'] }, 1, 0] } },
          draft: { $sum: { $cond: [{ $eq: ['$status', 'save'] }, 1, 0] } },
          cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          totalOpens: { $sum: '$analytics.opens' },
          totalClicks: { $sum: '$analytics.clicks' },
          avgOpenRate: { $avg: '$analytics.openRate' },
          avgClickRate: { $avg: '$analytics.clickRate' },
          avgUnsubRate: { $avg: '$analytics.unsubRate' }
        }
      }
    ]);

    res.json({
      success: true,
      data: { stats: stats[0] || {} }
    });

  } catch (error) {
    console.error('Get MailChimp stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
