// Modern Admin Footer
import React from 'react';
import { HeartIcon } from '@heroicons/react/solid';

const AdminFooter = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-gray-200 py-4 px-6 mt-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {/* Copyright */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <p>© {currentYear} <span className="font-semibold text-gray-800">EcoTrade</span></p>
                    <span>•</span>
                    <p>All rights reserved</p>
                </div>

                {/* Made with Love */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>Made with</span>
                    <HeartIcon className="h-4 w-4 text-red-500 animate-pulse" />
                    <span>by the EcoTrade team</span>
                </div>

                {/* Quick Links */}
                <div className="flex items-center gap-4 text-sm">
                    <a href="/privacy-policy" className="text-blue-600 hover:text-blue-800 transition-colors">
                        Privacy Policy
                    </a>
                    <span className="text-gray-400">•</span>
                    <a href="/terms-of-service" className="text-blue-600 hover:text-blue-800 transition-colors">
                        Terms of Service
                    </a>
                    <span className="text-gray-400">•</span>
                    <a href="/support" className="text-blue-600 hover:text-blue-800 transition-colors">
                        Support
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default AdminFooter;
