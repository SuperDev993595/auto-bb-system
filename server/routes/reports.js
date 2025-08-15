const express = require('express');
const Task = require('../models/Task');
const Customer = require('../models/Customer');
const { requireAdmin } = require('../middleware/auth');
const moment = require('moment');
const PDFGenerator = require('../utils/pdfGenerator');
const nodemailer = require('nodemailer');

const router = express.Router();

// @route   GET /api/reports/daily-progress
// @desc    Get daily progress for all activities
// @access  Private
router.get('/daily-progress', requireAdmin, async (req, res) => {
  try {
    const { date, assignedTo } = req.query;
    
    // Use provided date or today
    const targetDate = date ? moment(date).startOf('day') : moment().startOf('day');
    const endDate = moment(targetDate).endOf('day');

    // Build query
    const query = {
      createdAt: {
        $gte: targetDate.toDate(),
        $lte: endDate.toDate()
      }
    };

    // Filter by assigned user
    if (req.user.role === 'sub_admin') {
      query.assignedTo = req.user.id;
    } else if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    // Get tasks by type for the day
    const marketingTasks = await Task.countDocuments({
      ...query,
      type: 'marketing'
    });

    const salesTasks = await Task.countDocuments({
      ...query,
      type: 'sales'
    });

    const collectionsTasks = await Task.countDocuments({
      ...query,
      type: 'collections'
    });

    const appointmentsTasks = await Task.countDocuments({
      ...query,
      type: 'appointments'
    });

    // Get completed tasks by type
    const completedMarketingTasks = await Task.countDocuments({
      ...query,
      type: 'marketing',
      status: 'completed'
    });

    const completedSalesTasks = await Task.countDocuments({
      ...query,
      type: 'sales',
      status: 'completed'
    });

    const completedCollectionsTasks = await Task.countDocuments({
      ...query,
      type: 'collections',
      status: 'completed'
    });

    const completedAppointmentsTasks = await Task.countDocuments({
      ...query,
      type: 'appointments',
      status: 'completed'
    });

    // Calculate progress percentages
    const marketingProgress = marketingTasks > 0 ? (completedMarketingTasks / marketingTasks) * 100 : 0;
    const salesProgress = salesTasks > 0 ? (completedSalesTasks / salesTasks) * 100 : 0;
    const collectionsProgress = collectionsTasks > 0 ? (completedCollectionsTasks / collectionsTasks) * 100 : 0;
    const appointmentsProgress = appointmentsTasks > 0 ? (completedAppointmentsTasks / appointmentsTasks) * 100 : 0;

    // Get total daily activity
    const totalTasks = await Task.countDocuments(query);
    const completedTasks = await Task.countDocuments({
      ...query,
      status: 'completed'
    });

    const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    res.json({
      success: true,
      data: {
        date: targetDate.format('YYYY-MM-DD'),
        progress: {
          marketing: {
            total: marketingTasks,
            completed: completedMarketingTasks,
            percentage: Math.round(marketingProgress * 100) / 100
          },
          sales: {
            total: salesTasks,
            completed: completedSalesTasks,
            percentage: Math.round(salesProgress * 100) / 100
          },
          collections: {
            total: collectionsTasks,
            completed: completedCollectionsTasks,
            percentage: Math.round(collectionsProgress * 100) / 100
          },
          appointments: {
            total: appointmentsTasks,
            completed: completedAppointmentsTasks,
            percentage: Math.round(appointmentsProgress * 100) / 100
          },
          overall: {
            total: totalTasks,
            completed: completedTasks,
            percentage: Math.round(overallProgress * 100) / 100
          }
        }
      }
    });

  } catch (error) {
    console.error('Get daily progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/reports/sub-admin-performance
// @desc    Get performance metrics for Sub Admins
// @access  Private (Super Admin)
router.get('/sub-admin-performance', requireAdmin, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Use provided date range or last 30 days
    const start = startDate ? moment(startDate).startOf('day') : moment().subtract(30, 'days').startOf('day');
    const end = endDate ? moment(endDate).endOf('day') : moment().endOf('day');

    const dateQuery = {
      createdAt: {
        $gte: start.toDate(),
        $lte: end.toDate()
      }
    };

    // Get all Sub Admins
    const subAdmins = await require('mongoose').model('User').find({ role: 'sub_admin', isActive: true });

    const performanceData = [];

    for (const admin of subAdmins) {
      // Get tasks for this admin
      const totalTasks = await Task.countDocuments({
        ...dateQuery,
        assignedTo: admin._id
      });

      const completedTasks = await Task.countDocuments({
        ...dateQuery,
        assignedTo: admin._id,
        status: 'completed'
      });

      const overdueTasks = await Task.countDocuments({
        assignedTo: admin._id,
        dueDate: { $lt: new Date() },
        status: { $ne: 'completed' }
      });

      // Get tasks by type
      const marketingTasks = await Task.countDocuments({
        ...dateQuery,
        assignedTo: admin._id,
        type: 'marketing'
      });

      const salesTasks = await Task.countDocuments({
        ...dateQuery,
        assignedTo: admin._id,
        type: 'sales'
      });

      const collectionsTasks = await Task.countDocuments({
        ...dateQuery,
        assignedTo: admin._id,
        type: 'collections'
      });

      const appointmentsTasks = await Task.countDocuments({
        ...dateQuery,
        assignedTo: admin._id,
        type: 'appointments'
      });

      // Calculate completion rate
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

      performanceData.push({
        admin: {
          id: admin._id,
          name: admin.name,
          email: admin.email
        },
        metrics: {
          totalTasks,
          completedTasks,
          overdueTasks,
          completionRate: Math.round(completionRate * 100) / 100,
          tasksByType: {
            marketing: marketingTasks,
            sales: salesTasks,
            collections: collectionsTasks,
            appointments: appointmentsTasks
          }
        }
      });
    }

    res.json({
      success: true,
      data: {
        period: {
          start: start.format('YYYY-MM-DD'),
          end: end.format('YYYY-MM-DD')
        },
        performance: performanceData
      }
    });

  } catch (error) {
    console.error('Get sub-admin performance error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/reports/daily-summary
// @desc    Get daily activity summary
// @access  Private
router.get('/daily-summary', requireAdmin, async (req, res) => {
  try {
    const { date, assignedTo } = req.query;
    
    const targetDate = date ? moment(date).startOf('day') : moment().startOf('day');
    const endDate = moment(targetDate).endOf('day');

    const query = {
      createdAt: {
        $gte: targetDate.toDate(),
        $lte: endDate.toDate()
      }
    };

    if (req.user.role === 'sub_admin') {
      query.assignedTo = req.user.id;
    } else if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    // Get tasks created today
    const tasksCreated = await Task.countDocuments(query);

    // Get tasks completed today
    const tasksCompleted = await Task.countDocuments({
      ...query,
      status: 'completed'
    });

    // Get new customers created today
    const newCustomers = await Customer.countDocuments({
      createdAt: {
        $gte: targetDate.toDate(),
        $lte: endDate.toDate()
      }
    });

    // Get communication logs created today
    const communicationLogs = await Customer.aggregate([
      {
        $unwind: '$communicationLogs'
      },
      {
        $match: {
          'communicationLogs.createdAt': {
            $gte: targetDate.toDate(),
            $lte: endDate.toDate()
          }
        }
      },
      {
        $count: 'total'
      }
    ]);

    const totalCommunications = communicationLogs.length > 0 ? communicationLogs[0].total : 0;

    // Get tasks by status
    const tasksByStatus = await Task.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get tasks by type
    const tasksByType = await Task.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        date: targetDate.format('YYYY-MM-DD'),
        summary: {
          tasksCreated,
          tasksCompleted,
          newCustomers,
          communicationLogs: totalCommunications,
          completionRate: tasksCreated > 0 ? Math.round((tasksCompleted / tasksCreated) * 100 * 100) / 100 : 0
        },
        breakdown: {
          byStatus: tasksByStatus,
          byType: tasksByType
        }
      }
    });

  } catch (error) {
    console.error('Get daily summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/reports/weekly-progress
// @desc    Get weekly progress trends
// @access  Private
router.get('/weekly-progress', requireAdmin, async (req, res) => {
  try {
    const { assignedTo } = req.query;
    
    const startOfWeek = moment().startOf('week');
    const endOfWeek = moment().endOf('week');

    const query = {
      createdAt: {
        $gte: startOfWeek.toDate(),
        $lte: endOfWeek.toDate()
      }
    };

    if (req.user.role === 'sub_admin') {
      query.assignedTo = req.user.id;
    } else if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    // Get daily progress for the week
    const dailyProgress = [];

    for (let i = 0; i < 7; i++) {
      const day = moment(startOfWeek).add(i, 'days');
      const dayStart = day.startOf('day');
      const dayEnd = day.endOf('day');

      const dayQuery = {
        ...query,
        createdAt: {
          $gte: dayStart.toDate(),
          $lte: dayEnd.toDate()
        }
      };

      const totalTasks = await Task.countDocuments(dayQuery);
      const completedTasks = await Task.countDocuments({
        ...dayQuery,
        status: 'completed'
      });

      dailyProgress.push({
        date: day.format('YYYY-MM-DD'),
        day: day.format('dddd'),
        total: totalTasks,
        completed: completedTasks,
        percentage: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100 * 100) / 100 : 0
      });
    }

    res.json({
      success: true,
      data: {
        week: {
          start: startOfWeek.format('YYYY-MM-DD'),
          end: endOfWeek.format('YYYY-MM-DD')
        },
        dailyProgress
      }
    });

  } catch (error) {
    console.error('Get weekly progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/reports/activity-log
// @desc    Get detailed activity log
// @access  Private
router.get('/activity-log', requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate,
      type,
      assignedTo
    } = req.query;

    const query = {};

    // Date range filter
    if (startDate && endDate) {
      query.createdAt = {
        $gte: moment(startDate).startOf('day').toDate(),
        $lte: moment(endDate).endOf('day').toDate()
      };
    }

    // Type filter
    if (type) {
      query.type = type;
    }

    // Assigned user filter
    if (req.user.role === 'sub_admin') {
      query.assignedTo = req.user.id;
    } else if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    // Get tasks with pagination
    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name')
      .populate('customer', 'businessName contactPerson.name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get total count
    const total = await Task.countDocuments(query);

    res.json({
      success: true,
      data: {
        activities: tasks,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalActivities: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get activity log error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/reports/pdf/daily-activity/:userId
// @desc    Generate PDF daily activity report for a user
// @access  Private
router.get('/pdf/daily-activity/:userId', requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query;

    // Check if user has access
    if (req.user.role === 'sub_admin' && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const pdfGenerator = new PDFGenerator();
    const doc = await pdfGenerator.generateDailyActivityReport(userId, date);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="daily-activity-${moment(date || new Date()).format('YYYY-MM-DD')}.pdf"`);

    // Send PDF buffer
    const pdfBuffer = doc.output('arraybuffer');
    res.send(Buffer.from(pdfBuffer));

  } catch (error) {
    console.error('Generate PDF daily activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF report'
    });
  }
});

// @route   GET /api/reports/pdf/customer/:customerId
// @desc    Generate PDF customer report
// @access  Private
router.get('/pdf/customer/:customerId', requireAdmin, async (req, res) => {
  try {
    const { customerId } = req.params;

    const pdfGenerator = new PDFGenerator();
    const doc = await pdfGenerator.generateCustomerReport(customerId);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="customer-report-${customerId}.pdf"`);

    // Send PDF buffer
    const pdfBuffer = doc.output('arraybuffer');
    res.send(Buffer.from(pdfBuffer));

  } catch (error) {
    console.error('Generate PDF customer report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF report'
    });
  }
});

// @route   GET /api/reports/pdf/work-completion/:customerId
// @desc    Generate PDF work completion summary
// @access  Private
router.get('/pdf/work-completion/:customerId', requireAdmin, async (req, res) => {
  try {
    const { customerId } = req.params;
    const { date } = req.query;

    const pdfGenerator = new PDFGenerator();
    const doc = await pdfGenerator.generateWorkCompletionSummary(customerId, date);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="work-completion-${customerId}-${moment(date || new Date()).format('YYYY-MM-DD')}.pdf"`);

    // Send PDF buffer
    const pdfBuffer = doc.output('arraybuffer');
    res.send(Buffer.from(pdfBuffer));

  } catch (error) {
    console.error('Generate PDF work completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF report'
    });
  }
});

// @route   GET /api/reports/pdf/super-admin-daily
// @desc    Generate PDF super admin daily report
// @access  Private (Super Admin)
router.get('/pdf/super-admin-daily', requireAdmin, async (req, res) => {
  try {
    const { date } = req.query;

    // Only Super Admin can access this
    if (req.user.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Super Admin only.'
      });
    }

    const pdfGenerator = new PDFGenerator();
    const doc = await pdfGenerator.generateSuperAdminDailyReport(date);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="super-admin-daily-${moment(date || new Date()).format('YYYY-MM-DD')}.pdf"`);

    // Send PDF buffer
    const pdfBuffer = doc.output('arraybuffer');
    res.send(Buffer.from(pdfBuffer));

  } catch (error) {
    console.error('Generate PDF super admin daily error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating PDF report'
    });
  }
});

// @route   POST /api/reports/email/daily-activity
// @desc    Email daily activity report to user
// @access  Private
router.post('/email/daily-activity', requireAdmin, async (req, res) => {
  try {
    const { userId, date, email } = req.body;

    // Check if user has access
    if (req.user.role === 'sub_admin' && req.user.id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Generate PDF
    const pdfGenerator = new PDFGenerator();
    const doc = await pdfGenerator.generateDailyActivityReport(userId, date);
    const pdfBuffer = doc.output('arraybuffer');

    // Email configuration (you'll need to set up your email service)
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: `Daily Activity Report - ${moment(date || new Date()).format('MMMM Do YYYY')}`,
      html: `
        <h2>Daily Activity Report</h2>
        <p>Please find attached your daily activity report for ${moment(date || new Date()).format('MMMM Do YYYY')}.</p>
        <p>This report contains a summary of your tasks, progress, and completed work for the day.</p>
        <br>
        <p>Best regards,<br>Auto Repair CRM Team</p>
      `,
      attachments: [
        {
          filename: `daily-activity-${moment(date || new Date()).format('YYYY-MM-DD')}.pdf`,
          content: Buffer.from(pdfBuffer),
          contentType: 'application/pdf'
        }
      ]
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Daily activity report sent successfully'
    });

  } catch (error) {
    console.error('Email daily activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending email report'
    });
  }
});

// @route   POST /api/reports/email/work-completion
// @desc    Email work completion summary to customer
// @access  Private
router.post('/email/work-completion', requireAdmin, async (req, res) => {
  try {
    const { customerId, date, email } = req.body;

    // Generate PDF
    const pdfGenerator = new PDFGenerator();
    const doc = await pdfGenerator.generateWorkCompletionSummary(customerId, date);
    const pdfBuffer = doc.output('arraybuffer');

    // Get customer info
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Email configuration
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email || customer.contactPerson.email,
      subject: `Work Completion Summary - ${customer.businessName} - ${moment(date || new Date()).format('MMMM Do YYYY')}`,
      html: `
        <h2>Work Completion Summary</h2>
        <p>Dear ${customer.contactPerson.name},</p>
        <p>Please find attached the work completion summary for ${customer.businessName} for ${moment(date || new Date()).format('MMMM Do YYYY')}.</p>
        <p>This report details all completed tasks and activities performed for your business on this date.</p>
        <br>
        <p>If you have any questions or need additional information, please don't hesitate to contact us.</p>
        <br>
        <p>Best regards,<br>Auto Repair CRM Team</p>
      `,
      attachments: [
        {
          filename: `work-completion-${customer.businessName}-${moment(date || new Date()).format('YYYY-MM-DD')}.pdf`,
          content: Buffer.from(pdfBuffer),
          contentType: 'application/pdf'
        }
      ]
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Work completion summary sent successfully'
    });

  } catch (error) {
    console.error('Email work completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Error sending email report'
    });
  }
});

module.exports = router;
