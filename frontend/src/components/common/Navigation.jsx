// src/components/common/Navigation.jsx - Shared Navigation Configuration
import { useAuth } from '../../hooks/useAuth'
import { useNavigate, useLocation } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'

// Centralized Navigation Configuration
export const getNavigationItems = (user, stats = {}) => {
    return [
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
            show: true,
            badge: null
        },
        {
            id: 'lab-management',
            title: 'Lab Management',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                </svg>
            ),
            path: '/lab-management',
            show: true,
            badge: stats.totalLabs || null
        },
        {
            id: 'equipment',
            title: 'Equipment',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
            ),
            path: '/equipment',
            show: true,
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
                    id: 'equipment-categories',
                    title: 'Category Master',
                    path: '/equipment-categories',
                    badge: stats.totalCategories || null,
                    icon: (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    )
                },
                {
                    id: 'dealers',
                    title: 'Dealer Master',
                    path: '/dealers',
                    badge: stats.totalDealers || null,
                    icon: (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    )
                }
            ]
        },
        {
            id: 'bookings',
            title: 'Bookings',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
            ),
            path: '/bookings',
            show: true,
            badge: stats.activeBookings || null
        },
        {
            id: 'calendar',
            title: 'Calendar',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
            ),
            path: '/calendar',
            show: true,
            badge: null
        },
        {
            id: 'training',
            title: 'Training',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>
            ),
            path: '/training',
            show: true,
            badge: stats.completedTrainings || null
        },
        {
            id: 'incidents',
            title: 'Incidents',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.982 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
            ),
            path: '/incidents',
            show: true,
            badge: stats.totalIncidents || null,
            badgeColor: stats.totalIncidents > 0 ? 'bg-red-100 text-red-800' : null
        },
        {
            id: 'orders',
            title: 'Orders',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
            ),
            path: '/orders',
            show: user?.role === 'admin',
            badge: stats.pendingOrders || null,
            badgeColor: stats.pendingOrders > 0 ? 'bg-orange-100 text-orange-800' : null
        },
        {
            id: 'users',
            title: 'Users',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                </svg>
            ),
            path: '/users',
            show: user?.role === 'admin',
            badge: stats.totalUsers || null
        },
        {
            id: 'reports',
            title: 'Reports',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
            ),
            path: '/reports',
            show: user?.role === 'admin',
            badge: null
        },
        {
            id: 'maintenance',
            title: 'Maintenance',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
            ),
            path: '/maintenance',
            show: user?.role === 'admin' || user?.role === 'lab_technician',
            badge: stats.pendingMaintenances || null,
            badgeColor: stats.pendingMaintenances > 0 ? 'bg-yellow-100 text-yellow-800' : null
        },
        {
            id: 'notifications',
            title: 'Notifications',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                </svg>
            ),
            path: '/notifications',
            show: true,
            badge: stats.unreadNotifications || null,
            badgeColor: stats.unreadNotifications > 0 ? 'bg-blue-500 text-white' : null
        }
    ]
}

// Shared Sidebar Component
export function Sidebar({ sidebarCollapsed, setSidebarCollapsed, currentPath, stats = {} }) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

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

    const navigationItems = getNavigationItems(user, stats)

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
        <div className={`fixed inset-y-0 left-0 z-50 ${isCollapsed ? 'w-16' : 'w-64'} bg-white shadow-xl border-r border-gray-200 transition-all duration-300 flex flex-col`}>
            {/* Sidebar Header */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 shrink-0">
                {!isCollapsed && (
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
                <button
                    onClick={handleToggleCollapse}
                    className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors text-white"
                    title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                    <svg className={`w-5 h-5 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
                    </svg>
                </button>
            </div>

            {/* Navigation Items (Scrollable) */}
            <nav className="mt-4 px-3 flex-1 overflow-y-auto overflow-x-hidden space-y-1.5 pb-24">
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
                                        if (isCollapsed) {
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
                                    title={isCollapsed ? item.title : ''}
                                >
                                    <div className="flex items-center justify-center w-5 h-5 shrink-0">
                                        {item.icon}
                                    </div>
                                    {!isCollapsed && (
                                        <>
                                            <span className="ml-3 flex-1 text-left font-semibold text-sm">{item.title}</span>
                                            {item.badge && (
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold mr-1 ${
                                                    isItemActive ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                    {item.badge}
                                                </span>
                                            )}
                                            {/* Open / Close button on the right of Equipment */}
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

                                {/* Expanded Children: Category Master & Dealer Master */}
                                {!isCollapsed && isExpanded && (
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
                            title={isCollapsed ? item.title : ''}
                        >
                            <div className="flex items-center justify-center w-5 h-5 shrink-0">
                                {item.icon}
                            </div>
                            {!isCollapsed && (
                                <>
                                    <span className="ml-3 flex-1 text-left">{item.title}</span>
                                    {item.badge && (
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isItemActive ? 'bg-white/20 text-white' : (item.badgeColor || 'bg-blue-100 text-blue-800')
                                            }`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </>
                            )}
                            {isCollapsed && item.badge && (
                                <span className={`absolute left-8 top-2 w-2 h-2 rounded-full ${item.badgeColor || 'bg-blue-500'
                                    }`}></span>
                            )}
                        </button>
                    )
                })}
            </nav>

            {/* Sidebar Footer */}
            {!sidebarCollapsed && (
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                                {(user?.name || user?.email)?.charAt(0)?.toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {user?.name || user?.email}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                                {user?.role?.replace('_', ' ')}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

// Shared Header Component
export function AppHeader({ searchQuery, setSearchQuery, showUserMenu, setShowUserMenu, showNotifications, setShowNotifications }) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const userMenuRef = useRef(null)
    const notificationRef = useRef(null)

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false)
            }
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setShowNotifications(false)
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
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
        }
    }

    const handleNavigation = (path) => {
        navigate(path)
    }

    return (
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
            <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="flex-1 max-w-lg">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search equipment, labs, or categories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm"
                            />
                            <svg className="w-5 h-5 text-gray-400 absolute left-4 top-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                            </svg>
                        </div>
                    </form>

                    {/* Header Right Section */}
                    <div className="flex items-center space-x-4">
                        {/* Notifications */}
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 rounded-lg hover:bg-gray-100"
                                title="Notifications"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                                </svg>
                            </button>
                        </div>

                        {/* User Menu */}
                        <div className="relative" ref={userMenuRef}>
                            <button
                                onClick={() => setShowUserMenu(!showUserMenu)}
                                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-white font-medium text-sm">
                                        {(user?.name || user?.email)?.charAt(0)?.toUpperCase()}
                                    </span>
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-medium text-gray-900">{user?.name || user?.email}</p>
                                    <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                                </div>
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                </svg>
                            </button>

                            {/* User Dropdown */}
                            {showUserMenu && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
                                    <div className="px-4 py-3 border-b border-gray-100">
                                        <p className="text-sm font-medium text-gray-900">{user?.name || user?.email}</p>
                                        <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ')}</p>
                                    </div>
                                    <button
                                        onClick={() => handleNavigation('/profile')}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-3"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                        </svg>
                                        <span>Profile Settings</span>
                                    </button>
                                    <div className="border-t border-gray-100 my-1"></div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-3"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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