// Department Service - Business Logic for Department Management
const { Department, User, Lab } = require('../models');
const { Op } = require('sequelize');
const auditService = require('./auditService');

class DepartmentService {
    /**
     * Get all departments
     */
    async getAllDepartments(filters = {}) {
        const { status, companyId, search, page = 1, limit = 50 } = filters;

        const whereClause = {};

        if (status) {
            whereClause.status = status;
        }

        if (companyId !== undefined) {
            whereClause.companyId = companyId;
        }

        if (search) {
            whereClause[Op.or] = [
                { departmentName: { [Op.like]: `%${search}%` } },
                { departmentAcr: { [Op.like]: `%${search}%` } }
            ];
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const { rows: departments, count: total } = await Department.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['userId', 'name', 'email', 'userName', 'userMail'],
                    required: false
                },
                {
                    model: User,
                    as: 'updater',
                    attributes: ['userId', 'name', 'email', 'userName', 'userMail'],
                    required: false
                }
            ],
            order: [['departmentName', 'ASC']],
            limit: parseInt(limit),
            offset: offset
        });

        return {
            departments,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        };
    }

    /**
     * Get department by ID
     */
    async getDepartmentById(departmentId) {
        const department = await Department.findByPk(departmentId, {
            include: [
                {
                    model: User,
                    as: 'users',
                    attributes: ['userId', 'name', 'userName', 'email', 'userMail', 'roleId', 'position', 'status'],
                    limit: 20,
                    order: [['createdAt', 'DESC']]
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['userId', 'name', 'email', 'userName', 'userMail'],
                    required: false
                },
                {
                    model: User,
                    as: 'updater',
                    attributes: ['userId', 'name', 'email', 'userName', 'userMail'],
                    required: false
                }
            ]
        });

        if (!department) {
            throw new Error('Department not found');
        }

        return department;
    }

    /**
     * Create new department
     */
    async createDepartment(departmentData, userId) {
        const { departmentName, departmentAcr, description, status = 'Active', companyId = 0 } = departmentData;

        // Check if department already exists for this company
        const existingDepartment = await Department.findOne({
            where: { 
                companyId,
                [Op.or]: [
                    { departmentName },
                    { departmentAcr }
                ]
            }
        });

        if (existingDepartment) {
            throw new Error('Department name or abbreviation already exists for this company');
        }

        const department = await Department.create({
            departmentName,
            departmentAcr: departmentAcr.trim().toUpperCase(),
            description: description ? description.trim() : null,
            status,
            companyId,
            createdBy: userId,
            updatedBy: userId
        });

        // Audit log
        await auditService.logEvent({
            entity_type: 'Department',
            entity_id: department.departmentId,
            action: 'CREATE',
            new_values: department.toJSON(),
            user_id: userId
        });

        return department;
    }

    /**
     * Update department
     */
    async updateDepartment(departmentId, departmentData, userId) {
        const department = await Department.findByPk(departmentId);

        if (!department) {
            throw new Error('Department not found');
        }

        const previousValues = department.toJSON();
        const { departmentName, departmentAcr, description, status } = departmentData;

        // Check if new department name/acr already exists (if changing)
        if (departmentName || departmentAcr) {
            const checkConditions = [];
            if (departmentName && departmentName !== department.departmentName) {
                checkConditions.push({ departmentName });
            }
            if (departmentAcr && departmentAcr !== department.departmentAcr) {
                checkConditions.push({ departmentAcr: departmentAcr.trim().toUpperCase() });
            }

            if (checkConditions.length > 0) {
                const existingDepartment = await Department.findOne({
                    where: {
                        companyId: department.companyId,
                        departmentId: { [Op.ne]: departmentId },
                        [Op.or]: checkConditions
                    }
                });

                if (existingDepartment) {
                    throw new Error('Department name or abbreviation already exists for this company');
                }
            }
        }

        await department.update({
            ...(departmentName && { departmentName }),
            ...(departmentAcr && { departmentAcr: departmentAcr.trim().toUpperCase() }),
            ...(description !== undefined && { description: description ? description.trim() : null }),
            ...(status && { status }),
            updatedBy: userId
        });

        // Audit log
        await auditService.logEvent({
            entity_type: 'Department',
            entity_id: department.departmentId,
            action: 'UPDATE',
            previous_values: previousValues,
            new_values: department.toJSON(),
            user_id: userId
        });

        return department;
    }

    /**
     * Delete department (soft delete / safe delete)
     */
    async deleteDepartment(departmentId, userId = null) {
        const department = await Department.findByPk(departmentId);

        if (!department) {
            throw new Error('Department not found');
        }

        // Check if department is assigned to any users
        const usersCount = await User.count({
            where: { departmentId }
        });

        if (usersCount > 0) {
            throw new Error(`Cannot delete department "${department.departmentName}". It has ${usersCount} staff/user(s) assigned.`);
        }

        // Check if department is associated with any labs
        const labCount = await Lab.count({
            where: {
                [Op.or]: [
                    { department_id: departmentId },
                    { lab_type: department.departmentAcr.toLowerCase() }
                ]
            }
        });

        if (labCount > 0) {
            throw new Error(`Cannot delete department "${department.departmentName}". It has ${labCount} lab(s) associated with it.`);
        }

        const prevValues = department.toJSON();
        await department.destroy();

        // Audit log
        await auditService.logEvent({
            entity_type: 'Department',
            entity_id: departmentId,
            action: 'DELETE',
            previous_values: prevValues,
            user_id: userId
        });

        return { message: 'Department deleted successfully' };
    }

    /**
     * Get department statistics
     */
    async getDepartmentStats(companyId = 0) {
        const whereClause = { companyId };

        const totalDepartments = await Department.count({ where: whereClause });
        const activeDepartments = await Department.count({ 
            where: { ...whereClause, status: 'Active' } 
        });
        const inactiveDepartments = await Department.count({ 
            where: { ...whereClause, status: 'Inactive' } 
        });
        const archivedDepartments = await Department.count({ 
            where: { ...whereClause, status: 'Archived' } 
        });

        // Get user count per department using users.userId
        const departmentsWithUserCount = await Department.findAll({
            where: whereClause,
            attributes: [
                'departmentId',
                'departmentName',
                'departmentAcr',
                [require('../config/database').sequelize.fn('COUNT', require('../config/database').sequelize.col('users.userId')), 'userCount']
            ],
            include: [{
                model: User,
                as: 'users',
                attributes: [],
                required: false
            }],
            group: ['Department.departmentId', 'Department.departmentName', 'Department.departmentAcr']
        });

        return {
            total: totalDepartments,
            active: activeDepartments,
            inactive: inactiveDepartments,
            archived: archivedDepartments,
            userDistribution: departmentsWithUserCount
        };
    }
}

module.exports = new DepartmentService();
