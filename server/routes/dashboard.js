const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const Customer = require('../models/Customer');
const Appointment = require('../models/Appointment');
const Task = require('../models/Task');
const Invoice = require('../models/Invoice');
const ServiceCatalog = require('../models/Service');
const WorkOrder = require('../models/Service');
const moment = require('moment');

// Get dashboard statistics with advanced filtering
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const { dateRange, serviceType, technician, status } = req.query;
    
    // Build date filter
    let dateFilter = {};
    if (dateRange) {
      const now = moment();
      switch (dateRange) {
        case '1d':
          dateFilter = { createdAt: { $gte: now.subtract(1, 'day').toDate() } };
          break;
        case '7d':
          dateFilter = { createdAt: { $gte: now.subtract(7, 'days').toDate() } };
          break;
        case '30d':
          dateFilter = { createdAt: { $gte: now.subtract(30, 'days').toDate() } };
          break;
        case '90d':
          dateFilter = { createdAt: { $gte: now.subtract(90, 'days').toDate() } };
          break;
        case '1y':
          dateFilter = { createdAt: { $gte: now.subtract(1, 'year').toDate() } };
          break;
      }
    }

    // Build service filter
    let serviceFilter = {};
    if (serviceType && serviceType !== 'all') {
      serviceFilter.category = serviceType;
    }

    // Build technician filter
    let technicianFilter = {};
    if (technician && technician !== 'all') {
      technicianFilter.assignedTechnician = technician;
    }

    // Build status filter
    let statusFilter = {};
    if (status && status !== 'all') {
      statusFilter.status = status;
    }

    // Aggregate statistics
    const [
      totalCustomers,
      totalAppointments,
      totalRevenue,
      pendingTasks,
      completedServices,
      averageRating,
      monthlyGrowth,
      topServices,
      recentActivity
    ] = await Promise.all([
      // Total customers
      Customer.countDocuments(),
      
      // Total appointments
      Appointment.countDocuments({ ...dateFilter, ...statusFilter }),
      
      // Total revenue
      Invoice.aggregate([
        { $match: { ...dateFilter, status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).then(result => result[0]?.total || 0),
      
      // Pending tasks
      Task.countDocuments({ status: 'pending' }),
      
      // Completed services
      WorkOrder.countDocuments({ status: 'completed', ...dateFilter }),
      
      // Average rating (from appointments)
      Appointment.aggregate([
        { $match: { rating: { $exists: true, $ne: null } } },
        { $group: { _id: null, avg: { $avg: '$rating' } } }
      ]).then(result => Math.round((result[0]?.avg || 0) * 10) / 10),
      
      // Monthly growth (revenue comparison)
      calculateMonthlyGrowth(),
      
      // Top services
      ServiceCatalog.aggregate([
        { $lookup: { from: 'workorders', localField: '_id', foreignField: 'serviceId', as: 'orders' } },
        { $unwind: '$orders' },
        { $match: { ...dateFilter } },
        { $group: { 
          _id: '$name', 
          count: { $sum: 1 }, 
          revenue: { $sum: '$orders.totalCost' } 
        }},
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),
      
      // Recent activity
      getRecentActivity(dateFilter)
    ]);

    const stats = {
      totalCustomers,
      totalAppointments,
      totalRevenue,
      pendingTasks,
      completedServices,
      averageRating,
      monthlyGrowth,
      topServices,
      recentActivity
    };

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard statistics' });
  }
});

// Generate custom reports
router.post('/reports', authenticateToken, async (req, res) => {
  try {
    const { metrics, dateRange, chartType } = req.body;
    
    const { start, end } = dateRange;
    const dateFilter = {
      createdAt: {
        $gte: new Date(start),
        $lte: new Date(end)
      }
    };

    // Build report data based on selected metrics
    const reportData = {};
    
    for (const metric of metrics) {
      switch (metric) {
        case 'Revenue':
          reportData.revenue = await Invoice.aggregate([
            { $match: { ...dateFilter, status: 'paid' } },
            { $group: { 
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              total: { $sum: '$totalAmount' }
            }},
            { $sort: { _id: 1 } }
          ]);
          break;
          
        case 'Appointments':
          reportData.appointments = await Appointment.aggregate([
            { $match: dateFilter },
            { $group: { 
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
          ]);
          break;
          
        case 'Customers':
          reportData.customers = await Customer.aggregate([
            { $match: dateFilter },
            { $group: { 
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
          ]);
          break;
          
        case 'Services':
          reportData.services = await WorkOrder.aggregate([
            { $match: { ...dateFilter, status: 'completed' } },
            { $group: { 
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              count: { $sum: 1 }
            }},
            { $sort: { _id: 1 } }
          ]);
          break;
      }
    }

    const report = {
      metrics,
      dateRange,
      chartType,
      data: reportData,
      generatedAt: new Date().toISOString()
    };

    res.json(report);
  } catch (error) {
    console.error('Custom report error:', error);
    res.status(500).json({ message: 'Failed to generate custom report' });
  }
});

// Export dashboard data
router.get('/export', authenticateToken, async (req, res) => {
  try {
    const { format } = req.query;
    const { dateRange } = req.query;
    
    let dateFilter = {};
    if (dateRange) {
      const now = moment();
      switch (dateRange) {
        case '1d':
          dateFilter = { createdAt: { $gte: now.subtract(1, 'day').toDate() } };
          break;
        case '7d':
          dateFilter = { createdAt: { $gte: now.subtract(7, 'days').toDate() } };
          break;
        case '30d':
          dateFilter = { createdAt: { $gte: now.subtract(30, 'days').toDate() } };
          break;
        case '90d':
          dateFilter = { createdAt: { $gte: now.subtract(90, 'days').toDate() } };
          break;
        case '1y':
          dateFilter = { createdAt: { $gte: now.subtract(1, 'year').toDate() } };
          break;
      }
    }

    // Fetch data for export
    const [customers, appointments, invoices, tasks] = await Promise.all([
      Customer.find(dateFilter).lean(),
      Appointment.find(dateFilter).lean(),
      Invoice.find(dateFilter).lean(),
      Task.find(dateFilter).lean()
    ]);

    const exportData = {
      customers,
      appointments,
      invoices,
      tasks,
      exportDate: new Date().toISOString(),
      filters: { dateRange }
    };

    switch (format) {
      case 'json':
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=dashboard-export-${new Date().toISOString().split('T')[0]}.json`);
        res.json(exportData);
        break;
        
      case 'csv':
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=dashboard-export-${new Date().toISOString().split('T')[0]}.csv`);
        res.send(convertToCSV(exportData));
        break;
        
      case 'pdf':
        // PDF generation would be implemented here
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=dashboard-export-${new Date().toISOString().split('T')[0]}.pdf`);
        res.send('PDF export not implemented yet');
        break;
        
      default:
        res.status(400).json({ message: 'Invalid export format' });
    }
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ message: 'Failed to export dashboard data' });
  }
});

// Real-time updates endpoint
router.get('/realtime', authenticateToken, async (req, res) => {
  try {
    // Get real-time updates (last 5 minutes)
    const fiveMinutesAgo = moment().subtract(5, 'minutes').toDate();
    
    const [newCustomers, newAppointments, newInvoices, newTasks] = await Promise.all([
      Customer.countDocuments({ createdAt: { $gte: fiveMinutesAgo } }),
      Appointment.countDocuments({ createdAt: { $gte: fiveMinutesAgo } }),
      Invoice.countDocuments({ createdAt: { $gte: fiveMinutesAgo } }),
      Task.countDocuments({ createdAt: { $gte: fiveMinutesAgo } })
    ]);

    const realTimeData = {
      newCustomers,
      newAppointments,
      newInvoices,
      newTasks,
      timestamp: new Date().toISOString()
    };

    res.json(realTimeData);
  } catch (error) {
    console.error('Real-time updates error:', error);
    res.status(500).json({ message: 'Failed to fetch real-time updates' });
  }
});

// Helper functions
async function calculateMonthlyGrowth() {
  try {
    const currentMonth = moment().startOf('month');
    const lastMonth = moment().subtract(1, 'month').startOf('month');
    
    const [currentRevenue, lastRevenue] = await Promise.all([
      Invoice.aggregate([
        { $match: { 
          createdAt: { $gte: currentMonth.toDate() },
          status: 'paid'
        }},
        { $group: { _id: null, total: { $sum: '$totalAmount' } }}
      ]).then(result => result[0]?.total || 0),
      
      Invoice.aggregate([
        { $match: { 
          createdAt: { $gte: lastMonth.toDate(), $lt: currentMonth.toDate() },
          status: 'paid'
        }},
        { $group: { _id: null, total: { $sum: '$totalAmount' } }}
      ]).then(result => result[0]?.total || 0)
    ]);

    if (lastRevenue === 0) return 100;
    return Math.round(((currentRevenue - lastRevenue) / lastRevenue) * 100);
  } catch (error) {
    console.error('Monthly growth calculation error:', error);
    return 0;
  }
}

async function getRecentActivity(dateFilter) {
  try {
    const activities = [];
    
    // Recent appointments
    const recentAppointments = await Appointment.find(dateFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customerId', 'firstName lastName');
    
    activities.push(...recentAppointments.map(apt => ({
      id: apt._id,
      type: 'appointment',
      description: `New appointment with ${apt.customerId.firstName} ${apt.customerId.lastName}`,
      timestamp: apt.createdAt,
      amount: apt.totalCost
    })));

    // Recent invoices
    const recentInvoices = await Invoice.find(dateFilter)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('customerId', 'firstName lastName');
    
    activities.push(...recentInvoices.map(inv => ({
      id: inv._id,
      type: 'invoice',
      description: `Invoice generated for ${inv.customerId.firstName} ${inv.customerId.lastName}`,
      timestamp: inv.createdAt,
      amount: inv.totalAmount
    })));

    // Recent tasks
    const recentTasks = await Task.find(dateFilter)
      .sort({ createdAt: -1 })
      .limit(5);
    
    activities.push(...recentTasks.map(task => ({
      id: task._id,
      type: 'task',
      description: `Task created: ${task.title}`,
      timestamp: task.createdAt
    })));

    // Sort by timestamp and return top 10
    return activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 10);
  } catch (error) {
    console.error('Recent activity error:', error);
    return [];
  }
}

function convertToCSV(data) {
  // Simple CSV conversion - in production, use a proper CSV library
  const headers = ['Type', 'ID', 'Description', 'Amount', 'Date'];
  const rows = [];
  
  // Add customers
  data.customers.forEach(customer => {
    rows.push([
      'Customer',
      customer._id,
      `${customer.firstName} ${customer.lastName}`,
      '',
      customer.createdAt
    ]);
  });
  
  // Add appointments
  data.appointments.forEach(appointment => {
    rows.push([
      'Appointment',
      appointment._id,
      appointment.serviceType,
      appointment.totalCost,
      appointment.createdAt
    ]);
  });
  
  // Add invoices
  data.invoices.forEach(invoice => {
    rows.push([
      'Invoice',
      invoice._id,
      `Invoice #${invoice.invoiceNumber}`,
      invoice.totalAmount,
      invoice.createdAt
    ]);
  });
  
  // Add tasks
  data.tasks.forEach(task => {
    rows.push([
      'Task',
      task._id,
      task.title,
      '',
      task.createdAt
    ]);
  });
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
  
  return csvContent;
}

module.exports = router;
