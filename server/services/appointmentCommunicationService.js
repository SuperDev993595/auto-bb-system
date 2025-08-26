const Appointment = require('../models/Appointment');
const Customer = require('../models/Customer');
const Vehicle = require('../models/Vehicle');
const emailService = require('./emailService');
const smsService = require('./smsService');

class AppointmentCommunicationService {
  constructor() {
    this.emailService = emailService;
    this.smsService = smsService;
  }

  // Send immediate confirmation when appointment is created
  async sendAppointmentConfirmation(appointmentId, userId) {
    try {
      const appointment = await Appointment.findById(appointmentId)
        .populate('customer', 'name email phone')
        .populate('vehicle', 'year make model licensePlate')
        .populate('serviceType', 'name category estimatedDuration');

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      const customer = appointment.customer;
      const vehicle = appointment.vehicle;
      const service = appointment.serviceType;

      const appointmentDate = new Date(appointment.scheduledDate).toLocaleDateString();
      const appointmentTime = appointment.scheduledTime;

      const communicationResults = [];
      
      // Send email confirmation
      if (appointment.preferredContact === 'email' || appointment.preferredContact === 'both') {
        try {
          const emailResult = await this.emailService.sendAppointmentConfirmation({
            to: customer.email,
            customerName: customer.name,
            appointmentDate,
            appointmentTime,
            vehicleInfo: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
            serviceName: service.name,
            estimatedDuration: appointment.estimatedDuration
          });
          
          communicationResults.push({
            type: 'confirmation',
            channel: 'email',
            status: 'sent',
            messageId: emailResult.messageId
          });
        } catch (error) {
          console.error('Email confirmation failed:', error);
          communicationResults.push({
            type: 'confirmation',
            channel: 'email',
            status: 'failed',
            errorMessage: error.message
          });
        }
      }

      // Send SMS confirmation
      if (appointment.preferredContact === 'sms' || appointment.preferredContact === 'both') {
        try {
          const smsMessage = `Appointment confirmed for ${appointmentDate} at ${appointmentTime}. Vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}. Service: ${service.name}. Please arrive 10 min early.`;
          
          const smsResult = await this.smsService.sendSMS({
            to: customer.phone,
            message: smsMessage,
            priority: 'high'
          }, userId);
          
          communicationResults.push({
            type: 'confirmation',
            channel: 'sms',
            status: 'sent',
            messageId: smsResult.messageId
          });
        } catch (error) {
          console.error('SMS confirmation failed:', error);
          communicationResults.push({
            type: 'confirmation',
            channel: 'sms',
            status: 'failed',
            errorMessage: error.message
          });
        }
      }

      // Update appointment with communication history
      await Appointment.findByIdAndUpdate(appointmentId, {
        $push: { communicationHistory: communicationResults },
        confirmationSent: true
      });

      return {
        success: true,
        results: communicationResults
      };

    } catch (error) {
      console.error('Appointment confirmation error:', error);
      throw error;
    }
  }

  // Generate appointment reminders (24h, 2h, same-day)
  async generateAppointmentReminders() {
    try {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      const appointments = await Appointment.find({
        status: { $in: ['scheduled', 'confirmed'] },
        scheduledDate: { $gte: now, $lte: tomorrow }
      }).populate('customer', 'name email phone preferences')
        .populate('vehicle', 'year make model licensePlate')
        .populate('serviceType', 'name');

      const reminderResults = [];

      for (const appointment of appointments) {
        const appointmentDateTime = new Date(appointment.scheduledDate);
        appointmentDateTime.setHours(
          parseInt(appointment.scheduledTime.split(':')[0]),
          parseInt(appointment.scheduledTime.split(':')[1])
        );

        const timeUntilAppointment = appointmentDateTime.getTime() - now.getTime();
        const hoursUntilAppointment = timeUntilAppointment / (1000 * 60 * 60);

        let reminderType = null;
        if (hoursUntilAppointment <= 2 && hoursUntilAppointment > 0 && appointment.reminderSettings.send2hReminder) {
          reminderType = 'reminder_2h';
        } else if (hoursUntilAppointment <= 24 && hoursUntilAppointment > 22 && appointment.reminderSettings.send24hReminder) {
          reminderType = 'reminder_24h';
        } else if (hoursUntilAppointment <= 4 && hoursUntilAppointment > 0 && appointment.reminderSettings.sendSameDayReminder) {
          reminderType = 'reminder_same_day';
        }

        if (reminderType) {
          const alreadySent = appointment.communicationHistory.some(
            comm => comm.type === reminderType && 
            comm.sentAt > new Date(now.getTime() - 60 * 60 * 1000)
          );

          if (!alreadySent) {
            const reminderResult = await this.sendAppointmentReminder(appointment, reminderType);
            reminderResults.push(reminderResult);
          }
        }
      }

      return {
        success: true,
        remindersSent: reminderResults.length,
        results: reminderResults
      };

    } catch (error) {
      console.error('Generate appointment reminders error:', error);
      throw error;
    }
  }

  // Send specific reminder
  async sendAppointmentReminder(appointment, reminderType) {
    try {
      const customer = appointment.customer;
      const vehicle = appointment.vehicle;
      const service = appointment.serviceType;

      const appointmentDate = new Date(appointment.scheduledDate).toLocaleDateString();
      const appointmentTime = appointment.scheduledTime;

      let reminderMessage = '';
      let emailSubject = '';

      switch (reminderType) {
        case 'reminder_24h':
          reminderMessage = `Reminder: Your appointment is tomorrow at ${appointmentTime}. Vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}. Service: ${service.name}. Please call us if you need to reschedule.`;
          emailSubject = `Appointment Reminder - Tomorrow at ${appointmentTime}`;
          break;
        case 'reminder_2h':
          reminderMessage = `Reminder: Your appointment is in 2 hours at ${appointmentTime}. Vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}. Service: ${service.name}. Please arrive 10 minutes early.`;
          emailSubject = `Appointment Reminder - Today at ${appointmentTime}`;
          break;
        case 'reminder_same_day':
          reminderMessage = `Reminder: Your appointment is today at ${appointmentTime}. Vehicle: ${vehicle.year} ${vehicle.make} ${vehicle.model}. Service: ${service.name}. Please arrive 10 minutes early.`;
          emailSubject = `Appointment Reminder - Today at ${appointmentTime}`;
          break;
      }

      const communicationResults = [];

      // Send email reminder
      if (appointment.preferredContact === 'email' || appointment.preferredContact === 'both') {
        try {
          const emailResult = await this.emailService.sendAppointmentReminder({
            to: customer.email,
            customerName: customer.name,
            appointmentDate,
            appointmentTime,
            vehicleInfo: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
            serviceName: service.name,
            reminderType,
            subject: emailSubject
          });
          
          communicationResults.push({
            type: reminderType,
            channel: 'email',
            status: 'sent',
            messageId: emailResult.messageId
          });
        } catch (error) {
          console.error('Email reminder failed:', error);
          communicationResults.push({
            type: reminderType,
            channel: 'email',
            status: 'failed',
            errorMessage: error.message
          });
        }
      }

      // Send SMS reminder
      if (appointment.preferredContact === 'sms' || appointment.preferredContact === 'both') {
        try {
          const smsResult = await this.smsService.sendSMS({
            to: customer.phone,
            message: reminderMessage,
            priority: 'high'
          }, appointment.createdBy);
          
          communicationResults.push({
            type: reminderType,
            channel: 'sms',
            status: 'sent',
            messageId: smsResult.messageId
          });
        } catch (error) {
          console.error('SMS reminder failed:', error);
          communicationResults.push({
            type: reminderType,
            channel: 'sms',
            status: 'failed',
            errorMessage: error.message
          });
        }
      }

      // Update appointment with communication history
      await Appointment.findByIdAndUpdate(appointment._id, {
        $push: { communicationHistory: communicationResults }
      });

      return {
        appointmentId: appointment._id,
        customerName: customer.name,
        reminderType,
        results: communicationResults
      };

    } catch (error) {
      console.error('Send appointment reminder error:', error);
      throw error;
    }
  }
}

module.exports = new AppointmentCommunicationService();
