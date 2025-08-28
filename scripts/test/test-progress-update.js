const axios = require('axios');
const { WorkOrder } = require('../../server/models/Service');

const BASE_URL = 'http://localhost:5000/api';
const TEST_TOKEN = 'your-test-token-here'; // Replace with actual test token

const testWorkOrderData = {
  customer: '507f1f77bcf86cd799439011', // Replace with actual customer ID
  vehicle: {
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    vin: '1HGBH41JXMN109186',
    licensePlate: 'TEST123',
    mileage: 50000
  },
  services: [{
    service: '507f1f77bcf86cd799439012', // Replace with actual service ID
    description: 'Oil change and inspection',
    laborHours: 1,
    laborRate: 100,
    parts: [],
    totalCost: 100
  }],
  priority: 'medium',
  estimatedStartDate: new Date().toISOString(),
  estimatedCompletionDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  notes: 'Test work order for progress update',
  customerNotes: 'Customer requested quick service'
};

async function testProgressUpdate() {
  console.log('🧪 Testing Work Order Progress Update Functionality\n');

  try {
    // Step 1: Create a test work order
    console.log('1. Creating test work order...');
    const createResponse = await axios.post(`${BASE_URL}/services/workorders`, testWorkOrderData, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });

    if (!createResponse.data.success) {
      throw new Error('Failed to create work order');
    }

    const workOrderId = createResponse.data.data.workOrder._id;
    console.log(`✅ Work order created: ${workOrderId}`);

    // Step 2: Start the work order
    console.log('\n2. Starting work order...');
    const startResponse = await axios.put(`${BASE_URL}/services/workorders/${workOrderId}/start`, {
      technicianId: '507f1f77bcf86cd799439013' // Replace with actual technician ID
    }, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });

    if (!startResponse.data.success) {
      throw new Error('Failed to start work order');
    }

    console.log('✅ Work order started successfully');

    // Step 3: Update progress to 25%
    console.log('\n3. Updating progress to 25%...');
    const progress25Response = await axios.put(`${BASE_URL}/services/workorders/${workOrderId}/progress`, {
      progress: 25,
      notes: 'Initial inspection completed'
    }, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });

    if (!progress25Response.data.success) {
      throw new Error('Failed to update progress to 25%');
    }

    console.log('✅ Progress updated to 25%');

    // Step 4: Update progress to 75%
    console.log('\n4. Updating progress to 75%...');
    const progress75Response = await axios.put(`${BASE_URL}/services/workorders/${workOrderId}/progress`, {
      progress: 75,
      notes: 'Main work completed, final checks pending'
    }, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });

    if (!progress75Response.data.success) {
      throw new Error('Failed to update progress to 75%');
    }

    console.log('✅ Progress updated to 75%');

    // Step 5: Update progress to 100% (should auto-complete)
    console.log('\n5. Updating progress to 100% (should auto-complete)...');
    const progress100Response = await axios.put(`${BASE_URL}/services/workorders/${workOrderId}/progress`, {
      progress: 100,
      notes: 'All work completed successfully'
    }, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });

    if (!progress100Response.data.success) {
      throw new Error('Failed to update progress to 100%');
    }

    console.log('✅ Progress updated to 100% and work order auto-completed');

    // Step 6: Verify final state
    console.log('\n6. Verifying final work order state...');
    const finalResponse = await axios.get(`${BASE_URL}/services/workorders/${workOrderId}`, {
      headers: { Authorization: `Bearer ${TEST_TOKEN}` }
    });

    if (!finalResponse.data.success) {
      throw new Error('Failed to get final work order state');
    }

    const finalWorkOrder = finalResponse.data.data.workOrder;
    console.log(`📊 Final Status: ${finalWorkOrder.status}`);
    console.log(`📊 Final Progress: ${finalWorkOrder.progress}%`);
    console.log(`📊 Notes: ${finalWorkOrder.notes}`);

    // Step 7: Clean up
    console.log('\n7. Cleaning up test data...');
    await WorkOrder.findByIdAndDelete(workOrderId);
    console.log('✅ Test work order deleted');

    console.log('\n🎉 All progress update tests passed successfully!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  console.log('🚀 Starting Progress Update Test...\n');
  testProgressUpdate();
}

module.exports = { testProgressUpdate };
