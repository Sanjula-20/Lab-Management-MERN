'use strict';

const { DataTypes } = require('sequelize');

/**
 * Migration: Add Role and Department tables + update users table with RBAC columns
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();

    // ============= 1. ROLES TABLE =============
    if (!tables.includes('roles')) {
      console.log('  📋 Creating roles table...');
      await queryInterface.createTable('roles', {
        roleId: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        roleName: {
          type: DataTypes.STRING(100),
          allowNull: false,
          unique: true,
        },
        status: {
          type: DataTypes.ENUM('Active', 'Inactive'),
          allowNull: false,
          defaultValue: 'Active',
        },
        createdBy: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        updatedBy: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        },
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        }
      });
      console.log('  ✓ Roles table created');

      // Insert default roles
      const defaultRoles = [
        { roleName: 'Student', status: 'Active' },
        { roleName: 'Faculty', status: 'Active' },
        { roleName: 'Teacher', status: 'Active' },
        { roleName: 'Lab Assistant', status: 'Active' },
        { roleName: 'Lab Technician', status: 'Active' },
        { roleName: 'Admin', status: 'Active' },
      ];
      for (const role of defaultRoles) {
        await queryInterface.bulkInsert('roles', [{
          ...role,
          createdAt: new Date(),
          updatedAt: new Date()
        }]);
      }
      console.log('  ✓ Default roles inserted');
    }

    // ============= 2. DEPARTMENTS TABLE =============
    if (!tables.includes('departments')) {
      console.log('  📋 Creating departments table...');
      await queryInterface.createTable('departments', {
        departmentId: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        departmentName: {
          type: DataTypes.STRING(100),
          allowNull: false,
        },
        departmentAcr: {
          type: DataTypes.STRING(10),
          allowNull: false,
        },
        status: {
          type: DataTypes.ENUM('Active', 'Inactive', 'Archived'),
          allowNull: false,
          defaultValue: 'Active',
        },
        companyId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        createdBy: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        updatedBy: {
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        createdAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        },
        deletedAt: {
          type: DataTypes.DATE,
          allowNull: true,
        }
      });
      console.log('  ✓ Departments table created');

      // Populate departments from existing users if available
      try {
        const [existingDepts] = await queryInterface.sequelize.query(
          `SELECT DISTINCT department FROM users WHERE department IS NOT NULL AND department != ''`
        );
        for (const dept of existingDepts) {
          const deptName = dept.department;
          const deptAcr = deptName.substring(0, 10).toUpperCase();
          await queryInterface.bulkInsert('departments', [{
            departmentName: deptName,
            departmentAcr: deptAcr,
            status: 'Active',
            companyId: 0,
            createdAt: new Date(),
            updatedAt: new Date()
          }]);
        }
      } catch (deptErr) {
        // Table or column might not exist yet
      }
    }

    // ============= 3. ADD RBAC COLUMNS TO USERS =============
    const userCols = await queryInterface.describeTable('users');

    const newColumns = [
      { name: 'companyId', def: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 } },
      { name: 'departmentId', def: { type: DataTypes.INTEGER, allowNull: true } },
      { name: 'userNumber', def: { type: DataTypes.STRING(50), allowNull: true } },
      { name: 'userName', def: { type: DataTypes.STRING(255), allowNull: true } },
      { name: 'userMail', def: { type: DataTypes.STRING(255), allowNull: true } },
      { name: 'roleId', def: { type: DataTypes.INTEGER, allowNull: true } },
      { name: 'userId', def: { type: DataTypes.INTEGER, allowNull: true } },
      { name: 'status', def: { type: DataTypes.ENUM('Active', 'Inactive'), defaultValue: 'Active' } },
      { name: 'profileImage', def: { type: DataTypes.STRING(500), defaultValue: '/uploads/default.jpg' } },
      { name: 'authProvider', def: { type: DataTypes.ENUM('local', 'google'), defaultValue: 'local' } },
      { name: 'resetOTP', def: { type: DataTypes.STRING(255), allowNull: true } },
      { name: 'resetOTPExpires', def: { type: DataTypes.DATE, allowNull: true } }
    ];

    for (const col of newColumns) {
      if (!userCols[col.name]) {
        await queryInterface.addColumn('users', col.name, col.def);
        console.log(`  ✓ Added users.${col.name}`);
      }
    }

    // ============= 4. MIGRATE DATA FROM OLD USER COLUMNS IF PRESENT =============
    try {
      if (userCols.id) {
        await queryInterface.sequelize.query(`UPDATE users SET userId = id WHERE userId IS NULL`);
      }
      if (userCols.name) {
        await queryInterface.sequelize.query(`UPDATE users SET userName = name WHERE userName IS NULL AND name IS NOT NULL`);
      }
      if (userCols.email) {
        await queryInterface.sequelize.query(`UPDATE users SET userMail = email WHERE userMail IS NULL AND email IS NOT NULL`);
      }
      if (userCols.student_id) {
        await queryInterface.sequelize.query(`UPDATE users SET userNumber = student_id WHERE userNumber IS NULL AND student_id IS NOT NULL`);
      }
      // Populate userNumber fallback
      await queryInterface.sequelize.query(`UPDATE users SET userNumber = CONCAT('USR', LPAD(COALESCE(userId, id, 1), 6, '0')) WHERE userNumber IS NULL OR userNumber = ''`);

      // Map roles
      const roleMap = { 'student': 1, 'faculty': 2, 'teacher': 3, 'lab_assistant': 4, 'lab_technician': 5, 'admin': 6 };
      if (userCols.role) {
        for (const [rName, rId] of Object.entries(roleMap)) {
          await queryInterface.sequelize.query(`UPDATE users SET roleId = ${rId} WHERE role = '${rName}' AND roleId IS NULL`);
        }
      }
      await queryInterface.sequelize.query(`UPDATE users SET roleId = 1 WHERE roleId IS NULL`);

      console.log('  ✓ Migrated legacy user data to new columns');
    } catch (migErr) {
      console.log('  ℹ️ Legacy user data migration note:', migErr.message);
    }
  },

  down: async (queryInterface, Sequelize) => {
    const userCols = await queryInterface.describeTable('users');
    const colsToRemove = [
      'userId', 'companyId', 'departmentId', 'userNumber',
      'userName', 'userMail', 'roleId', 'status',
      'profileImage', 'authProvider', 'resetOTP', 'resetOTPExpires'
    ];

    for (const col of colsToRemove) {
      if (userCols[col]) {
        await queryInterface.removeColumn('users', col);
      }
    }

    const tables = await queryInterface.showAllTables();
    if (tables.includes('departments')) {
      await queryInterface.dropTable('departments');
    }
    if (tables.includes('roles')) {
      await queryInterface.dropTable('roles');
    }
    console.log('  ✓ Rolled back Role and Department tables and user columns');
  }
};
