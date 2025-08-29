const mongoose = require('mongoose');

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auto-repair-crm';

// Import models
const SalesRecord = require('../server/models/SalesRecord');
const Customer = require('../server/models/Customer');
const User = require('../server/models/User');
const { InventoryItem } = require('../server/models/Inventory');
const { ServiceCatalog } = require('../server/models/Service');

// Sample sales records data
const sampleSalesRecords = [
  {
    recordNumber: 'SR-202401-0001',
    // Oil Change Service
    salesType: 'service',
    items: [
      {
        name: 'Full Synthetic Oil Change',
        description: 'Premium full synthetic oil change with filter replacement',
        category: 'Maintenance',
        quantity: 1,
        unitPrice: 89.99,
        totalPrice: 89.99
      }
    ],
    subtotal: 89.99,
    tax: 9.00,
    discount: 0,
    total: 98.99,
    paymentStatus: 'paid',
    paymentMethod: 'credit_card',
    paymentDate: new Date('2024-01-15'),
    paymentReference: 'TXN-CC-001234',
    salesSource: 'walk_in',
    convertedFromLead: false,
    status: 'completed',
    saleDate: new Date('2024-01-15'),
    completionDate: new Date('2024-01-15'),
    notes: 'Customer requested full synthetic oil. Vehicle in good condition.',
    nextFollowUp: new Date('2024-04-15'),
    followUpStatus: 'scheduled',
    customerSatisfaction: {
      rating: 5,
      feedback: 'Excellent service, very professional staff',
      date: new Date('2024-01-16')
    },
    warranty: {
      hasWarranty: true,
      warrantyPeriod: 12,
      warrantyExpiry: new Date('2025-01-15'),
      warrantyNotes: '12-month warranty on parts and labor'
    }
  },
  {
    recordNumber: 'SR-202401-0002',
    // Brake Service Package
    salesType: 'package',
    items: [
      {
        name: 'Front Brake Pad Replacement',
        description: 'Premium ceramic brake pads with hardware',
        category: 'Brakes',
        quantity: 1,
        unitPrice: 189.99,
        totalPrice: 189.99
      },
      {
        name: 'Brake Rotor Resurfacing',
        description: 'Machine resurfacing of front brake rotors',
        category: 'Brakes',
        quantity: 2,
        unitPrice: 45.00,
        totalPrice: 90.00
      },
      {
        name: 'Brake Fluid Flush',
        description: 'Complete brake fluid replacement',
        category: 'Brakes',
        quantity: 1,
        unitPrice: 79.99,
        totalPrice: 79.99
      }
    ],
    subtotal: 359.98,
    tax: 36.00,
    discount: 25.00,
    total: 370.98,
    paymentStatus: 'paid',
    paymentMethod: 'debit_card',
    paymentDate: new Date('2024-01-20'),
    paymentReference: 'TXN-DC-001235',
    salesSource: 'phone',
    convertedFromLead: true,
    originalLeadId: null,
    status: 'completed',
    saleDate: new Date('2024-01-20'),
    completionDate: new Date('2024-01-21'),
    notes: 'Customer reported brake noise. Complete brake service performed.',
    nextFollowUp: new Date('2024-07-20'),
    followUpStatus: 'scheduled',
    customerSatisfaction: {
      rating: 4,
      feedback: 'Good service, brakes feel much better now',
      date: new Date('2024-01-22')
    },
    warranty: {
      hasWarranty: true,
      warrantyPeriod: 24,
      warrantyExpiry: new Date('2026-01-20'),
      warrantyNotes: '24-month warranty on brake pads and labor'
    }
  },
  {
    recordNumber: 'SR-202402-0001',
    // Tire Purchase and Installation
    salesType: 'product',
    items: [
      {
        name: 'Michelin Defender T+H All-Season Tires',
        description: '215/55R17 98V All-Season Passenger Tire',
        category: 'Tires',
        quantity: 4,
        unitPrice: 145.99,
        totalPrice: 583.96
      },
      {
        name: 'Tire Mounting and Balancing',
        description: 'Professional tire mounting and balancing service',
        category: 'Service',
        quantity: 4,
        unitPrice: 25.00,
        totalPrice: 100.00
      }
    ],
    subtotal: 683.96,
    tax: 68.40,
    discount: 50.00,
    total: 702.36,
    paymentStatus: 'paid',
    paymentMethod: 'bank_transfer',
    paymentDate: new Date('2024-02-05'),
    paymentReference: 'BT-2024-001',
    salesSource: 'online',
    convertedFromLead: false,
    status: 'completed',
    saleDate: new Date('2024-02-05'),
    completionDate: new Date('2024-02-06'),
    notes: 'Customer ordered tires online. Installation completed next day.',
    nextFollowUp: new Date('2024-08-05'),
    followUpStatus: 'scheduled',
    customerSatisfaction: {
      rating: 5,
      feedback: 'Perfect service! Tires are great and installation was quick.',
      date: new Date('2024-02-07')
    },
    warranty: {
      hasWarranty: true,
      warrantyPeriod: 60,
      warrantyExpiry: new Date('2029-02-05'),
      warrantyNotes: '5-year treadwear warranty, 3-year road hazard protection'
    }
  },
  {
    recordNumber: 'SR-202402-0002',
    // Diagnostic Service
    salesType: 'service',
    items: [
      {
        name: 'Engine Diagnostic Scan',
        description: 'Comprehensive engine diagnostic with code reading',
        category: 'Diagnostics',
        quantity: 1,
        unitPrice: 89.99,
        totalPrice: 89.99
      }
    ],
    subtotal: 89.99,
    tax: 9.00,
    discount: 0,
    total: 98.99,
    paymentStatus: 'partial',
    paymentMethod: 'cash',
    paymentDate: new Date('2024-02-10'),
    paymentReference: 'CASH-001',
    salesSource: 'walk_in',
    convertedFromLead: false,
    status: 'completed',
    saleDate: new Date('2024-02-10'),
    completionDate: new Date('2024-02-10'),
    notes: 'Customer paid $50 cash, remaining $48.99 to be paid later.',
    nextFollowUp: new Date('2024-02-17'),
    followUpStatus: 'overdue',
    customerSatisfaction: {
      rating: 3,
      feedback: 'Service was okay, but expensive for just checking codes',
      date: new Date('2024-02-11')
    },
    warranty: {
      hasWarranty: false,
      warrantyPeriod: null,
      warrantyExpiry: null,
      warrantyNotes: ''
    }
  },
  {
    recordNumber: 'SR-202402-0003',
    // Battery Replacement
    salesType: 'product',
    items: [
      {
        name: 'Optima RedTop Battery',
        description: 'High-performance AGM battery, 34/78 series',
        category: 'Battery',
        quantity: 1,
        unitPrice: 189.99,
        totalPrice: 189.99
      },
      {
        name: 'Battery Installation',
        description: 'Professional battery installation and testing',
        category: 'Service',
        quantity: 1,
        unitPrice: 25.00,
        totalPrice: 25.00
      }
    ],
    subtotal: 214.99,
    tax: 21.50,
    discount: 0,
    total: 236.49,
    paymentStatus: 'paid',
    paymentMethod: 'check',
    paymentDate: new Date('2024-02-20'),
    paymentReference: 'CHECK-001',
    salesSource: 'phone',
    convertedFromLead: false,
    status: 'completed',
    saleDate: new Date('2024-02-20'),
    completionDate: new Date('2024-02-20'),
    notes: 'Customer called ahead. Battery was dead, replaced immediately.',
    nextFollowUp: new Date('2024-08-20'),
    followUpStatus: 'scheduled',
    customerSatisfaction: {
      rating: 5,
      feedback: 'Fast service, car started right up!',
      date: new Date('2024-02-21')
    },
    warranty: {
      hasWarranty: true,
      warrantyPeriod: 36,
      warrantyExpiry: new Date('2027-02-20'),
      warrantyNotes: '3-year free replacement warranty'
    }
  }
];

async function generateSampleSalesRecords() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing sales records
    await SalesRecord.deleteMany({});
    console.log('Cleared existing sales records');

    // Get sample customers, users, and items for references
    const customers = await Customer.find().limit(10);
    const users = await User.find({ role: { $in: ['staff', 'admin', 'super_admin'] } }).limit(5);
    const inventoryItems = await InventoryItem.find().limit(20);
    const services = await ServiceCatalog.find().limit(15);

    if (customers.length === 0) {
      console.log('No customers found. Please run generate-sample-customers.js first.');
      return;
    }

    if (users.length === 0) {
      console.log('No users found. Please ensure you have staff/admin users in the database.');
      return;
    }

    console.log(`Found ${customers.length} customers, ${users.length} users, ${inventoryItems.length} inventory items, ${services.length} services`);

    // Generate sales records with proper references
    const salesRecordsToInsert = sampleSalesRecords.map((record, index) => {
      const customer = customers[index % customers.length];
      const salesPerson = users[index % users.length];
      const createdBy = users[index % users.length];

      return {
        ...record,
        customer: customer._id,
        salesPerson: salesPerson._id,
        createdBy: createdBy._id,
        // Add inventory/service references where appropriate
        items: record.items.map(item => {
          // Try to find matching inventory item or service
          const matchingInventory = inventoryItems.find(inv => 
            inv.name.toLowerCase().includes(item.name.toLowerCase().split(' ')[0])
          );
          const matchingService = services.find(service => 
            service.name.toLowerCase().includes(item.name.toLowerCase().split(' ')[0])
          );

          return {
            ...item,
            inventoryItem: matchingInventory ? matchingInventory._id : undefined,
            service: matchingService ? matchingService._id : undefined
          };
        })
      };
    });

    // Insert sales records
    const insertedRecords = await SalesRecord.insertMany(salesRecordsToInsert);
    console.log(`Successfully created ${insertedRecords.length} sample sales records`);

    // Display summary
    console.log('\n=== Sample Sales Records Summary ===');
    console.log(`Total records created: ${insertedRecords.length}`);
    
    const totalRevenue = insertedRecords.reduce((sum, record) => sum + record.total, 0);
    console.log(`Total revenue: $${totalRevenue.toFixed(2)}`);
    
    const avgSaleValue = totalRevenue / insertedRecords.length;
    console.log(`Average sale value: $${avgSaleValue.toFixed(2)}`);
    
    const paidRecords = insertedRecords.filter(record => record.paymentStatus === 'paid');
    console.log(`Paid records: ${paidRecords.length}/${insertedRecords.length}`);
    
    const pendingRecords = insertedRecords.filter(record => record.paymentStatus === 'pending');
    console.log(`Pending records: ${pendingRecords.length}/${insertedRecords.length}`);

    console.log('\nSample sales records created successfully!');

  } catch (error) {
    console.error('Error generating sample sales records:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  generateSampleSalesRecords();
}

module.exports = { generateSampleSalesRecords };