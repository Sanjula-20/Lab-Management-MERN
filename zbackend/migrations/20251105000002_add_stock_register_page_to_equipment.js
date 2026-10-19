'use strict';

/**
 * Migration: Add stock_register_page to equipment table
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('equipment');
    if (!tableDesc.stock_register_page) {
      await queryInterface.addColumn('equipment', 'stock_register_page', {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Stock register page number for physical tracking'
      });
      console.log('  ✓ Added equipment.stock_register_page');
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('equipment');
    if (tableDesc.stock_register_page) {
      await queryInterface.removeColumn('equipment', 'stock_register_page');
      console.log('  ✓ Removed equipment.stock_register_page');
    }
  }
};
