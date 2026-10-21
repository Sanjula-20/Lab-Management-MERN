import { Sidebar, AppHeader } from '../components/common/Navigation'
import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import SmartSearchBar from '../components/common/SmartSearchBar'
import Pagination from '../components/common/Pagination'

export default function OrderManagement() {
    // Order management specific state
    const [orders, setOrders] = useState([])
    const [filteredOrders, setFilteredOrders] = useState([])
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [editingOrder, setEditingOrder] = useState(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [ordersPerPage] = useState(10)
    const [selectedStatuses, setSelectedStatuses] = useState([])
    const [selectedPriorities, setSelectedPriorities] = useState([])
    const [formData, setFormData] = useState({
        supplier: '',
        equipment_name: '',
        quantity: 1,
        unit_price: '',
        total_amount: '',
        status: 'Pending',
        order_date: new Date().toISOString().split('T')[0],
        expected_delivery: '',
        description: '',
        priority: 'Medium'
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
    const [dealers, setDealers] = useState([])
    const [equipmentList, setEquipmentList] = useState([])
    const [loadingReferences, setLoadingReferences] = useState(false)
    const [modalError, setModalError] = useState('')
    const [saving, setSaving] = useState(false)

    const { user, isAuthenticated, logout } = useAuth()
    const isMasterAdmin = user?.role === 'master_admin' || user?.roleId === 7
    const isAdmin = user?.role === 'admin' || user?.roleId === 6 || isMasterAdmin
    const canManageOrders = isAdmin

    const navigate = useNavigate()
    const location = useLocation()
    const userMenuRef = useRef(null)
    const notificationRef = useRef(null)
    const API_BASE_URL = '/api'

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
            show: isAdmin,
            badge: orders.length > 0 ? orders.length : null
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
            show: isAdmin,
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
            show: isAdmin,
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
            show: user?.role === 'admin' || user?.role === 'lab_technician' || isMasterAdmin,
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

    // Search filter groups
    const orderSearchGroups = useMemo(() => [
        {
            id: 'status',
            label: 'Order Status',
            options: [
                { id: 'Pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
                { id: 'Approved', label: 'Approved', color: 'bg-blue-100 text-blue-800' },
                { id: 'Ordered', label: 'Ordered', color: 'bg-indigo-100 text-indigo-800' },
                { id: 'Delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
                { id: 'Cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
            ]
        },
        {
            id: 'priority',
            label: 'Priority Level',
            options: [
                { id: 'Low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
                { id: 'Medium', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
                { id: 'High', label: 'High', color: 'bg-red-100 text-red-800' }
            ]
        }
    ], [])

    // Escape key handler to go back to previous state
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' || event.key === 'Esc') {
                if (showCreateModal) {
                    setShowCreateModal(false)
                    setEditingOrder(null)
                } else if (showUserMenu) {
                    setShowUserMenu(false)
                } else if (showNotifications) {
                    setShowNotifications(false)
                } else if (searchQuery) {
                    setSearchQuery('')
                } else if (selectedStatuses.length > 0 || selectedPriorities.length > 0) {
                    setSelectedStatuses([])
                    setSelectedPriorities([])
                } else {
                    navigate(-1)
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [showCreateModal, showUserMenu, showNotifications, searchQuery, selectedStatuses, selectedPriorities, navigate])

    // Check if user is admin and load data
    useEffect(() => {
        // Set document title
        document.title = 'Orders | NEC LabMS'
        
        if (user && isAuthenticated) {
            fetchOrders()
            fetchReferences()
        }
    }, [user, isAuthenticated])

    // Filter orders when search or filter changes
    useEffect(() => {
        filterOrders()
    }, [searchQuery, selectedStatuses, selectedPriorities, orders])

    // Calculate total amount when quantity or price changes
    useEffect(() => {
        calculateTotal()
    }, [formData.quantity, formData.unit_price])

    const fetchReferences = async () => {
        setLoadingReferences(true)
        try {
            const [dealersRes, equipRes] = await Promise.allSettled([
                fetch(`${API_BASE_URL}/dealers`, { credentials: 'include' }).then(r => r.json()),
                fetch(`${API_BASE_URL}/equipment?limit=100`, { credentials: 'include' }).then(r => r.json())
            ])

            if (dealersRes.status === 'fulfilled' && dealersRes.value) {
                const val = dealersRes.value
                const dData = val.data || val
                setDealers(Array.isArray(dData) ? dData : [])
            }

            if (equipRes.status === 'fulfilled' && equipRes.value) {
                const val = equipRes.value
                const eData = val.data?.equipment || val.data || val.equipment || []
                setEquipmentList(Array.isArray(eData) ? eData : [])
            }
        } catch (err) {
            console.error('Error loading order reference data:', err)
        } finally {
            setLoadingReferences(false)
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
        // Search is handled by useEffect with searchQuery
    }

    const fetchOrders = async () => {
        try {
            setLoading(true)
            setError('')

            const response = await fetch(`${API_BASE_URL}/orders`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error(`Failed to fetch orders: ${response.status}`)
            }

            const result = await response.json()
            if (result.success) {
                setOrders(result.data || [])
                setFilteredOrders(result.data || [])
            } else {
                throw new Error(result.message || 'Failed to fetch orders')
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleRefresh = async () => {
        setIsRefreshing(true)
        try {
            await fetchOrders()
        } finally {
            setTimeout(() => setIsRefreshing(false), 600)
        }
    }

    const createOrder = async (orderData) => {
        try {
            setSaving(true)
            setModalError('')
            const response = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            })

            const result = await response.json().catch(() => ({}))

            if (!response.ok || !result.success) {
                const errMsg = result.message || (result.errors ? result.errors.map(e => e.msg).join(', ') : `Failed to create order: ${response.status}`)
                throw new Error(errMsg)
            }

            setShowCreateModal(false)
            resetForm()
            showSuccessMessage('Order created successfully!')
            await fetchOrders()
            return { success: true }
        } catch (error) {
            console.error('Error creating order:', error)
            setModalError(error.message)
            return { success: false, error: error.message }
        } finally {
            setSaving(false)
        }
    }

    const updateOrder = async (id, orderData) => {
        try {
            setSaving(true)
            setModalError('')
            const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            })

            const result = await response.json().catch(() => ({}))

            if (!response.ok || !result.success) {
                const errMsg = result.message || (result.errors ? result.errors.map(e => e.msg).join(', ') : `Failed to update order: ${response.status}`)
                throw new Error(errMsg)
            }

            setEditingOrder(null)
            setShowCreateModal(false)
            resetForm()
            showSuccessMessage('Order updated successfully!')
            await fetchOrders()
            return { success: true }
        } catch (error) {
            console.error('Error updating order:', error)
            setModalError(error.message)
            return { success: false, error: error.message }
        } finally {
            setSaving(false)
        }
    }

    const deleteOrder = async (id) => {
        if (!window.confirm('Are you sure you want to delete this order?')) return

        try {
            const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error(`Failed to delete order: ${response.status}`)
            }

            const result = await response.json()
            if (result.success) {
                setOrders(prev => prev.filter(order => order.id !== id))
                setFilteredOrders(prev => prev.filter(order => order.id !== id))
                showSuccessMessage('Order deleted successfully!')
            } else {
                throw new Error(result.message || 'Failed to delete order')
            }
        } catch (error) {
            console.error('Error deleting order:', error)
            setError(error.message)
        }
    }

    const resetForm = () => {
        setFormData({
            supplier: '',
            equipment_name: '',
            quantity: 1,
            unit_price: '',
            total_amount: '',
            status: 'Pending',
            order_date: new Date().toISOString().split('T')[0],
            expected_delivery: '',
            description: '',
            priority: 'Medium'
        })
        setModalError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const qty = parseInt(formData.quantity, 10)
        const unitP = parseFloat(formData.unit_price)
        const totalA = parseFloat(formData.total_amount) || (qty * unitP)

        if (!formData.supplier || !formData.supplier.trim()) {
            setModalError('Please enter or select a supplier')
            return
        }
        if (!formData.equipment_name || !formData.equipment_name.trim()) {
            setModalError('Please enter or select an equipment name')
            return
        }
        if (isNaN(qty) || qty < 1) {
            setModalError('Quantity must be at least 1')
            return
        }
        if (isNaN(unitP) || unitP < 0) {
            setModalError('Unit price must be a positive number')
            return
        }
        if (formData.expected_delivery && formData.order_date) {
            if (new Date(formData.expected_delivery) < new Date(formData.order_date)) {
                setModalError('Expected delivery cannot be before order date')
                return
            }
        }

        const orderData = {
            ...formData,
            quantity: qty,
            unit_price: unitP,
            total_amount: totalA,
            created_by: user?.userId || user?.id
        }

        if (editingOrder) {
            const result = await updateOrder(editingOrder.id, orderData)
            if (!result.success) {
                setModalError(result.error)
            }
        } else {
            const result = await createOrder(orderData)
            if (!result.success) {
                setModalError(result.error)
            }
        }
    }

    const filterOrders = () => {
        let filtered = orders

        if (searchQuery) {
            filtered = filtered.filter(order =>
                order.supplier?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.equipment_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                order.id.toString().includes(searchQuery)
            )
        }

        if (selectedStatuses.length > 0) {
            filtered = filtered.filter(order => selectedStatuses.includes(order.status))
        }

        if (selectedPriorities.length > 0) {
            filtered = filtered.filter(order => selectedPriorities.includes(order.priority))
        }

        setFilteredOrders(filtered)
        setCurrentPage(1)
    }

    const calculateTotal = () => {
        const quantity = parseFloat(formData.quantity) || 0
        const unitPrice = parseFloat(formData.unit_price) || 0
        const total = quantity * unitPrice
        setFormData(prev => ({ ...prev, total_amount: total.toFixed(2) }))
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

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800'
            case 'Approved': return 'bg-blue-100 text-blue-800'
            case 'Ordered': return 'bg-purple-100 text-purple-800'
            case 'Delivered': return 'bg-green-100 text-green-800'
            case 'Cancelled': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return 'bg-red-100 text-red-800'
            case 'Medium': return 'bg-yellow-100 text-yellow-800'
            case 'Low': return 'bg-green-100 text-green-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    // Pagination
    const indexOfLastOrder = currentPage * ordersPerPage
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
                    </div>
                    <p className="text-gray-600 mt-4 font-medium">Loading orders...</p>
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
                currentPath="/orders"
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
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
                            <p className="mt-2 text-gray-600">
                                Manage equipment orders and procurement. Track order status, suppliers, and delivery schedules.
                            </p>
                        </div>
                        {canManageOrders && (
                            <button
                                onClick={() => {
                                    setEditingOrder(null)
                                    resetForm()
                                    setShowCreateModal(true)
                                }}
                                id="header-add-order-btn"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all self-start sm:self-auto cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                <span>New Order</span>
                            </button>
                        )}
                    </div>

                    {/* Search and Filter Controls */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8 p-4 sm:p-5">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex-1 max-w-2xl">
                                <SmartSearchBar
                                    searchValue={searchQuery}
                                    onSearchChange={(val) => setSearchQuery(val)}
                                    placeholder="Search by supplier, equipment name, or order ID..."
                                    groups={orderSearchGroups}
                                    selectedOptions={{
                                        status: selectedStatuses,
                                        priority: selectedPriorities
                                    }}
                                    onOptionToggle={(groupId, optId) => {
                                        if (groupId === 'status') {
                                            setSelectedStatuses(prev => prev.includes(optId) ? prev.filter(x => x !== optId) : [...prev, optId])
                                        } else if (groupId === 'priority') {
                                            setSelectedPriorities(prev => prev.includes(optId) ? prev.filter(x => x !== optId) : [...prev, optId])
                                        }
                                    }}
                                    onGroupSelectAll={(groupId, allIds) => {
                                        if (groupId === 'status') setSelectedStatuses(allIds)
                                        else if (groupId === 'priority') setSelectedPriorities(allIds)
                                    }}
                                    onGroupClear={(groupId) => {
                                        if (groupId === 'status') setSelectedStatuses([])
                                        else if (groupId === 'priority') setSelectedPriorities([])
                                    }}
                                    onClearAll={() => {
                                        setSearchQuery('')
                                        setSelectedStatuses([])
                                        setSelectedPriorities([])
                                    }}
                                />
                            </div>
                            <div className="text-xs sm:text-sm font-semibold text-gray-600 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl self-start lg:self-center">
                                Showing <span className="text-blue-600 font-bold">{filteredOrders.length}</span> of <span className="font-bold text-gray-900">{orders.length}</span> orders
                            </div>
                        </div>
                    </div>

                    {/* Create/Edit Order Modal */}
                    {showCreateModal && (
                        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
                            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-100">
                                <div className="p-6">
                                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900">
                                                    {editingOrder ? 'Edit Order' : 'Create New Order'}
                                                </h2>
                                                <p className="text-xs text-gray-500">
                                                    {editingOrder ? 'Update order details and status' : 'Enter equipment and supplier details to place a new procurement order'}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                setShowCreateModal(false)
                                                setEditingOrder(null)
                                                resetForm()
                                            }}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                        >
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                            </svg>
                                        </button>
                                    </div>

                                    {modalError && (
                                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-xl flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <svg className="w-5 h-5 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                <span>{modalError}</span>
                                            </div>
                                            <button type="button" onClick={() => setModalError('')} className="text-red-400 hover:text-red-600 font-bold ml-2">✕</button>
                                        </div>
                                    )}

                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Supplier / Dealer <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    list="dealers-options"
                                                    placeholder="Select or enter supplier / dealer"
                                                    value={formData.supplier}
                                                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <datalist id="dealers-options">
                                                    {dealers.map((dealer) => (
                                                        <option key={dealer.id || dealer.name} value={dealer.name}>
                                                            {dealer.name} {dealer.contact_person ? `(${dealer.contact_person})` : ''}
                                                        </option>
                                                    ))}
                                                </datalist>
                                                <p className="mt-1 text-xs text-gray-400">Choose from existing dealers or type a new supplier</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Equipment Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    required
                                                    list="equipment-options"
                                                    placeholder="Select or enter equipment name"
                                                    value={formData.equipment_name}
                                                    onChange={(e) => setFormData({ ...formData, equipment_name: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <datalist id="equipment-options">
                                                    {equipmentList.map((equip) => (
                                                        <option key={equip.id || equip.name} value={equip.name}>
                                                            {equip.name} {equip.model ? `(${equip.model})` : ''}
                                                        </option>
                                                    ))}
                                                </datalist>
                                                <p className="mt-1 text-xs text-gray-400">Choose from inventory equipment or type a new item</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Quantity <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="10000"
                                                    required
                                                    value={formData.quantity}
                                                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Unit Price ($) <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    required
                                                    placeholder="0.00"
                                                    value={formData.unit_price}
                                                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Total Amount ($)
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    readOnly
                                                    value={formData.total_amount}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 font-semibold cursor-not-allowed"
                                                />
                                                <p className="mt-1 text-xs text-gray-400">Auto-calculated from quantity × unit price</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Status
                                                </label>
                                                <select
                                                    value={formData.status}
                                                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Approved">Approved</option>
                                                    <option value="Ordered">Ordered</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Priority
                                                </label>
                                                <select
                                                    value={formData.priority}
                                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="Low">Low</option>
                                                    <option value="Medium">Medium</option>
                                                    <option value="High">High</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Order Date <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="date"
                                                    required
                                                    value={formData.order_date}
                                                    onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Expected Delivery Date
                                                </label>
                                                <input
                                                    type="date"
                                                    value={formData.expected_delivery}
                                                    onChange={(e) => setFormData({ ...formData, expected_delivery: e.target.value })}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Description / Specifications
                                            </label>
                                            <textarea
                                                rows="3"
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Additional details about the order, model requirements, or delivery notes..."
                                            />
                                        </div>
                                        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setShowCreateModal(false)
                                                    setEditingOrder(null)
                                                    resetForm()
                                                }}
                                                className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors font-medium cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={saving}
                                                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                                            >
                                                {saving && (
                                                    <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                                    </svg>
                                                )}
                                                <span>{saving ? 'Saving...' : (editingOrder ? 'Update Order' : 'Create Order')}</span>
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Orders Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">Orders</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Order Details
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Supplier
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Priority
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {currentOrders.length > 0 ? (
                                        currentOrders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            Order #{order.id}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {order.equipment_name}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            Qty: {order.quantity}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{order.supplier}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {order.order_date ? new Date(order.order_date).toLocaleDateString() : 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        ${order.total_amount}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        ${order.unit_price} each
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(order.priority)}`}>
                                                        {order.priority}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingOrder(order)
                                                                setFormData({
                                                                    supplier: order.supplier,
                                                                    equipment_name: order.equipment_name,
                                                                    quantity: order.quantity,
                                                                    unit_price: order.unit_price,
                                                                    total_amount: order.total_amount,
                                                                    status: order.status,
                                                                    order_date: order.order_date ? order.order_date.split('T')[0] : '',
                                                                    expected_delivery: order.expected_delivery ? order.expected_delivery.split('T')[0] : '',
                                                                    description: order.description || '',
                                                                    priority: order.priority
                                                                })
                                                                setShowCreateModal(true)
                                                            }}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 border border-indigo-200 shadow-sm transition-all duration-150 hover:shadow"
                                                            title="Edit Order"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                                            </svg>
                                                            <span>Edit</span>
                                                        </button>
                                                        <button
                                                            onClick={() => deleteOrder(order.id)}
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 active:bg-red-200 border border-red-200 shadow-sm transition-all duration-150 hover:shadow"
                                                            title="Delete Order"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                                            </svg>
                                                            <span>Delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center">
                                                <div className="text-gray-500">
                                                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                                                    </svg>
                                                    <p className="text-lg font-medium">No orders found</p>
                                                    <p className="text-sm">Create your first order to get started.</p>
                                                    {canManageOrders && (
                                                        <button
                                                            onClick={() => {
                                                                setEditingOrder(null)
                                                                resetForm()
                                                                setShowCreateModal(true)
                                                            }}
                                                            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                            </svg>
                                                            <span>Create Order</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {filteredOrders.length > 0 && (
                            <Pagination
                                currentPage={currentPage}
                                totalItems={filteredOrders.length}
                                pageSize={ordersPerPage}
                                onPageChange={setCurrentPage}
                                onPageSizeChange={(newSize) => {
                                    setOrdersPerPage(newSize)
                                    setCurrentPage(1)
                                }}
                                pageSizeOptions={[10, 25, 50]}
                                itemLabel="orders"
                                scrollToTop={true}
                            />
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}