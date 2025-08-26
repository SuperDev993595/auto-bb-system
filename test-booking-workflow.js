// Test script for Booking & Communication Workflow
const mongoose = require('mongoose');
const Appointment = require('./server/models/Appointment');
const Customer = require('./server/models/Customer');
const Vehicle = require('./server/models/Vehicle');
const appointmentCommunicationService = require('./server/services/appointmentCommunicationService');

// Test configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auto-repair-system';

async function testBookingWorkflow() {
  try {
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create test customer
    const testCustomer = new Customer({
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1234567890',
      status: 'active'
    });
    await testCustomer.save();
    console.log('Test customer created:', testCustomer._id);

    // Create test vehicle
    const testVehicle = new Vehicle({
      year: 2020,
      make: 'Toyota',
      model: 'Camry',
      vin: 'TEST1234567890123',
      licensePlate: 'TEST123',
      color: 'Silver',
      mileage: 50000,
      customer: testCustomer._id
    });
    await testVehicle.save();
    console.log('Test vehicle created:', testVehicle._id);

    // Create test appointment with new workflow fields
    const testAppointment = new Appointment({
      customer: testCustomer._id,
      vehicle: testVehicle._id,
      serviceType: '507f1f77bcf86cd799439011', // Mock service type ID
      serviceDescription: 'Oil Change',
      scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      scheduledTime: '10:00',
      estimatedDuration: 60,
      status: 'scheduled',
      priority: 'medium',
      createdBy: '507f1f77bcf86cd799439012', // Mock user ID
      // NEW: Booking & Communication Workflow Fields
      bookingSource: 'customer_portal',
      customerConcerns: 'Engine making strange noise, needs oil change',
      preferredContact: 'both',
      reminderSettings: {
        send24hReminder: true,
        send2hReminder: true,
        sendSameDayReminder: true,
        preferredChannel: 'both'
      }
    });
    await testAppointment.save();
    console.log('Test appointment created:', testAppointment._id);

    // Test appointment confirmation
    console.log('\n--- Testing Appointment Confirmation ---');
    try {
      const confirmationResult = await appointmentCommunicationService.sendAppointmentConfirmation(
        testAppointment._id, 
        '507f1f77bcf86cd799439012'
      );
      console.log('Confirmation result:', confirmationResult);
    } catch (error) {
      console.error('Confirmation test failed:', error.message);
    }

    // Test appointment reminders
    console.log('\n--- Testing Appointment Reminders ---');
    try {
      const reminderResult = await appointmentCommunicationService.generateAppointmentReminders();
      console.log('Reminder result:', reminderResult);
    } catch (error) {
      console.error('Reminder test failed:', error.message);
    }

    // Clean up test data
    console.log('\n--- Cleaning up test data ---');
    await Appointment.findByIdAndDelete(testAppointment._id);
    await Vehicle.findByIdAndDelete(testVehicle._id);
    await Customer.findByIdAndDelete(testCustomer._id);
    console.log('Test data cleaned up');

    console.log('\n✅ Booking workflow test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the test
testBookingWorkflow();
