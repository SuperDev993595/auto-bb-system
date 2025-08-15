# Auto Repair CRM API Documentation

## Overview

The Auto Repair CRM API is a RESTful service built with Node.js, Express, and MongoDB. It provides comprehensive functionality for managing auto repair businesses including customers, appointments, services, inventory, and more.

## Base URL

```
Production: https://your-domain.com/api
Development: http://localhost:5000/api
```

## Authentication

All API endpoints require authentication using JWT tokens, except for login and registration.

### Headers

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (optional)"
}
```

## Success Responses

All success responses follow this format:

```json
{
  "success": true,
  "data": "Response data",
  "message": "Success message (optional)"
}
```

---

## Authentication Endpoints

### POST /auth/login

Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "sub_admin",
      "isActive": true
    }
  },
  "message": "Login successful"
}
```

### POST /auth/register

Register a new user (Super Admin only).

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "password123",
  "role": "sub_admin"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "sub_admin",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "User registered successfully"
}
```

### GET /auth/me

Get current user information.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "sub_admin",
    "isActive": true
  }
}
```

---

## Customer Management

### GET /customers

Get all customers with optional filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search term for business name or contact person
- `status` (string): Filter by status (active, inactive, pending)
- `assignedTo` (string): Filter by assigned user ID

**Response:**
```json
{
  "success": true,
  "data": {
    "customers": [
      {
        "_id": "customer_id",
        "businessName": "ABC Auto Repair",
        "contactPerson": {
          "name": "John Smith",
          "phone": "123-456-7890",
          "email": "john@abcauto.com"
        },
        "address": {
          "street": "123 Main St",
          "city": "Anytown",
          "state": "CA",
          "zipCode": "12345"
        },
        "status": "active",
        "assignedTo": "user_id",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "pages": 3
    }
  }
}
```

### GET /customers/:id

Get a specific customer by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "customer_id",
    "businessName": "ABC Auto Repair",
    "contactPerson": {
      "name": "John Smith",
      "phone": "123-456-7890",
      "email": "john@abcauto.com"
    },
    "address": {
      "street": "123 Main St",
      "city": "Anytown",
      "state": "CA",
      "zipCode": "12345"
    },
    "status": "active",
    "assignedTo": "user_id",
    "communicationLogs": [
      {
        "_id": "log_id",
        "type": "phone",
        "direction": "outbound",
        "subject": "Follow up call",
        "outcome": "successful",
        "createdBy": "user_id",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /customers

Create a new customer.

**Request Body:**
```json
{
  "businessName": "ABC Auto Repair",
  "contactPerson": {
    "name": "John Smith",
    "phone": "123-456-7890",
    "email": "john@abcauto.com"
  },
  "address": {
    "street": "123 Main St",
    "city": "Anytown",
    "state": "CA",
    "zipCode": "12345"
  },
  "status": "active",
  "assignedTo": "user_id"
}
```

### PUT /customers/:id

Update an existing customer.

**Request Body:** Same as POST /customers

### DELETE /customers/:id

Delete a customer.

**Response:**
```json
{
  "success": true,
  "message": "Customer deleted successfully"
}
```

---

## Task Management

### GET /tasks

Get all tasks with optional filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `status` (string): Filter by status (pending, in_progress, completed)
- `type` (string): Filter by type (marketing, sales, collections, appointments)
- `assignedTo` (string): Filter by assigned user ID
- `customer` (string): Filter by customer ID
- `dueDate` (string): Filter by due date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "_id": "task_id",
        "title": "Follow up with customer",
        "description": "Call customer about pending service",
        "type": "sales",
        "status": "pending",
        "priority": "high",
        "assignedTo": "user_id",
        "customer": "customer_id",
        "dueDate": "2024-12-31T23:59:59.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 50,
      "pages": 5
    }
  }
}
```

### POST /tasks

Create a new task.

**Request Body:**
```json
{
  "title": "Follow up with customer",
  "description": "Call customer about pending service",
  "type": "sales",
  "priority": "high",
  "assignedTo": "user_id",
  "customer": "customer_id",
  "dueDate": "2024-12-31T23:59:59.000Z"
}
```

### PATCH /tasks/:id/status

Update task status.

**Request Body:**
```json
{
  "status": "completed",
  "result": "Customer agreed to service",
  "actualDuration": 30
}
```

---

## Appointment Management

### GET /appointments

Get all appointments with optional filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `status` (string): Filter by status (scheduled, completed, cancelled)
- `customer` (string): Filter by customer ID
- `date` (string): Filter by date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "_id": "appointment_id",
        "customer": "customer_id",
        "service": "oil_change",
        "date": "2024-12-31T10:00:00.000Z",
        "status": "scheduled",
        "notes": "Customer requested synthetic oil",
        "assignedTo": "user_id",
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 20,
      "pages": 2
    }
  }
}
```

### POST /appointments

Create a new appointment.

**Request Body:**
```json
{
  "customer": "customer_id",
  "service": "oil_change",
  "date": "2024-12-31T10:00:00.000Z",
  "notes": "Customer requested synthetic oil",
  "assignedTo": "user_id"
}
```

---

## Service Management

### GET /services

Get all services.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "service_id",
      "name": "Oil Change",
      "description": "Standard oil change service",
      "category": "maintenance",
      "duration": 60,
      "price": 49.99,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /services

Create a new service.

**Request Body:**
```json
{
  "name": "Oil Change",
  "description": "Standard oil change service",
  "category": "maintenance",
  "duration": 60,
  "price": 49.99
}
```

---

## Inventory Management

### GET /inventory

Get all inventory items.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `category` (string): Filter by category
- `lowStock` (boolean): Filter items with low stock

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "item_id",
        "name": "Motor Oil 5W-30",
        "description": "Synthetic motor oil",
        "category": "lubricants",
        "sku": "MOIL-5W30",
        "quantity": 50,
        "minQuantity": 10,
        "unitPrice": 8.99,
        "supplier": "supplier_id",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

### POST /inventory

Create a new inventory item.

**Request Body:**
```json
{
  "name": "Motor Oil 5W-30",
  "description": "Synthetic motor oil",
  "category": "lubricants",
  "sku": "MOIL-5W30",
  "quantity": 50,
  "minQuantity": 10,
  "unitPrice": 8.99,
  "supplier": "supplier_id"
}
```

---

## Invoice Management

### GET /invoices

Get all invoices.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `status` (string): Filter by status (draft, sent, paid, overdue)
- `customer` (string): Filter by customer ID
- `dateFrom` (string): Filter from date (YYYY-MM-DD)
- `dateTo` (string): Filter to date (YYYY-MM-DD)

**Response:**
```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "_id": "invoice_id",
        "invoiceNumber": "INV-2024-001",
        "customer": "customer_id",
        "items": [
          {
            "service": "oil_change",
            "description": "Oil Change Service",
            "quantity": 1,
            "unitPrice": 49.99,
            "total": 49.99
          }
        ],
        "subtotal": 49.99,
        "tax": 4.99,
        "total": 54.98,
        "status": "sent",
        "dueDate": "2024-12-31T23:59:59.000Z",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 30,
      "pages": 3
    }
  }
}
```

### POST /invoices

Create a new invoice.

**Request Body:**
```json
{
  "customer": "customer_id",
  "items": [
    {
      "service": "oil_change",
      "description": "Oil Change Service",
      "quantity": 1,
      "unitPrice": 49.99
    }
  ],
  "dueDate": "2024-12-31T23:59:59.000Z"
}
```

---

## Reports

### GET /reports/daily-progress

Get daily progress report.

**Query Parameters:**
- `date` (string): Report date (YYYY-MM-DD, default: today)
- `assignedTo` (string): Filter by user ID

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2024-01-01",
    "totalTasks": 25,
    "completedTasks": 18,
    "pendingTasks": 5,
    "inProgressTasks": 2,
    "completionRate": 72,
    "tasksByType": {
      "marketing": { "total": 8, "completed": 6 },
      "sales": { "total": 10, "completed": 8 },
      "collections": { "total": 5, "completed": 3 },
      "appointments": { "total": 2, "completed": 1 }
    }
  }
}
```

### GET /reports/pdf/daily-activity/:userId

Generate PDF daily activity report for a user.

**Query Parameters:**
- `date` (string): Report date (YYYY-MM-DD, default: today)

**Response:** PDF file download

### GET /reports/pdf/customer/:customerId

Generate PDF customer report.

**Response:** PDF file download

---

## System Administration

### GET /admin/users

Get all users (Admin only).

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `role` (string): Filter by role (super_admin, sub_admin)
- `status` (string): Filter by status (active, inactive)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "role": "sub_admin",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 5,
      "pages": 1
    }
  }
}
```

### POST /admin/users

Create a new user (Admin only).

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "role": "sub_admin"
}
```

### PATCH /admin/users/:id/toggle-status

Toggle user active status (Admin only).

**Response:**
```json
{
  "success": true,
  "data": {
    "isActive": false
  },
  "message": "User status updated successfully"
}
```

---

## Email Integration

### GET /email/templates

Get all email templates.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "template_id",
      "name": "Welcome Email",
      "subject": "Welcome to AutoCRM Pro",
      "content": "Hello {{customerName}}, welcome to our service!",
      "variables": ["customerName"],
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### POST /email/templates

Create a new email template.

**Request Body:**
```json
{
  "name": "Welcome Email",
  "subject": "Welcome to AutoCRM Pro",
  "content": "Hello {{customerName}}, welcome to our service!",
  "variables": ["customerName"]
}
```

### POST /email/send

Send an email.

**Request Body:**
```json
{
  "to": "customer@example.com",
  "subject": "Appointment Reminder",
  "content": "Your appointment is tomorrow at 10 AM",
  "templateId": "template_id"
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **General endpoints**: 100 requests per minute
- **Report generation**: 10 requests per minute

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## WebSocket Events

The system also supports real-time communication via WebSocket:

### Connection

```javascript
const socket = io('http://localhost:5000', {
  auth: {
    token: 'jwt_token_here'
  }
});
```

### Events

#### Client to Server

- `join-room`: Join a specific room (customer, task, etc.)
- `leave-room`: Leave a specific room
- `send-message`: Send a chat message

#### Server to Client

- `task-updated`: Task status or details updated
- `appointment-reminder`: Appointment reminder notification
- `new-message`: New chat message received
- `system-notification`: System-wide notification

---

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid input data |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation error |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |

---

## SDKs and Libraries

### JavaScript/TypeScript

```bash
npm install @autocrm/sdk
```

```javascript
import { AutoCRMClient } from '@autocrm/sdk';

const client = new AutoCRMClient({
  baseUrl: 'https://api.autocrm.com',
  token: 'your_jwt_token'
});

// Get customers
const customers = await client.customers.list();

// Create a task
const task = await client.tasks.create({
  title: 'Follow up call',
  type: 'sales',
  customer: 'customer_id'
});
```

---

## Support

For API support and questions:

- **Email**: api-support@autocrm.com
- **Documentation**: https://docs.autocrm.com
- **Status Page**: https://status.autocrm.com
