import React from 'react';
import {
    ChartBarIcon,
    TrendingUpIcon,
    EyeIcon,
    UserGroupIcon,
    CurrencyDollarIcon,
    ClockIcon,
} from '@heroicons/react/outline';

const AuctionStats = ({ auction }) => {
    // Validate auction object
    if (!auction || typeof auction !== 'object') {
        return (
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100">
                <p className="text-center text-gray-500">No data available</p>
            </div>
        );
    }

    // Calculate statistics with safe fallbacks
    const startPrice = auction.startPrice || 0;
    const currentBid = auction.currentBid || 0;
    const priceIncrease = currentBid - startPrice;
    const priceIncreasePercentage = startPrice > 0
        ? ((priceIncrease / startPrice) * 100).toFixed(2)
        : 0;

    const bidsArray = Array.isArray(auction.bids) ? auction.bids : [];
    const averageBid = bidsArray.length > 0
        ? (bidsArray.reduce((sum, bid) => sum + (bid.bidAmount || 0), 0) / bidsArray.length).toFixed(2)
        : 0;

    // Calculate time remaining
    const endDate = auction.endDate ? new Date(auction.endDate) : null;
    const now = new Date();
    const timeRemaining = endDate ? Math.max(0, endDate - now) : 0;
    const daysRemaining = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
    const hoursRemaining = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    // Statistics data
    const stats = [
        {
            icon: EyeIcon,
            label: 'Total Views',
            value: auction.viewsCount || 0,
            color: 'from-blue-500 to-indigo-500',
            bgColor: 'from-blue-50 to-indigo-50',
        },
        {
            icon: UserGroupIcon,
            label: 'Participants',
            value: auction.participantsCount || 0,
            color: 'from-purple-500 to-pink-500',
            bgColor: 'from-purple-50 to-pink-50',
        },
        {
            icon: ChartBarIcon,
            label: 'Total Bids',
            value: bidsArray.length,
            color: 'from-green-500 to-teal-500',
            bgColor: 'from-green-50 to-teal-50',
        },
        {
            icon: CurrencyDollarIcon,
            label: 'Average Bid',
            value: `${parseFloat(averageBid).toLocaleString('en-US')}€`,
            color: 'from-yellow-500 to-orange-500',
            bgColor: 'from-yellow-50 to-orange-50',
        },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <ChartBarIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Auction Statistics</h3>
                    <p className="text-sm text-gray-500">Real-time insights</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            className={`bg-gradient-to-br ${stat.bgColor} rounded-xl p-4 border-2 border-white shadow-md hover:shadow-lg transition-all duration-300`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                                    <p className="text-xs text-gray-600">{stat.label}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Price Analysis */}
            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-4 mb-6 border-2 border-green-200">
                <div className="flex items-center gap-2 mb-3">
                    <TrendingUpIcon className="w-5 h-5 text-green-600" />
                    <h4 className="font-bold text-gray-800">Price Analysis</h4>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Starting Price</span>
                        <span className="font-semibold text-gray-800">
                            {startPrice.toLocaleString('en-US')}€
                        </span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Current Bid</span>
                        <span className="font-bold text-green-600 text-lg">
                            {currentBid.toLocaleString('en-US')}€
                        </span>
                    </div>

                    <div className="h-px bg-gray-300"></div>

                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Increase</span>
                        <div className="text-right">
                            <span className="font-bold text-green-600">
                                +{priceIncrease.toLocaleString('en-US')}€
                            </span>
                            <span className="text-xs text-green-600 ml-2">
                                ({priceIncreasePercentage}%)
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Time Remaining */}
            {auction.status === 'open' && endDate && (
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border-2 border-orange-200">
                    <div className="flex items-center gap-2 mb-2">
                        <ClockIcon className="w-5 h-5 text-orange-600" />
                        <h4 className="font-bold text-gray-800">Time Remaining</h4>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-orange-600">{daysRemaining}</p>
                            <p className="text-xs text-gray-600">Days</p>
                        </div>
                        <div className="text-2xl font-bold text-orange-600">:</div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-orange-600">{hoursRemaining}</p>
                            <p className="text-xs text-gray-600">Hours</p>
                        </div>
                    </div>

                    <div className="mt-3">
                        <p className="text-xs text-gray-600">
                            Ends at: <span className="font-semibold">{endDate.toLocaleString('en-US')}</span>
                        </p>
                    </div>
                </div>
            )}

            {/* Status Badge for Closed/Canceled Auctions */}
            {auction.status !== 'open' && (
                <div className={`rounded-xl p-4 text-center ${
                    auction.status === 'closed' ? 'bg-gray-100' : 'bg-red-100'
                }`}>
                    <p className={`text-lg font-bold ${
                        auction.status === 'closed' ? 'text-gray-700' : 'text-red-700'
                    }`}>
                        Auction {auction.status === 'closed' ? 'Closed' : 'Canceled'}
                    </p>
                    {auction.winner && auction.status === 'closed' && (
                        <p className="text-sm text-gray-600 mt-1">
                            Winner: <span className="font-semibold">{auction.winner.name || 'Unknown'}</span>
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default AuctionStats;
