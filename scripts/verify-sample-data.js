const mongoose = require('mongoose');

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auto-repair-crm';

// Import models
const MembershipPlan = require('../server/models/MembershipPlan');
const Warranty = require('../server/models/Warranty');
const Customer = require('../server/models/Customer');
const Vehicle = require('../server/models/Vehicle');

async function verifySampleData() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');

    // Check existing data
    const membershipPlans = await MembershipPlan.find();
    const warranties = await Warranty.find();
    const customers = await Customer.find();
    const vehicles = await Vehicle.find();

    console.log('\n📊 Current Data Summary:');
    console.log(`- Membership Plans: ${membershipPlans.length}`);
    console.log(`- Warranties: ${warranties.length}`);
    console.log(`- Customers: ${customers.length}`);
    console.log(`- Vehicles: ${vehicles.length}`);

    if (membershipPlans.length > 0) {
      console.log('\n📋 Membership Plans:');
      membershipPlans.forEach(plan => {
        console.log(`  - ${plan.name} (${plan.tier}): $${plan.price}/${plan.billingCycle}`);
      });
    }

    if (warranties.length > 0) {
      console.log('\n🛡️  Warranties:');
      warranties.forEach(warranty => {
        console.log(`  - ${warranty.name} (${warranty.warrantyType}): ${warranty.status}`);
      });
    }

    // If we have fewer warranties than expected, let's add more
    if (warranties.length < 6 && customers.length >= 3 && vehicles.length >= 3) {
      console.log('\n🔄 Adding more warranties...');
      
      const additionalWarranties = [
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
          notes: 'Premium warranty with no deductible. Covers all major components. Customer has not filed any claims yet.',
          customer: customers[2]._id,
          vehicle: vehicles[2]._id,
          createdBy: customers[0]._id // Using first customer as creator for demo
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
          notes: 'Specialized warranty for hybrid vehicle. Covers hybrid-specific systems and components. Long-term coverage for battery systems.',
          customer: customers[0]._id,
          vehicle: vehicles[3] ? vehicles[3]._id : vehicles[0]._id,
          createdBy: customers[0]._id
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
          notes: 'CPO warranty with good coverage. Customer filed one claim for electrical issue. Warranty expires in 2026.',
          customer: customers[1]._id,
          vehicle: vehicles[3] ? vehicles[3]._id : vehicles[1]._id,
          createdBy: customers[0]._id
        }
      ];

      const newWarranties = await Warranty.insertMany(additionalWarranties);
      console.log(`✅ Added ${newWarranties.length} additional warranties`);
    }

    // Final count
    const finalWarranties = await Warranty.find();
    console.log(`\n🎯 Final Warranty Count: ${finalWarranties.length}`);

  } catch (error) {
    console.error('❌ Error verifying sample data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  verifySampleData();
}

module.exports = verifySampleData;
