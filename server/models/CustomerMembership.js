const mongoose = require("mongoose");

const customerMembershipSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: [true, "Customer is required"],
    },
    membershipPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MembershipPlan",
      required: [true, "Membership plan is required"],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended", "cancelled", "expired"],
      default: "active",
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"],
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
    },
    nextBillingDate: {
      type: Date,
      required: [true, "Next billing date is required"],
    },
    billingCycle: {
      type: String,
      enum: ["monthly", "quarterly", "yearly"],
      required: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
    paymentMethod: {
      type: String,
      enum: [
        "credit_card",
        "debit_card",
        "bank_transfer",
        "paypal",
        "stripe",
        "other",
      ],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "failed", "overdue"],
      default: "pending",
    },
    lastPaymentDate: {
      type: Date,
    },
    nextPaymentAmount: {
      type: Number,
      min: [0, "Payment amount cannot be negative"],
    },
    totalPaid: {
      type: Number,
      default: 0,
      min: [0, "Total paid cannot be negative"],
    },
    benefitsUsed: {
      inspections: {
        type: Number,
        default: 0,
      },
      roadsideAssistance: {
        type: Number,
        default: 0,
      },
      priorityBookings: {
        type: Number,
        default: 0,
      },
    },
    notes: {
      type: String,
      trim: true,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
    cancellationDate: {
      type: Date,
    },
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
customerMembershipSchema.index({ customer: 1, status: 1 });
customerMembershipSchema.index({ nextBillingDate: 1 });
customerMembershipSchema.index({ paymentStatus: 1 });
customerMembershipSchema.index({ endDate: 1 });

// Virtual for membership status
customerMembershipSchema.virtual("isExpired").get(function () {
  return this.endDate < new Date();
});

// Virtual for days until renewal
customerMembershipSchema.virtual("daysUntilRenewal").get(function () {
  const now = new Date();
  const renewal = new Date(this.nextBillingDate);
  const diffTime = renewal - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Ensure virtual fields are serialized
customerMembershipSchema.set("toJSON", { virtuals: true });
customerMembershipSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("CustomerMembership", customerMembershipSchema);
