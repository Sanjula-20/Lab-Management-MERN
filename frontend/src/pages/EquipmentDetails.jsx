import { Link, useParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

function EquipmentDetails() {
    const { id } = useParams()
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const [equipment, setEquipment] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchEquipment = async () => {
            if (!isAuthenticated) {
                navigate('/login')
                return
            }

            try {
                setLoading(true)
                const response = await fetch(`/api/equipment/${id}`, {
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })

                if (response.ok) {
                    const data = await response.json()
                    if (data.success) {
                        setEquipment(data.data.equipment)
                    } else {
                        setError(data.message || 'Equipment not found')
                    }
                } else {
                    setError('Equipment not found')
                }
            } catch (error) {
                console.error('Error fetching equipment:', error)
                setError('Failed to load equipment data')
            } finally {
                setLoading(false)
            }
        }

        fetchEquipment()
    }, [id, isAuthenticated, navigate])

    const [showHistoryModal, setShowHistoryModal] = useState(false)
    const [historyData, setHistoryData] = useState([])
    const [historyLoading, setHistoryLoading] = useState(false)

    const fetchHistory = async () => {
        try {
            setHistoryLoading(true)
            const response = await fetch(`/api/audit/equipment/${id}`, {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            })
            if (response.ok) {
                const res = await response.json()
                setHistoryData(res.data || [])
            } else {
                setHistoryData([])
            }
        } catch (err) {
            console.error('Failed to fetch equipment history:', err)
            setHistoryData([])
        } finally {
            setHistoryLoading(false)
        }
    }

    const handleOpenHistory = () => {
        setShowHistoryModal(true)
        fetchHistory()
    }

    // Escape key handler: closes modal if open, otherwise navigates back
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' || e.key === 'Esc') {
                if (showHistoryModal) {
                    setShowHistoryModal(false)
                } else {
                    navigate(-1)
                }
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [showHistoryModal, navigate])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <div className="mt-4 text-gray-600">Loading equipment details...</div>
                </div>
            </div>
        )
    }

    if (error || !equipment) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 text-xl mb-4">{error || 'Equipment not found'}</div>
                    <Link to="/equipment" className="text-blue-600 hover:underline">
                        ← Back to Equipment Inventory
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <div className="bg-white shadow">
                <div className="px-6 py-4">
                    <Link to="/equipment" className="text-blue-500 hover:underline">← Back to Inventory</Link>
                    <h1 className="text-2xl font-bold text-gray-800 mt-2">Equipment Details</h1>
                </div>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded shadow p-6">
                        <h2 className="text-xl font-bold mb-4">Basic Information</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="font-medium">Equipment ID:</span>
                                <span>{equipment.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Name:</span>
                                <span>{equipment.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Category:</span>
                                <span className="capitalize">{equipment.category?.replace('_', ' ')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Brand:</span>
                                <span>{equipment.brand || equipment.manufacturer || 'Not specified'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Dealer:</span>
                                <span>{equipment.dealer?.name || equipment.dealer_name || 'Not specified'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Model:</span>
                                <span>{equipment.model || 'Not specified'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Serial Number:</span>
                                <span className="font-mono text-sm">{equipment.serial_number}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Status:</span>
                                <span className={`px-2 py-1 rounded text-sm capitalize ${
                                    equipment.status === 'available' ? 'bg-green-100 text-green-800' :
                                    equipment.status === 'in_use' ? 'bg-blue-100 text-blue-800' :
                                    equipment.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                                    equipment.status === 'broken' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {equipment.status?.replace('_', ' ')}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Condition:</span>
                                <span className="capitalize">{equipment.condition_status}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Laboratory:</span>
                                <span>{equipment.lab?.name || 'Unassigned'}</span>
                            </div>
                            {equipment.description && (
                                <div>
                                    <span className="font-medium">Description:</span>
                                    <p className="mt-1 text-gray-600">{equipment.description}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Technical Specifications */}
                    <div className="bg-white rounded shadow p-6">
                        <h2 className="text-xl font-bold mb-4">Technical Specifications & Configuration</h2>
                        <div className="space-y-3">
                            {/* Configuration Section */}
                            {(equipment.ram || equipment.hard_disk || equipment.storage || equipment.gpu || equipment.graphics_card || equipment.generation || equipment.processor || equipment.ram_type || equipment.gpu_memory || equipment.operating_system) && (
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-3">
                                    <h3 className="font-bold text-blue-900 text-sm mb-3 flex items-center justify-between">
                                        <span className="flex items-center">
                                            <svg className="w-4 h-4 mr-1.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                                            </svg>
                                            Hardware Configuration
                                        </span>
                                        <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                            Detailed Specs
                                        </span>
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <span className="text-gray-500 block text-xs">Processor</span>
                                            <span className="font-semibold text-gray-800">{equipment.processor || 'Not specified'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block text-xs">Generation</span>
                                            <span className="font-semibold text-gray-800">{equipment.generation || 'Not specified'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block text-xs">Operating System</span>
                                            <span className="font-semibold text-gray-800">{equipment.operating_system || 'Not specified'}</span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block text-xs">RAM</span>
                                            <span className="font-semibold text-gray-800">
                                                {equipment.ram || 'Not specified'} {equipment.ram_type ? `(${equipment.ram_type})` : ''}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block text-xs">Storage</span>
                                            <span className="font-semibold text-gray-800">
                                                {equipment.hard_disk || equipment.storage || 'Not specified'}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-500 block text-xs">GPU / Graphics</span>
                                            <span className="font-semibold text-gray-800">
                                                {equipment.gpu || equipment.graphics_card || 'Not specified'} {equipment.gpu_memory ? `(${equipment.gpu_memory})` : ''}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {equipment.category === 'projector' && (
                                <>
                                    {equipment.resolution && (
                                        <div className="flex justify-between">
                                            <span className="font-medium">Resolution:</span>
                                            <span>{equipment.resolution}</span>
                                        </div>
                                    )}
                                    {equipment.brightness && (
                                        <div className="flex justify-between">
                                            <span className="font-medium">Brightness:</span>
                                            <span>{equipment.brightness}</span>
                                        </div>
                                    )}
                                    {equipment.lamp_hours && (
                                        <div className="flex justify-between">
                                            <span className="font-medium">Lamp Hours:</span>
                                            <span>{equipment.lamp_hours}</span>
                                        </div>
                                    )}
                                </>
                            )}

                            {equipment.category === 'microscope' && (
                                <>
                                    {equipment.magnification && (
                                        <div className="flex justify-between">
                                            <span className="font-medium">Magnification:</span>
                                            <span>{equipment.magnification}</span>
                                        </div>
                                    )}
                                    {equipment.objective_lenses && (
                                        <div className="flex justify-between">
                                            <span className="font-medium">Objective Lenses:</span>
                                            <span>{equipment.objective_lenses}</span>
                                        </div>
                                    )}
                                    {equipment.illumination && (
                                        <div className="flex justify-between">
                                            <span className="font-medium">Illumination:</span>
                                            <span>{equipment.illumination}</span>
                                        </div>
                                    )}
                                </>
                            )}

                            {equipment.category === 'lab_equipment' && (
                                <>
                                    {equipment.capacity && (
                                        <div className="flex justify-between">
                                            <span className="font-medium">Capacity:</span>
                                            <span>{equipment.capacity}</span>
                                        </div>
                                    )}
                                    {equipment.power_rating && (
                                        <div className="flex justify-between">
                                            <span className="font-medium">Power Rating:</span>
                                            <span>{equipment.power_rating}</span>
                                        </div>
                                    )}
                                    {equipment.temperature_range && (
                                        <div className="flex justify-between">
                                            <span className="font-medium">Temperature Range:</span>
                                            <span>{equipment.temperature_range}</span>
                                        </div>
                                    )}
                                </>
                            )}

                            {equipment.category === 'printer' && (
                                <>
                                    {equipment.print_type && (
                                        <div className="flex justify-between">
                                            <span className="font-medium">Print Type:</span>
                                            <span>{equipment.print_type}</span>
                                        </div>
                                    )}
                                    {equipment.print_speed && (
                                        <div className="flex justify-between">
                                            <span className="font-medium">Print Speed:</span>
                                            <span>{equipment.print_speed}</span>
                                        </div>
                                    )}
                                    {equipment.connectivity && (
                                        <div className="flex justify-between">
                                            <span className="font-medium">Connectivity:</span>
                                            <span>{equipment.connectivity}</span>
                                        </div>
                                    )}
                                </>
                            )}

                            {equipment.category === 'network' && (
                                <>
                                    {equipment.ports && (
                                        <div className="flex justify-between">
                                            <span className="font-medium">Ports:</span>
                                            <span>{equipment.ports}</span>
                                        </div>
                                    )}
                                    {equipment.speed && (
                                        <div className="flex justify-between">
                                            <span className="font-medium">Speed:</span>
                                            <span>{equipment.speed}</span>
                                        </div>
                                    )}
                                    {equipment.protocol && (
                                        <div className="flex justify-between">
                                            <span className="font-medium">Protocol:</span>
                                            <span>{equipment.protocol}</span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Purchase & Warranty Information */}
                    <div className="bg-white rounded shadow p-6">
                        <h2 className="text-xl font-bold mb-4">Purchase & Warranty Information</h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="font-medium">Purchase Date:</span>
                                <span>{equipment.purchase_date ? new Date(equipment.purchase_date).toLocaleDateString() : 'Not specified'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Purchase Price:</span>
                                <span>₹{equipment.purchase_price ? equipment.purchase_price.toLocaleString() : 'Not specified'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Current Value:</span>
                                <span>₹{equipment.current_value ? equipment.current_value.toLocaleString() : 'Not specified'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Warranty Expiry:</span>
                                <span className={`${equipment.warranty_expiry && new Date(equipment.warranty_expiry) < new Date() ? 'text-red-600' : ''}`}>
                                    {equipment.warranty_expiry ? new Date(equipment.warranty_expiry).toLocaleDateString() : 'Not specified'}
                                    {equipment.warranty_expiry && new Date(equipment.warranty_expiry) < new Date() && (
                                        <span className="ml-2 text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Expired</span>
                                    )}
                                </span>
                            </div>
                            {equipment.stock_register_page && (
                                <div className="flex justify-between">
                                    <span className="font-medium">Stock Register Ref:</span>
                                    <span>{equipment.stock_register_page}</span>
                                </div>
                            )}
                            {equipment.indent_number && (
                                <div className="flex justify-between">
                                    <span className="font-medium">Indent Number:</span>
                                    <span className="font-mono text-sm font-semibold text-blue-700">{equipment.indent_number}</span>
                                </div>
                            )}
                            {equipment.indent_date && (
                                <div className="flex justify-between">
                                    <span className="font-medium">Indent Date:</span>
                                    <span>{new Date(equipment.indent_date).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="bg-white rounded shadow p-6">
                        <h2 className="text-xl font-bold mb-4">Actions</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <button 
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                                onClick={() => {
                                    // Navigate to equipment inventory with edit mode
                                    navigate('/equipment', { 
                                        state: { 
                                            editEquipment: equipment,
                                            shouldOpenEditModal: true 
                                        } 
                                    });
                                }}
                            >
                                Edit Equipment
                            </button>
                            <button 
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition-colors"
                                onClick={() => {
                                    navigate('/bookings/create', { 
                                        state: { 
                                            selectedEquipment: equipment,
                                            equipmentId: equipment.id,
                                            equipmentName: equipment.name
                                        } 
                                    });
                                }}
                                disabled={equipment.status === 'Out of Order' || equipment.status === 'Under Maintenance'}
                            >
                                Book Equipment
                            </button>
                            <button 
                                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition-colors"
                                onClick={() => {
                                    navigate('/maintenance/create', { 
                                        state: { 
                                            equipmentId: equipment.id,
                                            equipmentName: equipment.name 
                                        } 
                                    });
                                }}
                            >
                                Request Maintenance
                            </button>
                            <button 
                                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition-colors shadow-sm flex items-center gap-1.5"
                                onClick={handleOpenHistory}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>View History</span>
                            </button>
                            <button 
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
                                onClick={() => navigate(-1)}
                            >
                                Back to Inventory
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Accessible Equipment History & Audit Timeline Modal */}
            {showHistoryModal && (
                <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden max-h-[85vh] flex flex-col">
                        <div className="px-6 py-4 bg-purple-700 text-white flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <span className="p-1.5 bg-purple-800 rounded-lg">
                                    <svg className="w-5 h-5 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </span>
                                <div>
                                    <h3 className="text-base font-bold text-white">Equipment Audit & Activity Trail</h3>
                                    <p className="text-xs text-purple-200">{equipment.name} (Asset: {equipment.serial_number || 'N/A'})</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                className="text-purple-200 hover:text-white text-2xl font-bold p-1 leading-none"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            {historyLoading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto" />
                                    <p className="text-xs text-gray-500 mt-2 font-medium">Loading history logs...</p>
                                </div>
                            ) : historyData.length === 0 ? (
                                <div className="text-center py-10 text-gray-400">
                                    <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-sm font-medium text-gray-500">No audit records found for this equipment</p>
                                    <p className="text-xs text-gray-400 mt-1">Changes made to equipment specifications, status, lab assignment, and dealer will appear here.</p>
                                </div>
                            ) : (
                                <div className="space-y-3.5">
                                    {historyData.map((item, idx) => {
                                        let badgeColor = 'bg-blue-100 text-blue-800 border-blue-200'
                                        if (item.action === 'CREATE') badgeColor = 'bg-green-100 text-green-800 border-green-200'
                                        else if (item.action === 'DELETE') badgeColor = 'bg-red-100 text-red-800 border-red-200'
                                        else if (item.action === 'UPDATE') badgeColor = 'bg-amber-100 text-amber-800 border-amber-200'

                                        return (
                                            <div key={item.id || idx} className="flex gap-3 text-xs">
                                                <div className="w-2.5 relative flex flex-col items-center">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-purple-600 mt-1.5 ring-2 ring-purple-100" />
                                                    {idx < historyData.length - 1 && (
                                                        <div className="w-0.5 flex-1 bg-purple-200 mt-1" />
                                                    )}
                                                </div>
                                                <div className="flex-1 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase border ${badgeColor}`}>
                                                            {item.action}
                                                        </span>
                                                        <span className="text-gray-400 text-[11px]">
                                                            {item.created_at ? new Date(item.created_at).toLocaleString() : ''}
                                                        </span>
                                                    </div>
                                                    <div className="text-gray-700 font-medium">
                                                        Actor: <strong className="text-gray-900">{item.user_name || 'System Admin'}</strong>
                                                    </div>
                                                    {item.notes && (
                                                        <div className="text-gray-600 mt-1 text-[11px] bg-white p-2 rounded-lg border border-gray-100">
                                                            {item.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end">
                            <button
                                onClick={() => setShowHistoryModal(false)}
                                className="px-4 py-2 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                Close (Esc)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default EquipmentDetails