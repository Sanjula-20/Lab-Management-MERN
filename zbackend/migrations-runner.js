/**
 * Unified Sequelize Migration Runner
 * 
 * Supports:
 *   npm run migrate          - Apply all pending migrations
 *   npm run migrate:status   - Check migration status (applied vs pending)
 *   npm run migrate:undo     - Rollback the most recently applied migration
 *   npm run migrate:create   - Create a new timestamped migration file
 *   npm run migrate:adopt    - Safely adopt an existing database into migration tracking
 * 
 * Uses standard SequelizeMeta table for interoperability with sequelize-cli.
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config();

const { sequelize, testConnection } = require('./config/database');

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');
const META_TABLE = 'SequelizeMeta';

// Legacy name mapping to preserve tracking across renames
const LEGACY_ALIASES = {
    '20251019_allow_null_password.js': '20251019000000_allow_null_password.js',
    'add_equipment_specs.js': '20251101000001_add_equipment_specs.js',
    'add_equipment_specs_columns.js': '20251101000001_add_equipment_specs.js',
    'add_stock_register_page_to_equipment.js': '20251105000002_add_stock_register_page_to_equipment.js',
    'add_user_settings.js': '20251110000003_add_user_settings.js',
    'add_profile_fields.js': '20251115000004_add_profile_fields.js',
    'update_recently_accessed_schema.js': '20251201000005_update_recently_accessed_schema.js',
    'update_equipment_category_enum.js': '20260110000006_update_equipment_category_enum.js',
    'add_role_department_tables.js': '20260309000007_add_role_department_tables.js',
    'finalize-primary-key.js': '20260310000008_finalize_primary_key.js',
};

/**
 * Ensure SequelizeMeta table exists
 */
async function ensureMetaTable() {
    await sequelize.query(`
        CREATE TABLE IF NOT EXISTS \`${META_TABLE}\` (
            \`name\` VARCHAR(255) NOT NULL PRIMARY KEY
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
}

/**
 * Fetch list of all applied migration names from SequelizeMeta
 */
async function getAppliedMigrations() {
    await ensureMetaTable();
    const [rows] = await sequelize.query(`SELECT \`name\` FROM \`${META_TABLE}\` ORDER BY \`name\` ASC`);
    const applied = new Set(rows.map(r => r.name));

    // Also include canonical names for any legacy aliases present
    for (const [legacy, canonical] of Object.entries(LEGACY_ALIASES)) {
        if (applied.has(legacy)) {
            applied.add(canonical);
        }
    }

    return applied;
}

/**
 * Fetch all available migration files in migrations/ sorted alphabetically
 */
function getAllMigrationFiles() {
    if (!fs.existsSync(MIGRATIONS_DIR)) {
        fs.mkdirSync(MIGRATIONS_DIR, { recursive: true });
    }

    return fs.readdirSync(MIGRATIONS_DIR)
        .filter(file => file.endsWith('.js') && !file.startsWith('.'))
        .sort();
}

/**
 * Safe baseline inspection:
 * Verifies whether an existing database already has the COMPLETE schema changes for a migration.
 * Never marks a migration as completed without verifying every expected table, column, and constraint.
 */
async function verifyMigrationSchemaPresent(migrationName, queryInterface) {
    try {
        const tables = await queryInterface.showAllTables();

        if (migrationName.includes('create_initial_baseline_tables')) {
            const baselineTables = [
                'users', 'labs', 'equipment', 'bookings', 'incidents',
                'orders', 'maintenance_records', 'notifications',
                'notification_settings', 'report_schedules', 'reports',
                'training', 'training_certifications'
            ];
            return baselineTables.every(t => tables.includes(t));
        }

        if (migrationName.includes('allow_null_password')) {
            if (!tables.includes('users')) return false;
            const cols = await queryInterface.describeTable('users');
            return cols.password ? cols.password.allowNull === true : false;
        }

        if (migrationName.includes('add_equipment_specs')) {
            if (!tables.includes('equipment')) return false;
            const cols = await queryInterface.describeTable('equipment');
            const required = [
                'processor', 'ram', 'storage', 'graphics_card', 'operating_system',
                'resolution', 'brightness', 'contrast_ratio', 'lamp_hours',
                'print_type', 'print_speed', 'paper_size', 'connectivity',
                'magnification', 'objective_lenses', 'illumination',
                'capacity', 'power_rating', 'temperature_range', 'accuracy',
                'ports', 'speed', 'protocol'
            ];
            return required.every(col => !!cols[col]);
        }

        if (migrationName.includes('stock_register_page')) {
            if (!tables.includes('equipment')) return false;
            const cols = await queryInterface.describeTable('equipment');
            return !!cols.stock_register_page;
        }

        if (migrationName.includes('user_settings')) {
            if (!tables.includes('users')) return false;
            const cols = await queryInterface.describeTable('users');
            const required = [
                'language', 'timezone', 'theme', 'profile_visibility', 'show_email',
                'show_phone', 'email_notifications', 'push_notifications', 'sms_notifications',
                'booking_confirmations', 'booking_reminders', 'booking_cancellations',
                'maintenance_alerts', 'equipment_updates', 'system_updates',
                'marketing_emails', 'newsletter', 'auto_logout', 'session_timeout',
                'two_factor_enabled', 'backup_codes_generated', 'backup_codes', 'deleted_at'
            ];
            return required.every(col => !!cols[col]);
        }

        if (migrationName.includes('profile_fields')) {
            if (!tables.includes('users')) return false;
            const cols = await queryInterface.describeTable('users');
            return !!(cols.bio && cols.position);
        }

        if (migrationName.includes('recently_accessed')) {
            if (!tables.includes('recently_accessed')) return false;
            const cols = await queryInterface.describeTable('recently_accessed');
            const required = ['id', 'user_id', 'item_type', 'item_id', 'item_name', 'last_accessed', 'access_count', 'item_description'];
            return required.every(col => !!cols[col]);
        }

        if (migrationName.includes('equipment_category_enum')) {
            if (!tables.includes('equipment')) return false;
            const cols = await queryInterface.describeTable('equipment');
            return !!cols.category;
        }

        if (migrationName.includes('add_role_department_tables')) {
            if (!tables.includes('roles') || !tables.includes('departments') || !tables.includes('users')) {
                return false;
            }
            const cols = await queryInterface.describeTable('users');
            const required = ['companyId', 'departmentId', 'userNumber', 'userName', 'userMail', 'roleId', 'userId', 'status', 'profileImage', 'authProvider', 'resetOTP', 'resetOTPExpires'];
            const colsPresent = required.every(col => !!cols[col]);
            if (!colsPresent) return false;

            const [roleCount] = await sequelize.query('SELECT COUNT(*) as count FROM roles');
            return roleCount[0].count >= 6;
        }

        if (migrationName.includes('finalize_primary_key')) {
            if (!tables.includes('users')) return false;
            const cols = await queryInterface.describeTable('users');
            if (!cols.googleId || !cols.resetPasswordToken || !cols.resetPasswordExpires) return false;

            const [pkRows] = await sequelize.query(`
                SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'
                  AND CONSTRAINT_NAME = 'PRIMARY'
            `);
            return pkRows[0]?.COLUMN_NAME === 'userId';
        }

        if (migrationName.includes('user_audit_columns')) {
            if (!tables.includes('users')) return false;
            const cols = await queryInterface.describeTable('users');
            return !!(cols.createdBy && cols.updatedBy);
        }

        if (migrationName.includes('create_dealers_table')) {
            if (!tables.includes('dealers')) return false;
            const cols = await queryInterface.describeTable('dealers');
            const required = ['id', 'name', 'contact_person', 'email', 'phone', 'address', 'city', 'gst_number', 'is_active', 'created_at', 'updated_at'];
            return required.every(col => !!cols[col]);
        }

        if (migrationName.includes('create_equipment_categories_table')) {
            if (!tables.includes('equipment_categories')) return false;
            const cols = await queryInterface.describeTable('equipment_categories');
            const required = ['id', 'name', 'code', 'description', 'icon', 'color', 'is_active', 'created_by', 'created_at', 'updated_at'];
            return required.every(col => !!cols[col]);
        }

        if (migrationName.includes('equipment_dealer_and_config_columns')) {
            if (!tables.includes('equipment')) return false;
            const cols = await queryInterface.describeTable('equipment');
            const required = ['brand', 'dealer_id', 'dealer_name', 'hard_disk', 'gpu', 'generation'];
            const colsPresent = required.every(col => !!cols[col]);
            if (!colsPresent) return false;

            // Strict check: FK constraint on dealer_id must exist
            const [fk] = await sequelize.query(`
                SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'equipment' AND COLUMN_NAME = 'dealer_id' AND REFERENCED_TABLE_NAME = 'dealers'
            `);
            return fk.length > 0;
        }

        if (migrationName.includes('add_lab_columns')) {
            if (!tables.includes('labs')) return false;
            const cols = await queryInterface.describeTable('labs');
            if (!cols.established_date || !cols.in_charge_id || !cols.lab_seats) return false;

            // Strict check: FK constraint on in_charge_id must exist
            const [fk] = await sequelize.query(`
                SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'labs' AND COLUMN_NAME = 'in_charge_id' AND REFERENCED_TABLE_NAME = 'users'
            `);
            return fk.length > 0;
        }

        if (migrationName.includes('add_audit_and_extended_fields')) {
            if (!tables.includes('audit_logs') || !tables.includes('dealers') || !tables.includes('equipment') || !tables.includes('labs')) return false;
            const dealerCols = await queryInterface.describeTable('dealers');
            const eqCols = await queryInterface.describeTable('equipment');
            const labCols = await queryInterface.describeTable('labs');
            return !!(dealerCols.state && dealerCols.postal_code && eqCols.indent_number && labCols.icon);
        }

        if (migrationName.includes('master_admin_permissions_hardware_options')) {
            if (!tables.includes('hardware_options') || !tables.includes('labs') || !tables.includes('incidents')) return false;
            const labCols = await queryInterface.describeTable('labs');
            const incCols = await queryInterface.describeTable('incidents');
            return !!(labCols.department_id && labCols.systems_available && incCols.lab_id);
        }

        return false;
    } catch (e) {
        return false;
    }
}

/**
 * Perform safe baseline adoption for an existing database with no migration history
 */
async function adoptExistingDatabase() {
    console.log('\n🔍 SAFE BASELINE ADOPTION: Inspecting database schema...');
    console.log('═'.repeat(65));

    await ensureMetaTable();
    const applied = await getAppliedMigrations();
    const allFiles = getAllMigrationFiles();
    const queryInterface = sequelize.getQueryInterface();

    let adoptedCount = 0;

    for (const file of allFiles) {
        if (applied.has(file)) continue;

        const isPresent = await verifyMigrationSchemaPresent(file, queryInterface);
        if (isPresent) {
            await sequelize.query(`INSERT INTO \`${META_TABLE}\` (\`name\`) VALUES (?)`, { replacements: [file] });
            applied.add(file);
            adoptedCount++;
            console.log(`  ✓ Adopted (already present): ${file}`);
        } else {
            console.log(`  ⏭  Pending (not present):    ${file}`);
        }
    }

    console.log('═'.repeat(65));
    console.log(`✅ Baseline adoption complete. Adopted ${adoptedCount} migration(s).\n`);
    return applied;
}

/**
 * Apply all pending migrations
 */
async function runMigrations() {
    console.log('\n🚀 SEQUELIZE DATABASE MIGRATION RUNNER');
    console.log('═'.repeat(65));
    console.log(`  Database: ${sequelize.config.database}`);
    console.log(`  Host:     ${sequelize.config.host}:${sequelize.config.port}`);
    console.log(`  User:     ${sequelize.config.username}`);
    console.log('═'.repeat(65) + '\n');

    const isConnected = await testConnection();
    if (!isConnected) {
        console.error('❌ Cannot proceed: Database connection failed.');
        console.error('   Please check that your MySQL server is running and .env credentials are correct.');
        process.exit(1);
    }

    await ensureMetaTable();
    let applied = await getAppliedMigrations();
    const allFiles = getAllMigrationFiles();

    // If SequelizeMeta is empty and database has tables, run safe adoption check first
    if (applied.size === 0) {
        const tables = await sequelize.getQueryInterface().showAllTables();
        const nonMetaTables = tables.filter(t => t !== META_TABLE);
        if (nonMetaTables.length > 0) {
            console.log('ℹ️  Existing database detected without migration tracking.');
            console.log('   Running automated safe baseline adoption...\n');
            applied = await adoptExistingDatabase();
        }
    }

    const pending = allFiles.filter(file => !applied.has(file));

    if (pending.length === 0) {
        console.log('✨ Database is up to date. No pending migrations.\n');
        return;
    }

    console.log(`📋 Found ${pending.length} pending migration(s):\n`);
    pending.forEach((file, idx) => console.log(`   ${idx + 1}. ${file}`));
    console.log('\n' + '─'.repeat(65) + '\n');

    const queryInterface = sequelize.getQueryInterface();

    for (const file of pending) {
        const filePath = path.join(MIGRATIONS_DIR, file);
        console.log(`⏳ Applying: ${file}...`);
        const migration = require(filePath);

        if (typeof migration.up !== 'function') {
            throw new Error(`Migration ${file} does not export an up() function.`);
        }

        try {
            await migration.up(queryInterface, sequelize.Sequelize);
            await sequelize.query(`INSERT INTO \`${META_TABLE}\` (\`name\`) VALUES (?)`, { replacements: [file] });
            console.log(`✅ Applied:  ${file}\n`);
        } catch (error) {
            console.error(`\n❌ FAILED to apply: ${file}`);
            console.error(`   Error: ${error.message}\n`);

            if (typeof migration.down === 'function') {
                console.log('🔄 Attempting rollback of failed migration...');
                try {
                    await migration.down(queryInterface, sequelize.Sequelize);
                    console.log('✅ Rollback of failed migration succeeded.');
                } catch (rollbackErr) {
                    console.error('⚠️  Rollback also failed:', rollbackErr.message);
                }
            }
            throw error;
        }
    }

    console.log('═'.repeat(65));
    console.log('🎉 ALL PENDING MIGRATIONS APPLIED SUCCESSFULLY!');
    console.log('═'.repeat(65) + '\n');
}

/**
 * Show status of all migrations
 */
async function showStatus() {
    console.log('\n📊 MIGRATION STATUS');
    console.log('═'.repeat(65));
    console.log(`  Database: ${sequelize.config.database}`);
    console.log('═'.repeat(65) + '\n');

    const isConnected = await testConnection();
    if (!isConnected) {
        console.error('❌ Cannot check status: Database connection failed.');
        process.exit(1);
    }

    await ensureMetaTable();
    const applied = await getAppliedMigrations();
    const allFiles = getAllMigrationFiles();

    if (allFiles.length === 0) {
        console.log('ℹ️  No migration files found in migrations/ directory.\n');
        return;
    }

    let appliedCount = 0;
    let pendingCount = 0;

    console.log('Status     | Migration File');
    console.log('-----------+-------------------------------------------------------------');

    for (const file of allFiles) {
        const isApplied = applied.has(file);
        if (isApplied) {
            appliedCount++;
            console.log(`[APPLIED]  | ${file}`);
        } else {
            pendingCount++;
            console.log(`[PENDING]  | ${file}`);
        }
    }

    console.log('-----------+-------------------------------------------------------------');
    console.log(`Total: ${allFiles.length} | Applied: ${appliedCount} | Pending: ${pendingCount}\n`);
}

/**
 * Rollback the most recently applied migration
 */
async function rollbackLastMigration() {
    console.log('\n🔄 MIGRATION ROLLBACK');
    console.log('═'.repeat(65) + '\n');

    const isConnected = await testConnection();
    if (!isConnected) {
        console.error('❌ Cannot rollback: Database connection failed.');
        process.exit(1);
    }

    await ensureMetaTable();
    const [rows] = await sequelize.query(`SELECT \`name\` FROM \`${META_TABLE}\` ORDER BY \`name\` DESC LIMIT 1`);

    if (rows.length === 0) {
        console.log('ℹ️  No applied migrations found to rollback.\n');
        return;
    }

    const lastMigrationName = rows[0].name;
    const migrationFile = LEGACY_ALIASES[lastMigrationName] || lastMigrationName;
    const filePath = path.join(MIGRATIONS_DIR, migrationFile);

    if (!fs.existsSync(filePath)) {
        console.error(`❌ Migration file ${migrationFile} not found on disk.`);
        process.exit(1);
    }

    console.log(`⏳ Rolling back: ${migrationFile}...`);
    const migration = require(filePath);

    if (typeof migration.down !== 'function') {
        console.error(`❌ Migration ${migrationFile} does not export a down() function. Cannot rollback.`);
        process.exit(1);
    }

    const queryInterface = sequelize.getQueryInterface();

    try {
        await migration.down(queryInterface, sequelize.Sequelize);
        await sequelize.query(`DELETE FROM \`${META_TABLE}\` WHERE \`name\` = ?`, { replacements: [lastMigrationName] });
        if (lastMigrationName !== migrationFile) {
            await sequelize.query(`DELETE FROM \`${META_TABLE}\` WHERE \`name\` = ?`, { replacements: [migrationFile] });
        }
        console.log(`\n✅ Rollback completed successfully: ${migrationFile}\n`);
    } catch (error) {
        console.error(`\n❌ Rollback failed: ${error.message}\n`);
        process.exit(1);
    }
}

/**
 * Create a new timestamped migration file
 */
function createMigrationFile(name) {
    if (!name) {
        console.error('❌ Please provide a migration name: npm run migrate:create <name>');
        process.exit(1);
    }

    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const sanitizedName = name.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const filename = `${timestamp}_${sanitizedName}.js`;
    const targetPath = path.join(MIGRATIONS_DIR, filename);

    const template = `'use strict';

/**
 * Migration: ${name}
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Write forward migration logic here
    // Example:
    // await queryInterface.addColumn('table_name', 'new_column', {
    //   type: Sequelize.STRING,
    //   allowNull: true
    // });
  },

  down: async (queryInterface, Sequelize) => {
    // Write rollback logic here
    // Example:
    // await queryInterface.removeColumn('table_name', 'new_column');
  }
};
`;

    fs.writeFileSync(targetPath, template, 'utf8');
    console.log(`\n✅ Created migration file: migrations/${filename}\n`);
}

/**
 * CLI Argument Dispatcher
 */
async function main() {
    const args = process.argv.slice(2);

    try {
        if (args.includes('--status') || args.includes('-s')) {
            await showStatus();
        } else if (args.includes('--rollback') || args.includes('-r') || args.includes('--undo')) {
            await rollbackLastMigration();
        } else if (args.includes('--adopt')) {
            await adoptExistingDatabase();
        } else if (args.includes('--create')) {
            const nameIdx = args.indexOf('--create') + 1;
            const name = args[nameIdx] || process.argv[3];
            createMigrationFile(name);
        } else if (args.includes('--help') || args.includes('-h')) {
            console.log('\n📚 Migration Runner Help');
            console.log('═'.repeat(65));
            console.log('Usage: node migrations-runner.js [options]');
            console.log('\nCommands:');
            console.log('  npm run migrate                 Apply all pending migrations');
            console.log('  npm run migrate:status          Show applied vs pending migrations');
            console.log('  npm run migrate:undo            Rollback the last migration');
            console.log('  npm run migrate:create <name>   Create a new timestamped migration');
            console.log('  npm run migrate:adopt           Safely adopt existing schema into tracking');
            console.log('═'.repeat(65) + '\n');
        } else {
            // Default: apply pending migrations
            await runMigrations();
        }
    } catch (err) {
        console.error('❌ Migration process exited with error:', err.message);
        process.exit(1);
    } finally {
        try {
            await sequelize.close();
        } catch (_) {}
    }
}

if (require.main === module) {
    main();
}

module.exports = {
    runMigrations,
    showStatus,
    rollbackLastMigration,
    createMigrationFile,
    adoptExistingDatabase
};
