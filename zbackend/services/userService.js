// User Service - Business Logic Layer
const { User, Role, Department, Lab, Booking, Incident, Maintenance, Order, Report } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const auditService = require('./auditService');

const ROLE_MAP = { 1: 'student', 2: 'faculty', 3: 'teacher', 4: 'lab_assistant', 5: 'lab_technician', 6: 'admin' };
const ROLE_TO_ID = { student: 1, faculty: 2, teacher: 3, lab_assistant: 4, lab_technician: 5, admin: 6 };

class UserService {
    async getAllUsers() {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            include: [
                { model: Role, as: 'role', attributes: ['roleId', 'roleName'] },
                { model: Department, as: 'department', attributes: ['departmentId', 'departmentName', 'departmentAcr'] },
                { 
                    model: Lab, 
                    as: 'inChargeLabs', 
                    attributes: ['id', 'name', 'lab_type', 'location', 'is_active'], 
                    where: { is_active: true }, 
                    required: false 
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        return users.map(user => {
            const u = user.toJSON();
            return {
                ...u,
                id: u.userId,
                userId: u.userId,
                staffId: u.userNumber,
                userNumber: u.userNumber,
                name: u.userName,
                email: u.userMail,
                phone: u.phone || '',
                position: u.position || '',
                designation: u.position || '',
                role: u.role ? u.role.roleName.toLowerCase() : (ROLE_MAP[u.roleId] || 'student'),
                roleId: u.roleId,
                departmentId: u.departmentId,
                department: u.department?.departmentName || u.department?.departmentAcr || 'General',
                departmentAcr: u.department?.departmentAcr || '',
                status: u.status,
                assignedLabs: u.inChargeLabs || []
            };
        });
    }

    async getStats() {
        const [totalUsers, activeUsers, students, teachers, admins, labTechnicians, labAssistants] = await Promise.all([
            User.count(),
            User.count({ where: { status: 'Active' } }),
            User.count({ where: { roleId: 1 } }),
            User.count({ where: { roleId: 3 } }),
            User.count({ where: { roleId: 6 } }),
            User.count({ where: { roleId: 5 } }),
            User.count({ where: { roleId: 4 } })
        ]);

        return {
            total: totalUsers,
            active: activeUsers,
            students,
            teachers,
            admins,
            lab_technicians: labTechnicians,
            lab_assistants: labAssistants
        };
    }

    async createUser(userData, actorId = null) {
        const { name, email, role, password, student_id, userNumber, staffId, phone, position, designation, departmentId } = userData;

        if (!name || !email || !password) {
            throw new Error('Missing required fields: name, email, and password are required');
        }

        const existingUser = await User.findOne({ where: { userMail: email.trim().toLowerCase() } });
        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        const finalUserNumber = (staffId || userNumber || student_id || `STF${Date.now()}${Math.floor(Math.random() * 1000)}`).trim();
        const existingNumber = await User.findOne({ where: { userNumber: finalUserNumber } });
        if (existingNumber) {
            throw new Error(`Staff ID / User Number "${finalUserNumber}" is already registered`);
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const roleIdVal = ROLE_TO_ID[role?.toLowerCase()] || (userData.roleId ? parseInt(userData.roleId) : 1);

        const user = await User.create({
            userName: name.trim(),
            userMail: email.trim().toLowerCase(),
            roleId: roleIdVal,
            password: hashedPassword,
            userNumber: finalUserNumber,
            phone: phone ? phone.trim() : null,
            position: (designation || position || '').trim() || null,
            departmentId: departmentId ? parseInt(departmentId) : null,
            status: 'Active',
            createdBy: actorId
        });

        // Audit log
        await auditService.logEvent({
            entity_type: 'User',
            entity_id: user.userId,
            action: 'CREATE',
            new_values: {
                userId: user.userId,
                userName: user.userName,
                userMail: user.userMail,
                roleId: user.roleId,
                departmentId: user.departmentId,
                userNumber: user.userNumber
            },
            user_id: actorId
        });

        // Return user without password
        const { password: _, ...userWithoutPassword } = user.dataValues;
        return userWithoutPassword;
    }

    async getUserById(id) {
        const user = await User.findByPk(id, {
            attributes: { exclude: ['password'] },
            include: [
                { model: Role, as: 'role', attributes: ['roleId', 'roleName'] },
                { model: Department, as: 'department', attributes: ['departmentId', 'departmentName', 'departmentAcr'] },
                { 
                    model: Lab, 
                    as: 'inChargeLabs', 
                    attributes: ['id', 'name', 'lab_type', 'location', 'is_active'], 
                    where: { is_active: true }, 
                    required: false 
                }
            ]
        });

        if (!user) {
            throw new Error('User not found');
        }

        const u = user.toJSON();
        return {
            ...u,
            id: u.userId,
            userId: u.userId,
            staffId: u.userNumber,
            assignedLabs: u.inChargeLabs || []
        };
    }

    async updateUser(id, updateData, actorId = null) {
        console.log('✏️ UserService.updateUser - User ID:', id);
        
        const user = await User.findByPk(id);

        if (!user) {
            throw new Error('User not found');
        }

        const prevValues = {
            userName: user.userName,
            userMail: user.userMail,
            roleId: user.roleId,
            departmentId: user.departmentId,
            userNumber: user.userNumber,
            status: user.status
        };

        const mappedData = {};
        if (updateData.name !== undefined) mappedData.userName = updateData.name.trim();
        if (updateData.userName !== undefined) mappedData.userName = updateData.userName.trim();

        if (updateData.email !== undefined || updateData.userMail !== undefined) {
            const newEmail = (updateData.email || updateData.userMail).trim().toLowerCase();
            if (newEmail !== user.userMail) {
                const existingEmail = await User.findOne({
                    where: { userMail: newEmail, userId: { [Op.ne]: id } }
                });
                if (existingEmail) {
                    throw new Error('Email address already in use by another user');
                }
                mappedData.userMail = newEmail;
            }
        }

        const newStaffId = updateData.staffId || updateData.userNumber;
        if (newStaffId && newStaffId.trim() !== user.userNumber) {
            const existingId = await User.findOne({
                where: { userNumber: newStaffId.trim(), userId: { [Op.ne]: id } }
            });
            if (existingId) {
                throw new Error(`Staff ID / User Number "${newStaffId}" is already assigned to another user`);
            }
            mappedData.userNumber = newStaffId.trim();
        }

        if (updateData.phone !== undefined) mappedData.phone = updateData.phone ? updateData.phone.trim() : null;
        if (updateData.position !== undefined || updateData.designation !== undefined) {
            mappedData.position = (updateData.position || updateData.designation || '').trim() || null;
        }

        if (updateData.status !== undefined) mappedData.status = updateData.status;
        if (updateData.roleId !== undefined) mappedData.roleId = parseInt(updateData.roleId);
        if (updateData.role !== undefined) mappedData.roleId = ROLE_TO_ID[updateData.role?.toLowerCase()] || mappedData.roleId;
        if (updateData.departmentId !== undefined) mappedData.departmentId = updateData.departmentId ? parseInt(updateData.departmentId) : null;
        
        if (updateData.password) {
            mappedData.password = await bcrypt.hash(updateData.password, 10);
        }

        mappedData.updatedBy = actorId;
        await user.update(mappedData);

        // Audit log
        await auditService.logEvent({
            entity_type: 'User',
            entity_id: user.userId,
            action: 'UPDATE',
            previous_values: prevValues,
            new_values: {
                userName: user.userName,
                userMail: user.userMail,
                roleId: user.roleId,
                departmentId: user.departmentId,
                userNumber: user.userNumber,
                status: user.status
            },
            user_id: actorId
        });
        
        const { password: _, ...userWithoutPassword } = user.dataValues;
        return userWithoutPassword;
    }

    async deleteUser(id, actorId = null) {
        const user = await User.findByPk(id);

        if (!user) {
            throw new Error('User not found');
        }

        // Safety check: Prevent deleting user if currently assigned as in-charge of any active lab
        const assignedLabsCount = await Lab.count({
            where: { in_charge_id: id, is_active: true }
        });
        if (assignedLabsCount > 0) {
            throw new Error(`Cannot delete staff member "${user.userName}". They are currently assigned as in-charge for ${assignedLabsCount} active lab(s). Please reassign the lab in-charge first or deactivate the account.`);
        }

        const prevValues = {
            userId: user.userId,
            userName: user.userName,
            userMail: user.userMail,
            roleId: user.roleId
        };

        try {
            await user.destroy();

            // Audit log
            await auditService.logEvent({
                entity_type: 'User',
                entity_id: id,
                action: 'DELETE',
                previous_values: prevValues,
                user_id: actorId
            });

            return { message: 'User deleted permanently', deletedUser: { id: user.userId, name: user.userName, email: user.userMail } };
        } catch (error) {
            console.error('💥 Error during user deletion:', error);
            throw new Error('Cannot delete user due to database constraints. User may have related bookings, reports, or logs. Please deactivate the user instead.');
        }
    }

    async activateUser(id, actorId = null) {
        const user = await User.findByPk(id);

        if (!user) {
            throw new Error('User not found');
        }

        await user.update({ status: 'Active', updatedBy: actorId });

        // Audit log
        await auditService.logEvent({
            entity_type: 'User',
            entity_id: user.userId,
            action: 'UPDATE',
            previous_values: { status: 'Inactive' },
            new_values: { status: 'Active' },
            user_id: actorId,
            notes: 'User account activated'
        });
        
        const { password: _, ...userWithoutPassword } = user.dataValues;
        return userWithoutPassword;
    }

    async deactivateUser(id, actorId = null) {
        const user = await User.findByPk(id);

        if (!user) {
            throw new Error('User not found');
        }

        await user.update({ status: 'Inactive', updatedBy: actorId });

        // Audit log
        await auditService.logEvent({
            entity_type: 'User',
            entity_id: user.userId,
            action: 'UPDATE',
            previous_values: { status: 'Active' },
            new_values: { status: 'Inactive' },
            user_id: actorId,
            notes: 'User account deactivated'
        });
        
        const { password: _, ...userWithoutPassword } = user.dataValues;
        return userWithoutPassword;
    }

    async searchUsers(searchTerm) {
        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { userName: { [Op.like]: `%${searchTerm}%` } },
                    { userMail: { [Op.like]: `%${searchTerm}%` } },
                    { userNumber: { [Op.like]: `%${searchTerm}%` } }
                ]
            },
            attributes: { exclude: ['password'] },
            order: [['createdAt', 'DESC']]
        });

        return users;
    }
}

module.exports = new UserService();
