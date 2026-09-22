import React from 'react';
import {
    BadgeCheckIcon,
    UserIcon,
    CurrencyDollarIcon,
} from '@heroicons/react/outline';

const BiddersLeaderboard = ({ bids = [], currentUserId }) => {
    // Validate bids array
    if (!Array.isArray(bids)) {
        console.warn('BiddersLeaderboard: bids is not an array', bids);
        return null;
    }

    // Sort bids by amount and get top 10
    const topBidders = [...bids]
        .sort((a, b) => (b.bidAmount || 0) - (a.bidAmount || 0))
        .slice(0, 10);

    // Get medal icon for top 3
    const getMedalIcon = (index) => {
        if (index === 0) return '🥇';
        if (index === 1) return '🥈';
        if (index === 2) return '🥉';
        return `#${index + 1}`;
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
                    <BadgeCheckIcon className="w-7 h-7 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Top Bidders</h3>
                    <p className="text-sm text-gray-500">Current leaderboard</p>
                </div>
            </div>

            {/* Leaderboard List */}
            {topBidders.length === 0 ? (
                <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <UserIcon className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500">No bids yet</p>
                    <p className="text-sm text-gray-400 mt-1">Be the first to place a bid!</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {topBidders.map((bid, index) => {
                        // Validate bid object
                        if (!bid || typeof bid !== 'object') {
                            return null;
                        }

                        const isCurrentUser = bid.bidder?._id === currentUserId;
                        const isTopThree = index < 3;

                        return (
                            <div
                                key={bid._id || index}
                                className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300 ${
                                    isCurrentUser
                                        ? 'bg-gradient-to-r from-green-50 to-teal-50 border-2 border-green-500 shadow-md'
                                        : isTopThree
                                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300'
                                        : 'bg-gray-50 border-2 border-gray-200'
                                }`}
                            >
                                {/* Rank */}
                                <div className="w-10 h-10 flex items-center justify-center">
                                    <span className="text-2xl">{getMedalIcon(index)}</span>
                                </div>

                                {/* User Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        {bid.bidder?.profileImage ? (
                                            <img
                                                src={bid.bidder.profileImage}
                                                alt={bid.bidder.name || 'User'}
                                                className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                                                <UserIcon className="w-6 h-6 text-white" />
                                            </div>
                                        )}
                                        <div>
                                            <p className="font-semibold text-gray-800">
                                                {bid.bidder?.name || 'Anonymous user'}
                                                {isCurrentUser && (
                                                    <span className="ml-2 text-xs bg-gradient-to-r from-green-600 to-teal-600 text-white px-2 py-0.5 rounded-full">
                                                        You
                                                    </span>
                                                )}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {bid.bidTime 
                                                    ? new Date(bid.bidTime).toLocaleString('en-US')
                                                    : 'Not specified'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Bid Amount */}
                                <div className="text-right">
                                    <div className="flex items-center gap-1">
                                        <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
                                        <span className="text-lg font-bold text-green-600">
                                            {(bid.bidAmount || 0).toLocaleString('en-US')}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500">EUR</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Footer Stats */}
            {topBidders.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-gray-800">{topBidders.length}</p>
                            <p className="text-xs text-gray-500">Total Bidders</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-green-600">
                                {(topBidders[0]?.bidAmount || 0).toLocaleString('en-US')}€
                            </p>
                            <p className="text-xs text-gray-500">Highest Bid</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BiddersLeaderboard;
