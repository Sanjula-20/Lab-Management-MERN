// migrate-dealers-and-config.js
const { sequelize } = require('../config/database');

async function migrate() {
    console.log('--- Migrating Database for Dealer Master & Equipment Configuration ---');

    // 1. Create dealers table
    await sequelize.query(`
        CREATE TABLE IF NOT EXISTS dealers (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(150) NOT NULL UNIQUE,
            contact_person VARCHAR(100) NULL,
            email VARCHAR(100) NULL,
            phone VARCHAR(50) NULL,
            address TEXT NULL,
            city VARCHAR(100) NULL,
            gst_number VARCHAR(50) NULL,
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    console.log('✅ dealers table verified/created');

    // 2. Add columns to equipment table if they do not exist
    const [cols] = await sequelize.query('DESCRIBE equipment');
    const colNames = cols.map(c => c.Field);

    if (!colNames.includes('brand')) {
        await sequelize.query('ALTER TABLE equipment ADD COLUMN brand VARCHAR(100) NULL AFTER model;');
        console.log('✅ Added brand column to equipment');
    }

    if (!colNames.includes('dealer_id')) {
        await sequelize.query('ALTER TABLE equipment ADD COLUMN dealer_id INT NULL AFTER lab_id;');
        console.log('✅ Added dealer_id column to equipment');
    }

    if (!colNames.includes('dealer_name')) {
        await sequelize.query('ALTER TABLE equipment ADD COLUMN dealer_name VARCHAR(150) NULL AFTER dealer_id;');
        console.log('✅ Added dealer_name column to equipment');
    }

    if (!colNames.includes('hard_disk')) {
        await sequelize.query('ALTER TABLE equipment ADD COLUMN hard_disk VARCHAR(100) NULL AFTER ram;');
        console.log('✅ Added hard_disk column to equipment');
    }

    if (!colNames.includes('gpu')) {
        await sequelize.query('ALTER TABLE equipment ADD COLUMN gpu VARCHAR(100) NULL AFTER hard_disk;');
        console.log('✅ Added gpu column to equipment');
    }

    if (!colNames.includes('generation')) {
        await sequelize.query('ALTER TABLE equipment ADD COLUMN generation VARCHAR(100) NULL AFTER gpu;');
        console.log('✅ Added generation column to equipment');
    }

    // 3. Seed initial dealers
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
        const [existing] = await sequelize.query('SELECT id FROM dealers WHERE name = ?', { replacements: [d.name] });
        if (existing.length === 0) {
            await sequelize.query(
                'INSERT INTO dealers (name, contact_person, email, phone, city, gst_number) VALUES (?, ?, ?, ?, ?, ?)',
                { replacements: [d.name, d.contact_person, d.email, d.phone, d.city, d.gst_number] }
            );
            console.log('Seeded dealer:', d.name);
        }
    }

    // Sync brand from manufacturer where brand is null
    await sequelize.query('UPDATE equipment SET brand = manufacturer WHERE (brand IS NULL OR brand = "") AND manufacturer IS NOT NULL;');
    console.log('✅ Backfilled brand from manufacturer for existing equipment');

    // Sync hard_disk from storage where hard_disk is null
    await sequelize.query('UPDATE equipment SET hard_disk = storage WHERE (hard_disk IS NULL OR hard_disk = "") AND storage IS NOT NULL;');
    console.log('✅ Backfilled hard_disk from storage for existing equipment');

    // Sync gpu from graphics_card where gpu is null
    await sequelize.query('UPDATE equipment SET gpu = graphics_card WHERE (gpu IS NULL OR gpu = "") AND graphics_card IS NOT NULL;');
    console.log('✅ Backfilled gpu from graphics_card for existing equipment');

    console.log('Migration complete!');
    process.exit(0);
}

migrate().catch(e => {
    console.error('Migration error:', e);
    process.exit(1);
});
