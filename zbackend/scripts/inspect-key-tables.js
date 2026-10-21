const { sequelize } = require('../config/database');

async function inspectKeyTables() {
    try {
        const keyTables = ['equipment_categories', 'dealers', 'labs', 'equipment', 'departments', 'incidents', 'bookings', 'maintenance_records'];
        for (const tableName of keyTables) {
            const [check] = await sequelize.query(`
                SELECT TABLE_NAME 
                FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
            `, { replacements: [tableName] });
            if (check.length === 0) {
                console.log(`\n❌ Table does NOT exist: ${tableName}`);
                continue;
            }
            const [cols] = await sequelize.query(`
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
                ORDER BY ORDINAL_POSITION
            `, { replacements: [tableName] });
            const [countRes] = await sequelize.query(`SELECT COUNT(*) as cnt FROM \`${tableName}\``);
            console.log(`\n✅ Table: ${tableName} (Rows: ${countRes[0].cnt})`);
            console.log('Columns: ' + cols.map(c => `${c.COLUMN_NAME} (${c.DATA_TYPE}${c.COLUMN_KEY ? ' ' + c.COLUMN_KEY : ''})`).join(', '));
            
            // show first 2 rows if any
            if (countRes[0].cnt > 0) {
                const [sample] = await sequelize.query(`SELECT * FROM \`${tableName}\` LIMIT 2`);
                console.log('Sample row:', JSON.stringify(sample[0]));
            }
        }
    } catch (err) {
        console.error('Inspection error:', err);
    } finally {
        await sequelize.close();
    }
}

inspectKeyTables();
