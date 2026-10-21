const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin, checkPermission } = require('../middleware/auth');
const facultyService = require('../services/facultyService');

router.use(authenticateToken);

// GET faculty statistics
router.get('/stats', checkPermission('faculty', 'view'), async (req, res) => {
    try {
        const stats = await facultyService.getFacultyStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching faculty stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch faculty statistics',
            error: error.message
        });
    }
});

// GET all faculty members
router.get('/', checkPermission('faculty', 'view'), async (req, res) => {
    try {
        const result = await facultyService.getAllFaculty(req.query);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error fetching faculty list:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch faculty members',
            error: error.message
        });
    }
});

// GET faculty member by ID
router.get('/:id', checkPermission('faculty', 'view'), async (req, res) => {
    try {
        const faculty = await facultyService.getFacultyById(req.params.id);
        res.json({
            success: true,
            data: faculty
        });
    } catch (error) {
        console.error('Error fetching faculty member:', error);
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to fetch faculty member',
            error: error.message
        });
    }
});

// POST create faculty member - Requires create permission or Admin
router.post('/', checkPermission('faculty', 'create'), async (req, res) => {
    try {
        const actorId = req.user.userId || req.user.id;
        const faculty = await facultyService.createFaculty(req.body, actorId);
        res.status(201).json({
            success: true,
            message: 'Faculty member created successfully',
            data: faculty
        });
    } catch (error) {
        console.error('Error creating faculty member:', error);
        if (error.message.includes('already') || error.message.includes('required')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to create faculty member',
            error: error.message
        });
    }
});

// PUT update faculty member - Requires edit permission or Admin
router.put('/:id', checkPermission('faculty', 'edit'), async (req, res) => {
    try {
        const actorId = req.user.userId || req.user.id;
        const faculty = await facultyService.updateFaculty(req.params.id, req.body, actorId);
        res.json({
            success: true,
            message: 'Faculty member updated successfully',
            data: faculty
        });
    } catch (error) {
        console.error('Error updating faculty member:', error);
        if (error.message.includes('already')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to update faculty member',
            error: error.message
        });
    }
});

// DELETE / Deactivate faculty member - Requires delete permission or Admin
router.delete('/:id', checkPermission('faculty', 'delete'), async (req, res) => {
    try {
        const actorId = req.user.userId || req.user.id;
        const result = await facultyService.deleteFaculty(req.params.id, actorId);
        res.json(result);
    } catch (error) {
        console.error('Error deleting faculty member:', error);
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to deactivate faculty member',
            error: error.message
        });
    }
});

module.exports = router;
