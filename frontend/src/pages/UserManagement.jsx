import { Sidebar, AppHeader } from '../components/common/Navigation'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { usersAPI, departmentsAPI } from '../services/api'
import SmartSearchBar from '../components/common/SmartSearchBar'
import Pagination from '../components/common/Pagination'

export default function UserManagement() {
    // User management specific state
    const [users, setUsers] = useState([])
    const [departmentsList, setDepartmentsList] = useState([])
    const [showUserForm, setShowUserForm] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [stats, setStats] = useState({
        totalUsers: 0,
        students: 0,
        teachers: 0,
        admins: 0
    })
    const [filters, setFilters] = useState({
        search: '',
        roles: [],
        statuses: []
    })
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        role: 'teacher',
        password: '',
        staffId: '',
        phone: '',
        position: '',
        departmentId: ''
    })

    // Dashboard-style state
    const [loading, setLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [error, setError] = useState('')
    const [searchQuery, setSearchQuery] = useState('')
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [currentTime, setCurrentTime] = useState(new Date())

    const { user, logout, isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const userMenuRef = useRef(null)
    const notificationRef = useRef(null)

    // Sidebar Navigation Items
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
            badge: null
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
            badge: stats.totalUsers > 0 ? stats.totalUsers : null
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
                if (showUserForm) {
                    setShowUserForm(false)
                    setEditingUser(null)
                } else if (showUserMenu) {
                    setShowUserMenu(false)
                } else if (showNotifications) {
                    setShowNotifications(false)
                } else if (filters.search || filters.roles?.length > 0 || filters.statuses?.length > 0) {
                    setFilters({ search: '', roles: [], statuses: [] })
                } else {
                    navigate(-1)
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [showUserForm, showUserMenu, showNotifications, filters, navigate])

    // Authentication and data loading
    useEffect(() => {
        // Set document title
        document.title = 'Users | NEC LabMS'
        
        // Check if user is authenticated
        if (!isAuthenticated) {
            navigate('/login')
            return
        }

        // Load data if user is admin or teacher
        if (user && (user.role === 'admin' || user.role === 'teacher')) {
            loadUserData()
        } else if (user) {
            setError('You do not have permission to access user management')
            setLoading(false)
        }
    }, [isAuthenticated, user, navigate])

    const loadUserData = async () => {
        setLoading(true)
        setError('')

        try {
            console.log('🔄 Loading user data...')
            const [usersRes, statsRes, deptsRes] = await Promise.allSettled([
                fetchUsers(),
                fetchUserStats(),
                departmentsAPI.getAll()
            ])
            if (deptsRes.status === 'fulfilled' && deptsRes.value) {
                const depts = deptsRes.value.data?.departments || deptsRes.value.departments || deptsRes.value.data || []
                setDepartmentsList(Array.isArray(depts) ? depts : [])
            }
            console.log('✅ User data loaded successfully')
        } catch (err) {
            console.error('❌ Error loading user data:', err)
            setError('Failed to load user data: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        setIsRefreshing(true)
        try {
            await loadUserData()
        } finally {
            setTimeout(() => setIsRefreshing(false), 600)
        }
    }

    const fetchUsers = async () => {
        try {
            console.log('📥 Fetching users...')
            const data = await usersAPI.getAll()
            console.log('✅ Users fetched - Raw data:', data)
            console.log('✅ Is Array?:', Array.isArray(data))
            console.log('✅ Data length:', data?.length)
            
            const usersArray = (Array.isArray(data) ? data : []).map((u, index) => {
                const normalizedId = u.id ?? u.userId ?? null
                return {
                    ...u,
                    id: normalizedId,
                    userId: u.userId ?? normalizedId,
                    staffId: u.staffId || u.userNumber || `STF${normalizedId}`,
                    userNumber: u.userNumber || u.staffId || `STF${normalizedId}`,
                    name: u.name ?? u.userName ?? '',
                    email: u.email ?? u.userMail ?? '',
                    phone: u.phone || '',
                    position: u.position || u.designation || '',
                    department: u.department || 'General',
                    departmentId: u.departmentId,
                    role: u.role ?? '',
                    assignedLabs: u.assignedLabs || [],
                    _rowKey: normalizedId ?? `${u.email ?? u.userMail ?? 'user'}-${index}`,
                }
            })
            console.log('✅ Setting users:', usersArray.length, 'users')
            setUsers(usersArray)
        } catch (err) {
            console.error('❌ Error fetching users:', err)
            if (err.message.includes('401') || err.message.includes('Unauthorized')) {
                logout()
                navigate('/login')
                return
            }
            setUsers([]) // Ensure empty array on error
            throw err
        }
    }

    const fetchUserStats = async () => {
        try {
            console.log('📊 Fetching user stats...')
            const data = await usersAPI.getStats()
            console.log('✅ User stats fetched:', data)
            // Map API response to match state structure
            setStats({
                totalUsers: data.total || 0,
                students: data.students || 0,
                teachers: data.teachers || 0,
                admins: data.admins || 0
            })
        } catch (err) {
            console.error('❌ Error fetching user stats:', err)
            if (err.message.includes('401') || err.message.includes('Unauthorized')) {
                logout()
                navigate('/login')
                return
            }
            throw err
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
            setFilters({ ...filters, search: searchQuery })
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target
        if (editingUser) {
            setEditingUser({ ...editingUser, [name]: value })
        } else {
            setNewUser({ ...newUser, [name]: value })
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const userData = editingUser || newUser
            console.log('💾 Saving user data:', userData)

            if (editingUser) {
                console.log('✏️ Updating user:', editingUser.id)
                const response = await usersAPI.update(editingUser.id, userData)
                console.log('✅ Update response:', response)
                showSuccessMessage('User updated successfully!')
            } else {
                console.log('➕ Creating new user')
                const response = await usersAPI.create(userData)
                console.log('✅ Create response:', response)
                showSuccessMessage('User created successfully!')
            }

            console.log('🔄 Reloading user data...')
            await loadUserData()
            closeForm()
            console.log('✅ Form closed, data refreshed')
        } catch (err) {
            console.error('❌ Save error:', err)
            if (err.message.includes('401') || err.message.includes('Unauthorized')) {
                logout()
                navigate('/login')
                return
            }
            setError('Error saving user: ' + err.message)
            setTimeout(() => setError(''), 5000)
        }
    }

    const handleEdit = (userItem) => {
        setEditingUser({
            ...userItem,
            staffId: userItem.staffId || userItem.userNumber || '',
            phone: userItem.phone || '',
            position: userItem.position || userItem.designation || '',
            departmentId: userItem.departmentId ? String(userItem.departmentId) : '',
            password: ''
        })
        setShowUserForm(true)
    }

    const handleResetPassword = async (userId) => {
        if (!window.confirm('Are you sure you want to reset this user\'s password?')) return

        try {
            await usersAPI.resetPassword(userId)
            showSuccessMessage('Password reset email sent to user!')
        } catch (err) {
            if (err.message.includes('401') || err.message.includes('Unauthorized')) {
                logout()
                navigate('/login')
                return
            }
            setError('Error resetting password: ' + err.message)
        }
    }

    const handleToggleStatus = async (userItem) => {
        const action = userItem.status === 'Active' ? 'deactivate' : 'activate'
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return

        try {
            const newStatus = userItem.status === 'Active' ? 'Inactive' : 'Active'
            await usersAPI.updateStatus(userItem.id, newStatus)
            await fetchUsers()
            showSuccessMessage(`User ${action}d successfully!`)
        } catch (err) {
            if (err.message.includes('401') || err.message.includes('Unauthorized')) {
                logout()
                navigate('/login')
                return
            }
            setError('Error updating user status: ' + err.message)
        }
    }

    const handleDeleteUser = async (userItem) => {
        // Prevent deleting yourself
        if (userItem.id === user?.userId || userItem.email === user?.email) {
            setError('You cannot delete your own account!')
            setTimeout(() => setError(''), 3000)
            return
        }

        // Safety check: Prevent deleting user assigned as in-charge of active labs
        if (userItem.assignedLabs && userItem.assignedLabs.length > 0) {
            const labNames = userItem.assignedLabs.map(l => l.name).join(', ')
            alert(`⚠️ Cannot delete "${userItem.name}"!\n\nThis staff member is currently assigned as in-charge for: ${labNames}.\n\nPlease reassign these labs first in Lab Management, or deactivate this user account instead.`)
            return
        }

        // Double confirmation for permanent deletion
        if (!window.confirm(`⚠️ Are you sure you want to PERMANENTLY DELETE user "${userItem.name}"?\n\nThis action CANNOT be undone!`)) return
        
        // Second confirmation
        if (!window.confirm(`Final confirmation: Delete ${userItem.email}?`)) return

        try {
            console.log('🗑️ Starting delete for user:', userItem.id, userItem.name)
            const response = await usersAPI.delete(userItem.id)
            console.log('✅ Delete API response:', response)
            
            console.log('🔄 Refreshing user list...')
            await fetchUsers()
            console.log('📊 Refreshing stats...')
            await fetchUserStats()
            console.log('✅ User deleted and data refreshed!')
            
            showSuccessMessage(`User "${userItem.name}" deleted permanently!`)
        } catch (err) {
            console.error('❌ Delete error:', err)
            if (err.message.includes('401') || err.message.includes('Unauthorized')) {
                logout()
                navigate('/login')
                return
            }
            
            // Check if it's a foreign key constraint error
            if (err.message.includes('Cannot delete user') || err.message.includes('related records') || err.message.includes('assigned as in-charge')) {
                const errorMsg = err.message
                setError(errorMsg)
                // Show alert for better visibility
                alert(`❌ ${errorMsg}\n\nSuggestion: Use the deactivate button (⭕) instead of delete.`)
            } else {
                setError('Error deleting user: ' + err.message)
            }
            
            setTimeout(() => setError(''), 8000)
        }
    }

    const handleFilterChange = (e) => {
        const { name, value } = e.target
        setFilters({ ...filters, [name]: value })
    }

    const closeForm = () => {
        setShowUserForm(false)
        setEditingUser(null)
        setNewUser({
            name: '',
            email: '',
            role: 'teacher',
            password: '',
            staffId: '',
            phone: '',
            position: '',
            departmentId: ''
        })
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

    const getRoleColor = (role) => {
        if (!role) return 'bg-gray-100 text-gray-800'
        switch (role) {
            case 'admin': return 'bg-red-100 text-red-800'
            case 'teacher': return 'bg-blue-100 text-blue-800'
            case 'student': return 'bg-green-100 text-green-800'
            case 'lab_assistant': return 'bg-purple-100 text-purple-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusColor = (status) => {
        if (!status) return 'bg-gray-100 text-gray-800'
        return status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
    }

    const filteredUsers = users.filter(userItem => {
        const matchesSearch = !filters.search || 
            (userItem.name && userItem.name.toLowerCase().includes(filters.search.toLowerCase())) ||
            (userItem.email && userItem.email.toLowerCase().includes(filters.search.toLowerCase()))
        const matchesRole = !filters.roles?.length || filters.roles.includes(userItem.role)
        const userStatus = userItem.status || (userItem.is_active ? 'Active' : 'Inactive')
        const matchesStatus = !filters.statuses?.length || filters.statuses.map(s => s.toLowerCase()).includes(userStatus.toLowerCase())

        return matchesSearch && matchesRole && matchesStatus
    })

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    // Reset page on filter changes
    useEffect(() => {
        setCurrentPage(1)
    }, [filters])

    // Paginated users slice
    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * pageSize
        return filteredUsers.slice(start, start + pageSize)
    }, [filteredUsers, currentPage, pageSize])

    // Smart Search Options Groups for Users
    const userSearchGroups = [
        {
            id: 'roles',
            title: 'User Role',
            options: [
                { id: 'student', label: 'Students', count: users.filter(u => u.role === 'student').length, color: '#10b981' },
                { id: 'teacher', label: 'Teachers', count: users.filter(u => u.role === 'teacher').length, color: '#3b82f6' },
                { id: 'lab_assistant', label: 'Lab Assistants', count: users.filter(u => u.role === 'lab_assistant').length, color: '#8b5cf6' },
                { id: 'admin', label: 'Admins', count: users.filter(u => u.role === 'admin').length, color: '#ef4444' }
            ]
        },
        {
            id: 'statuses',
            title: 'Account Status',
            options: [
                { id: 'Active', label: 'Active Users', count: users.filter(u => (u.status === 'Active' || u.is_active)).length, color: '#10b981' },
                { id: 'Inactive', label: 'Inactive Users', count: users.filter(u => (u.status === 'Inactive' || (!u.is_active && u.is_active !== undefined))).length, color: '#9ca3af' }
            ]
        }
    ]
    
    // Debug logging
    useEffect(() => {
        console.log('👥 Users state:', users.length, 'users')
        console.log('🔍 Filters:', filters)
        console.log('✅ Filtered users:', filteredUsers.length, 'users')
        if (users.length > 0 && filteredUsers.length === 0) {
            console.warn('⚠️ WARNING: Users exist but filtered to 0! Check filters:', filters)
        }
    }, [users, filters, filteredUsers.length])

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
                    </div>
                    <p className="text-gray-600 mt-4 font-medium">
                        {!isAuthenticated ? 'Checking authentication...' : 'Loading users...'}
                    </p>
                </div>
            </div>
        )
    }

    // Show error if user doesn't have permission
    if (error && error.includes('permission')) {
        return (
            <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="p-4 bg-red-100 rounded-full inline-block mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"></path>
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => handleNavigation('/dashboard')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Back to Dashboard
                    </button>
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
                currentPath="/users"
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
                    {error && !error.includes('permission') && (
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
                        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                        <p className="mt-2 text-gray-600">
                            Manage user accounts, roles, and permissions. Control access to lab resources and system features.
                        </p>
                    </div>

                    {/* User Form Modal - Admin Only */}
                    {showUserForm && user?.role === 'admin' && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-screen overflow-y-auto m-4">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-gray-900">
                                            {editingUser ? 'Edit User' : 'Add New User'}
                                        </h2>
                                        <button
                                            onClick={closeForm}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                                Staff ID / User ID <span className="text-gray-400 font-normal text-xs">(optional - auto-generated if blank)</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="staffId"
                                                value={editingUser ? (editingUser.staffId || editingUser.userNumber || '') : newUser.staffId}
                                                onChange={handleInputChange}
                                                placeholder="e.g., STF1023 or USR001"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Full Name <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={editingUser ? editingUser.name : newUser.name}
                                                onChange={handleInputChange}
                                                placeholder="e.g., Dr. Rajesh Kumar"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Email Address <span className="text-red-500">*</span></label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={editingUser ? editingUser.email : newUser.email}
                                                onChange={handleInputChange}
                                                placeholder="staff@nec.edu.in"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                required
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Phone Number</label>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    value={editingUser ? (editingUser.phone || '') : newUser.phone}
                                                    onChange={handleInputChange}
                                                    placeholder="+91 9876543210"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Designation</label>
                                                <input
                                                    type="text"
                                                    name="position"
                                                    value={editingUser ? (editingUser.position || '') : newUser.position}
                                                    onChange={handleInputChange}
                                                    placeholder="e.g., Lab Assistant"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Department</label>
                                                <select
                                                    name="departmentId"
                                                    value={editingUser ? (editingUser.departmentId || '') : newUser.departmentId}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                                >
                                                    <option value="">-- No Department --</option>
                                                    {departmentsList.map(d => (
                                                        <option key={d.departmentId} value={d.departmentId}>
                                                            {d.departmentName} ({d.departmentAcr})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Role / Access</label>
                                                <select
                                                    name="role"
                                                    value={editingUser ? editingUser.role : newUser.role}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                                >
                                                    <option value="student">Student</option>
                                                    <option value="faculty">Faculty</option>
                                                    <option value="teacher">Teacher</option>
                                                    <option value="lab_assistant">Lab Assistant</option>
                                                    <option value="lab_technician">Lab Technician</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </div>
                                        </div>

                                        {!editingUser ? (
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Password <span className="text-red-500">*</span></label>
                                                <input
                                                    type="password"
                                                    name="password"
                                                    value={newUser.password}
                                                    onChange={handleInputChange}
                                                    placeholder="Minimum 6 characters"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                    required
                                                />
                                            </div>
                                        ) : (
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Change Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span></label>
                                                <input
                                                    type="password"
                                                    name="password"
                                                    value={editingUser.password || ''}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter new password"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                                />
                                            </div>
                                        )}

                                        {/* Assigned Labs Badge (if staff member is in-charge of labs) */}
                                        {editingUser && editingUser.assignedLabs && editingUser.assignedLabs.length > 0 && (
                                            <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
                                                <p className="text-xs font-bold text-blue-900 mb-1.5 flex items-center gap-1">
                                                    <span>🏛️</span> Assigned Labs In-Charge:
                                                </p>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {editingUser.assignedLabs.map(lab => (
                                                        <span key={lab.id} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                                            {lab.name} ({lab.lab_type?.toUpperCase()})
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                                            <button
                                                type="button"
                                                onClick={closeForm}
                                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                            >
                                                Cancel (Esc)
                                            </button>
                                            <button
                                                type="submit"
                                                className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                                            >
                                                {editingUser ? 'Update User' : 'Add User'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* User Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                                    <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-full">
                                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Students</p>
                                    <p className="text-3xl font-bold text-green-600">{stats.students}</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Teachers</p>
                                    <p className="text-3xl font-bold text-purple-600">{stats.teachers}</p>
                                </div>
                                <div className="p-3 bg-purple-100 rounded-full">
                                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Admins</p>
                                    <p className="text-3xl font-bold text-red-600">{stats.admins}</p>
                                </div>
                                <div className="p-3 bg-red-100 rounded-full">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8 p-4 sm:p-5">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex-1 max-w-2xl">
                                <SmartSearchBar
                                    searchValue={filters.search}
                                    onSearchChange={(val) => setFilters(prev => ({ ...prev, search: val }))}
                                    placeholder="Search users by name, email, or role..."
                                    groups={userSearchGroups}
                                    selectedOptions={{
                                        roles: filters.roles || [],
                                        statuses: filters.statuses || []
                                    }}
                                    onOptionToggle={(groupId, optId) => {
                                        setFilters(prev => {
                                            const cur = prev[groupId] || [];
                                            const next = cur.includes(optId)
                                                ? cur.filter(x => x !== optId)
                                                : [...cur, optId];
                                            return { ...prev, [groupId]: next };
                                        });
                                    }}
                                    onGroupSelectAll={(groupId, allIds) => {
                                        setFilters(prev => ({ ...prev, [groupId]: allIds }));
                                    }}
                                    onGroupClear={(groupId) => {
                                        setFilters(prev => ({ ...prev, [groupId]: [] }));
                                    }}
                                    onClearAll={() => setFilters({ search: '', roles: [], statuses: [] })}
                                />
                            </div>
                            <div className="text-xs sm:text-sm font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl self-start lg:self-center">
                                Showing <span className="text-blue-600 font-bold">{filteredUsers.length}</span> of <span className="font-bold text-gray-900">{users.length}</span> users
                            </div>
                        </div>
                    </div>

                    {/* Users Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Users</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Staff ID</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Name & Title</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Department</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned Labs</th>
                                        <th className="px-5 py-3.5 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        {user?.role === 'admin' && (
                                            <th className="px-5 py-3.5 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100 text-sm">
                                    {paginatedUsers.length > 0 ? (
                                        paginatedUsers.map((userItem) => (
                                            <tr key={userItem._rowKey} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                                                        {userItem.staffId || userItem.userNumber || `#${userItem.id}`}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <div className="font-semibold text-gray-900">{userItem.name || 'N/A'}</div>
                                                    {userItem.position && (
                                                        <div className="text-xs text-gray-500">{userItem.position}</div>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <div className="text-xs font-medium text-gray-900">{userItem.email || 'N/A'}</div>
                                                    {userItem.phone && (
                                                        <div className="text-xs text-gray-500 font-mono">{userItem.phone}</div>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                        {userItem.department || 'General'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getRoleColor(userItem.role)}`}>
                                                        {userItem.role ? userItem.role.replace('_', ' ') : 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    {userItem.assignedLabs && userItem.assignedLabs.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                            {userItem.assignedLabs.map(lab => (
                                                                <span 
                                                                    key={lab.id} 
                                                                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200 truncate"
                                                                    title={`In-charge of ${lab.name} (${lab.location || 'Campus'})`}
                                                                >
                                                                    🏛️ {lab.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">None</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(userItem.status)}`}>
                                                        {userItem.status}
                                                    </span>
                                                </td>
                                                {user?.role === 'admin' && (
                                                    <td className="px-5 py-4 whitespace-nowrap text-right">
                                                        <div className="inline-flex items-center gap-1.5 justify-end">
                                                            <button
                                                                onClick={() => handleEdit(userItem)}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 active:bg-blue-200 border border-blue-200 shadow-sm transition"
                                                                title="Edit User"
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                                                </svg>
                                                                <span>Edit</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleResetPassword(userItem.id)}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 active:bg-emerald-200 border border-emerald-200 shadow-sm transition"
                                                                title="Reset Password"
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path>
                                                                </svg>
                                                                <span>Reset</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleToggleStatus(userItem)}
                                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold shadow-sm transition ${userItem.status === 'Active' ? 'text-amber-700 bg-amber-50 hover:bg-amber-100 active:bg-amber-200 border border-amber-200' : 'text-green-700 bg-green-50 hover:bg-green-100 active:bg-green-200 border border-green-200'}`}
                                                                title={userItem.status === 'Active' ? 'Deactivate User' : 'Activate User'}
                                                            >
                                                                {userItem.status === 'Active' ? (
                                                                    <>
                                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"></path>
                                                                        </svg>
                                                                        <span>Deactivate</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                                                        </svg>
                                                                        <span>Activate</span>
                                                                    </>
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteUser(userItem)}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 active:bg-red-200 border border-red-200 shadow-sm transition disabled:opacity-40 disabled:cursor-not-allowed"
                                                                title="Delete User Permanently"
                                                                disabled={userItem.id === user?.userId || userItem.email === user?.email}
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                                </svg>
                                                                <span>Delete</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={user?.role === 'admin' ? "8" : "7"} className="px-6 py-12 text-center">
                                                <div className="text-gray-500">
                                                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
                                                    </svg>
                                                    <p className="text-lg font-medium">No users found</p>
                                                    <p className="text-sm">Try adjusting your search or filters.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {filteredUsers.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredUsers.length}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={(newSize) => {
                                setPageSize(newSize)
                                setCurrentPage(1)
                            }}
                            pageSizeOptions={[10, 25, 50]}
                            itemLabel="users"
                            scrollToTop={true}
                        />
                    )}

                    {/* Role Permissions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Role Permissions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                                <h3 className="font-bold text-red-600 mb-3 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                                    </svg>
                                    Admin
                                </h3>
                                <ul className="text-sm text-gray-700 space-y-1">
                                    <li>• Full system access</li>
                                    <li>• Manage all users</li>
                                    <li>• View all reports</li>
                                    <li>• System configuration</li>
                                </ul>
                            </div>

                            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                                <h3 className="font-bold text-blue-600 mb-3 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6"></path>
                                    </svg>
                                    Teacher
                                </h3>
                                <ul className="text-sm text-gray-700 space-y-1">
                                    <li>• Manage equipment bookings</li>
                                    <li>• View student activity</li>
                                    <li>• Generate reports</li>
                                    <li>• Approve student requests</li>
                                </ul>
                            </div>

                            <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
                                <h3 className="font-bold text-purple-600 mb-3 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                    </svg>
                                    Lab Assistant
                                </h3>
                                <ul className="text-sm text-gray-700 space-y-1">
                                    <li>• Equipment maintenance</li>
                                    <li>• Inventory management</li>
                                    <li>• Basic user support</li>
                                    <li>• Equipment checkout</li>
                                </ul>
                            </div>

                            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
                                <h3 className="font-bold text-green-600 mb-3 flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                    </svg>
                                    Student
                                </h3>
                                <ul className="text-sm text-gray-700 space-y-1">
                                    <li>• Book available equipment</li>
                                    <li>• View own bookings</li>
                                    <li>• Submit maintenance requests</li>
                                    <li>• Limited access to reports</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}