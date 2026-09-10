import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/outline';

// Reusable pagination component
const Pagination = ({ 
    currentPage, 
    totalPages, 
    totalItems,
    itemsPerPage,
    onPageChange 
}) => {
    // Don't render if only one page or no items
    if (totalPages <= 1) return null;

    // Calculate range of items shown
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pages = [];
        const maxPagesToShow = 5;

        if (totalPages <= maxPagesToShow) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Show smart pagination
            pages.push(1);

            let startPage = Math.max(2, currentPage - 1);
            let endPage = Math.min(totalPages - 1, currentPage + 1);

            if (currentPage <= 2) {
                endPage = 3;
            } else if (currentPage >= totalPages - 1) {
                startPage = totalPages - 2;
            }

            if (startPage > 2) {
                pages.push('...');
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            if (endPage < totalPages - 1) {
                pages.push('...');
            }

            pages.push(totalPages);
        }

        return pages;
    };

    const pages = getPageNumbers();

    return (
        <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row">
            {/* Items info */}
            <p className="text-sm text-gray-600">
                Showing <span className="font-medium text-gray-800">{startItem}</span> to{' '}
                <span className="font-medium text-gray-800">{endItem}</span> of{' '}
                <span className="font-medium text-gray-800">{totalItems}</span> items
            </p>

            {/* Page numbers */}
            <div className="flex items-center gap-2">
                {/* Previous button */}
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                        currentPage === 1
                            ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    aria-label="Previous page"
                >
                    <ChevronLeftIcon className="h-4 w-4" />
                </button>

                {/* Page numbers */}
                {pages.map((page, index) => (
                    page === '...' ? (
                        <span key={`ellipsis-${index}`} className="flex h-9 w-9 items-center justify-center text-gray-400">
                            ...
                        </span>
                    ) : (
                        <button
                            key={page}
                            type="button"
                            onClick={() => onPageChange(page)}
                            className={`flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-medium transition ${
                                currentPage === page
                                    ? 'border-blue-600 bg-blue-600 text-white'
                                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                            aria-label={`Page ${page}`}
                            aria-current={currentPage === page ? 'page' : undefined}
                        >
                            {page}
                        </button>
                    )
                ))}

                {/* Next button */}
                <button
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                        currentPage === totalPages
                            ? 'cursor-not-allowed border-gray-200 bg-gray-50 text-gray-400'
                            : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                    aria-label="Next page"
                >
                    <ChevronRightIcon className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
