const fs = require('fs');
const path = require('path');

// API Documentation Generator
class APIDocGenerator {
  constructor() {
    this.routes = [];
    this.baseUrl = process.env.API_BASE_URL || 'http://localhost:3001';
  }

  // Parse route files and extract documentation
  parseRoutes() {
    const routesDir = path.join(__dirname, '../routes');
    const routeFiles = fs.readdirSync(routesDir).filter(file => file.endsWith('.js'));

    routeFiles.forEach(file => {
      const filePath = path.join(routesDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      const routeName = file.replace('.js', '');
      
      this.parseRouteFile(content, routeName);
    });
  }

  // Parse individual route file
  parseRouteFile(content, routeName) {
    const lines = content.split('\n');
    let currentRoute = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Look for route definitions
      if (line.startsWith('router.')) {
        const methodMatch = line.match(/router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]/);
        if (methodMatch) {
          currentRoute = {
            method: methodMatch[1].toUpperCase(),
            path: methodMatch[2],
            routeName,
            description: '',
            access: '',
            parameters: [],
            responses: []
          };
        }
      }
      
      // Look for route comments
      if (line.startsWith('// @route') && currentRoute) {
        const descMatch = lines[i + 1]?.match(/\/\/ @desc\s+(.+)/);
        const accessMatch = lines[i + 2]?.match(/\/\/ @access\s+(.+)/);
        
        if (descMatch) currentRoute.description = descMatch[1];
        if (accessMatch) currentRoute.access = accessMatch[1];
      }
      
      // Look for Joi validation schemas
      if (line.includes('Schema') && line.includes('=') && currentRoute) {
        const schemaName = line.match(/(\w+Schema)\s*=/)?.[1];
        if (schemaName) {
          currentRoute.validationSchema = schemaName;
        }
      }
    }

    if (currentRoute) {
      this.routes.push(currentRoute);
    }
  }

  // Generate Markdown documentation
  generateMarkdown() {
    let markdown = `# Auto Repair CRM API Documentation

## Overview
This document provides comprehensive documentation for the Auto Repair CRM API endpoints.

**Base URL:** \`${this.baseUrl}\`

**Authentication:** Most endpoints require JWT authentication via the \`Authorization\` header:
\`Authorization: Bearer <your-jwt-token>\`

## Table of Contents
`;

    // Generate table of contents
    const routeGroups = this.groupRoutesByCategory();
    Object.keys(routeGroups).forEach(category => {
      markdown += `- [${category}](#${category.toLowerCase().replace(/\s+/g, '-')})\n`;
    });

    markdown += '\n---\n\n';

    // Generate documentation for each category
    Object.keys(routeGroups).forEach(category => {
      markdown += this.generateCategoryDocs(category, routeGroups[category]);
    });

    return markdown;
  }

  // Group routes by category
  groupRoutesByCategory() {
    const groups = {};
    
    this.routes.forEach(route => {
      const category = this.getRouteCategory(route.routeName);
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(route);
    });

    return groups;
  }

  // Get category from route name
  getRouteCategory(routeName) {
    const categoryMap = {
      'auth': 'Authentication',
      'customers': 'Customer Management',
      'appointments': 'Appointment Management',
      'services': 'Service Management',
      'inventory': 'Inventory Management',
      'invoices': 'Invoice Management',
      'reports': 'Reports & Analytics',
      'users': 'User Management',
      'health': 'Health & Monitoring',
      'metrics': 'Metrics & Analytics'
    };

    return categoryMap[routeName] || 'Other';
  }

  // Generate documentation for a category
  generateCategoryDocs(category, routes) {
    let markdown = `## ${category}\n\n`;

    routes.forEach(route => {
      markdown += this.generateRouteDocs(route);
    });

    return markdown;
  }

  // Generate documentation for a single route
  generateRouteDocs(route) {
    const fullPath = `/api/${route.routeName}${route.path}`;
    const methodColor = this.getMethodColor(route.method);
    
    let markdown = `### ${route.method} ${fullPath}\n\n`;
    
    if (route.description) {
      markdown += `**Description:** ${route.description}\n\n`;
    }
    
    markdown += `**Access:** ${route.access}\n\n`;
    markdown += `**Method:** \`${route.method}\`\n\n`;
    markdown += `**URL:** \`${this.baseUrl}${fullPath}\`\n\n`;

    // Add authentication info
    if (route.access !== 'Public') {
      markdown += `**Authentication:** Required\n\n`;
    }

    // Add request/response examples
    markdown += this.generateExamples(route);

    markdown += '\n---\n\n';
    
    return markdown;
  }

  // Generate request/response examples
  generateExamples(route) {
    let examples = '';

    // Request example
    if (route.method === 'POST' || route.method === 'PUT') {
      examples += `**Request Example:**\n\`\`\`json\n`;
      examples += this.getRequestExample(route);
      examples += `\n\`\`\`\n\n`;
    }

    // Response example
    examples += `**Response Example:**\n\`\`\`json\n`;
    examples += this.getResponseExample(route);
    examples += `\n\`\`\`\n\n`;

    return examples;
  }

  // Get request example based on route
  getRequestExample(route) {
    const examples = {
      'auth': {
        'POST /login': {
          email: 'user@example.com',
          password: 'password123'
        },
        'POST /register': {
          name: 'John Doe',
          email: 'john@example.com',
          password: 'password123',
          role: 'customer'
        }
      },
      'customers': {
        'POST /': {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890',
          address: '123 Main St',
          source: 'website'
        }
      },
      'appointments': {
        'POST /': {
          customerId: '507f1f77bcf86cd799439011',
          vehicleId: '507f1f77bcf86cd799439012',
          serviceType: 'Oil Change',
          scheduledDate: '2024-01-15',
          scheduledTime: '10:00',
          notes: 'Regular maintenance'
        }
      }
    };

    const routeExamples = examples[route.routeName];
    if (routeExamples && routeExamples[`${route.method} ${route.path}`]) {
      return JSON.stringify(routeExamples[`${route.method} ${route.path}`], null, 2);
    }

    return JSON.stringify({ example: 'data' }, null, 2);
  }

  // Get response example based on route
  getResponseExample(route) {
    const successResponse = {
      success: true,
      message: 'Operation completed successfully',
      data: { example: 'response data' }
    };

    const errorResponse = {
      success: false,
      message: 'Error description',
      error: 'Detailed error information'
    };

    return JSON.stringify(successResponse, null, 2);
  }

  // Get color for HTTP method
  getMethodColor(method) {
    const colors = {
      'GET': 'green',
      'POST': 'blue',
      'PUT': 'orange',
      'DELETE': 'red',
      'PATCH': 'purple'
    };
    return colors[method] || 'gray';
  }

  // Generate and save documentation
  generate() {
    this.parseRoutes();
    const markdown = this.generateMarkdown();
    
    const outputPath = path.join(__dirname, '../../docs/API_DOCUMENTATION.md');
    const docsDir = path.dirname(outputPath);
    
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, markdown);
    console.log(`✅ API documentation generated: ${outputPath}`);
    
    return markdown;
  }
}

module.exports = APIDocGenerator;
