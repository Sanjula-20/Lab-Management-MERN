// src/components/common/Navigation.jsx - Shared Navigation Configuration
import { useAuth } from '../../hooks/useAuth'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'

// Centralized Navigation Configuration
// Centralized Navigation Configuration
export const getNavigationItems = (user, stats = {}, permissions = null) => {
    const isMasterAdmin = user?.role === 'master_admin' || user?.roleId === 7;
    const isAdmin = user?.role === 'admin' || user?.roleId === 6 || isMasterAdmin;
    const isFaculty = user?.role === 'faculty' || user?.role === 'teacher' || user?.roleId === 2 || user?.roleId === 3;

    // Helper to evaluate permission
    const checkVisible = (permKey, defaultShow) => {
        if (isMasterAdmin) return true;
        if (permissions && permissions[permKey] !== undefined) {
            return Boolean(permissions[permKey]?.is_sidebar_visible && permissions[permKey]?.can_view);
        }
        return defaultShow;
    };

    return [
        // 1. Dashboard
        {
            id: 'dashboard',
            title: 'Dashboard',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v3H8V5z"></path>
                </svg>
            ),
            path: '/dashboard',
            show: checkVisible('dashboard', true),
            badge: null
        },
        // 2. Department Master
        {
            id: 'departments',
            title: 'Department Master',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
            path: '/departments',
            show: checkVisible('departments', isAdmin),
            badge: stats.totalDepartments || null
        },
        // 3. Faculty Master
        {
            id: 'faculty',
            title: 'Faculty Master',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
            ),
            path: '/faculty',
            show: checkVisible('faculty', isAdmin),
            badge: stats.totalFaculty || null
        },
        // 4. Lab Management
        {
            id: 'lab-management',
            title: 'Lab Management',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
            ),
            path: '/lab-management',
            show: checkVisible('labs', true),
            badge: stats.totalLabs || null
        },
        // 5. Equipment
        {
            id: 'equipment',
            title: 'Equipment',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
            ),
            path: '/equipment',
            show: checkVisible('equipment', true),
            badge: stats.totalEquipment || null,
            children: [
                {
                    id: 'equipment-inventory',
                    title: 'All Equipment',
                    path: '/equipment',
                    icon: (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                    )
                },
                {
                    id: 'hardware-options',
                    title: 'Hardware Options',
                    path: '/hardware-options',
                    icon: (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        </svg>
                    )
                }
            ]
        },
        // 6. Equipment Categories
        {
            id: 'equipment-categories',
            title: 'Equipment Categories',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            ),
            path: '/equipment-categories',
            show: checkVisible('equipment_categories', isAdmin),
            badge: stats.totalCategories || null
        },
        // 7. Dealer Master
        {
            id: 'dealers',
            title: 'Dealer Master',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
            ),
            path: '/dealers',
            show: checkVisible('dealers', isAdmin),
            badge: stats.totalDealers || null
        },
        // 8. Bookings
        {
            id: 'bookings',
            title: 'Bookings',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
            ),
            path: '/bookings',
            show: checkVisible('bookings', true),
            badge: stats.activeBookings || null
        },
        // 9. Calendar
        {
            id: 'calendar',
            title: 'Calendar',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
            ),
            path: '/calendar',
            show: checkVisible('calendar', true),
            badge: null
        },
        // 10. Incidents
        {
            id: 'incidents',
            title: 'Incidents',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.982 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
            ),
            path: '/incidents',
            show: checkVisible('incidents', true),
            badge: stats.totalIncidents || null,
            badgeColor: stats.totalIncidents > 0 ? 'bg-red-100 text-red-800' : null
        },
        // 11. Orders
        {
            id: 'orders',
            title: 'Orders',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
            ),
            path: '/orders',
            show: checkVisible('orders', isAdmin),
            badge: stats.pendingOrders || null,
            badgeColor: stats.pendingOrders > 0 ? 'bg-orange-100 text-orange-800' : null
        },
        // 12. Reports
        {
            id: 'reports',
            title: 'Reports',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
            ),
            path: '/reports',
            show: checkVisible('reports', isAdmin || isFaculty),
            badge: null
        },
        // 13. Training
        {
            id: 'training',
            title: 'Training',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ),
            path: '/training',
            show: checkVisible('training', true),
            badge: stats.completedTrainings || null
        },
        // 14. Notifications
        {
            id: 'notifications',
            title: 'Notifications',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            ),
            path: '/notifications',
            show: checkVisible('notifications', true),
            badge: stats.unreadNotifications || null,
            badgeColor: 'bg-red-500 text-white'
        },
        // 15. Access & Permissions — Master Admin always has access
        {
            id: 'access-permissions',
            title: 'Access & Permissions',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
            ),
            path: '/access-permissions',
            show: isMasterAdmin || checkVisible('access_permissions', false),
            badge: null
        }
    ]
}

// Shared Sidebar Component
export function Sidebar({ sidebarCollapsed, setSidebarCollapsed, currentPath, stats = {}, mobileOpen, setMobileOpen }) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [permissions, setPermissions] = useState(null)

    // Fetch dynamic permissions for logged-in user
    useEffect(() => {
        let isMounted = true
        fetch('/api/roles/my-permissions', { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                if (isMounted && data.success && data.data) {
                    setPermissions(data.data)
                }
            })
            .catch(() => {})
        return () => { isMounted = false }
    }, [user])

    // Gracefully handle undefined sidebarCollapsed prop
    const [localCollapsed, setLocalCollapsed] = useState(false)
    const isCollapsed = sidebarCollapsed !== undefined ? sidebarCollapsed : localCollapsed
    const handleToggleCollapse = () => {
        if (setSidebarCollapsed) {
            setSidebarCollapsed(!sidebarCollapsed)
        } else {
            setLocalCollapsed(!localCollapsed)
        }
    }

    const navigationItems = getNavigationItems(user, stats, permissions)

    // State for open/close submenus (Equipment defaults open if on /equipment, /equipment-categories, or /dealers)
    const [openSubmenus, setOpenSubmenus] = useState(() => {
        const initial = {}
        navigationItems.forEach(item => {
            if (item.children) {
                const matches = item.children.some(c => location.pathname === c.path || (c.path !== '/' && location.pathname.startsWith(c.path)))
                if (matches || location.pathname === item.path) {
                    initial[item.id] = true
                }
            }
        })
        return initial
    })

    // Auto-expand menu when navigating to any child route
    useEffect(() => {
        navigationItems.forEach(item => {
            if (item.children) {
                const matches = item.children.some(c => location.pathname === c.path || (c.path !== '/' && location.pathname.startsWith(c.path)))
                if (matches || location.pathname === item.path) {
                    setOpenSubmenus(prev => ({ ...prev, [item.id]: true }))
                }
            }
        })
    }, [location.pathname])

    const handleNavigation = (path) => {
        navigate(path)
        if (setMobileOpen) {
            setMobileOpen(false)
        }
    }

    const handleLogout = async () => {
        try {
            await logout()
            navigate('/login')
        } catch (error) {
            console.error('Logout error:', error)
            navigate('/login')
        }
    }

    return (
        <>
            {/* Mobile Backdrop Overlay */}
            {mobileOpen && (
                <div 
                    onClick={() => setMobileOpen && setMobileOpen(false)}
                    className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
                    aria-hidden="true"
                />
            )}

            <div 
                className={`fixed inset-y-0 left-0 z-50 ${isCollapsed ? 'md:w-16' : 'md:w-64'} w-64 bg-white shadow-xl border-r border-gray-200 transition-all duration-300 flex flex-col ${
                    mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
                }`}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 shrink-0">
                    {(!isCollapsed || mobileOpen) && (
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-white rounded-lg overflow-hidden p-1 shadow-2xs">
                                <img 
                                    src="/nec-logo.png" 
                                    alt="NEC Logo" 
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <h1 className="text-xl font-bold text-white tracking-wide">
                                NEC LabMS
                            </h1>
                        </div>
                    )}
                    
                    <div className="flex items-center space-x-1">
                        {/* Desktop collapse toggle */}
                        <button
                            onClick={handleToggleCollapse}
                            className="hidden md:flex p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
                            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                            aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                        >
                            <svg className={`w-5 h-5 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
                            </svg>
                        </button>

                        {/* Mobile close button */}
                        <button
                            onClick={() => setMobileOpen && setMobileOpen(false)}
                            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
                            title="Close Menu"
                            aria-label="Close Mobile Navigation Drawer"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Navigation Items (Scrollable) */}
                <nav className="mt-3 px-3 flex-1 overflow-y-auto overflow-x-hidden space-y-1.5 min-h-0 pb-4">
                    {navigationItems.filter(item => item.show).map((item) => {
                        const hasChildren = item.children && item.children.length > 0
                        const isParentActive = location.pathname === item.path
                        const hasActiveChild = hasChildren && item.children.some(child => location.pathname === child.path)
                        const isItemActive = isParentActive || hasActiveChild
                        const isExpanded = Boolean(openSubmenus[item.id])

                        if (hasChildren) {
                            return (
                                <div key={item.id} className="space-y-1">
                                    {/* Parent Row with open/close toggle on the right */}
                                    <div
                                        onClick={() => {
                                            if (isCollapsed && !mobileOpen) {
                                                handleToggleCollapse()
                                                setOpenSubmenus(prev => ({ ...prev, [item.id]: true }))
                                            } else {
                                                handleNavigation(item.path)
                                                setOpenSubmenus(prev => ({ ...prev, [item.id]: true }))
                                            }
                                        }}
                                        className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer select-none ${
                                            isItemActive
                                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                        title={isCollapsed && !mobileOpen ? item.title : ''}
                                    >
                                        <div className="flex items-center justify-center w-5 h-5 shrink-0">
                                            {item.icon}
                                        </div>
                                        {(!isCollapsed || mobileOpen) && (
                                            <>
                                                <span className="ml-3 flex-1 text-left font-semibold text-sm truncate">{item.title}</span>
                                                {item.badge && (
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold mr-1 ${
                                                        isItemActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {item.badge}
                                                    </span>
                                                )}
                                                {/* Open / Close button on the right */}
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setOpenSubmenus(prev => ({
                                                            ...prev,
                                                            [item.id]: !prev[item.id]
                                                        }))
                                                    }}
                                                    className={`p-1 rounded-md transition-all ml-1 ${
                                                        isItemActive
                                                            ? 'text-white/80 hover:text-white hover:bg-white/20'
                                                            : 'text-gray-400 hover:text-gray-800 hover:bg-gray-200'
                                                    }`}
                                                    title={isExpanded ? `Close ${item.title} menu` : `Open ${item.title} menu`}
                                                    aria-label={`Toggle ${item.title} sub-menu`}
                                                >
                                                    <svg
                                                        className={`w-4 h-4 transform transition-transform duration-200 ${
                                                            isExpanded ? 'rotate-90' : ''
                                                        }`}
                                                        fill="none"
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </>
                                        )}
                                    </div>

                                    {/* Expanded Children */}
                                    {(!isCollapsed || mobileOpen) && isExpanded && (
                                        <div className="ml-4 pl-3 border-l-2 border-indigo-200 space-y-1 py-1 transition-all">
                                            {item.children.map(subItem => {
                                                const isSubActive = location.pathname === subItem.path
                                                return (
                                                    <button
                                                        key={subItem.id}
                                                        type="button"
                                                        onClick={() => handleNavigation(subItem.path)}
                                                        className={`w-full flex items-center px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                                                            isSubActive
                                                                ? 'bg-blue-50 text-blue-700 font-bold shadow-2xs border border-blue-200'
                                                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                                        }`}
                                                    >
                                                        <div className="w-4 h-4 mr-2.5 flex items-center justify-center shrink-0 text-current">
                                                            {subItem.icon}
                                                        </div>
                                                        <span className="flex-1 text-left truncate">{subItem.title}</span>
                                                        {subItem.badge && (
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-1 ${
                                                                isSubActive ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-700'
                                                            }`}>
                                                                {subItem.badge}
                                                            </span>
                                                        )}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )
                        }

                        // Standard item without children
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavigation(item.path)}
                                className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${isItemActive
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                    }`}
                                title={isCollapsed && !mobileOpen ? item.title : ''}
                            >
                                <div className="flex items-center justify-center w-5 h-5 shrink-0">
                                    {item.icon}
                                </div>
                                {(!isCollapsed || mobileOpen) && (
                                    <>
                                        <span className="ml-3 flex-1 text-left truncate">{item.title}</span>
                                        {item.badge && (
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isItemActive ? 'bg-white/20 text-white' : (item.badgeColor || 'bg-blue-100 text-blue-800')
                                                }`}>
                                                {item.badge}
                                            </span>
                                        )}
                                    </>
                                )}
                                {isCollapsed && !mobileOpen && item.badge && (
                                    <span className={`absolute left-8 top-2 w-2 h-2 rounded-full ${item.badgeColor || 'bg-blue-500'
                                        }`}></span>
                                )}
                            </button>
                        )
                    })}
                </nav>

                {/* Sidebar Footer (Firmly anchored at bottom, never overlaps scrollable navigation) */}
                {(!isCollapsed || mobileOpen) && (
                    <div className="shrink-0 p-3.5 border-t border-gray-200 bg-white">
                        <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shrink-0">
                                <span className="text-white font-medium text-sm">
                                    {(user?.name || user?.email)?.charAt(0)?.toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-gray-900 truncate">
                                    {user?.name || user?.email}
                                </p>
                                <p className="text-[11px] text-gray-500 capitalize truncate">
                                    {user?.role?.replace('_', ' ')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    )
}

// Shared Header Component
export function AppHeader({ searchQuery, setSearchQuery, showUserMenu, setShowUserMenu, showNotifications, setShowNotifications, onToggleMobileMenu }) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const userMenuRef = useRef(null)
    const notificationRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu && setShowUserMenu(false)
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications && setShowNotifications(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [setShowUserMenu, setShowNotifications])

    const handleLogout = async () => {
        try {
            await logout()
            navigate('/login')
        } catch (error) {
            console.error('Logout error:', error)
            navigate('/login')
        }
    }

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery?.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
        }
    }

    const handleNavigation = (path) => {
        navigate(path)
    }

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
            <div className="px-4 sm:px-6 py-3.5">
                <div className="flex items-center justify-between gap-3">
                    {/* Mobile Hamburger Button */}
                    {onToggleMobileMenu && (
                        <button
                            type="button"
                            onClick={onToggleMobileMenu}
                            className="p-2 -ml-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl md:hidden transition-colors focus:outline-none shrink-0"
                            aria-label="Open mobile navigation drawer"
                            id="mobile-drawer-hamburger-btn"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    )}

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex-1 max-w-lg">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search equipment, labs, or categories..."
                                value={searchQuery || ''}
                                onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-xs sm:text-sm"
                            />
                            <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>
                    </form>

                    {/* Header Right Section */}
                    <div className="flex items-center space-x-2 sm:space-x-4 shrink-0">
                        {/* Notifications */}
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => setShowNotifications && setShowNotifications(!showNotifications)}
                                className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors bg-gray-50 rounded-xl hover:bg-gray-100"
                                title="Notifications"
                            >
                                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                                </svg>
                            </button>
                        </div>

                        {/* User Menu */}
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setShowUserMenu && setShowUserMenu(!showUserMenu)}
                                className="flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-medium text-xs sm:text-sm shadow-2xs">
                                    {(user?.name || user?.email)?.charAt(0)?.toUpperCase()}
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate max-w-[120px]">{user?.name || user?.email}</p>
                                    <p className="text-[10px] sm:text-xs text-gray-500 capitalize truncate">{user?.role?.replace('_', ' ')}</p>
                                </div>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </button>

                            {/* User Dropdown */}
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                                    <div className="px-4 py-2.5 border-b border-gray-100">
                                        <p className="text-xs sm:text-sm font-bold text-gray-900 truncate">{user?.name || user?.email}</p>
                                        <p className="text-[11px] text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                                    </div>
                                    <button
                                        onClick={() => handleNavigation('/profile')}
                                        className="w-full px-4 py-2 text-left text-xs sm:text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3 transition-colors"
                                    >
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                        </svg>
                                        <span>Profile Settings</span>
                                    </button>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full px-4 py-2 text-left text-xs sm:text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3 transition-colors"
                                    >
                                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                        </svg>
                                        <span>Sign Out</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}