const cron = require('node-cron');
const notificationService = require('./notificationService');
const appointmentCommunicationService = require('./appointmentCommunicationService');

class CronService {
  constructor() {
    this.initCronJobs();
  }

  initCronJobs() {
    // Generate service reminders daily at 9 AM
    cron.schedule('0 9 * * *', async () => {
      console.log('Running daily service reminders generation...');
      try {
        await notificationService.generateServiceReminders();
        console.log('Daily service reminders generated successfully');
      } catch (error) {
        console.error('Error generating daily service reminders:', error);
      }
    });

    // Generate appointment reminders daily at 8 AM
    cron.schedule('0 8 * * *', async () => {
      console.log('Running daily appointment reminders generation...');
      try {
        await appointmentCommunicationService.generateAppointmentReminders();
        console.log('Daily appointment reminders generated successfully');
      } catch (error) {
        console.error('Error generating daily appointment reminders:', error);
      }
    });

    // Generate payment reminders daily at 10 AM
    cron.schedule('0 10 * * *', async () => {
      console.log('Running daily payment reminders generation...');
      try {
        await notificationService.generatePaymentReminders();
        console.log('Daily payment reminders generated successfully');
      } catch (error) {
        console.error('Error generating daily payment reminders:', error);
      }
    });

    // Generate follow-up messages daily at 2 PM
    cron.schedule('0 14 * * *', async () => {
      console.log('Running daily follow-up messages generation...');
      try {
        await notificationService.generateFollowUpMessages();
        console.log('Daily follow-up messages generated successfully');
      } catch (error) {
        console.error('Error generating daily follow-up messages:', error);
      }
    });

    console.log('Cron jobs initialized successfully');
  }

  // Manual trigger for testing
  async triggerServiceReminders() {
    try {
      await notificationService.generateServiceReminders();
      console.log('Service reminders triggered manually');
    } catch (error) {
      console.error('Error triggering service reminders:', error);
      throw error;
    }
  }

  async triggerAppointmentReminders() {
    try {
      await notificationService.generateAppointmentReminders();
      console.log('Appointment reminders triggered manually');
    } catch (error) {
      console.error('Error triggering appointment reminders:', error);
      throw error;
    }
  }

  async triggerPaymentReminders() {
    try {
      await notificationService.generatePaymentReminders();
      console.log('Payment reminders triggered manually');
    } catch (error) {
      console.error('Error triggering payment reminders:', error);
      throw error;
    }
  }

  async triggerFollowUpMessages() {
    try {
      await notificationService.generateFollowUpMessages();
      console.log('Follow-up messages triggered manually');
    } catch (error) {
      console.error('Error triggering follow-up messages:', error);
      throw error;
    }
  }
}

module.exports = new CronService();
