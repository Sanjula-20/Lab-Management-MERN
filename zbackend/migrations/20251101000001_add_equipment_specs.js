'use strict';

/**
 * Migration: Add Equipment Specification Columns
 * Adds hardware specification attributes for computers, projectors, printers,
 * microscopes, lab equipment, and networking gear.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('equipment');

    const columnsToAdd = [
      { name: 'processor', type: Sequelize.STRING(100) },
      { name: 'ram', type: Sequelize.STRING(50) },
      { name: 'storage', type: Sequelize.STRING(100) },
      { name: 'graphics_card', type: Sequelize.STRING(100) },
      { name: 'operating_system', type: Sequelize.STRING(100) },
      { name: 'resolution', type: Sequelize.STRING(50) },
      { name: 'brightness', type: Sequelize.STRING(50) },
      { name: 'contrast_ratio', type: Sequelize.STRING(50) },
      { name: 'lamp_hours', type: Sequelize.INTEGER },
      { name: 'print_type', type: Sequelize.STRING(100) },
      { name: 'print_speed', type: Sequelize.STRING(100) },
      { name: 'paper_size', type: Sequelize.STRING(100) },
      { name: 'connectivity', type: Sequelize.STRING(200) },
      { name: 'magnification', type: Sequelize.STRING(50) },
      { name: 'objective_lenses', type: Sequelize.STRING(100) },
      { name: 'illumination', type: Sequelize.STRING(100) },
      { name: 'capacity', type: Sequelize.STRING(100) },
      { name: 'power_rating', type: Sequelize.STRING(100) },
      { name: 'temperature_range', type: Sequelize.STRING(100) },
      { name: 'accuracy', type: Sequelize.STRING(100) },
      { name: 'ports', type: Sequelize.STRING(100) },
      { name: 'speed', type: Sequelize.STRING(100) },
      { name: 'protocol', type: Sequelize.STRING(200) }
    ];

    for (const col of columnsToAdd) {
      if (!tableDesc[col.name]) {
        await queryInterface.addColumn('equipment', col.name, {
          type: col.type,
          allowNull: true
        });
        console.log(`  ✓ Added equipment.${col.name}`);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('equipment');
    const columnsToRemove = [
      'processor', 'ram', 'storage', 'graphics_card', 'operating_system',
      'resolution', 'brightness', 'contrast_ratio', 'lamp_hours',
      'print_type', 'print_speed', 'paper_size', 'connectivity',
      'magnification', 'objective_lenses', 'illumination',
      'capacity', 'power_rating', 'temperature_range', 'accuracy',
      'ports', 'speed', 'protocol'
    ];

    for (const colName of columnsToRemove) {
      if (tableDesc[colName]) {
        await queryInterface.removeColumn('equipment', colName);
        console.log(`  ✓ Removed equipment.${colName}`);
      }
    }
  }
};
