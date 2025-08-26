import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
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
  LogOut,
  Shield,
  FileText,
  Users,
  Activity,
  Settings,
  CreditCard,
  Clock,
  CheckCircle,
  AlertTriangle,
  Star,
  Heart,
  Phone,
  Mail,
  Camera,
  MapPin,
  Gauge,
  Zap,
  Database
} from '../../utils/icons';

export default function CustomerLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <h1 
                className="text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
                onClick={handleHomeClick}
              >
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

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col flex-shrink-0">
          <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
            <nav className="space-y-6">
              
              {/* Main Dashboard */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Overview
                </h3>
                <div className="space-y-1">
                  <Link
                    to="/customer/dashboard"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-0 ${
                      location.pathname === '/customer/dashboard' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                </div>
              </div>

              {/* Vehicle Management */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Vehicles
                </h3>
                <div className="space-y-1">
                  <Link
                    to="/customer/dashboard/vehicles"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-0 ${
                      location.pathname === '/customer/dashboard/vehicles' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Car className="w-5 h-5" />
                    <span>My Vehicles</span>
                  </Link>
                  
                  <Link
                    to="/customer/dashboard/service-history"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-0 ${
                      location.pathname === '/customer/dashboard/service-history' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <FileText className="w-5 h-5" />
                    <span>Service History</span>
                  </Link>
                </div>
              </div>

              {/* Services & Appointments */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Services
                </h3>
                <div className="space-y-1">
                  <Link
                    to="/customer/dashboard/appointments"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-0 ${
                      location.pathname === '/customer/dashboard/appointments' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Calendar className="w-5 h-5" />
                    <span>Appointments</span>
                  </Link>
                  
                  <Link
                    to="/customer/dashboard/services"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-0 ${
                      location.pathname === '/customer/dashboard/services' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Wrench className="w-5 h-5" />
                    <span>Service Catalog</span>
                  </Link>
                </div>
              </div>

              {/* Financial */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Financial
                </h3>
                <div className="space-y-1">
                  <Link
                    to="/customer/dashboard/invoices"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-0 ${
                      location.pathname === '/customer/dashboard/invoices' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <DollarSign className="w-5 h-5" />
                    <span>Invoices</span>
                  </Link>
                  
                  <Link
                    to="/customer/dashboard/payments"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-0 ${
                      location.pathname === '/customer/dashboard/payments' 
                        ? 'bg-green-100 text-green-700' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Payments</span>
                  </Link>
                  
                  <Link
                    to="/customer/dashboard/rewards"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-0 ${
                      location.pathname === '/customer/dashboard/rewards' 
                        ? 'bg-yellow-100 text-yellow-700' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Star className="w-5 h-5" />
                    <span>Rewards</span>
                  </Link>
                </div>
              </div>

              {/* Communication */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Communication
                </h3>
                <div className="space-y-1">
                  <Link
                    to="/customer/dashboard/messages"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-0 ${
                      location.pathname === '/customer/dashboard/messages' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Messages</span>
                  </Link>
                  
                  <Link
                    to="/customer/dashboard/notifications"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-0 ${
                      location.pathname === '/customer/dashboard/notifications' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                    <span>Notifications</span>
                  </Link>
                  
                  <Link
                    to="/customer/dashboard/support"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-0 ${
                      location.pathname === '/customer/dashboard/support' 
                        ? 'bg-orange-100 text-orange-700' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Phone className="w-5 h-5" />
                    <span>Support</span>
                  </Link>
                </div>
              </div>

              {/* Account */}
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Account
                </h3>
                <div className="space-y-1">
                  <Link
                    to="/customer/dashboard/profile"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-0 ${
                      location.pathname === '/customer/dashboard/profile' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>
                  
                  <Link
                    to="/customer/dashboard/preferences"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-0 ${
                      location.pathname === '/customer/dashboard/preferences' 
                        ? 'bg-gray-100 text-gray-700' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Settings className="w-5 h-5" />
                    <span>Preferences</span>
                  </Link>
                </div>
              </div>
            </nav>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-gray-50 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
