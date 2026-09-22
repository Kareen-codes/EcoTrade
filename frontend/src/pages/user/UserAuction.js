import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import { useNavigate } from 'react-router-dom';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { getApiUrl } from '../../config/api';
import {
    SearchIcon,
    FilterIcon,
    ViewGridIcon,
    ViewListIcon,
    SparklesIcon,
    ClockIcon,
    EyeIcon,
    UserGroupIcon,
    TrendingUpIcon,
    RefreshIcon,
    XIcon,
} from '@heroicons/react/outline';

const UserAuction = () => {
    // State management
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [sortOrder, setSortOrder] = useState('default');
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const navigate = useNavigate();

    // Fetch auctions on component mount
    useEffect(() => {
        fetchAuctions();
    }, []);

    // Fetch auctions from backend with error handling
    const fetchAuctions = async () => {
        setRefreshing(true);
        try {
            const response = await fetch(getApiUrl('auction'));
            
            if (!response.ok) {
                throw new Error('Failed to fetch auctions from the server');
            }
            
            const data = await response.json();
            
            // Validate data structure
            if (!Array.isArray(data)) {
                throw new Error('The received data is invalid');
            }
            
            setAuctions(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching auctions:', err);
            setError(err.message || 'An error occurred while fetching auctions');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Filter auctions based on search and filters
    const filteredAuctions = auctions.filter(auction => {
        const matchesSearch = auction.itemName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || auction.status === filterStatus;
        const matchesCategory = filterCategory === 'all' || auction.category === filterCategory;
        return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sort filtered auctions
    const sortedAuctions = [...filteredAuctions].sort((a, b) => {
        switch (sortOrder) {
            case 'priceAsc':
                return (a.startPrice || 0) - (b.startPrice || 0);
            case 'priceDesc':
                return (b.startPrice || 0) - (a.startPrice || 0);
            case 'newest':
                return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
            case 'oldest':
                return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
            case 'ending':
                return new Date(a.endDate || 0) - new Date(b.endDate || 0);
            case 'popular':
                return (b.viewsCount || 0) - (a.viewsCount || 0);
            default:
                return 0;
        }
    });

    // Reset all filters
    const resetFilters = () => {
        setSearchTerm('');
        setFilterStatus('all');
        setFilterCategory('all');
        setSortOrder('default');
    };

    // Slider settings for auction images
    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        rtl: false,
    };

    // Calculate time remaining for auction
    const calculateTimeRemaining = (endDate) => {
        if (!endDate) return 'Not specified';
        
        const now = new Date();
        const end = new Date(endDate);
        const diff = end - now;

        if (diff <= 0) return 'Auction ended';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days} day${days > 1 ? 's' : ''} ${hours} hr`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} min`;
        return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    };

    // Get status badge styling
    const getStatusBadge = (status) => {
        const badges = {
            open: {
                class: 'bg-gradient-to-r from-green-500 to-teal-500 text-white',
                label: 'Active'
            },
            closed: {
                class: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white',
                label: 'Closed'
            },
            canceled: {
                class: 'bg-gradient-to-r from-red-500 to-pink-500 text-white',
                label: 'Canceled'
            },
        };
        return badges[status] || badges.open;
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                        <div className="absolute inset-0 border-4 border-green-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-green-600 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-xl font-semibold text-gray-700">Loading auctions...</p>
                    <p className="text-sm text-gray-500 mt-2">Please wait while we fetch the latest auctions</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-6">
                <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <XIcon className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Error loading auctions</h2>
                    <p className="text-red-600 mb-6">{error}</p>
                    <button
                        onClick={fetchAuctions}
                        className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-teal-50">
            {/* Hero Header */}
            <section className="relative overflow-hidden bg-gradient-to-br from-green-600 via-teal-500 to-blue-500 text-white">
                {/* Animated Background Shapes */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-700"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-6 py-16">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                                <SparklesIcon className="w-5 h-5" />
                                <span className="text-sm font-medium">Live Auctions</span>
                            </div>
                            <h1 className="text-5xl md:text-6xl font-bold mb-4">
                                Discover the Best
                                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                                    Auction Deals
                                </span>
                            </h1>
                            <p className="text-xl text-green-50 max-w-2xl">
                                Browse our collection of recyclable materials and place your bids on the items you need
                            </p>
                        </div>

                        <button
                            onClick={fetchAuctions}
                            disabled={refreshing}
                            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg disabled:opacity-50"
                        >
                            <RefreshIcon className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                            <p className="text-3xl font-bold">{auctions.length}</p>
                            <p className="text-sm text-green-50">Total Auctions</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                            <p className="text-3xl font-bold">{auctions.filter(a => a.status === 'open').length}</p>
                            <p className="text-sm text-green-50">Active Now</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                            <p className="text-3xl font-bold">{auctions.filter(a => a.status === 'closed').length}</p>
                            <p className="text-sm text-green-50">Completed</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
                            <p className="text-3xl font-bold">
                                {auctions.reduce((acc, a) => acc + (a.participantsCount || 0), 0)}
                            </p>
                            <p className="text-sm text-green-50">Total Bids</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filters Section */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="bg-white rounded-3xl shadow-xl p-6 mb-8">
                    {/* Search and View Toggle */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
                        <div className="relative flex-1 w-full">
                            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search for auctions..."
                                className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
                                    showFilters
                                        ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                <FilterIcon className="w-5 h-5" />
                                Filters
                            </button>

                            <div className="flex bg-gray-100 rounded-xl p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-lg transition-all ${
                                        viewMode === 'grid' ? 'bg-white shadow-md' : 'hover:bg-gray-200'
                                    }`}
                                    title="Grid view"
                                >
                                    <ViewGridIcon className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-lg transition-all ${
                                        viewMode === 'list' ? 'bg-white shadow-md' : 'hover:bg-gray-200'
                                    }`}
                                    title="List view"
                                >
                                    <ViewListIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <div className="border-t pt-6 animate-slide-down">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* Status Filter */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="all">All Statuses</option>
                                        <option value="open">Active</option>
                                        <option value="closed">Closed</option>
                                        <option value="canceled">Canceled</option>
                                    </select>
                                </div>

                                {/* Category Filter */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                                    <select
                                        value={filterCategory}
                                        onChange={(e) => setFilterCategory(e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="all">All Categories</option>
                                        <option value="Metals">Metals</option>
                                        <option value="Plastics">Plastics</option>
                                        <option value="Electronics">Electronics</option>
                                        <option value="Paper and Cardboard">Paper and Cardboard</option>
                                        <option value="Furniture">Furniture</option>
                                    </select>
                                </div>

                                {/* Sort Filter */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
                                    <select
                                        value={sortOrder}
                                        onChange={(e) => setSortOrder(e.target.value)}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="default">Default</option>
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                        <option value="priceAsc">Price: Low to High</option>
                                        <option value="priceDesc">Price: High to Low</option>
                                        <option value="ending">Ending Soon</option>
                                        <option value="popular">Most Popular</option>
                                    </select>
                                </div>

                                {/* Reset Button */}
                                <div className="flex items-end">
                                    <button
                                        onClick={resetFilters}
                                        className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-bold py-2 px-4 rounded-xl transition-all duration-300 shadow-lg"
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-lg font-semibold text-gray-700">
                        Found <span className="text-green-600">{sortedAuctions.length}</span> auction{sortedAuctions.length !== 1 ? 's' : ''}
                    </p>
                </div>

                {/* Auctions Grid/List */}
                {sortedAuctions.length === 0 ? (
                    <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-3xl p-12 text-center shadow-xl">
                        <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <SearchIcon className="w-12 h-12 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">No auctions found</h3>
                        <p className="text-gray-600 mb-6">Try adjusting the filters or search terms</p>
                        <button
                            onClick={resetFilters}
                            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 shadow-lg"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
                        {sortedAuctions.map((auction) => {
                            const statusBadge = getStatusBadge(auction.status);
                            const timeRemaining = calculateTimeRemaining(auction.endDate);

                            return (
                                <div
                                    key={auction._id}
                                    className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group border-2 border-gray-100 hover:border-green-500 ${
                                        viewMode === 'list' ? 'flex flex-row' : 'flex flex-col'
                                    }`}
                                >
                                    {/* Image Section */}
                                    <div className={`relative ${viewMode === 'list' ? 'w-1/3' : 'w-full'} overflow-hidden`}>
                                        {auction.images && auction.images.length > 0 ? (
                                            <Slider {...sliderSettings}>
                                                {auction.images.map((image, index) => (
                                                    <div key={index} className="relative">
                                                        <img
                                                            src={image}
                                                            alt={`${auction.itemName} - view ${index + 1}`}
                                                            className={`object-cover ${viewMode === 'list' ? 'h-64' : 'h-56'} w-full group-hover:scale-110 transition-transform duration-500`}
                                                            onError={(e) => {
                                                                e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                                                            }}
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                                                    </div>
                                                ))}
                                            </Slider>
                                        ) : (
                                            <div className="w-full h-56 bg-gray-200 flex items-center justify-center">
                                                <p className="text-gray-500">No image</p>
                                            </div>
                                        )}

                                        {/* Status Badge */}
                                        <div className="absolute top-4 left-4">
                                            <span className={`${statusBadge.class} px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg`}>
                                                {statusBadge.label}
                                            </span>
                                        </div>

                                        {/* Time Remaining Badge */}
                                        {auction.status === 'open' && (
                                            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-xl flex items-center gap-1 shadow-lg">
                                                <ClockIcon className="w-4 h-4 text-red-500" />
                                                <span className="text-xs font-bold text-gray-800">{timeRemaining}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Section */}
                                    <div className={`p-5 ${viewMode === 'list' ? 'w-2/3 flex flex-col justify-between' : ''}`}>
                                        <div>
                                            <h3 className="font-bold text-xl mb-2 text-gray-800 line-clamp-1">
                                                {auction.itemName || 'Unnamed'}
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                                {auction.description || 'No description'}
                                            </p>

                                            {/* Category Badge */}
                                            <div className="mb-4">
                                                <span className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1 rounded-lg text-xs font-semibold">
                                                    {auction.category || 'Not specified'}
                                                </span>
                                            </div>

                                            {/* Stats */}
                                            <div className="grid grid-cols-3 gap-2 mb-4">
                                                <div className="flex items-center gap-1 text-xs text-gray-600" title="Views">
                                                    <EyeIcon className="w-4 h-4" />
                                                    <span>{auction.viewsCount || 0}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-gray-600" title="Participants">
                                                    <UserGroupIcon className="w-4 h-4" />
                                                    <span>{auction.participantsCount || 0}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-gray-600" title="Bids">
                                                    <TrendingUpIcon className="w-4 h-4" />
                                                    <span>{auction.bids?.length || 0}</span>
                                                </div>
                                            </div>

                                            {/* Prices */}
                                            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-xl p-4 mb-4">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-semibold text-gray-600">Starting Price</span>
                                                    <span className="text-sm font-bold text-gray-800">
                                                        {(auction.startPrice || 0).toLocaleString('en-US')} €
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xs font-semibold text-gray-600">Current Bid</span>
                                                    <span className="text-lg font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                                                        {(auction.currentBid || 0).toLocaleString('en-US')} €
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <button
                                            onClick={() => auction.status === 'open' && navigate(`/auction-room/${auction._id}`)}
                                            disabled={auction.status !== 'open'}
                                            className={`w-full py-3 rounded-xl font-bold transition-all duration-300 ${
                                                auction.status === 'open'
                                                    ? 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white shadow-lg hover:shadow-xl'
                                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                            }`}
                                        >
                                            {auction.status === 'open' ? 'Enter Auction Room' : `Auction ${statusBadge.label}`}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserAuction;
