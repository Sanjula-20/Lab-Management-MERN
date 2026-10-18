// routes/dealers.js - Dealer Master API Routes
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const dealerService = require('../services/dealerService');

// GET dealer statistics (must be before /:id)
router.get('/stats', async (req, res) => {
    try {
        const stats = await dealerService.getStats();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching dealer stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dealer statistics',
            error: error.message
        });
    }
});

// GET all dealers (with optional search and status filter)
router.get('/', async (req, res) => {
    try {
        const dealers = await dealerService.getAllDealers(req.query);
        res.json({
            success: true,
            data: dealers
        });
    } catch (error) {
        console.error('Error fetching dealers:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dealers',
            error: error.message
        });
    }
});

// GET single dealer by ID
router.get('/:id', async (req, res) => {
    try {
        const dealer = await dealerService.getDealerById(req.params.id);
        res.json({
            success: true,
            data: dealer
        });
    } catch (error) {
        console.error('Error fetching dealer:', error);
        if (error.message === 'Dealer not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dealer details',
            error: error.message
        });
    }
});

// POST create new dealer
router.post('/', authenticateToken, async (req, res) => {
    try {
        const dealer = await dealerService.createDealer(req.body, req.user?.userId);
        res.status(201).json({
            success: true,
            data: dealer,
            message: 'Dealer created successfully'
        });
    } catch (error) {
        console.error('Error creating dealer:', error);
        if (
            error.message.includes('already exists') ||
            error.message.includes('required') ||
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

// PUT update dealer by ID
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const dealer = await dealerService.updateDealer(
            req.params.id,
            req.body,
            req.user?.userId
        );
        res.json({
            success: true,
            data: dealer,
            message: 'Dealer updated successfully'
        });
    } catch (error) {
        console.error('Error updating dealer:', error);
        if (error.message === 'Dealer not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        if (
            error.message.includes('already exists') ||
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

// PATCH toggle dealer active status
router.patch('/:id/status', authenticateToken, async (req, res) => {
    try {
        const result = await dealerService.toggleStatus(req.params.id);
        res.json({
            success: true,
            data: result,
            message: result.message
        });
    } catch (error) {
        console.error('Error toggling dealer status:', error);
        if (error.message === 'Dealer not found') {
            return res.status(404).json({
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

// DELETE dealer by ID
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const force = req.query.force === 'true';
        const result = await dealerService.deleteDealer(req.params.id, force);
        res.json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('Error deleting dealer:', error);
        if (error.message === 'Dealer not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        if (error.message.includes('Cannot delete dealer')) {
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

// POST batch set status for multiple dealers
router.post('/batch-status', authenticateToken, async (req, res) => {
    try {
        const { ids, is_active } = req.body;
        const result = await dealerService.batchSetStatus(ids, is_active);
        res.json({
            success: true,
            message: `Successfully set ${result.updatedCount} dealer(s) to ${is_active ? 'Active' : 'Inactive'}`,
            data: result
        });
    } catch (error) {
        console.error('Error batch updating dealer status:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to update dealer status',
            error: error.message
        });
    }
});

// POST batch delete dealers
router.post('/batch-delete', authenticateToken, async (req, res) => {
    try {
        const { ids, force } = req.body;
        const result = await dealerService.batchDeleteDealers(ids, force);
        res.json({
            success: true,
            message: `Successfully deleted ${result.deletedCount} dealer(s)${result.unlinkedCount > 0 ? ` (${result.unlinkedCount} equipment unlinked)` : ''}`,
            data: result
        });
    } catch (error) {
        console.error('Error batch deleting dealers:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to batch delete dealers',
            canForce: error.message.includes('linked to them'),
            error: error.message
        });
    }
});

module.exports = router;
