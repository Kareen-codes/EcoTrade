import React, { useEffect, useState, useMemo } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import { 
    Chart as ChartJS, 
    Title, 
    Tooltip, 
    Legend, 
    LineElement, 
    CategoryScale, 
    LinearScale, 
    PointElement,
    ArcElement
} from 'chart.js';
import { 
    MailIcon, 
    FilterIcon, 
    SearchIcon, 
    InboxIcon, 
    CheckCircleIcon,
    ClockIcon,
    TrendingUpIcon,
    ArchiveIcon
} from '@heroicons/react/outline';
import { API_BASE_URL } from '../../config/api';
import MessageDetailsModal from '../../models/MessageDetailsModal';
import MessageFiltersModal from '../../models/MessageFiltersModal';
import ConfirmModal from '../../models/ConfirmModal';

// Register chart elements
ChartJS.register(
    Title, 
    Tooltip, 
    Legend, 
    LineElement, 
    CategoryScale, 
    LinearScale, 
    PointElement,
    ArcElement
);

/**
 * Get initials from customer name for avatar
 */
const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

/**
 * AdminContact - Modern Messages Management Dashboard
 * Features: analytics, filtering, search, responsive design
 */
const AdminContact = () => {
    // State management
    const [messages, setMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showFiltersModal, setShowFiltersModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [messageToDelete, setMessageToDelete] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        searchQuery: '',
        dateFrom: '',
        dateTo: '',
        sortBy: 'newest'
    });

    // Fetch messages from API
    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/messages`);
            const data = await response.json();
            setMessages(data);
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle message click to show details
    const handleMessageClick = (message) => {
        setSelectedMessage(message);
        setShowDetailsModal(true);
    };

    // Handle delete message
    const handleDeleteClick = (message, e) => {
        if (e) e.stopPropagation();
        setMessageToDelete(message);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (!messageToDelete) return;

        try {
            const response = await fetch(`${API_BASE_URL}/messages/${messageToDelete._id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setMessages(messages.filter(msg => msg._id !== messageToDelete._id));
                setShowDeleteConfirm(false);
                setMessageToDelete(null);
                if (selectedMessage && selectedMessage._id === messageToDelete._id) {
                    setSelectedMessage(null);
                    setShowDetailsModal(false);
                }
            } else {
                console.error('Error deleting message:', response.statusText);
            }
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    // Apply filters and search
    const filteredMessages = useMemo(() => {
        let filtered = [...messages];

        // Apply search query
        const query = filters.searchQuery.toLowerCase() || searchQuery.toLowerCase();
        if (query) {
            filtered = filtered.filter(msg => 
                msg.customerName?.toLowerCase().includes(query) ||
                msg.email?.toLowerCase().includes(query) ||
                msg.message?.toLowerCase().includes(query)
            );
        }

        // Apply date range filter
        if (filters.dateFrom) {
            const fromDate = new Date(filters.dateFrom);
            filtered = filtered.filter(msg => new Date(msg.createdAt) >= fromDate);
        }
        if (filters.dateTo) {
            const toDate = new Date(filters.dateTo);
            toDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(msg => new Date(msg.createdAt) <= toDate);
        }

        // Apply sorting
        filtered.sort((a, b) => {
            switch (filters.sortBy) {
                case 'oldest':
                    return new Date(a.createdAt) - new Date(b.createdAt);
                case 'name-asc':
                    return a.customerName.localeCompare(b.customerName);
                case 'name-desc':
                    return b.customerName.localeCompare(a.customerName);
                case 'newest':
                default:
                    return new Date(b.createdAt) - new Date(a.createdAt);
            }
        });

        return filtered;
    }, [messages, filters, searchQuery]);

    // Calculate statistics
    const stats = useMemo(() => {
        const total = messages.length;

        // Calculate messages per day for trend
        const today = new Date();
        const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const recentMessages = messages.filter(m => new Date(m.createdAt) >= lastWeek).length;
        const avgPerDay = (recentMessages / 7).toFixed(1);

        // Calculate today's messages
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayMessages = messages.filter(m => new Date(m.createdAt) >= todayStart).length;

        // Calculate this week's messages
        const thisWeekMessages = recentMessages;

        return { total, avgPerDay, todayMessages, thisWeekMessages };
    }, [messages]);

    // Prepare chart data for timeline
    const timelineChartData = useMemo(() => {
        const dates = {};
        messages.forEach(msg => {
            const date = new Date(msg.createdAt).toLocaleDateString('en-GB');
            dates[date] = (dates[date] || 0) + 1;
        });

        const sortedDates = Object.keys(dates).sort((a, b) => {
            return new Date(a.split('/').reverse().join('-')) - new Date(b.split('/').reverse().join('-'));
        });

        return {
            labels: sortedDates.slice(-14), // Last 14 days
            datasets: [
                {
                    label: 'Messages per Day',
                    data: sortedDates.slice(-14).map(date => dates[date]),
                    fill: true,
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderColor: 'rgba(99, 102, 241, 1)',
                    borderWidth: 2,
                    tension: 0.4,
                    pointBackgroundColor: 'rgba(99, 102, 241, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                },
            ],
        };
    }, [messages]);

    // Prepare status distribution chart
    const statusChartData = useMemo(() => {
        // Group messages by month
        const monthCounts = {};
        messages.forEach(msg => {
            const month = new Date(msg.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            monthCounts[month] = (monthCounts[month] || 0) + 1;
        });

        const sortedMonths = Object.keys(monthCounts).slice(-6); // Last 6 months

        return {
            labels: sortedMonths,
            datasets: [
                {
                    label: 'Number of Messages',
                    data: sortedMonths.map(month => monthCounts[month]),
                    backgroundColor: 'rgba(99, 102, 241, 0.8)',
                    borderColor: 'rgba(99, 102, 241, 1)',
                    borderWidth: 2,
                },
            ],
        };
    }, [messages]);

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                borderRadius: 8,
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1
                }
            }
        }
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom',
            },
        },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                                <MailIcon className="w-8 h-8 text-white" />
                            </div>
                            Manage Messages
                        </h1>
                        <p className="text-gray-600">Monitor and manage customer messages</p>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {/* Total Messages */}
                    <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-gray-100 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Total Messages</p>
                                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-xl">
                                <InboxIcon className="w-8 h-8 text-indigo-600" />
                            </div>
                        </div>
                    </div>

                    {/* Today's Messages */}
                    <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-blue-200 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Today's Messages</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.todayMessages}</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl">
                                <ClockIcon className="w-8 h-8 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    {/* This Week's Messages */}
                    <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-emerald-200 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">This Week's Messages</p>
                                <p className="text-3xl font-bold text-emerald-600">{stats.thisWeekMessages}</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl">
                                <CheckCircleIcon className="w-8 h-8 text-emerald-600" />
                            </div>
                        </div>
                    </div>

                    {/* Average per Day */}
                    <div className="bg-white rounded-2xl p-5 shadow-lg border-2 border-purple-200 hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">Daily Average</p>
                                <p className="text-3xl font-bold text-purple-600">{stats.avgPerDay}</p>
                            </div>
                            <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl">
                                <TrendingUpIcon className="w-8 h-8 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Timeline Chart */}
                    <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <ClockIcon className="w-5 h-5 text-indigo-600" />
                            Message Timeline (Last 14 Days)
                        </h3>
                        <div className="h-64">
                            <Line data={timelineChartData} options={chartOptions} />
                        </div>
                    </div>

                    {/* Monthly Distribution Chart */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <ArchiveIcon className="w-5 h-5 text-indigo-600" />
                            Monthly Message Distribution
                        </h3>
                        <div className="h-64">
                            <Doughnut data={statusChartData} options={doughnutOptions} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-200 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name, email, or message content..."
                            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* Filter Button */}
                    <button
                        onClick={() => setShowFiltersModal(true)}
                        className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30"
                    >
                        <FilterIcon className="w-5 h-5" />
                        Advanced Filters
                        {(filters.dateFrom || filters.dateTo) && (
                            <span className="px-2 py-0.5 bg-white text-indigo-600 text-xs font-bold rounded-full">
                                Active
                            </span>
                        )}
                    </button>
                </div>

                {/* Active Filters Display */}
                {(filters.dateFrom || filters.dateTo || filters.searchQuery) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-gray-700">Active Filters:</span>
                            {filters.searchQuery && (
                                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-full border border-indigo-300">
                                    Search: {filters.searchQuery}
                                </span>
                            )}
                            {(filters.dateFrom || filters.dateTo) && (
                                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full border border-purple-300">
                                    Date Range
                                </span>
                            )}
                            <button
                                onClick={() => setFilters({
                                    searchQuery: '',
                                    dateFrom: '',
                                    dateTo: '',
                                    sortBy: 'newest'
                                })}
                                className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full border border-red-300 hover:bg-red-200 transition"
                            >
                                Clear All
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Messages Table */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
                        </div>
                    ) : filteredMessages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                            <MailIcon className="w-16 h-16 mb-4 text-gray-300" />
                            <p className="text-lg font-semibold">No messages</p>
                            <p className="text-sm">Try adjusting the search or filters</p>
                        </div>
                    ) : (
                        <table className="min-w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Message
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredMessages.map((message, index) => {
                                    return (
                                        <tr
                                            key={message._id}
                                            onClick={() => handleMessageClick(message)}
                                            className="hover:bg-indigo-50 cursor-pointer transition-all duration-200 group"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm font-bold shadow-md">
                                                        {getInitials(message.customerName)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {message.customerName}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-700">{message.email}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm text-gray-700 line-clamp-2 max-w-md">
                                                    {message.message}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {new Date(message.createdAt).toLocaleDateString('en-US', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={(e) => handleDeleteClick(message, e)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                                    title="Delete Message"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Table Footer with Results Count */}
                {!loading && filteredMessages.length > 0 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            Showing <span className="font-semibold text-gray-900">{filteredMessages.length}</span> of{' '}
                            <span className="font-semibold text-gray-900">{messages.length}</span> message{messages.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                )}
            </div>

            {/* Modals */}
            {showDetailsModal && selectedMessage && (
                <MessageDetailsModal
                    message={selectedMessage}
                    onClose={() => {
                        setShowDetailsModal(false);
                        setSelectedMessage(null);
                    }}
                    onDelete={(id) => handleDeleteClick(selectedMessage)}
                />
            )}

            {showFiltersModal && (
                <MessageFiltersModal
                    isOpen={showFiltersModal}
                    onClose={() => setShowFiltersModal(false)}
                    onApplyFilters={setFilters}
                    currentFilters={filters}
                />
            )}

            {showDeleteConfirm && (
                <ConfirmModal
                    isOpen={showDeleteConfirm}
                    onClose={() => {
                        setShowDeleteConfirm(false);
                        setMessageToDelete(null);
                    }}
                    onConfirm={handleDeleteConfirm}
                    title="Delete Message"
                    message={`Are you sure you want to delete the message from ${messageToDelete?.customerName}? This action cannot be undone.`}
                    type="danger"
                    confirmText="Delete"
                    cancelText="Cancel"
                />
            )}
        </div>
    );
};

export default AdminContact;
