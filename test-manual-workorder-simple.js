const axios = require('axios');

console.log('🧪 Simple Manual Work Order Creation Test\n');

// Check if JWT token is provided
const jwtToken = process.env.JWT_TOKEN;
if (!jwtToken) {
  console.log('❌ JWT_TOKEN environment variable is not set');
  console.log('\n💡 To run this test:');
  console.log('1. Get a valid JWT token by logging into the system');
  console.log('2. Set the environment variable:');
  console.log('   Windows: set JWT_TOKEN=your-jwt-token-here');
  console.log('   Linux/Mac: export JWT_TOKEN=your-jwt-token-here');
  console.log('3. Run the test again: node test-manual-workorder-simple.js');
  process.exit(1);
}

async function testWorkOrderCreation() {
  try {
    // Test server connectivity
    console.log('1. Testing server connectivity...');
    await axios.get('http://localhost:5000/api/health');
    console.log('✅ Server is running\n');

    // Test authentication
    console.log('2. Testing authentication...');
    const authResponse = await axios.get('http://localhost:5000/api/auth/me', {
      headers: { 'Authorization': `Bearer ${jwtToken}` }
    });
    console.log(`✅ Authenticated as: ${authResponse.data.data?.name || 'Unknown'}\n`);

    // Get available data
    console.log('3. Getting available data...');
    const [customersRes, servicesRes] = await Promise.all([
      axios.get('http://localhost:5000/api/customers', { headers: { 'Authorization': `Bearer ${jwtToken}` } }),
      axios.get('http://localhost:5000/api/services/catalog', { headers: { 'Authorization': `Bearer ${jwtToken}` } })
    ]);

    const customers = customersRes.data.data?.customers || [];
    const services = servicesRes.data.data?.services || [];

    if (customers.length === 0 || services.length === 0) {
      console.log('❌ Missing required data');
      console.log(`   Customers: ${customers.length}`);
      console.log(`   Services: ${services.length}`);
      console.log('💡 Please create at least one customer and one service first');
      return;
    }

    console.log(`✅ Found ${customers.length} customers and ${services.length} services\n`);

    // Create test work order
    console.log('4. Creating test work order...');
    const testData = {
      customer: customers[0]._id,
      vehicle: {
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        vin: 'TEST123456789',
        licensePlate: 'TEST123',
        mileage: 50000
      },
      services: [{
        service: services[0]._id,
        description: 'Test service',
        laborHours: 1.0,
        laborRate: 100,
        parts: [],
        totalCost: 100
      }],
      technician: '',
      priority: 'medium',
      estimatedStartDate: '2024-01-15',
      estimatedCompletionDate: '2024-01-15',
      notes: 'Test work order'
    };

    const createResponse = await axios.post('http://localhost:5000/api/services/workorders', testData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`
      }
    });

    if (createResponse.data.success) {
      console.log('✅ Work order created successfully!');
      console.log(`📋 Work Order Number: ${createResponse.data.data.workOrder.workOrderNumber}`);
      console.log(`💰 Total Cost: $${createResponse.data.data.workOrder.totalCost}`);
      console.log(`👤 Customer: ${createResponse.data.data.workOrder.customer.name}`);
      console.log(`🚗 Vehicle: ${createResponse.data.data.workOrder.vehicle.year} ${createResponse.data.data.workOrder.vehicle.make} ${createResponse.data.data.workOrder.vehicle.model}`);
      
      console.log('\n🎉 Manual work order creation test PASSED!');
    } else {
      console.log('❌ Failed to create work order:', createResponse.data.message);
    }

  } catch (error) {
    console.log('❌ Test failed:', error.response?.data?.message || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Cannot connect to server. Make sure the backend is running on http://localhost:5000');
    } else if (error.response?.status === 401) {
      console.log('\n💡 Authentication failed. Check your JWT token.');
    }
  }
}

testWorkOrderCreation();
