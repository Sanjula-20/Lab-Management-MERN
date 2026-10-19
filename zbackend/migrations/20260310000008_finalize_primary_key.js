'use strict';

/**
 * Migration: Finalize Primary Key + camelCase columns on users table
 * 1. Add googleId, resetPasswordToken, resetPasswordExpires
 * 2. Switch PRIMARY KEY from `id` -> `userId`
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const db = queryInterface.sequelize;
    const tableDesc = await queryInterface.describeTable('users');

    // 1. Add googleId, resetPasswordToken, resetPasswordExpires if not present
    if (!tableDesc.googleId) {
      await db.query(`ALTER TABLE users ADD COLUMN googleId VARCHAR(255) NULL`);
      if (tableDesc.google_id) {
        await db.query(`UPDATE users SET googleId = google_id WHERE google_id IS NOT NULL`);
      }
      console.log('  ✓ Added users.googleId');
    }

    if (!tableDesc.resetPasswordToken) {
      await db.query(`ALTER TABLE users ADD COLUMN resetPasswordToken VARCHAR(500) NULL`);
      if (tableDesc.reset_password_token) {
        await db.query(`UPDATE users SET resetPasswordToken = reset_password_token WHERE reset_password_token IS NOT NULL`);
      }
      console.log('  ✓ Added users.resetPasswordToken');
    }

    if (!tableDesc.resetPasswordExpires) {
      await db.query(`ALTER TABLE users ADD COLUMN resetPasswordExpires DATETIME NULL`);
      if (tableDesc.reset_password_expires) {
        await db.query(`UPDATE users SET resetPasswordExpires = reset_password_expires WHERE reset_password_expires IS NOT NULL`);
      }
      console.log('  ✓ Added users.resetPasswordExpires');
    }

    // 2. Check current PK
    const [pkRows] = await db.query(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'
        AND CONSTRAINT_NAME = 'PRIMARY'
    `);
    const currentPK = pkRows[0]?.COLUMN_NAME;

    if (currentPK === 'userId') {
      console.log('  ℹ️ users.userId is already the PRIMARY KEY');
      return;
    }

    // 3. Switch PK from id -> userId
    console.log('  📋 Switching PRIMARY KEY from id -> userId...');
    try {
      await db.query('SET FOREIGN_KEY_CHECKS = 0');

      // Drop FKs in other tables referencing users.id
      const [fkRows] = await db.query(`
        SELECT kcu.TABLE_NAME, kcu.CONSTRAINT_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE kcu
        INNER JOIN INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS rc
          ON kcu.CONSTRAINT_NAME = rc.CONSTRAINT_NAME
          AND kcu.TABLE_SCHEMA = rc.CONSTRAINT_SCHEMA
        WHERE kcu.REFERENCED_TABLE_NAME = 'users'
          AND kcu.REFERENCED_COLUMN_NAME = 'id'
          AND kcu.TABLE_SCHEMA = DATABASE()
      `);

      for (const fk of fkRows) {
        try {
          await db.query(`ALTER TABLE \`${fk.TABLE_NAME}\` DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\``);
        } catch (e) {
          // ignore
        }
      }

      // Drop PK from id
      await db.query(`ALTER TABLE users MODIFY id INTEGER NOT NULL`);
      await db.query(`ALTER TABLE users DROP PRIMARY KEY`);
      await db.query(`ALTER TABLE users MODIFY id INTEGER NULL`);

      // Ensure no nulls in userId
      await db.query(`UPDATE users SET userId = id WHERE userId IS NULL OR userId = 0`);

      // Drop existing non-primary unique/indexes on userId
      const [uidxRows] = await db.query(`SHOW INDEX FROM users WHERE Column_name = 'userId' AND Key_name != 'PRIMARY'`);
      for (const idx of uidxRows) {
        try {
          await db.query(`ALTER TABLE users DROP INDEX \`${idx.Key_name}\``);
        } catch (e) {
          // ignore
        }
      }

      // Make userId PRIMARY KEY AUTO_INCREMENT
      await db.query(`ALTER TABLE users MODIFY userId INTEGER NOT NULL AUTO_INCREMENT, ADD PRIMARY KEY (userId)`);
      console.log('  ✓ users.userId is now PRIMARY KEY AUTO_INCREMENT');
    } finally {
      await db.query('SET FOREIGN_KEY_CHECKS = 1');
    }
  },

  down: async (queryInterface, Sequelize) => {
    const db = queryInterface.sequelize;
    const tableDesc = await queryInterface.describeTable('users');

    try {
      await db.query('SET FOREIGN_KEY_CHECKS = 0');

      if (tableDesc.id) {
        await db.query(`ALTER TABLE users MODIFY userId INTEGER NOT NULL`);
        await db.query(`ALTER TABLE users DROP PRIMARY KEY`);
        await db.query(`ALTER TABLE users MODIFY id INTEGER NOT NULL AUTO_INCREMENT, ADD PRIMARY KEY (id)`);
        console.log('  ✓ Reverted PRIMARY KEY back to users.id');
      }

      if (tableDesc.googleId) {
        await queryInterface.removeColumn('users', 'googleId');
      }
      if (tableDesc.resetPasswordToken) {
        await queryInterface.removeColumn('users', 'resetPasswordToken');
      }
      if (tableDesc.resetPasswordExpires) {
        await queryInterface.removeColumn('users', 'resetPasswordExpires');
      }
    } finally {
      await db.query('SET FOREIGN_KEY_CHECKS = 1');
    }
  }
};
