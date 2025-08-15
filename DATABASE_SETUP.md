# Database Setup Guide

This guide will help you set up the MongoDB database and collections for the Auto Repair CRM system.

## Prerequisites

### Option 1: Install MongoDB Locally

1. **Download MongoDB Community Server**:
   - Go to [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Download MongoDB Community Server for Windows
   - Run the installer and follow the setup wizard

2. **Start MongoDB Service**:
   ```bash
   # MongoDB should start automatically as a Windows service
   # To check if it's running, open Command Prompt and run:
   net start MongoDB
   ```

3. **Verify Installation**:
   ```bash
   mongod --version
   ```

### Option 2: Use MongoDB Atlas (Cloud)

1. **Create MongoDB Atlas Account**:
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster

2. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

3. **Set Environment Variable**:
   ```bash
   # Create a .env file in the root directory
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/auto-repair-crm
   ```

## Database Setup

### Step 1: Install Dependencies

Make sure all dependencies are installed:

```bash
npm install
```

### Step 2: Run Database Setup Script

The setup script will create all necessary collections and sample data:

```bash
npm run setup-db
```

### Step 3: Verify Setup

The script will output a summary like this:

```
🎉 Database setup completed successfully!

📋 Summary:
- Database: auto-repair-crm
- Collections created: 9
- Users created: 2 (Super Admin + Sub Admin)
- Services created: 5
- Inventory items created: 3
- System settings: 1

🔑 Default Login Credentials:
Super Admin: admin@autocrm.com / admin123
Sub Admin: subadmin@autocrm.com / admin123

🚀 You can now start the application!
```

## Database Collections

The setup script creates the following collections:

### 1. **users**
- Stores user accounts (Super Admin, Sub Admin)
- Fields: name, email, password, role, phone, avatar, isActive, etc.

### 2. **customers**
- Stores customer information
- Fields: businessName, contactPerson, email, phone, address, vehicles, status, etc.

### 3. **appointments**
- Stores appointment bookings
- Fields: customer, service, technician, scheduledDate, status, etc.

### 4. **services**
- Stores service catalog
- Fields: name, description, category, price, duration, etc.

### 5. **tasks**
- Stores task management
- Fields: title, description, assignedTo, priority, status, dueDate, etc.

### 6. **inventoryitems**
- Stores inventory management
- Fields: name, description, category, sku, price, cost, quantity, etc.

### 7. **invoices**
- Stores invoice management
- Fields: customer, items, subtotal, tax, total, status, etc.

### 8. **reminders**
- Stores reminder system
- Fields: customer, type, title, message, scheduledDate, status, etc.

### 9. **systemsettings**
- Stores system configuration
- Fields: companyName, companyEmail, businessHours, taxRate, etc.

## Sample Data

The setup script creates the following sample data:

### Services (5 items)
- Oil Change - $45.00
- Brake Service - $150.00
- Engine Diagnostic - $75.00
- Tire Rotation - $35.00
- AC Service - $120.00

### Inventory Items (3 items)
- Motor Oil 5W-30 - $8.99
- Oil Filter - $12.99
- Brake Pads - $45.99

### Users (2 accounts)
- **Super Admin**: admin@autocrm.com / admin123
- **Sub Admin**: subadmin@autocrm.com / admin123

## Environment Variables

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/auto-repair-crm

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Server Configuration
PORT=3001
NODE_ENV=development
```

## Troubleshooting

### MongoDB Connection Issues

1. **Check if MongoDB is running**:
   ```bash
   net start MongoDB
   ```

2. **Check MongoDB port**:
   ```bash
   netstat -an | findstr 27017
   ```

3. **Test connection**:
   ```bash
   mongosh mongodb://localhost:27017
   ```

### Permission Issues

1. **Run as Administrator**:
   - Right-click Command Prompt
   - Select "Run as administrator"

2. **Check MongoDB service**:
   ```bash
   services.msc
   # Find "MongoDB" service and ensure it's running
   ```

### Database Reset

To reset the database and start fresh:

```bash
npm run setup-db
```

This will clear all existing data and recreate the collections with sample data.

## Next Steps

After successful database setup:

1. **Start the application**:
   ```bash
   npm run dev:full
   ```

2. **Access the application**:
   - Frontend: http://localhost:5174
   - Backend API: http://localhost:3001

3. **Login with default credentials**:
   - Email: admin@autocrm.com
   - Password: admin123

## Support

If you encounter any issues:

1. Check the console output for error messages
2. Verify MongoDB is running and accessible
3. Check your environment variables
4. Ensure all dependencies are installed

For additional help, refer to the main README.md file or create an issue in the project repository.
