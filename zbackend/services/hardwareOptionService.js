// Hardware Option Service - Business Logic for Dynamic Hardware Configuration
const { HardwareOption } = require('../models');
const { Op } = require('sequelize');

class HardwareOptionService {
    /**
     * Get all hardware options grouped by field_type or flat list
     */
    async getAllOptions(filters = {}) {
        const { field_type, is_active, search } = filters;
        const whereClause = {};

        if (field_type) {
            whereClause.field_type = field_type;
        }

        if (is_active !== undefined) {
            whereClause.is_active = is_active === 'true' || is_active === true || is_active === 1;
        }

        if (search) {
            whereClause[Op.or] = [
                { option_label: { [Op.like]: `%${search}%` } },
                { option_value: { [Op.like]: `%${search}%` } },
                { field_type: { [Op.like]: `%${search}%` } }
            ];
        }

        const options = await HardwareOption.findAll({
            where: whereClause,
            order: [['field_type', 'ASC'], ['sort_order', 'ASC'], ['option_label', 'ASC']]
        });

        // Also group by field_type for direct dropdown consumption
        const grouped = {};
        for (const opt of options) {
            if (!grouped[opt.field_type]) {
                grouped[opt.field_type] = [];
            }
            grouped[opt.field_type].push(opt);
        }

        return {
            options,
            grouped,
            total: options.length
        };
    }

    /**
     * Get options by specific field type (active only by default)
     */
    async getByFieldType(fieldType, activeOnly = true) {
        const whereClause = { field_type: fieldType };
        if (activeOnly) {
            whereClause.is_active = true;
        }

        return HardwareOption.findAll({
            where: whereClause,
            order: [['sort_order', 'ASC'], ['option_label', 'ASC']]
        });
    }

    /**
     * Create a new hardware option
     */
    async createOption(data, userId) {
        const { field_type, option_label, option_value, equipment_type = 'computer', sort_order = 0 } = data;

        if (!field_type || !option_label || !option_value) {
            throw new Error('Field type, label, and value are required');
        }

        const existing = await HardwareOption.findOne({
            where: {
                field_type,
                option_value: option_value.trim()
            }
        });

        if (existing) {
            throw new Error(`Option "${option_value}" already exists for ${field_type}`);
        }

        const option = await HardwareOption.create({
            field_type: field_type.trim(),
            option_label: option_label.trim(),
            option_value: option_value.trim(),
            equipment_type: equipment_type || 'computer',
            sort_order: parseInt(sort_order) || 0,
            is_active: true,
            created_by: userId
        });

        return option;
    }

    /**
     * Update hardware option
     */
    async updateOption(id, data) {
        const option = await HardwareOption.findByPk(id);
        if (!option) {
            throw new Error('Hardware option not found');
        }

        const { option_label, option_value, equipment_type, sort_order, is_active } = data;

        if (option_value && option_value.trim() !== option.option_value) {
            const existing = await HardwareOption.findOne({
                where: {
                    field_type: option.field_type,
                    option_value: option_value.trim(),
                    id: { [Op.ne]: id }
                }
            });

            if (existing) {
                throw new Error(`Option "${option_value}" already exists for ${option.field_type}`);
            }
        }

        await option.update({
            ...(option_label && { option_label: option_label.trim() }),
            ...(option_value && { option_value: option_value.trim() }),
            ...(equipment_type && { equipment_type }),
            ...(sort_order !== undefined && { sort_order: parseInt(sort_order) }),
            ...(is_active !== undefined && { is_active: Boolean(is_active) })
        });

        return option;
    }

    /**
     * Delete hardware option
     */
    async deleteOption(id) {
        const option = await HardwareOption.findByPk(id);
        if (!option) {
            throw new Error('Hardware option not found');
        }

        await option.destroy();
        return { message: 'Hardware option deleted successfully' };
    }
}

module.exports = new HardwareOptionService();
