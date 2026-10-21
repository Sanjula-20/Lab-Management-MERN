// src/components/EquipmentWizardModal.jsx - Card-based 5-Step Equipment Creation Wizard
import { useState, useEffect, useRef } from 'react'
import { equipmentCategoriesAPI, departmentsAPI, labsAPI, dealersAPI, hardwareOptionsAPI } from '../services/api'

// Helper for Category Icons
function CategoryCardIcon({ icon, className = "w-6 h-6" }) {
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
        default:
            return (
                <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            )
    }
}

export default function EquipmentWizardModal({ isOpen, onClose, onEquipmentAdded }) {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [validationErrors, setValidationErrors] = useState({})

    // Metadata loaded from Database
    const [categories, setCategories] = useState([])
    const [categoriesLoading, setCategoriesLoading] = useState(true)
    const [categoriesError, setCategoriesError] = useState('')
    const [labs, setLabs] = useState([])
    const [departments, setDepartments] = useState([])
    const [dealers, setDealers] = useState([])
    const [hardwareOptions, setHardwareOptions] = useState({})

    // Wizard Form State
    const [formData, setFormData] = useState({
        // Step 1: Category
        category: '',
        categoryDetails: null,

        // Step 2: Basic Equipment Details
        name: '',
        asset_number: '',
        serial_number: '',
        brand: '',
        model: '',
        model_number: '',
        lab_id: '',
        department_id: '',
        condition_status: 'excellent',
        status: 'available',
        dealer_id: '',

        // Step 3: Hardware Configuration
        processor: '',
        generation: '',
        operating_system: '',
        ram: '',
        ram_type: '',
        storage_type: '',
        storage: '',
        gpu: '',
        gpu_memory: '',
        // Non-computer specialized specs
        resolution: '',
        connectivity: '',
        speed: '',
        protocol: '',
        magnification: '',
        capacity: '',

        // Step 4: Purchase and Stock History
        purchase_price: '',
        purchase_date: new Date().toISOString().split('T')[0],
        warranty_expiry: '',
        dealer_reference: '',
        stock_register_page: '',
        indent_number: '',
        indent_date: '',
        purchase_notes: '',
        description: ''
    })

    const fetchWizardMetadata = async () => {
        setCategoriesLoading(true)
        setCategoriesError('')
        try {
            const catsRes = await equipmentCategoriesAPI.getAll({ status: 'active' })
            const catList = Array.isArray(catsRes)
                ? catsRes
                : (Array.isArray(catsRes?.data)
                    ? catsRes.data
                    : (catsRes?.categories || catsRes?.data?.categories || []))

            const activeCats = catList.filter(c => c && (c.is_active !== false && c.status !== 'inactive'))
            setCategories(activeCats)
            setCategoriesLoading(false)
        } catch (err) {
            console.error('Failed to load categories for equipment wizard:', err)
            setCategoriesError(err.message || 'Failed to load categories from Equipment Category Master')
            setCategoriesLoading(false)
        }

        try {
            const [labsRes, deptsRes, dealersRes, hwRes] = await Promise.allSettled([
                labsAPI.getAllLabs ? labsAPI.getAllLabs({ limit: 100 }) : labsAPI.getAll({ limit: 100 }),
                departmentsAPI.getAll({ limit: 100 }),
                dealersAPI.getAll({ status: 'active' }),
                hardwareOptionsAPI.getAll({ is_active: true })
            ])

            if (labsRes.status === 'fulfilled') {
                const val = labsRes.value
                const labList = val?.labs || val?.data?.labs || (Array.isArray(val) ? val : (Array.isArray(val?.data) ? val.data : []))
                setLabs(labList)
            }
            if (deptsRes.status === 'fulfilled') {
                const val = deptsRes.value
                const rawDepts = val?.departments || val?.data?.departments || (Array.isArray(val) ? val : (Array.isArray(val?.data) ? val.data : []))
                const normalizedDepts = rawDepts.map(d => ({
                    ...d,
                    id: d.departmentId || d.id,
                    departmentId: d.departmentId || d.id,
                    name: d.departmentName || d.name || 'Department',
                    departmentName: d.departmentName || d.name || 'Department',
                    code: d.departmentAcr || d.code || ''
                }))
                setDepartments(normalizedDepts)
            }
            if (dealersRes.status === 'fulfilled') {
                const val = dealersRes.value
                const dealerList = val?.dealers || val?.data?.dealers || (Array.isArray(val) ? val : (Array.isArray(val?.data) ? val.data : []))
                setDealers(dealerList)
            }
            if (hwRes.status === 'fulfilled') {
                const val = hwRes.value
                if (val?.grouped) {
                    setHardwareOptions(val.grouped)
                }
            }
        } catch (err) {
            console.warn('Optional metadata loading warning:', err)
        }
    }

    // Load dynamic metadata on open
    useEffect(() => {
        if (!isOpen) return
        fetchWizardMetadata()
    }, [isOpen])

    // Reset when opening
    useEffect(() => {
        if (isOpen) {
            setStep(1)
            setError('')
            setValidationErrors({})
        }
    }, [isOpen])

    // ESC key listener
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen && !loading) {
                onClose()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, loading, onClose])

    if (!isOpen) return null

    // Determine if selected category is computer/IT related
    const isComputerCategory = () => {
        const catCode = (formData.category || '').toLowerCase()
        const catName = (formData.categoryDetails?.name || '').toLowerCase()
        return catCode.includes('computer') || catCode.includes('desktop') || catCode.includes('laptop') ||
            catCode.includes('server') || catName.includes('computer') || catName.includes('desktop') || catName.includes('laptop')
    }

    // Step Validation
    const validateStep = (currentStep) => {
        const errs = {}
        if (currentStep === 1) {
            if (!formData.category) {
                errs.category = 'Please select an equipment category to proceed'
            }
        } else if (currentStep === 2) {
            if (!formData.name.trim()) errs.name = 'Equipment name is required'
            if (!formData.serial_number.trim()) errs.serial_number = 'Serial number is required'
            if (!formData.brand.trim()) errs.brand = 'Brand is required'
            if (!formData.lab_id) errs.lab_id = 'Please assign equipment to a lab'
        } else if (currentStep === 4) {
            if (formData.purchase_price && isNaN(Number(formData.purchase_price))) {
                errs.purchase_price = 'Purchase price must be a valid number'
            }
        }

        setValidationErrors(errs)
        return Object.keys(errs).length === 0
    }

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(prev => Math.min(prev + 1, 5))
            setError('')
        }
    }

    const handleBack = () => {
        setStep(prev => Math.max(prev - 1, 1))
        setError('')
    }

    const handleSelectCategory = (cat) => {
        setFormData(prev => ({
            ...prev,
            category: cat.code || cat.name?.toLowerCase().replace(/\s+/g, '_'),
            categoryDetails: cat
        }))
        setValidationErrors(prev => ({ ...prev, category: undefined }))
    }

    // Save final submission
    const handleSaveEquipment = async () => {
        setLoading(true)
        setError('')
        try {
            const payload = {
                name: formData.name.trim(),
                description: formData.description || formData.purchase_notes || '',
                serial_number: formData.serial_number.trim(),
                asset_number: formData.asset_number.trim() || undefined,
                brand: formData.brand.trim(),
                manufacturer: formData.brand.trim(),
                model: (formData.model || formData.model_number || '').trim(),
                model_number: formData.model_number ? formData.model_number.trim() : undefined,
                category: formData.category,
                lab_id: parseInt(formData.lab_id),
                department_id: formData.department_id ? parseInt(formData.department_id) : undefined,
                status: formData.status || 'available',
                condition_status: formData.condition_status || 'excellent',
                dealer_id: formData.dealer_id ? parseInt(formData.dealer_id) : undefined,

                // Hardware Config
                processor: formData.processor ? formData.processor.trim() : null,
                generation: formData.generation ? formData.generation.trim() : null,
                operating_system: formData.operating_system ? formData.operating_system.trim() : null,
                ram: formData.ram ? formData.ram.trim() : null,
                ram_type: formData.ram_type ? formData.ram_type.trim() : null,
                storage: formData.storage ? formData.storage.trim() : null,
                hard_disk: formData.storage ? formData.storage.trim() : null,
                storage_type: formData.storage_type ? formData.storage_type.trim() : null,
                gpu: formData.gpu ? formData.gpu.trim() : null,
                graphics_card: formData.gpu ? formData.gpu.trim() : null,
                gpu_memory: formData.gpu_memory ? formData.gpu_memory.trim() : null,

                // Non-computer specs
                resolution: formData.resolution || null,
                connectivity: formData.connectivity || null,
                speed: formData.speed || null,
                protocol: formData.protocol || null,
                magnification: formData.magnification || null,
                capacity: formData.capacity || null,

                // Purchase & Stock History
                purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : 0,
                purchase_date: formData.purchase_date || null,
                warranty_expiry: formData.warranty_expiry || null,
                stock_register_page: formData.stock_register_page ? formData.stock_register_page.trim() : null,
                indent_number: formData.indent_number ? formData.indent_number.trim() : null,
                indent_date: formData.indent_date || null
            }

            const response = await fetch('/api/equipment', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const result = await response.json()
            if (response.ok && result.success) {
                onEquipmentAdded(result.data.equipment || result.data)
                onClose()
            } else {
                setError(result.message || 'Failed to save equipment')
            }
        } catch (err) {
            console.error('Error saving equipment:', err)
            setError(err.message || 'Network error occurred while saving equipment')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden transform animate-in fade-in zoom-in-95 duration-200">
                {/* Header & Step Indicator */}
                <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 text-white px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                    <div>
                        <div className="flex items-center space-x-2">
                            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white font-mono text-xs font-bold">
                                Step {step} of 5
                            </span>
                            <h3 className="text-base font-bold">
                                {step === 1 && 'Select Equipment Category'}
                                {step === 2 && 'Basic Equipment Details'}
                                {step === 3 && 'Hardware Configuration'}
                                {step === 4 && 'Purchase & Stock Register History'}
                                {step === 5 && 'Review & Confirm Equipment'}
                            </h3>
                        </div>
                        <p className="text-xs text-blue-100/90 mt-0.5">
                            {step === 1 && 'Choose the type of laboratory equipment from category master'}
                            {step === 2 && 'Enter identity, brand, model, lab assignment and operational state'}
                            {step === 3 && 'Configure technical specifications using dynamic hardware options'}
                            {step === 4 && 'Track acquisition records, stock register reference, indent numbers & warranty'}
                            {step === 5 && 'Verify all entered specifications before saving to database'}
                        </p>
                    </div>

                    {/* Step Breadcrumb dots */}
                    <div className="flex items-center space-x-2 self-start sm:self-center">
                        {[1, 2, 3, 4, 5].map(s => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => {
                                    if (s < step) setStep(s)
                                    else if (s === step + 1 && validateStep(step)) setStep(s)
                                }}
                                className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-all ${
                                    s === step
                                        ? 'bg-white text-indigo-900 shadow-md ring-2 ring-white/50'
                                        : s < step
                                            ? 'bg-emerald-500 text-white hover:bg-emerald-400'
                                            : 'bg-white/20 text-white/70'
                                }`}
                                title={`Jump to Step ${s}`}
                            >
                                {s < step ? '✓' : s}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Body Content Area (Scrollable within modal bounds) */}
                <div className="p-6 overflow-y-auto flex-1 min-h-[360px]">
                    {error && (
                        <div className="mb-4 p-3.5 bg-red-50 border-l-4 border-red-500 rounded-xl text-red-800 text-xs font-semibold flex justify-between items-center">
                            <span>{error}</span>
                            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">✕</button>
                        </div>
                    )}

                    {/* ============================================================== */}
                    {/* STEP 1: SELECT CATEGORY CARDS                                 */}
                    {/* ============================================================== */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    Click a category card below <span className="text-red-500">*</span>
                                </h4>
                                <span className="text-xs text-gray-400">Loaded from Equipment Category Master</span>
                            </div>

                            {validationErrors.category && (
                                <p className="text-xs font-semibold text-red-600">{validationErrors.category}</p>
                            )}

                            {categoriesLoading ? (
                                <div className="py-16 flex flex-col items-center justify-center text-center space-y-3">
                                    <svg className="w-9 h-9 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                                    </svg>
                                    <p className="text-xs font-semibold text-gray-600">Loading categories from Equipment Category Master...</p>
                                </div>
                            ) : categoriesError ? (
                                <div className="py-8 px-4 bg-red-50 border border-red-200 rounded-2xl text-center space-y-3">
                                    <p className="text-xs font-bold text-red-700">{categoriesError}</p>
                                    <button
                                        type="button"
                                        onClick={fetchWizardMetadata}
                                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
                                    >
                                        Retry Loading Categories
                                    </button>
                                </div>
                            ) : categories.length === 0 ? (
                                <div className="py-16 px-4 bg-gray-50 border border-dashed border-gray-300 rounded-2xl text-center space-y-2">
                                    <svg className="w-10 h-10 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    <h5 className="text-sm font-bold text-gray-700">No Active Categories Found</h5>
                                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                                        There are currently no active categories registered in the Equipment Category Master.
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5">
                                    {categories.map(cat => {
                                        const isSelected = formData.category === cat.code || formData.category === cat.name?.toLowerCase().replace(/\s+/g, '_')
                                        return (
                                            <div
                                                key={cat.id || cat.code}
                                                onClick={() => handleSelectCategory(cat)}
                                                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col items-center text-center space-y-2.5 ${
                                                    isSelected
                                                        ? 'border-blue-600 bg-blue-50/70 shadow-md scale-102 ring-2 ring-blue-500/20'
                                                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50/80 bg-white'
                                                }`}
                                            >
                                                <div className={`p-3 rounded-xl ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                                    <CategoryCardIcon icon={cat.icon || 'box'} className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-gray-900 text-xs">{cat.name}</h5>
                                                    {cat.code && (
                                                        <span className="text-[10px] font-mono text-gray-400 uppercase mt-0.5 block">{cat.code}</span>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {formData.category && (
                                <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 flex items-center justify-between mt-4">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-blue-600 font-bold text-xs">Selected:</span>
                                        <span className="font-bold text-gray-900 text-sm">{formData.categoryDetails?.name || formData.category}</span>
                                    </div>
                                    <span className="text-xs text-blue-700 font-medium">Click "Next: Basic Details" below to continue</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ============================================================== */}
                    {/* STEP 2: BASIC EQUIPMENT DETAILS                                */}
                    {/* ============================================================== */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {/* Name */}
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Equipment Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., Dell OptiPlex 7090 Desktop #12"
                                        className={`w-full px-3.5 py-2 rounded-xl border text-xs font-medium ${
                                            validationErrors.name ? 'border-red-400 bg-red-50/30' : 'border-gray-200 bg-gray-50/50'
                                        }`}
                                    />
                                    {validationErrors.name && <p className="text-[11px] text-red-600 mt-0.5">{validationErrors.name}</p>}
                                </div>

                                {/* Asset Number */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Asset Number / ID
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.asset_number}
                                        onChange={(e) => setFormData({ ...formData, asset_number: e.target.value })}
                                        placeholder="e.g., AST-NEC-2026-089"
                                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-mono uppercase"
                                    />
                                </div>

                                {/* Serial Number */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Serial Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.serial_number}
                                        onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                                        placeholder="e.g., SN-DELL-789042"
                                        className={`w-full px-3.5 py-2 rounded-xl border text-xs font-mono uppercase ${
                                            validationErrors.serial_number ? 'border-red-400 bg-red-50/30' : 'border-gray-200 bg-gray-50/50'
                                        }`}
                                    />
                                    {validationErrors.serial_number && <p className="text-[11px] text-red-600 mt-0.5">{validationErrors.serial_number}</p>}
                                </div>

                                {/* Brand */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Brand / Manufacturer <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.brand}
                                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                        placeholder="e.g., Dell, HP, Acer, Cisco"
                                        className={`w-full px-3.5 py-2 rounded-xl border text-xs font-medium ${
                                            validationErrors.brand ? 'border-red-400 bg-red-50/30' : 'border-gray-200 bg-gray-50/50'
                                        }`}
                                    />
                                    {validationErrors.brand && <p className="text-[11px] text-red-600 mt-0.5">{validationErrors.brand}</p>}
                                </div>

                                {/* Model Name */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Model Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.model}
                                        onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                                        placeholder="e.g., OptiPlex 7090 Tower"
                                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-medium"
                                    />
                                </div>

                                {/* Model Number */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Model Number (if different)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.model_number}
                                        onChange={(e) => setFormData({ ...formData, model_number: e.target.value })}
                                        placeholder="e.g., D15M002"
                                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-medium font-mono"
                                    />
                                </div>

                                {/* Assigned Lab */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Assigned Lab <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.lab_id}
                                        onChange={(e) => setFormData({ ...formData, lab_id: e.target.value })}
                                        className={`w-full px-3.5 py-2 rounded-xl border text-xs font-medium ${
                                            validationErrors.lab_id ? 'border-red-400 bg-red-50/30' : 'border-gray-200 bg-gray-50/50'
                                        }`}
                                    >
                                        <option value="">Select Lab...</option>
                                        {labs.map(lab => (
                                            <option key={lab.id} value={lab.id}>
                                                {lab.name} ({lab.location || 'Main'})
                                            </option>
                                        ))}
                                    </select>
                                    {validationErrors.lab_id && <p className="text-[11px] text-red-600 mt-0.5">{validationErrors.lab_id}</p>}
                                </div>

                                {/* Department */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Department
                                    </label>
                                    <select
                                        value={formData.department_id}
                                        onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-medium"
                                    >
                                        <option value="">Optional (inherit from lab)</option>
                                        {departments.map(dept => (
                                            <option key={dept.departmentId || dept.id} value={dept.departmentId || dept.id}>
                                                {dept.departmentName || dept.name} ({dept.departmentAcr || dept.code || ''})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Dealer */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Supplier / Dealer
                                    </label>
                                    <select
                                        value={formData.dealer_id}
                                        onChange={(e) => setFormData({ ...formData, dealer_id: e.target.value })}
                                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-medium"
                                    >
                                        <option value="">Select Dealer (from Dealer Master)...</option>
                                        {dealers.map(d => (
                                            <option key={d.id} value={d.id}>
                                                {d.name || d.company_name} ({d.city || 'India'})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Equipment Condition */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Condition Status
                                    </label>
                                    <select
                                        value={formData.condition_status}
                                        onChange={(e) => setFormData({ ...formData, condition_status: e.target.value })}
                                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-medium"
                                    >
                                        <option value="excellent">Excellent / New</option>
                                        <option value="good">Good Condition</option>
                                        <option value="fair">Fair (Usable)</option>
                                        <option value="poor">Poor (Needs repair)</option>
                                    </select>
                                </div>

                                {/* Operational Status */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Operational Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-medium"
                                    >
                                        <option value="available">Available</option>
                                        <option value="in_use">In Use</option>
                                        <option value="maintenance">Maintenance</option>
                                        <option value="broken">Broken</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============================================================== */}
                    {/* STEP 3: HARDWARE CONFIGURATION                                 */}
                    {/* ============================================================== */}
                    {step === 3 && (
                        <div className="space-y-4">
                            {isComputerCategory() ? (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center">
                                            <span className="mr-1.5">💻</span> Computer Hardware Specifications
                                        </h4>
                                        <span className="text-[11px] text-gray-400">Dropdown options loaded from Hardware Configuration Master</span>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-blue-50/40 p-4 rounded-2xl border border-blue-100">
                                        {/* Processor Model */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                Processor Model
                                            </label>
                                            <input
                                                list="processor-options"
                                                type="text"
                                                value={formData.processor}
                                                onChange={(e) => setFormData({ ...formData, processor: e.target.value })}
                                                placeholder="e.g., Intel Core i7 13700K"
                                                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium"
                                            />
                                            <datalist id="processor-options">
                                                {(hardwareOptions.processor_model || []).map(opt => (
                                                    <option key={opt.id} value={opt.option_label} />
                                                ))}
                                            </datalist>
                                        </div>

                                        {/* Processor Generation */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                Processor Generation
                                            </label>
                                            <select
                                                value={formData.generation}
                                                onChange={(e) => setFormData({ ...formData, generation: e.target.value })}
                                                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium"
                                            >
                                                <option value="">Select Generation...</option>
                                                {(hardwareOptions.processor_generation || []).map(opt => (
                                                    <option key={opt.id} value={opt.option_label}>
                                                        {opt.option_label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Operating System */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                Operating System
                                            </label>
                                            <select
                                                value={formData.operating_system}
                                                onChange={(e) => setFormData({ ...formData, operating_system: e.target.value })}
                                                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium"
                                            >
                                                <option value="">Select OS...</option>
                                                {(hardwareOptions.operating_system || []).map(opt => (
                                                    <option key={opt.id} value={opt.option_label}>
                                                        {opt.option_label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* RAM Capacity */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                RAM Capacity
                                            </label>
                                            <select
                                                value={formData.ram}
                                                onChange={(e) => setFormData({ ...formData, ram: e.target.value })}
                                                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium"
                                            >
                                                <option value="">Select RAM Size...</option>
                                                {(hardwareOptions.ram_capacity || []).map(opt => (
                                                    <option key={opt.id} value={opt.option_label}>
                                                        {opt.option_label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* RAM Type */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                RAM Type
                                            </label>
                                            <select
                                                value={formData.ram_type}
                                                onChange={(e) => setFormData({ ...formData, ram_type: e.target.value })}
                                                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium"
                                            >
                                                <option value="">Select RAM Type...</option>
                                                {(hardwareOptions.ram_type || []).map(opt => (
                                                    <option key={opt.id} value={opt.option_label}>
                                                        {opt.option_label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Storage Type */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                Storage Type
                                            </label>
                                            <select
                                                value={formData.storage_type}
                                                onChange={(e) => setFormData({ ...formData, storage_type: e.target.value })}
                                                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium"
                                            >
                                                <option value="">Select Storage Type...</option>
                                                {(hardwareOptions.storage_type || []).map(opt => (
                                                    <option key={opt.id} value={opt.option_label}>
                                                        {opt.option_label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Storage Capacity */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                Storage Capacity
                                            </label>
                                            <select
                                                value={formData.storage}
                                                onChange={(e) => setFormData({ ...formData, storage: e.target.value })}
                                                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium"
                                            >
                                                <option value="">Select Capacity...</option>
                                                {(hardwareOptions.storage_capacity || []).map(opt => (
                                                    <option key={opt.id} value={opt.option_label}>
                                                        {opt.option_label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* GPU Model */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                GPU / Graphics Model
                                            </label>
                                            <input
                                                list="gpu-options"
                                                type="text"
                                                value={formData.gpu}
                                                onChange={(e) => setFormData({ ...formData, gpu: e.target.value })}
                                                placeholder="e.g., NVIDIA RTX 4060 or Integrated"
                                                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium"
                                            />
                                            <datalist id="gpu-options">
                                                {(hardwareOptions.gpu_model || []).map(opt => (
                                                    <option key={opt.id} value={opt.option_label} />
                                                ))}
                                            </datalist>
                                        </div>

                                        {/* GPU Memory */}
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                GPU Memory Size
                                            </label>
                                            <select
                                                value={formData.gpu_memory}
                                                onChange={(e) => setFormData({ ...formData, gpu_memory: e.target.value })}
                                                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-white text-xs font-medium"
                                            >
                                                <option value="">Select VRAM...</option>
                                                {(hardwareOptions.gpu_memory || []).map(opt => (
                                                    <option key={opt.id} value={opt.option_label}>
                                                        {opt.option_label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center space-x-3">
                                        <span className="text-xl">ℹ️</span>
                                        <p className="text-xs text-emerald-800 font-medium">
                                            Computer hardware specifications (GPU, Processor, RAM) are optional for this category (<strong>{formData.categoryDetails?.name || formData.category}</strong>). You can specify applicable attributes below:
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                Resolution / Display
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.resolution}
                                                onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                                                placeholder="e.g., 1920x1080 Full HD"
                                                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-medium"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                Connectivity / Ports
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.connectivity}
                                                onChange={(e) => setFormData({ ...formData, connectivity: e.target.value })}
                                                placeholder="e.g., HDMI, USB 3.0, Gigabit Ethernet"
                                                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-medium"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                Speed / Rating
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.speed}
                                                onChange={(e) => setFormData({ ...formData, speed: e.target.value })}
                                                placeholder="e.g., 35 ppm or 1 Gbps"
                                                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-medium"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                                Capacity / Range
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.capacity}
                                                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                                                placeholder="e.g., 500 Sheets or 1000V"
                                                className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-medium"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ============================================================== */}
                    {/* STEP 4: PURCHASE AND STOCK REGISTER HISTORY                    */}
                    {/* ============================================================== */}
                    {step === 4 && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {/* Purchase Price */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Purchase Price (₹)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.purchase_price}
                                        onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                                        placeholder="e.g., 65000.00"
                                        className={`w-full px-3.5 py-2 rounded-xl border text-xs font-medium ${
                                            validationErrors.purchase_price ? 'border-red-400 bg-red-50/30' : 'border-gray-200 bg-gray-50/50'
                                        }`}
                                    />
                                    {validationErrors.purchase_price && (
                                        <p className="text-[11px] text-red-600 mt-0.5">{validationErrors.purchase_price}</p>
                                    )}
                                </div>

                                {/* Purchase Date */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Purchase Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.purchase_date}
                                        onChange={(e) => setFormData({ ...formData, purchase_date: e.target.value })}
                                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-medium"
                                    />
                                </div>

                                {/* Warranty Expiry */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Warranty Expiry Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.warranty_expiry}
                                        onChange={(e) => setFormData({ ...formData, warranty_expiry: e.target.value })}
                                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-medium"
                                    />
                                </div>

                                {/* Stock Register / Book Ref */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Stock Register / Page Ref
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.stock_register_page}
                                        onChange={(e) => setFormData({ ...formData, stock_register_page: e.target.value })}
                                        placeholder="e.g., Vol 4 / Page 112"
                                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-medium font-mono"
                                    />
                                </div>

                                {/* Indent Number */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Indent Number
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.indent_number}
                                        onChange={(e) => setFormData({ ...formData, indent_number: e.target.value })}
                                        placeholder="e.g., IND-2026-442"
                                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-medium font-mono uppercase"
                                    />
                                </div>

                                {/* Indent Date */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Indent Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.indent_date}
                                        onChange={(e) => setFormData({ ...formData, indent_date: e.target.value })}
                                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-medium"
                                    />
                                </div>

                                {/* Purchase Notes */}
                                <div className="sm:col-span-2 md:col-span-3">
                                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                                        Purchase Notes / PO Reference
                                    </label>
                                    <textarea
                                        rows="2"
                                        value={formData.purchase_notes}
                                        onChange={(e) => setFormData({ ...formData, purchase_notes: e.target.value, description: e.target.value })}
                                        placeholder="e.g., Purchased under TEQIP grant, 3-year onsite OEM comprehensive warranty included"
                                        className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50/50 text-xs font-medium"
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============================================================== */}
                    {/* STEP 5: REVIEW AND CONFIRM                                     */}
                    {/* ============================================================== */}
                    {step === 5 && (
                        <div className="space-y-4">
                            <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200 flex items-center justify-between">
                                <div className="flex items-center space-x-2.5">
                                    <span className="text-lg">📋</span>
                                    <div>
                                        <h4 className="text-xs font-bold text-blue-900 uppercase">Review Specifications</h4>
                                        <p className="text-[11px] text-blue-700">Please review all entered details before writing to the database.</p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold text-blue-800">Ready to Submit</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                {/* Basic Info Card */}
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                                        <span className="font-bold text-gray-900 uppercase">1. Basic Details</span>
                                        <button onClick={() => setStep(2)} className="text-blue-600 font-bold hover:underline">Edit</button>
                                    </div>
                                    <p><strong className="text-gray-500">Name:</strong> {formData.name}</p>
                                    <p><strong className="text-gray-500">Serial No:</strong> <span className="font-mono">{formData.serial_number}</span></p>
                                    {formData.asset_number && <p><strong className="text-gray-500">Asset No:</strong> <span className="font-mono">{formData.asset_number}</span></p>}
                                    <p><strong className="text-gray-500">Brand & Model:</strong> {formData.brand} {formData.model}</p>
                                    <p><strong className="text-gray-500">Assigned Lab:</strong> {labs.find(l => String(l.id) === String(formData.lab_id))?.name || 'Assigned'}</p>
                                    <p><strong className="text-gray-500">Status & Condition:</strong> {formData.status} / {formData.condition_status}</p>
                                </div>

                                {/* Hardware Specs Card */}
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                                        <span className="font-bold text-gray-900 uppercase">2. Hardware Specs</span>
                                        <button onClick={() => setStep(3)} className="text-blue-600 font-bold hover:underline">Edit</button>
                                    </div>
                                    {isComputerCategory() ? (
                                        <>
                                            <p><strong className="text-gray-500">Processor:</strong> {formData.processor || '—'} {formData.generation ? `(${formData.generation})` : ''}</p>
                                            <p><strong className="text-gray-500">Operating System:</strong> {formData.operating_system || '—'}</p>
                                            <p><strong className="text-gray-500">RAM:</strong> {formData.ram || '—'} {formData.ram_type}</p>
                                            <p><strong className="text-gray-500">Storage:</strong> {formData.storage || '—'} {formData.storage_type}</p>
                                            <p><strong className="text-gray-500">Graphics:</strong> {formData.gpu || '—'} {formData.gpu_memory ? `(${formData.gpu_memory})` : ''}</p>
                                        </>
                                    ) : (
                                        <>
                                            <p><strong className="text-gray-500">Category:</strong> {formData.categoryDetails?.name || formData.category}</p>
                                            {formData.resolution && <p><strong className="text-gray-500">Resolution:</strong> {formData.resolution}</p>}
                                            {formData.connectivity && <p><strong className="text-gray-500">Connectivity:</strong> {formData.connectivity}</p>}
                                            {formData.capacity && <p><strong className="text-gray-500">Capacity:</strong> {formData.capacity}</p>}
                                        </>
                                    )}
                                </div>

                                {/* Purchase Details Card */}
                                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2 md:col-span-2">
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                                        <span className="font-bold text-gray-900 uppercase">3. Purchase & Stock Register</span>
                                        <button onClick={() => setStep(4)} className="text-blue-600 font-bold hover:underline">Edit</button>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                        <p><strong className="text-gray-500">Price:</strong> ₹{formData.purchase_price || '0.00'}</p>
                                        <p><strong className="text-gray-500">Date:</strong> {formData.purchase_date || '—'}</p>
                                        <p><strong className="text-gray-500">Stock Reg Page:</strong> <span className="font-mono">{formData.stock_register_page || '—'}</span></p>
                                        <p><strong className="text-gray-500">Indent No:</strong> <span className="font-mono">{formData.indent_number || '—'}</span></p>
                                    </div>
                                    {formData.purchase_notes && (
                                        <p className="mt-2 text-gray-600 italic">"{formData.purchase_notes}"</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Controls (Previous, Next, Save) */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between shrink-0">
                    <button
                        type="button"
                        onClick={step === 1 ? onClose : handleBack}
                        disabled={loading}
                        className="px-4 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
                    >
                        {step === 1 ? 'Cancel' : '← Previous Step'}
                    </button>

                    <div className="flex items-center space-x-2.5">
                        {step < 5 ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md hover:shadow-lg transition-all"
                            >
                                Next Step →
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSaveEquipment}
                                disabled={loading}
                                className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center space-x-2"
                            >
                                {loading && (
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                )}
                                <span>Save Equipment</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
