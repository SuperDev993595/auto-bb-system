const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/auto-repair-crm', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

// User schema for migration
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  permissions: mongoose.Schema.Types.Mixed,
  isActive: Boolean,
  lastLogin: Date,
  phone: String,
  avatar: String,
  createdBy: mongoose.Schema.Types.ObjectId
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Migration function
const migrateUserRoles = async () => {
  try {
    console.log('🔄 Starting user role migration...');
    
    // Find all users with old roles
    const usersToMigrate = await User.find({
      role: { $in: ['super_admin', 'sub_admin'] }
    });
    
    console.log(`📊 Found ${usersToMigrate.length} users to migrate`);
    
    if (usersToMigrate.length === 0) {
      console.log('✅ No users need migration');
      return;
    }
    
    // Update each user
    for (const user of usersToMigrate) {
      const oldRole = user.role;
      const newRole = 'admin'; // Convert both super_admin and sub_admin to admin
      
      await User.updateOne(
        { _id: user._id },
        { 
          $set: { 
            role: newRole,
            permissions: ['admin_access'] // Update permissions to match new role
          }
        }
      );
      
      console.log(`✅ Migrated user ${user.email}: ${oldRole} → ${newRole}`);
    }
    
    console.log('🎉 User role migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
};

// Run migration
const runMigration = async () => {
  await connectDB();
  await migrateUserRoles();
  await mongoose.connection.close();
  console.log('🔌 Database connection closed');
  process.exit(0);
};

runMigration();
