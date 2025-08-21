const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting API Endpoint Tests...\n');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log(`\n${colors.cyan}${colors.bright}=== ${title} ===${colors.reset}\n`);
}

function logSuccess(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logError(message) {
  console.log(`${colors.red}❌ ${message}${colors.reset}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

// Test configuration
const testConfig = {
  timeout: 30000,
  verbose: true,
  coverage: true,
  testMatch: ['**/*.test.js', '**/*.spec.js']
};

// Test suites to run
const testSuites = [
  {
    name: 'Authentication Tests',
    file: 'routes/auth.test.js',
    description: 'Testing login, register, password reset, and profile management'
  },
  {
    name: 'Customer Management Tests',
    file: 'routes/customers.test.js',
    description: 'Testing customer CRUD operations, vehicles, appointments, and messaging'
  },
  {
    name: 'Appointment Tests',
    file: 'routes/appointments.test.js',
    description: 'Testing appointment scheduling, status updates, and calendar functionality'
  },
  {
    name: 'Services Tests',
    file: 'routes/services.test.js',
    description: 'Testing service management, pricing, and technician assignments'
  }
];

// Check if test files exist
function checkTestFiles() {
  logSection('Checking Test Files');
  
  const missingFiles = [];
  
  testSuites.forEach(suite => {
    const filePath = path.join(__dirname, suite.file);
    if (fs.existsSync(filePath)) {
      logSuccess(`${suite.name} - ${suite.file}`);
    } else {
      logError(`${suite.name} - ${suite.file} (MISSING)`);
      missingFiles.push(suite.file);
    }
  });
  
  if (missingFiles.length > 0) {
    logWarning(`${missingFiles.length} test file(s) are missing`);
    return false;
  }
  
  logSuccess('All test files found');
  return true;
}

// Run individual test suite
function runTestSuite(suite) {
  logSection(`Running ${suite.name}`);
  logInfo(suite.description);
  
  try {
    const testPath = path.join(__dirname, suite.file);
    const command = `npx jest "${testPath}" --config "${path.join(__dirname, '..', 'jest.config.js')}" --verbose --timeout=${testConfig.timeout}`;
    
    const result = execSync(command, { 
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    logSuccess(`${suite.name} completed successfully`);
    return { success: true, output: result };
    
  } catch (error) {
    logError(`${suite.name} failed`);
    if (error.stdout) {
      console.log(error.stdout);
    }
    if (error.stderr) {
      console.log(error.stderr);
    }
    return { success: false, error: error.message };
  }
}

// Run all tests
function runAllTests() {
  logSection('Running All API Endpoint Tests');
  
  const results = [];
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  
  testSuites.forEach(suite => {
    const result = runTestSuite(suite);
    results.push({
      suite: suite.name,
      ...result
    });
    
    if (result.success) {
      passedTests++;
    } else {
      failedTests++;
    }
    totalTests++;
  });
  
  return { results, totalTests, passedTests, failedTests };
}

// Generate test report
function generateReport(testResults) {
  logSection('Test Results Summary');
  
  const { results, totalTests, passedTests, failedTests } = testResults;
  
  console.log(`\n${colors.bright}Overall Results:${colors.reset}`);
  console.log(`Total Test Suites: ${totalTests}`);
  console.log(`Passed: ${colors.green}${passedTests}${colors.reset}`);
  console.log(`Failed: ${colors.red}${failedTests}${colors.reset}`);
  console.log(`Success Rate: ${colors.bright}${((passedTests / totalTests) * 100).toFixed(1)}%${colors.reset}`);
  
  console.log(`\n${colors.bright}Detailed Results:${colors.reset}`);
  results.forEach(result => {
    if (result.success) {
      logSuccess(`${result.suite}: PASSED`);
    } else {
      logError(`${result.suite}: FAILED`);
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    }
  });
  
  // Generate coverage report if available
  const coveragePath = path.join(__dirname, '..', 'coverage', 'lcov-report', 'index.html');
  if (fs.existsSync(coveragePath)) {
    logInfo(`Coverage report available at: ${coveragePath}`);
  }
  
  return testResults;
}

// Main execution
async function main() {
  try {
    log('🔧 Auto Repair CRM - API Endpoint Test Suite', 'magenta');
    log('Validating interface between frontend and backend\n', 'blue');
    
    // Check test files
    if (!checkTestFiles()) {
      logError('Some test files are missing. Please ensure all test files are created.');
      process.exit(1);
    }
    
    // Run tests
    const testResults = runAllTests();
    
    // Generate report
    const report = generateReport(testResults);
    
    // Exit with appropriate code
    if (report.failedTests > 0) {
      logError(`\n${report.failedTests} test suite(s) failed. Please review the errors above.`);
      process.exit(1);
    } else {
      logSuccess(`\n🎉 All ${report.totalTests} test suite(s) passed successfully!`);
      logInfo('API endpoints are working correctly and interface validation is complete.');
      process.exit(0);
    }
    
  } catch (error) {
    logError(`Test runner failed: ${error.message}`);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  runAllTests,
  generateReport,
  checkTestFiles
};
