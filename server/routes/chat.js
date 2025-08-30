const express = require('express');
const Joi = require('joi');
const Chat = require('../models/Chat');
const User = require('../models/User');
const { authenticateToken, requireAnyAdmin, requireCustomer } = require('../middleware/auth');

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
router.get('/', authenticateToken, requireAnyAdmin, async (req, res) => {
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

// @route   GET /api/chat/unread-count
// @desc    Get total unread message count for admin
// @access  Private
router.get('/unread-count', authenticateToken, requireAnyAdmin, async (req, res) => {
  try {
    // Build query based on user role
    const query = {};
    
    if (req.user.role === 'admin') {
      // Admin can see all unread messages
      query.$or = [
        { assignedTo: req.user.id },
        { status: 'waiting' }
      ];
    } else {
      // Sub admin can only see their assigned chats
      query.assignedTo = req.user.id;
    }

    // Get all chats that match the query
    const chats = await Chat.find(query).lean();
    
    // Calculate total unread messages manually since virtual properties don't work with .lean()
    let totalUnread = 0;
    chats.forEach(chat => {
      const unreadCount = chat.messages.filter(message => 
        !message.isRead && message.sender.name === 'Customer'
      ).length;
      totalUnread += unreadCount;
    });

    res.json({
      success: true,
      data: {
        unreadCount: totalUnread
      }
    });

  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/chat/customer
// @desc    Get customer's own chats
// @access  Private (Customer only)
router.get('/customer', authenticateToken, requireCustomer, async (req, res) => {
  try {
    const chats = await Chat.find({ 'customer.email': req.user.email })
      .sort({ lastActivity: -1 })
      .populate('assignedTo', 'name email');

    res.json({
      success: true,
      data: { chats }
    });
  } catch (error) {
    console.error('Get customer chats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/chat/:id/mark-read
// @desc    Mark chat messages as read
// @access  Private
router.put('/:id/mark-read', authenticateToken, requireAnyAdmin, async (req, res) => {
  try {
    console.log('Server: Mark as read request received for chat:', req.params.id);
    console.log('Server: User:', req.user.id, req.user.name);
    
    const chat = await Chat.findById(req.params.id);
    if (!chat) {
      console.log('Server: Chat not found');
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

    // Mark all customer messages as read
    let markedCount = 0;
    chat.messages.forEach(message => {
      if (message.sender.name === 'Customer') {
        message.isRead = true;
        markedCount++;
      }
    });

    console.log('Server: Marked', markedCount, 'customer messages as read');

    await chat.save();
    console.log('Server: Chat saved successfully');

    // Emit Socket.io event for real-time updates
    const io = req.app.get('io');
    if (io) {
      io.emit('chat-message-read', { 
        chatId: chat._id,
        userId: req.user.id 
      });
    }

    res.json({
      success: true,
      message: 'Messages marked as read successfully',
      data: { chat }
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/chat/:id
// @desc    Get single chat with messages
// @access  Private (Admin or Customer for their own chats)
router.get('/:id', authenticateToken, async (req, res) => {
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
    if (req.user.role === 'customer') {
      // Customers can only view their own chats
      if (chat.customer.email !== req.user.email) {
        return res.status(403).json({
          success: false,
          message: 'Access denied - you can only view your own chats'
        });
      }
    } else if (req.user.role === 'admin' || req.user.role === 'super_admin') {
      // Admins can view chats they're assigned to or waiting chats
      if (chat.assignedTo && 
          chat.assignedTo._id.toString() !== req.user.id &&
          chat.status !== 'waiting') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied - invalid user role'
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
// @desc    Create new chat (requires customer authentication)
// @access  Private (Customer only)
router.post('/', authenticateToken, requireCustomer, async (req, res) => {
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
        email: req.user.email
      },
      content: value.initialMessage,
      messageType: 'text',
      isRead: false,
      createdAt: new Date()
    };

    // Create chat
    const chat = new Chat({
      customer: {
        name: req.user.name,
        email: req.user.email,
        sessionId: value.customer.sessionId
      },
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
router.post('/:id/messages', authenticateToken, requireAnyAdmin, async (req, res) => {
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

    // Create message (let MongoDB generate _id)
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

    // Emit to Socket.io if available (ADMIN MESSAGE)
    const io = req.app.get('io');
    if (io) {
      console.log(`🔔 Server: Emitting new-message to chat ${chat._id}:`, {
        content: message.content,
        sender: message.sender.name,
        messageId: message._id
      });
      
      io.to(`chat_${chat._id}`).emit('new-message', {
        chatId: chat._id,
        message,
        senderId: req.user.id
      });
      
      console.log(`✅ Server: Message emitted successfully to chat ${chat._id}`);
    } else {
      console.log('⚠️ Server: Socket.io not available for message emission');
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

// @route   POST /api/chat/:id/customer-messages
// @desc    Add message to chat from customer
// @access  Private (Customer only)
router.post('/:id/customer-messages', authenticateToken, requireCustomer, async (req, res) => {
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

    // Verify this customer owns this chat (by email)
    if (chat.customer.email !== req.user.email) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - you can only send messages to your own chats'
      });
    }

    // Create message (let MongoDB generate _id)
    const message = {
      sender: {
        name: 'Customer',
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

    // Emit to Socket.io if available (CUSTOMER MESSAGE)
    const io = req.app.get('io');
    if (io) {
      console.log(`🔔 Server: Emitting new-message to chat ${chat._id}:`, {
        content: message.content,
        sender: message.sender.name,
        messageId: message._id
      });
      
      io.to(`chat_${chat._id}`).emit('new-message', {
        chatId: chat._id,
        message,
        senderId: req.user.id
      });
      
      console.log(`✅ Server: Message emitted successfully to chat ${chat._id}`);
    } else {
      console.log('⚠️ Server: Socket.io not available for message emission');
    }

    res.json({
      success: true,
      message: 'Message added successfully',
      data: { message }
    });

  } catch (error) {
    console.error('Add customer message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/chat/:id/assign
// @desc    Assign chat to user
// @access  Private
router.put('/:id/assign', authenticateToken, requireAnyAdmin, async (req, res) => {
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
router.put('/:id/resolve', authenticateToken, requireAnyAdmin, async (req, res) => {
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
router.put('/:id/close', authenticateToken, requireAnyAdmin, async (req, res) => {
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

// @route   GET /api/chat/stats
// @desc    Get chat statistics
// @access  Private
router.get('/stats', authenticateToken, requireAnyAdmin, async (req, res) => {
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

    // Filter by assigned user for Sub Admins
    if (req.user.role === 'admin') {
      query.$or = [
        { assignedTo: req.user.id },
        { status: 'waiting' }
      ];
    }

    const stats = await Chat.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalChats: { $sum: 1 },
          activeChats: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          waitingChats: { $sum: { $cond: [{ $eq: ['$status', 'waiting'] }, 1, 0] } },
          resolvedChats: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          closedChats: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
          avgResponseTime: { $avg: '$responseTime' }
        }
      }
    ]);

    res.json({
      success: true,
      data: { stats: stats[0] || {} }
    });

  } catch (error) {
    console.error('Get chat stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
