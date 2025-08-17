const express = require('express');
const Joi = require('joi');
const Chat = require('../models/Chat');
const User = require('../models/User');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const chatSchema = Joi.object({
  customer: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().optional(),
    phone: Joi.string().optional(),
    sessionId: Joi.string().required()
  }).required(),
  subject: Joi.string().max(200).optional(),
  category: Joi.string().valid('general', 'service', 'billing', 'technical', 'complaint', 'other').default('general'),
  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
  initialMessage: Joi.string().required()
});

const messageSchema = Joi.object({
  content: Joi.string().required(),
  messageType: Joi.string().valid('text', 'image', 'file', 'system').default('text'),
  attachments: Joi.array().items(Joi.object({
    filename: Joi.string().required(),
    url: Joi.string().required(),
    type: Joi.string().required()
  })).optional()
});

// @route   GET /api/chat
// @desc    Get all chats with filtering and pagination
// @access  Private
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      category,
      priority,
      assignedTo,
      search,
      sortBy = 'lastActivity',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};

    // Filter by assigned user (Sub Admins can only see their own chats)
    if (req.user.role === 'admin') {
      query.$or = [
        { assignedTo: req.user.id },
        { status: 'waiting' }
      ];
    } else if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;

    if (search) {
      query.$or = [
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.email': { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { 'messages.content': { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const chats = await Chat.find(query)
      .populate('assignedTo', 'name email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count
    const total = await Chat.countDocuments(query);

    res.json({
      success: true,
      data: {
        chats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalChats: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/chat/:id
// @desc    Get single chat with messages
// @access  Private
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('messages.sender', 'name email');

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user has access to this chat
    if (req.user.role === 'admin' && 
        chat.assignedTo && 
        chat.assignedTo._id.toString() !== req.user.id &&
        chat.status !== 'waiting') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { chat }
    });

  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/chat
// @desc    Create new chat (publicly accessible)
// @access  Public
router.post('/', async (req, res) => {
  try {
    // Validate input
    const { error, value } = chatSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    // Create initial message
    const initialMessage = {
      sender: {
        name: 'Customer',
        email: value.customer.email
      },
      content: value.initialMessage,
      messageType: 'text',
      isRead: false,
      createdAt: new Date()
    };

    // Create chat
    const chat = new Chat({
      customer: value.customer,
      subject: value.subject,
      category: value.category,
      priority: value.priority,
      status: 'waiting',
      messages: [initialMessage],
      lastActivity: new Date()
    });

    await chat.save();

    // Emit to Socket.io if available
    const io = req.app.get('io');
    if (io) {
      io.emit('new-chat', { chat });
    }

    res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      data: { chat }
    });

  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/chat/:id/messages
// @desc    Add message to chat
// @access  Private
router.post('/:id/messages', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Validate input
    const { error, value } = messageSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user has access to this chat
    if (req.user.role === 'admin' && 
        chat.assignedTo && 
        chat.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Create message
    const message = {
      sender: {
        name: req.user.name,
        email: req.user.email
      },
      content: value.content,
      messageType: value.messageType,
      attachments: value.attachments || [],
      isRead: false,
      createdAt: new Date()
    };

    // Add message to chat
    chat.messages.push(message);
    chat.lastActivity = new Date();
    
    // Update status if it was waiting
    if (chat.status === 'waiting') {
      chat.status = 'active';
    }

    await chat.save();

    // Emit to Socket.io if available
    const io = req.app.get('io');
    if (io) {
      io.to(`chat_${chat._id}`).emit('new-message', {
        chatId: chat._id,
        message,
        senderId: req.user.id
      });
    }

    res.json({
      success: true,
      message: 'Message added successfully',
      data: { message }
    });

  } catch (error) {
    console.error('Add message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/chat/:id/assign
// @desc    Assign chat to user
// @access  Private
router.put('/:id/assign', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { assignedTo, reason } = req.body;

    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user exists
    const user = await User.findById(assignedTo);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update chat assignment
    chat.assignedTo = assignedTo;
    chat.status = 'active';
    chat.lastActivity = new Date();

    // Add transfer note
    chat.messages.push({
      sender: {
        name: 'System',
        email: 'system@autocrm.com'
      },
      content: `Chat assigned to ${user.name}${reason ? ` - ${reason}` : ''}`,
      messageType: 'system',
      isRead: false,
      createdAt: new Date()
    });

    await chat.save();

    // Emit to Socket.io if available
    const io = req.app.get('io');
    if (io) {
      io.to(`user_${assignedTo}`).emit('chat-assigned', { chatId: chat._id });
      io.to(`chat_${chat._id}`).emit('chat-assigned', { 
        chatId: chat._id, 
        assignedTo: user.name 
      });
    }

    res.json({
      success: true,
      message: 'Chat assigned successfully',
      data: { chat }
    });

  } catch (error) {
    console.error('Assign chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/chat/:id/resolve
// @desc    Resolve chat
// @access  Private
router.put('/:id/resolve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { notes } = req.body;

    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user has access to this chat
    if (req.user.role === 'admin' && 
        chat.assignedTo && 
        chat.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update chat status
    chat.status = 'resolved';
    chat.lastActivity = new Date();

    // Add resolution note
    chat.messages.push({
      sender: {
        name: req.user.name,
        email: req.user.email
      },
      content: `Chat resolved${notes ? ` - ${notes}` : ''}`,
      messageType: 'system',
      isRead: false,
      createdAt: new Date()
    });

    await chat.save();

    // Emit to Socket.io if available
    const io = req.app.get('io');
    if (io) {
      io.to(`chat_${chat._id}`).emit('chat-resolved', { chatId: chat._id });
    }

    res.json({
      success: true,
      message: 'Chat resolved successfully',
      data: { chat }
    });

  } catch (error) {
    console.error('Resolve chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/chat/:id/close
// @desc    Close chat
// @access  Private
router.put('/:id/close', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Check if user has access to this chat
    if (req.user.role === 'admin' && 
        chat.assignedTo && 
        chat.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update chat status
    chat.status = 'closed';
    chat.lastActivity = new Date();

    await chat.save();

    // Emit to Socket.io if available
    const io = req.app.get('io');
    if (io) {
      io.to(`chat_${chat._id}`).emit('chat-closed', { chatId: chat._id });
    }

    res.json({
      success: true,
      message: 'Chat closed successfully',
      data: { chat }
    });

  } catch (error) {
    console.error('Close chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/chat/:id/rating
// @desc    Add rating to chat
// @access  Public
router.post('/:id/rating', async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found'
      });
    }

    // Add rating
    chat.rating = {
      score: rating,
      feedback: feedback || '',
      date: new Date()
    };

    await chat.save();

    res.json({
      success: true,
      message: 'Rating added successfully',
      data: { rating: chat.rating }
    });

  } catch (error) {
    console.error('Add rating error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
