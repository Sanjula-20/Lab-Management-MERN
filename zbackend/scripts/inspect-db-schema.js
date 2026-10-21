const { sequelize } = require('../config/database');

async function inspect() {
    try {
        const [tables] = await sequelize.query(`
            SELECT TABLE_NAME 
            FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_SCHEMA = DATABASE()
            ORDER BY TABLE_NAME
        `);
        console.log('--- ALL TABLES IN DATABASE ---');
        for (const t of tables) {
            const tableName = t.TABLE_NAME;
            const [cols] = await sequelize.query(`
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
                ORDER BY ORDINAL_POSITION
            `, { replacements: [tableName] });
            const [countRes] = await sequelize.query(`SELECT COUNT(*) as cnt FROM \`${tableName}\``);
            console.log(`\nTable: ${tableName} (Rows: ${countRes[0].cnt})`);
            console.log('Columns: ' + cols.map(c => `${c.COLUMN_NAME} (${c.DATA_TYPE}${c.COLUMN_KEY ? ' ' + c.COLUMN_KEY : ''})`).join(', '));
        }
    } catch (err) {
        console.error('Inspection error:', err);
    } finally {
        await sequelize.close();
    }
}

inspect();
