// equipmentCategoryService.js - Business Logic for Equipment Category Master
const { EquipmentCategory, Equipment, Lab, sequelize } = require('../models');
const { Op } = require('sequelize');

class EquipmentCategoryService {
    /**
     * Get all equipment categories with counts and search filters
     */
    async getAllCategories(filters = {}) {
        const { search, status = 'all' } = filters;
        const whereClause = {};

        if (status === 'active') {
            whereClause.is_active = true;
        } else if (status === 'inactive') {
            whereClause.is_active = false;
        }

        if (search && search.trim()) {
            const query = search.trim();
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${query}%` } },
                { code: { [Op.like]: `%${query}%` } },
                { description: { [Op.like]: `%${query}%` } }
            ];
        }

        const categories = await EquipmentCategory.findAll({
            where: whereClause,
            order: [['name', 'ASC']]
        });

        // Compute equipment counts per category
        const counts = await Equipment.findAll({
            attributes: ['category', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            group: ['category'],
            raw: true
        });

        const countMap = counts.reduce((acc, curr) => {
            if (curr.category) {
                acc[curr.category] = parseInt(curr.count, 10);
            }
            return acc;
        }, {});

        return categories.map(cat => {
            const json = cat.toJSON();
            return {
                ...json,
                equipment_count: countMap[json.code] || 0
            };
        });
    }

    /**
     * Get category statistics
     */
    async getStats() {
        const totalCategories = await EquipmentCategory.count();
        const activeCategories = await EquipmentCategory.count({ where: { is_active: true } });
        const totalEquipment = await Equipment.count();

        // Top category
        const topCounts = await Equipment.findAll({
            attributes: ['category', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            group: ['category'],
            order: [[sequelize.literal('count'), 'DESC']],
            limit: 1,
            raw: true
        });

        let topCategoryName = 'None';
        if (topCounts.length > 0 && topCounts[0].category) {
            const topCat = await EquipmentCategory.findOne({ where: { code: topCounts[0].category } });
            topCategoryName = topCat ? `${topCat.name} (${topCounts[0].count})` : `${topCounts[0].category} (${topCounts[0].count})`;
        }

        return {
            totalCategories,
            activeCategories,
            inactiveCategories: totalCategories - activeCategories,
            totalEquipment,
            topCategory: topCategoryName
        };
    }

    /**
     * Get single category by ID with associated equipment list
     */
    async getCategoryById(id) {
        const category = await EquipmentCategory.findByPk(id);
        if (!category) {
            throw new Error('Equipment category not found');
        }

        // Fetch linked equipment preview
        const equipment = await Equipment.findAll({
            where: { category: category.code },
            attributes: ['id', 'name', 'serial_number', 'model', 'manufacturer', 'status', 'condition_status', 'lab_id'],
            include: [
                {
                    model: Lab,
                    as: 'lab',
                    attributes: ['id', 'name', 'lab_type', 'location']
                }
            ],
            order: [['name', 'ASC']],
            limit: 100
        });

        const totalLinked = await Equipment.count({ where: { category: category.code } });

        return {
            ...category.toJSON(),
            equipment_count: totalLinked,
            equipment
        };
    }

    /**
     * Helper to generate a clean code slug
     */
    generateCode(name) {
        return name
            .toLowerCase()
            .trim()
            .replace(/[^a-z0-9]+/g, '_')
            .replace(/^_+|_+$/g, '');
    }

    /**
     * Create new equipment category
     */
    async createCategory(categoryData, userId) {
        const { name, code, description, icon = 'box', color = 'blue', is_active = true } = categoryData;

        if (!name || !name.trim()) {
            throw new Error('Category name is required');
        }

        const trimmedName = name.trim();
        const categoryCode = code && code.trim() ? this.generateCode(code) : this.generateCode(trimmedName);

        if (!categoryCode) {
            throw new Error('Category code could not be determined. Please provide a valid alphanumeric name or code.');
        }

        // Check if name or code already exists
        const existing = await EquipmentCategory.findOne({
            where: {
                [Op.or]: [
                    { name: trimmedName },
                    { code: categoryCode }
                ]
            }
        });

        if (existing) {
            if (existing.name.toLowerCase() === trimmedName.toLowerCase()) {
                throw new Error(`Category with name "${trimmedName}" already exists`);
            }
            if (existing.code.toLowerCase() === categoryCode.toLowerCase()) {
                throw new Error(`Category code "${categoryCode}" is already in use by "${existing.name}"`);
            }
        }

        const category = await EquipmentCategory.create({
            name: trimmedName,
            code: categoryCode,
            description: description ? description.trim() : null,
            icon: icon || 'box',
            color: color || 'blue',
            is_active: is_active !== undefined ? Boolean(is_active) : true,
            created_by: userId || null
        });

        return {
            ...category.toJSON(),
            equipment_count: 0
        };
    }

    /**
     * Update equipment category
     */
    async updateCategory(id, categoryData, userId) {
        const category = await EquipmentCategory.findByPk(id);
        if (!category) {
            throw new Error('Equipment category not found');
        }

        const { name, code, description, icon, color, is_active } = categoryData;
        const updateFields = {};

        if (name !== undefined) {
            const trimmedName = name.trim();
            if (!trimmedName) throw new Error('Category name cannot be empty');
            
            // Check uniqueness
            const nameExists = await EquipmentCategory.findOne({
                where: {
                    name: trimmedName,
                    id: { [Op.ne]: id }
                }
            });
            if (nameExists) throw new Error(`Category with name "${trimmedName}" already exists`);
            updateFields.name = trimmedName;
        }

        const oldCode = category.code;
        let newCode = oldCode;

        if (code !== undefined) {
            newCode = this.generateCode(code);
            if (!newCode) throw new Error('Invalid category code');

            const codeExists = await EquipmentCategory.findOne({
                where: {
                    code: newCode,
                    id: { [Op.ne]: id }
                }
            });
            if (codeExists) throw new Error(`Category code "${newCode}" is already in use by "${codeExists.name}"`);
            updateFields.code = newCode;
        }

        if (description !== undefined) {
            updateFields.description = description ? description.trim() : null;
        }
        if (icon !== undefined) updateFields.icon = icon || 'box';
        if (color !== undefined) updateFields.color = color || 'blue';
        if (is_active !== undefined) updateFields.is_active = Boolean(is_active);

        await category.update(updateFields);

        // If code changed, cascade update to equipment table
        if (newCode !== oldCode) {
            await Equipment.update(
                { category: newCode },
                { where: { category: oldCode } }
            );
        }

        return await this.getCategoryById(id);
    }

    /**
     * Delete equipment category
     */
    async deleteCategory(id, force = false) {
        const category = await EquipmentCategory.findByPk(id);
        if (!category) {
            throw new Error('Equipment category not found');
        }

        const linkedEquipmentCount = await Equipment.count({
            where: { category: category.code }
        });

        if (linkedEquipmentCount > 0 && !force) {
            throw new Error(
                `Cannot delete "${category.name}" because it is currently assigned to ${linkedEquipmentCount} equipment item(s). Please reassign or remove the equipment first, or deactivate the category.`
            );
        }

        // If force delete is explicitly requested, reassign equipment to 'other'
        if (linkedEquipmentCount > 0 && force) {
            await Equipment.update(
                { category: 'other' },
                { where: { category: category.code } }
            );
        }

        await category.destroy();
        return {
            success: true,
            message: `Category "${category.name}" was successfully deleted.`
        };
    }
}

module.exports = new EquipmentCategoryService();
