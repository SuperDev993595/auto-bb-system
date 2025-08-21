const request = require('supertest');
const express = require('express');
const appointmentRoutes = require('../../routes/appointments');
const { createTestUser, createTestCustomer, generateTestToken } = require('../helpers/testUtils');
const { authenticateToken } = require('../../middleware/auth');

const app = express();
app.use(express.json());
app.use('/api/appointments', authenticateToken, appointmentRoutes);

describe('Appointment Routes', () => {
  let adminUser, adminToken, customerUser, customerToken, testCustomer;

  beforeEach(async () => {
    adminUser = await createTestUser('admin');
    adminToken = generateTestToken(adminUser);
    customerUser = await createTestUser('customer');
    customerToken = generateTestToken(customerUser);
    testCustomer = await createTestCustomer();
  });

  describe('GET /api/appointments', () => {
    it('should get all appointments for admin', async () => {
      const response = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.appointments).toBeInstanceOf(Array);
    });

    it('should support date filtering', async () => {
      const response = await request(app)
        .get('/api/appointments?date=2024-12-25')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should support status filtering', async () => {
      const response = await request(app)
        .get('/api/appointments?status=scheduled')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should reject access for non-admin users', async () => {
      const response = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/appointments', () => {
    it('should create appointment successfully', async () => {
      const appointmentData = {
        customerId: testCustomer._id,
        date: '2024-12-25',
        time: '10:00',
        serviceType: 'Oil Change',
        vehicleId: '507f1f77bcf86cd799439011',
        notes: 'Regular maintenance',
        status: 'scheduled'
      };

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(appointmentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.appointment.serviceType).toBe(appointmentData.serviceType);
    });

    it('should reject creation with invalid data', async () => {
      const invalidData = {
        customerId: testCustomer._id,
        date: 'invalid-date',
        time: '25:00',
        serviceType: '',
        status: 'invalid-status'
      };

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject creation with non-existent customer', async () => {
      const appointmentData = {
        customerId: '507f1f77bcf86cd799439011',
        date: '2024-12-25',
        time: '10:00',
        serviceType: 'Oil Change',
        status: 'scheduled'
      };

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(appointmentData)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/appointments/:id', () => {
    it('should get appointment by ID', async () => {
      // First create an appointment
      const appointmentData = {
        customerId: testCustomer._id,
        date: '2024-12-25',
        time: '10:00',
        serviceType: 'Oil Change',
        status: 'scheduled'
      };

      const createResponse = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(appointmentData);

      const appointmentId = createResponse.body.data.appointment._id;

      const response = await request(app)
        .get(`/api/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.appointment._id).toBe(appointmentId);
    });

    it('should return 404 for non-existent appointment', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .get(`/api/appointments/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/appointments/:id', () => {
    it('should update appointment successfully', async () => {
      // First create an appointment
      const appointmentData = {
        customerId: testCustomer._id,
        date: '2024-12-25',
        time: '10:00',
        serviceType: 'Oil Change',
        status: 'scheduled'
      };

      const createResponse = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(appointmentData);

      const appointmentId = createResponse.body.data.appointment._id;

      const updateData = {
        time: '11:00',
        notes: 'Updated notes',
        status: 'confirmed'
      };

      const response = await request(app)
        .put(`/api/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.appointment.time).toBe(updateData.time);
      expect(response.body.data.appointment.status).toBe(updateData.status);
    });

    it('should reject update with invalid data', async () => {
      // First create an appointment
      const appointmentData = {
        customerId: testCustomer._id,
        date: '2024-12-25',
        time: '10:00',
        serviceType: 'Oil Change',
        status: 'scheduled'
      };

      const createResponse = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(appointmentData);

      const appointmentId = createResponse.body.data.appointment._id;

      const invalidUpdateData = {
        time: '25:00', // Invalid time
        status: 'invalid-status' // Invalid status
      };

      const response = await request(app)
        .put(`/api/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidUpdateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/appointments/:id', () => {
    it('should delete appointment successfully', async () => {
      // First create an appointment
      const appointmentData = {
        customerId: testCustomer._id,
        date: '2024-12-25',
        time: '10:00',
        serviceType: 'Oil Change',
        status: 'scheduled'
      };

      const createResponse = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(appointmentData);

      const appointmentId = createResponse.body.data.appointment._id;

      const response = await request(app)
        .delete(`/api/appointments/${appointmentId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent appointment', async () => {
      const fakeId = '507f1f77bcf86cd799439011';

      const response = await request(app)
        .delete(`/api/appointments/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/appointments/:id/status', () => {
    it('should update appointment status successfully', async () => {
      // First create an appointment
      const appointmentData = {
        customerId: testCustomer._id,
        date: '2024-12-25',
        time: '10:00',
        serviceType: 'Oil Change',
        status: 'scheduled'
      };

      const createResponse = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(appointmentData);

      const appointmentId = createResponse.body.data.appointment._id;

      const statusData = {
        status: 'in-progress',
        notes: 'Work started'
      };

      const response = await request(app)
        .put(`/api/appointments/${appointmentId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(statusData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.appointment.status).toBe(statusData.status);
    });

    it('should reject invalid status update', async () => {
      // First create an appointment
      const appointmentData = {
        customerId: testCustomer._id,
        date: '2024-12-25',
        time: '10:00',
        serviceType: 'Oil Change',
        status: 'scheduled'
      };

      const createResponse = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(appointmentData);

      const appointmentId = createResponse.body.data.appointment._id;

      const invalidStatusData = {
        status: 'invalid-status'
      };

      const response = await request(app)
        .put(`/api/appointments/${appointmentId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidStatusData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/appointments/calendar/:date', () => {
    it('should get appointments for specific date', async () => {
      const response = await request(app)
        .get('/api/appointments/calendar/2024-12-25')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.appointments).toBeInstanceOf(Array);
    });

    it('should handle invalid date format', async () => {
      const response = await request(app)
        .get('/api/appointments/calendar/invalid-date')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/appointments/stats/overview', () => {
    it('should get appointment statistics', async () => {
      const response = await request(app)
        .get('/api/appointments/stats/overview')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalAppointments');
      expect(response.body.data).toHaveProperty('scheduledAppointments');
      expect(response.body.data).toHaveProperty('completedAppointments');
    });

    it('should reject access for non-admin users', async () => {
      const response = await request(app)
        .get('/api/appointments/stats/overview')
        .set('Authorization', `Bearer ${customerToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/appointments/bulk-update', () => {
    it('should update multiple appointments successfully', async () => {
      // Create multiple appointments first
      const appointment1 = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId: testCustomer._id,
          date: '2024-12-25',
          time: '10:00',
          serviceType: 'Oil Change',
          status: 'scheduled'
        });

      const appointment2 = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customerId: testCustomer._id,
          date: '2024-12-26',
          time: '11:00',
          serviceType: 'Brake Service',
          status: 'scheduled'
        });

      const bulkUpdateData = {
        appointmentIds: [
          appointment1.body.data.appointment._id,
          appointment2.body.data.appointment._id
        ],
        updates: {
          status: 'confirmed',
          notes: 'Bulk update test'
        }
      };

      const response = await request(app)
        .post('/api/appointments/bulk-update')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(bulkUpdateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.updatedCount).toBe(2);
    });

    it('should reject bulk update with invalid data', async () => {
      const invalidBulkUpdateData = {
        appointmentIds: ['invalid-id'],
        updates: {
          status: 'invalid-status'
        }
      };

      const response = await request(app)
        .post('/api/appointments/bulk-update')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidBulkUpdateData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
