const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config();

const { sequelize, testConnection } = require('../config/database');
const seeder = require('../seeders/20261021000000_initial_reference_data');

async function run() {
  try {
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Cannot run seed: Database connection failed.');
      process.exit(1);
    }

    const queryInterface = sequelize.getQueryInterface();
    await seeder.up(queryInterface, sequelize.Sequelize);
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  } finally {
    try {
      await sequelize.close();
    } catch (_) {}
  }
}

run();
