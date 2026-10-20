import React, { useEffect } from 'react';
import { XIcon, ExclamationIcon } from '@heroicons/react/outline';

// Reusable confirmation dialog component
const ConfirmDialog = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText = 'Confirm', 
    cancelText = 'Cancel',
    type = 'warning' // 'warning', 'danger', 'info'
}) => {
    // Close on Escape key
    useEffect(() => {
        if (!isOpen) return;
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Determine color scheme based on type
    const colorSchemes = {
        warning: {
            bg: 'bg-amber-100',
            icon: 'text-amber-600',
            button: 'bg-amber-600 hover:bg-amber-700',
        },
        danger: {
            bg: 'bg-red-100',
            icon: 'text-red-600',
            button: 'bg-red-600 hover:bg-red-700',
        },
        info: {
            bg: 'bg-blue-100',
            icon: 'text-blue-600',
            button: 'bg-blue-600 hover:bg-blue-700',
        }
    };

    const colors = colorSchemes[type] || colorSchemes.warning;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
        >
            {/* Backdrop */}
            <button 
                type="button" 
                onClick={onClose} 
                className="absolute inset-0 cursor-default" 
                aria-label="Close"
            />

            {/* Dialog */}
            <div 
                className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                    aria-label="Close"
                >
                    <XIcon className="h-5 w-5" />
                </button>

                {/* Icon */}
                <div className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${colors.bg}`}>
                    <ExclamationIcon className={`h-8 w-8 ${colors.icon}`} />
                </div>

                {/* Title */}
                <h3 
                    id="confirm-dialog-title" 
                    className="mb-2 text-center text-xl font-bold text-gray-800"
                >
                    {title}
                </h3>

                {/* Message */}
                <p className="mb-6 text-center text-sm text-gray-600">
                    {message}
                </p>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 rounded-lg py-2.5 text-sm font-medium text-white shadow-sm transition ${colors.button}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
