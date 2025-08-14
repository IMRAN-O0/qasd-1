const request = require('supertest');
const { app } = require('../server');
const db = require('./setup');

describe('Sales API', () => {
  let agent;
  let token;

  beforeAll(async () => {
    agent = request(app);
    // Login to get token
    const login = await agent
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'password123' });
    token = login.body.data.tokens.accessToken;
  });

  describe('Customers', () => {
    test('GET /api/sales/customers should return customers list', async () => {
      const res = await agent
        .get('/api/sales/customers')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('customers');
      expect(Array.isArray(res.body.data.customers)).toBe(true);
    });

    test('GET /api/sales/customers/:id should return specific customer', async () => {
      const res = await agent
        .get('/api/sales/customers/1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('customer');
      expect(res.body.data.customer.id).toBe(1);
    });

    test('POST /api/sales/customers should create new customer', async () => {
      const uniqueCode = `TEST-${Date.now()}`;
      const customerData = {
        name: 'Test Customer',
        code: uniqueCode,
        email: 'test@test.com',
        phone: '123456789',
        city: 'Test City'
      };

      const res = await agent
        .post('/api/sales/customers')
        .set('Authorization', `Bearer ${token}`)
        .send(customerData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('customer');
      expect(res.body.data.customer.name).toBe(customerData.name);
    });

    test('PUT /api/sales/customers/:id should update customer', async () => {
      const updateData = {
        name: 'Updated Customer Name',
        email: 'updated@test.com'
      };

      const res = await agent
        .put('/api/sales/customers/1')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('customer');
      expect(res.body.data.customer.name).toBe(updateData.name);
    });
  });

  describe('Quotations', () => {
    test('GET /api/sales/quotations should return quotations list', async () => {
      const res = await agent
        .get('/api/sales/quotations')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('quotations');
      expect(Array.isArray(res.body.data.quotations)).toBe(true);
    });

    test('POST /api/sales/quotations should create new quotation', async () => {
      const quotationData = {
        customer_id: 1,
        date: '2024-01-01',
        valid_until: '2024-02-01',
        notes: 'Test quotation',
        items: [
          {
            product_id: 1,
            quantity: 10,
            unit_price: 50.00
          }
        ]
      };

      const res = await agent
        .post('/api/sales/quotations')
        .set('Authorization', `Bearer ${token}`)
        .send(quotationData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('quotation');
      expect(res.body.data.quotation.customer_id).toBe(quotationData.customer_id);
    });
  });
});