// Role Service - Business Logic for Role Management
const { Role, User } = require('../models');
const { Op } = require('sequelize');

class RoleService {
    /**
     * Get all roles
     */
    async getAllRoles(filters = {}) {
        const { status, search, page = 1, limit = 50 } = filters;

        const whereClause = {};

        if (status) {
            whereClause.status = status;
        }

        if (search) {
            whereClause.roleName = { [Op.like]: `%${search}%` };
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { rows: roles, count: total } = await Role.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email', 'userName', 'userMail'],
                    required: false
                },
                {
                    model: User,
                    as: 'updater',
                    attributes: ['id', 'name', 'email', 'userName', 'userMail'],
                    required: false
                }
            ],
            order: [['roleName', 'ASC']],
            limit: parseInt(limit),
            offset: offset
        });

        return {
            roles,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        };
    }

    /**
     * Get role by ID
     */
    async getRoleById(roleId) {
        const role = await Role.findByPk(roleId, {
            include: [
                {
                    model: User,
                    as: 'users',
                    attributes: ['id', 'userId', 'name', 'userName', 'email', 'userMail'],
                    limit: 10,
                    order: [['createdAt', 'DESC']]
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email', 'userName', 'userMail'],
                    required: false
                },
                {
                    model: User,
                    as: 'updater',
                    attributes: ['id', 'name', 'email', 'userName', 'userMail'],
                    required: false
                }
            ]
        });

        if (!role) {
            throw new Error('Role not found');
        }

        return role;
    }

    /**
     * Create new role
     */
    async createRole(roleData, userId) {
        const { roleName, status = 'Active' } = roleData;

        // Check if role already exists
        const existingRole = await Role.findOne({
            where: { roleName }
        });

        if (existingRole) {
            throw new Error('Role already exists');
        }

        const role = await Role.create({
            roleName,
            status,
            createdBy: userId,
            updatedBy: userId
        });

        return role;
    }

    /**
     * Update role
     */
    async updateRole(roleId, roleData, userId) {
        const role = await Role.findByPk(roleId);

        if (!role) {
            throw new Error('Role not found');
        }

        const { roleName, status } = roleData;

        // Check if new role name already exists (if changing name)
        if (roleName && roleName !== role.roleName) {
            const existingRole = await Role.findOne({
                where: { 
                    roleName,
                    roleId: { [Op.ne]: roleId }
                }
            });

            if (existingRole) {
                throw new Error('Role name already exists');
            }
        }

        await role.update({
            ...(roleName && { roleName }),
            ...(status && { status }),
            updatedBy: userId
        });

        return role;
    }

    /**
     * Delete role (soft delete)
     */
    async deleteRole(roleId) {
        const role = await Role.findByPk(roleId);

        if (!role) {
            throw new Error('Role not found');
        }

        // Check if role is assigned to any users
        const usersCount = await User.count({
            where: { roleId }
        });

        if (usersCount > 0) {
            throw new Error(`Cannot delete role. It is assigned to ${usersCount} user(s).`);
        }

        await role.destroy();

        return { message: 'Role deleted successfully' };
    }

    /**
     * Get role statistics
     */
    async getRoleStats() {
        const totalRoles = await Role.count();
        const activeRoles = await Role.count({ where: { status: 'Active' } });
        const inactiveRoles = await Role.count({ where: { status: 'Inactive' } });

        // Get user count per role
        const rolesWithUserCount = await Role.findAll({
            attributes: [
                'roleId',
                'roleName',
                [require('../config/database').sequelize.fn('COUNT', require('../config/database').sequelize.col('users.id')), 'userCount']
            ],
            include: [{
                model: User,
                as: 'users',
                attributes: [],
                required: false
            }],
            group: ['Role.roleId', 'Role.roleName']
        });

        return {
            total: totalRoles,
            active: activeRoles,
            inactive: inactiveRoles,
            userDistribution: rolesWithUserCount
        };
    }

    /**
     * Get permission matrix for all roles or filtered
     */
    async getPermissionsMatrix() {
        const { RolePermission } = require('../models');
        const roles = await Role.findAll({
            where: { status: 'Active' },
            order: [['roleId', 'ASC']]
        });

        const permissions = await RolePermission.findAll({
            order: [['roleId', 'ASC'], ['page_key', 'ASC']]
        });

        const matrix = {};
        for (const role of roles) {
            matrix[role.roleId] = {
                roleId: role.roleId,
                roleName: role.roleName,
                pages: {}
            };
        }

        for (const perm of permissions) {
            if (matrix[perm.roleId]) {
                matrix[perm.roleId].pages[perm.page_key] = {
                    id: perm.id,
                    can_view: Boolean(perm.can_view),
                    is_sidebar_visible: Boolean(perm.is_sidebar_visible),
                    can_create: Boolean(perm.can_create),
                    can_edit: Boolean(perm.can_edit),
                    can_delete: Boolean(perm.can_delete),
                    can_approve: Boolean(perm.can_approve),
                    can_export: Boolean(perm.can_export)
                };
            }
        }

        return {
            roles,
            matrix
        };
    }

    /**
     * Get current user's permissions as a flat map
     */
    async getMyPermissions(roleId, roleName = null) {
        const { RolePermission } = require('../models');
        const pages = [
            'dashboard', 'departments', 'faculty', 'labs', 'equipment',
            'equipment_categories', 'dealers', 'bookings', 'calendar',
            'incidents', 'orders', 'reports', 'hardware_options', 'access_control'
        ];

        // Master Admin always has full access (never locked out)
        const numericId = parseInt(roleId, 10);
        if (numericId === 7 || roleName === 'master_admin' || roleId === 'master_admin') {
            const fullAccess = {};
            for (const p of pages) {
                fullAccess[p] = {
                    can_view: true,
                    is_sidebar_visible: true,
                    can_create: true,
                    can_edit: true,
                    can_delete: true,
                    can_approve: true,
                    can_export: true
                };
            }
            return fullAccess;
        }

        const perms = await RolePermission.findAll({
            where: { roleId }
        });

        const permMap = {};
        for (const p of pages) {
            const found = perms.find(item => item.page_key === p);
            if (found) {
                permMap[p] = {
                    can_view: Boolean(found.can_view),
                    is_sidebar_visible: Boolean(found.is_sidebar_visible),
                    can_create: Boolean(found.can_create),
                    can_edit: Boolean(found.can_edit),
                    can_delete: Boolean(found.can_delete),
                    can_approve: Boolean(found.can_approve),
                    can_export: Boolean(found.can_export)
                };
            } else {
                // Default fallback
                permMap[p] = {
                    can_view: false,
                    is_sidebar_visible: false,
                    can_create: false,
                    can_edit: false,
                    can_delete: false,
                    can_approve: false,
                    can_export: false
                };
            }
        }

        return permMap;
    }

    /**
     * Update permissions for a specific role
     */
    async updateRolePermissions(roleId, pagesConfig, actorUserId) {
        const { RolePermission } = require('../models');
        const rId = parseInt(roleId);

        // Security check: Master Admin access_control can never be disabled (prevent lockout)
        if (rId === 7 && pagesConfig['access_control']) {
            pagesConfig['access_control'].can_view = 1;
            pagesConfig['access_control'].is_sidebar_visible = 1;
            pagesConfig['access_control'].can_edit = 1;
        }

        for (const [pageKey, conf] of Object.entries(pagesConfig)) {
            // Ordinary Admin cannot be given access to access_control
            if (rId !== 7 && pageKey === 'access_control') {
                conf.can_view = 0;
                conf.is_sidebar_visible = 0;
                conf.can_create = 0;
                conf.can_edit = 0;
                conf.can_delete = 0;
            }

            await RolePermission.upsert({
                roleId: rId,
                page_key: pageKey,
                can_view: conf.can_view ? 1 : 0,
                is_sidebar_visible: conf.is_sidebar_visible !== undefined ? (conf.is_sidebar_visible ? 1 : 0) : (conf.can_view ? 1 : 0),
                can_create: conf.can_create ? 1 : 0,
                can_edit: conf.can_edit ? 1 : 0,
                can_delete: conf.can_delete ? 1 : 0,
                can_approve: conf.can_approve ? 1 : 0,
                can_export: conf.can_export ? 1 : 0
            });
        }

        return { success: true, message: 'Permissions updated successfully' };
    }

    /**
     * Restore default permissions matrix
     */
    async restoreDefaultPermissions(actorUserId) {
        const { sequelize } = require('../config/database');
        const pages = [
            'dashboard', 'departments', 'faculty', 'labs', 'equipment',
            'equipment_categories', 'dealers', 'bookings', 'calendar',
            'incidents', 'orders', 'reports', 'hardware_options', 'access_control'
        ];

        for (const page of pages) {
            // Master Admin (7): All 1
            await sequelize.query(`
                INSERT INTO \`role_permissions\` (\`roleId\`, \`page_key\`, \`can_view\`, \`is_sidebar_visible\`, \`can_create\`, \`can_edit\`, \`can_delete\`, \`can_approve\`, \`can_export\`)
                VALUES (7, :page, 1, 1, 1, 1, 1, 1, 1)
                ON DUPLICATE KEY UPDATE \`can_view\` = 1, \`is_sidebar_visible\` = 1, \`can_create\` = 1, \`can_edit\` = 1, \`can_delete\` = 1, \`can_approve\` = 1, \`can_export\` = 1
            `, { replacements: { page } });

            // Admin (6): All 1 except access_control
            const isAdminAccess = page !== 'access_control';
            await sequelize.query(`
                INSERT INTO \`role_permissions\` (\`roleId\`, \`page_key\`, \`can_view\`, \`is_sidebar_visible\`, \`can_create\`, \`can_edit\`, \`can_delete\`, \`can_approve\`, \`can_export\`)
                VALUES (6, :page, :v, :s, :c, :e, :d, :a, :ex)
                ON DUPLICATE KEY UPDATE \`can_view\` = VALUES(\`can_view\`), \`is_sidebar_visible\` = VALUES(\`is_sidebar_visible\`), \`can_create\` = VALUES(\`can_create\`), \`can_edit\` = VALUES(\`can_edit\`), \`can_delete\` = VALUES(\`can_delete\`), \`can_approve\` = VALUES(\`can_approve\`), \`can_export\` = VALUES(\`can_export\`)
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

            // Faculty (2)
            let facView = 0, facSide = 0, facCreate = 0, facEdit = 0, facDel = 0, facApprove = 0, facExport = 0;
            if (['dashboard', 'labs', 'equipment', 'bookings', 'calendar', 'incidents'].includes(page)) {
                facView = 1;
                facSide = 1;
            }
            if (['departments', 'faculty'].includes(page)) {
                facView = 1;
                facSide = 0;
            }
            if (['bookings', 'incidents'].includes(page)) {
                facCreate = 1;
                facEdit = 1;
            }
            await sequelize.query(`
                INSERT INTO \`role_permissions\` (\`roleId\`, \`page_key\`, \`can_view\`, \`is_sidebar_visible\`, \`can_create\`, \`can_edit\`, \`can_delete\`, \`can_approve\`, \`can_export\`)
                VALUES (2, :page, :v, :s, :c, :e, :d, :a, :ex)
                ON DUPLICATE KEY UPDATE \`can_view\` = VALUES(\`can_view\`), \`is_sidebar_visible\` = VALUES(\`is_sidebar_visible\`), \`can_create\` = VALUES(\`can_create\`), \`can_edit\` = VALUES(\`can_edit\`), \`can_delete\` = VALUES(\`can_delete\`), \`can_approve\` = VALUES(\`can_approve\`), \`can_export\` = VALUES(\`can_export\`)
            `, { replacements: { page, v: facView, s: facSide, c: facCreate, e: facEdit, d: facDel, a: facApprove, ex: facExport } });
        }

        return { success: true, message: 'Default permissions restored successfully' };
    }
}

module.exports = new RoleService();
