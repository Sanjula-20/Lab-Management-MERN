const express = require('express');
const { authenticateToken, checkPermission } = require('../middleware/auth');
const { trackAccess } = require('./recentlyAccessed');
const bookingService = require('../services/bookingService');

const router = express.Router();

router.use(authenticateToken);

// GET booking statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = await bookingService.getStats(req.user.userId, req.user.role);
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Error fetching booking stats:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch booking statistics',
            error: error.message
        });
    }
});

// GET upcoming bookings
router.get('/upcoming', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const bookings = await bookingService.getUpcomingBookings(req.user.userId, req.user.role, limit);
        
        // Flatten the data structure for frontend
        const transformedBookings = bookings.map(booking => {
            const bookingData = booking.toJSON ? booking.toJSON() : booking;
            
            // Extract status properly
            let statusValue = bookingData.status;
            if (typeof statusValue === 'object' && statusValue !== null) {
                statusValue = statusValue.status || String(statusValue);
            }
            statusValue = String(statusValue || 'pending');
            
            return {
                id: bookingData.id,
                booking_type: bookingData.booking_type,
                equipment_name: bookingData.equipment?.name || null,
                lab_name: bookingData.lab?.name || null,
                user_name: bookingData.user?.name || null,
                user_email: bookingData.user?.email || null,
                purpose: bookingData.purpose || '',
                start_time: bookingData.start_time,
                end_time: bookingData.end_time,
                status: statusValue,
                created_at: bookingData.created_at
            };
        });
        
        res.json({
            success: true,
            data: transformedBookings
        });
    } catch (error) {
        console.error('Error fetching upcoming bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch upcoming bookings',
            error: error.message
        });
    }
});

// GET all bookings
router.get('/', async (req, res) => {
    try {
        console.log('📅 Fetching bookings for user:', req.user.email, 'Role:', req.user.role);
        
        const result = await bookingService.getAllBookings(req.query, req.user.userId, req.user.role);
        res.json({
            success: true,
            data: result.bookings,
            pagination: result.pagination
        });
    } catch (error) {
        console.error('💥 Error fetching bookings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings',
            error: error.message
        });
    }
});

// GET booking by ID
router.get('/:id', trackAccess, async (req, res) => {
    try {
        const booking = await bookingService.getBookingById(req.params.id);
        
        res.json({
            success: true,
            data: booking
        });
    } catch (error) {
        console.error('Error fetching booking:', error);
        if (error.message === 'Booking not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to fetch booking',
            error: error.message
        });
    }
});

// POST create new booking (students cannot create bookings)
router.post('/', async (req, res) => {
    try {
        if (req.user.role === 'student') {
            return res.status(403).json({
                success: false,
                message: 'Students are not allowed to create bookings'
            });
        }
        const booking = await bookingService.createBooking(req.body, req.user.userId);
        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            data: booking
        });
    } catch (error) {
        console.error('Error creating booking:', error);
        if (error.message.includes('conflict') || error.message.includes('overlapping')) {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create booking',
            error: error.message
        });
    }
});

// PUT update booking (students not allowed)
router.put('/:id', async (req, res) => {
    try {
        if (req.user.role === 'student') {
            return res.status(403).json({
                success: false,
                message: 'Students are not allowed to update bookings'
            });
        }
        const booking = await bookingService.getBookingById(req.params.id);
        
        const updatedBooking = await bookingService.updateBooking(req.params.id, req.body);
        res.json({
            success: true,
            message: 'Booking updated successfully',
            data: updatedBooking
        });
    } catch (error) {
        console.error('Error updating booking:', error);
        if (error.message === 'Booking not found') {
            return res.status(404).json({
                success: false,
                message: error.message
            });
        }
        if (error.message.includes('conflict') || error.message.includes('overlapping')) {
            return res.status(409).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: 'Failed to update booking',
            error: error.message
        });
    }
});

// APPROVE booking (Admin / Master Admin with approve permission)
const approveHandler = async (req, res) => {
    try {
        const adminUserId = req.user.userId || req.user.id;
        const booking = await bookingService.approveBooking(req.params.id, adminUserId, req.user.role);
        res.json({
            success: true,
            message: 'Booking approved successfully',
            data: booking
        });
    } catch (error) {
        console.error('Error approving booking:', error);
        if (error.message.includes('not found')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        if (error.message.includes('cannot approve their own') || error.message.includes('Cannot approve booking')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to approve booking',
            error: error.message
        });
    }
};
router.patch('/:id/approve', checkPermission('bookings', 'approve'), approveHandler);
router.post('/:id/approve', checkPermission('bookings', 'approve'), approveHandler);

// REJECT booking (Admin / Master Admin with approve permission)
const rejectHandler = async (req, res) => {
    try {
        const adminUserId = req.user.userId || req.user.id;
        const { reason } = req.body;
        if (!reason || !reason.trim()) {
            return res.status(400).json({
                success: false,
                message: 'A rejection reason is required'
            });
        }
        const booking = await bookingService.rejectBooking(req.params.id, adminUserId, req.user.role, reason);
        res.json({
            success: true,
            message: 'Booking rejected successfully',
            data: booking
        });
    } catch (error) {
        console.error('Error rejecting booking:', error);
        if (error.message.includes('not found')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        if (error.message.includes('cannot reject their own') || error.message.includes('Cannot reject booking')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to reject booking',
            error: error.message
        });
    }
};
router.patch('/:id/reject', checkPermission('bookings', 'approve'), rejectHandler);
router.post('/:id/reject', checkPermission('bookings', 'approve'), rejectHandler);

// CANCEL booking (Faculty can cancel their own, Admins can cancel any)
const cancelHandler = async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const booking = await bookingService.cancelBooking(req.params.id, userId, req.user.role);
        res.json({
            success: true,
            message: 'Booking cancelled successfully',
            data: booking
        });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        if (error.message.includes('not found')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        if (error.message.includes('permission')) {
            return res.status(403).json({ success: false, message: error.message });
        }
        if (error.message.includes('already')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to cancel booking',
            error: error.message
        });
    }
};
router.patch('/:id/cancel', cancelHandler);
router.post('/:id/cancel', cancelHandler);

// Status update dispatcher (routes to approve, reject, cancel, or general update)
router.patch('/:id/status', async (req, res) => {
    try {
        const { status, rejection_reason, reason } = req.body;
        const normalized = String(status || '').toLowerCase();
        const userId = req.user.userId || req.user.id;

        if (normalized === 'approved' || normalized === 'confirmed') {
            const booking = await bookingService.approveBooking(req.params.id, userId, req.user.role);
            return res.json({ success: true, message: 'Booking approved successfully', data: booking });
        } else if (normalized === 'rejected') {
            const rejReason = rejection_reason || reason || 'Booking rejected by administrator';
            const booking = await bookingService.rejectBooking(req.params.id, userId, req.user.role, rejReason);
            return res.json({ success: true, message: 'Booking rejected successfully', data: booking });
        } else if (normalized === 'cancelled') {
            const booking = await bookingService.cancelBooking(req.params.id, userId, req.user.role);
            return res.json({ success: true, message: 'Booking cancelled successfully', data: booking });
        } else {
            const booking = await bookingService.updateBooking(req.params.id, { status: normalized }, userId, req.user.role);
            return res.json({ success: true, message: `Booking status updated to ${normalized}`, data: booking });
        }
    } catch (error) {
        console.error('Error updating booking status:', error);
        if (error.message.includes('not found')) {
            return res.status(404).json({ success: false, message: error.message });
        }
        if (error.message.includes('permission') || error.message.includes('cannot approve their own') || error.message.includes('cannot reject their own')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        return res.status(500).json({ success: false, message: error.message || 'Failed to update status', error: error.message });
    }
});

// DELETE booking (cancels booking)
router.delete('/:id', cancelHandler);

module.exports = router;
