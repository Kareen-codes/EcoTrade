import React, { useEffect } from 'react';
import { LogoutIcon, XIcon } from '@heroicons/react/outline';

/**
 * LogoutConfirmModal - Modern confirmation dialog for logout action
 * Features: backdrop blur, smooth animations, keyboard support, accessible design
 */
const LogoutConfirmModal = ({ onConfirm, onCancel }) => {
    // Close modal on Escape key press
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onCancel();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onCancel]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={onCancel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-modal-title"
        >
            <div
                className="relative w-full max-w-md overflow-hidden bg-white rounded-2xl shadow-2xl animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Decorative gradient header */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-red-600 to-rose-600" />

                {/* Close button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 left-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    aria-label="Close"
                >
                    <XIcon className="w-5 h-5" />
                </button>

                {/* Content */}
                <div className="p-8 pt-12 text-center">
                    {/* Icon with subtle background */}
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-red-50">
                        <LogoutIcon className="w-8 h-8 text-red-600" strokeWidth={1.5} />
                    </div>

                    <h2 id="logout-modal-title" className="text-xl font-bold text-gray-900 mb-2">
                        Log Out
                    </h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        Are you sure you want to log out of your account?
                    </p>

                    {/* Action buttons */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3 justify-center">
                        <button
                            onClick={onCancel}
                            className="px-6 py-3 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-6 py-3 rounded-xl font-medium text-white bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 shadow-lg shadow-red-500/30"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LogoutConfirmModal;
