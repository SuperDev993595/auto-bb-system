import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone, Bell, User, LogOut } from '../../utils/icons';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth';

// Constants for better organization
const BRAND_INFO = {
  name: 'Auto Repair Pro',
  tagline: 'Professional Auto Care',
  logoLetter: 'A'
} as const;

const PublicNavbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Navigation items - different for authenticated customers vs public users
  const publicNavigation = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Appointments', href: '/appointments' }
  ];

  const customerNavigation = [
    { name: 'Dashboard', href: '/customer/dashboard' },
    { name: 'My Vehicles', href: '/customer/dashboard/vehicles' },
    { name: 'Appointments', href: '/customer/dashboard/appointments' },
    { name: 'Services', href: '/customer/dashboard/services' },
    { name: 'Profile', href: '/customer/dashboard/profile' }
  ];

  const navigation = isAuthenticated && authService.isCustomer() ? customerNavigation : publicNavigation;

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Memoized logo component for better performance
  const LogoComponent = useMemo(() => {
    const getLogoDestination = () => {
      if (isAuthenticated) {
        if (authService.isAdmin()) return "/admin/dashboard";
        if (authService.isCustomer()) return "/customer/dashboard";
        if (authService.isBusinessClient()) return "/business/dashboard";
      }
      return "/";
    };

    const getAriaLabel = () => {
      if (isAuthenticated) {
        if (authService.isCustomer()) return `${BRAND_INFO.name} - Go to customer dashboard`;
        if (authService.isAdmin()) return `${BRAND_INFO.name} - Go to admin dashboard`;
        if (authService.isBusinessClient()) return `${BRAND_INFO.name} - Go to business dashboard`;
      }
      return `${BRAND_INFO.name} - Go to homepage`;
    };

    return (
      <Link 
        to={getLogoDestination()} 
        className="flex items-center group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
        aria-label={getAriaLabel()}
      >
        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300 group-focus:ring-2 group-focus:ring-blue-500">
          <span className="text-white font-bold text-xl" aria-hidden="true">
            {BRAND_INFO.logoLetter}
          </span>
        </div>
        <div>
          <div className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {BRAND_INFO.name}
          </div>
          <div className="text-xs text-gray-600">{BRAND_INFO.tagline}</div>
        </div>
      </Link>
    );
  }, [isAuthenticated]);

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            {LogoComponent}
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive(item.href)
                      ? 'text-blue-600 bg-blue-50 shadow-sm'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 hover:shadow-sm'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Info and CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center text-gray-600 bg-gray-50 px-3 py-2 rounded-xl">
              <Phone className="w-4 h-4 mr-2 text-blue-600" />
              <span className="text-sm font-medium">(555) 123-4567</span>
            </div>
            
            {!isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/auth/login"
                  className="text-gray-700 hover:text-blue-600 px-4 py-2 text-sm font-medium transition-all duration-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/register"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                {/* Customer-specific features */}
                {authService.isCustomer() && (
                  <>
                    {/* Notifications */}
                    <Link
                      to="/customer/dashboard/notifications"
                      className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      aria-label="View notifications"
                    >
                      <Bell className="w-5 h-5" />
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        3
                      </span>
                    </Link>
                    
                    {/* Quick Book Appointment */}
                    <Link
                      to="/appointments"
                      className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    >
                      Book Service
                    </Link>
                  </>
                )}
                
                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    aria-label="User menu"
                    aria-expanded={isUserMenuOpen}
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium hidden lg:block">
                      {user?.name || 'User'}
                    </span>
                  </button>
                  
                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-600">{user?.email}</p>
                      </div>
                      
                      <Link
                        to={authService.isAdmin() ? "/admin/dashboard" : "/customer/dashboard"}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4 mr-3" />
                        Dashboard
                      </Link>
                      
                      {authService.isCustomer() && (
                        <>
                          <Link
                            to="/customer/dashboard/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <User className="w-4 h-4 mr-3" />
                            Profile
                          </Link>
                          <Link
                            to="/customer/dashboard/preferences"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <Bell className="w-4 h-4 mr-3" />
                            Preferences
                          </Link>
                        </>
                      )}
                      
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 p-2 rounded-xl hover:bg-gray-100 transition-all duration-300"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-300 ${
                  isActive(item.href)
                    ? 'text-blue-600 bg-blue-50 shadow-sm'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50 hover:shadow-sm'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center px-4 py-3 text-gray-600 bg-gray-50 rounded-xl mx-2">
                <Phone className="w-4 h-4 mr-2 text-blue-600" />
                <span className="text-sm font-medium">(555) 123-4567</span>
              </div>
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/auth/login"
                    className="block px-4 py-3 text-gray-700 hover:text-blue-600 text-base font-medium transition-all duration-300 rounded-xl hover:bg-gray-50 mx-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth/register"
                    className="block px-4 py-3 text-blue-600 hover:text-blue-700 text-base font-medium transition-all duration-300 rounded-xl hover:bg-blue-50 mx-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <>
                  {/* User Info */}
                  <div className="px-4 py-3 bg-gray-50 rounded-xl mx-2 mb-2">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-600">{user?.email}</p>
                  </div>
                  
                  {/* Customer-specific mobile features */}
                  {authService.isCustomer() && (
                    <>
                      <Link
                        to="/customer/dashboard/notifications"
                        className="flex items-center px-4 py-3 text-gray-700 hover:text-blue-600 text-base font-medium transition-all duration-300 rounded-xl hover:bg-blue-50 mx-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Bell className="w-5 h-5 mr-3" />
                        Notifications
                        <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          3
                        </span>
                      </Link>
                      <Link
                        to="/customer/dashboard/profile"
                        className="flex items-center px-4 py-3 text-gray-700 hover:text-blue-600 text-base font-medium transition-all duration-300 rounded-xl hover:bg-blue-50 mx-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="w-5 h-5 mr-3" />
                        Profile
                      </Link>
                      <Link
                        to="/customer/dashboard/preferences"
                        className="flex items-center px-4 py-3 text-gray-700 hover:text-blue-600 text-base font-medium transition-all duration-300 rounded-xl hover:bg-blue-50 mx-2"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Bell className="w-5 h-5 mr-3" />
                        Preferences
                      </Link>
                    </>
                  )}
                  
                  <Link
                    to={authService.isAdmin() ? "/admin/dashboard" : "/customer/dashboard"}
                    className="flex items-center px-4 py-3 text-green-600 hover:text-green-700 text-base font-medium transition-all duration-300 rounded-xl hover:bg-green-50 mx-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5 mr-3" />
                    Dashboard
                  </Link>
                  
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-3 text-red-600 hover:text-red-700 text-base font-medium transition-all duration-300 rounded-xl hover:bg-red-50 mx-2"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign Out
                  </button>
                </>
              )}
              <Link
                to="/appointments"
                className="block mt-2 mx-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-4 py-3 rounded-xl text-center font-medium transition-all duration-300 shadow-lg"
                onClick={() => setIsMenuOpen(false)}
              >
                Book Appointment
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default PublicNavbar;
