'use strict';

/**
 * Migration: Create dealers table and seed standard vendors
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();

    if (!tables.includes('dealers')) {
      await queryInterface.createTable('dealers', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        name: {
          type: Sequelize.STRING(150),
          allowNull: false,
          unique: true
        },
        contact_person: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        email: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        phone: {
          type: Sequelize.STRING(50),
          allowNull: true
        },
        address: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        city: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        gst_number: {
          type: Sequelize.STRING(50),
          allowNull: true
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
          allowNull: false
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
      console.log('  ✓ Created dealers table');
    } else {
      console.log('  ℹ️ dealers table already exists');
    }

    // Seed default dealers if empty
    try {
      const [existingDealers] = await queryInterface.sequelize.query('SELECT COUNT(*) as count FROM dealers');
      if (existingDealers[0].count === 0) {
        const initialDealers = [
          { name: 'Dell Technologies India Direct', contact_person: 'Rajesh Kumar', email: 'commercial@dell.com', phone: '+91 80 2500 1000', city: 'Bangalore', gst_number: '29AAACD1234F1Z5' },
          { name: 'HP Enterprise Commercial Partners', contact_person: 'Anita Sharma', email: 'sales@hp-commercial.in', phone: '+91 11 4122 3344', city: 'New Delhi', gst_number: '07AAACH5678G2Z1' },
          { name: 'Lenovo Commercial Solutions India', contact_person: 'Vikram Singh', email: 'orders@lenovopartner.in', phone: '+91 22 6677 8899', city: 'Mumbai', gst_number: '27AAACL9012H3Z7' },
          { name: 'Precision Scientific & Lab Tech Instruments', contact_person: 'Dr. S. Sundaram', email: 'info@precisionlab.co.in', phone: '+91 44 2855 4433', city: 'Chennai', gst_number: '33AAACP4321J4Z2' },
          { name: 'Thermo Fisher Scientific India Pvt Ltd', contact_person: 'Pooja Iyer', email: 'india.orders@thermofisher.com', phone: '+91 22 6716 2200', city: 'Mumbai', gst_number: '27AAACT8765K5Z9' },
          { name: 'Epson India Certified Pro Dealer', contact_person: 'Karthik Nathan', email: 'commercial@epsondealers.in', phone: '+91 80 4566 7788', city: 'Bangalore', gst_number: '29AAACE9876L6Z3' },
          { name: 'Cisco Systems Network Partner - NetSol', contact_person: 'Arun Verma', email: 'enterprise@netsol-cisco.in', phone: '+91 124 456 7890', city: 'Gurugram', gst_number: '06AAACN3456M7Z8' },
          { name: 'Universal Electronics & Lab Components', contact_person: 'Manish Patel', email: 'support@universallab.in', phone: '+91 79 2654 3210', city: 'Ahmedabad', gst_number: '24AAACU7890N8Z4' }
        ];

        for (const d of initialDealers) {
          await queryInterface.sequelize.query(
            'INSERT INTO dealers (name, contact_person, email, phone, city, gst_number, is_active, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, 1, NOW(), NOW())',
            { replacements: [d.name, d.contact_person, d.email, d.phone, d.city, d.gst_number] }
          );
        }
        console.log(`  ✓ Seeded ${initialDealers.length} default dealers`);
      }
    } catch (seedErr) {
      console.log('  ℹ️ Note on dealer seeding:', seedErr.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();
    if (tables.includes('dealers')) {
      await queryInterface.dropTable('dealers');
      console.log('  ✓ Dropped dealers table');
    }
  }
};
