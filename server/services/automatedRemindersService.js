const Task = require('../models/Task');
const User = require('../models/User');
const emailService = require('./emailService');
const smsService = require('./smsService');

class AutomatedRemindersService {
  /**
   * Process all pending reminders
   */
  async processPendingReminders() {
    try {
      const now = new Date();
      
      // Find all tasks with pending reminders that are due
      const tasksWithReminders = await Task.find({
        'automatedReminders.status': 'pending',
        'automatedReminders.scheduledDate': { $lte: now }
      }).populate('customer', 'businessName contactPerson.email contactPerson.phone')
         .populate('assignedTo', 'name email')
         .populate('assignedBy', 'name email');

      console.log(`Found ${tasksWithReminders.length} tasks with pending reminders`);

      for (const task of tasksWithReminders) {
        await this.processTaskReminders(task);
      }

      return { success: true, processed: tasksWithReminders.length };
    } catch (error) {
      console.error('Error processing pending reminders:', error);
      throw error;
    }
  }

  /**
   * Process reminders for a specific task
   */
  async processTaskReminders(task) {
    try {
      const pendingReminders = task.automatedReminders.filter(
        reminder => reminder.status === 'pending' && 
        new Date(reminder.scheduledDate) <= new Date()
      );

      for (const reminder of pendingReminders) {
        await this.sendReminder(task, reminder);
      }
    } catch (error) {
      console.error(`Error processing reminders for task ${task._id}:`, error);
    }
  }

  /**
   * Send a specific reminder
   */
  async sendReminder(task, reminder) {
    try {
      let message, recipient;
      
      // Determine recipient and message based on reminder type
      switch (reminder.recipient) {
        case 'customer':
          recipient = task.customer?.contactPerson?.email || task.customer?.contactPerson?.phone;
          message = this.generateCustomerMessage(task, reminder);
          break;
        case 'assigned_user':
          recipient = task.assignedTo?.email;
          message = this.generateStaffMessage(task, reminder);
          break;
        case 'manager':
          recipient = task.assignedBy?.email;
          message = this.generateManagerMessage(task, reminder);
          break;
        default:
          recipient = task.customer?.contactPerson?.email;
          message = this.generateCustomerMessage(task, reminder);
      }

      if (!recipient) {
        await task.markReminderSent(reminder._id, null, 'No recipient contact information');
        return;
      }

      // Send reminder based on type
      let success = false;
      let errorMessage = null;

      switch (reminder.type) {
        case 'email':
          if (recipient.includes('@')) {
            success = await this.sendEmailReminder(recipient, message, task);
          } else {
            errorMessage = 'Invalid email address';
          }
          break;
        case 'sms':
          if (recipient.match(/^\+?[\d\s\-\(\)]+$/)) {
            success = await this.sendSMSReminder(recipient, message, task);
          } else {
            errorMessage = 'Invalid phone number';
          }
          break;
        case 'letter':
          success = await this.generateLetterReminder(task, message);
          break;
        case 'phone':
          success = await this.schedulePhoneReminder(task, message);
          break;
      }

      if (success) {
        await task.markReminderSent(reminder._id, message);
        console.log(`Reminder sent successfully for task ${task._id}`);
      } else {
        await task.markReminderSent(reminder._id, null, errorMessage || 'Failed to send reminder');
        console.error(`Failed to send reminder for task ${task._id}: ${errorMessage}`);
      }

    } catch (error) {
      console.error(`Error sending reminder for task ${task._id}:`, error);
      await task.markReminderSent(reminder._id, null, error.message);
    }
  }

  /**
   * Generate customer reminder message
   */
  generateCustomerMessage(task, reminder) {
    const baseMessage = `Dear ${task.customer?.businessName || 'Valued Customer'},`;
    
    switch (task.collectionsType) {
      case 'payment_reminder':
        return `${baseMessage}\n\nThis is a friendly reminder that payment of $${task.amount} is due on ${new Date(task.dueDate).toLocaleDateString()}.\n\nPlease contact us to arrange payment or if you have any questions.\n\nThank you for your business.`;
      
      case 'overdue_notice':
        return `${baseMessage}\n\nYour payment of $${task.amount} is now overdue. Please arrange payment immediately to avoid further action.\n\nContact us today to resolve this matter.\n\nThank you.`;
      
      case 'payment_plan':
        const remaining = task.paymentPlan.totalAmount - task.paymentPlan.totalPaid;
        return `${baseMessage}\n\nYour next payment plan installment of $${task.paymentPlan.installmentAmount} is due on ${new Date(task.paymentPlan.nextPaymentDate).toLocaleDateString()}.\n\nRemaining balance: $${remaining}\n\nPlease ensure timely payment to maintain your payment plan.`;
      
      default:
        return `${baseMessage}\n\nThis is a reminder regarding your account. Please contact us for more information.\n\nThank you.`;
    }
  }

  /**
   * Generate staff reminder message
   */
  generateStaffMessage(task, reminder) {
    return `Task Reminder: ${task.title}\n\nCustomer: ${task.customer?.businessName || 'Unknown'}\nAmount: $${task.amount}\nDue Date: ${new Date(task.dueDate).toLocaleDateString()}\n\nPlease follow up on this collections task.`;
  }

  /**
   * Generate manager reminder message
   */
  generateManagerMessage(task, reminder) {
    return `Escalation Alert: ${task.title}\n\nTask has been escalated due to overdue status.\nCustomer: ${task.customer?.businessName || 'Unknown'}\nAmount: $${task.amount}\nDays Overdue: ${Math.floor((new Date() - new Date(task.dueDate)) / (1000 * 60 * 60 * 24))}\n\nImmediate attention required.`;
  }

  /**
   * Send email reminder
   */
  async sendEmailReminder(email, message, task) {
    try {
      await emailService.sendEmail({
        to: email,
        subject: `Payment Reminder - ${task.title}`,
        text: message,
        html: message.replace(/\n/g, '<br>')
      });
      return true;
    } catch (error) {
      console.error('Email reminder failed:', error);
      return false;
    }
  }

  /**
   * Send SMS reminder
   */
  async sendSMSReminder(phone, message, task) {
    try {
      await smsService.sendSMS({
        to: phone,
        message: message.substring(0, 160) // SMS character limit
      });
      return true;
    } catch (error) {
      console.error('SMS reminder failed:', error);
      return false;
    }
  }

  /**
   * Generate letter reminder (placeholder for future implementation)
   */
  async generateLetterReminder(task, message) {
    // This would integrate with a document generation service
    // For now, just log the action
    console.log(`Letter reminder generated for task ${task._id}`);
    return true;
  }

  /**
   * Schedule phone reminder (placeholder for future implementation)
   */
  async schedulePhoneReminder(task, message) {
    // This would integrate with a call scheduling service
    // For now, just log the action
    console.log(`Phone reminder scheduled for task ${task._id}`);
    return true;
  }

  /**
   * Schedule a new reminder for a task
   */
  async scheduleReminder(taskId, reminderData) {
    try {
      const task = await Task.findById(taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      const scheduledDate = new Date(reminderData.scheduledDate);
      await task.scheduleReminder(
        reminderData.type,
        scheduledDate,
        reminderData.template || 'default',
        reminderData.recipient || 'customer'
      );

      return { success: true, task };
    } catch (error) {
      console.error('Error scheduling reminder:', error);
      throw error;
    }
  }

  /**
   * Get all reminders for a task
   */
  async getTaskReminders(taskId) {
    try {
      const task = await Task.findById(taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      return task.automatedReminders;
    } catch (error) {
      console.error('Error getting task reminders:', error);
      throw error;
    }
  }

  /**
   * Cancel a scheduled reminder
   */
  async cancelReminder(taskId, reminderId) {
    try {
      const task = await Task.findById(taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      const reminder = task.automatedReminders.id(reminderId);
      if (reminder) {
        reminder.status = 'cancelled';
        await task.save();
        return { success: true };
      }

      throw new Error('Reminder not found');
    } catch (error) {
      console.error('Error cancelling reminder:', error);
      throw error;
    }
  }
}

module.exports = new AutomatedRemindersService();
