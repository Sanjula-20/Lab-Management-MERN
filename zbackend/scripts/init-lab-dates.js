const { sequelize } = require('../config/database');

async function updateLabs() {
    try {
        await sequelize.query("UPDATE labs SET established_date = '2020-06-15', lab_seats = 60 WHERE id = 1");
        await sequelize.query("UPDATE labs SET established_date = '2021-01-10', lab_seats = 35 WHERE id = 2");
        await sequelize.query("UPDATE labs SET established_date = '2019-09-05', lab_seats = 45 WHERE id = 3");
        await sequelize.query("UPDATE labs SET established_date = '2022-03-20', lab_seats = 40 WHERE id = 4");
        const [rows] = await sequelize.query("SELECT id, name, lab_type, established_date, lab_seats FROM labs");
        console.log('Successfully updated labs:');
        console.table(rows);
    } catch (err) {
        console.error('Update error:', err);
    } finally {
        await sequelize.close();
    }
}

updateLabs();
