import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaTachometerAlt } from 'react-icons/fa';

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
    <div className="fixed bottom-24 right-6 z-50">
      <Link
        to={getDashboardLink()}
        className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center"
        title={getDashboardTitle()}
      >
        <FaTachometerAlt className="w-6 h-6" />
      </Link>
    </div>
  );
};

export default DashboardQuickAccess;
