# NEC LabMS - Laboratory Management System

## Tech Stack
- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express, Sequelize (with MySQL/PostgreSQL)
- **Authentication:** Cookie-based, OTP, OAuth (Google)
- **Testing:** Jest, Supertest
- **Dev Tools:** ESLint, Prettier, Postman, VS Code

## Features
- User Registration (with OTP/email verification)
- Secure Login (OAuth & password)
- Role-based access control (Student, Faculty, Admin, etc.)
- Dashboard with statistics and recent activities
- Lab Management: Create, update, view labs
<!-- - Equipment Management: Add, update, view equipment -->
- Booking System: Reserve labs/equipment
- Incident Reporting & Notifications
- Calendar & Training Management
<!-- - Admin features: User stats, order stats (restricted) -->

## Quick Start for Teammates & Collaboration

### 1. Backend Setup & Database Migrations
```bash
cd zbackend
npm install
copy .env.example .env     # On Windows (or 'cp .env.example .env' on Linux/macOS)
# Configure DB credentials in .env if different from root / no password

# Run complete database setup (creates DB, runs all 17 migrations, seeds reference data):
npm run db:setup

# Start backend server (http://localhost:5000):
npm run dev
```
*(For detailed migration documentation and troubleshooting, see [zbackend/README.md](file:///e:/Laboratory%20MS/Lab-Management-MERN/zbackend/README.md))*

### 2. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.  
Default Admin Login: `admin@labms.local` / `Admin@123`

---

## Manual & Workflow
2. **Register:**
   - New users register with email/OTP
   - Email verification required
3. **Login:**
   - Login with email/password or Google OAuth
   - Session managed via cookies
4. **Dashboard:**
   - View stats, activities, system status
   - Access features based on role
5. **Admin:**
   - Restricted endpoints for stats, user management

## Tools Used
- **Vite:** Fast frontend build tool
- **Sequelize:** ORM for database
- **Postman:** API testing
- **ESLint/Prettier:** Code quality
- **Jest/Supertest:** Testing
- **VS Code:** Development

## Project Structure
```
frontend/
  src/
    components/
    pages/
    services/
    ...
zbackend/
  routes/
  models/
  services/
  ...
```

---

For detailed setup, see comments in code and config files. For any issues, check logs or contact the maintainer.
