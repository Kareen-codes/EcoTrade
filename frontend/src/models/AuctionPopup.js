// Modern Auction Creation Popup - Enhanced UI/UX with validation
import React, { useState } from 'react';
import { XIcon, PhotographIcon, ExclamationCircleIcon } from '@heroicons/react/outline';

const AuctionPopup = ({ newAuction, handleChange, handleImageUpload, createAuction, closePopup }) => {
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});

    // Validation rules
    const validate = () => {
        const newErrors = {};

        if (!newAuction.itemName || newAuction.itemName.trim().length < 3) {
            newErrors.itemName = 'The item name must be at least 3 characters long';
        }

        if (!newAuction.description || newAuction.description.trim().length < 10) {
            newErrors.description = 'The description must be at least 10 characters long';
        }

        if (!newAuction.category) {
            newErrors.category = 'Please choose a category';
        }

        if (!newAuction.startPrice || newAuction.startPrice <= 0) {
            newErrors.startPrice = 'The starting price must be greater than zero';
        }

        if (!newAuction.endDate) {
            newErrors.endDate = 'Please set an end date';
        } else {
            const endDate = new Date(newAuction.endDate);
            const now = new Date();
            if (endDate <= now) {
                newErrors.endDate = 'The end date must be in the future';
            }
        }

        if (!newAuction.images || newAuction.images.length === 0) {
            newErrors.images = 'At least one image must be added';
        } else if (newAuction.images.length > 10) {
            newErrors.images = 'The maximum is 10 images';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleBlur = (field) => {
        setTouched({ ...touched, [field]: true });
        validate();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setTouched({
            itemName: true,
            description: true,
            category: true,
            startPrice: true,
            endDate: true,
            images: true,
        });

        if (validate()) {
            createAuction();
        }
    };

    const categories = [
        { value: 'Metals', label: 'Metals' },
        { value: 'Plastics', label: 'Plastics' },
        { value: 'Electronics', label: 'Electronics' },
        { value: 'Paper and Cardboard', label: 'Paper and Cardboard' },
        { value: 'Furniture', label: 'Furniture' },
    ];

    // Get minimum date (now + 1 hour)
    const getMinDateTime = () => {
        const now = new Date();
        now.setHours(now.getHours() + 1);
        return now.toISOString().slice(0, 16);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
                    <h2 className="text-xl font-bold text-gray-800">Add New Auction</h2>
                    <button
                        type="button"
                        onClick={closePopup}
                        className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-700"
                    >
                        <XIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Item Name */}
                    <div>
                        <label htmlFor="itemName" className="mb-2 block text-sm font-medium text-gray-700">
                            Item Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="itemName"
                            type="text"
                            name="itemName"
                            placeholder="e.g., an old copper sign"
                            value={newAuction.itemName}
                            onChange={handleChange}
                            onBlur={() => handleBlur('itemName')}
                            className={`w-full rounded-xl border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 ${
                                touched.itemName && errors.itemName
                                    ? 'border-red-300 focus:ring-red-500/20'
                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                            }`}
                        />
                        {touched.itemName && errors.itemName && (
                            <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                                <ExclamationCircleIcon className="h-4 w-4" />
                                {errors.itemName}
                            </p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="mb-2 block text-sm font-medium text-gray-700">
                            Item Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            placeholder="A detailed description of the item, its condition, features..."
                            value={newAuction.description}
                            onChange={handleChange}
                            onBlur={() => handleBlur('description')}
                            rows="4"
                            className={`w-full rounded-xl border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 ${
                                touched.description && errors.description
                                    ? 'border-red-300 focus:ring-red-500/20'
                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                            }`}
                        />
                        {touched.description && errors.description && (
                            <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                                <ExclamationCircleIcon className="h-4 w-4" />
                                {errors.description}
                            </p>
                        )}
                    </div>

                    {/* Category and Price */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Category */}
                        <div>
                            <label htmlFor="category" className="mb-2 block text-sm font-medium text-gray-700">
                                Category <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="category"
                                name="category"
                                value={newAuction.category}
                                onChange={handleChange}
                                onBlur={() => handleBlur('category')}
                                className={`w-full rounded-xl border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 ${
                                    touched.category && errors.category
                                        ? 'border-red-300 focus:ring-red-500/20'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                                }`}
                            >
                                {categories.map(cat => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.label}
                                    </option>
                                ))}
                            </select>
                            {touched.category && errors.category && (
                                <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                                    <ExclamationCircleIcon className="h-4 w-4" />
                                    {errors.category}
                                </p>
                            )}
                        </div>

                        {/* Start Price */}
                        <div>
                            <label htmlFor="startPrice" className="mb-2 block text-sm font-medium text-gray-700">
                                Starting Price (SYP) <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="startPrice"
                                type="number"
                                name="startPrice"
                                placeholder="1000"
                                min="1"
                                value={newAuction.startPrice}
                                onChange={handleChange}
                                onBlur={() => handleBlur('startPrice')}
                                className={`w-full rounded-xl border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 ${
                                    touched.startPrice && errors.startPrice
                                        ? 'border-red-300 focus:ring-red-500/20'
                                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                                }`}
                            />
                            {touched.startPrice && errors.startPrice && (
                                <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                                    <ExclamationCircleIcon className="h-4 w-4" />
                                    {errors.startPrice}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* End Date */}
                    <div>
                        <label htmlFor="endDate" className="mb-2 block text-sm font-medium text-gray-700">
                            End Date and Time <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="endDate"
                            type="datetime-local"
                            name="endDate"
                            min={getMinDateTime()}
                            value={newAuction.endDate}
                            onChange={handleChange}
                            onBlur={() => handleBlur('endDate')}
                            className={`w-full rounded-xl border px-4 py-3 text-sm transition focus:outline-none focus:ring-2 ${
                                touched.endDate && errors.endDate
                                    ? 'border-red-300 focus:ring-red-500/20'
                                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20'
                            }`}
                        />
                        {touched.endDate && errors.endDate && (
                            <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                                <ExclamationCircleIcon className="h-4 w-4" />
                                {errors.endDate}
                            </p>
                        )}
                    </div>

                    {/* Images */}
                    <div>
                        <label htmlFor="images" className="mb-2 block text-sm font-medium text-gray-700">
                            Item Images (up to 10 images) <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                id="images"
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={(e) => {
                                    handleImageUpload(e);
                                    setTouched({ ...touched, images: true });
                                }}
                                onBlur={() => handleBlur('images')}
                                className="hidden"
                            />
                            <label
                                htmlFor="images"
                                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 transition ${
                                    touched.images && errors.images
                                        ? 'border-red-300 bg-red-50/50'
                                        : 'border-gray-300 bg-gray-50 hover:border-blue-500 hover:bg-blue-50/50'
                                }`}
                            >
                                <PhotographIcon className="mb-2 h-10 w-10 text-gray-400" />
                                <span className="text-sm font-medium text-gray-700">
                                    {newAuction.images.length > 0
                                        ? `${newAuction.images.length} image${newAuction.images.length !== 1 ? 's' : ''} selected`
                                        : 'Click to choose images'}
                                </span>
                                <span className="mt-1 text-xs text-gray-500">PNG, JPG, JPEG (up to 10 images)</span>
                            </label>
                        </div>
                        {touched.images && errors.images && (
                            <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
                                <ExclamationCircleIcon className="h-4 w-4" />
                                {errors.images}
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            className="flex-1 rounded-xl bg-blue-600 py-3 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        >
                            Create Auction
                        </button>
                        <button
                            type="button"
                            onClick={closePopup}
                            className="rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500/50"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AuctionPopup;
