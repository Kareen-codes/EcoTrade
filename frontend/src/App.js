// src/App.js - Enhanced with Admin Layout
import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Layout from './layout/Layout';
import AdminLayout from './layout/AdminLayout';
import HomePage from './pages/HomePage';
import OrdersPage from './pages/OrdersPage';
import AuctionsPage from './pages/AuctionsPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import AuctionRoom from './pages/auction/AuctionRoom';
import AdminAuctionRoom from './pages/admin/AdminAuctionRoom';
import { UserProvider } from './context/UserContext';
import UserContext from './context/UserContext';
import Termofuse from "./pages/Termofuse";
import Privacypolicy from './pages/Privacypolicy';
import SupportPage from './pages/SupportPage';
import SiteLayout from './layout/SiteLayout';
import FeedPage from './pages/FeedPage';
import PlaygroundPage from './pages/PlaygroundPage';
import UserAdmin from './pages/admin/UserAdmin';
import AdminScrapItems from './pages/admin/AdminScrapItems';
import AdminDashboard from './pages/admin/AdminDashboard';
import './index.css';

// Protected Route Component for Admin - Admin only
const ProtectedAdminRoute = ({ children }) => {
  const { user, loading } = useContext(UserContext);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return <AdminLayout>{children}</AdminLayout>;
};

// Protected Route for logged-in users (both admin and regular) - Orders & Auctions
const ProtectedUserRoute = ({ children }) => {
  const { user, loading } = useContext(UserContext);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Admin uses AdminLayout, regular users use Layout
  return user.role === 'admin' ? (
    <AdminLayout>{children}</AdminLayout>
  ) : (
    <Layout>{children}</Layout>
  );
};

// Regular Route Component
const RegularRoute = ({ children }) => {
  return <Layout>{children}</Layout>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes with Regular Layout */}
      {/* Homepage renders its own EcoMate-style navbar/footer */}
      <Route path="/" element={<HomePage />} />
      {/* Public EcoMate pages sharing the site navbar/footer */}
      <Route path="/feed" element={<SiteLayout><FeedPage /></SiteLayout>} />
      <Route path="/playground" element={<SiteLayout><PlaygroundPage /></SiteLayout>} />
      <Route path="/login" element={<RegularRoute><LoginPage /></RegularRoute>} />
      <Route path="/register" element={<RegularRoute><RegisterPage /></RegularRoute>} />
      <Route path="/terms-of-service" element={<RegularRoute><Termofuse /></RegularRoute>} />
      <Route path="/privacy-policy" element={<RegularRoute><Privacypolicy /></RegularRoute>} />
      <Route path="/support" element={<RegularRoute><SupportPage /></RegularRoute>} />
      
      {/* User Routes - Can be accessed by both admin and users */}
      <Route path="/auction-room/:auctionId" element={<RegularRoute><AuctionRoom /></RegularRoute>} />

      {/* Admin Routes with Admin Layout */}
      <Route path="/dashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
      <Route path="/users" element={<ProtectedAdminRoute><UserAdmin /></ProtectedAdminRoute>} />
      {/* Orders & Auctions - Accessible by both admin and regular users */}
      <Route path="/orders" element={<ProtectedUserRoute><OrdersPage /></ProtectedUserRoute>} />
      <Route path="/auctions" element={<ProtectedUserRoute><AuctionsPage /></ProtectedUserRoute>} />
      <Route path="/scrap" element={<ProtectedAdminRoute><AdminScrapItems /></ProtectedAdminRoute>} />
      <Route path="/contact" element={<ProtectedAdminRoute><ContactPage /></ProtectedAdminRoute>} />
      <Route path="/auction-room-admin/:auctionId" element={<ProtectedAdminRoute><AdminAuctionRoom /></ProtectedAdminRoute>} />
      
      {/* Redirects */}
      <Route path="/admin" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <UserProvider>
      <Router>
        <AppRoutes />
      </Router>
    </UserProvider>
  );
};

export default App;
