const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const auditService = require('../services/auditService');

const router = express.Router();

// Apply authentication to all audit routes
router.use(authenticateToken);

/**
 * GET /api/audit
 * Get recent audit logs with pagination and filters
 */
router.get('/', async (req, res) => {
    try {
        const { entity_type, action, user_id, page = 1, limit = 50 } = req.query;
        const result = await auditService.getRecentLogs({
            entity_type,
            action,
            user_id,
            page,
            limit
        });

        res.json({
            success: true,
            data: result.logs,
            pagination: {
                total: result.total,
                page: result.page,
                totalPages: result.totalPages,
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch audit logs',
            error: error.message
        });
    }
});

/**
 * GET /api/audit/:entity_type/:entity_id
 * Get complete audit history/timeline for a specific entity
 */
router.get('/:entity_type/:entity_id', async (req, res) => {
    try {
        const { entity_type, entity_id } = req.params;
        const history = await auditService.getEntityHistory(entity_type, entity_id);

        res.json({
            success: true,
            data: history
        });
    } catch (error) {
        console.error(`Error fetching audit history for ${req.params.entity_type} #${req.params.entity_id}:`, error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch entity audit history',
            error: error.message
        });
    }
});

module.exports = router;
