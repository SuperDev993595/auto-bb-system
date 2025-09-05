const express = require("express");
const Joi = require("joi");
const mongoose = require("mongoose");
const {
  authenticateToken,
  requireCustomer,
  requireAdmin,
  requireAnyAdmin,
  requireRole,
} = require("../middleware/auth");
const User = require("../models/User");
const Customer = require("../models/Customer");
const Vehicle = require("../models/Vehicle");
const Appointment = require("../models/Appointment");
const { Service } = require("../models/Service");
const { Technician } = require("../models/Service");
const Invoice = require("../models/Invoice");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const Payment = require("../models/Payment");
const Arrangement = require("../models/Arrangement");
const Towing = require("../models/Towing");
const CallLog = require("../models/CallLog");
const notificationService = require("../services/notificationService");
const appointmentCommunicationService = require("../services/appointmentCommunicationService");

const router = express.Router();

// Validation schemas
const vehicleSchema = Joi.object({
  year: Joi.number()
    .integer()
    .min(1900)
    .max(new Date().getFullYear() + 1)
    .required(),
  make: Joi.string().min(1).max(50).required(),
  model: Joi.string().min(1).max(50).required(),
  vin: Joi.string().min(8).max(17).required(),
  licensePlate: Joi.string().min(1).max(20).required(),
  color: Joi.string().min(1).max(30).required(),
  mileage: Joi.number().integer().min(0).required(),
  fuelType: Joi.string()
    .valid("gasoline", "diesel", "hybrid", "electric", "other")
    .default("gasoline"),
  transmission: Joi.string()
    .valid("automatic", "manual", "cvt", "other")
    .default("automatic"),
  status: Joi.string()
    .valid("active", "inactive", "maintenance")
    .default("active"),
});

const appointmentSchema = Joi.object({
  date: Joi.string().required(),
  time: Joi.string()
    .pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .required(),
  serviceType: Joi.string().min(1).max(100).required(),
  vehicleId: Joi.string().required(),
  notes: Joi.string().max(500).allow("").optional(),
  status: Joi.string()
    .valid(
      "scheduled",
      "confirmed",
      "in-progress",
      "completed",
      "cancelled",
      "no-show"
    )
    .default("scheduled"),
  estimatedDuration: Joi.alternatives()
    .try(Joi.string(), Joi.number())
    .optional(),
  priority: Joi.string().valid("low", "medium", "high", "urgent").optional(),
  technicianId: Joi.string().optional(),
  // NEW: Booking & Communication Workflow Fields
  customerConcerns: Joi.string().max(1000).allow("").optional(),
  preferredContact: Joi.string().valid("email", "sms", "both").default("email"),
});

const messageSchema = Joi.object({
  subject: Joi.string().min(1).max(200).required(),
  message: Joi.string().min(1).max(2000).required(),
  type: Joi.string()
    .valid("appointment", "reminder", "general", "service", "support")
    .default("general"),
  priority: Joi.string()
    .valid("low", "medium", "high", "urgent")
    .default("medium"),
  relatedAppointment: Joi.string().optional(),
  relatedVehicle: Joi.string().optional(),
});

const profileUpdateSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().min(1).max(20).optional(),
  businessName: Joi.string().max(100).optional(),
  address: Joi.object({
    street: Joi.string().max(200).allow("").optional(),
    city: Joi.string().max(100).allow("").optional(),
    state: Joi.string().max(50).allow("").optional(),
    zipCode: Joi.string().max(20).allow("").optional(),
  }).optional(),
  preferences: Joi.object({
    notifications: Joi.object({
      email: Joi.boolean(),
      sms: Joi.boolean(),
      push: Joi.boolean(),
    }),
    reminders: Joi.object({
      appointments: Joi.boolean(),
      maintenance: Joi.boolean(),
      payments: Joi.boolean(),
    }),
    privacy: Joi.object({
      shareData: Joi.boolean(),
      marketing: Joi.boolean(),
    }),
  }).optional(),
});

const customerCreateSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(1).max(20).required(),
  businessName: Joi.string().max(100).optional(),
  address: Joi.object({
    street: Joi.string().max(200).allow("").optional(),
    city: Joi.string().max(100).allow("").optional(),
    state: Joi.string().max(50).allow("").optional(),
    zipCode: Joi.string().max(20).allow("").optional(),
  }).optional(),
  status: Joi.string()
    .valid("active", "inactive", "prospect")
    .default("active"),
  notes: Joi.string().max(1000).allow("").optional(),
});

const paymentSchema = Joi.object({
  amount: Joi.number().positive().required(),
  date: Joi.date().max("now").optional(),
  method: Joi.string()
    .valid("cash", "card", "check", "bank_transfer", "online", "other")
    .required(),
  reference: Joi.string().max(100).allow("").optional(),
  notes: Joi.string().max(500).allow("").optional(),
  status: Joi.string()
    .valid("pending", "completed", "failed", "refunded")
    .default("completed"),
  invoice: Joi.string().optional(),
  appointment: Joi.string().optional(),
});

const arrangementSchema = Joi.object({
  date: Joi.date().max("now").optional(),
  amount: Joi.number().positive().required(),
  notes: Joi.string().max(500).allow("").optional(),
  status: Joi.string()
    .valid("pending", "active", "completed", "cancelled")
    .default("pending"),
  type: Joi.string()
    .valid("installment", "payment_plan", "deferred", "other")
    .default("installment"),
  dueDate: Joi.date().required(),
});

const towingSchema = Joi.object({
  date: Joi.date().max("now").optional(),
  location: Joi.string().max(200).required(),
  destination: Joi.string().max(200).allow("").optional(),
  status: Joi.string()
    .valid("scheduled", "in_progress", "completed", "cancelled")
    .default("scheduled"),
  notes: Joi.string().max(500).allow("").optional(),
  cost: Joi.number().min(0).default(0),
  vehicle: Joi.string().max(100).allow("").optional(),
});

const callLogSchema = Joi.object({
  date: Joi.date().max("now").optional(),
  type: Joi.string()
    .valid("inbound", "outbound", "missed", "voicemail")
    .required(),
  duration: Joi.number().min(0).default(0),
  notes: Joi.string().max(1000).allow("").optional(),
  summary: Joi.string().max(200).allow("").optional(),
  followUpDate: Joi.date().optional(),
  followUpRequired: Joi.boolean().default(false),
  phoneNumber: Joi.string().max(20).allow("").optional(),
});

// Get customers (admin access) - allows admins to search customers, or users to find their own customer record
router.get("/", requireAnyAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      email,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query
    const query = {};

    // Check user role and apply appropriate restrictions
    const isAdmin =
      req.user.role === "admin" || req.user.role === "super_admin";

    if (email) {
      query.email = { $regex: email, $options: "i" };
    }

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { businessName: { $regex: search, $options: "i" } },
        { "address.street": { $regex: search, $options: "i" } },
        { "address.city": { $regex: search, $options: "i" } },
        { "address.state": { $regex: search, $options: "i" } },
        { "address.zipCode": { $regex: search, $options: "i" } },
      ];
    }

    // If not admin, only allow access to their own customer record
    if (!isAdmin) {
      // Find the customer record for this user
      const userCustomer = await Customer.findOne({ userId: req.user.id });
      if (!userCustomer) {
        return res.status(404).json({
          success: false,
          message: "Customer record not found for this user",
        });
      }

      // Only allow access to their own customer record
      query._id = userCustomer._id;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query with pagination
    const customers = await Customer.find(query)
      .populate("userId", "name email phone businessName")
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    // Get vehicles for each customer
    const customersWithVehicles = await Promise.all(
      customers.map(async (customer) => {
        const vehicles = await Vehicle.find({ customer: customer._id });
        return {
          ...customer.toObject(),
          vehicles: vehicles,
        };
      })
    );

    // Transform customers to match frontend expectations
    const transformedCustomers = customersWithVehicles.map((customer) => ({
      _id: customer._id,
      id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      businessName: customer.businessName,
      address: customer.address,
      status: customer.status,
      vehicles: customer.vehicles || [],
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    }));

    // Get total count
    const total = await Customer.countDocuments(query);

    res.json({
      success: true,
      data: {
        customers: transformedCustomers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalCustomers: total,
          hasNextPage: page * limit < total,
          hasPrevPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Create new customer (admin only)
router.post("/", authenticateToken, requireAnyAdmin, async (req, res) => {
  try {
    // Validate request body
    const { error, value } = customerCreateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    // Check if customer with this email already exists
    const existingCustomer = await Customer.findOne({ email: value.email });
    if (existingCustomer) {
      return res.status(400).json({
        success: false,
        message: "A customer with this email address already exists",
      });
    }

    // Create new customer
    const customer = new Customer({
      name: value.name,
      email: value.email,
      phone: value.phone,
      businessName: value.businessName || "",
      address: value.address || {
        street: "",
        city: "",
        state: "",
        zipCode: "",
      },
      status: value.status,
      notes: value.notes || "",
      createdBy: req.user.id,
      assignedTo: req.user.id,
    });

    await customer.save();

    // Transform customer for response
    const transformedCustomer = {
      _id: customer._id,
      id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      businessName: customer.businessName,
      address: customer.address,
      status: customer.status,
      vehicles: [],
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: { customer: transformedCustomer },
    });
  } catch (error) {
    console.error("Error creating customer:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Update customer (admin only)
router.put("/:id", authenticateToken, requireAnyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate customer ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid customer ID format" });
    }

    // Find customer
    const customer = await Customer.findById(id);
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    // Validate request body (using same schema as create, but all fields optional)
    const customerUpdateSchema = Joi.object({
      name: Joi.string().min(2).max(100).optional(),
      email: Joi.string().email().optional(),
      phone: Joi.string().min(1).max(20).optional(),
      businessName: Joi.string().max(100).optional(),
      address: Joi.object({
        street: Joi.string().max(200).optional(),
        city: Joi.string().max(100).optional(),
        state: Joi.string().max(50).optional(),
        zipCode: Joi.string().max(20).optional(),
      }).optional(),
      status: Joi.string().valid("active", "inactive", "prospect").optional(),
      notes: Joi.string().max(1000).optional(),
    });

    const { error, value } = customerUpdateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    // Check if email is being updated and if it already exists
    if (value.email && value.email !== customer.email) {
      const existingCustomer = await Customer.findOne({ email: value.email });
      if (existingCustomer) {
        return res.status(400).json({
          success: false,
          message: "A customer with this email address already exists",
        });
      }
    }

    // Update customer
    const updatedCustomer = await Customer.findByIdAndUpdate(
      id,
      { ...value, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    // Get vehicles for this customer
    const vehicles = await Vehicle.find({ customer: updatedCustomer._id });

    // Transform customer for response
    const transformedCustomer = {
      _id: updatedCustomer._id,
      id: updatedCustomer._id,
      name: updatedCustomer.name,
      email: updatedCustomer.email,
      phone: updatedCustomer.phone,
      businessName: updatedCustomer.businessName,
      address: updatedCustomer.address,
      status: updatedCustomer.status,
      notes: updatedCustomer.notes,
      vehicles: vehicles || [],
      createdAt: updatedCustomer.createdAt,
      updatedAt: updatedCustomer.updatedAt,
    };

    res.json({
      success: true,
      message: "Customer updated successfully",
      data: { customer: transformedCustomer },
    });
  } catch (error) {
    console.error("Error updating customer:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Delete customer (admin only)
router.delete("/:id", authenticateToken, requireAnyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate customer ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid customer ID format" });
    }

    // Find customer
    const customer = await Customer.findById(id);
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    // Import SalesRecord model for cleanup
    const SalesRecord = require("../models/SalesRecord");

    // Delete related sales records
    const salesRecordsDeleted = await SalesRecord.deleteMany({ customer: id });
    console.log(
      `Deleted ${salesRecordsDeleted.deletedCount} sales records for customer ${id}`
    );

    // Delete customer
    await Customer.findByIdAndDelete(id);

    res.json({
      success: true,
      message: `Customer deleted successfully. Also deleted ${salesRecordsDeleted.deletedCount} related sales records.`,
    });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Get customer profile
router.get("/profile", authenticateToken, requireCustomer, async (req, res) => {
  try {
    // First try to find customer record
    let customer = await Customer.findOne({ userId: req.user.id });

    if (!customer) {
      // If no customer record exists, create one from user data
      const user = await User.findById(req.user.id).select("-password");
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      customer = new Customer({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        businessName: user.businessName || "",
        userId: user._id,
        status: "active",
      });
      await customer.save();
    }

    res.json({
      success: true,
      data: {
        user: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          businessName: customer.businessName,
        },
        profile: {
          id: customer._id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone || "",
          businessName: customer.businessName || "",
          address: customer.address || {
            street: "",
            city: "",
            state: "",
            zipCode: "",
          },
          preferences: customer.preferences || {
            notifications: { email: true, sms: true, push: false },
            reminders: {
              appointments: true,
              maintenance: true,
              payments: true,
            },
            privacy: { shareData: false, marketing: false },
          },
          createdAt: customer.createdAt,
          lastLogin: customer.lastContact || customer.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching customer profile:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Update customer profile
router.put("/profile", authenticateToken, requireCustomer, async (req, res) => {
  try {
    console.log("Received profile update request:", req.body);

    // Validate the request body
    const { error, value } = profileUpdateSchema.validate(req.body);
    if (error) {
      console.log("Validation error:", error.details[0].message);
      return res
        .status(400)
        .json({ success: false, message: error.details[0].message });
    }

    const { name, email, phone, businessName, address, preferences } = value;

    // Find or create customer record
    let customer = await Customer.findOne({ userId: req.user.id });

    if (!customer) {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      customer = new Customer({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        businessName: user.businessName || "",
        userId: user._id,
        status: "active",
      });
    }

    // Update fields
    if (name) customer.name = name;
    if (email) customer.email = email;
    if (phone) customer.phone = phone;
    if (businessName !== undefined) customer.businessName = businessName;
    if (address) customer.address = address;
    if (preferences) customer.preferences = preferences;

    console.log("Update data to save:", {
      name,
      email,
      phone,
      businessName,
      address,
      preferences,
    });

    await customer.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: { user: customer },
    });
  } catch (error) {
    console.error("Error updating customer profile:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Get customer vehicles
router.get(
  "/vehicles",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      const customer = await Customer.findOne({ userId: req.user.id });
      if (!customer) {
        return res.json({
          success: true,
          data: { vehicles: [] },
        });
      }

      // Get vehicles from the separate Vehicle collection
      const vehicles = await Vehicle.find({ customer: customer._id }).sort({
        createdAt: -1,
      });

      // Transform vehicles to match frontend expectations
      const transformedVehicles = vehicles.map((vehicle) => ({
        _id: vehicle._id,
        id: vehicle._id, // Add id field for frontend compatibility
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        vin: vehicle.vin,
        licensePlate: vehicle.licensePlate,
        color: vehicle.color,
        mileage: vehicle.mileage,
        status: vehicle.status,
        fuelType: vehicle.fuelType,
        transmission: vehicle.transmission,
        lastServiceDate: vehicle.lastServiceDate,
        nextServiceDate: vehicle.nextServiceDate,
        createdAt: vehicle.createdAt,
        updatedAt: vehicle.updatedAt,
      }));

      res.json({
        success: true,
        data: { vehicles: transformedVehicles },
      });
    } catch (error) {
      console.error("Error fetching customer vehicles:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Get all vehicles (for admins)
router.get(
  "/vehicles/all",
  authenticateToken,
  requireAnyAdmin,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 50,
        customer,
        search,
        status,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = req.query;

      // Build query
      const query = {};

      if (customer) query.customer = customer;
      if (status) query.status = status;

      if (search) {
        query.$or = [
          { make: { $regex: search, $options: "i" } },
          { model: { $regex: search, $options: "i" } },
          { vin: { $regex: search, $options: "i" } },
          { licensePlate: { $regex: search, $options: "i" } },
        ];
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;

      // Execute query with pagination
      const vehicles = await Vehicle.find(query)
        .populate("customer", "name email businessName")
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      // Transform vehicles to match frontend expectations
      const transformedVehicles = vehicles.map((vehicle) => ({
        _id: vehicle._id,
        id: vehicle._id, // Add id field for frontend compatibility
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        vin: vehicle.vin,
        licensePlate: vehicle.licensePlate,
        color: vehicle.color,
        mileage: vehicle.mileage,
        status: vehicle.status,
        fuelType: vehicle.fuelType,
        transmission: vehicle.transmission,
        lastServiceDate: vehicle.lastServiceDate,
        nextServiceDate: vehicle.nextServiceDate,
        createdAt: vehicle.createdAt,
        updatedAt: vehicle.updatedAt,
        customer: vehicle.customer,
      }));

      // Get total count
      const total = await Vehicle.countDocuments(query);

      res.json({
        success: true,
        data: {
          vehicles: transformedVehicles,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalVehicles: total,
            hasNextPage: page * limit < total,
            hasPrevPage: page > 1,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching all vehicles:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Get vehicles by customer ID (for admins)
router.get(
  "/:customerId/vehicles",
  authenticateToken,
  requireAnyAdmin,
  async (req, res) => {
    try {
      const { customerId } = req.params;

      // Validate customer ID
      if (!customerId || !mongoose.Types.ObjectId.isValid(customerId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid customer ID",
        });
      }

      // Check if customer exists
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      // Get vehicles for this customer
      const vehicles = await Vehicle.find({ customer: customerId }).sort({
        createdAt: -1,
      });

      // Transform vehicles to match frontend expectations
      const transformedVehicles = vehicles.map((vehicle) => ({
        _id: vehicle._id,
        id: vehicle._id, // Add id field for frontend compatibility
        year: vehicle.year,
        make: vehicle.make,
        model: vehicle.model,
        vin: vehicle.vin,
        licensePlate: vehicle.licensePlate,
        color: vehicle.color,
        mileage: vehicle.mileage,
        status: vehicle.status,
        fuelType: vehicle.fuelType,
        transmission: vehicle.transmission,
        lastServiceDate: vehicle.lastServiceDate,
        nextServiceDate: vehicle.nextServiceDate,
        createdAt: vehicle.createdAt,
        updatedAt: vehicle.updatedAt,
      }));

      res.json({
        success: true,
        data: { vehicles: transformedVehicles },
      });
    } catch (error) {
      console.error("Error fetching customer vehicles:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Add new vehicle (for customers to add their own vehicles)
router.post(
  "/vehicles",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      const { error, value } = vehicleSchema.validate(req.body);
      if (error) {
        return res
          .status(400)
          .json({ success: false, message: error.details[0].message });
      }

      // Find or create customer record
      let customer = await Customer.findOne({ userId: req.user.id });

      if (!customer) {
        const user = await User.findById(req.user.id);
        if (!user) {
          return res
            .status(404)
            .json({ success: false, message: "User not found" });
        }

        customer = new Customer({
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          businessName: user.businessName || "",
          userId: user._id,
          status: "active",
        });
        await customer.save();
      }

      // Check for duplicate VIN within customer's vehicles
      const existingVehicle = await Vehicle.findOne({
        customer: customer._id,
        vin: value.vin,
      });
      if (existingVehicle) {
        return res.status(409).json({
          success: false,
          message: "A vehicle with this VIN already exists",
        });
      }

      // Create new vehicle in separate collection
      const newVehicle = new Vehicle({
        ...value,
        customer: customer._id,
        createdBy: req.user.id,
      });
      await newVehicle.save();

      res.status(201).json({
        success: true,
        message: "Vehicle added successfully",
        data: { vehicle: newVehicle },
      });
    } catch (error) {
      console.error("Error adding vehicle:", error);
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "A vehicle with this VIN already exists",
        });
      }
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Update vehicle
router.put(
  "/vehicles/:id",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      const { error, value } = vehicleSchema.validate(req.body);
      if (error) {
        return res
          .status(400)
          .json({ success: false, message: error.details[0].message });
      }

      const customer = await Customer.findOne({ userId: req.user.id });
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      // Find vehicle in separate collection
      const vehicle = await Vehicle.findOne({
        _id: req.params.id,
        customer: customer._id,
      });
      if (!vehicle) {
        return res
          .status(404)
          .json({ success: false, message: "Vehicle not found" });
      }

      // Check for duplicate VIN (excluding current vehicle)
      const existingVehicle = await Vehicle.findOne({
        customer: customer._id,
        vin: value.vin,
        _id: { $ne: req.params.id },
      });
      if (existingVehicle) {
        return res.status(409).json({
          success: false,
          message: "A vehicle with this VIN already exists",
        });
      }

      // Update vehicle
      Object.assign(vehicle, value);
      await vehicle.save();

      res.json({
        success: true,
        message: "Vehicle updated successfully",
        data: { vehicle },
      });
    } catch (error) {
      console.error("Error updating vehicle:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Delete vehicle
router.delete(
  "/vehicles/:id",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      const customer = await Customer.findOne({ userId: req.user.id });
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      // Find and delete vehicle from separate collection
      const vehicle = await Vehicle.findOneAndDelete({
        _id: req.params.id,
        customer: customer._id,
      });
      if (!vehicle) {
        return res
          .status(404)
          .json({ success: false, message: "Vehicle not found" });
      }

      res.json({
        success: true,
        message: "Vehicle deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Get customer appointments
router.get(
  "/appointments",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      // Find customer record first
      const customer = await Customer.findOne({ userId: req.user.id });
      if (!customer) {
        return res.json({
          success: true,
          data: { appointments: [] },
        });
      }

      const appointments = await Appointment.find({ customer: customer._id })
        .populate("vehicle", "year make model vin licensePlate mileage")
        .populate("serviceType", "name category laborRate estimatedDuration")
        .sort({ scheduledDate: -1, scheduledTime: -1 });

      // Transform appointments to match frontend expectations
      const transformedAppointments = appointments.map((appointment) => ({
        id: appointment._id,
        date: appointment.scheduledDate.toISOString().split("T")[0],
        time: appointment.scheduledTime,
        serviceType: appointment.serviceType._id,
        vehicleId: appointment.vehicle?._id || "", // Use vehicle ID as identifier
        vehicleInfo: appointment.vehicle
          ? `${appointment.vehicle.year} ${appointment.vehicle.make} ${appointment.vehicle.model}`
          : "Unknown Vehicle",
        status: appointment.status,
        estimatedDuration: appointment.estimatedDuration,
        notes: appointment.notes,
        technician: appointment.technician,
        priority: appointment.priority,
        totalCost: appointment.estimatedCost?.total || 0,
        createdAt: appointment.createdAt,
        updatedAt: appointment.updatedAt,
      }));

      res.json({
        success: true,
        data: { appointments: transformedAppointments },
      });
    } catch (error) {
      console.error("Error fetching customer appointments:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Create new appointment
router.post(
  "/appointments",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      const { error, value } = appointmentSchema.validate(req.body);
      if (error) {
        return res
          .status(400)
          .json({ success: false, message: error.details[0].message });
      }

      // Find customer and verify vehicle belongs to customer
      const customer = await Customer.findOne({ userId: req.user.id });
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      const vehicle = await Vehicle.findOne({
        _id: value.vehicleId,
        customer: customer._id,
      });
      if (!vehicle) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid vehicle" });
      }

      // Create appointment with vehicle reference
      const appointment = new Appointment({
        customer: customer._id, // Use customer ID from customers table
        vehicle: vehicle._id, // Reference to the vehicle document
        serviceType: value.serviceType, // Use the service catalog ObjectId
        scheduledDate: new Date(value.date),
        scheduledTime: value.time,
        estimatedDuration: value.estimatedDuration
          ? parseInt(value.estimatedDuration)
          : 60, // Use provided duration or default 1 hour
        status: value.status || "scheduled",
        createdBy: req.user.id,
        assignedTo: req.user.id, // For now, assign to the customer (will be updated by admin)
        notes: value.notes,
        priority: value.priority || "medium",
        technician: value.technicianId
          ? mongoose.Types.ObjectId.isValid(value.technicianId)
            ? new mongoose.Types.ObjectId(value.technicianId)
            : value.technicianId
          : undefined,
        // NEW: Booking & Communication Workflow Fields
        bookingSource: "customer_portal",
        customerConcerns: value.customerConcerns,
        preferredContact: value.preferredContact || "email",
        reminderSettings: {
          send24hReminder: true,
          send2hReminder: true,
          sendSameDayReminder: true,
          preferredChannel: "both",
        },
      });

      await appointment.save();

      // Send immediate confirmation
      try {
        await appointmentCommunicationService.sendAppointmentConfirmation(
          appointment._id,
          req.user.id
        );
        console.log("Customer appointment confirmation sent successfully");
      } catch (error) {
        console.error(
          "Failed to send customer appointment confirmation:",
          error
        );
        // Don't fail the appointment creation if confirmation fails
      }

      res.status(201).json({
        success: true,
        message: "Appointment scheduled successfully",
        data: { appointment },
      });
    } catch (error) {
      console.error("Error creating appointment:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Update appointment
router.put(
  "/appointments/:id",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      console.log("UPDATE: Received request body:", req.body);
      const { error, value } = appointmentSchema.validate(req.body);
      if (error) {
        console.log("UPDATE: Validation error:", error.details[0].message);
        return res
          .status(400)
          .json({ success: false, message: error.details[0].message });
      }
      console.log("UPDATE: Validated data:", value);

      // Find customer and verify vehicle belongs to customer
      const customer = await Customer.findOne({ userId: req.user.id });
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      const vehicle = await Vehicle.findOne({
        _id: value.vehicleId,
        customer: customer._id,
      });
      if (!vehicle) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid vehicle" });
      }

      console.log("UPDATE: appointment", value);

      const updateData = {
        vehicle: vehicle._id, // Reference to the vehicle document
        serviceType: value.serviceType, // Use the service catalog ObjectId
        scheduledDate: new Date(value.date),
        scheduledTime: value.time,
        notes: value.notes,
        status: value.status || "scheduled",
        estimatedDuration: value.estimatedDuration
          ? parseInt(value.estimatedDuration)
          : 60,
        priority: value.priority || "medium",
        technician: value.technicianId
          ? mongoose.Types.ObjectId.isValid(value.technicianId)
            ? new mongoose.Types.ObjectId(value.technicianId)
            : value.technicianId
          : undefined,
      };

      console.log("UPDATE: updateData", updateData);

      const appointment = await Appointment.findOneAndUpdate(
        { _id: req.params.id, customer: customer._id },
        updateData,
        { new: true, runValidators: true }
      );

      if (!appointment) {
        return res
          .status(404)
          .json({ success: false, message: "Appointment not found" });
      }

      console.log(
        "UPDATE: Appointment updated successfully with ID:",
        appointment._id
      );
      console.log(
        "UPDATE: Updated serviceType field:",
        appointment.serviceType
      );

      res.json({
        success: true,
        message: "Appointment updated successfully",
        data: { appointment },
      });
    } catch (error) {
      console.error("Error updating appointment:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Confirm appointment
router.put(
  "/appointments/:id/confirm",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      // Find customer record first
      const customer = await Customer.findOne({ userId: req.user.id });
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      const appointment = await Appointment.findOneAndUpdate(
        { _id: req.params.id, customer: customer._id, status: "scheduled" },
        {
          status: "confirmed",
          confirmedAt: new Date(),
          confirmedBy: req.user.id,
        },
        { new: true }
      );

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: "Appointment not found or already confirmed",
        });
      }

      res.json({
        success: true,
        message: "Appointment confirmed successfully",
        data: { appointment },
      });
    } catch (error) {
      console.error("Error confirming appointment:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Cancel appointment
router.delete(
  "/appointments/:id",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      // Find customer record first
      const customer = await Customer.findOne({ userId: req.user.id });
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      const appointment = await Appointment.findOneAndUpdate(
        { _id: req.params.id, customer: customer._id },
        { status: "cancelled" },
        { new: true }
      );

      if (!appointment) {
        return res
          .status(404)
          .json({ success: false, message: "Appointment not found" });
      }

      res.json({
        success: true,
        message: "Appointment cancelled successfully",
        data: { appointment },
      });
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Get customer service history
router.get(
  "/services",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      const customer = await Customer.findOne({ userId: req.user.id });
      console.log(
        "Customer lookup for userId:",
        req.user.id,
        "Found:",
        customer ? customer._id : "Not found"
      );

      if (!customer) {
        return res.json({
          success: true,
          data: { services: [] },
        });
      }

      // Get service history from Service model
      const { Service } = require("../models/Service");
      const services = await Service.find({ customerId: customer._id })
        .populate("vehicleId", "year make model vin licensePlate")
        .populate("appointmentId", "scheduledDate serviceType status")
        .sort({ date: -1 }); // Most recent first

      // Transform services to match frontend expectations
      const transformedServices = await Promise.all(
        services.map(async (service) => {
          // Try to get technician information from appointment
          let technicianName = service.technician || "Not specified";

          if (service.appointmentId) {
            try {
              const appointment = await Appointment.findById(
                service.appointmentId
              ).populate("technician", "name");
              if (appointment && appointment.technician) {
                technicianName = appointment.technician.name;
                console.log(
                  `Found technician from appointment for service ${service._id}: ${technicianName}`
                );
              }
            } catch (error) {
              console.error(
                `Error fetching technician for appointment ${service.appointmentId}:`,
                error
              );
            }
          }

          return {
            _id: service._id,
            date: service.date,
            serviceType: service.serviceType,
            description: service.description,
            cost: service.cost,
            mileage: service.mileage,
            vehicle: service.vehicleId
              ? {
                  make: service.vehicleId.make,
                  model: service.vehicleId.model,
                  year: service.vehicleId.year,
                  vin: service.vehicleId.vin,
                }
              : null,
            technician: technicianName,
            status: service.status,
            notes: service.notes,
            createdAt: service.createdAt,
          };
        })
      );

      res.json({
        success: true,
        data: {
          services: transformedServices,
          total: transformedServices.length,
        },
      });
    } catch (error) {
      console.error("Error fetching customer services:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Get customer invoices
router.get(
  "/invoices",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      // First find the customer record using the user ID
      const customer = await Customer.findOne({ userId: req.user.id });
      if (!customer) {
        return res.json({
          success: true,
          data: { invoices: [] },
        });
      }

      // Now use the customer ID to find invoices
      const invoices = await Invoice.find({ customerId: customer._id })
        .populate("appointmentId", "date serviceType")
        .sort({ date: -1 });

      res.json({
        success: true,
        data: { invoices },
      });
    } catch (error) {
      console.error("Error fetching customer invoices:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Create Stripe payment intent for invoice
router.post(
  "/invoices/:id/payment-intent",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      const { amount, currency, paymentReference } = req.body;

      // First find the customer using the user ID
      const customer = await Customer.findOne({ userId: req.user.id });
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      const invoice = await Invoice.findOne({
        _id: req.params.id,
        customerId: customer._id,
      });

      if (!invoice) {
        return res
          .status(404)
          .json({ success: false, message: "Invoice not found" });
      }

      if (invoice.status === "paid") {
        return res
          .status(400)
          .json({ success: false, message: "Invoice is already paid" });
      }

      // Import Stripe configuration
      const stripe = require("../config/stripe");

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency || "usd",
        metadata: {
          invoiceId: req.params.id,
          customerId: customer._id.toString(),
          paymentReference: paymentReference || "",
        },
        description: `Payment for invoice ${invoice.invoiceNumber}`,
      });

      res.json({
        success: true,
        message: "Payment intent created successfully",
        data: {
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        },
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);

      // Check if it's a Stripe error
      if (error.type && error.type.startsWith("stripe")) {
        return res.status(400).json({
          success: false,
          message: `Payment error: ${error.message}`,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to create payment intent",
      });
    }
  }
);

// Process payment for invoice (legacy method)
router.post(
  "/invoices/:id/pay",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      const { paymentMethod, paymentReference } = req.body;

      // First find the customer using the user ID
      const customer = await Customer.findOne({ userId: req.user.id });
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      const invoice = await Invoice.findOne({
        _id: req.params.id,
        customerId: customer._id,
      });

      if (!invoice) {
        return res
          .status(404)
          .json({ success: false, message: "Invoice not found" });
      }

      if (invoice.status === "paid") {
        return res
          .status(400)
          .json({ success: false, message: "Invoice is already paid" });
      }

      // Update invoice with payment information
      invoice.status = "paid";
      invoice.paymentDate = new Date();
      invoice.paymentMethod = paymentMethod || "online";
      invoice.paymentReference = paymentReference || `PAY-${Date.now()}`;

      await invoice.save();

      // Create service history record after successful payment
      try {
        console.log(
          `Starting service history creation for invoice ${invoice.invoiceNumber} (legacy payment)`
        );
        console.log(`Invoice data:`, {
          id: invoice._id,
          customerId: invoice.customerId,
          vehicleId: invoice.vehicleId,
          total: invoice.total,
          itemsCount: invoice.items ? invoice.items.length : 0,
          serviceType: invoice.serviceType,
        });

        // Get vehicle information
        const vehicle = await Vehicle.findById(invoice.vehicleId);
        console.log(
          `Vehicle found:`,
          vehicle
            ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
            : "No vehicle found"
        );

        // Try to get technician information from appointment or work order
        let technicianName = "Not specified";

        if (invoice.appointmentId) {
          // Try to get technician from appointment
          const appointment = await Appointment.findById(
            invoice.appointmentId
          ).populate("technician", "name");
          if (appointment && appointment.technician) {
            technicianName = appointment.technician.name;
            console.log(`Found technician from appointment: ${technicianName}`);
          }
        } else if (invoice.workOrderId) {
          // Try to get technician from work order
          const { WorkOrder } = require("../models/Service");
          const workOrder = await WorkOrder.findById(
            invoice.workOrderId
          ).populate("technician", "name");
          if (workOrder && workOrder.technician) {
            technicianName = workOrder.technician.name;
            console.log(`Found technician from work order: ${technicianName}`);
          }
        }

        // Prepare service record data
        const serviceData = {
          customerId: customer._id, // Use the customer ID for customerId
          vehicleId: invoice.vehicleId,
          appointmentId: invoice.appointmentId || null,
          date: invoice.date,
          serviceType: invoice.serviceType || "Automotive Repair",
          description:
            invoice.items && invoice.items.length > 0
              ? invoice.items.map((item) => item.description).join(", ")
              : "Service completed",
          technician: technicianName, // Use actual technician name or fallback
          mileage: vehicle ? vehicle.mileage || 0 : 0,
          cost: invoice.total,
          parts: invoice.items
            ? invoice.items.map((item) => ({
                name: item.description,
                partNumber: item.partNumber || "",
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.total,
              }))
            : [],
          laborHours: 0, // Default value
          laborRate: 0, // Default value
          laborCost: 0, // Default value
          subtotal: invoice.subtotal,
          tax: invoice.tax,
          discount: invoice.discount || 0,
          total: invoice.total,
          status: "completed",
          notes: `Service completed and paid via invoice ${
            invoice.invoiceNumber
          }. Payment method: ${paymentMethod || "online"}`,
          customerNotes: "Payment processed successfully",
        };

        console.log(`Service data prepared:`, {
          customerId: serviceData.customerId,
          vehicleId: serviceData.vehicleId,
          serviceType: serviceData.serviceType,
          total: serviceData.total,
          partsCount: serviceData.parts.length,
        });

        // Create service history record
        const serviceRecord = new Service(serviceData);
        await serviceRecord.save();

        console.log(
          `✅ Service history record created successfully for invoice ${invoice.invoiceNumber} with ID: ${serviceRecord._id}`
        );
      } catch (serviceError) {
        console.error(
          "❌ Error creating service history record:",
          serviceError
        );
        console.error("Service error details:", {
          message: serviceError.message,
          stack: serviceError.stack,
          name: serviceError.name,
        });
        // Don't fail the payment if service history creation fails
      }

      res.json({
        success: true,
        message: "Payment processed successfully",
        data: { invoice },
      });
    } catch (error) {
      console.error("Error processing payment:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Confirm Stripe payment and update invoice status
router.post(
  "/invoices/:id/confirm-payment",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      const { paymentIntentId, paymentReference } = req.body;

      // First find the customer using the user ID
      const customer = await Customer.findOne({ userId: req.user.id });
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      const invoice = await Invoice.findOne({
        _id: req.params.id,
        customerId: customer._id,
      });

      if (!invoice) {
        return res
          .status(404)
          .json({ success: false, message: "Invoice not found" });
      }

      if (invoice.status === "paid") {
        return res
          .status(400)
          .json({ success: false, message: "Invoice is already paid" });
      }

      // Import Stripe configuration
      const stripe = require("../config/stripe");

      // Verify the payment intent
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );

      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({
          success: false,
          message: `Payment not completed. Status: ${paymentIntent.status}`,
        });
      }

      // Update invoice with payment information
      invoice.status = "paid";
      invoice.paymentDate = new Date();
      invoice.paymentMethod = "stripe";
      invoice.paymentReference = paymentReference || paymentIntentId;

      await invoice.save();

      // Create service history record after successful payment
      try {
        console.log(
          `Starting service history creation for invoice ${invoice.invoiceNumber}`
        );
        console.log(`Invoice data:`, {
          id: invoice._id,
          customerId: invoice.customerId,
          vehicleId: invoice.vehicleId,
          total: invoice.total,
          itemsCount: invoice.items ? invoice.items.length : 0,
          serviceType: invoice.serviceType,
        });

        // Get vehicle information
        const vehicle = await Vehicle.findById(invoice.vehicleId);
        console.log(
          `Vehicle found:`,
          vehicle
            ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
            : "No vehicle found"
        );

        // Try to get technician information from appointment or work order
        let technicianName = "Not specified";

        if (invoice.appointmentId) {
          // Try to get technician from appointment
          const appointment = await Appointment.findById(
            invoice.appointmentId
          ).populate("technician", "name");
          if (appointment && appointment.technician) {
            technicianName = appointment.technician.name;
            console.log(`Found technician from appointment: ${technicianName}`);
          }
        } else if (invoice.workOrderId) {
          // Try to get technician from work order
          const { WorkOrder } = require("../models/Service");
          const workOrder = await WorkOrder.findById(
            invoice.workOrderId
          ).populate("technician", "name");
          if (workOrder && workOrder.technician) {
            technicianName = workOrder.technician.name;
            console.log(`Found technician from work order: ${technicianName}`);
          }
        }

        // Prepare service record data
        const serviceData = {
          customerId: customer._id, // Use the customer ID for customerId
          vehicleId: invoice.vehicleId,
          appointmentId: invoice.appointmentId || null,
          date: invoice.date,
          serviceType: invoice.serviceType || "Automotive Repair",
          description:
            invoice.items && invoice.items.length > 0
              ? invoice.items.map((item) => item.description).join(", ")
              : "Service completed",
          technician: technicianName, // Use actual technician name or fallback
          mileage: vehicle ? vehicle.mileage || 0 : 0,
          cost: invoice.total,
          parts: invoice.items
            ? invoice.items.map((item) => ({
                name: item.description,
                partNumber: item.partNumber || "",
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                totalPrice: item.total,
              }))
            : [],
          laborHours: 0, // Default value
          laborRate: 0, // Default value
          laborCost: 0, // Default value
          subtotal: invoice.subtotal,
          tax: invoice.tax,
          discount: invoice.discount || 0,
          total: invoice.total,
          status: "completed",
          notes: `Service completed and paid via invoice ${invoice.invoiceNumber}. Payment method: Stripe`,
          customerNotes: "Payment processed successfully",
        };

        console.log(`Service data prepared:`, {
          customerId: serviceData.customerId,
          vehicleId: serviceData.vehicleId,
          serviceType: serviceData.serviceType,
          total: serviceData.total,
          partsCount: serviceData.parts.length,
        });

        // Create service history record
        const serviceRecord = new Service(serviceData);
        await serviceRecord.save();

        console.log(
          `✅ Service history record created successfully for invoice ${invoice.invoiceNumber} with ID: ${serviceRecord._id}`
        );
      } catch (serviceError) {
        console.error(
          "❌ Error creating service history record:",
          serviceError
        );
        console.error("Service error details:", {
          message: serviceError.message,
          stack: serviceError.stack,
          name: serviceError.name,
        });
        // Don't fail the payment if service history creation fails
      }

      res.json({
        success: true,
        message: "Payment confirmed successfully",
        data: { invoice },
      });
    } catch (error) {
      console.error("Error confirming payment:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Download invoice PDF
router.get(
  "/invoices/:id/download",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      // First find the customer using the user ID
      const customer = await Customer.findOne({ userId: req.user.id });
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      const invoice = await Invoice.findOne({
        _id: req.params.id,
        customerId: customer._id,
      })
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

      // Send PDF buffer
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error downloading invoice:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Bulk download invoices PDF
router.post(
  "/invoices/bulk-download",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      const { invoiceIds } = req.body;

      if (
        !invoiceIds ||
        !Array.isArray(invoiceIds) ||
        invoiceIds.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invoice IDs array is required",
        });
      }

      // First find the customer using the user ID
      const customer = await Customer.findOne({ userId: req.user.id });
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      const invoices = await Invoice.find({
        _id: { $in: invoiceIds },
        customerId: customer._id,
      })
        .populate("customerId", "name email phone address")
        .populate("vehicleId", "year make model vin licensePlate");

      if (invoices.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "No invoices found" });
      }

      // Generate combined PDF content
      const PDFGenerator = require("../utils/pdfGenerator");
      const pdfGenerator = new PDFGenerator();

      // For bulk download, we'll generate a combined PDF
      // This is a simplified approach - in production you might want to merge multiple PDFs
      const pdfBuffer = await pdfGenerator.generateInvoicePDF(invoices[0]); // For now, just the first invoice

      // Set response headers for PDF download
      res.type("application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="invoices-bulk-${
          new Date().toISOString().split("T")[0]
        }.pdf"`
      );

      // Send PDF buffer
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error bulk downloading invoices:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Get customer messages
router.get(
  "/messages",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      const { page = 1, limit = 20, type, isRead } = req.query;
      const skip = (page - 1) * limit;

      // First find the customer using the user ID
      const customer = await Customer.findOne({ userId: req.user.id });
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      const filter = { customerId: customer._id };
      if (type) filter.type = type;
      if (isRead !== undefined) filter.isRead = isRead === "true";

      const messages = await Message.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate("relatedAppointment", "date time serviceType");

      const total = await Message.countDocuments(filter);

      res.json({
        success: true,
        data: {
          messages,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Error fetching customer messages:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Send new message
router.post(
  "/messages",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      const { error, value } = messageSchema.validate(req.body);
      if (error) {
        return res
          .status(400)
          .json({ success: false, message: error.details[0].message });
      }

      const user = await User.findById(req.user.id);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      // First find the customer using the user ID
      const customer = await Customer.findOne({ userId: req.user.id });
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      const message = new Message({
        ...value,
        customerId: customer._id,
        from: "customer",
        fromName: user.name || user.email,
        isRead: false,
      });

      await message.save();

      res.status(201).json({
        success: true,
        message: "Message sent successfully",
        data: { message },
      });
    } catch (error) {
      console.error("Error sending message:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Mark message as read
router.put(
  "/messages/:id/read",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      // First find the customer record using the user ID
      const customer = await Customer.findOne({ userId: req.user.id });
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      const message = await Message.findOneAndUpdate(
        { _id: req.params.id, customerId: customer._id },
        { isRead: true },
        { new: true }
      );

      if (!message) {
        return res
          .status(404)
          .json({ success: false, message: "Message not found" });
      }

      res.json({
        success: true,
        message: "Message marked as read",
        data: { message },
      });
    } catch (error) {
      console.error("Error marking message as read:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Delete message
router.delete(
  "/messages/:id",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      // First find the customer using the user ID
      const customer = await Customer.findOne({ userId: req.user.id });
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      const message = await Message.findOneAndDelete({
        _id: req.params.id,
        customerId: customer._id,
      });

      if (!message) {
        return res
          .status(404)
          .json({ success: false, message: "Message not found" });
      }

      res.json({
        success: true,
        message: "Message deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting message:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Get customer dashboard data
router.get(
  "/dashboard",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      const customer = await Customer.findOne({ userId: req.user.id });
      if (!customer) {
        return res.json({
          success: true,
          data: {
            stats: {
              vehicles: 0,
              appointments: 0,
              services: 0,
              invoices: 0,
              outstandingAmount: 0,
            },
            recentAppointments: [],
            upcomingAppointments: [],
            recentServices: [],
            outstandingInvoices: [],
          },
        });
      }

      // Get counts
      const vehicleCount = await Vehicle.countDocuments({
        customer: customer._id,
      });
      const appointmentCount = await Appointment.countDocuments({
        customer: customer._id,
      });
      const serviceCount = customer.serviceHistory
        ? customer.serviceHistory.length
        : 0;
      const invoiceCount = await Invoice.countDocuments({
        customerId: customer._id,
      });

      // Get recent appointments
      const recentAppointments = await Appointment.find({
        customer: customer._id,
      })
        .populate("vehicle", "year make model vin licensePlate mileage")
        .populate("serviceType", "name category laborRate estimatedDuration")
        .sort({ scheduledDate: -1, scheduledTime: -1 })
        .limit(5);

      // Get upcoming appointments
      const upcomingAppointments = await Appointment.find({
        customer: customer._id,
        scheduledDate: { $gte: new Date() },
        status: "scheduled",
      })
        .populate("vehicle", "year make model vin licensePlate mileage")
        .populate("serviceType", "name category laborRate estimatedDuration")
        .sort({ scheduledDate: 1, scheduledTime: 1 })
        .limit(5);

      // Get recent services
      const recentServices = customer.serviceHistory
        ? customer.serviceHistory.slice(0, 5)
        : [];

      // Get outstanding invoices
      const outstandingInvoices = await Invoice.find({
        customerId: customer._id,
        status: { $in: ["pending", "overdue"] },
      }).sort({ dueDate: 1 });

      const totalOutstanding = outstandingInvoices.reduce(
        (sum, invoice) => sum + invoice.total,
        0
      );

      res.json({
        success: true,
        data: {
          stats: {
            vehicles: vehicleCount,
            appointments: appointmentCount,
            services: serviceCount,
            invoices: invoiceCount,
            outstandingAmount: totalOutstanding,
          },
          recentAppointments,
          upcomingAppointments,
          recentServices,
          outstandingInvoices,
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Get customer notifications
router.get(
  "/notifications",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      const { page = 1, limit = 20, type, status } = req.query;
      const skip = (page - 1) * limit;

      // Find customer record first
      const customer = await Customer.findOne({ userId: req.user.id });
      if (!customer) {
        return res.json({
          success: true,
          data: {
            notifications: [],
            unreadCount: 0,
            pagination: {
              page: parseInt(page),
              limit: parseInt(limit),
              total: 0,
              pages: 0,
            },
          },
        });
      }

      const filter = { customer: customer._id };
      if (type) filter.type = type;
      if (status) filter.status = status;

      const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Notification.countDocuments(filter);
      const unreadCount = await notificationService.getUnreadCount(
        customer._id
      );

      res.json({
        success: true,
        data: {
          notifications,
          unreadCount,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } catch (error) {
      console.error("Error fetching customer notifications:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Mark notification as read
router.put(
  "/notifications/:id/read",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      const notification = await notificationService.markAsRead(req.params.id);

      if (!notification) {
        return res
          .status(404)
          .json({ success: false, message: "Notification not found" });
      }

      res.json({
        success: true,
        message: "Notification marked as read",
        data: { notification },
      });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Mark all notifications as read
router.put(
  "/notifications/read-all",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      // Find customer record first
      const customer = await Customer.findOne({ userId: req.user.id });
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      await Notification.updateMany(
        {
          customer: customer._id,
          status: { $in: ["sent", "delivered"] },
        },
        {
          status: "read",
          readAt: new Date(),
        }
      );

      res.json({
        success: true,
        message: "All notifications marked as read",
      });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Get available technicians for customer appointment scheduling
router.get(
  "/technicians",
  authenticateToken,
  requireRole(["customer", "admin", "super_admin"]),
  async (req, res) => {
    try {
      const { isActive = "true" } = req.query;

      // Build query for active technicians only
      const query = { isActive: isActive === "true" };

      // Execute query to get active technicians
      const technicians = await Technician.find(query)
        .select("name email specializations hourlyRate isActive")
        .sort({ name: 1 })
        .exec();

      res.json({
        success: true,
        data: {
          technicians,
          pagination: {
            totalTechnicians: technicians.length,
            currentPage: 1,
            totalPages: 1,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching technicians for customer:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Get customer statistics (admin only)
router.get(
  "/stats/overview",
  authenticateToken,
  requireAnyAdmin,
  async (req, res) => {
    try {
      // Get total customers
      const totalCustomers = await Customer.countDocuments();

      // Get active customers
      const activeCustomers = await Customer.countDocuments({
        status: "active",
      });

      // Get customers created this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const customersThisMonth = await Customer.countDocuments({
        createdAt: { $gte: startOfMonth },
      });

      // Get customers created last month
      const startOfLastMonth = new Date(startOfMonth);
      startOfLastMonth.setMonth(startOfMonth.getMonth() - 1);
      const endOfLastMonth = new Date(startOfMonth);
      endOfLastMonth.setDate(0);

      const customersLastMonth = await Customer.countDocuments({
        createdAt: {
          $gte: startOfLastMonth,
          $lte: endOfLastMonth,
        },
      });

      // Calculate growth rate
      const growthRate =
        customersLastMonth > 0
          ? Math.round(
              ((customersThisMonth - customersLastMonth) / customersLastMonth) *
                100
            )
          : customersThisMonth > 0
          ? 100
          : 0;

      // Get total vehicles (from Vehicle collection)
      const totalVehicles = await Vehicle.countDocuments();

      // Calculate average vehicles per customer
      const averageVehiclesPerCustomer =
        totalCustomers > 0
          ? Math.round((totalVehicles / totalCustomers) * 10) / 10
          : 0;

      res.json({
        success: true,
        data: {
          totalCustomers,
          activeCustomers,
          totalVehicles,
          averageVehiclesPerCustomer,
          customersThisMonth,
          customersLastMonth,
          growthRate,
        },
      });
    } catch (error) {
      console.error("Error fetching customer statistics:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Get individual customer by ID (admin only) - Must be last to avoid conflicts with other routes
router.get("/:id", authenticateToken, requireAnyAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID format",
      });
    }

    const customer = await Customer.findById(id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Get vehicles for this customer
    const vehicles = await Vehicle.find({ customer: customer._id });

    // Transform customer for response
    const transformedCustomer = {
      _id: customer._id,
      id: customer._id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      businessName: customer.businessName,
      address: customer.address,
      status: customer.status,
      notes: customer.notes,
      vehicles: vehicles || [],
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };

    res.json({
      success: true,
      data: { customer: transformedCustomer },
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Add new vehicle to specific customer (admin only) - Must be after /:id route
router.post(
  "/:customerId/vehicles",
  authenticateToken,
  requireAnyAdmin,
  async (req, res) => {
    try {
      const { customerId } = req.params;

      // Validate customer ID
      if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid customer ID format" });
      }

      // Find customer
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      const { error, value } = vehicleSchema.validate(req.body);
      if (error) {
        return res
          .status(400)
          .json({ success: false, message: error.details[0].message });
      }

      // Check for duplicate VIN within customer's vehicles
      const existingVehicle = await Vehicle.findOne({
        customer: customer._id,
        vin: value.vin,
      });
      if (existingVehicle) {
        return res.status(409).json({
          success: false,
          message: "A vehicle with this VIN already exists",
        });
      }

      // Create new vehicle in separate collection
      const newVehicle = new Vehicle({
        ...value,
        customer: customer._id,
        createdBy: req.user.id,
      });
      await newVehicle.save();

      // Get updated vehicles for this customer
      const vehicles = await Vehicle.find({ customer: customer._id });

      // Transform customer for response
      const transformedCustomer = {
        _id: customer._id,
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        businessName: customer.businessName,
        address: customer.address,
        status: customer.status,
        notes: customer.notes,
        vehicles: vehicles || [],
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      };

      res.status(201).json({
        success: true,
        message: "Vehicle added successfully",
        data: { customer: transformedCustomer },
      });
    } catch (error) {
      console.error("Error adding vehicle:", error);
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "A vehicle with this VIN already exists",
        });
      }
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Update vehicle for specific customer (admin only)
router.put(
  "/:customerId/vehicles/:vehicleId",
  authenticateToken,
  requireAnyAdmin,
  async (req, res) => {
    try {
      const { customerId, vehicleId } = req.params;

      // Validate IDs
      if (
        !mongoose.Types.ObjectId.isValid(customerId) ||
        !mongoose.Types.ObjectId.isValid(vehicleId)
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid ID format" });
      }

      // Find customer
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      // Find vehicle
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        return res
          .status(404)
          .json({ success: false, message: "Vehicle not found" });
      }

      // Check if vehicle belongs to this customer
      if (vehicle.customer.toString() !== customerId) {
        return res.status(403).json({
          success: false,
          message: "Vehicle does not belong to this customer",
        });
      }

      // Validate update data
      const vehicleUpdateSchema = Joi.object({
        year: Joi.number()
          .integer()
          .min(1900)
          .max(new Date().getFullYear() + 1)
          .optional(),
        make: Joi.string().min(1).max(50).optional(),
        model: Joi.string().min(1).max(50).optional(),
        vin: Joi.string().min(8).max(17).optional(),
        licensePlate: Joi.string().min(1).max(20).optional(),
        color: Joi.string().min(1).max(30).optional(),
        mileage: Joi.number().integer().min(0).optional(),
        status: Joi.string()
          .valid("active", "inactive", "maintenance")
          .optional(),
      });

      const { error, value } = vehicleUpdateSchema.validate(req.body);
      if (error) {
        return res
          .status(400)
          .json({ success: false, message: error.details[0].message });
      }

      // Check for duplicate VIN if VIN is being updated
      if (value.vin && value.vin !== vehicle.vin) {
        const existingVehicle = await Vehicle.findOne({
          customer: customer._id,
          vin: value.vin,
          _id: { $ne: vehicleId },
        });
        if (existingVehicle) {
          return res.status(409).json({
            success: false,
            message: "A vehicle with this VIN already exists",
          });
        }
      }

      // Update vehicle
      const updatedVehicle = await Vehicle.findByIdAndUpdate(
        vehicleId,
        { ...value, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      // Get updated vehicles for this customer
      const vehicles = await Vehicle.find({ customer: customer._id });

      // Transform customer for response
      const transformedCustomer = {
        _id: customer._id,
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        businessName: customer.businessName,
        address: customer.address,
        status: customer.status,
        notes: customer.notes,
        vehicles: vehicles || [],
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      };

      res.json({
        success: true,
        message: "Vehicle updated successfully",
        data: { customer: transformedCustomer },
      });
    } catch (error) {
      console.error("Error updating vehicle:", error);
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: "A vehicle with this VIN already exists",
        });
      }
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Delete vehicle for specific customer (admin only)
router.delete(
  "/:customerId/vehicles/:vehicleId",
  authenticateToken,
  requireAnyAdmin,
  async (req, res) => {
    try {
      const { customerId, vehicleId } = req.params;

      // Validate IDs
      if (
        !mongoose.Types.ObjectId.isValid(customerId) ||
        !mongoose.Types.ObjectId.isValid(vehicleId)
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid ID format" });
      }

      // Find customer
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      // Find vehicle
      const vehicle = await Vehicle.findById(vehicleId);
      if (!vehicle) {
        return res
          .status(404)
          .json({ success: false, message: "Vehicle not found" });
      }

      // Check if vehicle belongs to this customer
      if (vehicle.customer.toString() !== customerId) {
        return res.status(403).json({
          success: false,
          message: "Vehicle does not belong to this customer",
        });
      }

      // Delete vehicle
      await Vehicle.findByIdAndDelete(vehicleId);

      // Get updated vehicles for this customer
      const vehicles = await Vehicle.find({ customer: customer._id });

      // Transform customer for response
      const transformedCustomer = {
        _id: customer._id,
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        businessName: customer.businessName,
        address: customer.address,
        status: customer.status,
        notes: customer.notes,
        vehicles: vehicles || [],
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      };

      res.json({
        success: true,
        message: "Vehicle deleted successfully",
        data: { customer: transformedCustomer },
      });
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Get payments for specific customer (admin only)
router.get(
  "/:customerId/payments",
  authenticateToken,
  requireAnyAdmin,
  async (req, res) => {
    try {
      const { customerId } = req.params;
      const {
        page = 1,
        limit = 10,
        sortBy = "date",
        sortOrder = "desc",
      } = req.query;

      // Validate customer ID
      if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid customer ID format" });
      }

      // Find customer
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;

      // Execute query with pagination
      const payments = await Payment.find({ customer: customerId })
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      // Get total count
      const total = await Payment.countDocuments({ customer: customerId });

      res.json({
        success: true,
        data: {
          payments,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalPayments: total,
            hasNextPage: page * limit < total,
            hasPrevPage: page > 1,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching payments:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Add payment for specific customer (admin only)
router.post(
  "/:customerId/payments",
  authenticateToken,
  requireAnyAdmin,
  async (req, res) => {
    try {
      const { customerId } = req.params;

      // Validate customer ID
      if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid customer ID format" });
      }

      // Find customer
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      // Validate payment data
      const { error, value } = paymentSchema.validate(req.body);
      if (error) {
        return res
          .status(400)
          .json({ success: false, message: error.details[0].message });
      }

      // Create new payment
      const payment = new Payment({
        ...value,
        customer: customer._id,
        createdBy: req.user.id,
        date: value.date || new Date(),
      });

      await payment.save();

      // Get updated payments for this customer
      const payments = await Payment.find({ customer: customer._id }).sort({
        date: -1,
      });

      res.status(201).json({
        success: true,
        message: "Payment added successfully",
        data: { payment, payments },
      });
    } catch (error) {
      console.error("Error adding payment:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Update payment for specific customer (admin only)
router.put(
  "/:customerId/payments/:paymentId",
  authenticateToken,
  requireAnyAdmin,
  async (req, res) => {
    try {
      const { customerId, paymentId } = req.params;

      // Validate IDs
      if (
        !mongoose.Types.ObjectId.isValid(customerId) ||
        !mongoose.Types.ObjectId.isValid(paymentId)
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid ID format" });
      }

      // Find customer
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      // Find payment
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        return res
          .status(404)
          .json({ success: false, message: "Payment not found" });
      }

      // Check if payment belongs to this customer
      if (payment.customer.toString() !== customerId) {
        return res.status(403).json({
          success: false,
          message: "Payment does not belong to this customer",
        });
      }

      // Validate update data
      const paymentUpdateSchema = Joi.object({
        amount: Joi.number().positive().optional(),
        date: Joi.date().max("now").optional(),
        method: Joi.string()
          .valid("cash", "card", "check", "bank_transfer", "online", "other")
          .optional(),
        reference: Joi.string().max(100).allow("").optional(),
        notes: Joi.string().max(500).allow("").optional(),
        status: Joi.string()
          .valid("pending", "completed", "failed", "refunded")
          .optional(),
      });

      const { error, value } = paymentUpdateSchema.validate(req.body);
      if (error) {
        return res
          .status(400)
          .json({ success: false, message: error.details[0].message });
      }

      // Update payment
      const updatedPayment = await Payment.findByIdAndUpdate(
        paymentId,
        { ...value, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      // Get updated payments for this customer
      const payments = await Payment.find({ customer: customer._id }).sort({
        date: -1,
      });

      res.json({
        success: true,
        message: "Payment updated successfully",
        data: { payment: updatedPayment, payments },
      });
    } catch (error) {
      console.error("Error updating payment:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Delete payment for specific customer (admin only)
router.delete(
  "/:customerId/payments/:paymentId",
  authenticateToken,
  requireAnyAdmin,
  async (req, res) => {
    try {
      const { customerId, paymentId } = req.params;

      // Validate IDs
      if (
        !mongoose.Types.ObjectId.isValid(customerId) ||
        !mongoose.Types.ObjectId.isValid(paymentId)
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid ID format" });
      }

      // Find customer
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      // Find payment
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        return res
          .status(404)
          .json({ success: false, message: "Payment not found" });
      }

      // Check if payment belongs to this customer
      if (payment.customer.toString() !== customerId) {
        return res.status(403).json({
          success: false,
          message: "Payment does not belong to this customer",
        });
      }

      // Delete payment
      await Payment.findByIdAndDelete(paymentId);

      // Get updated payments for this customer
      const payments = await Payment.find({ customer: customer._id }).sort({
        date: -1,
      });

      res.json({
        success: true,
        message: "Payment deleted successfully",
        data: { payments },
      });
    } catch (error) {
      console.error("Error deleting payment:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// ==================== ARRANGEMENTS ROUTES ====================

// Get customer's own arrangements (customer access)
router.get(
  "/me/arrangements",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      const customer = await Customer.findOne({ userId: req.user.id });
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      const arrangements = await Arrangement.find({ customer: customer._id })
        .sort({ date: -1 })
        .exec();

      res.json({
        success: true,
        data: {
          arrangements,
        },
      });
    } catch (error) {
      console.error("Error fetching customer arrangements:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Add arrangement for customer (customer access)
router.post(
  "/me/arrangements",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      const customer = await Customer.findOne({ userId: req.user.id });
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      const { error, value } = arrangementSchema.validate(req.body);
      if (error) {
        return res
          .status(400)
          .json({ success: false, message: error.details[0].message });
      }

      const arrangement = new Arrangement({
        ...value,
        customer: customer._id,
        createdBy: req.user.id,
        date: value.date || new Date(),
      });

      await arrangement.save();

      const arrangements = await Arrangement.find({
        customer: customer._id,
      }).sort({ date: -1 });

      res.status(201).json({
        success: true,
        message: "Arrangement added successfully",
        data: { arrangement, arrangements },
      });
    } catch (error) {
      console.error("Error adding arrangement:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Update arrangement for customer (customer access)
router.put(
  "/me/arrangements/:arrangementId",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      const { arrangementId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(arrangementId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid arrangement ID format" });
      }

      const customer = await Customer.findOne({ userId: req.user.id });
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      const arrangement = await Arrangement.findById(arrangementId);
      if (!arrangement) {
        return res
          .status(404)
          .json({ success: false, message: "Arrangement not found" });
      }

      if (arrangement.customer.toString() !== customer._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Arrangement does not belong to this customer",
        });
      }

      const arrangementUpdateSchema = Joi.object({
        date: Joi.date().max("now").optional(),
        amount: Joi.number().positive().optional(),
        notes: Joi.string().max(500).allow("").optional(),
        status: Joi.string()
          .valid("pending", "active", "completed", "cancelled")
          .optional(),
        type: Joi.string()
          .valid("installment", "payment_plan", "deferred", "other")
          .optional(),
        dueDate: Joi.date().optional(),
        term: Joi.number().positive().optional(),
        interestRate: Joi.number().min(0).max(100).optional(),
        monthlyPayment: Joi.number().positive().optional(),
        totalCost: Joi.number().positive().optional(),
        remainingBalance: Joi.number().min(0).optional(),
        nextPaymentDate: Joi.date().optional(),
      });

      const { error, value } = arrangementUpdateSchema.validate(req.body);
      if (error) {
        return res
          .status(400)
          .json({ success: false, message: error.details[0].message });
      }

      const updatedArrangement = await Arrangement.findByIdAndUpdate(
        arrangementId,
        value,
        { new: true }
      );

      const arrangements = await Arrangement.find({
        customer: customer._id,
      }).sort({ date: -1 });

      res.json({
        success: true,
        message: "Arrangement updated successfully",
        data: { arrangement: updatedArrangement, arrangements },
      });
    } catch (error) {
      console.error("Error updating arrangement:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Delete arrangement for customer (customer access)
router.delete(
  "/me/arrangements/:arrangementId",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      const { arrangementId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(arrangementId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid arrangement ID format" });
      }

      const customer = await Customer.findOne({ userId: req.user.id });
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      const arrangement = await Arrangement.findById(arrangementId);
      if (!arrangement) {
        return res
          .status(404)
          .json({ success: false, message: "Arrangement not found" });
      }

      if (arrangement.customer.toString() !== customer._id.toString()) {
        return res.status(403).json({
          success: false,
          message: "Arrangement does not belong to this customer",
        });
      }

      await Arrangement.findByIdAndDelete(arrangementId);

      const arrangements = await Arrangement.find({
        customer: customer._id,
      }).sort({ date: -1 });

      res.json({
        success: true,
        message: "Arrangement deleted successfully",
        data: { arrangements },
      });
    } catch (error) {
      console.error("Error deleting arrangement:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Get arrangements for specific customer (admin only)
router.get(
  "/:customerId/arrangements",
  authenticateToken,
  requireAnyAdmin,
  async (req, res) => {
    try {
      const { customerId } = req.params;
      const {
        page = 1,
        limit = 10,
        sortBy = "date",
        sortOrder = "desc",
      } = req.query;

      if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid customer ID format" });
      }

      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      const sort = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;

      const arrangements = await Arrangement.find({ customer: customerId })
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const total = await Arrangement.countDocuments({ customer: customerId });

      res.json({
        success: true,
        data: {
          arrangements,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalArrangements: total,
            hasNextPage: page * limit < total,
            hasPrevPage: page > 1,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching arrangements:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Add arrangement for specific customer (admin only)
router.post(
  "/:customerId/arrangements",
  authenticateToken,
  requireAnyAdmin,
  async (req, res) => {
    try {
      const { customerId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid customer ID format" });
      }

      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      const { error, value } = arrangementSchema.validate(req.body);
      if (error) {
        return res
          .status(400)
          .json({ success: false, message: error.details[0].message });
      }

      const arrangement = new Arrangement({
        ...value,
        customer: customer._id,
        createdBy: req.user.id,
        date: value.date || new Date(),
      });

      await arrangement.save();

      const arrangements = await Arrangement.find({
        customer: customer._id,
      }).sort({ date: -1 });

      res.status(201).json({
        success: true,
        message: "Arrangement added successfully",
        data: { arrangement, arrangements },
      });
    } catch (error) {
      console.error("Error adding arrangement:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Update arrangement for specific customer (admin only)
router.put(
  "/:customerId/arrangements/:arrangementId",
  authenticateToken,
  requireAnyAdmin,
  async (req, res) => {
    try {
      const { customerId, arrangementId } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(customerId) ||
        !mongoose.Types.ObjectId.isValid(arrangementId)
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid ID format" });
      }

      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      const arrangement = await Arrangement.findById(arrangementId);
      if (!arrangement) {
        return res
          .status(404)
          .json({ success: false, message: "Arrangement not found" });
      }

      if (arrangement.customer.toString() !== customerId) {
        return res.status(403).json({
          success: false,
          message: "Arrangement does not belong to this customer",
        });
      }

      const arrangementUpdateSchema = Joi.object({
        date: Joi.date().max("now").optional(),
        amount: Joi.number().positive().optional(),
        notes: Joi.string().max(500).allow("").optional(),
        status: Joi.string()
          .valid("pending", "active", "completed", "cancelled")
          .optional(),
        type: Joi.string()
          .valid("installment", "payment_plan", "deferred", "other")
          .optional(),
        dueDate: Joi.date().optional(),
      });

      const { error, value } = arrangementUpdateSchema.validate(req.body);
      if (error) {
        return res
          .status(400)
          .json({ success: false, message: error.details[0].message });
      }

      const updatedArrangement = await Arrangement.findByIdAndUpdate(
        arrangementId,
        { ...value, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      const arrangements = await Arrangement.find({
        customer: customer._id,
      }).sort({ date: -1 });

      res.json({
        success: true,
        message: "Arrangement updated successfully",
        data: { arrangement: updatedArrangement, arrangements },
      });
    } catch (error) {
      console.error("Error updating arrangement:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Delete arrangement for specific customer (admin only)
router.delete(
  "/:customerId/arrangements/:arrangementId",
  authenticateToken,
  requireAnyAdmin,
  async (req, res) => {
    try {
      const { customerId, arrangementId } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(customerId) ||
        !mongoose.Types.ObjectId.isValid(arrangementId)
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid ID format" });
      }

      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      const arrangement = await Arrangement.findById(arrangementId);
      if (!arrangement) {
        return res
          .status(404)
          .json({ success: false, message: "Arrangement not found" });
      }

      if (arrangement.customer.toString() !== customerId) {
        return res.status(403).json({
          success: false,
          message: "Arrangement does not belong to this customer",
        });
      }

      await Arrangement.findByIdAndDelete(arrangementId);

      const arrangements = await Arrangement.find({
        customer: customer._id,
      }).sort({ date: -1 });

      res.json({
        success: true,
        message: "Arrangement deleted successfully",
        data: { arrangements },
      });
    } catch (error) {
      console.error("Error deleting arrangement:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// ==================== TOWING ROUTES ====================

// Get towing records for specific customer (admin only)
router.get(
  "/:customerId/towing",
  authenticateToken,
  requireAnyAdmin,
  async (req, res) => {
    try {
      const { customerId } = req.params;
      const {
        page = 1,
        limit = 10,
        sortBy = "date",
        sortOrder = "desc",
      } = req.query;

      if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid customer ID format" });
      }

      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      const sort = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;

      const towingRecords = await Towing.find({ customer: customerId })
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const total = await Towing.countDocuments({ customer: customerId });

      res.json({
        success: true,
        data: {
          towingRecords,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalTowingRecords: total,
            hasNextPage: page * limit < total,
            hasPrevPage: page > 1,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching towing records:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Add towing record for specific customer (admin only)
router.post(
  "/:customerId/towing",
  authenticateToken,
  requireAnyAdmin,
  async (req, res) => {
    try {
      const { customerId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid customer ID format" });
      }

      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      const { error, value } = towingSchema.validate(req.body);
      if (error) {
        return res
          .status(400)
          .json({ success: false, message: error.details[0].message });
      }

      const towingRecord = new Towing({
        ...value,
        customer: customer._id,
        createdBy: req.user.id,
        date: value.date || new Date(),
      });

      await towingRecord.save();

      const towingRecords = await Towing.find({ customer: customer._id }).sort({
        date: -1,
      });

      res.status(201).json({
        success: true,
        message: "Towing record added successfully",
        data: { towingRecord, towingRecords },
      });
    } catch (error) {
      console.error("Error adding towing record:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Update towing record for specific customer (admin only)
router.put(
  "/:customerId/towing/:towingId",
  authenticateToken,
  requireAnyAdmin,
  async (req, res) => {
    try {
      const { customerId, towingId } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(customerId) ||
        !mongoose.Types.ObjectId.isValid(towingId)
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid ID format" });
      }

      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      const towingRecord = await Towing.findById(towingId);
      if (!towingRecord) {
        return res
          .status(404)
          .json({ success: false, message: "Towing record not found" });
      }

      if (towingRecord.customer.toString() !== customerId) {
        return res.status(403).json({
          success: false,
          message: "Towing record does not belong to this customer",
        });
      }

      const towingUpdateSchema = Joi.object({
        date: Joi.date().max("now").optional(),
        location: Joi.string().max(200).optional(),
        destination: Joi.string().max(200).allow("").optional(),
        status: Joi.string()
          .valid("scheduled", "in_progress", "completed", "cancelled")
          .optional(),
        notes: Joi.string().max(500).allow("").optional(),
        cost: Joi.number().min(0).optional(),
        vehicle: Joi.string().max(100).allow("").optional(),
      });

      const { error, value } = towingUpdateSchema.validate(req.body);
      if (error) {
        return res
          .status(400)
          .json({ success: false, message: error.details[0].message });
      }

      const updatedTowingRecord = await Towing.findByIdAndUpdate(
        towingId,
        { ...value, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      const towingRecords = await Towing.find({ customer: customer._id }).sort({
        date: -1,
      });

      res.json({
        success: true,
        message: "Towing record updated successfully",
        data: { towingRecord: updatedTowingRecord, towingRecords },
      });
    } catch (error) {
      console.error("Error updating towing record:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Delete towing record for specific customer (admin only)
router.delete(
  "/:customerId/towing/:towingId",
  authenticateToken,
  requireAnyAdmin,
  async (req, res) => {
    try {
      const { customerId, towingId } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(customerId) ||
        !mongoose.Types.ObjectId.isValid(towingId)
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid ID format" });
      }

      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      const towingRecord = await Towing.findById(towingId);
      if (!towingRecord) {
        return res
          .status(404)
          .json({ success: false, message: "Towing record not found" });
      }

      if (towingRecord.customer.toString() !== customerId) {
        return res.status(403).json({
          success: false,
          message: "Towing record does not belong to this customer",
        });
      }

      await Towing.findByIdAndDelete(towingId);

      const towingRecords = await Towing.find({ customer: customer._id }).sort({
        date: -1,
      });

      res.json({
        success: true,
        message: "Towing record deleted successfully",
        data: { towingRecords },
      });
    } catch (error) {
      console.error("Error deleting towing record:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// ==================== CALL LOGS ROUTES ====================

// Get call logs for specific customer (admin only)
router.get(
  "/:customerId/call-logs",
  authenticateToken,
  requireAnyAdmin,
  async (req, res) => {
    try {
      const { customerId } = req.params;
      const {
        page = 1,
        limit = 10,
        sortBy = "date",
        sortOrder = "desc",
      } = req.query;

      if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid customer ID format" });
      }

      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      const sort = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;

      const callLogs = await CallLog.find({ customer: customerId })
        .sort(sort)
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

      const total = await CallLog.countDocuments({ customer: customerId });

      res.json({
        success: true,
        data: {
          callLogs,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalCallLogs: total,
            hasNextPage: page * limit < total,
            hasPrevPage: page > 1,
          },
        },
      });
    } catch (error) {
      console.error("Error fetching call logs:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Add call log for specific customer (admin only)
router.post(
  "/:customerId/call-logs",
  authenticateToken,
  requireAnyAdmin,
  async (req, res) => {
    try {
      const { customerId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(customerId)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid customer ID format" });
      }

      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      const { error, value } = callLogSchema.validate(req.body);
      if (error) {
        return res
          .status(400)
          .json({ success: false, message: error.details[0].message });
      }

      const callLog = new CallLog({
        ...value,
        customer: customer._id,
        createdBy: req.user.id,
        date: value.date || new Date(),
      });

      await callLog.save();

      const callLogs = await CallLog.find({ customer: customer._id }).sort({
        date: -1,
      });

      res.status(201).json({
        success: true,
        message: "Call log added successfully",
        data: { callLog, callLogs },
      });
    } catch (error) {
      console.error("Error adding call log:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Update call log for specific customer (admin only)
router.put(
  "/:customerId/call-logs/:callLogId",
  authenticateToken,
  requireAnyAdmin,
  async (req, res) => {
    try {
      const { customerId, callLogId } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(customerId) ||
        !mongoose.Types.ObjectId.isValid(callLogId)
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid ID format" });
      }

      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      const callLog = await CallLog.findById(callLogId);
      if (!callLog) {
        return res
          .status(404)
          .json({ success: false, message: "Call log not found" });
      }

      if (callLog.customer.toString() !== customerId) {
        return res.status(403).json({
          success: false,
          message: "Call log does not belong to this customer",
        });
      }

      const callLogUpdateSchema = Joi.object({
        date: Joi.date().max("now").optional(),
        type: Joi.string()
          .valid("inbound", "outbound", "missed", "voicemail")
          .optional(),
        duration: Joi.number().min(0).optional(),
        notes: Joi.string().max(1000).allow("").optional(),
        summary: Joi.string().max(200).allow("").optional(),
        followUpDate: Joi.date().optional(),
        followUpRequired: Joi.boolean().optional(),
        phoneNumber: Joi.string().max(20).allow("").optional(),
      });

      const { error, value } = callLogUpdateSchema.validate(req.body);
      if (error) {
        return res
          .status(400)
          .json({ success: false, message: error.details[0].message });
      }

      const updatedCallLog = await CallLog.findByIdAndUpdate(
        callLogId,
        { ...value, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      const callLogs = await CallLog.find({ customer: customer._id }).sort({
        date: -1,
      });

      res.json({
        success: true,
        message: "Call log updated successfully",
        data: { callLog: updatedCallLog, callLogs },
      });
    } catch (error) {
      console.error("Error updating call log:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Delete call log for specific customer (admin only)
router.delete(
  "/:customerId/call-logs/:callLogId",
  authenticateToken,
  requireAnyAdmin,
  async (req, res) => {
    try {
      const { customerId, callLogId } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(customerId) ||
        !mongoose.Types.ObjectId.isValid(callLogId)
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid ID format" });
      }

      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      const callLog = await CallLog.findById(callLogId);
      if (!callLog) {
        return res
          .status(404)
          .json({ success: false, message: "Call log not found" });
      }

      if (callLog.customer.toString() !== customerId) {
        return res.status(403).json({
          success: false,
          message: "Call log does not belong to this customer",
        });
      }

      await CallLog.findByIdAndDelete(callLogId);

      const callLogs = await CallLog.find({ customer: customer._id }).sort({
        date: -1,
      });

      res.json({
        success: true,
        message: "Call log deleted successfully",
        data: { callLogs },
      });
    } catch (error) {
      console.error("Error deleting call log:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Get customer memberships
router.get("/:customerId/memberships", authenticateToken, async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid customer ID format" });
    }

    // Check if user has access to this customer
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res
        .status(404)
        .json({ success: false, message: "Customer not found" });
    }

    // If user is not admin, they can only access their own customer record
    if (req.user.role !== "admin" && req.user.role !== "super_admin") {
      if (customer.userId?.toString() !== req.user.id) {
        return res
          .status(403)
          .json({ success: false, message: "Access denied" });
      }
    }

    // Import CustomerMembership model
    const CustomerMembership = require("../models/CustomerMembership");

    const memberships = await CustomerMembership.find({
      customer: customerId,
    })
      .populate("membershipPlan")
      .populate("customer", "name email phone")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    // Return memberships in the format the frontend expects
    const formattedMemberships = memberships.map((membership) => ({
      id: membership._id,
      planName: membership.membershipPlan?.name || "Unknown Plan",
      tier: membership.membershipPlan?.tier || "basic",
      status: membership.status,
      startDate: membership.startDate,
      endDate: membership.endDate,
      monthlyFee: membership.price || 0,
      benefitsUsed: membership.benefitsUsed?.inspections || 0,
      totalBenefits: membership.membershipPlan?.benefits?.inspections || 0,
      autoRenew: membership.autoRenew || false,
      paymentMethod: "Credit Card", // This would come from payment system
      nextBillingDate: membership.nextBillingDate,
    }));

    res.json({
      success: true,
      memberships: formattedMemberships,
    });
  } catch (error) {
    console.error("Error fetching customer memberships:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Cancel customer membership
router.post(
  "/:customerId/memberships/:membershipId/cancel",
  authenticateToken,
  async (req, res) => {
    try {
      const { customerId, membershipId } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(customerId) ||
        !mongoose.Types.ObjectId.isValid(membershipId)
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid ID format" });
      }

      // Check if user has access to this customer
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        if (customer.userId?.toString() !== req.user.id) {
          return res
            .status(403)
            .json({ success: false, message: "Access denied" });
        }
      }

      // Import CustomerMembership model
      const CustomerMembership = require("../models/CustomerMembership");

      const membership = await CustomerMembership.findById(membershipId);
      if (!membership) {
        return res
          .status(404)
          .json({ success: false, message: "Membership not found" });
      }

      if (membership.customer.toString() !== customerId) {
        return res.status(403).json({
          success: false,
          message: "Membership does not belong to this customer",
        });
      }

      membership.status = "cancelled";
      membership.autoRenew = false;
      await membership.save();

      res.json({
        success: true,
        message: "Membership cancelled successfully",
      });
    } catch (error) {
      console.error("Error cancelling membership:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Renew customer membership
router.post(
  "/:customerId/memberships/:membershipId/renew",
  authenticateToken,
  async (req, res) => {
    try {
      const { customerId, membershipId } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(customerId) ||
        !mongoose.Types.ObjectId.isValid(membershipId)
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid ID format" });
      }

      // Check if user has access to this customer
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        if (customer.userId?.toString() !== req.user.id) {
          return res
            .status(403)
            .json({ success: false, message: "Access denied" });
        }
      }

      // Import CustomerMembership model
      const CustomerMembership = require("../models/CustomerMembership");

      const membership = await CustomerMembership.findById(membershipId);
      if (!membership) {
        return res
          .status(404)
          .json({ success: false, message: "Membership not found" });
      }

      if (membership.customer.toString() !== customerId) {
        return res.status(403).json({
          success: false,
          message: "Membership does not belong to this customer",
        });
      }

      // Set new dates for renewal
      const now = new Date();
      membership.startDate = now;
      membership.endDate = new Date(
        now.getFullYear() + 1,
        now.getMonth(),
        now.getDate()
      );
      membership.nextBillingDate = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        now.getDate()
      );
      membership.status = "active";
      membership.autoRenew = true;
      await membership.save();

      res.json({
        success: true,
        message: "Membership renewed successfully",
      });
    } catch (error) {
      console.error("Error renewing membership:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

// Delete customer membership
router.delete(
  "/:customerId/memberships/:membershipId",
  authenticateToken,
  async (req, res) => {
    try {
      const { customerId, membershipId } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(customerId) ||
        !mongoose.Types.ObjectId.isValid(membershipId)
      ) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid ID format" });
      }

      // Check if user has access to this customer
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res
          .status(404)
          .json({ success: false, message: "Customer not found" });
      }

      if (req.user.role !== "admin" && req.user.role !== "super_admin") {
        if (customer.userId?.toString() !== req.user.id) {
          return res
            .status(403)
            .json({ success: false, message: "Access denied" });
        }
      }

      // Import CustomerMembership model
      const CustomerMembership = require("../models/CustomerMembership");

      const membership = await CustomerMembership.findById(membershipId);
      if (!membership) {
        return res
          .status(404)
          .json({ success: false, message: "Membership not found" });
      }

      if (membership.customer.toString() !== customerId) {
        return res.status(403).json({
          success: false,
          message: "Membership does not belong to this customer",
        });
      }

      await CustomerMembership.findByIdAndDelete(membershipId);

      res.json({
        success: true,
        message: "Membership deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting membership:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
);

module.exports = router;
