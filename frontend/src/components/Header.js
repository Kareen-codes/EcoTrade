import React, { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  UserIcon,
  LoginIcon,
  LogoutIcon,
  MenuIcon,
  XIcon,
  HomeIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  UsersIcon,
  CollectionIcon,
} from "@heroicons/react/solid";
import UserContext from "../context/UserContext";
import UserInfoModal from "../models/UserInfoModal";
import LogoutConfirmModal from "../models/LogoutConfirmModal";
import logo from "../assets/images/ecomate-logo.svg";

/**
 * Shared EcoMate AI header for authenticated/app pages (login, register,
 * orders, auctions, admin...). Visually consistent with the homepage
 * navbar: EcoMate logo + wordmark, green accent, rounded pills.
 * Auth entry points and modals are unchanged — frontend design only.
 */
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

  const isActive = (path) => location.pathname === path;

  const NavLink = ({ to, icon: Icon, children }) => {
    const active = isActive(to);
    return (
      <Link
        to={to}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
          active
            ? "bg-green-600 text-white shadow-md shadow-green-600/25"
            : "text-gray-700 hover:bg-green-50 hover:text-green-700"
        }`}
      >
        <Icon className="w-5 h-5" />
        <span className="font-medium">{children}</span>
      </Link>
    );
  };

  const Brand = () => (
    <Link to="/" className="flex items-center gap-2.5 group">
      <img
        src={logo}
        alt="EcoMate AI"
        className="h-10 w-10 rounded-xl transform group-hover:scale-105 transition-transform"
      />
      <span className="text-2xl font-bold text-gray-900">
        EcoMate<span className="text-green-500"> AI</span>
      </span>
    </Link>
  );

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100">
      <nav className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Brand />

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

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <button
                  onClick={() => setIsUserInfoModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition-all shadow-sm"
                >
                  <UserIcon className="w-5 h-5 text-green-600" />
                  <span className="font-medium">{user.name}</span>
                </button>
                <button
                  onClick={() => setIsLogoutConfirmModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-md"
                >
                  <LogoutIcon className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-sm"
                >
                  <LoginIcon className="w-5 h-5" />
                  <span className="font-medium">Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-800 rounded-xl hover:bg-green-50 hover:border-green-300 transition-all"
                >
                  <UserIcon className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Sign Up</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className={`md:hidden p-2 rounded-xl bg-green-600 text-white shadow-md ${isMenuOpen ? "hidden" : ""}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Open menu"
          >
            <MenuIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden fixed inset-0 bg-white z-50 overflow-y-auto">
            <div className="flex flex-col h-full">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-6 border-b bg-green-50">
                <Brand />
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all"
                  aria-label="Close menu"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Menu Links */}
              <div className="flex-1 px-6 py-8 space-y-2">
                {user ? (
                  <>
                    <MobileLink to="/" icon={HomeIcon} active={isActive("/")} onClick={() => setIsMenuOpen(false)}>
                      Home
                    </MobileLink>
                    <MobileLink to="/orders" icon={ShoppingBagIcon} active={isActive("/orders")} onClick={() => setIsMenuOpen(false)}>
                      Orders
                    </MobileLink>
                    <MobileLink to="/auctions" icon={ChartBarIcon} active={isActive("/auctions")} onClick={() => setIsMenuOpen(false)}>
                      Auctions
                    </MobileLink>
                    {user.role === "admin" && (
                      <>
                        <MobileLink to="/users" icon={UsersIcon} active={isActive("/users")} onClick={() => setIsMenuOpen(false)}>
                          Manage Users
                        </MobileLink>
                        <MobileLink to="/scrap" icon={CollectionIcon} active={isActive("/scrap")} onClick={() => setIsMenuOpen(false)}>
                          Manage Materials
                        </MobileLink>
                      </>
                    )}

                    <div className="pt-6 mt-6 border-t space-y-2">
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsUserInfoModalOpen(true);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition-all shadow-sm"
                      >
                        <UserIcon className="w-6 h-6 text-green-600" />
                        <span className="font-medium">{user.name}</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          setIsLogoutConfirmModalOpen(true);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all shadow-md"
                      >
                        <LogoutIcon className="w-6 h-6" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <MobileLink to="/" icon={HomeIcon} active={isActive("/")} onClick={() => setIsMenuOpen(false)}>
                      Home
                    </MobileLink>

                    <div className="pt-6 mt-6 border-t space-y-2">
                      <Link
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all shadow-md"
                      >
                        <LoginIcon className="w-6 h-6" />
                        <span className="font-medium">Sign In</span>
                      </Link>
                      <Link
                        to="/register"
                        onClick={() => setIsMenuOpen(false)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-800 rounded-xl hover:bg-green-50 hover:border-green-300 transition-all"
                      >
                        <UserIcon className="w-6 h-6 text-green-600" />
                        <span className="font-medium">Sign Up</span>
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

const MobileLink = ({ to, icon: Icon, active, onClick, children }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active ? "bg-green-600 text-white shadow-md" : "bg-gray-50 text-gray-700 hover:bg-green-50 hover:text-green-700"
    }`}
  >
    <Icon className="w-6 h-6" />
    <span className="font-medium">{children}</span>
  </Link>
);

export default Header;
