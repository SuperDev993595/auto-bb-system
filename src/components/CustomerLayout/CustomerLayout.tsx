import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function CustomerLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Customer Portal
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.name || 'Customer'}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-red-600 hover:text-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <nav className="space-y-2">
              <Link
                to="/"
                className="block px-4 py-2 rounded-lg text-sm font-medium transition-colors text-gray-600 hover:bg-gray-100"
              >
                🏠 Home
              </Link>
              
              <Link
                to="/customer/dashboard"
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/customer/dashboard' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📊 Dashboard
              </Link>
              
              <Link
                to="/customer/dashboard/vehicles"
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/customer/dashboard/vehicles' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                🚗 My Vehicles
              </Link>
              
              <Link
                to="/customer/dashboard/appointments"
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/customer/dashboard/appointments' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📅 Appointments
              </Link>
              
              <Link
                to="/customer/dashboard/services"
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/customer/dashboard/services' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                🔧 Services
              </Link>
              
              <Link
                to="/customer/dashboard/invoices"
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/customer/dashboard/invoices' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                💰 Invoices
              </Link>
              
              <Link
                to="/customer/dashboard/messages"
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/customer/dashboard/messages' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                💬 Messages
              </Link>
              
              <Link
                to="/customer/dashboard/notifications"
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/customer/dashboard/notifications' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                🔔 Notifications
              </Link>
              
              <Link
                to="/customer/dashboard/profile"
                className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === '/customer/dashboard/profile' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                👤 Profile
              </Link>
            </nav>
          </div>
        </nav>

                 {/* Main Content */}
         <main className="flex-1 p-6">
           <Outlet />
         </main>
      </div>
    </div>
  );
}
