// src/pages/EquipmentCategoryMaster.jsx - Equipment Category Master (Full CRUD)
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Sidebar, AppHeader } from '../components/common/Navigation'

const API_BASE_URL = '/api'

// Available Category Icons
const AVAILABLE_ICONS = [
    { id: 'desktop', label: 'Computer / Desktop' },
    { id: 'projector', label: 'Projector / Display' },
    { id: 'printer', label: 'Printer / Scanner' },
    { id: 'microscope', label: 'Microscope / Optics' },
    { id: 'flask', label: 'Lab Equipment / Beaker' },
    { id: 'network', label: 'Network / Router' },
    { id: 'shield', label: 'Safety / Protection' },
    { id: 'gauge', label: 'Measuring / Sensor' },
    { id: 'box', label: 'General / Other' }
]

// Available Color Themes
const COLOR_THEMES = [
    { id: 'blue', label: 'Ocean Blue', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800 border-blue-200', hex: '#2563eb' },
    { id: 'purple', label: 'Royal Purple', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-800 border-purple-200', hex: '#9333ea' },
    { id: 'emerald', label: 'Emerald Green', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200', hex: '#059669' },
    { id: 'amber', label: 'Amber Gold', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-800 border-amber-200', hex: '#d97706' },
    { id: 'orange', label: 'Sunset Orange', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-800 border-orange-200', hex: '#ea580c' },
    { id: 'indigo', label: 'Deep Indigo', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', badge: 'bg-indigo-100 text-indigo-800 border-indigo-200', hex: '#4f46e5' },
    { id: 'rose', label: 'Rose Red', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', badge: 'bg-rose-100 text-rose-800 border-rose-200', hex: '#e11d48' },
    { id: 'cyan', label: 'Cyan Teal', bg: 'bg-cyan-50', text: 'text-cyan-700', border: 'border-cyan-200', badge: 'bg-cyan-100 text-cyan-800 border-cyan-200', hex: '#0891b2' },
    { id: 'slate', label: 'Slate Gray', bg: 'bg-slate-50', text: 'text-slate-700', border: 'border-slate-200', badge: 'bg-slate-100 text-slate-800 border-slate-200', hex: '#475569' }
]

const getColorTheme = (themeId) => {
    return COLOR_THEMES.find(t => t.id === themeId) || COLOR_THEMES[0]
}

// Icon Component
function CategoryIcon({ icon, className = "w-5 h-5" }) {
    switch (icon) {
        case 'desktop':
            return (
                <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            )
        case 'projector':
            return (
                <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
            )
        case 'printer':
            return (
                <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
            )
        case 'microscope':
            return (
                <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                </svg>
            )
        case 'flask':
        case 'lab_equipment':
            return (
                <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
            )
        case 'network':
            return (
                <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                </svg>
            )
        case 'shield':
        case 'safety':
            return (
                <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            )
        case 'gauge':
        case 'measuring':
            return (
                <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        case 'box':
        default:
            return (
                <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            )
    }
}

// Format date helper
const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    try {
        const d = new Date(dateStr)
        if (isNaN(d.getTime())) return String(dateStr)
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    } catch {
        return String(dateStr)
    }
}

// -------------------------------------------------------------
// ADD CATEGORY MODAL
// -------------------------------------------------------------
function AddCategoryModal({ isOpen, onClose, onCategoryAdded }) {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        icon: 'desktop',
        color: 'blue',
        is_active: true
    })
    const [codeManuallyEdited, setCodeManuallyEdited] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Esc key to close
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) onClose()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    const handleNameChange = (e) => {
        const val = e.target.value
        setFormData(prev => ({
            ...prev,
            name: val,
            code: codeManuallyEdited ? prev.code : val.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
        }))
    }

    const handleCodeChange = (e) => {
        setCodeManuallyEdited(true)
        setFormData(prev => ({
            ...prev,
            code: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '')
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (!formData.name.trim()) {
            setError('Category name is required')
            setLoading(false)
            return
        }

        try {
            const response = await fetch(`${API_BASE_URL}/equipment-categories`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    code: formData.code.trim() || undefined,
                    description: formData.description.trim() || null,
                    icon: formData.icon,
                    color: formData.color,
                    is_active: formData.is_active
                })
            })

            const result = await response.json()
            if (result.success) {
                onCategoryAdded(result.data)
                onClose()
            } else {
                throw new Error(result.message || 'Failed to create category')
            }
        } catch (err) {
            console.error('Error creating category:', err)
            setError(err.message || 'Failed to create category')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    const currentTheme = getColorTheme(formData.color)

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 text-white flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                            <CategoryIcon icon={formData.icon} className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Add Equipment Category</h3>
                            <p className="text-xs text-blue-100">Create a new category for classifying lab equipment</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
                        title="Close (Esc)"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="p-3.5 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 text-xs font-medium flex items-center gap-2">
                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Name & Code */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                Category Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={handleNameChange}
                                placeholder="e.g., Oscilloscopes & Probes"
                                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                Category Code / Slug <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.code}
                                onChange={handleCodeChange}
                                placeholder="e.g., oscilloscope"
                                className="w-full px-3.5 py-2.5 text-sm font-mono border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-gray-50/50"
                            />
                            <p className="text-[11px] text-gray-400 mt-1">Unique database identifier (letters, numbers, underscore)</p>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            Description
                        </label>
                        <textarea
                            rows="2"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Briefly describe what kind of devices and instruments belong to this category..."
                            className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                    </div>

                    {/* Icon Selection */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Select Icon
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                            {AVAILABLE_ICONS.map(ic => {
                                const isSelected = formData.icon === ic.id
                                return (
                                    <button
                                        key={ic.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, icon: ic.id })}
                                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                                            isSelected
                                                ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/20 shadow-xs'
                                                : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                        title={ic.label}
                                    >
                                        <CategoryIcon icon={ic.id} className="w-5 h-5" />
                                        <span className="text-[10px] font-medium truncate w-full text-center">
                                            {ic.id}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Color Theme Selection */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Badge Color Theme
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {COLOR_THEMES.map(theme => {
                                const isSelected = formData.color === theme.id
                                return (
                                    <button
                                        key={theme.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, color: theme.id })}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${theme.badge} ${
                                            isSelected ? 'ring-2 ring-offset-1 ring-gray-900 shadow-xs' : 'opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.hex }}></span>
                                        {theme.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Status & Preview */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-gray-700 block mb-1">Status</span>
                            <label className="inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                                <span className={`ml-2 text-xs font-bold ${formData.is_active ? 'text-emerald-700' : 'text-gray-400'}`}>
                                    {formData.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </label>
                        </div>

                        {/* Live badge preview */}
                        <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Live Preview</span>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${currentTheme.badge}`}>
                                <CategoryIcon icon={formData.icon} className="w-3.5 h-3.5" />
                                {formData.name || 'Category Name'}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span>Create Category</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// -------------------------------------------------------------
// EDIT CATEGORY MODAL
// -------------------------------------------------------------
function EditCategoryModal({ isOpen, onClose, category, onCategoryUpdated }) {
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        icon: 'desktop',
        color: 'blue',
        is_active: true
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name || '',
                code: category.code || '',
                description: category.description || '',
                icon: category.icon || 'desktop',
                color: category.color || 'blue',
                is_active: category.is_active !== undefined ? category.is_active : true
            })
            setError('')
        }
    }, [category])

    // Esc key to close
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) onClose()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (!formData.name.trim()) {
            setError('Category name is required')
            setLoading(false)
            return
        }

        try {
            const response = await fetch(`${API_BASE_URL}/equipment-categories/${category.id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name.trim(),
                    code: formData.code.trim(),
                    description: formData.description.trim() || null,
                    icon: formData.icon,
                    color: formData.color,
                    is_active: formData.is_active
                })
            })

            const result = await response.json()
            if (result.success) {
                onCategoryUpdated(result.data)
                onClose()
            } else {
                throw new Error(result.message || 'Failed to update category')
            }
        } catch (err) {
            console.error('Error updating category:', err)
            setError(err.message || 'Failed to update category')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen || !category) return null

    const currentTheme = getColorTheme(formData.color)
    const codeChanged = category && formData.code !== category.code

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-5 text-white flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                            <CategoryIcon icon={formData.icon} className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Edit Category: {category.name}</h3>
                            <p className="text-xs text-amber-100">Update category details, theme, and status</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
                        title="Close (Esc)"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {error && (
                        <div className="p-3.5 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 text-xs font-medium flex items-center gap-2">
                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {codeChanged && (
                        <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-start gap-2">
                            <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.982 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <span>
                                <strong>Cascade Notice:</strong> Changing code from <code className="bg-amber-100 px-1 py-0.5 rounded font-bold">{category.code}</code> to <code className="bg-amber-100 px-1 py-0.5 rounded font-bold">{formData.code}</code> will automatically update all <strong>{category.equipment_count || 0}</strong> linked equipment items.
                            </span>
                        </div>
                    )}

                    {/* Name & Code */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                Category Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3.5 py-2.5 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                                Category Code / Slug <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                                className="w-full px-3.5 py-2.5 text-sm font-mono border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition bg-gray-50/50"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                            Description
                        </label>
                        <textarea
                            rows="2"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition"
                        />
                    </div>

                    {/* Icon Selection */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Select Icon
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                            {AVAILABLE_ICONS.map(ic => {
                                const isSelected = formData.icon === ic.id
                                return (
                                    <button
                                        key={ic.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, icon: ic.id })}
                                        className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                                            isSelected
                                                ? 'bg-amber-50 border-amber-500 text-amber-700 ring-2 ring-amber-500/20 shadow-xs'
                                                : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                        title={ic.label}
                                    >
                                        <CategoryIcon icon={ic.id} className="w-5 h-5" />
                                        <span className="text-[10px] font-medium truncate w-full text-center">
                                            {ic.id}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Color Theme Selection */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                            Badge Color Theme
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {COLOR_THEMES.map(theme => {
                                const isSelected = formData.color === theme.id
                                return (
                                    <button
                                        key={theme.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, color: theme.id })}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${theme.badge} ${
                                            isSelected ? 'ring-2 ring-offset-1 ring-gray-900 shadow-xs' : 'opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.hex }}></span>
                                        {theme.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Status & Preview */}
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-gray-700 block mb-1">Status</span>
                            <label className="inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                                <span className={`ml-2 text-xs font-bold ${formData.is_active ? 'text-emerald-700' : 'text-gray-400'}`}>
                                    {formData.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </label>
                        </div>

                        {/* Live badge preview */}
                        <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Preview</span>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${currentTheme.badge}`}>
                                <CategoryIcon icon={formData.icon} className="w-3.5 h-3.5" />
                                {formData.name || 'Category Name'}
                            </span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Saving Changes...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Save Changes</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// -------------------------------------------------------------
// VIEW CATEGORY MODAL (WITH LINKED EQUIPMENT PREVIEW)
// -------------------------------------------------------------
function ViewCategoryModal({ isOpen, onClose, categoryId, onEditCategory }) {
    const [details, setDetails] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (categoryId && isOpen) {
            setLoading(true)
            fetch(`${API_BASE_URL}/equipment-categories/${categoryId}`, {
                credentials: 'include'
            })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        setDetails(data.data)
                    } else {
                        throw new Error(data.message || 'Failed to fetch category')
                    }
                })
                .catch(err => {
                    console.error('Error fetching category:', err)
                    setError(err.message || 'Failed to load category details')
                })
                .finally(() => setLoading(false))
        }
    }, [categoryId, isOpen])

    // Esc key to close
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) onClose()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    if (!isOpen) return null

    const theme = details ? getColorTheme(details.color) : COLOR_THEMES[0]

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 text-white flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                            {details ? <CategoryIcon icon={details.icon} className="w-7 h-7 text-white" /> : <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold">{details?.name || 'Loading Category...'}</h3>
                                {details && (
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                        details.is_active ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30' : 'bg-red-400/20 text-red-200 border border-red-400/30'
                                    }`}>
                                        {details.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-blue-100 font-mono mt-0.5">code: {details?.code || '—'}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
                        title="Close (Esc)"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                            <p className="text-sm font-medium text-gray-500">Loading category specifications and linked equipment...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
                            {error}
                        </div>
                    ) : details ? (
                        <div className="space-y-6">
                            {/* Key Metrics */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Total Equipment</span>
                                    <span className="text-xl font-extrabold text-blue-600">{details.equipment_count || 0}</span>
                                    <span className="text-[11px] text-gray-500 block">linked items</span>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Color Theme</span>
                                    <span className="text-sm font-bold text-gray-800 capitalize flex items-center gap-1.5 mt-1">
                                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.hex }}></span>
                                        {theme.label}
                                    </span>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Created</span>
                                    <span className="text-xs font-bold text-gray-700 block mt-1">{formatDate(details.createdAt || details.created_at)}</span>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Last Updated</span>
                                    <span className="text-xs font-bold text-gray-700 block mt-1">{formatDate(details.updatedAt || details.updated_at)}</span>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">Description</h4>
                                <div className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-200 text-sm text-gray-700 leading-relaxed">
                                    {details.description || <span className="text-gray-400 italic">No description provided for this category.</span>}
                                </div>
                            </div>

                            {/* Linked Equipment List Preview */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Assigned Equipment ({details.equipment?.length || 0}{details.equipment_count > (details.equipment?.length || 0) ? ` of ${details.equipment_count}` : ''})
                                    </h4>
                                    <span className="text-[11px] text-gray-400">Previewing live inventory</span>
                                </div>

                                {details.equipment && details.equipment.length > 0 ? (
                                    <div className="max-h-56 overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100">
                                        {details.equipment.map(item => (
                                            <div key={item.id} className="p-3 hover:bg-gray-50 flex items-center justify-between text-xs transition">
                                                <div className="min-w-0 pr-3">
                                                    <p className="font-bold text-gray-900 truncate">{item.name}</p>
                                                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500">
                                                        <span className="font-mono text-gray-600 bg-gray-100 px-1.5 py-0.2 rounded">
                                                            SN: {item.serial_number || 'N/A'}
                                                        </span>
                                                        {item.model && <span>Model: {item.model}</span>}
                                                        {item.lab && (
                                                            <span className="text-blue-600 font-medium">
                                                                📍 {item.lab.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                                        item.status === 'available' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                                        item.status === 'in_use' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                                        'bg-amber-50 text-amber-700 border border-amber-200'
                                                    }`}>
                                                        {item.status || 'unknown'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-6 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-center text-xs text-gray-500">
                                        No equipment currently assigned to this category.
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : null}

                    {/* Footer Actions */}
                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                        >
                            Close
                        </button>
                        {details && (
                            <button
                                onClick={() => {
                                    onClose()
                                    onEditCategory(details)
                                }}
                                className="px-5 py-2 text-sm font-bold text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 rounded-xl shadow-md transition-all flex items-center gap-1.5"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                <span>Edit This Category</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// -------------------------------------------------------------
// DELETE CATEGORY CONFIRMATION DIALOG
// -------------------------------------------------------------
function DeleteCategoryDialog({ isOpen, onClose, category, onCategoryDeleted }) {
    const [loading, setLoading] = useState(false)
    const [forceReassign, setForceReassign] = useState(false)
    const [error, setError] = useState('')

    // Esc key to close
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) onClose()
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    if (!isOpen || !category) return null

    const hasLinkedEquipment = (category.equipment_count || 0) > 0

    const handleDelete = async () => {
        setLoading(true)
        setError('')

        try {
            const url = `${API_BASE_URL}/equipment-categories/${category.id}${forceReassign ? '?force=true' : ''}`
            const response = await fetch(url, {
                method: 'DELETE',
                credentials: 'include'
            })
            const result = await response.json()

            if (result.success) {
                onCategoryDeleted(category.id)
                onClose()
            } else {
                throw new Error(result.message || 'Failed to delete category')
            }
        } catch (err) {
            console.error('Error deleting category:', err)
            setError(err.message || 'Failed to delete category')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 text-center">
                        Delete Category "{category.name}"?
                    </h3>
                    <p className="text-xs text-gray-500 text-center font-mono mt-0.5">
                        code: {category.code}
                    </p>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 text-xs font-medium">
                            {error}
                        </div>
                    )}

                    {hasLinkedEquipment ? (
                        <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
                            <div className="flex items-center gap-1.5 font-bold text-amber-800">
                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.982 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <span>{category.equipment_count} Equipment Items Assigned</span>
                            </div>
                            <p>
                                This category is currently linked to <strong>{category.equipment_count}</strong> equipment items. Deleting it without reassigning would leave orphaned records.
                            </p>
                            <label className="flex items-start gap-2 pt-1 font-semibold text-amber-950 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={forceReassign}
                                    onChange={(e) => setForceReassign(e.target.checked)}
                                    className="mt-0.5 rounded text-red-600 focus:ring-red-500"
                                />
                                <span>Force delete and automatically reassign all {category.equipment_count} items to the 'Other' category.</span>
                            </label>
                        </div>
                    ) : (
                        <p className="mt-3 text-xs text-gray-500 text-center">
                            Are you sure you want to delete this category? This action cannot be undone.
                        </p>
                    )}

                    <div className="mt-6 flex items-center justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={loading || (hasLinkedEquipment && !forceReassign)}
                            className="px-5 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Deleting...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6" />
                                    </svg>
                                    <span>{hasLinkedEquipment ? 'Force Reassign & Delete' : 'Confirm Delete'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

// -------------------------------------------------------------
// MAIN PAGE COMPONENT: EquipmentCategoryMaster
// -------------------------------------------------------------
export default function EquipmentCategoryMaster() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    // Layout state
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)

    // Data state
    const [categories, setCategories] = useState([])
    const [stats, setStats] = useState({
        totalCategories: 0,
        activeCategories: 0,
        inactiveCategories: 0,
        totalEquipment: 0,
        topCategory: 'None'
    })
    const [loading, setLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [error, setError] = useState('')
    const [toastMessage, setToastMessage] = useState(null)

    // Filters
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all') // 'all', 'active', 'inactive'

    // Modal state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [selectedCategoryForEdit, setSelectedCategoryForEdit] = useState(null)
    const [selectedCategoryIdForView, setSelectedCategoryIdForView] = useState(null)
    const [selectedCategoryForDelete, setSelectedCategoryForDelete] = useState(null)

    const showToast = (message, type = 'success') => {
        setToastMessage({ message, type })
        setTimeout(() => setToastMessage(null), 4000)
    }

    const fetchStats = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/equipment-categories/stats`, { credentials: 'include' })
            const data = await res.json()
            if (data.success) {
                setStats(data.data)
            }
        } catch (err) {
            console.error('Error fetching stats:', err)
        }
    }

    const fetchCategories = async () => {
        try {
            setError('')
            const queryParams = new URLSearchParams()
            if (searchTerm.trim()) queryParams.append('search', searchTerm.trim())
            if (statusFilter !== 'all') queryParams.append('status', statusFilter)

            const url = `${API_BASE_URL}/equipment-categories?${queryParams.toString()}`
            const res = await fetch(url, { credentials: 'include' })
            const data = await res.json()

            if (data.success) {
                setCategories(data.data || [])
            } else {
                throw new Error(data.message || 'Failed to fetch categories')
            }
        } catch (err) {
            console.error('Error fetching categories:', err)
            setError(err.message || 'Failed to load equipment categories')
        } finally {
            setLoading(false)
            setIsRefreshing(false)
        }
    }

    // Initial load
    useEffect(() => {
        fetchStats()
        fetchCategories()
    }, [statusFilter])

    // Search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCategories()
        }, 300)
        return () => clearTimeout(timer)
    }, [searchTerm])

    const handleRefresh = async () => {
        setIsRefreshing(true)
        await Promise.all([fetchStats(), fetchCategories()])
    }

    const handleCategoryAdded = (newCat) => {
        showToast(`Category "${newCat.name}" created successfully!`)
        fetchStats()
        fetchCategories()
    }

    const handleCategoryUpdated = (updatedCat) => {
        showToast(`Category "${updatedCat.name}" updated successfully!`)
        fetchStats()
        fetchCategories()
    }

    const handleCategoryDeleted = (deletedId) => {
        showToast('Category deleted successfully!')
        fetchStats()
        fetchCategories()
    }

    return (
        <div className="min-h-screen w-full bg-gray-50 flex overflow-x-hidden">
            {/* Sidebar */}
            <Sidebar
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
                currentPath={location.pathname}
                stats={{
                    totalCategories: stats.totalCategories
                }}
            />

            {/* Main Content Area */}
            <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} flex flex-col min-w-0`}>
                <AppHeader
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    showUserMenu={showUserMenu}
                    setShowUserMenu={setShowUserMenu}
                    showNotifications={showNotifications}
                    setShowNotifications={setShowNotifications}
                />

                <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
                    {/* Toast Alert */}
                    {toastMessage && (
                        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                            <div className="bg-gray-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-semibold">
                                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                <span>{toastMessage.message}</span>
                            </div>
                        </div>
                    )}

                    {/* Page Header */}
                    <div className="bg-white rounded-2xl shadow-xs border border-gray-200/80 p-5 sm:p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2.5">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
                                            Equipment Category Master
                                        </h1>
                                        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                                            Manage equipment classification, taxonomy, themes, and dynamic categories
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2.5">
                                <button
                                    onClick={() => navigate('/equipment')}
                                    className="px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 shadow-2xs transition flex items-center gap-1.5"
                                    title="View Equipment Inventory"
                                >
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <span>Equipment Inventory</span>
                                </button>

                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span>Add New Category</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Summary Statistics Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* 1. Total Categories */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Categories</span>
                                <div className="text-2xl font-extrabold text-gray-900 mt-1">{stats.totalCategories}</div>
                                <span className="text-[11px] text-gray-500 mt-0.5 block">{stats.activeCategories} active, {stats.inactiveCategories} inactive</span>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                        </div>

                        {/* 2. Active Categories */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Active Status</span>
                                <div className="text-2xl font-extrabold text-emerald-600 mt-1">{stats.activeCategories}</div>
                                <span className="text-[11px] text-emerald-700 mt-0.5 block font-medium">Ready for equipment assignment</span>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>

                        {/* 3. Total Equipment Linked */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Equipment</span>
                                <div className="text-2xl font-extrabold text-indigo-600 mt-1">{stats.totalEquipment}</div>
                                <span className="text-[11px] text-indigo-700 mt-0.5 block font-medium">Categorized inventory items</span>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>

                        {/* 4. Top Category */}
                        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex items-center justify-between">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Most Utilized</span>
                                <div className="text-sm font-extrabold text-purple-700 mt-1 truncate max-w-[170px]" title={stats.topCategory}>
                                    {stats.topCategory}
                                </div>
                                <span className="text-[11px] text-gray-500 mt-0.5 block">Highest equipment density</span>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Filter and Search Bar */}
                    <div className="bg-white rounded-2xl shadow-xs border border-gray-200/80 p-4 sm:p-5">
                        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                            {/* Search */}
                            <div className="flex-1 relative min-w-0">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search categories by name, code slug, or description..."
                                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                />
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 text-xs"
                                    >
                                        ✕
                                    </button>
                                )}
                            </div>

                            {/* Status Filter */}
                            <div className="flex items-center gap-2.5">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-3.5 py-2.5 text-xs sm:text-sm border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white font-medium"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="active">Active Only</option>
                                    <option value="inactive">Inactive Only</option>
                                </select>

                                {/* Refresh Button */}
                                <button
                                    onClick={handleRefresh}
                                    disabled={isRefreshing}
                                    className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border font-semibold transition-all shadow-2xs ${
                                        isRefreshing
                                            ? 'bg-blue-50 text-blue-700 border-blue-200 cursor-wait'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                                    title="Refresh Categories"
                                >
                                    <svg
                                        className={`w-4 h-4 transition-transform ${isRefreshing ? 'animate-spin text-blue-600' : 'text-gray-500'}`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Categories Table Container */}
                    <div className="bg-white rounded-2xl shadow-xs border border-gray-200/80 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-200/80 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <h2 className="text-base font-bold text-gray-900">
                                    Categories ({categories.length})
                                </h2>
                                {(searchTerm || statusFilter !== 'all') && (
                                    <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                                        Filtered
                                    </span>
                                )}
                            </div>
                            <span className="text-xs text-gray-500">
                                Hover over action icons to view options
                            </span>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-semibold m-4 rounded-r-lg">
                                {error}
                            </div>
                        )}

                        {loading ? (
                            <div className="p-16 text-center">
                                <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                                <p className="text-sm font-semibold text-gray-500">Loading equipment categories...</p>
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="p-16 text-center">
                                <div className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-bold text-gray-900">No categories found</h3>
                                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                                    {searchTerm || statusFilter !== 'all'
                                        ? 'No categories match your search filters. Try clearing the search query.'
                                        : 'Get started by creating your first equipment category.'}
                                </p>
                                {searchTerm || statusFilter !== 'all' ? (
                                    <button
                                        onClick={() => {
                                            setSearchTerm('')
                                            setStatusFilter('all')
                                        }}
                                        className="mt-4 px-3.5 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                                    >
                                        Clear all filters
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="mt-4 px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition"
                                    >
                                        + Add New Category
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full divide-y divide-gray-200/80 text-left">
                                    <thead className="bg-gray-50/80 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                        <tr>
                                            <th scope="col" className="px-5 py-3.5">Category Name</th>
                                            <th scope="col" className="px-4 py-3.5">Code Slug</th>
                                            <th scope="col" className="px-4 py-3.5">Description</th>
                                            <th scope="col" className="px-4 py-3.5 text-center">Equipment Linked</th>
                                            <th scope="col" className="px-4 py-3.5 text-center">Status</th>
                                            <th scope="col" className="px-4 py-3.5">Created Date</th>
                                            <th scope="col" className="px-5 py-3.5 text-right pr-6">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white text-xs">
                                        {categories.map(cat => {
                                            const theme = getColorTheme(cat.color)
                                            return (
                                                <tr
                                                    key={cat.id}
                                                    className="hover:bg-blue-50/30 transition-colors group"
                                                >
                                                    {/* 1. Category Name & Icon */}
                                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                                        <div className="flex items-center space-x-3">
                                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center border shadow-2xs ${theme.badge}`}>
                                                                <CategoryIcon icon={cat.icon} className="w-5 h-5" />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <span
                                                                    onClick={() => setSelectedCategoryIdForView(cat.id)}
                                                                    className="font-bold text-gray-900 group-hover:text-blue-600 cursor-pointer transition block truncate max-w-[220px]"
                                                                >
                                                                    {cat.name}
                                                                </span>
                                                                <span className="text-[10px] text-gray-400 capitalize block">
                                                                    Theme: {theme.label}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* 2. Code Slug */}
                                                    <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px]">
                                                        <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md border border-gray-200 font-semibold shadow-2xs">
                                                            {cat.code}
                                                        </span>
                                                    </td>

                                                    {/* 3. Description */}
                                                    <td className="px-4 py-3.5 max-w-[240px]">
                                                        <p className="text-gray-600 truncate" title={cat.description || ''}>
                                                            {cat.description || <span className="text-gray-400 italic">—</span>}
                                                        </p>
                                                    </td>

                                                    {/* 4. Equipment Linked */}
                                                    <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                                        <button
                                                            onClick={() => setSelectedCategoryIdForView(cat.id)}
                                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition ${
                                                                cat.equipment_count > 0
                                                                    ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300'
                                                                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                                                            }`}
                                                            title="Click to view linked equipment preview"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                            </svg>
                                                            <span>{cat.equipment_count || 0} items</span>
                                                        </button>
                                                    </td>

                                                    {/* 5. Status */}
                                                    <td className="px-4 py-3.5 whitespace-nowrap text-center">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                                                            cat.is_active
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                : 'bg-gray-100 text-gray-500 border-gray-200'
                                                        }`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${cat.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                                                            {cat.is_active ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>

                                                    {/* 6. Created Date */}
                                                    <td className="px-4 py-3.5 whitespace-nowrap text-gray-600">
                                                        <div className="flex items-center gap-1.5">
                                                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            <span>{formatDate(cat.createdAt || cat.created_at)}</span>
                                                        </div>
                                                    </td>

                                                    {/* 7. Actions (Icon-only with hover tooltip) */}
                                                    <td className="px-5 py-3.5 whitespace-nowrap text-right pr-6">
                                                        <div className="inline-flex items-center justify-end gap-1.5">
                                                            {/* View Action */}
                                                            <div className="relative group/btn">
                                                                <button
                                                                    onClick={() => setSelectedCategoryIdForView(cat.id)}
                                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 bg-blue-50/80 hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 shadow-2xs transition-all duration-150"
                                                                    aria-label="View Category"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                    </svg>
                                                                </button>
                                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/btn:flex flex-col items-center pointer-events-none z-30">
                                                                    <span className="bg-gray-900 text-white text-[11px] font-medium px-2 py-0.5 rounded shadow-md whitespace-nowrap">
                                                                        View
                                                                    </span>
                                                                    <span className="w-1.5 h-1.5 bg-gray-900 rotate-45 -mt-0.5"></span>
                                                                </div>
                                                            </div>

                                                            {/* Edit Action */}
                                                            <div className="relative group/btn">
                                                                <button
                                                                    onClick={() => setSelectedCategoryForEdit(cat)}
                                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-amber-600 bg-amber-50/80 hover:bg-amber-600 hover:text-white border border-amber-200 hover:border-amber-600 shadow-2xs transition-all duration-150"
                                                                    aria-label="Edit Category"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                    </svg>
                                                                </button>
                                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/btn:flex flex-col items-center pointer-events-none z-30">
                                                                    <span className="bg-gray-900 text-white text-[11px] font-medium px-2 py-0.5 rounded shadow-md whitespace-nowrap">
                                                                        Edit
                                                                    </span>
                                                                    <span className="w-1.5 h-1.5 bg-gray-900 rotate-45 -mt-0.5"></span>
                                                                </div>
                                                            </div>

                                                            {/* Delete Action */}
                                                            <div className="relative group/btn">
                                                                <button
                                                                    onClick={() => setSelectedCategoryForDelete(cat)}
                                                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-red-600 bg-red-50/80 hover:bg-red-600 hover:text-white border border-red-200 hover:border-red-600 shadow-2xs transition-all duration-150"
                                                                    aria-label="Delete Category"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/btn:flex flex-col items-center pointer-events-none z-30">
                                                                    <span className="bg-gray-900 text-white text-[11px] font-medium px-2 py-0.5 rounded shadow-md whitespace-nowrap">
                                                                        Delete
                                                                    </span>
                                                                    <span className="w-1.5 h-1.5 bg-gray-900 rotate-45 -mt-0.5"></span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Modals */}
            <AddCategoryModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onCategoryAdded={handleCategoryAdded}
            />

            <EditCategoryModal
                isOpen={Boolean(selectedCategoryForEdit)}
                category={selectedCategoryForEdit}
                onClose={() => setSelectedCategoryForEdit(null)}
                onCategoryUpdated={handleCategoryUpdated}
            />

            <ViewCategoryModal
                isOpen={Boolean(selectedCategoryIdForView)}
                categoryId={selectedCategoryIdForView}
                onClose={() => setSelectedCategoryIdForView(null)}
                onEditCategory={(cat) => setSelectedCategoryForEdit(cat)}
            />

            <DeleteCategoryDialog
                isOpen={Boolean(selectedCategoryForDelete)}
                category={selectedCategoryForDelete}
                onClose={() => setSelectedCategoryForDelete(null)}
                onCategoryDeleted={handleCategoryDeleted}
            />
        </div>
    )
}
