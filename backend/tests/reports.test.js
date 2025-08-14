const request = require('supertest');
const { app } = require('../server');

describe('Reports API', () => {
  let agent;
  let accessToken;

  beforeAll(async () => {
    agent = request(app);
    
    // Login to get access token
    const loginRes = await agent
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'password123' });
    
    accessToken = loginRes.body.data.tokens.accessToken;
  });

  test('GET /api/reports/dashboard should return dashboard data', async () => {
    const res = await agent
      .get('/api/reports/dashboard')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('dashboard');
  });

  test('GET /api/reports/inventory should return inventory report', async () => {
    const res = await agent
      .get('/api/reports/inventory')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('inventory');
  });

  test('GET /api/reports/financial should return financial report', async () => {
    const res = await agent
      .get('/api/reports/financial')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('financial');
  });

  test('GET /api/reports/production should return production report', async () => {
    const res = await agent
      .get('/api/reports/production')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('production');
  });

  test('GET /api/reports/custom should allow admin access', async () => {
    const res = await agent
      .get('/api/reports/custom')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('reports');
  });

  test('GET /api/reports/analytics should return analytics data', async () => {
    const res = await agent
      .get('/api/reports/analytics')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('analytics');
  });
});