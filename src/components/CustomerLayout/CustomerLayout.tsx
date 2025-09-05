import React, { useState, useEffect } from 'react';
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
  Database,
  Menu,
  X
} from '../../utils/icons';

export default function CustomerLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Sidebar state management
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Load sidebar state from localStorage on component mount
  useEffect(() => {
    const storedSidebarState = localStorage.getItem('customerSidebarCollapsed');
    if (storedSidebarState) {
      setSidebarCollapsed(JSON.parse(storedSidebarState));
    }
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleHomeClick = () => {
    navigate('/');
  };

  const toggleSidebar = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    localStorage.setItem('customerSidebarCollapsed', JSON.stringify(newState));
  };

  const toggleMobileSidebar = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              {/* Mobile Sidebar Toggle */}
              <button
                onClick={toggleMobileSidebar}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors mr-2"
                title="Toggle sidebar"
              >
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
              
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
        {/* Mobile Overlay */}
        {mobileSidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={toggleMobileSidebar}
          />
        )}
        
        {/* Sidebar */}
        <nav className={`bg-white shadow-lg border-r border-gray-200 flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-20 bg-gray-50 shadow-xl' : 'w-64'
        } lg:relative lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static z-50 h-full`}>
          
          {/* Sidebar Header with Toggle */}
          <div className={`p-4 flex-shrink-0 border-b border-gray-200 ${
            sidebarCollapsed ? 'px-3' : 'px-4'
          }`}>
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
              {!sidebarCollapsed && (
                <div className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Navigation
                </div>
              )}
              
              {/* Toggle Button */}
              <button
                onClick={toggleSidebar}
                className={`p-1.5 rounded-md transition-all duration-200 hover:scale-105 active:scale-95 ${
                  sidebarCollapsed 
                    ? 'bg-blue-100 text-blue-600 hover:bg-blue-200' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
              </button>
            </div>
            
            {/* Collapsed indicator */}
            {sidebarCollapsed && (
              <div className="mt-2 text-center">
                <div className="w-1 h-1 bg-blue-400 rounded-full mx-auto"></div>
              </div>
            )}
          </div>
          
          <div className={`flex-1 overflow-y-auto custom-scrollbar ${
            sidebarCollapsed ? 'px-3' : 'px-6'
          } ${sidebarCollapsed ? 'scrollbar-hide' : ''}`}>
            <nav className={`space-y-6 ${sidebarCollapsed ? 'space-y-3' : ''} ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
              
              {/* Main Dashboard */}
              <div>
                {!sidebarCollapsed && (
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Overview
                  </h3>
                )}
                <div className="space-y-1">
                  <Link
                    to="/customer/dashboard"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-0 ${
                      location.pathname === '/customer/dashboard' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    } ${sidebarCollapsed ? 'px-2 justify-center group relative' : ''}`}
                    title={sidebarCollapsed ? "Dashboard" : ""}
                  >
                    <BarChart3 className="w-5 h-5" />
                    {!sidebarCollapsed && <span>Dashboard</span>}
                    {sidebarCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        Dashboard
                      </div>
                    )}
                  </Link>
                </div>
              </div>

              {/* Vehicle Management */}
              <div>
                {!sidebarCollapsed && (
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Vehicles
                  </h3>
                )}
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
                    {!sidebarCollapsed && <span>My Vehicles</span>}
                  </Link>
                  
                </div>
              </div>

              {/* Services & Appointments */}
              <div>
                {!sidebarCollapsed && (
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Services
                  </h3>
                )}
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
                    {!sidebarCollapsed && <span>Appointments</span>}
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
                    {!sidebarCollapsed && <span>Service Catalog</span>}
                  </Link>
                </div>
              </div>

              {/* Financial */}
              <div>
                {!sidebarCollapsed && (
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Financial
                  </h3>
                )}
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
                    {!sidebarCollapsed && <span>Invoices</span>}
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
                    {!sidebarCollapsed && <span>Payments</span>}
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
                    {!sidebarCollapsed && <span>Rewards</span>}
                  </Link>
                  
                  <Link
                    to="/customer/dashboard/memberships"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-0 ${
                      location.pathname === '/customer/dashboard/memberships' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Shield className="w-5 h-5" />
                    {!sidebarCollapsed && <span>Memberships</span>}
                  </Link>
                </div>
              </div>

              {/* Vehicle Management */}
              <div>
                {!sidebarCollapsed && (
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Vehicle Services
                  </h3>
                )}
                <div className="space-y-1">
                  <Link
                    to="/customer/dashboard/warranties"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-0 ${
                      location.pathname === '/customer/dashboard/warranties' 
                        ? 'bg-emerald-100 text-emerald-700' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <CheckCircle className="w-5 h-5" />
                    {!sidebarCollapsed && <span>Warranties</span>}
                  </Link>
                </div>
              </div>

              {/* Communication */}
              <div>
                {!sidebarCollapsed && (
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Communication
                  </h3>
                )}
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
                    {!sidebarCollapsed && <span>Messages</span>}
                  </Link>
                  
                  <Link
                    to="/customer/dashboard/live-chat"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-0 ${
                      location.pathname === '/customer/dashboard/live-chat' 
                        ? 'bg-green-100 text-green-700' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <MessageCircle className="w-5 h-5" />
                    {!sidebarCollapsed && <span>Live Chat</span>}
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
                    {!sidebarCollapsed && <span>Notifications</span>}
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
                    {!sidebarCollapsed && <span>Support</span>}
                  </Link>
                </div>
              </div>

              {/* Account */}
              <div>
                {!sidebarCollapsed && (
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Account
                  </h3>
                )}
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
                    {!sidebarCollapsed && <span>Profile</span>}
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
                    {!sidebarCollapsed && <span>Preferences</span>}
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
