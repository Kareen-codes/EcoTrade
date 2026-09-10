// Enhanced Admin Header with Modern Design
import React, { useState, useContext } from 'react';
import { 
    MenuIcon, 
    XIcon, 
    UserCircleIcon,
    LogoutIcon
} from '@heroicons/react/outline';
import UserContext from '../../context/UserContext';
import UserInfoModal from '../../models/UserInfoModal';
import LogoutConfirmModal from '../../models/LogoutConfirmModal';

const AdminHeader = ({ sidebarOpen, setSidebarOpen }) => {
    const { user, logoutUser } = useContext(UserContext);
    const [isUserInfoModalOpen, setIsUserInfoModalOpen] = useState(false);
    const [isLogoutConfirmModalOpen, setIsLogoutConfirmModalOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const handleLogout = () => {
        logoutUser();
        setIsLogoutConfirmModalOpen(false);
    };

    return (
        <>
            <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-40">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        
                        {/* Left Side - Menu Toggle & Logo */}
                        <div className="flex items-center gap-4">
                            {/* Sidebar Toggle */}
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {sidebarOpen ? (
                                    <XIcon className="h-6 w-6" />
                                ) : (
                                    <MenuIcon className="h-6 w-6" />
                                )}
                            </button>

                            {/* Dashboard Title */}
                            <div className="hidden md:flex items-center">
                                <h1 className="text-xl font-bold text-gray-800">
                                    Admin Dashboard
                                </h1>
                            </div>
                        </div>

                        {/* Center - Page Title or Info */}
                        <div className="hidden md:flex flex-1 items-center justify-center">
                            <div className="text-center">
                                <p className="text-sm text-gray-600">Admin Dashboard - EcoTrade</p>
                            </div>
                        </div>

                        {/* Right Side - User Profile */}
                        <div className="flex items-center gap-2 md:gap-4">

                            {/* User Profile Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-all duration-200 focus:outline-none"
                                >
                                    {user?.profileImage ? (
                                        <img
                                            src={user.profileImage}
                                            alt={user.name}
                                            className="h-9 w-9 rounded-full border-2 border-blue-500 object-cover"
                                        />
                                    ) : (
                                        <UserCircleIcon className="h-9 w-9 text-gray-600" />
                                    )}
                                    <div className="hidden md:block text-left ml-2">
                                        <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                                        <p className="text-xs text-gray-500">System Administrator</p>
                                    </div>
                                </button>

                                {/* User Menu Dropdown */}
                                {showUserMenu && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                                        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
                                            <div className="flex items-center gap-3">
                                                {user?.profileImage ? (
                                                    <img
                                                        src={user.profileImage}
                                                        alt={user.name}
                                                        className="h-12 w-12 rounded-full border-2 border-blue-500 object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-lg">
                                                        {user?.name?.charAt(0)}
                                                    </div>
                                                )}
                                                <div className="flex-1">
                                                    <p className="font-bold text-gray-800">{user?.name}</p>
                                                    <p className="text-xs text-gray-600">{user?.email}</p>
                                                    <span className="inline-block mt-1 px-2 py-0.5 bg-gradient-to-r from-red-100 to-red-200 text-red-800 text-xs font-bold rounded-full border border-red-300">
                                                        👑 System Administrator
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="py-2">
                                            <button
                                                onClick={() => {
                                                    setIsUserInfoModalOpen(true);
                                                    setShowUserMenu(false);
                                                }}
                                                className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-3 transition-colors"
                                            >
                                                <UserCircleIcon className="h-5 w-5 text-blue-600" />
                                                <span className="font-medium">My Profile</span>
                                            </button>
                                        </div>
                                        <div className="border-t border-gray-200 py-2 bg-red-50">
                                            <button
                                                onClick={() => {
                                                    setIsLogoutConfirmModalOpen(true);
                                                    setShowUserMenu(false);
                                                }}
                                                className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-100 flex items-center gap-3 transition-colors font-medium"
                                            >
                                                <LogoutIcon className="h-5 w-5" />
                                                <span>Log Out</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Modals */}
            {isUserInfoModalOpen && (
                <UserInfoModal user={user} onClose={() => setIsUserInfoModalOpen(false)} />
            )}
            {isLogoutConfirmModalOpen && (
                <LogoutConfirmModal
                    onConfirm={handleLogout}
                    onCancel={() => setIsLogoutConfirmModalOpen(false)}
                />
            )}

            {/* Overlay for dropdowns */}
            {showUserMenu && (
                <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowUserMenu(false)}
                />
            )}
        </>
    );
};

export default AdminHeader;
