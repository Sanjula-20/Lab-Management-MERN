# Lab Management System - Backend Database & Setup Guide

This guide describes how to configure, migrate, and seed the MySQL/MariaDB database for the Lab Management System.

---

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **MySQL / MariaDB**: Server running on `localhost:3306` (or configured host)
- **Database Name**: `lab_management` (default)

---

## 1. Installation & Environment Configuration

1. Navigate to the backend directory:
   ```bash
   cd zbackend
   ```

2. Install all dependencies:
   ```bash
   npm install
   ```

3. Create your local environment configuration:
   - On Windows CMD:
     ```cmd
     copy .env.example .env
     ```
   - On Linux / macOS / PowerShell:
     ```bash
     cp .env.example .env
     ```

4. Open `.env` and verify your MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=lab_management
   DB_USER=root
   DB_PASSWORD=your_mysql_password_here
   ```

---

## 2. Database Setup Scenarios

### Scenario A: Fresh Installation (Brand New Database)

If you are setting up the project on a new machine with no existing database tables:

#### Fast Track (All-in-One Command):
```bash
npm run db:setup
```
*(This automatically creates the database if missing, executes all 17 migrations in sequence, and seeds initial reference data).*

---

#### Step-by-Step Flow:

1. **Create the database if it doesn't already exist:**
   ```bash
   npm run db:create
   ```
   *(Or using Sequelize CLI: `npx sequelize-cli db:create`)*

2. **Check migration status:**
   ```bash
   npm run db:migrate:status
   ```
   *(Or using Sequelize CLI: `npx sequelize-cli db:migrate:status`)*  
   *All 17 migrations will be listed as `[PENDING]`.*

3. **Apply all pending migrations in order:**
   ```bash
   npm run db:migrate
   ```
   *(Or using Sequelize CLI: `npx sequelize-cli db:migrate`)*  
   *All 17 migrations (baseline tables through master permissions) will execute safely.*

4. **Seed required initial reference data:**
   ```bash
   npm run db:seed
   ```
   *(Or using Sequelize CLI: `npx sequelize-cli db:seed:all`)*  
   *Initializes academic departments, equipment categories, and creates an initial system administrator (`admin@labms.local` / `Admin@123`).*

---

### Scenario B: Existing Database Upgrade / Adoption

If you already have a local `lab_management` database with existing application data:

1. **Verify your database schema and migration status:**
   ```bash
   npm run db:migrate:status
   ```

2. **If your tables exist but migration history is not yet tracked:**
   Run the safe baseline adoption command:
   ```bash
   npm run db:migrate:adopt
   ```
   *This safely inspects existing tables and columns, and marks already-present migrations as applied in `SequelizeMeta` without dropping tables or altering existing data.*

3. **Apply any remaining pending migrations:**
   ```bash
   npm run db:migrate
   ```

4. **Ensure initial reference data is up to date (Safe & Idempotent):**
   ```bash
   npm run db:seed
   ```
   *Uses `ON DUPLICATE KEY UPDATE` and checks for existing admin accounts. Existing data is preserved with zero duplicates.*

---

## 3. Migration Reference & Verification

The project includes 17 ordered, version-controlled migrations:

| Order | Migration File | Description |
|-------|----------------|-------------|
| 1 | `20250101000000_create_initial_baseline_tables.js` | Core baseline tables (users, labs, equipment, bookings, etc.) |
| 2 | `20251019000000_allow_null_password.js` | Allows null password for OAuth accounts |
| 3 | `20251101000001_add_equipment_specs.js` | Hardware specification columns for equipment |
| 4 | `20251105000002_add_stock_register_page_to_equipment.js` | Stock register tracking column |
| 5 | `20251110000003_add_user_settings.js` | User preferences, notifications, 2FA settings |
| 6 | `20251115000004_add_profile_fields.js` | User bio and position fields |
| 7 | `20251201000005_update_recently_accessed_schema.js` | Recently accessed items tracking |
| 8 | `20260110000006_update_equipment_category_enum.js` | Equipment category enum expansions |
| 9 | `20260309000007_add_role_department_tables.js` | Roles & departments tables with base roles |
| 10 | `20260310000008_finalize_primary_key.js` | Primary key transition to `userId` |
| 11 | `20260310000009_add_user_audit_columns.js` | `createdBy` and `updatedBy` user audit columns |
| 12 | `20261018000010_create_dealers_table.js` | Equipment vendors / dealers master table |
| 13 | `20261018000011_create_equipment_categories_table.js` | Equipment categories master table |
| 14 | `20261018000012_add_equipment_dealer_and_config_columns.js` | Dealer foreign key and PC configuration fields |
| 15 | `20261018000013_add_lab_columns.js` | Established date, lab seats, in-charge foreign key |
| 16 | `20261019000014_add_audit_and_extended_fields.js` | System audit logs table and extended fields |
| 17 | `20261020000015_master_admin_permissions_hardware_options.js` | Master permissions, hardware options, lab department linkage |

To roll back the most recently applied migration:
```bash
npm run db:migrate:undo
```

---

## 4. Starting the Application

### Backend:
```bash
# In zbackend/
npm run dev     # Starts development server with nodemon on port 5000
# or
npm start       # Starts production server on port 5000
```

### Frontend:
```bash
# In frontend/
npm install
npm run dev     # Starts Vite development server on port 5173
```

Log in with:
- **Email:** `admin@labms.local` (or your configured email)
- **Password:** `Admin@123` (or your configured password)
