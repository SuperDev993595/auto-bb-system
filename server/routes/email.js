const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const nodemailer = require('nodemailer');

// Email validation schemas
const emailSchema = Joi.object({
  to: Joi.array().items(Joi.string().email()).min(1).required(),
  cc: Joi.array().items(Joi.string().email()).optional(),
  bcc: Joi.array().items(Joi.string().email()).optional(),
  subject: Joi.string().min(1).max(200).required(),
  content: Joi.string().min(1).required(),
  template: Joi.string().optional(),
  attachments: Joi.array().items(Joi.object({
    filename: Joi.string().required(),
    content: Joi.string().required(),
    contentType: Joi.string().required()
  })).optional(),
  scheduledAt: Joi.date().optional(),
  trackOpens: Joi.boolean().default(true),
  trackClicks: Joi.boolean().default(true)
});

const emailTemplateSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  subject: Joi.string().min(1).max(200).required(),
  content: Joi.string().min(1).required(),
  variables: Joi.array().items(Joi.string()).optional(),
  category: Joi.string().optional(),
  isActive: Joi.boolean().default(true)
});

// Mock email templates data (in real app, this would be in database)
let emailTemplates = [
  {
    id: '1',
    name: 'Appointment Confirmation',
    subject: 'Your appointment has been confirmed',
    content: `
      <h2>Appointment Confirmation</h2>
      <p>Dear \${customerName},</p>
      <p>Your appointment has been confirmed for \${appointmentDate} at \${appointmentTime}.</p>
      <p>Service: \${serviceName}</p>
      <p>Location: \${location}</p>
      <p>Please arrive 10 minutes before your scheduled time.</p>
      <p>Best regards,<br>Auto Repair Service Team</p>
    `,
    variables: ['customerName', 'appointmentDate', 'appointmentTime', 'serviceName', 'location'],
    category: 'appointments',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '2',
    name: 'Payment Reminder',
    subject: 'Payment reminder for invoice #\${invoiceNumber}',
    content: `
      <h2>Payment Reminder</h2>
      <p>Dear \${customerName},</p>
      <p>This is a friendly reminder that payment for invoice #\${invoiceNumber} is due on \${dueDate}.</p>
      <p>Amount: $\${amount}</p>
      <p>Please contact us if you have any questions.</p>
      <p>Best regards,<br>Auto Repair Service Team</p>
    `,
    variables: ['customerName', 'invoiceNumber', 'dueDate', 'amount'],
    category: 'payments',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: '3',
    name: 'Service Completion',
    subject: 'Your vehicle service is complete',
    content: `
      <h2>Service Completion</h2>
      <p>Dear \${customerName},</p>
      <p>Your vehicle service has been completed successfully.</p>
      <p>Service Details:</p>
      <ul>
        <li>Service: \${serviceName}</li>
        <li>Technician: \${technicianName}</li>
        <li>Completion Date: \${completionDate}</li>
      </ul>
      <p>Your vehicle is ready for pickup.</p>
      <p>Best regards,<br>Auto Repair Service Team</p>
    `,
    variables: ['customerName', 'serviceName', 'technicianName', 'completionDate'],
    category: 'services',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Mock email campaigns data
let emailCampaigns = [
  {
    id: '1',
    name: 'Monthly Newsletter',
    subject: 'Auto Repair Service - Monthly Newsletter',
    content: 'Monthly newsletter content...',
    status: 'sent',
    recipients: 150,
    sent: 150,
    opened: 89,
    clicked: 23,
    bounced: 2,
    createdAt: new Date(Date.now() - 86400000),
    sentAt: new Date(Date.now() - 86400000)
  },
  {
    id: '2',
    name: 'Holiday Promotion',
    subject: 'Special Holiday Discount - 20% Off!',
    content: 'Holiday promotion content...',
    status: 'scheduled',
    recipients: 200,
    sent: 0,
    opened: 0,
    clicked: 0,
    bounced: 0,
    scheduledAt: new Date(Date.now() + 86400000),
    createdAt: new Date()
  }
];

// Get email templates
router.get('/templates', authenticateToken, async (req, res) => {
  try {
    const { category, isActive } = req.query;
    
    let filteredTemplates = emailTemplates;
    
    if (category) {
      filteredTemplates = filteredTemplates.filter(template => template.category === category);
    }
    
    if (isActive !== undefined) {
      filteredTemplates = filteredTemplates.filter(template => template.isActive === (isActive === 'true'));
    }
    
    res.json({
      success: true,
      data: filteredTemplates
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get email template by ID
router.get('/templates/:id', authenticateToken, async (req, res) => {
  try {
    const template = emailTemplates.find(t => t.id === req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    
    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create email template
router.post('/templates', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { error, value } = emailTemplateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }
    
    const newTemplate = {
      id: Date.now().toString(),
      ...value,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    emailTemplates.push(newTemplate);
    
    res.status(201).json({
      success: true,
      data: newTemplate
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update email template
router.put('/templates/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { error, value } = emailTemplateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }
    
    const templateIndex = emailTemplates.findIndex(t => t.id === req.params.id);
    if (templateIndex === -1) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    
    emailTemplates[templateIndex] = {
      ...emailTemplates[templateIndex],
      ...value,
      updatedAt: new Date()
    };
    
    res.json({
      success: true,
      data: emailTemplates[templateIndex]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete email template
router.delete('/templates/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const templateIndex = emailTemplates.findIndex(t => t.id === req.params.id);
    if (templateIndex === -1) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    
    emailTemplates.splice(templateIndex, 1);
    
    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send email
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { error, value } = emailSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }
    
    // In a real application, you would:
    // 1. Configure nodemailer with your SMTP settings
    // 2. Send the email
    // 3. Store email record in database
    // 4. Track opens and clicks if enabled
    
    // Mock email sending
    const emailRecord = {
      id: Date.now().toString(),
      ...value,
      status: 'sent',
      sentAt: new Date(),
      createdAt: new Date(),
      trackingId: `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    res.json({
      success: true,
      data: emailRecord,
      message: 'Email sent successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get email campaigns
router.get('/campaigns', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    let filteredCampaigns = emailCampaigns;
    
    if (status) {
      filteredCampaigns = filteredCampaigns.filter(campaign => campaign.status === status);
    }
    
    // Pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedCampaigns = filteredCampaigns.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: paginatedCampaigns,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredCampaigns.length,
        totalPages: Math.ceil(filteredCampaigns.length / parseInt(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get email campaign by ID
router.get('/campaigns/:id', authenticateToken, async (req, res) => {
  try {
    const campaign = emailCampaigns.find(c => c.id === req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }
    
    res.json({
      success: true,
      data: campaign
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create email campaign
router.post('/campaigns', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, subject, content, recipients, scheduledAt } = req.body;
    
    if (!name || !subject || !content || !recipients) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }
    
    const newCampaign = {
      id: Date.now().toString(),
      name,
      subject,
      content,
      status: scheduledAt ? 'scheduled' : 'draft',
      recipients: recipients.length,
      sent: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      createdAt: new Date()
    };
    
    emailCampaigns.push(newCampaign);
    
    res.status(201).json({
      success: true,
      data: newCampaign
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Send email campaign
router.post('/campaigns/:id/send', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const campaign = emailCampaigns.find(c => c.id === req.params.id);
    if (!campaign) {
      return res.status(404).json({ success: false, message: 'Campaign not found' });
    }
    
    if (campaign.status === 'sent') {
      return res.status(400).json({ success: false, message: 'Campaign already sent' });
    }
    
    // Update campaign status
    campaign.status = 'sent';
    campaign.sentAt = new Date();
    campaign.sent = campaign.recipients;
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    res.json({
      success: true,
      data: campaign,
      message: 'Campaign sent successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get email analytics
router.get('/analytics', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Mock analytics data
    const analytics = {
      overview: {
        totalEmails: 1250,
        sent: 1200,
        delivered: 1180,
        opened: 890,
        clicked: 234,
        bounced: 20,
        unsubscribed: 15
      },
      metrics: {
        openRate: 75.4,
        clickRate: 19.8,
        bounceRate: 1.7,
        unsubscribeRate: 1.3
      },
      recentActivity: [
        {
          id: '1',
          type: 'email_sent',
          subject: 'Appointment Confirmation',
          recipient: 'john@example.com',
          timestamp: new Date(Date.now() - 3600000)
        },
        {
          id: '2',
          type: 'email_opened',
          subject: 'Payment Reminder',
          recipient: 'jane@example.com',
          timestamp: new Date(Date.now() - 7200000)
        },
        {
          id: '3',
          type: 'email_clicked',
          subject: 'Monthly Newsletter',
          recipient: 'bob@example.com',
          timestamp: new Date(Date.now() - 10800000)
        }
      ],
      topTemplates: [
        { name: 'Appointment Confirmation', sent: 450, openRate: 82.3 },
        { name: 'Payment Reminder', sent: 320, openRate: 78.1 },
        { name: 'Service Completion', sent: 280, openRate: 85.7 }
      ]
    };
    
    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Track email open
router.get('/track/:trackingId', async (req, res) => {
  try {
    const { trackingId } = req.params;
    
    // In a real application, you would:
    // 1. Find the email record by tracking ID
    // 2. Update the open count
    // 3. Record the open timestamp and IP address
    
    // Return a 1x1 transparent pixel for tracking
    const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
    
    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    
    res.end(pixel);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Track email click
router.get('/click/:trackingId', async (req, res) => {
  try {
    const { trackingId } = req.params;
    const { url } = req.query;
    
    // In a real application, you would:
    // 1. Find the email record by tracking ID
    // 2. Update the click count
    // 3. Record the click timestamp, IP address, and URL
    
    // Redirect to the original URL
    if (url) {
      res.redirect(url);
    } else {
      res.redirect('/');
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
