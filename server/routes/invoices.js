const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const Invoice = require("../models/Invoice");
const Customer = require("../models/Customer");

const InventoryItem = require("../models/Inventory");

// Validation schemas
const invoiceItemSchema = Joi.object({
  description: Joi.string().required(),
  quantity: Joi.number().positive().required(),
  unitPrice: Joi.number().positive().required(),
  total: Joi.number().positive().required(),
});

const invoiceSchema = Joi.object({
  customerId: Joi.string().required(),
  invoiceNumber: Joi.string().required(),
  dueDate: Joi.date().required(),
  vehicleId: Joi.string().required(),
  serviceType: Joi.string().required(),
  items: Joi.array().items(invoiceItemSchema).min(1).required(),
  subtotal: Joi.number().positive().required(),
  tax: Joi.number().min(0).required(),
  discount: Joi.number().min(0).default(0),
  total: Joi.number().positive().required(),
  status: Joi.string()
    .valid("draft", "sent", "paid", "pending", "overdue", "cancelled")
    .default("draft"),
  notes: Joi.string().allow("", null),
  terms: Joi.string().allow("", null),
});

// Get all invoices with pagination and filtering
router.get("/", authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      customerId,
      startDate,
      endDate,
      search,
    } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (customerId) filter.customerId = customerId;
    if (startDate || endDate) {
      filter.issueDate = {};
      if (startDate) filter.issueDate.$gte = new Date(startDate);
      if (endDate) filter.issueDate.$lte = new Date(endDate);
    }
    if (search) {
      filter.$or = [
        { invoiceNumber: { $regex: search, $options: "i" } },
        { "customer.name": { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get total count for pagination
    const totalDocs = await Invoice.countDocuments(filter);
    const totalPages = Math.ceil(totalDocs / limitNum);

    // Get invoices with pagination
    const invoices = await Invoice.find(filter)
      .populate("customerId", "name email phone")
      .populate("vehicleId", "year make model")
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      data: invoices,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalDocs: totalDocs,
        totalPages: totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch invoices" });
  }
});

// Get invoice statistics
router.get("/stats/overview", authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const stats = await Invoice.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalInvoices: { $sum: 1 },
          totalAmount: { $sum: "$total" },
          totalPaid: { $sum: "$paidAmount" },
          totalOutstanding: { $sum: { $subtract: ["$total", "$paidAmount"] } },
          avgInvoiceValue: { $avg: "$total" },
        },
      },
    ]);

    const statusStats = await Invoice.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$total" },
        },
      },
    ]);

    const monthlyStats = await Invoice.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
          },
          count: { $sum: 1 },
          totalAmount: { $sum: "$total" },
          totalPaid: { $sum: "$paidAmount" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalInvoices: 0,
          totalAmount: 0,
          totalPaid: 0,
          totalOutstanding: 0,
          avgInvoiceValue: 0,
        },
        byStatus: statusStats,
        monthly: monthlyStats,
      },
    });
  } catch (error) {
    console.error("Error fetching invoice stats:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch invoice statistics" });
  }
});

// Get payment statistics
router.get("/payment-stats", authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.paidDate = {};
      if (startDate) filter.paidDate.$gte = new Date(startDate);
      if (endDate) filter.paidDate.$lte = new Date(endDate);
    }

    // Get payment statistics
    const totalPayments = await Invoice.countDocuments({
      ...filter,
      status: "paid",
    });

    const totalPaidAmount = await Invoice.aggregate([
      { $match: { ...filter, status: "paid" } },
      { $group: { _id: null, total: { $sum: "$paidAmount" } } },
    ]);

    const paymentMethods = await Invoice.aggregate([
      { $match: { ...filter, status: "paid" } },
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          total: { $sum: "$paidAmount" },
        },
      },
    ]);

    const monthlyPayments = await Invoice.aggregate([
      { $match: { ...filter, status: "paid" } },
      {
        $group: {
          _id: {
            year: { $year: "$paidDate" },
            month: { $month: "$paidDate" },
          },
          count: { $sum: 1 },
          total: { $sum: "$paidAmount" },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 },
    ]);

    const overduePayments = await Invoice.countDocuments({
      ...filter,
      status: "overdue",
    });

    const overdueAmount = await Invoice.aggregate([
      { $match: { ...filter, status: "overdue" } },
      {
        $group: {
          _id: null,
          total: { $sum: { $subtract: ["$total", "$paidAmount"] } },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalPayments,
        totalPaidAmount: totalPaidAmount[0]?.total || 0,
        paymentMethods,
        monthlyPayments,
        overduePayments,
        overdueAmount: overdueAmount[0]?.total || 0,
        averagePayment:
          totalPayments > 0
            ? (totalPaidAmount[0]?.total || 0) / totalPayments
            : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching payment stats:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch payment statistics" });
  }
});

// Get invoice templates
router.get("/templates", authenticateToken, async (req, res) => {
  try {
    // Sample invoice templates
    const templates = [
      {
        id: "standard",
        name: "Standard Invoice",
        description: "Basic invoice template for general services",
        fields: [
          {
            name: "invoiceNumber",
            type: "text",
            required: true,
            label: "Invoice Number",
          },
          { name: "date", type: "date", required: true, label: "Issue Date" },
          { name: "dueDate", type: "date", required: true, label: "Due Date" },
          {
            name: "customerId",
            type: "select",
            required: true,
            label: "Customer",
          },
          { name: "items", type: "array", required: true, label: "Items" },
          {
            name: "subtotal",
            type: "number",
            required: true,
            label: "Subtotal",
          },
          {
            name: "taxAmount",
            type: "number",
            required: true,
            label: "Tax Amount",
          },
          {
            name: "totalAmount",
            type: "number",
            required: true,
            label: "Total Amount",
          },
          { name: "notes", type: "textarea", required: false, label: "Notes" },
          {
            name: "terms",
            type: "textarea",
            required: false,
            label: "Terms & Conditions",
          },
        ],
        defaultValues: {
          paymentTerms: "Net 30",
          status: "draft",
          taxRate: 0,
        },
      },
      {
        id: "detailed",
        name: "Detailed Invoice",
        description: "Comprehensive invoice template with detailed breakdown",
        fields: [
          {
            name: "invoiceNumber",
            type: "text",
            required: true,
            label: "Invoice Number",
          },
          { name: "date", type: "date", required: true, label: "Issue Date" },
          { name: "dueDate", type: "date", required: true, label: "Due Date" },
          {
            name: "customerId",
            type: "select",
            required: true,
            label: "Customer",
          },
          { name: "items", type: "array", required: true, label: "Items" },
          {
            name: "subtotal",
            type: "number",
            required: true,
            label: "Subtotal",
          },
          {
            name: "discountAmount",
            type: "number",
            required: false,
            label: "Discount Amount",
          },
          {
            name: "taxAmount",
            type: "number",
            required: true,
            label: "Tax Amount",
          },
          {
            name: "totalAmount",
            type: "number",
            required: true,
            label: "Total Amount",
          },
          {
            name: "paymentTerms",
            type: "select",
            required: false,
            label: "Payment Terms",
          },
          { name: "notes", type: "textarea", required: false, label: "Notes" },
          {
            name: "terms",
            type: "textarea",
            required: false,
            label: "Terms & Conditions",
          },
        ],
        defaultValues: {
          paymentTerms: "Net 30",
          status: "draft",
          taxRate: 0,
          discountType: "fixed",
          discountValue: 0,
        },
      },
      {
        id: "service",
        name: "Service Invoice",
        description: "Specialized template for service-based invoices",
        fields: [
          {
            name: "invoiceNumber",
            type: "text",
            required: true,
            label: "Invoice Number",
          },
          { name: "date", type: "date", required: true, label: "Issue Date" },
          { name: "dueDate", type: "date", required: true, label: "Due Date" },
          {
            name: "customerId",
            type: "select",
            required: true,
            label: "Customer",
          },
          { name: "items", type: "array", required: true, label: "Services" },
          {
            name: "subtotal",
            type: "number",
            required: true,
            label: "Subtotal",
          },
          {
            name: "taxAmount",
            type: "number",
            required: true,
            label: "Tax Amount",
          },
          {
            name: "totalAmount",
            type: "number",
            required: true,
            label: "Total Amount",
          },
          {
            name: "notes",
            type: "textarea",
            required: false,
            label: "Service Notes",
          },
        ],
        defaultValues: {
          paymentTerms: "Net 15",
          status: "draft",
          taxRate: 0,
        },
      },
    ];

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error("Error fetching invoice templates:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch invoice templates" });
  }
});

// Get single invoice by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("customerId", "name email phone address")
      .populate("vehicleId", "year make model");

    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }

    res.json({ success: true, data: invoice });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch invoice" });
  }
});

// Create new invoice
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { error, value } = invoiceSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    // Check if customer exists
    const customer = await Customer.findById(value.customerId);
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    // Check if invoice number is unique
    const existingInvoice = await Invoice.findOne({
      invoiceNumber: value.invoiceNumber,
    });
    if (existingInvoice) {
      return res
        .status(400)
        .json({ success: false, message: "Invoice number already exists" });
    }

    // Validate items - ensure totals are calculated correctly
    for (const item of value.items) {
      if (item.total !== item.quantity * item.unitPrice) {
        return res.status(400).json({
          success: false,
          message: `Item total mismatch: ${item.description}`,
        });
      }
    }

    const invoice = new Invoice({
      ...value,
      createdBy: req.user.id,
    });

    await invoice.save();
    await invoice.populate("customerId", "name email phone");
    await invoice.populate("vehicleId", "year make model");

    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    console.error("Error creating invoice:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create invoice" });
  }
});

// Generate invoice from work order
router.post("/generate-from-workorder", authenticateToken, async (req, res) => {
  try {
    const { workOrderId } = req.body;

    if (!workOrderId) {
      return res
        .status(400)
        .json({ success: false, message: "Work order ID is required" });
    }

    // Import WorkOrder model
    const { WorkOrder } = require("../models/Service");

    // Find the work order
    const workOrder = await WorkOrder.findById(workOrderId)
      .populate("customer", "name email phone")
      .populate("services.service", "name description");

    if (!workOrder) {
      return res
        .status(404)
        .json({ success: false, message: "Work order not found" });
    }

    // Check if work order is completed
    if (workOrder.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Work order must be completed to generate invoice",
      });
    }

    // Check if invoice already exists for this work order
    const existingInvoice = await Invoice.findOne({ workOrderId: workOrderId });
    if (existingInvoice) {
      return res.status(400).json({
        success: false,
        message: "Invoice already exists for this work order",
      });
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
      createdBy: req.user.id,
    });

    await invoice.save();
    await invoice.populate("customerId", "name email phone");
    await invoice.populate("vehicleId", "year make model");

    res.status(201).json({
      success: true,
      data: invoice,
      message: "Invoice generated successfully from work order",
    });
  } catch (error) {
    console.error("Error generating invoice from work order:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate invoice from work order",
    });
  }
});

// Update invoice
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { error, value } = invoiceSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }

    // Check if customer exists
    const customer = await Customer.findById(value.customerId);
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    // Check if invoice number is unique (excluding current invoice)
    const existingInvoice = await Invoice.findOne({
      invoiceNumber: value.invoiceNumber,
      _id: { $ne: req.params.id },
    });
    if (existingInvoice) {
      return res
        .status(400)
        .json({ success: false, message: "Invoice number already exists" });
    }

    // Validate items - ensure totals are calculated correctly
    for (const item of value.items) {
      if (item.total !== item.quantity * item.unitPrice) {
        return res.status(400).json({
          success: false,
          message: `Item total mismatch: ${item.description}`,
        });
      }
    }

    Object.assign(invoice, value);
    invoice.updatedBy = req.user.id;
    invoice.updatedAt = Date.now();

    await invoice.save();
    await invoice.populate("customerId", "name email phone");
    await invoice.populate("vehicleId", "year make model");

    res.json({ success: true, data: invoice });
  } catch (error) {
    console.error("Error updating invoice:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update invoice" });
  }
});

// Delete invoice
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }

    // Check if user has permission to delete this invoice
    const isAdmin =
      req.user.role === "admin" || req.user.role === "super_admin";
    const isCreator =
      invoice.createdBy && invoice.createdBy.toString() === req.user.id;

    if (!isAdmin && !isCreator) {
      return res.status(403).json({
        success: false,
        message:
          "You can only delete invoices you created or admin access required",
      });
    }

    // Only allow deletion of draft invoices
    if (invoice.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft invoices can be deleted",
      });
    }

    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Invoice deleted successfully" });
  } catch (error) {
    console.error("Error deleting invoice:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete invoice" });
  }
});

// Add payment to invoice
router.post("/:id/payments", authenticateToken, async (req, res) => {
  try {
    const { amount, paymentMethod, reference, notes } = req.body;

    const paymentSchema = Joi.object({
      amount: Joi.number().positive().required(),
      paymentMethod: Joi.string()
        .valid("cash", "credit_card", "bank_transfer", "check", "online")
        .required(),
      reference: Joi.string().allow("", null),
      notes: Joi.string().allow("", null),
    });

    const { error } = paymentSchema.validate({
      amount,
      paymentMethod,
      reference,
      notes,
    });
    if (error) {
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }

    if (invoice.status === "paid") {
      return res
        .status(400)
        .json({ success: false, message: "Invoice is already fully paid" });
    }

    const payment = {
      amount,
      paymentMethod,
      reference,
      notes,
      date: new Date(),
      processedBy: req.user.id,
    };

    invoice.payments.push(payment);
    invoice.totalPaid = invoice.payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );

    // Update status based on payment
    if (invoice.totalPaid >= invoice.totalAmount) {
      invoice.status = "paid";
      invoice.paidDate = new Date();
    } else if (invoice.dueDate < new Date() && invoice.status !== "overdue") {
      invoice.status = "overdue";
    }

    await invoice.save();
    await invoice.populate("customerId", "name email phone");
    await invoice.populate("vehicleId", "year make model");

    res.json({ success: true, data: invoice });
  } catch (error) {
    console.error("Error adding payment:", error);
    res.status(500).json({ success: false, message: "Failed to add payment" });
  }
});

// Send invoice (update status to sent)
router.post("/:id/send", authenticateToken, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }

    if (invoice.status !== "draft") {
      return res
        .status(400)
        .json({ success: false, message: "Only draft invoices can be sent" });
    }

    invoice.status = "sent";
    invoice.sentDate = new Date();
    invoice.sentBy = req.user.id;

    await invoice.save();
    await invoice.populate("customerId", "name email phone");
    await invoice.populate("vehicleId", "year make model");

    res.json({ success: true, data: invoice });
  } catch (error) {
    console.error("Error sending invoice:", error);
    res.status(500).json({ success: false, message: "Failed to send invoice" });
  }
});

// Generate PDF for invoice
router.get("/:id/pdf", authenticateToken, async (req, res) => {
  try {
    console.log("Generating PDF for invoice:", req.params.id);
    const invoice = await Invoice.findById(req.params.id)
      .populate("customerId", "name email phone address")
      .populate("vehicleId", "year make model vin licensePlate");

    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }

    // Generate PDF content
    const PDFGenerator = require("../utils/pdfGenerator");
    const pdfGenerator = new PDFGenerator();
    const pdfBuffer = await pdfGenerator.generateInvoicePDF(invoice);

    // Set response headers for PDF download
    res.type("application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="invoice-${invoice.invoiceNumber}.pdf"`
    );

    // Let Express compute Content-Length
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ success: false, message: "Failed to generate PDF" });
  }
});

// Send invoice via email
router.post("/:id/send-email", authenticateToken, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("customerId", "name email phone")
      .populate("vehicleId", "year make model");

    if (!invoice) {
      return res
        .status(404)
        .json({ success: false, message: "Invoice not found" });
    }

    if (!invoice.customerId.email) {
      return res
        .status(400)
        .json({ success: false, message: "Customer email not available" });
    }

    // Generate PDF for attachment
    const PDFGenerator = require("../utils/pdfGenerator");
    const pdfGenerator = new PDFGenerator();
    const pdfBuffer = await pdfGenerator.generateInvoicePDF(invoice);

    // Send email with PDF attachment
    const emailService = require("../services/emailService");
    await emailService.sendInvoiceEmail({
      to: invoice.customerId.email,
      customerName: invoice.customerId.name,
      invoiceNumber: invoice.invoiceNumber,
      invoiceAmount: invoice.total,
      dueDate: invoice.dueDate,
      pdfBuffer,
      fileName: `invoice-${invoice.invoiceNumber}.pdf`,
    });

    // Update invoice status to sent if it's still draft
    if (invoice.status === "draft") {
      invoice.status = "sent";
      invoice.sentDate = new Date();
      invoice.sentBy = req.user.id;
      await invoice.save();
    }

    res.json({ success: true, message: "Invoice sent successfully" });
  } catch (error) {
    console.error("Error sending invoice email:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to send invoice email" });
  }
});

// Mark overdue invoices
router.post("/mark-overdue", authenticateToken, async (req, res) => {
  try {
    const today = new Date();

    // Find all sent invoices that are past due date
    const overdueInvoices = await Invoice.find({
      status: "sent",
      dueDate: { $lt: today },
    });

    // Update their status to overdue
    const updatePromises = overdueInvoices.map((invoice) => {
      invoice.status = "overdue";
      return invoice.save();
    });

    await Promise.all(updatePromises);

    // Fetch updated invoices
    const updatedInvoices = await Invoice.find()
      .populate("customerId", "name email phone")
      .populate("vehicleId", "year make model")
      .sort({ date: -1 });

    res.json({
      success: true,
      message: `${overdueInvoices.length} invoices marked as overdue`,
      data: updatedInvoices,
    });
  } catch (error) {
    console.error("Error marking overdue invoices:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to mark overdue invoices" });
  }
});

module.exports = router;
