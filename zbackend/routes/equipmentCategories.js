const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const equipmentCategoryService = require('../services/equipmentCategoryService');

// GET category statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = await equipmentCategoryService.getStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching equipment category stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch equipment category statistics',
            error: error.message
        });
    }
});

// GET all equipment categories (with optional search and status filter)
router.get('/', async (req, res) => {
    try {
        const categories = await equipmentCategoryService.getAllCategories(req.query);
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        console.error('Error fetching equipment categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch equipment categories',
            error: error.message
        });
    }
});

// GET single equipment category by ID
router.get('/:id', async (req, res) => {
    try {
        const category = await equipmentCategoryService.getCategoryById(req.params.id);
        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        console.error('Error fetching equipment category:', error);
        if (error.message === 'Equipment category not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to fetch equipment category',
            error: error.message
        });
    }
});

// POST create new equipment category
router.post('/', authenticateToken, async (req, res) => {
    try {
        const category = await equipmentCategoryService.createCategory(req.body, req.user?.userId);
        res.status(201).json({
            success: true,
            data: category,
            message: 'Equipment category created successfully'
        });
    } catch (error) {
        console.error('Error creating equipment category:', error);
        if (
            error.message.includes('already exists') ||
            error.message.includes('required') ||
            error.message.includes('already in use') ||
            error.name === 'SequelizeValidationError' ||
            error.name === 'SequelizeUniqueConstraintError'
        ) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
            error: error.message
        });
    }
});

// PUT update equipment category by ID
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const category = await equipmentCategoryService.updateCategory(
            req.params.id,
            req.body,
            req.user?.userId
        );
        res.json({
            success: true,
            data: category,
            message: 'Equipment category updated successfully'
        });
    } catch (error) {
        console.error('Error updating equipment category:', error);
        if (error.message === 'Equipment category not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        if (
            error.message.includes('already exists') ||
            error.message.includes('already in use') ||
            error.message.includes('cannot be empty') ||
            error.name === 'SequelizeValidationError' ||
            error.name === 'SequelizeUniqueConstraintError'
        ) {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
            error: error.message
        });
    }
});

// DELETE equipment category by ID
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const force = req.query.force === 'true';
        const result = await equipmentCategoryService.deleteCategory(req.params.id, force);
        res.json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('Error deleting equipment category:', error);
        if (error.message === 'Equipment category not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        if (error.message.includes('Cannot delete')) {
            return res.status(400).json({
                success: false,
                message: error.message,
                canForce: true
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Server error',
            error: error.message
        });
    }
});

module.exports = router;
