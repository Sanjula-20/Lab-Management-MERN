'use strict';

/**
 * Migration: Create and update recently_accessed table schema
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    const tableExists = tables.includes('recently_accessed');

    if (!tableExists) {
      await queryInterface.createTable('recently_accessed', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        item_type: {
          type: Sequelize.ENUM('equipment', 'lab', 'booking', 'maintenance', 'report', 'user'),
          allowNull: false
        },
        item_id: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        item_name: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        item_description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        access_count: {
          type: Sequelize.INTEGER,
          defaultValue: 1
        },
        last_accessed: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
      });

      await queryInterface.addIndex('recently_accessed', ['user_id', 'last_accessed'], {
        name: 'idx_user_accessed'
      });
      await queryInterface.addIndex('recently_accessed', ['user_id', 'item_type', 'item_id'], {
        name: 'unique_user_item',
        unique: true
      });
      await queryInterface.addIndex('recently_accessed', ['item_type'], {
        name: 'idx_item_type'
      });
      console.log('  ✓ Created recently_accessed table with indexes');
      return;
    }

    // If table already exists, ensure required columns & indexes are present
    const tableDesc = await queryInterface.describeTable('recently_accessed');

    if (tableDesc.accessed_at && !tableDesc.last_accessed) {
      await queryInterface.renameColumn('recently_accessed', 'accessed_at', 'last_accessed');
      console.log('  ✓ Renamed accessed_at to last_accessed');
    }

    if (!tableDesc.access_count) {
      await queryInterface.addColumn('recently_accessed', 'access_count', {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false
      });
      console.log('  ✓ Added recently_accessed.access_count');
    }

    if (!tableDesc.item_description) {
      await queryInterface.addColumn('recently_accessed', 'item_description', {
        type: Sequelize.TEXT,
        allowNull: true
      });
      console.log('  ✓ Added recently_accessed.item_description');
    }

    // Ensure ENUM contains all types
    try {
      await queryInterface.sequelize.query(`
        ALTER TABLE recently_accessed 
        MODIFY COLUMN item_type ENUM('equipment', 'lab', 'booking', 'maintenance', 'report', 'user') NOT NULL
      `);
      console.log('  ✓ Updated recently_accessed.item_type ENUM');
    } catch (enumErr) {
      console.log('  ℹ️ Note on item_type ENUM:', enumErr.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('recently_accessed')) {
      await queryInterface.dropTable('recently_accessed');
      console.log('  ✓ Dropped recently_accessed table');
    }
  }
};
