import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Gauge } from '../../utils/icons';
import PendingApprovalsCounter from './PendingApprovalsCounter';

const DashboardQuickAccess: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const location = window.location.pathname;

  // Don't show if not authenticated or already on a dashboard page
  if (!isAuthenticated || 
      location.startsWith('/admin/dashboard') || 
      location.startsWith('/customer/dashboard')) {
    return null;
  }

  // Determine which dashboard to link to based on user role
  const getDashboardLink = () => {
    if (user?.role === 'admin') {
      return '/admin/dashboard';
    } else if (user?.role === 'customer') {
      return '/customer/dashboard';
    }
    return '/admin/dashboard'; // fallback
  };

  const getDashboardTitle = () => {
    if (user?.role === 'admin') {
      return 'Go to Admin Dashboard';
    } else if (user?.role === 'customer') {
      return 'Go to Customer Dashboard';
    }
    return 'Go to Dashboard';
  };

  return (
    <div className="fixed bottom-24 right-6 z-50 space-y-3">
      {/* Pending Approvals Quick Access */}
      <div className="relative">
        <Link
          to="/admin/dashboard/approvals"
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center border-2 border-white"
          title="Pending Approvals"
        >
          <PendingApprovalsCounter />
        </Link>
      </div>
      
      {/* Main Dashboard Quick Access */}
      <Link
        to={getDashboardLink()}
        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center border-2 border-white"
        title={getDashboardTitle()}
      >
        <Gauge className="w-6 h-6" />
      </Link>
    </div>
  );
};

export default DashboardQuickAccess;
