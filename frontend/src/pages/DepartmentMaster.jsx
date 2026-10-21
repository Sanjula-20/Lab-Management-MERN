// src/pages/DepartmentMaster.jsx - Complete Department Master CRUD
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Sidebar, AppHeader } from '../components/common/Navigation'
import SmartSearchBar from '../components/common/SmartSearchBar'
import Pagination from '../components/common/Pagination'
import { departmentsAPI } from '../services/api'

// Status Badge Component
function StatusBadge({ status }) {
    const config = {
        Active: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20' },
        Inactive: { bg: 'bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20' },
        Archived: { bg: 'bg-gray-100 text-gray-600 border-gray-200 ring-gray-500/20' }
    }[status] || { bg: 'bg-gray-50 text-gray-600 border-gray-200 ring-gray-500/20' }

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70"></span>
            {status}
        </span>
    )
}

// -------------------------------------------------------------
// ADD / EDIT DEPARTMENT MODAL
// -------------------------------------------------------------
function DepartmentModal({ isOpen, onClose, onSave, department = null, isSaving = false }) {
    const [formData, setFormData] = useState({
        departmentName: '',
        departmentAcr: '',
        description: '',
        status: 'Active'
    })
    const [errors, setErrors] = useState({})
    const nameInputRef = useRef(null)

    const isEdit = Boolean(department)

    useEffect(() => {
        if (department) {
            setFormData({
                departmentName: department.departmentName || '',
                departmentAcr: department.departmentAcr || '',
                description: department.description || '',
                status: department.status || 'Active'
            })
        } else {
            setFormData({
                departmentName: '',
                departmentAcr: '',
                description: '',
                status: 'Active'
            })
        }
        setErrors({})
    }, [department, isOpen])

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
        if (!formData.departmentName.trim()) {
            newErrors.departmentName = 'Department name is required'
        } else if (formData.departmentName.trim().length < 2) {
            newErrors.departmentName = 'Name must be at least 2 characters'
        }

        if (!formData.departmentAcr.trim()) {
            newErrors.departmentAcr = 'Department code / acronym is required'
        } else if (formData.departmentAcr.trim().length > 10) {
            newErrors.departmentAcr = 'Code must be 10 characters or less'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!validate()) return

        onSave({
            departmentName: formData.departmentName.trim(),
            departmentAcr: formData.departmentAcr.trim().toUpperCase(),
            description: formData.description ? formData.description.trim() : '',
            status: formData.status
        })
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div 
                className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline"
            >
                {/* Header */}
                <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                            <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div>
                            <h3 id="modal-headline" className="text-lg font-bold tracking-tight">
                                {isEdit ? 'Edit Department' : 'Create New Department'}
                            </h3>
                            <p className="text-xs text-blue-200/80">
                                {isEdit ? `Updating department #${department.departmentId}` : 'Add an academic or administrative department'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                        title="Close (Esc)"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                            Department Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                            ref={nameInputRef}
                            type="text"
                            value={formData.departmentName}
                            onChange={(e) => setFormData(prev => ({ ...prev, departmentName: e.target.value }))}
                            placeholder="e.g., Computer Science and Engineering"
                            className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                                errors.departmentName
                                    ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/30'
                                    : 'border-slate-200 focus:ring-indigo-500 hover:border-slate-300'
                            }`}
                        />
                        {errors.departmentName && (
                            <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {errors.departmentName}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                Code / Acronym <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.departmentAcr}
                                onChange={(e) => setFormData(prev => ({ ...prev, departmentAcr: e.target.value.toUpperCase() }))}
                                placeholder="e.g., CSE"
                                maxLength={10}
                                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono uppercase focus:outline-none focus:ring-2 transition-all ${
                                    errors.departmentAcr
                                        ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/30'
                                        : 'border-slate-200 focus:ring-indigo-500 hover:border-slate-300'
                                }`}
                            />
                            {errors.departmentAcr && (
                                <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {errors.departmentAcr}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:border-slate-300 transition-all bg-white"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                                <option value="Archived">Archived</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            rows={3}
                            placeholder="Optional notes or description about this department..."
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:border-slate-300 transition-all resize-none"
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSaving}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
                        >
                            Cancel (Esc)
                        </button>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all flex items-center space-x-2 disabled:opacity-50"
                        >
                            {isSaving ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                    </svg>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <span>{isEdit ? 'Update Department' : 'Create Department'}</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// -------------------------------------------------------------
// DELETE CONFIRMATION MODAL
// -------------------------------------------------------------
function DeleteDepartmentModal({ isOpen, onClose, onConfirm, department, isDeleting }) {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen && !isDeleting) {
                onClose()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, isDeleting, onClose])

    if (!isOpen || !department) return null

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div 
                className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200"
                role="dialog"
                aria-modal="true"
            >
                <div className="p-6 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto mb-4 text-rose-600">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.982 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Department?</h3>
                    <p className="text-sm text-slate-500 mb-6">
                        Are you sure you want to delete <span className="font-semibold text-slate-800">"{department.departmentName}" ({department.departmentAcr})</span>?
                        <br />
                        <span className="text-xs text-rose-500 mt-1 block">
                            Note: Departments with assigned staff members or associated labs cannot be deleted.
                        </span>
                    </p>
                    <div className="flex items-center justify-center space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isDeleting}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
                        >
                            Cancel (Esc)
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isDeleting}
                            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-lg shadow-rose-500/25 transition-all flex items-center space-x-2 disabled:opacity-50"
                        >
                            {isDeleting ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                    </svg>
                                    <span>Deleting...</span>
                                </>
                            ) : (
                                <span>Yes, Delete Department</span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// -------------------------------------------------------------
// MAIN COMPONENT
// -------------------------------------------------------------
export default function DepartmentMaster() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    // State
    const [departments, setDepartments] = useState([])
    const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, archived: 0, userDistribution: [] })
    const [isLoading, setIsLoading] = useState(true)
    const [isStatsLoading, setIsStatsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedStatus, setSelectedStatus] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [totalRecords, setTotalRecords] = useState(0)

    // Modal state
    const [modalOpen, setModalOpen] = useState(false)
    const [selectedDepartment, setSelectedDepartment] = useState(null)
    const [isSaving, setIsSaving] = useState(false)
    const [deleteModalOpen, setDeleteModalOpen] = useState(false)
    const [departmentToDelete, setDepartmentToDelete] = useState(null)
    const [isDeleting, setIsDeleting] = useState(false)

    // Alerts
    const [alertMessage, setAlertMessage] = useState(null)

    const showAlert = (type, message) => {
        setAlertMessage({ type, message })
        setTimeout(() => setAlertMessage(null), 5000)
    }

    // Fetch Stats
    const fetchStats = useCallback(async () => {
        try {
            setIsStatsLoading(true)
            const res = await departmentsAPI.getStats()
            if (res && res.data) {
                setStats(res.data)
            } else if (res) {
                setStats(res)
            }
        } catch (error) {
            console.error('Failed to fetch department stats:', error)
        } finally {
            setIsStatsLoading(false)
        }
    }, [])

    // Fetch Departments
    const fetchDepartments = useCallback(async () => {
        try {
            setIsLoading(true)
            const params = {
                page: currentPage,
                limit: pageSize
            }
            if (searchQuery.trim()) params.search = searchQuery.trim()
            if (selectedStatus) params.status = selectedStatus

            const res = await departmentsAPI.getAll(params)
            const data = res.data || res
            if (data && data.departments) {
                setDepartments(data.departments)
                setTotalRecords(data.pagination?.total || data.departments.length)
            } else if (Array.isArray(data)) {
                setDepartments(data)
                setTotalRecords(data.length)
            }
        } catch (error) {
            console.error('Failed to load departments:', error)
            showAlert('error', error.message || 'Failed to load departments')
        } finally {
            setIsLoading(false)
        }
    }, [currentPage, pageSize, searchQuery, selectedStatus])

    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    useEffect(() => {
        fetchDepartments()
    }, [fetchDepartments])

    // Save (Create or Update)
    const handleSave = async (formData) => {
        try {
            setIsSaving(true)
            if (selectedDepartment) {
                await departmentsAPI.update(selectedDepartment.departmentId, formData)
                showAlert('success', `Department "${formData.departmentName}" updated successfully.`)
            } else {
                await departmentsAPI.create(formData)
                showAlert('success', `Department "${formData.departmentName}" created successfully.`)
            }
            setModalOpen(false)
            setSelectedDepartment(null)
            fetchDepartments()
            fetchStats()
        } catch (error) {
            console.error('Save error:', error)
            showAlert('error', error.message || 'Failed to save department')
        } finally {
            setIsSaving(false)
        }
    }

    // Delete
    const handleDelete = async () => {
        if (!departmentToDelete) return
        try {
            setIsDeleting(true)
            await departmentsAPI.delete(departmentToDelete.departmentId)
            showAlert('success', `Department "${departmentToDelete.departmentName}" deleted successfully.`)
            setDeleteModalOpen(false)
            setDepartmentToDelete(null)
            fetchDepartments()
            fetchStats()
        } catch (error) {
            console.error('Delete error:', error)
            showAlert('error', error.message || 'Failed to delete department')
        } finally {
            setIsDeleting(false)
        }
    }

    // Toggle Status
    const handleToggleStatus = async (dept) => {
        const nextStatus = dept.status === 'Active' ? 'Inactive' : 'Active'
        try {
            await departmentsAPI.update(dept.departmentId, { status: nextStatus })
            showAlert('success', `Status updated to ${nextStatus} for ${dept.departmentName}.`)
            fetchDepartments()
            fetchStats()
        } catch (error) {
            showAlert('error', error.message || 'Failed to update department status')
        }
    }

    return (
        <div className="flex min-h-screen bg-slate-50 overflow-x-hidden font-sans">
            {/* Sidebar */}
            <Sidebar currentPath="/departments" sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

            {/* Main Content Area */}
            <div className={`flex-1 flex flex-col min-w-0 overflow-x-hidden transition-all duration-300 ${sidebarCollapsed ? "md:ml-16" : "md:ml-64"}`}>
                <AppHeader title="Department Master"  onToggleMobileMenu={() => setMobileOpen(!mobileOpen)} />

                <main className="flex-1 overflow-y-auto px-6 py-8">
                    <div className="max-w-7xl mx-auto space-y-6">

                        {/* Top Banner / Actions */}
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                                    <span className="p-2 rounded-xl bg-blue-100 text-blue-700">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </span>
                                    Department Master
                                </h1>
                                <p className="text-sm text-slate-500 mt-1">
                                    Manage academic departments, acronyms, and departmental user allocations across NEC LabMS.
                                </p>
                            </div>

                            <button
                                onClick={() => {
                                    setSelectedDepartment(null)
                                    setModalOpen(true)
                                }}
                                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold shadow-lg shadow-indigo-500/25 transition-all transform active:scale-95"
                            >
                                <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Add Department
                            </button>
                        </div>

                        {/* Alert Banner */}
                        {alertMessage && (
                            <div className={`p-4 rounded-xl border flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300 ${
                                alertMessage.type === 'success'
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                    : 'bg-rose-50 border-rose-200 text-rose-800'
                            }`}>
                                <div className="flex items-center space-x-2">
                                    {alertMessage.type === 'success' ? (
                                        <svg className="w-5 h-5 text-emerald-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 text-rose-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                    <span className="text-sm font-medium">{alertMessage.message}</span>
                                </div>
                                <button onClick={() => setAlertMessage(null)} className="p-1 hover:opacity-75">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Departments</span>
                                    <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-slate-900">{stats.total || 0}</span>
                                    <span className="text-xs text-slate-400">registered</span>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active</span>
                                    <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-emerald-700">{stats.active || 0}</span>
                                    <span className="text-xs text-emerald-600 font-medium">operational</span>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inactive</span>
                                    <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-amber-700">{stats.inactive || 0}</span>
                                    <span className="text-xs text-amber-600">paused</span>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Staff Allocation</span>
                                    <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                        </svg>
                                    </div>
                                </div>
                                <div className="mt-3 flex items-baseline gap-2">
                                    <span className="text-2xl font-bold text-indigo-700">
                                        {stats.userDistribution?.reduce((acc, d) => acc + (parseInt(d.userCount) || 0), 0) || 0}
                                    </span>
                                    <span className="text-xs text-indigo-600">users assigned</span>
                                </div>
                            </div>
                        </div>

                        {/* Search & Filter Bar */}
                        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
                            <div className="w-full sm:w-96 relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value)
                                        setCurrentPage(1)
                                    }}
                                    placeholder="Search by department name or code..."
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                {searchQuery && (
                                    <button 
                                        onClick={() => { setSearchQuery(''); setCurrentPage(1) }}
                                        className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center space-x-3 w-full sm:w-auto">
                                <select
                                    value={selectedStatus}
                                    onChange={(e) => {
                                        setSelectedStatus(e.target.value)
                                        setCurrentPage(1)
                                    }}
                                    className="px-3.5 py-2 rounded-xl border border-slate-200 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                >
                                    <option value="">All Statuses</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Archived">Archived</option>
                                </select>

                                <button
                                    onClick={() => {
                                        setSearchQuery('')
                                        setSelectedStatus('')
                                        setCurrentPage(1)
                                    }}
                                    className="px-3 py-2 text-xs text-slate-500 hover:text-slate-800 font-medium"
                                >
                                    Clear Filters
                                </button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/75 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                                            <th className="py-3.5 px-4">Code</th>
                                            <th className="py-3.5 px-4">Department Name</th>
                                            <th className="py-3.5 px-4">Status</th>
                                            <th className="py-3.5 px-4">Staff Count</th>
                                            <th className="py-3.5 px-4">Created By</th>
                                            <th className="py-3.5 px-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm">
                                        {isLoading ? (
                                            Array.from({ length: 4 }).map((_, idx) => (
                                                <tr key={idx} className="animate-pulse">
                                                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                                                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-48"></div></td>
                                                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-20"></div></td>
                                                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-12"></div></td>
                                                    <td className="py-4 px-4"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
                                                    <td className="py-4 px-4 text-right"><div className="h-4 bg-slate-200 rounded w-16 ml-auto"></div></td>
                                                </tr>
                                            ))
                                        ) : departments.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="py-12 text-center">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-slate-600 font-medium">No departments found</p>
                                                    <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or add a new department.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            departments.map((dept) => {
                                                const dist = stats.userDistribution?.find(d => d.departmentId === dept.departmentId)
                                                const userCount = dist?.userCount ?? 0

                                                return (
                                                    <tr key={dept.departmentId} className="hover:bg-slate-50/60 transition-colors">
                                                        <td className="py-4 px-4">
                                                            <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                                {dept.departmentAcr}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-4 font-semibold text-slate-900">
                                                            {dept.departmentName}
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <StatusBadge status={dept.status} />
                                                        </td>
                                                        <td className="py-4 px-4">
                                                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                                                                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                </svg>
                                                                {userCount} staff
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-4 text-xs text-slate-500">
                                                            {dept.creator?.name || dept.creator?.userName || 'System'}
                                                        </td>
                                                        <td className="py-4 px-4 text-right">
                                                            <div className="flex items-center justify-end space-x-1">
                                                                <button
                                                                    onClick={() => handleToggleStatus(dept)}
                                                                    title={dept.status === 'Active' ? 'Deactivate Department' : 'Activate Department'}
                                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                                                                >
                                                                    {dept.status === 'Active' ? (
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                    ) : (
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                        </svg>
                                                                    )}
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setSelectedDepartment(dept)
                                                                        setModalOpen(true)
                                                                    }}
                                                                    title="Edit Department"
                                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                    </svg>
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setDepartmentToDelete(dept)
                                                                        setDeleteModalOpen(true)
                                                                    }}
                                                                    title="Delete Department"
                                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalRecords > pageSize && (
                                <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-xs text-slate-500">
                                        Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalRecords)} of {totalRecords} departments
                                    </span>
                                    <Pagination
                                        currentPage={currentPage}
                                        totalPages={Math.ceil(totalRecords / pageSize)}
                                        onPageChange={setCurrentPage}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Modals with ESC Key Support */}
            <DepartmentModal
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false)
                    setSelectedDepartment(null)
                }}
                onSave={handleSave}
                department={selectedDepartment}
                isSaving={isSaving}
            />

            <DeleteDepartmentModal
                isOpen={deleteModalOpen}
                onClose={() => {
                    setDeleteModalOpen(false)
                    setDepartmentToDelete(null)
                }}
                onConfirm={handleDelete}
                department={departmentToDelete}
                isDeleting={isDeleting}
            />
        </div>
    )
}
