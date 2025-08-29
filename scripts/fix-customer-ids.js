const mongoose = require('mongoose');
const User = require('../server/models/User');
const Customer = require('../server/models/Customer');
require('dotenv').config();

async function fixCustomerIds() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/auto-repair-crm');
    console.log('Connected to MongoDB');

    // Find all users with role 'customer' who don't have customerId set
    const usersWithoutCustomerId = await User.find({
      role: 'customer',
      $or: [
        { customerId: { $exists: false } },
        { customerId: null }
      ]
    });

    console.log(`Found ${usersWithoutCustomerId.length} users without customerId`);

    let fixedCount = 0;
    let errorCount = 0;

    for (const user of usersWithoutCustomerId) {
      try {
        // Find the corresponding customer record
        const customer = await Customer.findOne({ userId: user._id });
        
        if (customer) {
          // Update the user with the customerId
          user.customerId = customer._id;
          await user.save();
          console.log(`Fixed user ${user.email} with customerId: ${customer._id}`);
          fixedCount++;
        } else {
          console.log(`No customer record found for user ${user.email}`);
          errorCount++;
        }
      } catch (error) {
        console.error(`Error fixing user ${user.email}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n=== Fix Summary ===');
    console.log(`Total users processed: ${usersWithoutCustomerId.length}`);
    console.log(`Successfully fixed: ${fixedCount}`);
    console.log(`Errors: ${errorCount}`);

    // Also check for customers without userId
    const customersWithoutUserId = await Customer.find({
      $or: [
        { userId: { $exists: false } },
        { userId: null }
      ]
    });

    console.log(`\nFound ${customersWithoutUserId.length} customers without userId`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');

  } catch (error) {
    console.error('Script error:', error);
    process.exit(1);
  }
}

// Run the script
fixCustomerIds();
