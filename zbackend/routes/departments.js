const express = require('express');
const router = express.Router();
const { authenticateToken, checkPermission } = require('../middleware/auth');
const departmentService = require('../services/departmentService');

router.use(authenticateToken);

// GET department statistics
router.get('/stats', checkPermission('departments', 'view'), async (req, res) => {
    try {
        const companyId = req.query.companyId || req.user.companyId || 0;
        const stats = await departmentService.getDepartmentStats(companyId);
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching department stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch department statistics',
            error: error.message
        });
    }
});

// GET all departments
router.get('/', checkPermission('departments', 'view'), async (req, res) => {
    try {
        // Add user's companyId to filters if not provided
        const filters = {
            ...req.query,
            companyId: req.query.companyId || req.user.companyId || 0
        };
        
        const result = await departmentService.getAllDepartments(filters);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch departments',
            error: error.message
        });
    }
});

// GET department by ID
router.get('/:id', checkPermission('departments', 'view'), async (req, res) => {
    try {
        const department = await departmentService.getDepartmentById(req.params.id);
        res.json({
            success: true,
            data: department
        });
    } catch (error) {
        console.error('Error fetching department:', error);
        if (error.message === 'Department not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to fetch department',
            error: error.message
        });
    }
});

// POST create new department
router.post('/', checkPermission('departments', 'create'), async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const departmentData = {
            ...req.body,
            companyId: req.body.companyId || req.user.companyId || 0
        };
        
        const department = await departmentService.createDepartment(departmentData, userId);

        res.status(201).json({
            success: true,
            message: 'Department created successfully',
            data: department
        });
    } catch (error) {
        console.error('Error creating department:', error);
        if (error.message.includes('already exists')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to create department',
            error: error.message
        });
    }
});

// PUT update department
router.put('/:id', checkPermission('departments', 'edit'), async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const department = await departmentService.updateDepartment(req.params.id, req.body, userId);

        res.json({
            success: true,
            message: 'Department updated successfully',
            data: department
        });
    } catch (error) {
        console.error('Error updating department:', error);
        if (error.message === 'Department not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        if (error.message.includes('already exists')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to update department',
            error: error.message
        });
    }
});

// DELETE department
router.delete('/:id', checkPermission('departments', 'delete'), async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const result = await departmentService.deleteDepartment(req.params.id, userId);
        res.json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('Error deleting department:', error);
        if (error.message === 'Department not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        if (error.message.includes('Cannot delete department')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to delete department',
            error: error.message
        });
    }
});

module.exports = router;
