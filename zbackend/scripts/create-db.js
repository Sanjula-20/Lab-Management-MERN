const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config();

const dbHost = process.env.DB_HOST_LOCAL || process.env.DB_HOST || 'localhost';
const dbPort = Number(process.env.DB_PORT_LOCAL || process.env.DB_PORT || 3306);
const dbUser = process.env.DB_USER || 'root';
const dbPassword = process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : (process.env.DB_PASS || '');
const dbName = process.env.DB_NAME || 'lab_management';

async function createDatabase() {
  console.log(`\n📦 Checking database: ${dbName}...`);
  try {
    const connection = await mysql.createConnection({
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`✅ Database "${dbName}" is ready.`);
    await connection.end();
  } catch (err) {
    console.error(`❌ Error creating database "${dbName}":`, err.message);
    process.exit(1);
  }
}

createDatabase();
