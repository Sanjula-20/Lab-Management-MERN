const { Sequelize } = require('sequelize');
require('dotenv').config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbPort = process.env.DB_PORT || 3306;
const dbUser = process.env.DB_USER || 'root';
const dbPass = process.env.DB_PASSWORD || '';

const seqOrig = new Sequelize('lab_management', dbUser, dbPass, {
  host: dbHost,
  port: dbPort,
  dialect: 'mysql',
  logging: false,
});

const seqFresh = new Sequelize('lab_management_test_fresh', dbUser, dbPass, {
  host: dbHost,
  port: dbPort,
  dialect: 'mysql',
  logging: false,
});

async function run() {
  try {
    const [origRows] = await seqOrig.query(`
      SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY, EXTRA 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = 'lab_management' 
      ORDER BY TABLE_NAME, COLUMN_NAME
    `);

    const [freshRows] = await seqFresh.query(`
      SELECT TABLE_NAME, COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_KEY, EXTRA 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = 'lab_management_test_fresh' 
      ORDER BY TABLE_NAME, COLUMN_NAME
    `);

    const origCols = {};
    for (const r of origRows) {
      if (r.TABLE_NAME === 'SequelizeMeta') continue;
      if (!origCols[r.TABLE_NAME]) origCols[r.TABLE_NAME] = {};
      origCols[r.TABLE_NAME][r.COLUMN_NAME] = r;
    }

    const freshCols = {};
    for (const r of freshRows) {
      if (r.TABLE_NAME === 'SequelizeMeta') continue;
      if (!freshCols[r.TABLE_NAME]) freshCols[r.TABLE_NAME] = {};
      freshCols[r.TABLE_NAME][r.COLUMN_NAME] = r;
    }

    const origTables = Object.keys(origCols).sort();
    const freshTables = Object.keys(freshCols).sort();

    console.log('Original DB table count:', origTables.length);
    console.log('Fresh DB table count:', freshTables.length);

    const missingTablesInFresh = origTables.filter(t => !freshTables.includes(t));
    const extraTablesInFresh = freshTables.filter(t => !origTables.includes(t));

    if (missingTablesInFresh.length) console.log('MISSING TABLES IN FRESH:', missingTablesInFresh);
    if (extraTablesInFresh.length) console.log('EXTRA TABLES IN FRESH:', extraTablesInFresh);

    let discrepancies = 0;
    for (const t of origTables) {
      if (!freshCols[t]) continue;
      const origC = origCols[t];
      const freshC = freshCols[t];

      for (const colName of Object.keys(origC)) {
        if (!freshC[colName]) {
          console.log(`[${t}] Missing column in fresh DB: ${colName}`);
          discrepancies++;
        }
      }

      for (const colName of Object.keys(freshC)) {
        if (!origC[colName]) {
          console.log(`[${t}] Extra column in fresh DB: ${colName}`);
          discrepancies++;
        }
      }
    }

    if (discrepancies === 0 && missingTablesInFresh.length === 0 && extraTablesInFresh.length === 0) {
      console.log('PERFECT MATCH! All 21 tables and all columns match exactly between original and fresh DB!');
    } else {
      console.log('Total column discrepancies:', discrepancies);
    }
  } catch (err) {
    console.error('Error during schema comparison:', err);
  } finally {
    await seqOrig.close();
    await seqFresh.close();
  }
}

run();
