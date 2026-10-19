const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config();

const dbConfig = {
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : (process.env.DB_PASS || ''),
  database: process.env.DB_NAME || 'lab_management',
  host: process.env.DB_HOST_LOCAL || process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT_LOCAL || process.env.DB_PORT || 3306),
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'production' ? false : console.log
};

module.exports = {
  development: dbConfig,
  test: {
    ...dbConfig,
    database: (process.env.DB_NAME || 'lab_management') + '_test'
  },
  production: {
    ...dbConfig,
    logging: false
  }
};