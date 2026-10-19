'use strict';

/**
 * Migration: Add audit columns (createdBy, updatedBy) to users table
 * and adjust legacy column nullability for OAuth & registration compatibility
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('users');

    // 1. Add createdBy / updatedBy
    if (!tableDesc.createdBy) {
      await queryInterface.addColumn('users', 'createdBy', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
      console.log('  ✓ Added users.createdBy');
    }

    if (!tableDesc.updatedBy) {
      await queryInterface.addColumn('users', 'updatedBy', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
      console.log('  ✓ Added users.updatedBy');
    }

    // 2. Make userNumber nullable with default null for OAuth users
    if (tableDesc.userNumber) {
      await queryInterface.sequelize.query(
        "ALTER TABLE users MODIFY COLUMN userNumber VARCHAR(50) NULL DEFAULT NULL"
      );
      console.log('  ✓ Adjusted users.userNumber to allow NULL default');
    }

    // 3. Make legacy columns nullable if they exist
    if (tableDesc.name) {
      await queryInterface.sequelize.query("ALTER TABLE users MODIFY COLUMN name VARCHAR(100) NULL");
    }
    if (tableDesc.email) {
      await queryInterface.sequelize.query("ALTER TABLE users MODIFY COLUMN email VARCHAR(255) NULL");
    }
    if (tableDesc.role) {
      await queryInterface.sequelize.query(
        "ALTER TABLE users MODIFY COLUMN role ENUM('student','faculty','teacher','lab_assistant','lab_technician','admin') NULL"
      );
    }
    if (tableDesc.is_active) {
      await queryInterface.sequelize.query("ALTER TABLE users MODIFY COLUMN is_active TINYINT(1) NULL DEFAULT 1");
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('users');
    if (tableDesc.createdBy) {
      await queryInterface.removeColumn('users', 'createdBy');
      console.log('  ✓ Removed users.createdBy');
    }
    if (tableDesc.updatedBy) {
      await queryInterface.removeColumn('users', 'updatedBy');
      console.log('  ✓ Removed users.updatedBy');
    }
  }
};
