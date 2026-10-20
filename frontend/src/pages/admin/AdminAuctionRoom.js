// Admin Auction Room - Enhanced UI/UX with detailed information and actions
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { API_BASE_URL } from '../../config/api';
import {
    ArrowLeftIcon,
    ClockIcon,
    TagIcon,
    UserGroupIcon,
    TrendingUpIcon,
    CheckCircleIcon,
    XCircleIcon,
    TrashIcon,
    MailIcon,
    PhoneIcon,
} from '@heroicons/react/outline';
import { CheckCircleIcon as CheckSolid, XCircleIcon as XSolid } from '@heroicons/react/solid';
import ConfirmModal from '../../models/ConfirmModal';
import axios from 'axios';

const AdminAuctionRoom = () => {
    const { auctionId } = useParams();
    const navigate = useNavigate();
    const [auction, setAuction] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [biddersInfo, setBiddersInfo] = useState({});
    const [actionLoading, setActionLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    
    // Confirmation modal state
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        type: 'danger',
        title: '',
        message: '',
        action: null,
    });

    useEffect(() => {
        fetchAuctionDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auctionId]);

    // Auto-hide toast
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

    const fetchAuctionDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/auction/${auctionId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch auction data');
            }
            const data = await response.json();
            setAuction(data);

            // Fetch bidders information
            if (data.bids && data.bids.length > 0) {
                const bidders = data.bids.map(bid => fetch(`${API_BASE_URL}/users/profile/${bid.bidder}`));
                const responses = await Promise.all(bidders);
                const biddersData = await Promise.all(responses.map(res => res.json()));

                const biddersInfoMap = {};
                biddersData.forEach((userData, index) => {
                    biddersInfoMap[data.bids[index].bidder] = userData.user;
                });
                setBiddersInfo(biddersInfoMap);
            }
        } catch (err) {
            setError(err.message);
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCloseAuction = async () => {
        setActionLoading(true);
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/auction/close/${auctionId}`);
            showToast('Auction closed successfully');
            await fetchAuctionDetails();
        } catch (error) {
            console.error("Error closing auction:", error);
            showToast('Failed to close the auction', 'error');
        } finally {
            setActionLoading(false);
            setConfirmModal({ ...confirmModal, isOpen: false });
        }
    };

    const handleCancelAuction = async () => {
        setActionLoading(true);
        try {
            await axios.put(`${process.env.REACT_APP_API_URL}/auction/cancel/${auctionId}`);
            showToast('Auction canceled successfully');
            await fetchAuctionDetails();
        } catch (error) {
            console.error("Error canceling auction:", error);
            showToast('Failed to cancel the auction', 'error');
        } finally {
            setActionLoading(false);
            setConfirmModal({ ...confirmModal, isOpen: false });
        }
    };

    const handleDeleteAuction = async () => {
        setActionLoading(true);
        try {
            await axios.delete(`${process.env.REACT_APP_API_URL}/auction/${auctionId}`);
            showToast('Auction deleted successfully');
            setTimeout(() => navigate('/auctions'), 1500);
        } catch (error) {
            console.error("Error deleting auction:", error);
            showToast('Failed to delete the auction', 'error');
            setActionLoading(false);
            setConfirmModal({ ...confirmModal, isOpen: false });
        }
    };

    const openConfirmModal = (type, title, message, action) => {
        setConfirmModal({ isOpen: true, type, title, message, action });
    };

    const closeConfirmModal = () => {
        if (!actionLoading) {
            setConfirmModal({ isOpen: false, type: 'danger', title: '', message: '', action: null });
        }
    };

    const handleConfirm = () => {
        if (confirmModal.action) {
            confirmModal.action();
        }
    };

    const sliderSettings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
    };

    // Calculate time remaining
    const getTimeRemaining = () => {
        if (!auction) return null;
        const now = new Date();
        const end = new Date(auction.endDate);
        const diff = end - now;
        
        if (diff <= 0) return 'Ended';
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) return `${days} day${days > 1 ? 's' : ''} and ${hours} hour${hours > 1 ? 's' : ''}`;
        if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} and ${minutes} minute${minutes > 1 ? 's' : ''}`;
        return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm font-medium text-gray-600">Loading auction data...</p>
            </div>
        );
    }

    if (error || !auction) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center max-w-md">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                        <XCircleIcon className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-bold text-red-900 mb-2">Error loading the auction</h3>
                    <p className="text-sm text-red-700">{error || 'Auction not found'}</p>
                    <button
                        onClick={() => navigate('/auctions')}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
                    >
                        Back to Auctions
                    </button>
                </div>
            </div>
        );
    }

    const isCanceled = auction.status === 'canceled';
    const isClosed = auction.status === 'closed';
    const lastBid = auction.bids && auction.bids.length > 0 ? auction.bids[auction.bids.length - 1] : null;
    const lastBidderInfo = lastBid ? biddersInfo[lastBid.bidder] : null;
    const timeRemaining = getTimeRemaining();

    return (
        <div className="space-y-6 pb-8">
            {/* Toast */}
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

            {/* Confirm Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={closeConfirmModal}
                onConfirm={handleConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
                loading={actionLoading}
                confirmText={confirmModal.type === 'danger' ? 'Delete' : confirmModal.type === 'cancel' ? 'Cancel Auction' : 'Confirm'}
            />

            {/* Back button */}
            <button
                onClick={() => navigate('/auctions')}
                className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition"
            >
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Auctions
            </button>

            {/* Header with status */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{auction.itemName}</h1>
                    <p className="mt-1 text-sm text-gray-500">Auction ID: {auctionId}</p>
                </div>
                <span className={`inline-flex items-center gap-2 shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
                    isCanceled ? 'bg-red-100 text-red-800' : 
                    isClosed ? 'bg-gray-100 text-gray-800' : 
                    'bg-emerald-100 text-emerald-800'
                }`}>
                    {isCanceled ? <XSolid className="h-5 w-5" /> : 
                     isClosed ? <CheckSolid className="h-5 w-5" /> : 
                     <ClockIcon className="h-5 w-5" />}
                    {isCanceled ? 'Canceled' : isClosed ? 'Closed' : 'Active'}
                </span>
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column - Images and description */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Images slider */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm overflow-hidden">
                        <Slider {...sliderSettings}>
                            {auction.images.map((image, index) => (
                                <div key={index}>
                                    <img 
                                        src={image} 
                                        alt={`${auction.itemName} ${index + 1}`} 
                                        className="w-full h-80 object-contain rounded-xl" 
                                    />
                                </div>
                            ))}
                        </Slider>
                    </div>

                    {/* Description */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                            <TagIcon className="h-5 w-5 text-gray-600" />
                            Description
                        </h2>
                        <p className="text-gray-700 leading-relaxed">{auction.description}</p>
                    </div>

                    {/* Bids section */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                            <UserGroupIcon className="h-5 w-5 text-gray-600" />
                            Bids ({auction.bids?.length || 0})
                        </h2>

                        {lastBidderInfo && (
                            <div className={`mb-6 rounded-xl border-2 p-6 ${
                                isClosed ? 'border-emerald-300 bg-emerald-50' : 'border-blue-300 bg-blue-50'
                            }`}>
                                <div className="flex items-center gap-4 mb-4">
                                    <img
                                        src={lastBidderInfo.profileImage || 'https://ui-avatars.com/api?name=' + encodeURIComponent(lastBidderInfo.name)}
                                        alt={lastBidderInfo.name}
                                        className="h-16 w-16 rounded-full border-2 border-white shadow-md object-cover"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-bold text-gray-800">{lastBidderInfo.name}</h3>
                                            {isClosed && (
                                                <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white">
                                                    Winner
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600">{lastBidderInfo.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm text-gray-600">Bid Amount:</span>
                                    <span className="text-2xl font-bold text-emerald-700">{lastBid.bidAmount} SYP</span>
                                </div>
                                {isClosed && (
                                    <div className="flex gap-2">
                                        <a
                                            href={`mailto:${lastBidderInfo.email}?subject=Inquiry about the auction ${auction.itemName}`}
                                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition text-sm font-medium"
                                        >
                                            <MailIcon className="h-4 w-4" />
                                            Contact via Email
                                        </a>
                                        {lastBidderInfo.phoneNumber && (
                                            <a
                                                href={`tel:${lastBidderInfo.phoneNumber}`}
                                                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition text-sm font-medium"
                                            >
                                                <PhoneIcon className="h-4 w-4" />
                                                Call
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Previous bids */}
                        {auction.bids && auction.bids.length > 1 && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-700 mb-3">Previous Bids</h3>
                                <div className="space-y-3 max-h-96 overflow-y-auto">
                                    {auction.bids.slice(0, -1).reverse().map((bid, index) => {
                                        const bidder = biddersInfo[bid.bidder];
                                        return (
                                            <div key={index} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
                                                <img
                                                    src={bidder?.profileImage || 'https://ui-avatars.com/api?name=' + encodeURIComponent(bidder?.name || 'User')}
                                                    alt={bidder?.name || 'Bidder'}
                                                    className="h-10 w-10 rounded-full border border-gray-300 object-cover"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-800 text-sm">{bidder?.name || 'Unknown bidder'}</p>
                                                    <p className="text-xs text-gray-500 truncate">{bidder?.email || '—'}</p>
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-sm font-bold text-gray-800">{bid.bidAmount} SYP</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {(!auction.bids || auction.bids.length === 0) && (
                            <div className="text-center py-8">
                                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                                    <TrendingUpIcon className="h-6 w-6 text-gray-400" />
                                </div>
                                <p className="text-sm text-gray-500">No bids yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right column - Info and actions */}
                <div className="space-y-6">
                    {/* Auction info */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Auction Information</h2>
                        
                        <div className="space-y-3">
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Category</span>
                                <span className="font-semibold text-gray-800">{auction.category}</span>
                            </div>
                            
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Starting Price</span>
                                <span className="font-semibold text-blue-700">{auction.startPrice} SYP</span>
                            </div>
                            
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Current Bid</span>
                                <span className="font-bold text-emerald-700 text-lg">{auction.currentBid || auction.startPrice} SYP</span>
                            </div>
                            
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Number of Bids</span>
                                <span className="font-semibold text-gray-800">{auction.bids?.length || 0}</span>
                            </div>
                            
                            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Time Remaining</span>
                                <span className={`font-semibold ${timeRemaining === 'Ended' ? 'text-red-600' : 'text-amber-600'}`}>
                                    {timeRemaining}
                                </span>
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">End Date</span>
                                <span className="text-xs text-gray-800 font-medium">
                                    {new Date(auction.endDate).toLocaleDateString('en-US', { 
                                        year: 'numeric', month: 'short', day: 'numeric', 
                                        hour: '2-digit', minute: '2-digit' 
                                    })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-3">
                        <h2 className="text-lg font-bold text-gray-800 mb-4">Actions</h2>
                        
                        <button
                            onClick={() => openConfirmModal(
                                'success',
                                'Close Auction',
                                'The auction will be closed and no one will be able to bid afterwards. Do you want to continue?',
                                handleCloseAuction
                            )}
                            disabled={isCanceled || isClosed}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition ${
                                isCanceled || isClosed 
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                        >
                            <CheckCircleIcon className="h-5 w-5" />
                            {isClosed ? 'Auction Closed' : 'Close Auction'}
                        </button>
                        
                        <button
                            onClick={() => openConfirmModal(
                                'cancel',
                                'Cancel Auction',
                                'The auction will be canceled and no winner will be determined. Do you want to continue?',
                                handleCancelAuction
                            )}
                            disabled={isCanceled}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition ${
                                isCanceled 
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                                    : 'bg-orange-500 text-white hover:bg-orange-600'
                            }`}
                        >
                            <XCircleIcon className="h-5 w-5" />
                            {isCanceled ? 'Auction Canceled' : 'Cancel Auction'}
                        </button>
                        
                        <button
                            onClick={() => openConfirmModal(
                                'danger',
                                'Delete Auction',
                                'The auction will be permanently deleted and cannot be recovered. Are you sure?',
                                handleDeleteAuction
                            )}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition"
                        >
                            <TrashIcon className="h-5 w-5" />
                            Delete Auction
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAuctionRoom;
