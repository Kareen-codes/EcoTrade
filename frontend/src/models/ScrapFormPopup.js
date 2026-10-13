import React, { useState } from 'react';
import { 
    XIcon, 
    PhotographIcon, 
} from '@heroicons/react/outline';

const PopupForm = ({ isOpen, onClose, formData, handleInputChange, handleSubmit, isEditing }) => {
    const [previewImages, setPreviewImages] = useState([]);

    if (!isOpen) return null;

    // Handle image preview
    const handleImageChange = (e) => {
        handleInputChange(e);
        const files = Array.from(e.target.files);
        const previews = files.map(file => URL.createObjectURL(file));
        setPreviewImages(previews);
    };

    const removePreviewImage = (index) => {
        setPreviewImages(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-emerald-600 text-white p-5 flex justify-between items-center">
                    <h2 className="text-xl font-bold">
                        {isEditing ? 'Edit Material' : 'Add New Material'}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1.5 transition"
                    >
                        <XIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Form Content */}
                <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
                    <div className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Material Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                placeholder="e.g., copper scrap"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                placeholder="A detailed description of the material..."
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                rows="3"
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition resize-none"
                            />
                        </div>

                        {/* Category and Status */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition"
                                >
                                    <option value="">Select a category</option>
                                    <option value="Metals">🔩 Metals</option>
                                    <option value="Plastics">♻️ Plastics</option>
                                    <option value="Electronics">💻 Electronics</option>
                                    <option value="Paper and Cardboard">📄 Paper and Cardboard</option>
                                    <option value="Furniture">🪑 Furniture</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition"
                                >
                                    <option value="">Select a status</option>
                                    <option value="Received">📥 Received</option>
                                    <option value="Processed">⚙️ Processed</option>
                                    <option value="Ready for Recycling">♻️ Ready for Recycling</option>
                                    <option value="Ready for Auction">🔨 Ready for Auction</option>
                                </select>
                            </div>
                        </div>

                        {/* Quantity and Price */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Quantity (tons) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="quantity"
                                    placeholder="5.5"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Estimated Price (SYP) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    name="estimatedPrice"
                                    placeholder="500000"
                                    value={formData.estimatedPrice}
                                    onChange={handleInputChange}
                                    required
                                    min="0"
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition"
                                />
                            </div>
                        </div>

                        {/* Barcode and Source */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Barcode <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="barcode"
                                    placeholder="SCR-2024-001"
                                    value={formData.barcode}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition font-mono text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                    Source <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="source"
                                    value={formData.source}
                                    onChange={handleInputChange}
                                    required
                                    className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition"
                                >
                                    <option value="">Select a source</option>
                                    <option value="User Request">👤 User Request</option>
                                    <option value="Admin Manual Entry">✍️ Manual Entry</option>
                                </select>
                            </div>
                        </div>

                        {/* Images Upload */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Material Images
                            </label>
                            <div className="relative border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-emerald-400 transition">
                                <input
                                    type="file"
                                    name="images"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <PhotographIcon className="h-10 w-10 mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600 font-medium mb-1">
                                    Click or drag images here
                                </p>
                                <p className="text-xs text-gray-500">
                                    You can upload multiple images
                                </p>
                            </div>

                            {/* Image Previews */}
                            {previewImages.length > 0 && (
                                <div className="mt-3 grid grid-cols-4 gap-2">
                                    {previewImages.map((preview, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-20 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removePreviewImage(index)}
                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                                            >
                                                <XIcon className="h-3 w-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-3 mt-6 pt-4 border-t">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition font-medium text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-emerald-600 text-white px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition font-medium text-sm shadow-sm"
                        >
                            {isEditing ? "Update Material" : "Add Material"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PopupForm;
