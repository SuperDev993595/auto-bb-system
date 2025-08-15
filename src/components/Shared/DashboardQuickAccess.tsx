import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaTachometerAlt } from 'react-icons/fa';

const DashboardQuickAccess: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = window.location.pathname;

  // Don't show on admin dashboard pages
  if (!isAuthenticated || location.startsWith('/admin/dashboard')) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Link
        to="/admin/dashboard"
        className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center"
        title="Go to Dashboard"
      >
        <FaTachometerAlt className="w-6 h-6" />
      </Link>
    </div>
  );
};

export default DashboardQuickAccess;
