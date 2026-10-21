// Lab Service - Business Logic Layer
const { Lab, User, Role, Department, Equipment, Booking } = require('../models');
const { Op } = require('sequelize');
const { createNotification } = require('../utils/notificationService');
const auditService = require('./auditService');

const ROLE_MAP = { 1: 'Student', 2: 'Faculty', 3: 'Teacher', 4: 'Lab Assistant', 5: 'Lab Technician', 6: 'Admin' };

function formatLab(lab) {
    if (!lab) return null;
    const l = typeof lab.toJSON === 'function' ? lab.toJSON() : { ...lab };
    // Provide both lab_seats and seating_capacity alias
    l.seating_capacity = l.lab_seats;
    l.systems_available = l.systems_available !== undefined && l.systems_available !== null ? parseInt(l.systems_available) : 0;
    l.icon = l.icon || 'desktop';

    if (l.departmentDetails) {
        l.department_id = l.departmentDetails.departmentId;
        l.department = {
            id: l.departmentDetails.departmentId,
            departmentId: l.departmentDetails.departmentId,
            name: l.departmentDetails.departmentName,
            departmentName: l.departmentDetails.departmentName,
            code: l.departmentDetails.departmentAcr,
            departmentAcr: l.departmentDetails.departmentAcr
        };
    } else {
        l.department = {
            id: l.department_id || null,
            departmentId: l.department_id || null,
            name: l.lab_type ? l.lab_type.toUpperCase() : 'General',
            departmentName: l.lab_type ? l.lab_type.toUpperCase() : 'General',
            code: l.lab_type ? l.lab_type.toUpperCase() : 'GEN',
            departmentAcr: l.lab_type ? l.lab_type.toUpperCase() : 'GEN'
        };
    }

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
        const { page = 1, limit = 50, search, department_id, lab_type, in_charge_id } = filters;

        const whereClause = { is_active: true };

        if (department_id) {
            whereClause.department_id = parseInt(department_id);
        } else if (lab_type && lab_type !== 'all') {
            whereClause[Op.or] = [
                { lab_type: lab_type.toLowerCase() },
                { '$departmentDetails.departmentAcr$': lab_type.toUpperCase() }
            ];
        }

        if (in_charge_id && in_charge_id !== 'all') {
            if (in_charge_id === 'assigned') {
                whereClause.in_charge_id = { [Op.ne]: null };
            } else if (in_charge_id === 'unassigned') {
                whereClause.in_charge_id = null;
            } else {
                whereClause.in_charge_id = parseInt(in_charge_id);
            }
        }

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
                    model: Department,
                    as: 'departmentDetails',
                    attributes: ['departmentId', 'departmentName', 'departmentAcr'],
                    required: false
                },
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
                    model: Department,
                    as: 'departmentDetails',
                    attributes: ['departmentId', 'departmentName', 'departmentAcr'],
                    required: false
                },
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
            where: { status: 'Active' },
            attributes: ['id', 'userId', 'name', 'userName', 'email', 'userMail', 'phone', 'roleId', 'status', 'position'],
            include: [
                { model: Role, as: 'role', attributes: ['roleId', 'roleName'], required: false },
                { model: Department, as: 'department', attributes: ['departmentId', 'departmentName', 'departmentAcr'], required: false }
            ],
            order: [['userName', 'ASC']]
        });

        const staffRoles = ['teacher', 'faculty', 'lab technician', 'lab_technician', 'lab assistant', 'lab_assistant', 'admin', 'master_admin'];
        const staffRoleIds = [2, 3, 4, 5, 6, 7];

        const eligible = users.filter(u => {
            const rName = String(u.role?.roleName || u.getDataValue('role') || '').toLowerCase();
            const rId = u.roleId || u.role?.roleId;
            return staffRoles.includes(rName) || staffRoleIds.includes(rId);
        }).map(u => ({
            id: u.userId || u.id,
            userId: u.userId || u.id,
            name: u.userName || u.name || 'Unknown Staff',
            email: u.userMail || u.email || '',
            role: u.role?.roleName || 'Staff',
            department: u.department?.departmentName || u.department?.departmentAcr || 'General',
            position: u.position || '',
            phone: u.phone || ''
        }));

        return eligible;
    }

    /**
     * Create new lab
     */
    async createLab(labData, userId) {
        const {
            name,
            established_date,
            department_id,
            lab_type,
            location,
            capacity,
            description,
            square_feet,
            lab_seats,
            seating_capacity,
            systems_available,
            in_charge_id,
            icon
        } = labData;

        if (!name || (!department_id && !lab_type)) {
            throw new Error('Lab Name and Department are required');
        }

        // Resolve department
        let resolvedDeptId = department_id ? parseInt(department_id) : null;
        let resolvedLabType = lab_type ? String(lab_type).trim().toLowerCase() : 'cse';

        if (resolvedDeptId) {
            const dept = await Department.findByPk(resolvedDeptId);
            if (!dept) {
                throw new Error('Selected department does not exist');
            }
            resolvedLabType = dept.departmentAcr.toLowerCase();
        } else if (lab_type) {
            const dept = await Department.findOne({
                where: {
                    [Op.or]: [
                        { departmentAcr: lab_type.trim().toUpperCase() },
                        { departmentName: lab_type.trim() }
                    ]
                }
            });
            if (dept) {
                resolvedDeptId = dept.departmentId;
                resolvedLabType = dept.departmentAcr.toLowerCase();
            }
        }

        const seats = (lab_seats !== undefined && lab_seats !== null && lab_seats !== '')
            ? parseInt(lab_seats)
            : ((seating_capacity !== undefined && seating_capacity !== null && seating_capacity !== '')
                ? parseInt(seating_capacity)
                : (capacity ? parseInt(capacity) : null));

        if (!seats || isNaN(seats) || seats < 1) {
            throw new Error('Seating Capacity is required and must be at least 1');
        }

        const parsedSystems = systems_available !== undefined && systems_available !== null && systems_available !== ''
            ? parseInt(systems_available)
            : 0;

        if (isNaN(parsedSystems) || parsedSystems < 0) {
            throw new Error('Number of Systems Available cannot be negative');
        }

        if (established_date) {
            const d = new Date(established_date);
            if (isNaN(d.getTime())) {
                throw new Error('Established date is invalid');
            }
        }

        const parsedInChargeId = in_charge_id ? parseInt(in_charge_id) : null;

        // If in_charge_id provided, verify user is active
        if (parsedInChargeId) {
            const inChargeUser = await User.findByPk(parsedInChargeId);
            if (!inChargeUser) {
                throw new Error('Selected staff in-charge does not exist');
            }
            if (inChargeUser.status !== 'Active') {
                throw new Error('Cannot assign an inactive staff member as lab in-charge');
            }
        }

        const lab = await Lab.create({
            name: name.trim(),
            department_id: resolvedDeptId,
            lab_type: resolvedLabType,
            established_date: established_date || null,
            location: location || null,
            capacity: capacity ? parseInt(capacity) : seats,
            systems_available: parsedSystems,
            description: description || null,
            square_feet: square_feet ? parseInt(square_feet) : null,
            lab_seats: seats,
            icon: icon || 'desktop',
            in_charge_id: parsedInChargeId,
            created_by: userId
        });

        // Audit log
        await auditService.logEvent({
            entity_type: 'Lab',
            entity_id: lab.id,
            action: 'CREATE',
            new_values: lab.toJSON(),
            user_id: userId
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

        return await this.getLabById(lab.id);
    }

    /**
     * Update lab
     */
    async updateLab(id, labData, userId) {
        const {
            name,
            established_date,
            department_id,
            lab_type,
            location,
            capacity,
            description,
            square_feet,
            lab_seats,
            seating_capacity,
            systems_available,
            in_charge_id,
            icon
        } = labData;

        if (!name || (!department_id && !lab_type)) {
            throw new Error('Lab Name and Department are required');
        }

        const lab = await Lab.findOne({
            where: { id: id, is_active: true }
        });

        if (!lab) {
            throw new Error('Lab not found');
        }

        const prevValues = lab.toJSON();
        const previousInChargeId = lab.in_charge_id;
        const parsedInChargeId = in_charge_id !== undefined ? (in_charge_id ? parseInt(in_charge_id) : null) : lab.in_charge_id;

        if (parsedInChargeId && parsedInChargeId !== previousInChargeId) {
            const inChargeUser = await User.findByPk(parsedInChargeId);
            if (!inChargeUser) {
                throw new Error('Selected staff in-charge does not exist');
            }
            if (inChargeUser.status !== 'Active') {
                throw new Error('Cannot assign an inactive staff member as lab in-charge');
            }
        }

        let resolvedDeptId = department_id !== undefined ? (department_id ? parseInt(department_id) : null) : lab.department_id;
        let resolvedLabType = lab_type ? String(lab_type).trim().toLowerCase() : lab.lab_type;

        if (department_id) {
            const dept = await Department.findByPk(resolvedDeptId);
            if (dept) {
                resolvedLabType = dept.departmentAcr.toLowerCase();
            }
        }

        const updateFields = {
            name: name.trim(),
            department_id: resolvedDeptId,
            lab_type: resolvedLabType,
            location: location !== undefined ? location : lab.location,
            capacity: capacity ? parseInt(capacity) : lab.capacity,
            description: description !== undefined ? description : lab.description,
            square_feet: square_feet !== undefined ? (square_feet ? parseInt(square_feet) : null) : lab.square_feet,
            in_charge_id: parsedInChargeId,
            icon: icon !== undefined ? icon : (lab.icon || 'desktop')
        };

        if (systems_available !== undefined && systems_available !== null && systems_available !== '') {
            const sys = parseInt(systems_available);
            if (isNaN(sys) || sys < 0) {
                throw new Error('Number of Systems Available cannot be negative');
            }
            updateFields.systems_available = sys;
        }

        if (established_date !== undefined) {
            if (established_date) {
                const d = new Date(established_date);
                if (isNaN(d.getTime())) {
                    throw new Error('Established date is invalid');
                }
            }
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

        // Audit log
        await auditService.logEvent({
            entity_type: 'Lab',
            entity_id: lab.id,
            action: 'UPDATE',
            previous_values: prevValues,
            new_values: lab.toJSON(),
            user_id: userId
        });

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

        if (parsedId) {
            const inChargeUser = await User.findByPk(parsedId);
            if (!inChargeUser) {
                throw new Error('Selected staff in-charge does not exist');
            }
            if (inChargeUser.status !== 'Active') {
                throw new Error('Cannot assign an inactive staff member as lab in-charge');
            }
        }

        await lab.update({ in_charge_id: parsedId });

        // Audit log
        await auditService.logEvent({
            entity_type: 'Lab',
            entity_id: lab.id,
            action: 'UPDATE',
            previous_values: { in_charge_id: previousId },
            new_values: { in_charge_id: parsedId },
            user_id: userId,
            notes: `In-charge updated from ${previousId} to ${parsedId}`
        });

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
     * Delete lab (soft delete with relationship verification)
     */
    async deleteLab(id, userId) {
        const lab = await Lab.findOne({
            where: { id: id, is_active: true }
        });

        if (!lab) {
            throw new Error('Lab not found');
        }

        // Safety check 1: Active equipment assigned to this lab
        const equipmentCount = await Equipment.count({
            where: { 
                lab_id: id,
                status: { [Op.ne]: 'Retired' }
            }
        });
        if (equipmentCount > 0) {
            throw new Error(`Cannot delete lab "${lab.name}". It currently has ${equipmentCount} active equipment item(s) assigned.`);
        }

        // Safety check 2: Active or pending bookings
        const activeBookings = await Booking.count({
            where: { 
                lab_id: id,
                status: { [Op.in]: ['pending', 'confirmed', 'in_progress', 'approved'] }
            }
        });
        if (activeBookings > 0) {
            throw new Error(`Cannot delete lab "${lab.name}". It has ${activeBookings} active or pending booking(s).`);
        }

        const prevValues = lab.toJSON();
        await lab.update({ is_active: false });

        // Audit log
        await auditService.logEvent({
            entity_type: 'Lab',
            entity_id: lab.id,
            action: 'DELETE',
            previous_values: prevValues,
            new_values: { is_active: false },
            user_id: userId,
            notes: 'Soft deleted lab'
        });

        // Create notification
        try {
            await createNotification({
                user_id: userId,
                type: 'lab',
                title: 'Lab Deleted',
                message: `Lab "${lab.name}" has been deactivated.`,
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
