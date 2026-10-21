// Faculty Service - Dedicated Business Logic for Faculty Master
const { User, Role, Department, Lab } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const auditService = require('./auditService');

class FacultyService {
    /**
     * Get all faculty members with pagination, search, and department filtering
     */
    async getAllFaculty(filters = {}) {
        const { search, departmentId, status, page = 1, limit = 50 } = filters;

        // Faculty roles: 2 (Faculty) or 3 (Teacher)
        const whereClause = {
            roleId: { [Op.in]: [2, 3] }
        };

        if (status) {
            whereClause.status = status;
        }

        if (departmentId) {
            whereClause.departmentId = parseInt(departmentId);
        }

        if (search) {
            whereClause[Op.or] = [
                { userName: { [Op.like]: `%${search}%` } },
                { userMail: { [Op.like]: `%${search}%` } },
                { userNumber: { [Op.like]: `%${search}%` } },
                { position: { [Op.like]: `%${search}%` } },
                { phone: { [Op.like]: `%${search}%` } }
            ];
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { rows: facultyMembers, count: total } = await User.findAndCountAll({
            where: whereClause,
            attributes: { exclude: ['password', 'otp_code', 'resetOTP', 'resetPasswordToken'] },
            include: [
                {
                    model: Department,
                    as: 'department',
                    attributes: ['departmentId', 'departmentName', 'departmentAcr'],
                    required: false
                },
                {
                    model: Role,
                    as: 'role',
                    attributes: ['roleId', 'roleName'],
                    required: false
                },
                {
                    model: Lab,
                    as: 'inChargeLabs',
                    attributes: ['id', 'name', 'lab_type', 'location', 'is_active'],
                    where: { is_active: true },
                    required: false
                }
            ],
            order: [['userName', 'ASC']],
            limit: parseInt(limit),
            offset: offset
        });

        const formatted = facultyMembers.map(f => {
            const u = f.toJSON();
            return {
                facultyId: u.userId,
                userId: u.userId,
                id: u.userId,
                staffId: u.userNumber || `FAC-${u.userId}`,
                userNumber: u.userNumber || `FAC-${u.userId}`,
                name: u.userName,
                email: u.userMail,
                phone: u.phone || '',
                designation: u.position || 'Assistant Professor',
                position: u.position || 'Assistant Professor',
                departmentId: u.departmentId,
                departmentName: u.department?.departmentName || 'General',
                departmentAcr: u.department?.departmentAcr || '',
                department: u.department?.departmentName || 'General',
                status: u.status || 'Active',
                roleName: u.role?.roleName || 'Faculty',
                roleId: u.roleId,
                assignedLabs: u.inChargeLabs || [],
                createdAt: u.createdAt
            };
        });

        return {
            faculty: formatted,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        };
    }

    /**
     * Get faculty member by ID
     */
    async getFacultyById(id) {
        const faculty = await User.findOne({
            where: {
                userId: id,
                roleId: { [Op.in]: [2, 3] }
            },
            attributes: { exclude: ['password', 'otp_code', 'resetOTP', 'resetPasswordToken'] },
            include: [
                {
                    model: Department,
                    as: 'department',
                    attributes: ['departmentId', 'departmentName', 'departmentAcr']
                },
                {
                    model: Role,
                    as: 'role',
                    attributes: ['roleId', 'roleName']
                },
                {
                    model: Lab,
                    as: 'inChargeLabs',
                    attributes: ['id', 'name', 'lab_type', 'location']
                }
            ]
        });

        if (!faculty) {
            throw new Error('Faculty member not found');
        }

        const u = faculty.toJSON();
        return {
            facultyId: u.userId,
            userId: u.userId,
            id: u.userId,
            staffId: u.userNumber,
            userNumber: u.userNumber,
            name: u.userName,
            email: u.userMail,
            phone: u.phone,
            designation: u.position,
            departmentId: u.departmentId,
            departmentName: u.department?.departmentName,
            status: u.status,
            assignedLabs: u.inChargeLabs || []
        };
    }

    /**
     * Create faculty member
     */
    async createFaculty(data, actorId) {
        const {
            name,
            email,
            staffId,
            userNumber,
            phone,
            departmentId,
            designation,
            position,
            status = 'Active',
            password = 'Password@123',
            assignedLabId
        } = data;

        if (!name || !email) {
            throw new Error('Faculty name and email are required');
        }

        // Validate duplicate email
        const existingEmail = await User.findOne({
            where: {
                [Op.or]: [
                    { userMail: email.trim().toLowerCase() },
                    { email: email.trim().toLowerCase() }
                ]
            }
        });

        if (existingEmail) {
            throw new Error(`Email "${email}" is already registered`);
        }

        // Generate or validate staff ID
        const finalStaffId = (staffId || userNumber || `FAC${Date.now().toString().slice(-6)}`).trim();
        const existingStaffId = await User.findOne({
            where: { userNumber: finalStaffId }
        });

        if (existingStaffId) {
            throw new Error(`Faculty / Staff ID "${finalStaffId}" is already assigned to another user`);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const newFaculty = await User.create({
            userName: name.trim(),
            name: name.trim(),
            userMail: email.trim().toLowerCase(),
            email: email.trim().toLowerCase(),
            userNumber: finalStaffId,
            phone: phone ? phone.trim() : null,
            departmentId: departmentId ? parseInt(departmentId) : null,
            position: (designation || position || 'Assistant Professor').trim(),
            roleId: 2, // Faculty
            role: 'faculty',
            password: hashedPassword,
            status: status || 'Active',
            createdBy: actorId,
            is_active: status === 'Active'
        });

        // Synchronize legacy id = userId
        await newFaculty.update({ id: newFaculty.userId });

        // If lab in-charge assignment requested
        if (assignedLabId) {
            await Lab.update(
                { in_charge_id: newFaculty.userId },
                { where: { id: parseInt(assignedLabId) } }
            );
        }

        // Audit log
        await auditService.logEvent({
            entity_type: 'Faculty',
            entity_id: newFaculty.userId,
            action: 'CREATE',
            new_values: {
                userId: newFaculty.userId,
                name: newFaculty.userName,
                email: newFaculty.userMail,
                staffId: newFaculty.userNumber,
                departmentId: newFaculty.departmentId
            },
            user_id: actorId
        });

        return this.getFacultyById(newFaculty.userId);
    }

    /**
     * Update faculty member
     */
    async updateFaculty(id, data, actorId) {
        const faculty = await User.findOne({
            where: {
                userId: id,
                roleId: { [Op.in]: [2, 3] }
            }
        });

        if (!faculty) {
            throw new Error('Faculty member not found');
        }

        const {
            name,
            email,
            staffId,
            userNumber,
            phone,
            departmentId,
            designation,
            position,
            status,
            password,
            assignedLabId
        } = data;

        // Check duplicate email if changed
        if (email && email.trim().toLowerCase() !== (faculty.userMail || '').toLowerCase()) {
            const existingEmail = await User.findOne({
                where: {
                    userMail: email.trim().toLowerCase(),
                    userId: { [Op.ne]: id }
                }
            });
            if (existingEmail) {
                throw new Error(`Email "${email}" is already used by another user`);
            }
        }

        // Check duplicate staffId if changed
        const finalStaffId = staffId || userNumber;
        if (finalStaffId && finalStaffId.trim() !== faculty.userNumber) {
            const existingId = await User.findOne({
                where: {
                    userNumber: finalStaffId.trim(),
                    userId: { [Op.ne]: id }
                }
            });
            if (existingId) {
                throw new Error(`Staff ID "${finalStaffId}" is already assigned to another user`);
            }
        }

        const updateFields = {
            updatedBy: actorId
        };

        if (name) {
            updateFields.userName = name.trim();
            updateFields.name = name.trim();
        }
        if (email) {
            updateFields.userMail = email.trim().toLowerCase();
            updateFields.email = email.trim().toLowerCase();
        }
        if (finalStaffId) {
            updateFields.userNumber = finalStaffId.trim();
        }
        if (phone !== undefined) {
            updateFields.phone = phone ? phone.trim() : null;
        }
        if (departmentId !== undefined) {
            updateFields.departmentId = departmentId ? parseInt(departmentId) : null;
        }
        if (designation || position) {
            updateFields.position = (designation || position).trim();
        }
        if (status) {
            updateFields.status = status;
            updateFields.is_active = status === 'Active';
        }
        if (password) {
            updateFields.password = await bcrypt.hash(password, 10);
        }

        await faculty.update(updateFields);

        // Lab in-charge assignment
        if (assignedLabId !== undefined) {
            if (assignedLabId) {
                await Lab.update(
                    { in_charge_id: faculty.userId },
                    { where: { id: parseInt(assignedLabId) } }
                );
            } else {
                // Remove in-charge from labs currently assigned to this faculty
                await Lab.update(
                    { in_charge_id: null },
                    { where: { in_charge_id: faculty.userId } }
                );
            }
        }

        // Audit log
        await auditService.logEvent({
            entity_type: 'Faculty',
            entity_id: id,
            action: 'UPDATE',
            new_values: updateFields,
            user_id: actorId
        });

        return this.getFacultyById(id);
    }

    /**
     * Deactivate / delete faculty member
     */
    async deleteFaculty(id, actorId) {
        const faculty = await User.findOne({
            where: {
                userId: id,
                roleId: { [Op.in]: [2, 3] }
            }
        });

        if (!faculty) {
            throw new Error('Faculty member not found');
        }

        // Reassign or unbind any in-charge labs safely
        await Lab.update(
            { in_charge_id: null },
            { where: { in_charge_id: id } }
        );

        // Soft deactivation (preferred for data preservation)
        await faculty.update({
            status: 'Inactive',
            is_active: false,
            updatedBy: actorId
        });

        await auditService.logEvent({
            entity_type: 'Faculty',
            entity_id: id,
            action: 'DEACTIVATE',
            user_id: actorId
        });

        return { success: true, message: `Faculty member "${faculty.userName}" deactivated safely.` };
    }

    /**
     * Get faculty statistics
     */
    async getFacultyStats() {
        const total = await User.count({ where: { roleId: { [Op.in]: [2, 3] } } });
        const active = await User.count({ where: { roleId: { [Op.in]: [2, 3] }, status: 'Active' } });
        const inactive = await User.count({ where: { roleId: { [Op.in]: [2, 3] }, status: 'Inactive' } });

        // Count faculty with lab in-charge responsibilities
        const inChargeCount = await Lab.count({
            where: {
                in_charge_id: { [Op.ne]: null },
                is_active: true
            },
            distinct: true,
            col: 'in_charge_id'
        });

        return {
            total,
            active,
            inactive,
            inChargeCount
        };
    }
}

module.exports = new FacultyService();
