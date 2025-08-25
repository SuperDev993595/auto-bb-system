import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  BarChart3, 
  Car, 
  Calendar, 
  Wrench, 
  DollarSign, 
  MessageCircle, 
  Bell, 
  User, 
  LogOut 
} from 'lucide-react';

export default function CustomerLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                Auto Service Portal
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                <User className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {user?.name || 'Customer'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-lg border-r border-gray-200 min-h-screen">
          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Navigation</h2>
              <div className="w-12 h-1 bg-blue-600 rounded-full"></div>
            </div>
            
            <nav className="space-y-1">
              <Link
                to="/"
                className="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </Link>
              
              <Link
                to="/customer/dashboard"
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname === '/customer/dashboard' 
                    ? 'bg-blue-100 text-blue-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
              
              <Link
                to="/customer/dashboard/vehicles"
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname === '/customer/dashboard/vehicles' 
                    ? 'bg-blue-100 text-blue-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Car className="w-5 h-5" />
                <span>My Vehicles</span>
              </Link>
              
              <Link
                to="/customer/dashboard/appointments"
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname === '/customer/dashboard/appointments' 
                    ? 'bg-blue-100 text-blue-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Calendar className="w-5 h-5" />
                <span>Appointments</span>
              </Link>
              
              <Link
                to="/customer/dashboard/services"
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname === '/customer/dashboard/services' 
                    ? 'bg-blue-100 text-blue-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Wrench className="w-5 h-5" />
                <span>Services</span>
              </Link>
              
              <Link
                to="/customer/dashboard/invoices"
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname === '/customer/dashboard/invoices' 
                    ? 'bg-blue-100 text-blue-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <DollarSign className="w-5 h-5" />
                <span>Invoices</span>
              </Link>
              
              <Link
                to="/customer/dashboard/messages"
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname === '/customer/dashboard/messages' 
                    ? 'bg-blue-100 text-blue-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <MessageCircle className="w-5 h-5" />
                <span>Messages</span>
              </Link>
              
              <Link
                to="/customer/dashboard/notifications"
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname === '/customer/dashboard/notifications' 
                    ? 'bg-blue-100 text-blue-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </Link>
              
              <Link
                to="/customer/dashboard/profile"
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  location.pathname === '/customer/dashboard/profile' 
                    ? 'bg-blue-100 text-blue-700 shadow-sm' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <User className="w-5 h-5" />
                <span>Profile</span>
              </Link>
            </nav>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
