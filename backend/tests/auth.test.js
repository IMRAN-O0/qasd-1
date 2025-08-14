const request = require('supertest');
const { app } = require('../server');
const db = require('./setup');

describe('Auth API', () => {
  let agent;
  beforeAll(async () => {
    agent = request(app);
  });

  test('POST /api/auth/login should succeed with seeded admin user', async () => {
    const res = await agent
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'password123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('user');
    expect(res.body.data).toHaveProperty('tokens');
    expect(res.body.data.tokens).toHaveProperty('accessToken');
  });

  test('GET /api/auth/me should return user info with token', async () => {
    const login = await agent
      .post('/api/auth/login')
      .send({ username: 'admin', password: 'password123' });

    const token = login.body.data.tokens.accessToken;
    const res = await agent
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.data).toHaveProperty('user');
    expect(res.body.data.user.username).toBe('admin');
  });
});