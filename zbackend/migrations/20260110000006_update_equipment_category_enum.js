'use strict';

/**
 * Migration: Update equipment.category ENUM to include 'network_equipment'
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const tableDesc = await queryInterface.describeTable('equipment');
      // Only modify if category is still an ENUM
      if (tableDesc.category && tableDesc.category.type && tableDesc.category.type.includes('ENUM')) {
        await queryInterface.sequelize.query(`
          ALTER TABLE equipment 
          MODIFY COLUMN category ENUM(
            'computer', 'printer', 'projector', 'scanner', 'microscope',
            'centrifuge', 'spectrophotometer', 'ph_meter', 'balance',
            'incubator', 'autoclave', 'pipette', 'thermometer',
            'glassware', 'safety_equipment', 'lab_equipment', 'network', 'network_equipment', 'other'
          ) NOT NULL
        `);
        console.log('  ✓ Updated equipment.category ENUM');
      }
    } catch (err) {
      console.log('  ℹ️ Note on equipment.category ENUM:', err.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      const tableDesc = await queryInterface.describeTable('equipment');
      if (tableDesc.category && tableDesc.category.type && tableDesc.category.type.includes('ENUM')) {
        await queryInterface.sequelize.query(`
          ALTER TABLE equipment 
          MODIFY COLUMN category ENUM(
            'computer', 'printer', 'projector', 'scanner', 'microscope',
            'centrifuge', 'spectrophotometer', 'ph_meter', 'balance',
            'incubator', 'autoclave', 'pipette', 'thermometer',
            'glassware', 'safety_equipment', 'lab_equipment', 'network', 'other'
          ) NOT NULL
        `);
        console.log('  ✓ Reverted equipment.category ENUM');
      }
    } catch (err) {
      console.log('  ℹ️ Note on reverting equipment.category ENUM:', err.message);
    }
  }
};
