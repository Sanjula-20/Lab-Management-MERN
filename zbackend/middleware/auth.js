// middleware/auth.js - Session-Based Authentication
const { User } = require('../models');
const { getSession } = require('../utils/sessionManager');

// Role mapping for backward compatibility
const ROLE_MAP = { 1: 'student', 2: 'faculty', 3: 'teacher', 4: 'lab_assistant', 5: 'lab_technician', 6: 'admin', 7: 'master_admin' };

// Session-based authentication middleware
const authenticateToken = async (req, res, next) => {
    try {
        console.log('🔐 Authentication middleware triggered');
        console.log('Cookies:', req.cookies ? 'Cookies present' : 'No cookies');

        // Get session ID from cookie, Authorization header, or x-session-id header
        let sessionId = req.cookies?.sessionId;
        if (!sessionId && req.headers.authorization) {
            const parts = req.headers.authorization.split(' ');
            if (parts.length === 2 && (parts[0] === 'Bearer' || parts[0] === 'Session')) {
                sessionId = parts[1];
            }
        }
        if (!sessionId && req.headers['x-session-id']) {
            sessionId = req.headers['x-session-id'];
        }

        if (!sessionId || sessionId === 'null' || sessionId === 'undefined') {
            console.log('❌ No session ID in cookies or headers');
            return res.status(401).json({
                success: false,
                message: 'Access denied. No session provided.'
            });
        }

        console.log('🎫 Session ID extracted');

        // Get session data
        const session = getSession(sessionId);
        
        if (!session) {
            console.log('❌ Invalid or expired session');
            return res.status(401).json({
                success: false,
                message: 'Access denied. Invalid or expired session.'
            });
        }

        console.log('✅ Session verified for user:', session.userMail || session.email);

        // Get user from database to ensure they still exist and are active
        const user = await User.unscoped().findByPk(session.userId, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            console.log('❌ User not found in database:', session.userId);
            return res.status(401).json({
                success: false,
                message: 'Access denied. User not found.'
            });
        }

        // Check if user is active
        if (user.status !== 'Active') {
            console.log('❌ User account is inactive:', user.userMail);
            return res.status(401).json({
                success: false,
                message: 'Access denied. Account is inactive.'
            });
        }

        // Set user object with new schema fields
        req.user = {
            userId: user.userId,
            userName: user.userName,
            userMail: user.userMail,
            roleId: user.roleId,
            role: ROLE_MAP[user.roleId] || 'student', // Derived from roleId
            departmentId: user.departmentId,
            companyId: user.companyId,
            userNumber: user.userNumber,
            status: user.status,
            profileImage: user.profileImage,
            googleId: user.googleId,
            authProvider: user.authProvider,
            // Backward compatibility aliases
            id: user.userId,
            email: user.userMail,
            name: user.userName,
            is_active: user.status === 'Active'
        };

        console.log('✅ Authentication successful for:', req.user.userMail);
        next();

    } catch (error) {
        console.error('💥 Auth middleware error:', error.message);

        // Handle database connection errors
        if (error.name === 'SequelizeConnectionError') {
            return res.status(500).json({
                success: false,
                message: 'Database connection error.'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Internal server error during authentication.'
        });
    }
};

// Generic role middleware (Master Admin has super-privileges)
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            console.log('❌ No authenticated user found');
            return res.status(401).json({
                success: false,
                message: 'Access denied. Authentication required.'
            });
        }

        // Master Admin always has access to all standard role-protected features
        if (req.user.role === 'master_admin' || req.user.roleId === 7) {
            return next();
        }

        const userRole = req.user.role;
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

        // Normalize role values (handle spaces and underscores)
        const normalizedUserRole = userRole ? userRole.toLowerCase().replace(/ /g, '_') : '';
        const normalizedRoles = roles.map(r => r.toLowerCase().replace(/ /g, '_'));

        // Check if user's role matches any of the allowed roles
        const hasAccess = normalizedRoles.includes(normalizedUserRole) ||
            (normalizedRoles.includes('admin') && (normalizedUserRole === 'master_admin' || req.user.roleId === 7));

        if (!hasAccess) {
            console.log('❌ Role access denied. User role:', userRole, 'Required:', roles);
            return res.status(403).json({
                success: false,
                message: `Access denied. Required role: ${roles.join(' or ')}`
            });
        }

        console.log('✅ Role access granted for:', req.user.userMail);
        next();
    };
};

// Master Admin exclusive middleware
const requireMasterAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. Authentication required.'
        });
    }

    if (req.user.role === 'master_admin' || req.user.roleId === 7) {
        return next();
    }

    return res.status(403).json({
        success: false,
        message: 'Access denied. Master Admin privileges required.'
    });
};

// Database-backed permission checker for fine-grained authorization
const checkPermission = (pageKey, action = 'view') => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. Authentication required.'
            });
        }

        // Master Admin has full access to everything
        if (req.user.role === 'master_admin' || req.user.roleId === 7) {
            return next();
        }

        // Protection for access control
        if (pageKey === 'access_control') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only Master Admin can manage access permissions.'
            });
        }

        try {
            const { RolePermission } = require('../models');
            const perm = await RolePermission.findOne({
                where: {
                    roleId: req.user.roleId,
                    page_key: pageKey
                }
            });

            if (!perm) {
                // If admin, grant fallback access for operational pages
                if (req.user.role === 'admin' || req.user.roleId === 6) {
                    return next();
                }
                return res.status(403).json({
                    success: false,
                    message: `Access denied: No permissions configured for ${pageKey}`
                });
            }

            const fieldMap = {
                view: 'can_view',
                create: 'can_create',
                edit: 'can_edit',
                delete: 'can_delete',
                approve: 'can_approve',
                export: 'can_export'
            };

            const reqField = fieldMap[action] || 'can_view';
            if (!perm[reqField]) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied: You do not have permission to ${action} on ${pageKey}`
                });
            }

            next();
        } catch (err) {
            console.error('Permission check error:', err);
            return res.status(500).json({
                success: false,
                message: 'Authorization check failed'
            });
        }
    };
};

// Admin role middleware
const requireAdmin = (req, res, next) => {
    return requireRole('admin')(req, res, next);
};

// Teacher or Admin role middleware
const requireTeacherOrAdmin = (req, res, next) => {
    return requireRole(['teacher', 'admin'])(req, res, next);
};

// Lab Assistant or Admin role middleware
const requireLabAssistantOrAdmin = (req, res, next) => {
    return requireRole(['lab_assistant', 'admin'])(req, res, next);
};

// Lab Technician or Admin role middleware
const requireLabTechnicianOrAdmin = (req, res, next) => {
    return requireRole(['lab_technician', 'admin'])(req, res, next);
};

// Student, Teacher, or Admin role middleware (authenticated users)
const requireAuthenticated = authenticateToken;

// Optional authentication middleware (doesn't block if no session)
const optionalAuth = async (req, res, next) => {
    try {
        const sessionId = req.cookies?.sessionId;

        if (!sessionId || sessionId === 'null' || sessionId === 'undefined') {
            req.user = null;
            return next();
        }

        // Try to get session
        const session = getSession(sessionId);
        
        if (!session) {
            req.user = null;
            return next();
        }

        // Get user from database
        const user = await User.findByPk(session.userId, {
            attributes: ['id', 'name', 'email', 'role', 'is_active']
        });

        if (user && user.is_active) {
            req.user = {
                userId: user.id,
                id: user.id,
                email: user.email,
                role: user.role,
                name: user.name
            };
        } else {
            req.user = null;
        }

        next();
    } catch (error) {
        // If session verification fails, continue without authentication
        req.user = null;
        next();
    }
};

module.exports = {
    authenticateToken,
    requireRole,
    requireAdmin,
    requireMasterAdmin,
    checkPermission,
    requireTeacherOrAdmin,
    requireLabAssistantOrAdmin,
    requireLabTechnicianOrAdmin,
    requireAuthenticated,
    optionalAuth
};