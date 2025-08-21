const express = require('express');
const router = express.Router();
const { authenticateToken, requireAnyAdmin } = require('../middleware/auth');
const { logger } = require('../middleware/logging');
const User = require('../models/User');
const Customer = require('../models/Customer');
const Appointment = require('../models/Appointment');
const ServiceCatalog = require('../models/Service');

// @route   GET /api/metrics/overview
// @desc    Get system overview metrics
// @access  Private
router.get('/overview', authenticateToken, requireAnyAdmin, async (req, res) => {
  try {
    const startTime = Date.now();
    
    // Get counts
    const [
      totalUsers,
      totalCustomers,
      totalAppointments,
      totalServices,
      activeAppointments,
      completedAppointments
    ] = await Promise.all([
      User.countDocuments(),
      Customer.countDocuments(),
      Appointment.countDocuments(),
      ServiceCatalog.countDocuments(),
      Appointment.countDocuments({ status: { $in: ['scheduled', 'confirmed', 'in-progress'] } }),
      Appointment.countDocuments({ status: 'completed' })
    ]);
    
    // Calculate completion rate
    const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments * 100).toFixed(2) : 0;
    
    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const [
      recentAppointments,
      recentCustomers,
      recentUsers
    ] = await Promise.all([
      Appointment.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Customer.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      User.countDocuments({ createdAt: { $gte: sevenDaysAgo } })
    ]);
    
    const metrics = {
      overview: {
        totalUsers,
        totalCustomers,
        totalAppointments,
        totalServices,
        activeAppointments,
        completedAppointments,
        completionRate: parseFloat(completionRate)
      },
      recentActivity: {
        appointments: recentAppointments,
        customers: recentCustomers,
        users: recentUsers,
        period: '7 days'
      },
      responseTime: `${Date.now() - startTime}ms`
    };

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Metrics overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get metrics'
    });
  }
});

// @route   GET /api/metrics/appointments
// @desc    Get appointment-specific metrics
// @access  Private
router.get('/appointments', authenticateToken, requireAnyAdmin, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get appointment statistics
    const appointmentStats = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get appointments by day
    const appointmentsByDay = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);
    
    // Get average appointment duration
    const avgDuration = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          estimatedDuration: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: null,
          avgDuration: { $avg: '$estimatedDuration' }
        }
      }
    ]);
    
    const metrics = {
      period: `${days} days`,
      statusBreakdown: appointmentStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {}),
      dailyTrend: appointmentsByDay,
      averageDuration: avgDuration[0]?.avgDuration || 0
    };

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Appointment metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointment metrics'
    });
  }
});

// @route   GET /api/metrics/customers
// @desc    Get customer-specific metrics
// @access  Private
router.get('/customers', authenticateToken, requireAnyAdmin, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get customer acquisition metrics
    const customerAcquisition = await Customer.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);
    
    // Get customer source breakdown
    const customerSources = await Customer.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get customers with most appointments
    const topCustomers = await Customer.aggregate([
      {
        $lookup: {
          from: 'appointments',
          localField: '_id',
          foreignField: 'customer',
          as: 'appointments'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          phone: 1,
          appointmentCount: { $size: '$appointments' }
        }
      },
      {
        $match: {
          appointmentCount: { $gt: 0 }
        }
      },
      {
        $sort: { appointmentCount: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    const metrics = {
      period: `${days} days`,
      acquisition: customerAcquisition,
      sources: customerSources.reduce((acc, source) => {
        acc[source._id || 'unknown'] = source.count;
        return acc;
      }, {}),
      topCustomers
    };

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Customer metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get customer metrics'
    });
  }
});

// @route   GET /api/metrics/services
// @desc    Get service-specific metrics
// @access  Private
router.get('/services', authenticateToken, requireAnyAdmin, async (req, res) => {
  try {
    // Get service category breakdown
    const serviceCategories = await ServiceCatalog.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgLaborRate: { $avg: '$laborRate' }
        }
      }
    ]);
    
    // Get most popular services
    const popularServices = await ServiceCatalog.aggregate([
      {
        $lookup: {
          from: 'appointments',
          localField: 'name',
          foreignField: 'serviceType',
          as: 'appointments'
        }
      },
      {
        $project: {
          name: 1,
          category: 1,
          laborRate: 1,
          appointmentCount: { $size: '$appointments' }
        }
      },
      {
        $match: {
          appointmentCount: { $gt: 0 }
        }
      },
      {
        $sort: { appointmentCount: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    const metrics = {
      categories: serviceCategories.reduce((acc, cat) => {
        acc[cat._id] = {
          count: cat.count,
          avgLaborRate: cat.avgLaborRate
        };
        return acc;
      }, {}),
      popularServices
    };

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Service metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get service metrics'
    });
  }
});

module.exports = router;
