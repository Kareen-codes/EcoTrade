// Modern Admin Sidebar with Icons and Animations
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    HomeIcon,
    UsersIcon,
    ShoppingBagIcon,
    CubeIcon,
    ChatAlt2Icon,
    CollectionIcon
} from '@heroicons/react/outline';
import logo from '../../assets/images/logo.png';

const AdminSidebar = ({ isOpen, setIsOpen }) => {
    const location = useLocation();
    const [hoveredItem, setHoveredItem] = useState(null);

    const menuItems = [
        {
            id: 'dashboard',
            name: 'Main Dashboard',
            path: '/dashboard',
            icon: HomeIcon,
            badge: null
        },
        {
            id: 'users',
            name: 'Manage Users',
            path: '/users',
            icon: UsersIcon,
            badge: null
        },
        {
            id: 'orders',
            name: 'Manage Orders',
            path: '/orders',
            icon: ShoppingBagIcon,
            badge: '12'
        },
        {
            id: 'auctions',
            name: 'Manage Auctions',
            path: '/auctions',
            icon: CollectionIcon,
            badge: '5'
        },
        {
            id: 'scrap',
            name: 'Manage Materials',
            path: '/scrap',
            icon: CubeIcon,
            badge: null
        },
        {
            id: 'contact',
            name: 'Messages',
            path: '/contact',
            icon: ChatAlt2Icon,
            badge: '3'
        }
    ];

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 h-full bg-gradient-to-b from-blue-900 via-blue-800 to-blue-900 
                    text-white shadow-2xl z-50 transition-all duration-300 ease-in-out
                    ${isOpen ? 'w-64' : 'w-20'}
                    ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}
            >
                {/* Logo Section */}
                <div className="flex items-center justify-center h-16 border-b border-blue-700 bg-blue-950">
                    <Link to="/" className="flex items-center gap-3 px-4">
                        <img 
                            src={logo} 
                            alt="EcoTrade Logo" 
                            className={`transition-all duration-300 ${isOpen ? 'h-10' : 'h-8'}`}
                        />
                        {isOpen && (
                            <div className="animate-fadeIn">
                                <h2 className="text-xl font-bold text-white">EcoTrade</h2>
                                <p className="text-xs text-blue-300">Dashboard</p>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Navigation Menu */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 scrollbar-thin scrollbar-thumb-blue-700">
                    <div className="space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.path);
                            
                            return (
                                <Link
                                    key={item.id}
                                    to={item.path}
                                    onMouseEnter={() => setHoveredItem(item.id)}
                                    onMouseLeave={() => setHoveredItem(null)}
                                    className={`
                                        flex items-center gap-4 px-4 py-3 rounded-lg
                                        transition-all duration-200 group relative
                                        ${active 
                                            ? 'bg-white text-blue-900 shadow-lg' 
                                            : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                                        }
                                    `}
                                >
                                    {/* Icon */}
                                    <Icon className={`h-6 w-6 flex-shrink-0 ${active ? 'text-blue-900' : 'text-blue-300 group-hover:text-white'}`} />
                                    
                                    {/* Menu Item Name */}
                                    {isOpen && (
                                        <span className="flex-1 font-medium animate-fadeIn">
                                            {item.name}
                                        </span>
                                    )}
                                    
                                    {/* Badge */}
                                    {isOpen && item.badge && (
                                        <span className={`
                                            px-2 py-1 text-xs font-bold rounded-full
                                            ${active 
                                                ? 'bg-blue-900 text-white' 
                                                : 'bg-red-500 text-white'
                                            }
                                        `}>
                                            {item.badge}
                                        </span>
                                    )}

                                    {/* Tooltip for collapsed sidebar */}
                                    {!isOpen && hoveredItem === item.id && (
                                        <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg whitespace-nowrap z-50">
                                            {item.name}
                                            <div className="absolute top-1/2 -left-1 transform -translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                                        </div>
                                    )}

                                    {/* Active Indicator */}
                                    {active && (
                                        <div className="absolute left-0 top-0 h-full w-1 bg-blue-900 rounded-r-full"></div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </nav>
            </aside>
        </>
    );
};

export default AdminSidebar;
