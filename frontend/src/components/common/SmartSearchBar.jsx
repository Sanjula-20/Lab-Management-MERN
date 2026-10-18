// src/components/common/SmartSearchBar.jsx - Unified Search Bar with Checkbox Options Dropdown
import { useState, useRef, useEffect } from 'react'

/**
 * SmartSearchBar
 * 
 * Props:
 * - searchValue: string
 * - onSearchChange: (value: string) => void
 * - placeholder?: string
 * - groups: Array<{
 *     id: string,
 *     title: string,
 *     options: Array<{
 *       id: string | number,
 *       label: string,
 *       count?: number,
 *       badge?: string,
 *       color?: string,
 *       icon?: React.ReactNode
 *     }>
 *   }>
 * - selectedOptions: Record<string, Array<string | number>>  (e.g., { status: ['available', 'in_use'], brand: ['Dell'] })
 * - onOptionToggle: (groupId: string, optionId: string | number) => void
 * - onGroupSelectAll?: (groupId: string, allOptionIds: Array<string | number>) => void
 * - onGroupClear?: (groupId: string) => void
 * - onClearAll: () => void
 * - className?: string
 * - searchInputClassName?: string
 */
export default function SmartSearchBar({
    searchValue = '',
    onSearchChange,
    placeholder = 'Type to search...',
    groups = [],
    selectedOptions = {},
    onOptionToggle,
    onGroupSelectAll,
    onGroupClear,
    onClearAll,
    className = '',
    searchInputClassName = '',
    align = 'left'
}) {
    const [isOpen, setIsOpen] = useState(false)
    const [activeTab, setActiveTab] = useState(groups[0]?.id || '')
    const [optionFilterText, setOptionFilterText] = useState('')
    const dropdownRef = useRef(null)
    const buttonRef = useRef(null)

    // Calculate total selected options count across all groups
    const totalSelectedCount = Object.values(selectedOptions).reduce(
        (sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0),
        0
    )

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target) &&
                buttonRef.current &&
                !buttonRef.current.contains(e.target)
            ) {
                setIsOpen(false)
            }
        }
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen])

    // Keep active tab synced if groups change
    useEffect(() => {
        if (!groups.some(g => g.id === activeTab) && groups.length > 0) {
            setActiveTab(groups[0].id)
        }
    }, [groups, activeTab])

    const currentGroup = groups.find(g => g.id === activeTab) || groups[0]

    return (
        <div className={`relative flex flex-col gap-2 w-full ${className}`}>
            {/* Unified Search Input Container */}
            <div className="relative flex items-center w-full bg-white border border-gray-300 rounded-xl shadow-2xs hover:border-gray-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                {/* Search Icon */}
                <div className="pl-3.5 pr-1 text-gray-400 flex items-center pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Normal Text Input */}
                <input
                    type="text"
                    value={searchValue}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={placeholder}
                    className={`flex-1 py-2.5 px-2 text-xs sm:text-sm text-gray-900 placeholder-gray-400 bg-transparent outline-none border-none min-w-0 ${searchInputClassName}`}
                />

                {/* Clear Text Button (if text entered) */}
                {searchValue && (
                    <button
                        type="button"
                        onClick={() => onSearchChange('')}
                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg text-xs transition mr-1"
                        title="Clear search text"
                    >
                        ✕
                    </button>
                )}

                {/* Subtle Divider */}
                {groups.length > 0 && (
                    <div className="h-5 w-px bg-gray-200 my-auto"></div>
                )}

                {/* Options Dropdown Toggle Button */}
                {groups.length > 0 && (
                    <button
                        ref={buttonRef}
                        type="button"
                        onClick={() => setIsOpen(prev => !prev)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 m-1 rounded-lg text-xs font-semibold transition-all ${
                            isOpen || totalSelectedCount > 0
                                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                        }`}
                        title="Open search & filter options"
                    >
                        <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <span className="hidden sm:inline">Options</span>
                        {totalSelectedCount > 0 && (
                            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold flex items-center justify-center">
                                {totalSelectedCount}
                            </span>
                        )}
                        <svg className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Floating Checkbox Options Dropdown */}
            {isOpen && groups.length > 0 && (
                <div
                    ref={dropdownRef}
                    className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-2 w-full sm:w-[480px] max-w-[95vw] bg-white rounded-2xl shadow-2xl border border-gray-200/90 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150`}
                >
                    {/* Dropdown Header */}
                    <div className="px-4 py-3 bg-gray-50/80 border-b border-gray-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                            <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                                Filter Options
                            </span>
                            {totalSelectedCount > 0 && (
                                <span className="text-[10px] bg-blue-100 text-blue-800 font-extrabold px-2 py-0.2 rounded-full">
                                    {totalSelectedCount} active
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            {totalSelectedCount > 0 && (
                                <button
                                    type="button"
                                    onClick={onClearAll}
                                    className="text-[11px] text-red-600 hover:text-red-800 font-bold hover:underline"
                                >
                                    Reset All
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200/60 transition"
                                title="Close (Esc)"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Group Tabs (if more than 1 group) */}
                    {groups.length > 1 && (
                        <div className="flex border-b border-gray-200/80 bg-gray-50/40 overflow-x-auto scrollbar-none px-2 pt-1.5 gap-1">
                            {groups.map(group => {
                                const groupSelectedCount = (selectedOptions[group.id] || []).length
                                const isActive = activeTab === group.id
                                return (
                                    <button
                                        key={group.id}
                                        type="button"
                                        onClick={() => {
                                            setActiveTab(group.id)
                                            setOptionFilterText('')
                                        }}
                                        className={`px-3 py-1.5 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                                            isActive
                                                ? 'bg-white text-blue-700 border-blue-600 shadow-2xs'
                                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/60 border-transparent'
                                        }`}
                                    >
                                        <span>{group.title}</span>
                                        {groupSelectedCount > 0 && (
                                            <span className="w-4 h-4 rounded-full bg-blue-100 text-blue-700 text-[9px] font-extrabold flex items-center justify-center">
                                                {groupSelectedCount}
                                            </span>
                                        )}
                                    </button>
                                )
                            })}
                        </div>
                    )}

                    {/* Options List for Current Tab */}
                    {currentGroup && (
                        <div className="p-3">
                            {/* Group Quick Controls */}
                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 px-1 text-[11px]">
                                <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">
                                    {currentGroup.title} Options ({currentGroup.options.length})
                                </span>
                                <div className="flex items-center gap-2 text-[10px]">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (onGroupSelectAll) {
                                                onGroupSelectAll(currentGroup.id, currentGroup.options.map(o => o.id))
                                            } else {
                                                currentGroup.options.forEach(o => {
                                                    const cur = selectedOptions[currentGroup.id] || []
                                                    if (!cur.includes(o.id)) onOptionToggle(currentGroup.id, o.id)
                                                })
                                            }
                                        }}
                                        className="text-blue-600 font-bold hover:underline"
                                    >
                                        Select All
                                    </button>
                                    <span className="text-gray-300">|</span>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (onGroupClear) {
                                                onGroupClear(currentGroup.id)
                                            } else {
                                                const cur = selectedOptions[currentGroup.id] || []
                                                cur.forEach(id => onOptionToggle(currentGroup.id, id))
                                            }
                                        }}
                                        className="text-gray-500 hover:underline"
                                    >
                                        Deselect
                                    </button>
                                </div>
                            </div>

                            {/* Quick search within options (if more than 5 options) */}
                            {currentGroup.options.length > 5 && (
                                <div className="mb-2 px-1">
                                    <input
                                        type="text"
                                        placeholder={`Filter ${currentGroup.title.toLowerCase()} options...`}
                                        value={optionFilterText}
                                        onChange={(e) => setOptionFilterText(e.target.value)}
                                        className="w-full px-2.5 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg outline-none focus:bg-white focus:border-blue-500 transition"
                                    />
                                </div>
                            )}

                            {/* Checkbox Items Grid / List */}
                            <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                                {currentGroup.options.length === 0 ? (
                                    <div className="p-4 text-center text-xs text-gray-400 italic">
                                        No options available for this filter
                                    </div>
                                ) : (
                                    currentGroup.options
                                        .filter(opt => !optionFilterText || String(opt.label).toLowerCase().includes(optionFilterText.toLowerCase()))
                                        .map(option => {
                                            const isChecked = (selectedOptions[currentGroup.id] || []).includes(option.id)
                                            return (
                                                <label
                                                    key={String(option.id)}
                                                    className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all ${
                                                        isChecked
                                                            ? 'bg-blue-50/80 font-bold text-blue-900 border border-blue-200/80 shadow-2xs'
                                                            : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                                                    }`}
                                                >
                                                    <div className="flex items-center space-x-2.5 truncate">
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => onOptionToggle(currentGroup.id, option.id)}
                                                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                                                        />
                                                        {option.color && (
                                                            <span
                                                                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                                                                style={{ backgroundColor: option.color }}
                                                            ></span>
                                                        )}
                                                        {option.icon && (
                                                            <span className="flex-shrink-0 text-gray-500">
                                                                {option.icon}
                                                            </span>
                                                        )}
                                                        <span className="text-xs truncate">{option.label}</span>
                                                    </div>

                                                    {option.count !== undefined && (
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ml-2 flex-shrink-0 ${
                                                            isChecked
                                                                ? 'bg-blue-600 text-white'
                                                                : 'bg-gray-100 text-gray-600'
                                                        }`}>
                                                            {option.count}
                                                        </span>
                                                    )}
                                                </label>
                                            )
                                        })
                                )}
                            </div>
                        </div>
                    )}

                    {/* Dropdown Footer */}
                    <div className="px-4 py-2.5 bg-gray-50/80 border-t border-gray-200/80 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-gray-500">
                            {totalSelectedCount > 0
                                ? `${totalSelectedCount} filter(s) applied`
                                : 'Select checkboxes to filter records'}
                        </span>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-3 py-1 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg transition"
                        >
                            Done
                        </button>
                    </div>
                </div>
            )}

            {/* Active Filter Chips Bar (Shown only when filters or text are active) */}
            {(searchValue || totalSelectedCount > 0) && (
                <div className="flex items-center flex-wrap gap-1.5 text-xs">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mr-1">
                        Active:
                    </span>

                    {/* Search text chip */}
                    {searchValue && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs">
                            Search: "{searchValue}"
                            <button
                                type="button"
                                onClick={() => onSearchChange('')}
                                className="hover:text-blue-950 font-bold ml-0.5 text-xs"
                            >
                                ✕
                            </button>
                        </span>
                    )}

                    {/* Selected option chips */}
                    {groups.map(group => {
                        const selectedInGroup = selectedOptions[group.id] || []
                        return selectedInGroup.map(optId => {
                            const opt = group.options.find(o => o.id === optId) || { label: String(optId) }
                            return (
                                <span
                                    key={`${group.id}-${optId}`}
                                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 border border-gray-200 text-xs"
                                >
                                    <span className="text-gray-400 font-semibold">{group.title}:</span>
                                    <span className="font-bold">{opt.label}</span>
                                    <button
                                        type="button"
                                        onClick={() => onOptionToggle(group.id, optId)}
                                        className="hover:text-black font-bold ml-0.5 text-xs"
                                    >
                                        ✕
                                    </button>
                                </span>
                            )
                        })
                    })}

                    {/* Clear all link */}
                    <button
                        type="button"
                        onClick={onClearAll}
                        className="text-[11px] text-red-600 hover:text-red-800 font-bold hover:underline ml-1"
                    >
                        Clear All
                    </button>
                </div>
            )}
        </div>
    )
}
