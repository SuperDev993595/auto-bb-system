# API Documentation

## Overview

This document provides comprehensive API documentation for the Customer Portal backend services, including authentication, memberships, warranties, and customer management endpoints.

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

All API endpoints require authentication using JWT tokens.

### Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Authentication Endpoints

#### Login
```http
POST /auth/login
```

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
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "role": "customer"
  }
}
```

#### Register
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

## Membership API

### Get All Membership Plans
```http
GET /memberships/plans
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Basic Membership",
      "description": "Essential maintenance services",
      "price": 29.99,
      "billingCycle": "monthly",
      "benefits": [
        "Oil changes",
        "Tire rotations",
        "Basic inspections"
      ],
      "maxBenefits": 6,
      "isActive": true,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### Get Specific Membership Plan
```http
GET /memberships/plans/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Premium Membership",
    "description": "Comprehensive maintenance and services",
    "price": 79.99,
    "billingCycle": "monthly",
    "benefits": [
      "All basic services",
      "Brake service",
      "Battery replacement",
      "Roadside assistance"
    ],
    "maxBenefits": 12,
    "isActive": true
  }
}
```

### Create Membership Plan
```http
POST /memberships/plans
```

**Request Body:**
```json
{
  "name": "New Plan",
  "description": "Plan description",
  "price": 49.99,
  "billingCycle": "monthly",
  "benefits": ["Service 1", "Service 2"],
  "maxBenefits": 8
}
```

### Update Membership Plan
```http
PUT /memberships/plans/:id
```

**Request Body:**
```json
{
  "price": 59.99,
  "benefits": ["Service 1", "Service 2", "Service 3"]
}
```

### Delete Membership Plan
```http
DELETE /memberships/plans/:id
```

### Get Customer Memberships
```http
GET /memberships/customer/:customerId
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "customerId": "507f1f77bcf86cd799439012",
      "planId": "507f1f77bcf86cd799439013",
      "plan": {
        "name": "Premium Membership",
        "price": 79.99
      },
      "startDate": "2024-01-01T00:00:00.000Z",
      "endDate": "2024-12-31T23:59:59.000Z",
      "status": "active",
      "benefitsUsed": 3,
      "lastBillingDate": "2024-01-01T00:00:00.000Z",
      "nextBillingDate": "2024-02-01T00:00:00.000Z",
      "autoRenew": true
    }
  ]
}
```

### Create Customer Membership
```http
POST /memberships/customer/:customerId
```

**Request Body:**
```json
{
  "planId": "507f1f77bcf86cd799439013",
  "startDate": "2024-01-01",
  "autoRenew": true
}
```

### Update Customer Membership
```http
PUT /memberships/customer/:customerId/:membershipId
```

**Request Body:**
```json
{
  "status": "cancelled",
  "autoRenew": false
}
```

### Cancel Customer Membership
```http
DELETE /memberships/customer/:customerId/:membershipId
```

### Get Membership Statistics
```http
GET /memberships/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalMemberships": 150,
    "activeMemberships": 120,
    "expiringSoon": 15,
    "totalRevenue": 12500.00,
    "monthlyGrowth": 12.5,
    "topPlans": [
      {
        "name": "Premium Membership",
        "count": 45,
        "revenue": 4500.00,
        "percentage": 30
      }
    ]
  }
}
```

## Warranty API

### Get All Warranties
```http
GET /warranties
```

**Query Parameters:**
- `status` - Filter by status (active, expired, cancelled)
- `type` - Filter by warranty type
- `customerId` - Filter by customer ID
- `vehicleId` - Filter by vehicle ID

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "customerId": "507f1f77bcf86cd799439012",
      "vehicleId": "507f1f77bcf86cd799439013",
      "vehicle": {
        "make": "Honda",
        "model": "Civic",
        "year": 2020
      },
      "type": "Extended Warranty",
      "provider": "ABC Warranty Co",
      "startDate": "2023-06-01T00:00:00.000Z",
      "endDate": "2026-06-01T23:59:59.000Z",
      "mileageLimit": 100000,
      "currentMileage": 45000,
      "coverage": [
        "Engine",
        "Transmission",
        "Electrical"
      ],
      "deductible": 100,
      "status": "active",
      "claims": []
    }
  ]
}
```

### Get Specific Warranty
```http
GET /warranties/:id
```

### Create Warranty
```http
POST /warranties
```

**Request Body:**
```json
{
  "customerId": "507f1f77bcf86cd799439012",
  "vehicleId": "507f1f77bcf86cd799439013",
  "type": "Extended Warranty",
  "provider": "ABC Warranty Co",
  "startDate": "2024-01-01",
  "endDate": "2027-01-01",
  "mileageLimit": 100000,
  "coverage": ["Engine", "Transmission"],
  "deductible": 100
}
```

### Update Warranty
```http
PUT /warranties/:id
```

**Request Body:**
```json
{
  "currentMileage": 50000,
  "status": "active"
}
```

### Delete Warranty
```http
DELETE /warranties/:id
```

### Get Customer Warranties
```http
GET /warranties/customer/:customerId
```

### Get Vehicle Warranties
```http
GET /warranties/vehicle/:vehicleId
```

### Update Warranty Mileage
```http
PUT /warranties/:id/mileage
```

**Request Body:**
```json
{
  "currentMileage": 55000
}
```

### File Warranty Claim
```http
POST /warranties/:id/claim
```

**Request Body:**
```json
{
  "claimType": "Engine Repair",
  "description": "Engine making unusual noise",
  "estimatedCost": 2500.00,
  "serviceDate": "2024-01-15",
  "attachments": ["file1.pdf", "file2.jpg"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "claimId": "507f1f77bcf86cd799439014",
    "status": "pending",
    "estimatedProcessingTime": "5-7 business days"
  }
}
```

### Get Warranty Statistics
```http
GET /warranties/stats/overview
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalWarranties": 200,
    "activeWarranties": 180,
    "expiredWarranties": 20,
    "totalClaims": 45,
    "totalClaimValue": 125000.00,
    "averageClaimValue": 2777.78,
    "claimApprovalRate": 92.5
  }
}
```

### Get Warranty Statistics by Type
```http
GET /warranties/stats/by-type
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "type": "Extended Warranty",
      "count": 120,
      "activeCount": 110,
      "totalClaims": 30,
      "totalValue": 85000.00
    },
    {
      "type": "Powertrain Warranty",
      "count": 80,
      "activeCount": 70,
      "totalClaims": 15,
      "totalValue": 40000.00
    }
  ]
}
```

## Customer API

### Get Customer Profile
```http
GET /customers/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "address": {
      "street": "123 Main St",
      "city": "Anytown",
      "state": "CA",
      "zipCode": "12345"
    },
    "joinDate": "2023-01-15T00:00:00.000Z",
    "status": "active",
    "totalSpent": 8500.00,
    "vehicles": 2,
    "appointments": 12
  }
}
```

### Update Customer Profile
```http
PUT /customers/:id
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1234567890",
  "address": {
    "street": "456 Oak Ave",
    "city": "Somewhere",
    "state": "CA",
    "zipCode": "54321"
  }
}
```

### Get Customer Vehicles
```http
GET /customers/:id/vehicles
```

### Get Customer Appointments
```http
GET /customers/:id/appointments
```

### Get Customer Service History
```http
GET /customers/:id/service-history
```

## Vehicle API

### Get Vehicle Details
```http
GET /vehicles/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "customerId": "507f1f77bcf86cd799439012",
    "make": "Honda",
    "model": "Civic",
    "year": 2020,
    "vin": "1HGBH41JXMN109186",
    "licensePlate": "ABC123",
    "color": "Blue",
    "mileage": 45000,
    "lastServiceDate": "2024-01-15T00:00:00.000Z",
    "nextServiceDate": "2024-04-15T00:00:00.000Z",
    "estimatedValue": 18500.00,
    "status": "active"
  }
}
```

### Create Vehicle
```http
POST /vehicles
```

**Request Body:**
```json
{
  "customerId": "507f1f77bcf86cd799439012",
  "make": "Toyota",
  "model": "Camry",
  "year": 2019,
  "vin": "4T1B11HK5JU123456",
  "licensePlate": "XYZ789",
  "color": "Silver",
  "mileage": 35000
}
```

### Update Vehicle
```http
PUT /vehicles/:id
```

**Request Body:**
```json
{
  "mileage": 48000,
  "nextServiceDate": "2024-05-15"
}
```

### Delete Vehicle
```http
DELETE /vehicles/:id
```

### Get Vehicle Service History
```http
GET /vehicles/:id/service-history
```

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Invalid request data |
| `DUPLICATE_ENTRY` | Resource already exists |
| `INTERNAL_ERROR` | Server error |

### Example Error Response
```json
{
  "success": false,
  "error": {
    "message": "Membership plan not found",
    "code": "NOT_FOUND",
    "details": {
      "planId": "507f1f77bcf86cd799439011"
    }
  }
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute
- **General endpoints**: 100 requests per minute
- **File upload endpoints**: 10 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Pagination

List endpoints support pagination:

### Query Parameters
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `sort` - Sort field
- `order` - Sort order (asc, desc)

### Response Format
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## File Upload

### Upload File
```http
POST /upload
Content-Type: multipart/form-data
```

**Form Data:**
- `file` - File to upload
- `type` - File type (warranty_claim, vehicle_image, etc.)

**Response:**
```json
{
  "success": true,
  "data": {
    "filename": "document.pdf",
    "url": "https://storage.example.com/files/document.pdf",
    "size": 1024000,
    "type": "application/pdf"
  }
}
```

## Webhooks

### Webhook Endpoints
```http
POST /webhooks/membership-renewal
POST /webhooks/warranty-expiry
POST /webhooks/service-reminder
```

### Webhook Payload Example
```json
{
  "event": "membership.renewal",
  "timestamp": "2024-01-15T10:00:00.000Z",
  "data": {
    "customerId": "507f1f77bcf86cd799439012",
    "membershipId": "507f1f77bcf86cd799439011",
    "renewalDate": "2024-02-01T00:00:00.000Z"
  }
}
```

## Testing

### Test Environment
```
Base URL: https://api-test.example.com
```

### Test Data
Use the following test customer ID for development:
```
Customer ID: 507f1f77bcf86cd799439012
```

### Postman Collection
Import the Postman collection from:
```
https://api.example.com/postman-collection.json
```

## SDKs

### JavaScript/TypeScript
```bash
npm install @auto-bb/api-client
```

```javascript
import { AutoBBClient } from '@auto-bb/api-client';

const client = new AutoBBClient({
  baseURL: 'https://api.example.com',
  token: 'your-jwt-token'
});

const memberships = await client.memberships.getAll();
```

### Python
```bash
pip install auto-bb-api
```

```python
from auto_bb_api import AutoBBClient

client = AutoBBClient(
    base_url='https://api.example.com',
    token='your-jwt-token'
)

memberships = client.memberships.get_all()
```

## Support

For API support:
- Email: api-support@example.com
- Documentation: https://docs.example.com
- Status page: https://status.example.com

---

**Last Updated**: January 2024
**Version**: 1.0.0

