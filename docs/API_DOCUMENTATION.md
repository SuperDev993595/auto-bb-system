# Auto Repair CRM API Documentation

## Overview
This document provides comprehensive documentation for the Auto Repair CRM API endpoints.

**Base URL:** `http://localhost:3001`

**Authentication:** Most endpoints require JWT authentication via the `Authorization` header:
`Authorization: Bearer <your-jwt-token>`

## Table of Contents
- [Other](#other)
- [Appointment Management](#appointment-management)
- [Authentication](#authentication)
- [Customer Management](#customer-management)
- [Health & Monitoring](#health-&-monitoring)
- [Inventory Management](#inventory-management)
- [Invoice Management](#invoice-management)
- [Metrics & Analytics](#metrics-&-analytics)
- [Reports & Analytics](#reports-&-analytics)
- [Service Management](#service-management)
- [User Management](#user-management)

---

## Other

### GET /api/admin/health

**Access:** 

**Method:** `GET`

**URL:** `http://localhost:3001/api/admin/health`

**Authentication:** Required

**Response Example:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "example": "response data"
  }
}
```


---

### GET /api/businessClients/stats/overview

**Access:** 

**Method:** `GET`

**URL:** `http://localhost:3001/api/businessClients/stats/overview`

**Authentication:** Required

**Response Example:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "example": "response data"
  }
}
```


---

### GET /api/chat/stats

**Access:** 

**Method:** `GET`

**URL:** `http://localhost:3001/api/chat/stats`

**Authentication:** Required

**Response Example:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "example": "response data"
  }
}
```


---

### GET /api/collections/stats

**Access:** 

**Method:** `GET`

**URL:** `http://localhost:3001/api/collections/stats`

**Authentication:** Required

**Response Example:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "example": "response data"
  }
}
```


---

### DELETE /api/communicationLogs/:id

**Access:** 

**Method:** `DELETE`

**URL:** `http://localhost:3001/api/communicationLogs/:id`

**Authentication:** Required

**Response Example:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "example": "response data"
  }
}
```


---

### GET /api/dashboard/realtime

**Access:** 

**Method:** `GET`

**URL:** `http://localhost:3001/api/dashboard/realtime`

**Authentication:** Required

**Response Example:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "example": "response data"
  }
}
```


---

### GET /api/email/click/:trackingId

**Access:** 

**Method:** `GET`

**URL:** `http://localhost:3001/api/email/click/:trackingId`

**Authentication:** Required

**Response Example:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "example": "response data"
  }
}
```


---

### GET /api/mailchimp/stats/overview

**Access:** 

**Method:** `GET`

**URL:** `http://localhost:3001/api/mailchimp/stats/overview`

**Authentication:** Required

**Response Example:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "example": "response data"
  }
}
```


---

### GET /api/marketing/campaigns/stats/overview

**Access:** 

**Method:** `GET`

**URL:** `http://localhost:3001/api/marketing/campaigns/stats/overview`

**Authentication:** Required

**Response Example:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "example": "response data"
  }
}
```


---

### GET /api/promotions/active

**Access:** 

**Method:** `GET`

**URL:** `http://localhost:3001/api/promotions/active`

**Authentication:** Required

**Response Example:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "example": "response data"
  }
}
```


---

### PATCH /api/reminders/templates/:id/toggle

**Access:** 

**Method:** `PATCH`

**URL:** `http://localhost:3001/api/reminders/templates/:id/toggle`

**Authentication:** Required

**Response Example:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "example": "response data"
  }
}
```


---

### GET /api/sales/pipeline

**Access:** 

**Method:** `GET`

**URL:** `http://localhost:3001/api/sales/pipeline`

**Authentication:** Required

**Response Example:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "example": "response data"
  }
}
```


---

### POST /api/sms/templates/:id/use

**Access:** 

**Method:** `POST`

**URL:** `http://localhost:3001/api/sms/templates/:id/use`

**Authentication:** Required

**Request Example:**
```json
{
  "example": "data"
}
```

**Response Example:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "example": "response data"
  }
}
```


---

### POST /api/systemAdmin/system/test-connectivity

**Access:** 

**Method:** `POST`

**URL:** `http://localhost:3001/api/systemAdmin/system/test-connectivity`

**Authentication:** Required

**Request Example:**
```json
{
  "example": "data"
}
```

**Response Example:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "example": "response data"
  }
}
```


---

### GET /api/tasks/overdue

**Access:** 

**Method:** `GET`

**URL:** `http://localhost:3001/api/tasks/overdue`

**Authentication:** Required

**Response Example:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "example": "response data"
  }
}
```


---

### DELETE /api/upload/:filename

**Access:** 

**Method:** `DELETE`

**URL:** `http://localhost:3001/api/upload/:filename`

**Authentication:** Required

**Response Example:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "example": "response data"
  }
}
```


---

### POST /api/yellowpages/:id/convert-to-customer

**Access:** 

**Method:** `POST`

**URL:** `http://localhost:3001/api/yellowpages/:id/convert-to-customer`

**Authentication:** Required

**Request Example:**
```json
{
  "example": "data"
}
```

**Response Example:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "example": "response data"
  }
}
```


---

## Appointment Management

### POST /api/appointments/bulk-update

**Access:** 

**Method:** `POST`

**URL:** `http://localhost:3001/api/appointments/bulk-update`

**Authentication:** Required

**Request Example:**
```json
{
  "example": "data"
}
```

**Response Example:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "example": "response data"
  }
}
```


---

## Authentication

### GET /api/auth/me

**Access:** 

**Method:** `GET`

**URL:** `http://localhost:3001/api/auth/me`

**Authentication:** Required

**Response Example:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "example": "response data"
  }
}
```


---

## Customer Management

### DELETE /api/customers/:customerId/call-logs/:callLogId

**Access:** 

**Method:** `DELETE`

**URL:** `http://localhost:3001/api/customers/:customerId/call-logs/:callLogId`

**Authentication:** Required

**Response Example:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "example": "response data"
  }
}
```


---

## Health & Monitoring

### GET /api/health/live

**Access:** 

**Method:** `GET`

**URL:** `http://localhost:3001/api/health/live`

**Authentication:** Required

**Response Example:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "example": "response data"
  }
}
```


---

## Inventory Management

### GET /api/inventory/locations

**Access:** 

**Method:** `GET`

**URL:** `http://localhost:3001/api/inventory/locations`

**Authentication:** Required

**Response Example:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "example": "response data"
  }
}
```


---

## Invoice Management

### POST /api/invoices/mark-overdue

**Access:** 

**Method:** `POST`

**URL:** `http://localhost:3001/api/invoices/mark-overdue`

**Authentication:** Required

**Request Example:**
```json
{
  "example": "data"
}
```

**Response Example:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "example": "response data"
  }
}
```


---

## Metrics & Analytics

### GET /api/metrics/services

**Access:** 

**Method:** `GET`

**URL:** `http://localhost:3001/api/metrics/services`

**Authentication:** Required

**Response Example:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "example": "response data"
  }
}
```


---

## Reports & Analytics

### POST /api/reports/email/work-completion

**Access:** 

**Method:** `POST`

**URL:** `http://localhost:3001/api/reports/email/work-completion`

**Authentication:** Required

**Request Example:**
```json
{
  "example": "data"
}
```

**Response Example:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "example": "response data"
  }
}
```


---

## Service Management

### GET /api/services/technicians/available

**Access:** 

**Method:** `GET`

**URL:** `http://localhost:3001/api/services/technicians/available`

**Authentication:** Required

**Response Example:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "example": "response data"
  }
}
```


---

## User Management

### GET /api/users/stats/overview

**Access:** 

**Method:** `GET`

**URL:** `http://localhost:3001/api/users/stats/overview`

**Authentication:** Required

**Response Example:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "example": "response data"
  }
}
```


---

