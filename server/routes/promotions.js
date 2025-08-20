const express = require('express');
const Joi = require('joi');
const Promotion = require('../models/Promotion');
const { requireAnyAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const promotionSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  description: Joi.string().max(1000).required(),
  type: Joi.string().valid('discount', 'service', 'referral', 'seasonal').required(),
  discountValue: Joi.number().min(0).required(),
  discountType: Joi.string().valid('percentage', 'fixed').required(),
  startDate: Joi.date().required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required(),
  status: Joi.string().valid('active', 'scheduled', 'ended', 'paused').default('scheduled'),
  targetAudience: Joi.string().required(),
  maxUsage: Joi.number().min(1).optional(),
  conditions: Joi.string().max(500).optional()
});

const promotionUpdateSchema = Joi.object({
  title: Joi.string().min(3).max(200).optional(),
  description: Joi.string().max(1000).optional(),
  type: Joi.string().valid('discount', 'service', 'referral', 'seasonal').optional(),
  discountValue: Joi.number().min(0).optional(),
  discountType: Joi.string().valid('percentage', 'fixed').optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  status: Joi.string().valid('active', 'scheduled', 'ended', 'paused').optional(),
  targetAudience: Joi.string().optional(),
  maxUsage: Joi.number().min(1).optional(),
  conditions: Joi.string().max(500).optional()
});

// @route   GET /api/promotions
// @desc    Get all promotions with filtering and pagination
// @access  Private
router.get('/', requireAnyAdmin, async (req, res) => {
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
    const query = { isActive: true };
    
    if (status) query.status = status;
    if (type) query.type = type;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { targetAudience: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const promotions = await Promotion.find(query)
      .populate('createdBy', 'name email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count
    const total = await Promotion.countDocuments(query);

    res.json({
      success: true,
      data: {
        promotions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalPromotions: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get promotions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/promotions/:id
// @desc    Get single promotion by ID
// @access  Private
router.get('/:id', requireAnyAdmin, async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    res.json({
      success: true,
      data: { promotion }
    });

  } catch (error) {
    console.error('Get promotion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/promotions
// @desc    Create new promotion
// @access  Private
router.post('/', requireAnyAdmin, async (req, res) => {
  try {
    // Validate input
    const { error, value } = promotionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Create new promotion
    const promotion = new Promotion({
      ...value,
      createdBy: req.user.id
    });

    await promotion.save();

    // Populate creator info
    await promotion.populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Promotion created successfully',
      data: { promotion }
    });

  } catch (error) {
    console.error('Create promotion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/promotions/:id
// @desc    Update promotion
// @access  Private
router.put('/:id', requireAnyAdmin, async (req, res) => {
  try {
    // Validate input
    const { error, value } = promotionUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    // Update promotion
    Object.assign(promotion, value);
    await promotion.save();

    // Populate creator info
    await promotion.populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Promotion updated successfully',
      data: { promotion }
    });

  } catch (error) {
    console.error('Update promotion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/promotions/:id
// @desc    Delete promotion (soft delete)
// @access  Private
router.delete('/:id', requireAnyAdmin, async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    // Soft delete
    promotion.isActive = false;
    await promotion.save();

    res.json({
      success: true,
      message: 'Promotion deleted successfully'
    });

  } catch (error) {
    console.error('Delete promotion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/promotions/:id/status
// @desc    Update promotion status
// @access  Private
router.put('/:id/status', requireAnyAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'scheduled', 'ended', 'paused'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const promotion = await Promotion.findById(req.params.id);
    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: 'Promotion not found'
      });
    }

    promotion.status = status;
    await promotion.save();

    await promotion.populate('createdBy', 'name email');

    res.json({
      success: true,
      message: 'Promotion status updated successfully',
      data: { promotion }
    });

  } catch (error) {
    console.error('Update promotion status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/promotions/stats/overview
// @desc    Get promotion statistics
// @access  Private
router.get('/stats/overview', requireAnyAdmin, async (req, res) => {
  try {
    const stats = await Promotion.getStats();

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalPromotions: 0,
          activePromotions: 0,
          scheduledPromotions: 0,
          totalUsage: 0,
          avgDiscountValue: 0
        }
      }
    });

  } catch (error) {
    console.error('Get promotion stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/promotions/active
// @desc    Get active promotions
// @access  Private
router.get('/active', requireAnyAdmin, async (req, res) => {
  try {
    const activePromotions = await Promotion.getActivePromotions()
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      data: { activePromotions }
    });

  } catch (error) {
    console.error('Get active promotions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
