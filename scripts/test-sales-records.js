const mongoose = require('mongoose');
const SalesRecord = require('../server/models/SalesRecord');
const Customer = require('../server/models/Customer');
require('dotenv').config();

async function testSalesRecords() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create a test customer
    const testCustomer = new Customer({
      name: 'Test Customer',
      email: 'test@example.com',
      phone: '555-1234',
      businessName: 'Test Business',
      status: 'active'
    });
    await testCustomer.save();
    console.log('Created test customer:', testCustomer._id);

    // Create a test sales record
    const testSalesRecord = new SalesRecord({
      customer: testCustomer._id,
      salesType: 'service',
      items: [{
        name: 'Oil Change',
        description: 'Full synthetic oil change',
        quantity: 1,
        unitPrice: 45.00,
        totalPrice: 45.00
      }],
      subtotal: 45.00,
      tax: 3.60,
      discount: 0,
      total: 48.60,
      paymentStatus: 'paid',
      salesSource: 'walk_in',
      status: 'completed',
      salesPerson: testCustomer._id, // Using customer ID as sales person for test
      createdBy: testCustomer._id
    });
    await testSalesRecord.save();
    console.log('Created test sales record:', testSalesRecord.recordNumber);

    // Test fetching sales records
    const salesRecords = await SalesRecord.find({}).populate('customer', 'name email');
    console.log('All sales records:', salesRecords.length);
    salesRecords.forEach(record => {
      console.log(`- ${record.recordNumber}: ${record.customer.name} - $${record.total}`);
    });

    // Test sales statistics
    const stats = await SalesRecord.getSalesStats(
      new Date(new Date().getFullYear(), 0, 1), // Start of year
      new Date() // Today
    );
    console.log('Sales statistics:', stats);

    // Clean up test data
    await SalesRecord.findByIdAndDelete(testSalesRecord._id);
    await Customer.findByIdAndDelete(testCustomer._id);
    console.log('Cleaned up test data');

    console.log('Sales Records test completed successfully!');
  } catch (error) {
    console.error('Error testing sales records:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testSalesRecords();
