const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auto-repair-crm';

// Import models
const User = require('../server/models/User');
const Customer = require('../server/models/Customer');
const Vehicle = require('../server/models/Vehicle');
const MembershipPlan = require('../server/models/MembershipPlan');
const Warranty = require('../server/models/Warranty');

// Sample Membership Plans data
const sampleMembershipPlans = [
  {
    name: 'Basic Care Plan',
    description: 'Essential maintenance coverage for budget-conscious vehicle owners. Perfect for daily drivers who want reliable service without breaking the bank.',
    tier: 'basic',
    price: 29.99,
    billingCycle: 'monthly',
    features: [
      {
        name: 'Oil Change Service',
        description: 'Quarterly oil change with premium synthetic oil and filter replacement',
        included: true
      },
      {
        name: 'Tire Rotation',
        description: 'Bi-annual tire rotation and balance service',
        included: true
      },
      {
        name: 'Multi-Point Inspection',
        description: 'Comprehensive vehicle inspection every 6 months',
        included: true
      },
      {
        name: 'Priority Scheduling',
        description: 'Faster appointment booking during peak hours',
        included: false
      },
      {
        name: 'Roadside Assistance',
        description: '24/7 emergency roadside assistance',
        included: false
      }
    ],
    benefits: {
      discountPercentage: 10,
      priorityBooking: false,
      freeInspections: 2,
      roadsideAssistance: false,
      extendedWarranty: false,
      conciergeService: false
    },
    maxVehicles: 1,
    isActive: true
  },
  {
    name: 'Premium Protection Plan',
    description: 'Comprehensive coverage for vehicle owners who want the best care for their investment. Includes priority service and enhanced benefits.',
    tier: 'premium',
    price: 79.99,
    billingCycle: 'monthly',
    features: [
      {
        name: 'Oil Change Service',
        description: 'Quarterly oil change with premium synthetic oil and filter replacement',
        included: true
      },
      {
        name: 'Tire Rotation & Balance',
        description: 'Bi-annual tire rotation and balance service',
        included: true
      },
      {
        name: 'Multi-Point Inspection',
        description: 'Comprehensive vehicle inspection every 3 months',
        included: true
      },
      {
        name: 'Brake Inspection',
        description: 'Semi-annual brake system inspection and adjustment',
        included: true
      },
      {
        name: 'Battery Testing',
        description: 'Quarterly battery health check and charging system test',
        included: true
      },
      {
        name: 'Priority Scheduling',
        description: 'Priority appointment booking with flexible scheduling',
        included: true
      },
      {
        name: 'Roadside Assistance',
        description: '24/7 emergency roadside assistance with towing',
        included: true
      }
    ],
    benefits: {
      discountPercentage: 20,
      priorityBooking: true,
      freeInspections: 4,
      roadsideAssistance: true,
      extendedWarranty: false,
      conciergeService: false
    },
    maxVehicles: 2,
    isActive: true
  },
  {
    name: 'VIP Elite Plan',
    description: 'Ultimate vehicle care experience for luxury and performance vehicle owners. Includes concierge service and exclusive benefits.',
    tier: 'vip',
    price: 149.99,
    billingCycle: 'monthly',
    features: [
      {
        name: 'Premium Oil Change Service',
        description: 'Quarterly oil change with ultra-premium synthetic oil and high-performance filter',
        included: true
      },
      {
        name: 'Tire Rotation & Balance',
        description: 'Bi-annual tire rotation and balance service with road force balancing',
        included: true
      },
      {
        name: 'Comprehensive Inspection',
        description: 'Monthly comprehensive vehicle inspection with detailed report',
        included: true
      },
      {
        name: 'Brake Service',
        description: 'Semi-annual brake system service with premium components',
        included: true
      },
      {
        name: 'Battery Service',
        description: 'Quarterly battery health check and charging system optimization',
        included: true
      },
      {
        name: 'AC System Service',
        description: 'Annual AC system inspection and refrigerant check',
        included: true
      },
      {
        name: 'Priority Scheduling',
        description: 'Exclusive priority appointment booking with dedicated time slots',
        included: true
      },
      {
        name: 'Premium Roadside Assistance',
        description: '24/7 premium roadside assistance with luxury vehicle handling',
        included: true
      },
      {
        name: 'Concierge Service',
        description: 'Personal vehicle care coordinator and appointment management',
        included: true
      }
    ],
    benefits: {
      discountPercentage: 30,
      priorityBooking: true,
      freeInspections: 12,
      roadsideAssistance: true,
      extendedWarranty: true,
      conciergeService: true
    },
    maxVehicles: 3,
    isActive: true
  },
  {
    name: 'Enterprise Fleet Plan',
    description: 'Comprehensive fleet management solution for businesses with multiple vehicles. Bulk pricing and fleet-specific services.',
    tier: 'enterprise',
    price: 299.99,
    billingCycle: 'monthly',
    features: [
      {
        name: 'Fleet Oil Change Service',
        description: 'Scheduled oil changes for entire fleet with bulk pricing',
        included: true
      },
      {
        name: 'Fleet Tire Management',
        description: 'Comprehensive tire rotation, balance, and replacement service',
        included: true
      },
      {
        name: 'Fleet Inspection Program',
        description: 'Regular fleet-wide vehicle inspections with detailed reporting',
        included: true
      },
      {
        name: 'Preventive Maintenance',
        description: 'Scheduled preventive maintenance for all fleet vehicles',
        included: true
      },
      {
        name: 'Emergency Service',
        description: '24/7 emergency service and roadside assistance for fleet',
        included: true
      },
      {
        name: 'Fleet Reporting',
        description: 'Comprehensive fleet health and maintenance reporting',
        included: true
      },
      {
        name: 'Dedicated Fleet Manager',
        description: 'Assigned fleet manager for coordination and communication',
        included: true
      },
      {
        name: 'Mobile Service',
        description: 'On-site service for fleet vehicles when possible',
        included: true
      }
    ],
    benefits: {
      discountPercentage: 40,
      priorityBooking: true,
      freeInspections: 50,
      roadsideAssistance: true,
      extendedWarranty: true,
      conciergeService: true
    },
    maxVehicles: 10,
    isActive: true
  },
  {
    name: 'Seasonal Maintenance Plan',
    description: 'Flexible plan focused on seasonal vehicle preparation and maintenance. Perfect for seasonal drivers and RV owners.',
    tier: 'basic',
    price: 49.99,
    billingCycle: 'quarterly',
    features: [
      {
        name: 'Seasonal Oil Change',
        description: 'Oil change service before each season change',
        included: true
      },
      {
        name: 'Seasonal Inspection',
        description: 'Comprehensive inspection tailored to upcoming season',
        included: true
      },
      {
        name: 'Tire Service',
        description: 'Seasonal tire rotation and pressure adjustment',
        included: true
      },
      {
        name: 'Fluid Check',
        description: 'Comprehensive fluid level and condition check',
        included: true
      },
      {
        name: 'Battery Service',
        description: 'Battery testing and charging system check',
        included: true
      }
    ],
    benefits: {
      discountPercentage: 15,
      priorityBooking: false,
      freeInspections: 4,
      roadsideAssistance: false,
      extendedWarranty: false,
      conciergeService: false
    },
    maxVehicles: 2,
    isActive: true
  }
];

// Sample Warranties data
const sampleWarranties = [
  {
    warrantyType: 'manufacturer',
    name: 'Toyota New Vehicle Warranty',
    description: 'Standard manufacturer warranty covering defects in materials and workmanship for new Toyota vehicles.',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2027-01-15'),
    mileageLimit: 36000,
    currentMileage: 15000,
    coverage: {
      engine: true,
      transmission: true,
      electrical: true,
      suspension: true,
      brakes: true,
      cooling: true,
      fuel: true,
      exhaust: true,
      interior: true,
      exterior: true
    },
    deductible: 0,
    maxClaimAmount: 5000,
    totalClaims: 0,
    totalClaimAmount: 0,
    status: 'active',
    provider: {
      name: 'Toyota Motor Corporation',
      contact: {
        phone: '1-800-331-4331',
        email: 'warranty@toyota.com',
        address: '6565 Headquarters Dr, Plano, TX 75024'
      }
    },
    terms: 'Covers defects in materials and workmanship. Normal wear and tear not covered.',
    exclusions: [
      'Normal wear and tear',
      'Maintenance items',
      'Damage from accidents',
      'Modifications not approved by Toyota'
    ],
    notes: 'Standard manufacturer warranty. Customer must maintain vehicle according to Toyota maintenance schedule.'
  },
  {
    warrantyType: 'extended',
    name: 'Premium Extended Warranty',
    description: 'Comprehensive extended warranty providing additional coverage beyond manufacturer warranty.',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2029-06-01'),
    mileageLimit: 100000,
    currentMileage: 25000,
    coverage: {
      engine: true,
      transmission: true,
      electrical: true,
      suspension: true,
      brakes: true,
      cooling: true,
      fuel: true,
      exhaust: true,
      interior: false,
      exterior: false
    },
    deductible: 100,
    maxClaimAmount: 8000,
    totalClaims: 1,
    totalClaimAmount: 1200,
    status: 'active',
    provider: {
      name: 'AutoShield Warranty Company',
      contact: {
        phone: '1-800-555-0123',
        email: 'claims@autoshield.com',
        address: '123 Warranty Blvd, Dallas, TX 75201'
      }
    },
    terms: 'Extended coverage for major components. $100 deductible per claim. Covers parts and labor.',
    exclusions: [
      'Maintenance items',
      'Wear items (brake pads, tires, etc.)',
      'Damage from accidents or misuse',
      'Modifications or aftermarket parts'
    ],
    notes: 'Customer purchased extended warranty after manufacturer warranty expired. Good coverage for major repairs.'
  },
  {
    warrantyType: 'powertrain',
    name: 'PowerTrain Plus Warranty',
    description: 'Focused warranty covering engine, transmission, and drivetrain components.',
    startDate: new Date('2023-12-01'),
    endDate: new Date('2028-12-01'),
    mileageLimit: 120000,
    currentMileage: 45000,
    coverage: {
      engine: true,
      transmission: true,
      electrical: false,
      suspension: false,
      brakes: false,
      cooling: true,
      fuel: true,
      exhaust: true,
      interior: false,
      exterior: false
    },
    deductible: 50,
    maxClaimAmount: 10000,
    totalClaims: 2,
    totalClaimAmount: 2800,
    status: 'active',
    provider: {
      name: 'PowerTrain Protection Inc',
      contact: {
        phone: '1-800-555-0456',
        email: 'service@powertrainprotection.com',
        address: '456 Engine Way, Detroit, MI 48201'
      }
    },
    terms: 'Covers engine, transmission, and drivetrain components. $50 deductible per claim.',
    exclusions: [
      'Electrical systems',
      'Suspension components',
      'Brake systems',
      'Interior/exterior components',
      'Maintenance items'
    ],
    notes: 'Customer has used warranty twice for transmission issues. Good coverage for powertrain components.'
  },
  {
    warrantyType: 'bumper_to_bumper',
    name: 'Complete Coverage Warranty',
    description: 'Comprehensive bumper-to-bumper coverage for all vehicle components.',
    startDate: new Date('2024-03-01'),
    endDate: new Date('2027-03-01'),
    mileageLimit: 75000,
    currentMileage: 18000,
    coverage: {
      engine: true,
      transmission: true,
      electrical: true,
      suspension: true,
      brakes: true,
      cooling: true,
      fuel: true,
      exhaust: true,
      interior: true,
      exterior: true
    },
    deductible: 0,
    maxClaimAmount: 15000,
    totalClaims: 0,
    totalClaimAmount: 0,
    status: 'active',
    provider: {
      name: 'Complete Coverage Warranty',
      contact: {
        phone: '1-800-555-0789',
        email: 'info@completecoverage.com',
        address: '789 Coverage St, Chicago, IL 60601'
      }
    },
    terms: 'Complete coverage for all vehicle components. No deductible. Covers parts, labor, and diagnostic fees.',
    exclusions: [
      'Maintenance items',
      'Wear items',
      'Damage from accidents',
      'Modifications',
      'Environmental damage'
    ],
    notes: 'Premium warranty with no deductible. Covers all major components. Customer has not filed any claims yet.'
  },
  {
    warrantyType: 'custom',
    name: 'Hybrid Vehicle Special Warranty',
    description: 'Specialized warranty covering hybrid-specific components and systems.',
    startDate: new Date('2024-08-01'),
    endDate: new Date('2030-08-01'),
    mileageLimit: 150000,
    currentMileage: 12000,
    coverage: {
      engine: true,
      transmission: true,
      electrical: true,
      suspension: false,
      brakes: true,
      cooling: true,
      fuel: false,
      exhaust: false,
      interior: false,
      exterior: false
    },
    deductible: 75,
    maxClaimAmount: 12000,
    totalClaims: 0,
    totalClaimAmount: 0,
    status: 'active',
    provider: {
      name: 'Hybrid Protection Services',
      contact: {
        phone: '1-800-555-0321',
        email: 'hybrid@protection.com',
        address: '321 Hybrid Ave, San Francisco, CA 94101'
      }
    },
    terms: 'Specialized coverage for hybrid vehicle components including battery, electric motors, and hybrid systems.',
    exclusions: [
      'Standard engine components',
      'Suspension and steering',
      'Interior/exterior components',
      'Maintenance items',
      'Battery replacement (unless defective)'
    ],
    notes: 'Specialized warranty for hybrid vehicle. Covers hybrid-specific systems and components. Long-term coverage for battery systems.'
  },
  {
    warrantyType: 'manufacturer',
    name: 'Honda Certified Pre-Owned Warranty',
    description: 'Manufacturer-backed warranty for certified pre-owned Honda vehicles.',
    startDate: new Date('2024-05-01'),
    endDate: new Date('2026-05-01'),
    mileageLimit: 48000,
    currentMileage: 32000,
    coverage: {
      engine: true,
      transmission: true,
      electrical: true,
      suspension: true,
      brakes: true,
      cooling: true,
      fuel: true,
      exhaust: true,
      interior: true,
      exterior: true
    },
    deductible: 0,
    maxClaimAmount: 3000,
    totalClaims: 1,
    totalClaimAmount: 450,
    status: 'active',
    provider: {
      name: 'American Honda Motor Co.',
      contact: {
        phone: '1-800-999-1009',
        email: 'warranty@honda.com',
        address: '1919 Torrance Blvd, Torrance, CA 90501'
      }
    },
    terms: 'Comprehensive coverage for certified pre-owned Honda vehicles. No deductible. Covers major components.',
    exclusions: [
      'Normal wear and tear',
      'Maintenance items',
      'Damage from accidents',
      'Modifications',
      'Environmental damage'
    ],
    notes: 'CPO warranty with good coverage. Customer filed one claim for electrical issue. Warranty expires in 2026.'
  }
];

async function generateSampleData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');

    // Get existing users for createdBy field
    const users = await User.find({ role: { $in: ['super_admin', 'admin'] } });
    if (users.length === 0) {
      throw new Error('No admin users found. Please run setup-database.js first.');
    }
    const adminUser = users[0];

    // Get existing customers and vehicles for warranty creation
    const customers = await Customer.find().limit(5);
    const vehicles = await Vehicle.find().limit(5);

    if (customers.length === 0 || vehicles.length === 0) {
      console.log('⚠️  No customers or vehicles found. Creating sample data...');
      
      // Create sample customers if none exist
      if (customers.length === 0) {
        const sampleCustomers = [
          {
            name: 'John Smith',
            email: 'john.smith@email.com',
            phone: '(555) 111-1111',
            businessName: '',
            address: {
              street: '123 Oak Street',
              city: 'New York',
              state: 'NY',
              zipCode: '10001'
            },
            status: 'active',
            createdBy: adminUser._id
          },
          {
            name: 'Sarah Wilson',
            email: 'sarah.wilson@email.com',
            phone: '(555) 222-2222',
            businessName: '',
            address: {
              street: '456 Pine Avenue',
              city: 'Los Angeles',
              state: 'CA',
              zipCode: '90210'
            },
            status: 'active',
            createdBy: adminUser._id
          },
          {
            name: 'Mike Johnson',
            email: 'mike.johnson@email.com',
            phone: '(555) 333-3333',
            businessName: '',
            address: {
              street: '789 Elm Road',
              city: 'Chicago',
              state: 'IL',
              zipCode: '60601'
            },
            status: 'active',
            createdBy: adminUser._id
          }
        ];
        
        const createdCustomers = await Customer.insertMany(sampleCustomers);
        console.log(`✅ Created ${createdCustomers.length} sample customers`);
        customers.push(...createdCustomers);
      }

      // Create sample vehicles if none exist
      if (vehicles.length === 0) {
        const sampleVehicles = [
          {
            year: 2022,
            make: 'Toyota',
            model: 'Camry',
            vin: '1HGBH41JXMN109187',
            licensePlate: 'ABC123',
            color: 'Silver',
            mileage: 25000,
            engineType: '2.5L 4-Cylinder',
            transmission: 'automatic',
            fuelType: 'gasoline',
            status: 'active',
            customer: customers[0]._id,
            createdBy: adminUser._id
          },
          {
            year: 2021,
            make: 'Honda',
            model: 'Accord',
            vin: '2T1BURHE0JC123457',
            licensePlate: 'XYZ789',
            color: 'Black',
            mileage: 35000,
            engineType: '1.5L Turbo',
            transmission: 'cvt',
            fuelType: 'gasoline',
            status: 'active',
            customer: customers[1]._id,
            createdBy: adminUser._id
          },
          {
            year: 2023,
            make: 'Ford',
            model: 'Escape',
            vin: '3FTNW21F8XEA12346',
            licensePlate: 'DEF456',
            color: 'White',
            mileage: 15000,
            engineType: '2.0L EcoBoost',
            transmission: 'automatic',
            fuelType: 'gasoline',
            status: 'active',
            customer: customers[2]._id,
            createdBy: adminUser._id
          }
        ];
        
        const createdVehicles = await Vehicle.insertMany(sampleVehicles);
        console.log(`✅ Created ${createdVehicles.length} sample vehicles`);
        vehicles.push(...createdVehicles);
      }
    }

    // Create Membership Plans
    console.log('📋 Creating sample membership plans...');
    const membershipPlans = await MembershipPlan.insertMany(sampleMembershipPlans.map(plan => ({
      ...plan,
      createdBy: adminUser._id
    })));
    console.log(`✅ Created ${membershipPlans.length} sample membership plans`);

    // Create Warranties (assigning to existing customers and vehicles)
    console.log('🛡️  Creating sample warranties...');
    const warranties = [];
    
    for (let i = 0; i < Math.min(sampleWarranties.length, customers.length, vehicles.length); i++) {
      const warranty = {
        ...sampleWarranties[i],
        customer: customers[i]._id,
        vehicle: vehicles[i]._id,
        createdBy: adminUser._id
      };
      warranties.push(warranty);
    }
    
    const createdWarranties = await Warranty.insertMany(warranties);
    console.log(`✅ Created ${createdWarranties.length} sample warranties`);

    console.log('\n🎉 Sample data generation completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Membership Plans created: ${membershipPlans.length}`);
    console.log(`- Warranties created: ${createdWarranties.length}`);
    console.log(`- Customers used: ${customers.length}`);
    console.log(`- Vehicles used: ${vehicles.length}`);
    
    console.log('\n📊 Membership Plans Created:');
    membershipPlans.forEach(plan => {
      console.log(`  - ${plan.name} (${plan.tier}): $${plan.price}/${plan.billingCycle}`);
    });
    
    console.log('\n🛡️  Warranties Created:');
    createdWarranties.forEach(warranty => {
      console.log(`  - ${warranty.name} (${warranty.warrantyType}): ${warranty.status}`);
    });

  } catch (error) {
    console.error('❌ Error generating sample data:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  generateSampleData();
}

module.exports = generateSampleData;
