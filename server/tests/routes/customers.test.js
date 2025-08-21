const request = require('supertest');
const express = require('express');
const customerRoutes = require('../../routes/customers');
const { createTestUser, createTestCustomer, generateTestToken } = require('../helpers/testUtils');
const { authenticateToken } = require('../../middleware/auth');

const app = express();
app.use(express.json());
app.use('/api/customers', authenticateToken, customerRoutes);

describe('Customer Routes', () => {
  let adminUser, adminToken, customerUser, customerToken;

  beforeEach(async () => {
    adminUser = await createTestUser('admin');
    adminToken = generateTestToken(adminUser);
    customerUser = await createTestUser('customer');
    customerToken = generateTestToken(customerUser);
  });

  describe('GET /api/customers', () => {
    it('should get all customers for admin', async () => {
      await createTestCustomer();
      await createTestCustomer({
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        phone: '987-654-3210'
      });

      const response = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.customers).toBeInstanceOf(Array);
      expect(response.body.data.customers.length).toBeGreaterThanOrEqual(2);
    });

    it('should reject access for non-admin users', async () => {
      const response = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/customers', () => {
    it('should create a new customer successfully', async () => {
      const newCustomerData = {
        name: 'New Customer',
        email: 'newcustomer@example.com',
        phone: '555-123-4567',
        status: 'active'
      };

      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newCustomerData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.customer.name).toBe(newCustomerData.name);
    });

    it('should reject creation with duplicate email', async () => {
      await createTestCustomer();

      const duplicateCustomerData = {
        name: 'Duplicate Customer',
        email: 'john.doe@example.com',
        phone: '555-999-8888'
      };

      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(duplicateCustomerData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/customers/:id', () => {
    it('should get customer by ID for admin', async () => {
      const customer = await createTestCustomer();

      const response = await request(app)
        .get(`/api/customers/${customer._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.customer._id).toBe(customer._id.toString());
    });

    it('should return 404 for non-existent customer', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .get(`/api/customers/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/customers/:id', () => {
    it('should update customer successfully for admin', async () => {
      const customer = await createTestCustomer();
      const updateData = {
        name: 'Updated Customer Name',
        phone: '555-999-8888'
      };

      const response = await request(app)
        .put(`/api/customers/${customer._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.customer.name).toBe(updateData.name);
    });
  });

  describe('DELETE /api/customers/:id', () => {
    it('should delete customer successfully for admin', async () => {
      const customer = await createTestCustomer();

      const response = await request(app)
        .delete(`/api/customers/${customer._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });
});
