const express = require('express');
const router = express.Router();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const hardwareOptionService = require('../services/hardwareOptionService');

router.use(authenticateToken);

// GET all hardware options (or grouped for Equipment form)
router.get('/', async (req, res) => {
    try {
        const result = await hardwareOptionService.getAllOptions(req.query);
        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error('Error fetching hardware options:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch hardware options',
            error: error.message
        });
    }
});

// GET options by specific field type
router.get('/type/:fieldType', async (req, res) => {
    try {
        const options = await hardwareOptionService.getByFieldType(req.params.fieldType, req.query.activeOnly !== 'false');
        res.json({
            success: true,
            data: options
        });
    } catch (error) {
        console.error('Error fetching options by field type:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch options for field',
            error: error.message
        });
    }
});

// POST create hardware option - Admin only
router.post('/', requireAdmin, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const option = await hardwareOptionService.createOption(req.body, userId);
        res.status(201).json({
            success: true,
            message: 'Hardware option created successfully',
            data: option
        });
    } catch (error) {
        console.error('Error creating hardware option:', error);
        if (error.message.includes('already exists') || error.message.includes('required')) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to create hardware option',
            error: error.message
        });
    }
});

// PUT update hardware option - Admin only
router.put('/:id', requireAdmin, async (req, res) => {
    try {
        const option = await hardwareOptionService.updateOption(req.params.id, req.body);
        res.json({
            success: true,
            message: 'Hardware option updated successfully',
            data: option
        });
    } catch (error) {
        console.error('Error updating hardware option:', error);
        if (error.message.includes('already exists')) {
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
            message: 'Failed to update hardware option',
            error: error.message
        });
    }
});

// DELETE hardware option - Admin only
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const result = await hardwareOptionService.deleteOption(req.params.id);
        res.json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('Error deleting hardware option:', error);
        if (error.message.includes('not found')) {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to delete hardware option',
            error: error.message
        });
    }
});

module.exports = router;
