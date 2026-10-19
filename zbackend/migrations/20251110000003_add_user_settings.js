'use strict';

/**
 * Migration: Add user settings and preferences columns to users table
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('users');

    const columnsToAdd = [
      { name: 'language', type: Sequelize.STRING(10), defaultValue: 'en' },
      { name: 'timezone', type: Sequelize.STRING(50), defaultValue: 'UTC' },
      { name: 'theme', type: Sequelize.STRING(20), defaultValue: 'light' },
      { name: 'profile_visibility', type: Sequelize.STRING(20), defaultValue: 'public' },
      { name: 'show_email', type: Sequelize.BOOLEAN, defaultValue: false },
      { name: 'show_phone', type: Sequelize.BOOLEAN, defaultValue: false },
      { name: 'email_notifications', type: Sequelize.BOOLEAN, defaultValue: true },
      { name: 'push_notifications', type: Sequelize.BOOLEAN, defaultValue: true },
      { name: 'sms_notifications', type: Sequelize.BOOLEAN, defaultValue: false },
      { name: 'booking_confirmations', type: Sequelize.BOOLEAN, defaultValue: true },
      { name: 'booking_reminders', type: Sequelize.BOOLEAN, defaultValue: true },
      { name: 'booking_cancellations', type: Sequelize.BOOLEAN, defaultValue: true },
      { name: 'maintenance_alerts', type: Sequelize.BOOLEAN, defaultValue: true },
      { name: 'equipment_updates', type: Sequelize.BOOLEAN, defaultValue: true },
      { name: 'system_updates', type: Sequelize.BOOLEAN, defaultValue: true },
      { name: 'marketing_emails', type: Sequelize.BOOLEAN, defaultValue: false },
      { name: 'newsletter', type: Sequelize.BOOLEAN, defaultValue: true },
      { name: 'auto_logout', type: Sequelize.INTEGER, defaultValue: 30 },
      { name: 'session_timeout', type: Sequelize.INTEGER, defaultValue: 60 },
      { name: 'two_factor_enabled', type: Sequelize.BOOLEAN, defaultValue: false },
      { name: 'backup_codes_generated', type: Sequelize.BOOLEAN, defaultValue: false },
      { name: 'backup_codes', type: Sequelize.TEXT, defaultValue: null },
      { name: 'deleted_at', type: Sequelize.DATE, defaultValue: null }
    ];

    for (const col of columnsToAdd) {
      if (!tableDesc[col.name]) {
        await queryInterface.addColumn('users', col.name, {
          type: col.type,
          defaultValue: col.defaultValue,
          allowNull: true
        });
        console.log(`  ✓ Added users.${col.name}`);
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDesc = await queryInterface.describeTable('users');
    const columnsToRemove = [
      'language', 'timezone', 'theme',
      'profile_visibility', 'show_email', 'show_phone',
      'email_notifications', 'push_notifications', 'sms_notifications',
      'booking_confirmations', 'booking_reminders', 'booking_cancellations',
      'maintenance_alerts', 'equipment_updates', 'system_updates',
      'marketing_emails', 'newsletter',
      'auto_logout', 'session_timeout', 'two_factor_enabled',
      'backup_codes_generated', 'backup_codes', 'deleted_at'
    ];

    for (const colName of columnsToRemove) {
      if (tableDesc[colName]) {
        await queryInterface.removeColumn('users', colName);
        console.log(`  ✓ Removed users.${colName}`);
      }
    }
  }
};
