const mongoose = require('mongoose');
const CustomerMembership = require('../server/models/CustomerMembership');
const MembershipPlan = require('../server/models/MembershipPlan');
const Customer = require('../server/models/Customer');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/auto-repair-crm', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Clear existing customer memberships
    await CustomerMembership.deleteMany({});
    console.log('Cleared existing customer memberships');
    
    // Get available membership plans
    const plans = await MembershipPlan.find({ isActive: true });
    if (plans.length === 0) {
      console.log('No membership plans found. Please run generate-monthly-membership-plans.js first.');
      return;
    }
    
    // Get some customers to assign memberships to
    const customers = await Customer.find().limit(5);
    if (customers.length === 0) {
      console.log('No customers found. Please create some customers first.');
      return;
    }
    
    // Create sample customer memberships
    const sampleMemberships = [];
    
    customers.forEach((customer, index) => {
      const plan = plans[index % plans.length]; // Cycle through plans
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // 1 month from now
      
      const membership = {
        customer: customer._id,
        membershipPlan: plan._id,
        status: index === 0 ? 'active' : (index === 1 ? 'active' : 'active'), // All active for now
        startDate: startDate,
        endDate: endDate,
        nextBillingDate: endDate,
        billingCycle: 'monthly',
        price: plan.price,
        autoRenew: true,
        paymentMethod: 'credit_card',
        paymentStatus: 'paid',
        nextPaymentAmount: plan.price,
        benefitsUsed: {
          inspections: Math.floor(Math.random() * plan.benefits.freeInspections),
          roadsideAssistance: Math.floor(Math.random() * 2),
          priorityBookings: Math.floor(Math.random() * 3)
        },
        notes: `Sample membership for ${customer.name}`,
        createdBy: new mongoose.Types.ObjectId() // Placeholder admin user ID
      };
      
      sampleMemberships.push(membership);
    });
    
    // Insert the memberships
    const createdMemberships = await CustomerMembership.insertMany(sampleMemberships);
    console.log(`Successfully created ${createdMemberships.length} sample customer memberships:`);
    
    for (let i = 0; i < createdMemberships.length; i++) {
      const membership = createdMemberships[i];
      const customer = customers[i];
      const plan = plans[i % plans.length];
      
      console.log(`- Customer: ${customer.name}`);
      console.log(`  Plan: ${plan.name} (${plan.tier} tier)`);
      console.log(`  Status: ${membership.status}`);
      console.log(`  Monthly Fee: $${membership.monthlyFee}`);
      console.log(`  Benefits: ${membership.benefitsUsed}/${membership.totalBenefits} used`);
      console.log(`  Auto Renew: ${membership.autoRenew ? 'Yes' : 'No'}`);
      console.log(`  Next Billing: ${membership.nextBillingDate.toLocaleDateString()}`);
      console.log('');
    }
    
    console.log('Sample customer memberships generation completed successfully!');
    
  } catch (error) {
    console.error('Error generating sample memberships:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
});
