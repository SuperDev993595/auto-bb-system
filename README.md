# 🚗 Auto Repair Service CRM

A comprehensive Customer Relationship Management system designed specifically for auto repair service businesses. This full-stack application provides complete customer management, appointment scheduling, task tracking, and business analytics.

## ✨ Features Implemented

### 🔐 Authentication & Security
- **JWT-based authentication** with secure token management
- **Role-based access control** (Super Admin & Sub Admin)
- **Password hashing** with bcrypt
- **Protected routes** with permission-based access
- **Session management** with automatic logout on token expiry

### 👥 Customer Management
- **Complete customer profiles** with business and contact information
- **Multiple vehicles per customer** with detailed vehicle records
- **Service history tracking** with cost and technician information
- **Communication logs** for all customer interactions
- **Advanced filtering and search** capabilities
- **Customer statistics** and analytics

### 📅 Appointment Scheduling
- **Calendar view** with daily, weekly, and monthly views
- **Drag-and-drop** appointment scheduling
- **Technician assignment** and availability tracking
- **Appointment status** management (pending, confirmed, completed)
- **Automated confirmations** and reminders

### ✅ Task Management System
- **Comprehensive task tracking** for Marketing, Sales, Collections, and Appointments
- **Priority levels** (Low, Medium, High, Urgent)
- **Status management** (Pending, In Progress, Completed, Cancelled)
- **Task assignment** to specific users
- **Progress tracking** with percentage completion
- **Task notes** and attachments
- **Due date management** with overdue tracking

### 📊 Daily Progress Tracking
- **Real-time progress bars** for all activity types
- **Daily activity summaries** with completion rates
- **Performance metrics** for Sub Admins
- **Progress visualization** with circular progress indicators
- **Weekly trends** and analytics

### 📈 Reporting & Analytics
- **Comprehensive reporting system** with multiple report types
- **PDF report generation** for daily activities and customer reports
- **Email integration** for automated report delivery
- **Performance analytics** for users and tasks
- **System statistics** and health monitoring

### 🎨 Modern UI/UX
- **Responsive design** that works on all devices
- **Modern interface** with Tailwind CSS
- **Interactive charts** and visualizations
- **Real-time notifications** with toast messages
- **Loading states** and error handling
- **Intuitive navigation** with sidebar menu

## 🛠 Technical Stack

### Frontend
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Chart.js** for data visualization
- **React Hot Toast** for notifications
- **Axios** for API communication

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Socket.io** for real-time features
- **Joi** for input validation
- **Nodemailer** for email functionality
- **jsPDF** for PDF generation

### Development Tools
- **Vite** for fast development
- **TypeScript** for type safety
- **ESLint** for code quality
- **Concurrently** for running multiple servers

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

### Installation

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

4. **Start the development servers**
   ```bash
   # Start both frontend and backend
   npm run dev:full
   
   # Or start them separately:
   npm run server    # Backend only
   npm run dev       # Frontend only
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - API Health Check: http://localhost:3001/api/health

### Demo Credentials
- **Super Admin**: admin@example.com / password123
- **Sub Admin**: user@example.com / password123

## 📁 Project Structure

```
auto-bb-system/
├── src/                    # Frontend React code
│   ├── components/         # React components
│   │   ├── Appointments/   # Appointment-related components
│   │   ├── customers/      # Customer management components
│   │   ├── Tasks/          # Task management components
│   │   ├── Shared/         # Shared components (Header, Footer, etc.)
│   │   └── layout/         # Layout components
│   ├── pages/             # Page components
│   │   ├── admin/         # Admin dashboard pages
│   │   ├── customers/     # Customer pages
│   │   └── dashboard/     # Dashboard pages
│   ├── services/          # API service layer
│   ├── redux/             # Redux store and actions
│   ├── context/           # React context providers
│   └── utils/             # Utility functions
├── server/                # Backend Node.js code
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   ├── config/            # Configuration files
│   └── utils/             # Utility functions
├── public/                # Static files
└── package.json           # Dependencies and scripts
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration (Super Admin only)
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/change-password` - Change password

### Customers
- `GET /api/customers` - Get all customers with filtering
- `GET /api/customers/:id` - Get single customer
- `POST /api/customers` - Create new customer
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `GET /api/customers/stats` - Get customer statistics

### Tasks
- `GET /api/tasks` - Get all tasks with filtering
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PATCH /api/tasks/:id/status` - Update task status
- `PATCH /api/tasks/:id/progress` - Update task progress
- `GET /api/tasks/stats` - Get task statistics
- `GET /api/tasks/daily-progress` - Get daily progress

### Reports
- `GET /api/reports/daily-progress` - Get daily progress report
- `GET /api/reports/user-performance` - Get user performance report
- `POST /api/reports/generate-pdf` - Generate PDF report
- `POST /api/reports/email-pdf` - Email PDF report

## 🎯 Key Features in Detail

### 1. Role-Based Access Control
- **Super Admin**: Full system access, user management, all reports
- **Sub Admin**: Limited access based on permissions, assigned tasks only
- **Permission-based UI**: Interface adapts based on user role

### 2. Customer Management
- **Business Information**: Company name, contact details, address
- **Vehicle Management**: Multiple vehicles per customer with VIN, make, model, year
- **Service History**: Complete record of all services performed
- **Communication Log**: Track all customer interactions
- **Notes & Preferences**: Customer-specific information and preferences

### 3. Task Management
- **Task Types**: Marketing, Sales, Collections, Appointments, Follow-up, Maintenance
- **Priority Levels**: Low, Medium, High, Urgent with color coding
- **Status Tracking**: Pending, In Progress, Completed, Cancelled
- **Assignment**: Assign tasks to specific users
- **Progress Tracking**: Percentage completion with visual indicators
- **Due Dates**: Automatic overdue detection and notifications

### 4. Daily Progress Tracking
- **Real-time Updates**: Live progress bars for all activity types
- **Performance Metrics**: Individual user performance tracking
- **Daily Summaries**: Overview of completed vs. total tasks
- **Trend Analysis**: Weekly and monthly performance trends

### 5. Reporting System
- **Daily Activity Reports**: Individual user daily summaries
- **Customer Reports**: Comprehensive customer information and history
- **Performance Analytics**: User and team performance metrics
- **PDF Generation**: Professional report generation
- **Email Integration**: Automated report delivery

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for secure password storage
- **Input Validation**: Joi schema validation for all inputs
- **Rate Limiting**: Protection against brute force attacks
- **CORS Configuration**: Secure cross-origin requests
- **Helmet Security**: HTTP security headers
- **Role-based Authorization**: Fine-grained access control

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- Desktop computers
- Tablets
- Mobile phones
- All modern browsers

## 🚀 Deployment

### Development
```bash
npm run dev:full
```

### Production Build
```bash
npm run build
npm run server
```

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
FRONTEND_URL=https://your-domain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
1. Check the documentation in the `/docs` folder
2. Review the implementation plan in `IMPLEMENTATION_PLAN.md`
3. Check the quick start guide in `QUICK_START_GUIDE.md`

## 🎉 What's Next?

The system is now fully functional with all core features implemented. Future enhancements could include:

- **Live Chat System**: Real-time customer support
- **YellowPages Integration**: Business data extraction
- **MailChimp Integration**: Email marketing automation
- **Mobile App**: Native mobile application
- **Advanced Analytics**: Machine learning insights
- **Payment Integration**: Online payment processing

---

**🎯 Implementation Status: COMPLETE**

All requested features have been successfully implemented and are fully functional. The system is ready for production use with proper security, authentication, and all core CRM functionality.
