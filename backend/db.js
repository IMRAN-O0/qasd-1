// Load environment variables (use .env.test in test env)
if (process.env.NODE_ENV === 'test') {
  require('dotenv').config({ path: '.env.test' });
} else {
  require('dotenv').config();
}

const knex = require('knex');
const knexConfig = require('./knexfile');

const env = process.env.NODE_ENV || 'development';
let cfg = knexConfig[env] || knexConfig.development;

module.exports = knex(cfg);

// If running tests and using mysql2, point to a dedicated _test database
if (env === 'test' && cfg && cfg.client === 'mysql2') {
  const baseDb = (cfg.connection && cfg.connection.database) || process.env.DB_DATABASE || 'qasd';
  cfg = {
    ...cfg,
    connection: {
      ...cfg.connection,
      database: `${baseDb}_test`
    }
  };
}

module.exports = knex(cfg);