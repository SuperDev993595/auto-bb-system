const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const TEST_CUSTOMER_ID = '507f1f77bcf86cd799439011'; // Replace with actual customer ID
const TEST_SERVICE_ID = '507f1f77bcf86cd799439012'; // Replace with actual service ID
const TEST_TECHNICIAN_ID = '507f1f77bcf86cd799439013'; // Replace with actual technician ID

// Test data for manual work order creation
const testWorkOrderData = {
  customer: TEST_CUSTOMER_ID,
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
      service: TEST_SERVICE_ID,
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
  technician: TEST_TECHNICIAN_ID,
  status: 'pending',
  priority: 'medium',
  estimatedStartDate: '2024-01-15',
  estimatedCompletionDate: '2024-01-15',
  notes: 'Customer requested synthetic oil change',
  customerNotes: 'Please check tire pressure and top off fluids'
};

async function testManualWorkOrderCreation() {
  console.log('🧪 Testing Manual Work Order Creation...\n');

  try {
    // Step 1: Test creating a work order
    console.log('1. Creating manual work order...');
    const createResponse = await axios.post(`${BASE_URL}/services/workorders`, testWorkOrderData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.JWT_TOKEN || 'your-jwt-token-here'}`
      }
    });

    if (createResponse.data.success) {
      console.log('✅ Work order created successfully!');
      console.log('📋 Work Order Number:', createResponse.data.data.workOrder.workOrderNumber);
      console.log('💰 Total Cost:', `$${createResponse.data.data.workOrder.totalCost}`);
      console.log('👤 Customer:', createResponse.data.data.workOrder.customer.name);
      console.log('🚗 Vehicle:', `${createResponse.data.data.workOrder.vehicle.year} ${createResponse.data.data.workOrder.vehicle.make} ${createResponse.data.data.workOrder.vehicle.model}`);
      
      const workOrderId = createResponse.data.data.workOrder._id;

      // Step 2: Test retrieving the created work order
      console.log('\n2. Retrieving created work order...');
      const getResponse = await axios.get(`${BASE_URL}/services/workorders/${workOrderId}`, {
        headers: {
          'Authorization': `Bearer ${process.env.JWT_TOKEN || 'your-jwt-token-here'}`
        }
      });

      if (getResponse.data.success) {
        console.log('✅ Work order retrieved successfully!');
        console.log('📊 Status:', getResponse.data.data.workOrder.status);
        console.log('⚡ Priority:', getResponse.data.data.workOrder.priority);
      }

      // Step 3: Test updating the work order
      console.log('\n3. Updating work order...');
      const updateData = {
        status: 'in_progress',
        priority: 'high',
        notes: 'Work started - oil change in progress'
      };

      const updateResponse = await axios.put(`${BASE_URL}/services/workorders/${workOrderId}`, updateData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.JWT_TOKEN || 'your-jwt-token-here'}`
        }
      });

      if (updateResponse.data.success) {
        console.log('✅ Work order updated successfully!');
        console.log('📊 New Status:', updateResponse.data.data.workOrder.status);
        console.log('⚡ New Priority:', updateResponse.data.data.workOrder.priority);
      }

      // Step 4: Test work order list retrieval
      console.log('\n4. Retrieving work orders list...');
      const listResponse = await axios.get(`${BASE_URL}/services/workorders`, {
        headers: {
          'Authorization': `Bearer ${process.env.JWT_TOKEN || 'your-jwt-token-here'}`
        }
      });

      if (listResponse.data.success) {
        console.log('✅ Work orders list retrieved successfully!');
        console.log('📊 Total Work Orders:', listResponse.data.data.workOrders.length);
        
        // Find our created work order in the list
        const createdWorkOrder = listResponse.data.data.workOrders.find(
          wo => wo._id === workOrderId
        );
        
        if (createdWorkOrder) {
          console.log('✅ Created work order found in list!');
          console.log('📋 Work Order Number:', createdWorkOrder.workOrderNumber);
        }
      }

      // Step 5: Test work order statistics
      console.log('\n5. Retrieving work order statistics...');
      const statsResponse = await axios.get(`${BASE_URL}/services/workorders/stats`, {
        headers: {
          'Authorization': `Bearer ${process.env.JWT_TOKEN || 'your-jwt-token-here'}`
        }
      });

      if (statsResponse.data.success) {
        console.log('✅ Work order statistics retrieved successfully!');
        console.log('📊 Total Work Orders:', statsResponse.data.data.totalWorkOrders);
        console.log('⏳ Pending:', statsResponse.data.data.pendingCount);
        console.log('🔄 In Progress:', statsResponse.data.data.inProgressCount);
        console.log('✅ Completed:', statsResponse.data.data.completedCount);
      }

      console.log('\n🎉 All manual work order creation tests passed!');
      console.log('\n📝 Summary:');
      console.log('- ✅ Work order creation');
      console.log('- ✅ Work order retrieval');
      console.log('- ✅ Work order update');
      console.log('- ✅ Work order listing');
      console.log('- ✅ Work order statistics');

    } else {
      console.log('❌ Failed to create work order:', createResponse.data.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.message || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Tip: Make sure to set a valid JWT_TOKEN environment variable');
      console.log('   Example: JWT_TOKEN=your-jwt-token-here node test-manual-workorder-creation.js');
    }
    
    if (error.response?.status === 400) {
      console.log('\n💡 Tip: Check that the test customer, service, and technician IDs exist in your database');
    }
  }
}

// Run the test
if (require.main === module) {
  testManualWorkOrderCreation();
}

module.exports = { testManualWorkOrderCreation };
