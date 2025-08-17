const Notification = require('../models/Notification');
const Vehicle = require('../models/Vehicle');
const Appointment = require('../models/Appointment');
const { Service } = require('../models/Service');
const Invoice = require('../models/Invoice');

class NotificationService {
  // Generate service reminders based on mileage and time intervals
  async generateServiceReminders() {
    try {
      const vehicles = await Vehicle.find({ status: 'active' });
      const reminders = [];

      for (const vehicle of vehicles) {
        // Check for mileage-based reminders
        const mileageReminders = this.checkMileageBasedReminders(vehicle);
        reminders.push(...mileageReminders);

        // Check for time-based reminders
        const timeReminders = this.checkTimeBasedReminders(vehicle);
        reminders.push(...timeReminders);
      }

      // Save reminders to database
      if (reminders.length > 0) {
        await Notification.insertMany(reminders);
        console.log(`Generated ${reminders.length} service reminders`);
      }

      return reminders;
    } catch (error) {
      console.error('Error generating service reminders:', error);
      throw error;
    }
  }

  // Check mileage-based service reminders
  checkMileageBasedReminders(vehicle) {
    const reminders = [];
    const currentMileage = vehicle.mileage;
    const lastServiceMileage = vehicle.lastServiceMileage || 0;
    const mileageSinceLastService = currentMileage - lastServiceMileage;

    // Oil change reminder (every 3,000-5,000 miles)
    if (mileageSinceLastService >= 3000) {
      reminders.push({
        customer: vehicle.customerId,
        type: 'service_reminder',
        title: 'Oil Change Due',
        message: `Your ${vehicle.year} ${vehicle.make} ${vehicle.model} is due for an oil change. Current mileage: ${currentMileage.toLocaleString()} miles.`,
        priority: 'medium',
        channel: 'email',
        scheduledFor: new Date(),
        relatedData: { vehicleId: vehicle._id },
        metadata: {
          mileage: currentMileage,
          serviceType: 'oil_change',
          dueDate: new Date()
        }
      });
    }

    // Major service reminder (every 30,000 miles)
    if (mileageSinceLastService >= 30000) {
      reminders.push({
        customer: vehicle.customerId,
        type: 'service_reminder',
        title: 'Major Service Due',
        message: `Your ${vehicle.year} ${vehicle.make} ${vehicle.model} is due for a major service. Current mileage: ${currentMileage.toLocaleString()} miles.`,
        priority: 'high',
        channel: 'email',
        scheduledFor: new Date(),
        relatedData: { vehicleId: vehicle._id },
        metadata: {
          mileage: currentMileage,
          serviceType: 'major_service',
          dueDate: new Date()
        }
      });
    }

    return reminders;
  }

  // Check time-based service reminders
  checkTimeBasedReminders(vehicle) {
    const reminders = [];
    const now = new Date();
    const lastServiceDate = vehicle.lastServiceDate;

    if (lastServiceDate) {
      const monthsSinceLastService = (now - lastServiceDate) / (1000 * 60 * 60 * 24 * 30);

      // Annual service reminder
      if (monthsSinceLastService >= 12) {
        reminders.push({
          customer: vehicle.customerId,
          type: 'service_reminder',
          title: 'Annual Service Due',
          message: `Your ${vehicle.year} ${vehicle.make} ${vehicle.model} is due for annual service.`,
          priority: 'medium',
          channel: 'email',
          scheduledFor: new Date(),
          relatedData: { vehicleId: vehicle._id },
          metadata: {
            serviceType: 'annual_service',
            dueDate: new Date()
          }
        });
      }

      // Seasonal maintenance reminder
      if (monthsSinceLastService >= 6) {
        reminders.push({
          customer: vehicle.customerId,
          type: 'maintenance_alert',
          title: 'Seasonal Maintenance Check',
          message: `Consider scheduling seasonal maintenance for your ${vehicle.year} ${vehicle.make} ${vehicle.model}.`,
          priority: 'low',
          channel: 'email',
          scheduledFor: new Date(),
          relatedData: { vehicleId: vehicle._id },
          metadata: {
            serviceType: 'seasonal_maintenance',
            dueDate: new Date()
          }
        });
      }
    }

    return reminders;
  }

  // Generate appointment reminders
  async generateAppointmentReminders() {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const dayAfterTomorrow = new Date(tomorrow);
      dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

      const appointments = await Appointment.find({
        scheduledDate: {
          $gte: tomorrow,
          $lt: dayAfterTomorrow
        },
        status: 'scheduled'
      });

      const reminders = appointments.map(appointment => ({
        customer: appointment.customer,
        type: 'appointment_reminder',
        title: 'Appointment Reminder',
        message: `Reminder: You have an appointment tomorrow for ${appointment.serviceDescription}.`,
        priority: 'high',
        channel: 'email',
        scheduledFor: new Date(),
        relatedData: { appointmentId: appointment._id },
        metadata: {
          serviceType: appointment.serviceDescription,
          dueDate: appointment.scheduledDate
        }
      }));

      if (reminders.length > 0) {
        await Notification.insertMany(reminders);
        console.log(`Generated ${reminders.length} appointment reminders`);
      }

      return reminders;
    } catch (error) {
      console.error('Error generating appointment reminders:', error);
      throw error;
    }
  }

  // Generate payment reminders
  async generatePaymentReminders() {
    try {
      const overdueInvoices = await Invoice.find({
        status: 'pending',
        dueDate: { $lt: new Date() }
      });

      const reminders = overdueInvoices.map(invoice => ({
        customer: invoice.customerId,
        type: 'payment_reminder',
        title: 'Payment Overdue',
        message: `Your invoice #${invoice.invoiceNumber} is overdue. Amount due: $${invoice.total.toFixed(2)}.`,
        priority: 'urgent',
        channel: 'email',
        scheduledFor: new Date(),
        relatedData: { invoiceId: invoice._id },
        metadata: {
          amount: invoice.total,
          dueDate: invoice.dueDate
        }
      }));

      if (reminders.length > 0) {
        await Notification.insertMany(reminders);
        console.log(`Generated ${reminders.length} payment reminders`);
      }

      return reminders;
    } catch (error) {
      console.error('Error generating payment reminders:', error);
      throw error;
    }
  }

  // Send follow-up messages after service completion
  async generateFollowUpMessages() {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const completedServices = await Service.find({
        date: {
          $gte: yesterday,
          $lt: today
        },
        status: 'completed'
      });

      const followUps = completedServices.map(service => ({
        customer: service.customerId,
        type: 'follow_up',
        title: 'Service Follow-up',
        message: `Thank you for choosing our service! How was your experience with the recent service on your vehicle?`,
        priority: 'low',
        channel: 'email',
        scheduledFor: new Date(),
        relatedData: { serviceId: service._id },
        metadata: {
          serviceType: service.serviceType,
          dueDate: service.date
        }
      }));

      if (followUps.length > 0) {
        await Notification.insertMany(followUps);
        console.log(`Generated ${followUps.length} follow-up messages`);
      }

      return followUps;
    } catch (error) {
      console.error('Error generating follow-up messages:', error);
      throw error;
    }
  }

  // Get customer notifications
  async getCustomerNotifications(customerId, limit = 20) {
    try {
      const notifications = await Notification.find({ customer: customerId })
        .sort({ createdAt: -1 })
        .limit(limit);

      return notifications;
    } catch (error) {
      console.error('Error fetching customer notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      const notification = await Notification.findByIdAndUpdate(
        notificationId,
        { 
          status: 'read',
          readAt: new Date()
        },
        { new: true }
      );

      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Get unread notification count
  async getUnreadCount(customerId) {
    try {
      const count = await Notification.countDocuments({
        customer: customerId,
        status: { $in: ['sent', 'delivered'] }
      });

      return count;
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
