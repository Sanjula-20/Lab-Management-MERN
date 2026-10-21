'use strict';

const bcrypt = require('bcryptjs');

/**
 * Initial Reference Data Seeder
 * 
 * Safely seeds:
 * 1. Essential Academic Departments
 * 2. Standard Equipment Categories
 * 3. Initial Administrator User (only if no admin exists)
 * 
 * Safe and idempotent:
 * - Uses ON DUPLICATE KEY UPDATE for departments and categories
 * - Checks for existing admin before creating
 * - Never commits passwords; reads from environment variables with safe dev fallbacks
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const db = queryInterface.sequelize;

    console.log('\n🌱 SEEDING INITIAL REFERENCE DATA');
    console.log('═'.repeat(60));

    // 1. Seed Academic Departments
    console.log('1. Seeding Departments...');
    const departments = [
      { id: 1, name: 'Computer Science and Engineering', acr: 'CSE' },
      { id: 2, name: 'Electronics and Communication Engineering', acr: 'ECE' },
      { id: 3, name: 'Electrical and Electronics Engineering', acr: 'EEE' },
      { id: 4, name: 'Mechanical Engineering', acr: 'MECH' },
      { id: 5, name: 'Information Technology', acr: 'IT' },
      { id: 6, name: 'Civil Engineering', acr: 'CIVIL' },
      { id: 7, name: 'Artificial Intelligence and Data Science', acr: 'AI-DS' }
    ];

    for (const dept of departments) {
      await db.query(`
        INSERT INTO departments (departmentId, departmentName, departmentAcr, status, companyId, createdAt, updatedAt)
        VALUES (?, ?, ?, 'Active', 0, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          departmentName = VALUES(departmentName),
          departmentAcr = VALUES(departmentAcr),
          status = VALUES(status)
      `, {
        replacements: [dept.id, dept.name, dept.acr]
      });
    }
    console.log(`  ✓ ${departments.length} essential departments verified/seeded.`);

    // 2. Seed Standard Equipment Categories
    console.log('2. Seeding Equipment Categories...');
    const categories = [
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

    for (const cat of categories) {
      await db.query(`
        INSERT INTO equipment_categories (name, code, icon, color, description, is_active, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, 1, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          name = VALUES(name),
          icon = VALUES(icon),
          color = VALUES(color),
          description = VALUES(description),
          is_active = 1
      `, {
        replacements: [cat.name, cat.code, cat.icon, cat.color, cat.description]
      });
    }
    console.log(`  ✓ ${categories.length} equipment categories verified/seeded.`);

    // 3. Seed Initial Administrator Account (if none exists)
    console.log('3. Checking Initial Administrator Account...');
    const adminEmail = (process.env.INITIAL_ADMIN_EMAIL || 'admin@labms.local').toLowerCase().trim();
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'Admin@123';

    const [existingAdmins] = await db.query(`
      SELECT userId, userMail, email, role, roleId FROM users
      WHERE roleId = 1 OR role = 'admin' OR userMail = ? OR email = ?
      LIMIT 1
    `, {
      replacements: [adminEmail, adminEmail]
    });

    if (existingAdmins.length > 0) {
      console.log(`  ℹ️ Administrator account already exists (${existingAdmins[0].userMail || existingAdmins[0].email}). Skipping creation.`);
    } else {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await db.query(`
        INSERT INTO users (
          userNumber, userName, userMail, email, name, role, roleId,
          departmentId, department, password, status, is_active, is_email_verified,
          position, bio, authProvider, createdAt, updatedAt
        ) VALUES (
          'ADMIN001', 'System Administrator', ?, ?, 'System Administrator', 'admin', 1,
          1, 'Computer Science and Engineering', ?, 'Active', 1, 1,
          'System Administrator', 'Default Administrator account', 'local', NOW(), NOW()
        )
      `, {
        replacements: [adminEmail, adminEmail, hashedPassword]
      });
      console.log(`  ✓ Initial administrator created: ${adminEmail}`);
      console.log(`    Default initial password: ${adminPassword} (Please change upon initial login)`);
    }

    console.log('═'.repeat(60));
    console.log('✨ INITIAL REFERENCE DATA SEEDING COMPLETE\n');
  },

  down: async (queryInterface, Sequelize) => {
    // Reference data is retained during normal rollbacks to prevent cascading foreign key violations.
    console.log('ℹ️ Reference data rollback skipped for safety.');
  }
};
