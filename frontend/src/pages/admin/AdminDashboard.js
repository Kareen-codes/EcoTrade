// Admin Dashboard - Real Data from Backend
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    UsersIcon,
    ShoppingBagIcon,
    CollectionIcon,
    CubeIcon,
    ChatAlt2Icon,
    ClockIcon
} from '@heroicons/react/outline';
import { Doughnut } from 'react-chartjs-2';
import { API_BASE_URL } from '../../config/api';

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        users: { total: 0 },
        requests: { 
            total: 0, 
            pending: 0, 
            completed: 0, 
            canceled: 0 
        },
        auctions: { 
            total: 0, 
            active: 0, 
            closed: 0 
        },
        scrap: { total: 0 },
        messages: { total: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchRealStats();
    }, []);

    const fetchRealStats = async () => {
        try {
            setLoading(true);
            
            // Fetch all data in parallel
            const [usersRes, requestsRes, auctionsRes, scrapRes, messagesRes] = await Promise.all([
                fetch(`${API_BASE_URL}/users/users`),
                fetch(`${API_BASE_URL}/requests/grouped`),
                fetch(`${API_BASE_URL}/auction`),
                fetch(`${API_BASE_URL}/scrap`),
                fetch(`${API_BASE_URL}/messages`)
            ]);

            const usersData = await usersRes.json();
            const requestsData = await requestsRes.json();
            const auctionsData = await auctionsRes.json();
            const scrapData = await scrapRes.json();
            const messagesData = await messagesRes.json();

            // Calculate request statistics
            let totalRequests = 0;
            let pendingRequests = 0;
            let completedRequests = 0;
            let canceledRequests = 0;

            if (Array.isArray(requestsData)) {
                requestsData.forEach(group => {
                    if (group.requests && Array.isArray(group.requests)) {
                        totalRequests += group.requests.length;
                        group.requests.forEach(req => {
                            if (req.status === 'completed') completedRequests++;
                            else if (req.status === 'canceled') canceledRequests++;
                            else pendingRequests++;
                        });
                    }
                });
            }

            // Calculate auction statistics
            const activeAuctions = auctionsData.filter(a => a.status === 'open' || a.status === 'active').length;
            const closedAuctions = auctionsData.filter(a => a.status === 'closed').length;

            setStats({
                users: { 
                    total: usersData.users?.length || 0 
                },
                requests: {
                    total: totalRequests,
                    pending: pendingRequests,
                    completed: completedRequests,
                    canceled: canceledRequests
                },
                auctions: {
                    total: auctionsData.length || 0,
                    active: activeAuctions,
                    closed: closedAuctions
                },
                scrap: { 
                    total: scrapData.length || 0 
                },
                messages: { 
                    total: messagesData.length || 0 
                }
            });

        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            setError('An error occurred while loading the statistics');
        } finally {
            setLoading(false);
        }
    };

    const StatCard = ({ title, value, subtitle, icon: Icon, color, link }) => (
        <Link to={link} className="block group">
            <div className={`bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border-l-4 ${color}`}>
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${color.replace('border', 'bg').replace('600', '100')} group-hover:scale-110 transition-transform duration-300`}>
                        <Icon className={`h-8 w-8 ${color.replace('border', 'text')}`} />
                    </div>
                </div>
                <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
                <p className="text-3xl font-bold text-gray-800">{value.toLocaleString()}</p>
                {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
            </div>
        </Link>
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <div className="spinner"></div>
                <p className="text-gray-600">Loading statistics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="bg-white rounded-xl shadow-lg p-12 text-center max-w-md">
                    <svg className="mx-auto h-16 w-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{error}</h3>
                    <button 
                        onClick={fetchRealStats}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-8 text-white">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Welcome to the Dashboard 👋</h1>
                        <p className="text-blue-100">An overview of platform statistics</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white bg-opacity-20 px-4 py-3 rounded-lg">
                        <ClockIcon className="h-5 w-5" />
                        <span className="text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats.users.total}
                    subtitle="Platform users"
                    icon={UsersIcon}
                    color="border-blue-600"
                    link="/users"
                />
                <StatCard
                    title="Total Requests"
                    value={stats.requests.total}
                    subtitle={`${stats.requests.pending} pending`}
                    icon={ShoppingBagIcon}
                    color="border-green-600"
                    link="/orders"
                />
                <StatCard
                    title="Auctions"
                    value={stats.auctions.total}
                    subtitle={`${stats.auctions.active} active`}
                    icon={CollectionIcon}
                    color="border-purple-600"
                    link="/auctions"
                />
                <StatCard
                    title="Available Materials"
                    value={stats.scrap.total}
                    subtitle="Recyclable materials"
                    icon={CubeIcon}
                    color="border-yellow-600"
                    link="/scrap"
                />
                <StatCard
                    title="Messages"
                    value={stats.messages.total}
                    subtitle="Customer messages"
                    icon={ChatAlt2Icon}
                    color="border-red-600"
                    link="/contact"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Request Status Distribution */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Request Status Distribution</h2>
                    {stats.requests.total > 0 ? (
                        <div className="h-64 flex items-center justify-center">
                            <Doughnut
                                data={{
                                    labels: ['Completed', 'Pending', 'Canceled'],
                                    datasets: [{
                                        data: [
                                            stats.requests.completed, 
                                            stats.requests.pending, 
                                            stats.requests.canceled
                                        ],
                                        backgroundColor: [
                                            'rgb(34, 197, 94)',
                                            'rgb(251, 191, 36)',
                                            'rgb(239, 68, 68)'
                                        ],
                                        borderWidth: 2,
                                        borderColor: '#fff'
                                    }]
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,                                        plugins: {
                                        legend: {
                                            position: 'bottom',
                                            rtl: false,
                                            labels: {
                                                padding: 15,
                                                font: {
                                                    size: 12
                                                }
                                            }
                                        },
                                        tooltip: {
                                            callbacks: {
                                                label: function(context) {
                                                    const label = context.label || '';
                                                    const value = context.parsed;
                                                    const total = stats.requests.total;
                                                    const percentage = ((value / total) * 100).toFixed(1);
                                                    return `${label}: ${value} (${percentage}%)`;
                                                }
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            No requests at the moment
                        </div>
                    )}
                    <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 bg-green-50 rounded-lg">
                            <p className="text-2xl font-bold text-green-600">{stats.requests.completed}</p>
                            <p className="text-xs text-gray-600">Completed</p>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded-lg">
                            <p className="text-2xl font-bold text-yellow-600">{stats.requests.pending}</p>
                            <p className="text-xs text-gray-600">Pending</p>
                        </div>
                        <div className="p-3 bg-red-50 rounded-lg">
                            <p className="text-2xl font-bold text-red-600">{stats.requests.canceled}</p>
                            <p className="text-xs text-gray-600">Canceled</p>
                        </div>
                    </div>
                </div>

                {/* Auction Status */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Auction Status</h2>
                    {stats.auctions.total > 0 ? (
                        <div className="h-64 flex items-center justify-center">
                            <Doughnut
                                data={{
                                    labels: ['Active', 'Closed'],
                                    datasets: [{
                                        data: [stats.auctions.active, stats.auctions.closed],
                                        backgroundColor: [
                                            'rgb(147, 51, 234)',
                                            'rgb(156, 163, 175)'
                                        ],
                                        borderWidth: 2,
                                        borderColor: '#fff'
                                    }]
                                }}
                                options={{
                                    responsive: true,
                                    maintainAspectRatio: false,                                        plugins: {
                                        legend: {
                                            position: 'bottom',
                                            rtl: false,
                                            labels: {
                                                padding: 15,
                                                font: {
                                                    size: 12
                                                }
                                            }
                                        },
                                        tooltip: {
                                            callbacks: {
                                                label: function(context) {
                                                    const label = context.label || '';
                                                    const value = context.parsed;
                                                    const total = stats.auctions.total;
                                                    const percentage = ((value / total) * 100).toFixed(1);
                                                    return `${label}: ${value} (${percentage}%)`;
                                                }
                                            }
                                        }
                                    }
                                }}
                            />
                        </div>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            No auctions at the moment
                        </div>
                    )}
                    <div className="mt-4 grid grid-cols-2 gap-4 text-center">
                        <div className="p-3 bg-purple-50 rounded-lg">
                            <p className="text-2xl font-bold text-purple-600">{stats.auctions.active}</p>
                            <p className="text-xs text-gray-600">Active auctions</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-2xl font-bold text-gray-600">{stats.auctions.closed}</p>
                            <p className="text-xs text-gray-600">Closed auctions</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link to="/users" className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:from-blue-100 hover:to-blue-200 transition-all duration-300 transform hover:scale-105 border border-blue-200">
                        <UsersIcon className="h-10 w-10 text-blue-600" />
                        <span className="text-sm font-semibold text-gray-800 text-center">Manage Users</span>
                    </Link>
                    <Link to="/auctions" className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl hover:from-purple-100 hover:to-purple-200 transition-all duration-300 transform hover:scale-105 border border-purple-200">
                        <CollectionIcon className="h-10 w-10 text-purple-600" />
                        <span className="text-sm font-semibold text-gray-800 text-center">Manage Auctions</span>
                    </Link>
                    <Link to="/scrap" className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl hover:from-yellow-100 hover:to-yellow-200 transition-all duration-300 transform hover:scale-105 border border-yellow-200">
                        <CubeIcon className="h-10 w-10 text-yellow-600" />
                        <span className="text-sm font-semibold text-gray-800 text-center">Manage Materials</span>
                    </Link>
                    <Link to="/contact" className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl hover:from-red-100 hover:to-red-200 transition-all duration-300 transform hover:scale-105 border border-red-200">
                        <ChatAlt2Icon className="h-10 w-10 text-red-600" />
                        <span className="text-sm font-semibold text-gray-800 text-center">Messages</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
