const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const HardwareOption = sequelize.define('HardwareOption', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    field_type: {
        type: DataTypes.STRING(60),
        allowNull: false
    },
    option_label: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    option_value: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    equipment_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: 'computer'
    },
    sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'hardware_options',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
        { unique: true, fields: ['field_type', 'option_value'] },
        { fields: ['field_type'] },
        { fields: ['is_active'] }
    ]
});

module.exports = HardwareOption;
