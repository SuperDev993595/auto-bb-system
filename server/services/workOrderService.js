const { WorkOrder } = require("../models/Service");
const { InventoryItem } = require("../models/Inventory");
const Appointment = require("../models/Appointment");
const Customer = require("../models/Customer");
const Vehicle = require("../models/Vehicle");

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
        .populate("customer")
        .populate("vehicle")
        .populate("serviceType")
        .populate("technician");

      if (!appointment) {
        throw new Error("Appointment not found");
      }

      if (appointment.approvalStatus !== "approved") {
        throw new Error(
          "Appointment must be approved before creating a work order"
        );
      }

      // Check if a work order already exists for this appointment
      const existingWorkOrder = await WorkOrder.findOne({
        notes: {
          $regex: `Created from appointment ${appointmentId}`,
          $options: "i",
        },
      });

      if (existingWorkOrder) {
        throw new Error(
          "A work order has already been created from this appointment"
        );
      }

      // Check parts availability before creating work order
      const partsAvailability = await this.checkPartsAvailability(
        appointment.partsRequired || []
      );

      // Calculate estimated costs
      const estimatedCost = appointment.estimatedCost || {
        parts: 0,
        labor: 0,
        total: 0,
      };

      // Ensure we have a valid service type
      if (!appointment.serviceType?._id) {
        throw new Error(
          "Appointment must have a valid service type to create a work order"
        );
      }

      // Create work order
      const workOrder = new WorkOrder({
        customer: appointment.customer._id,
        vehicle: {
          _id: appointment.vehicle?._id || null,
          make: appointment.vehicle?.make || "Unknown",
          model: appointment.vehicle?.model || "Unknown",
          year: appointment.vehicle?.year || new Date().getFullYear(),
          vin: appointment.vehicle?.vin || "N/A",
          licensePlate: appointment.vehicle?.licensePlate || "N/A",
          mileage: appointment.vehicle?.mileage || 0,
        },
        services: [
          {
            service: appointment.serviceType._id,
            description:
              appointment.serviceDescription || "Service from appointment",
            laborHours: Math.ceil(appointment.estimatedDuration / 60), // Convert minutes to hours
            laborRate: appointment.serviceType.laborRate || 100, // Use service type labor rate or default
            parts: appointment.partsRequired || [],
            totalCost: estimatedCost.total || 0,
          },
        ],
        technician: appointment.technician?._id || null,
        status: partsAvailability.allAvailable ? "pending" : "on_hold",
        priority: appointment.priority || "medium",
        estimatedStartDate: appointment.scheduledDate,
        estimatedCompletionDate: new Date(
          appointment.scheduledDate.getTime() +
            appointment.estimatedDuration * 60000
        ),
        notes: `Created from appointment ${appointment._id}. ${
          appointment.notes || ""
        }`,
        customerNotes: appointment.customerNotes || "",
        partsAvailability: partsAvailability,
        createdBy: approvedBy,
      });

      // Calculate totals
      workOrder.calculateTotals();

      // Save the work order
      const savedWorkOrder = await workOrder.save();

      // Update appointment status to confirmed and mark as work order created
      appointment.status = "confirmed";
      appointment.approvalStatus = "approved";
      appointment.approvalDate = appointment.approvalDate || new Date();
      appointment.approvedBy = appointment.approvedBy || approvedBy;
      await appointment.save();

      console.log(
        `Work order ${savedWorkOrder.workOrderNumber} created from appointment ${appointmentId}`
      );

      return {
        success: true,
        workOrder: savedWorkOrder,
        appointment: appointment,
        partsAvailability: partsAvailability,
      };
    } catch (error) {
      console.error("Error creating work order from appointment:", error);
      throw error;
    }
  }

  /**
   * Check parts availability for a work order
   * @param {Array} partsRequired - Array of required parts
   * @returns {Promise<Object>} Parts availability status
   */
  async checkPartsAvailability(partsRequired) {
    const availability = {
      allAvailable: true,
      missingParts: [],
      availableParts: [],
      totalMissing: 0,
    };

    for (const part of partsRequired) {
      try {
        // Find the part in inventory
        const inventoryItem = await InventoryItem.findOne({
          $or: [
            { partNumber: part.partNumber },
            { name: { $regex: part.name, $options: "i" } },
          ],
        });

        if (!inventoryItem) {
          availability.allAvailable = false;
          availability.missingParts.push({
            ...part,
            reason: "Part not found in inventory",
          });
          availability.totalMissing += part.quantity;
        } else if (inventoryItem.currentStock < part.quantity) {
          availability.allAvailable = false;
          availability.missingParts.push({
            ...part,
            currentStock: inventoryItem.currentStock,
            reason: "Insufficient stock",
          });
          availability.totalMissing +=
            part.quantity - inventoryItem.currentStock;
        } else {
          availability.availableParts.push({
            ...part,
            currentStock: inventoryItem.currentStock,
            inventoryItemId: inventoryItem._id,
          });
        }
      } catch (error) {
        console.error(
          `Error checking availability for part ${part.name}:`,
          error
        );
        availability.allAvailable = false;
        availability.missingParts.push({
          ...part,
          reason: "Error checking inventory",
        });
        availability.totalMissing += part.quantity;
      }
    }

    return availability;
  }

  /**
   * Start work on a work order
   * @param {string} workOrderId - The work order ID
   * @param {string} technicianId - The technician ID
   * @returns {Promise<Object>} Updated work order
   */
  async startWork(workOrderId, technicianId) {
    try {
      const workOrder = await WorkOrder.findById(workOrderId);
      if (!workOrder) {
        throw new Error("Work order not found");
      }

      if (workOrder.status === "on_hold") {
        // Re-check parts availability
        const partsAvailability = await this.checkPartsAvailability(
          workOrder.services.flatMap((service) => service.parts)
        );

        if (!partsAvailability.allAvailable) {
          throw new Error("Cannot start work - parts still not available");
        }
      }

      // Update work order status
      await workOrder.updateStatus(
        "in_progress",
        `Work started by technician ${technicianId}`
      );

      // Update technician assignment if different
      if (workOrder.technician?.toString() !== technicianId) {
        workOrder.technician = technicianId;
        await workOrder.save();
      }

      return {
        success: true,
        workOrder: workOrder,
        message: "Work started successfully",
      };
    } catch (error) {
      console.error("Error starting work:", error);
      throw error;
    }
  }

  /**
   * Update work order progress
   * @param {string} workOrderId - The work order ID
   * @param {number} progress - Progress percentage (0-100)
   * @param {string} notes - Optional notes
   * @returns {Promise<Object>} Updated work order
   */
  async updateProgress(workOrderId, progress, notes = "") {
    try {
      const workOrder = await WorkOrder.findById(workOrderId);
      if (!workOrder) {
        throw new Error("Work order not found");
      }

      if (workOrder.status !== "in_progress") {
        throw new Error("Work order is not in progress");
      }

      // Update progress
      workOrder.progress = progress;

      // Add progress note
      const progressNote = `Progress updated to ${progress}%${
        notes ? ` - ${notes}` : ""
      }`;
      workOrder.notes = workOrder.notes
        ? `${workOrder.notes}\n${progressNote}`
        : progressNote;

      // Auto-complete if progress is 100%
      if (progress >= 100) {
        await workOrder.updateStatus("completed", "Work completed");

        // Automatically generate invoice when work order is completed
        try {
          await this.generateInvoiceFromWorkOrder(workOrderId);
        } catch (invoiceError) {
          console.error(
            "Failed to generate invoice automatically:",
            invoiceError
          );
          // Don't throw error here - we don't want to fail the progress update
          // Just log the error and continue
        }
      }

      await workOrder.save();

      return {
        success: true,
        workOrder: workOrder,
        message: "Progress updated successfully",
      };
    } catch (error) {
      console.error("Error updating progress:", error);
      throw error;
    }
  }

  /**
   * Complete work order with quality control
   * @param {string} workOrderId - The work order ID
   * @param {Object} qcData - Quality control data
   * @returns {Promise<Object>} Completed work order
   */
  async completeWorkOrder(workOrderId, qcData) {
    try {
      const workOrder = await WorkOrder.findById(workOrderId);
      if (!workOrder) {
        throw new Error("Work order not found");
      }

      if (workOrder.status !== "in_progress") {
        throw new Error("Work order is not in progress");
      }

      // Add QC notes
      const qcNotes = `Quality Control Completed:
- Test Drive: ${qcData.testDrive ? "Passed" : "Failed"}
- Visual Inspection: ${qcData.visualInspection ? "Passed" : "Failed"}
- QC Notes: ${qcData.notes || "No issues found"}
- Completed by: ${qcData.completedBy}`;

      await workOrder.updateStatus("completed", qcNotes);

      // Update actual costs if provided
      if (qcData.actualCosts) {
        workOrder.actualCost = qcData.actualCosts;
        await workOrder.save();
      }

      return {
        success: true,
        workOrder: workOrder,
        message: "Work order completed successfully",
      };
    } catch (error) {
      console.error("Error completing work order:", error);
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
        notes: { $regex: appointmentId, $options: "i" },
      }).populate("customer technician");

      return workOrders;
    } catch (error) {
      console.error("Error fetching work orders by appointment:", error);
      throw error;
    }
  }

  /**
   * Get work orders for job board display
   * @param {Object} filters - Filter options
   * @returns {Promise<Object>} Work orders with pagination
   */
  async getJobBoardWorkOrders(filters = {}) {
    try {
      const {
        status = "all",
        technician = "all",
        priority = "all",
        search = "",
        page = 1,
        limit = 20,
      } = filters;

      const query = {};

      if (status !== "all") {
        query.status = status;
      }
      if (technician !== "all") {
        query.technician = technician;
      }
      if (priority !== "all") {
        query.priority = priority;
      }

      // Add search functionality
      if (search && search.trim()) {
        const searchRegex = new RegExp(search.trim(), "i");
        query.$or = [
          { workOrderNumber: searchRegex },
          { "customer.name": searchRegex },
          { "vehicle.make": searchRegex },
          { "vehicle.model": searchRegex },
          { "vehicle.licensePlate": searchRegex },
        ];
      }

      const workOrders = await WorkOrder.find(query)
        .populate("customer", "name email phone")
        .populate("technician", "name email")
        .populate("services.service", "name description")
        .sort({ priority: -1, estimatedStartDate: 1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const total = await WorkOrder.countDocuments(query);

      return {
        workOrders,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalWorkOrders: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      };
    } catch (error) {
      console.error("Error fetching job board work orders:", error);
      throw error;
    }
  }

  /**
   * Generate invoice from completed work order
   * @param {string} workOrderId - The work order ID
   * @returns {Promise<Object>} Generated invoice
   */
  async generateInvoiceFromWorkOrder(workOrderId) {
    try {
      const Invoice = require("../models/Invoice");

      // Find the work order
      const workOrder = await WorkOrder.findById(workOrderId)
        .populate("customer", "name email phone")
        .populate("services.service", "name description");

      if (!workOrder) {
        throw new Error("Work order not found");
      }

      // Check if work order is completed
      if (workOrder.status !== "completed") {
        throw new Error("Work order must be completed to generate invoice");
      }

      // Check if invoice already exists for this work order
      const existingInvoice = await Invoice.findOne({
        workOrderId: workOrderId,
      });
      if (existingInvoice) {
        throw new Error("Invoice already exists for this work order");
      }

      // Generate invoice number
      const invoiceNumber = await Invoice.generateInvoiceNumber();

      // Calculate totals
      const subtotal = workOrder.totalCost || 0;
      const tax = subtotal * 0.08; // 8% tax rate - you can make this configurable
      const total = subtotal + tax;

      // Create invoice items from work order services
      const items = workOrder.services.map((service) => ({
        description: service.service?.name || service.description || "Service",
        quantity: 1,
        unitPrice: service.totalCost,
        total: service.totalCost,
      }));

      // Create the invoice
      const invoice = new Invoice({
        customerId: workOrder.customer._id,
        workOrderId: workOrder._id,
        invoiceNumber: invoiceNumber,
        date: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        vehicleId: workOrder.vehicle._id || null,
        serviceType: "Automotive Repair",
        items: items,
        subtotal: subtotal,
        tax: tax,
        total: total,
        status: "draft",
        notes: `Invoice generated automatically from completed work order ${workOrder.workOrderNumber}`,
        createdBy: workOrder.technician || null,
      });

      await invoice.save();
      await invoice.populate("customerId", "name email phone");
      await invoice.populate("vehicleId", "year make model");

      return {
        success: true,
        invoice: invoice,
        message: "Invoice generated successfully from work order",
      };
    } catch (error) {
      console.error("Error generating invoice from work order:", error);
      throw error;
    }
  }
}

module.exports = new WorkOrderService();
