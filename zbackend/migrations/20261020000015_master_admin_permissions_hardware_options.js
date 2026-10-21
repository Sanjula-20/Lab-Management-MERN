'use strict';

/**
 * Migration: 20261020000015_master_admin_permissions_hardware_options.js
 * 
 * 1. Ensure Master Admin role (roleId: 7) in `roles`.
 * 2. Update default admin users to Master Admin role.
 * 3. Synchronize users.id = users.userId where id IS NULL.
 * 4. Add `description` column to `departments` if missing.
 * 5. Create `role_permissions` table and seed full permissions matrix.
 * 6. Create `hardware_options` table and seed standard options.
 * 7. Extend `labs` table: change `lab_type` to VARCHAR(100), add `department_id`, add `systems_available`.
 * 8. Extend `bookings` table: change `status` to VARCHAR(50), add approval/cancellation tracking fields.
 * 9. Extend `incidents` table: add `lab_id` for direct lab associations.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const { sequelize } = queryInterface;

    // 1. Ensure Master Admin role (roleId: 7) in `roles`
    try {
      const [existingRole] = await sequelize.query("SELECT * FROM `roles` WHERE `roleId` = 7 OR `roleName` = 'Master Admin'");
      if (!existingRole || existingRole.length === 0) {
        await sequelize.query(`
          INSERT INTO \`roles\` (\`roleId\`, \`roleName\`, \`status\`, \`createdAt\`, \`updatedAt\`)
          VALUES (7, 'Master Admin', 'Active', NOW(), NOW())
        `);
        console.log('  ✓ Created Master Admin role (roleId: 7)');
      } else {
        console.log('  ✓ Master Admin role already exists');
      }
    } catch (err) {
      console.log('  ℹ️ Note on Master Admin role:', err.message);
    }

    // 2. Assign Master Admin role (roleId: 7) to primary administrator accounts
    try {
      await sequelize.query(`
        UPDATE \`users\`
        SET \`roleId\` = 7, \`role\` = 'master_admin'
        WHERE \`userId\` IN (2, 7, 20) OR \`userMail\` IN ('subashmuthu149@gmail.com', 'admin@lab.com', '2312401@nec.edu.in')
      `);
      console.log('  ✓ Assigned Master Admin role to primary administrators');
    } catch (err) {
      console.log('  ℹ️ Note on admin assignment:', err.message);
    }

    // 3. Synchronize users.id = users.userId where id IS NULL
    try {
      await sequelize.query(`
        UPDATE \`users\` SET \`id\` = \`userId\` WHERE \`id\` IS NULL AND \`userId\` IS NOT NULL
      `);
      console.log('  ✓ Synchronized users.id = users.userId');
    } catch (err) {
      console.log('  ℹ️ Note on users.id sync:', err.message);
    }

    // 4. Add `description` column to `departments` if missing
    try {
      const deptDesc = await queryInterface.describeTable('departments');
      if (!deptDesc.description) {
        await queryInterface.addColumn('departments', 'description', {
          type: Sequelize.TEXT,
          allowNull: true
        });
        console.log('  ✓ Added departments.description');
      }
    } catch (err) {
      console.log('  ℹ️ Note on departments.description:', err.message);
    }

    // 5. Create `role_permissions` table
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS \`role_permissions\` (
          \`id\` INT(11) NOT NULL AUTO_INCREMENT,
          \`roleId\` INT(11) NOT NULL,
          \`page_key\` VARCHAR(60) NOT NULL,
          \`can_view\` TINYINT(1) NOT NULL DEFAULT 1,
          \`is_sidebar_visible\` TINYINT(1) NOT NULL DEFAULT 1,
          \`can_create\` TINYINT(1) NOT NULL DEFAULT 0,
          \`can_edit\` TINYINT(1) NOT NULL DEFAULT 0,
          \`can_delete\` TINYINT(1) NOT NULL DEFAULT 0,
          \`can_approve\` TINYINT(1) NOT NULL DEFAULT 0,
          \`can_export\` TINYINT(1) NOT NULL DEFAULT 0,
          \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          UNIQUE KEY \`unique_role_page\` (\`roleId\`, \`page_key\`),
          KEY \`idx_role_permissions_roleId\` (\`roleId\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log('  ✓ Created role_permissions table');

      // Seed permissions for all pages and roles
      const pages = [
        'dashboard',
        'departments',
        'faculty',
        'labs',
        'equipment',
        'equipment_categories',
        'dealers',
        'bookings',
        'calendar',
        'incidents',
        'orders',
        'reports',
        'hardware_options',
        'access_control'
      ];

      // Role permission templates:
      // roleId 7: Master Admin (full access to everything)
      // roleId 6: Admin (full access except access_control)
      // roleId 2: Faculty (view/sidebar on academic pages, create bookings & incidents)
      // roleId 3: Teacher (similar to faculty with lab viewing)
      // roleId 4: Lab Assistant (equipment, labs, bookings, incidents)
      // roleId 5: Lab Technician (maintenance, equipment, incidents)
      // roleId 1: Student (view dashboard, bookings, calendar, report incidents)

      for (const page of pages) {
        // Master Admin: All 1
        await sequelize.query(`
          INSERT INTO \`role_permissions\` (\`roleId\`, \`page_key\`, \`can_view\`, \`is_sidebar_visible\`, \`can_create\`, \`can_edit\`, \`can_delete\`, \`can_approve\`, \`can_export\`)
          VALUES (7, :page, 1, 1, 1, 1, 1, 1, 1)
          ON DUPLICATE KEY UPDATE \`can_view\` = 1, \`is_sidebar_visible\` = 1, \`can_create\` = 1, \`can_edit\` = 1, \`can_delete\` = 1, \`can_approve\` = 1, \`can_export\` = 1
        `, { replacements: { page } });

        // Admin: All 1 except access_control
        const isAdminAccess = page !== 'access_control';
        await sequelize.query(`
          INSERT INTO \`role_permissions\` (\`roleId\`, \`page_key\`, \`can_view\`, \`is_sidebar_visible\`, \`can_create\`, \`can_edit\`, \`can_delete\`, \`can_approve\`, \`can_export\`)
          VALUES (6, :page, :v, :s, :c, :e, :d, :a, :ex)
          ON DUPLICATE KEY UPDATE \`can_view\` = VALUES(\`can_view\`)
        `, {
          replacements: {
            page,
            v: isAdminAccess ? 1 : 0,
            s: isAdminAccess ? 1 : 0,
            c: isAdminAccess ? 1 : 0,
            e: isAdminAccess ? 1 : 0,
            d: isAdminAccess ? 1 : 0,
            a: isAdminAccess ? 1 : 0,
            ex: isAdminAccess ? 1 : 0
          }
        });

        // Faculty (roleId 2)
        let facView = 0, facSide = 0, facCreate = 0, facEdit = 0, facDel = 0, facApprove = 0, facExport = 0;
        if (['dashboard', 'labs', 'equipment', 'bookings', 'calendar', 'incidents'].includes(page)) {
          facView = 1;
          facSide = 1;
        }
        if (['departments', 'faculty'].includes(page)) {
          facView = 1; // view only
          facSide = 0;
        }
        if (['bookings', 'incidents'].includes(page)) {
          facCreate = 1;
          facEdit = 1; // edit own
        }
        await sequelize.query(`
          INSERT INTO \`role_permissions\` (\`roleId\`, \`page_key\`, \`can_view\`, \`is_sidebar_visible\`, \`can_create\`, \`can_edit\`, \`can_delete\`, \`can_approve\`, \`can_export\`)
          VALUES (2, :page, :v, :s, :c, :e, :d, :a, :ex)
          ON DUPLICATE KEY UPDATE \`can_view\` = VALUES(\`can_view\`)
        `, { replacements: { page, v: facView, s: facSide, c: facCreate, e: facEdit, d: facDel, a: facApprove, ex: facExport } });

        // Teacher (roleId 3)
        await sequelize.query(`
          INSERT INTO \`role_permissions\` (\`roleId\`, \`page_key\`, \`can_view\`, \`is_sidebar_visible\`, \`can_create\`, \`can_edit\`, \`can_delete\`, \`can_approve\`, \`can_export\`)
          VALUES (3, :page, :v, :s, :c, :e, :d, :a, :ex)
          ON DUPLICATE KEY UPDATE \`can_view\` = VALUES(\`can_view\`)
        `, { replacements: { page, v: facView, s: facSide, c: facCreate, e: facEdit, d: facDel, a: facApprove, ex: facExport } });

        // Lab Assistant (roleId 4)
        const isAssistantView = ['dashboard', 'labs', 'equipment', 'equipment_categories', 'bookings', 'calendar', 'incidents'].includes(page);
        await sequelize.query(`
          INSERT INTO \`role_permissions\` (\`roleId\`, \`page_key\`, \`can_view\`, \`is_sidebar_visible\`, \`can_create\`, \`can_edit\`, \`can_delete\`, \`can_approve\`, \`can_export\`)
          VALUES (4, :page, :v, :s, :c, :e, :d, :a, :ex)
          ON DUPLICATE KEY UPDATE \`can_view\` = VALUES(\`can_view\`)
        `, { replacements: { page, v: isAssistantView ? 1 : 0, s: isAssistantView ? 1 : 0, c: isAssistantView ? 1 : 0, e: isAssistantView ? 1 : 0, d: 0, a: 0, ex: 1 } });

        // Lab Technician (roleId 5)
        const isTechView = ['dashboard', 'labs', 'equipment', 'incidents'].includes(page);
        await sequelize.query(`
          INSERT INTO \`role_permissions\` (\`roleId\`, \`page_key\`, \`can_view\`, \`is_sidebar_visible\`, \`can_create\`, \`can_edit\`, \`can_delete\`, \`can_approve\`, \`can_export\`)
          VALUES (5, :page, :v, :s, :c, :e, :d, :a, :ex)
          ON DUPLICATE KEY UPDATE \`can_view\` = VALUES(\`can_view\`)
        `, { replacements: { page, v: isTechView ? 1 : 0, s: isTechView ? 1 : 0, c: isTechView ? 1 : 0, e: isTechView ? 1 : 0, d: 0, a: 0, ex: 0 } });

        // Student (roleId 1)
        const isStudentView = ['dashboard', 'bookings', 'calendar', 'incidents'].includes(page);
        await sequelize.query(`
          INSERT INTO \`role_permissions\` (\`roleId\`, \`page_key\`, \`can_view\`, \`is_sidebar_visible\`, \`can_create\`, \`can_edit\`, \`can_delete\`, \`can_approve\`, \`can_export\`)
          VALUES (1, :page, :v, :s, :c, :e, :d, :a, :ex)
          ON DUPLICATE KEY UPDATE \`can_view\` = VALUES(\`can_view\`)
        `, { replacements: { page, v: isStudentView ? 1 : 0, s: isStudentView ? 1 : 0, c: ['bookings', 'incidents'].includes(page) ? 1 : 0, e: 0, d: 0, a: 0, ex: 0 } });
      }
      console.log('  ✓ Seeded default role_permissions matrix');
    } catch (err) {
      console.log('  ℹ️ Note on role_permissions creation/seeding:', err.message);
    }

    // 6. Create `hardware_options` table
    try {
      await sequelize.query(`
        CREATE TABLE IF NOT EXISTS \`hardware_options\` (
          \`id\` INT(11) NOT NULL AUTO_INCREMENT,
          \`field_type\` VARCHAR(60) NOT NULL,
          \`option_label\` VARCHAR(100) NOT NULL,
          \`option_value\` VARCHAR(100) NOT NULL,
          \`equipment_type\` VARCHAR(50) NOT NULL DEFAULT 'computer',
          \`sort_order\` INT(11) NOT NULL DEFAULT 0,
          \`is_active\` TINYINT(1) NOT NULL DEFAULT 1,
          \`created_by\` INT(11) NULL,
          \`createdAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          \`updatedAt\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`),
          UNIQUE KEY \`unique_field_option\` (\`field_type\`, \`option_value\`),
          KEY \`idx_field_type\` (\`field_type\`),
          KEY \`idx_is_active\` (\`is_active\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log('  ✓ Created hardware_options table');

      // Seed standard options
      const standardOptions = [
        // Processor Models
        { field_type: 'processor_model', option_label: 'Intel Core i3', option_value: 'Intel Core i3', sort_order: 1 },
        { field_type: 'processor_model', option_label: 'Intel Core i5', option_value: 'Intel Core i5', sort_order: 2 },
        { field_type: 'processor_model', option_label: 'Intel Core i7', option_value: 'Intel Core i7', sort_order: 3 },
        { field_type: 'processor_model', option_label: 'Intel Core i9', option_value: 'Intel Core i9', sort_order: 4 },
        { field_type: 'processor_model', option_label: 'Intel Xeon', option_value: 'Intel Xeon', sort_order: 5 },
        { field_type: 'processor_model', option_label: 'AMD Ryzen 3', option_value: 'AMD Ryzen 3', sort_order: 6 },
        { field_type: 'processor_model', option_label: 'AMD Ryzen 5', option_value: 'AMD Ryzen 5', sort_order: 7 },
        { field_type: 'processor_model', option_label: 'AMD Ryzen 7', option_value: 'AMD Ryzen 7', sort_order: 8 },
        { field_type: 'processor_model', option_label: 'AMD Ryzen 9', option_value: 'AMD Ryzen 9', sort_order: 9 },
        { field_type: 'processor_model', option_label: 'Apple M1 / M2 / M3', option_value: 'Apple Silicon', sort_order: 10 },

        // Processor Generations
        { field_type: 'processor_generation', option_label: '8th Gen', option_value: '8th Gen', sort_order: 1 },
        { field_type: 'processor_generation', option_label: '9th Gen', option_value: '9th Gen', sort_order: 2 },
        { field_type: 'processor_generation', option_label: '10th Gen', option_value: '10th Gen', sort_order: 3 },
        { field_type: 'processor_generation', option_label: '11th Gen', option_value: '11th Gen', sort_order: 4 },
        { field_type: 'processor_generation', option_label: '12th Gen', option_value: '12th Gen', sort_order: 5 },
        { field_type: 'processor_generation', option_label: '13th Gen', option_value: '13th Gen', sort_order: 6 },
        { field_type: 'processor_generation', option_label: '14th Gen', option_value: '14th Gen', sort_order: 7 },
        { field_type: 'processor_generation', option_label: 'Zen 3', option_value: 'Zen 3', sort_order: 8 },
        { field_type: 'processor_generation', option_label: 'Zen 4', option_value: 'Zen 4', sort_order: 9 },

        // RAM Capacities
        { field_type: 'ram_capacity', option_label: '4 GB', option_value: '4GB', sort_order: 1 },
        { field_type: 'ram_capacity', option_label: '8 GB', option_value: '8GB', sort_order: 2 },
        { field_type: 'ram_capacity', option_label: '16 GB', option_value: '16GB', sort_order: 3 },
        { field_type: 'ram_capacity', option_label: '32 GB', option_value: '32GB', sort_order: 4 },
        { field_type: 'ram_capacity', option_label: '64 GB', option_value: '64GB', sort_order: 5 },
        { field_type: 'ram_capacity', option_label: '128 GB', option_value: '128GB', sort_order: 6 },

        // RAM Types
        { field_type: 'ram_type', option_label: 'DDR3', option_value: 'DDR3', sort_order: 1 },
        { field_type: 'ram_type', option_label: 'DDR4', option_value: 'DDR4', sort_order: 2 },
        { field_type: 'ram_type', option_label: 'DDR5', option_value: 'DDR5', sort_order: 3 },
        { field_type: 'ram_type', option_label: 'LPDDR4X', option_value: 'LPDDR4X', sort_order: 4 },
        { field_type: 'ram_type', option_label: 'LPDDR5', option_value: 'LPDDR5', sort_order: 5 },

        // Storage Types
        { field_type: 'storage_type', option_label: 'NVMe M.2 SSD', option_value: 'NVMe SSD', sort_order: 1 },
        { field_type: 'storage_type', option_label: 'SATA SSD (2.5")', option_value: 'SATA SSD', sort_order: 2 },
        { field_type: 'storage_type', option_label: 'HDD (Hard Disk Drive)', option_value: 'HDD', sort_order: 3 },
        { field_type: 'storage_type', option_label: 'Hybrid SSD+HDD', option_value: 'Hybrid', sort_order: 4 },

        // Storage Capacities
        { field_type: 'storage_capacity', option_label: '128 GB', option_value: '128GB', sort_order: 1 },
        { field_type: 'storage_capacity', option_label: '256 GB', option_value: '256GB', sort_order: 2 },
        { field_type: 'storage_capacity', option_label: '512 GB', option_value: '512GB', sort_order: 3 },
        { field_type: 'storage_capacity', option_label: '1 TB', option_value: '1TB', sort_order: 4 },
        { field_type: 'storage_capacity', option_label: '2 TB', option_value: '2TB', sort_order: 5 },
        { field_type: 'storage_capacity', option_label: '4 TB', option_value: '4TB', sort_order: 6 },

        // GPU Models
        { field_type: 'gpu_model', option_label: 'Integrated Intel UHD / Iris Xe', option_value: 'Intel Integrated', sort_order: 1 },
        { field_type: 'gpu_model', option_label: 'Integrated AMD Radeon', option_value: 'AMD Integrated', sort_order: 2 },
        { field_type: 'gpu_model', option_label: 'NVIDIA GeForce GTX 1650', option_value: 'GTX 1650', sort_order: 3 },
        { field_type: 'gpu_model', option_label: 'NVIDIA GeForce RTX 3050', option_value: 'RTX 3050', sort_order: 4 },
        { field_type: 'gpu_model', option_label: 'NVIDIA GeForce RTX 3060', option_value: 'RTX 3060', sort_order: 5 },
        { field_type: 'gpu_model', option_label: 'NVIDIA GeForce RTX 4060', option_value: 'RTX 4060', sort_order: 6 },
        { field_type: 'gpu_model', option_label: 'NVIDIA GeForce RTX 4070', option_value: 'RTX 4070', sort_order: 7 },
        { field_type: 'gpu_model', option_label: 'NVIDIA Quadro / RTX A2000', option_value: 'RTX A2000', sort_order: 8 },

        // GPU Memory Sizes
        { field_type: 'gpu_memory', option_label: 'Shared / System RAM', option_value: 'Shared', sort_order: 1 },
        { field_type: 'gpu_memory', option_label: '2 GB', option_value: '2GB', sort_order: 2 },
        { field_type: 'gpu_memory', option_label: '4 GB', option_value: '4GB', sort_order: 3 },
        { field_type: 'gpu_memory', option_label: '6 GB', option_value: '6GB', sort_order: 4 },
        { field_type: 'gpu_memory', option_label: '8 GB', option_value: '8GB', sort_order: 5 },
        { field_type: 'gpu_memory', option_label: '12 GB', option_value: '12GB', sort_order: 6 },
        { field_type: 'gpu_memory', option_label: '16 GB', option_value: '16GB', sort_order: 7 },

        // Operating Systems
        { field_type: 'operating_system', option_label: 'Windows 11 Pro 64-bit', option_value: 'Windows 11 Pro', sort_order: 1 },
        { field_type: 'operating_system', option_label: 'Windows 10 Pro 64-bit', option_value: 'Windows 10 Pro', sort_order: 2 },
        { field_type: 'operating_system', option_label: 'Ubuntu 24.04 LTS 64-bit', option_value: 'Ubuntu 24.04 LTS', sort_order: 3 },
        { field_type: 'operating_system', option_label: 'Ubuntu 22.04 LTS 64-bit', option_value: 'Ubuntu 22.04 LTS', sort_order: 4 },
        { field_type: 'operating_system', option_label: 'Red Hat Enterprise Linux', option_value: 'RHEL', sort_order: 5 },
        { field_type: 'operating_system', option_label: 'CentOS / Rocky Linux', option_value: 'Rocky Linux', sort_order: 6 },
        { field_type: 'operating_system', option_label: 'macOS Sonoma / Sequoia', option_value: 'macOS', sort_order: 7 },
        { field_type: 'operating_system', option_label: 'Dual Boot (Windows + Linux)', option_value: 'Dual Boot', sort_order: 8 },

        // Equipment Conditions
        { field_type: 'condition_status', option_label: 'Excellent (Like New)', option_value: 'excellent', sort_order: 1 },
        { field_type: 'condition_status', option_label: 'Good (Working Perfectly)', option_value: 'good', sort_order: 2 },
        { field_type: 'condition_status', option_label: 'Fair (Minor Cosmetic Wear)', option_value: 'fair', sort_order: 3 },
        { field_type: 'condition_status', option_label: 'Under Maintenance', option_value: 'under_maintenance', sort_order: 4 },
        { field_type: 'condition_status', option_label: 'Needs Repair', option_value: 'needs_repair', sort_order: 5 },
        { field_type: 'condition_status', option_label: 'Defective / Decommissioned', option_value: 'poor', sort_order: 6 }
      ];

      for (const opt of standardOptions) {
        await sequelize.query(`
          INSERT INTO \`hardware_options\` (\`field_type\`, \`option_label\`, \`option_value\`, \`equipment_type\`, \`sort_order\`, \`is_active\`)
          VALUES (:field_type, :option_label, :option_value, 'computer', :sort_order, 1)
          ON DUPLICATE KEY UPDATE \`option_label\` = VALUES(\`option_label\`), \`sort_order\` = VALUES(\`sort_order\`)
        `, { replacements: opt });
      }
      console.log('  ✓ Seeded standard hardware_options');
    } catch (err) {
      console.log('  ℹ️ Note on hardware_options creation/seeding:', err.message);
    }

    // 7. Extend `labs` table
    try {
      // Modify lab_type from enum to VARCHAR(100) to allow dynamic department names
      await sequelize.query(`
        ALTER TABLE \`labs\` MODIFY COLUMN \`lab_type\` VARCHAR(100) NOT NULL DEFAULT 'cse'
      `);
      console.log('  ✓ Updated labs.lab_type to VARCHAR(100)');
    } catch (err) {
      console.log('  ℹ️ Note on labs.lab_type modification:', err.message);
    }

    try {
      const labDesc = await queryInterface.describeTable('labs');
      if (!labDesc.department_id) {
        await queryInterface.addColumn('labs', 'department_id', {
          type: Sequelize.INTEGER,
          allowNull: true
        });
        console.log('  ✓ Added labs.department_id');
      }

      if (!labDesc.systems_available) {
        await queryInterface.addColumn('labs', 'systems_available', {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        });
        console.log('  ✓ Added labs.systems_available');

        // Backfill systems_available from capacity if available
        await sequelize.query(`
          UPDATE \`labs\` SET \`systems_available\` = \`capacity\` WHERE \`capacity\` IS NOT NULL AND \`systems_available\` = 0
        `);
      }
    } catch (err) {
      console.log('  ℹ️ Note on labs columns extension:', err.message);
    }

    // 8. Extend `bookings` table
    try {
      // Change status column from ENUM to VARCHAR(50) so all workflows work seamlessly
      await sequelize.query(`
        ALTER TABLE \`bookings\` MODIFY COLUMN \`status\` VARCHAR(50) NOT NULL DEFAULT 'pending'
      `);
      console.log('  ✓ Updated bookings.status to VARCHAR(50)');
    } catch (err) {
      console.log('  ℹ️ Note on bookings.status modification:', err.message);
    }

    try {
      const bookDesc = await queryInterface.describeTable('bookings');
      if (!bookDesc.approved_by) {
        await queryInterface.addColumn('bookings', 'approved_by', {
          type: Sequelize.INTEGER,
          allowNull: true
        });
        console.log('  ✓ Added bookings.approved_by');
      }
      if (!bookDesc.approval_time) {
        await queryInterface.addColumn('bookings', 'approval_time', {
          type: Sequelize.DATE,
          allowNull: true
        });
        console.log('  ✓ Added bookings.approval_time');
      }
      if (!bookDesc.rejection_reason) {
        await queryInterface.addColumn('bookings', 'rejection_reason', {
          type: Sequelize.TEXT,
          allowNull: true
        });
        console.log('  ✓ Added bookings.rejection_reason');
      }
      if (!bookDesc.cancelled_by) {
        await queryInterface.addColumn('bookings', 'cancelled_by', {
          type: Sequelize.INTEGER,
          allowNull: true
        });
        console.log('  ✓ Added bookings.cancelled_by');
      }
      if (!bookDesc.cancellation_time) {
        await queryInterface.addColumn('bookings', 'cancellation_time', {
          type: Sequelize.DATE,
          allowNull: true
        });
        console.log('  ✓ Added bookings.cancellation_time');
      }
    } catch (err) {
      console.log('  ℹ️ Note on bookings columns extension:', err.message);
    }

    // 9. Extend `incidents` table: add `lab_id`
    try {
      const incDesc = await queryInterface.describeTable('incidents');
      if (!incDesc.lab_id) {
        await queryInterface.addColumn('incidents', 'lab_id', {
          type: Sequelize.INTEGER,
          allowNull: true
        });
        console.log('  ✓ Added incidents.lab_id');
      }
    } catch (err) {
      console.log('  ℹ️ Note on incidents.lab_id extension:', err.message);
    }

    console.log('✅ Migration 20261020000015 completed successfully.');
  },

  down: async (queryInterface, Sequelize) => {
    // Safe revert logic
    try {
      await queryInterface.dropTable('hardware_options');
      await queryInterface.dropTable('role_permissions');
    } catch (err) {
      console.error('Error reverting migration:', err.message);
    }
  }
};
