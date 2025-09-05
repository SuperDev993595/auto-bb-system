const express = require("express");
const router = express.Router();
const { authenticateToken, requireCustomer } = require("../middleware/auth");
const stripe = require("../config/stripe");
const CustomerMembership = require("../models/CustomerMembership");
const Customer = require("../models/Customer");
const MembershipPlan = require("../models/MembershipPlan");

// Create payment intent for membership subscription
router.post(
  "/create-payment-intent",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      const { membershipPlanId, billingCycle } = req.body;

      // Get the membership plan
      const membershipPlan = await MembershipPlan.findById(membershipPlanId);
      if (!membershipPlan) {
        return res.status(404).json({
          success: false,
          message: "Membership plan not found",
        });
      }

      // Get customer
      const customer = await Customer.findOne({ userId: req.user.id });
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      // Calculate amount based on billing cycle
      let amount;
      switch (billingCycle) {
        case "monthly":
          amount = membershipPlan.price * 100; // Convert to cents
          break;
        case "quarterly":
          amount = membershipPlan.price * 3 * 100;
          break;
        case "yearly":
          amount = membershipPlan.price * 12 * 100;
          break;
        default:
          amount = membershipPlan.price * 100;
      }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount),
        currency: "usd",
        metadata: {
          membershipPlanId,
          customerId: customer._id.toString(),
          billingCycle,
          planName: membershipPlan.name,
        },
      });

      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        amount: amount / 100, // Convert back to dollars
        membershipPlan: {
          _id: membershipPlan._id,
          name: membershipPlan.name,
          price: membershipPlan.price,
          billingCycle: membershipPlan.billingCycle,
        },
      });
    } catch (error) {
      console.error("Error creating payment intent:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create payment intent",
      });
    }
  }
);

// Confirm payment and create membership
router.post(
  "/confirm-membership",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      const {
        paymentIntentId,
        membershipPlanId,
        billingCycle,
        autoRenew = true,
      } = req.body;

      // Verify payment intent
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );
      if (paymentIntent.status !== "succeeded") {
        return res.status(400).json({
          success: false,
          message: "Payment not completed",
        });
      }

      // Get customer
      const customer = await Customer.findOne({ userId: req.user.id });
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      // Get membership plan
      const membershipPlan = await MembershipPlan.findById(membershipPlanId);
      if (!membershipPlan) {
        return res.status(404).json({
          success: false,
          message: "Membership plan not found",
        });
      }

      // Calculate dates
      const startDate = new Date();
      let endDate = new Date();
      let nextBillingDate = new Date();

      switch (billingCycle) {
        case "monthly":
          endDate.setMonth(endDate.getMonth() + 1);
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
          break;
        case "quarterly":
          endDate.setMonth(endDate.getMonth() + 3);
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
          break;
        case "yearly":
          endDate.setFullYear(endDate.getFullYear() + 1);
          nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
          break;
      }

      // Create customer membership
      const membership = new CustomerMembership({
        customer: customer._id,
        membershipPlan: membershipPlan._id,
        status: "active",
        startDate,
        endDate,
        nextBillingDate,
        billingCycle,
        price: membershipPlan.price,
        autoRenew,
        paymentMethod: "credit_card",
        paymentStatus: "paid",
        lastPaymentDate: new Date(),
        totalPaid: paymentIntent.amount / 100,
        benefitsUsed: {
          inspections: 0,
          roadsideAssistance: 0,
          priorityBookings: 0,
        },
        createdBy: req.user.id,
      });

      await membership.save();

      // Populate references
      await membership.populate("membershipPlan");
      await membership.populate("customer", "name email phone");

      res.json({
        success: true,
        message: "Membership created successfully",
        membership,
      });
    } catch (error) {
      console.error("Error confirming membership:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create membership",
      });
    }
  }
);

// Get customer's payment methods
router.get(
  "/payment-methods",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      const customer = await Customer.findOne({ userId: req.user.id });
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      // Get customer's Stripe customer ID (you'll need to store this)
      // For now, we'll create a new customer if they don't exist
      let stripeCustomerId = customer.stripeCustomerId;

      if (!stripeCustomerId) {
        const stripeCustomer = await stripe.customers.create({
          email: customer.email,
          name: customer.name,
          metadata: {
            customerId: customer._id.toString(),
          },
        });

        // Update customer with Stripe customer ID
        customer.stripeCustomerId = stripeCustomer.id;
        await customer.save();

        stripeCustomerId = stripeCustomer.id;
      }

      // Get payment methods
      const paymentMethods = await stripe.paymentMethods.list({
        customer: stripeCustomerId,
        type: "card",
      });

      res.json({
        success: true,
        data: {
          paymentMethods: paymentMethods.data.map((pm) => ({
            id: pm.id,
            type: pm.type,
            card: {
              brand: pm.card.brand,
              last4: pm.card.last4,
              expMonth: pm.card.exp_month,
              expYear: pm.card.exp_year,
            },
            isDefault: false, // Stripe doesn't have a default concept, we'll handle this separately
            isActive: true,
          })),
        },
      });
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch payment methods",
      });
    }
  }
);

// Add payment method for customer
router.post(
  "/payment-methods",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      const customer = await Customer.findOne({ userId: req.user.id });
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      const { type, card, billing_details } = req.body;

      // Get or create Stripe customer
      let stripeCustomerId = customer.stripeCustomerId;

      if (!stripeCustomerId) {
        const stripeCustomer = await stripe.customers.create({
          email: customer.email,
          name: customer.name,
          metadata: {
            customerId: customer._id.toString(),
          },
        });

        customer.stripeCustomerId = stripeCustomer.id;
        await customer.save();

        stripeCustomerId = stripeCustomer.id;
      }

      // Create payment method
      const paymentMethod = await stripe.paymentMethods.create({
        type: type,
        card: card,
        billing_details: billing_details,
      });

      // Attach to customer
      await stripe.paymentMethods.attach(paymentMethod.id, {
        customer: stripeCustomerId,
      });

      res.json({
        success: true,
        message: "Payment method added successfully",
        data: {
          paymentMethod: {
            id: paymentMethod.id,
            type: paymentMethod.type,
            card: {
              brand: paymentMethod.card.brand,
              last4: paymentMethod.card.last4,
              expMonth: paymentMethod.card.exp_month,
              expYear: paymentMethod.card.exp_year,
            },
          },
          paymentMethods: [], // Will be populated by frontend reload
        },
      });
    } catch (error) {
      console.error("Error adding payment method:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add payment method",
      });
    }
  }
);

// Delete payment method for customer
router.delete(
  "/payment-methods/:paymentMethodId",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      const { paymentMethodId } = req.params;

      // Detach and delete payment method
      await stripe.paymentMethods.detach(paymentMethodId);

      res.json({
        success: true,
        message: "Payment method deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting payment method:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete payment method",
      });
    }
  }
);

// Set default payment method for customer
router.post(
  "/payment-methods/:paymentMethodId/default",
  authenticateToken,
  requireCustomer,
  async (req, res) => {
    try {
      const customer = await Customer.findOne({ userId: req.user.id });
      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Customer not found",
        });
      }

      const { paymentMethodId } = req.params;

      // Get or create Stripe customer
      let stripeCustomerId = customer.stripeCustomerId;

      if (!stripeCustomerId) {
        const stripeCustomer = await stripe.customers.create({
          email: customer.email,
          name: customer.name,
          metadata: {
            customerId: customer._id.toString(),
          },
        });

        customer.stripeCustomerId = stripeCustomer.id;
        await customer.save();

        stripeCustomerId = stripeCustomer.id;
      }

      // Update customer's default payment method
      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      res.json({
        success: true,
        message: "Default payment method updated successfully",
      });
    } catch (error) {
      console.error("Error setting default payment method:", error);
      res.status(500).json({
        success: false,
        message: "Failed to set default payment method",
      });
    }
  }
);

module.exports = router;
