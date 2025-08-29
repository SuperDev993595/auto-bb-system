const mongoose = require('mongoose');
const Customer = require('../server/models/Customer');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/auto-repair-crm', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');
  
  try {
    // Clear existing customers
    await Customer.deleteMany({});
    console.log('Cleared existing customers');
    
    // Create sample customers
    const sampleCustomers = [
      {
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1-555-0101',
        address: {
          street: '123 Main Street',
          city: 'Springfield',
          state: 'IL',
          zipCode: '62701',
          country: 'USA'
        },
        dateOfBirth: new Date('1985-03-15'),
        emergencyContact: {
          name: 'Jane Smith',
          relationship: 'Spouse',
          phone: '+1-555-0102'
        },
        preferences: {
          preferredContactMethod: 'email',
          marketingOptIn: true,
          serviceReminders: true
        },
        notes: 'Regular customer, prefers morning appointments'
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+1-555-0202',
        address: {
          street: '456 Oak Avenue',
          city: 'Riverside',
          state: 'CA',
          zipCode: '92501',
          country: 'USA'
        },
        dateOfBirth: new Date('1990-07-22'),
        emergencyContact: {
          name: 'Mike Johnson',
          relationship: 'Brother',
          phone: '+1-555-0203'
        },
        preferences: {
          preferredContactMethod: 'phone',
          marketingOptIn: false,
          serviceReminders: true
        },
        notes: 'New customer, interested in premium services'
      },
      {
        name: 'Michael Chen',
        email: 'michael.chen@email.com',
        phone: '+1-555-0303',
        address: {
          street: '789 Pine Street',
          city: 'Austin',
          state: 'TX',
          zipCode: '73301',
          country: 'USA'
        },
        dateOfBirth: new Date('1988-11-08'),
        emergencyContact: {
          name: 'Lisa Chen',
          relationship: 'Sister',
          phone: '+1-555-0304'
        },
        preferences: {
          preferredContactMethod: 'email',
          marketingOptIn: true,
          serviceReminders: true
        },
        notes: 'Business professional, needs flexible scheduling'
      },
      {
        name: 'Emily Davis',
        email: 'emily.davis@email.com',
        phone: '+1-555-0404',
        address: {
          street: '321 Elm Street',
          city: 'Portland',
          state: 'OR',
          zipCode: '97201',
          country: 'USA'
        },
        dateOfBirth: new Date('1992-04-12'),
        emergencyContact: {
          name: 'Robert Davis',
          relationship: 'Father',
          phone: '+1-555-0405'
        },
        preferences: {
          preferredContactMethod: 'text',
          marketingOptIn: false,
          serviceReminders: true
        },
        notes: 'Student, budget-conscious, prefers basic services'
      },
      {
        name: 'David Wilson',
        email: 'david.wilson@email.com',
        phone: '+1-555-0505',
        address: {
          street: '654 Maple Drive',
          city: 'Denver',
          state: 'CO',
          zipCode: '80201',
          country: 'USA'
        },
        dateOfBirth: new Date('1983-09-30'),
        emergencyContact: {
          name: 'Patricia Wilson',
          relationship: 'Wife',
          phone: '+1-555-0506'
        },
        preferences: {
          preferredContactMethod: 'phone',
          marketingOptIn: true,
          serviceReminders: true
        },
        notes: 'Fleet manager, interested in enterprise solutions'
      }
    ];
    
    // Insert the customers
    const createdCustomers = await Customer.insertMany(sampleCustomers);
    console.log(`Successfully created ${createdCustomers.length} sample customers:`);
    
    createdCustomers.forEach(customer => {
      console.log(`- ${customer.name} (${customer.email})`);
      console.log(`  Phone: ${customer.phone}`);
      console.log(`  Location: ${customer.address.city}, ${customer.address.state}`);
      console.log(`  Preferences: ${customer.preferences.preferredContactMethod} contact, marketing: ${customer.preferences.marketingOptIn ? 'Yes' : 'No'}`);
      console.log('');
    });
    
    console.log('Sample customers generation completed successfully!');
    
  } catch (error) {
    console.error('Error generating sample customers:', error);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
});
