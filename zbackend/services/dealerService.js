// dealerService.js - Business Logic for Dealer Master
const { Dealer, Equipment, Lab, sequelize } = require('../models');
const { Op } = require('sequelize');

class DealerService {
    /**
     * Get dealer statistics
     */
    async getStats() {
        const totalDealers = await Dealer.count();
        const activeDealers = await Dealer.count({ where: { is_active: true } });
        const inactiveDealers = totalDealers - activeDealers;

        // Total equipment associated with any dealer
        const totalEquipmentAssigned = await Equipment.count({
            where: {
                dealer_id: { [Op.ne]: null },
                is_active: true
            }
        });

        // Top dealer by equipment count
        const topCounts = await Equipment.findAll({
            where: {
                dealer_id: { [Op.ne]: null },
                is_active: true
            },
            attributes: ['dealer_id', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            group: ['dealer_id'],
            order: [[sequelize.literal('count'), 'DESC']],
            limit: 1,
            raw: true
        });

        let topDealerName = 'None';
        if (topCounts.length > 0 && topCounts[0].dealer_id) {
            const topDealer = await Dealer.findByPk(topCounts[0].dealer_id);
            if (topDealer) {
                topDealerName = `${topDealer.name} (${topCounts[0].count} items)`;
            }
        }

        return {
            totalDealers,
            activeDealers,
            inactiveDealers,
            totalEquipmentAssigned,
            topDealer: topDealerName
        };
    }

    /**
     * Get all dealers with optional search and status filter, plus equipment counts
     */
    async getAllDealers(filters = {}) {
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
                { address: { [Op.like]: `%${query}%` } },
                { contact_person: { [Op.like]: `%${query}%` } },
                { city: { [Op.like]: `%${query}%` } },
                { email: { [Op.like]: `%${query}%` } },
                { phone: { [Op.like]: `%${query}%` } },
                { gst_number: { [Op.like]: `%${query}%` } }
            ];
        }

        const dealers = await Dealer.findAll({
            where: whereClause,
            order: [['name', 'ASC']]
        });

        // Compute equipment counts per dealer
        const counts = await Equipment.findAll({
            where: {
                dealer_id: { [Op.ne]: null },
                is_active: true
            },
            attributes: ['dealer_id', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
            group: ['dealer_id'],
            raw: true
        });

        const countMap = counts.reduce((acc, curr) => {
            if (curr.dealer_id) {
                acc[curr.dealer_id] = parseInt(curr.count, 10);
            }
            return acc;
        }, {});

        return dealers.map(dealer => {
            const json = dealer.toJSON();
            return {
                ...json,
                equipment_count: countMap[json.id] || 0
            };
        });
    }

    /**
     * Get single dealer by ID with associated equipment list
     */
    async getDealerById(id) {
        const dealer = await Dealer.findByPk(id);
        if (!dealer) {
            throw new Error('Dealer not found');
        }

        // Fetch associated equipment list
        const equipment = await Equipment.findAll({
            where: { dealer_id: id, is_active: true },
            attributes: ['id', 'name', 'serial_number', 'model', 'brand', 'category', 'status', 'condition_status', 'lab_id'],
            include: [
                {
                    model: Lab,
                    as: 'lab',
                    attributes: ['id', 'name', 'location']
                }
            ],
            order: [['name', 'ASC']],
            limit: 100
        });

        const totalLinked = await Equipment.count({ where: { dealer_id: id, is_active: true } });

        return {
            ...dealer.toJSON(),
            equipment_count: totalLinked,
            equipment
        };
    }

    /**
     * Create new dealer
     */
    async createDealer(dealerData, userId) {
        const { name, address, contact_person, email, phone, city, gst_number, is_active = true } = dealerData;

        if (!name || !name.trim()) {
            throw new Error('Dealer Name is required');
        }

        const trimmedName = name.trim();

        // Check if name already exists
        const existing = await Dealer.findOne({
            where: { name: trimmedName }
        });

        if (existing) {
            throw new Error(`Dealer with name "${trimmedName}" already exists`);
        }

        const dealer = await Dealer.create({
            name: trimmedName,
            address: address ? address.trim() : null,
            contact_person: contact_person ? contact_person.trim() : null,
            email: email && email.trim() ? email.trim() : null,
            phone: phone ? phone.trim() : null,
            city: city ? city.trim() : null,
            gst_number: gst_number ? gst_number.trim() : null,
            is_active: is_active !== undefined ? Boolean(is_active) : true
        });

        return {
            ...dealer.toJSON(),
            equipment_count: 0
        };
    }

    /**
     * Update dealer by ID
     */
    async updateDealer(id, dealerData, userId) {
        const dealer = await Dealer.findByPk(id);
        if (!dealer) {
            throw new Error('Dealer not found');
        }

        const { name, address, contact_person, email, phone, city, gst_number, is_active } = dealerData;
        const updateFields = {};

        if (name !== undefined) {
            const trimmedName = name.trim();
            if (!trimmedName) throw new Error('Dealer Name cannot be empty');

            if (trimmedName.toLowerCase() !== dealer.name.toLowerCase()) {
                const existing = await Dealer.findOne({
                    where: {
                        name: trimmedName,
                        id: { [Op.ne]: id }
                    }
                });
                if (existing) {
                    throw new Error(`Dealer with name "${trimmedName}" already exists`);
                }
            }
            updateFields.name = trimmedName;
        }

        if (address !== undefined) {
            updateFields.address = address ? address.trim() : null;
        }

        if (contact_person !== undefined) {
            updateFields.contact_person = contact_person ? contact_person.trim() : null;
        }

        if (email !== undefined) {
            updateFields.email = email && email.trim() ? email.trim() : null;
        }

        if (phone !== undefined) {
            updateFields.phone = phone ? phone.trim() : null;
        }

        if (city !== undefined) {
            updateFields.city = city ? city.trim() : null;
        }

        if (gst_number !== undefined) {
            updateFields.gst_number = gst_number ? gst_number.trim() : null;
        }

        if (is_active !== undefined) {
            updateFields.is_active = Boolean(is_active);
        }

        await dealer.update(updateFields);

        // Keep dealer_name in Equipment table in sync if name changed
        if (updateFields.name && updateFields.name !== dealer.name) {
            await Equipment.update(
                { dealer_name: updateFields.name },
                { where: { dealer_id: id } }
            );
        }

        const equipmentCount = await Equipment.count({ where: { dealer_id: id, is_active: true } });

        return {
            ...dealer.toJSON(),
            equipment_count: equipmentCount
        };
    }

    /**
     * Delete dealer by ID
     */
    async deleteDealer(id, force = false) {
        const dealer = await Dealer.findByPk(id);
        if (!dealer) {
            throw new Error('Dealer not found');
        }

        const linkedEquipmentCount = await Equipment.count({
            where: { dealer_id: id, is_active: true }
        });

        if (linkedEquipmentCount > 0 && !force) {
            throw new Error(
                `Cannot delete dealer "${dealer.name}" because ${linkedEquipmentCount} equipment items are currently associated with it. Please reassign the equipment or choose Force Delete to unlink them.`
            );
        }

        if (linkedEquipmentCount > 0 && force) {
            // Unlink equipment from this dealer
            await Equipment.update(
                { dealer_id: null, dealer_name: null },
                { where: { dealer_id: id } }
            );
        }

        await dealer.destroy();

        return {
            success: true,
            message: `Dealer "${dealer.name}" deleted successfully${linkedEquipmentCount > 0 ? ` (${linkedEquipmentCount} equipment unlinked)` : ''}.`
        };
    }

    /**
     * Toggle dealer active status
     */
    async toggleStatus(id) {
        const dealer = await Dealer.findByPk(id);
        if (!dealer) {
            throw new Error('Dealer not found');
        }

        const newStatus = !dealer.is_active;
        await dealer.update({ is_active: newStatus });

        return {
            ...dealer.toJSON(),
            message: `Dealer "${dealer.name}" is now ${newStatus ? 'Active' : 'Inactive'}`
        };
    }
}

module.exports = new DealerService();
