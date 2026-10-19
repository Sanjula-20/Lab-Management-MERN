'use strict';

/**
 * Migration: Add dealer association and configuration columns to equipment table,
 * and update category column type to VARCHAR(50) for dynamic category support.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('equipment');

    // 1. Update category column to VARCHAR(50) if it is still ENUM
    if (tableDesc.category && tableDesc.category.type && tableDesc.category.type.includes('ENUM')) {
      try {
        await queryInterface.sequelize.query(`ALTER TABLE equipment MODIFY category VARCHAR(50) NOT NULL;`);
        console.log('  ✓ Updated equipment.category column type to VARCHAR(50)');
      } catch (err) {
        console.log('  ℹ️ Note on equipment.category alter:', err.message);
      }
    }

    // 2. Add brand
    if (!tableDesc.brand) {
      await queryInterface.addColumn('equipment', 'brand', {
        type: Sequelize.STRING(100),
        allowNull: true
      });
      console.log('  ✓ Added equipment.brand');
    }

    // 3. Add dealer_id
    if (!tableDesc.dealer_id) {
      await queryInterface.addColumn('equipment', 'dealer_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'dealers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
      console.log('  ✓ Added equipment.dealer_id with FK to dealers');
    } else {
      // Column exists, check if foreign key constraint exists
      const [existingFk] = await queryInterface.sequelize.query(`
        SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'equipment' AND COLUMN_NAME = 'dealer_id' AND REFERENCED_TABLE_NAME = 'dealers'
      `);
      if (existingFk.length === 0) {
        try {
          await queryInterface.addConstraint('equipment', {
            fields: ['dealer_id'],
            type: 'foreign key',
            name: 'equipment_dealer_id_fk',
            references: {
              table: 'dealers',
              field: 'id'
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
          });
          console.log('  ✓ Added missing foreign key constraint on equipment.dealer_id -> dealers(id)');
        } catch (fkErr) {
          console.log('  ℹ️ Note on dealer_id FK constraint:', fkErr.message);
        }
      }
    }

    // 4. Add dealer_name
    if (!tableDesc.dealer_name) {
      await queryInterface.addColumn('equipment', 'dealer_name', {
        type: Sequelize.STRING(150),
        allowNull: true
      });
      console.log('  ✓ Added equipment.dealer_name');
    }

    // 5. Add hard_disk
    if (!tableDesc.hard_disk) {
      await queryInterface.addColumn('equipment', 'hard_disk', {
        type: Sequelize.STRING(100),
        allowNull: true
      });
      console.log('  ✓ Added equipment.hard_disk');
    }

    // 6. Add gpu
    if (!tableDesc.gpu) {
      await queryInterface.addColumn('equipment', 'gpu', {
        type: Sequelize.STRING(100),
        allowNull: true
      });
      console.log('  ✓ Added equipment.gpu');
    }

    // 7. Add generation
    if (!tableDesc.generation) {
      await queryInterface.addColumn('equipment', 'generation', {
        type: Sequelize.STRING(100),
        allowNull: true
      });
      console.log('  ✓ Added equipment.generation');
    }

    // 8. Backfill data from older columns
    try {
      await queryInterface.sequelize.query(
        'UPDATE equipment SET brand = manufacturer WHERE (brand IS NULL OR brand = "") AND manufacturer IS NOT NULL;'
      );
      await queryInterface.sequelize.query(
        'UPDATE equipment SET hard_disk = storage WHERE (hard_disk IS NULL OR hard_disk = "") AND storage IS NOT NULL;'
      );
      await queryInterface.sequelize.query(
        'UPDATE equipment SET gpu = graphics_card WHERE (gpu IS NULL OR gpu = "") AND graphics_card IS NOT NULL;'
      );
      console.log('  ✓ Backfilled equipment configuration values');
    } catch (bfErr) {
      console.log('  ℹ️ Note on backfill:', bfErr.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('equipment');
    const colsToRemove = ['generation', 'gpu', 'hard_disk', 'dealer_name', 'dealer_id', 'brand'];

    for (const col of colsToRemove) {
      if (tableDesc[col]) {
        await queryInterface.removeColumn('equipment', col);
        console.log(`  ✓ Removed equipment.${col}`);
      }
    }
  }
};
