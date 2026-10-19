'use strict';

/**
 * Migration: Add established_date, in_charge_id and ensure lab_seats default on labs table
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('labs');

    // 1. Add established_date
    if (!tableDesc.established_date) {
      await queryInterface.addColumn('labs', 'established_date', {
        type: Sequelize.DATEONLY,
        allowNull: true
      });
      console.log('  ✓ Added labs.established_date');
    }

    // 2. Add or update lab_seats
    if (!tableDesc.lab_seats) {
      await queryInterface.addColumn('labs', 'lab_seats', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30
      });
      console.log('  ✓ Added labs.lab_seats');
    } else {
      try {
        await queryInterface.sequelize.query("UPDATE labs SET lab_seats = 30 WHERE lab_seats IS NULL");
        await queryInterface.sequelize.query("ALTER TABLE labs MODIFY COLUMN lab_seats INT NOT NULL DEFAULT 30");
        console.log('  ✓ Ensured labs.lab_seats is NOT NULL DEFAULT 30');
      } catch (err) {
        console.log('  ℹ️ Note on lab_seats alteration:', err.message);
      }
    }

    // 3. Add in_charge_id and ensure foreign key constraint exists
    const userDesc = await queryInterface.describeTable('users');
    const userPk = userDesc.userId ? 'userId' : 'id';

    if (!tableDesc.in_charge_id) {
      await queryInterface.addColumn('labs', 'in_charge_id', {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: userPk
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
      console.log(`  ✓ Added labs.in_charge_id referencing users(${userPk})`);
    } else {
      // Column exists, check if FK constraint exists
      const [existingLabFk] = await queryInterface.sequelize.query(`
        SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'labs' AND COLUMN_NAME = 'in_charge_id' AND REFERENCED_TABLE_NAME = 'users'
      `);
      if (existingLabFk.length === 0) {
        try {
          await queryInterface.addConstraint('labs', {
            fields: ['in_charge_id'],
            type: 'foreign key',
            name: 'labs_in_charge_id_fk',
            references: {
              table: 'users',
              field: userPk
            },
            onDelete: 'SET NULL',
            onUpdate: 'CASCADE'
          });
          console.log(`  ✓ Added missing foreign key constraint on labs.in_charge_id -> users(${userPk})`);
        } catch (fkErr) {
          console.log('  ℹ️ Note on in_charge_id FK constraint:', fkErr.message);
        }
      }
    }

    try {
      await queryInterface.addIndex('labs', ['in_charge_id'], { name: 'labs_in_charge_id' });
    } catch (idxErr) {
      // index might already exist
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('labs');

    if (tableDesc.in_charge_id) {
      // Drop constraint if exists
      try {
        await queryInterface.removeConstraint('labs', 'labs_in_charge_id_fk');
      } catch (_) {}
      await queryInterface.removeColumn('labs', 'in_charge_id');
      console.log('  ✓ Removed labs.in_charge_id');
    }

    if (tableDesc.established_date) {
      await queryInterface.removeColumn('labs', 'established_date');
      console.log('  ✓ Removed labs.established_date');
    }
  }
};
