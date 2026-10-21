// src/pages/EquipmentInventory.jsx - Professional Laboratory Management UI
import { useState, useEffect, useRef, useMemo } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate, useLocation } from 'react-router-dom'
import ExcelImportModal from '../components/ExcelImportModal'
import { Sidebar, AppHeader, getNavigationItems } from '../components/common/Navigation'
import SmartSearchBar from '../components/common/SmartSearchBar'
import Pagination from '../components/common/Pagination'
import EquipmentWizardModal from '../components/EquipmentWizardModal'

// Professional Add Equipment Modal Component with Dynamic Fields
function AddEquipmentModal({ isOpen, onClose, onEquipmentAdded, labs }) {
    const { isAuthenticated } = useAuth()
    const API_BASE_URL = '/api' // Use relative URL for proxy
    const [dealers, setDealers] = useState([])
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        serial_number: '',
        model: '',
        brand: '',
        manufacturer: '',
        dealer_id: '',
        dealer_name: '',
        category: 'computer',
        lab_id: '',
        status: 'available',
        condition_status: 'excellent',
        purchase_price: '',
        current_value: '',
        purchase_date: new Date().toISOString().split('T')[0],
        warranty_expiry: '',
        // Configuration fields
        ram: '',
        ram_type: '',
        hard_disk: '',
        gpu: '',
        gpu_memory: '',
        generation: '',
        // Additional specs
        processor: '',
        storage: '',
        graphics_card: '',
        operating_system: '',
        // Stock register and indent tracking
        stock_register_page: '',
        indent_number: '',
        indent_date: '',
        // Projector specific
        resolution: '',
        brightness: '',
        contrast_ratio: '',
        lamp_hours: '',
        // Printer specific
        print_type: '',
        print_speed: '',
        paper_size: '',
        connectivity: '',
        // Microscope specific
        magnification: '',
        objective_lenses: '',
        illumination: '',
        // Lab Equipment specific
        capacity: '',
        power_rating: '',
        temperature_range: '',
        accuracy: '',
        // Network Equipment specific
        ports: '',
        speed: '',
        protocol: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Fetch dealers from Dealer Master table
    useEffect(() => {
        if (!isOpen) return
        fetch(`${API_BASE_URL}/dealers`, { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setDealers(data.data || [])
                }
            })
            .catch(err => console.error('Error loading dealers:', err))
    }, [isOpen])

    // Professional categories - standardized equipment types
    const categories = [
        {
            value: 'computer',
            label: 'Computer & IT Equipment',
            icon: 'desktop',
            color: 'bg-blue-100 text-blue-800'
        },
        {
            value: 'projector',
            label: 'Projectors & Displays',
            icon: 'projector',
            color: 'bg-purple-100 text-purple-800'
        },
        {
            value: 'printer',
            label: 'Printers & Scanners',
            icon: 'printer',
            color: 'bg-green-100 text-green-800'
        },
        {
            value: 'microscope',
            label: 'Microscopes & Optics',
            icon: 'microscope',
            color: 'bg-indigo-100 text-indigo-800'
        },
        {
            value: 'lab_equipment',
            label: 'Laboratory Equipment',
            icon: 'flask',
            color: 'bg-emerald-100 text-emerald-800'
        },
        {
            value: 'network',
            label: 'Network Equipment',
            icon: 'network',
            color: 'bg-orange-100 text-orange-800'
        }
    ]

    // Dynamic fields based on category
    const getSpecificFields = () => {
        switch (formData.category) {
            case 'computer':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-blue-50/60 p-4 rounded-xl border border-blue-200">
                        <div className="col-span-2">
                            <h4 className="font-semibold text-blue-800 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                </svg>
                                Computer System Details
                            </h4>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Processor / CPU Model
                            </label>
                            <input
                                type="text"
                                name="processor"
                                value={formData.processor}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                placeholder="e.g., Intel Core i7-12700K / AMD Ryzen 7"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Operating System
                            </label>
                            <select
                                name="operating_system"
                                value={formData.operating_system}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                disabled={loading}
                            >
                                <option value="">Select OS</option>
                                <option value="Windows 11 Pro">Windows 11 Pro</option>
                                <option value="Windows 11 Home">Windows 11 Home</option>
                                <option value="Windows 10 Pro">Windows 10 Pro</option>
                                <option value="macOS Sonoma">macOS Sonoma</option>
                                <option value="Ubuntu Linux">Ubuntu Linux</option>
                                <option value="Other Linux">Other Linux</option>
                            </select>
                        </div>
                    </div>
                )

            case 'projector':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <div className="col-span-2">
                            <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                </svg>
                                Projector Specifications
                            </h4>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Resolution
                            </label>
                            <select
                                name="resolution"
                                value={formData.resolution}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                disabled={loading}
                            >
                                <option value="">Select Resolution</option>
                                <option value="4K UHD (3840x2160)">4K UHD (3840x2160)</option>
                                <option value="Full HD (1920x1080)">Full HD (1920x1080)</option>
                                <option value="HD (1280x720)">HD (1280x720)</option>
                                <option value="XGA (1024x768)">XGA (1024x768)</option>
                                <option value="SVGA (800x600)">SVGA (800x600)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Brightness (Lumens)
                            </label>
                            <input
                                type="text"
                                name="brightness"
                                value={formData.brightness}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="e.g., 3500 Lumens"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Contrast Ratio
                            </label>
                            <input
                                type="text"
                                name="contrast_ratio"
                                value={formData.contrast_ratio}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="e.g., 15000:1"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Lamp Hours Used
                            </label>
                            <input
                                type="number"
                                name="lamp_hours"
                                value={formData.lamp_hours}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                placeholder="0"
                                disabled={loading}
                            />
                        </div>
                    </div>
                )

            case 'printer':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="col-span-2">
                            <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                                </svg>
                                Printer Specifications
                            </h4>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Print Type
                            </label>
                            <select
                                name="print_type"
                                value={formData.print_type}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                disabled={loading}
                            >
                                <option value="">Select Type</option>
                                <option value="Laser Printer">Laser Printer</option>
                                <option value="Inkjet Printer">Inkjet Printer</option>
                                <option value="3D Printer">3D Printer</option>
                                <option value="Label Printer">Label Printer</option>
                                <option value="Scanner">Scanner</option>
                                <option value="Multifunction">Multifunction (Print/Scan/Copy)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Print Speed
                            </label>
                            <input
                                type="text"
                                name="print_speed"
                                value={formData.print_speed}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="e.g., 30 ppm (pages per minute)"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Paper Size Support
                            </label>
                            <input
                                type="text"
                                name="paper_size"
                                value={formData.paper_size}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="e.g., A4, A3, Letter, Legal"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Connectivity
                            </label>
                            <input
                                type="text"
                                name="connectivity"
                                value={formData.connectivity}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="e.g., WiFi, Ethernet, USB, Bluetooth"
                                disabled={loading}
                            />
                        </div>
                    </div>
                )

            case 'microscope':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                        <div className="col-span-2">
                            <h4 className="font-semibold text-indigo-800 mb-3 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                                </svg>
                                Microscope Specifications
                            </h4>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Maximum Magnification
                            </label>
                            <input
                                type="text"
                                name="magnification"
                                value={formData.magnification}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g., 1000x, 2000x"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Objective Lenses
                            </label>
                            <input
                                type="text"
                                name="objective_lenses"
                                value={formData.objective_lenses}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g., 4x, 10x, 40x, 100x"
                                disabled={loading}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Illumination Type
                            </label>
                            <select
                                name="illumination"
                                value={formData.illumination}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                disabled={loading}
                            >
                                <option value="">Select Illumination</option>
                                <option value="LED">LED</option>
                                <option value="Halogen">Halogen</option>
                                <option value="Fluorescence">Fluorescence</option>
                                <option value="Phase Contrast">Phase Contrast</option>
                                <option value="Darkfield">Darkfield</option>
                            </select>
                        </div>
                    </div>
                )

            case 'lab_equipment':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                        <div className="col-span-2">
                            <h4 className="font-semibold text-emerald-800 mb-3 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                                </svg>
                                Laboratory Equipment Specifications
                            </h4>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Capacity/Volume
                            </label>
                            <input
                                type="text"
                                name="capacity"
                                value={formData.capacity}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="e.g., 500ml, 2L, 50 samples"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Power Rating
                            </label>
                            <input
                                type="text"
                                name="power_rating"
                                value={formData.power_rating}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="e.g., 220V, 1500W"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Temperature Range
                            </label>
                            <input
                                type="text"
                                name="temperature_range"
                                value={formData.temperature_range}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="e.g., -20°C to +150°C"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Accuracy/Precision
                            </label>
                            <input
                                type="text"
                                name="accuracy"
                                value={formData.accuracy}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                placeholder="e.g., ±0.1mg, ±0.01pH"
                                disabled={loading}
                            />
                        </div>
                    </div>
                )

            case 'network':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <div className="col-span-2">
                            <h4 className="font-semibold text-orange-800 mb-3 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01"></path>
                                </svg>
                                Network Equipment Specifications
                            </h4>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Number of Ports
                            </label>
                            <input
                                type="text"
                                name="ports"
                                value={formData.ports}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="e.g., 24 Ethernet, 4 SFP+"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Speed/Bandwidth
                            </label>
                            <input
                                type="text"
                                name="speed"
                                value={formData.speed}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="e.g., 1Gbps, 10Gbps, WiFi 6"
                                disabled={loading}
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-gray-700 text-sm font-medium mb-2">
                                Supported Protocols
                            </label>
                            <input
                                type="text"
                                name="protocol"
                                value={formData.protocol}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                placeholder="e.g., 802.11ax, VLAN, SNMP, PoE+"
                                disabled={loading}
                            />
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const payload = {
                ...formData,
                manufacturer: formData.brand || formData.manufacturer,
                storage: formData.hard_disk || formData.storage,
                graphics_card: formData.gpu || formData.graphics_card
            }

            const response = await fetch(`${API_BASE_URL}/equipment`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            const result = await response.json()

            if (result.success) {
                onEquipmentAdded(result.data.equipment)
                onClose()
                // Reset form
                setFormData({
                    name: '',
                    description: '',
                    serial_number: '',
                    model: '',
                    brand: '',
                    manufacturer: '',
                    dealer_id: '',
                    dealer_name: '',
                    category: 'computer',
                    lab_id: '',
                    status: 'available',
                    condition_status: 'excellent',
                    purchase_price: '',
                    current_value: '',
                    purchase_date: new Date().toISOString().split('T')[0],
                    warranty_expiry: '',
                    // Configuration fields
                    ram: '',
                    hard_disk: '',
                    gpu: '',
                    generation: '',
                    processor: '',
                    storage: '',
                    graphics_card: '',
                    operating_system: '',
                    resolution: '',
                    brightness: '',
                    contrast_ratio: '',
                    lamp_hours: '',
                    print_type: '',
                    print_speed: '',
                    paper_size: '',
                    connectivity: '',
                    magnification: '',
                    objective_lenses: '',
                    illumination: '',
                    capacity: '',
                    power_rating: '',
                    temperature_range: '',
                    accuracy: '',
                    ports: '',
                    speed: '',
                    protocol: ''
                })
            } else {
                setError(result.message || 'Failed to create equipment')
            }
        } catch (error) {
            console.error('Error creating equipment:', error)
            setError('Failed to create equipment. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => {
            const next = { ...prev, [name]: value }
            if (name === 'brand') next.manufacturer = value
            if (name === 'hard_disk') next.storage = value
            if (name === 'gpu') next.graphics_card = value
            return next
        })
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
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Add New Equipment</h2>
                                <p className="text-blue-100 text-sm">Enter equipment details and specifications</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                            disabled={loading}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg mb-6">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                                </svg>
                                <span className="font-medium">{error}</span>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Basic Information Section */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                </svg>
                                Basic Information
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Equipment Category *
                                    </label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {categories.map(cat => (
                                            <label key={cat.value} className="relative">
                                                <input
                                                    type="radio"
                                                    name="category"
                                                    value={cat.value}
                                                    checked={formData.category === cat.value}
                                                    onChange={handleChange}
                                                    className="sr-only"
                                                    disabled={loading}
                                                />
                                                <div className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${formData.category === cat.value
                                                        ? `${cat.color} border-current`
                                                        : 'bg-white border-gray-200 hover:border-gray-300'
                                                    }`}>
                                                    <div className="text-center">
                                                        <div className="text-2xl mb-1">{cat.icon}</div>
                                                        <div className="text-xs font-medium">
                                                            {cat.label.split(' ').slice(1).join(' ')}
                                                        </div>
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Equipment Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Enter equipment name"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Serial Number *
                                    </label>
                                    <input
                                        type="text"
                                        name="serial_number"
                                        value={formData.serial_number}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Serial number"
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Assigned Lab *
                                    </label>
                                    <select
                                        name="lab_id"
                                        value={formData.lab_id}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        required
                                        disabled={loading}
                                    >
                                        <option value="">Select Lab</option>
                                        {labs.map(lab => (
                                            <option key={lab.id} value={lab.id}>
                                                {lab.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Brand * (e.g., Dell, HP, Lenovo)
                                    </label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="e.g., Dell"
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Model Number
                                    </label>
                                    <input
                                        type="text"
                                        name="model"
                                        value={formData.model}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        placeholder="Equipment model"
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Dealer (from Dealer Master)
                                    </label>
                                    <select
                                        name="dealer_id"
                                        value={formData.dealer_id}
                                        onChange={(e) => {
                                            const sId = e.target.value;
                                            const dObj = dealers.find(d => String(d.id) === String(sId));
                                            setFormData(prev => ({
                                                ...prev,
                                                dealer_id: sId,
                                                dealer_name: dObj ? dObj.name : ''
                                            }));
                                        }}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                                        disabled={loading}
                                    >
                                        <option value="">Select Dealer</option>
                                        {dealers.map(dealer => (
                                            <option key={dealer.id} value={dealer.id}>
                                                {dealer.name} {dealer.city ? `(${dealer.city})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Condition Status
                                    </label>
                                    <select
                                        name="condition_status"
                                        value={formData.condition_status}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        disabled={loading}
                                    >
                                        <option value="excellent">Excellent</option>
                                        <option value="good">Good</option>
                                        <option value="fair">Fair</option>
                                        <option value="poor">Poor</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-gray-700 text-sm font-medium mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                        rows="3"
                                        placeholder="Detailed equipment description"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Configuration Section (RAM, Hard Disk, GPU, Generation) */}
                        <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-purple-50/70 p-6 rounded-xl border border-blue-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                    <span className="p-1.5 rounded-lg bg-blue-600 text-white shadow-2xs">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                        </svg>
                                    </span>
                                    <span>Configuration</span>
                                </h3>
                                <span className="text-xs text-blue-700 font-semibold bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200">
                                    Hardware Specs
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mb-4">
                                Enter the hardware configuration details: RAM, Hard Disk, GPU, and Generation.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">
                                        Processor Model
                                    </label>
                                    <input
                                        type="text"
                                        name="processor"
                                        value={formData.processor}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="e.g., Intel Core i7-12700 / AMD Ryzen 7"
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">
                                        Processor Generation
                                    </label>
                                    <input
                                        type="text"
                                        name="generation"
                                        value={formData.generation}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="e.g., 12th Gen, 13th Gen, Zen 4"
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">
                                        Operating System
                                    </label>
                                    <select
                                        name="operating_system"
                                        value={formData.operating_system}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        disabled={loading}
                                    >
                                        <option value="">Select OS</option>
                                        <option value="Windows 11 Pro">Windows 11 Pro</option>
                                        <option value="Windows 10 Pro">Windows 10 Pro</option>
                                        <option value="Ubuntu Linux 24.04">Ubuntu Linux</option>
                                        <option value="Red Hat Enterprise Linux">RHEL</option>
                                        <option value="macOS Sonoma">macOS</option>
                                        <option value="Other / Embedded">Other / Embedded</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">
                                        RAM Capacity
                                    </label>
                                    <input
                                        type="text"
                                        name="ram"
                                        value={formData.ram}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="e.g., 16 GB, 32 GB, 64 GB"
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">
                                        RAM Type
                                    </label>
                                    <select
                                        name="ram_type"
                                        value={formData.ram_type}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        disabled={loading}
                                    >
                                        <option value="">Select RAM Type</option>
                                        <option value="DDR5">DDR5</option>
                                        <option value="DDR4">DDR4</option>
                                        <option value="DDR3">DDR3</option>
                                        <option value="LPDDR5">LPDDR5</option>
                                        <option value="ECC DDR4">ECC DDR4 Server</option>
                                        <option value="ECC DDR5">ECC DDR5 Server</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">
                                        Storage Capacity
                                    </label>
                                    <input
                                        type="text"
                                        name="hard_disk"
                                        value={formData.hard_disk}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="e.g., 512 GB, 1 TB, 2 TB"
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">
                                        Storage Type (SSD/HDD)
                                    </label>
                                    <select
                                        name="storage"
                                        value={formData.storage}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        disabled={loading}
                                    >
                                        <option value="">Select Storage Type</option>
                                        <option value="NVMe PCIe 4.0 SSD">NVMe PCIe 4.0 SSD</option>
                                        <option value="NVMe PCIe 3.0 SSD">NVMe PCIe 3.0 SSD</option>
                                        <option value="SATA 2.5 SSD">SATA 2.5 SSD</option>
                                        <option value="SATA HDD (7200 RPM)">SATA HDD (7200 RPM)</option>
                                        <option value="SSD + HDD Hybrid">SSD + HDD Hybrid</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">
                                        GPU Model
                                    </label>
                                    <input
                                        type="text"
                                        name="gpu"
                                        value={formData.gpu}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="e.g., NVIDIA RTX 4060 / Integrated"
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">
                                        GPU Memory
                                    </label>
                                    <select
                                        name="gpu_memory"
                                        value={formData.gpu_memory}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        disabled={loading}
                                    >
                                        <option value="">Select GPU Memory</option>
                                        <option value="Integrated Shared">Integrated / Shared</option>
                                        <option value="2 GB GDDR5">2 GB GDDR5</option>
                                        <option value="4 GB GDDR6">4 GB GDDR6</option>
                                        <option value="6 GB GDDR6">6 GB GDDR6</option>
                                        <option value="8 GB GDDR6">8 GB GDDR6</option>
                                        <option value="12 GB GDDR6X">12 GB GDDR6X</option>
                                        <option value="16 GB GDDR6X">16 GB GDDR6X</option>
                                        <option value="24 GB GDDR6X">24 GB GDDR6X</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Category-Specific Specifications */}
                        {getSpecificFields()}

                        {/* Purchase & Stock Register Tracking Section */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                </svg>
                                Purchase & Stock Register Tracking
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">
                                        Purchase Price (₹)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-500 font-bold">₹</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="purchase_price"
                                            value={formData.purchase_price}
                                            onChange={handleChange}
                                            className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="0.00"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">
                                        Current Value (₹)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-500 font-bold">₹</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="current_value"
                                            value={formData.current_value}
                                            onChange={handleChange}
                                            className="w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                            placeholder="0.00"
                                            disabled={loading}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">
                                        Purchase Date
                                    </label>
                                    <input
                                        type="date"
                                        name="purchase_date"
                                        value={formData.purchase_date}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">
                                        Warranty Expiry
                                    </label>
                                    <input
                                        type="date"
                                        name="warranty_expiry"
                                        value={formData.warranty_expiry}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">
                                        Stock Book / Register Ref No
                                    </label>
                                    <input
                                        type="text"
                                        name="stock_register_page"
                                        value={formData.stock_register_page}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="e.g., Vol 2 / Page 45 / Item 12"
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">
                                        Indent Number / Ref
                                    </label>
                                    <input
                                        type="text"
                                        name="indent_number"
                                        value={formData.indent_number}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="e.g., IND-2026-089"
                                        disabled={loading}
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">
                                        Indent Date
                                    </label>
                                    <input
                                        type="date"
                                        name="indent_date"
                                        value={formData.indent_date}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !formData.name.trim() || !formData.serial_number.trim() || !formData.lab_id}
                                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Creating...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                        </svg>
                                        <span>Create Equipment</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

// Edit Equipment Modal Component
function EditEquipmentModal({ isOpen, onClose, equipment, onEquipmentUpdated }) {
    const { isAuthenticated } = useAuth()
    const [dealers, setDealers] = useState([])
    const [formData, setFormData] = useState({
        name: equipment?.name || '',
        description: equipment?.description || '',
        serial_number: equipment?.serial_number || '',
        model: equipment?.model || '',
        brand: equipment?.brand || equipment?.manufacturer || '',
        manufacturer: equipment?.manufacturer || equipment?.brand || '',
        dealer_id: equipment?.dealer_id || '',
        dealer_name: equipment?.dealer_name || '',
        ram: equipment?.ram || '',
        ram_type: equipment?.ram_type || '',
        hard_disk: equipment?.hard_disk || equipment?.storage || '',
        storage: equipment?.storage || equipment?.hard_disk || '',
        gpu: equipment?.gpu || equipment?.graphics_card || '',
        gpu_memory: equipment?.gpu_memory || '',
        processor: equipment?.processor || '',
        generation: equipment?.generation || '',
        operating_system: equipment?.operating_system || '',
        stock_register_page: equipment?.stock_register_page || '',
        indent_number: equipment?.indent_number || '',
        indent_date: equipment?.indent_date ? equipment.indent_date.split('T')[0] : '',
        status: equipment?.status || 'available',
        condition_status: equipment?.condition_status || 'excellent',
        purchase_price: equipment?.purchase_price || '',
        current_value: equipment?.current_value || '',
        purchase_date: equipment?.purchase_date ? equipment.purchase_date.split('T')[0] : '',
        warranty_expiry: equipment?.warranty_expiry ? equipment.warranty_expiry.split('T')[0] : ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (!isOpen) return
        fetch('/api/dealers', { credentials: 'include' })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setDealers(data.data || [])
                }
            })
            .catch(err => console.error('Error fetching dealers in edit modal:', err))
    }, [isOpen])

    useEffect(() => {
        if (equipment) {
            setFormData({
                name: equipment.name || '',
                description: equipment.description || '',
                serial_number: equipment.serial_number || '',
                model: equipment.model || '',
                brand: equipment.brand || equipment.manufacturer || '',
                manufacturer: equipment.manufacturer || equipment.brand || '',
                dealer_id: equipment.dealer_id || '',
                dealer_name: equipment.dealer_name || '',
                ram: equipment.ram || '',
                ram_type: equipment.ram_type || '',
                hard_disk: equipment.hard_disk || equipment.storage || '',
                storage: equipment.storage || equipment.hard_disk || '',
                gpu: equipment.gpu || equipment.graphics_card || '',
                gpu_memory: equipment.gpu_memory || '',
                processor: equipment.processor || '',
                generation: equipment.generation || '',
                operating_system: equipment.operating_system || '',
                stock_register_page: equipment.stock_register_page || '',
                indent_number: equipment.indent_number || '',
                indent_date: equipment.indent_date ? equipment.indent_date.split('T')[0] : '',
                status: equipment.status || 'available',
                condition_status: equipment.condition_status || 'excellent',
                purchase_price: equipment.purchase_price || '',
                current_value: equipment.current_value || '',
                purchase_date: equipment.purchase_date ? equipment.purchase_date.split('T')[0] : '',
                warranty_expiry: equipment.warranty_expiry ? equipment.warranty_expiry.split('T')[0] : ''
            })
        }
    }, [equipment])

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => {
            const next = { ...prev, [name]: value }
            if (name === 'brand') next.manufacturer = value
            if (name === 'hard_disk') next.storage = value
            if (name === 'gpu') next.graphics_card = value
            return next
        })
        setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const payload = {
                ...formData,
                manufacturer: formData.brand || formData.manufacturer,
                storage: formData.storage || formData.hard_disk,
                graphics_card: formData.gpu || formData.graphics_card
            }

            const response = await fetch(`/api/equipment/${equipment.id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })

            const result = await response.json()

            if (result.success) {
                onEquipmentUpdated(result.data.equipment)
                onClose()
            } else {
                setError(result.message || 'Failed to update equipment')
            }
        } catch (error) {
            console.error('Error updating equipment:', error)
            setError('Failed to update equipment. Please try again.')
        } finally {
            setLoading(false)
        }
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
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Edit Equipment</h2>
                                <p className="text-blue-100 text-sm">Update equipment specifications, hardware configuration and stock tracking</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 transition-colors p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)]">
                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-r-lg mb-6">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                                <span className="p-1.5 rounded-lg bg-blue-600 text-white mr-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </span>
                                Basic Equipment Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Equipment Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Serial Number *</label>
                                    <input
                                        type="text"
                                        name="serial_number"
                                        value={formData.serial_number}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Brand (e.g., Dell, HP, Lenovo)</label>
                                    <input
                                        type="text"
                                        name="brand"
                                        value={formData.brand}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        placeholder="e.g., Dell"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Model Name / Number</label>
                                    <input
                                        type="text"
                                        name="model"
                                        value={formData.model}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        placeholder="e.g., OptiPlex 7090"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Dealer (from Dealer Master)</label>
                                    <select
                                        name="dealer_id"
                                        value={formData.dealer_id}
                                        onChange={(e) => {
                                            const sId = e.target.value;
                                            const dObj = dealers.find(d => String(d.id) === String(sId));
                                            setFormData(prev => ({
                                                ...prev,
                                                dealer_id: sId,
                                                dealer_name: dObj ? dObj.name : ''
                                            }));
                                        }}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="">Select Dealer</option>
                                        {dealers.map(dealer => (
                                            <option key={dealer.id} value={dealer.id}>
                                                {dealer.name} {dealer.city ? `(${dealer.city})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Status</label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="available">Available</option>
                                        <option value="in_use">In Use</option>
                                        <option value="maintenance">Under Maintenance</option>
                                        <option value="broken">Out of Order</option>
                                        <option value="retired">Retired</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Condition</label>
                                    <select
                                        name="condition_status"
                                        value={formData.condition_status}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="excellent">Excellent</option>
                                        <option value="good">Good</option>
                                        <option value="fair">Fair</option>
                                        <option value="poor">Poor</option>
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="2"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                        placeholder="Equipment description"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Configuration Section (Separate Granular Fields) */}
                        <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-purple-50/70 p-6 rounded-xl border border-blue-200">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                    <span className="p-1.5 rounded-lg bg-blue-600 text-white shadow-2xs">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                        </svg>
                                    </span>
                                    <span>Hardware Configuration</span>
                                </h3>
                                <span className="text-xs text-blue-700 font-semibold bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200">
                                    Hardware Specs
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mb-4">
                                Update separate hardware fields: RAM, storage, processor, and GPU.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Processor Model</label>
                                    <input
                                        type="text"
                                        name="processor"
                                        value={formData.processor}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., Intel Core i7-12700 / AMD Ryzen 7"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Processor Generation</label>
                                    <input
                                        type="text"
                                        name="generation"
                                        value={formData.generation}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., 12th Gen, 13th Gen, Zen 4"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Operating System</label>
                                    <select
                                        name="operating_system"
                                        value={formData.operating_system}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select OS</option>
                                        <option value="Windows 11 Pro">Windows 11 Pro</option>
                                        <option value="Windows 10 Pro">Windows 10 Pro</option>
                                        <option value="Ubuntu Linux 24.04">Ubuntu Linux</option>
                                        <option value="Red Hat Enterprise Linux">RHEL</option>
                                        <option value="macOS Sonoma">macOS</option>
                                        <option value="Other / Embedded">Other / Embedded</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">RAM Capacity</label>
                                    <input
                                        type="text"
                                        name="ram"
                                        value={formData.ram}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., 16 GB, 32 GB"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">RAM Type</label>
                                    <select
                                        name="ram_type"
                                        value={formData.ram_type}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select RAM Type</option>
                                        <option value="DDR5">DDR5</option>
                                        <option value="DDR4">DDR4</option>
                                        <option value="DDR3">DDR3</option>
                                        <option value="LPDDR5">LPDDR5</option>
                                        <option value="ECC DDR4">ECC DDR4 Server</option>
                                        <option value="ECC DDR5">ECC DDR5 Server</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Storage Capacity</label>
                                    <input
                                        type="text"
                                        name="hard_disk"
                                        value={formData.hard_disk}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., 512 GB, 1 TB"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Storage Type (SSD/HDD)</label>
                                    <select
                                        name="storage"
                                        value={formData.storage}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select Storage Type</option>
                                        <option value="NVMe PCIe 4.0 SSD">NVMe PCIe 4.0 SSD</option>
                                        <option value="NVMe PCIe 3.0 SSD">NVMe PCIe 3.0 SSD</option>
                                        <option value="SATA 2.5 SSD">SATA 2.5 SSD</option>
                                        <option value="SATA HDD (7200 RPM)">SATA HDD (7200 RPM)</option>
                                        <option value="SSD + HDD Hybrid">SSD + HDD Hybrid</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">GPU Model</label>
                                    <input
                                        type="text"
                                        name="gpu"
                                        value={formData.gpu}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="e.g., NVIDIA RTX 4060 / Integrated"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">GPU Memory</label>
                                    <select
                                        name="gpu_memory"
                                        value={formData.gpu_memory}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Select GPU Memory</option>
                                        <option value="Integrated Shared">Integrated / Shared</option>
                                        <option value="2 GB GDDR5">2 GB GDDR5</option>
                                        <option value="4 GB GDDR6">4 GB GDDR6</option>
                                        <option value="6 GB GDDR6">6 GB GDDR6</option>
                                        <option value="8 GB GDDR6">8 GB GDDR6</option>
                                        <option value="12 GB GDDR6X">12 GB GDDR6X</option>
                                        <option value="16 GB GDDR6X">16 GB GDDR6X</option>
                                        <option value="24 GB GDDR6X">24 GB GDDR6X</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Purchase & Stock Register Tracking Section */}
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                                <span className="p-1.5 rounded-lg bg-emerald-600 text-white mr-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </span>
                                Purchase & Stock Register Tracking
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Purchase Price (₹)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-500 font-bold">₹</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="purchase_price"
                                            value={formData.purchase_price}
                                            onChange={handleChange}
                                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Current Value (₹)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2.5 text-gray-500 font-bold">₹</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            name="current_value"
                                            value={formData.current_value}
                                            onChange={handleChange}
                                            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Purchase Date</label>
                                    <input
                                        type="date"
                                        name="purchase_date"
                                        value={formData.purchase_date}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Warranty Expiry</label>
                                    <input
                                        type="date"
                                        name="warranty_expiry"
                                        value={formData.warranty_expiry}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Stock Book / Register Ref No</label>
                                    <input
                                        type="text"
                                        name="stock_register_page"
                                        value={formData.stock_register_page}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                        placeholder="e.g., Vol 2 / Page 45 / Item 12"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Indent Number / Ref</label>
                                    <input
                                        type="text"
                                        name="indent_number"
                                        value={formData.indent_number}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                        placeholder="e.g., IND-2026-089"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 text-sm font-medium mb-1">Indent Date</label>
                                    <input
                                        type="date"
                                        name="indent_date"
                                        value={formData.indent_date}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium shadow-sm transition-colors flex items-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        <span>Updating...</span>
                                    </>
                                ) : (
                                    <span>Update Equipment</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

// Main Equipment Inventory Component - Enhanced UI
export default function EquipmentInventory() {
    const { isAuthenticated, user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()

    // All existing state and functions remain the same...
    const [equipment, setEquipment] = useState([])
    const [labs, setLabs] = useState([])
    const [dealers, setDealers] = useState([])
    const [departments, setDepartments] = useState([])
    const [stats, setStats] = useState({
        total: 0,
        available: 0,
        inUse: 0,
        maintenance: 0,
        broken: 0
    })
    const [filters, setFilters] = useState({
        search: '',
        statuses: [],
        categories: [],
        lab_ids: [],
        brands: [],
        conditions: [],
        dealer_ids: [],
        departments: [],
        generations: []
    })
    const [selectedEquipmentIds, setSelectedEquipmentIds] = useState([])
    const [isFilterPanelExpanded, setIsFilterPanelExpanded] = useState(true)
    const [viewMode, setViewMode] = useState(() => {
        try {
            const saved = localStorage.getItem('equipment_view_mode')
            if (saved === 'table' || saved === 'card' || saved === 'grid') {
                return saved === 'grid' ? 'card' : saved
            }
        } catch (e) {
            // ignore
        }
        return 'card'
    }) // 'card' | 'table'

    const handleViewModeChange = (mode) => {
        setViewMode(mode)
        try {
            localStorage.setItem('equipment_view_mode', mode)
        } catch (e) {
            // ignore
        }
    }

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(12) // 12 items fits 3 rows of 4 cards perfectly

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1)
    }, [filters])

    // Paginated equipment list
    const paginatedEquipment = useMemo(() => {
        const start = (currentPage - 1) * pageSize
        return equipment.slice(start, start + pageSize)
    }, [equipment, currentPage, pageSize])

    const [batchStatusModalOpen, setBatchStatusModalOpen] = useState(false)
    const [batchSelectedStatus, setBatchSelectedStatus] = useState('available')
    const [batchLoading, setBatchLoading] = useState(false)
    const [toastMessage, setToastMessage] = useState(null)

    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [showAddForm, setShowAddForm] = useState(false)
    const [showImportModal, setShowImportModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [editingEquipment, setEditingEquipment] = useState(null)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [showNotifications, setShowNotifications] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
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
    const canCreateEquipment = isMasterAdmin || isAdmin || Boolean(permissions?.equipment?.can_create)
    const canEditEquipment = isMasterAdmin || isAdmin || Boolean(permissions?.equipment?.can_edit)
    const canDeleteEquipment = isMasterAdmin || isAdmin || Boolean(permissions?.equipment?.can_delete)
    const canExportEquipment = isMasterAdmin || isAdmin || Boolean(permissions?.equipment?.can_export)

    const API_BASE_URL = '/api'

    const showToast = (message, type = 'success') => {
        setToastMessage({ message, type })
        setTimeout(() => setToastMessage(null), 4000)
    }

    // Professional status options with visual badges & indicators
    const statusOptions = [
        { value: 'available', label: 'Available', dot: 'bg-emerald-500', badge: 'bg-emerald-100 text-emerald-800 border border-emerald-200' },
        { value: 'in_use', label: 'In Use', dot: 'bg-orange-500', badge: 'bg-orange-100 text-orange-800 border border-orange-200' },
        { value: 'maintenance', label: 'Maintenance', dot: 'bg-red-500', badge: 'bg-red-100 text-red-800 border border-red-200' },
        { value: 'broken', label: 'Out of Order', dot: 'bg-gray-500', badge: 'bg-gray-100 text-gray-800 border border-gray-200' },
        { value: 'retired', label: 'Retired', dot: 'bg-purple-500', badge: 'bg-purple-100 text-purple-800 border border-purple-200' }
    ]

    // Professional categories for filtering
    const categoryOptions = [
        { value: 'computer', label: 'Computer & IT', color: 'bg-blue-100 text-blue-800', icon: '💻' },
        { value: 'projector', label: 'Projectors', color: 'bg-purple-100 text-purple-800', icon: '📽️' },
        { value: 'printer', label: 'Printers', color: 'bg-green-100 text-green-800', icon: '🖨️' },
        { value: 'microscope', label: 'Microscopes', color: 'bg-indigo-100 text-indigo-800', icon: '🔬' },
        { value: 'lab_equipment', label: 'Lab Equipment', color: 'bg-emerald-100 text-emerald-800', icon: '🧪' },
        { value: 'network', label: 'Network', color: 'bg-orange-100 text-orange-800', icon: '🌐' }
    ]

    // Condition options
    const conditionOptions = [
        { value: 'excellent', label: 'Excellent', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
        { value: 'good', label: 'Good', color: 'bg-blue-50 text-blue-700 border-blue-200' },
        { value: 'fair', label: 'Fair', color: 'bg-amber-50 text-amber-700 border-amber-200' },
        { value: 'poor', label: 'Poor', color: 'bg-red-50 text-red-700 border-red-200' }
    ]

    // Dynamic brand detection from equipment list
    const detectedBrands = Array.from(new Set(
        equipment
            .map(item => item.brand || item.manufacturer)
            .filter(Boolean)
            .map(b => b.trim())
    )).slice(0, 10)
    const brandOptions = detectedBrands.length > 0 ? detectedBrands : ['Dell', 'HP', 'Lenovo', 'Cisco', 'Apple', 'Epson']

    // Dynamic generation detection from equipment list
    const detectedGenerations = Array.from(new Set(
        equipment
            .map(item => item.generation)
            .filter(Boolean)
            .map(g => g.trim())
    )).slice(0, 10)
    const generationOptions = detectedGenerations.length > 0 ? detectedGenerations : ['12th Gen', '13th Gen', '14th Gen', 'Zen 4', 'M3']

    // Smart Search Options Groups for unified search bar dropdown
    const smartSearchGroups = [
        {
            id: 'statuses',
            title: 'Status',
            options: statusOptions.map(opt => ({
                id: opt.value,
                label: opt.label,
                count: equipment.filter(e => e.status === opt.value).length,
                badge: opt.badge
            }))
        },
        {
            id: 'categories',
            title: 'Category',
            options: categoryOptions.map(opt => ({
                id: opt.value,
                label: opt.label,
                icon: opt.icon,
                count: equipment.filter(e => e.category === opt.value).length
            }))
        },
        {
            id: 'lab_ids',
            title: 'Laboratory',
            options: labs.map(lab => ({
                id: String(lab.id),
                label: lab.name,
                count: equipment.filter(e => String(e.lab_id) === String(lab.id)).length
            }))
        },
        {
            id: 'dealer_ids',
            title: 'Dealer',
            options: dealers.map(dealer => ({
                id: String(dealer.id),
                label: dealer.name,
                count: equipment.filter(e => String(e.dealer_id) === String(dealer.id)).length
            }))
        },
        {
            id: 'departments',
            title: 'Department',
            options: departments.map(dept => ({
                id: dept.name,
                label: dept.name,
                count: equipment.filter(e => (e.lab?.department === dept.name || e.lab?.Department?.name === dept.name)).length
            }))
        },
        {
            id: 'brands',
            title: 'Brand',
            options: brandOptions.map(b => ({
                id: b,
                label: b,
                count: equipment.filter(e => (e.brand || e.manufacturer) === b).length
            }))
        },
        {
            id: 'generations',
            title: 'Processor Generation',
            options: generationOptions.map(gen => ({
                id: gen,
                label: gen,
                count: equipment.filter(e => e.generation === gen).length
            }))
        },
        {
            id: 'conditions',
            title: 'Condition',
            options: conditionOptions.map(opt => ({
                id: opt.value,
                label: opt.label,
                count: equipment.filter(e => e.condition_status === opt.value).length
            }))
        }
    ]

    // Helper functions for multi-select checkbox filters
    const toggleCheckboxFilter = (key, value) => {
        setFilters(prev => {
            const list = prev[key] || []
            const exists = list.includes(value)
            const next = exists ? list.filter(v => v !== value) : [...list, value]
            return { ...prev, [key]: next }
        })
    }

    const selectAllFilterGroup = (key, allValues) => {
        setFilters(prev => ({ ...prev, [key]: allValues }))
    }

    const clearFilterGroup = (key) => {
        setFilters(prev => ({ ...prev, [key]: [] }))
    }

    const clearAllFilters = () => {
        setFilters({
            search: '',
            statuses: [],
            categories: [],
            lab_ids: [],
            brands: [],
            conditions: [],
            dealer_ids: [],
            departments: [],
            generations: []
        })
    }

    // Record multi-selection helpers
    const isAllSelected = equipment.length > 0 && selectedEquipmentIds.length === equipment.length
    const isSomeSelected = selectedEquipmentIds.length > 0 && selectedEquipmentIds.length < equipment.length

    const handleSelectAllRecords = () => {
        if (isAllSelected) {
            setSelectedEquipmentIds([])
        } else {
            setSelectedEquipmentIds(equipment.map(e => e.id))
        }
    }

    const handleToggleRecord = (id) => {
        setSelectedEquipmentIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        )
    }

    // Active filters count
    const activeFilterCount =
        (filters.statuses?.length || 0) +
        (filters.categories?.length || 0) +
        (filters.lab_ids?.length || 0) +
        (filters.dealer_ids?.length || 0) +
        (filters.departments?.length || 0) +
        (filters.brands?.length || 0) +
        (filters.generations?.length || 0) +
        (filters.conditions?.length || 0) +
        (filters.search ? 1 : 0)

    // All existing useEffect and function implementations remain the same...
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
                if (showAddForm) {
                    setShowAddForm(false)
                } else if (showEditModal) {
                    setShowEditModal(false)
                    setEditingEquipment(null)
                } else if (showImportModal) {
                    setShowImportModal(false)
                } else if (batchStatusModalOpen) {
                    setBatchStatusModalOpen(false)
                } else if (showUserMenu) {
                    setShowUserMenu(false)
                } else if (showNotifications) {
                    setShowNotifications(false)
                } else if (selectedEquipmentIds.length > 0) {
                    setSelectedEquipmentIds([])
                } else if (activeFilterCount > 0) {
                    clearAllFilters()
                } else {
                    navigate(-1)
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [showAddForm, showEditModal, showImportModal, batchStatusModalOpen, showUserMenu, showNotifications, selectedEquipmentIds, activeFilterCount, navigate])

    useEffect(() => {
        document.title = 'Equipment Inventory | LabMS'
        
        // Check if we need to open edit modal from navigation state
        if (location.state?.shouldOpenEditModal && location.state?.editEquipment) {
            setEditingEquipment(location.state.editEquipment)
            setShowEditModal(true)
            // Clear the navigation state
            navigate('/equipment', { replace: true })
        }
    }, [location.state, navigate])

    useEffect(() => {
        // Set document title
        document.title = 'Equipment | NEC LabMS'
        
        const fetchData = async () => {
            if (!isAuthenticated) {
                navigate('/login')
                return
            }

            try {
                setLoading(true)
                setError('')

                const headers = {
                    'Content-Type': 'application/json'
                }

                const queryParams = new URLSearchParams()
                if (filters.search) queryParams.append('search', filters.search)
                if (filters.statuses?.length > 0) queryParams.append('status', filters.statuses.join(','))
                if (filters.categories?.length > 0) queryParams.append('category', filters.categories.join(','))
                if (filters.lab_ids?.length > 0) queryParams.append('lab_id', filters.lab_ids.join(','))
                if (filters.dealer_ids?.length > 0) queryParams.append('dealer_id', filters.dealer_ids.join(','))
                if (filters.departments?.length > 0) queryParams.append('department', filters.departments.join(','))
                if (filters.brands?.length > 0) queryParams.append('brand', filters.brands.join(','))
                if (filters.generations?.length > 0) queryParams.append('generation', filters.generations.join(','))
                if (filters.conditions?.length > 0) queryParams.append('condition_status', filters.conditions.join(','))
                
                // Add limit to get all equipment items (default backend limit is 50)
                queryParams.append('limit', '1000')

                // Fetch metadata in parallel
                const [labsRes, dealersRes, deptsRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/labs`, { credentials: 'include', headers }).catch(() => null),
                    fetch(`${API_BASE_URL}/dealers`, { credentials: 'include', headers }).catch(() => null),
                    fetch(`${API_BASE_URL}/departments`, { credentials: 'include', headers }).catch(() => null)
                ])

                if (labsRes && labsRes.ok) {
                    const labsData = await labsRes.json()
                    setLabs(labsData.data?.labs || [])
                }
                if (dealersRes && dealersRes.ok) {
                    const dealersData = await dealersRes.json()
                    setDealers(dealersData.data || [])
                }
                if (deptsRes && deptsRes.ok) {
                    const deptsData = await deptsRes.json()
                    setDepartments(deptsData.data?.departments || [])
                }

                const equipmentResponse = await fetch(`${API_BASE_URL}/equipment?${queryParams}`, { credentials: 'include', headers })
                if (equipmentResponse.ok) {
                    const equipmentData = await equipmentResponse.json()
                    setEquipment(equipmentData.data?.equipment || [])

                    const equipmentList = equipmentData.data?.equipment || []
                    const calculatedStats = {
                        total: equipmentList.length,
                        available: equipmentList.filter(item => item.status === 'available').length,
                        inUse: equipmentList.filter(item => item.status === 'in_use').length,
                        maintenance: equipmentList.filter(item => item.status === 'maintenance').length,
                        broken: equipmentList.filter(item => item.status === 'broken').length
                    }
                    setStats(calculatedStats)
                } else {
                    const errorText = await equipmentResponse.text()
                    console.error('Equipment fetch error:', errorText)
                    setError('Failed to load equipment data')
                }

            } catch (error) {
                console.error('Error fetching data:', error)
                setError('Failed to load data. Please check your connection.')
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [filters, isAuthenticated, navigate])

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const reloadEquipment = async () => {
        try {
            setLoading(true)
            const headers = {
                'Content-Type': 'application/json'
            }

            const queryParams = new URLSearchParams()
            if (filters.search) queryParams.append('search', filters.search)
            if (filters.statuses?.length > 0) queryParams.append('status', filters.statuses.join(','))
            if (filters.categories?.length > 0) queryParams.append('category', filters.categories.join(','))
            if (filters.lab_ids?.length > 0) queryParams.append('lab_id', filters.lab_ids.join(','))
            if (filters.dealer_ids?.length > 0) queryParams.append('dealer_id', filters.dealer_ids.join(','))
            if (filters.departments?.length > 0) queryParams.append('department', filters.departments.join(','))
            if (filters.brands?.length > 0) queryParams.append('brand', filters.brands.join(','))
            if (filters.generations?.length > 0) queryParams.append('generation', filters.generations.join(','))
            if (filters.conditions?.length > 0) queryParams.append('condition_status', filters.conditions.join(','))
            queryParams.append('limit', '1000')

            const equipmentResponse = await fetch(`${API_BASE_URL}/equipment?${queryParams}`, { credentials: 'include', headers })
            if (equipmentResponse.ok) {
                const equipmentData = await equipmentResponse.json()
                setEquipment(equipmentData.data?.equipment || [])

                const equipmentList = equipmentData.data?.equipment || []
                const calculatedStats = {
                    total: equipmentList.length,
                    available: equipmentList.filter(item => item.status === 'available').length,
                    inUse: equipmentList.filter(item => item.status === 'in_use').length,
                    maintenance: equipmentList.filter(item => item.status === 'maintenance').length,
                    broken: equipmentList.filter(item => item.status === 'broken').length
                }
                setStats(calculatedStats)
            }
        } catch (error) {
            console.error('Error reloading equipment:', error)
        } finally {
            setLoading(false)
        }
    }

    // Batch operations
    const handleBatchStatusSubmit = async (targetStatus) => {
        if (selectedEquipmentIds.length === 0) return
        try {
            setBatchLoading(true)
            const res = await fetch(`${API_BASE_URL}/equipment/batch-status`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedEquipmentIds, status: targetStatus })
            })
            const data = await res.json()
            if (data.success) {
                setEquipment(prev => prev.map(e => selectedEquipmentIds.includes(e.id) ? { ...e, status: targetStatus } : e))
                setStats(prev => {
                    const updated = equipment.map(e => selectedEquipmentIds.includes(e.id) ? { ...e, status: targetStatus } : e)
                    return {
                        total: updated.length,
                        available: updated.filter(item => item.status === 'available').length,
                        inUse: updated.filter(item => item.status === 'in_use').length,
                        maintenance: updated.filter(item => item.status === 'maintenance').length,
                        broken: updated.filter(item => item.status === 'broken').length
                    }
                })
                showToast(`Updated status to '${targetStatus.replace('_', ' ')}' for ${selectedEquipmentIds.length} item(s)`)
                setSelectedEquipmentIds([])
                setBatchStatusModalOpen(false)
            } else {
                showToast(data.message || 'Failed to update equipment status', 'error')
            }
        } catch (err) {
            console.error('Batch status error:', err)
            showToast('Network error while updating equipment', 'error')
        } finally {
            setBatchLoading(false)
        }
    }

    const handleBatchDelete = async () => {
        if (selectedEquipmentIds.length === 0) return
        const count = selectedEquipmentIds.length
        if (!window.confirm(`⚠️ WARNING: Are you sure you want to delete ${count} selected equipment item(s)?\n\nThis action cannot be undone.`)) {
            return
        }
        try {
            setBatchLoading(true)
            const res = await fetch(`${API_BASE_URL}/equipment/batch-delete`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: selectedEquipmentIds })
            })
            const data = await res.json()
            if (data.success) {
                const remaining = equipment.filter(e => !selectedEquipmentIds.includes(e.id))
                setEquipment(remaining)
                setStats({
                    total: remaining.length,
                    available: remaining.filter(item => item.status === 'available').length,
                    inUse: remaining.filter(item => item.status === 'in_use').length,
                    maintenance: remaining.filter(item => item.status === 'maintenance').length,
                    broken: remaining.filter(item => item.status === 'broken').length
                })
                showToast(`Successfully deleted ${count} equipment item(s)`)
                setSelectedEquipmentIds([])
            } else {
                showToast(data.message || 'Failed to delete selected equipment', 'error')
            }
        } catch (err) {
            console.error('Batch delete error:', err)
            showToast('Network error while deleting equipment', 'error')
        } finally {
            setBatchLoading(false)
        }
    }

    const handleExportCSV = (onlySelected = false) => {
        const itemsToExport = onlySelected
            ? equipment.filter(e => selectedEquipmentIds.includes(e.id))
            : equipment

        if (itemsToExport.length === 0) {
            showToast('No items to export', 'error')
            return
        }

        const headers = ['ID', 'Name', 'Category', 'Status', 'Condition', 'Lab', 'Model', 'Brand', 'Serial Number', 'Dealer', 'Purchase Date', 'Purchase Price']
        const csvRows = [headers.join(',')]

        itemsToExport.forEach(item => {
            const row = [
                item.id,
                `"${(item.name || '').replace(/"/g, '""')}"`,
                `"${(item.category || '').replace(/"/g, '""')}"`,
                `"${(item.status || '').replace(/"/g, '""')}"`,
                `"${(item.condition_status || '').replace(/"/g, '""')}"`,
                `"${(item.lab?.name || '').replace(/"/g, '""')}"`,
                `"${(item.model || '').replace(/"/g, '""')}"`,
                `"${(item.brand || item.manufacturer || '').replace(/"/g, '""')}"`,
                `"${(item.serial_number || '').replace(/"/g, '""')}"`,
                `"${(item.dealer?.name || item.dealer_name || '').replace(/"/g, '""')}"`,
                `"${item.purchase_date || ''}"`,
                item.purchase_price || 0
            ]
            csvRows.push(row.join(','))
        })

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.setAttribute('href', url)
        link.setAttribute('download', `equipment_inventory_${new Date().toISOString().slice(0, 10)}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        showToast(`Exported ${itemsToExport.length} equipment item(s) to CSV`)
    }

    const handleStatusUpdate = async (equipmentId, newStatus) => {
        try {
            const headers = {
                'Content-Type': 'application/json'
            }

            const response = await fetch(`${API_BASE_URL}/equipment/${equipmentId}`, {
                method: 'PUT',
                credentials: 'include',
                headers,
                body: JSON.stringify({ status: newStatus })
            })

            if (response.ok) {
                setEquipment(prev => prev.map(item =>
                    item.id === equipmentId ? { ...item, status: newStatus } : item
                ))

                const updatedEquipment = equipment.map(item =>
                    item.id === equipmentId ? { ...item, status: newStatus } : item
                )
                const newStats = {
                    total: updatedEquipment.length,
                    available: updatedEquipment.filter(item => item.status === 'available').length,
                    inUse: updatedEquipment.filter(item => item.status === 'in_use').length,
                    maintenance: updatedEquipment.filter(item => item.status === 'maintenance').length,
                    broken: updatedEquipment.filter(item => item.status === 'broken').length
                }
                setStats(newStats)
            } else {
                const result = await response.json()
                setError(result.message || 'Failed to update equipment status')
            }
        } catch (error) {
            console.error('Error updating equipment:', error)
            setError('Failed to update equipment status')
        }
    }

    const handleDelete = async (equipmentId, equipmentName = 'this equipment') => {
        if (window.confirm(`Are you sure you want to delete ${equipmentName}? This will remove the asset from inventory.`)) {
            try {
                const headers = {
                    'Content-Type': 'application/json'
                }

                const response = await fetch(`${API_BASE_URL}/equipment/${equipmentId}`, {
                    method: 'DELETE',
                    credentials: 'include',
                    headers
                })

                if (response.ok) {
                    setEquipment(prev => prev.filter(item => item.id !== equipmentId))
                    const updatedEquipment = equipment.filter(item => item.id !== equipmentId)
                    const newStats = {
                        total: updatedEquipment.length,
                        available: updatedEquipment.filter(item => item.status === 'available').length,
                        inUse: updatedEquipment.filter(item => item.status === 'in_use').length,
                        maintenance: updatedEquipment.filter(item => item.status === 'maintenance').length,
                        broken: updatedEquipment.filter(item => item.status === 'broken').length
                    }
                    setStats(newStats)
                } else {
                    const result = await response.json()
                    setError(result.message || 'Failed to delete equipment')
                }
            } catch (error) {
                console.error('Error deleting equipment:', error)
                setError('Failed to delete equipment')
            }
        }
    }

    const handleBulkDeleteByLab = async () => {
        if (!filters.lab_id) {
            setError('Please select a lab first to perform bulk delete')
            return
        }

        const selectedLab = labs.find(lab => lab.id === parseInt(filters.lab_id))
        const labName = selectedLab?.name || 'this lab'
        const equipmentInLab = equipment.filter(item => item.lab_id === parseInt(filters.lab_id))

        if (equipmentInLab.length === 0) {
            setError('No equipment found in the selected lab')
            return
        }

        const confirmMessage = `⚠️ WARNING: This will delete ALL ${equipmentInLab.length} equipment items from "${labName}".\n\nThis action cannot be undone. Are you absolutely sure?`
        
        if (window.confirm(confirmMessage)) {
            try {
                setLoading(true)
                const headers = {
                    'Content-Type': 'application/json'
                }

                const response = await fetch(`${API_BASE_URL}/equipment/lab/${filters.lab_id}/bulk`, {
                    method: 'DELETE',
                    credentials: 'include',
                    headers
                })

                if (response.ok) {
                    const result = await response.json()
                    // Refresh equipment list
                    setEquipment(prev => prev.filter(item => item.lab_id !== parseInt(filters.lab_id)))
                    const updatedEquipment = equipment.filter(item => item.lab_id !== parseInt(filters.lab_id))
                    const newStats = {
                        total: updatedEquipment.length,
                        available: updatedEquipment.filter(item => item.status === 'available').length,
                        inUse: updatedEquipment.filter(item => item.status === 'in_use').length,
                        maintenance: updatedEquipment.filter(item => item.status === 'maintenance').length,
                        broken: updatedEquipment.filter(item => item.status === 'broken').length
                    }
                    setStats(newStats)
                    alert(`✅ ${result.message}`)
                    // Clear lab filter
                    setFilters(prev => ({ ...prev, lab_id: '' }))
                } else {
                    const result = await response.json()
                    setError(result.message || 'Failed to delete equipment')
                }
            } catch (error) {
                console.error('Error bulk deleting equipment:', error)
                setError('Failed to delete equipment')
            } finally {
                setLoading(false)
            }
        }
    }

    const handleEquipmentAdded = (newEquipment) => {
        if (newEquipment) {
            setEquipment(prev => [newEquipment, ...prev])
        }
        reloadEquipment()
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'available': return 'bg-green-100 text-green-800 border border-green-200'
            case 'in_use': return 'bg-orange-100 text-orange-800 border border-orange-200'
            case 'maintenance': return 'bg-red-100 text-red-800 border border-red-200'
            case 'broken': return 'bg-gray-100 text-gray-800 border border-gray-200'
            case 'retired': return 'bg-purple-100 text-purple-800 border border-purple-200'
            default: return 'bg-gray-100 text-gray-800 border border-gray-200'
        }
    }

    const getCategoryInfo = (category) => {
        const categoryInfo = categoryOptions.find(cat => cat.value === category)
        return categoryInfo || { label: 'Other', color: 'bg-gray-100 text-gray-800' }
    }

    if (loading) {
        return (
            <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-200"></div>
                        <div className="animate-spin rounded-full h-20 w-20 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
                    </div>
                    <p className="text-gray-600 mt-6 font-medium text-lg">Loading equipment inventory...</p>
                    <div className="mt-2 text-sm text-gray-500">Please wait while we fetch your data</div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
            {/* Shared Sidebar Component */}
            <Sidebar 
                sidebarCollapsed={sidebarCollapsed}
                setSidebarCollapsed={setSidebarCollapsed}
                currentPath="/equipment"
                stats={stats}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            {/* Main Content */}
            <div className={`flex-1 min-w-0 transition-all duration-300 overflow-x-hidden ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
                {/* Shared Header Component */}
                <AppHeader 
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    showUserMenu={showUserMenu}
                    setShowUserMenu={setShowUserMenu}
                    showNotifications={showNotifications}
                    setShowNotifications={setShowNotifications}
                    onToggleMobileMenu={() => setMobileOpen(!mobileOpen)}
                />

                {/* Enhanced Main Content */}
                <main className="p-4 sm:p-6 min-w-0 max-w-full">
                    {/* Enhanced Page Header */}
                    <div className="mb-8">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                    Equipment Inventory
                                </h1>
                                <p className="mt-2 text-gray-600 text-sm sm:text-base">
                                    Manage and track all laboratory equipment and assets with detailed specifications.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                {canDeleteEquipment && filters.lab_id && (
                                    <button
                                        onClick={handleBulkDeleteByLab}
                                        className="px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all shadow-md hover:shadow-lg flex items-center space-x-2 font-medium"
                                        title="Delete all equipment from selected lab"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                        </svg>
                                        <span>Delete All from Lab</span>
                                    </button>
                                )}
                                {(isAdmin || canCreateEquipment) && (
                                    <button
                                        onClick={() => navigate('/equipment-categories')}
                                        className="px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm hover:shadow-md flex items-center space-x-2 font-medium"
                                        title="Manage Equipment Categories"
                                    >
                                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                                        </svg>
                                        <span>Category Master</span>
                                    </button>
                                )}
                                {(isAdmin || canCreateEquipment) && (
                                    <button
                                        onClick={() => navigate('/dealers')}
                                        className="px-4 py-2.5 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm hover:shadow-md flex items-center space-x-2 font-medium"
                                        title="Manage Dealers and Vendors"
                                    >
                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                        </svg>
                                        <span>Dealer Master</span>
                                    </button>
                                )}
                                {canCreateEquipment && (
                                    <button
                                        onClick={() => setShowImportModal(true)}
                                        className="px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg flex items-center space-x-2 font-medium"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path>
                                        </svg>
                                        <span>Import Excel</span>
                                    </button>
                                )}
                                {canCreateEquipment && (
                                    <button
                                        onClick={() => setShowAddForm(true)}
                                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2 font-medium cursor-pointer"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                        </svg>
                                        <span>Add Equipment</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-r-xl p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-red-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                                    </svg>
                                    <span className="text-red-700 font-medium">{error}</span>
                                </div>
                                <button
                                    onClick={() => setError('')}
                                    className="text-red-500 hover:text-red-700 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Enhanced Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Total Equipment</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
                                    <p className="text-xs text-gray-500 mt-1">All categories</p>
                                </div>
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Available</p>
                                    <p className="text-3xl font-bold text-green-600 mt-1">{stats.available}</p>
                                    <p className="text-xs text-gray-500 mt-1">Ready to use</p>
                                </div>
                                <div className="p-3 bg-green-100 rounded-xl">
                                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">In Use</p>
                                    <p className="text-3xl font-bold text-orange-600 mt-1">{stats.inUse}</p>
                                    <p className="text-xs text-gray-500 mt-1">Currently occupied</p>
                                </div>
                                <div className="p-3 bg-orange-100 rounded-xl">
                                    <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Maintenance</p>
                                    <p className="text-3xl font-bold text-red-600 mt-1">{stats.maintenance}</p>
                                    <p className="text-xs text-gray-500 mt-1">Under repair</p>
                                </div>
                                <div className="p-3 bg-red-100 rounded-xl">
                                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Out of Order</p>
                                    <p className="text-3xl font-bold text-gray-600 mt-1">{stats.broken}</p>
                                    <p className="text-xs text-gray-500 mt-1">Needs attention</p>
                                </div>
                                <div className="p-3 bg-gray-100 rounded-xl">
                                    <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Toast Notification */}
                    {toastMessage && (
                        <div className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-xl flex items-center space-x-3 text-sm font-semibold transition-all animate-bounce ${
                            toastMessage.type === 'error' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                        }`}>
                            <span>{toastMessage.message}</span>
                            <button onClick={() => setToastMessage(null)} className="opacity-80 hover:opacity-100">✕</button>
                        </div>
                    )}

                    {/* Search and Action Toolbar */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 p-4 sm:p-5">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            {/* Unified Smart Search Bar with Checkbox Options */}
                            <div className="flex-1 max-w-2xl">
                                <SmartSearchBar
                                    searchValue={filters.search}
                                    onSearchChange={(val) => handleFilterChange('search', val)}
                                    placeholder="Search by name, model, serial number, brand, dealer..."
                                    groups={smartSearchGroups}
                                    selectedOptions={{
                                        statuses: filters.statuses || [],
                                        categories: filters.categories || [],
                                        lab_ids: filters.lab_ids || [],
                                        dealer_ids: filters.dealer_ids || [],
                                        departments: filters.departments || [],
                                        brands: filters.brands || [],
                                        generations: filters.generations || [],
                                        conditions: filters.conditions || []
                                    }}
                                    onOptionToggle={(groupId, optionId) => toggleCheckboxFilter(groupId, optionId)}
                                    onGroupSelectAll={(groupId, allIds) => selectAllFilterGroup(groupId, allIds)}
                                    onGroupClear={(groupId) => clearFilterGroup(groupId)}
                                    onClearAll={clearAllFilters}
                                />
                            </div>

                            {/* Toolbar Action Controls: View Switcher (Card vs Table), Select All, Export CSV */}
                            <div className="flex items-center flex-wrap gap-2.5 self-start lg:self-center">
                                {/* Viewing Options: Card View vs Table View */}
                                <div className="inline-flex items-center p-1 bg-gray-100/90 rounded-xl border border-gray-200/90 shadow-2xs h-10">
                                    <button
                                        type="button"
                                        onClick={() => handleViewModeChange('card')}
                                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 h-8 ${
                                            viewMode === 'card' || viewMode === 'grid'
                                                ? 'bg-white text-blue-700 shadow-sm font-bold ring-1 ring-black/5'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                                        }`}
                                        title="Switch to Card View"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                        </svg>
                                        <span>Card View</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleViewModeChange('table')}
                                        className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 h-8 ${
                                            viewMode === 'table'
                                                ? 'bg-white text-blue-700 shadow-sm font-bold ring-1 ring-black/5'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
                                        }`}
                                        title="Switch to Table View"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18M3 18h18M3 6h18M3 6v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                                        </svg>
                                        <span>Table View</span>
                                    </button>
                                </div>

                                <div className="hidden sm:block h-6 w-px bg-gray-200 my-auto"></div>

                                {/* Select All Checkbox */}
                                <label className="inline-flex items-center space-x-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 cursor-pointer text-xs font-semibold text-gray-700 select-none transition-colors shadow-2xs h-10">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        ref={el => el && (el.indeterminate = isSomeSelected)}
                                        onChange={handleSelectAllRecords}
                                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                    />
                                    <span>
                                        {selectedEquipmentIds.length > 0 
                                            ? `Selected (${selectedEquipmentIds.length}/${equipment.length})`
                                            : `Select All (${equipment.length})`}
                                    </span>
                                </label>

                                {/* Export CSV */}
                                <button
                                    onClick={() => handleExportCSV(selectedEquipmentIds.length > 0)}
                                    className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 flex items-center space-x-1.5 transition-colors shadow-2xs h-10"
                                    title="Export to CSV"
                                >
                                    <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>{selectedEquipmentIds.length > 0 ? `Export (${selectedEquipmentIds.length})` : 'Export CSV'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Active Filter Chips Bar */}
                        {activeFilterCount > 0 && (
                            <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap items-center gap-2">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mr-1">Active Filters:</span>
                                {filters.search && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium">
                                        Search: "{filters.search}"
                                        <button type="button" onClick={() => handleFilterChange('search', '')} className="hover:text-blue-900 font-bold ml-0.5">×</button>
                                    </span>
                                )}
                                {filters.statuses?.map(st => (
                                    <span key={st} className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-medium">
                                        Status: {statusOptions.find(o => o.value === st)?.label || st}
                                        <button type="button" onClick={() => toggleCheckboxFilter('statuses', st)} className="hover:text-emerald-900 font-bold ml-0.5">×</button>
                                    </span>
                                ))}
                                {filters.categories?.map(cat => (
                                    <span key={cat} className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-full text-xs font-medium">
                                        Category: {categoryOptions.find(o => o.value === cat)?.label || cat}
                                        <button type="button" onClick={() => toggleCheckboxFilter('categories', cat)} className="hover:text-purple-900 font-bold ml-0.5">×</button>
                                    </span>
                                ))}
                                {filters.lab_ids?.map(lId => (
                                    <span key={lId} className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-medium">
                                        Lab: {labs.find(l => String(l.id) === String(lId))?.name || `Lab #${lId}`}
                                        <button type="button" onClick={() => toggleCheckboxFilter('lab_ids', lId)} className="hover:text-indigo-900 font-bold ml-0.5">×</button>
                                    </span>
                                ))}
                                {filters.dealer_ids?.map(dId => (
                                    <span key={dId} className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-medium">
                                        Dealer: {dealers.find(d => String(d.id) === String(dId))?.name || `Dealer #${dId}`}
                                        <button type="button" onClick={() => toggleCheckboxFilter('dealer_ids', dId)} className="hover:text-amber-900 font-bold ml-0.5">×</button>
                                    </span>
                                ))}
                                {filters.departments?.map(dept => (
                                    <span key={dept} className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-teal-700 border border-teal-200 rounded-full text-xs font-medium">
                                        Dept: {dept}
                                        <button type="button" onClick={() => toggleCheckboxFilter('departments', dept)} className="hover:text-teal-900 font-bold ml-0.5">×</button>
                                    </span>
                                ))}
                                {filters.brands?.map(br => (
                                    <span key={br} className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-700 border border-sky-200 rounded-full text-xs font-medium">
                                        Brand: {br}
                                        <button type="button" onClick={() => toggleCheckboxFilter('brands', br)} className="hover:text-sky-900 font-bold ml-0.5">×</button>
                                    </span>
                                ))}
                                {filters.generations?.map(gen => (
                                    <span key={gen} className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-50 text-violet-700 border border-violet-200 rounded-full text-xs font-medium">
                                        Gen: {gen}
                                        <button type="button" onClick={() => toggleCheckboxFilter('generations', gen)} className="hover:text-violet-900 font-bold ml-0.5">×</button>
                                    </span>
                                ))}
                                {filters.conditions?.map(cond => (
                                    <span key={cond} className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 border border-slate-300 rounded-full text-xs font-medium capitalize">
                                        Condition: {cond}
                                        <button type="button" onClick={() => toggleCheckboxFilter('conditions', cond)} className="hover:text-slate-900 font-bold ml-0.5">×</button>
                                    </span>
                                ))}
                                <button
                                    type="button"
                                    onClick={clearAllFilters}
                                    className="text-xs text-red-600 hover:text-red-800 font-bold underline ml-1 cursor-pointer"
                                >
                                    Clear All ({activeFilterCount})
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Floating / Sticky Batch Actions Bar (Visible when 1+ records are selected) */}
                    {selectedEquipmentIds.length > 0 && (
                        <div className="sticky top-4 z-40 mb-6 p-4 bg-gradient-to-r from-gray-900 to-indigo-950 text-white rounded-2xl shadow-2xl border border-indigo-700/50 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fadeIn">
                            <div className="flex items-center space-x-3">
                                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400 font-bold">
                                    ✓
                                </div>
                                <div>
                                    <span className="font-bold text-sm">
                                        {selectedEquipmentIds.length} {selectedEquipmentIds.length === 1 ? 'item' : 'items'} selected
                                    </span>
                                    <p className="text-[11px] text-gray-300">Choose a bulk operation to execute on selected records</p>
                                </div>
                            </div>

                            <div className="flex items-center flex-wrap gap-2.5">
                                {/* Batch Status Update */}
                                <button
                                    onClick={() => setBatchStatusModalOpen(true)}
                                    disabled={batchLoading}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span>Update Status</span>
                                </button>

                                {/* Batch Export CSV */}
                                <button
                                    onClick={() => handleExportCSV(true)}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>Export CSV</span>
                                </button>

                                {/* Batch Delete */}
                                {canDeleteEquipment && (
                                    <button
                                        onClick={handleBatchDelete}
                                        disabled={batchLoading}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center space-x-1.5"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        <span>Delete Selected</span>
                                    </button>
                                )}

                                {/* Deselect All */}
                                <button
                                    onClick={() => setSelectedEquipmentIds([])}
                                    className="px-3 py-2 bg-white/10 hover:bg-white/20 text-gray-200 rounded-xl text-xs font-semibold transition-colors"
                                >
                                    Deselect All
                                </button>
                            </div>
                        </div>
                    )}

                    {/* VIEW 1: Card View with Selection Checkboxes */}
                    {(viewMode === 'card' || viewMode === 'grid') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {paginatedEquipment.map((item) => {
                                const categoryInfo = getCategoryInfo(item.category)
                                const isSelected = selectedEquipmentIds.includes(item.id)
                                return (
                                    <div
                                        key={item.id}
                                        className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 overflow-hidden group relative flex flex-col justify-between ${
                                            isSelected 
                                                ? 'border-blue-500 ring-2 ring-blue-400 bg-blue-50/15 shadow-md' 
                                                : 'border-gray-200 hover:shadow-lg hover:border-gray-300'
                                        }`}
                                    >
                                        {/* Card Top Banner with Selection Checkbox & Category & Status */}
                                        <div className="p-5 pb-3">
                                            <div className="flex items-center justify-between mb-3 gap-2">
                                                {/* Record Checkbox */}
                                                <label className="flex items-center space-x-2 cursor-pointer select-none">
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleToggleRecord(item.id)}
                                                        className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                                        title="Select this record"
                                                    />
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryInfo.color}`}>
                                                        {categoryInfo.label}
                                                    </span>
                                                </label>

                                                {/* Status badge */}
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                                                    {item.status?.replace('_', ' ')}
                                                </span>
                                            </div>

                                            <h3 className="font-bold text-gray-900 mb-2 text-base group-hover:text-blue-600 transition-colors line-clamp-1" title={item.name}>
                                                {item.name}
                                            </h3>

                                            <div className="space-y-1.5 text-xs text-gray-600">
                                                <div className="flex items-center">
                                                    <span className="w-16 font-medium text-gray-400">Lab:</span>
                                                    <span className="flex-1 font-semibold text-gray-800 truncate">{item.lab?.name || 'Unassigned'}</span>
                                                </div>
                                                {item.model && (
                                                    <div className="flex items-center">
                                                        <span className="w-16 font-medium text-gray-400">Model:</span>
                                                        <span className="flex-1 truncate">{item.model}</span>
                                                    </div>
                                                )}
                                                {item.serial_number && (
                                                    <div className="flex items-center">
                                                        <span className="w-16 font-medium text-gray-400">S/N:</span>
                                                        <span className="flex-1 font-mono text-[11px] text-gray-700 truncate">{item.serial_number}</span>
                                                    </div>
                                                )}
                                                {(item.brand || item.manufacturer) && (
                                                    <div className="flex items-center">
                                                        <span className="w-16 font-medium text-gray-400">Brand:</span>
                                                        <span className="flex-1 truncate font-medium text-indigo-700">{item.brand || item.manufacturer}</span>
                                                    </div>
                                                )}
                                                {(item.dealer?.name || item.dealer_name) && (
                                                    <div className="flex items-center">
                                                        <span className="w-16 font-medium text-gray-400">Dealer:</span>
                                                        <span className="flex-1 truncate font-medium text-emerald-700">{item.dealer?.name || item.dealer_name}</span>
                                                    </div>
                                                )}
                                                {item.condition_status && (
                                                    <div className="flex items-center">
                                                        <span className="w-16 font-medium text-gray-400">Condition:</span>
                                                        <span className="capitalize px-1.5 py-0.2 rounded text-[10px] bg-gray-100 text-gray-700 font-medium">
                                                            {item.condition_status}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Equipment Card Actions */}
                                        <div className="px-5 pb-5 pt-3 border-t border-gray-100 bg-gray-50/50">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => navigate(`/equipment/${item.id}`)}
                                                    className="flex-1 bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center space-x-1 shadow-2xs"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    <span>View</span>
                                                </button>
                                                {canEditEquipment && (
                                                    <button
                                                        onClick={() => {
                                                            setEditingEquipment(item)
                                                            setShowEditModal(true)
                                                        }}
                                                        className="p-1.5 bg-white hover:bg-green-50 text-green-700 border border-green-200 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                                                        title="Edit Equipment"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                )}
                                                {canDeleteEquipment && (
                                                    <button
                                                        onClick={() => handleDelete(item.id, item.name || item.model || 'this equipment')}
                                                        className="p-1.5 bg-white hover:bg-red-50 text-red-700 border border-red-200 rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                                                        title="Delete Equipment"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>

                                            {/* Quick Status Toggle Button */}
                                            {item.status === 'available' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(item.id, 'in_use')}
                                                    className="w-full mt-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-colors"
                                                >
                                                    Mark as In Use
                                                </button>
                                            )}
                                            {item.status === 'in_use' && (
                                                <button
                                                    onClick={() => handleStatusUpdate(item.id, 'available')}
                                                    className="w-full mt-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-colors"
                                                >
                                                    Mark as Available
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* VIEW 2: Table View with Selection Checkboxes */}
                    {viewMode === 'table' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50/80 border-b border-gray-200 text-xs uppercase text-gray-500 font-bold tracking-wider">
                                        <tr>
                                            <th className="px-4 py-3.5 w-12 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isAllSelected}
                                                    ref={el => el && (el.indeterminate = isSomeSelected)}
                                                    onChange={handleSelectAllRecords}
                                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                                />
                                            </th>
                                            <th className="px-4 py-3.5">Equipment Name</th>
                                            <th className="px-4 py-3.5">Category</th>
                                            <th className="px-4 py-3.5">Assigned Lab</th>
                                            <th className="px-4 py-3.5">Brand / Model</th>
                                            <th className="px-4 py-3.5">Dealer</th>
                                            <th className="px-4 py-3.5">Serial Number</th>
                                            <th className="px-4 py-3.5 text-center">Condition</th>
                                            <th className="px-4 py-3.5 text-center">Status</th>
                                            <th className="px-4 py-3.5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 font-normal text-gray-700">
                                        {paginatedEquipment.map(item => {
                                            const isSelected = selectedEquipmentIds.includes(item.id)
                                            const catInfo = getCategoryInfo(item.category)
                                            return (
                                                <tr
                                                    key={item.id}
                                                    className={`hover:bg-blue-50/40 transition-colors ${
                                                        isSelected ? 'bg-blue-50/60' : ''
                                                    }`}
                                                >
                                                    {/* Checkbox Column */}
                                                    <td className="px-4 py-3.5 text-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleToggleRecord(item.id)}
                                                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                                        />
                                                    </td>

                                                    {/* Equipment Name */}
                                                    <td className="px-4 py-3.5">
                                                        <div className="font-bold text-gray-900 hover:text-blue-600 cursor-pointer" onClick={() => navigate(`/equipment/${item.id}`)}>
                                                            {item.name}
                                                        </div>
                                                        <div className="text-[11px] text-gray-400 font-mono">ID #{item.id}</div>
                                                    </td>

                                                    {/* Category */}
                                                    <td className="px-4 py-3.5">
                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${catInfo.color}`}>
                                                            {catInfo.label}
                                                        </span>
                                                    </td>

                                                    {/* Lab */}
                                                    <td className="px-4 py-3.5 font-medium text-gray-800">
                                                        {item.lab?.name || <span className="text-gray-400 italic">Unassigned</span>}
                                                    </td>

                                                    {/* Brand / Model */}
                                                    <td className="px-4 py-3.5 text-xs">
                                                        <div className="font-semibold text-gray-900">{item.brand || item.manufacturer || '—'}</div>
                                                        <div className="text-gray-500">{item.model || ''}</div>
                                                    </td>

                                                    {/* Dealer */}
                                                    <td className="px-4 py-3.5 text-xs">
                                                        <div className="font-semibold text-emerald-700">{item.dealer?.name || item.dealer_name || '—'}</div>
                                                        {item.dealer?.city && <div className="text-[11px] text-gray-400">{item.dealer.city}</div>}
                                                    </td>

                                                    {/* Serial Number */}
                                                    <td className="px-4 py-3.5 font-mono text-xs text-gray-700">
                                                        {item.serial_number || '—'}
                                                    </td>

                                                    {/* Condition */}
                                                    <td className="px-4 py-3.5 text-center">
                                                        <span className="capitalize px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700 font-medium">
                                                            {item.condition_status || 'Good'}
                                                        </span>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="px-4 py-3.5 text-center">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusColor(item.status)}`}>
                                                            {item.status?.replace('_', ' ')}
                                                        </span>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-4 py-3.5 text-right">
                                                        <div className="flex items-center justify-end space-x-1">
                                                            <button
                                                                onClick={() => navigate(`/equipment/${item.id}`)}
                                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="View Details"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                            </button>
                                                            {canEditEquipment && (
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingEquipment(item)
                                                                        setShowEditModal(true)
                                                                    }}
                                                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                    title="Edit"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                            {canDeleteEquipment && (
                                                                <button
                                                                    onClick={() => handleDelete(item.id, item.name || item.model || 'this equipment')}
                                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Pagination for Equipment Listings */}
                    {equipment.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalItems={equipment.length}
                            pageSize={pageSize}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={(newSize) => {
                                setPageSize(newSize)
                                setCurrentPage(1)
                            }}
                            pageSizeOptions={[8, 12, 24, 48]}
                            itemLabel="equipment items"
                            scrollToTop={true}
                        />
                    )}

                    {/* Enhanced No Results */}
                    {equipment.length === 0 && (
                        <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
                            <div className="w-32 h-32 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-3">No Equipment Found</h3>
                            <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                {labs.length === 0
                                    ? 'Please create a laboratory first before adding equipment'
                                    : 'Start building your equipment inventory by adding your first item'}
                            </p>
                            {canCreateEquipment && labs.length > 0 && (
                                <button
                                    onClick={() => setShowAddForm(true)}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-medium cursor-pointer"
                                >
                                    Add Your First Equipment
                                </button>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Card-Based 5-Step Equipment Creation Wizard */}
            {canCreateEquipment && (
                <EquipmentWizardModal
                    isOpen={showAddForm}
                    onClose={() => setShowAddForm(false)}
                    onEquipmentAdded={handleEquipmentAdded}
                />
            )}

            {/* Edit Equipment Modal */}
            <EditEquipmentModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false)
                    setEditingEquipment(null)
                }}
                equipment={editingEquipment}
                onEquipmentUpdated={(updatedEquipment) => {
                    // Update the equipment in the list
                    setEquipment(prev => 
                        prev.map(item => 
                            item.id === updatedEquipment.id ? updatedEquipment : item
                        )
                    )
                    setShowEditModal(false)
                    setEditingEquipment(null)
                }}
            />

            {/* Excel Import Modal */}
            {canCreateEquipment && (
                <ExcelImportModal
                    isOpen={showImportModal}
                    onClose={() => setShowImportModal(false)}
                    onImportComplete={() => {
                        setShowImportModal(false)
                        // Reload equipment list after import
                        reloadEquipment()
                    }}
                    labs={labs}
                />
            )}

            {/* Batch Status Update Modal */}
            {batchStatusModalOpen && (
                <div 
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
                    onClick={(e) => { if (e.target === e.currentTarget) setBatchStatusModalOpen(false); }}
                >
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 text-base">Batch Update Status</h3>
                                <p className="text-xs text-gray-500">Apply new status to {selectedEquipmentIds.length} selected item(s)</p>
                            </div>
                        </div>

                        <div className="space-y-2 mb-6">
                            {statusOptions.map(opt => (
                                <label
                                    key={opt.value}
                                    className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                        batchSelectedStatus === opt.value
                                            ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-semibold'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                    }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="radio"
                                            name="batchStatus"
                                            value={opt.value}
                                            checked={batchSelectedStatus === opt.value}
                                            onChange={(e) => setBatchSelectedStatus(e.target.value)}
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className={`w-2.5 h-2.5 rounded-full ${opt.dot}`}></span>
                                        <span className="text-sm">{opt.label}</span>
                                    </div>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${opt.badge}`}>
                                        {opt.value}
                                    </span>
                                </label>
                            ))}
                        </div>

                        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={() => setBatchStatusModalOpen(false)}
                                disabled={batchLoading}
                                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => handleBatchStatusSubmit(batchSelectedStatus)}
                                disabled={batchLoading}
                                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md disabled:opacity-50 flex items-center space-x-2"
                            >
                                {batchLoading ? (
                                    <>
                                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Updating...</span>
                                    </>
                                ) : (
                                    <span>Apply to {selectedEquipmentIds.length} Items</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}