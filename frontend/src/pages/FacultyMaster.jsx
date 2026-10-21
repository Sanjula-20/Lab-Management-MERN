// src/pages/FacultyMaster.jsx - Dedicated Faculty Master CRUD Page
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Sidebar, AppHeader } from '../components/common/Navigation'
import SmartSearchBar from '../components/common/SmartSearchBar'
import Pagination from '../components/common/Pagination'
import { facultyAPI, departmentsAPI, labsAPI } from '../services/api'

// Status Badge Component
function StatusBadge({ status }) {
    const config = {
        Active: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20' },
        Inactive: { bg: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20' }
    }[status] || { bg: 'bg-gray-50 text-gray-600 border-gray-200 ring-gray-500/20' }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70"></span>
            {status}
        </span>
    )
}

// -------------------------------------------------------------
// ADD / EDIT FACULTY MODAL
// -------------------------------------------------------------
function FacultyModal({ isOpen, onClose, onSave, faculty = null, isSaving = false, departments = [], labs = [] }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        staffId: '',
        phone: '',
        departmentId: '',
        designation: 'Assistant Professor',
        status: 'Active',
        password: '',
        assignedLabId: ''
    })
    const [errors, setErrors] = useState({})
    const nameInputRef = useRef(null)

    const isEdit = Boolean(faculty)

    useEffect(() => {
        if (faculty) {
            setFormData({
                name: faculty.name || faculty.userName || '',
                email: faculty.email || faculty.userMail || '',
                staffId: faculty.staffId || faculty.userNumber || '',
                phone: faculty.phone || '',
                departmentId: faculty.departmentId ? String(faculty.departmentId) : '',
                designation: faculty.designation || faculty.position || 'Assistant Professor',
                status: faculty.status || 'Active',
                password: '',
                assignedLabId: faculty.assignedLabs && faculty.assignedLabs.length > 0 ? String(faculty.assignedLabs[0].id) : ''
            })
        } else {
            setFormData({
                name: '',
                email: '',
                staffId: '',
                phone: '',
                departmentId: departments.length > 0 ? String(departments[0].departmentId) : '',
                designation: 'Assistant Professor',
                status: 'Active',
                password: 'Password@123',
                assignedLabId: ''
            })
        }
        setErrors({})
    }, [faculty, isOpen, departments])

    // ESC key listener
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen && !isSaving) {
                onClose()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, isSaving, onClose])

    // Auto-focus on open
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => nameInputRef.current?.focus(), 100)
        }
    }, [isOpen])

    if (!isOpen) return null

    const validate = () => {
        const newErrors = {}
        if (!formData.name.trim()) {
            newErrors.name = 'Faculty name is required'
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters'
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email address is required'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            newErrors.email = 'Enter a valid email address'
        }

        if (!isEdit && !formData.password.trim()) {
            newErrors.password = 'Initial password is required'
        }

        if (formData.phone && !/^[0-9+\s-]{7,15}$/.test(formData.phone.trim())) {
            newErrors.phone = 'Enter a valid contact number'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!validate()) return

        const payload = {
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            staffId: formData.staffId ? formData.staffId.trim() : undefined,
            userNumber: formData.staffId ? formData.staffId.trim() : undefined,
            phone: formData.phone.trim() || null,
            departmentId: formData.departmentId ? parseInt(formData.departmentId) : null,
            designation: formData.designation.trim() || 'Assistant Professor',
            position: formData.designation.trim() || 'Assistant Professor',
            status: formData.status,
            assignedLabId: formData.assignedLabId ? parseInt(formData.assignedLabId) : null
        }

        if (formData.password) {
            payload.password = formData.password
        }

        onSave(payload)
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-gray-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">{isEdit ? 'Edit Faculty Member' : 'Add New Faculty Member'}</h3>
                            <p className="text-xs text-blue-100/90 mt-0.5">
                                {isEdit ? `Updating profile: ${faculty.name || faculty.userName}` : 'Create a faculty profile assigned to a department'}
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Name */}
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                Faculty Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                ref={nameInputRef}
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g., Dr. Rajesh Sharma"
                                disabled={isSaving}
                                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                                    errors.name
                                        ? 'border-red-300 bg-red-50/50 text-red-900 focus:ring-2 focus:ring-red-400 focus:border-red-400'
                                        : 'border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                                }`}
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-600 font-medium">{errors.name}</p>}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                Institutional Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="rajesh@college.edu"
                                disabled={isSaving}
                                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                                    errors.email
                                        ? 'border-red-300 bg-red-50/50 text-red-900 focus:ring-2 focus:ring-red-400 focus:border-red-400'
                                        : 'border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                                }`}
                            />
                            {errors.email && <p className="mt-1 text-xs text-red-600 font-medium">{errors.email}</p>}
                        </div>

                        {/* Staff ID */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                Staff ID / Employee No.
                            </label>
                            <input
                                type="text"
                                value={formData.staffId}
                                onChange={(e) => setFormData({ ...formData, staffId: e.target.value })}
                                placeholder="e.g., FAC-0104"
                                disabled={isSaving}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all uppercase"
                            />
                        </div>

                        {/* Department */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                Department <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.departmentId}
                                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                                disabled={isSaving}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            >
                                <option value="">Select Department...</option>
                                {departments.map(dept => (
                                    <option key={dept.departmentId} value={dept.departmentId}>
                                        {dept.departmentName} ({dept.departmentAcr})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Designation */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                Designation
                            </label>
                            <input
                                type="text"
                                value={formData.designation}
                                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                placeholder="e.g., Associate Professor"
                                disabled={isSaving}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                Phone Number
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+91 9876543210"
                                disabled={isSaving}
                                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                                    errors.phone
                                        ? 'border-red-300 bg-red-50/50 text-red-900 focus:ring-2 focus:ring-red-400 focus:border-red-400'
                                        : 'border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                                }`}
                            />
                            {errors.phone && <p className="mt-1 text-xs text-red-600 font-medium">{errors.phone}</p>}
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                Account Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                disabled={isSaving}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>

                        {/* Assign Lab In-Charge */}
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                Assign Lab In-Charge (Optional)
                            </label>
                            <select
                                value={formData.assignedLabId}
                                onChange={(e) => setFormData({ ...formData, assignedLabId: e.target.value })}
                                disabled={isSaving}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            >
                                <option value="">None (No Lab Assigned)</option>
                                {labs.map(lab => (
                                    <option key={lab.id} value={lab.id}>
                                        {lab.name} ({lab.location || 'Main Block'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Password (for new faculty) */}
                        {!isEdit && (
                            <div className="col-span-2">
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                    Initial Password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Enter initial password (default: Password@123)"
                                    disabled={isSaving}
                                    className={`w-full px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                                        errors.password
                                            ? 'border-red-300 bg-red-50/50 text-red-900 focus:ring-2 focus:ring-red-400 focus:border-red-400'
                                            : 'border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500'
                                    }`}
                                />
                                {errors.password && <p className="mt-1 text-xs text-red-600 font-medium">{errors.password}</p>}
                                <p className="mt-1 text-xs text-gray-500">The faculty member can change this upon first login.</p>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="px-4 py-2.5 text-sm font-semibold text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2"
                        >
                            {isSaving && (
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            <span>{isEdit ? 'Save Changes' : 'Create Faculty'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// -------------------------------------------------------------
// MAIN COMPONENT: FacultyMaster
// -------------------------------------------------------------
export default function FacultyMaster() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    // State
    const [facultyList, setFacultyList] = useState([])
    const [departmentsList, setDepartmentsList] = useState([])
    const [labsList, setLabsList] = useState([])
    const [loading, setLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    // Modals
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedFaculty, setSelectedFaculty] = useState(null)
    const [viewingFaculty, setViewingFaculty] = useState(null)

    // Filters & Pagination
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedDepartment, setSelectedDepartment] = useState('all')
    const [selectedStatus, setSelectedStatus] = useState('all')
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1
    })


    // Stats
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        inactive: 0,
        departmentsCount: 0
    })

    // Auto-clear messages
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => setSuccessMessage(''), 4000)
            return () => clearTimeout(timer)
        }
    }, [successMessage])

    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => setError(''), 6000)
            return () => clearTimeout(timer)
        }
    }, [error])

    // Load initial metadata (departments and labs)
    useEffect(() => {
        const fetchMetadata = async () => {
            try {
                const [deptRes, labsRes] = await Promise.all([
                    departmentsAPI.getAll({ limit: 100 }),
                    labsAPI.getAllLabs({ limit: 100 })
                ])
                if (deptRes?.departments) {
                    setDepartmentsList(deptRes.departments)
                } else if (Array.isArray(deptRes)) {
                    setDepartmentsList(deptRes)
                }

                if (labsRes?.data?.labs) {
                    setLabsList(labsRes.data.labs)
                } else if (labsRes?.labs) {
                    setLabsList(labsRes.labs)
                } else if (Array.isArray(labsRes)) {
                    setLabsList(labsRes)
                }
            } catch (err) {
                console.error('Failed to load departments or labs for faculty form:', err)
            }
        }
        fetchMetadata()
    }, [])

    // Load faculty members
    const fetchFaculty = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const params = {
                page: pagination.page,
                limit: pagination.limit
            }
            if (searchQuery.trim()) params.search = searchQuery.trim()
            if (selectedDepartment !== 'all') params.departmentId = selectedDepartment
            if (selectedStatus !== 'all') params.status = selectedStatus

            const response = await facultyAPI.getAll(params)
            const list = response?.faculty || response?.data?.faculty || []
            const pageMeta = response?.pagination || response?.data?.pagination || {}

            setFacultyList(list)
            setPagination(prev => ({
                ...prev,
                total: pageMeta.total || list.length,
                totalPages: pageMeta.totalPages || Math.ceil((pageMeta.total || list.length) / prev.limit) || 1
            }))

            // Compute statistics
            const activeCount = list.filter(f => f.status === 'Active').length
            const inactiveCount = list.filter(f => f.status === 'Inactive').length
            const uniqueDepts = new Set(list.map(f => f.departmentId).filter(Boolean))

            setStats({
                total: pageMeta.total || list.length,
                active: activeCount,
                inactive: inactiveCount,
                departmentsCount: uniqueDepts.size
            })
        } catch (err) {
            console.error('Error fetching faculty:', err)
            setError(err.message || 'Failed to fetch faculty records')
        } finally {
            setLoading(false)
        }
    }, [pagination.page, pagination.limit, searchQuery, selectedDepartment, selectedStatus])

    useEffect(() => {
        fetchFaculty()
    }, [fetchFaculty])

    // Save handler (Create or Edit)
    const handleSaveFaculty = async (payload) => {
        setIsSaving(true)
        setError('')
        try {
            if (selectedFaculty) {
                await facultyAPI.update(selectedFaculty.facultyId || selectedFaculty.id, payload)
                setSuccessMessage(`Faculty member "${payload.name}" updated successfully!`)
            } else {
                await facultyAPI.create(payload)
                setSuccessMessage(`Faculty member "${payload.name}" created successfully!`)
            }
            setIsModalOpen(false)
            setSelectedFaculty(null)
            fetchFaculty()
        } catch (err) {
            console.error('Error saving faculty:', err)
            setError(err.message || 'Failed to save faculty record')
        } finally {
            setIsSaving(false)
        }
    }

    // Deactivate / Delete handler
    const handleDeleteFaculty = async (faculty) => {
        const id = faculty.facultyId || faculty.id
        const confirmMsg = `Are you sure you want to deactivate or remove faculty "${faculty.name}"?`
        if (!window.confirm(confirmMsg)) return

        try {
            await facultyAPI.delete(id)
            setSuccessMessage(`Faculty member "${faculty.name}" has been deactivated successfully.`)
            fetchFaculty()
        } catch (err) {
            console.error('Error deleting faculty:', err)
            setError(err.message || 'Failed to deactivate faculty')
        }
    }

    // Toggle active status
    const handleToggleStatus = async (faculty) => {
        const id = faculty.facultyId || faculty.id
        const newStatus = faculty.status === 'Active' ? 'Inactive' : 'Active'
        try {
            await facultyAPI.update(id, { status: newStatus })
            setSuccessMessage(`Status updated to ${newStatus} for "${faculty.name}"`)
            fetchFaculty()
        } catch (err) {
            console.error('Error updating status:', err)
            setError(err.message || 'Failed to update faculty status')
        }
    }

    return (
        <div className="flex h-screen bg-gray-50/50 overflow-hidden font-sans">
            {/* Sidebar Navigation */}
            <Sidebar
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
                currentPath="/faculty"
                stats={{ totalFaculty: stats.total }}
            />

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col min-w-0 overflow-x-hidden transition-all duration-300 ${sidebarCollapsed ? "md:ml-16" : "md:ml-64"}`}>
                <AppHeader
                    sidebarCollapsed={sidebarCollapsed}
                    setSidebarCollapsed={setSidebarCollapsed}
                    title="Faculty Master"
                    subtitle="Manage academic staff, designations, department associations & lab assignments"
                 onToggleMobileMenu={() => setMobileOpen(!mobileOpen)} />

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
                    {/* Alerts */}
                    {error && (
                        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-center justify-between text-red-800 shadow-xs">
                            <div className="flex items-center space-x-3">
                                <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-semibold">{error}</span>
                            </div>
                            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">✕</button>
                        </div>
                    )}

                    {successMessage && (
                        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-xl flex items-center justify-between text-emerald-800 shadow-xs">
                            <div className="flex items-center space-x-3">
                                <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                <span className="text-sm font-semibold">{successMessage}</span>
                            </div>
                            <button onClick={() => setSuccessMessage('')} className="text-emerald-500 hover:text-emerald-700">✕</button>
                        </div>
                    )}

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center space-x-4">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Faculty</p>
                                <h4 className="text-2xl font-black text-gray-900 mt-0.5">{stats.total}</h4>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center space-x-4">
                            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Staff</p>
                                <h4 className="text-2xl font-black text-emerald-600 mt-0.5">{stats.active}</h4>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center space-x-4">
                            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.982 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Inactive Staff</p>
                                <h4 className="text-2xl font-black text-amber-600 mt-0.5">{stats.inactive}</h4>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex items-center space-x-4">
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Departments</p>
                                <h4 className="text-2xl font-black text-purple-600 mt-0.5">{departmentsList.length}</h4>
                            </div>
                        </div>
                    </div>

                    {/* Toolbar (Search, Filter, Add button) */}
                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
                            {/* Search */}
                            <div className="relative w-full sm:w-80">
                                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </span>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value)
                                        setPagination(p => ({ ...p, page: 1 }))
                                    }}
                                    placeholder="Search faculty by name, email, staff ID..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {/* Department filter */}
                            <div className="w-full sm:w-56">
                                <select
                                    value={selectedDepartment}
                                    onChange={(e) => {
                                        setSelectedDepartment(e.target.value)
                                        setPagination(p => ({ ...p, page: 1 }))
                                    }}
                                    className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                >
                                    <option value="all">All Departments</option>
                                    {departmentsList.map(d => (
                                        <option key={d.departmentId} value={d.departmentId}>
                                            {d.departmentName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Status filter */}
                            <div className="w-full sm:w-40">
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => {
                                        setSelectedStatus(e.target.value)
                                        setPagination(p => ({ ...p, page: 1 }))
                                    }}
                                    className="w-full px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        {/* Add Faculty Button */}
                        <button
                            onClick={() => {
                                setSelectedFaculty(null)
                                setIsModalOpen(true)
                            }}
                            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 shrink-0"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Add Faculty</span>
                        </button>
                    </div>

                    {/* Table View */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/75 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                        <th className="py-4 px-6">Faculty Member</th>
                                        <th className="py-4 px-6">Staff ID</th>
                                        <th className="py-4 px-6">Department</th>
                                        <th className="py-4 px-6">Designation</th>
                                        <th className="py-4 px-6">Assigned Labs</th>
                                        <th className="py-4 px-6">Status</th>
                                        <th className="py-4 px-6 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-sm font-medium text-gray-700">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" className="py-16 text-center text-gray-400">
                                                <div className="flex flex-col items-center justify-center space-y-2">
                                                    <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span className="text-sm">Loading faculty members...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : facultyList.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="py-16 text-center text-gray-400">
                                                <div className="flex flex-col items-center justify-center space-y-3">
                                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-base font-bold text-gray-600">No faculty records found</p>
                                                    <p className="text-xs text-gray-400 max-w-sm">
                                                        {searchQuery || selectedDepartment !== 'all' || selectedStatus !== 'all'
                                                            ? 'Try adjusting your search criteria or clearing filters'
                                                            : 'Click "Add Faculty" above to create your first faculty profile'}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        facultyList.map(faculty => (
                                            <tr key={faculty.facultyId || faculty.id} className="hover:bg-blue-50/30 transition-colors">
                                                {/* Faculty Member */}
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center shadow-xs">
                                                            {(faculty.name || faculty.userName || 'F').charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900">{faculty.name || faculty.userName}</p>
                                                            <p className="text-xs text-gray-500 font-normal">{faculty.email || faculty.userMail}</p>
                                                            {faculty.phone && (
                                                                <p className="text-xs text-gray-400 font-normal mt-0.5">{faculty.phone}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Staff ID */}
                                                <td className="py-4 px-6">
                                                    <span className="font-mono text-xs font-semibold px-2.5 py-1 bg-gray-100 text-gray-800 rounded-lg">
                                                        {faculty.staffId || faculty.userNumber || `FAC-${faculty.id}`}
                                                    </span>
                                                </td>

                                                {/* Department */}
                                                <td className="py-4 px-6">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                        {faculty.departmentName || faculty.department || 'General'}
                                                    </span>
                                                </td>

                                                {/* Designation */}
                                                <td className="py-4 px-6 font-medium text-gray-800">
                                                    {faculty.designation || faculty.position || 'Assistant Professor'}
                                                </td>

                                                {/* Assigned Labs */}
                                                <td className="py-4 px-6">
                                                    {faculty.assignedLabs && faculty.assignedLabs.length > 0 ? (
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {faculty.assignedLabs.map(lab => (
                                                                <span key={lab.id} className="px-2 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-md border border-emerald-200">
                                                                    {lab.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-gray-400 italic">None</span>
                                                    )}
                                                </td>

                                                {/* Status */}
                                                <td className="py-4 px-6">
                                                    <StatusBadge status={faculty.status || 'Active'} />
                                                </td>

                                                {/* Actions */}
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end space-x-1">
                                                        {/* Toggle status */}
                                                        <button
                                                            onClick={() => handleToggleStatus(faculty)}
                                                            className={`p-1.5 rounded-lg transition-colors ${
                                                                faculty.status === 'Active'
                                                                    ? 'text-amber-600 hover:bg-amber-50'
                                                                    : 'text-emerald-600 hover:bg-emerald-50'
                                                            }`}
                                                            title={faculty.status === 'Active' ? 'Deactivate' : 'Activate'}
                                                        >
                                                            {faculty.status === 'Active' ? (
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                                                </svg>
                                                            ) : (
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                </svg>
                                                            )}
                                                        </button>

                                                        {/* Edit */}
                                                        <button
                                                            onClick={() => {
                                                                setSelectedFaculty(faculty)
                                                                setIsModalOpen(true)
                                                            }}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Edit Faculty"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>

                                                        {/* Delete / Safe Deactivate */}
                                                        <button
                                                            onClick={() => handleDeleteFaculty(faculty)}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete / Deactivate"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination footer */}
                        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-xs text-gray-500 font-medium">
                                Showing {facultyList.length} of {pagination.total} faculty members
                            </p>
                            <Pagination
                                currentPage={pagination.page}
                                totalPages={pagination.totalPages}
                                onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
                            />
                        </div>
                    </div>
                </main>
            </div>

            {/* Modal for Add / Edit */}
            <FacultyModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    setSelectedFaculty(null)
                }}
                onSave={handleSaveFaculty}
                faculty={selectedFaculty}
                isSaving={isSaving}
                departments={departmentsList}
                labs={labsList}
            />
        </div>
    )
}
