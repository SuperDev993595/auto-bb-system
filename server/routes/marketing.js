const express = require('express');
const Joi = require('joi');
const MarketingCampaign = require('../models/MarketingCampaign');
const MarketingTemplate = require('../models/MarketingTemplate');
const { requireAnyAdmin } = require('../middleware/auth');
const router = express.Router();

// Validation schemas
const campaignSchema = Joi.object({
  name: Joi.string().min(3).max(200).required(),
  type: Joi.string().valid('email', 'sms', 'mailchimp').required(),
  subject: Joi.string().max(500).allow('', null).optional(),
  content: Joi.string().required(),
  recipients: Joi.array().items(Joi.string()).optional(),
  scheduledAt: Joi.date().optional(),
  template: Joi.string().optional(),
  tags: Joi.array().items(Joi.string()).optional()
});

// @route   GET /api/marketing/campaigns
// @desc    Get all marketing campaigns
// @access  Private
router.get('/campaigns', requireAnyAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, search } = req.query;
    const query = { isActive: true };
    
    if (status) query.status = status;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } }
      ];
    }

    const campaigns = await MarketingCampaign.find(query)
      .populate('createdBy', 'name email')
      .populate('template', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await MarketingCampaign.countDocuments(query);

    res.json({
      success: true,
      data: {
        campaigns,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalCampaigns: total
        }
      }
    });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/marketing/campaigns
// @desc    Create new campaign
// @access  Private
router.post('/campaigns', requireAnyAdmin, async (req, res) => {
  try {
    const { error, value } = campaignSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const campaign = new MarketingCampaign({
      ...value,
      recipientCount: value.recipients ? value.recipients.length : 0,
      createdBy: req.user.id
    });

    await campaign.save();
    await campaign.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: { campaign }
    });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/marketing/campaigns/:id/status
// @desc    Update campaign status
// @access  Private
router.put('/campaigns/:id/status', requireAnyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const campaign = await MarketingCampaign.findById(req.params.id);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    await campaign.updateStatus(status);
    await campaign.populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Campaign status updated successfully',
      data: { campaign }
    });
  } catch (error) {
    console.error('Update campaign status error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/marketing/campaigns/:id
// @desc    Delete campaign
// @access  Private
router.delete('/campaigns/:id', requireAnyAdmin, async (req, res) => {
  try {
    const campaign = await MarketingCampaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }

    campaign.isActive = false;
    await campaign.save();

    res.json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/marketing/campaigns/stats/overview
// @desc    Get campaign statistics
// @access  Private
router.get('/campaigns/stats/overview', requireAnyAdmin, async (req, res) => {
  try {
    const stats = await MarketingCampaign.getStats();
    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalCampaigns: 0,
          activeCampaigns: 0,
          totalRecipients: 0,
          totalSent: 0,
          totalOpened: 0,
          totalClicked: 0
        }
      }
    });
  } catch (error) {
    console.error('Get campaign stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
