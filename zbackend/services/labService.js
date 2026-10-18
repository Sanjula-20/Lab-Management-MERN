// Lab Service - Business Logic Layer
const { Lab, User, Role, Department, Equipment, Booking } = require('../models');
const { Op } = require('sequelize');
const { createNotification } = require('../utils/notificationService');

const ROLE_MAP = { 1: 'Student', 2: 'Faculty', 3: 'Teacher', 4: 'Lab Assistant', 5: 'Lab Technician', 6: 'Admin' };

function formatLab(lab) {
    if (!lab) return null;
    const l = typeof lab.toJSON === 'function' ? lab.toJSON() : { ...lab };
    // Provide both lab_seats and seating_capacity alias
    l.seating_capacity = l.lab_seats;
    if (l.inCharge) {
        const inChargeRole = l.inCharge.role?.roleName || ROLE_MAP[l.inCharge.roleId] || l.inCharge.role || 'Staff';
        const inChargeDept = l.inCharge.department?.departmentName || l.inCharge.department?.departmentAcr || l.inCharge.department || 'General';
        l.inCharge = {
            id: l.inCharge.userId || l.inCharge.id,
            name: l.inCharge.userName || l.inCharge.name || 'Staff Member',
            email: l.inCharge.userMail || l.inCharge.email || '',
            role: typeof inChargeRole === 'string' ? inChargeRole : (inChargeRole?.roleName || 'Staff'),
            department: typeof inChargeDept === 'string' ? inChargeDept : (inChargeDept?.departmentName || 'General'),
            phone: l.inCharge.phone || ''
        };
    }
    if (l.labCreator) {
        l.labCreator = {
            id: l.labCreator.userId || l.labCreator.id,
            name: l.labCreator.userName || l.labCreator.name || 'Admin',
            email: l.labCreator.userMail || l.labCreator.email || ''
        };
    }
    return l;
}

class LabService {
    /**
     * Get lab statistics
     */
    async getStats() {
        const totalLabs = await Lab.count({ where: { is_active: true } });
        const cseLabs = await Lab.count({ 
            where: { is_active: true, lab_type: 'cse' } 
        });
        const eeeLabs = await Lab.count({ 
            where: { is_active: true, lab_type: 'eee' } 
        });
        const eceLabs = await Lab.count({ 
            where: { is_active: true, lab_type: 'ece' } 
        });

        return {
            total: totalLabs,
            cseLabs,
            eeeLabs,
            eceLabs
        };
    }

    /**
     * Get all labs with filters and pagination
     */
    async getAllLabs(filters = {}) {
        const { page = 1, limit = 50, search } = filters;

        const whereClause = { is_active: true };

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { location: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const labs = await Lab.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'labCreator',
                    attributes: ['id', 'userId', 'name', 'userName', 'email', 'userMail'],
                    required: false
                },
                {
                    model: User,
                    as: 'inCharge',
                    attributes: ['id', 'userId', 'name', 'userName', 'email', 'userMail', 'roleId', 'departmentId', 'phone'],
                    include: [
                        { model: Role, as: 'role', attributes: ['roleId', 'roleName'], required: false },
                        { model: Department, as: 'department', attributes: ['departmentId', 'departmentName', 'departmentAcr'], required: false }
                    ],
                    required: false
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: offset
        });

        return {
            labs: labs.rows.map(formatLab),
            pagination: {
                total: labs.count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(labs.count / parseInt(limit))
            }
        };
    }

    /**
     * Get lab by ID
     */
    async getLabById(id) {
        const lab = await Lab.findOne({
            where: { id: id, is_active: true },
            include: [
                {
                    model: User,
                    as: 'labCreator',
                    attributes: ['id', 'userId', 'name', 'userName', 'email', 'userMail'],
                    required: false
                },
                {
                    model: User,
                    as: 'inCharge',
                    attributes: ['id', 'userId', 'name', 'userName', 'email', 'userMail', 'roleId', 'departmentId', 'phone'],
                    include: [
                        { model: Role, as: 'role', attributes: ['roleId', 'roleName'], required: false },
                        { model: Department, as: 'department', attributes: ['departmentId', 'departmentName', 'departmentAcr'], required: false }
                    ],
                    required: false
                }
            ]
        });

        if (!lab) {
            throw new Error('Lab not found');
        }

        return formatLab(lab);
    }

    /**
     * Get staff members eligible to be assigned as lab in-charges
     */
    async getEligibleStaff() {
        const users = await User.findAll({
            attributes: ['id', 'userId', 'name', 'userName', 'email', 'userMail', 'department', 'phone', 'roleId', 'status'],
            include: [
                { model: Role, as: 'role', attributes: ['roleId', 'roleName'], required: false },
                { model: Department, as: 'department', attributes: ['departmentId', 'departmentName', 'departmentAcr'], required: false }
            ],
            order: [['name', 'ASC']]
        });

        const staffRoles = ['teacher', 'faculty', 'lab technician', 'lab_technician', 'lab assistant', 'lab_assistant', 'admin'];
        const staffRoleIds = [2, 3, 4, 5, 6];

        const eligible = users.filter(u => {
            const rName = String(u.role?.roleName || u.getDataValue('role') || '').toLowerCase();
            const rId = u.roleId || u.role?.roleId;
            return staffRoles.includes(rName) || staffRoleIds.includes(rId);
        }).map(u => ({
            id: u.id || u.userId,
            name: u.name || u.userName || 'Unknown Staff',
            email: u.email || u.userMail || '',
            role: u.role?.roleName || u.getDataValue('role') || 'Staff',
            department: u.department?.departmentName || (typeof u.getDataValue('department') === 'string' ? u.getDataValue('department') : 'General'),
            phone: u.phone || ''
        }));

        return eligible;
    }

    /**
     * Create new lab
     */
    async createLab(labData, userId) {
        const { name, established_date, lab_type, location, capacity, description, square_feet, lab_seats, seating_capacity, in_charge_id } = labData;

        if (!name || !lab_type) {
            throw new Error('Lab Name and Department are required');
        }

        const seats = (lab_seats !== undefined && lab_seats !== null && lab_seats !== '')
            ? parseInt(lab_seats)
            : ((seating_capacity !== undefined && seating_capacity !== null && seating_capacity !== '')
                ? parseInt(seating_capacity)
                : (capacity ? parseInt(capacity) : null));

        if (!seats || isNaN(seats) || seats < 1) {
            throw new Error('Seating Capacity is required and must be at least 1');
        }

        const parsedInChargeId = in_charge_id ? parseInt(in_charge_id) : null;

        const lab = await Lab.create({
            name: name.trim(),
            lab_type,
            established_date: established_date || null,
            location: location || null,
            capacity: capacity ? parseInt(capacity) : seats,
            description: description || null,
            square_feet: square_feet ? parseInt(square_feet) : null,
            lab_seats: seats,
            in_charge_id: parsedInChargeId,
            created_by: userId
        });

        // Notify in-charge if assigned
        if (parsedInChargeId) {
            try {
                await createNotification({
                    user_id: parsedInChargeId,
                    type: 'lab',
                    title: 'Assigned as Lab In-Charge',
                    message: `You have been assigned as the Lab In-Charge for "${name}".`,
                    metadata: {
                        lab_id: lab.id,
                        lab_name: name,
                        action: 'in_charge_assigned'
                    }
                });
            } catch (notifErr) {
                console.error('⚠️ Failed to notify lab in-charge:', notifErr.message);
            }
        }

        // Create creator notification
        try {
            await createNotification({
                user_id: userId,
                type: 'lab',
                title: 'Lab Created',
                message: `New ${lab_type.replace('_', ' ')} "${name}" has been created at ${location || 'the facility'}.`,
                metadata: {
                    lab_id: lab.id,
                    lab_name: name,
                    lab_type: lab_type,
                    location: location,
                    capacity: capacity || null
                }
            });
        } catch (notifError) {
            console.error('⚠️ Failed to create lab notification:', notifError.message);
        }

        return await this.getLabById(lab.id);
    }

    /**
     * Update lab
     */
    async updateLab(id, labData, userId) {
        const { name, established_date, lab_type, location, capacity, description, square_feet, lab_seats, seating_capacity, in_charge_id } = labData;

        if (!name || !lab_type) {
            throw new Error('Lab Name and Department are required');
        }

        const lab = await Lab.findOne({
            where: { id: id, is_active: true }
        });

        if (!lab) {
            throw new Error('Lab not found');
        }

        const previousInChargeId = lab.in_charge_id;
        const parsedInChargeId = in_charge_id !== undefined ? (in_charge_id ? parseInt(in_charge_id) : null) : lab.in_charge_id;

        const updateFields = {
            name: name.trim(),
            lab_type,
            location: location !== undefined ? location : lab.location,
            capacity: capacity ? parseInt(capacity) : lab.capacity,
            description: description !== undefined ? description : lab.description,
            square_feet: square_feet !== undefined ? (square_feet ? parseInt(square_feet) : null) : lab.square_feet,
            in_charge_id: parsedInChargeId
        };

        if (established_date !== undefined) {
            updateFields.established_date = established_date || null;
        }

        const seatsInput = lab_seats !== undefined ? lab_seats : seating_capacity;
        if (seatsInput !== undefined && seatsInput !== null && seatsInput !== '') {
            const seats = parseInt(seatsInput);
            if (isNaN(seats) || seats < 1) {
                throw new Error('Seating Capacity must be at least 1');
            }
            updateFields.lab_seats = seats;
        }

        await lab.update(updateFields);

        // Notify new in-charge if assigned/changed
        if (parsedInChargeId && parsedInChargeId !== previousInChargeId) {
            try {
                await createNotification({
                    user_id: parsedInChargeId,
                    type: 'lab',
                    title: 'Assigned as Lab In-Charge',
                    message: `You have been assigned as the Lab In-Charge for "${name}".`,
                    metadata: {
                        lab_id: lab.id,
                        lab_name: name,
                        action: 'in_charge_assigned'
                    }
                });
            } catch (notifErr) {
                console.error('⚠️ Failed to notify lab in-charge:', notifErr.message);
            }
        }

        // Create update notification
        try {
            await createNotification({
                user_id: userId,
                type: 'lab',
                title: 'Lab Updated',
                message: `Lab "${name}" has been updated.`,
                metadata: {
                    lab_id: lab.id,
                    lab_name: name,
                    lab_type: lab_type,
                    location: location,
                    action: 'updated'
                }
            });
        } catch (notifError) {
            console.error('⚠️ Failed to create lab update notification:', notifError.message);
        }

        return await this.getLabById(lab.id);
    }

    /**
     * Direct assign/update in-charge for a lab
     */
    async assignInCharge(id, in_charge_id, userId) {
        const lab = await Lab.findOne({
            where: { id: id, is_active: true }
        });

        if (!lab) {
            throw new Error('Lab not found');
        }

        const parsedId = in_charge_id ? parseInt(in_charge_id) : null;
        const previousId = lab.in_charge_id;
        await lab.update({ in_charge_id: parsedId });

        // Notify new in-charge if assigned
        if (parsedId && parsedId !== previousId) {
            try {
                await createNotification({
                    user_id: parsedId,
                    type: 'lab',
                    title: 'Assigned as Lab In-Charge',
                    message: `You have been assigned as the Lab In-Charge for "${lab.name}".`,
                    metadata: {
                        lab_id: lab.id,
                        lab_name: lab.name,
                        action: 'in_charge_assigned'
                    }
                });
            } catch (notifErr) {
                console.error('⚠️ Failed to notify lab in-charge:', notifErr.message);
            }
        }

        return await this.getLabById(id);
    }

    /**
     * Delete lab (soft delete)
     */
    async deleteLab(id, userId) {
        const lab = await Lab.findOne({
            where: { id: id, is_active: true }
        });

        if (!lab) {
            throw new Error('Lab not found');
        }

        await lab.update({ is_active: false });

        // Create notification
        try {
            await createNotification({
                user_id: userId,
                type: 'lab',
                title: 'Lab Deleted',
                message: `Lab "${lab.name}" has been deleted.`,
                metadata: {
                    lab_id: lab.id,
                    lab_name: lab.name,
                    action: 'deleted'
                }
            });
        } catch (notifError) {
            console.error('⚠️ Failed to create lab deletion notification:', notifError.message);
        }

        return { message: 'Lab deleted successfully' };
    }
}

module.exports = new LabService();
