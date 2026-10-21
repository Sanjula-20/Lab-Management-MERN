// src/pages/AccessPermissions.jsx - Access & Permissions Control Page (Master Admin only)
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Sidebar, AppHeader } from '../components/common/Navigation'
import { rolesAPI } from '../services/api'

// Standard App Pages Definitions
const MANAGED_PAGES = [
    { key: 'dashboard', name: 'Dashboard', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z M8 5a2 2 0 012-2h4a2 2 0 012 2v3H8V5z', hasApprove: false, hasExport: true },
    { key: 'departments', name: 'Department Master', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', hasApprove: false, hasExport: true },
    { key: 'faculty', name: 'Faculty Master', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z', hasApprove: false, hasExport: true },
    { key: 'labs', name: 'Lab Management', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', hasApprove: false, hasExport: true },
    { key: 'equipment', name: 'Equipment Inventory', icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', hasApprove: false, hasExport: true },
    { key: 'equipment_categories', name: 'Equipment Categories', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', hasApprove: false, hasExport: false },
    { key: 'dealers', name: 'Dealer Master', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4', hasApprove: false, hasExport: true },
    { key: 'bookings', name: 'Bookings', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', hasApprove: true, hasExport: true },
    { key: 'calendar', name: 'Calendar', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', hasApprove: false, hasExport: false },
    { key: 'incidents', name: 'Incidents', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.982 16.5c-.77.833.192 2.5 1.732 2.5z', hasApprove: true, hasExport: true },
    { key: 'orders', name: 'Orders', icon: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z', hasApprove: true, hasExport: true },
    { key: 'reports', name: 'Reports', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', hasApprove: false, hasExport: true },
    { key: 'hardware_options', name: 'Hardware Options', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z', hasApprove: false, hasExport: false },
    { key: 'access_control', name: 'Access & Permissions', icon: 'M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z', isMasterAdminOnly: true, hasApprove: false, hasExport: false }
]

export default function AccessPermissions() {
    const { user } = useAuth()
    const navigate = useNavigate()

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [roles, setRoles] = useState([])
    const [selectedRoleId, setSelectedRoleId] = useState(6) // Default to Admin
    const [matrix, setMatrix] = useState({})
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [restoring, setRestoring] = useState(false)
    const [successMessage, setSuccessMessage] = useState('')
    const [error, setError] = useState('')

    // Auto-clear notifications
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

    // Load permission matrix
    const fetchPermissions = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const data = await rolesAPI.getPermissions()
            const roleList = data.roles || []
            setRoles(roleList)
            setMatrix(data.matrix || {})

            // If selected role not set or not in list, default to Admin (6) or Faculty (2)
            if (!roleList.find(r => r.roleId === selectedRoleId) && roleList.length > 0) {
                const preferredRole = roleList.find(r => r.roleId === 6) || roleList[0]
                setSelectedRoleId(preferredRole.roleId)
            }
        } catch (err) {
            console.error('Error loading permissions:', err)
            setError(err.message || 'Failed to load permissions matrix. Only Master Admin is authorized.')
        } finally {
            setLoading(false)
        }
    }, [selectedRoleId])

    useEffect(() => {
        fetchPermissions()
    }, [fetchPermissions])

    // Toggle specific permission
    const handleToggle = (pageKey, permissionKey) => {
        // Prevent editing access_control for non-master admin (enforce lockout prevention)
        if (selectedRoleId !== 7 && pageKey === 'access_control') {
            return
        }

        // Prevent Master Admin from locking themselves out of access_control
        if (selectedRoleId === 7 && pageKey === 'access_control' && (permissionKey === 'can_view' || permissionKey === 'is_sidebar_visible')) {
            return
        }

        setMatrix(prev => {
            const currentRoleData = prev[selectedRoleId] || { roleId: selectedRoleId, pages: {} }
            const currentPageData = currentRoleData.pages[pageKey] || {
                can_view: false,
                is_sidebar_visible: false,
                can_create: false,
                can_edit: false,
                can_delete: false,
                can_approve: false,
                can_export: false
            }

            const currentVal = Boolean(currentPageData[permissionKey])
            const newVal = !currentVal

            const updatedPage = {
                ...currentPageData,
                [permissionKey]: newVal
            }

            // If toggling off can_view, also turn off sidebar visibility and actions
            if (permissionKey === 'can_view' && !newVal) {
                updatedPage.is_sidebar_visible = false
                updatedPage.can_create = false
                updatedPage.can_edit = false
                updatedPage.can_delete = false
                updatedPage.can_approve = false
                updatedPage.can_export = false
            }

            // If enabling any action, auto-enable can_view
            if (['can_create', 'can_edit', 'can_delete', 'can_approve', 'can_export'].includes(permissionKey) && newVal) {
                updatedPage.can_view = true
            }

            return {
                ...prev,
                [selectedRoleId]: {
                    ...currentRoleData,
                    pages: {
                        ...currentRoleData.pages,
                        [pageKey]: updatedPage
                    }
                }
            }
        })
    }

    // Toggle all permissions for a page
    const handleToggleAllForPage = (pageKey, enable) => {
        if (selectedRoleId !== 7 && pageKey === 'access_control') return
        if (selectedRoleId === 7 && pageKey === 'access_control' && !enable) return

        setMatrix(prev => {
            const currentRoleData = prev[selectedRoleId] || { roleId: selectedRoleId, pages: {} }
            return {
                ...prev,
                [selectedRoleId]: {
                    ...currentRoleData,
                    pages: {
                        ...currentRoleData.pages,
                        [pageKey]: {
                            can_view: enable,
                            is_sidebar_visible: enable,
                            can_create: enable,
                            can_edit: enable,
                            can_delete: enable,
                            can_approve: enable,
                            can_export: enable
                        }
                    }
                }
            }
        })
    }

    // Save changes for selected role
    const handleSaveChanges = async () => {
        setSaving(true)
        setError('')
        try {
            const rolePagesConfig = matrix[selectedRoleId]?.pages || {}
            await rolesAPI.updatePermissions(selectedRoleId, rolePagesConfig)
            setSuccessMessage(`Permissions successfully saved for role "${roles.find(r => r.roleId === selectedRoleId)?.roleName}"!`)
        } catch (err) {
            console.error('Error saving permissions:', err)
            setError(err.message || 'Failed to save permissions')
        } finally {
            setSaving(false)
        }
    }

    // Restore system defaults
    const handleRestoreDefaults = async () => {
        if (!window.confirm('Restore system default permissions matrix for ALL roles? Any custom configuration will be reset.')) {
            return
        }
        setRestoring(true)
        setError('')
        try {
            await rolesAPI.restoreDefaults()
            setSuccessMessage('Default system permissions restored successfully!')
            await fetchPermissions()
        } catch (err) {
            console.error('Error restoring defaults:', err)
            setError(err.message || 'Failed to restore default permissions')
        } finally {
            setRestoring(false)
        }
    }

    const currentRole = roles.find(r => r.roleId === selectedRoleId)
    const currentPages = matrix[selectedRoleId]?.pages || {}

    return (
        <div className="min-h-screen w-full bg-gray-50/50 flex font-sans">
            <Sidebar
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
                currentPath="/access-permissions"
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            <div className={`flex-1 min-w-0 transition-all duration-300 overflow-x-hidden ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'} flex flex-col`}>
                <AppHeader
                    sidebarCollapsed={sidebarCollapsed}
                    setSidebarCollapsed={setSidebarCollapsed}
                    title="Access & Permissions Control"
                    subtitle="Configure role-based page visibility, CRUD privileges & approval authority"
                    onToggleMobileMenu={() => setMobileOpen(!mobileOpen)}
                />

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
                    {/* Security Notice Banner */}
                    <div className="p-4 bg-gradient-to-r from-indigo-900 to-blue-900 rounded-2xl text-white shadow-md flex items-center justify-between">
                        <div className="flex items-center space-x-3.5">
                            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
                                <svg className="w-6 h-6 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-base font-bold">Role-Based Access Control (RBAC) Matrix</h4>
                                <p className="text-xs text-indigo-200 mt-0.5">
                                    Configures both UI page / sidebar visibility AND backend API authorization. Unauthorized API requests receive HTTP 403.
                                </p>
                            </div>
                        </div>
                        <div className="hidden sm:block">
                            <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-bold uppercase tracking-wider">
                                Master Admin Only
                            </span>
                        </div>
                    </div>

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

                    {/* Role Selection Tabs */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center flex-wrap gap-2">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-2">Configuring Role:</span>
                            {roles.map(role => {
                                const isSelected = role.roleId === selectedRoleId
                                const isMaster = role.roleId === 7
                                return (
                                    <button
                                        key={role.roleId}
                                        onClick={() => setSelectedRoleId(role.roleId)}
                                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                                            isSelected
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        <span>{role.roleName}</span>
                                        {isMaster && (
                                            <span className="text-[10px] px-1.5 py-0.2 bg-amber-400 text-gray-900 rounded-sm font-black">
                                                ROOT
                                            </span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center space-x-2.5">
                            <button
                                onClick={handleRestoreDefaults}
                                disabled={restoring || saving}
                                className="px-3.5 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors disabled:opacity-50"
                            >
                                {restoring ? 'Restoring...' : 'Restore Defaults'}
                            </button>
                            <button
                                onClick={handleSaveChanges}
                                disabled={saving || restoring}
                                className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2"
                            >
                                {saving && (
                                    <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                <span>Save Changes</span>
                            </button>
                        </div>
                    </div>

                    {/* Permissions Matrix Table */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                        <div className="p-4 bg-gray-50/75 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-sm font-bold text-gray-900">
                                    Permissions for: <span className="text-blue-600">{currentRole?.roleName || 'Selected Role'}</span>
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Toggle sidebar display, read permissions, creation, editing, deletion and approval rights.
                                </p>
                            </div>
                            {selectedRoleId === 7 && (
                                <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg">
                                    🛡️ Master Admin has permanent super-access
                                </span>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                        <th className="py-3.5 px-6">Page / Module</th>
                                        <th className="py-3.5 px-4 text-center">Sidebar</th>
                                        <th className="py-3.5 px-4 text-center">View</th>
                                        <th className="py-3.5 px-4 text-center">Create</th>
                                        <th className="py-3.5 px-4 text-center">Edit</th>
                                        <th className="py-3.5 px-4 text-center">Delete</th>
                                        <th className="py-3.5 px-4 text-center">Approve</th>
                                        <th className="py-3.5 px-4 text-center">Export</th>
                                        <th className="py-3.5 px-4 text-center">Quick Set</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 text-xs font-medium text-gray-700">
                                    {loading ? (
                                        <tr>
                                            <td colSpan="9" className="py-16 text-center text-gray-400">
                                                <div className="flex flex-col items-center justify-center space-y-2">
                                                    <svg className="animate-spin h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span>Loading matrix...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        MANAGED_PAGES.map(page => {
                                            const pageConf = currentPages[page.key] || {}
                                            const isMasterLocked = selectedRoleId === 7
                                            const isRestrictedForOthers = selectedRoleId !== 7 && page.isMasterAdminOnly

                                            return (
                                                <tr
                                                    key={page.key}
                                                    className={`hover:bg-blue-50/20 transition-colors ${
                                                        isRestrictedForOthers ? 'opacity-40 bg-gray-50/40' : ''
                                                    }`}
                                                >
                                                    {/* Page Name */}
                                                    <td className="py-3.5 px-6">
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={page.icon} />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <span className="font-bold text-gray-900 block">{page.name}</span>
                                                                <span className="text-[11px] text-gray-400 font-mono">{page.key}</span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Sidebar Visible */}
                                                    <td className="py-3.5 px-4 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={Boolean(pageConf.is_sidebar_visible)}
                                                            onChange={() => handleToggle(page.key, 'is_sidebar_visible')}
                                                            disabled={isMasterLocked || isRestrictedForOthers}
                                                            className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                                                        />
                                                    </td>

                                                    {/* Can View */}
                                                    <td className="py-3.5 px-4 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={Boolean(pageConf.can_view)}
                                                            onChange={() => handleToggle(page.key, 'can_view')}
                                                            disabled={isMasterLocked || isRestrictedForOthers}
                                                            className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                                                        />
                                                    </td>

                                                    {/* Can Create */}
                                                    <td className="py-3.5 px-4 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={Boolean(pageConf.can_create)}
                                                            onChange={() => handleToggle(page.key, 'can_create')}
                                                            disabled={isMasterLocked || isRestrictedForOthers}
                                                            className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                                                        />
                                                    </td>

                                                    {/* Can Edit */}
                                                    <td className="py-3.5 px-4 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={Boolean(pageConf.can_edit)}
                                                            onChange={() => handleToggle(page.key, 'can_edit')}
                                                            disabled={isMasterLocked || isRestrictedForOthers}
                                                            className="w-4 h-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                                                        />
                                                    </td>

                                                    {/* Can Delete */}
                                                    <td className="py-3.5 px-4 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={Boolean(pageConf.can_delete)}
                                                            onChange={() => handleToggle(page.key, 'can_delete')}
                                                            disabled={isMasterLocked || isRestrictedForOthers}
                                                            className="w-4 h-4 rounded text-red-600 border-gray-300 focus:ring-red-500 cursor-pointer disabled:opacity-50"
                                                        />
                                                    </td>

                                                    {/* Can Approve */}
                                                    <td className="py-3.5 px-4 text-center">
                                                        {page.hasApprove ? (
                                                            <input
                                                                type="checkbox"
                                                                checked={Boolean(pageConf.can_approve)}
                                                                onChange={() => handleToggle(page.key, 'can_approve')}
                                                                disabled={isMasterLocked || isRestrictedForOthers}
                                                                className="w-4 h-4 rounded text-purple-600 border-gray-300 focus:ring-purple-500 cursor-pointer disabled:opacity-50"
                                                            />
                                                        ) : (
                                                            <span className="text-gray-300">—</span>
                                                        )}
                                                    </td>

                                                    {/* Can Export */}
                                                    <td className="py-3.5 px-4 text-center">
                                                        {page.hasExport ? (
                                                            <input
                                                                type="checkbox"
                                                                checked={Boolean(pageConf.can_export)}
                                                                onChange={() => handleToggle(page.key, 'can_export')}
                                                                disabled={isMasterLocked || isRestrictedForOthers}
                                                                className="w-4 h-4 rounded text-emerald-600 border-gray-300 focus:ring-emerald-500 cursor-pointer disabled:opacity-50"
                                                            />
                                                        ) : (
                                                            <span className="text-gray-300">—</span>
                                                        )}
                                                    </td>

                                                    {/* Quick Actions (All / None) */}
                                                    <td className="py-3.5 px-4 text-center">
                                                        <div className="inline-flex space-x-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleToggleAllForPage(page.key, true)}
                                                                disabled={isMasterLocked || isRestrictedForOthers}
                                                                className="px-2 py-0.5 text-[10px] font-bold text-blue-600 hover:bg-blue-50 rounded-md disabled:opacity-40"
                                                            >
                                                                All
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleToggleAllForPage(page.key, false)}
                                                                disabled={isMasterLocked || isRestrictedForOthers}
                                                                className="px-2 py-0.5 text-[10px] font-bold text-gray-500 hover:bg-gray-100 rounded-md disabled:opacity-40"
                                                            >
                                                                None
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

                        {/* Footer info */}
                        <div className="p-4 bg-gray-50/75 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                            <span>Changes take effect immediately on backend upon saving. Frontend sessions refresh permissions dynamically.</span>
                            <button
                                onClick={handleSaveChanges}
                                disabled={saving}
                                className="px-4 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
                            >
                                {saving ? 'Saving...' : 'Save Permissions'}
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
