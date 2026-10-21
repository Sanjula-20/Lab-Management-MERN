'use strict';

/**
 * Baseline Migration: Create Core Initial Application Tables
 * 
 * Provides the foundation schema for fresh installations before incremental migrations run:
 * 1. users
 * 2. labs
 * 3. equipment
 * 4. bookings
 * 5. incidents
 * 6. orders
 * 7. maintenance_records
 * 8. notifications
 * 9. notification_settings
 * 10. report_schedules
 * 11. reports
 * 12. training
 * 13. training_certifications
 * 
 * Safe on existing databases: Uses existence checks so already existing tables are never overwritten or dropped.
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tables = await queryInterface.showAllTables();

    // ==================== 1. USERS ====================
    if (!tables.includes('users')) {
      console.log('  📋 Creating baseline table: users...');
      await queryInterface.createTable('users', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        name: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        email: {
          type: Sequelize.STRING(255),
          allowNull: true,
          unique: true
        },
        password: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        role: {
          type: Sequelize.ENUM('student', 'faculty', 'teacher', 'lab_assistant', 'lab_technician', 'admin'),
          allowNull: true,
          defaultValue: 'student'
        },
        student_id: {
          type: Sequelize.STRING(50),
          allowNull: true,
          unique: true
        },
        department: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        phone: {
          type: Sequelize.STRING(20),
          allowNull: true
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        is_email_verified: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        last_login: {
          type: Sequelize.DATE,
          allowNull: true
        },
        google_id: {
          type: Sequelize.STRING(100),
          allowNull: true,
          unique: true
        },
        facebook_id: {
          type: Sequelize.STRING(100),
          allowNull: true,
          unique: true
        },
        github_id: {
          type: Sequelize.STRING(100),
          allowNull: true,
          unique: true
        },
        avatar_url: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        otp_code: {
          type: Sequelize.STRING(6),
          allowNull: true
        },
        otp_expires_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        otp_purpose: {
          type: Sequelize.ENUM('registration', 'login', 'password-reset', 'verification'),
          allowNull: true
        },
        otp_attempts: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0
        },
        reset_password_token: {
          type: Sequelize.STRING(255),
          allowNull: true
        },
        reset_password_expires: {
          type: Sequelize.DATE,
          allowNull: true
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
      });
      console.log('  ✓ users table created');
    }

    // ==================== 2. LABS ====================
    if (!tables.includes('labs')) {
      console.log('  📋 Creating baseline table: labs...');
      await queryInterface.createTable('labs', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        lab_type: {
          type: Sequelize.STRING(100),
          allowNull: false,
          defaultValue: 'cse'
        },
        location: {
          type: Sequelize.STRING(255),
          allowNull: true
        },
        capacity: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        square_feet: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
      });
      console.log('  ✓ labs table created');
    }

    // ==================== 3. EQUIPMENT ====================
    if (!tables.includes('equipment')) {
      console.log('  📋 Creating baseline table: equipment...');
      await queryInterface.createTable('equipment', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        name: {
          type: Sequelize.STRING(100),
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        serial_number: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: true
        },
        model: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        manufacturer: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        category: {
          type: Sequelize.ENUM(
            'computer', 'printer', 'projector', 'scanner', 'microscope',
            'centrifuge', 'spectrophotometer', 'ph_meter', 'balance',
            'incubator', 'autoclave', 'pipette', 'thermometer',
            'glassware', 'safety_equipment', 'lab_equipment', 'network', 'other'
          ),
          allowNull: false
        },
        lab_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'labs',
            key: 'id'
          },
          onUpdate: 'CASCADE'
        },
        location_details: {
          type: Sequelize.STRING(200),
          allowNull: true
        },
        status: {
          type: Sequelize.ENUM('available', 'in_use', 'maintenance', 'broken', 'retired'),
          allowNull: false,
          defaultValue: 'available'
        },
        condition_status: {
          type: Sequelize.ENUM('excellent', 'good', 'fair', 'poor'),
          allowNull: false,
          defaultValue: 'good'
        },
        purchase_price: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true,
          defaultValue: 0.00
        },
        current_value: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true,
          defaultValue: 0.00
        },
        purchase_date: {
          type: Sequelize.DATEONLY,
          allowNull: false
        },
        warranty_expiry: {
          type: Sequelize.DATEONLY,
          allowNull: true
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
      });
      console.log('  ✓ equipment table created');
    }

    // ==================== 4. BOOKINGS ====================
    if (!tables.includes('bookings')) {
      console.log('  📋 Creating baseline table: bookings...');
      await queryInterface.createTable('bookings', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        booking_type: {
          type: Sequelize.ENUM('lab', 'equipment'),
          allowNull: false,
          defaultValue: 'equipment'
        },
        lab_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'labs',
            key: 'id'
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE'
        },
        equipment_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'equipment',
            key: 'id'
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE'
        },
        start_time: {
          type: Sequelize.DATE,
          allowNull: false
        },
        end_time: {
          type: Sequelize.DATE,
          allowNull: false
        },
        status: {
          type: Sequelize.STRING(50),
          allowNull: false,
          defaultValue: 'pending'
        },
        purpose: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        approved_by: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        approval_time: {
          type: Sequelize.DATE,
          allowNull: true
        },
        rejection_reason: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        cancelled_by: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        cancellation_time: {
          type: Sequelize.DATE,
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
      });
      console.log('  ✓ bookings table created');
    }

    // ==================== 5. INCIDENTS ====================
    if (!tables.includes('incidents')) {
      console.log('  📋 Creating baseline table: incidents...');
      await queryInterface.createTable('incidents', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        title: {
          type: Sequelize.STRING(200),
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        equipment_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'equipment',
            key: 'id'
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE'
        },
        priority: {
          type: Sequelize.ENUM('low', 'medium', 'high', 'critical'),
          allowNull: false,
          defaultValue: 'medium'
        },
        status: {
          type: Sequelize.ENUM('open', 'in_progress', 'resolved', 'closed'),
          allowNull: false,
          defaultValue: 'open'
        },
        category: {
          type: Sequelize.ENUM('malfunction', 'damage', 'safety', 'maintenance', 'other'),
          allowNull: false,
          defaultValue: 'malfunction'
        },
        location: {
          type: Sequelize.STRING(200),
          allowNull: true
        },
        reported_by: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        assigned_to: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        resolution_notes: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        resolved_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        resolved_by: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
      });
      console.log('  ✓ incidents table created');
    }

    // ==================== 6. ORDERS ====================
    if (!tables.includes('orders')) {
      console.log('  📋 Creating baseline table: orders...');
      await queryInterface.createTable('orders', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        supplier: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        equipment_name: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        quantity: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        unit_price: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false
        },
        total_amount: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false
        },
        status: {
          type: Sequelize.ENUM('Pending', 'Approved', 'Ordered', 'Delivered', 'Cancelled'),
          allowNull: false,
          defaultValue: 'Pending'
        },
        priority: {
          type: Sequelize.ENUM('Low', 'Medium', 'High'),
          allowNull: false,
          defaultValue: 'Medium'
        },
        order_date: {
          type: Sequelize.DATEONLY,
          allowNull: false
        },
        expected_delivery: {
          type: Sequelize.DATEONLY,
          allowNull: true
        },
        actual_delivery: {
          type: Sequelize.DATEONLY,
          allowNull: true
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
      });
      console.log('  ✓ orders table created');
    }

    // ==================== 7. MAINTENANCE_RECORDS ====================
    if (!tables.includes('maintenance_records')) {
      console.log('  📋 Creating baseline table: maintenance_records...');
      await queryInterface.createTable('maintenance_records', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        equipment_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'equipment',
            key: 'id'
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE'
        },
        equipment_name: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        maintenance_type: {
          type: Sequelize.ENUM('routine', 'repair', 'emergency', 'preventive'),
          allowNull: false,
          defaultValue: 'routine'
        },
        scheduled_date: {
          type: Sequelize.DATEONLY,
          allowNull: false
        },
        actual_date: {
          type: Sequelize.DATEONLY,
          allowNull: true
        },
        status: {
          type: Sequelize.ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'overdue'),
          allowNull: false,
          defaultValue: 'scheduled'
        },
        technician_name: {
          type: Sequelize.STRING(100),
          allowNull: true,
          defaultValue: 'Unassigned'
        },
        technician_id: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        estimated_cost: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: false,
          defaultValue: 0.00
        },
        actual_cost: {
          type: Sequelize.DECIMAL(10, 2),
          allowNull: true
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        work_performed: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        estimated_duration: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        actual_duration: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        priority: {
          type: Sequelize.ENUM('low', 'medium', 'high', 'critical'),
          allowNull: false,
          defaultValue: 'medium'
        },
        parts_used: {
          type: Sequelize.JSON,
          allowNull: true
        },
        tools_required: {
          type: Sequelize.JSON,
          allowNull: true
        },
        completed_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        started_at: {
          type: Sequelize.DATE,
          allowNull: true
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        next_maintenance_date: {
          type: Sequelize.DATEONLY,
          allowNull: true
        },
        maintenance_category: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        warranty_applicable: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        vendor_contact: {
          type: Sequelize.STRING(255),
          allowNull: true
        },
        approval_status: {
          type: Sequelize.ENUM('pending', 'approved', 'rejected'),
          allowNull: false,
          defaultValue: 'pending'
        },
        approved_by: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
      });
      console.log('  ✓ maintenance_records table created');
    }

    // ==================== 8. NOTIFICATIONS ====================
    if (!tables.includes('notifications')) {
      console.log('  📋 Creating baseline table: notifications...');
      await queryInterface.createTable('notifications', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        title: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        message: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        type: {
          type: Sequelize.ENUM('info', 'success', 'warning', 'error', 'booking', 'maintenance', 'incident', 'lab', 'equipment'),
          allowNull: false,
          defaultValue: 'info'
        },
        read: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        metadata: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
      });
      console.log('  ✓ notifications table created');
    }

    // ==================== 9. NOTIFICATION_SETTINGS ====================
    if (!tables.includes('notification_settings')) {
      console.log('  📋 Creating baseline table: notification_settings...');
      await queryInterface.createTable('notification_settings', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          unique: true
        },
        email_notifications: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        push_notifications: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        booking_reminders: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        system_alerts: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
      });
      console.log('  ✓ notification_settings table created');
    }

    // ==================== 10. REPORT_SCHEDULES ====================
    if (!tables.includes('report_schedules')) {
      console.log('  📋 Creating baseline table: report_schedules...');
      await queryInterface.createTable('report_schedules', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        name: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        report_type: {
          type: Sequelize.ENUM('usage', 'availability', 'maintenance', 'user', 'financial'),
          allowNull: false
        },
        frequency: {
          type: Sequelize.ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly'),
          allowNull: false
        },
        day_of_week: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        day_of_month: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        time: {
          type: Sequelize.TIME,
          allowNull: false,
          defaultValue: '09:00:00'
        },
        email_recipients: {
          type: Sequelize.JSON,
          allowNull: true
        },
        auto_export: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        export_format: {
          type: Sequelize.ENUM('pdf', 'excel', 'csv'),
          allowNull: false,
          defaultValue: 'pdf'
        },
        filters: {
          type: Sequelize.JSON,
          allowNull: true
        },
        last_run: {
          type: Sequelize.DATE,
          allowNull: true
        },
        next_run: {
          type: Sequelize.DATE,
          allowNull: true
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
      });
      console.log('  ✓ report_schedules table created');
    }

    // ==================== 11. REPORTS ====================
    if (!tables.includes('reports')) {
      console.log('  📋 Creating baseline table: reports...');
      await queryInterface.createTable('reports', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        title: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        report_type: {
          type: Sequelize.ENUM('usage', 'availability', 'maintenance', 'user', 'financial'),
          allowNull: false
        },
        date_range_start: {
          type: Sequelize.DATEONLY,
          allowNull: false
        },
        date_range_end: {
          type: Sequelize.DATEONLY,
          allowNull: false
        },
        report_data: {
          type: Sequelize.JSON,
          allowNull: false
        },
        summary: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        file_path: {
          type: Sequelize.STRING(500),
          allowNull: true
        },
        file_type: {
          type: Sequelize.ENUM('pdf', 'excel', 'csv'),
          allowNull: true
        },
        file_size: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        status: {
          type: Sequelize.ENUM('generating', 'completed', 'failed'),
          allowNull: false,
          defaultValue: 'generating'
        },
        generated_by: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        is_scheduled: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false
        },
        schedule_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'report_schedules',
            key: 'id'
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
      });
      console.log('  ✓ reports table created');
    }

    // ==================== 12. TRAINING ====================
    if (!tables.includes('training')) {
      console.log('  📋 Creating baseline table: training...');
      await queryInterface.createTable('training', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        title: {
          type: Sequelize.STRING(200),
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: false
        },
        equipment_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: 'equipment',
            key: 'id'
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE'
        },
        required_for_equipment: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        duration_hours: {
          type: Sequelize.DECIMAL(4, 2),
          allowNull: false
        },
        validity_months: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        max_participants: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        instructor: {
          type: Sequelize.STRING(200),
          allowNull: true
        },
        materials: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        created_by: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
      });
      console.log('  ✓ training table created');
    }

    // ==================== 13. TRAINING_CERTIFICATIONS ====================
    if (!tables.includes('training_certifications')) {
      console.log('  📋 Creating baseline table: training_certifications...');
      await queryInterface.createTable('training_certifications', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        training_id: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        certification_date: {
          type: Sequelize.DATEONLY,
          allowNull: false
        },
        expiry_date: {
          type: Sequelize.DATEONLY,
          allowNull: false
        },
        score: {
          type: Sequelize.DECIMAL(5, 2),
          allowNull: true
        },
        status: {
          type: Sequelize.ENUM('active', 'expired', 'revoked'),
          allowNull: false,
          defaultValue: 'active'
        },
        certificate_number: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        issued_by: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        is_valid: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: true
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
      });
      console.log('  ✓ training_certifications table created');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Drop in reverse dependency order
    const tablesToDrop = [
      'training_certifications',
      'training',
      'reports',
      'report_schedules',
      'notification_settings',
      'notifications',
      'maintenance_records',
      'orders',
      'incidents',
      'bookings',
      'equipment',
      'labs',
      'users'
    ];

    for (const table of tablesToDrop) {
      try {
        await queryInterface.dropTable(table);
        console.log(`  ✓ Dropped ${table}`);
      } catch (err) {
        console.log(`  ℹ️ Note dropping ${table}:`, err.message);
      }
    }
  }
};
