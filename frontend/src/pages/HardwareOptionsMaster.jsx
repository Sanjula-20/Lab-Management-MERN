// src/pages/HardwareOptionsMaster.jsx - Hardware Configuration Options Master
import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Sidebar, AppHeader } from '../components/common/Navigation'
import { hardwareOptionsAPI } from '../services/api'

// Field Type Definitions with human-readable titles and icons
const FIELD_TYPE_METADATA = {
    processor_model: { title: 'Processor Models', icon: '⚡', desc: 'Intel Core i5, i7, AMD Ryzen 5, 7, etc.' },
    processor_generation: { title: 'Processor Generations', icon: '🔢', desc: '10th Gen, 11th Gen, 12th Gen, Zen 3, etc.' },
    operating_system: { title: 'Operating Systems', icon: '💻', desc: 'Windows 11 Pro, Ubuntu 22.04 LTS, macOS, etc.' },
    ram_capacity: { title: 'RAM Capacities', icon: '🧠', desc: '8 GB, 16 GB, 32 GB, 64 GB, etc.' },
    ram_type: { title: 'RAM Types', icon: '💽', desc: 'DDR3, DDR4, DDR5, LPDDR5, etc.' },
    storage_type: { title: 'Storage Types', icon: '💾', desc: 'NVMe SSD, SATA SSD, HDD 7200 RPM, etc.' },
    storage_capacity: { title: 'Storage Capacities', icon: '📦', desc: '256 GB, 512 GB, 1 TB, 2 TB, etc.' },
    gpu_model: { title: 'GPU Models', icon: '🎮', desc: 'NVIDIA RTX 4060, GTX 1650, Integrated Intel UHD, etc.' },
    gpu_memory: { title: 'GPU Memory Sizes', icon: '🎨', desc: '4 GB GDDR6, 6 GB, 8 GB, 16 GB, etc.' },
    condition_status: { title: 'Equipment Conditions', icon: '✨', desc: 'Brand New, Excellent, Good, Fair, Needs Service' }
}

export default function HardwareOptionsMaster() {
    const { user } = useAuth()
    const navigate = useNavigate()

    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [allOptions, setAllOptions] = useState([])
    const [groupedOptions, setGroupedOptions] = useState({})
    const [selectedFieldType, setSelectedFieldType] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')
    const [permissions, setPermissions] = useState(null)

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

    const isMasterAdmin = user?.role === 'master_admin' || user?.roleId === 7
    const isAdmin = user?.role === 'admin' || user?.roleId === 6 || isMasterAdmin
    const canCreateHardware = isMasterAdmin || isAdmin || Boolean(permissions?.hardware_options?.can_create)
    const canEditHardware = isMasterAdmin || isAdmin || Boolean(permissions?.hardware_options?.can_edit)
    const canDeleteHardware = isMasterAdmin || isAdmin || Boolean(permissions?.hardware_options?.can_delete)

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingOption, setEditingOption] = useState(null)
    const [formData, setFormData] = useState({
        field_type: 'processor_model',
        option_label: '',
        option_value: '',
        equipment_type: 'computer',
        sort_order: 0,
        is_active: true
    })

    // Auto-clear notices
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

    // Load options from backend
    const fetchOptions = useCallback(async () => {
        setLoading(true)
        setError('')
        try {
            const params = {}
            if (selectedFieldType !== 'all') params.field_type = selectedFieldType
            if (searchQuery.trim()) params.search = searchQuery.trim()

            const data = await hardwareOptionsAPI.getAll(params)
            const list = data.options || []
            const grp = data.grouped || {}
            setAllOptions(list)
            setGroupedOptions(grp)
        } catch (err) {
            console.error('Error fetching hardware options:', err)
            setError(err.message || 'Failed to fetch hardware configuration options')
        } finally {
            setLoading(false)
        }
    }, [selectedFieldType, searchQuery])

    useEffect(() => {
        fetchOptions()
    }, [fetchOptions])

    // Open modal to add or edit
    const handleOpenModal = (option = null, defaultType = null) => {
        if (option) {
            setEditingOption(option)
            setFormData({
                field_type: option.field_type,
                option_label: option.option_label,
                option_value: option.option_value,
                equipment_type: option.equipment_type || 'computer',
                sort_order: option.sort_order || 0,
                is_active: option.is_active !== undefined ? option.is_active : true
            })
        } else {
            setEditingOption(null)
            setFormData({
                field_type: defaultType || (selectedFieldType !== 'all' ? selectedFieldType : 'processor_model'),
                option_label: '',
                option_value: '',
                equipment_type: 'computer',
                sort_order: 0,
                is_active: true
            })
        }
        setIsModalOpen(true)
    }

    // Save Option
    const handleSaveOption = async (e) => {
        e.preventDefault()
        if (!formData.option_label.trim() || !formData.option_value.trim()) {
            setError('Both label and value are required')
            return
        }

        setIsSaving(true)
        setError('')
        try {
            if (editingOption) {
                await hardwareOptionsAPI.update(editingOption.id, formData)
                setSuccessMessage(`Option "${formData.option_label}" updated successfully!`)
            } else {
                await hardwareOptionsAPI.create(formData)
                setSuccessMessage(`Option "${formData.option_label}" added successfully!`)
            }
            setIsModalOpen(false)
            fetchOptions()
        } catch (err) {
            console.error('Error saving hardware option:', err)
            setError(err.message || 'Failed to save hardware option')
        } finally {
            setIsSaving(false)
        }
    }

    // Toggle active status
    const handleToggleActive = async (option) => {
        try {
            await hardwareOptionsAPI.update(option.id, { is_active: !option.is_active })
            setSuccessMessage(`Option "${option.option_label}" is now ${!option.is_active ? 'Active' : 'Inactive'}`)
            fetchOptions()
        } catch (err) {
            console.error('Error toggling option status:', err)
            setError(err.message || 'Failed to update option status')
        }
    }

    // Delete Option
    const handleDeleteOption = async (option) => {
        if (!window.confirm(`Delete configuration option "${option.option_label}"?`)) return
        try {
            await hardwareOptionsAPI.delete(option.id)
            setSuccessMessage(`Option "${option.option_label}" deleted successfully`)
            fetchOptions()
        } catch (err) {
            console.error('Error deleting option:', err)
            setError(err.message || 'Failed to delete configuration option')
        }
    }

    return (
        <div className="min-h-screen w-full bg-gray-50/50 flex font-sans">
            <Sidebar
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
                currentPath="/hardware-options"
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            <div className={`flex-1 min-w-0 transition-all duration-300 overflow-x-hidden ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'} flex flex-col`}>
                <AppHeader
                    sidebarCollapsed={sidebarCollapsed}
                    setSidebarCollapsed={setSidebarCollapsed}
                    title="Hardware Configuration Master"
                    subtitle="Manage processor models, RAM, storage, GPU & reusable configuration dropdowns"
                    onToggleMobileMenu={() => setMobileOpen(!mobileOpen)}
                />

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
                    {/* Header info */}
                    <div className="p-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 rounded-2xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center space-x-3.5">
                            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-bold">Dynamic Hardware Specifications</h3>
                                <p className="text-xs text-blue-100 mt-0.5">
                                    Options defined here automatically appear across Equipment creation wizards & filters without modifying React source code.
                                </p>
                            </div>
                        </div>

                        {canCreateHardware && (
                            <button
                                onClick={() => handleOpenModal()}
                                className="px-4 py-2.5 bg-white text-indigo-900 hover:bg-blue-50 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5 shrink-0 self-start sm:self-auto cursor-pointer"
                            >
                                <span>+ Add Configuration Option</span>
                            </button>
                        )}
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-center justify-between text-red-800 shadow-xs">
                            <span className="text-sm font-semibold">{error}</span>
                            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">✕</button>
                        </div>
                    )}

                    {successMessage && (
                        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 rounded-xl flex items-center justify-between text-emerald-800 shadow-xs">
                            <span className="text-sm font-semibold">{successMessage}</span>
                            <button onClick={() => setSuccessMessage('')} className="text-emerald-500 hover:text-emerald-700">✕</button>
                        </div>
                    )}

                    {/* Toolbar */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center flex-wrap gap-3 w-full sm:w-auto">
                            {/* Filter by field type */}
                            <select
                                value={selectedFieldType}
                                onChange={(e) => setSelectedFieldType(e.target.value)}
                                className="px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                            >
                                <option value="all">All Specification Types ({allOptions.length})</option>
                                {Object.entries(FIELD_TYPE_METADATA).map(([fKey, meta]) => (
                                    <option key={fKey} value={fKey}>
                                        {meta.icon} {meta.title}
                                    </option>
                                ))}
                            </select>

                            {/* Search */}
                            <div className="relative flex-1 sm:w-64">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search option value or label..."
                                    className="w-full pl-9 pr-4 py-2 bg-gray-50/70 border border-gray-200 rounded-xl text-xs font-medium focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                                />
                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </span>
                            </div>
                        </div>

                        <span className="text-xs text-gray-400 font-semibold">
                            {allOptions.length} total options configured
                        </span>
                    </div>

                    {/* Options Grid / Category Cards */}
                    {loading ? (
                        <div className="p-16 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
                            <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                            <span className="text-sm">Loading hardware configuration options...</span>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(FIELD_TYPE_METADATA)
                                .filter(([fKey]) => selectedFieldType === 'all' || selectedFieldType === fKey)
                                .map(([fKey, meta]) => {
                                    const opts = allOptions.filter(o => o.field_type === fKey)
                                    if (searchQuery && opts.length === 0) return null

                                    return (
                                        <div key={fKey} className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
                                            {/* Section Header */}
                                            <div className="px-5 py-3.5 bg-gray-50/75 border-b border-gray-100 flex items-center justify-between">
                                                <div className="flex items-center space-x-2.5">
                                                    <span className="text-lg">{meta.icon}</span>
                                                    <div>
                                                        <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider">{meta.title}</h4>
                                                        <p className="text-[11px] text-gray-400">{meta.desc}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-[10px] font-bold rounded-md">
                                                        {opts.length} options
                                                    </span>
                                                    {canCreateHardware && (
                                                        <button
                                                            onClick={() => handleOpenModal(null, fKey)}
                                                            className="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                                                        >
                                                            + Add
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Options Badges List */}
                                            <div className="p-4 sm:p-5">
                                                {opts.length === 0 ? (
                                                    <p className="text-xs text-gray-400 italic">No options defined for this specification type yet.</p>
                                                ) : (
                                                    <div className="flex flex-wrap gap-2.5">
                                                        {opts.map(opt => (
                                                            <div
                                                                key={opt.id}
                                                                className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                                                                    opt.is_active
                                                                        ? 'bg-gray-50 hover:bg-blue-50/50 border-gray-200 text-gray-800'
                                                                        : 'bg-gray-100/60 border-gray-200 text-gray-400 line-through'
                                                                }`}
                                                            >
                                                                <span className="font-semibold text-gray-900">{opt.option_label}</span>
                                                                {opt.option_value !== opt.option_label && (
                                                                    <span className="text-[10px] text-gray-400 font-mono">({opt.option_value})</span>
                                                                )}

                                                                {/* Edit */}
                                                                {canEditHardware && (
                                                                    <button
                                                                        onClick={() => handleOpenModal(opt)}
                                                                        className="text-blue-500 hover:text-blue-700 p-0.5 rounded hover:bg-white cursor-pointer"
                                                                        title="Edit"
                                                                    >
                                                                        ✎
                                                                    </button>
                                                                )}

                                                                {/* Status toggle */}
                                                                {canEditHardware && (
                                                                    <button
                                                                        onClick={() => handleToggleActive(opt)}
                                                                        className={`p-0.5 rounded hover:bg-white text-[10px] cursor-pointer ${
                                                                            opt.is_active ? 'text-amber-500' : 'text-emerald-600'
                                                                        }`}
                                                                        title={opt.is_active ? 'Deactivate' : 'Activate'}
                                                                    >
                                                                        {opt.is_active ? '⏸' : '▶'}
                                                                    </button>
                                                                )}

                                                                {/* Delete */}
                                                                {canDeleteHardware && (
                                                                    <button
                                                                        onClick={() => handleDeleteOption(opt)}
                                                                        className="text-red-400 hover:text-red-600 p-0.5 rounded hover:bg-white cursor-pointer"
                                                                        title="Delete"
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                        </div>
                    )}
                </main>
            </div>

            {/* Modal for Add / Edit Hardware Option */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden max-h-[90vh] flex flex-col my-auto transform animate-in fade-in zoom-in-95 duration-150">
                        <div className="shrink-0 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex justify-between items-center">
                            <h3 className="text-base font-bold">
                                {editingOption ? 'Edit Hardware Option' : 'Add Hardware Option'}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white cursor-pointer">✕</button>
                        </div>

                        <form onSubmit={handleSaveOption} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 min-h-0">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                    Specification Field Type *
                                </label>
                                <select
                                    value={formData.field_type}
                                    onChange={(e) => setFormData({ ...formData, field_type: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-bold"
                                >
                                    {Object.entries(FIELD_TYPE_METADATA).map(([fKey, meta]) => (
                                        <option key={fKey} value={fKey}>
                                            {meta.icon} {meta.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                    Display Label *
                                </label>
                                <input
                                    type="text"
                                    value={formData.option_label}
                                    onChange={(e) => setFormData({ ...formData, option_label: e.target.value })}
                                    placeholder="e.g., Intel Core i7 13700K or 32 GB DDR5"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-blue-500/20"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                    Option Value (Stored Key) *
                                </label>
                                <input
                                    type="text"
                                    value={formData.option_value}
                                    onChange={(e) => setFormData({ ...formData, option_value: e.target.value })}
                                    placeholder="e.g., 32gb_ddr5 or i7_13700k"
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium font-mono focus:ring-2 focus:ring-blue-500/20"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Sort Order
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.sort_order}
                                        onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={formData.is_active ? '1' : '0'}
                                        onChange={(e) => setFormData({ ...formData, is_active: e.target.value === '1' })}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs font-medium"
                                    >
                                        <option value="1">Active</option>
                                        <option value="0">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-gray-100 flex justify-end space-x-2.5">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs disabled:opacity-50"
                                >
                                    {isSaving ? 'Saving...' : 'Save Option'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
