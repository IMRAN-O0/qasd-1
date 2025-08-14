require('dotenv').config({ path: '.env.test' });
const db = require('../db');

// Ensure JWT secrets exist for tests
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_123';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test_refresh_secret_456';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
process.env.JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '1d';

beforeAll(async () => {
  // Run migrations and seeds on the shared knex instance
  await db.migrate.latest();
  await db.seed.run();
});

afterAll(async () => {
  await db.destroy();
});

module.exports = db;