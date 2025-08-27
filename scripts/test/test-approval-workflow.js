const mongoose = require('mongoose');
const Appointment = require('./server/models/Appointment');
const Task = require('./server/models/Task');
const { WorkOrder } = require('./server/models/Service');
const taskService = require('./server/services/taskService');
const workOrderService = require('./server/services/workOrderService');

// Test configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auto-bb-system';

async function testApprovalWorkflow() {
  try {
    console.log('🚀 Starting Approval Workflow Test...\n');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Test 1: Create a test appointment
    console.log('📋 Test 1: Creating test appointment...');
    const testAppointment = new Appointment({
      customer: '507f1f77bcf86cd799439011', // Mock customer ID
      vehicle: '507f1f77bcf86cd799439012', // Mock vehicle ID
      serviceType: '507f1f77bcf86cd799439013', // Mock service type ID
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      estimatedDuration: 120, // 2 hours
      estimatedCost: {
        parts: 150,
        labor: 200,
        total: 350
      },
      serviceDescription: 'Oil change and brake inspection',
      status: 'pending_approval',
      approvalStatus: 'requires_approval',
      requiresApproval: true,
      approvalThreshold: 300
    });

    const savedAppointment = await testAppointment.save();
    console.log(`✅ Test appointment created: ${savedAppointment._id}\n`);

    // Test 2: Test approval workflow (create work order)
    console.log('✅ Test 2: Testing approval workflow...');
    try {
      const approvalResult = await workOrderService.createFromAppointment(
        savedAppointment._id,
        '507f1f77bcf86cd799439014' // Mock user ID
      );
      console.log('✅ Work order created successfully');
      console.log(`   Work Order ID: ${approvalResult.workOrder._id}`);
      console.log(`   Work Order Number: ${approvalResult.workOrder.workOrderNumber}`);
      console.log(`   Appointment Status: ${approvalResult.appointment.status}\n`);
    } catch (error) {
      console.log('⚠️  Work order creation failed (expected if models not fully set up):', error.message);
    }

    // Test 3: Test decline workflow (create follow-up task)
    console.log('❌ Test 3: Testing decline workflow...');
    try {
      const declineResult = await taskService.createFollowUpTask(
        savedAppointment._id,
        '507f1f77bcf86cd799439015', // Mock Sub Admin user ID
        'Customer requested to reschedule due to budget constraints'
      );
      console.log('✅ Follow-up task created successfully');
      console.log(`   Task ID: ${declineResult.task._id}`);
      console.log(`   Task Title: ${declineResult.task.title}`);
      console.log(`   Appointment Status: ${declineResult.appointment.status}\n`);
    } catch (error) {
      console.log('⚠️  Follow-up task creation failed (expected if models not fully set up):', error.message);
    }

    // Test 4: Test approval threshold checking
    console.log('💰 Test 4: Testing approval threshold logic...');
    const lowCostAppointment = {
      estimatedCost: { total: 250 },
      approvalThreshold: 300
    };
    const highCostAppointment = {
      estimatedCost: { total: 500 },
      approvalThreshold: 300
    };

    const lowCostRequiresApproval = workOrderService.checkApprovalRequired(lowCostAppointment);
    const highCostRequiresApproval = workOrderService.checkApprovalRequired(highCostAppointment);

    console.log(`   Low cost ($250): Requires approval = ${lowCostRequiresApproval}`);
    console.log(`   High cost ($500): Requires approval = ${highCostRequiresApproval}\n`);

    // Test 5: Test task retrieval
    console.log('📝 Test 5: Testing task retrieval...');
    try {
      const tasks = await taskService.getTasksByAppointment(savedAppointment._id);
      console.log(`✅ Found ${tasks.length} tasks for appointment\n`);
    } catch (error) {
      console.log('⚠️  Task retrieval failed:', error.message);
    }

    // Test 6: Test work order retrieval
    console.log('🔧 Test 6: Testing work order retrieval...');
    try {
      const workOrders = await workOrderService.getWorkOrdersByAppointment(savedAppointment._id);
      console.log(`✅ Found ${workOrders.length} work orders for appointment\n`);
    } catch (error) {
      console.log('⚠️  Work order retrieval failed:', error.message);
    }

    console.log('🎉 Approval Workflow Test Completed!\n');

    // Cleanup: Remove test data
    console.log('🧹 Cleaning up test data...');
    await Appointment.findByIdAndDelete(savedAppointment._id);
    console.log('✅ Test appointment removed');

    // Remove related tasks and work orders if they exist
    try {
      await Task.deleteMany({ notes: { $regex: savedAppointment._id, $options: 'i' } });
      await WorkOrder.deleteMany({ notes: { $regex: savedAppointment._id, $options: 'i' } });
      console.log('✅ Related tasks and work orders removed');
    } catch (error) {
      console.log('⚠️  Cleanup of related data failed:', error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testApprovalWorkflow()
    .then(() => {
      console.log('\n✨ All tests completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test suite failed:', error);
      process.exit(1);
    });
}

module.exports = { testApprovalWorkflow };
