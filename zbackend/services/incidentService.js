// Incident Service - Business Logic Layer
const { Incident, User, Equipment, Lab } = require('../models');
const { Op } = require('sequelize');
const { createNotification } = require('../utils/notificationService');
const auditService = require('./auditService');
const emailService = require('./emailService');

const USER_ATTRS = [['userId', 'id'], 'userId', ['userName', 'name'], ['userMail', 'email'], 'phone', 'position'];

class IncidentService {
    /**
     * Get incident statistics
     */
    async getStats() {
        const stats = await Incident.getStats();
        return stats;
    }

    /**
     * Get all incidents with filters
     */
    async getAllIncidents(filters = {}) {
        try {
            const {
                status,
                priority,
                category,
                assigned_to,
                reported_by,
                equipment_id,
                lab_id,
                start_date,
                end_date,
                page = 1,
                limit = 100,
                search
            } = filters;

            const whereClause = {};

            if (status && status !== 'all') {
                if (Array.isArray(status)) {
                    whereClause.status = { [Op.in]: status };
                } else if (status.includes(',')) {
                    whereClause.status = { [Op.in]: status.split(',').map(s => s.trim()) };
                } else {
                    whereClause.status = status;
                }
            }
            if (priority && priority !== 'all') {
                if (Array.isArray(priority)) {
                    whereClause.priority = { [Op.in]: priority };
                } else if (priority.includes(',')) {
                    whereClause.priority = { [Op.in]: priority.split(',').map(p => p.trim()) };
                } else {
                    whereClause.priority = priority;
                }
            }
            if (category && category !== 'all') {
                if (Array.isArray(category)) {
                    whereClause.category = { [Op.in]: category };
                } else if (category.includes(',')) {
                    whereClause.category = { [Op.in]: category.split(',').map(c => c.trim()) };
                } else {
                    whereClause.category = category;
                }
            }
            if (assigned_to) whereClause.assigned_to = assigned_to;
            if (reported_by) whereClause.reported_by = reported_by;
            if (equipment_id) whereClause.equipment_id = equipment_id;

            if (start_date || end_date) {
                whereClause.created_at = {};
                if (start_date) whereClause.created_at[Op.gte] = new Date(start_date);
                if (end_date) {
                    const eDate = new Date(end_date);
                    eDate.setHours(23, 59, 59, 999);
                    whereClause.created_at[Op.lte] = eDate;
                }
            }

            if (search) {
                whereClause[Op.or] = [
                    { title: { [Op.like]: `%${search}%` } },
                    { description: { [Op.like]: `%${search}%` } },
                    { location: { [Op.like]: `%${search}%` } },
                    { resolution_notes: { [Op.like]: `%${search}%` } }
                ];
            }

            const offset = (parseInt(page) - 1) * parseInt(limit);

            const equipmentInclude = {
                model: Equipment,
                as: 'relatedEquipment',
                attributes: ['id', 'name', 'serial_number', 'category', 'status', 'brand', ['model', 'model_name'], 'model', 'lab_id'],
                required: false,
                include: [
                    {
                        model: Lab,
                        as: 'lab',
                        attributes: ['id', 'name', 'lab_type', 'location', 'lab_seats'],
                        required: false
                    }
                ]
            };

            if (lab_id) {
                equipmentInclude.where = { lab_id };
                equipmentInclude.required = true;
            }

            const { rows: incidents, count: total } = await Incident.findAndCountAll({
                where: whereClause,
                include: [
                    equipmentInclude,
                    {
                        model: User,
                        as: 'incidentReporter',
                        attributes: USER_ATTRS,
                        required: false
                    },
                    {
                        model: User,
                        as: 'incidentAssignee',
                        attributes: USER_ATTRS,
                        required: false
                    },
                    {
                        model: User,
                        as: 'incidentResolver',
                        attributes: USER_ATTRS,
                        required: false
                    }
                ],
                order: [['created_at', 'DESC']],
                limit: parseInt(limit),
                offset: offset
            });

            return {
                incidents,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    totalPages: Math.ceil(total / parseInt(limit))
                }
            };
        } catch (error) {
            console.error('❌ Error in getAllIncidents service:', error);
            throw new Error(`Failed to fetch incidents: ${error.message}`);
        }
    }

    /**
     * Get incident by ID
     */
    async getIncidentById(id) {
        const incident = await Incident.findByPk(id, {
            include: [
                {
                    model: Equipment,
                    as: 'relatedEquipment',
                    attributes: ['id', 'name', 'serial_number', 'category', 'status', 'brand', ['model', 'model_name'], 'model', 'lab_id'],
                    required: false,
                    include: [
                        {
                            model: Lab,
                            as: 'lab',
                            attributes: ['id', 'name', 'lab_type', 'location', 'lab_seats'],
                            required: false
                        }
                    ]
                },
                {
                    model: User,
                    as: 'incidentReporter',
                    attributes: USER_ATTRS,
                    required: false
                },
                {
                    model: User,
                    as: 'incidentAssignee',
                    attributes: USER_ATTRS,
                    required: false
                },
                {
                    model: User,
                    as: 'incidentResolver',
                    attributes: USER_ATTRS,
                    required: false
                }
            ]
        });

        if (!incident) {
            throw new Error('Incident not found');
        }

        return incident;
    }

    /**
     * Create incident
     */
    async createIncident(incidentData, user, req = null) {
        const {
            title,
            description,
            priority,
            category,
            location,
            equipment_id,
            assigned_to
        } = incidentData;

        const userId = user?.userId || user?.id || (typeof user === 'number' ? user : null);

        // Validate required fields
        if (!title || !description || !priority || !category) {
            throw new Error('Title, description, priority, and category are required');
        }

        let machineLocation = location?.trim() || null;

        // Verify equipment if provided
        if (equipment_id) {
            const equipment = await Equipment.findByPk(equipment_id, {
                include: [{ model: Lab, as: 'lab' }]
            });
            if (!equipment) {
                throw new Error('Selected equipment was not found');
            }
            if (!machineLocation && equipment.lab) {
                machineLocation = equipment.lab.name + (equipment.lab.location ? ` - ${equipment.lab.location}` : '');
            }
        }

        // Verify assignee if provided
        let assigneeUser = null;
        if (assigned_to) {
            assigneeUser = await User.findByPk(assigned_to);
            if (!assigneeUser) {
                throw new Error('Assigned user not found');
            }
        }

        const incident = await Incident.create({
            title: title.trim(),
            description: description.trim(),
            priority,
            category,
            location: machineLocation,
            equipment_id: equipment_id ? parseInt(equipment_id) : null,
            assigned_to: assigned_to ? parseInt(assigned_to) : null,
            reported_by: userId,
            status: 'open'
        });

        // Audit Trail
        try {
            await auditService.logEvent({
                entity_type: 'incident',
                entity_id: incident.id,
                action: 'CREATE',
                new_values: incident.toJSON(),
                user_id: userId,
                user_name: user?.userName || user?.name || 'User',
                req,
                notes: `Incident reported: ${incident.title} (Priority: ${incident.priority})`
            });
        } catch (auditErr) {
            console.error('Audit logging failed for incident create:', auditErr.message);
        }

        // Fetch populated incident
        const createdIncident = await this.getIncidentById(incident.id);

        // Send In-app & Email Notification to Assignee
        if (assigned_to && assigneeUser) {
            try {
                await createNotification({
                    user_id: assigned_to,
                    type: 'incident',
                    title: 'Incident Assigned',
                    message: `You have been assigned to incident: "${title}". Priority: ${priority}`,
                    metadata: {
                        incident_id: incident.id,
                        title: title,
                        priority: priority,
                        category: category
                    }
                });

                const assigneeEmail = assigneeUser.userMail || assigneeUser.email;
                if (assigneeEmail) {
                    emailService.sendIncidentNotification({
                        to: assigneeEmail,
                        recipientName: assigneeUser.userName || assigneeUser.name,
                        incident: createdIncident,
                        action: 'assigned',
                        actorName: user?.userName || user?.name || 'Lab Staff'
                    }).catch(e => console.warn('Incident assignment email failed:', e.message));
                }
            } catch (notifError) {
                console.error('⚠️ Failed to create incident notification:', notifError.message);
            }
        }

        return createdIncident;
    }

    /**
     * Update incident
     */
    async updateIncident(id, updateData, user, req = null) {
        const incident = await Incident.findByPk(id);

        if (!incident) {
            throw new Error('Incident not found');
        }

        const userId = user?.userId || user?.id || (typeof user === 'number' ? user : null);
        const oldValues = incident.toJSON();
        const oldStatus = incident.status;
        const oldAssignee = incident.assigned_to;

        // Auto-update resolution date if status changed to resolved
        if (updateData.status === 'resolved' && incident.status !== 'resolved') {
            updateData.resolved_at = new Date();
            updateData.resolved_by = userId;
        }

        await incident.update(updateData);

        // Audit Trail
        try {
            await auditService.logEvent({
                entity_type: 'incident',
                entity_id: incident.id,
                action: 'UPDATE',
                old_values: oldValues,
                new_values: incident.toJSON(),
                user_id: userId,
                user_name: user?.userName || user?.name || 'User',
                req,
                notes: `Incident updated: status ${oldStatus} -> ${incident.status}`
            });
        } catch (auditErr) {
            console.error('Audit logging failed for incident update:', auditErr.message);
        }

        const updatedIncident = await this.getIncidentById(id);

        // Create notification for status change
        if (updateData.status && updateData.status !== oldStatus) {
            try {
                const notifyUserId = incident.reported_by;
                if (notifyUserId) {
                    await createNotification({
                        user_id: notifyUserId,
                        type: 'incident',
                        title: 'Incident Status Updated',
                        message: `Incident "${incident.title}" status changed to ${updateData.status}.`,
                        metadata: {
                            incident_id: incident.id,
                            old_status: oldStatus,
                            new_status: updateData.status
                        }
                    });

                    const reporter = updatedIncident.incidentReporter;
                    const reporterEmail = reporter?.email || reporter?.userMail;
                    if (reporterEmail) {
                        emailService.sendIncidentNotification({
                            to: reporterEmail,
                            recipientName: reporter.name || reporter.userName,
                            incident: updatedIncident,
                            action: updateData.status === 'resolved' ? 'resolved' : 'status_changed',
                            actorName: user?.userName || user?.name || 'Staff'
                        }).catch(e => console.warn('Status change email failed:', e.message));
                    }
                }
            } catch (notifError) {
                console.error('⚠️ Failed to create status notification:', notifError.message);
            }
        }

        // Create notification for reassignment
        if (updateData.assigned_to && updateData.assigned_to !== oldAssignee) {
            try {
                await createNotification({
                    user_id: updateData.assigned_to,
                    type: 'incident',
                    title: 'Incident Assigned',
                    message: `You have been assigned to incident: "${incident.title}".`,
                    metadata: {
                        incident_id: incident.id,
                        title: incident.title,
                        priority: incident.priority
                    }
                });

                const assignee = updatedIncident.incidentAssignee;
                const assigneeEmail = assignee?.email || assignee?.userMail;
                if (assigneeEmail) {
                    emailService.sendIncidentNotification({
                        to: assigneeEmail,
                        recipientName: assignee.name || assignee.userName,
                        incident: updatedIncident,
                        action: 'assigned',
                        actorName: user?.userName || user?.name || 'Staff'
                    }).catch(e => console.warn('Reassignment email failed:', e.message));
                }
            } catch (notifError) {
                console.error('⚠️ Failed to create assignment notification:', notifError.message);
            }
        }

        return updatedIncident;
    }

    /**
     * Resolve incident explicitly with resolution notes and authenticated user
     */
    async resolveIncident(id, { resolution_notes }, user, req = null) {
        const incident = await Incident.findByPk(id);

        if (!incident) {
            throw new Error('Incident not found');
        }

        if (!resolution_notes || !resolution_notes.trim()) {
            throw new Error('Resolution notes are required to resolve an incident');
        }

        const userId = user?.userId || user?.id || (typeof user === 'number' ? user : null);
        const oldValues = incident.toJSON();

        await incident.update({
            status: 'resolved',
            resolution_notes: resolution_notes.trim(),
            resolved_at: new Date(),
            resolved_by: userId
        });

        // Audit Trail
        try {
            await auditService.logEvent({
                entity_type: 'incident',
                entity_id: incident.id,
                action: 'RESOLVE',
                old_values: oldValues,
                new_values: incident.toJSON(),
                user_id: userId,
                user_name: user?.userName || user?.name || 'Resolver',
                req,
                notes: `Incident resolved: ${resolution_notes.trim().substring(0, 100)}`
            });
        } catch (auditErr) {
            console.error('Audit logging failed for incident resolution:', auditErr.message);
        }

        const resolvedIncident = await this.getIncidentById(id);

        // Notify reporter
        try {
            if (incident.reported_by) {
                await createNotification({
                    user_id: incident.reported_by,
                    type: 'incident',
                    title: 'Incident Resolved',
                    message: `Incident "${incident.title}" has been resolved: ${resolution_notes.trim().substring(0, 80)}`,
                    metadata: {
                        incident_id: incident.id,
                        status: 'resolved',
                        resolved_by: userId
                    }
                });

                const reporter = resolvedIncident.incidentReporter;
                const reporterEmail = reporter?.email || reporter?.userMail;
                if (reporterEmail) {
                    emailService.sendIncidentNotification({
                        to: reporterEmail,
                        recipientName: reporter.name || reporter.userName,
                        incident: resolvedIncident,
                        action: 'resolved',
                        actorName: user?.userName || user?.name || 'Technician',
                        notes: resolution_notes.trim()
                    }).catch(e => console.warn('Resolution email failed:', e.message));
                }
            }
        } catch (notifErr) {
            console.error('Failed to notify reporter on resolution:', notifErr.message);
        }

        return resolvedIncident;
    }

    /**
     * Update incident status
     */
    async updateStatus(id, status, user, req = null) {
        const incident = await Incident.findByPk(id);

        if (!incident) {
            throw new Error('Incident not found');
        }

        const userId = user?.userId || user?.id || (typeof user === 'number' ? user : null);
        const oldStatus = incident.status;
        const oldValues = incident.toJSON();
        const updateData = { status };

        if (status === 'resolved' && incident.status !== 'resolved') {
            updateData.resolved_at = new Date();
            updateData.resolved_by = userId;
        }

        await incident.update(updateData);

        // Audit Trail
        try {
            await auditService.logEvent({
                entity_type: 'incident',
                entity_id: incident.id,
                action: 'STATUS_CHANGE',
                old_values: oldValues,
                new_values: incident.toJSON(),
                user_id: userId,
                user_name: user?.userName || user?.name || 'User',
                req,
                notes: `Incident status updated from ${oldStatus} to ${status}`
            });
        } catch (auditErr) {
            console.error('Audit logging failed for incident status change:', auditErr.message);
        }

        return await this.getIncidentById(id);
    }

    /**
     * Delete incident
     */
    async deleteIncident(id, user = null, req = null) {
        const incident = await Incident.findByPk(id);

        if (!incident) {
            throw new Error('Incident not found');
        }

        const oldValues = incident.toJSON();
        const userId = user?.userId || user?.id;

        await incident.destroy();

        try {
            await auditService.logEvent({
                entity_type: 'incident',
                entity_id: id,
                action: 'DELETE',
                old_values: oldValues,
                user_id: userId,
                user_name: user?.userName || user?.name || 'Admin',
                req,
                notes: `Incident deleted: ${oldValues.title}`
            });
        } catch (auditErr) {
            console.error('Audit logging failed for incident delete:', auditErr.message);
        }

        return { message: 'Incident deleted successfully' };
    }

    /**
     * Get recent incidents
     */
    async getRecentIncidents(limit = 10) {
        const incidents = await Incident.findAll({
            include: [
                {
                    model: Equipment,
                    as: 'relatedEquipment',
                    attributes: ['id', 'name', 'serial_number'],
                    required: false
                },
                {
                    model: User,
                    as: 'incidentReporter',
                    attributes: USER_ATTRS,
                    required: false
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit)
        });

        return incidents;
    }

    /**
     * Get critical incidents
     */
    async getCriticalIncidents() {
        const incidents = await Incident.findAll({
            where: {
                priority: 'critical',
                status: { [Op.in]: ['open', 'in_progress'] }
            },
            include: [
                {
                    model: Equipment,
                    as: 'relatedEquipment',
                    attributes: ['id', 'name', 'serial_number'],
                    required: false
                },
                {
                    model: User,
                    as: 'incidentAssignee',
                    attributes: USER_ATTRS,
                    required: false
                }
            ],
            order: [['created_at', 'DESC']]
        });

        return incidents;
    }
}

module.exports = new IncidentService();
