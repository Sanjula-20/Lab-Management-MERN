// init-equipment-categories.js
const { sequelize } = require('../config/database');

async function initCategories() {
    try {
        console.log('🔄 Creating equipment_categories table...');

        // 1. Create table if not exists
        await sequelize.query(`
            CREATE TABLE IF NOT EXISTS equipment_categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL UNIQUE,
                code VARCHAR(50) NOT NULL UNIQUE,
                description TEXT NULL,
                icon VARCHAR(50) NULL DEFAULT 'box',
                color VARCHAR(50) NULL DEFAULT 'blue',
                is_active BOOLEAN NOT NULL DEFAULT TRUE,
                created_by INT NULL,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_category_code (code),
                INDEX idx_category_active (is_active)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        `);
        console.log('✅ equipment_categories table created successfully');

        // 2. Modify equipment.category to VARCHAR(50) to allow custom dynamic categories
        try {
            await sequelize.query(`ALTER TABLE equipment MODIFY category VARCHAR(50) NOT NULL;`);
            console.log('✅ equipment.category column updated to VARCHAR(50)');
        } catch (alterErr) {
            console.log('ℹ️ equipment.category alter note:', alterErr.message);
        }

        // 3. Seed initial categories
        const initialCategories = [
            {
                name: 'Computer & IT Equipment',
                code: 'computer',
                icon: 'desktop',
                color: 'blue',
                description: 'Workstations, desktop computers, laptops, servers, and computational terminals.'
            },
            {
                name: 'Projectors & Displays',
                code: 'projector',
                icon: 'projector',
                color: 'purple',
                description: 'Smart boards, high-definition laser projectors, digital displays, and visual systems.'
            },
            {
                name: 'Printers & Scanners',
                code: 'printer',
                icon: 'printer',
                color: 'green',
                description: 'Laser printers, 3D printers, barcode scanners, and document digitizers.'
            },
            {
                name: 'Microscopes & Optics',
                code: 'microscope',
                icon: 'microscope',
                color: 'indigo',
                description: 'Compound optical microscopes, electron microscopes, spectrometers, and precision lenses.'
            },
            {
                name: 'Laboratory Equipment',
                code: 'lab_equipment',
                icon: 'flask',
                color: 'emerald',
                description: 'General analytical laboratory instruments, sensors, heating baths, incubators, and test benches.'
            },
            {
                name: 'Network Equipment',
                code: 'network_equipment',
                icon: 'network',
                color: 'orange',
                description: 'Routers, gigabit switches, firewalls, wireless access points, patch panels, and networking racks.'
            },
            {
                name: 'Safety & Environmental',
                code: 'safety_equipment',
                icon: 'safety',
                color: 'amber',
                description: 'Emergency eyewash stations, fire suppressors, chemical fume hoods, and personal protective equipment.'
            },
            {
                name: 'Measuring & Calibration',
                code: 'balance',
                icon: 'balance',
                color: 'teal',
                description: 'Digital analytical balances, multimeters, oscilloscopes, signal generators, and calibration devices.'
            },
            {
                name: 'Other & Miscellaneous',
                code: 'other',
                icon: 'box',
                color: 'gray',
                description: 'General laboratory utilities, peripheral accessories, and uncategorized specialized items.'
            }
        ];

        for (const cat of initialCategories) {
            await sequelize.query(`
                INSERT INTO equipment_categories (name, code, icon, color, description, is_active, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())
                ON DUPLICATE KEY UPDATE
                    name = VALUES(name),
                    icon = VALUES(icon),
                    color = VALUES(color),
                    description = VALUES(description);
            `, {
                replacements: [cat.name, cat.code, cat.icon, cat.color, cat.description]
            });
        }
        console.log(`✅ Seeded ${initialCategories.length} equipment categories successfully`);

        // Check counts
        const [counts] = await sequelize.query(`
            SELECT ec.id, ec.name, ec.code, ec.color, COUNT(e.id) as equipment_count
            FROM equipment_categories ec
            LEFT JOIN equipment e ON e.category = ec.code
            GROUP BY ec.id, ec.name, ec.code, ec.color
            ORDER BY equipment_count DESC;
        `);
        console.log('📊 Equipment Category Summary:');
        console.table(counts);

        process.exit(0);
    } catch (err) {
        console.error('❌ Error initializing equipment categories:', err);
        process.exit(1);
    }
}

initCategories();
