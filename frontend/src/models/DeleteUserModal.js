import React, { useEffect } from 'react';
import { UserGroupIcon, XIcon } from '@heroicons/react/outline';

/**
 * DeleteUserModal - Confirmation dialog before deleting a user
 * Features: backdrop blur, smooth animations, keyboard support
 */
const DeleteUserModal = ({ isOpen, userName, onConfirm, onCancel }) => {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onCancel();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onCancel]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={onCancel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-user-modal-title"
        >
            <div
                className="relative w-full max-w-md overflow-hidden bg-white rounded-2xl shadow-2xl animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-red-600 to-rose-600" />
                <button
                    onClick={onCancel}
                    className="absolute top-4 left-4 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
                    aria-label="Close"
                >
                    <XIcon className="w-5 h-5" />
                </button>
                <div className="p-8 pt-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-red-50">
                        <UserGroupIcon className="w-8 h-8 text-red-600" strokeWidth={1.5} />
                    </div>
                    <h2 id="delete-user-modal-title" className="text-xl font-bold text-gray-900 mb-2">
                        Delete User
                    </h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        Are you sure you want to delete the user <strong className="text-gray-900">{userName}</strong>? This action cannot be undone.
                    </p>
                    <div className="flex flex-col-reverse sm:flex-row gap-3 justify-center">
                        <button
                            onClick={onCancel}
                            className="px-6 py-3 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-6 py-3 rounded-xl font-medium text-white bg-red-600 hover:bg-red-700 transition-all duration-200 shadow-lg shadow-red-500/30"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeleteUserModal;
