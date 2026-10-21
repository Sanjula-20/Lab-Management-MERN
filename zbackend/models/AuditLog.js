// AuditLog.js - Audit Trail and History Tracking Model
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    entity_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'e.g. equipment, equipment_category, dealer, lab, incident, booking, user, department'
    },
    entity_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    action: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'e.g. CREATE, UPDATE, DELETE, DEACTIVATE, ASSIGN, RESOLVE'
    },
    previous_values: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
        get() {
            const raw = this.getDataValue('previous_values');
            if (!raw) return null;
            try { return JSON.parse(raw); } catch { return raw; }
        },
        set(val) {
            this.setDataValue('previous_values', val && typeof val === 'object' ? JSON.stringify(val) : val);
        }
    },
    new_values: {
        type: DataTypes.TEXT('long'),
        allowNull: true,
        get() {
            const raw = this.getDataValue('new_values');
            if (!raw) return null;
            try { return JSON.parse(raw); } catch { return raw; }
        },
        set(val) {
            this.setDataValue('new_values', val && typeof val === 'object' ? JSON.stringify(val) : val);
        }
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    user_name: {
        type: DataTypes.STRING(150),
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'audit_logs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
        { fields: ['entity_type', 'entity_id'] },
        { fields: ['user_id'] },
        { fields: ['created_at'] }
    ]
});

module.exports = AuditLog;
