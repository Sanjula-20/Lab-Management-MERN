import { Sidebar, AppHeader } from '../components/common/Navigation'
import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import SmartSearchBar from '../components/common/SmartSearchBar'
import Pagination from '../components/common/Pagination'

export default function Incidents() {
    const [incidents, setIncidents] = useState([])
    const [filteredIncidents, setFilteredIncidents] = useState([])
    const [equipment, setEquipment] = useState([])
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingIncident, setEditingIncident] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedStatuses, setSelectedStatuses] = useState([])
    const [selectedPriorities, setSelectedPriorities] = useState([])
    const [selectedCategories, setSelectedCategories] = useState([])

    // Dedicated Resolve Modal State
    const [showResolveModal, setShowResolveModal] = useState(false)
    const [resolvingIncident, setResolvingIncident] = useState(null)
    const [resolutionNotes, setResolutionNotes] = useState('')
    const [resolvingLoading, setResolvingLoading] = useState(false)

    // Dedicated Details & Audit Timeline Modal State
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [detailIncident, setDetailIncident] = useState(null)
    const [incidentAuditHistory, setIncidentAuditHistory] = useState([])
    const [loadingHistory, setLoadingHistory] = useState(false)

    // Delete Confirmation Modal State
    const [deleteConfirmId, setDeleteConfirmId] = useState(null)
    const [deletingLoading, setDeletingLoading] = useState(false)

    // Sidebar and UI state
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const [searchQuery, setSearchQuery] = useState('')

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        equipment_id: '',
        priority: 'medium',
        category: 'malfunction',
        location: '',
        reported_by: '',
        assigned_to: ''
    })

    const { user, isAuthenticated, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const userMenuRef = useRef(null)
    const notificationRef = useRef(null)
    
    // ✅ FIXED: Consistent API URL
    const API_BASE_URL = '/api'

    const priorities = ['low', 'medium', 'high', 'critical']
    const statuses = ['open', 'in_progress', 'resolved', 'closed']
    const categories = ['malfunction', 'damage', 'safety', 'maintenance', 'other']

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
            badge: Array.isArray(incidents) && incidents.filter(i => i?.status === 'open').length > 0 
                ? incidents.filter(i => i?.status === 'open').length 
                : null,
            badgeColor: 'bg-red-500'
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
            show: ['admin', 'lab_assistant', 'teacher'].includes(user?.role),
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
            badge: unreadCount > 0 ? unreadCount : null,
            badgeColor: 'bg-red-500'
        }
    ]

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

    // Search filter groups
    const incidentSearchGroups = useMemo(() => [
        {
            id: 'status',
            label: 'Incident Status',
            options: [
                { id: 'open', label: 'Open', color: 'bg-yellow-100 text-yellow-800' },
                { id: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
                { id: 'resolved', label: 'Resolved', color: 'bg-green-100 text-green-800' },
                { id: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-800' }
            ]
        },
        {
            id: 'priority',
            label: 'Priority Level',
            options: [
                { id: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
                { id: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
                { id: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
                { id: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
            ]
        },
        {
            id: 'category',
            label: 'Incident Category',
            options: [
                { id: 'malfunction', label: 'Malfunction', color: 'bg-purple-100 text-purple-800' },
                { id: 'damage', label: 'Damage', color: 'bg-rose-100 text-rose-800' },
                { id: 'safety', label: 'Safety Hazard', color: 'bg-amber-100 text-amber-800' },
                { id: 'maintenance', label: 'Maintenance Needed', color: 'bg-cyan-100 text-cyan-800' },
                { id: 'other', label: 'Other', color: 'bg-gray-100 text-gray-800' }
            ]
        }
    ], [])

    // Escape key handler - closes open overlays consistently without unintended navigation
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' || event.key === 'Esc') {
                if (showResolveModal) {
                    setShowResolveModal(false)
                    setResolvingIncident(null)
                    setResolutionNotes('')
                } else if (showDetailModal) {
                    setShowDetailModal(false)
                    setDetailIncident(null)
                    setIncidentAuditHistory([])
                } else if (deleteConfirmId) {
                    setDeleteConfirmId(null)
                } else if (showModal) {
                    setShowModal(false)
                    setEditingIncident(null)
                } else if (showUserMenu) {
                    setShowUserMenu(false)
                } else if (showNotifications) {
                    setShowNotifications(false)
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [showModal, showResolveModal, showDetailModal, deleteConfirmId, showUserMenu, showNotifications])

    // Fetch all data
    useEffect(() => {
        document.title = 'Incidents | NEC LabMS'
        
        if (!isAuthenticated) {
            navigate('/login')
            return
        }
        fetchIncidents()
        fetchEquipment()
        fetchUsers()
        fetchNotificationCount()
    }, [isAuthenticated, navigate])

    // Filter incidents
    useEffect(() => {
        if (!Array.isArray(incidents)) {
            setFilteredIncidents([])
            return
        }

        const q = searchTerm.toLowerCase().trim()
        let filtered = incidents.filter(incident => {
            if (!incident) return false
            
            const matchesSearch = !q ||
                (incident.title?.toLowerCase() || '').includes(q) ||
                (incident.description?.toLowerCase() || '').includes(q) ||
                (incident.location?.toLowerCase() || '').includes(q) ||
                (incident.category?.toLowerCase() || '').includes(q) ||
                (incident.relatedEquipment?.name?.toLowerCase() || '').includes(q) ||
                (incident.relatedEquipment?.serial_number?.toLowerCase() || '').includes(q) ||
                (incident.incidentReporter?.name?.toLowerCase() || '').includes(q) ||
                (incident.incidentAssignee?.name?.toLowerCase() || '').includes(q)

            const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(incident.status)
            const matchesPriority = selectedPriorities.length === 0 || selectedPriorities.includes(incident.priority)
            const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(incident.category)
            return matchesSearch && matchesStatus && matchesPriority && matchesCategory
        })
        setFilteredIncidents(filtered)
    }, [incidents, searchTerm, selectedStatuses, selectedPriorities, selectedCategories])

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchTerm, selectedStatuses, selectedPriorities])

    // Paginated incidents slice
    const paginatedIncidents = useMemo(() => {
        if (!Array.isArray(filteredIncidents)) return []
        const start = (currentPage - 1) * pageSize
        return filteredIncidents.slice(start, start + pageSize)
    }, [filteredIncidents, currentPage, pageSize])

    // ✅ FIXED: Safe notification count fetch
    const fetchNotificationCount = useCallback(async () => {
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
                    const count = result.data?.length || 0
                    setUnreadCount(count)
                }
            }
        } catch (error) {
            console.error('Error fetching notification count:', error)
            setUnreadCount(0)
        }
    }, [])

    // ✅ FIXED: Safe incidents fetch with proper error handling
    const fetchIncidents = async () => {
        try {
            console.log('🔍 Fetching incidents')
            const response = await fetch(`${API_BASE_URL}/incidents`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            
            console.log('📡 Incidents response status:', response.status, response.statusText)
            
            if (response.ok) {
                const result = await response.json()
                console.log('✅ Incidents response:', result)
                
                // ✅ FIXED: Ensure incidents is always an array
                const incidentsData = result.data || result || []
                const safeIncidents = Array.isArray(incidentsData) ? incidentsData : []
                
                setIncidents(safeIncidents)
                setError('') // Clear any previous errors
                console.log('✅ Incidents set:', safeIncidents.length, 'items')
            } else {
                const errorText = await response.text()
                console.error('❌ Incidents fetch failed:', response.status, errorText)
                setError(`Failed to fetch incidents: ${response.status} ${response.statusText}`)
                setIncidents([])
            }
        } catch (error) {
            console.error('❌ Error fetching incidents:', error)
            setError(`Failed to fetch incidents: ${error.message}`)
            setIncidents([])
        } finally {
            setLoading(false)
        }
    }

    // ✅ FIXED: Safe equipment fetch with proper error handling
    const fetchEquipment = async () => {
        try {
            console.log('🔍 Fetching equipment...')
            const response = await fetch(`${API_BASE_URL}/equipment?limit=1000`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            
            if (response.ok) {
                const result = await response.json()
                console.log('✅ Equipment response:', result)
                
                // ✅ FIXED: Handle nested data structure - equipment is in result.data.equipment
                const equipmentData = result.data?.equipment || result.data || result || []
                const safeEquipment = Array.isArray(equipmentData) ? equipmentData : []
                
                setEquipment(safeEquipment)
                console.log('✅ Equipment set:', safeEquipment.length, 'items')
            } else {
                console.error('❌ Equipment fetch failed:', response.status)
                setEquipment([])
            }
        } catch (error) {
            console.error('❌ Error fetching equipment:', error)
            setEquipment([])
        }
    }

    // ✅ FIXED: Safe users fetch with proper error handling
    const fetchUsers = async () => {
        try {
            console.log('🔍 Fetching users...')
            const response = await fetch(`${API_BASE_URL}/users`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            
            if (response.ok) {
                const result = await response.json()
                console.log('✅ Users response:', result)
                
                // ✅ FIXED: Users API returns array directly, not wrapped in data object
                const usersData = Array.isArray(result) ? result : (result.data?.users || result.data || [])
                const safeUsers = Array.isArray(usersData) ? usersData : []
                
                setUsers(safeUsers)
                console.log('✅ Users set:', safeUsers.length, 'items')
            } else {
                console.error('❌ Users fetch failed:', response.status)
                setUsers([])
            }
        } catch (error) {
            console.error('❌ Error fetching users:', error)
            setUsers([])
        }
    }

    const handleNavigation = (path) => {
        try {
            navigate(path)
        } catch (error) {
            console.error('Navigation error:', error)
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

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        try {
            const url = editingIncident
                ? `${API_BASE_URL}/incidents/${editingIncident.id}`
                : `${API_BASE_URL}/incidents`

            const method = editingIncident ? 'PUT' : 'POST'

            const response = await fetch(url, {
                method,
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    reported_by: formData.reported_by || user.id
                })
            })

            if (response.ok) {
                await fetchIncidents()
                setShowModal(false)
                setEditingIncident(null)
                setFormData({
                    title: '',
                    description: '',
                    equipment_id: '',
                    priority: 'medium',
                    category: 'malfunction',
                    location: '',
                    reported_by: '',
                    assigned_to: ''
                })
            } else {
                const result = await response.json()
                setError(result.message || 'Failed to save incident')
            }
        } catch (error) {
            console.error('Error saving incident:', error)
            setError('Failed to save incident')
        }
    }

    const handleEquipmentChange = (equipmentId) => {
        const found = Array.isArray(equipment) ? equipment.find(eq => String(eq.id) === String(equipmentId)) : null
        setFormData(prev => ({
            ...prev,
            equipment_id: equipmentId,
            location: found?.lab?.name ? (found.lab.location ? `${found.lab.name} (${found.lab.location})` : found.lab.name) : prev.location
        }))
    }

    const handleEdit = (incident) => {
        if (!incident) return
        
        setEditingIncident(incident)
        setFormData({
            title: incident.title || '',
            description: incident.description || '',
            equipment_id: incident.equipment_id || '',
            priority: incident.priority || 'medium',
            category: incident.category || 'malfunction',
            location: incident.location || '',
            reported_by: incident.reported_by || '',
            assigned_to: incident.assigned_to || ''
        })
        setShowModal(true)
    }

    // Open Dedicated Resolve Modal
    const handleOpenResolveModal = (incident) => {
        setResolvingIncident(incident)
        setResolutionNotes('')
        setShowResolveModal(true)
    }

    // Submit Resolution with resolution notes and authenticated user
    const handleResolveSubmit = async (e) => {
        e.preventDefault()
        if (!resolvingIncident || !resolutionNotes.trim()) return

        try {
            setResolvingLoading(true)
            setError('')
            const response = await fetch(`${API_BASE_URL}/incidents/${resolvingIncident.id}/resolve`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    resolution_notes: resolutionNotes.trim()
                })
            })

            if (response.ok) {
                setShowResolveModal(false)
                setResolvingIncident(null)
                setResolutionNotes('')
                await fetchIncidents()
            } else {
                const result = await response.json()
                setError(result.message || 'Failed to resolve incident')
            }
        } catch (err) {
            console.error('Error resolving incident:', err)
            setError('Failed to resolve incident')
        } finally {
            setResolvingLoading(false)
        }
    }

    // Open Detail & Audit History Modal
    const handleOpenDetailModal = (incident) => {
        setDetailIncident(incident)
        setShowDetailModal(true)
        fetchIncidentHistory(incident.id)
    }

    // Fetch Audit History from backend
    const fetchIncidentHistory = async (incidentId) => {
        try {
            setLoadingHistory(true)
            const response = await fetch(`${API_BASE_URL}/audit/incident/${incidentId}`, {
                credentials: 'include'
            })
            if (response.ok) {
                const result = await response.json()
                setIncidentAuditHistory(result.data || [])
            } else {
                setIncidentAuditHistory([])
            }
        } catch (err) {
            console.error('Error loading incident history:', err)
            setIncidentAuditHistory([])
        } finally {
            setLoadingHistory(false)
        }
    }

    // Confirmation-based Delete
    const handleDeleteClick = (id) => {
        setDeleteConfirmId(id)
    }

    const handleDeleteConfirmed = async () => {
        if (!deleteConfirmId) return

        try {
            setDeletingLoading(true)
            const response = await fetch(`${API_BASE_URL}/incidents/${deleteConfirmId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (response.ok) {
                setDeleteConfirmId(null)
                await fetchIncidents()
            } else {
                const res = await response.json()
                setError(res.message || 'Failed to delete incident')
            }
        } catch (error) {
            console.error('Error deleting incident:', error)
            setError('Failed to delete incident')
        } finally {
            setDeletingLoading(false)
        }
    }

    const updateStatus = async (id, newStatus) => {
        if (!id || !newStatus) return

        if (newStatus === 'resolved') {
            const inc = Array.isArray(incidents) ? incidents.find(i => i.id === id) : null
            if (inc) {
                handleOpenResolveModal(inc)
                return
            }
        }

        try {
            const response = await fetch(`${API_BASE_URL}/incidents/${id}/status`, {
                method: 'PATCH',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            })

            if (response.ok) {
                await fetchIncidents()
            } else {
                setError('Failed to update status')
            }
        } catch (error) {
            console.error('Error updating status:', error)
            setError('Failed to update status')
        }
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'low': return 'bg-blue-100 text-blue-800'
            case 'medium': return 'bg-yellow-100 text-yellow-800'
            case 'high': return 'bg-orange-100 text-orange-800'
            case 'critical': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-red-100 text-red-800'
            case 'in_progress': return 'bg-yellow-100 text-yellow-800'
            case 'resolved': return 'bg-green-100 text-green-800'
            case 'closed': return 'bg-gray-100 text-gray-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-200"></div>
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent absolute top-0"></div>
                    </div>
                    <p className="text-gray-600 mt-4 font-medium">Loading incidents...</p>
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
                currentPath="/incidents"
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

                {/* Page Content */}
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

                    {/* ✅ FIXED: Stats Cards with safe array access */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Incidents</p>
                                    <p className="text-3xl font-bold text-gray-900">
                                        {Array.isArray(incidents) ? incidents.length : 0}
                                    </p>
                                </div>
                                <div className="p-3 bg-red-100 rounded-full">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.982 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Open Incidents</p>
                                    <p className="text-3xl font-bold text-red-600">
                                        {Array.isArray(incidents) ? incidents.filter(i => i?.status === 'open').length : 0}
                                    </p>
                                </div>
                                <div className="p-3 bg-red-100 rounded-full">
                                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                                    <p className="text-3xl font-bold text-yellow-600">
                                        {Array.isArray(incidents) ? incidents.filter(i => i?.status === 'in_progress').length : 0}
                                    </p>
                                </div>
                                <div className="p-3 bg-yellow-100 rounded-full">
                                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Resolved</p>
                                    <p className="text-3xl font-bold text-green-600">
                                        {Array.isArray(incidents) ? incidents.filter(i => i?.status === 'resolved').length : 0}
                                    </p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-full">
                                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8 p-4 sm:p-5">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex-1 max-w-2xl">
                                <SmartSearchBar
                                    searchValue={searchTerm}
                                    onSearchChange={(val) => setSearchTerm(val)}
                                    placeholder="Search incidents by title, description, location, equipment..."
                                    groups={incidentSearchGroups}
                                    selectedOptions={{
                                        status: selectedStatuses,
                                        priority: selectedPriorities,
                                        category: selectedCategories
                                    }}
                                    onOptionToggle={(groupId, optId) => {
                                        if (groupId === 'status') {
                                            setSelectedStatuses(prev => prev.includes(optId) ? prev.filter(x => x !== optId) : [...prev, optId])
                                        } else if (groupId === 'priority') {
                                            setSelectedPriorities(prev => prev.includes(optId) ? prev.filter(x => x !== optId) : [...prev, optId])
                                        } else if (groupId === 'category') {
                                            setSelectedCategories(prev => prev.includes(optId) ? prev.filter(x => x !== optId) : [...prev, optId])
                                        }
                                    }}
                                    onGroupSelectAll={(groupId, allIds) => {
                                        if (groupId === 'status') setSelectedStatuses(allIds)
                                        else if (groupId === 'priority') setSelectedPriorities(allIds)
                                        else if (groupId === 'category') setSelectedCategories(allIds)
                                    }}
                                    onGroupClear={(groupId) => {
                                        if (groupId === 'status') setSelectedStatuses([])
                                        else if (groupId === 'priority') setSelectedPriorities([])
                                        else if (groupId === 'category') setSelectedCategories([])
                                    }}
                                    onClearAll={() => {
                                        setSearchTerm('')
                                        setSelectedStatuses([])
                                        setSelectedPriorities([])
                                        setSelectedCategories([])
                                    }}
                                />
                            </div>
                            <div className="text-xs sm:text-sm font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl self-start lg:self-center">
                                Showing <span className="text-red-600 font-bold">{Array.isArray(filteredIncidents) ? filteredIncidents.length : 0}</span> of <span className="font-bold text-gray-900">{Array.isArray(incidents) ? incidents.length : 0}</span> incidents
                            </div>
                        </div>

                        {/* Active Filter Chips Bar */}
                        {(selectedStatuses.length > 0 || selectedPriorities.length > 0 || selectedCategories.length > 0 || searchTerm) && (
                            <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Filters:</span>
                                {searchTerm && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                                        Search: "{searchTerm}"
                                        <button type="button" onClick={() => setSearchTerm('')} className="hover:text-red-900 font-bold ml-1">&times;</button>
                                    </span>
                                )}
                                {selectedStatuses.map(s => (
                                    <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                        Status: {s.replace('_', ' ')}
                                        <button type="button" onClick={() => setSelectedStatuses(prev => prev.filter(x => x !== s))} className="hover:text-blue-900 font-bold ml-1">&times;</button>
                                    </span>
                                ))}
                                {selectedPriorities.map(p => (
                                    <span key={p} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                        Priority: {p}
                                        <button type="button" onClick={() => setSelectedPriorities(prev => prev.filter(x => x !== p))} className="hover:text-amber-900 font-bold ml-1">&times;</button>
                                    </span>
                                ))}
                                {selectedCategories.map(c => (
                                    <span key={c} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200">
                                        Category: {c}
                                        <button type="button" onClick={() => setSelectedCategories(prev => prev.filter(x => x !== c))} className="hover:text-purple-900 font-bold ml-1">&times;</button>
                                    </span>
                                ))}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchTerm('')
                                        setSelectedStatuses([])
                                        setSelectedPriorities([])
                                        setSelectedCategories([])
                                    }}
                                    className="text-xs font-semibold text-red-600 hover:text-red-800 ml-2 underline"
                                >
                                    Clear All
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Incidents Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Incident
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Equipment / Machine
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Priority
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Assigned To
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {Array.isArray(paginatedIncidents) && paginatedIncidents.map((incident) => {
                                        if (!incident) return null

                                        const equipmentItem = Array.isArray(equipment) 
                                            ? equipment.find(eq => eq?.id === incident?.equipment_id) 
                                            : null
                                            
                                        const assignedUser = Array.isArray(users) 
                                            ? users.find(u => (u?.id || u?.userId) === incident?.assigned_to) 
                                            : null

                                        const reporterName = incident?.incidentReporter?.name || 
                                                           incident?.incidentReporter?.userName || 
                                                           'Unknown Reporter'

                                        const eqDisplay = incident?.relatedEquipment || equipmentItem

                                        return (
                                            <tr key={incident?.id || Math.random()} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs font-bold text-gray-400">#INC-{incident?.id}</span>
                                                            <span className="text-sm font-semibold text-gray-900">
                                                                {incident?.title || 'No Title'}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-gray-500 truncate max-w-xs mt-0.5">
                                                            {incident?.description || 'No Description'}
                                                        </div>
                                                        <div className="text-xs text-gray-400 mt-1">
                                                            <span className="capitalize">{incident?.category?.replace('_', ' ') || 'No Category'}</span>
                                                            {' • '}By: {reporterName}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {eqDisplay ? (
                                                        <div>
                                                            <div className="font-medium text-gray-900">{eqDisplay.name}</div>
                                                            <div className="text-xs text-gray-500">Asset: {eqDisplay.serial_number || 'N/A'}</div>
                                                            {eqDisplay.lab?.name && (
                                                                <div className="text-xs text-indigo-600 font-medium">{eqDisplay.lab.name}</div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">No Machine Attached</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(incident?.priority)}`}>
                                                        {incident?.priority || 'unknown'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {['admin', 'lab_assistant', 'lab_technician', 'teacher', 'faculty'].includes(user?.role) ? (
                                                        <select
                                                            value={incident?.status || 'open'}
                                                            onChange={(e) => updateStatus(incident?.id, e.target.value)}
                                                            className={`text-xs font-semibold rounded-full px-2 py-1 border-0 cursor-pointer ${getStatusColor(incident?.status)}`}
                                                        >
                                                            {statuses.map(status => (
                                                                <option key={status} value={status}>
                                                                    {status.replace('_', ' ')}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(incident?.status)}`}>
                                                            {(incident?.status || 'open').replace('_', ' ')}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {incident?.incidentAssignee?.name || incident?.incidentAssignee?.userName || assignedUser?.name || 'Unassigned'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {incident?.created_at ? new Date(incident.created_at).toLocaleDateString() : 'Unknown'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {/* View Details & Audit Timeline */}
                                                        <button
                                                            onClick={() => handleOpenDetailModal(incident)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors"
                                                            title="View Details & History"
                                                        >
                                                            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                                            </svg>
                                                            <span>Details</span>
                                                        </button>

                                                        {/* Resolve Button (if not yet resolved) */}
                                                        {incident.status !== 'resolved' && incident.status !== 'closed' && (
                                                            <button
                                                                onClick={() => handleOpenResolveModal(incident)}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                                                                title="Resolve Incident"
                                                            >
                                                                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                                                                </svg>
                                                                <span>Resolve</span>
                                                            </button>
                                                        )}

                                                        {/* Edit Button */}
                                                        <button
                                                            onClick={() => handleEdit(incident)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
                                                            title="Edit incident"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                                            </svg>
                                                            <span>Edit</span>
                                                        </button>

                                                        {/* Delete Button */}
                                                        {(user?.role === 'admin' || incident?.reported_by === (user?.id || user?.userId)) && (
                                                            <button
                                                                onClick={() => handleDeleteClick(incident?.id)}
                                                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
                                                                title="Delete incident"
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                                </svg>
                                                                <span>Delete</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>

                            {/* Empty state */}
                            {(!Array.isArray(filteredIncidents) || filteredIncidents.length === 0) && (
                                <div className="text-center py-12">
                                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.982 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                                    </svg>
                                    <p className="text-gray-500 text-lg">No incidents found</p>
                                    <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pagination */}
                    {Array.isArray(filteredIncidents) && filteredIncidents.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredIncidents.length}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={(newSize) => {
                                setPageSize(newSize)
                                setCurrentPage(1)
                            }}
                            pageSizeOptions={[10, 25, 50]}
                            itemLabel="incidents"
                            scrollToTop={true}
                        />
                    )}
                </main>
            </div>

            {/* MODAL 1: Report / Edit Incident Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="px-6 py-4 bg-gradient-to-r from-red-600 to-rose-700 text-white flex items-center justify-between">
                            <h3 className="text-lg font-bold">
                                {editingIncident ? `Edit Incident #INC-${editingIncident.id}` : 'Report New Incident'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowModal(false)
                                    setEditingIncident(null)
                                }}
                                className="text-white hover:text-red-200 text-xl font-bold p-1"
                            >
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                    Incident Title*
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="Brief summary of the issue (e.g., Optical Microscope LED Failed)"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                    Description*
                                </label>
                                <textarea
                                    required
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="Detailed description of what occurred, symptoms, error codes..."
                                />
                            </div>

                            {/* Equipment Selection with Machine Details preview */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Related Machine / Equipment {formData.category === 'malfunction' && <span className="text-red-600">*</span>}
                                    </label>
                                    <span className="text-xs text-gray-400">Select registered equipment</span>
                                </div>
                                <select
                                    value={formData.equipment_id}
                                    onChange={(e) => handleEquipmentChange(e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                                >
                                    <option value="">-- Select Equipment (Optional for non-machine incidents) --</option>
                                    {Array.isArray(equipment) && equipment.map(item => (
                                        <option key={item?.id || Math.random()} value={item?.id || ''}>
                                            {item?.name} {item?.serial_number ? `[Asset: ${item.serial_number}]` : ''} {item?.lab?.name ? `(${item.lab.name})` : ''}
                                        </option>
                                    ))}
                                </select>

                                {/* Auto-populated Machine Details Preview Card */}
                                {formData.equipment_id && (() => {
                                    const selectedEq = Array.isArray(equipment) ? equipment.find(eq => String(eq.id) === String(formData.equipment_id)) : null
                                    if (!selectedEq) return null
                                    return (
                                        <div className="mt-2.5 p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-gray-900">{selectedEq.name}</span>
                                                <span className="text-gray-500 font-mono">Asset #{selectedEq.serial_number || 'N/A'}</span>
                                            </div>
                                            <div className="text-gray-600">
                                                Brand/Model: <span className="font-medium text-gray-800">{selectedEq.brand || 'N/A'} {selectedEq.model_name || ''}</span>
                                                {' • '}Category: <span className="font-medium text-gray-800">{selectedEq.category || 'N/A'}</span>
                                            </div>
                                            {selectedEq.lab && (
                                                <div className="text-indigo-600 font-medium">
                                                    Lab: {selectedEq.lab.name} {selectedEq.lab.location ? `(${selectedEq.lab.location})` : ''}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })()}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Priority*
                                    </label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                                    >
                                        {priorities.map(priority => (
                                            <option key={priority} value={priority}>
                                                {priority.charAt(0).toUpperCase() + priority.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Category*
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                                    >
                                        {categories.map(category => (
                                            <option key={category} value={category}>
                                                {category.charAt(0).toUpperCase() + category.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                    Incident Location
                                </label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="Room / Lab / Specific location"
                                />
                            </div>

                            {/* Assignee Selection */}
                            {['admin', 'lab_assistant', 'teacher'].includes(user?.role) && (
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Assign Technician / Staff
                                    </label>
                                    <select
                                        value={formData.assigned_to}
                                        onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
                                        className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                                    >
                                        <option value="">Unassigned</option>
                                        {Array.isArray(users) && users
                                            .filter(u => ['admin', 'lab_assistant', 'teacher', 'faculty', 'lab_technician'].includes(u?.role))
                                            .map(userItem => (
                                                <option key={userItem?.id || userItem?.userId || Math.random()} value={userItem?.id || userItem?.userId || ''}>
                                                    {userItem?.name || userItem?.userName || userItem?.email} ({userItem?.role})
                                                </option>
                                            ))}
                                    </select>
                                </div>
                            )}

                            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false)
                                        setEditingIncident(null)
                                    }}
                                    className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition-colors"
                                >
                                    {editingIncident ? 'Update Incident' : 'Report Incident'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 2: Dedicated Resolve Incident Modal */}
            {showResolveModal && resolvingIncident && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold">Resolve Incident #INC-{resolvingIncident.id}</h3>
                                <p className="text-xs text-emerald-100 mt-0.5">{resolvingIncident.title}</p>
                            </div>
                            <button
                                onClick={() => {
                                    setShowResolveModal(false)
                                    setResolvingIncident(null)
                                    setResolutionNotes('')
                                }}
                                className="text-white hover:text-emerald-200 text-xl font-bold p-1"
                            >
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleResolveSubmit} className="p-6 space-y-4">
                            {/* Authenticated Resolver Indicator */}
                            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                                    {(user?.name || user?.userName || 'U').charAt(0).toUpperCase()}
                                </div>
                                <div className="text-xs">
                                    <div className="font-semibold text-emerald-900">
                                        Resolving as: {user?.name || user?.userName || user?.email}
                                    </div>
                                    <div className="text-emerald-700 capitalize">Role: {user?.role || 'Staff'}</div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                    Resolution Notes / Remedial Actions*
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={resolutionNotes}
                                    onChange={(e) => setResolutionNotes(e.target.value)}
                                    className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Explain how the incident was diagnosed, resolved, components replaced, or tested..."
                                />
                                <p className="text-xs text-gray-400 mt-1">Resolution notes will be recorded in the permanent audit trail.</p>
                            </div>

                            <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowResolveModal(false)
                                        setResolvingIncident(null)
                                        setResolutionNotes('')
                                    }}
                                    className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                                    disabled={resolvingLoading}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={resolvingLoading || !resolutionNotes.trim()}
                                    className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl shadow-md transition-colors flex items-center gap-2"
                                >
                                    {resolvingLoading && (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    )}
                                    <span>Confirm Resolution</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: Dedicated Incident Details & Audit Timeline Modal */}
            {showDetailModal && detailIncident && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="px-6 py-4 bg-gray-900 text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white text-gray-900">
                                    #INC-{detailIncident.id}
                                </span>
                                <h3 className="text-base font-bold text-white truncate max-w-md">
                                    {detailIncident.title}
                                </h3>
                            </div>
                            <button
                                onClick={() => {
                                    setShowDetailModal(false)
                                    setDetailIncident(null)
                                    setIncidentAuditHistory([])
                                }}
                                className="text-gray-400 hover:text-white text-xl font-bold p-1"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-5">
                            {/* Status & Priority header */}
                            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Status:</span>
                                    <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full ${getStatusColor(detailIncident.status)}`}>
                                        {(detailIncident.status || 'open').replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Priority:</span>
                                    <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-full uppercase ${getPriorityColor(detailIncident.priority)}`}>
                                        {detailIncident.priority || 'medium'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Category:</span>
                                    <span className="text-xs font-semibold text-gray-800 capitalize">
                                        {detailIncident.category?.replace('_', ' ') || 'N/A'}
                                    </span>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Description</h4>
                                <p className="text-sm text-gray-800 bg-gray-50 p-3 rounded-xl border border-gray-200 whitespace-pre-wrap">
                                    {detailIncident.description || 'No description provided'}
                                </p>
                            </div>

                            {/* Machine / Equipment Details */}
                            {detailIncident.relatedEquipment && (
                                <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                                    <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2">
                                        Related Machine / Equipment Details
                                    </h4>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div><span className="text-gray-500">Name:</span> <strong className="text-gray-900">{detailIncident.relatedEquipment.name}</strong></div>
                                        <div><span className="text-gray-500">Asset #:</span> <strong className="font-mono text-gray-900">{detailIncident.relatedEquipment.serial_number || 'N/A'}</strong></div>
                                        <div><span className="text-gray-500">Brand/Model:</span> <span className="text-gray-900">{detailIncident.relatedEquipment.brand || ''} {detailIncident.relatedEquipment.model_name || ''}</span></div>
                                        <div><span className="text-gray-500">Category:</span> <span className="text-gray-900">{detailIncident.relatedEquipment.category || 'N/A'}</span></div>
                                        {detailIncident.relatedEquipment.lab && (
                                            <div className="col-span-2 text-indigo-700 font-medium">
                                                Lab Location: {detailIncident.relatedEquipment.lab.name} {detailIncident.relatedEquipment.lab.location ? `(${detailIncident.relatedEquipment.lab.location})` : ''}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Reporter & Assignee */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                                    <span className="text-gray-500 block mb-0.5 font-bold uppercase">Reported By</span>
                                    <strong className="text-gray-900">{detailIncident.incidentReporter?.name || detailIncident.incidentReporter?.userName || 'N/A'}</strong>
                                    <div className="text-gray-500">{detailIncident.incidentReporter?.email || detailIncident.incidentReporter?.userMail || ''}</div>
                                    <div className="text-gray-400 mt-1">{detailIncident.created_at ? new Date(detailIncident.created_at).toLocaleString() : ''}</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                                    <span className="text-gray-500 block mb-0.5 font-bold uppercase">Assigned Technician</span>
                                    <strong className="text-gray-900">{detailIncident.incidentAssignee?.name || detailIncident.incidentAssignee?.userName || 'Unassigned'}</strong>
                                    <div className="text-gray-500">{detailIncident.incidentAssignee?.email || detailIncident.incidentAssignee?.userMail || ''}</div>
                                </div>
                            </div>

                            {/* Resolution Details (if resolved) */}
                            {detailIncident.status === 'resolved' && (
                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2">
                                        Resolution Record
                                    </h4>
                                    <div className="text-xs space-y-1.5">
                                        <div>
                                            <span className="text-gray-600">Resolved By:</span>{' '}
                                            <strong className="text-emerald-950">
                                                {detailIncident.incidentResolver?.name || detailIncident.incidentResolver?.userName || 'Technician'}
                                            </strong>
                                            {detailIncident.resolved_at && (
                                                <span className="text-gray-500 ml-2">
                                                    on {new Date(detailIncident.resolved_at).toLocaleString()}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <span className="text-gray-600 block mb-1">Resolution Notes:</span>
                                            <p className="bg-white p-2.5 rounded-lg border border-emerald-100 text-gray-800 whitespace-pre-wrap">
                                                {detailIncident.resolution_notes || 'No resolution notes entered'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Audit History Timeline */}
                            <div className="pt-2 border-t border-gray-200">
                                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                                    Incident Audit Trail
                                </h4>
                                {loadingHistory ? (
                                    <div className="text-center py-4 text-xs text-gray-500">Loading audit history...</div>
                                ) : incidentAuditHistory.length === 0 ? (
                                    <div className="text-xs text-gray-400 italic py-2">No audit log records for this incident yet.</div>
                                ) : (
                                    <div className="space-y-3">
                                        {incidentAuditHistory.map((item, idx) => (
                                            <div key={item.id || idx} className="flex gap-3 text-xs">
                                                <div className="w-2 relative flex flex-col items-center">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1" />
                                                    {idx < incidentAuditHistory.length - 1 && (
                                                        <div className="w-0.5 flex-1 bg-gray-200 mt-1" />
                                                    )}
                                                </div>
                                                <div className="flex-1 bg-gray-50 p-3 rounded-xl border border-gray-200">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-bold text-gray-900 uppercase">
                                                            {item.action}
                                                        </span>
                                                        <span className="text-gray-400">
                                                            {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                                                        </span>
                                                    </div>
                                                    <div className="text-gray-600 mt-1">
                                                        By: <span className="font-semibold text-gray-800">{item.user_name || 'System'}</span>
                                                    </div>
                                                    {item.notes && (
                                                        <div className="text-gray-700 mt-1 italic">{item.notes}</div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 4: Delete Confirmation Dialog */}
            {deleteConfirmId && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 text-center">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.982 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Incident Record?</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to delete incident #INC-{deleteConfirmId}? This action cannot be undone.
                        </p>
                        <div className="flex justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                                disabled={deletingLoading}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteConfirmed}
                                disabled={deletingLoading}
                                className="px-5 py-2.5 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition-colors flex items-center gap-2"
                            >
                                {deletingLoading && (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                )}
                                <span>Delete Incident</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}