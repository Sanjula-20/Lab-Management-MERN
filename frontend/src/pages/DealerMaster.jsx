// src/pages/DealerMaster.jsx - Dealer Master (Full CRUD Management)
import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Sidebar, AppHeader } from '../components/common/Navigation'
import SmartSearchBar from '../components/common/SmartSearchBar'
import Pagination from '../components/common/Pagination'

const API_BASE_URL = '/api'

// Helper to format date
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
// ADD DEALER MODAL
// -------------------------------------------------------------
function AddDealerModal({ isOpen, onClose, onDealerAdded }) {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        contact_person: '',
        phone: '',
        email: '',
        gst_number: '',
        notes: '',
        is_active: true
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // ESC key support
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && !loading) {
                onClose()
            }
        }
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown)
        }
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, loading, onClose])

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: '',
                address: '',
                city: '',
                state: '',
                postal_code: '',
                contact_person: '',
                phone: '',
                email: '',
                gst_number: '',
                notes: '',
                is_active: true
            })
            setError('')
        }
    }, [isOpen])

    if (!isOpen) return null

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            setError('Dealer / Company Name is required')
            return
        }

        if (!formData.address.trim()) {
            setError('Dealer Address is required')
            return
        }

        try {
            setLoading(true)
            setError('')

            const response = await fetch(`${API_BASE_URL}/dealers`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const result = await response.json()

            if (result.success) {
                onDealerAdded(result.data)
                onClose()
            } else {
                setError(result.message || 'Failed to create dealer')
            }
        } catch (err) {
            console.error('Error creating dealer:', err)
            setError('Network error. Failed to create dealer.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 text-white flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Add New Dealer</h2>
                            <p className="text-xs text-blue-100">Create a vendor profile for equipment procurement (Press ESC to close)</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                        disabled={loading}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded flex items-center">
                            <svg className="w-5 h-5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Dealer Name */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-800 mb-1">
                                Company / Dealer Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., Dell Direct India Pvt Ltd"
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>

                        {/* Dealer Address */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-800 mb-1">
                                Dealer Address <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                placeholder="Enter street address, building, landmark, area"
                                rows="2"
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
                            />
                        </div>

                        {/* City */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                City
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                placeholder="e.g., Bengaluru, Mumbai"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>

                        {/* State */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                State
                            </label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                placeholder="e.g., Karnataka, Maharashtra"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>

                        {/* Postal Code */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Postal / PIN Code
                            </label>
                            <input
                                type="text"
                                name="postal_code"
                                value={formData.postal_code}
                                onChange={handleChange}
                                placeholder="e.g., 560001"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>

                        {/* GST Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                GST / Tax ID (15 chars)
                            </label>
                            <input
                                type="text"
                                name="gst_number"
                                value={formData.gst_number}
                                onChange={handleChange}
                                placeholder="e.g., 29AAAAA0000A1Z5"
                                maxLength="15"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>

                        {/* Contact Person */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contact Person
                            </label>
                            <input
                                type="text"
                                name="contact_person"
                                value={formData.contact_person}
                                onChange={handleChange}
                                placeholder="e.g., Ramesh Sharma"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="e.g., +91 98765 43210"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>

                        {/* Email */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="e.g., sales@vendor.com"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>

                        {/* Notes */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes & Procurement Details
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                placeholder="Terms, warranty agreements, authorized brand dealerships..."
                                rows="2"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
                            />
                        </div>

                        {/* Active Status */}
                        <div className="md:col-span-2 pt-2">
                            <label className="inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none ring-2 ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                <span className="ml-3 text-sm font-medium text-gray-800">
                                    {formData.is_active ? 'Active Dealer (Available for equipment assignment)' : 'Inactive Dealer'}
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.name.trim() || !formData.address.trim()}
                            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <span>Save Dealer</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// -------------------------------------------------------------
// EDIT DEALER MODAL
// -------------------------------------------------------------
function EditDealerModal({ isOpen, onClose, dealer, onDealerUpdated }) {
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        contact_person: '',
        phone: '',
        email: '',
        gst_number: '',
        notes: '',
        is_active: true
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // ESC key support
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && !loading) {
                onClose()
            }
        }
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown)
        }
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, loading, onClose])

    useEffect(() => {
        if (dealer) {
            setFormData({
                name: dealer.name || '',
                address: dealer.address || '',
                city: dealer.city || '',
                state: dealer.state || '',
                postal_code: dealer.postal_code || '',
                contact_person: dealer.contact_person || '',
                phone: dealer.phone || '',
                email: dealer.email || '',
                gst_number: dealer.gst_number || '',
                notes: dealer.notes || '',
                is_active: dealer.is_active !== undefined ? Boolean(dealer.is_active) : true
            })
            setError('')
        }
    }, [dealer])

    if (!isOpen || !dealer) return null

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.name.trim()) {
            setError('Dealer / Company Name is required')
            return
        }

        if (!formData.address.trim()) {
            setError('Dealer Address is required')
            return
        }

        try {
            setLoading(true)
            setError('')

            const response = await fetch(`${API_BASE_URL}/dealers/${dealer.id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const result = await response.json()

            if (result.success) {
                onDealerUpdated(result.data)
                onClose()
            } else {
                setError(result.message || 'Failed to update dealer')
            }
        } catch (err) {
            console.error('Error updating dealer:', err)
            setError('Network error. Failed to update dealer.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-5 text-white flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">Edit Dealer</h2>
                            <p className="text-xs text-indigo-100">Update vendor details and contact information (Press ESC to close)</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                        disabled={loading}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded flex items-center">
                            <svg className="w-5 h-5 mr-2 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Dealer Name */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-800 mb-1">
                                Company / Dealer Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>

                        {/* Dealer Address */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-800 mb-1">
                                Dealer Address <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows="2"
                                required
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
                            />
                        </div>

                        {/* City */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                City
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>

                        {/* State */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                State
                            </label>
                            <input
                                type="text"
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>

                        {/* Postal Code */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Postal / PIN Code
                            </label>
                            <input
                                type="text"
                                name="postal_code"
                                value={formData.postal_code}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>

                        {/* GST Number */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                GST / Tax ID (15 chars)
                            </label>
                            <input
                                type="text"
                                name="gst_number"
                                value={formData.gst_number}
                                onChange={handleChange}
                                maxLength="15"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>

                        {/* Contact Person */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contact Person
                            </label>
                            <input
                                type="text"
                                name="contact_person"
                                value={formData.contact_person}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phone Number
                            </label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>

                        {/* Email */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                            />
                        </div>

                        {/* Notes */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes & Procurement Details
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows="2"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
                            />
                        </div>

                        {/* Active Status */}
                        <div className="md:col-span-2 pt-2">
                            <label className="inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={formData.is_active}
                                    onChange={handleChange}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none ring-2 ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                <span className="ml-3 text-sm font-medium text-gray-800">
                                    {formData.is_active ? 'Active Dealer' : 'Inactive Dealer'}
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-4 border-t border-gray-100 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.name.trim() || !formData.address.trim()}
                            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-sm font-semibold shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center space-x-2"
                        >
                            {loading ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>Updating...</span>
                                </>
                            ) : (
                                <span>Save Changes</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// -------------------------------------------------------------
// VIEW DEALER DETAILS MODAL
// -------------------------------------------------------------
function ViewDealerModal({ isOpen, onClose, dealerId }) {
    const [dealer, setDealer] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    // ESC key support
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose()
            }
        }
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown)
        }
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    useEffect(() => {
        if (isOpen && dealerId) {
            setLoading(true)
            setError('')
            fetch(`${API_BASE_URL}/dealers/${dealerId}`, { credentials: 'include' })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setDealer(data.data)
                    } else {
                        setError(data.message || 'Dealer not found')
                    }
                })
                .catch(err => {
                    console.error('Error fetching dealer:', err)
                    setError('Failed to load dealer details')
                })
                .finally(() => setLoading(false))
        }
    }, [isOpen, dealerId])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-gray-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 px-6 py-5 text-white flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{dealer?.name || 'Dealer Details'}</h2>
                            <p className="text-xs text-blue-100">Vendor specifications, procurement history & supplied equipment (ESC to close)</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto space-y-6">
                    {loading ? (
                        <div className="py-12 text-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
                            <p className="mt-3 text-sm text-gray-500">Loading dealer details...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>
                    ) : dealer ? (
                        <>
                            {/* Key Stats Cards */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3">
                                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider block">Status</span>
                                    <span className={`inline-block mt-1 px-2.5 py-0.5 text-xs font-bold rounded-full ${dealer.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-700'}`}>
                                        {dealer.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3">
                                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider block">Location</span>
                                    <span className="text-sm font-bold text-gray-800 mt-1 block">
                                        {[dealer.city, dealer.state].filter(Boolean).join(', ') || '—'}
                                    </span>
                                </div>
                                <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-3">
                                    <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider block">Equipment Count</span>
                                    <span className="text-sm font-bold text-purple-900 mt-1 block">{dealer.equipment_count || 0} items</span>
                                </div>
                                <div className="bg-amber-50/70 border border-amber-100 rounded-xl p-3">
                                    <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block">Registered On</span>
                                    <span className="text-sm font-bold text-gray-800 mt-1 block">{formatDate(dealer.created_at || dealer.createdAt)}</span>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                    Vendor & Address Details
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                                    <div>
                                        <span className="text-xs text-gray-500 block">Dealer Name</span>
                                        <span className="font-semibold text-gray-800">{dealer.name}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 block">GST / Tax Number</span>
                                        <span className="font-mono text-gray-800">{dealer.gst_number || 'Not provided'}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 block">Postal / PIN Code</span>
                                        <span className="font-mono text-gray-800">{dealer.postal_code || '—'}</span>
                                    </div>
                                    <div className="md:col-span-3">
                                        <span className="text-xs text-gray-500 block">Dealer Address</span>
                                        <p className="font-medium text-gray-800 bg-white p-3 rounded-lg border border-gray-200 mt-1 whitespace-pre-wrap">
                                            {dealer.address || 'No address provided'}
                                        </p>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 block">Contact Person</span>
                                        <span className="font-medium text-gray-800">{dealer.contact_person || '—'}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 block">Phone</span>
                                        <span className="font-medium text-gray-800">{dealer.phone || '—'}</span>
                                    </div>
                                    <div>
                                        <span className="text-xs text-gray-500 block">Email Address</span>
                                        <span className="font-medium text-gray-800">{dealer.email || '—'}</span>
                                    </div>
                                    {dealer.notes && (
                                        <div className="md:col-span-3">
                                            <span className="text-xs text-gray-500 block">Notes & Terms</span>
                                            <p className="font-medium text-gray-700 bg-amber-50/50 p-2.5 rounded-lg border border-amber-200 mt-1 text-xs whitespace-pre-wrap">
                                                {dealer.notes}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Equipment Supplied Table */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center justify-between">
                                    <span className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        Equipment & Purchase History ({dealer.equipment?.length || 0})
                                    </span>
                                </h3>

                                {dealer.equipment && dealer.equipment.length > 0 ? (
                                    <div className="border border-gray-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-gray-100 text-gray-600 sticky top-0">
                                                <tr>
                                                    <th className="px-3 py-2 font-semibold">Equipment Name</th>
                                                    <th className="px-3 py-2 font-semibold">Serial No</th>
                                                    <th className="px-3 py-2 font-semibold">Brand / Model</th>
                                                    <th className="px-3 py-2 font-semibold">Purchase Date</th>
                                                    <th className="px-3 py-2 font-semibold">Purchase Price</th>
                                                    <th className="px-3 py-2 font-semibold">Lab</th>
                                                    <th className="px-3 py-2 font-semibold">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100 bg-white">
                                                {dealer.equipment.map(item => (
                                                    <tr key={item.id} className="hover:bg-gray-50">
                                                        <td className="px-3 py-2 font-medium text-gray-900">{item.name}</td>
                                                        <td className="px-3 py-2 font-mono text-gray-500">{item.serial_number}</td>
                                                        <td className="px-3 py-2 text-gray-600">{item.brand || item.model || '—'}</td>
                                                        <td className="px-3 py-2 text-gray-600">{formatDate(item.purchase_date)}</td>
                                                        <td className="px-3 py-2 font-semibold text-gray-900">
                                                            {item.purchase_price ? `₹${parseFloat(item.purchase_price).toLocaleString('en-IN')}` : '—'}
                                                        </td>
                                                        <td className="px-3 py-2 text-gray-600">{item.lab?.name || 'Unassigned'}</td>
                                                        <td className="px-3 py-2">
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                                                                item.status === 'available' ? 'bg-emerald-100 text-emerald-800' :
                                                                item.status === 'in_use' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-amber-100 text-amber-800'
                                                            }`}>
                                                                {item.status?.replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-center text-xs text-gray-500">
                                        No equipment has been linked to this dealer yet. You can assign this dealer when adding or editing equipment.
                                    </div>
                                )}
                            </div>
                        </>
                    ) : null}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

// -------------------------------------------------------------
// DELETE CONFIRMATION MODAL
// -------------------------------------------------------------
function DeleteDealerModal({ isOpen, onClose, dealer, onDealerDeleted }) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // ESC key support
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && !loading) {
                onClose()
            }
        }
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown)
        }
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, loading, onClose])

    if (!isOpen || !dealer) return null

    const hasLinkedEquipment = (dealer.equipment_count || 0) > 0

    const handleDelete = async (force = false) => {
        try {
            setLoading(true)
            setError('')

            const url = `${API_BASE_URL}/dealers/${dealer.id}${force ? '?force=true' : ''}`
            const response = await fetch(url, {
                method: 'DELETE',
                credentials: 'include'
            })

            const result = await response.json()

            if (result.success) {
                onDealerDeleted(dealer.id)
                onClose()
            } else {
                setError(result.message || 'Failed to delete dealer')
            }
        } catch (err) {
            console.error('Error deleting dealer:', err)
            setError('Network error. Failed to delete dealer.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 p-6">
                <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.982 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>

                <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Dealer Record?</h3>
                <p className="text-sm text-gray-600 text-center mb-4">
                    Are you sure you want to delete <span className="font-semibold text-gray-900">"{dealer.name}"</span>?
                </p>

                {hasLinkedEquipment && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 mb-4">
                        ⚠️ <strong>Warning:</strong> This dealer currently has{' '}
                        <strong>{dealer.equipment_count} equipment item(s)</strong> assigned to it. Choosing Force Delete will unlink the dealer from those items.
                    </div>
                )}

                {error && (
                    <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded mb-4">
                        {error}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-2 justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
                    >
                        Cancel
                    </button>

                    {hasLinkedEquipment ? (
                        <button
                            type="button"
                            onClick={() => handleDelete(true)}
                            disabled={loading}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold shadow-sm"
                        >
                            {loading ? 'Deleting...' : 'Force Delete & Unlink'}
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => handleDelete(false)}
                            disabled={loading}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold shadow-sm"
                        >
                            {loading ? 'Deleting...' : 'Confirm Delete'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

// -------------------------------------------------------------
// MAIN PAGE COMPONENT: DealerMaster
// -------------------------------------------------------------
export default function DealerMaster() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { user, isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    // State
    const [dealers, setDealers] = useState([])
    const [stats, setStats] = useState({
        totalDealers: 0,
        activeDealers: 0,
        inactiveDealers: 0,
        totalEquipmentAssigned: 0
    })
    const [loading, setLoading] = useState(true)
    const [statsLoading, setStatsLoading] = useState(true)
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    // Search and Checkbox Filters
    const [searchQuery, setSearchQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('all') // all, active, inactive
    const [selectedStatuses, setSelectedStatuses] = useState([]) // ['active', 'inactive']
    const [selectedCities, setSelectedCities] = useState([])
    const [equipmentFilter, setEquipmentFilter] = useState([]) // ['has_equipment', 'no_equipment']
    const [isFilterPanelExpanded, setIsFilterPanelExpanded] = useState(false)

    // Record Selection & Batch Actions
    const [selectedDealerIds, setSelectedDealerIds] = useState([])
    const [batchLoading, setBatchLoading] = useState(false)

    // Modals
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [editingDealer, setEditingDealer] = useState(null)
    const [viewingDealerId, setViewingDealerId] = useState(null)
    const [deletingDealer, setDeletingDealer] = useState(null)

    // Load Stats
    const loadStats = async () => {
        try {
            setStatsLoading(true)
            const res = await fetch(`${API_BASE_URL}/dealers/stats`, { credentials: 'include' })
            const data = await res.json()
            if (data.success) {
                setStats(data.data)
            }
        } catch (err) {
            console.error('Error fetching dealer stats:', err)
        } finally {
            setStatsLoading(false)
        }
    }

    // Load Dealers
    const loadDealers = async () => {
        try {
            setLoading(true)
            setError('')
            const params = new URLSearchParams()
            if (searchQuery.trim()) params.append('search', searchQuery.trim())
            if (statusFilter !== 'all') params.append('status', statusFilter)

            const url = `${API_BASE_URL}/dealers${params.toString() ? `?${params.toString()}` : ''}`
            const res = await fetch(url, { credentials: 'include' })
            const data = await res.json()

            if (data.success) {
                setDealers(data.data || [])
            } else {
                setError(data.message || 'Failed to load dealers')
            }
        } catch (err) {
            console.error('Error loading dealers:', err)
            setError('Failed to connect to server. Please check your backend.')
        } finally {
            setLoading(false)
        }
    }

    // Extract dynamic unique cities from dealers list
    const availableCities = Array.from(new Set(
        dealers.map(d => d.city).filter(Boolean).map(c => c.trim())
    )).sort()

    // Filtered Dealers based on search, checkboxes, and status tabs
    const filteredDealers = dealers.filter(dealer => {
        // Status checkboxes
        if (selectedStatuses.length > 0) {
            const matches = (selectedStatuses.includes('active') && dealer.is_active) ||
                            (selectedStatuses.includes('inactive') && !dealer.is_active)
            if (!matches) return false
        }
        // City checkboxes
        if (selectedCities.length > 0) {
            if (!dealer.city || !selectedCities.includes(dealer.city)) return false
        }
        // Equipment assignment checkboxes
        if (equipmentFilter.length > 0) {
            const hasEq = (dealer.equipment_count || 0) > 0
            const matches = (equipmentFilter.includes('has_equipment') && hasEq) ||
                            (equipmentFilter.includes('no_equipment') && !hasEq)
            if (!matches) return false
        }
        return true
    })

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, selectedStatuses, selectedCities, equipmentFilter])

    // Paginated dealers slice
    const paginatedDealers = useMemo(() => {
        const start = (currentPage - 1) * pageSize
        return filteredDealers.slice(start, start + pageSize)
    }, [filteredDealers, currentPage, pageSize])

    // Smart Search Options Groups for Dealer Master
    const smartDealerGroups = [
        {
            id: 'status',
            title: 'Status',
            options: [
                { id: 'active', label: 'Active Vendors', count: stats.activeDealers, color: '#10b981' },
                { id: 'inactive', label: 'Inactive Vendors', count: stats.inactiveDealers, color: '#9ca3af' }
            ]
        },
        {
            id: 'city',
            title: 'City / Location',
            options: availableCities.map(city => ({
                id: city,
                label: city,
                count: dealers.filter(d => d.city === city).length
            }))
        },
        {
            id: 'equipment',
            title: 'Equipment',
            options: [
                { id: 'has_equipment', label: 'Has Equipment (> 0)', count: dealers.filter(d => (d.equipment_count || 0) > 0).length },
                { id: 'no_equipment', label: 'No Equipment (0)', count: dealers.filter(d => (d.equipment_count || 0) === 0).length }
            ]
        }
    ]

    // Active filters count
    const activeFilterCount =
        selectedStatuses.length +
        selectedCities.length +
        equipmentFilter.length +
        (searchQuery ? 1 : 0)

    // Selection helpers
    const isAllSelected = filteredDealers.length > 0 && selectedDealerIds.length === filteredDealers.length
    const isSomeSelected = selectedDealerIds.length > 0 && selectedDealerIds.length < filteredDealers.length

    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedDealerIds([])
        } else {
            setSelectedDealerIds(filteredDealers.map(d => d.id))
        }
    }

    const handleToggleDealer = (id) => {
        setSelectedDealerIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        )
    }

    const clearAllFilters = () => {
        setSearchQuery('')
        setSelectedStatuses([])
        setSelectedCities([])
        setEquipmentFilter([])
        setStatusFilter('all')
    }

    // Batch Action Handlers
    const handleBatchSetStatus = async (isActive) => {
        if (selectedDealerIds.length === 0) return
        try {
            setBatchLoading(true)
            const res = await fetch(`${API_BASE_URL}/dealers/batch-status`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedDealerIds, is_active: isActive })
            })
            const data = await res.json()
            if (data.success) {
                setDealers(prev => prev.map(d => selectedDealerIds.includes(d.id) ? { ...d, is_active: isActive } : d))
                showToast(`Successfully set ${selectedDealerIds.length} dealer(s) to ${isActive ? 'Active' : 'Inactive'}`)
                setSelectedDealerIds([])
                loadStats()
            } else {
                setError(data.message || 'Failed to update dealer status')
            }
        } catch (err) {
            console.error('Batch status error:', err)
            setError('Network error while updating dealers')
        } finally {
            setBatchLoading(false)
        }
    }

    const handleBatchDeleteDealers = async (force = false) => {
        if (selectedDealerIds.length === 0) return
        const count = selectedDealerIds.length
        if (!window.confirm(`⚠️ WARNING: Are you sure you want to delete ${count} selected dealer record(s)?`)) {
            return
        }
        try {
            setBatchLoading(true)
            const res = await fetch(`${API_BASE_URL}/dealers/batch-delete`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedDealerIds, force })
            })
            const data = await res.json()
            if (data.success) {
                setDealers(prev => prev.filter(d => !selectedDealerIds.includes(d.id)))
                showToast(`Successfully deleted ${count} dealer(s)`)
                setSelectedDealerIds([])
                loadStats()
            } else {
                if (data.canForce) {
                    if (window.confirm(`${data.message}\n\nWould you like to Force Delete and unlink all associated equipment?`)) {
                        handleBatchDeleteDealers(true)
                        return
                    }
                }
                setError(data.message || 'Failed to delete selected dealers')
            }
        } catch (err) {
            console.error('Batch delete error:', err)
            setError('Network error while deleting dealers')
        } finally {
            setBatchLoading(false)
        }
    }

    const handleExportDealersCSV = (onlySelected = false) => {
        const itemsToExport = onlySelected
            ? filteredDealers.filter(d => selectedDealerIds.includes(d.id))
            : filteredDealers

        if (itemsToExport.length === 0) {
            alert('No dealers to export')
            return
        }

        const headers = ['ID', 'Dealer Name', 'Address', 'City', 'Contact Person', 'Phone', 'Email', 'GST Number', 'Status', 'Equipment Count']
        const csvRows = [headers.join(',')]

        itemsToExport.forEach(d => {
            const row = [
                d.id,
                `"${(d.name || '').replace(/"/g, '""')}"`,
                `"${(d.address || '').replace(/"/g, '""')}"`,
                `"${(d.city || '').replace(/"/g, '""')}"`,
                `"${(d.contact_person || '').replace(/"/g, '""')}"`,
                `"${(d.phone || '').replace(/"/g, '""')}"`,
                `"${(d.email || '').replace(/"/g, '""')}"`,
                `"${(d.gst_number || '').replace(/"/g, '""')}"`,
                d.is_active ? 'Active' : 'Inactive',
                d.equipment_count || 0
            ]
            csvRows.push(row.join(','))
        })

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', `dealers_export_${new Date().toISOString().slice(0, 10)}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        showToast(`Exported ${itemsToExport.length} dealer record(s) to CSV`)
    }

    useEffect(() => {
        if (isAuthenticated) {
            loadStats()
            loadDealers()
        }
    }, [isAuthenticated, statusFilter])

    // Handle search with enter or debounce
    const handleSearchSubmit = (e) => {
        e.preventDefault()
        loadDealers()
    }

    const showToast = (msg) => {
        setSuccessMessage(msg)
        setTimeout(() => setSuccessMessage(''), 4000)
    }

    // Handler when dealer added
    const handleDealerAdded = (newDealer) => {
        setDealers(prev => [newDealer, ...prev])
        loadStats()
        showToast(`Dealer "${newDealer.name}" added successfully!`)
    }

    // Handler when dealer updated
    const handleDealerUpdated = (updated) => {
        setDealers(prev => prev.map(d => (d.id === updated.id ? updated : d)))
        loadStats()
        showToast(`Dealer "${updated.name}" updated successfully!`)
    }

    // Handler when dealer deleted
    const handleDealerDeleted = (deletedId) => {
        setDealers(prev => prev.filter(d => d.id !== deletedId))
        loadStats()
        showToast('Dealer deleted successfully!')
    }

    // Toggle active status
    const handleToggleStatus = async (dealer) => {
        try {
            const res = await fetch(`${API_BASE_URL}/dealers/${dealer.id}/status`, {
                method: 'PATCH',
                credentials: 'include'
            })
            const data = await res.json()
            if (data.success) {
                setDealers(prev => prev.map(d => d.id === dealer.id ? { ...d, is_active: !d.is_active } : d))
                loadStats()
                showToast(`Dealer "${dealer.name}" is now ${!dealer.is_active ? 'Active' : 'Inactive'}`)
            } else {
                setError(data.message || 'Failed to update status')
            }
        } catch (err) {
            console.error('Error toggling status:', err)
            setError('Failed to update status')
        }
    }

    return (
        <div className="min-h-screen w-full bg-gray-50 flex overflow-x-hidden font-sans">
            {/* Sidebar */}
            <Sidebar
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
                currentPath={location.pathname}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
                stats={{
                    totalDealers: stats.totalDealers
                }}
            />

            {/* Main Content Area (Properly offset so nothing is hidden behind sidebar) */}
            <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} flex flex-col min-w-0`}>
                {/* Header */}
                <AppHeader  onToggleMobileMenu={() => setMobileOpen(!mobileOpen)} />

                {/* Sub-Header / Breadcrumb */}
                <div className="bg-white border-b border-gray-200 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
                            <span className="hover:text-blue-600 cursor-pointer" onClick={() => navigate('/dashboard')}>Dashboard</span>
                            <span>/</span>
                            <span className="hover:text-blue-600 cursor-pointer" onClick={() => navigate('/equipment')}>Equipment</span>
                            <span>/</span>
                            <span className="text-gray-800 font-semibold">Dealer Master</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Dealer Master</h1>
                                <p className="text-xs text-gray-500">Manage equipment vendors, supplier addresses, and procurement details</p>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => navigate('/equipment')}
                            className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-semibold transition-all shadow-2xs flex items-center space-x-2"
                        >
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span>Back to Equipment</span>
                        </button>
                        <button
                            onClick={() => setIsAddOpen(true)}
                            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Add Dealer</span>
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Success Toast */}
                    {successMessage && (
                        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 rounded-r-xl shadow-xs flex items-center justify-between animate-fadeIn">
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="text-sm font-semibold">{successMessage}</span>
                            </div>
                            <button onClick={() => setSuccessMessage('')} className="text-emerald-700 hover:text-emerald-900">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Dealers</p>
                                    <h3 className="text-2xl font-black text-gray-900 mt-1">{stats.totalDealers}</h3>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-2">Registered equipment vendors</p>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Vendors</p>
                                    <h3 className="text-2xl font-black text-emerald-600 mt-1">{stats.activeDealers}</h3>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-[11px] text-emerald-600 mt-2 font-medium">Available for selection in forms</p>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Inactive Vendors</p>
                                    <h3 className="text-2xl font-black text-gray-500 mt-1">{stats.inactiveDealers}</h3>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-2">Archived / suspended dealers</p>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Equipment Mapped</p>
                                    <h3 className="text-2xl font-black text-indigo-600 mt-1">{stats.totalEquipmentAssigned}</h3>
                                </div>
                                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-[11px] text-indigo-600 mt-2 font-medium">Items linked to suppliers</p>
                        </div>
                    </div>

                    {/* Search and Action Toolbar */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 p-4 sm:p-5">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            {/* Unified Smart Search Bar */}
                            <div className="flex-1 max-w-2xl">
                                <SmartSearchBar
                                    searchValue={searchQuery}
                                    onSearchChange={(val) => setSearchQuery(val)}
                                    placeholder="Search by dealer name, address, city, contact, GST..."
                                    groups={smartDealerGroups}
                                    selectedOptions={{
                                        status: selectedStatuses,
                                        city: selectedCities,
                                        equipment: equipmentFilter
                                    }}
                                    onOptionToggle={(groupId, optId) => {
                                        if (groupId === 'status') {
                                            setSelectedStatuses(prev => prev.includes(optId) ? prev.filter(x => x !== optId) : [...prev, optId])
                                        } else if (groupId === 'city') {
                                            setSelectedCities(prev => prev.includes(optId) ? prev.filter(x => x !== optId) : [...prev, optId])
                                        } else if (groupId === 'equipment') {
                                            setEquipmentFilter(prev => prev.includes(optId) ? prev.filter(x => x !== optId) : [...prev, optId])
                                        }
                                    }}
                                    onGroupSelectAll={(groupId, allIds) => {
                                        if (groupId === 'status') setSelectedStatuses(allIds)
                                        else if (groupId === 'city') setSelectedCities(allIds)
                                        else if (groupId === 'equipment') setEquipmentFilter(allIds)
                                    }}
                                    onGroupClear={(groupId) => {
                                        if (groupId === 'status') setSelectedStatuses([])
                                        else if (groupId === 'city') setSelectedCities([])
                                        else if (groupId === 'equipment') setEquipmentFilter([])
                                    }}
                                    onClearAll={() => {
                                        setSearchQuery('')
                                        setSelectedStatuses([])
                                        setSelectedCities([])
                                        setEquipmentFilter([])
                                    }}
                                />
                            </div>

                            {/* Toolbar Buttons: Export CSV & Refresh */}
                            <div className="flex items-center space-x-2 self-start lg:self-center flex-wrap">
                                {/* Export CSV */}
                                <button
                                    type="button"
                                    onClick={() => handleExportDealersCSV(selectedDealerIds.length > 0)}
                                    className="px-3.5 py-2.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 flex items-center space-x-1 shadow-2xs transition-colors"
                                    title="Export dealers to CSV"
                                >
                                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>{selectedDealerIds.length > 0 ? `Export (${selectedDealerIds.length})` : 'Export CSV'}</span>
                                </button>

                                {/* Refresh */}
                                <button
                                    onClick={() => {
                                        loadDealers()
                                        loadStats()
                                    }}
                                    title="Refresh list"
                                    className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-xl transition-colors border border-gray-200"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Floating / Sticky Batch Actions Bar for Dealers */}
                    {selectedDealerIds.length > 0 && (
                        <div className="sticky top-4 z-40 mb-6 p-4 bg-gradient-to-r from-gray-900 to-indigo-950 text-white rounded-2xl shadow-2xl border border-indigo-700/50 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
                            <div className="flex items-center space-x-3">
                                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400 font-bold">
                                    ✓
                                </div>
                                <div>
                                    <span className="font-bold text-sm">
                                        {selectedDealerIds.length} {selectedDealerIds.length === 1 ? 'dealer' : 'dealers'} selected
                                    </span>
                                    <p className="text-[11px] text-gray-300">Choose a bulk operation to execute on selected records</p>
                                </div>
                            </div>

                            <div className="flex items-center flex-wrap gap-2.5">
                                <button
                                    onClick={() => handleBatchSetStatus(true)}
                                    disabled={batchLoading}
                                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-1"
                                >
                                    <span>Set Active</span>
                                </button>

                                <button
                                    onClick={() => handleBatchSetStatus(false)}
                                    disabled={batchLoading}
                                    className="px-3.5 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-1"
                                >
                                    <span>Set Inactive</span>
                                </button>

                                <button
                                    onClick={() => handleExportDealersCSV(true)}
                                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-1"
                                >
                                    <span>Export CSV</span>
                                </button>

                                <button
                                    onClick={() => handleBatchDeleteDealers(false)}
                                    disabled={batchLoading}
                                    className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-1"
                                >
                                    <span>Delete Selected</span>
                                </button>

                                <button
                                    onClick={() => setSelectedDealerIds([])}
                                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-gray-200 rounded-xl text-xs font-semibold transition-colors"
                                >
                                    Deselect All
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Dealers Table Card */}
                    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden">
                        {loading ? (
                            <div className="py-20 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                                <p className="mt-4 text-sm text-gray-500 font-medium">Loading dealer records...</p>
                            </div>
                        ) : error ? (
                            <div className="p-8 text-center">
                                <div className="text-red-500 mb-2">⚠️ Error loading records</div>
                                <p className="text-sm text-gray-600">{error}</p>
                                <button
                                    onClick={loadDealers}
                                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : filteredDealers.length === 0 ? (
                            <div className="py-20 text-center px-4">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto mb-4">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                    </svg>
                                </div>
                                <h3 className="text-base font-bold text-gray-900 mb-1">No Dealers Found</h3>
                                <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
                                    {searchQuery || activeFilterCount > 0 ? 'No dealers matched your active filters.' : 'No dealers have been added yet.'}
                                </p>
                                <button
                                    onClick={() => {
                                        clearAllFilters()
                                        if (dealers.length === 0) setIsAddOpen(true)
                                    }}
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md"
                                >
                                    {dealers.length === 0 ? '+ Add First Dealer' : 'Reset Filters'}
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50/75 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold tracking-wider">
                                        <tr>
                                            <th className="px-4 py-4 w-12 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isAllSelected}
                                                    ref={el => el && (el.indeterminate = isSomeSelected)}
                                                    onChange={handleSelectAll}
                                                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                                                />
                                            </th>
                                            <th className="px-6 py-4">Dealer Name</th>
                                            <th className="px-6 py-4">Dealer Address</th>
                                            <th className="px-6 py-4">Contact Person</th>
                                            <th className="px-6 py-4">GST / Tax ID</th>
                                            <th className="px-6 py-4 text-center">Equipment</th>
                                            <th className="px-6 py-4 text-center">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 font-normal text-gray-700">
                                        {paginatedDealers.map(dealer => {
                                            const isSelected = selectedDealerIds.includes(dealer.id)
                                            return (
                                            <tr key={dealer.id} className={`hover:bg-blue-50/40 transition-colors group ${isSelected ? 'bg-indigo-50/60' : ''}`}>
                                                {/* Row Checkbox */}
                                                <td className="px-4 py-4 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleToggleDealer(dealer.id)}
                                                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
                                                    />
                                                </td>
                                                {/* Dealer Name */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-100 border border-indigo-100 flex items-center justify-center shrink-0">
                                                            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                            </svg>
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 flex items-center gap-2">
                                                                <span>{dealer.name}</span>
                                                                <span className="text-[10px] text-gray-400 font-mono">#{dealer.id}</span>
                                                            </div>
                                                            {dealer.city && (
                                                                <span className="inline-block mt-0.5 text-xs text-indigo-600 font-medium">
                                                                    📍 {dealer.city}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Dealer Address */}
                                                <td className="px-6 py-4 max-w-xs">
                                                    <p className="text-xs text-gray-600 line-clamp-2" title={dealer.address || 'No address'}>
                                                        {dealer.address || <span className="text-gray-400 italic">No address provided</span>}
                                                    </p>
                                                </td>

                                                {/* Contact Info */}
                                                <td className="px-6 py-4">
                                                    <div className="space-y-0.5 text-xs">
                                                        <div className="font-semibold text-gray-900">{dealer.contact_person || '—'}</div>
                                                        {dealer.phone && (
                                                            <div className="text-gray-500 flex items-center gap-1">
                                                                <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                                </svg>
                                                                <span>{dealer.phone}</span>
                                                            </div>
                                                        )}
                                                        {dealer.email && (
                                                            <div className="text-blue-600 flex items-center gap-1 truncate max-w-[180px]">
                                                                <svg className="w-3.5 h-3.5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                                </svg>
                                                                <span>{dealer.email}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* GST Number */}
                                                <td className="px-6 py-4">
                                                    {dealer.gst_number ? (
                                                        <span className="font-mono text-xs px-2.5 py-1 bg-gray-100 rounded-lg text-gray-700 border border-gray-200 font-medium">
                                                            {dealer.gst_number}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">—</span>
                                                    )}
                                                </td>

                                                {/* Equipment Count */}
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => setViewingDealerId(dealer.id)}
                                                        className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                                                        title="Click to view equipment supplied"
                                                    >
                                                        <span>{dealer.equipment_count || 0}</span>
                                                        <span className="text-[10px] text-indigo-500 uppercase">items</span>
                                                    </button>
                                                </td>

                                                {/* Status */}
                                                <td className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => handleToggleStatus(dealer)}
                                                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                                                            dealer.is_active
                                                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                        title="Click to toggle status"
                                                    >
                                                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dealer.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                                                        <span>{dealer.is_active ? 'Active' : 'Inactive'}</span>
                                                    </button>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <button
                                                            onClick={() => setViewingDealerId(dealer.id)}
                                                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="View Dealer & Equipment"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                            </svg>
                                                        </button>

                                                        <button
                                                            onClick={() => setEditingDealer(dealer)}
                                                            className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                            title="Edit Dealer"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </button>

                                                        <button
                                                            onClick={() => setDeletingDealer(dealer)}
                                                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete Dealer"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
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

                    {/* Pagination */}
                    {filteredDealers.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalItems={filteredDealers.length}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={(newSize) => {
                                setPageSize(newSize)
                                setCurrentPage(1)
                            }}
                            pageSizeOptions={[10, 25, 50]}
                            itemLabel="dealers"
                            scrollToTop={true}
                        />
                    )}
                </div>
            </div>

            {/* Modals */}
            <AddDealerModal
                isOpen={isAddOpen}
                onClose={() => setIsAddOpen(false)}
                onDealerAdded={handleDealerAdded}
            />

            <EditDealerModal
                isOpen={Boolean(editingDealer)}
                dealer={editingDealer}
                onClose={() => setEditingDealer(null)}
                onDealerUpdated={handleDealerUpdated}
            />

            <ViewDealerModal
                isOpen={Boolean(viewingDealerId)}
                dealerId={viewingDealerId}
                onClose={() => setViewingDealerId(null)}
            />

            <DeleteDealerModal
                isOpen={Boolean(deletingDealer)}
                dealer={deletingDealer}
                onClose={() => setDeletingDealer(null)}
                onDealerDeleted={handleDealerDeleted}
            />
        </div>
    )
}
