const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auto-repair-crm';

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'sub_admin'], default: 'sub_admin' },
  phone: String,
  avatar: String,
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Customer Schema
const customerSchema = new mongoose.Schema({
  businessName: { type: String, required: true },
  contactPerson: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  vehicles: [{
    make: String,
    model: String,
    year: Number,
    vin: String,
    licensePlate: String,
    color: String
  }],
  status: { type: String, enum: ['active', 'inactive', 'prospect'], default: 'active' },
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Appointment Schema
const appointmentSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  technician: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  scheduledDate: { type: Date, required: true },
  estimatedDuration: Number,
  status: { type: String, enum: ['scheduled', 'in-progress', 'completed', 'cancelled'], default: 'scheduled' },
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Service Schema
const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: { type: String, required: true },
  price: { type: Number, required: true },
  duration: Number, // in minutes
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Task Schema
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  status: { type: String, enum: ['pending', 'in-progress', 'completed', 'cancelled'], default: 'pending' },
  dueDate: Date,
  completedAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Inventory Item Schema
const inventoryItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: { type: String, required: true },
  sku: { type: String, unique: true },
  price: { type: Number, required: true },
  cost: { type: Number, required: true },
  quantity: { type: Number, default: 0 },
  minQuantity: { type: Number, default: 0 },
  supplier: String,
  location: String,
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Invoice Schema
const invoiceSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  items: [{
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
    description: String,
    quantity: { type: Number, default: 1 },
    price: { type: Number, required: true },
    total: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  tax: { type: Number, default: 0 },
  total: { type: Number, required: true },
  status: { type: String, enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'], default: 'draft' },
  dueDate: Date,
  paidDate: Date,
  notes: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Reminder Schema
const reminderSchema = new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  type: { type: String, enum: ['appointment', 'payment', 'follow-up', 'maintenance'], required: true },
  title: { type: String, required: true },
  message: String,
  scheduledDate: { type: Date, required: true },
  status: { type: String, enum: ['pending', 'sent', 'cancelled'], default: 'pending' },
  sentAt: Date,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// System Settings Schema
const systemSettingsSchema = new mongoose.Schema({
  companyName: { type: String, default: 'Auto Repair Pro' },
  companyEmail: { type: String, default: 'info@autorepairpro.com' },
  companyPhone: { type: String, default: '(555) 123-4567' },
  companyAddress: { type: String, default: '123 Auto Street, City, State 12345' },
  businessHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String }
  },
  taxRate: { type: Number, default: 0.08 },
  currency: { type: String, default: 'USD' },
  timezone: { type: String, default: 'America/New_York' },
  updatedAt: { type: Date, default: Date.now }
});

// Create models
const User = mongoose.model('User', userSchema);
const Customer = mongoose.model('Customer', customerSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);
const Service = mongoose.model('Service', serviceSchema);
const Task = mongoose.model('Task', taskSchema);
const InventoryItem = mongoose.model('InventoryItem', inventoryItemSchema);
const Invoice = mongoose.model('Invoice', invoiceSchema);
const Reminder = mongoose.model('Reminder', reminderSchema);
const SystemSettings = mongoose.model('SystemSettings', systemSettingsSchema);

// Sample data
const sampleServices = [
  {
    name: 'Oil Change',
    description: 'Complete oil change service with filter replacement',
    category: 'Maintenance',
    price: 45.00,
    duration: 30
  },
  {
    name: 'Brake Service',
    description: 'Brake pad replacement and brake system inspection',
    category: 'Repair',
    price: 150.00,
    duration: 120
  },
  {
    name: 'Engine Diagnostic',
    description: 'Computer diagnostic scan and engine analysis',
    category: 'Diagnostic',
    price: 75.00,
    duration: 45
  },
  {
    name: 'Tire Rotation',
    description: 'Tire rotation and balance service',
    category: 'Maintenance',
    price: 35.00,
    duration: 30
  },
  {
    name: 'AC Service',
    description: 'Air conditioning system service and recharge',
    category: 'Repair',
    price: 120.00,
    duration: 90
  }
];

const sampleInventoryItems = [
  {
    name: 'Motor Oil 5W-30',
    description: 'Synthetic motor oil 5W-30 grade',
    category: 'Fluids',
    sku: 'OIL-5W30-001',
    price: 8.99,
    cost: 6.50,
    quantity: 50,
    minQuantity: 10,
    supplier: 'Oil Supplier Co.',
    location: 'Storage A'
  },
  {
    name: 'Oil Filter',
    description: 'Premium oil filter for most vehicles',
    category: 'Filters',
    sku: 'FILTER-OIL-001',
    price: 12.99,
    cost: 8.00,
    quantity: 30,
    minQuantity: 5,
    supplier: 'Filter Supply Inc.',
    location: 'Storage B'
  },
  {
    name: 'Brake Pads',
    description: 'Ceramic brake pads set',
    category: 'Brakes',
    sku: 'BRAKE-PADS-001',
    price: 45.99,
    cost: 28.00,
    quantity: 20,
    minQuantity: 5,
    supplier: 'Brake Parts Co.',
    location: 'Storage C'
  }
];

async function setupDatabase() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB successfully!');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Customer.deleteMany({});
    await Appointment.deleteMany({});
    await Service.deleteMany({});
    await Task.deleteMany({});
    await InventoryItem.deleteMany({});
    await Invoice.deleteMany({});
    await Reminder.deleteMany({});
    await SystemSettings.deleteMany({});

    // Create default Super Admin user
    console.log('👤 Creating default Super Admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'admin@autocrm.com',
      password: hashedPassword,
      role: 'super_admin',
      phone: '(555) 123-4567',
      isActive: true
    });
    console.log('✅ Super Admin user created:', superAdmin.email);

    // Create default Sub Admin user
    console.log('👤 Creating default Sub Admin user...');
    const subAdmin = await User.create({
      name: 'Sub Admin',
      email: 'subadmin@autocrm.com',
      password: hashedPassword,
      role: 'sub_admin',
      phone: '(555) 123-4568',
      isActive: true
    });
    console.log('✅ Sub Admin user created:', subAdmin.email);

    // Create sample services
    console.log('🔧 Creating sample services...');
    const services = await Service.insertMany(sampleServices.map(service => ({
      ...service,
      createdBy: superAdmin._id
    })));
    console.log(`✅ Created ${services.length} sample services`);

    // Create sample inventory items
    console.log('📦 Creating sample inventory items...');
    const inventoryItems = await InventoryItem.insertMany(sampleInventoryItems.map(item => ({
      ...item,
      createdBy: superAdmin._id
    })));
    console.log(`✅ Created ${inventoryItems.length} sample inventory items`);

    // Create system settings
    console.log('⚙️ Creating system settings...');
    const systemSettings = await SystemSettings.create({
      companyName: 'Auto Repair Pro',
      companyEmail: 'info@autorepairpro.com',
      companyPhone: '(555) 123-4567',
      companyAddress: '123 Auto Street, City, State 12345',
      businessHours: {
        monday: { open: '08:00', close: '18:00' },
        tuesday: { open: '08:00', close: '18:00' },
        wednesday: { open: '08:00', close: '18:00' },
        thursday: { open: '08:00', close: '18:00' },
        friday: { open: '08:00', close: '18:00' },
        saturday: { open: '09:00', close: '17:00' },
        sunday: { open: 'Closed', close: 'Closed' }
      },
      taxRate: 0.08,
      currency: 'USD',
      timezone: 'America/New_York'
    });
    console.log('✅ System settings created');

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`- Database: ${mongoose.connection.name}`);
    console.log(`- Collections created: 9`);
    console.log(`- Users created: 2 (Super Admin + Sub Admin)`);
    console.log(`- Services created: ${services.length}`);
    console.log(`- Inventory items created: ${inventoryItems.length}`);
    console.log(`- System settings: 1`);
    
    console.log('\n🔑 Default Login Credentials:');
    console.log('Super Admin: admin@autocrm.com / admin123');
    console.log('Sub Admin: subadmin@autocrm.com / admin123');

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
