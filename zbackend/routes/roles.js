const express = require('express');
const router = express.Router();
const { authenticateToken, requireMasterAdmin } = require('../middleware/auth');
const roleService = require('../services/roleService');

router.use(authenticateToken);

// GET current user's permissions
router.get('/my-permissions', async (req, res) => {
    try {
        const perms = await roleService.getMyPermissions(req.user.roleId, req.user.role);
        res.json({
            success: true,
            data: perms,
            role: req.user.role,
            roleId: req.user.roleId,
            isMasterAdmin: req.user.role === 'master_admin' || req.user.roleId === 7
        });
    } catch (error) {
        console.error('Error fetching user permissions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user permissions',
            error: error.message
        });
    }
});

// GET full permissions matrix - Master Admin only
router.get('/permissions', requireMasterAdmin, async (req, res) => {
    try {
        const matrix = await roleService.getPermissionsMatrix();
        res.json({
            success: true,
            data: matrix
        });
    } catch (error) {
        console.error('Error fetching permissions matrix:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch permissions matrix',
            error: error.message
        });
    }
});

// PUT update role permissions - Master Admin only
router.put('/permissions/:roleId', requireMasterAdmin, async (req, res) => {
    try {
        const actorId = req.user.userId || req.user.id;
        const result = await roleService.updateRolePermissions(req.params.roleId, req.body.pages || req.body.permissions || req.body, actorId);
        res.json(result);
    } catch (error) {
        console.error('Error updating role permissions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update role permissions',
            error: error.message
        });
    }
});

// POST restore default permissions - Master Admin only
router.post('/permissions/restore-defaults', requireMasterAdmin, async (req, res) => {
    try {
        const actorId = req.user.userId || req.user.id;
        const result = await roleService.restoreDefaultPermissions(actorId);
        res.json(result);
    } catch (error) {
        console.error('Error restoring default permissions:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to restore default permissions',
            error: error.message
        });
    }
});

// GET role statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = await roleService.getRoleStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching role stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch role statistics',
            error: error.message
        });
    }
});

// GET all roles
router.get('/', async (req, res) => {
    try {
        const result = await roleService.getAllRoles(req.query);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error fetching roles:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch roles',
            error: error.message
        });
    }
});

// GET role by ID
router.get('/:id', async (req, res) => {
    try {
        const role = await roleService.getRoleById(req.params.id);
        res.json({
            success: true,
            data: role
        });
    } catch (error) {
        console.error('Error fetching role:', error);
        if (error.message === 'Role not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to fetch role',
            error: error.message
        });
    }
});

// POST create new role
router.post('/', async (req, res) => {
    try {
        // Only admin can create roles
        if (req.user.role !== 'admin' && req.user.roleId !== 6 && req.user.role !== 'master_admin' && req.user.roleId !== 7) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to create roles'
            });
        }

        const userId = req.user.userId || req.user.id;
        const role = await roleService.createRole(req.body, userId);

        res.status(201).json({
            success: true,
            message: 'Role created successfully',
            data: role
        });
    } catch (error) {
        console.error('Error creating role:', error);
        if (error.message === 'Role already exists') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to create role',
            error: error.message
        });
    }
});

// PUT update role
router.put('/:id', async (req, res) => {
    try {
        // Only admin can update roles
        if (req.user.role !== 'admin' && req.user.roleId !== 6 && req.user.role !== 'master_admin' && req.user.roleId !== 7) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to update roles'
            });
        }

        const userId = req.user.userId || req.user.id;
        const role = await roleService.updateRole(req.params.id, req.body, userId);

        res.json({
            success: true,
            message: 'Role updated successfully',
            data: role
        });
    } catch (error) {
        console.error('Error updating role:', error);
        if (error.message === 'Role not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        if (error.message === 'Role name already exists') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to update role',
            error: error.message
        });
    }
});

// DELETE role
router.delete('/:id', async (req, res) => {
    try {
        // Only admin can delete roles
        if (req.user.role !== 'admin' && req.user.roleId !== 6 && req.user.role !== 'master_admin' && req.user.roleId !== 7) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to delete roles'
            });
        }

        const result = await roleService.deleteRole(req.params.id);
        res.json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('Error deleting role:', error);
        if (error.message === 'Role not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        if (error.message.includes('Cannot delete role')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to delete role',
            error: error.message
        });
    }
});

module.exports = router;
