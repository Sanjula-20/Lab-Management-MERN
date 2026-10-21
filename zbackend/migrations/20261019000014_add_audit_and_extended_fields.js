'use strict';

/**
 * Migration: Add audit_logs table, extended dealer fields, extended equipment fields, and lab icon
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Synchronize legacy users.id = userId where id IS NULL for backward compatibility
    try {
      await queryInterface.sequelize.query(`
        UPDATE users SET id = userId WHERE id IS NULL AND userId IS NOT NULL
      `);
      console.log('  ✓ Synchronized users.id = userId where id was null');
    } catch (uErr) {
      console.log('  ℹ️ Note on users.id sync:', uErr.message);
    }

    // 2. Extend dealers table: state, postal_code, notes
    const dealerDesc = await queryInterface.describeTable('dealers');
    if (!dealerDesc.state) {
      await queryInterface.addColumn('dealers', 'state', {
        type: Sequelize.STRING(100),
        allowNull: true
      });
      console.log('  ✓ Added dealers.state');
    }
    if (!dealerDesc.postal_code) {
      await queryInterface.addColumn('dealers', 'postal_code', {
        type: Sequelize.STRING(20),
        allowNull: true
      });
      console.log('  ✓ Added dealers.postal_code');
    }
    if (!dealerDesc.notes) {
      await queryInterface.addColumn('dealers', 'notes', {
        type: Sequelize.TEXT,
        allowNull: true
      });
      console.log('  ✓ Added dealers.notes');
    }

    // 3. Extend equipment table: indent_number, indent_date, ram_type, gpu_memory
    const eqDesc = await queryInterface.describeTable('equipment');
    if (!eqDesc.indent_number) {
      await queryInterface.addColumn('equipment', 'indent_number', {
        type: Sequelize.STRING(100),
        allowNull: true
      });
      console.log('  ✓ Added equipment.indent_number');
    }
    if (!eqDesc.indent_date) {
      await queryInterface.addColumn('equipment', 'indent_date', {
        type: Sequelize.DATEONLY,
        allowNull: true
      });
      console.log('  ✓ Added equipment.indent_date');
    }
    if (!eqDesc.ram_type) {
      await queryInterface.addColumn('equipment', 'ram_type', {
        type: Sequelize.STRING(50),
        allowNull: true
      });
      console.log('  ✓ Added equipment.ram_type');
    }
    if (!eqDesc.gpu_memory) {
      await queryInterface.addColumn('equipment', 'gpu_memory', {
        type: Sequelize.STRING(50),
        allowNull: true
      });
      console.log('  ✓ Added equipment.gpu_memory');
    }

    // 4. Extend labs table: icon
    const labDesc = await queryInterface.describeTable('labs');
    if (!labDesc.icon) {
      await queryInterface.addColumn('labs', 'icon', {
        type: Sequelize.STRING(100),
        allowNull: true,
        defaultValue: 'desktop'
      });
      console.log('  ✓ Added labs.icon');
    }

    // 5. Create audit_logs table if not exists
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('audit_logs')) {
      await queryInterface.createTable('audit_logs', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        entity_type: {
          type: Sequelize.STRING(50),
          allowNull: false
        },
        entity_id: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        action: {
          type: Sequelize.STRING(50),
          allowNull: false
        },
        previous_values: {
          type: Sequelize.TEXT('long'),
          allowNull: true
        },
        new_values: {
          type: Sequelize.TEXT('long'),
          allowNull: true
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        user_name: {
          type: Sequelize.STRING(150),
          allowNull: true
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      });

      await queryInterface.addIndex('audit_logs', ['entity_type', 'entity_id'], { name: 'audit_logs_entity_idx' });
      await queryInterface.addIndex('audit_logs', ['user_id'], { name: 'audit_logs_user_idx' });
      await queryInterface.addIndex('audit_logs', ['created_at'], { name: 'audit_logs_created_idx' });
      console.log('  ✓ Created audit_logs table and indexes');
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('audit_logs')) {
      await queryInterface.dropTable('audit_logs');
      console.log('  ✓ Dropped audit_logs table');
    }

    const labDesc = await queryInterface.describeTable('labs');
    if (labDesc.icon) {
      await queryInterface.removeColumn('labs', 'icon');
      console.log('  ✓ Removed labs.icon');
    }

    const eqDesc = await queryInterface.describeTable('equipment');
    if (eqDesc.indent_number) await queryInterface.removeColumn('equipment', 'indent_number');
    if (eqDesc.indent_date) await queryInterface.removeColumn('equipment', 'indent_date');
    if (eqDesc.ram_type) await queryInterface.removeColumn('equipment', 'ram_type');
    if (eqDesc.gpu_memory) await queryInterface.removeColumn('equipment', 'gpu_memory');

    const dealerDesc = await queryInterface.describeTable('dealers');
    if (dealerDesc.state) await queryInterface.removeColumn('dealers', 'state');
    if (dealerDesc.postal_code) await queryInterface.removeColumn('dealers', 'postal_code');
    if (dealerDesc.notes) await queryInterface.removeColumn('dealers', 'notes');
  }
};
