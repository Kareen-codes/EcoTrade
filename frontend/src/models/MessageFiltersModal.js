// Message Filters Modal - Advanced Filtering Options
import React, { useState, useEffect } from 'react';
import { 
    XIcon, 
    FilterIcon,
    SearchIcon,
    CalendarIcon,
    RefreshIcon
} from '@heroicons/react/outline';

/**
 * MessageFiltersModal - Advanced filtering for messages
 * Features: search, date range, sort options
 */
const MessageFiltersModal = ({ 
    isOpen, 
    onClose, 
    onApplyFilters,
    currentFilters = {}
}) => {
    const [filters, setFilters] = useState({
        searchQuery: '',
        dateFrom: '',
        dateTo: '',
        sortBy: 'newest',
        ...currentFilters
    });

    // Close modal on Escape key press
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
        }
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleApply = () => {
        onApplyFilters(filters);
        onClose();
    };

    const handleReset = () => {
        const resetFilters = {
            searchQuery: '',
            dateFrom: '',
            dateTo: '',
            sortBy: 'newest'
        };
        setFilters(resetFilters);
        onApplyFilters(resetFilters);
    };

    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'oldest', label: 'Oldest First' },
        { value: 'name-asc', label: 'Name (A-Z)' },
        { value: 'name-desc', label: 'Name (Z-A)' }
    ];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Decorative gradient header */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-8 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                            <FilterIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Advanced Filters</h2>
                            <p className="text-sm text-gray-500">Refine your search results</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
                        aria-label="Close"
                    >
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Filter Content */}
                <div className="px-6 py-6 space-y-5 max-h-[60vh] overflow-y-auto">
                    {/* Search Query */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Search Messages
                        </label>
                        <div className="relative">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={filters.searchQuery}
                                onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
                                placeholder="Search by name, email, or message content..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Date Range */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <CalendarIcon className="inline w-4 h-4 mr-1" />
                            Date Range
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">From date</label>
                                <input
                                    type="date"
                                    value={filters.dateFrom}
                                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">To date</label>
                                <input
                                    type="date"
                                    value={filters.dateTo}
                                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sort Options */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Sort By
                        </label>
                        <select
                            value={filters.sortBy}
                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                        >
                            {sortOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Active Filters Summary */}
                    {(filters.searchQuery || filters.dateFrom || filters.dateTo) && (
                        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                            <p className="text-sm font-semibold text-indigo-900 mb-2">Active Filters:</p>
                            <div className="flex flex-wrap gap-2">
                                {filters.searchQuery && (
                                    <span className="px-3 py-1 bg-white text-indigo-700 text-xs font-medium rounded-full border border-indigo-300">
                                        Search: {filters.searchQuery}
                                    </span>
                                )}
                                {(filters.dateFrom || filters.dateTo) && (
                                    <span className="px-3 py-1 bg-white text-indigo-700 text-xs font-medium rounded-full border border-indigo-300">
                                        Date Range
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
                    <button
                        onClick={handleReset}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-gray-700 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200"
                    >
                        <RefreshIcon className="w-5 h-5" />
                        Reset
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-lg shadow-indigo-500/30"
                    >
                        <FilterIcon className="w-5 h-5" />
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MessageFiltersModal;
