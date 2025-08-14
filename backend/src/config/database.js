const logger = require('../utils/logger');
const db = require('../../db');

class Database {
  constructor() {
    this.db = db; // Use shared knex instance
  }

  async connect() {
    try {
      // Test connection
      await this.db.raw('SELECT 1');
      const dbType = this.db.client.config.client;
      logger.info(`Connected to ${dbType} database successfully`);
      return this.db;
    } catch (error) {
      logger.error('Failed to connect to database:', error);
      throw error;
    }
  }

  async disconnect() {
    if (this.db) {
      await this.db.destroy();
      logger.info('Disconnected from database');
    }
  }

  getConnection() {
    return this.db;
  }

  // Provide sqlite-style helpers expected by routes
  async get(sql, params = []) {
    try {
      const result = await this.db.raw(sql, params);
      const dbType = this.db.client.config.client;
      
      if (dbType === 'sqlite3') {
        return result[0] || null;
      } else {
        // For mysql2 dialect, result[0] is rows array
        const rows = Array.isArray(result) ? result[0] : result;
        return rows && rows[0] ? rows[0] : null;
      }
    } catch (error) {
      logger.error('Database get error:', error);
      throw error;
    }
  }

  async all(sql, params = []) {
    try {
      const result = await this.db.raw(sql, params);
      const dbType = this.db.client.config.client;
      
      if (dbType === 'sqlite3') {
        return result || [];
      } else {
        return Array.isArray(result) ? (result[0] || []) : (result || []);
      }
    } catch (error) {
      logger.error('Database all error:', error);
      throw error;
    }
  }

  async run(sql, params = []) {
    try {
      const result = await this.db.raw(sql, params);
      const dbType = this.db.client.config.client;
      
      if (dbType === 'sqlite3') {
        return {
          id: result.lastID || 0,
          changes: result.changes || 0
        };
      } else {
        // mysql2 returns [res, fields]; res has insertId/affectedRows
        const res = Array.isArray(result) ? result[0] : result;
        return {
          id: (res && (res.insertId || res.lastInsertId)) || 0,
          changes: (res && res.affectedRows) || 0
        };
      }
    } catch (error) {
      logger.error('Database run error:', error);
      throw error;
    }
  }
}

const databaseInstance = new Database();

async function initializeDatabase() {
  await databaseInstance.connect();
  return databaseInstance.getConnection();
}

module.exports = {
  Database,
  initializeDatabase,
  getConnection: () => databaseInstance.getConnection(),
  database: databaseInstance
};