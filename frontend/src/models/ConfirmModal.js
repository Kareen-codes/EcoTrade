// Modern Confirmation Modal Component - Reusable for different actions
import React from 'react';
import { 
    XIcon, 
    ExclamationIcon, 
    TrashIcon, 
    XCircleIcon, 
    CheckCircleIcon 
} from '@heroicons/react/outline';

const ConfirmModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    type = 'danger', 
    confirmText = 'Confirm', 
    cancelText = 'Cancel', 
    loading = false 
}) => {
    if (!isOpen) return null;

    // Type-based styling
    const typeStyles = {
        danger: {
            icon: TrashIcon,
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            confirmBg: 'bg-red-600 hover:bg-red-700',
            confirmText: 'text-white',
        },
        warning: {
            icon: ExclamationIcon,
            iconBg: 'bg-amber-100',
            iconColor: 'text-amber-600',
            confirmBg: 'bg-amber-600 hover:bg-amber-700',
            confirmText: 'text-white',
        },
        cancel: {
            icon: XCircleIcon,
            iconBg: 'bg-orange-100',
            iconColor: 'text-orange-600',
            confirmBg: 'bg-orange-600 hover:bg-orange-700',
            confirmText: 'text-white',
        },
        success: {
            icon: CheckCircleIcon,
            iconBg: 'bg-emerald-100',
            iconColor: 'text-emerald-600',
            confirmBg: 'bg-emerald-600 hover:bg-emerald-700',
            confirmText: 'text-white',
        },
    };

    const currentStyle = typeStyles[type] || typeStyles.danger;
    const Icon = currentStyle.icon;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl animate-fadeIn">
                {/* Close button */}
                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
                >
                    <XIcon className="h-5 w-5" />
                </button>

                {/* Content */}
                <div className="p-6">
                    {/* Icon */}
                    <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${currentStyle.iconBg}`}>
                        <Icon className={`h-8 w-8 ${currentStyle.iconColor}`} />
                    </div>

                    {/* Title */}
                    <h3 className="mb-2 text-center text-xl font-bold text-gray-800">
                        {title || 'Confirm Action'}
                    </h3>

                    {/* Message */}
                    <p className="mb-6 text-center text-sm text-gray-600">
                        {message || 'Are you sure you want to continue?'}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {cancelText}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={loading}
                            className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${currentStyle.confirmBg} ${currentStyle.confirmText}`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Processing...
                                </span>
                            ) : (
                                confirmText
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
