const { WorkOrder } = require('../models/Service');
const Appointment = require('../models/Appointment');
const Customer = require('../models/Customer');
const Vehicle = require('../models/Vehicle');

class WorkOrderService {
  /**
   * Create a work order from an approved appointment
   * @param {string} appointmentId - The appointment ID
   * @param {string} approvedBy - User ID who approved the appointment
   * @returns {Promise<Object>} Created work order
   */
  async createFromAppointment(appointmentId, approvedBy) {
    try {
      // Find the appointment with populated references
      const appointment = await Appointment.findById(appointmentId)
        .populate('customer')
        .populate('vehicle')
        .populate('serviceType')
        .populate('technician');

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      if (appointment.status !== 'pending_approval') {
        throw new Error('Appointment is not pending approval');
      }

      // Calculate estimated costs
      const estimatedCost = appointment.estimatedCost || {
        parts: 0,
        labor: 0,
        total: 0
      };

      // Create work order
      const workOrder = new WorkOrder({
        customer: appointment.customer._id,
        vehicle: {
          make: appointment.vehicle?.make || 'Unknown',
          model: appointment.vehicle?.model || 'Unknown',
          year: appointment.vehicle?.year || new Date().getFullYear(),
          vin: appointment.vehicle?.vin || 'N/A',
          licensePlate: appointment.vehicle?.licensePlate || 'N/A',
          mileage: appointment.vehicle?.mileage || 0
        },
        services: [{
          service: appointment.serviceType?._id || null,
          description: appointment.serviceDescription || 'Service from appointment',
          laborHours: Math.ceil(appointment.estimatedDuration / 60), // Convert minutes to hours
          laborRate: 100, // Default labor rate per hour
          parts: appointment.partsRequired || [],
          totalCost: estimatedCost.total || 0
        }],
        technician: appointment.technician?._id || null,
        status: 'pending',
        priority: appointment.priority || 'medium',
        estimatedStartDate: appointment.scheduledDate,
        estimatedCompletionDate: new Date(appointment.scheduledDate.getTime() + appointment.estimatedDuration * 60000),
        notes: `Created from appointment ${appointment._id}. ${appointment.notes || ''}`,
        customerNotes: appointment.customerNotes || ''
      });

      // Calculate totals
      workOrder.calculateTotals();

      // Save the work order
      const savedWorkOrder = await workOrder.save();

      // Update appointment status to confirmed
      appointment.status = 'confirmed';
      appointment.approvalStatus = 'approved';
      appointment.approvalDate = new Date();
      appointment.approvedBy = approvedBy;
      await appointment.save();

      console.log(`Work order ${savedWorkOrder.workOrderNumber} created from appointment ${appointmentId}`);

      return {
        success: true,
        workOrder: savedWorkOrder,
        appointment: appointment
      };

    } catch (error) {
      console.error('Error creating work order from appointment:', error);
      throw error;
    }
  }

  /**
   * Check if an appointment requires approval based on cost threshold
   * @param {Object} appointment - Appointment object
   * @returns {boolean} Whether approval is required
   */
  checkApprovalRequired(appointment) {
    const estimatedCost = appointment.estimatedCost?.total || 0;
    const threshold = appointment.approvalThreshold || 500;
    
    return estimatedCost > threshold;
  }

  /**
   * Get work orders by appointment ID
   * @param {string} appointmentId - The appointment ID
   * @returns {Promise<Array>} Array of work orders
   */
  async getWorkOrdersByAppointment(appointmentId) {
    try {
      const workOrders = await WorkOrder.find({
        notes: { $regex: appointmentId, $options: 'i' }
      }).populate('customer technician');

      return workOrders;
    } catch (error) {
      console.error('Error fetching work orders by appointment:', error);
      throw error;
    }
  }
}

module.exports = new WorkOrderService();
