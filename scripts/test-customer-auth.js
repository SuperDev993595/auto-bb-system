const mongoose = require('mongoose');
const User = require('../server/models/User');
const Customer = require('../server/models/Customer');
require('dotenv').config();

async function testCustomerAuth() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/auto-repair-crm');
    console.log('Connected to MongoDB');

    // Find all customer users
    const customerUsers = await User.find({ role: 'customer' });
    console.log(`\nFound ${customerUsers.length} customer users:`);

    for (const user of customerUsers) {
      console.log(`\nUser: ${user.email}`);
      console.log(`  - User ID: ${user._id}`);
      console.log(`  - Customer ID: ${user.customerId || 'NOT SET'}`);
      
      if (user.customerId) {
        // Find the corresponding customer record
        const customer = await Customer.findById(user.customerId);
        if (customer) {
          console.log(`  - Customer Name: ${customer.name}`);
          console.log(`  - Customer Status: ${customer.status}`);
          console.log(`  - Customer UserId: ${customer.userId}`);
          console.log(`  - Link Status: ${customer.userId?.toString() === user._id.toString() ? '✅ CORRECT' : '❌ MISMATCH'}`);
        } else {
          console.log(`  - Customer Record: ❌ NOT FOUND`);
        }
      }
    }

    // Also check customers without userId
    const customersWithoutUserId = await Customer.find({
      $or: [
        { userId: { $exists: false } },
        { userId: null }
      ]
    });

    if (customersWithoutUserId.length > 0) {
      console.log(`\n⚠️  Found ${customersWithoutUserId.length} customers without userId:`);
      customersWithoutUserId.forEach(customer => {
        console.log(`  - ${customer.name} (${customer.email})`);
      });
    }

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');

  } catch (error) {
    console.error('Test error:', error);
    process.exit(1);
  }
}

// Run the test
testCustomerAuth();
