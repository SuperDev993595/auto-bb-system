const mongoose = require('mongoose');
const User = require('../server/models/User');
const Customer = require('../server/models/Customer');
const CustomerMembership = require('../server/models/CustomerMembership');
require('dotenv').config();

async function checkCustomerMemberships() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/auto-repair-crm');
    console.log('Connected to MongoDB');

    // Find the customer user
    const customerUser = await User.findOne({ role: 'customer' });
    if (!customerUser) {
      console.log('No customer user found');
      return;
    }

    console.log(`\nChecking memberships for customer: ${customerUser.email}`);
    console.log(`User ID: ${customerUser._id}`);
    console.log(`Customer ID: ${customerUser.customerId}`);

    // Check if customer has any memberships
    const memberships = await CustomerMembership.find({
      customer: customerUser.customerId
    }).populate('membershipPlan');

    console.log(`\nFound ${memberships.length} memberships:`);
    
    if (memberships.length === 0) {
      console.log('No memberships found. This is why the page shows "No memberships found".');
      console.log('\nTo test the API, you would need to:');
      console.log('1. Create some membership plans');
      console.log('2. Create customer memberships linked to this customer');
    } else {
      memberships.forEach((membership, index) => {
        console.log(`\nMembership ${index + 1}:`);
        console.log(`  - ID: ${membership._id}`);
        console.log(`  - Status: ${membership.status}`);
        console.log(`  - Plan: ${membership.membershipPlan?.name || 'Unknown'}`);
        console.log(`  - Start Date: ${membership.startDate}`);
        console.log(`  - End Date: ${membership.endDate}`);
        console.log(`  - Price: $${membership.price || 0}`);
      });
    }

    // Also check if there are any membership plans available
    const MembershipPlan = require('../server/models/MembershipPlan');
    const plans = await MembershipPlan.find({ isActive: true });
    
    console.log(`\nAvailable membership plans: ${plans.length}`);
    if (plans.length === 0) {
      console.log('No membership plans found. You need to create some plans first.');
    } else {
      plans.forEach((plan, index) => {
        console.log(`  - ${plan.name} (${plan.tier}): $${plan.price}/${plan.billingCycle}`);
      });
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');

  } catch (error) {
    console.error('Check error:', error);
    process.exit(1);
  }
}

// Run the check
checkCustomerMemberships();
