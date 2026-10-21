// src/pages/Dashboard.jsx - Professional Dashboard with Sidebar and Real Backend Integration
import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Sidebar, AppHeader } from '../components/common/Navigation'

// Fetch with timeout utility
const fetchWithTimeout = (url, options = {}, timeout = 5000) => {
    return Promise.race([
        fetch(url, options),
        new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Request timeout')), timeout)
        )
    ])
}

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalLabs: 0,
        totalEquipment: 0,
        totalBookings: 0,
        activeBookings: 0,
        totalOrders: 0,
        pendingOrders: 0,
        totalUsers: 0,
        activeUsers: 0,
        totalIncidents: 0,
        completedTrainings: 0,
        pendingMaintenances: 0
    })

    const [recentActivities, setRecentActivities] = useState([])
    const [upcomingBookings, setUpcomingBookings] = useState([])
    const [systemAlerts, setSystemAlerts] = useState([])
    const [recentLabs, setRecentLabs] = useState([])
    const [recentOrders, setRecentOrders] = useState([])
    const [equipmentStatus, setEquipmentStatus] = useState([])
    const [notifications, setNotifications] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)

    const [systemStatus, setSystemStatus] = useState({
        server: 'checking',
        database: 'checking',
        lastBackup: null,
        uptime: '0%',
        activeUsers: 0,
        systemLoad: 0
    })

    const [timeBasedGreeting, setTimeBasedGreeting] = useState('')
    const [currentTime, setCurrentTime] = useState(new Date())
    const [loading, setLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [error, setError] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [showActivitiesModal, setShowActivitiesModal] = useState(false)
    const [allActivities, setAllActivities] = useState([])
    const [loadingActivities, setLoadingActivities] = useState(false)

    const { user, logout, isAuthenticated, loading: authLoading } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const userMenuRef = useRef(null)
    const notificationRef = useRef(null)
    const API_BASE_URL = '/api'

    // Time-based greeting and clock
    useEffect(() => {
        const updateTime = () => {
            const now = new Date()
            setCurrentTime(now)

            const hour = now.getHours()
            if (hour < 12) setTimeBasedGreeting('Good Morning')
            else if (hour < 17) setTimeBasedGreeting('Good Afternoon')
            else if (hour < 21) setTimeBasedGreeting('Good Evening')
            else setTimeBasedGreeting('Good Night')
        }

        updateTime()
        const timer = setInterval(updateTime, 1000)
        return () => clearInterval(timer)
    }, [])

    // Click outside handler for dropdowns
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
    }, [])

    // Escape key handler to close menus/search/modals
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' || event.key === 'Esc') {
                if (showActivitiesModal) {
                    setShowActivitiesModal(false)
                } else if (showUserMenu) {
                    setShowUserMenu(false)
                } else if (showNotifications) {
                    setShowNotifications(false)
                } else if (searchQuery) {
                    setSearchQuery('')
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [showActivitiesModal, showUserMenu, showNotifications, searchQuery])

    // Load dashboard data
    useEffect(() => {
        // Set document title
        document.title = 'Dashboard | NEC LabMS'
        
        console.log('📊 Dashboard useEffect triggered', { 
            authLoading, 
            isAuthenticated, 
            hasUser: !!user,
            userId: user?.id,
            userEmail: user?.email
        })
        
        if (authLoading) {
            console.log('⏳ Waiting for auth to complete...')
            return // Wait for auth to complete
        }
        
        if (!isAuthenticated) {
            console.log('🚫 User not authenticated, redirecting to login', {
                user: user,
                userExists: !!user,
                userId: user?.id
            })
            navigate('/login')
            return
        }
        
        console.log('✅ User authenticated, loading dashboard data')
        loadDashboardData()
    }, [isAuthenticated, authLoading, navigate])

    const fetchNotificationCount = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/notifications?unread_only=true`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                const result = await response.json()
                if (result.success) {
                    setUnreadCount(result.data?.length || 0)
                }
            }
        } catch (error) {
            console.error('Error fetching notification count:', error)
        }
    }

    const fetchRecentNotifications = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/notifications?limit=3`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                const result = await response.json()
                if (result.success) {
                    // Normalize notification data
                    const normalizedNotifications = (result.data || []).map(notification => ({
                        ...notification,
                        title: typeof notification.title === 'string' ? notification.title : String(notification.title || 'Notification'),
                        message: typeof notification.message === 'string' ? notification.message : String(notification.message || ''),
                        created_at: notification.created_at || new Date().toISOString()
                    }))
                    setNotifications(normalizedNotifications)
                }
            }
        } catch (error) {
            console.error('Error fetching recent notifications:', error)
        }
    }

    const fetchStats = async () => {
        try {
            const headers = {
                'Content-Type': 'application/json'
            }

            const responses = await Promise.allSettled([
                fetch(`${API_BASE_URL}/labs/stats`, { credentials: 'include', headers }),
                fetch(`${API_BASE_URL}/equipment/stats`, { credentials: 'include', headers }),
                fetch(`${API_BASE_URL}/bookings/stats`, { credentials: 'include', headers }),
                fetch(`${API_BASE_URL}/orders/stats`, { credentials: 'include', headers }),
                fetch(`${API_BASE_URL}/users/stats`, { credentials: 'include', headers }),
                fetch(`${API_BASE_URL}/incidents/stats`, { credentials: 'include', headers }),
                fetch(`${API_BASE_URL}/training/stats`, { credentials: 'include', headers }),
                fetch(`${API_BASE_URL}/maintenance/stats`, { credentials: 'include', headers })
            ])

            const newStats = { ...stats }

            // Process lab stats
            if (responses[0].status === 'fulfilled' && responses[0].value.ok) {
                const labData = await responses[0].value.json()
                if (labData.success) {
                    newStats.totalLabs = labData.data.total || 0
                }
            }

            // Process equipment stats
            if (responses[1].status === 'fulfilled' && responses[1].value.ok) {
                const equipmentData = await responses[1].value.json()
                if (equipmentData.success) {
                    newStats.totalEquipment = equipmentData.data.total || 0
                }
            }

            // Process booking stats
            if (responses[2].status === 'fulfilled' && responses[2].value.ok) {
                const bookingData = await responses[2].value.json()
                if (bookingData.success) {
                    newStats.totalBookings = bookingData.data.total || 0
                    newStats.activeBookings = bookingData.data.active || 0
                }
            }

            // Process order stats (admin only)
            if (user?.role === 'admin' && responses[3].status === 'fulfilled' && responses[3].value.ok) {
                const orderData = await responses[3].value.json()
                if (orderData.success) {
                    newStats.totalOrders = orderData.data.total || 0
                    newStats.pendingOrders = orderData.data.pending || 0
                }
            }

            // Process user stats (admin only)
            if (user?.role === 'admin' && responses[4].status === 'fulfilled' && responses[4].value.ok) {
                const userData = await responses[4].value.json()
                if (userData.success) {
                    newStats.totalUsers = userData.data.total || 0
                    newStats.activeUsers = userData.data.active || 0
                }
            }

            // Process incident stats
            if (responses[5].status === 'fulfilled' && responses[5].value.ok) {
                const incidentData = await responses[5].value.json()
                if (incidentData.success) {
                    newStats.totalIncidents = incidentData.data.open || 0
                }
            }

            // Process training stats
            if (responses[6].status === 'fulfilled' && responses[6].value.ok) {
                const trainingData = await responses[6].value.json()
                if (trainingData.success) {
                    newStats.completedTrainings = trainingData.data.completed || 0
                }
            }

            // Process maintenance stats
            if (responses[7].status === 'fulfilled' && responses[7].value.ok) {
                const maintenanceData = await responses[7].value.json()
                if (maintenanceData.success) {
                    newStats.pendingMaintenances = maintenanceData.data.pending || 0
                }
            }

            setStats(newStats)
        } catch (error) {
            console.error('Error fetching stats:', error)
        }
    }

    const fetchRecentActivities = async () => {
        try {
            console.log('📊 Fetching recent activities...')
            const response = await fetch(`${API_BASE_URL}/activities/recent?limit=10`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            console.log('📊 Activities response status:', response.status)
            if (response.ok) {
                const result = await response.json()
                console.log('📊 Activities result:', result)
                if (result.success) {
                    console.log('📊 Activities data:', result.data)
                    console.log('📊 Setting activities:', Array.isArray(result.data) ? result.data.length : 'Not an array')
                    // Normalize data to ensure all values are primitives
                    const normalizedActivities = (result.data || []).map(activity => ({
                        ...activity,
                        description: typeof activity.description === 'string' ? activity.description : String(activity.description || ''),
                        user_name: typeof activity.user_name === 'string' ? activity.user_name : String(activity.user_name || 'Unknown'),
                        type: typeof activity.type === 'string' ? activity.type : String(activity.type || ''),
                        created_at: activity.created_at || new Date().toISOString()
                    }))
                    setRecentActivities(normalizedActivities)
                } else {
                    console.warn('📊 Activities success=false')
                }
            } else {
                console.error('📊 Activities response not ok:', response.status)
            }
        } catch (error) {
            console.error('Error fetching recent activities:', error)
        }
    }

    const fetchAllActivities = async () => {
        setLoadingActivities(true)
        try {
            const response = await fetch(`${API_BASE_URL}/activities/recent?limit=100`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                const result = await response.json()
                if (result.success) {
                    // Normalize data to ensure all values are primitives
                    const normalizedActivities = (result.data || []).map(activity => ({
                        ...activity,
                        description: typeof activity.description === 'string' ? activity.description : String(activity.description || ''),
                        user_name: typeof activity.user_name === 'string' ? activity.user_name : String(activity.user_name || 'Unknown'),
                        type: typeof activity.type === 'string' ? activity.type : String(activity.type || ''),
                        created_at: activity.created_at || new Date().toISOString()
                    }))
                    setAllActivities(normalizedActivities)
                }
            }
        } catch (error) {
            console.error('Error fetching all activities:', error)
        } finally {
            setLoadingActivities(false)
        }
    }

    const handleViewAllActivities = () => {
        setShowActivitiesModal(true)
        fetchAllActivities()
    }

    const fetchUpcomingBookings = async () => {
        try {
            console.log('📅 Fetching upcoming bookings...')
            const response = await fetch(`${API_BASE_URL}/bookings/upcoming?limit=5`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            console.log('📅 Upcoming bookings response status:', response.status)
            if (response.ok) {
                const result = await response.json()
                console.log('📅 Upcoming bookings result:', result)
                if (result.success) {
                    console.log('📅 Upcoming bookings data:', result.data)
                    console.log('📅 Setting upcoming bookings:', Array.isArray(result.data) ? result.data.length : 'Not an array')
                    // Normalize data to ensure all values are primitives
                    const normalizedBookings = (result.data || []).map(booking => ({
                        ...booking,
                        lab_name: typeof booking.lab_name === 'string' ? booking.lab_name : (booking.lab_name ? String(booking.lab_name) : null),
                        equipment_name: typeof booking.equipment_name === 'string' ? booking.equipment_name : (booking.equipment_name ? String(booking.equipment_name) : null),
                        purpose: typeof booking.purpose === 'string' ? booking.purpose : String(booking.purpose || ''),
                        status: typeof booking.status === 'object' && booking.status !== null ? String(booking.status.status || booking.status) : (typeof booking.status === 'string' ? booking.status : String(booking.status || 'Unknown')),
                        start_time: booking.start_time || new Date().toISOString()
                    }))
                    setUpcomingBookings(normalizedBookings)
                } else {
                    console.warn('📅 Upcoming bookings success=false')
                }
            } else {
                console.error('📅 Upcoming bookings response not ok:', response.status)
            }
        } catch (error) {
            console.error('Error fetching upcoming bookings:', error)
        }
    }

    const fetchSystemAlerts = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/system/alerts?limit=5`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                const result = await response.json()
                if (result.success) {
                    setSystemAlerts(result.data || [])
                }
            }
        } catch (error) {
            console.error('Error fetching system alerts:', error)
        }
    }

    const fetchRecentLabs = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/labs?limit=5&sort=created_at&order=desc`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                const result = await response.json()
                if (result.success) {
                    setRecentLabs(result.data?.labs || result.data || [])
                }
            }
        } catch (error) {
            console.error('Error fetching recent labs:', error)
        }
    }

    const fetchRecentOrders = async () => {
        if (user?.role !== 'admin') return

        try {
            const response = await fetch(`${API_BASE_URL}/orders?limit=5&sort=created_at&order=desc`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                const result = await response.json()
                if (result.success) {
                    // Normalize order data
                    const normalizedOrders = (result.data || []).map(order => ({
                        ...order,
                        equipment_name: typeof order.equipment_name === 'string' ? order.equipment_name : String(order.equipment_name || 'N/A'),
                        supplier: typeof order.supplier === 'string' ? order.supplier : String(order.supplier || 'N/A'),
                        status: typeof order.status === 'object' && order.status !== null ? String(order.status.status || order.status) : (typeof order.status === 'string' ? order.status : String(order.status || 'Unknown')),
                        total_amount: typeof order.total_amount === 'number' ? order.total_amount : parseFloat(order.total_amount) || 0
                    }))
                    setRecentOrders(normalizedOrders)
                }
            }
        } catch (error) {
            console.error('Error fetching recent orders:', error)
        }
    }

    const fetchEquipmentStatus = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/equipment/status-summary`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                const result = await response.json()
                if (result.success) {
                    // Normalize equipment status data to ensure all fields are strings
                    const normalizedEquipment = (result.data || []).map(equipment => ({
                        ...equipment,
                        name: typeof equipment.name === 'string' ? equipment.name : String(equipment.name || 'Unknown'),
                        status: typeof equipment.status === 'object' && equipment.status !== null ? String(equipment.status.status || equipment.status) : (typeof equipment.status === 'string' ? equipment.status : String(equipment.status || 'unknown')),
                        location: typeof equipment.location === 'string' ? equipment.location : String(equipment.location || 'N/A'),
                        current_user: equipment.current_user ? (typeof equipment.current_user === 'string' ? equipment.current_user : String(equipment.current_user)) : null
                    }))
                    setEquipmentStatus(normalizedEquipment)
                }
            }
        } catch (error) {
            console.error('Error fetching equipment status:', error)
        }
    }

    const checkSystemStatus = async () => {
        try {
            const headers = {
                'Content-Type': 'application/json'
            }

            const responses = await Promise.allSettled([
                fetch(`${API_BASE_URL}/system/health`, { credentials: 'include', headers }),
                fetch(`${API_BASE_URL}/system/metrics`, { credentials: 'include', headers })
            ])

            const newStatus = { ...systemStatus }

            // Process health check
            if (responses[0].status === 'fulfilled' && responses[0].value.ok) {
                const healthData = await responses[0].value.json()
                if (healthData.success) {
                    newStatus.server = healthData.data.server || 'online'
                    newStatus.database = healthData.data.database || 'connected'
                    newStatus.lastBackup = healthData.data.lastBackup || new Date().toISOString()
                }
            }

            // Process metrics
            if (responses[1].status === 'fulfilled' && responses[1].value.ok) {
                const metricsData = await responses[1].value.json()
                if (metricsData.success) {
                    newStatus.uptime = metricsData.data.uptime || '99.9%'
                    newStatus.activeUsers = metricsData.data.activeUsers || 0
                    newStatus.systemLoad = metricsData.data.systemLoad || 0
                }
            }

            setSystemStatus(newStatus)
        } catch (error) {
            console.error('Error checking system status:', error)
            setSystemStatus({
                server: 'error',
                database: 'error',
                lastBackup: null,
                uptime: '0%',
                activeUsers: 0,
                systemLoad: 0
            })
        }
    }

    const loadDashboardData = async () => {
        console.log('🔄 Loading dashboard data...')
        setLoading(true)
        setError('')

        try {
            // Use allSettled instead of all to continue even if some requests fail
            // Add timeout to prevent infinite loading
            const timeout = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Dashboard load timeout')), 15000) // Increased timeout
            )

            await Promise.race([
                Promise.allSettled([
                    fetchStats(),
                    fetchRecentActivities(),
                    fetchUpcomingBookings(),
                    fetchSystemAlerts(),
                    fetchRecentLabs(),
                    fetchRecentOrders(),
                    fetchEquipmentStatus(),
                    checkSystemStatus(),
                    fetchNotificationCount()
                ]),
                timeout
            ])
            console.log('✅ Dashboard data loaded successfully')
        } catch (error) {
            console.error('❌ Error loading dashboard data:', error)
            setError('Some dashboard data failed to load')
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        setIsRefreshing(true)
        try {
            await loadDashboardData()
        } finally {
            setTimeout(() => setIsRefreshing(false), 600)
        }
    }

    const handleNavigation = (path) => {
        try {
            navigate(path)
        } catch (err) {
            console.error('Navigation error:', err)
            setError(`Failed to navigate to ${path}`)
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

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
        }
    }

    const handleNotificationDropdown = async () => {
        if (!showNotifications) {
            await fetchRecentNotifications()
        }
        setShowNotifications(!showNotifications)
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'online':
            case 'connected':
                return 'text-green-600'
            case 'offline':
            case 'disconnected':
            case 'error':
                return 'text-red-600'
            case 'checking':
                return 'text-yellow-600'
            default:
                return 'text-gray-600'
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'online':
            case 'connected':
                return '🟢'
            case 'offline':
            case 'disconnected':
            case 'error':
                return '🔴'
            case 'checking':
                return '🟡'
            default:
                return '⚪'
        }
    }

    const formatTimeAgo = (timestamp) => {
        const now = new Date()
        const time = new Date(timestamp)
        const diffInSeconds = Math.floor((now - time) / 1000)

        if (diffInSeconds < 60) return 'Just now'
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
        return time.toLocaleDateString()
    }

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
                    </div>
                    <p className="text-gray-600 mt-4 font-medium">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen w-full bg-gray-50 flex">
            {/* Shared Sidebar Component */}
            <Sidebar 
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
                currentPath="/dashboard"
                stats={stats}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

                        {/* Main Content */}
            <div className={`flex-1 min-w-0 transition-all duration-300 overflow-x-hidden ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
                {/* Shared Header Component */}
                <AppHeader 
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    showUserMenu={showUserMenu}
                    setShowUserMenu={setShowUserMenu}
                    showNotifications={showNotifications}
                    setShowNotifications={setShowNotifications}
                    onToggleMobileMenu={() => setMobileOpen(!mobileOpen)}
                />

                {/* Dashboard Content */}
                <main className="p-6">
                    {/* Error Display */}
                    {error && (
                        <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                                </svg>
                                <span>{error}</span>
                                <button
                                    onClick={() => setError('')}
                                    className="ml-auto hover:text-red-900"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Welcome Section */}
                    <div className="mb-8">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    {timeBasedGreeting}, {user?.name || user?.email?.split('@')[0]}! 👋
                                </h1>
                                <p className="mt-2 text-gray-600">
                                    Welcome back to your lab management dashboard. Here's what's happening today.
                                </p>
                            </div>
                            <div className="mt-4 md:mt-0 flex items-center space-x-4">
                                <button
                                    onClick={handleRefresh}
                                    disabled={isRefreshing}
                                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center space-x-2 disabled:opacity-75 disabled:cursor-wait"
                                    title="Refresh Dashboard"
                                >
                                    <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-700' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                    </svg>
                                    <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Labs</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.totalLabs}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Equipment</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.totalEquipment}</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Active Bookings</p>
                                    <p className="text-3xl font-bold text-gray-900">{stats.activeBookings}</p>
                                    <p className="text-xs text-gray-500">Total: {stats.totalBookings}</p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Total Users Card - Show for admins */}
                        {user?.role === 'admin' && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                                        <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                                        <p className="text-xs text-gray-500">Active: {stats.activeUsers || 0}</p>
                                    </div>
                                    <div className="p-3 bg-indigo-100 rounded-full">
                                        <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        )}

                        {stats.totalIncidents > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Open Incidents</p>
                                        <p className="text-3xl font-bold text-red-600">{stats.totalIncidents}</p>
                                    </div>
                                    <div className="p-3 bg-red-100 rounded-full">
                                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.982 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        )}

                        {user?.role === 'admin' && stats.pendingOrders > 0 && (
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                                        <p className="text-3xl font-bold text-orange-600">{stats.pendingOrders}</p>
                                        <p className="text-xs text-gray-500">Total: {stats.totalOrders}</p>
                                    </div>
                                    <div className="p-3 bg-orange-100 rounded-full">
                                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Recent Activities & Equipment Status */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Recent Activities */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
                                    <button
                                        onClick={handleViewAllActivities}
                                        className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                                    >
                                        View All
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {recentActivities.length > 0 ? (
                                        recentActivities.slice(0, 5).map(activity => (
                                            <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                                                <div className="flex-shrink-0">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activity.type === 'booking' ? 'bg-blue-100 text-blue-600' :
                                                        activity.type === 'incident' ? 'bg-red-100 text-red-600' :
                                                            activity.type === 'maintenance' ? 'bg-yellow-100 text-yellow-600' :
                                                                'bg-green-100 text-green-600'
                                                        }`}>
                                                        <span className="text-sm">
                                                            {activity.type === 'booking' && '📅'}
                                                            {activity.type === 'incident' && '⚠️'}
                                                            {activity.type === 'maintenance' && '🔧'}
                                                            {activity.type === 'equipment' && '📦'}
                                                            {!['booking', 'incident', 'maintenance', 'equipment'].includes(activity.type) && '✅'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                                                    <div className="flex items-center mt-1 text-xs text-gray-500">
                                                        <span>{activity.user_name}</span>
                                                        <span className="mx-1">•</span>
                                                        <span>{new Date(activity.created_at).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                            <p>No recent activities</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Equipment Status */}
                            {equipmentStatus.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-gray-900">Equipment Status</h2>
                                        <button
                                            onClick={() => handleNavigation('/equipment')}
                                            className="text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            View All
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {equipmentStatus.slice(0, 4).map(equipment => (
                                            <div key={equipment.id} className="p-4 border border-gray-200 rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="font-medium text-gray-900">
                                                        {typeof equipment.name === 'string' ? equipment.name : 'Unknown Equipment'}
                                                    </h3>
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${(typeof equipment.status === 'string' ? equipment.status : String(equipment.status || '')) === 'available' ? 'bg-green-100 text-green-800' :
                                                        (typeof equipment.status === 'string' ? equipment.status : String(equipment.status || '')) === 'in_use' ? 'bg-blue-100 text-blue-800' :
                                                            (typeof equipment.status === 'string' ? equipment.status : String(equipment.status || '')) === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                        }`}>
                                                        {typeof equipment.status === 'string' ? equipment.status.replace('_', ' ') : 'Unknown'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    {typeof equipment.location === 'string' ? equipment.location : 'N/A'}
                                                </p>
                                                {equipment.current_user && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        Used by: {typeof equipment.current_user === 'string' ? equipment.current_user : 'Unknown'}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recent Labs */}
                            {recentLabs.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-gray-900">Recent Labs</h2>
                                        <button
                                            onClick={() => handleNavigation('/lab-management')}
                                            className="text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            View All
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {recentLabs.slice(0, 5).map(lab => (
                                            <div key={lab.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                                <div>
                                                    <h3 className="font-medium text-gray-900">{lab.name}</h3>
                                                    <p className="text-sm text-gray-600">{lab.location}</p>
                                                    <p className="text-xs text-gray-500">
                                                        Created: {new Date(lab.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {lab.lab_type?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'General'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Right Column - System Status & Upcoming */}
                        <div className="space-y-8">
                            {/* System Status */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">System Status</h2>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">Server</span>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm">{getStatusIcon(systemStatus.server)}</span>
                                            <span className={`text-sm font-medium ${getStatusColor(systemStatus.server)}`}>
                                                {systemStatus.server}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">Database</span>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm">{getStatusIcon(systemStatus.database)}</span>
                                            <span className={`text-sm font-medium ${getStatusColor(systemStatus.database)}`}>
                                                {systemStatus.database}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">Uptime</span>
                                        <span className="text-sm text-gray-600">{systemStatus.uptime}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">Active Users</span>
                                        <span className="text-sm text-gray-600">{systemStatus.activeUsers}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">System Load</span>
                                        <span className="text-sm text-gray-600">{systemStatus.systemLoad}%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">Last Backup</span>
                                        <span className="text-sm text-gray-600">
                                            {systemStatus.lastBackup ?
                                                new Date(systemStatus.lastBackup).toLocaleDateString() :
                                                'Unknown'
                                            }
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Upcoming Bookings */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">Upcoming Bookings</h2>
                                    <button
                                        onClick={() => handleNavigation('/calendar')}
                                        className="text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        View Calendar
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {upcomingBookings.length > 0 ? (
                                        upcomingBookings.map(booking => (
                                            <div key={booking.id} className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded-r-lg">
                                                <h3 className="font-medium text-gray-900">
                                                    {typeof booking.lab_name === 'string' ? booking.lab_name : 
                                                     typeof booking.equipment_name === 'string' ? booking.equipment_name : 
                                                     'Resource'}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {typeof booking.purpose === 'string' ? booking.purpose : 'N/A'}
                                                </p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs text-gray-500">
                                                        {booking.start_time ? new Date(booking.start_time).toLocaleString() : 'N/A'}
                                                    </span>
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${(typeof booking.status === 'string' ? booking.status : String(booking.status || '')) === 'Confirmed' ? 'bg-green-100 text-green-800' :
                                                        (typeof booking.status === 'string' ? booking.status : String(booking.status || '')) === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {typeof booking.status === 'string' ? booking.status : String(booking.status || 'Unknown')}
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                            </svg>
                                            <p>No upcoming bookings</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Recent Orders - Admin Only */}
                            {user?.role === 'admin' && recentOrders.length > 0 && (
                                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                                        <button
                                            onClick={() => handleNavigation('/orders')}
                                            className="text-sm text-blue-600 hover:text-blue-700"
                                        >
                                            View All
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {recentOrders.slice(0, 5).map(order => (
                                            <div key={order.id} className="p-4 border border-gray-200 rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="font-medium text-gray-900">Order #{order.id}</h3>
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${(typeof order.status === 'string' ? order.status : String(order.status || '')) === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                                                        (typeof order.status === 'string' ? order.status : String(order.status || '')) === 'Approved' ? 'bg-blue-100 text-blue-800' :
                                                            (typeof order.status === 'string' ? order.status : String(order.status || '')) === 'Delivered' ? 'bg-green-100 text-green-800' :
                                                                'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {typeof order.status === 'string' ? order.status : String(order.status || 'Unknown')}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    {typeof order.equipment_name === 'string' ? order.equipment_name : 'N/A'}
                                                </p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs text-gray-500">
                                                        {typeof order.supplier === 'string' ? order.supplier : 'N/A'}
                                                    </span>
                                                    <span className="text-sm font-medium text-gray-900">
                                                        ${typeof order.total_amount === 'number' ? order.total_amount : (order.total_amount || 0)}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quick Stats */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Summary</h2>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Total Resources</span>
                                        <span className="text-lg font-bold text-blue-600">
                                            {stats.totalLabs + stats.totalEquipment}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Completed Trainings</span>
                                        <span className="text-lg font-bold text-green-600">{stats.completedTrainings}</span>
                                    </div>
                                    {user?.role === 'admin' && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Total Users</span>
                                            <span className="text-lg font-bold text-purple-600">{stats.totalUsers}</span>
                                        </div>
                                    )}
                                    {stats.pendingMaintenances > 0 && (
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Pending Maintenance</span>
                                            <span className="text-lg font-bold text-yellow-600">{stats.pendingMaintenances}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/* Recent Activities Modal */}
                {showActivitiesModal && (
                    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                            {/* Background overlay */}
                            <div 
                                className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
                                aria-hidden="true"
                                onClick={() => setShowActivitiesModal(false)}
                            ></div>

                            {/* Center modal */}
                            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                            {/* Modal panel */}
                            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    {/* Modal Header */}
                                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                                        <h3 className="text-2xl font-bold text-gray-900 flex items-center" id="modal-title">
                                            <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                            </svg>
                                            All Recent Activities
                                        </h3>
                                        <button
                                            onClick={() => setShowActivitiesModal(false)}
                                            className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                        >
                                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Modal Body */}
                                    <div className="max-h-[600px] overflow-y-auto">
                                        {loadingActivities ? (
                                            <div className="flex items-center justify-center py-12">
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                            </div>
                                        ) : allActivities.length > 0 ? (
                                            <div className="space-y-3">
                                                {allActivities.map((activity, index) => (
                                                    <div 
                                                        key={activity.id || index} 
                                                        className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                                    >
                                                        <div className="flex-shrink-0">
                                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                                activity.type === 'booking' ? 'bg-blue-100 text-blue-600' :
                                                                activity.type === 'incident' ? 'bg-red-100 text-red-600' :
                                                                activity.type === 'maintenance' ? 'bg-yellow-100 text-yellow-600' :
                                                                activity.type === 'equipment' ? 'bg-purple-100 text-purple-600' :
                                                                activity.type === 'lab' ? 'bg-green-100 text-green-600' :
                                                                'bg-gray-100 text-gray-600'
                                                            }`}>
                                                                <span className="text-lg">
                                                                    {activity.type === 'booking' && '📅'}
                                                                    {activity.type === 'incident' && '⚠️'}
                                                                    {activity.type === 'maintenance' && '🔧'}
                                                                    {activity.type === 'equipment' && '📦'}
                                                                    {activity.type === 'lab' && '🧪'}
                                                                    {!['booking', 'incident', 'maintenance', 'equipment', 'lab'].includes(activity.type) && '✅'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {typeof activity.description === 'string' ? activity.description : JSON.stringify(activity.description || '')}
                                                            </p>
                                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                                    {typeof activity.user_name === 'string' ? activity.user_name : 'Unknown'}
                                                                </span>
                                                                <span className="text-xs text-gray-500">
                                                                    {activity.created_at ? new Date(activity.created_at).toLocaleString('en-US', {
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                        year: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    }) : 'N/A'}
                                                                </span>
                                                                {activity.type && typeof activity.type === 'string' && (
                                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                                                        activity.type === 'booking' ? 'bg-blue-50 text-blue-700' :
                                                                        activity.type === 'incident' ? 'bg-red-50 text-red-700' :
                                                                        activity.type === 'maintenance' ? 'bg-yellow-50 text-yellow-700' :
                                                                        activity.type === 'equipment' ? 'bg-purple-50 text-purple-700' :
                                                                        activity.type === 'lab' ? 'bg-green-50 text-green-700' :
                                                                        'bg-gray-50 text-gray-700'
                                                                    }`}>
                                                                        {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-12">
                                                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                </svg>
                                                <p className="text-gray-500 text-lg">No activities found</p>
                                                <p className="text-gray-400 text-sm mt-2">Activities will appear here as you use the system</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => setShowActivitiesModal(false)}
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Close
                                    </button>
                                    {allActivities.length > 0 && (
                                        <span className="mt-3 sm:mt-0 text-sm text-gray-500">
                                            Showing {allActivities.length} {allActivities.length === 1 ? 'activity' : 'activities'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}