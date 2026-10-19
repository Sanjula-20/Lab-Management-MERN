'use strict';

/**
 * Migration: Create equipment_categories table and seed standard categories
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();

    if (!tables.includes('equipment_categories')) {
      await queryInterface.createTable('equipment_categories', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: Sequelize.STRING(100),
          allowNull: false,
          unique: true
        },
        code: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: true
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        icon: {
          type: Sequelize.STRING(50),
          allowNull: true,
          defaultValue: 'box'
        },
        color: {
          type: Sequelize.STRING(50),
          allowNull: true,
          defaultValue: 'blue'
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
          allowNull: false
        },
        created_by: {
          type: Sequelize.INTEGER,
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
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
      });

      await queryInterface.addIndex('equipment_categories', ['code'], { name: 'idx_category_code' });
      await queryInterface.addIndex('equipment_categories', ['is_active'], { name: 'idx_category_active' });
      console.log('  ✓ Created equipment_categories table');
    } else {
      console.log('  ℹ️ equipment_categories table already exists');
    }

    // Seed default categories if empty
    try {
      const [existingCats] = await queryInterface.sequelize.query('SELECT COUNT(*) as count FROM equipment_categories');
      if (existingCats[0].count === 0) {
        const initialCategories = [
          { name: 'Computer & IT Equipment', code: 'computer', icon: 'desktop', color: 'blue', description: 'Workstations, desktop computers, laptops, servers, and computational terminals.' },
          { name: 'Projectors & Displays', code: 'projector', icon: 'projector', color: 'purple', description: 'Smart boards, high-definition laser projectors, digital displays, and visual systems.' },
          { name: 'Printers & Scanners', code: 'printer', icon: 'printer', color: 'green', description: 'Laser printers, 3D printers, barcode scanners, and document digitizers.' },
          { name: 'Microscopes & Optics', code: 'microscope', icon: 'microscope', color: 'indigo', description: 'Compound optical microscopes, electron microscopes, spectrometers, and precision lenses.' },
          { name: 'Laboratory Equipment', code: 'lab_equipment', icon: 'flask', color: 'emerald', description: 'General analytical laboratory instruments, sensors, heating baths, incubators, and test benches.' },
          { name: 'Network Equipment', code: 'network_equipment', icon: 'network', color: 'orange', description: 'Routers, gigabit switches, firewalls, wireless access points, patch panels, and networking racks.' },
          { name: 'Safety & Environmental', code: 'safety_equipment', icon: 'safety', color: 'amber', description: 'Emergency eyewash stations, fire suppressors, chemical fume hoods, and personal protective equipment.' },
          { name: 'Measuring & Calibration', code: 'balance', icon: 'balance', color: 'teal', description: 'Digital analytical balances, multimeters, oscilloscopes, signal generators, and calibration devices.' },
          { name: 'Other & Miscellaneous', code: 'other', icon: 'box', color: 'gray', description: 'General laboratory utilities, peripheral accessories, and uncategorized specialized items.' }
        ];

        for (const cat of initialCategories) {
          await queryInterface.sequelize.query(`
            INSERT INTO equipment_categories (name, code, icon, color, description, is_active, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())
          `, {
            replacements: [cat.name, cat.code, cat.icon, cat.color, cat.description]
          });
        }
        console.log(`  ✓ Seeded ${initialCategories.length} equipment categories`);
      }
    } catch (seedErr) {
      console.log('  ℹ️ Note on category seeding:', seedErr.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('equipment_categories')) {
      await queryInterface.dropTable('equipment_categories');
      console.log('  ✓ Dropped equipment_categories table');
    }
  }
};
