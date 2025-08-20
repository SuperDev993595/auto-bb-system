require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const businessClientRoutes = require('./routes/businessClients');

// Initialize cron service for automated notifications
require('./services/cronService');
const appointmentRoutes = require('./routes/appointments');
const marketingRoutes = require('./routes/marketing');
const salesRoutes = require('./routes/sales');
const collectionsRoutes = require('./routes/collections');
const taskRoutes = require('./routes/tasks');
const promotionRoutes = require('./routes/promotions');
const reportRoutes = require('./routes/reports');
const userRoutes = require('./routes/users');
const uploadRoutes = require('./routes/upload');
const chatRoutes = require('./routes/chat');
const yellowPagesRoutes = require('./routes/yellowpages');
const mailchimpRoutes = require('./routes/mailchimp');
const servicesRoutes = require('./routes/services');
const inventoryRoutes = require('./routes/inventory');
const invoicesRoutes = require('./routes/invoices');
const remindersRoutes = require('./routes/reminders');
const communicationLogsRoutes = require('./routes/communicationLogs');
const dashboardRoutes = require('./routes/dashboard');
const adminRoutes = require('./routes/admin');
const emailRoutes = require('./routes/email');
const smsRoutes = require('./routes/sms');
const systemAdminRoutes = require('./routes/systemAdmin');

// Import models for Socket.io
const Chat = require('./models/Chat');

// Import middleware
const { authenticateToken } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);
  
  // Join user to their personal room
  socket.on('join-user', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their room`);
  });
  
  // Join chat room
  socket.on('join-chat', (chatId) => {
    socket.join(`chat_${chatId}`);
    console.log(`User joined chat room: ${chatId}`);
  });
  
  // Handle new chat message
  socket.on('send-message', async (data) => {
    try {
      const { chatId, message, senderId } = data;
      
      // Emit to chat room
      io.to(`chat_${chatId}`).emit('new-message', {
        chatId,
        message,
        senderId,
        timestamp: new Date()
      });
      
      // Notify assigned user if different from sender
      const chat = await Chat.findById(chatId).populate('assignedTo');
      if (chat && chat.assignedTo && chat.assignedTo._id.toString() !== senderId) {
        io.to(`user_${chat.assignedTo._id}`).emit('chat-notification', {
          chatId,
          message: message.content.substring(0, 50) + '...',
          sender: message.sender?.name || 'Customer'
        });
      }
    } catch (error) {
      console.error('Socket message error:', error);
    }
  });
  
  // Handle chat assignment
  socket.on('chat-assigned', (data) => {
    const { chatId, assignedToId } = data;
    io.to(`user_${assignedToId}`).emit('chat-assigned', { chatId });
  });
  
  // Handle typing indicator
  socket.on('typing', (data) => {
    const { chatId, userId, isTyping } = data;
    socket.to(`chat_${chatId}`).emit('user-typing', { userId, isTyping });
  });
  
  // Handle chat status changes
  socket.on('chat-status-changed', (data) => {
    const { chatId, status, assignedToId } = data;
    io.to(`chat_${chatId}`).emit('status-updated', { chatId, status });
    if (assignedToId) {
      io.to(`user_${assignedToId}`).emit('chat-status-notification', { chatId, status });
    }
  });
  
  // Handle new chat creation
  socket.on('new-chat', (data) => {
    const { chat, availableAgents } = data;
    // Notify all available agents
    availableAgents.forEach(agentId => {
      io.to(`user_${agentId}`).emit('new-chat-available', { chat });
    });
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Make io available to routes
app.set('io', io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/business-clients', businessClientRoutes);
app.use('/api/appointments', authenticateToken, appointmentRoutes);
app.use('/api/marketing', authenticateToken, marketingRoutes);
app.use('/api/sales', authenticateToken, salesRoutes);
app.use('/api/collections', authenticateToken, collectionsRoutes);
app.use('/api/tasks', authenticateToken, taskRoutes);
app.use('/api/promotions', authenticateToken, promotionRoutes);
app.use('/api/reports', authenticateToken, reportRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/upload', authenticateToken, uploadRoutes);
app.use('/api/chat', authenticateToken, chatRoutes);
app.use('/api/yellowpages', authenticateToken, yellowPagesRoutes);
app.use('/api/mailchimp', authenticateToken, mailchimpRoutes);
app.use('/api/services', authenticateToken, servicesRoutes);
app.use('/api/inventory', authenticateToken, inventoryRoutes);
app.use('/api/invoices', authenticateToken, invoicesRoutes);
app.use('/api/reminders', authenticateToken, remindersRoutes);
app.use('/api/communication-logs', authenticateToken, communicationLogsRoutes);
app.use('/api/dashboard', authenticateToken, dashboardRoutes);
app.use('/api/admin', authenticateToken, adminRoutes);
app.use('/api/email', authenticateToken, emailRoutes);
app.use('/api/sms', authenticateToken, smsRoutes);
app.use('/api/system-admin', authenticateToken, systemAdminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3001;

// Connect to database and start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Dashboard: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = { app, server, io };
