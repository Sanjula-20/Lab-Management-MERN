// EquipmentCategory.js - Equipment Category Master Model
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const EquipmentCategory = sequelize.define('EquipmentCategory', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            len: [2, 100]
        }
    },
    code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            len: [2, 50]
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    icon: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'box'
    },
    color: {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'blue'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'equipment_categories',
    timestamps: true,
    underscored: true
});

module.exports = EquipmentCategory;
