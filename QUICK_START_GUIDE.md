# QUICK START GUIDE - AUTO REPAIR SERVICE CRM

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd auto-bb-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/auto-repair-crm
   
   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   
   # Server
   PORT=3001
   NODE_ENV=development
   
   # Email (for later)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   
   # Frontend URL
   FRONTEND_URL=http://localhost:5173
   ```

4. **Start the development server**
   ```bash
   # Start both frontend and backend
   npm run dev:full
   
   # Or start them separately:
   # Backend only
   npm run server
   
   # Frontend only
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - API Health Check: http://localhost:3001/api/health

## 📋 What's Already Implemented

### ✅ Completed Features
- **Authentication System**: JWT-based login/logout with role-based access
- **User Management**: Super Admin and Sub Admin roles with permissions
- **Database Models**: User, Customer, and Task models with full schemas
- **Backend API**: Express server with Socket.io for real-time features
- **Customer Management**: Full CRUD operations with filtering and pagination
- **Security**: Password hashing, input validation, rate limiting

### 🔄 In Progress
- Task management routes
- Appointment scheduling system
- Marketing and sales modules

### 📝 Next Steps

#### Immediate Actions (This Week)
1. **Create the remaining backend routes**:
   - Task management routes
   - Appointment routes
   - Marketing routes
   - Sales routes
   - Collections routes

2. **Set up the frontend authentication**:
   - Update the existing login page
   - Create user management interface
   - Implement role-based UI rendering

3. **Connect frontend to backend**:
   - Set up API client
   - Implement authentication flow
   - Create protected routes

#### Week 2 Goals
1. **Complete core CRM features**:
   - Customer management UI
   - Task management interface
   - Basic dashboard with progress bars

2. **Implement basic reporting**:
   - Daily activity summaries
   - Customer statistics
   - Task completion tracking

#### Week 3 Goals
1. **Advanced features**:
   - PDF report generation
   - Email integration
   - File upload system

2. **YellowPages integration**:
   - Business search functionality
   - Data extraction and storage

## 🛠 Development Commands

```bash
# Development
npm run dev:full          # Start both frontend and backend
npm run dev               # Start frontend only
npm run server            # Start backend only

# Building
npm run build             # Build for production
npm run preview           # Preview production build

# Database
# Make sure MongoDB is running locally or update MONGODB_URI in .env
```

## 📁 Project Structure

```
auto-bb-system/
├── src/                    # Frontend React code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── redux/             # State management
│   └── utils/             # Utility functions
├── server/                # Backend Node.js code
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   └── config/            # Configuration files
├── public/                # Static files
└── package.json           # Dependencies and scripts
```

## 🔐 Default Super Admin Account

After setting up the database, you'll need to create a Super Admin account. You can do this by:

1. **Using the API directly**:
   ```bash
   curl -X POST http://localhost:3001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Super Admin",
       "email": "admin@example.com",
       "password": "password123",
       "role": "super_admin"
     }'
   ```

2. **Or create a seed script** (recommended):
   Create `server/scripts/seed.js` to automatically create the Super Admin account.

## 🎯 Key Features to Implement Next

### 1. Task Management System
- Task creation and assignment
- Status tracking (Pending, In Progress, Completed)
- Progress updates and notes
- Task reporting

### 2. Daily Progress Tracking
- Progress bars for Marketing, Sales, Collections, Appointments
- Real-time updates
- Daily activity summaries
- Performance metrics

### 3. PDF Report Generation
- Daily activity reports
- Customer-specific reports
- Automated email delivery
- Report customization

### 4. YellowPages Integration
- Business search functionality
- Contact information extraction
- Database building
- Automated data entry

### 5. Live Chat System
- Real-time chat functionality
- Chat routing to Sub Admins
- Chat history tracking
- Integration with customer profiles

## 🚨 Important Notes

1. **Security**: Change the JWT_SECRET in production
2. **Database**: Set up proper MongoDB indexes for performance
3. **Environment**: Use different environment variables for production
4. **Backup**: Set up regular database backups
5. **Monitoring**: Implement error logging and monitoring

## 📞 Support

For questions or issues:
1. Check the implementation plan in `IMPLEMENTATION_PLAN.md`
2. Review the API documentation
3. Check the console for error messages
4. Verify environment variables are set correctly

## 🎉 Success Metrics

The CRM will be successful when:
- ✅ All core features are working
- ✅ Role-based access control is functional
- ✅ PDF reports generate correctly
- ✅ Live chat system is operational
- ✅ YellowPages integration works
- ✅ MailChimp integration is functional
- ✅ Mobile-responsive design
- ✅ Fast loading times
- ✅ Secure authentication
- ✅ Comprehensive documentation

---

**Next Action**: Start implementing the task management routes and connect the frontend to the backend APIs.
