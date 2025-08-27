const emailService = require('./emailService');
const User = require('../models/User');

class ApprovalNotificationService {
  /**
   * Send approval request notification to managers
   */
  async sendApprovalRequest(appointmentId, appointmentData) {
    try {
      // Get all admin users who can approve
      const admins = await User.find({ 
        role: { $in: ['admin', 'super_admin'] },
        isActive: true 
      });

      const approvalUrl = `${process.env.FRONTEND_URL}/approvals/${appointmentId}`;
      
      for (const admin of admins) {
        await emailService.sendEmail({
          to: admin.email,
          subject: `Approval Required: ${appointmentData.customer.name} - ${appointmentData.serviceType.name}`,
          template: 'approval-request',
          context: {
            adminName: admin.name,
            customerName: appointmentData.customer.name,
            customerEmail: appointmentData.customer.email,
            serviceName: appointmentData.serviceType.name,
            vehicleInfo: `${appointmentData.vehicle.year} ${appointmentData.vehicle.make} ${appointmentData.vehicle.model}`,
            scheduledDate: appointmentData.scheduledDate,
            scheduledTime: appointmentData.scheduledTime,
            estimatedCost: appointmentData.estimatedCost.total,
            approvalUrl: approvalUrl,
            notes: appointmentData.notes || 'No additional notes'
          }
        });
      }

      console.log(`Approval request sent to ${admins.length} admins for appointment ${appointmentId}`);
    } catch (error) {
      console.error('Error sending approval request:', error);
      throw error;
    }
  }

  /**
   * Send approval decision notification
   */
  async sendApprovalDecision(appointmentId, appointmentData, decision, notes = '') {
    try {
      const decisionText = decision === 'approved' ? 'approved' : 'declined';
      const subject = `Appointment ${decisionText}: ${appointmentData.customer.name}`;
      
      await emailService.sendEmail({
        to: appointmentData.customer.email,
        subject: subject,
        template: 'approval-decision',
        context: {
          customerName: appointmentData.customer.name,
          serviceName: appointmentData.serviceType.name,
          vehicleInfo: `${appointmentData.vehicle.year} ${appointmentData.vehicle.make} ${appointmentData.vehicle.model}`,
          scheduledDate: appointmentData.scheduledDate,
          scheduledTime: appointmentData.scheduledTime,
          decision: decision,
          notes: notes,
          nextSteps: decision === 'approved' 
            ? 'Your appointment has been confirmed. Please arrive 10 minutes early.' 
            : 'We will contact you to discuss alternative options.'
        }
      });

      console.log(`Approval decision notification sent to customer for appointment ${appointmentId}`);
    } catch (error) {
      console.error('Error sending approval decision:', error);
      throw error;
    }
  }

  /**
   * Send follow-up task notification
   */
  async sendFollowUpTaskNotification(taskId, taskData, assignedUser) {
    try {
      await emailService.sendEmail({
        to: assignedUser.email,
        subject: `Follow-up Task Assigned: ${taskData.title}`,
        template: 'follow-up-task',
        context: {
          userName: assignedUser.name,
          taskTitle: taskData.title,
          taskDescription: taskData.description,
          customerName: taskData.customer.name,
          customerEmail: taskData.customer.email,
          customerPhone: taskData.customer.phone,
          dueDate: taskData.dueDate,
          followUpType: taskData.followUpType,
          declineReason: taskData.declineReason || 'No reason provided'
        }
      });

      console.log(`Follow-up task notification sent to ${assignedUser.email} for task ${taskId}`);
    } catch (error) {
      console.error('Error sending follow-up task notification:', error);
      throw error;
    }
  }
}

module.exports = new ApprovalNotificationService();