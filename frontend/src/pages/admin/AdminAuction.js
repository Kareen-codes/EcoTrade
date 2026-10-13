// Admin Auction Management Page - Modern UI/UX with enhanced features
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Slider from 'react-slick';
import AuctionPopup from '../../models/AuctionPopup';
import ConfirmModal from '../../models/ConfirmModal';
import { Link } from 'react-router-dom';
import AuctionStatistics from '../../components/AuctionStatitics';
import {
    SearchIcon,
    PlusIcon,
    TrashIcon,
    XCircleIcon,
    CheckCircleIcon,
    EyeIcon,
    FilterIcon,
    ClockIcon,
    CurrencyDollarIcon,
} from '@heroicons/react/outline';
import { CheckCircleIcon as CheckSolid, XCircleIcon as XSolid } from '@heroicons/react/solid';

const AdminAuction = () => {
    const [auctions, setAuctions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all'); // all, open, closed, canceled
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [newAuction, setNewAuction] = useState({
        itemName: '',
        description: '',
        category: 'Metals',
        startPrice: '',
        endDate: '',
        images: []
    });
    const [showPopup, setShowPopup] = useState(false);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    
    // Confirmation modal state
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        type: 'danger',
        title: '',
        message: '',
        action: null,
        auctionId: null,
    });

    useEffect(() => {
        fetchAuctions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Auto-hide toast after 4 seconds
    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast({ show: false, message: '', type: '' });
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [toast.show]);

    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
    };

    const fetchAuctions = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/auction`);
            setAuctions(response.data);
        } catch (error) {
            console.error("Error fetching auctions:", error);
            showToast('Failed to load auctions', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNewAuction({ ...newAuction, [name]: value });
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        setNewAuction({ ...newAuction, images: files });
    };

    const createAuction = async () => {
        const formData = new FormData();
        Object.keys(newAuction).forEach(key => {
            if (key === 'images') {
                newAuction.images.forEach(image => {
                    formData.append('images', image);
                });
            } else {
                formData.append(key, newAuction[key]);
            }
        });

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/auction`, formData);
            fetchAuctions();
            setNewAuction({
                itemName: '',
                description: '',
                category: 'Metals',
                startPrice: '',
                endDate: '',
                images: []
            });
            closePopup();
            showToast('Auction created successfully');
        } catch (error) {
            console.error("Error creating auction:", error);
            showToast('Failed to create the auction', 'error');
        }
    };

    const cancelAuction = async (auctionId) => {
        setActionLoading(auctionId);
        const updatedAuctions = auctions.map(auction => {
            if (auction._id === auctionId) {
                return { ...auction, status: 'canceled' };
            }
            return auction;
        });
        setAuctions(updatedAuctions);

        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/auction/cancel/${auctionId}`);
            showToast('Auction canceled successfully');
        } catch (error) {
            console.error("Error cancelling auction:", error);
            showToast('Failed to cancel the auction', 'error');
            fetchAuctions();
        } finally {
            setActionLoading(null);
            closeConfirmModal();
        }
    };

    const closeAuction = async (auctionId) => {
        setActionLoading(auctionId);
        const updatedAuctions = auctions.map(auction => {
            if (auction._id === auctionId) {
                return { ...auction, status: 'closed' };
            }
            return auction;
        });
        setAuctions(updatedAuctions);

        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/auction/close/${auctionId}`);
            showToast('Auction closed successfully');
        } catch (error) {
            console.error("Error closing auction:", error);
            showToast('Failed to close the auction', 'error');
            fetchAuctions();
        } finally {
            setActionLoading(null);
            closeConfirmModal();
        }
    };

    const deleteAuction = async (auctionId) => {
        setActionLoading(auctionId);
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/auction/${auctionId}`);
            fetchAuctions();
            showToast('Auction deleted successfully');
        } catch (error) {
            console.error("Error deleting auction:", error);
            showToast('Failed to delete the auction', 'error');
        } finally {
            setActionLoading(null);
            closeConfirmModal();
        }
    };

    const openPopup = () => setShowPopup(true);
    const closePopup = () => setShowPopup(false);

    // Confirmation modal handlers
    const openConfirmModal = (type, title, message, action, auctionId) => {
        setConfirmModal({ isOpen: true, type, title, message, action, auctionId });
    };

    const closeConfirmModal = () => {
        if (actionLoading) return;
        setConfirmModal({ 
            isOpen: false, 
            type: 'danger', 
            title: '', 
            message: '', 
            action: null, 
            auctionId: null 
        });
    };

    const handleConfirmAction = () => {
        if (confirmModal.action && confirmModal.auctionId) {
            confirmModal.action(confirmModal.auctionId);
        }
    };

    // Filter auctions by search, status, and category
    const filteredAuctions = auctions.filter(auction => {
        const matchesSearch = auction.itemName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || auction.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || auction.category === categoryFilter;
        return matchesSearch && matchesStatus && matchesCategory;
    });

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
    };

    // Get time remaining
    const getTimeRemaining = (endDate) => {
        const now = new Date();
        const end = new Date(endDate);
        const diff = end - now;
        
        if (diff <= 0) return 'Ended';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
        return `${hours} hour${hours > 1 ? 's' : ''}`;
    };

    const AuctionCard = ({ auction }) => {
        const isCanceled = auction.status === 'canceled';
        const isClosed = auction.status === 'closed';
        const isOpen = auction.status === 'open';
        const isLoading = actionLoading === auction._id;
        const timeRemaining = getTimeRemaining(auction.endDate);
        const isEndingSoon = timeRemaining !== 'Ended' && new Date(auction.endDate) - new Date() < 86400000;

        return (
            <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                isCanceled ? 'border-red-200 bg-red-50/50' : 
                isClosed ? 'border-gray-200 bg-gray-50/50' : 
                'border-gray-200 bg-white hover:shadow-xl'
            }`}>
                {/* Status badge on top */}
                <div className="absolute top-3 left-3 z-10">
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${
                        isCanceled ? 'bg-red-100 text-red-800' : 
                        isClosed ? 'bg-gray-100 text-gray-800' : 
                        'bg-emerald-100 text-emerald-800'
                    }`}>
                        {isCanceled ? <XSolid className="h-3.5 w-3.5" /> : 
                         isClosed ? <CheckSolid className="h-3.5 w-3.5" /> : 
                         <ClockIcon className="h-3.5 w-3.5" />}
                        {isCanceled ? 'Canceled' : isClosed ? 'Closed' : 'Active'}
                    </span>
                </div>

                {/* Image slider */}
                <div className='relative'>
                    <Slider {...sliderSettings}>
                        {auction.images.map((image, index) => (
                            <div key={index}>
                                <img 
                                    src={image} 
                                    alt={auction.itemName} 
                                    className="w-full h-56 object-cover" 
                                />
                            </div>
                        ))}
                    </Slider>
                    {isEndingSoon && isOpen && (
                        <div className="absolute bottom-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-medium">
                            Ending soon!
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-5">
                    <h3 className="font-bold text-xl mb-2 text-gray-800 line-clamp-1">{auction.itemName}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{auction.description}</p>
                    
                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                        <div className="bg-gray-50 rounded-lg p-2">
                            <p className="text-gray-500 text-xs">Category</p>
                            <p className="font-semibold text-gray-800">{auction.category}</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-2">
                            <p className="text-gray-500 text-xs">Starting Price</p>
                            <p className="font-semibold text-blue-700">{auction.startPrice} SYP</p>
                        </div>
                        <div className="bg-emerald-50 rounded-lg p-2">
                            <p className="text-gray-500 text-xs">Current Bid</p>
                            <p className="font-semibold text-emerald-700">{auction.currentBid || auction.startPrice} SYP</p>
                        </div>
                        <div className="bg-amber-50 rounded-lg p-2">
                            <p className="text-gray-500 text-xs">Time Remaining</p>
                            <p className="font-semibold text-amber-700">{timeRemaining}</p>
                        </div>
                    </div>

                    <div className="text-xs text-gray-500 mb-4">
                        End date: {new Date(auction.endDate).toLocaleDateString('en-US', { 
                            year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                        })}
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                        <Link 
                            to={`/auction-room-admin/${auction._id}`} 
                            className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition text-sm font-medium"
                        >
                            <EyeIcon className="h-4 w-4" />
                            View Auction Details
                        </Link>
                        
                        <div className="grid grid-cols-3 gap-2">
                            <button 
                                className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition ${
                                    isCanceled || isLoading ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'
                                }`}
                                onClick={() => openConfirmModal(
                                    'cancel',
                                    'Cancel Auction',
                                    `Are you sure you want to cancel the auction "${auction.itemName}"?`,
                                    cancelAuction,
                                    auction._id
                                )}
                                disabled={isCanceled || isLoading}
                            >
                                <XCircleIcon className="h-4 w-4" />
                                Cancel
                            </button>
                            <button
                                className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition ${
                                    isCanceled || isClosed || isLoading ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-emerald-500 text-white hover:bg-emerald-600'
                                }`}
                                onClick={() => openConfirmModal(
                                    'success',
                                    'Close Auction',
                                    `The auction "${auction.itemName}" will be closed and the winner determined. Do you want to continue?`,
                                    closeAuction,
                                    auction._id
                                )}
                                disabled={isCanceled || isClosed || isLoading}
                            >
                                <CheckCircleIcon className="h-4 w-4" />
                                Close
                            </button>
                            <button 
                                className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition text-xs font-medium"
                                onClick={() => openConfirmModal(
                                    'danger',
                                    'Delete Auction',
                                    `The auction "${auction.itemName}" will be permanently deleted. Are you sure?`,
                                    deleteAuction,
                                    auction._id
                                )}
                                disabled={isLoading}
                            >
                                <TrashIcon className="h-4 w-4" />
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Toast notification */}
            {toast.show && (
                <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-fadeIn ${
                    toast.type === 'error' ? 'bg-red-50 text-red-800 border-red-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}>
                    {toast.type === 'error' ? (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ) : (
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    )}
                    <span className="font-medium">{toast.message}</span>
                </div>
            )}

            {/* Page header */}
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Manage Auctions</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Add, manage, and track auctions on the platform
                </p>
            </div>

            {/* Statistics */}
            <AuctionStatistics auctions={auctions} />

            {/* Search and filters */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                <div className="flex flex-col gap-3">
                    {/* Search and add button */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search for an auction..."
                                className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={openPopup}
                            className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition font-medium text-sm shadow-sm"
                        >
                            <PlusIcon className="h-5 w-5" />
                            Add New Auction
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-2">
                        <FilterIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600 font-medium">Status:</span>
                        {['all', 'open', 'closed', 'canceled'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                    statusFilter === status ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {status === 'all' ? 'All' : status === 'open' ? 'Active' : status === 'closed' ? 'Closed' : 'Canceled'}
                            </button>
                        ))}
                        
                        <span className="text-sm text-gray-600 font-medium ml-3">Category:</span>
                        {['all', 'Metals', 'Plastics', 'Electronics', 'Paper and Cardboard', 'Furniture'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                    categoryFilter === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {cat === 'all' ? 'All' : cat === 'Metals' ? 'Metals' : cat === 'Plastics' ? 'Plastics' : 
                                 cat === 'Electronics' ? 'Electronics' : cat === 'Paper and Cardboard' ? 'Paper and Cardboard' : 'Furniture'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Popup */}
            {showPopup && (
                <AuctionPopup
                    newAuction={newAuction}
                    handleChange={handleChange}
                    handleImageUpload={handleImageUpload}
                    createAuction={createAuction}
                    closePopup={closePopup}
                />
            )}

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={closeConfirmModal}
                onConfirm={handleConfirmAction}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                loading={!!actionLoading}
                confirmText={confirmModal.type === 'danger' ? 'Delete' : confirmModal.type === 'cancel' ? 'Cancel Auction' : 'Close Auction'}
            />

            {/* Auctions grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-sm font-medium">Loading auctions...</p>
                </div>
            ) : filteredAuctions.length === 0 ? (
                <div className="text-center p-12 border border-gray-200 rounded-2xl bg-white shadow-sm">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mb-4">
                        <CurrencyDollarIcon className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No auctions</h3>
                    <p className="text-sm text-gray-500">
                        {searchTerm || statusFilter !== 'all' || categoryFilter !== 'all' 
                            ? 'No results match the search or filters.' 
                            : 'No auctions have been created yet.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAuctions.map(auction => (
                        <AuctionCard
                            key={auction._id}
                            auction={auction}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminAuction;
