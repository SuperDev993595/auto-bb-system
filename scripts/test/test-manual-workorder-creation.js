const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api';

// Test data for manual work order creation
const testWorkOrderData = {
  customer: '507f1f77bcf86cd799439011', // Replace with actual customer ID
  vehicle: {
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    vin: '1HGBH41JXMN109186',
    licensePlate: 'ABC123',
    mileage: 50000
  },
  services: [
    {
      service: '507f1f77bcf86cd799439012', // Replace with actual service ID
      description: 'Oil change and filter replacement',
      laborHours: 1.5,
      laborRate: 100,
      parts: [
        {
          name: 'Oil Filter',
          partNumber: 'OF-123',
          quantity: 1,
          unitPrice: 15.99,
          totalPrice: 15.99,
          inStock: true
        },
        {
          name: 'Synthetic Oil',
          partNumber: 'SO-456',
          quantity: 5,
          unitPrice: 8.99,
          totalPrice: 44.95,
          inStock: true
        }
      ],
      totalCost: 160.94
    }
  ],
  technician: '507f1f77bcf86cd799439013', // Replace with actual technician ID
  priority: 'medium',
  estimatedStartDate: '2024-01-15',
  estimatedCompletionDate: '2024-01-15',
  notes: 'Customer requested synthetic oil change'
};

async function testManualWorkOrderCreation() {
  console.log('🧪 Testing Manual Work Order Creation...\n');

  // Check if JWT token is provided
  const jwtToken = process.env.JWT_TOKEN;
  if (!jwtToken) {
    console.log('❌ JWT_TOKEN environment variable is not set');
    console.log('\n💡 To run this test:');
    console.log('1. Get a valid JWT token by logging into the system');
    console.log('2. Set the environment variable:');
    console.log('   Windows: set JWT_TOKEN=your-jwt-token-here');
    console.log('   Linux/Mac: export JWT_TOKEN=your-jwt-token-here');
    console.log('3. Run the test again: node scripts/test/test-manual-workorder-creation.js');
    return;
  }

  try {
    // Step 1: Test server connectivity
    console.log('1. Testing server connectivity...');
    try {
      const healthResponse = await axios.get(`${BASE_URL}/health`);
      console.log('✅ Server is running');
    } catch (error) {
      console.log('❌ Server is not running or not accessible');
      console.log('💡 Make sure the backend server is running on http://localhost:5000');
      return;
    }

    // Step 2: Test authentication
    console.log('\n2. Testing authentication...');
    try {
      const authResponse = await axios.get(`${BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });
      console.log('✅ Authentication successful');
      console.log(`👤 Logged in as: ${authResponse.data.data?.name || 'Unknown'}`);
    } catch (error) {
      console.log('❌ Authentication failed');
      console.log('💡 Check your JWT token and make sure it\'s valid');
      return;
    }

    // Step 3: Test data availability
    console.log('\n3. Checking required data...');
    
    // Check customers
    try {
      const customersResponse = await axios.get(`${BASE_URL}/customers`, {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      });
      const customers = customersResponse.data.data?.customers || [];
      console.log(`✅ Found ${customers.length} customers`);
      
      if (customers.length === 0) {
        console.log('⚠️  No customers found. Please create at least one customer first.');
        console.log('💡 You can create customers through the admin interface');
      } else {
        console.log('📋 Available customers:');
        customers.slice(0, 3).forEach(customer => {
          console.log(`   - ${customer.name} (${customer._id})`);
        });
        if (customers.length > 3) {
          console.log(`   ... and ${customers.length - 3} more`);
        }
      }
    } catch (error) {
      console.log('❌ Failed to fetch customers');
      console.log('💡 Error:', error.response?.data?.message || error.message);
    }

    // Check services
    try {
      const servicesResponse = await axios.get(`${BASE_URL}/services/catalog`, {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      });
      const services = servicesResponse.data.data?.services || [];
      console.log(`✅ Found ${services.length} services`);
      
      if (services.length === 0) {
        console.log('⚠️  No services found. Please create at least one service first.');
        console.log('💡 You can create services through the admin interface');
      } else {
        console.log('🔧 Available services:');
        services.slice(0, 3).forEach(service => {
          console.log(`   - ${service.name} (${service._id})`);
        });
        if (services.length > 3) {
          console.log(`   ... and ${services.length - 3} more`);
        }
      }
    } catch (error) {
      console.log('❌ Failed to fetch services');
      console.log('💡 Error:', error.response?.data?.message || error.message);
    }

    // Check technicians
    try {
      const techniciansResponse = await axios.get(`${BASE_URL}/services/technicians`, {
        headers: { 'Authorization': `Bearer ${jwtToken}` }
      });
      const technicians = techniciansResponse.data.data?.technicians || [];
      console.log(`✅ Found ${technicians.length} technicians`);
      
      if (technicians.length === 0) {
        console.log('⚠️  No technicians found. Please create at least one technician first.');
        console.log('💡 You can create technicians through the admin interface');
      } else {
        console.log('👨‍🔧 Available technicians:');
        technicians.slice(0, 3).forEach(technician => {
          console.log(`   - ${technician.name} (${technician._id})`);
        });
        if (technicians.length > 3) {
          console.log(`   ... and ${technicians.length - 3} more`);
        }
      }
    } catch (error) {
      console.log('❌ Failed to fetch technicians');
      console.log('💡 Error:', error.response?.data?.message || error.message);
    }

    // Step 4: Test work order creation with real data
    console.log('\n4. Testing work order creation...');
    
    // Get first available customer, service, and technician
    try {
      const [customersRes, servicesRes, techniciansRes] = await Promise.all([
        axios.get(`${BASE_URL}/customers`, { headers: { 'Authorization': `Bearer ${jwtToken}` } }),
        axios.get(`${BASE_URL}/services/catalog`, { headers: { 'Authorization': `Bearer ${jwtToken}` } }),
        axios.get(`${BASE_URL}/services/technicians`, { headers: { 'Authorization': `Bearer ${jwtToken}` } })
      ]);

      const customers = customersRes.data.data?.customers || [];
      const services = servicesRes.data.data?.services || [];
      const technicians = techniciansRes.data.data?.technicians || [];

      if (customers.length === 0 || services.length === 0) {
        console.log('❌ Cannot test work order creation - missing required data');
        console.log('💡 Please create at least one customer and one service first');
        return;
      }

      // Use first available customer and service
      const testData = {
        ...testWorkOrderData,
        customer: customers[0]._id,
        services: [{
          ...testWorkOrderData.services[0],
          service: services[0]._id
        }],
        technician: technicians.length > 0 ? technicians[0]._id : ''
      };

      console.log('📝 Using test data:');
      console.log(`   Customer: ${customers[0].name}`);
      console.log(`   Service: ${services[0].name}`);
      if (technicians.length > 0) {
        console.log(`   Technician: ${technicians[0].name}`);
      }

      const createResponse = await axios.post(`${BASE_URL}/services/workorders`, testData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        }
      });

      if (createResponse.data.success) {
        console.log('✅ Work order created successfully!');
        console.log('📋 Work Order Number:', createResponse.data.data.workOrder.workOrderNumber);
        console.log('💰 Total Cost:', `$${createResponse.data.data.workOrder.totalCost}`);
        console.log('👤 Customer:', createResponse.data.data.workOrder.customer.name);
        console.log('🚗 Vehicle:', `${createResponse.data.data.workOrder.vehicle.year} ${createResponse.data.data.workOrder.vehicle.make} ${createResponse.data.data.workOrder.vehicle.model}`);
        
        const workOrderId = createResponse.data.data.workOrder._id;

        // Step 5: Test retrieving the created work order
        console.log('\n5. Testing work order retrieval...');
        const getResponse = await axios.get(`${BASE_URL}/services/workorders/${workOrderId}`, {
          headers: { 'Authorization': `Bearer ${jwtToken}` }
        });

        if (getResponse.data.success) {
          console.log('✅ Work order retrieved successfully!');
          console.log('📊 Status:', getResponse.data.data.workOrder.status);
          console.log('⚡ Priority:', getResponse.data.data.workOrder.priority);
        }

        console.log('\n🎉 Manual work order creation test completed successfully!');
        console.log('\n📝 Summary:');
        console.log('- ✅ Server connectivity');
        console.log('- ✅ Authentication');
        console.log('- ✅ Data availability');
        console.log('- ✅ Work order creation');
        console.log('- ✅ Work order retrieval');

      } else {
        console.log('❌ Failed to create work order:', createResponse.data.message);
      }

    } catch (error) {
      console.log('❌ Work order creation failed');
      console.log('💡 Error:', error.response?.data?.message || error.message);
      
      if (error.response?.status === 400) {
        console.log('\n🔍 Validation errors:');
        if (error.response.data.errors) {
          error.response.data.errors.forEach(err => {
            console.log(`   - ${err.field}: ${err.message}`);
          });
        }
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Authentication failed. Check your JWT token.');
    } else if (error.response?.status === 404) {
      console.log('\n💡 API endpoint not found. Check if the server is running.');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Cannot connect to server. Make sure the backend is running on http://localhost:5000');
    }
  }
}

// Run the test
if (require.main === module) {
  testManualWorkOrderCreation();
}

module.exports = { testManualWorkOrderCreation };
