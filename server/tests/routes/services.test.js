const request = require('supertest');
const express = require('express');
const servicesRoutes = require('../../routes/services');
const { createTestUser, generateTestToken } = require('../helpers/testUtils');
const { authenticateToken } = require('../../middleware/auth');

const app = express();
app.use(express.json());
app.use('/api/services', authenticateToken, servicesRoutes);

describe('Services Routes', () => {
  let adminUser, adminToken, customerUser, customerToken;

  beforeEach(async () => {
    adminUser = await createTestUser('admin');
    adminToken = generateTestToken(adminUser);
    customerUser = await createTestUser('customer');
    customerToken = generateTestToken(customerUser);
  });

  describe('GET /api/services', () => {
    it('should get all services', async () => {
      const response = await request(app)
        .get('/api/services')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.services).toBeInstanceOf(Array);
    });

    it('should support category filtering', async () => {
      const response = await request(app)
        .get('/api/services?category=maintenance')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should support search functionality', async () => {
      const response = await request(app)
        .get('/api/services?search=oil')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should reject access for non-admin users', async () => {
      const response = await request(app)
        .get('/api/services')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/services', () => {
    it('should create service successfully', async () => {
      const serviceData = {
        name: 'Oil Change Service',
        description: 'Complete oil change with filter replacement',
        category: 'maintenance',
        basePrice: 45.00,
        estimatedDuration: 60,
        isActive: true
      };

      const response = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(serviceData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.service.name).toBe(serviceData.name);
      expect(response.body.data.service.basePrice).toBe(serviceData.basePrice);
    });

    it('should reject creation with invalid data', async () => {
      const invalidServiceData = {
        name: '', // Empty name
        description: '', // Empty description
        category: 'invalid-category', // Invalid category
        basePrice: -10.00, // Negative price
        estimatedDuration: -30 // Negative duration
      };

      const response = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidServiceData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject creation with duplicate service name', async () => {
      // First create a service
      const serviceData = {
        name: 'Oil Change Service',
        description: 'Complete oil change with filter replacement',
        category: 'maintenance',
        basePrice: 45.00,
        estimatedDuration: 60,
        isActive: true
      };

      await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(serviceData);

      // Try to create another service with the same name
      const duplicateServiceData = {
        name: 'Oil Change Service', // Same name
        description: 'Different description',
        category: 'maintenance',
        basePrice: 50.00,
        estimatedDuration: 60,
        isActive: true
      };

      const response = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(duplicateServiceData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/services/:id', () => {
    it('should get service by ID', async () => {
      // First create a service
      const serviceData = {
        name: 'Brake Service',
        description: 'Complete brake inspection and repair',
        category: 'repair',
        basePrice: 150.00,
        estimatedDuration: 120,
        isActive: true
      };

      const createResponse = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(serviceData);

      const serviceId = createResponse.body.data.service._id;

      const response = await request(app)
        .get(`/api/services/${serviceId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.service._id).toBe(serviceId);
      expect(response.body.data.service.name).toBe(serviceData.name);
    });

    it('should return 404 for non-existent service', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .get(`/api/services/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/services/:id', () => {
    it('should update service successfully', async () => {
      // First create a service
      const serviceData = {
        name: 'Tire Rotation',
        description: 'Rotate tires and balance wheels',
        category: 'maintenance',
        basePrice: 35.00,
        estimatedDuration: 45,
        isActive: true
      };

      const createResponse = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(serviceData);

      const serviceId = createResponse.body.data.service._id;

      const updateData = {
        name: 'Tire Rotation & Balance',
        basePrice: 40.00,
        estimatedDuration: 60
      };

      const response = await request(app)
        .put(`/api/services/${serviceId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.service.name).toBe(updateData.name);
      expect(response.body.data.service.basePrice).toBe(updateData.basePrice);
    });

    it('should reject update with invalid data', async () => {
      // First create a service
      const serviceData = {
        name: 'AC Service',
        description: 'Air conditioning service',
        category: 'maintenance',
        basePrice: 80.00,
        estimatedDuration: 90,
        isActive: true
      };

      const createResponse = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(serviceData);

      const serviceId = createResponse.body.data.service._id;

      const invalidUpdateData = {
        name: '', // Empty name
        basePrice: -20.00, // Negative price
        category: 'invalid-category' // Invalid category
      };

      const response = await request(app)
        .put(`/api/services/${serviceId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidUpdateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/services/:id', () => {
    it('should delete service successfully', async () => {
      // First create a service
      const serviceData = {
        name: 'Battery Replacement',
        description: 'Replace car battery',
        category: 'repair',
        basePrice: 120.00,
        estimatedDuration: 30,
        isActive: true
      };

      const createResponse = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(serviceData);

      const serviceId = createResponse.body.data.service._id;

      const response = await request(app)
        .delete(`/api/services/${serviceId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent service', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/api/services/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/services/categories', () => {
    it('should get all service categories', async () => {
      const response = await request(app)
        .get('/api/services/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.categories).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/services/:id/pricing', () => {
    it('should update service pricing successfully', async () => {
      // First create a service
      const serviceData = {
        name: 'Engine Tune-up',
        description: 'Complete engine tune-up',
        category: 'maintenance',
        basePrice: 200.00,
        estimatedDuration: 180,
        isActive: true
      };

      const createResponse = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(serviceData);

      const serviceId = createResponse.body.data.service._id;

      const pricingData = {
        basePrice: 220.00,
        laborRate: 85.00,
        partsMarkup: 0.15
      };

      const response = await request(app)
        .post(`/api/services/${serviceId}/pricing`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(pricingData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.service.basePrice).toBe(pricingData.basePrice);
    });

    it('should reject pricing update with invalid data', async () => {
      // First create a service
      const serviceData = {
        name: 'Transmission Service',
        description: 'Transmission fluid change',
        category: 'maintenance',
        basePrice: 150.00,
        estimatedDuration: 120,
        isActive: true
      };

      const createResponse = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(serviceData);

      const serviceId = createResponse.body.data.service._id;

      const invalidPricingData = {
        basePrice: -50.00, // Negative price
        laborRate: -20.00, // Negative labor rate
        partsMarkup: 1.5 // Invalid markup (should be decimal)
      };

      const response = await request(app)
        .post(`/api/services/${serviceId}/pricing`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidPricingData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/services/:id/technicians', () => {
    it('should get technicians for service', async () => {
      // First create a service
      const serviceData = {
        name: 'Diagnostic Service',
        description: 'Engine diagnostic service',
        category: 'diagnostic',
        basePrice: 75.00,
        estimatedDuration: 60,
        isActive: true
      };

      const createResponse = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(serviceData);

      const serviceId = createResponse.body.data.service._id;

      const response = await request(app)
        .get(`/api/services/${serviceId}/technicians`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.technicians).toBeInstanceOf(Array);
    });
  });

  describe('POST /api/services/:id/technicians', () => {
    it('should assign technicians to service', async () => {
      // First create a service
      const serviceData = {
        name: 'Electrical Repair',
        description: 'Electrical system repair',
        category: 'repair',
        basePrice: 100.00,
        estimatedDuration: 90,
        isActive: true
      };

      const createResponse = await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(serviceData);

      const serviceId = createResponse.body.data.service._id;

      const technicianData = {
        technicianIds: ['507f1f77bcf86cd799439011', '507f1f77bcf86cd799439012']
      };

      const response = await request(app)
        .post(`/api/services/${serviceId}/technicians`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(technicianData)
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/services/stats/overview', () => {
    it('should get service statistics', async () => {
      const response = await request(app)
        .get('/api/services/stats/overview')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalServices');
      expect(response.body.data).toHaveProperty('activeServices');
      expect(response.body.data).toHaveProperty('servicesByCategory');
    });

    it('should reject access for non-admin users', async () => {
      const response = await request(app)
        .get('/api/services/stats/overview')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/services/import', () => {
    it('should import services from CSV successfully', async () => {
      const csvData = `name,description,category,basePrice,estimatedDuration,isActive
Oil Change,Complete oil change,maintenance,45.00,60,true
Brake Service,Brake inspection and repair,repair,150.00,120,true`;

      const response = await request(app)
        .post('/api/services/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('file', Buffer.from(csvData), {
          filename: 'services.csv',
          contentType: 'text/csv'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should reject import without file', async () => {
      const response = await request(app)
        .post('/api/services/import')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/services/export', () => {
    it('should export services to CSV successfully', async () => {
      // Create some test services first
      await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Service 1',
          description: 'Test description 1',
          category: 'maintenance',
          basePrice: 50.00,
          estimatedDuration: 60,
          isActive: true
        });

      await request(app)
        .post('/api/services')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Test Service 2',
          description: 'Test description 2',
          category: 'repair',
          basePrice: 100.00,
          estimatedDuration: 120,
          isActive: true
        });

      const response = await request(app)
        .get('/api/services/export')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.headers['content-type']).toContain('text/csv');
      expect(response.headers['content-disposition']).toContain('attachment');
    });
  });
});
