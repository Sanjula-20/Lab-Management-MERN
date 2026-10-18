// LabManagement.jsx - Full Page Component with Sidebar and Header
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// API Configuration
const API_BASE_URL = '/api'

// Department Configuration & Helpers
const DEPARTMENT_CONFIG = {
    cse: { label: 'Computer Science & Engineering (CSE)', short: 'CSE', badge: 'bg-blue-100 text-blue-800 border-blue-200' },
    eee: { label: 'Electrical & Electronics Engineering (EEE)', short: 'EEE', badge: 'bg-amber-100 text-amber-800 border-amber-200' },
    ece: { label: 'Electronics & Communication Engineering (ECE)', short: 'ECE', badge: 'bg-purple-100 text-purple-800 border-purple-200' },
    mech: { label: 'Mechanical Engineering (MECH)', short: 'MECH', badge: 'bg-orange-100 text-orange-800 border-orange-200' },
    aids: { label: 'Artificial Intelligence & Data Science (AIDS)', short: 'AIDS', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    sh: { label: 'Science & Humanities (S&H)', short: 'S&H', badge: 'bg-teal-100 text-teal-800 border-teal-200' }
};

const DEPARTMENT_OPTIONS = [
    { value: 'cse', label: 'Computer Science & Engineering (CSE)' },
    { value: 'eee', label: 'Electrical & Electronics Engineering (EEE)' },
    { value: 'ece', label: 'Electronics & Communication Engineering (ECE)' },
    { value: 'mech', label: 'Mechanical Engineering (MECH)' },
    { value: 'aids', label: 'Artificial Intelligence & Data Science (AIDS)' },
    { value: 'sh', label: 'Science & Humanities (S&H)' }
];

const formatLabDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return String(dateStr);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
        return String(dateStr);
    }
};

// Add Lab Modal Component (kept within this file)
function AddLabModal({ isOpen, onClose, onLabAdded, staffList = [] }) {
    const [formData, setFormData] = useState({
        name: '',
        established_date: '',
        lab_type: 'cse',
        in_charge_id: '',
        lab_seats: 30, // Seating Capacity (required field)
        capacity: 30,
        square_feet: '',
        location: '',
        description: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (!formData.name.trim()) {
            setError('Lab name is required')
            setLoading(false)
            return
        }

        const seats = parseInt(formData.lab_seats)
        if (!seats || isNaN(seats) || seats < 1) {
            setError('Seating Capacity is a required field and must be at least 1')
            setLoading(false)
            return
        }

        try {
            const payload = {
                name: formData.name.trim(),
                established_date: formData.established_date || null,
                lab_type: formData.lab_type,
                in_charge_id: formData.in_charge_id ? parseInt(formData.in_charge_id) : null,
                lab_seats: seats,
                capacity: formData.capacity ? parseInt(formData.capacity) : seats,
                square_feet: formData.square_feet ? parseFloat(formData.square_feet) : null,
                location: formData.location.trim() || null,
                description: formData.description.trim() || null
            }
            const response = await fetch(`${API_BASE_URL}/labs`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            const result = await response.json()

            if (result.success) {
                setFormData({
                    name: '',
                    established_date: '',
                    lab_type: 'cse',
                    in_charge_id: '',
                    lab_seats: 30,
                    capacity: 30,
                    square_feet: '',
                    location: '',
                    description: ''
                })
                onLabAdded(result.data)
                onClose()
            } else {
                throw new Error(result.message || 'Failed to create lab')
            }
        } catch (error) {
            console.error('Error creating lab:', error)
            setError(error.message || 'Failed to create lab. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        setError('')
    }

    useEffect(() => {
        if (!isOpen) return
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === 'Esc') {
                onClose()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200 mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Add New Laboratory</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Register a new laboratory facility with complete details</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                        disabled={loading}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 1. Lab Name */}
                        <div className="md:col-span-2">
                            <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                                Lab Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="e.g., Advanced Computing Laboratory"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* 2. Department */}
                        <div>
                            <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                                Department <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="lab_type"
                                value={formData.lab_type}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                disabled={loading}
                                required
                            >
                                {DEPARTMENT_OPTIONS.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 3. Established Date */}
                        <div>
                            <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                                Established Date
                            </label>
                            <input
                                type="date"
                                name="established_date"
                                value={formData.established_date}
                                onChange={handleChange}
                                max={new Date().toISOString().split('T')[0]}
                                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                disabled={loading}
                            />
                        </div>

                        {/* 4. Lab In-Charge */}
                        <div className="md:col-span-2">
                            <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                                Lab In-Charge (Staff Member)
                            </label>
                            <select
                                name="in_charge_id"
                                value={formData.in_charge_id}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                disabled={loading}
                            >
                                <option value="">-- No In-Charge Assigned (Assign Later) --</option>
                                {staffList.map(staff => (
                                    <option key={staff.id} value={staff.id}>
                                        {staff.name} ({staff.role || 'Staff'} • {staff.department || 'General'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 5. Seating Capacity (REQUIRED) */}
                        <div>
                            <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                                Seating Capacity <span className="text-red-500 font-bold">* (Required)</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="lab_seats"
                                    value={formData.lab_seats}
                                    onChange={handleChange}
                                    min="1"
                                    max="500"
                                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="e.g., 30"
                                    required
                                    disabled={loading}
                                />
                                <span className="absolute right-3.5 top-2.5 text-xs text-gray-400 pointer-events-none">seats</span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-1">Number of work seats/terminals available for students.</p>
                        </div>

                        {/* Total Room Capacity */}
                        <div>
                            <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                                Total Room Capacity
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="capacity"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    min="1"
                                    max="500"
                                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="30"
                                    disabled={loading}
                                />
                                <span className="absolute right-3.5 top-2.5 text-xs text-gray-400 pointer-events-none">people</span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-1">Maximum physical room occupancy.</p>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                                Location
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="e.g., Building A, Floor 2, Room 201"
                                disabled={loading}
                            />
                        </div>

                        {/* Square Feet */}
                        <div>
                            <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                                Floor Area (Sq Ft)
                            </label>
                            <input
                                type="number"
                                name="square_feet"
                                value={formData.square_feet}
                                onChange={handleChange}
                                min="0"
                                step="0.1"
                                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="e.g., 1200"
                                disabled={loading}
                            />
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                rows="2"
                                placeholder="Brief description of the laboratory and equipment..."
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.name.trim()}
                            className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow transition flex items-center gap-1.5"
                        >
                            {loading ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                                    <span>Creating...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                    <span>Create Lab</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Edit Lab Modal Component
function EditLabModal({ isOpen, onClose, lab, onLabUpdated, staffList = [] }) {
    const [formData, setFormData] = useState({
        name: '',
        established_date: '',
        lab_type: 'cse',
        in_charge_id: '',
        lab_seats: 30, // Seating Capacity (required field)
        capacity: 30,
        square_feet: '',
        location: '',
        description: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (lab) {
            setFormData({
                name: lab.name || '',
                established_date: lab.established_date ? lab.established_date.split('T')[0] : '',
                lab_type: lab.lab_type || 'cse',
                in_charge_id: lab.in_charge_id ? String(lab.in_charge_id) : (lab.inCharge?.id ? String(lab.inCharge.id) : ''),
                lab_seats: lab.lab_seats !== null && lab.lab_seats !== undefined ? lab.lab_seats : (lab.capacity || 30),
                capacity: lab.capacity || 30,
                square_feet: lab.square_feet || '',
                location: lab.location || '',
                description: lab.description || ''
            })
            setError('')
        }
    }, [lab, isOpen])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        if (!formData.name.trim()) {
            setError('Lab name is required')
            setLoading(false)
            return
        }

        const seats = parseInt(formData.lab_seats)
        if (!seats || isNaN(seats) || seats < 1) {
            setError('Seating Capacity is a required field and must be at least 1')
            setLoading(false)
            return
        }

        try {
            const payload = {
                name: formData.name.trim(),
                established_date: formData.established_date || null,
                lab_type: formData.lab_type,
                in_charge_id: formData.in_charge_id ? parseInt(formData.in_charge_id) : null,
                lab_seats: seats,
                capacity: formData.capacity ? parseInt(formData.capacity) : seats,
                square_feet: formData.square_feet ? parseFloat(formData.square_feet) : null,
                location: formData.location.trim() || null,
                description: formData.description.trim() || null
            }
            const response = await fetch(`${API_BASE_URL}/labs/${lab.id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            const result = await response.json()

            if (result.success) {
                onLabUpdated(result.data)
                onClose()
            } else {
                throw new Error(result.message || 'Failed to update lab')
            }
        } catch (error) {
            console.error('Error updating lab:', error)
            setError(error.message || 'Failed to update lab. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
        setError('')
    }

    useEffect(() => {
        if (!isOpen) return
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === 'Esc') {
                onClose()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    if (!isOpen || !lab) return null

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200 mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Edit Laboratory</h2>
                        <p className="text-xs text-gray-500 mt-0.5">Modify laboratory specifications and configurations</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                        disabled={loading}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-center gap-2">
                        <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* 1. Lab Name */}
                        <div className="md:col-span-2">
                            <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                                Lab Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="Enter lab name"
                                required
                                disabled={loading}
                            />
                        </div>

                        {/* 2. Department */}
                        <div>
                            <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                                Department <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="lab_type"
                                value={formData.lab_type}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                disabled={loading}
                                required
                            >
                                {DEPARTMENT_OPTIONS.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 3. Established Date */}
                        <div>
                            <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                                Established Date
                            </label>
                            <input
                                type="date"
                                name="established_date"
                                value={formData.established_date}
                                onChange={handleChange}
                                max={new Date().toISOString().split('T')[0]}
                                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                disabled={loading}
                            />
                        </div>

                        {/* 4. Lab In-Charge */}
                        <div className="md:col-span-2">
                            <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                                Lab In-Charge (Staff Member)
                            </label>
                            <select
                                name="in_charge_id"
                                value={formData.in_charge_id}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                disabled={loading}
                            >
                                <option value="">-- Unassigned --</option>
                                {staffList.map(staff => (
                                    <option key={staff.id} value={staff.id}>
                                        {staff.name} ({staff.role || 'Staff'} • {staff.department || 'General'})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* 5. Seating Capacity (REQUIRED) */}
                        <div>
                            <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                                Seating Capacity <span className="text-red-500 font-bold">* (Required)</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="lab_seats"
                                    value={formData.lab_seats}
                                    onChange={handleChange}
                                    min="1"
                                    max="500"
                                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="e.g., 30"
                                    required
                                    disabled={loading}
                                />
                                <span className="absolute right-3.5 top-2.5 text-xs text-gray-400 pointer-events-none">seats</span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-1">Number of work seats/terminals available for students.</p>
                        </div>

                        {/* Total Room Capacity */}
                        <div>
                            <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                                Total Room Capacity
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="capacity"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    min="1"
                                    max="500"
                                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="30"
                                    disabled={loading}
                                />
                                <span className="absolute right-3.5 top-2.5 text-xs text-gray-400 pointer-events-none">people</span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-1">Maximum physical room occupancy.</p>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                                Location
                            </label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="e.g., Building A, Floor 2, Room 201"
                                disabled={loading}
                            />
                        </div>

                        {/* Square Feet */}
                        <div>
                            <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                                Floor Area (Sq Ft)
                            </label>
                            <input
                                type="number"
                                name="square_feet"
                                value={formData.square_feet}
                                onChange={handleChange}
                                min="0"
                                step="0.1"
                                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder="e.g., 1200"
                                disabled={loading}
                            />
                        </div>

                        {/* Description */}
                        <div className="md:col-span-2">
                            <label className="block text-gray-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                                Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                className="w-full px-3.5 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                rows="2"
                                placeholder="Brief description of the laboratory and equipment..."
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow transition flex items-center gap-1.5"
                        >
                            {loading ? (
                                <>
                                    <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path></svg>
                                    <span>Updating...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                    <span>Update Lab</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// Direct Assign / Manage Lab In-Charge Modal Component
function AssignInChargeModal({ isOpen, onClose, lab, staffList = [], onInChargeUpdated }) {
    const [selectedStaffId, setSelectedStaffId] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (lab) {
            setSelectedStaffId(lab.in_charge_id ? String(lab.in_charge_id) : (lab.inCharge?.id ? String(lab.inCharge.id) : ''))
            setError('')
        }
    }, [lab, isOpen])

    useEffect(() => {
        if (!isOpen) return
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === 'Esc') {
                onClose()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    if (!isOpen || !lab) return null

    const handleAssign = async (staffIdToAssign) => {
        setLoading(true)
        setError('')
        try {
            const response = await fetch(`${API_BASE_URL}/labs/${lab.id}/in-charge`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ in_charge_id: staffIdToAssign ? parseInt(staffIdToAssign) : null })
            })
            const result = await response.json()
            if (result.success) {
                onInChargeUpdated(result.data)
                onClose()
            } else {
                throw new Error(result.message || 'Failed to update lab in-charge')
            }
        } catch (err) {
            console.error('Error assigning in-charge:', err)
            setError(err.message || 'Failed to update lab in-charge')
        } finally {
            setLoading(false)
        }
    }

    const currentInCharge = lab.inCharge

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl border border-gray-100">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200 mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Manage Lab In-Charge</h2>
                        <p className="text-sm text-gray-500 mt-0.5">Lab: <span className="font-semibold text-gray-800">{lab.name}</span> ({lab.lab_type?.toUpperCase() || 'General'})</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={loading}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                        {error}
                    </div>
                )}

                {/* Currently Assigned Card */}
                <div className="mb-5">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Currently Assigned In-Charge
                    </label>
                    {currentInCharge ? (
                        <div className="flex items-center justify-between p-3.5 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow">
                                    {currentInCharge.name?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900">{currentInCharge.name}</div>
                                    <div className="text-xs text-blue-700 font-medium">
                                        {currentInCharge.role} • {currentInCharge.department || 'General'}
                                    </div>
                                    <div className="text-xs text-gray-500">{currentInCharge.email}</div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleAssign(null)}
                                disabled={loading}
                                className="px-2.5 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-md transition"
                                title="Remove as In-Charge"
                            >
                                Remove
                            </button>
                        </div>
                    ) : (
                        <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-500 flex items-center space-x-2">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>No staff member is currently assigned to this lab.</span>
                        </div>
                    )}
                </div>

                {/* Select New In-Charge */}
                <div className="mb-6">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Select Staff Member to Assign
                    </label>
                    <select
                        value={selectedStaffId}
                        onChange={(e) => setSelectedStaffId(e.target.value)}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                        disabled={loading}
                    >
                        <option value="">-- Choose a staff member to assign --</option>
                        {staffList.map((staff) => (
                            <option key={staff.id} value={staff.id}>
                                {staff.name} — {staff.role || 'Staff'} ({staff.department || 'General'})
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => handleAssign(selectedStaffId)}
                        disabled={loading || !selectedStaffId || selectedStaffId === String(lab.in_charge_id)}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed shadow transition"
                    >
                        {loading ? 'Saving...' : 'Save In-Charge'}
                    </button>
                </div>
            </div>
        </div>
    )
}

// View Lab Modal Component
function ViewLabModal({ isOpen, onClose, lab, onManageInCharge }) {
    useEffect(() => {
        if (!isOpen) return
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === 'Esc') {
                onClose()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    if (!isOpen || !lab) return null

    const deptInfo = DEPARTMENT_CONFIG[lab.lab_type] || {
        label: lab.lab_type?.toUpperCase() || 'General',
        short: lab.lab_type?.toUpperCase() || 'GENERAL',
        badge: 'bg-blue-100 text-blue-800 border-blue-200'
    }

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
                {/* Modal Header */}
                <div className="flex justify-between items-start pb-4 border-b border-gray-200 mb-5">
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-2xl font-bold text-gray-900">{lab.name}</h2>
                            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${deptInfo.badge}`}>
                                {deptInfo.short}
                            </span>
                            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                                Active
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            {deptInfo.label} • {lab.location || 'Campus Facility'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
                        title="Close (Esc)"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-5">
                    {/* Core Laboratory Details (Highlighted 5 Fields) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Seating Capacity Card (Required Field) */}
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow flex-shrink-0">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Seating Capacity (Required)</div>
                                <div className="text-xl font-extrabold text-emerald-950 mt-0.5">
                                    {lab.lab_seats || lab.seating_capacity || lab.capacity || 'Not specified'} Seats
                                </div>
                                <div className="text-[11px] text-emerald-700">Dedicated student workstations</div>
                            </div>
                        </div>

                        {/* Established Date Card */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3.5 shadow-sm">
                            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow flex-shrink-0">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-[11px] font-bold uppercase tracking-wider text-blue-800">Established Date</div>
                                <div className="text-lg font-bold text-blue-950 mt-0.5">
                                    {formatLabDate(lab.established_date)}
                                </div>
                                <div className="text-[11px] text-blue-700">Official foundation date</div>
                            </div>
                        </div>
                    </div>

                    {/* Department and Location Overview */}
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Specification Details</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-500 text-xs font-medium mb-0.5">Lab Name</label>
                                <div className="text-gray-900 font-semibold text-sm">{lab.name}</div>
                            </div>
                            <div>
                                <label className="block text-gray-500 text-xs font-medium mb-0.5">Department</label>
                                <div className="text-gray-900 font-semibold text-sm flex items-center gap-2">
                                    <span>{deptInfo.label}</span>
                                    <span className={`px-2 py-0.5 text-xs font-bold rounded ${deptInfo.badge}`}>
                                        {deptInfo.short}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-gray-500 text-xs font-medium mb-0.5">Location</label>
                                <div className="text-gray-900 text-sm font-medium">{lab.location || 'Not specified'}</div>
                            </div>
                            <div>
                                <label className="block text-gray-500 text-xs font-medium mb-0.5">Total Room Capacity</label>
                                <div className="text-gray-900 text-sm font-medium">{lab.capacity ? `${lab.capacity} people` : 'Not specified'}</div>
                            </div>
                            {lab.square_feet && (
                                <div>
                                    <label className="block text-gray-500 text-xs font-medium mb-0.5">Floor Area</label>
                                    <div className="text-gray-900 text-sm font-medium">{lab.square_feet} sq ft</div>
                                </div>
                            )}
                            <div>
                                <label className="block text-gray-500 text-xs font-medium mb-0.5">Record Created</label>
                                <div className="text-gray-900 text-sm font-medium">
                                    {lab.created_at ? new Date(lab.created_at).toLocaleDateString() : 'Unknown'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lab In-Charge Card */}
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                        <div className="flex justify-between items-center mb-3">
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Lab In-Charge</h3>
                                <p className="text-[11px] text-gray-400">Assigned faculty or staff member managing this lab</p>
                            </div>
                            {onManageInCharge && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        onManageInCharge(lab);
                                    }}
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-white hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition shadow-sm"
                                >
                                    {lab.inCharge ? 'Change In-Charge' : '+ Assign Staff'}
                                </button>
                            )}
                        </div>
                        {lab.inCharge ? (
                            <div className="flex items-center space-x-3.5 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                                <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow text-white font-bold text-lg flex-shrink-0">
                                    {lab.inCharge.name?.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-gray-900 font-bold text-base truncate">{lab.inCharge.name}</span>
                                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                            {lab.inCharge.role || 'Staff'}
                                        </span>
                                    </div>
                                    <div className="text-gray-600 text-xs mt-0.5">
                                        Department: <span className="font-semibold text-gray-800">{lab.inCharge.department || 'General'}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1.5 flex-wrap">
                                        {lab.inCharge.email && (
                                            <a href={`mailto:${lab.inCharge.email}`} className="text-blue-600 hover:underline flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                                                {lab.inCharge.email}
                                            </a>
                                        )}
                                        {lab.inCharge.phone && (
                                            <a href={`tel:${lab.inCharge.phone}`} className="text-gray-600 hover:underline flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                                                {lab.inCharge.phone}
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 bg-white border border-gray-200 border-dashed rounded-xl text-sm text-gray-500 flex items-center justify-between">
                                <span className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.982 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                    No staff member is currently assigned as in-charge of this lab.
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    {lab.description && (
                        <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Description</h3>
                            <p className="text-gray-800 text-sm whitespace-pre-wrap">{lab.description}</p>
                        </div>
                    )}

                    {/* Lab Creator */}
                    {lab.labCreator && (
                        <div className="bg-gray-50 border border-gray-200 p-3.5 rounded-xl flex items-center justify-between text-xs text-gray-500">
                            <span>Created by <strong className="text-gray-800">{lab.labCreator.name || lab.labCreator.email}</strong></span>
                            <span>{lab.created_at ? new Date(lab.created_at).toLocaleDateString() : ''}</span>
                        </div>
                    )}
                </div>

                <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-gray-800 hover:bg-gray-900 text-white font-medium text-sm rounded-lg transition shadow"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

// Main Lab Management Component
export default function LabManagement() {
    const [labs, setLabs] = useState([])
    const [staffList, setStaffList] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [isAssignInChargeModalOpen, setIsAssignInChargeModalOpen] = useState(false)
    const [selectedLab, setSelectedLab] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState('all')
    const [inChargeFilter, setInChargeFilter] = useState('all')
    const [isRefreshing, setIsRefreshing] = useState(false)

    // Sidebar and UI state
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    const { user, isAuthenticated, logout, loading: authLoading } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    // Refs
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
            show: true
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
            show: true
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
            show: true
        },
        {
            id: 'equipment-categories',
            title: 'Category Master',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
            ),
            path: '/equipment-categories',
            show: true
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
            show: true
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
            show: true
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
            show: true
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
            show: true
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
            show: user?.role === 'admin'
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
            show: user?.role === 'admin'
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
            show: user?.role === 'admin'
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
            show: user?.role === 'admin' || user?.role === 'lab_technician'
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

    // Escape key handler to go back to previous state
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' || event.key === 'Esc') {
                if (isAssignInChargeModalOpen) {
                    setIsAssignInChargeModalOpen(false)
                    setSelectedLab(null)
                } else if (isViewModalOpen) {
                    setIsViewModalOpen(false)
                    setSelectedLab(null)
                } else if (isEditModalOpen) {
                    setIsEditModalOpen(false)
                    setSelectedLab(null)
                } else if (isAddModalOpen) {
                    setIsAddModalOpen(false)
                } else if (showUserMenu) {
                    setShowUserMenu(false)
                } else if (showNotifications) {
                    setShowNotifications(false)
                } else if (searchTerm) {
                    setSearchTerm('')
                } else if (filterType !== 'all') {
                    setFilterType('all')
                } else if (inChargeFilter !== 'all') {
                    setInChargeFilter('all')
                } else {
                    // Return to previous page in browser history
                    navigate(-1)
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isAssignInChargeModalOpen, isViewModalOpen, isEditModalOpen, isAddModalOpen, showUserMenu, showNotifications, searchTerm, filterType, inChargeFilter, navigate])

    // Fetch labs from backend
    const fetchLabs = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/labs`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const result = await response.json()

            if (result.success) {
                setLabs(result.data.labs || [])
                setError('')
            } else {
                throw new Error(result.message || 'Failed to fetch labs')
            }
        } catch (error) {
            console.error('Error fetching labs:', error)
            setError(`Failed to load labs: ${error.message}`)
        }
    }

    // Fetch eligible staff members for lab in-charge
    const fetchStaff = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/labs/staff`, {
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const result = await response.json()

            if (result.success) {
                setStaffList(result.data || [])
            }
        } catch (error) {
            console.error('Error fetching staff list:', error)
        }
    }

    // Refresh labs and staff with visible loading state
    const handleRefresh = async () => {
        setIsRefreshing(true)
        try {
            await Promise.all([fetchLabs(), fetchStaff()])
        } finally {
            // Keep spinning for at least 600ms so user has clear visual confirmation
            setTimeout(() => setIsRefreshing(false), 600)
        }
    }

    // Delete lab
    const handleDeleteLab = async (labId) => {
        if (!confirm('Are you sure you want to delete this lab?')) {
            return
        }

        try {
            const response = await fetch(`${API_BASE_URL}/labs/${labId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const result = await response.json()

            if (result.success) {
                setLabs(labs.filter(lab => lab.id !== labId))
            } else {
                throw new Error(result.message || 'Failed to delete lab')
            }
        } catch (error) {
            console.error('Error deleting lab:', error)
            alert(`Failed to delete lab: ${error.message}`)
        }
    }

    // Handle lab added
    const handleLabAdded = (newLab) => {
        setLabs(prev => [newLab, ...prev])
    }

    // Handle lab updated
    const handleLabUpdated = (updatedLab) => {
        setLabs(prev => prev.map(lab =>
            lab.id === updatedLab.id ? updatedLab : lab
        ))
    }

    // Handle direct in-charge update
    const handleInChargeUpdated = (updatedLab) => {
        setLabs(prev => prev.map(lab =>
            lab.id === updatedLab.id ? updatedLab : lab
        ))
        if (selectedLab && selectedLab.id === updatedLab.id) {
            setSelectedLab(updatedLab)
        }
    }

    // Handle edit lab
    const handleEditLab = (lab) => {
        setSelectedLab(lab)
        setIsEditModalOpen(true)
    }

    // Handle view lab
    const handleViewLab = (lab) => {
        setSelectedLab(lab)
        setIsViewModalOpen(true)
    }

    // Handle manage in-charge modal open
    const handleManageInCharge = (lab) => {
        setSelectedLab(lab)
        setIsAssignInChargeModalOpen(true)
    }

    // Navigation functions
    const handleNavigation = (path) => {
        navigate(path)
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

    // Filter labs based on search, department, and in-charge status
    const filteredLabs = labs.filter(lab => {
        const matchesSearch = 
            lab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lab.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lab.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lab.inCharge?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lab.inCharge?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (DEPARTMENT_CONFIG[lab.lab_type]?.label?.toLowerCase()?.includes(searchTerm.toLowerCase())) ||
            (DEPARTMENT_CONFIG[lab.lab_type]?.short?.toLowerCase()?.includes(searchTerm.toLowerCase())) ||
            (lab.established_date && String(lab.established_date).includes(searchTerm)) ||
            (lab.lab_seats && String(lab.lab_seats).includes(searchTerm))

        const matchesType = filterType === 'all' || lab.lab_type === filterType

        const matchesInCharge = 
            inChargeFilter === 'all' ||
            (inChargeFilter === 'assigned' && Boolean(lab.in_charge_id || lab.inCharge)) ||
            (inChargeFilter === 'unassigned' && !lab.in_charge_id && !lab.inCharge)

        return matchesSearch && matchesType && matchesInCharge
    })

    // Load data on component mount
    useEffect(() => {
        // Set document title
        document.title = 'Lab Management | NEC LabMS'
        
        const loadData = async () => {
            if (!isAuthenticated) return // Don't fetch if not authenticated
            setLoading(true)
            await Promise.all([fetchLabs(), fetchStaff()])
            setLoading(false)
        }
        loadData()
    }, [isAuthenticated]) // Add isAuthenticated as dependency

    // Show loading while auth is initializing
    if (authLoading) {
        return (
            <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
                    </div>
                    <p className="text-gray-600 mt-4 font-medium">Initializing...</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200"></div>
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
                    </div>
                    <p className="text-gray-600 mt-4 font-medium">Loading labs...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen w-full bg-gray-50 flex overflow-x-hidden">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 ${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white shadow-lg border-r border-gray-200 transition-all duration-300`}>
                {/* Sidebar Header */}
                <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
                    {!sidebarCollapsed && (
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-white rounded-lg overflow-hidden p-1">
                                <img 
                                    src="/nec-logo.png" 
                                    alt="NEC Logo" 
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <h1 className="text-xl font-bold text-white">
                                NEC LabMS
                            </h1>
                        </div>
                    )}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors text-white"
                    >
                        <svg className={`w-5 h-5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path>
                        </svg>
                    </button>
                </div>

                {/* Navigation Items */}
                <nav className="mt-6 px-3">
                    <div className="space-y-1">
                        {navigationItems.filter(item => item.show).map((item) => {
                            const isActive = location.pathname === item.path || (item.path === '/lab-management' && location.pathname === '/lab_management')
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleNavigation(item.path)}
                                    className={`w-full flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                                            ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    title={sidebarCollapsed ? item.title : ''}
                                >
                                    <div className="flex items-center justify-center w-5 h-5">
                                        {item.icon}
                                    </div>
                                    {!sidebarCollapsed && (
                                        <span className="ml-3 flex-1 text-left">{item.title}</span>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </nav>

                {/* Sidebar Footer */}
                {!sidebarCollapsed && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                    {(user?.name || user?.email)?.charAt(0)?.toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {user?.name || user?.email}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">
                                    {user?.role}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className={`flex-1 min-w-0 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} transition-all duration-300 overflow-x-hidden`}>
                {/* Top Header */}
                <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            {/* Search Bar */}
                            <form onSubmit={handleSearch} className="flex-1 max-w-lg">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search anything..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                                    />
                                    <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                    </svg>
                                </div>
                            </form>

                            {/* Header Right Section */}
                            <div className="flex items-center space-x-4">
                                {/* Notifications */}
                                <div className="relative" ref={notificationRef}>
                                    <button
                                        onClick={() => setShowNotifications(!showNotifications)}
                                        className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
                                        title="Notifications"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
                                        </svg>
                                    </button>
                                </div>

                                {/* User Menu */}
                                <div className="relative" ref={userMenuRef}>
                                    <button
                                        onClick={() => setShowUserMenu(!showUserMenu)}
                                        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                            <span className="text-white font-medium text-sm">
                                                {(user?.name || user?.email)?.charAt(0)?.toUpperCase()}
                                            </span>
                                        </div>
                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                                        </svg>
                                    </button>

                                    {/* User Dropdown */}
                                    {showUserMenu && (
                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                                            <div className="px-4 py-2 border-b border-gray-100">
                                                <p className="text-sm font-medium text-gray-900">{user?.name || user?.email}</p>
                                                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                                            </div>
                                            <button
                                                onClick={() => handleNavigation('/profile')}
                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                                </svg>
                                                <span>Profile</span>
                                            </button>
                                            <div className="border-t border-gray-100 my-1"></div>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                                                </svg>
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="p-4 sm:p-6 min-w-0 max-w-full">
                    {/* Page Header */}
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Lab Management</h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    Manage and monitor all laboratory spaces and their configurations.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                                    </svg>
                                    <span>{error}</span>
                                </div>
                                <button
                                    onClick={fetchLabs}
                                    className="ml-4 px-3 py-1 bg-red-200 text-red-800 rounded text-sm hover:bg-red-300"
                                >
                                    Retry
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Search and Filter Bar */}
                    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-5 mb-6">
                        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                            <div className="flex-1 min-w-0">
                                <input
                                    type="text"
                                    placeholder="Search labs by name, location, or description..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex flex-wrap sm:flex-nowrap gap-2.5">
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="all">All Departments</option>
                                    {DEPARTMENT_OPTIONS.map(d => (
                                        <option key={d.value} value={d.value}>{d.label}</option>
                                    ))}
                                </select>
                                <select
                                    value={inChargeFilter}
                                    onChange={(e) => setInChargeFilter(e.target.value)}
                                    className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                >
                                    <option value="all">All In-Charges</option>
                                    <option value="assigned">Assigned Staff</option>
                                    <option value="unassigned">Unassigned</option>
                                </select>
                                {user?.role === 'admin' && (
                                    <button
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors whitespace-nowrap flex-shrink-0"
                                    >
                                        <span className="flex items-center">
                                            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                            </svg>
                                            Add New Lab
                                        </span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Labs Grid or Table */}
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                                    Labs ({filteredLabs.length})
                                </h2>
                                <button
                                    onClick={handleRefresh}
                                    disabled={isRefreshing}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm rounded-md border font-medium transition-all shadow-sm ${
                                        isRefreshing
                                            ? 'bg-blue-50 text-blue-700 border-blue-200 cursor-wait'
                                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100'
                                    }`}
                                    title="Refresh Labs Data"
                                >
                                    <svg
                                        className={`w-3.5 h-3.5 transition-transform ${isRefreshing ? 'animate-spin text-blue-600' : 'text-gray-500'}`}
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

                        <div className="p-0 sm:p-2">
                            {filteredLabs.length === 0 ? (
                                <div className="text-center py-12 p-6">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                    </svg>
                                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                                        {searchTerm || filterType !== 'all' || inChargeFilter !== 'all' ? 'No labs found matching your criteria' : 'No labs found'}
                                    </h3>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {user?.role === 'admin' ? 'Get started by creating a new lab.' : 'No labs available to view.'}
                                    </p>
                                    {user?.role === 'admin' && !searchTerm && filterType === 'all' && inChargeFilter === 'all' && (
                                        <div className="mt-6">
                                            <button
                                                onClick={() => setIsAddModalOpen(true)}
                                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                            >
                                                Add Your First Lab
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full divide-y divide-gray-200 text-left">
                                        <thead className="bg-gray-50/90 text-[11px] font-bold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                                            <tr>
                                                <th className="px-5 py-3.5 text-left">Laboratory Details</th>
                                                <th className="px-4 py-3.5 text-left">Department</th>
                                                <th className="px-4 py-3.5 text-left whitespace-nowrap">Established</th>
                                                <th className="px-4 py-3.5 text-left whitespace-nowrap">Seating Capacity</th>
                                                <th className="px-4 py-3.5 text-left">Lab In-Charge</th>
                                                <th className="px-5 py-3.5 text-right pr-5">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-100 text-sm">
                                            {filteredLabs.map((lab) => {
                                                const deptInfo = DEPARTMENT_CONFIG[lab.lab_type] || {
                                                    label: lab.lab_type?.toUpperCase() || 'General',
                                                    short: lab.lab_type?.toUpperCase() || 'GEN',
                                                    badge: 'bg-blue-100 text-blue-800 border-blue-200'
                                                };
                                                const seatsCount = lab.lab_seats ?? lab.seating_capacity ?? lab.capacity ?? 0;

                                                return (
                                                    <tr key={lab.id} className="hover:bg-blue-50/30 transition-colors">
                                                        {/* 1. Laboratory Details (Name + Location) */}
                                                        <td className="px-5 py-4 align-middle">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 shadow-2xs">
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                                                    </svg>
                                                                </div>
                                                                <div className="min-w-0 max-w-[260px]">
                                                                    <div className="text-sm font-bold text-gray-900 truncate" title={lab.name}>
                                                                        {lab.name}
                                                                    </div>
                                                                    <div className="flex items-center text-xs text-gray-500 mt-0.5 gap-1" title={lab.location || 'Location not specified'}>
                                                                        <svg className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                        </svg>
                                                                        <span className="truncate">{lab.location?.trim() || 'Location not specified'}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* 2. Department */}
                                                        <td className="px-4 py-4 whitespace-nowrap align-middle">
                                                            <span
                                                                className={`inline-flex items-center px-2.5 py-1 text-xs font-bold rounded-lg border shadow-2xs ${deptInfo.badge}`}
                                                                title={deptInfo.label}
                                                            >
                                                                {deptInfo.short}
                                                            </span>
                                                        </td>

                                                        {/* 3. Established Date */}
                                                        <td className="px-4 py-4 whitespace-nowrap align-middle">
                                                            {lab.established_date ? (
                                                                <div className="flex items-center text-xs font-semibold text-gray-700 gap-1.5" title={`Established: ${formatLabDate(lab.established_date)}`}>
                                                                    <svg className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                    </svg>
                                                                    <span>{formatLabDate(lab.established_date)}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-gray-400 font-medium">—</span>
                                                            )}
                                                        </td>

                                                        {/* 4. Seating Capacity (Required) */}
                                                        <td className="px-4 py-4 whitespace-nowrap align-middle">
                                                            <span
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs"
                                                                title="Required Field: Student Workstation Capacity"
                                                            >
                                                                <svg className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                </svg>
                                                                <span>{seatsCount} Seats</span>
                                                            </span>
                                                        </td>

                                                        {/* 5. Lab In-Charge */}
                                                        <td className="px-4 py-4 whitespace-nowrap align-middle">
                                                            {lab.inCharge ? (
                                                                <div 
                                                                    onClick={user?.role === 'admin' ? () => handleManageInCharge(lab) : undefined}
                                                                    className={`flex items-center space-x-2.5 ${user?.role === 'admin' ? 'cursor-pointer group' : ''}`}
                                                                    title={user?.role === 'admin' ? 'Click to change In-Charge' : ''}
                                                                >
                                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs flex-shrink-0 group-hover:ring-2 group-hover:ring-blue-400 transition">
                                                                        {lab.inCharge.name?.charAt(0).toUpperCase()}
                                                                    </div>
                                                                    <div className="min-w-0 max-w-[150px]">
                                                                        <div className="text-xs font-bold text-gray-900 truncate group-hover:text-blue-600 transition flex items-center gap-1">
                                                                            <span className="truncate">{lab.inCharge.name}</span>
                                                                            {user?.role === 'admin' && (
                                                                                <svg className="w-3 h-3 text-gray-400 group-hover:text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                                </svg>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                                                                            <span className="font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 uppercase">
                                                                                {lab.inCharge.department || 'General'}
                                                                            </span>
                                                                            <span className="capitalize text-gray-500 truncate">
                                                                                {lab.inCharge.role || 'Staff'}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div 
                                                                    onClick={user?.role === 'admin' ? () => handleManageInCharge(lab) : undefined}
                                                                    className={`flex items-center space-x-2.5 ${user?.role === 'admin' ? 'cursor-pointer group' : ''}`}
                                                                    title={user?.role === 'admin' ? 'Click to assign In-Charge' : ''}
                                                                >
                                                                    <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400 flex items-center justify-center flex-shrink-0 group-hover:border-blue-400 group-hover:text-blue-500 transition">
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                        </svg>
                                                                    </div>
                                                                    <div className="min-w-0 max-w-[150px]">
                                                                        <div className="text-xs font-medium text-gray-400 italic group-hover:text-gray-600">
                                                                            Unassigned
                                                                        </div>
                                                                        <div className="text-[11px] font-semibold text-blue-600 group-hover:text-blue-800 group-hover:underline">
                                                                            {user?.role === 'admin' ? '+ Assign Staff' : 'None'}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </td>

                                                        {/* 6. Actions (Icons only with hover tooltip) */}
                                                        <td className="px-5 py-4 whitespace-nowrap text-right pr-5 align-middle">
                                                            <div className="inline-flex items-center justify-end gap-1.5">
                                                                {/* View Action */}
                                                                <div className="relative group/btn">
                                                                    <button
                                                                        onClick={() => handleViewLab(lab)}
                                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-blue-600 bg-blue-50/80 hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 shadow-2xs transition-all duration-150"
                                                                        title="View"
                                                                        aria-label="View Lab"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                        </svg>
                                                                    </button>
                                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/btn:flex flex-col items-center pointer-events-none z-30">
                                                                        <span className="px-2 py-0.5 text-[11px] font-semibold text-white bg-gray-900 rounded shadow-md whitespace-nowrap">
                                                                            View
                                                                        </span>
                                                                        <div className="w-1.5 h-1.5 -mt-0.5 rotate-45 bg-gray-900"></div>
                                                                    </div>
                                                                </div>

                                                                {user?.role === 'admin' && (
                                                                    <>
                                                                        {/* In-Charge Action */}
                                                                        <div className="relative group/btn">
                                                                            <button
                                                                                onClick={() => handleManageInCharge(lab)}
                                                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-purple-600 bg-purple-50/80 hover:bg-purple-600 hover:text-white border border-purple-200 hover:border-purple-600 shadow-2xs transition-all duration-150"
                                                                                title="In-Charge"
                                                                                aria-label="Manage In-Charge"
                                                                            >
                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                                                </svg>
                                                                            </button>
                                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/btn:flex flex-col items-center pointer-events-none z-30">
                                                                                <span className="px-2 py-0.5 text-[11px] font-semibold text-white bg-gray-900 rounded shadow-md whitespace-nowrap">
                                                                                    In-Charge
                                                                                </span>
                                                                                <div className="w-1.5 h-1.5 -mt-0.5 rotate-45 bg-gray-900"></div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Edit Action */}
                                                                        <div className="relative group/btn">
                                                                            <button
                                                                                onClick={() => handleEditLab(lab)}
                                                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-indigo-600 bg-indigo-50/80 hover:bg-indigo-600 hover:text-white border border-indigo-200 hover:border-indigo-600 shadow-2xs transition-all duration-150"
                                                                                title="Edit"
                                                                                aria-label="Edit Lab"
                                                                            >
                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                                </svg>
                                                                            </button>
                                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/btn:flex flex-col items-center pointer-events-none z-30">
                                                                                <span className="px-2 py-0.5 text-[11px] font-semibold text-white bg-gray-900 rounded shadow-md whitespace-nowrap">
                                                                                    Edit
                                                                                </span>
                                                                                <div className="w-1.5 h-1.5 -mt-0.5 rotate-45 bg-gray-900"></div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Delete Action */}
                                                                        <div className="relative group/btn">
                                                                            <button
                                                                                onClick={() => handleDeleteLab(lab.id)}
                                                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-red-600 bg-red-50/80 hover:bg-red-600 hover:text-white border border-red-200 hover:border-red-600 shadow-2xs transition-all duration-150"
                                                                                title="Delete"
                                                                                aria-label="Delete Lab"
                                                                            >
                                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                </svg>
                                                                            </button>
                                                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover/btn:flex flex-col items-center pointer-events-none z-30">
                                                                                <span className="px-2 py-0.5 text-[11px] font-semibold text-white bg-gray-900 rounded shadow-md whitespace-nowrap">
                                                                                    Delete
                                                                                </span>
                                                                                <div className="w-1.5 h-1.5 -mt-0.5 rotate-45 bg-gray-900"></div>
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            {/* Modals */}
            {user?.role === 'admin' && (
                <>
                    <AddLabModal
                        isOpen={isAddModalOpen}
                        onClose={() => setIsAddModalOpen(false)}
                        onLabAdded={handleLabAdded}
                        staffList={staffList}
                    />
                    <EditLabModal
                        isOpen={isEditModalOpen}
                        onClose={() => {
                            setIsEditModalOpen(false)
                            setSelectedLab(null)
                        }}
                        lab={selectedLab}
                        onLabUpdated={handleLabUpdated}
                        staffList={staffList}
                    />
                    <AssignInChargeModal
                        isOpen={isAssignInChargeModalOpen}
                        onClose={() => {
                            setIsAssignInChargeModalOpen(false)
                            setSelectedLab(null)
                        }}
                        lab={selectedLab}
                        staffList={staffList}
                        onInChargeUpdated={handleInChargeUpdated}
                    />
                </>
            )}

            {/* View Lab Modal - Available to all users */}
            <ViewLabModal
                isOpen={isViewModalOpen}
                onClose={() => {
                    setIsViewModalOpen(false)
                    setSelectedLab(null)
                }}
                lab={selectedLab}
                onManageInCharge={user?.role === 'admin' ? handleManageInCharge : null}
            />
        </div>
    )
}
