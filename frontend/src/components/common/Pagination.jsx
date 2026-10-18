import React, { useMemo } from 'react';

/**
 * Reusable Modern Pagination Component
 * 
 * Props:
 * - currentPage: number (1-based index)
 * - totalItems: number (total count of filtered/matching items)
 * - pageSize: number (items per page)
 * - onPageChange: (page: number) => void
 * - onPageSizeChange?: (pageSize: number) => void
 * - pageSizeOptions?: number[] (e.g. [8, 12, 24, 48] or [10, 25, 50])
 * - itemLabel?: string (e.g. "equipment", "dealers", "users")
 * - scrollToTop?: boolean (whether to scroll up smoothly on page change)
 */
export default function Pagination({
    currentPage = 1,
    totalItems = 0,
    pageSize = 12,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 20, 50],
    itemLabel = 'records',
    scrollToTop = false,
    className = ''
}) {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

    const startIndex = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
    const endIndex = Math.min(safeCurrentPage * pageSize, totalItems);

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages || page === safeCurrentPage) return;
        if (onPageChange) onPageChange(page);
        if (scrollToTop) {
            window.scrollTo({ top: 180, behavior: 'smooth' });
        }
    };

    // Generate page numbers with smart ellipsis
    const pageNumbers = useMemo(() => {
        const pages = [];
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (safeCurrentPage > 3) {
                pages.push('ellipsis-start');
            }

            const start = Math.max(2, safeCurrentPage - 1);
            const end = Math.min(totalPages - 1, safeCurrentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (safeCurrentPage < totalPages - 2) {
                pages.push('ellipsis-end');
            }
            pages.push(totalPages);
        }
        return pages;
    }, [totalPages, safeCurrentPage]);

    if (totalItems === 0) return null;

    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:px-6 my-6 transition-all ${className}`}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Left Side: Range Display & Page Size Selector */}
                <div className="flex items-center flex-wrap gap-3 text-xs sm:text-sm text-gray-600">
                    <div>
                        Showing <span className="font-bold text-gray-900">{startIndex}</span> to{' '}
                        <span className="font-bold text-gray-900">{endIndex}</span> of{' '}
                        <span className="font-bold text-blue-600">{totalItems}</span> {itemLabel}
                    </div>

                    {onPageSizeChange && pageSizeOptions && pageSizeOptions.length > 0 && (
                        <div className="flex items-center gap-1.5 ml-0 sm:ml-2 pl-0 sm:pl-3 border-l-0 sm:border-l border-gray-200">
                            <label htmlFor="pagination-page-size" className="text-xs text-gray-500 whitespace-nowrap">
                                Per page:
                            </label>
                            <select
                                id="pagination-page-size"
                                value={pageSize}
                                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                                className="bg-gray-50 hover:bg-gray-100 border border-gray-300 text-gray-800 text-xs font-semibold rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                                {pageSizeOptions.map((opt) => (
                                    <option key={opt} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Right Side: Page Controls */}
                <div className="flex items-center space-x-1 sm:space-x-1.5">
                    {/* First Page */}
                    <button
                        type="button"
                        onClick={() => handlePageChange(1)}
                        disabled={safeCurrentPage === 1}
                        className={`p-2 rounded-xl text-xs font-medium transition-colors ${
                            safeCurrentPage === 1
                                ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 bg-white border border-gray-200 shadow-2xs'
                        }`}
                        title="First Page"
                        aria-label="First Page"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Previous Page */}
                    <button
                        type="button"
                        onClick={() => handlePageChange(safeCurrentPage - 1)}
                        disabled={safeCurrentPage === 1}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors ${
                            safeCurrentPage === 1
                                ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 bg-white border border-gray-200 shadow-2xs'
                        }`}
                        title="Previous Page"
                        aria-label="Previous Page"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        <span className="hidden sm:inline">Prev</span>
                    </button>

                    {/* Numbered Buttons */}
                    <div className="flex items-center space-x-1">
                        {pageNumbers.map((p, idx) => {
                            if (typeof p === 'string') {
                                return (
                                    <span key={`ellipsis-${idx}`} className="px-2 py-1 text-gray-400 text-xs select-none">
                                        ...
                                    </span>
                                );
                            }
                            const isCurrent = p === safeCurrentPage;
                            return (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => handlePageChange(p)}
                                    aria-current={isCurrent ? 'page' : undefined}
                                    className={`min-w-[34px] h-[34px] px-2 rounded-xl text-xs font-bold transition-all ${
                                        isCurrent
                                            ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-300'
                                            : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 bg-white border border-gray-200 shadow-2xs'
                                    }`}
                                >
                                    {p}
                                </button>
                            );
                        })}
                    </div>

                    {/* Next Page */}
                    <button
                        type="button"
                        onClick={() => handlePageChange(safeCurrentPage + 1)}
                        disabled={safeCurrentPage === totalPages}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-colors ${
                            safeCurrentPage === totalPages
                                ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                                : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 bg-white border border-gray-200 shadow-2xs'
                        }`}
                        title="Next Page"
                        aria-label="Next Page"
                    >
                        <span className="hidden sm:inline">Next</span>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                    </button>

                    {/* Last Page */}
                    <button
                        type="button"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={safeCurrentPage === totalPages}
                        className={`p-2 rounded-xl text-xs font-medium transition-colors ${
                            safeCurrentPage === totalPages
                                ? 'text-gray-300 cursor-not-allowed bg-gray-50'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 bg-white border border-gray-200 shadow-2xs'
                        }`}
                        title="Last Page"
                        aria-label="Last Page"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
