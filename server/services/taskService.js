const Task = require('../models/Task');
const Appointment = require('../models/Appointment');
const User = require('../models/User');

class TaskService {
  /**
   * Create a follow-up task for declined/pending appointments
   * @param {string} appointmentId - The appointment ID
   * @param {string} assignedTo - User ID to assign the task to (Sub Admin)
   * @param {string} reason - Reason for decline/pending
   * @returns {Promise<Object>} Created task
   */
  async createFollowUpTask(appointmentId, assignedTo, reason = '') {
    try {
      // Find the appointment with populated references
      const appointment = await Appointment.findById(appointmentId)
        .populate('customer')
        .populate('vehicle')
        .populate('serviceType');

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      // Calculate due date (2 days before appointment)
      const dueDate = new Date(appointment.scheduledDate);
      dueDate.setDate(dueDate.getDate() - 2);

      // Create follow-up task
      const task = new Task({
        title: `Follow-up: Appointment Approval Required`,
        description: `Appointment for ${appointment.customer?.name || 'Customer'} on ${appointment.scheduledDate.toLocaleDateString()} requires follow-up. ${reason}`,
        type: 'follow_up',
        priority: 'high',
        status: 'pending',
        assignedTo: assignedTo,
        assignedBy: 'system', // System user ID - you might want to pass this as parameter
        customer: appointment.customer?._id || null,
        dueDate: dueDate,
        estimatedDuration: 30, // 30 minutes estimated
        notes: [{
          content: `Customer appointment needs approval. Call back and re-offer services. Original appointment: ${appointment._id}`,
          createdBy: 'system' // System user ID
        }]
      });

      // Save the task
      const savedTask = await task.save();

      // Update appointment status
      appointment.status = 'pending_approval';
      appointment.approvalStatus = 'requires_followup';
      appointment.approvalNotes = reason;
      await appointment.save();

      console.log(`Follow-up task ${savedTask._id} created for appointment ${appointmentId}`);

      return {
        success: true,
        task: savedTask,
        appointment: appointment
      };

    } catch (error) {
      console.error('Error creating follow-up task:', error);
      throw error;
    }
  }

  /**
   * Get tasks by appointment ID
   * @param {string} appointmentId - The appointment ID
   * @returns {Promise<Array>} Array of tasks
   */
  async getTasksByAppointment(appointmentId) {
    try {
      const tasks = await Task.find({
        notes: { $elemMatch: { content: { $regex: appointmentId, $options: 'i' } } }
      }).populate('assignedTo assignedBy customer');

      return tasks;
    } catch (error) {
      console.error('Error fetching tasks by appointment:', error);
      throw error;
    }
  }

  /**
   * Update task with follow-up outcome
   * @param {string} taskId - The task ID
   * @param {string} outcome - Follow-up outcome
   * @param {string} notes - Additional notes
   * @returns {Promise<Object>} Updated task
   */
  async updateFollowUpOutcome(taskId, outcome, notes = '') {
    try {
      const task = await Task.findById(taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      // Add outcome note
      task.notes.push({
        content: `Follow-up outcome: ${outcome}. ${notes}`,
        createdBy: 'system' // You might want to pass the actual user ID
      });

      // Update task status based on outcome
      if (outcome.toLowerCase().includes('approved') || outcome.toLowerCase().includes('confirmed')) {
        task.status = 'completed';
      } else if (outcome.toLowerCase().includes('declined') || outcome.toLowerCase().includes('cancelled')) {
        task.status = 'cancelled';
      } else {
        task.status = 'in_progress';
      }

      const updatedTask = await task.save();

      return {
        success: true,
        task: updatedTask
      };

    } catch (error) {
      console.error('Error updating follow-up outcome:', error);
      throw error;
    }
  }

  /**
   * Get all follow-up tasks that are pending
   * @returns {Promise<Array>} Array of pending follow-up tasks
   */
  async getPendingFollowUpTasks() {
    try {
      const tasks = await Task.find({
        type: 'follow_up',
        status: 'pending'
      })
      .populate('assignedTo', 'name email')
      .populate('customer', 'name businessName')
      .sort({ dueDate: 1 });

      return tasks;
    } catch (error) {
      console.error('Error fetching pending follow-up tasks:', error);
      throw error;
    }
  }
}

module.exports = new TaskService();
