import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserIcon, LoginIcon, LogoutIcon, MenuIcon, XIcon, HomeIcon, ShoppingBagIcon, ChartBarIcon, UsersIcon, CollectionIcon } from '@heroicons/react/solid';
import UserContext from '../context/UserContext';
import UserInfoModal from '../models/UserInfoModal';
import LogoutConfirmModal from '../models/LogoutConfirmModal';
import logo from '../assets/images/logo.png';

const Header = () => {
    const { user, logoutUser } = useContext(UserContext);
    const [isUserInfoModalOpen, setIsUserInfoModalOpen] = useState(false);
    const [isLogoutConfirmModalOpen, setIsLogoutConfirmModalOpen] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const handleLogout = () => {
        logoutUser();
        setIsLogoutConfirmModalOpen(false);
    };

    const isActive = (path) => {
        return location.pathname === path;
    };

    const NavLink = ({ to, icon: Icon, children }) => {
        const active = isActive(to);
        return (
            <Link 
                to={to} 
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
                    active 
                        ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg' 
                        : 'text-gray-700 hover:bg-green-50 hover:text-green-600'
                }`}
            >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{children}</span>
            </Link>
        );
    };

    return (
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100">
            <nav className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo Section - Enhanced */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity"></div>
                            <img src={logo} alt="EcoTrade Logo" className="relative h-12 w-auto transform group-hover:scale-110 transition-transform" />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                                EcoTrade
                            </h1>
                            <p className="text-xs text-gray-500">Smart Recycling</p>
                        </div>
                    </Link>

                    {/* Desktop Navigation Links */}
                    <div className="hidden md:flex items-center gap-2">
                        {user ? (
                            <>
                                <NavLink to="/" icon={HomeIcon}>Home</NavLink>
                                <NavLink to="/orders" icon={ShoppingBagIcon}>Orders</NavLink>
                                <NavLink to="/auctions" icon={ChartBarIcon}>Auctions</NavLink>
                                {user.role === "admin" && (
                                    <>
                                        <NavLink to="/users" icon={UsersIcon}>Users</NavLink>
                                        <NavLink to="/scrap" icon={CollectionIcon}>Materials</NavLink>
                                    </>
                                )}
                            </>
                        ) : (
                            <NavLink to="/" icon={HomeIcon}>Home</NavLink>
                        )}
                    </div>

                    {/* Desktop Action Buttons - Enhanced */}
                    <div className="hidden md:flex items-center gap-3">
                        {user ? (
                            <>
                                <button
                                    onClick={() => setIsUserInfoModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all shadow-md"
                                >
                                    <UserIcon className="w-5 h-5 text-green-600" />
                                    <span className="font-medium">{user.name}</span>
                                </button>
                                <button
                                    onClick={() => setIsLogoutConfirmModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-700 hover:to-red-600 transition-all shadow-lg transform hover:scale-105"
                                >
                                    <LogoutIcon className="w-5 h-5" />
                                    <span className="font-medium">Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg transform hover:scale-105"
                                >
                                    <LoginIcon className="w-5 h-5" />
                                    <span className="font-medium">Login</span>
                                </Link>
                                <Link
                                    to="/register"
                                    className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 transition-all shadow-lg transform hover:scale-105"
                                >
                                    <UserIcon className="w-5 h-5" />
                                    <span className="font-medium">Sign Up</span>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className={`md:hidden p-2 rounded-xl bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg ${isMenuOpen ? "hidden" : ""}`}
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        <MenuIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Mobile Menu - Enhanced */}
                {isMenuOpen && (
                    <div className="md:hidden fixed inset-0 bg-white z-50 overflow-y-auto">
                        <div className="flex flex-col h-full">
                            {/* Mobile Menu Header */}
                            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-50 to-teal-50">
                                <div className="flex items-center gap-3">
                                    <img src={logo} alt="Logo" className="h-10 w-auto" />
                                    <div>
                                        <h2 className="text-xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                                            EcoTrade
                                        </h2>
                                        <p className="text-xs text-gray-500">Smart Recycling</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsMenuOpen(false)}
                                    className="p-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-700 hover:to-red-600 transition-all"
                                >
                                    <XIcon className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Mobile Menu Links */}
                            <div className="flex-1 px-6 py-8 space-y-2">
                                {user ? (
                                    <>
                                        <Link 
                                            to="/" 
                                            onClick={() => setIsMenuOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                                isActive('/') 
                                                    ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg' 
                                                    : 'bg-gray-50 text-gray-700 hover:bg-green-50'
                                            }`}
                                        >
                                            <HomeIcon className="w-6 h-6" />
                                            <span className="font-medium">Home</span>
                                        </Link>
                                        <Link 
                                            to="/orders" 
                                            onClick={() => setIsMenuOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                                isActive('/orders') 
                                                    ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg' 
                                                    : 'bg-gray-50 text-gray-700 hover:bg-green-50'
                                            }`}
                                        >
                                            <ShoppingBagIcon className="w-6 h-6" />
                                            <span className="font-medium">Orders Page</span>
                                        </Link>
                                        <Link 
                                            to="/auctions" 
                                            onClick={() => setIsMenuOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                                isActive('/auctions') 
                                                    ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg' 
                                                    : 'bg-gray-50 text-gray-700 hover:bg-green-50'
                                            }`}
                                        >
                                            <ChartBarIcon className="w-6 h-6" />
                                            <span className="font-medium">Auctions Page</span>
                                        </Link>
                                        {user.role === "admin" && (
                                            <>
                                                <Link 
                                                    to="/users" 
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-green-50 transition-all"
                                                >
                                                    <UsersIcon className="w-6 h-6" />
                                                    <span className="font-medium">Manage Users</span>
                                                </Link>
                                                <Link 
                                                    to="/scrap" 
                                                    onClick={() => setIsMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-green-50 transition-all"
                                                >
                                                    <CollectionIcon className="w-6 h-6" />
                                                    <span className="font-medium">Manage Materials</span>
                                                </Link>
                                            </>
                                        )}
                                        
                                        <div className="pt-6 mt-6 border-t space-y-2">
                                            <button
                                                onClick={() => {
                                                    setIsMenuOpen(false);
                                                    setIsUserInfoModalOpen(true);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all shadow-md"
                                            >
                                                <UserIcon className="w-6 h-6 text-green-600" />
                                                <span className="font-medium">{user.name}</span>
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsMenuOpen(false);
                                                    setIsLogoutConfirmModalOpen(true);
                                                }}
                                                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:from-red-700 hover:to-red-600 transition-all shadow-lg"
                                            >
                                                <LogoutIcon className="w-6 h-6" />
                                                <span className="font-medium">Log Out</span>
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <Link 
                                            to="/" 
                                            onClick={() => setIsMenuOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                                                isActive('/') 
                                                    ? 'bg-gradient-to-r from-green-600 to-teal-600 text-white shadow-lg' 
                                                    : 'bg-gray-50 text-gray-700 hover:bg-green-50'
                                            }`}
                                        >
                                            <HomeIcon className="w-6 h-6" />
                                            <span className="font-medium">Home</span>
                                        </Link>
                                        
                                        <div className="pt-6 mt-6 border-t space-y-2">
                                            <Link
                                                to="/login"
                                                onClick={() => setIsMenuOpen(false)}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all shadow-lg"
                                            >
                                                <LoginIcon className="w-6 h-6" />
                                                <span className="font-medium">Log In</span>
                                            </Link>
                                            <Link
                                                to="/register"
                                                onClick={() => setIsMenuOpen(false)}
                                                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 transition-all shadow-lg"
                                            >
                                                <UserIcon className="w-6 h-6" />
                                                <span className="font-medium">Create New Account</span>
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Modals */}
            {isUserInfoModalOpen && <UserInfoModal user={user} onClose={() => setIsUserInfoModalOpen(false)} />}
            {isLogoutConfirmModalOpen && (
                <LogoutConfirmModal
                    onConfirm={handleLogout}
                    onCancel={() => setIsLogoutConfirmModalOpen(false)}
                />
            )}
        </header>
    );
};

export default Header;
