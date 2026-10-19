'use strict';

/**
 * Migration: Allow NULL passwords for OAuth users
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('users');
    if (tableDesc.password && !tableDesc.password.allowNull) {
      await queryInterface.changeColumn('users', 'password', {
        type: Sequelize.STRING(255),
        allowNull: true,
      });
      console.log('  ✓ Made users.password nullable for OAuth users');
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('users');
    if (tableDesc.password && tableDesc.password.allowNull) {
      await queryInterface.changeColumn('users', 'password', {
        type: Sequelize.STRING(255),
        allowNull: false,
      });
      console.log('  ✓ Reverted users.password to NOT NULL');
    }
  }
};
