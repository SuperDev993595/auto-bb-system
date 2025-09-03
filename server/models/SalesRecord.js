const mongoose = require("mongoose");

const salesRecordSchema = new mongoose.Schema(
  {
    // Basic sales information
    recordNumber: {
      type: String,
      required: true,
      unique: true,
    },

    // Customer information
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    // Sales details
    salesType: {
      type: String,
      enum: ["product", "service", "package", "consultation", "other"],
      required: true,
    },

    // Product/Service information
    items: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          trim: true,
        },
        category: {
          type: String,
          trim: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
        },
        unitPrice: {
          type: Number,
          required: true,
          min: [0, "Unit price cannot be negative"],
        },
        totalPrice: {
          type: Number,
          required: true,
          min: [0, "Total price cannot be negative"],
        },
        // Reference to inventory item if applicable
        inventoryItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "InventoryItem",
        },
        // Reference to service if applicable
        service: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "ServiceCatalog",
        },
      },
    ],

    // Financial information
    subtotal: {
      type: Number,
      required: true,
      min: [0, "Subtotal cannot be negative"],
    },
    tax: {
      type: Number,
      default: 0,
      min: [0, "Tax cannot be negative"],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, "Discount cannot be negative"],
    },
    total: {
      type: Number,
      required: true,
      min: [0, "Total cannot be negative"],
    },

    // Payment information
    paymentStatus: {
      type: String,
      enum: ["pending", "partial", "paid", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: [
        "cash",
        "credit_card",
        "debit_card",
        "check",
        "bank_transfer",
        "online",
        "stripe",
        "other",
      ],
      required: function () {
        return this.paymentStatus === "paid";
      },
    },
    paymentDate: {
      type: Date,
      required: function () {
        return this.paymentStatus === "paid";
      },
    },
    paymentReference: {
      type: String,
      trim: true,
    },

    // Sales person information
    salesPerson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Sales source and tracking
    salesSource: {
      type: String,
      enum: [
        "walk_in",
        "phone",
        "online",
        "referral",
        "marketing_campaign",
        "repeat_customer",
        "other",
      ],
      default: "walk_in",
    },

    // Lead conversion tracking
    convertedFromLead: {
      type: Boolean,
      default: false,
    },
    originalLeadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task", // Reference to sales task if converted from lead
    },

    // Status and workflow
    status: {
      type: String,
      enum: ["draft", "confirmed", "completed", "cancelled", "refunded"],
      default: "draft",
    },

    // Dates
    saleDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    completionDate: {
      type: Date,
    },

    // Notes and follow-up
    notes: {
      type: String,
      trim: true,
    },
    followUpNotes: [
      {
        content: {
          type: String,
          required: true,
          trim: true,
        },
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Follow-up scheduling
    nextFollowUp: {
      type: Date,
    },
    followUpStatus: {
      type: String,
      enum: ["scheduled", "completed", "cancelled", "overdue"],
      default: "scheduled",
    },

    // Customer satisfaction
    customerSatisfaction: {
      rating: {
        type: Number,
        min: [1, "Rating must be at least 1"],
        max: [5, "Rating cannot exceed 5"],
      },
      feedback: {
        type: String,
        trim: true,
      },
      date: {
        type: Date,
      },
    },

    // Warranty information
    warranty: {
      hasWarranty: {
        type: Boolean,
        default: false,
      },
      warrantyPeriod: {
        type: Number, // in months
        min: [0, "Warranty period cannot be negative"],
      },
      warrantyExpiry: {
        type: Date,
      },
      warrantyNotes: {
        type: String,
        trim: true,
      },
    },

    // Created by
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
salesRecordSchema.index({ recordNumber: 1 });
salesRecordSchema.index({ customer: 1 });
salesRecordSchema.index({ salesPerson: 1 });
salesRecordSchema.index({ saleDate: -1 });
salesRecordSchema.index({ status: 1 });
salesRecordSchema.index({ paymentStatus: 1 });
salesRecordSchema.index({ salesType: 1 });
salesRecordSchema.index({ salesSource: 1 });
salesRecordSchema.index({ nextFollowUp: 1 });

// Text indexes for search functionality
salesRecordSchema.index({
  recordNumber: "text",
  "items.name": "text",
  "items.description": "text",
  notes: "text",
  "followUpNotes.content": "text",
});

// Virtual for total items count
salesRecordSchema.virtual("totalItems").get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Virtual for profit calculation (if cost information is available)
salesRecordSchema.virtual("estimatedProfit").get(function () {
  // This would need cost information from inventory items
  // For now, return null as cost data might not be available
  return null;
});

// Pre-save middleware to generate record number
salesRecordSchema.pre("save", async function (next) {
  if (this.isNew && !this.recordNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    // Get count of sales records for this month
    const count = await this.constructor.countDocuments({
      saleDate: {
        $gte: new Date(year, date.getMonth(), 1),
        $lt: new Date(year, date.getMonth() + 1, 1),
      },
    });

    this.recordNumber = `SR-${year}${month}-${String(count + 1).padStart(
      4,
      "0"
    )}`;
  }

  // Calculate totals if not provided
  if (this.items && this.items.length > 0) {
    this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
    this.total = this.subtotal + this.tax - this.discount;
  }

  next();
});

// Method to add follow-up note
salesRecordSchema.methods.addFollowUpNote = function (content, userId) {
  this.followUpNotes.push({
    content,
    createdBy: userId,
    createdAt: new Date(),
  });
  return this.save();
};

// Method to update payment status
salesRecordSchema.methods.updatePaymentStatus = function (
  status,
  paymentMethod = null,
  paymentDate = null
) {
  this.paymentStatus = status;
  if (paymentMethod) this.paymentMethod = paymentMethod;
  if (paymentDate) this.paymentDate = paymentDate;
  return this.save();
};

// Method to schedule follow-up
salesRecordSchema.methods.scheduleFollowUp = function (date) {
  this.nextFollowUp = date;
  this.followUpStatus = "scheduled";
  return this.save();
};

// Static method to get sales statistics
salesRecordSchema.statics.getSalesStats = async function (
  startDate,
  endDate,
  salesPerson = null
) {
  const matchStage = {
    saleDate: {
      $gte: startDate,
      $lte: endDate,
    },
  };

  if (salesPerson) {
    matchStage.salesPerson = salesPerson;
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalSales: { $sum: 1 },
        totalRevenue: { $sum: "$total" },
        totalItems: { $sum: { $sum: "$items.quantity" } },
        avgSaleValue: { $avg: "$total" },
      },
    },
  ]);
};

// Ensure virtual fields are serialized
salesRecordSchema.set("toJSON", { virtuals: true });
salesRecordSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("SalesRecord", salesRecordSchema);
