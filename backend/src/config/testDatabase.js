const knex = require('knex');
const config = require('../../knexfile');
const logger = require('../utils/logger');

class TestDatabase {
  constructor() {
    this.db = null;
  }

  async connect() {
    try {
      this.db = knex({
        ...config.development,
        connection: {
          ...config.development.connection,
          database: (config.development.connection.database || 'qasd') + '_test'
        }
      });
      
      // Test connection
      await this.db.raw('SELECT 1');
      logger.info('Connected to test database successfully');
      return this.db;
    } catch (error) {
      logger.error('Failed to connect to test database:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.db) {
      await this.db.destroy();
      logger.info('Disconnected from test database');
    }
  }

  getConnection() {
    return this.db;
  }

  // Wrapper methods to simulate sqlite-style interface
  async get(sql, params = []) {
    try {
      const result = await this.db.raw(sql, params);
      return result[0] && result[0][0] ? result[0][0] : null;
    } catch (error) {
      logger.error('Database get error:', error);
      throw error;
    }
  }

  async all(sql, params = []) {
    try {
      const result = await this.db.raw(sql, params);
      return result[0] || [];
    } catch (error) {
      logger.error('Database all error:', error);
      throw error;
    }
  }

  async run(sql, params = []) {
    try {
      const result = await this.db.raw(sql, params);
      return {
        id: result[0].insertId || result[0].affectedRows || 0,
        changes: result[0].affectedRows || 0
      };
    } catch (error) {
      logger.error('Database run error:', error);
      throw error;
    }
  }
}

const testDatabase = new TestDatabase();

async function initializeTestDatabase() {
  await testDatabase.connect();
  return testDatabase;
}

module.exports = {
  TestDatabase,
  initializeTestDatabase,
  database: testDatabase,
  getConnection: () => testDatabase.getConnection()
};