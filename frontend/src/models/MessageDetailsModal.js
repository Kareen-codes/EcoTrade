// Message Details Modal - Modern Design with Actions
import React, { useState, useEffect } from 'react';
import { 
    XIcon, 
    MailIcon, 
    UserIcon, 
    CalendarIcon, 
    TrashIcon
} from '@heroicons/react/outline';

/**
 * Get initials from customer name for avatar fallback
 */
const getInitials = (name) => {
    if (!name) return '?';
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

/**
 * Format date to readable format
 */
const formatDate = (dateString) => {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};


/**
 * MessageDetailsModal - Modern message viewer with actions
 * Features: view details, delete, responsive design
 */
const MessageDetailsModal = ({ 
    message, 
    onClose, 
    onDelete
}) => {
    const [isDeleting, setIsDeleting] = useState(false);

    // Close modal on Escape key press
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && !isDeleting) onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose, isDeleting]);

    if (!message) return null;

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await onDelete(message._id);
            onClose();
        } catch (error) {
            console.error('Error deleting message:', error);
            setIsDeleting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="message-modal-title"
        >
            <div
                className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl animate-scaleIn flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Decorative gradient header */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-8 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-bold shadow-lg">
                            {getInitials(message.customerName)}
                        </div>
                        <div>
                            <h2 id="message-modal-title" className="text-xl font-bold text-gray-900">
                                {message.customerName}
                            </h2>
                            <p className="text-sm text-gray-500">{message.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 disabled:opacity-50"
                        aria-label="Close"
                    >
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                    {/* Date */}
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{formatDate(message.createdAt)}</span>
                        </div>
                    </div>

                    {/* Message Content */}
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-3">
                            <MailIcon className="w-5 h-5 text-gray-500" />
                            <h3 className="text-sm font-semibold text-gray-700">Message Content</h3>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                                {message.message}
                            </p>
                        </div>
                    </div>

                    {/* Message Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
                                <UserIcon className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-500">Customer Name</p>
                                <p className="text-sm font-semibold text-gray-900 truncate">{message.customerName}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-purple-50 border border-purple-100">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100">
                                <MailIcon className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-500">Email Address</p>
                                <p className="text-sm font-semibold text-gray-900 truncate">{message.email}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                    <div className="flex gap-3">
                        <button
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex-1 py-3 px-4 rounded-xl font-medium text-white bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isDeleting ? (
                                <>
                                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <TrashIcon className="w-5 h-5" />
                                    Delete Message
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MessageDetailsModal;
