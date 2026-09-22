import React, { useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { 
    SortAscendingIcon,
    CalendarIcon,
    LocationMarkerIcon 
} from '@heroicons/react/outline';

const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
};

// Get request id from API: user requests use "id", grouped use "_id"
const getRequestId = (request) => request.id || request._id;

// Sort options
const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'status', label: 'By Status' },
];

const RequestsList = ({ requests, onUpdateStatus, userRole }) => {
    const [sortBy, setSortBy] = useState('newest');
    const [filterStatus, setFilterStatus] = useState('all');

    // Sort and filter requests
    const getSortedAndFilteredRequests = () => {
        let filtered = [...requests];

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(req => req.status === filterStatus);
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'status':
                    const statusOrder = { pending: 0, completed: 1, canceled: 2 };
                    return statusOrder[a.status] - statusOrder[b.status];
                default:
                    return 0;
            }
        });

        return filtered;
    };

    const sortedRequests = getSortedAndFilteredRequests();

    // Count by status
    const statusCounts = {
        all: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        completed: requests.filter(r => r.status === 'completed').length,
        canceled: requests.filter(r => r.status === 'canceled').length,
    };

    return (
        <div className="space-y-6">
            {/* Filters and sorting - Enhanced */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
                <div className="bg-gradient-to-r from-gray-50 to-white p-4">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        {/* Status filter tabs */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setFilterStatus('all')}
                                className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                                    filterStatus === 'all'
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                All <span className="ml-1 text-xs">({statusCounts.all})</span>
                            </button>
                            <button
                                onClick={() => setFilterStatus('pending')}
                                className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                                    filterStatus === 'pending'
                                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg'
                                        : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                                }`}
                            >
                                Pending <span className="ml-1 text-xs">({statusCounts.pending})</span>
                            </button>
                            <button
                                onClick={() => setFilterStatus('completed')}
                                className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                                    filterStatus === 'completed'
                                        ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                                        : 'bg-green-50 text-green-800 hover:bg-green-100'
                                }`}
                            >
                                Completed <span className="ml-1 text-xs">({statusCounts.completed})</span>
                            </button>
                            <button
                                onClick={() => setFilterStatus('canceled')}
                                className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${
                                    filterStatus === 'canceled'
                                        ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg'
                                        : 'bg-red-50 text-red-800 hover:bg-red-100'
                                }`}
                            >
                                Canceled <span className="ml-1 text-xs">({statusCounts.canceled})</span>
                            </button>
                        </div>

                        {/* Sort dropdown */}
                        <div className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 px-3 py-2">
                            <SortAscendingIcon className="h-5 w-5 text-gray-600" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="border-0 bg-transparent text-sm font-semibold text-gray-700 focus:outline-none focus:ring-0"
                            >
                                {SORT_OPTIONS.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Requests grid - Enhanced Cards */}
            {sortedRequests.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {sortedRequests.map((request) => {
                        const requestId = getRequestId(request);
                        const isCompleted = request.status === 'completed';
                        const isCanceled = request.status === 'canceled';
                        const statusLabel = isCompleted ? 'Completed' : isCanceled ? 'Canceled' : 'Pending';

                        return (
                            <div
                                key={requestId}
                                className={`group overflow-hidden rounded-2xl border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                                    isCanceled 
                                        ? 'border-red-200 bg-gradient-to-br from-red-50 to-pink-50' 
                                        : isCompleted 
                                        ? 'border-green-200 bg-gradient-to-br from-green-50 to-teal-50' 
                                        : 'border-gray-200 bg-white shadow-lg'
                                }`}
                            >
                                {/* Image slider with overlay gradient */}
                                <div className="relative overflow-hidden">
                                    <Slider {...sliderSettings}>
                                        {request.images && request.images.length > 0 ? request.images.map((image, index) => (
                                            <div key={index} className="relative">
                                                <img 
                                                    src={image} 
                                                    alt={`Request ${index + 1}`} 
                                                    className="h-52 w-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                            </div>
                                        )) : (
                                            <div className="flex h-52 w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-sm text-gray-400">
                                                No images
                                            </div>
                                        )}
                                    </Slider>
                                    {/* Status badge - Positioned on image */}
                                    <div className="absolute left-3 top-3">
                                        <span className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-bold shadow-lg backdrop-blur-sm ${
                                            isCompleted 
                                                ? 'bg-gradient-to-r from-green-500 to-teal-600 text-white' 
                                                : isCanceled 
                                                ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white' 
                                                : 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                                        }`}>
                                            {isCompleted && '✓ '}
                                            {isCanceled && '✕ '}
                                            {statusLabel}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="space-y-4 p-5">
                                    {/* Title */}
                                    <h3 className="line-clamp-2 text-lg font-bold text-gray-900">
                                        {request.address}
                                    </h3>

                                    {/* Details */}
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
                                                <LocationMarkerIcon className="h-4 w-4 text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-gray-500">Scrap Type</p>
                                                <p className="truncate text-sm font-bold text-gray-900">{request.scrapType}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-2">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                                                <CalendarIcon className="h-4 w-4 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xs font-semibold text-gray-500">Created On</p>
                                                <p className="text-sm font-bold text-gray-900">
                                                    {new Date(request.createdAt).toLocaleDateString('en-US', { 
                                                        day: '2-digit', 
                                                        month: 'short', 
                                                        year: 'numeric' 
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        {request.completedAt && (
                                            <div className="rounded-lg border border-green-200 bg-gradient-to-r from-green-50 to-teal-50 p-2 text-green-800">
                                                <p className="flex items-center gap-1 text-xs font-bold">
                                                    <CalendarIcon className="h-4 w-4" />
                                                    Completed on: {new Date(request.completedAt).toLocaleDateString('en-US', { 
                                                        day: '2-digit', 
                                                        month: 'short' 
                                                    })}
                                                </p>
                                            </div>
                                        )}

                                        {request.canceledAt && (
                                            <div className="rounded-lg border border-red-200 bg-gradient-to-r from-red-50 to-pink-50 p-2 text-red-800">
                                                <p className="flex items-center gap-1 text-xs font-bold">
                                                    <CalendarIcon className="h-4 w-4" />
                                                    Canceled on: {new Date(request.canceledAt).toLocaleDateString('en-US', { 
                                                        day: '2-digit', 
                                                        month: 'short' 
                                                    })}
                                                </p>
                                            </div>
                                        )}

                                        {request.notes && (
                                            <div className="rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-3">
                                                <p className="text-xs font-bold text-blue-900">
                                                    💬 {request.notes}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Admin action button */}
                                    {userRole === 'admin' && (
                                        <button
                                            type="button"
                                            onClick={() => onUpdateStatus(requestId, 'completed')}
                                            disabled={isCompleted}
                                            className={`w-full rounded-xl py-3 text-sm font-bold shadow-lg transition-all ${
                                                isCompleted 
                                                    ? 'cursor-not-allowed bg-gray-200 text-gray-500' 
                                                    : 'bg-gradient-to-r from-green-600 to-teal-600 text-white hover:from-green-700 hover:to-teal-700 hover:shadow-xl'
                                            }`}
                                        >
                                            {isCompleted ? '✓ Completed' : 'Confirm Completion'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 p-12 text-center shadow-lg">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200">
                        <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <p className="text-lg font-semibold text-gray-700">
                        {filterStatus !== 'all' 
                            ? `No ${filterStatus === 'pending' ? 'pending' : filterStatus === 'completed' ? 'completed' : 'canceled'} requests.`
                            : 'No requests.'
                        }
                    </p>
                </div>
            )}
        </div>
    );
};

export default RequestsList;
