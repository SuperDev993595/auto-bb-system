const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auto-repair-crm';

// Import actual models from the project
const User = require('../server/models/User');
const Customer = require('../server/models/Customer');
const Vehicle = require('../server/models/Vehicle');
const Appointment = require('../server/models/Appointment');
const Task = require('../server/models/Task');
const Promotion = require('../server/models/Promotion');
const SMS = require('../server/models/SMS');
const SMSTemplate = require('../server/models/SMSTemplate');
const Invoice = require('../server/models/Invoice');
const Reminder = require('../server/models/Reminder');
const { ServiceCatalog, WorkOrder, Technician } = require('../server/models/Service');
const { InventoryItem } = require('../server/models/Inventory');

// Sample data for ServiceCatalog (matching the actual schema)
const sampleServiceCatalogs = [
  {
    name: 'Oil Change',
    description: 'Complete oil change service with premium synthetic oil and filter replacement',
    category: 'maintenance',
    estimatedDuration: 30, // 30 minutes
    laborRate: 75, // $75/hour
    parts: [
      {
        name: 'Synthetic Oil 5W-30',
        partNumber: 'OIL-5W30-001',
        quantity: 1,
        unitPrice: 25.00,
        totalPrice: 25.00,
        inStock: true
      },
      {
        name: 'Oil Filter',
        partNumber: 'FILTER-OIL-001',
        quantity: 1,
        unitPrice: 12.99,
        totalPrice: 12.99,
        inStock: true
      }
    ],
    isActive: true
  },
  {
    name: 'Brake Service',
    description: 'Complete brake pad replacement and brake system inspection',
    category: 'repair',
    estimatedDuration: 120, // 2 hours
    laborRate: 75,
    parts: [
      {
        name: 'Ceramic Brake Pads (Front)',
        partNumber: 'BRAKE-PADS-FRONT-001',
        quantity: 1,
        unitPrice: 45.99,
        totalPrice: 45.99,
        inStock: true
      },
      {
        name: 'Brake Fluid',
        partNumber: 'BRAKE-FLUID-001',
        quantity: 1,
        unitPrice: 8.99,
        totalPrice: 8.99,
        inStock: true
      }
    ],
    isActive: true
  },
  {
    name: 'Engine Diagnostic',
    description: 'Computer diagnostic scan and comprehensive engine analysis',
    category: 'diagnostic',
    estimatedDuration: 45, // 45 minutes
    laborRate: 75,
    parts: [],
    isActive: true
  },
  {
    name: 'Tire Rotation & Balance',
    description: 'Tire rotation and balance service for optimal performance',
    category: 'maintenance',
    estimatedDuration: 30,
    laborRate: 75,
    parts: [],
    isActive: true
  },
  {
    name: 'AC Service & Recharge',
    description: 'Air conditioning system service and refrigerant recharge',
    category: 'repair',
    estimatedDuration: 90, // 1.5 hours
    laborRate: 75,
    parts: [
      {
        name: 'AC Refrigerant',
        partNumber: 'AC-REF-001',
        quantity: 1,
        unitPrice: 35.00,
        totalPrice: 35.00,
        inStock: true
      }
    ],
    isActive: true
  },
  {
    name: 'Battery Replacement',
    description: 'Battery replacement and charging system test',
    category: 'repair',
    estimatedDuration: 20,
    laborRate: 75,
    parts: [
      {
        name: 'Car Battery',
        partNumber: 'BATTERY-001',
        quantity: 1,
        unitPrice: 89.99,
        totalPrice: 89.99,
        inStock: true
      }
    ],
    isActive: true
  }
];

// Sample data for Technicians
const sampleTechnicians = [
  {
    name: 'Mike Johnson',
    email: 'mike.johnson@autocrm.com',
    phone: '(555) 123-4567',
    hourlyRate: 75,
    specializations: ['engine repair', 'diagnostics', 'electrical systems'],
    certifications: [
      {
        name: 'ASE Master Technician',
        issuingAuthority: 'ASE',
        issueDate: new Date('2020-01-15'),
        expiryDate: new Date('2025-01-15')
      }
    ],
    isActive: true
  },
  {
    name: 'Sarah Williams',
    email: 'sarah.williams@autocrm.com',
    phone: '(555) 123-4568',
    hourlyRate: 70,
    specializations: ['brake systems', 'suspension', 'maintenance'],
    certifications: [
      {
        name: 'ASE Brake Systems',
        issuingAuthority: 'ASE',
        issueDate: new Date('2019-06-20'),
        expiryDate: new Date('2024-06-20')
      }
    ],
    isActive: true
  },
  {
    name: 'David Chen',
    email: 'david.chen@autocrm.com',
    phone: '(555) 123-4569',
    hourlyRate: 65,
    specializations: ['AC systems', 'heating', 'cooling'],
    certifications: [
      {
        name: 'EPA 609 Certification',
        issuingAuthority: 'EPA',
        issueDate: new Date('2021-03-10'),
        expiryDate: new Date('2026-03-10')
      }
    ],
    isActive: true
  }
];

// Sample data for Inventory Items
const sampleInventoryItems = [
  {
    name: 'Motor Oil 5W-30 Synthetic',
    description: 'Premium synthetic motor oil 5W-30 grade for modern engines',
    category: 'fluids',
    sku: 'OIL-5W30-001',
    partNumber: 'OIL-5W30-001',
    brand: 'Premium Oil Co.',
    manufacturer: 'Premium Oil Co.',
    unit: 'liter',
    costPrice: 6.50,
    sellingPrice: 8.99,
    currentStock: 50,
    minimumStock: 10,
    maximumStock: 100,
    location: {
      warehouse: 'Main Warehouse',
      shelf: 'A1',
      bin: 'B01'
    },
    supplier: {
      name: 'Oil Supplier Co.',
      contact: 'John Supplier',
      email: 'john@oilsupplier.com',
      phone: '(555) 111-1111'
    },
    isActive: true
  },
  {
    name: 'Oil Filter Premium',
    description: 'High-quality oil filter compatible with most vehicles',
    category: 'engine_parts',
    sku: 'FILTER-OIL-001',
    partNumber: 'FILTER-OIL-001',
    brand: 'FilterPro',
    manufacturer: 'FilterPro Industries',
    unit: 'piece',
    costPrice: 8.00,
    sellingPrice: 12.99,
    currentStock: 30,
    minimumStock: 5,
    maximumStock: 50,
    location: {
      warehouse: 'Main Warehouse',
      shelf: 'A2',
      bin: 'B02'
    },
    supplier: {
      name: 'Filter Supply Inc.',
      contact: 'Sarah Filter',
      email: 'sarah@filtersupply.com',
      phone: '(555) 222-2222'
    },
    isActive: true
  },
  {
    name: 'Ceramic Brake Pads Set',
    description: 'Premium ceramic brake pads for smooth, quiet braking',
    category: 'brake_system',
    sku: 'BRAKE-PADS-001',
    partNumber: 'BRAKE-PADS-001',
    brand: 'BrakeMaster',
    manufacturer: 'BrakeMaster Corp',
    unit: 'set',
    costPrice: 28.00,
    sellingPrice: 45.99,
    currentStock: 20,
    minimumStock: 5,
    maximumStock: 40,
    location: {
      warehouse: 'Main Warehouse',
      shelf: 'B1',
      bin: 'C01'
    },
    supplier: {
      name: 'Brake Parts Co.',
      contact: 'Mike Brake',
      email: 'mike@brakeparts.com',
      phone: '(555) 333-3333'
    },
    isActive: true
  },
  {
    name: 'Air Filter High Performance',
    description: 'High-performance air filter for improved engine efficiency',
    category: 'engine_parts',
    sku: 'FILTER-AIR-001',
    partNumber: 'FILTER-AIR-001',
    brand: 'AirFlow',
    manufacturer: 'AirFlow Systems',
    unit: 'piece',
    costPrice: 10.00,
    sellingPrice: 15.99,
    currentStock: 25,
    minimumStock: 5,
    maximumStock: 50,
    location: {
      warehouse: 'Main Warehouse',
      shelf: 'A3',
      bin: 'B03'
    },
    supplier: {
      name: 'Filter Supply Inc.',
      contact: 'Sarah Filter',
      email: 'sarah@filtersupply.com',
      phone: '(555) 222-2222'
    },
    isActive: true
  },
  {
    name: 'Brake Fluid DOT 4',
    description: 'High-performance brake fluid for modern braking systems',
    category: 'fluids',
    sku: 'BRAKE-FLUID-001',
    partNumber: 'BRAKE-FLUID-001',
    brand: 'BrakeFluid Pro',
    manufacturer: 'BrakeFluid Pro Inc',
    unit: 'liter',
    costPrice: 5.50,
    sellingPrice: 8.99,
    currentStock: 40,
    minimumStock: 8,
    maximumStock: 80,
    location: {
      warehouse: 'Main Warehouse',
      shelf: 'A1',
      bin: 'B04'
    },
    supplier: {
      name: 'Fluid Supply Co.',
      contact: 'David Fluid',
      email: 'david@fluidsupply.com',
      phone: '(555) 444-4444'
    },
    isActive: true
  }
];

// Sample data for Customers (individual customers, not business clients)
const sampleCustomers = [
  {
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 987-6543',
    businessName: '',
    address: {
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001'
    },
    preferences: {
      notifications: {
        email: true,
        sms: true,
        push: false
      },
      reminders: {
        appointments: true,
        maintenance: true,
        payments: true
      }
    },
    vehicles: [
      {
        year: 2020,
        make: 'Toyota',
        model: 'Camry',
        vin: '1HGBH41JXMN109187',
        licensePlate: 'ABC123',
        color: 'Silver',
        mileage: 45000,
        engineType: '2.5L 4-Cylinder',
        transmission: 'automatic',
        fuelType: 'gasoline',
        status: 'active',
        lastServiceDate: new Date('2024-01-15'),
        nextServiceDate: new Date('2024-07-15')
      }
    ],
    status: 'active'
  },
  {
    name: 'Mike Davis',
    email: 'mike.davis@email.com',
    phone: '(555) 987-6544',
    businessName: '',
    address: {
      street: '456 Oak Avenue',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210'
    },
    preferences: {
      notifications: {
        email: true,
        sms: false,
        push: true
      },
      reminders: {
        appointments: true,
        maintenance: true,
        payments: true
      }
    },
    vehicles: [
      {
        year: 2019,
        make: 'Honda',
        model: 'Accord',
        vin: '2T1BURHE0JC123457',
        licensePlate: 'XYZ789',
        color: 'Black',
        mileage: 38000,
        engineType: '1.5L Turbo',
        transmission: 'cvt',
        fuelType: 'gasoline',
        status: 'active',
        lastServiceDate: new Date('2024-02-20'),
        nextServiceDate: new Date('2024-08-20')
      },
      {
        year: 2021,
        make: 'Ford',
        model: 'Transit',
        vin: '3FTNW21F8XEA12346',
        licensePlate: 'XYZ790',
        color: 'White',
        mileage: 25000,
        engineType: '3.5L V6',
        transmission: 'automatic',
        fuelType: 'gasoline',
        status: 'active',
        lastServiceDate: new Date('2024-03-10'),
        nextServiceDate: new Date('2024-09-10')
      }
    ],
    status: 'active'
  }
];

async function setupDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Customer.deleteMany({});
    await Vehicle.deleteMany({});
    await Appointment.deleteMany({});
    await Task.deleteMany({});
    await Invoice.deleteMany({});
    await Reminder.deleteMany({});
    await ServiceCatalog.deleteMany({});
    await WorkOrder.deleteMany({});
    await Technician.deleteMany({});
    await InventoryItem.deleteMany({});

    // Create default Super Admin user
    console.log('👤 Creating default Super Admin user...');
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'admin@autocrm.com',
      password: 'admin123',
      role: 'super_admin',
      phone: '(555) 123-4567',
      permissions: [
        'customers',
        'appointments', 
        'marketing',
        'sales',
        'collections',
        'tasks',
        'reports',
        'users',
        'system_admin'
      ],
      isActive: true
    });
    console.log('✅ Super Admin user created:', superAdmin.email);

    // Create default Sub Admin user
    console.log('👤 Creating default Sub Admin user...');
    const subAdmin = await User.create({
      name: 'Sub Admin',
      email: 'subadmin@autocrm.com',
      password: 'admin123',
      role: 'admin',
      phone: '(555) 123-4568',
      permissions: [
        'customers',
        'appointments', 
        'marketing',
        'sales',
        'collections',
        'tasks',
        'reports'
      ],
      isActive: true
    });
    console.log('✅ Sub Admin user created:', subAdmin.email);

    // Create default Customer user
    console.log('👤 Creating default Customer user...');
    const customerUser = await User.create({
      name: 'John Customer',
      email: 'customer@autocrm.com',
      password: 'customer123',
      role: 'customer',
      phone: '(555) 123-4569',
      permissions: ['customer_access'],
      isActive: true
    });
    console.log('✅ Customer user created:', customerUser.email);

    // Create corresponding Customer record
    console.log('👥 Creating Customer record for user...');
    const customerRecord = await Customer.create({
      name: 'John Customer',
      email: 'customer@autocrm.com',
      phone: '(555) 123-4569',
      businessName: '',
      userId: customerUser._id,
      status: 'active',
      preferences: {
        notifications: {
          email: true,
          sms: true,
          push: false
        },
        reminders: {
          appointments: true,
          maintenance: true,
          payments: true
        },
        privacy: {
          shareData: false,
          marketing: false
        }
      }
    });
    console.log('✅ Customer record created for user:', customerRecord._id);

    // Create sample service catalogs
    console.log('🔧 Creating sample service catalogs...');
    const serviceCatalogs = await ServiceCatalog.insertMany(sampleServiceCatalogs.map(service => ({
      ...service,
      createdBy: superAdmin._id
    })));
    console.log(`✅ Created ${serviceCatalogs.length} sample service catalogs`);

    // Create sample technicians
    console.log('👨‍🔧 Creating sample technicians...');
    const technicians = await Technician.insertMany(sampleTechnicians.map(tech => ({
      ...tech,
      createdBy: superAdmin._id
    })));
    console.log(`✅ Created ${technicians.length} sample technicians`);

    // Create sample inventory items
    console.log('📦 Creating sample inventory items...');
    const inventoryItems = await InventoryItem.insertMany(sampleInventoryItems.map(item => ({
      ...item,
      createdBy: superAdmin._id
    })));
    console.log(`✅ Created ${inventoryItems.length} sample inventory items`);

    // Create sample customers
    console.log('👥 Creating sample customers...');
    const customers = await Customer.insertMany(sampleCustomers.map(customer => {
      const { vehicles, ...customerData } = customer;
      return {
        ...customerData,
        createdBy: superAdmin._id
      };
    }));
    console.log(`✅ Created ${customers.length} sample customers`);

    // Create sample vehicles
    console.log('🚗 Creating sample vehicles...');
    const allVehicles = [];
    sampleCustomers.forEach((customer, index) => {
      if (customer.vehicles) {
        customer.vehicles.forEach(vehicle => {
          allVehicles.push({
            ...vehicle,
            customer: customers[index]._id,
            createdBy: superAdmin._id
          });
        });
      }
    });
    const vehicles = await Vehicle.insertMany(allVehicles);
    console.log(`✅ Created ${vehicles.length} sample vehicles`);

    // Create sample tasks
    console.log('📋 Creating sample tasks...');
    const sampleTasks = [
      {
        title: 'Follow up with ABC Auto Repair',
        description: 'Call to schedule next maintenance appointment',
        type: 'follow_up',
        assignedTo: subAdmin._id,
        assignedBy: superAdmin._id,
        customer: customers[0]._id,
        priority: 'medium',
        status: 'pending',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        estimatedDuration: 30,
        createdBy: superAdmin._id
      },
      {
        title: 'Review inventory levels',
        description: 'Check stock levels and reorder if necessary',
        type: 'other',
        assignedTo: superAdmin._id,
        assignedBy: superAdmin._id,
        priority: 'high',
        status: 'pending',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        estimatedDuration: 60,
        createdBy: superAdmin._id
      }
    ];
    const tasks = await Task.insertMany(sampleTasks);
    console.log(`✅ Created ${tasks.length} sample tasks`);

    // Create sample promotions
    console.log('🎯 Creating sample promotions...');
    const samplePromotions = [
      {
        title: 'Summer Oil Change Special',
        description: 'Get 20% off your oil change service during the hot summer months. Includes filter replacement and fluid top-off.',
        type: 'service',
        discountValue: 20,
        discountType: 'percentage',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2025-08-31'),
        status: 'active',
        targetAudience: 'All Customers',
        usageCount: 45,
        maxUsage: 100,
        conditions: 'Valid for synthetic oil only',
        createdBy: superAdmin._id
      },
      {
        title: 'Brake Safety Check',
        description: 'Free brake inspection with any service. Ensure your family\'s safety on the road.',
        type: 'service',
        discountValue: 0,
        discountType: 'fixed',
        startDate: new Date('2025-07-01'),
        endDate: new Date('2025-09-30'),
        status: 'active',
        targetAudience: 'All Customers',
        usageCount: 28,
        conditions: 'Must be combined with another service',
        createdBy: superAdmin._id
      },
      {
        title: 'Customer Referral Program',
        description: 'Refer a friend and both of you get $25 off your next service. The more you refer, the more you save!',
        type: 'referral',
        discountValue: 25,
        discountType: 'fixed',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31'),
        status: 'active',
        targetAudience: 'Existing Customers',
        usageCount: 15,
        conditions: 'Referred customer must complete service',
        createdBy: superAdmin._id
      },
      {
        title: 'Back to School Special',
        description: '15% off any service for students and teachers. Valid with student/teacher ID.',
        type: 'discount',
        discountValue: 15,
        discountType: 'percentage',
        startDate: new Date('2025-08-15'),
        endDate: new Date('2025-09-15'),
        status: 'scheduled',
        targetAudience: 'Students & Teachers',
        usageCount: 0,
        maxUsage: 50,
        conditions: 'Must present valid student or teacher ID',
        createdBy: superAdmin._id
      },
      {
        title: 'Winter Tire Installation',
        description: 'Free tire installation with purchase of 4 winter tires. Get ready for the cold season!',
        type: 'seasonal',
        discountValue: 80,
        discountType: 'fixed',
        startDate: new Date('2024-11-01'),
        endDate: new Date('2025-01-31'),
        status: 'ended',
        targetAudience: 'All Customers',
        usageCount: 32,
        maxUsage: 40,
        conditions: 'Must purchase 4 tires of same brand',
        createdBy: superAdmin._id
      }
    ];
    const promotions = await Promotion.insertMany(samplePromotions);
    console.log(`✅ Created ${promotions.length} sample promotions`);

    // Create sample SMS templates
    console.log('📱 Creating sample SMS templates...');
    const sampleSMSTemplates = [
      {
        name: 'Appointment Reminder',
        message: 'Hi {{customerName}}, your appointment is scheduled for {{appointmentDate}} at {{appointmentTime}}. Please arrive 10 minutes early. Reply STOP to unsubscribe.',
        variables: ['customerName', 'appointmentDate', 'appointmentTime'],
        category: 'appointment',
        description: 'Remind customers about upcoming appointments',
        usageCount: 45,
        isActive: true,
        createdBy: superAdmin._id
      },
      {
        name: 'Service Due Reminder',
        message: 'Hi {{customerName}}, your {{vehicleInfo}} is due for service. Current mileage: {{currentMileage}}. Call us to schedule: {{businessPhone}}.',
        variables: ['customerName', 'vehicleInfo', 'currentMileage', 'businessPhone'],
        category: 'reminder',
        description: 'Notify customers about service due',
        usageCount: 32,
        isActive: true,
        createdBy: superAdmin._id
      },
      {
        name: 'Payment Reminder',
        message: 'Hi {{customerName}}, payment for invoice #{{invoiceNumber}} is due on {{dueDate}}. Amount: ${{amount}}. Pay online: {{paymentLink}}.',
        variables: ['customerName', 'invoiceNumber', 'dueDate', 'amount', 'paymentLink'],
        category: 'notification',
        description: 'Remind customers about payment due',
        usageCount: 28,
        isActive: true,
        createdBy: superAdmin._id
      },
      {
        name: 'Service Completion',
        message: 'Hi {{customerName}}, your vehicle service is complete and ready for pickup. Total: ${{totalAmount}}. Thank you for choosing {{businessName}}!',
        variables: ['customerName', 'totalAmount', 'businessName'],
        category: 'notification',
        description: 'Notify customers when service is complete',
        usageCount: 19,
        isActive: true,
        createdBy: superAdmin._id
      },
      {
        name: 'Follow-up',
        message: 'Hi {{customerName}}, how was your recent service experience? We value your feedback. Call us: {{businessPhone}}.',
        variables: ['customerName', 'businessPhone'],
        category: 'custom',
        description: 'Follow up with customers after service',
        usageCount: 15,
        isActive: true,
        createdBy: superAdmin._id
      }
    ];
    const smsTemplates = await SMSTemplate.insertMany(sampleSMSTemplates);
    console.log(`✅ Created ${smsTemplates.length} sample SMS templates`);

    // Create sample SMS records
    console.log('📨 Creating sample SMS records...');
    const sampleSMSRecords = [
      {
        to: '+1234567890',
        message: 'Hi John, your appointment is confirmed for tomorrow at 2 PM.',
        status: 'delivered',
        priority: 'normal',
        sentAt: new Date(Date.now() - 3600000),
        deliveredAt: new Date(Date.now() - 3500000),
        provider: 'mock',
        providerMessageId: 'msg_1234567890_abc123',
        cost: 0.05,
        isActive: true,
        createdBy: superAdmin._id
      },
      {
        to: '+1234567891',
        message: 'Service reminder: Your vehicle is due for oil change.',
        status: 'sent',
        priority: 'normal',
        sentAt: new Date(Date.now() - 7200000),
        provider: 'mock',
        providerMessageId: 'msg_1234567891_def456',
        cost: 0.05,
        isActive: true,
        createdBy: superAdmin._id
      },
      {
        to: '+1234567892',
        message: 'Payment reminder: Invoice #1234 is due on 2025-01-15.',
        status: 'failed',
        priority: 'high',
        sentAt: new Date(Date.now() - 10800000),
        errorMessage: 'Invalid phone number',
        provider: 'mock',
        cost: 0,
        isActive: true,
        createdBy: superAdmin._id
      },
      {
        to: '+1234567893',
        message: 'Your vehicle service is complete and ready for pickup. Total: $150. Thank you!',
        status: 'delivered',
        priority: 'normal',
        sentAt: new Date(Date.now() - 14400000),
        deliveredAt: new Date(Date.now() - 14300000),
        provider: 'mock',
        providerMessageId: 'msg_1234567893_ghi789',
        cost: 0.05,
        isActive: true,
        createdBy: superAdmin._id
      },
      {
        to: '+1234567894',
        message: 'How was your recent service experience? We value your feedback. Call us: 555-0123.',
        status: 'delivered',
        priority: 'low',
        sentAt: new Date(Date.now() - 18000000),
        deliveredAt: new Date(Date.now() - 17900000),
        provider: 'mock',
        providerMessageId: 'msg_1234567894_jkl012',
        cost: 0.05,
        isActive: true,
        createdBy: superAdmin._id
      }
    ];
    const smsRecords = await SMS.insertMany(sampleSMSRecords);
    console.log(`✅ Created ${smsRecords.length} sample SMS records`);

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Database: ${mongoose.connection.name}`);
    console.log(`- Collections created: 10`);
    console.log(`- Users created: 3 (Super Admin + Sub Admin + Customer)`);
    console.log(`- Service Catalogs created: ${serviceCatalogs.length}`);
    console.log(`- Technicians created: ${technicians.length}`);
    console.log(`- Inventory items created: ${inventoryItems.length}`);
    console.log(`- Customers created: ${customers.length}`);
    console.log(`- Vehicles created: ${vehicles.length}`);
    console.log(`- Tasks created: ${tasks.length}`);
    console.log(`- Promotions created: ${promotions.length}`);
    console.log(`- SMS Templates created: ${smsTemplates.length}`);
    console.log(`- SMS Records created: ${smsRecords.length}`);
    
    console.log('\n🔑 Default Login Credentials:');
    console.log('Super Admin: admin@autocrm.com / admin123');
    console.log('Sub Admin: subadmin@autocrm.com / admin123');
    console.log('Customer: customer@autocrm.com / customer123');

    console.log('\n🚀 You can now start the application!');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the setup
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase;
