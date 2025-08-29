# Test Scripts

This folder contains test scripts for various features of the auto-repair-crm.

## Available Test Scripts

### Manual Work Order Creation Tests

#### `test-manual-workorder-simple.js`
A simple test script for manual work order creation that:
- Tests server connectivity
- Validates authentication
- Checks for required data (customers, services)
- Creates a test work order
- Provides clear error messages and setup instructions

**Usage:**
```bash
# Set JWT token
set JWT_TOKEN=your-jwt-token-here  # Windows
export JWT_TOKEN=your-jwt-token-here  # Linux/Mac

# Run the test
node scripts/test/test-manual-workorder-simple.js
```

#### `test-manual-workorder-creation.js`
A comprehensive test script for manual work order creation that:
- Performs detailed connectivity and authentication tests
- Validates all required data availability
- Tests work order creation with real data
- Tests work order retrieval
- Provides extensive error handling and troubleshooting

**Usage:**
```bash
# Set JWT token
set JWT_TOKEN=your-jwt-token-here  # Windows
export JWT_TOKEN=your-jwt-token-here  # Linux/Mac

# Run the test
node scripts/test/test-manual-workorder-creation.js
```

## Prerequisites

Before running any test scripts:

1. **Backend Server**: Ensure the backend server is running on `http://localhost:5000`
2. **Authentication**: Get a valid JWT token by logging into the system
3. **Required Data**: Ensure at least one customer and one service exist in the system

## Getting a JWT Token

1. Start the backend server: `cd server && npm start`
2. Start the frontend: `npm run dev`
3. Log into the system through the browser
4. Get the JWT token from:
   - Browser Developer Tools → Application → Local Storage
   - Or from the network requests in Developer Tools

## Environment Variables

Set the JWT token as an environment variable:

```bash
# Windows (PowerShell)
$env:JWT_TOKEN="your-jwt-token-here"

# Windows (Command Prompt)
set JWT_TOKEN=your-jwt-token-here

# Linux/Mac
export JWT_TOKEN=your-jwt-token-here
```

## Troubleshooting

### Common Issues

1. **"JWT_TOKEN environment variable is not set"**
   - Set the JWT_TOKEN environment variable as shown above

2. **"Cannot connect to server"**
   - Ensure the backend server is running on port 5000
   - Check server logs for any errors

3. **"Authentication failed"**
   - Verify your JWT token is valid and not expired
   - Get a fresh token by logging in again

4. **"Missing required data"**
   - Create at least one customer and one service
   - Verify the data is properly saved in the database

### Getting Help

If you encounter issues:
1. Check the test script output for specific error messages
2. Verify server connectivity and authentication
3. Ensure all required data exists in the system
4. Check the main documentation for more detailed information

## Adding New Test Scripts

When adding new test scripts to this folder:

1. Use descriptive names that indicate the feature being tested
2. Include proper error handling and user-friendly messages
3. Document prerequisites and setup requirements
4. Update this README with information about the new script
5. Follow the existing pattern for JWT token handling and error reporting
