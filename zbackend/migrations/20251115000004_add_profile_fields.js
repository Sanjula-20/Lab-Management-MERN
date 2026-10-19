'use strict';

/**
 * Migration: Add profile fields (bio, position) to users table
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('users');

    if (!tableDesc.bio) {
      await queryInterface.addColumn('users', 'bio', {
        type: Sequelize.TEXT,
        allowNull: true
      });
      console.log('  ✓ Added users.bio');
    }

    if (!tableDesc.position) {
      await queryInterface.addColumn('users', 'position', {
        type: Sequelize.STRING(100),
        allowNull: true
      });
      console.log('  ✓ Added users.position');
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('users');

    if (tableDesc.bio) {
      await queryInterface.removeColumn('users', 'bio');
      console.log('  ✓ Removed users.bio');
    }

    if (tableDesc.position) {
      await queryInterface.removeColumn('users', 'position');
      console.log('  ✓ Removed users.position');
    }
  }
};
