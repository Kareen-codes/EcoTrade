import React, { useEffect } from 'react';
import { XIcon, UserCircleIcon, MailIcon, CalendarIcon, ShieldCheckIcon } from '@heroicons/react/outline';

/**
 * Get user initials for avatar fallback when profile image is not available
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
 * Format role label for display
 */
const getRoleLabel = (role) => {
    const labels = { admin: 'System Administrator', user: 'User' };
    return labels[role] || role;
};

/**
 * Get role badge styling
 */
const getRoleBadgeStyle = (role) => {
    if (role === 'admin') return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
};

/**
 * UserInfoModal - Modern profile modal with glassmorphism-inspired design
 * Features: avatar with fallback, role badge, info cards, smooth animations, keyboard support
 */
const UserInfoModal = ({ user, onClose }) => {
    // Close modal on Escape key press - must be called before any conditional return
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    if (!user) return null;

    const createdAtFormatted = user.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-GB', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          })
        : '—';

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-modal-title"
        >
            <div
                className="relative w-full max-w-md overflow-hidden bg-white rounded-2xl shadow-2xl animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Decorative gradient header */}
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600" />

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 z-10 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
                    aria-label="Close"
                >
                    <XIcon className="w-5 h-5" />
                </button>

                {/* Profile header with avatar */}
                <div className="pt-10 pb-6 px-6 text-center bg-gradient-to-b from-gray-50 to-white">
                    <div className="relative inline-block">
                        {user.profileImage ? (
                            <img
                                src={user.profileImage}
                                alt={user.name}
                                className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-lg"
                            />
                        ) : (
                            <div className="flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-2xl font-bold ring-4 ring-white shadow-lg">
                                {getInitials(user.name)}
                            </div>
                        )}
                        {/* Role badge on avatar */}
                        <span
                            className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeStyle(user.role)}`}
                        >
                            {getRoleLabel(user.role)}
                        </span>
                    </div>
                    <h2 id="profile-modal-title" className="mt-6 text-xl font-bold text-gray-900">
                        {user.name}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">Profile</p>
                </div>

                {/* Info cards */}
                <div className="px-6 pb-8 space-y-3">
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100">
                            <MailIcon className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0 text-right">
                            <p className="text-xs font-medium text-gray-500 mb-0.5">Email Address</p>
                            <p className="text-gray-900 font-medium truncate">{user.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100">
                            <CalendarIcon className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0 text-right">
                            <p className="text-xs font-medium text-gray-500 mb-0.5">Created On</p>
                            <p className="text-gray-900 font-medium">{createdAtFormatted}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-100">
                            <ShieldCheckIcon className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
                        </div>
                        <div className="flex-1 min-w-0 text-right">
                            <p className="text-xs font-medium text-gray-500 mb-0.5">Role</p>
                            <p className="text-gray-900 font-medium">{getRoleLabel(user.role)}</p>
                        </div>
                    </div>
                </div>

                {/* Close button */}
                <div className="px-6 pb-8">
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-200 shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2"
                    >
                        <UserCircleIcon className="w-5 h-5" strokeWidth={2} />
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserInfoModal;
