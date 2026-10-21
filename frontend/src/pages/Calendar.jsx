// src/pages/Calendar.jsx
import { Sidebar, AppHeader } from '../components/common/Navigation'
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Calendar() {
    // Calendar-specific state
    const [bookings, setBookings] = useState([])
    const [equipment, setEquipment] = useState([])
    const [labs, setLabs] = useState([])
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [error, setError] = useState('')
    const [currentDate, setCurrentDate] = useState(new Date())
    const [viewMode, setViewMode] = useState('month') // month, week, day
    const [selectedDate, setSelectedDate] = useState(new Date())
    const [showModal, setShowModal] = useState(false)
    const [selectedBooking, setSelectedBooking] = useState(null)
    const [filterStatus, setFilterStatus] = useState('all')
    const [filterType, setFilterType] = useState('all') // all, equipment, lab

    // Dashboard-style state
    const [searchQuery, setSearchQuery] = useState('')
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [currentTime, setCurrentTime] = useState(new Date())

    const { user, isAuthenticated, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const userMenuRef = useRef(null)
    const notificationRef = useRef(null)
    const API_BASE_URL = '/api'

    // Navigation items
    const navigationItems = [
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
            badge: null
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
            badge: null
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
            badge: bookings.length
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
            badge: null
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
            badge: null
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
            badge: null
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
            badge: null
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
            badge: null
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
            badge: null
        }
    ]

    // Time update effect
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)
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

    // Escape key handler to go back to previous state
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' || event.key === 'Esc') {
                if (showModal) {
                    setShowModal(false)
                    setSelectedBooking(null)
                } else if (showUserMenu) {
                    setShowUserMenu(false)
                } else if (showNotifications) {
                    setShowNotifications(false)
                } else if (searchQuery) {
                    setSearchQuery('')
                } else if (filterStatus !== 'all' || filterType !== 'all') {
                    setFilterStatus('all')
                    setFilterType('all')
                } else {
                    navigate(-1)
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [showModal, showUserMenu, showNotifications, searchQuery, filterStatus, filterType, navigate])

    useEffect(() => {
        // Set document title
        document.title = 'Calendar | NEC LabMS'
        
        if (!isAuthenticated) {
            navigate('/login')
            return
        }
        fetchData()
    }, [isAuthenticated, navigate])

    // Auto-refresh data every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (isAuthenticated) {
                fetchBookings()
            }
        }, 30000)
        return () => clearInterval(interval)
    }, [isAuthenticated])

    const fetchData = async () => {
        setLoading(true)
        setError('')
        try {
            await Promise.all([
                fetchBookings(),
                fetchEquipment(),
                fetchLabs(),
                ...(user?.role === 'admin' ? [fetchUsers()] : [])
            ])
        } catch (error) {
            console.error('Error fetching data:', error)
            setError('Failed to load calendar data')
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        setIsRefreshing(true)
        try {
            await Promise.all([
                fetchBookings(),
                fetchEquipment(),
                fetchLabs(),
                ...(user?.role === 'admin' ? [fetchUsers()] : [])
            ])
        } finally {
            setTimeout(() => setIsRefreshing(false), 600)
        }
    }

    const fetchBookings = async () => {
        try {
            const year = currentDate ? currentDate.getFullYear() : new Date().getFullYear();
            const startYear = `${year - 1}-01-01`;
            const endYear = `${year + 1}-12-31`;
            const response = await fetch(`${API_BASE_URL}/bookings?start_date=${startYear}&end_date=${endYear}&limit=1000`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            if (response.ok) {
                const result = await response.json()
                const bookingsData = result.data?.bookings || result.data || []
                setBookings(Array.isArray(bookingsData) ? bookingsData : [])
            } else {
                console.error('Failed to fetch bookings:', response.status)
            }
        } catch (error) {
            console.error('Error fetching bookings:', error)
        }
    }

    const fetchEquipment = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/equipment?limit=1000`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            if (response.ok) {
                const result = await response.json()
                const equipmentData = result.data?.equipment || result.data || []
                setEquipment(Array.isArray(equipmentData) ? equipmentData : [])
            }
        } catch (error) {
            console.error('Error fetching equipment:', error)
        }
    }

    const fetchLabs = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/labs`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            if (response.ok) {
                const result = await response.json()
                const labsData = result.data?.labs || result.data || []
                setLabs(Array.isArray(labsData) ? labsData : [])
            }
        } catch (error) {
            console.error('Error fetching labs:', error)
        }
    }

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            if (response.ok) {
                const result = await response.json()
                const usersData = result.data || []
                setUsers(Array.isArray(usersData) ? usersData : [])
            }
        } catch (error) {
            console.error('Error fetching users:', error)
        }
    }

    const handleNavigation = (path) => {
        try {
            navigate(path)
        } catch (error) {
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

    const showSuccessMessage = (message) => {
        const successDiv = document.createElement('div')
        successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50'
        successDiv.textContent = `✅ ${message}`
        document.body.appendChild(successDiv)
        setTimeout(() => {
            if (document.body.contains(successDiv)) {
                document.body.removeChild(successDiv)
            }
        }, 3000)
    }

    // Calendar helper functions
    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
    }

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    }

    const formatDate = (date) => {
        return date.toISOString().split('T')[0]
    }

    const isSameDay = (date1, date2) => {
        return formatDate(date1) === formatDate(date2)
    }

    // Enhanced booking filtering
    const getFilteredBookings = () => {
        let filtered = bookings

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(booking => 
                booking.status?.toLowerCase() === filterStatus.toLowerCase()
            )
        }

        // Filter by type (equipment vs lab)
        if (filterType !== 'all') {
            if (filterType === 'equipment') {
                filtered = filtered.filter(booking => booking.equipment_id)
            } else if (filterType === 'lab') {
                filtered = filtered.filter(booking => booking.lab_id)
            }
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(booking => {
                const equipmentItem = equipment.find(eq => eq.id === booking.equipment_id)
                const lab = labs.find(l => l.id === booking.lab_id)
                const user = users.find(u => u.id === booking.user_id)
                
                return (
                    booking.purpose?.toLowerCase().includes(query) ||
                    equipmentItem?.name?.toLowerCase().includes(query) ||
                    lab?.name?.toLowerCase().includes(query) ||
                    user?.name?.toLowerCase().includes(query) ||
                    booking.status?.toLowerCase().includes(query)
                )
            })
        }

        return filtered
    }

    // Get bookings for a specific date with filters applied
    const getBookingsForDate = (date) => {
        const targetDate = new Date(date)
        targetDate.setHours(0, 0, 0, 0)
        const nextDay = new Date(targetDate)
        nextDay.setDate(targetDate.getDate() + 1)

        const filteredBookings = getFilteredBookings()

        return filteredBookings.filter(booking => {
            let bookingDate
            if (booking.date) {
                bookingDate = new Date(booking.date)
            } else if (booking.start_time) {
                bookingDate = new Date(booking.start_time)
            } else {
                return false
            }
            bookingDate.setHours(0, 0, 0, 0)
            return bookingDate.getTime() === targetDate.getTime()
        })
    }

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed':
            case 'approved': return 'bg-green-500'
            case 'pending': return 'bg-yellow-500'
            case 'cancelled': return 'bg-red-500'
            case 'completed': return 'bg-blue-500'
            case 'rejected': return 'bg-red-600'
            default: return 'bg-gray-500'
        }
    }

    const getStatusTextColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'confirmed':
            case 'approved': return 'text-green-800 bg-green-100'
            case 'pending': return 'text-yellow-800 bg-yellow-100'
            case 'cancelled': return 'text-red-800 bg-red-100'
            case 'completed': return 'text-blue-800 bg-blue-100'
            case 'rejected': return 'text-red-800 bg-red-100'
            default: return 'text-gray-800 bg-gray-100'
        }
    }

    const navigateMonth = (direction) => {
        const newDate = new Date(currentDate)
        newDate.setMonth(newDate.getMonth() + direction)
        setCurrentDate(newDate)
    }

    const navigateWeek = (direction) => {
        const newDate = new Date(currentDate)
        newDate.setDate(newDate.getDate() + (direction * 7))
        setCurrentDate(newDate)
    }

    const navigateDay = (direction) => {
        const newDate = new Date(currentDate)
        newDate.setDate(newDate.getDate() + direction)
        setCurrentDate(newDate)
    }

    const handleBookingClick = (booking) => {
        setSelectedBooking(booking)
        setShowModal(true)
    }

    const updateBookingStatus = async (bookingId, newStatus, reason = '') => {
        try {
            const payload = { status: newStatus }
            if (reason) payload.reason = reason
            const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            const result = await response.json()
            if (response.ok && result.success !== false) {
                await fetchBookings()
                setShowModal(false)
                showSuccessMessage(`Booking ${newStatus.toLowerCase()} successfully!`)
            } else {
                setError(result.message || 'Failed to update booking status')
            }
        } catch (error) {
            console.error('Error updating booking:', error)
            setError('Failed to update booking status')
        }
    }

    const deleteBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to delete this booking?')) return

        try {
            const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                await fetchBookings()
                setShowModal(false)
                showSuccessMessage('Booking deleted successfully!')
            } else {
                setError('Failed to delete booking')
            }
        } catch (error) {
            console.error('Error deleting booking:', error)
            setError('Failed to delete booking')
        }
    }

    const renderMonthView = () => {
        const daysInMonth = getDaysInMonth(currentDate)
        const firstDay = getFirstDayOfMonth(currentDate)
        const days = []

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-24 md:h-32 border border-gray-200 bg-gray-50"></div>)
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            const dayBookings = getBookingsForDate(date)
            const isToday = isSameDay(date, new Date())
            const isSelected = isSameDay(date, selectedDate)

            days.push(
                <div
                    key={day}
                    className={`h-24 md:h-32 border border-gray-200 p-1 cursor-pointer hover:bg-gray-50 transition-colors ${
                        isToday ? 'bg-blue-50 border-blue-300' : 'bg-white'
                    } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                    onClick={() => setSelectedDate(date)}
                >
                    <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : 'text-gray-900'}`}>
                        {day}
                    </div>
                    <div className="mt-1 space-y-1 overflow-hidden">
                        {dayBookings.slice(0, 2).map((booking) => {
                            const equipmentItem = equipment.find(eq => eq.id === booking.equipment_id)
                            const lab = labs.find(l => l.id === booking.lab_id)
                            const displayName = equipmentItem?.name || lab?.name || 'Booking'

                            return (
                                <div
                                    key={booking.id}
                                    className={`text-xs p-1 rounded text-white cursor-pointer truncate ${getStatusColor(booking.status)}`}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        handleBookingClick(booking)
                                    }}
                                    title={`${displayName} - ${booking.status}`}
                                >
                                    {displayName}
                                </div>
                            )
                        })}
                        {dayBookings.length > 2 && (
                            <div className="text-xs text-gray-500 truncate">
                                +{dayBookings.length - 2} more
                            </div>
                        )}
                    </div>
                </div>
            )
        }

        return (
            <div className="grid grid-cols-7 gap-0 h-full">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="bg-gray-50 p-2 text-center text-sm font-medium text-gray-700 border border-gray-200">
                        {day}
                    </div>
                ))}
                {days}
            </div>
        )
    }

    const renderWeekView = () => {
        const startOfWeek = new Date(currentDate)
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

        const weekDays = []
        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek)
            date.setDate(startOfWeek.getDate() + i)
            weekDays.push(date)
        }

        return (
            <div className="grid grid-cols-7 gap-0 h-full">
                {weekDays.map((date, index) => {
                    const dayBookings = getBookingsForDate(date)
                    const isToday = isSameDay(date, new Date())

                    return (
                        <div key={index} className="border border-gray-200 flex flex-col bg-white">
                            <div className={`p-2 text-center text-sm font-medium border-b ${
                                isToday ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-700'
                            }`}>
                                {date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })}
                            </div>
                            <div className="flex-1 p-1 overflow-y-auto">
                                {dayBookings.map(booking => {
                                    const equipmentItem = equipment.find(eq => eq.id === booking.equipment_id)
                                    const lab = labs.find(l => l.id === booking.lab_id)
                                    const startTime = booking.start_time ? new Date(booking.start_time).toLocaleTimeString('en-US', {
                                        hour: 'numeric',
                                        minute: '2-digit',
                                        hour12: true
                                    }) : 'All Day'

                                    return (
                                        <div
                                            key={booking.id}
                                            className={`text-xs p-2 mb-1 rounded text-white cursor-pointer ${getStatusColor(booking.status)}`}
                                            onClick={() => handleBookingClick(booking)}
                                        >
                                            <div className="font-medium">{startTime}</div>
                                            <div className="truncate">{equipmentItem?.name || lab?.name}</div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )
                })}
            </div>
        )
    }

    const renderDayView = () => {
        const dayBookings = getBookingsForDate(currentDate)
        const hours = Array.from({ length: 24 }, (_, i) => i)

        return (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden h-full flex flex-col">
                <div className="p-4 bg-gray-50 border-b">
                    <h3 className="text-lg font-medium text-gray-900">
                        {currentDate.toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        {dayBookings.length} booking{dayBookings.length !== 1 ? 's' : ''} scheduled
                    </p>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {hours.map(hour => (
                        <div key={hour} className="flex border-b border-gray-100 min-h-[60px]">
                            <div className="w-16 p-2 text-right text-sm text-gray-500 bg-gray-50 border-r">
                                {hour.toString().padStart(2, '0')}:00
                            </div>
                            <div className="flex-1 p-2">
                                {dayBookings
                                    .filter(booking => {
                                        if (!booking.start_time) return hour === 0 // Show all-day events at midnight
                                        const bookingHour = new Date(booking.start_time).getHours()
                                        return bookingHour === hour
                                    })
                                    .map(booking => {
                                        const equipmentItem = equipment.find(eq => eq.id === booking.equipment_id)
                                        const lab = labs.find(l => l.id === booking.lab_id)
                                        const bookedUser = users.find(u => u.id === booking.user_id)
                                        
                                        let timeDisplay = 'All Day'
                                        if (booking.start_time && booking.end_time) {
                                            const startTime = new Date(booking.start_time).toLocaleTimeString('en-US', {
                                                hour: 'numeric',
                                                minute: '2-digit',
                                                hour12: true
                                            })
                                            const endTime = new Date(booking.end_time).toLocaleTimeString('en-US', {
                                                hour: 'numeric',
                                                minute: '2-digit',
                                                hour12: true
                                            })
                                            timeDisplay = `${startTime} - ${endTime}`
                                        }

                                        return (
                                            <div
                                                key={booking.id}
                                                className={`text-sm p-3 rounded text-white cursor-pointer mb-2 shadow-sm ${getStatusColor(booking.status)}`}
                                                onClick={() => handleBookingClick(booking)}
                                            >
                                                <div className="font-medium">{equipmentItem?.name || lab?.name}</div>
                                                <div className="text-xs opacity-90">{timeDisplay}</div>
                                                <div className="text-xs opacity-75 mt-1">{booking.purpose}</div>
                                                {bookedUser && (
                                                    <div className="text-xs opacity-75">By: {bookedUser.name}</div>
                                                )}
                                            </div>
                                        )
                                    })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
                    </div>
                    <p className="text-gray-600 mt-4 font-medium">Loading calendar...</p>
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
                currentPath="/calendar"
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            {/* Main Content */}
            <div className={`flex-1 min-w-0 transition-all duration-300 overflow-x-hidden ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
                {/* Shared Header Component */}
                <AppHeader 
                    searchQuery={typeof searchQuery !== 'undefined' ? searchQuery : ''}
                    setSearchQuery={typeof setSearchQuery !== 'undefined' ? setSearchQuery : null}
                    showUserMenu={typeof showUserMenu !== 'undefined' ? showUserMenu : false}
                    setShowUserMenu={typeof setShowUserMenu !== 'undefined' ? setShowUserMenu : null}
                    onToggleMobileMenu={() => setMobileOpen(!mobileOpen)}
                />

                {/* Main Content */}
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

                    {/* Page Header */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
                                <p className="mt-2 text-gray-600">
                                    View and manage your lab and equipment bookings in calendar format.
                                </p>
                            </div>
                            <div className="text-sm text-gray-500">
                                Total bookings: {getFilteredBookings().length} | All bookings: {bookings.length}
                                {bookings.length > 0 && (
                                    <div className="mt-1">
                                        Next booking: {bookings[0]?.start_time ? new Date(bookings[0].start_time).toLocaleDateString() : 'No date'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
                            <div className="flex flex-wrap items-center space-x-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="pending">Pending</option>
                                        <option value="confirmed">Confirmed</option>
                                        <option value="completed">Completed</option>
                                        <option value="cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                                    <select
                                        value={filterType}
                                        onChange={(e) => setFilterType(e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    >
                                        <option value="all">All Types</option>
                                        <option value="equipment">Equipment</option>
                                        <option value="lab">Lab</option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={() => {
                                            setFilterStatus('all')
                                            setFilterType('all')
                                            setSearchQuery('')
                                        }}
                                        className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={handleRefresh}
                                disabled={isRefreshing}
                                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-75 disabled:cursor-wait"
                                title="Refresh Calendar"
                            >
                                <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                </svg>
                                <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Calendar Controls */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => {
                                        if (viewMode === 'month') navigateMonth(-1)
                                        else if (viewMode === 'week') navigateWeek(-1)
                                        else navigateDay(-1)
                                    }}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
                                    </svg>
                                </button>

                                <h2 className="text-xl font-semibold text-gray-900">
                                    {viewMode === 'month' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    {viewMode === 'week' && `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                                    {viewMode === 'day' && currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                                </h2>

                                <button
                                    onClick={() => {
                                        if (viewMode === 'month') navigateMonth(1)
                                        else if (viewMode === 'week') navigateWeek(1)
                                        else navigateDay(1)
                                    }}
                                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                    </svg>
                                </button>
                            </div>

                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => setCurrentDate(new Date())}
                                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Today
                                </button>
                                
                                {bookings.length > 0 && (
                                    <button
                                        onClick={() => handleNavigation('/bookings')}
                                        className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                                        title="Go to Bookings page"
                                    >
                                        📅 Go to Bookings
                                    </button>
                                )}

                                <div className="flex bg-gray-100 rounded-lg p-1">
                                    {['month', 'week', 'day'].map(mode => (
                                        <button
                                            key={mode}
                                            onClick={() => setViewMode(mode)}
                                            className={`px-4 py-2 text-sm rounded-md transition-colors ${
                                                viewMode === mode
                                                    ? 'bg-white text-blue-600 shadow-sm font-medium'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            {mode.charAt(0).toUpperCase() + mode.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Calendar Views */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden" style={{ height: '600px' }}>
                        {viewMode === 'month' && renderMonthView()}
                        {viewMode === 'week' && renderWeekView()}
                        {viewMode === 'day' && renderDayView()}
                    </div>

                    {/* Legend */}
                    <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Legend</h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-4 h-4 bg-green-500 rounded"></div>
                                <span className="text-sm text-gray-700 font-medium">Confirmed</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                                <span className="text-sm text-gray-700 font-medium">Pending</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                                <span className="text-sm text-gray-700 font-medium">Completed</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-4 h-4 bg-red-500 rounded"></div>
                                <span className="text-sm text-gray-700 font-medium">Cancelled</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-4 h-4 bg-red-600 rounded"></div>
                                <span className="text-sm text-gray-700 font-medium">Rejected</span>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Booking Details Modal */}
            {showModal && selectedBooking && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-900">Booking Details</h3>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <span className="text-sm font-semibold text-gray-700">Resource:</span>
                                <p className="text-gray-900 mt-1">
                                    {equipment.find(eq => eq.id === selectedBooking.equipment_id)?.name ||
                                        labs.find(l => l.id === selectedBooking.lab_id)?.name}
                                </p>
                            </div>

                            {selectedBooking.start_time && selectedBooking.end_time && (
                                <div>
                                    <span className="text-sm font-semibold text-gray-700">Time:</span>
                                    <p className="text-gray-900 mt-1">
                                        {new Date(selectedBooking.start_time).toLocaleString()} -{' '}
                                        {new Date(selectedBooking.end_time).toLocaleString()}
                                    </p>
                                </div>
                            )}

                            <div>
                                <span className="text-sm font-semibold text-gray-700">Purpose:</span>
                                <p className="text-gray-900 mt-1">{selectedBooking.purpose}</p>
                            </div>

                            <div>
                                <span className="text-sm font-semibold text-gray-700">Status:</span>
                                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ml-2 ${getStatusTextColor(selectedBooking.status)}`}>
                                    {selectedBooking.status}
                                </span>
                            </div>

                            {users.find(u => u.id === selectedBooking.user_id) && (
                                <div>
                                    <span className="text-sm font-semibold text-gray-700">Booked by:</span>
                                    <p className="text-gray-900 mt-1">
                                        {users.find(u => u.id === selectedBooking.user_id)?.name}
                                    </p>
                                </div>
                            )}

                            {selectedBooking.notes && (
                                <div>
                                    <span className="text-sm font-semibold text-gray-700">Notes:</span>
                                    <p className="text-gray-900 mt-1">{selectedBooking.notes}</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            {(() => {
                                const isApprover = user?.role === 'admin' || user?.role === 'master_admin' || user?.roleId === 7 || user?.role === 'lab_technician';
                                const isOwnBooking = selectedBooking.user_id === (user?.userId || user?.id);
                                const isPending = selectedBooking.status?.toLowerCase() === 'pending';
                                const isCancellable = selectedBooking.status?.toLowerCase() !== 'cancelled' && selectedBooking.status?.toLowerCase() !== 'completed';

                                return (
                                    <>
                                        {isApprover && isPending && (
                                            <div className="pt-4 border-t border-gray-200">
                                                {isOwnBooking ? (
                                                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-center font-medium">
                                                        ⚠️ You requested this booking and cannot approve or reject your own request.
                                                    </p>
                                                ) : (
                                                    <div className="flex space-x-3">
                                                        <button
                                                            onClick={() => updateBookingStatus(selectedBooking.id, 'approved')}
                                                            className="flex-1 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-1.5 shadow-sm"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                const reason = window.prompt('Please enter the reason for rejecting this booking:');
                                                                if (reason && reason.trim()) {
                                                                    updateBookingStatus(selectedBooking.id, 'rejected', reason.trim());
                                                                }
                                                            }}
                                                            className="flex-1 px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-1.5 shadow-sm"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {(isApprover || isOwnBooking) && isCancellable && (
                                            <div className="pt-3 border-t border-gray-100">
                                                <button
                                                    onClick={() => deleteBooking(selectedBooking.id)}
                                                    className="w-full px-4 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors font-medium flex items-center justify-center gap-1.5"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    {isOwnBooking ? 'Cancel My Booking' : 'Cancel / Remove Booking'}
                                                </button>
                                            </div>
                                        )}
                                    </>
                                );
                            })()}
                        </div>

                        <div className="flex justify-end p-6 border-t border-gray-200">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}