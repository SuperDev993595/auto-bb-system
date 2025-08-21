# Auto-BB System

A comprehensive auto repair business management system built with React, Node.js, and MongoDB.

## 🎨 Recent UI Improvements & Icon Standardization

### Icon System
The system now uses a **standardized Lucide React icon library** for consistent visual design across all components.

- **Unified Design**: All icons follow the same design language
- **Better Performance**: Single icon library reduces bundle size
- **Modern Aesthetics**: Contemporary icon style with better accessibility
- **Easy Maintenance**: Centralized icon management

### UI Enhancements
- **Modern Components**: Rounded corners, enhanced shadows, gradient backgrounds
- **Improved Forms**: Better spacing, hover effects, and focus states
- **Enhanced Modals**: Backdrop blur effects and modern styling
- **Consistent Design**: Unified color palette and typography system

### Migration Status
- ✅ Core customer components updated
- ✅ Icon utility system established
- 🔄 Additional components in progress
- 📋 Complete migration guide available in `docs/ICON_MIGRATION_GUIDE.md`

## 🚀 Features

- **Customer Management**: Complete CRM with customer profiles, vehicles, and service history
- **Appointment Scheduling**: Calendar-based appointment system with notifications
- **Inventory Management**: Parts tracking, supplier management, and purchase orders
- **Service Management**: Work orders, technician assignments, and service tracking
- **Financial Tools**: Invoicing, payment processing, and financial reporting
- **Marketing**: Email campaigns, SMS marketing, and customer communication
- **Reporting**: Comprehensive business analytics and performance metrics
- **Mobile Responsive**: Works seamlessly on all devices

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **Tailwind CSS** for styling
- **Lucide React** for standardized icons
- **React Router** for navigation
- **React Hot Toast** for notifications

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** authentication
- **Multer** for file uploads
- **Nodemailer** for email services
- **Twilio** for SMS services

### Development Tools
- **Vite** for fast development
- **Jest** for testing
- **ESLint** for code quality
- **Prettier** for code formatting

## 📁 Project Structure

```
auto-bb-system/
├── src/                    # Frontend source code
│   ├── components/        # Reusable UI components
│   ├── pages/            # Page components
│   ├── redux/            # State management
│   ├── services/         # API services
│   └── utils/            # Utility functions and icons
├── server/               # Backend server code
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   └── services/        # Business logic services
├── docs/                # Documentation
└── scripts/             # Database and setup scripts
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB 6+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd auto-bb-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   npm run setup-db
   ```

5. **Start development servers**
   ```bash
   npm run dev:full
   ```

### Available Scripts

- `npm run dev` - Start frontend development server
- `npm run server` - Start backend server
- `npm run dev:full` - Start both frontend and backend
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run setup-db` - Initialize database

## 📚 Documentation

- **Icon Migration Guide**: `docs/ICON_MIGRATION_GUIDE.md`
- **UI Improvements Summary**: `docs/UI_IMPROVEMENTS_SUMMARY.md`
- **API Documentation**: Available in the server routes
- **Component Library**: See `src/components/` for reusable components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes following the established patterns
4. Test your changes
5. Submit a pull request

### Development Guidelines

- **Icons**: Use the standardized icon system from `src/utils/icons.ts`
- **Styling**: Follow the established Tailwind CSS patterns
- **Components**: Maintain consistency with existing component design
- **Testing**: Add tests for new functionality

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation in the `docs/` folder
- Review existing components for implementation patterns
- Open an issue for bugs or feature requests

---

**Built with ❤️ for auto repair businesses**
