const mongoose = require('mongoose');
const User = require('../server/models/User');
const Customer = require('../server/models/Customer');
require('dotenv').config();

async function testAuthEndpoints() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/auto-bb-system');
    console.log('Connected to MongoDB');

    // Find a customer user
    const customerUser = await User.findOne({ role: 'customer' });
    if (!customerUser) {
      console.log('No customer user found');
      return;
    }

    console.log(`\nTesting with customer user: ${customerUser.email}`);
    console.log(`User ID: ${customerUser._id}`);
    console.log(`Customer ID: ${customerUser.customerId}`);

    // Test the /me endpoint by simulating a request
    const { generateToken } = require('../server/middleware/auth');
    const token = generateToken(customerUser);
    
    console.log(`\nGenerated token: ${token.substring(0, 20)}...`);

    // Simulate what the frontend would receive
    const userData = {
      id: customerUser._id,
      name: customerUser.name,
      email: customerUser.email,
      role: customerUser.role,
      permissions: customerUser.permissions || [],
      avatar: customerUser.avatar,
      phone: customerUser.phone,
      lastLogin: customerUser.lastLogin,
      customerId: customerUser.customerId,
      businessClientId: customerUser.businessClientId
    };

    console.log('\nUser data that would be sent to frontend:');
    console.log(JSON.stringify(userData, null, 2));

    // Check if customerId is present
    if (userData.customerId) {
      console.log('\n✅ customerId is present in user data');
      
      // Verify the customer record exists
      const customer = await Customer.findById(userData.customerId);
      if (customer) {
        console.log(`✅ Customer record found: ${customer.name}`);
        console.log(`✅ Customer status: ${customer.status}`);
      } else {
        console.log('❌ Customer record not found');
      }
    } else {
      console.log('\n❌ customerId is missing from user data');
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
testAuthEndpoints();
