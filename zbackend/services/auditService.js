// auditService.js - Centralized Audit Logging Service
const { AuditLog } = require('../models');

class AuditService {
    /**
     * Record an audit event
     */
    async logEvent({
        entity_type,
        entity_id,
        action,
        previous_values = null,
        new_values = null,
        user_id = null,
        user_name = null,
        notes = null,
        transaction = null
    }) {
        try {
            if (!entity_type || !entity_id || !action) {
                console.warn('⚠️ Missing required audit fields:', { entity_type, entity_id, action });
                return null;
            }

            // Never store sensitive information in audit logs
            const sanitize = (val) => {
                if (!val || typeof val !== 'object') return val;
                const copy = Array.isArray(val) ? [...val] : { ...val };
                const sensitiveKeys = ['password', 'token', 'otp', 'backup_codes', 'resetPasswordToken', 'resetOTP'];
                for (const k of sensitiveKeys) {
                    if (k in copy) delete copy[k];
                }
                return copy;
            };

            const cleanPrev = sanitize(previous_values);
            const cleanNew = sanitize(new_values);

            const record = await AuditLog.create({
                entity_type: String(entity_type).toLowerCase(),
                entity_id: parseInt(entity_id),
                action: String(action).toUpperCase(),
                previous_values: cleanPrev,
                new_values: cleanNew,
                user_id: user_id ? parseInt(user_id) : null,
                user_name: user_name ? String(user_name).trim() : null,
                notes: notes ? String(notes).trim() : null
            }, transaction ? { transaction } : {});

            return record;
        } catch (error) {
            // Fail open for audit logging so it never blocks primary business transactions unless in a shared transaction
            console.error('❌ Audit logging error:', error.message);
            if (transaction) throw error;
            return null;
        }
    }

    /**
     * Get history for a specific entity
     */
    async getEntityHistory(entity_type, entity_id) {
        return await AuditLog.findAll({
            where: {
                entity_type: String(entity_type).toLowerCase(),
                entity_id: parseInt(entity_id)
            },
            order: [['created_at', 'DESC']],
            limit: 100
        });
    }

    /**
     * Get recent logs with optional filtering
     */
    async getRecentLogs(filters = {}) {
        const { entity_type, action, user_id, limit = 50, page = 1 } = filters;
        const where = {};
        if (entity_type) where.entity_type = String(entity_type).toLowerCase();
        if (action) where.action = String(action).toUpperCase();
        if (user_id) where.user_id = parseInt(user_id);

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const { rows, count } = await AuditLog.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset
        });

        return {
            logs: rows,
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / parseInt(limit))
        };
    }
}

module.exports = new AuditService();
