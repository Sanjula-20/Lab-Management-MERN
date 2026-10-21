// Equipment Service - Business Logic Layer
const { Equipment, Lab, User, Booking, Dealer, Incident } = require('../models');
const { Op } = require('sequelize');
const { createNotification } = require('../utils/notificationService');
const auditService = require('./auditService');

class EquipmentService {
    /**
     * Get equipment statistics
     */
    async getStats() {
        const totalEquipment = await Equipment.count({ where: { is_active: true } });
        const availableEquipment = await Equipment.count({ 
            where: { is_active: true, status: 'available' } 
        });
        const inUseEquipment = await Equipment.count({ 
            where: { is_active: true, status: 'in_use' } 
        });
        const maintenanceEquipment = await Equipment.count({ 
            where: { is_active: true, status: 'maintenance' } 
        });

        return {
            total: totalEquipment,
            available: availableEquipment,
            inUse: inUseEquipment,
            maintenance: maintenanceEquipment
        };
    }

    /**
     * Get equipment status summary
     */
    async getStatusSummary() {
        const equipment = await Equipment.findAll({
            where: { is_active: true },
            include: [
                {
                    model: Lab,
                    as: 'lab',
                    attributes: ['id', 'name', 'location']
                },
                {
                    model: Booking,
                    as: 'bookings',
                    attributes: ['id', 'user_id', 'start_time', 'end_time', 'status'],
                    where: {
                        status: 'confirmed',
                        start_time: { [Op.lte]: new Date() },
                        end_time: { [Op.gte]: new Date() }
                    },
                    required: false,
                    include: [
                        {
                            model: User,
                            as: 'user',
                            attributes: ['id', 'name', 'email']
                        }
                    ]
                }
            ],
            limit: 10,
            order: [['updated_at', 'DESC']]
        });

        // Transform the data to include current_user
        return equipment.map(eq => {
            const eqData = eq.toJSON();
            const currentBooking = eqData.bookings && eqData.bookings.length > 0 ? eqData.bookings[0] : null;
            
            // Ensure status is a string
            let statusValue = eqData.status;
            if (typeof statusValue === 'object' && statusValue !== null) {
                statusValue = statusValue.status || String(statusValue);
            }
            statusValue = String(statusValue || 'unknown');
            
            return {
                id: eqData.id,
                name: String(eqData.name || 'Unknown'),
                status: statusValue,
                location: eqData.lab?.name || 'Unknown',
                current_user: currentBooking?.user?.name || null
            };
        });
    }

    /**
     * Get all equipment with filters and pagination
     */
    async getAllEquipment(filters = {}) {
        const {
            lab_id,
            status,
            category,
            brand,
            condition_status,
            dealer_id,
            generation,
            department,
            search,
            page = 1,
            limit = 1000
        } = filters;

        const whereClause = { is_active: true };

        // Helper to parse single or multi-value filter (supports comma-separated string or array)
        const parseMultiFilter = (val) => {
            if (!val) return null;
            if (Array.isArray(val)) return val.filter(Boolean);
            if (typeof val === 'string') {
                const parts = val.split(',').map(s => s.trim()).filter(Boolean);
                return parts.length > 0 ? parts : null;
            }
            return [val];
        };

        const labIds = parseMultiFilter(lab_id);
        if (labIds && labIds.length > 0) {
            whereClause.lab_id = labIds.length === 1 ? labIds[0] : { [Op.in]: labIds };
        }

        const statuses = parseMultiFilter(status);
        if (statuses && statuses.length > 0) {
            whereClause.status = statuses.length === 1 ? statuses[0] : { [Op.in]: statuses };
        }

        const categories = parseMultiFilter(category);
        if (categories && categories.length > 0) {
            whereClause.category = categories.length === 1 ? categories[0] : { [Op.in]: categories };
        }

        const brands = parseMultiFilter(brand);
        if (brands && brands.length > 0) {
            whereClause.brand = brands.length === 1 ? brands[0] : { [Op.in]: brands };
        }

        const conditions = parseMultiFilter(condition_status);
        if (conditions && conditions.length > 0) {
            whereClause.condition_status = conditions.length === 1 ? conditions[0] : { [Op.in]: conditions };
        }

        const dealerIds = parseMultiFilter(dealer_id);
        if (dealerIds && dealerIds.length > 0) {
            whereClause.dealer_id = dealerIds.length === 1 ? dealerIds[0] : { [Op.in]: dealerIds };
        }

        const generations = parseMultiFilter(generation);
        if (generations && generations.length > 0) {
            whereClause.generation = generations.length === 1 ? generations[0] : { [Op.in]: generations };
        }

        // Lab include with optional department filter
        const labInclude = {
            model: Lab,
            as: 'lab',
            attributes: ['id', 'name', 'location', 'lab_type'],
            required: false
        };

        const depts = parseMultiFilter(department);
        if (depts && depts.length > 0) {
            labInclude.where = {
                lab_type: depts.length === 1 ? depts[0].toLowerCase() : { [Op.in]: depts.map(d => d.toLowerCase()) }
            };
            labInclude.required = true;
        }

        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.like]: `%${search}%` } },
                { model: { [Op.like]: `%${search}%` } },
                { brand: { [Op.like]: `%${search}%` } },
                { dealer_name: { [Op.like]: `%${search}%` } },
                { serial_number: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } },
                { manufacturer: { [Op.like]: `%${search}%` } },
                { stock_register_page: { [Op.like]: `%${search}%` } },
                { indent_number: { [Op.like]: `%${search}%` } },
                { processor: { [Op.like]: `%${search}%` } },
                { gpu: { [Op.like]: `%${search}%` } }
            ];
        }

        const offset = (parseInt(page) - 1) * parseInt(limit);

        const equipment = await Equipment.findAndCountAll({
            where: whereClause,
            include: [
                labInclude,
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email'],
                    required: false
                },
                {
                    model: Dealer,
                    as: 'dealer',
                    attributes: ['id', 'name', 'contact_person', 'email', 'phone', 'city'],
                    required: false
                }
            ],
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: offset
        });

        return {
            equipment: equipment.rows,
            pagination: {
                total: equipment.count,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(equipment.count / parseInt(limit))
            }
        };
    }

    /**
     * Get equipment by ID
     */
    async getEquipmentById(id) {
        const equipment = await Equipment.findByPk(id, {
            include: [
                {
                    model: Lab,
                    as: 'lab',
                    attributes: ['id', 'name', 'location', 'lab_type'],
                    required: false
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email'],
                    required: false
                },
                {
                    model: Dealer,
                    as: 'dealer',
                    attributes: ['id', 'name', 'contact_person', 'email', 'phone', 'city', 'address', 'gst_number'],
                    required: false
                }
            ]
        });

        if (!equipment || !equipment.is_active) {
            throw new Error('Equipment not found');
        }

        return equipment;
    }

    /**
     * Create new equipment
     */
    async createEquipment(equipmentData, userId) {
        // Validate required fields
        if (!equipmentData.name || !equipmentData.serial_number || !equipmentData.category || !equipmentData.lab_id) {
            throw new Error('Name, serial number, category, and lab assignment are required');
        }

        // Check if lab exists
        const lab = await Lab.findByPk(equipmentData.lab_id);
        if (!lab || !lab.is_active) {
            throw new Error('Invalid lab ID or lab is not active');
        }

        // Check for duplicate serial number
        const existingEquipment = await Equipment.findOne({
            where: { serial_number: equipmentData.serial_number, is_active: true }
        });
        if (existingEquipment) {
            throw new Error('Equipment with this serial number already exists');
        }

        const brandVal = equipmentData.brand?.trim() || equipmentData.manufacturer?.trim() || null;
        const hardDiskVal = equipmentData.hard_disk?.trim() || equipmentData.storage?.trim() || null;
        const gpuVal = equipmentData.gpu?.trim() || equipmentData.graphics_card?.trim() || null;

        let dealerName = equipmentData.dealer_name?.trim() || null;
        if (equipmentData.dealer_id && !dealerName) {
            const { Dealer } = require('../models');
            const dealerObj = await Dealer.findByPk(equipmentData.dealer_id);
            if (dealerObj) dealerName = dealerObj.name;
        }

        // Prepare equipment data
        const dataToCreate = {
            name: equipmentData.name.trim(),
            description: equipmentData.description?.trim() || null,
            serial_number: equipmentData.serial_number.trim(),
            model: equipmentData.model?.trim() || null,
            brand: brandVal,
            manufacturer: brandVal,
            category: equipmentData.category,
            lab_id: parseInt(equipmentData.lab_id),
            dealer_id: equipmentData.dealer_id ? parseInt(equipmentData.dealer_id) : null,
            dealer_name: dealerName,
            location_details: equipmentData.location_details?.trim() || null,
            status: equipmentData.status || 'available',
            condition_status: equipmentData.condition_status || 'good',
            purchase_price: equipmentData.purchase_price ? parseFloat(equipmentData.purchase_price) : 0.00,
            current_value: equipmentData.current_value ? parseFloat(equipmentData.current_value) : 0.00,
            purchase_date: equipmentData.purchase_date || new Date().toISOString().split('T')[0],
            warranty_expiry: equipmentData.warranty_expiry || null,
            is_active: true,
            created_by: userId,
            // Configuration & Category-specific fields
            ram: equipmentData.ram?.trim() || null,
            hard_disk: hardDiskVal,
            gpu: gpuVal,
            generation: equipmentData.generation?.trim() || null,
            storage: hardDiskVal,
            graphics_card: gpuVal,
            processor: equipmentData.processor?.trim() || null,
            operating_system: equipmentData.operating_system?.trim() || null,
            // Extended hardware specs & tracking
            ram_type: equipmentData.ram_type?.trim() || null,
            gpu_memory: equipmentData.gpu_memory?.trim() || null,
            indent_number: equipmentData.indent_number?.trim() || null,
            indent_date: equipmentData.indent_date || null,
            stock_register_page: equipmentData.stock_register_page ? String(equipmentData.stock_register_page).trim() : null,
            resolution: equipmentData.resolution || null,
            brightness: equipmentData.brightness || null,
            contrast_ratio: equipmentData.contrast_ratio || null,
            lamp_hours: equipmentData.lamp_hours ? parseInt(equipmentData.lamp_hours) : null,
            print_type: equipmentData.print_type || null,
            print_speed: equipmentData.print_speed || null,
            paper_size: equipmentData.paper_size || null,
            connectivity: equipmentData.connectivity || null,
            magnification: equipmentData.magnification || null,
            objective_lenses: equipmentData.objective_lenses || null,
            illumination: equipmentData.illumination || null,
            capacity: equipmentData.capacity || null,
            power_rating: equipmentData.power_rating || null,
            temperature_range: equipmentData.temperature_range || null,
            accuracy: equipmentData.accuracy || null,
            ports: equipmentData.ports || null,
            speed: equipmentData.speed || null,
            protocol: equipmentData.protocol || null
        };

        const equipment = await Equipment.create(dataToCreate);

        // Fetch with associations
        const equipmentWithAssociations = await Equipment.findByPk(equipment.id, {
            include: [
                {
                    model: Lab,
                    as: 'lab',
                    attributes: ['id', 'name', 'location', 'lab_type'],
                    required: false
                },
                {
                    model: User,
                    as: 'creator',
                    attributes: ['id', 'name', 'email'],
                    required: false
                }
            ]
        });

        // Create notification
        try {
            await createNotification({
                user_id: userId,
                type: 'equipment',
                title: 'Equipment Added',
                message: `New equipment "${dataToCreate.name}" has been added to ${equipmentWithAssociations?.lab?.name || 'the lab'}.`,
                metadata: {
                    equipment_id: equipment.id,
                    equipment_name: dataToCreate.name,
                    serial_number: dataToCreate.serial_number,
                    category: dataToCreate.category,
                    lab_id: dataToCreate.lab_id,
                    lab_name: equipmentWithAssociations?.lab?.name || null
                }
            });
        } catch (notifError) {
            console.error('⚠️ Failed to create equipment notification:', notifError.message);
        }

        // Log audit event
        try {
            await auditService.logEvent({
                entity_type: 'equipment',
                entity_id: equipment.id,
                action: 'create',
                previous_values: null,
                new_values: {
                    name: dataToCreate.name,
                    serial_number: dataToCreate.serial_number,
                    category: dataToCreate.category,
                    model: dataToCreate.model,
                    brand: dataToCreate.brand,
                    lab_id: dataToCreate.lab_id,
                    dealer_id: dataToCreate.dealer_id,
                    status: dataToCreate.status,
                    indent_number: dataToCreate.indent_number,
                    stock_register_page: dataToCreate.stock_register_page
                },
                user_id: userId,
                user_name: equipmentWithAssociations?.creator?.name || 'Staff'
            });
        } catch (auditErr) {
            console.error('⚠️ Failed to log equipment create audit event:', auditErr.message);
        }

        return equipmentWithAssociations;
    }

    /**
     * Update equipment
     */
    async updateEquipment(id, updateData, userId, userRole) {
        const equipment = await Equipment.findByPk(id);

        if (!equipment || !equipment.is_active) {
            throw new Error('Equipment not found');
        }

        // Check permissions (admin and master_admin have elevated privileges)
        const isElevated = userRole === 'admin' || userRole === 'master_admin';
        if (!isElevated && equipment.created_by !== userId) {
            throw new Error('You do not have permission to edit this equipment');
        }

        const dataToUpdate = { ...updateData };

        if (dataToUpdate.brand !== undefined || dataToUpdate.manufacturer !== undefined) {
            const b = dataToUpdate.brand?.trim() || dataToUpdate.manufacturer?.trim() || null;
            dataToUpdate.brand = b;
            dataToUpdate.manufacturer = b;
        }

        if (dataToUpdate.hard_disk !== undefined || dataToUpdate.storage !== undefined) {
            const h = dataToUpdate.hard_disk?.trim() || dataToUpdate.storage?.trim() || null;
            dataToUpdate.hard_disk = h;
            dataToUpdate.storage = h;
        }

        if (dataToUpdate.gpu !== undefined || dataToUpdate.graphics_card !== undefined) {
            const g = dataToUpdate.gpu?.trim() || dataToUpdate.graphics_card?.trim() || null;
            dataToUpdate.gpu = g;
            dataToUpdate.graphics_card = g;
        }

        if (dataToUpdate.dealer_id && !dataToUpdate.dealer_name) {
            const dealerObj = await Dealer.findByPk(dataToUpdate.dealer_id);
            if (dealerObj) dataToUpdate.dealer_name = dealerObj.name;
        }

        if (dataToUpdate.purchase_price !== undefined) {
            dataToUpdate.purchase_price = dataToUpdate.purchase_price ? parseFloat(dataToUpdate.purchase_price) : 0.00;
        }

        if (dataToUpdate.current_value !== undefined) {
            dataToUpdate.current_value = dataToUpdate.current_value ? parseFloat(dataToUpdate.current_value) : 0.00;
        }

        const oldValues = {
            name: equipment.name,
            status: equipment.status,
            lab_id: equipment.lab_id,
            dealer_id: equipment.dealer_id,
            condition_status: equipment.condition_status
        };

        const oldStatus = equipment.status;
        await equipment.update(dataToUpdate);

        // Log audit event
        try {
            await auditService.logEvent({
                entity_type: 'equipment',
                entity_id: equipment.id,
                action: 'update',
                previous_values: oldValues,
                new_values: {
                    name: equipment.name,
                    status: equipment.status,
                    lab_id: equipment.lab_id,
                    dealer_id: equipment.dealer_id,
                    condition_status: equipment.condition_status
                },
                user_id: userId,
                user_name: 'Staff/Admin'
            });
        } catch (auditErr) {
            console.error('⚠️ Failed to log equipment update audit event:', auditErr.message);
        }

        // Create notification if status changed
        if (dataToUpdate.status && dataToUpdate.status !== oldStatus) {
            try {
                await createNotification({
                    user_id: userId,
                    type: 'equipment',
                    title: 'Equipment Status Updated',
                    message: `Equipment "${equipment.name}" status has been changed from ${oldStatus} to ${dataToUpdate.status}.`,
                    metadata: {
                        equipment_id: equipment.id,
                        equipment_name: equipment.name,
                        old_status: oldStatus,
                        new_status: dataToUpdate.status,
                        lab_id: equipment.lab_id
                    }
                });
            } catch (notifError) {
                console.error('⚠️ Failed to create equipment status notification:', notifError.message);
            }
        }

        const updatedEquipment = await Equipment.findByPk(id, {
            include: [
                {
                    model: Lab,
                    as: 'lab',
                    attributes: ['id', 'name', 'location', 'lab_type'],
                    required: false
                },
                {
                    model: Dealer,
                    as: 'dealer',
                    attributes: ['id', 'name', 'contact_person', 'email', 'phone', 'city'],
                    required: false
                }
            ]
        });

        return updatedEquipment;
    }

    /**
     * Delete equipment (soft delete)
     */
    async deleteEquipment(id, userId, userRole) {
        const equipment = await Equipment.findByPk(id);

        if (!equipment || !equipment.is_active) {
            throw new Error('Equipment not found');
        }

        const isElevated = userRole === 'admin' || userRole === 'master_admin';
        if (!isElevated && equipment.created_by !== userId) {
            throw new Error('You do not have permission to delete this equipment');
        }

        // Check for active or pending bookings
        const activeBookings = await Booking.count({
            where: {
                equipment_id: id,
                status: { [Op.in]: ['confirmed', 'in_use', 'pending'] }
            }
        });
        if (activeBookings > 0) {
            throw new Error(`Cannot delete equipment: There are ${activeBookings} active or pending booking(s) associated with it.`);
        }

        // Check for open incidents
        const activeIncidents = await Incident.count({
            where: {
                equipment_id: id,
                status: { [Op.in]: ['open', 'investigating', 'pending_parts', 'in_progress', 'assigned'] }
            }
        });
        if (activeIncidents > 0) {
            throw new Error(`Cannot delete equipment: There are ${activeIncidents} open or unresolved incident(s) for this equipment.`);
        }

        await equipment.update({ is_active: false });

        // Audit log
        try {
            await auditService.logEvent({
                entity_type: 'equipment',
                entity_id: equipment.id,
                action: 'delete',
                previous_values: { name: equipment.name, serial_number: equipment.serial_number, status: equipment.status },
                new_values: { is_active: false },
                user_id: userId,
                user_name: 'Staff/Admin'
            });
        } catch (auditErr) {
            console.error('⚠️ Failed to log equipment delete audit event:', auditErr.message);
        }

        return { message: 'Equipment deleted successfully' };
    }

    /**
     * Batch update status for multiple equipment items
     */
    async batchUpdateStatus(ids, status, userId, userRole) {
        if (!Array.isArray(ids) || ids.length === 0) {
            throw new Error('Equipment IDs are required');
        }
        const validStatuses = ['available', 'in_use', 'maintenance', 'broken', 'retired'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status: ${status}`);
        }

        const [updatedCount] = await Equipment.update(
            { status },
            {
                where: {
                    id: { [Op.in]: ids },
                    is_active: true
                }
            }
        );

        return { updatedCount, status };
    }

    /**
     * Batch delete multiple equipment items
     */
    async batchDeleteEquipment(ids, userId, userRole) {
        if (!Array.isArray(ids) || ids.length === 0) {
            throw new Error('Equipment IDs are required');
        }
        if (userRole !== 'admin' && userRole !== 'master_admin') {
            throw new Error('Only administrators can perform batch deletion');
        }

        const [deletedCount] = await Equipment.update(
            { is_active: false },
            {
                where: {
                    id: { [Op.in]: ids },
                    is_active: true
                }
            }
        );

        return { deletedCount };
    }

    /**
     * Bulk import equipment
     */
    async bulkImportEquipment(equipmentDataArray, userId) {
        if (!Array.isArray(equipmentDataArray) || equipmentDataArray.length === 0) {
            throw new Error('Equipment data array is required');
        }

        if (equipmentDataArray.length > 1000) {
            throw new Error('Cannot import more than 1000 items at once');
        }

        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        const validStatuses = ['available', 'in_use', 'maintenance', 'broken', 'retired'];
        const validConditions = ['excellent', 'good', 'fair', 'poor'];
        const validCategories = [
            'computer', 'printer', 'projector', 'scanner', 'microscope',
            'centrifuge', 'spectrophotometer', 'ph_meter', 'balance',
            'incubator', 'autoclave', 'pipette', 'thermometer',
            'glassware', 'safety_equipment', 'lab_equipment', 'network', 'network_equipment', 'other'
        ];

        for (let i = 0; i < equipmentDataArray.length; i++) {
            const data = equipmentDataArray[i];
            const rowNumber = i + 1;

            try {
                // Validate required fields
                if (!data.name || !data.serial_number || !data.category || !data.lab_id) {
                    results.failed++;
                    results.errors.push(`Row ${rowNumber}: Missing required fields (name, serial_number, category, lab_id)`);
                    continue;
                }

                // Check if lab exists
                const lab = await Lab.findByPk(data.lab_id);
                if (!lab) {
                    results.failed++;
                    results.errors.push(`Row ${rowNumber}: Lab with ID ${data.lab_id} not found`);
                    continue;
                }

                // Handle multiple equipment items if quantity > 1
                const quantity = parseInt(data.quantity) || 1;
                
                for (let q = 0; q < quantity; q++) {
                    try {
                        // Generate unique serial number for each item if quantity > 1
                        let serialNumber = data.serial_number.trim();
                        if (quantity > 1) {
                            serialNumber = `${data.serial_number.trim()}-${(q + 1).toString().padStart(2, '0')}`;
                        }

                        // Check for existing serial numbers and generate unique ones if needed
                        let attempts = 0;
                        while (attempts < 10) {
                            const existing = await Equipment.findOne({ 
                                where: { serial_number: serialNumber, is_active: true } 
                            });
                            if (!existing) break;
                            
                            attempts++;
                            const timestamp = new Date().getTime().toString().slice(-4);
                            serialNumber = `${data.serial_number.trim()}-${(q + 1).toString().padStart(2, '0')}-${timestamp}`;
                        }
                        
                        if (attempts >= 10) {
                            results.failed++;
                            results.errors.push(`Row ${rowNumber}: Could not generate unique serial number after 10 attempts`);
                            continue;
                        }

                        // Prepare equipment data
                        const equipmentDataItem = {
                            name: data.name.trim(),
                            description: data.description?.trim() || null,
                            serial_number: serialNumber,
                            model: data.model?.trim() || null,
                            manufacturer: data.manufacturer?.trim() || null,
                            category: data.category.trim(),
                            lab_id: parseInt(data.lab_id),
                            location_details: data.location_details?.trim() || null,
                            status: data.status || 'available',
                            condition_status: data.condition_status || 'good',
                            purchase_price: data.purchase_price ? parseFloat(data.purchase_price) : null,
                            current_value: data.current_value ? parseFloat(data.current_value) : null,
                            purchase_date: data.purchase_date && !isNaN(new Date(data.purchase_date)) ? new Date(data.purchase_date) : new Date(),
                            warranty_expiry: data.warranty_expiry ? new Date(data.warranty_expiry) : null,
                            processor: data.processor?.trim() || null,
                            ram: data.ram?.trim() || null,
                            storage: data.storage?.trim() || null,
                            graphics_card: data.graphics_card?.trim() || null,
                            operating_system: data.operating_system?.trim() || null,
                            stock_register_page: data.stock_register_page ? String(data.stock_register_page) : null,
                            is_active: true,
                            created_by: userId
                        };

                        // Validate status values
                        if (!validStatuses.includes(equipmentDataItem.status)) {
                            results.failed++;
                            results.errors.push(`Row ${rowNumber}: Invalid status '${equipmentDataItem.status}'. Must be one of: ${validStatuses.join(', ')}`);
                            continue;
                        }

                        // Validate condition status
                        if (!validConditions.includes(equipmentDataItem.condition_status)) {
                            results.failed++;
                            results.errors.push(`Row ${rowNumber}: Invalid condition '${equipmentDataItem.condition_status}'. Must be one of: ${validConditions.join(', ')}`);
                            continue;
                        }

                        // Validate category
                        if (!validCategories.includes(equipmentDataItem.category)) {
                            results.failed++;
                            results.errors.push(`Row ${rowNumber}: Invalid category '${equipmentDataItem.category}'. Must be one of: ${validCategories.join(', ')}`);
                            continue;
                        }

                        // Create equipment
                        await Equipment.create(equipmentDataItem);
                        results.success++;

                    } catch (itemError) {
                        console.error(`❌ Error importing equipment row ${rowNumber} item ${q + 1}:`, itemError);
                        results.failed++;
                        results.errors.push(`Row ${rowNumber} item ${q + 1}: ${itemError.message}`);
                    }
                }

            } catch (error) {
                console.error(`❌ Error processing equipment row ${rowNumber}:`, error);
                results.failed++;
                results.errors.push(`Row ${rowNumber}: ${error.message}`);
            }
        }

        return results;
    }

    /**
     * Bulk delete equipment by lab
     */
    async bulkDeleteByLab(labId, userRole) {
        // Check if user is admin or master_admin
        if (userRole !== 'admin' && userRole !== 'master_admin') {
            throw new Error('Only administrators can perform bulk delete operations');
        }

        // Check if lab exists
        const lab = await Lab.findByPk(labId);
        if (!lab) {
            throw new Error('Lab not found');
        }

        // Count equipment in this lab
        const equipmentCount = await Equipment.count({
            where: {
                lab_id: labId,
                is_active: true
            }
        });

        if (equipmentCount === 0) {
            throw new Error('No equipment found in this lab');
        }

        // Soft delete all equipment in this lab
        await Equipment.update(
            { is_active: false },
            {
                where: {
                    lab_id: labId,
                    is_active: true
                }
            }
        );

        return {
            deletedCount: equipmentCount,
            labName: lab.name
        };
    }

    /**
     * Batch update status for multiple equipment items
     */
    async batchUpdateStatus(ids, newStatus, userId) {
        if (!Array.isArray(ids) || ids.length === 0) {
            throw new Error('Please select at least one equipment item');
        }

        const validStatuses = ['available', 'in_use', 'maintenance', 'broken', 'retired'];
        if (!validStatuses.includes(newStatus)) {
            throw new Error(`Invalid status: ${newStatus}. Must be one of: ${validStatuses.join(', ')}`);
        }

        const [affectedCount] = await Equipment.update(
            { status: newStatus },
            {
                where: {
                    id: { [Op.in]: ids },
                    is_active: true
                }
            }
        );

        return {
            updatedCount: affectedCount,
            status: newStatus
        };
    }

    /**
     * Batch soft-delete multiple equipment items
     */
    async batchDeleteEquipment(ids, userRole) {
        if (userRole !== 'admin' && userRole !== 'master_admin') {
            throw new Error('Only administrators can perform batch delete operations');
        }

        if (!Array.isArray(ids) || ids.length === 0) {
            throw new Error('Please select at least one equipment item to delete');
        }

        const [deletedCount] = await Equipment.update(
            { is_active: false },
            {
                where: {
                    id: { [Op.in]: ids },
                    is_active: true
                }
            }
        );

        return {
            deletedCount
        };
    }
}

module.exports = new EquipmentService();
