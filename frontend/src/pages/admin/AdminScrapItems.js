// Admin Scrap Items Management Page - Simple & Consistent UI
import React, { useContext, useEffect, useState } from 'react';
import UserContext from '../../context/UserContext';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import ConfirmModal from '../../models/ConfirmModal';
import PopupForm from '../../models/ScrapFormPopup';
import ScreapItemsAnalytics from '../../models/ScreapItemsAnalytics';
import { API_BASE_URL } from '../../config/api';
import {
    PlusIcon,
    SearchIcon,
    FilterIcon,
    TrashIcon,
    PencilAltIcon,
    ChartBarIcon,
} from '@heroicons/react/outline';

const AdminScrapItems = () => {
    const { user } = useContext(UserContext);
    const [scrapItems, setScrapItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '', type: '' });
    const [isModalOpen, setModalOpen] = useState(false);
    const [isPopupOpen, setPopupOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [currentItemId, setCurrentItemId] = useState(null);
    const [showAnalytics, setShowAnalytics] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        quantity: '',
        status: '',
        barcode: '',
        estimatedPrice: '',
        source: '',
        images: [],
    });

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            category: '',
            quantity: '',
            status: '',
            barcode: '',
            estimatedPrice: '',
            source: '',
            images: [],
        });
        setIsEditing(false);
        setCurrentItemId(null);
    };

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

    // Filter items
    const filteredItems = scrapItems.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             item.barcode.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    const fetchScrapItems = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/scrap`);
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            setScrapItems(data);
            setError(null);
        } catch (err) {
            setError(err.message);
            showToast('Failed to load materials', 'error');
        } finally {
            setLoading(false);
        }
    };

    const createScrapItem = async (formData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/scrap`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to create the material');
            }

            const data = await response.json();
            setScrapItems((prevItems) => [...prevItems, data.data]);
            showToast('Material added successfully');
        } catch (err) {
            setError(err.message);
            showToast('Failed to add the material', 'error');
        }
    };

    const updateScrapItem = async (id, updatedFormData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/scrap/${id}`, {
                method: 'PUT',
                body: updatedFormData,
            });

            if (!response.ok) {
                throw new Error('Failed to update the material');
            }

            const updatedItem = await response.json();
            setScrapItems((prevItems) =>
                prevItems.map((item) => (item._id === id ? updatedItem.data : item))
            );
            setIsEditing(false);
            setCurrentItemId(null);
            resetForm();
            showToast('Material updated successfully');
        } catch (err) {
            setError(err.message);
            showToast('Failed to update the material', 'error');
        }
    };

    const deleteScrapItem = async (id) => {
        setActionLoading(id);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/scrap/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete the material');
            }
            setScrapItems((prevItems) => prevItems.filter(item => item._id !== id));
            showToast('Material deleted successfully');
        } catch (err) {
            setError(err.message);
            showToast('Failed to delete the material', 'error');
        } finally {
            setActionLoading(null);
            setModalOpen(false);
        }
    };

    const handleDeleteClick = (id) => {
        setItemToDelete(id);
        setModalOpen(true);
    };

    const handleEditClick = (item) => {
        setFormData({
            name: item.name,
            description: item.description,
            category: item.category,
            quantity: item.quantity,
            status: item.status,
            barcode: item.barcode,
            estimatedPrice: item.estimatedPrice,
            source: item.source,
            images: [],
        });
        setCurrentItemId(item._id);
        setIsEditing(true);
        setPopupOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;

        if (name === "images") {
            setFormData({ ...formData, images: files });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newFormData = new FormData();
        for (const key in formData) {
            if (key === 'images') {
                Array.from(formData.images).forEach((file) => {
                    newFormData.append('images', file);
                });
            } else {
                newFormData.append(key, formData[key]);
            }
        }

        if (isEditing && currentItemId) {
            updateScrapItem(currentItemId, newFormData);
        } else {
            createScrapItem(newFormData);
        }
        resetForm();
        setPopupOpen(false);
    };

    useEffect(() => {
        if (user && user.role === "admin") {
            fetchScrapItems();
        } else {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm font-medium">Loading materials...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-12 border border-red-200 rounded-2xl bg-red-50 shadow-sm">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 mb-4">
                    <svg className="h-10 w-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">An error occurred</h3>
                <p className="text-sm text-red-600 mb-4">{error}</p>
                <button 
                    onClick={fetchScrapItems}
                    className="bg-red-600 text-white px-5 py-2.5 rounded-xl hover:bg-red-700 transition font-medium text-sm"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!user || user.role !== "admin") {
        return (
            <div className="text-center p-12 border border-gray-200 rounded-2xl bg-white shadow-sm">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mb-4">
                    <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Unauthorized Access</h3>
                <p className="text-sm text-gray-600">You do not have the required permissions to view this page.</p>
            </div>
        );
    }

    const ScrapItemCard = ({ item }) => {
        const isLoading = actionLoading === item._id;

        return (
            <div className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white hover:shadow-xl transition-all duration-300">
                {/* Status badge */}
                <div className="absolute top-3 left-3 z-10">
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold ${
                        item.status === 'Ready for Auction' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'Ready for Recycling' ? 'bg-blue-100 text-blue-800' :
                        item.status === 'Processed' ? 'bg-amber-100 text-amber-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                        {item.status === 'Ready for Auction' ? '🔨 Ready for Auction' :
                         item.status === 'Ready for Recycling' ? '♻️ Ready for Recycling' :
                         item.status === 'Processed' ? '⚙️ Processed' :
                         '📥 Received'}
                    </span>
                </div>

                {/* Image slider */}
                <div className='relative'>
                    <Slider {...settings}>
                        {item.images.map((image, index) => (
                            <div key={index}>
                                <img 
                                    src={image} 
                                    alt={item.name} 
                                    className="w-full h-56 object-cover" 
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'; }}
                                />
                            </div>
                        ))}
                    </Slider>
                    {/* Category badge */}
                    <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-semibold text-blue-600">
                        {item.category === 'Metals' ? '🔩 Metals' :
                         item.category === 'Plastics' ? '♻️ Plastics' :
                         item.category === 'Electronics' ? '💻 Electronics' :
                         item.category === 'Paper and Cardboard' ? '📄 Paper and Cardboard' :
                         '🪑 Furniture'}
                    </div>
                </div>

                {/* Content */}
                <div className="p-5">
                    <h3 className="font-bold text-xl mb-2 text-gray-800 line-clamp-1">{item.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                    
                    {/* Info grid */}
                    <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                        <div className="bg-gray-50 rounded-lg p-2">
                            <p className="text-gray-500 text-xs">Quantity</p>
                            <p className="font-semibold text-gray-800">{item.quantity} tons</p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-2">
                            <p className="text-gray-500 text-xs">Estimated Price</p>
                            <p className="font-semibold text-green-700">{item.estimatedPrice.toLocaleString()} SYP</p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-2">
                            <p className="text-gray-500 text-xs">Barcode</p>
                            <p className="font-semibold text-blue-700 font-mono text-xs">{item.barcode}</p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-2">
                            <p className="text-gray-500 text-xs">Source</p>
                            <p className="font-semibold text-purple-700 text-xs">
                                {item.source === 'User Request' ? '👤 User' : '✍️ Manual'}
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => handleEditClick(item)}
                            disabled={isLoading}
                            className={`flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition ${
                                isLoading ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            <PencilAltIcon className="h-4 w-4" />
                            Edit
                        </button>
                        <button 
                            onClick={() => handleDeleteClick(item._id)}
                            disabled={isLoading}
                            className="flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition text-xs font-medium disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                        >
                            <TrashIcon className="h-4 w-4" />
                            Delete
                        </button>
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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Manage Materials</h1>
                <p className="mt-1 text-sm text-gray-500">
                    Add, manage, and track recyclable materials
                </p>
            </div>

            {/* Statistics - Toggle */}
            {showAnalytics && <ScreapItemsAnalytics scrapItems={scrapItems} />}

            {/* Search and filters */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
                <div className="flex flex-col gap-3">
                    {/* Search and buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search for a material..."
                                className="w-full rounded-xl border border-gray-300 py-2.5 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => setShowAnalytics(!showAnalytics)}
                            className="flex items-center justify-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl hover:bg-purple-700 transition font-medium text-sm shadow-sm"
                        >
                            <ChartBarIcon className="h-5 w-5" />
                            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
                        </button>
                        <button
                            onClick={() => { resetForm(); setPopupOpen(true); }}
                            className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition font-medium text-sm shadow-sm"
                        >
                            <PlusIcon className="h-5 w-5" />
                            Add New Material
                        </button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap items-center gap-2">
                        <FilterIcon className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600 font-medium">Category:</span>
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
                        
                        <span className="text-sm text-gray-600 font-medium ml-3">Status:</span>
                        {['all', 'Received', 'Processed', 'Ready for Recycling', 'Ready for Auction'].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                                    statusFilter === status ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {status === 'all' ? 'All' : 
                                 status === 'Received' ? 'Received' : 
                                 status === 'Processed' ? 'Processed' : 
                                 status === 'Ready for Recycling' ? 'Ready for Recycling' : 'Ready for Auction'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Popup */}
            {isPopupOpen && (
                <PopupForm
                    isOpen={isPopupOpen}
                    onClose={() => { setPopupOpen(false); resetForm(); }}
                    formData={formData}
                    handleInputChange={handleInputChange}
                    handleSubmit={handleSubmit}
                    isEditing={isEditing}
                />
            )}

            {/* Confirmation Modal */}
            <ConfirmModal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                onConfirm={() => { deleteScrapItem(itemToDelete); }}
                title="Delete Material"
                message="This material will be permanently deleted. Are you sure?"
                type="danger"
                loading={!!actionLoading}
                confirmText="Delete"
            />

            {/* Items grid */}
            {filteredItems.length === 0 ? (
                <div className="text-center p-12 border border-gray-200 rounded-2xl bg-white shadow-sm">
                    <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 mb-4">
                        <svg className="h-10 w-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No materials</h3>
                    <p className="text-sm text-gray-500">
                        {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                            ? 'No results match the search or filters.' 
                            : 'No materials have been added yet.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map(item => (
                        <ScrapItemCard
                            key={item._id}
                            item={item}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminScrapItems;
