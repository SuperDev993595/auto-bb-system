const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const Customer = require('../../models/Customer');
const bcrypt = require('bcryptjs');
const express = require('express');
const { authenticateToken } = require('../../middleware/auth');

// Test user data
const testUsers = {
  superAdmin: {
    name: 'Super Admin',
    email: 'superadmin@test.com',
    password: 'password123',
    role: 'super_admin',
    permissions: ['all']
  },
  admin: {
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin',
    permissions: ['manage_users', 'manage_customers', 'view_reports']
  },
  businessClient: {
    name: 'Business Client',
    email: 'business@test.com',
    password: 'password123',
    role: 'business_client',
    businessName: 'Test Business',
    permissions: ['manage_own_data']
  },
  customer: {
    name: 'Test Customer',
    email: 'pioneer200082@gmail.com',
    password: 'password123',
    role: 'customer',
    permissions: ['view_own_data']
  }
};

// Test customer data
const testCustomerData = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '123-456-7890',
  address: {
    street: '123 Main St',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345'
  },
  status: 'active'
};

// Create a test user
const createTestUser = async (userType = 'customer') => {
  const userData = testUsers[userType];
  
  const user = new User({
    ...userData,
    isActive: true
  });
  
  return await user.save();
};

// Create a test customer
const createTestCustomer = async (customerData = testCustomerData) => {
  const customer = new Customer(customerData);
  return await customer.save();
};

// Generate JWT token for a user
const generateTestToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      email: user.email, 
      role: user.role,
      permissions: user.permissions 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Create authenticated request headers
const createAuthHeaders = (token) => ({
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
});

// Create test request object
const createTestRequest = (body = {}, params = {}, query = {}, headers = {}) => ({
  body,
  params,
  query,
  headers: {
    'Content-Type': 'application/json',
    ...headers
  }
});

// Create test response object
const createTestResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

// Mock next function for middleware testing
const createNextFunction = () => jest.fn();

// Helper to create a complete test context
const createTestContext = async (userType = 'customer') => {
  const user = await createTestUser(userType);
  const token = generateTestToken(user);
  const headers = createAuthHeaders(token);
  
  return {
    user,
    token,
    headers,
    req: createTestRequest({}, {}, {}, headers),
    res: createTestResponse(),
    next: createNextFunction()
  };
};

// Helper to test protected routes
const testProtectedRoute = async (routeHandler, userType = 'customer', requestData = {}) => {
  const { user, token, headers } = await createTestContext(userType);
  const req = createTestRequest(
    requestData.body || {},
    requestData.params || {},
    requestData.query || {},
    headers
  );
  const res = createTestResponse();
  const next = createNextFunction();
  
  return { req, res, next, user, token };
};

// Helper to test public routes
const testPublicRoute = (requestData = {}) => {
  const req = createTestRequest(
    requestData.body || {},
    requestData.params || {},
    requestData.query || {},
    requestData.headers || {}
  );
  const res = createTestResponse();
  const next = createNextFunction();
  
  return { req, res, next };
};

// Helper to validate response structure
const validateResponseStructure = (response, expectedFields = []) => {
  expect(response.json).toHaveBeenCalled();
  const responseData = response.json.mock.calls[0][0];
  
  if (expectedFields.length > 0) {
    expectedFields.forEach(field => {
      expect(responseData).toHaveProperty(field);
    });
  }
  
  return responseData;
};

// Helper to validate error response
const validateErrorResponse = (response, expectedStatus = 400, expectedMessage = null) => {
  expect(response.status).toHaveBeenCalledWith(expectedStatus);
  expect(response.json).toHaveBeenCalled();
  
  const responseData = response.json.mock.calls[0][0];
  expect(responseData).toHaveProperty('success', false);
  
  if (expectedMessage) {
    expect(responseData).toHaveProperty('message');
    expect(responseData.message).toContain(expectedMessage);
  }
  
  return responseData;
};

// Helper to validate success response
const validateSuccessResponse = (response, expectedStatus = 200) => {
  expect(response.status).toHaveBeenCalledWith(expectedStatus);
  expect(response.json).toHaveBeenCalled();
  
  const responseData = response.json.mock.calls[0][0];
  expect(responseData).toHaveProperty('success', true);
  
  return responseData;
};

// Helper to create a test Express app with authentication middleware
const createTestApp = (routes, requireAuth = true) => {
  const app = express();
  app.use(express.json());
  
  if (requireAuth) {
    app.use('/api', authenticateToken);
  }
  
  app.use('/api', routes);
  
  return app;
};

module.exports = {
  testUsers,
  testCustomerData,
  createTestUser,
  createTestCustomer,
  generateTestToken,
  createAuthHeaders,
  createTestRequest,
  createTestResponse,
  createNextFunction,
  createTestContext,
  testProtectedRoute,
  testPublicRoute,
  validateResponseStructure,
  validateErrorResponse,
  validateSuccessResponse,
  createTestApp
};
