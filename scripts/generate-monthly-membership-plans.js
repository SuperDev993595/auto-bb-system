const mongoose = require('mongoose');
const MembershipPlan = require('../server/models/MembershipPlan');

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
    // Clear existing membership plans
    await MembershipPlan.deleteMany({});
    console.log('Cleared existing membership plans');
    
    // Create monthly membership plans
    const monthlyPlans = [
      {
        name: 'Basic Monthly',
        description: 'Essential car maintenance coverage for budget-conscious drivers',
        tier: 'basic',
        price: 29.99,
        billingCycle: 'monthly',
        features: [
          { name: 'Oil Change', description: 'Monthly oil change service', included: true },
          { name: 'Tire Rotation', description: 'Quarterly tire rotation', included: true },
          { name: 'Basic Inspection', description: 'Monthly safety inspection', included: true },
          { name: 'Fluid Top-up', description: 'Essential fluids check and top-up', included: true },
          { name: 'Battery Check', description: 'Battery health monitoring', included: false },
          { name: 'Brake Inspection', description: 'Comprehensive brake system check', included: false }
        ],
        benefits: {
          discountPercentage: 5,
          priorityBooking: false,
          freeInspections: 1,
          roadsideAssistance: false,
          extendedWarranty: false,
          conciergeService: false
        },
        isActive: true,
        maxVehicles: 1,
        createdBy: new mongoose.Types.ObjectId() // Placeholder admin user ID
      },
      {
        name: 'Premium Monthly',
        description: 'Comprehensive coverage with premium benefits and priority service',
        tier: 'premium',
        price: 59.99,
        billingCycle: 'monthly',
        features: [
          { name: 'Oil Change', description: 'Monthly oil change service', included: true },
          { name: 'Tire Rotation', description: 'Monthly tire rotation', included: true },
          { name: 'Full Inspection', description: 'Comprehensive monthly inspection', included: true },
          { name: 'Fluid Service', description: 'Complete fluid system service', included: true },
          { name: 'Battery Service', description: 'Battery testing and maintenance', included: true },
          { name: 'Brake Service', description: 'Brake system maintenance', included: true },
          { name: 'Air Filter', description: 'Air filter replacement', included: true },
          { name: 'Cabin Filter', description: 'Cabin air filter replacement', included: false }
        ],
        benefits: {
          discountPercentage: 15,
          priorityBooking: true,
          freeInspections: 2,
          roadsideAssistance: true,
          extendedWarranty: false,
          conciergeService: false
        },
        isActive: true,
        maxVehicles: 2,
        createdBy: new mongoose.Types.ObjectId() // Placeholder admin user ID
      },
      {
        name: 'VIP Monthly',
        description: 'Luxury service with exclusive benefits and premium support',
        tier: 'vip',
        price: 99.99,
        billingCycle: 'monthly',
        features: [
          { name: 'Oil Change', description: 'Premium oil change with synthetic oil', included: true },
          { name: 'Tire Service', description: 'Premium tire service and rotation', included: true },
          { name: 'Full Diagnostic', description: 'Complete vehicle diagnostic scan', included: true },
          { name: 'Fluid Service', description: 'Premium fluid system service', included: true },
          { name: 'Battery Service', description: 'Premium battery service', included: true },
          { name: 'Brake Service', description: 'Premium brake system service', included: true },
          { name: 'Air Filter', description: 'Premium air filter replacement', included: true },
          { name: 'Cabin Filter', description: 'Premium cabin filter replacement', included: true },
          { name: 'Wiper Blades', description: 'Wiper blade replacement', included: true },
          { name: 'Light Bulbs', description: 'Light bulb replacement', included: true }
        ],
        benefits: {
          discountPercentage: 25,
          priorityBooking: true,
          freeInspections: 4,
          roadsideAssistance: true,
          extendedWarranty: true,
          conciergeService: true
        },
        isActive: true,
        maxVehicles: 3,
        createdBy: new mongoose.Types.ObjectId() // Placeholder admin user ID
      },
      {
        name: 'Enterprise Monthly',
        description: 'Fleet management solution for businesses with multiple vehicles',
        tier: 'enterprise',
        price: 199.99,
        billingCycle: 'monthly',
        features: [
          { name: 'Oil Change', description: 'Enterprise-grade oil change service', included: true },
          { name: 'Tire Service', description: 'Commercial tire service', included: true },
          { name: 'Full Diagnostic', description: 'Enterprise diagnostic system', included: true },
          { name: 'Fluid Service', description: 'Commercial fluid system service', included: true },
          { name: 'Battery Service', description: 'Commercial battery service', included: true },
          { name: 'Brake Service', description: 'Commercial brake system service', included: true },
          { name: 'Air Filter', description: 'Commercial air filter service', included: true },
          { name: 'Cabin Filter', description: 'Commercial cabin filter service', included: true },
          { name: 'Wiper Blades', description: 'Commercial wiper service', included: true },
          { name: 'Light Bulbs', description: 'Commercial lighting service', included: true },
          { name: 'Fleet Reporting', description: 'Comprehensive fleet maintenance reports', included: true },
          { name: '24/7 Support', description: 'Round-the-clock technical support', included: true }
        ],
        benefits: {
          discountPercentage: 35,
          priorityBooking: true,
          freeInspections: 6,
          roadsideAssistance: true,
          extendedWarranty: true,
          conciergeService: true
        },
        isActive: true,
        maxVehicles: 10,
        createdBy: new mongoose.Types.ObjectId() // Placeholder admin user ID
      }
    ];
    
    // Insert the plans
    const createdPlans = await MembershipPlan.insertMany(monthlyPlans);
    console.log(`Successfully created ${createdPlans.length} monthly membership plans:`);
    
    createdPlans.forEach(plan => {
      console.log(`- ${plan.name}: $${plan.price}/month (${plan.tier} tier)`);
      console.log(`  Features: ${plan.features.filter(f => f.included).length} included`);
      console.log(`  Benefits: ${plan.benefits.discountPercentage}% discount, ${plan.benefits.freeInspections} free inspections`);
      console.log(`  Max Vehicles: ${plan.maxVehicles}`);
      console.log('');
    });
    
    console.log('Monthly membership plans generation completed successfully!');
    
  } catch (error) {
    console.error('Error generating membership plans:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
});
