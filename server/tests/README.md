# API Endpoint Test Suite

This directory contains comprehensive unit tests for all API endpoints in the Auto Repair CRM system. These tests validate the interface between the frontend and backend, ensuring data integrity, authentication, authorization, and proper error handling.

## 🎯 Test Objectives

- **Interface Validation**: Ensure frontend and backend communicate correctly
- **Data Integrity**: Validate data formats, validation rules, and business logic
- **Authentication & Authorization**: Test user roles and permissions
- **Error Handling**: Verify proper error responses and status codes
- **CRUD Operations**: Test Create, Read, Update, Delete operations
- **Edge Cases**: Handle invalid data, missing fields, and boundary conditions

## 📁 Test Structure

```
server/tests/
├── setup.js                 # Test environment setup
├── helpers/
│   └── testUtils.js         # Common test utilities and helpers
├── routes/
│   ├── auth.test.js         # Authentication endpoints
│   ├── customers.test.js    # Customer management endpoints
│   ├── appointments.test.js # Appointment scheduling endpoints
│   └── services.test.js     # Service management endpoints
├── run-tests.js             # Test runner script
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Ensure MongoDB is available (tests use MongoDB Memory Server)

### Running Tests

#### Run All API Tests
```bash
npm run test:server
```

#### Run Specific Test Suite
```bash
# Authentication tests only
npx jest server/tests/routes/auth.test.js --config server/jest.config.js

# Customer tests only
npx jest server/tests/routes/customers.test.js --config server/jest.config.js
```

#### Run with Coverage
```bash
npm run test:server:coverage
```

#### Run Test Runner Script
```bash
node server/tests/run-tests.js
```

## 📋 Test Coverage

### Authentication Tests (`auth.test.js`)

**Endpoints Tested:**
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/logout` - User logout

**Test Scenarios:**
- ✅ Valid login with correct credentials
- ❌ Invalid login with wrong credentials
- ✅ User registration with valid data
- ❌ Registration with duplicate email
- ✅ Password reset flow
- ❌ Invalid password reset tokens
- ✅ Profile management
- ❌ Unauthorized access attempts

### Customer Management Tests (`customers.test.js`)

**Endpoints Tested:**
- `GET /api/customers` - List all customers
- `POST /api/customers` - Create new customer
- `GET /api/customers/:id` - Get customer by ID
- `PUT /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer
- `POST /api/customers/:id/vehicles` - Add vehicle to customer
- `GET /api/customers/:id/vehicles` - Get customer vehicles
- `POST /api/customers/:id/appointments` - Create appointment for customer
- `GET /api/customers/:id/appointments` - Get customer appointments
- `POST /api/customers/:id/messages` - Send message to customer
- `GET /api/customers/:id/messages` - Get customer messages
- `POST /api/customers/:id/payments` - Record payment
- `GET /api/customers/:id/payments` - Get payment history
- `GET /api/customers/stats/overview` - Customer statistics
- `POST /api/customers/import` - Import customers from CSV
- `GET /api/customers/export` - Export customers to CSV

**Test Scenarios:**
- ✅ CRUD operations for customers
- ❌ Invalid customer data validation
- ✅ Vehicle management
- ✅ Appointment creation and management
- ✅ Customer communication (messages)
- ✅ Payment tracking
- ✅ Data import/export functionality
- ❌ Unauthorized access attempts
- ✅ Role-based access control

### Appointment Tests (`appointments.test.js`)

**Endpoints Tested:**
- `GET /api/appointments` - List all appointments
- `POST /api/appointments` - Create new appointment
- `GET /api/appointments/:id` - Get appointment by ID
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment
- `PUT /api/appointments/:id/status` - Update appointment status
- `GET /api/appointments/calendar/:date` - Get appointments for date
- `GET /api/appointments/stats/overview` - Appointment statistics
- `POST /api/appointments/bulk-update` - Bulk update appointments

**Test Scenarios:**
- ✅ Appointment scheduling
- ❌ Invalid appointment data
- ✅ Status updates (scheduled → in-progress → completed)
- ✅ Calendar functionality
- ✅ Bulk operations
- ❌ Scheduling conflicts
- ✅ Customer association
- ❌ Unauthorized access

### Services Tests (`services.test.js`)

**Endpoints Tested:**
- `GET /api/services` - List all services
- `POST /api/services` - Create new service
- `GET /api/services/:id` - Get service by ID
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service
- `GET /api/services/categories` - Get service categories
- `POST /api/services/:id/pricing` - Update service pricing
- `GET /api/services/:id/technicians` - Get technicians for service
- `POST /api/services/:id/technicians` - Assign technicians
- `GET /api/services/stats/overview` - Service statistics
- `POST /api/services/import` - Import services from CSV
- `GET /api/services/export` - Export services to CSV

**Test Scenarios:**
- ✅ Service CRUD operations
- ❌ Invalid service data validation
- ✅ Pricing management
- ✅ Technician assignments
- ✅ Category management
- ✅ Data import/export
- ❌ Duplicate service names
- ✅ Role-based access control

## 🛠️ Test Utilities

### `testUtils.js`

Common utilities for testing:

- **User Creation**: `createTestUser(userType)` - Creates test users with different roles
- **Customer Creation**: `createTestCustomer(customerData)` - Creates test customers
- **Token Generation**: `generateTestToken(user)` - Generates JWT tokens for authentication
- **Request Helpers**: `createTestRequest()`, `createTestResponse()` - Mock request/response objects
- **Validation Helpers**: `validateSuccessResponse()`, `validateErrorResponse()` - Response validation

### Test Data

Predefined test data for consistent testing:

```javascript
const testUsers = {
  superAdmin: { name: 'Super Admin', email: 'superadmin@test.com', role: 'super_admin' },
  admin: { name: 'Admin User', email: 'admin@test.com', role: 'admin' },
  businessClient: { name: 'Business Client', email: 'business@test.com', role: 'business_client' },
  customer: { name: 'Test Customer', email: 'customer@test.com', role: 'customer' }
};
```

## 🔧 Configuration

### Jest Configuration (`server/jest.config.js`)

```javascript
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  collectCoverageFrom: [
    '<rootDir>/routes/**/*.js',
    '<rootDir>/models/**/*.js',
    '<rootDir>/middleware/**/*.js',
    '<rootDir>/services/**/*.js'
  ],
  coverageDirectory: '<rootDir>/coverage',
  testTimeout: 30000,
  verbose: true
};
```

### Environment Setup (`server/tests/setup.js`)

- MongoDB Memory Server setup
- Environment variable configuration
- Database cleanup between tests
- Console output suppression

## 📊 Test Results

### Success Criteria

Tests are considered successful when:

1. **All endpoints return correct HTTP status codes**
2. **Response data matches expected format**
3. **Authentication and authorization work correctly**
4. **Error handling provides meaningful messages**
5. **Data validation prevents invalid input**
6. **Business logic is enforced correctly**

### Coverage Goals

- **Line Coverage**: > 90%
- **Branch Coverage**: > 85%
- **Function Coverage**: > 95%

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Errors**
   - Ensure MongoDB Memory Server is working
   - Check if port 27017 is available

2. **Authentication Failures**
   - Verify JWT_SECRET environment variable
   - Check token generation in test utilities

3. **Test Timeouts**
   - Increase timeout in jest.config.js
   - Check for hanging database connections

4. **Missing Dependencies**
   - Run `npm install` to install all dependencies
   - Ensure supertest and mongodb-memory-server are installed

### Debug Mode

Run tests with verbose output:

```bash
npm run test:server -- --verbose
```

## 📈 Continuous Integration

### GitHub Actions Example

```yaml
name: API Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm run test:server:coverage
```

## 🤝 Contributing

When adding new endpoints:

1. **Create test file** in `server/tests/routes/`
2. **Follow naming convention**: `endpoint-name.test.js`
3. **Include all CRUD operations** if applicable
4. **Test error cases** and edge conditions
5. **Update this README** with new test coverage
6. **Run full test suite** before submitting

## 📝 Test Writing Guidelines

### Structure

```javascript
describe('Endpoint Name', () => {
  beforeEach(async () => {
    // Setup test data
  });

  describe('GET /api/endpoint', () => {
    it('should return data successfully', async () => {
      // Test implementation
    });

    it('should handle errors correctly', async () => {
      // Error test
    });
  });
});
```

### Best Practices

1. **Use descriptive test names**
2. **Test both success and failure cases**
3. **Validate response structure**
4. **Clean up test data**
5. **Use test utilities for consistency**
6. **Mock external dependencies**
7. **Test authentication and authorization**

## 📞 Support

For questions about the test suite:

1. Check this README first
2. Review existing test examples
3. Check Jest documentation
4. Open an issue with specific error details

---

**Last Updated**: December 2024
**Test Suite Version**: 1.0.0
