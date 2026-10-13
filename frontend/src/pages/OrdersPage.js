import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import UserContext from '../context/UserContext';
import RequestsList from '../components/RequestsList';
import GroupedRequestsList from '../components/GroupedRequestsList';
import RequestPopup from '../models/RequestPopup';
import ConfirmDialog from '../components/ConfirmDialog';
import Pagination from '../components/Pagination';
import { Link } from 'react-router-dom';
import { RefreshIcon, SparklesIcon, ClipboardListIcon } from '@heroicons/react/outline';

const OrdersPage = () => {
    const { user, loading } = useContext(UserContext);
    const [requests, setRequests] = useState([]);
    const [groupedRequests, setGroupedRequests] = useState([]);
    const [statusMessage, setStatusMessage] = useState('');
    const [messageType, setMessageType] = useState('success'); // 'success' or 'error'
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [requestsLoading, setRequestsLoading] = useState(true);
    const [fetchError, setFetchError] = useState(null);
    
    // Confirmation dialog state
    const [confirmDialog, setConfirmDialog] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: null,
        type: 'warning'
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 9; // 3x3 grid

    const apiUrl = process.env.REACT_APP_API_URL;

    // Show status message with auto-hide
    const showMessage = useCallback((message, type = 'success') => {
        setStatusMessage(message);
        setMessageType(type);
    }, []);

    // Auto-hide success/error message after 5s
    useEffect(() => {
        if (!statusMessage) return;
        const timer = setTimeout(() => setStatusMessage(''), 5000);
        return () => clearTimeout(timer);
    }, [statusMessage]);

    // Fetch requests
    const fetchRequests = useCallback(async () => {
        if (!user) return;
        
        setRequestsLoading(true);
        setFetchError(null);
        
        try {
            const url = user.role === 'admin'
                ? `${apiUrl}/requests/grouped`
                : `${apiUrl}/requests/${user.id}`;
            
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            
            if (user.role === 'admin') {
                setGroupedRequests(response.data);
            } else {
                setRequests(response.data);
            }
            
            setFetchError(null);
        } catch (error) {
            console.error('Error fetching requests:', error);
            
            let errorMessage = 'Failed to load requests. ';
            if (error.response?.status === 401) {
                errorMessage += 'Your session has expired. Please log in again.';
            } else if (error.response?.status === 403) {
                errorMessage += 'You do not have permission to access this data.';
            } else if (!error.response) {
                errorMessage += 'Check your internet connection.';
            } else {
                errorMessage += 'An unexpected error occurred.';
            }
            
            setFetchError(errorMessage);
            showMessage(errorMessage, 'error');
        } finally {
            setRequestsLoading(false);
        }
    }, [apiUrl, user, showMessage]);

    useEffect(() => {
        if (!loading && user) {
            fetchRequests();
        }
    }, [loading, user, fetchRequests]);

    // Create new request
    const createRequest = async (newRequest) => {
        if (!user) {
            showMessage('You must be logged in to create a request', 'error');
            return;
        }
        
        const formData = new FormData();
        formData.append('userId', user.id);
        formData.append('address', newRequest.address);
        formData.append('scrapType', newRequest.scrapType);
        formData.append('position', JSON.stringify(newRequest.position));

        newRequest.images.forEach((image) => {
            formData.append('images', image);
        });

        try {
            const response = await axios.post(`${apiUrl}/requests/create`, formData, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data',
                }
            });
            
            showMessage(response.data.message || 'Request created successfully', 'success');
            
            // Add new request to the beginning of the list
            setRequests(prev => [response.data.request, ...prev]);
            
            // Reset to first page to show new request
            setCurrentPage(1);
        } catch (error) {
            console.error('Error creating request:', error);
            
            let errorMessage = 'Failed to create the request. ';
            if (error.response?.status === 401) {
                errorMessage += 'Your session has expired.';
            } else if (error.response?.status === 400) {
                errorMessage += error.response.data.message || 'Invalid data.';
            } else if (error.response?.status === 403) {
                errorMessage += 'You do not have permission for this action.';
            } else {
                errorMessage += 'Please try again.';
            }
            
            showMessage(errorMessage, 'error');
            throw error; // Re-throw to let RequestPopup handle it
        }
    };

    // Update request status
    const updateRequestStatus = async (requestId, status = 'completed') => {
        if (!user) return;

        try {
            const response = await axios.put(`${apiUrl}/requests/update-status`, {
                requestId,
                status
            }, { 
                headers: { Authorization: `Bearer ${user.token}` } 
            });

            showMessage(response.data.message || `Request ${status === 'completed' ? 'completed' : 'canceled'} successfully`, 'success');

            if (user.role === 'admin') {
                // Update request in groupedRequests
                setGroupedRequests((prevGrouped) =>
                    prevGrouped.map((group) => ({
                        ...group,
                        requests: group.requests.map((request) =>
                            request._id === requestId 
                                ? { 
                                    ...request, 
                                    status,
                                    completedAt: status === 'completed' ? new Date().toISOString() : request.completedAt,
                                    canceledAt: status === 'canceled' ? new Date().toISOString() : request.canceledAt,
                                } 
                                : request
                        ),
                    }))
                );
            } else {
                // Update request in user requests
                setRequests((prevRequests) =>
                    prevRequests.map((request) =>
                        request.id === requestId 
                            ? { 
                                ...request, 
                                status,
                                completedAt: status === 'completed' ? new Date().toISOString() : request.completedAt,
                                canceledAt: status === 'canceled' ? new Date().toISOString() : request.canceledAt,
                            } 
                            : request
                    )
                );
            }
        } catch (error) {
            console.error('Error updating request status:', error);
            
            let errorMessage = 'Failed to update the request status. ';
            if (error.response?.status === 401) {
                errorMessage += 'Your session has expired.';
            } else if (error.response?.status === 403) {
                errorMessage += 'You do not have permission for this action.';
            } else if (error.response?.status === 404) {
                errorMessage += 'Request not found.';
            } else if (error.response?.status === 400) {
                errorMessage += error.response.data.message || 'Invalid data.';
            } else {
                errorMessage += 'Please try again.';
            }
            
            showMessage(errorMessage, 'error');
        }
    };

    // Cancel request with confirmation
    const cancelRequest = (requestId) => {
        setConfirmDialog({
            isOpen: true,
            title: 'Confirm Request Cancellation',
            message: 'Are you sure you want to cancel this request? This action cannot be undone.',
            type: 'warning',
            onConfirm: () => updateRequestStatus(requestId, 'canceled')
        });
    };

    // Delete request with confirmation
    const deleteRequest = (requestId) => {
        if (!user || user.role !== 'admin') {
            showMessage('You do not have permission to delete requests', 'error');
            return;
        }

        setConfirmDialog({
            isOpen: true,
            title: 'Confirm Request Deletion',
            message: 'Are you sure you want to permanently delete this request? This action cannot be undone.',
            type: 'danger',
            onConfirm: async () => {
                try {
                    await axios.delete(`${apiUrl}/requests/${requestId}`, {
                        headers: { Authorization: `Bearer ${user.token}` },
                    });

                    showMessage('Request deleted successfully', 'success');

                    // Remove request from groupedRequests
                    setGroupedRequests((prevGrouped) =>
                        prevGrouped
                            .map((group) => ({
                                ...group,
                                requests: group.requests.filter((request) => request._id !== requestId),
                            }))
                            .filter((group) => group.requests.length > 0)
                    );
                } catch (error) {
                    console.error('Error deleting request:', error);
                    
                    let errorMessage = 'Failed to delete the request. ';
                    if (error.response?.status === 401) {
                        errorMessage += 'Your session has expired.';
                    } else if (error.response?.status === 403) {
                        errorMessage += 'You do not have permission for this action.';
                    } else if (error.response?.status === 404) {
                        errorMessage += 'Request not found.';
                    } else {
                        errorMessage += 'Please try again.';
                    }
                    
                    showMessage(errorMessage, 'error');
                }
            }
        });
    };

    // Filter requests for regular users
    const filteredRequests = requests.filter(request =>
        request.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.scrapType.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination for regular users
    const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
    const paginatedRequests = filteredRequests.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const isError = messageType === 'error';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            {user ? (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                    {/* Hero Header with Gradient */}
                    <div className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-teal-500 to-blue-500 p-8 text-white shadow-2xl">
                        {/* Animated Background Shapes */}
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute -top-20 -right-20 h-40 w-40 animate-pulse rounded-full bg-white/10 blur-3xl"></div>
                            <div className="absolute -bottom-20 -left-20 h-40 w-40 animate-pulse rounded-full bg-white/10 blur-3xl delay-700"></div>
                        </div>

                        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                                    <ClipboardListIcon className="h-8 w-8" />
                                </div>
                                <div>
                                    <div className="mb-1 flex items-center gap-2">
                                        <SparklesIcon className="h-5 w-5" />
                                        <span className="text-sm font-medium text-green-100">
                                            {user.role === 'admin' ? 'Control Panel' : 'Your Personal Area'}
                                        </span>
                                    </div>
                                    <h1 className="text-3xl font-bold sm:text-4xl">
                                        {user.role === 'admin' ? 'Manage Requests' : 'Your Requests'}
                                    </h1>
                                    <p className="mt-1 text-sm text-green-50">
                                        {user.role === 'admin'
                                            ? 'View and manage all user requests'
                                            : 'Track and manage your requests with ease'}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Refresh button */}
                            <button
                                type="button"
                                onClick={fetchRequests}
                                disabled={requestsLoading}
                                className="flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-4 py-2.5 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
                                aria-label="Refresh"
                            >
                                <RefreshIcon className={`h-5 w-5 ${requestsLoading ? 'animate-spin' : ''}`} />
                                <span>Refresh</span>
                            </button>
                        </div>
                    </div>

                    {/* Status message toast - Enhanced */}
                    {statusMessage && (
                        <div
                            role="alert"
                            className={`mb-6 flex items-center gap-3 rounded-2xl border py-4 px-5 font-medium shadow-xl animate-slide-down backdrop-blur-sm ${
                                isError 
                                    ? 'border-red-200 bg-gradient-to-r from-red-50 to-red-100 text-red-800' 
                                    : 'border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-100 text-emerald-800'
                            }`}
                        >
                            {isError ? (
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            ) : (
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            )}
                            <span className="flex-1 text-sm font-semibold">{statusMessage}</span>
                            <button
                                type="button"
                                onClick={() => setStatusMessage('')}
                                className="shrink-0 rounded-lg p-1.5 transition hover:bg-black/5"
                                aria-label="Close"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    )}

                    {/* User-only: search and create - Enhanced */}
                    {user.role !== 'admin' && (
                        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-lg sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-1 items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    id="orders-search"
                                    type="text"
                                    placeholder="Search by address or scrap type..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setCurrentPage(1); // Reset to first page on search
                                    }}
                                    className="w-full flex-1 rounded-xl border-0 bg-gray-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsPopupOpen(true)}
                                className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-teal-600 px-6 py-3 font-bold text-white shadow-lg transition hover:from-green-700 hover:to-teal-700 hover:shadow-xl"
                            >
                                <svg className="h-5 w-5 transition group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="whitespace-nowrap">Create New Request</span>
                            </button>
                        </div>
                    )}

                    {/* Request creation popup */}
                    {isPopupOpen && (
                        <RequestPopup
                            onClose={() => setIsPopupOpen(false)}
                            onCreateRequest={async (newRequest) => {
                                await createRequest(newRequest);
                                setIsPopupOpen(false);
                            }}
                        />
                    )}

                    {/* Confirmation dialog */}
                    <ConfirmDialog
                        isOpen={confirmDialog.isOpen}
                        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                        onConfirm={confirmDialog.onConfirm}
                        title={confirmDialog.title}
                        message={confirmDialog.message}
                        type={confirmDialog.type}
                    />

                    {/* Loading state - Enhanced */}
                    {requestsLoading ? (
                        <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-200 bg-white py-20 shadow-lg">
                            <div className="relative mb-6">
                                <div className="h-20 w-20 animate-spin rounded-full border-4 border-gray-200 border-t-transparent border-t-green-600"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <ClipboardListIcon className="h-8 w-8 text-green-600" />
                                </div>
                            </div>
                            <p className="text-sm font-semibold text-gray-600">Loading requests...</p>
                            <p className="mt-1 text-xs text-gray-400">Please wait</p>
                        </div>
                    ) : fetchError ? (
                        /* Error state with retry - Enhanced */
                        <div className="overflow-hidden rounded-3xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100 shadow-xl">
                            <div className="p-12 text-center">
                                <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-pink-600 shadow-lg">
                                    <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-gray-900">Failed to load requests</h3>
                                <p className="mb-6 text-sm text-gray-700">{fetchError}</p>
                                <button
                                    type="button"
                                    onClick={fetchRequests}
                                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-pink-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:from-red-700 hover:to-pink-700"
                                >
                                    <RefreshIcon className="h-5 w-5" />
                                    Try Again
                                </button>
                            </div>
                        </div>
                    ) : user.role === 'admin' ? (
                        /* Admin view */
                        <GroupedRequestsList
                            groupedRequests={groupedRequests}
                            onUpdateStatus={updateRequestStatus}
                            onDeleteRequest={deleteRequest}
                            onCancelRequest={cancelRequest}
                        />
                    ) : filteredRequests.length > 0 ? (
                        /* User view with pagination */
                        <div className="space-y-6">
                            <RequestsList
                                requests={paginatedRequests}
                                onUpdateStatus={updateRequestStatus}
                                userRole={user.role}
                            />
                            
                            {totalPages > 1 && (
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    totalItems={filteredRequests.length}
                                    itemsPerPage={itemsPerPage}
                                    onPageChange={setCurrentPage}
                                />
                            )}
                        </div>
                    ) : (
                        /* Empty state - Enhanced */
                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-gradient-to-br from-white to-gray-50 shadow-xl">
                            <div className="p-12 text-center">
                                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-inner">
                                    <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="mb-2 text-2xl font-bold text-gray-900">
                                    {searchQuery ? 'No results found' : 'No requests yet'}
                                </h3>
                                <p className="mb-6 text-gray-600">
                                    {searchQuery 
                                        ? 'We could not find any requests matching your search. Try adjusting your search terms.' 
                                        : 'You have not created any requests yet. Start by creating your first request!'}
                                </p>
                                {!searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setIsPopupOpen(true)}
                                        className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-teal-600 px-8 py-4 text-base font-bold text-white shadow-lg transition hover:from-green-700 hover:to-teal-700 hover:shadow-xl"
                                    >
                                        <svg className="h-6 w-6 transition group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                        <span>Create New Request</span>
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                /* Not logged in state - Enhanced */
                <div className="flex min-h-screen items-center justify-center p-6">
                    <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
                        {/* Gradient Header */}
                        <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-teal-500 to-blue-500 p-8 text-center text-white">
                            <div className="absolute inset-0 overflow-hidden">
                                <div className="absolute -top-10 -right-10 h-32 w-32 animate-pulse rounded-full bg-white/10 blur-2xl"></div>
                                <div className="absolute -bottom-10 -left-10 h-32 w-32 animate-pulse rounded-full bg-white/10 blur-2xl delay-700"></div>
                            </div>
                            <div className="relative">
                                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                                    <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <h2 className="text-2xl font-bold">Login Required</h2>
                                <p className="mt-2 text-sm text-green-50">
                                    Join us to access the requests page
                                </p>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-8">
                            <p className="mb-6 text-center text-gray-600">
                                Please log in or create a new account to access the requests page and manage your requests.
                            </p>
                            <div className="space-y-3">
                                <Link
                                    to="/login"
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-teal-600 px-6 py-3.5 font-bold text-white shadow-lg transition hover:from-green-700 hover:to-teal-700"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                    Log in
                                </Link>
                                <Link
                                    to="/register"
                                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-gray-300 bg-white px-6 py-3.5 font-bold text-gray-700 transition hover:border-green-600 hover:bg-gray-50"
                                >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                    Create New Account
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
