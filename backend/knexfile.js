
require('dotenv').config();

module.exports = {
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      dateStrings: true,
      timezone: 'Z'
    },
    pool: { min: 2, max: 10 },
    migrations: { directory: './migrations' },
    seeds: { directory: './seeds' }
  },
  
  test: {
    client: 'sqlite3',
    connection: {
      filename: ':memory:'
    },
    useNullAsDefault: true,
    migrations: { directory: './migrations' },
    seeds: { directory: './seeds' }
  }
};
