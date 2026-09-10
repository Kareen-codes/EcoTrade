// Modern Auction Statistics Component - Enhanced UI/UX
import React, { useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import {
    CollectionIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    TrendingUpIcon,
    CurrencyDollarIcon,
    ChevronDownIcon,
    ChevronUpIcon,
} from '@heroicons/react/outline';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const AuctionStatistics = ({ auctions }) => {
    const [showCharts, setShowCharts] = useState(false);
    const totalAuctions = auctions.length;

    // If no auctions, show empty state
    if (totalAuctions === 0) {
        return (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 mb-3">
                    <CollectionIcon className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No statistics</h3>
                <p className="text-sm text-gray-500">Start creating auctions to see statistics</p>
            </div>
        );
    }

    // Calculate statistics
    const openAuctions = auctions.filter(a => a.status === 'open').length;
    const closedAuctions = auctions.filter(a => a.status === 'closed').length;
    const canceledAuctions = auctions.filter(a => a.status === 'canceled').length;
    
    const totalStartPrice = auctions.reduce((sum, a) => sum + (a.startPrice || 0), 0);
    const averageStartPrice = totalAuctions ? (totalStartPrice / totalAuctions).toFixed(0) : 0;
    
    const totalCurrentBids = auctions.reduce((sum, a) => sum + (a.currentBid || a.startPrice || 0), 0);
    const averageCurrentBid = totalAuctions ? (totalCurrentBids / totalAuctions).toFixed(0) : 0;
    
    const highestBid = Math.max(...auctions.map(a => a.currentBid || a.startPrice || 0), 0);

    // Auctions ending soon (within 24 hours)
    const endingSoonCount = auctions.filter(a => {
        const timeLeft = new Date(a.endDate) - new Date();
        return a.status === 'open' && timeLeft > 0 && timeLeft < 86400000;
    }).length;

    // Category breakdown
    const categoryStats = auctions.reduce((acc, auction) => {
        acc[auction.category] = (acc[auction.category] || 0) + 1;
        return acc;
    }, {});

    // Doughnut chart for status
    const statusChartData = {
        labels: ['Active', 'Closed', 'Canceled'],
        datasets: [{
            data: [openAuctions, closedAuctions, canceledAuctions],
            backgroundColor: ['#10b981', '#6b7280', '#ef4444'].map(c => c + 'cc'),
            borderColor: ['#10b981', '#6b7280', '#ef4444'],
            borderWidth: 2,
        }],
    };

    const statusChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'bottom', labels: { padding: 15, font: { size: 11 } } },
            tooltip: {
                callbacks: {
                    label: (ctx) => {
                        const value = ctx.raw;
                        const pct = totalAuctions ? ((value / totalAuctions) * 100).toFixed(1) : 0;
                        return `${ctx.label}: ${value} (${pct}%)`;
                    },
                },
            },
        },
    };

    // Bar chart for categories
    const categoryLabels = Object.keys(categoryStats);
    const categoryData = Object.values(categoryStats);
    
    const categoryChartData = {
        labels: categoryLabels.map(cat => {
            const map = {
                'Metals': 'Metals',
                'Plastics': 'Plastics',
                'Electronics': 'Electronics',
                'Paper and Cardboard': 'Paper and Cardboard',
                'Furniture': 'Furniture',
            };
            return map[cat] || cat;
        }),
        datasets: [{
            label: 'Number of Auctions',
            data: categoryData,
            backgroundColor: 'rgba(59, 130, 246, 0.8)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 2,
            borderRadius: 8,
        }],
    };

    const categoryChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                callbacks: {
                    label: (ctx) => `${ctx.label}: ${ctx.raw} auction${ctx.raw !== 1 ? 's' : ''}`,
                },
            },
        },
        scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 } },
        },
    };

    const statCards = [
        {
            label: 'Total Auctions',
            value: totalAuctions,
            icon: CollectionIcon,
            bg: 'bg-blue-100',
            text: 'text-blue-700',
            iconColor: 'text-blue-600',
        },
        {
            label: 'Active Auctions',
            value: openAuctions,
            icon: ClockIcon,
            bg: 'bg-emerald-100',
            text: 'text-emerald-700',
            iconColor: 'text-emerald-600',
        },
        {
            label: 'Closed Auctions',
            value: closedAuctions,
            icon: CheckCircleIcon,
            bg: 'bg-gray-100',
            text: 'text-gray-700',
            iconColor: 'text-gray-600',
        },
        {
            label: 'Canceled Auctions',
            value: canceledAuctions,
            icon: XCircleIcon,
            bg: 'bg-red-100',
            text: 'text-red-700',
            iconColor: 'text-red-600',
        },
    ];

    const priceCards = [
        {
            label: 'Average Starting Price',
            value: `${Number(averageStartPrice).toLocaleString()} SYP`,
            icon: CurrencyDollarIcon,
            bg: 'bg-amber-50',
            text: 'text-amber-700',
            iconColor: 'text-amber-600',
        },
        {
            label: 'Average Current Bid',
            value: `${Number(averageCurrentBid).toLocaleString()} SYP`,
            icon: TrendingUpIcon,
            bg: 'bg-purple-50',
            text: 'text-purple-700',
            iconColor: 'text-purple-600',
        },
        {
            label: 'Highest Bid',
            value: `${Number(highestBid).toLocaleString()} SYP`,
            icon: TrendingUpIcon,
            bg: 'bg-green-50',
            text: 'text-green-700',
            iconColor: 'text-green-600',
        },
        {
            label: 'Ending Within 24 Hours',
            value: endingSoonCount,
            icon: ClockIcon,
            bg: 'bg-orange-50',
            text: 'text-orange-700',
            iconColor: 'text-orange-600',
        },
    ];

    return (
        <div className="space-y-4">
            {/* Main stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {statCards.map(({ label, value, icon: Icon, bg, text, iconColor }) => (
                    <div
                        key={label}
                        className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                    >
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                            <Icon className={`h-6 w-6 ${iconColor}`} />
                        </div>
                        <div className="min-w-0">
                            <p className={`text-xl font-bold ${text}`}>{value}</p>
                            <p className="text-xs font-medium text-gray-500">{label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Price stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {priceCards.map(({ label, value, icon: Icon, bg, text, iconColor }) => (
                    <div
                        key={label}
                        className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${bg}`}>
                                <Icon className={`h-5 w-5 ${iconColor}`} />
                            </div>
                        </div>
                        <p className={`text-lg font-bold ${text} mb-1`}>{value}</p>
                        <p className="text-xs font-medium text-gray-500">{label}</p>
                    </div>
                ))}
            </div>

            {/* Charts (collapsible) */}
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <button
                    type="button"
                    onClick={() => setShowCharts(!showCharts)}
                    className="flex w-full items-center justify-between py-2 text-sm font-semibold text-gray-700 hover:text-gray-900"
                >
                    <span>Detailed Charts</span>
                    {showCharts ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
                </button>
                
                {showCharts && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Status distribution */}
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Auction Status Distribution</h3>
                            <div className="h-56">
                                <Doughnut data={statusChartData} options={statusChartOptions} />
                            </div>
                        </div>

                        {/* Category distribution */}
                        <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">Auctions by Category</h3>
                            <div className="h-56">
                                <Bar data={categoryChartData} options={categoryChartOptions} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuctionStatistics;
