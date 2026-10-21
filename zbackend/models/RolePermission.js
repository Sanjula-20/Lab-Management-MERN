const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const RolePermission = sequelize.define('RolePermission', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'roles',
            key: 'roleId'
        }
    },
    page_key: {
        type: DataTypes.STRING(60),
        allowNull: false
    },
    can_view: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    is_sidebar_visible: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    can_create: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    can_edit: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    can_delete: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    can_approve: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    can_export: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    tableName: 'role_permissions',
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    indexes: [
        { unique: true, fields: ['roleId', 'page_key'] },
        { fields: ['roleId'] },
        { fields: ['page_key'] }
    ]
});

module.exports = RolePermission;
