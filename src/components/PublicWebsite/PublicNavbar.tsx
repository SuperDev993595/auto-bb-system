import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Phone } from '../../utils/icons';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/auth';

const PublicNavbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Appointments', href: '/appointments' }
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to={isAuthenticated ? "/admin/dashboard" : "/"} className="flex items-center group">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg group-hover:shadow-xl transition-all duration-300">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div>
                <div className={`text-xl font-bold ${isAuthenticated ? 'text-yellow-600 hover:text-yellow-700' : 'text-gray-900'} transition-colors`}>
                  Auto Repair Pro
                </div>
                <div className="text-xs text-gray-600">Professional Auto Care</div>
              </div>
            </Link>
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
                  className="text-gray-700 hover:text-blue-600 px-4 py-2 text-sm font-medium transition-all duration-300 rounded-xl hover:bg-gray-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/register"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <Link
                to={authService.isAdmin() ? "/admin/dashboard" : "/customer/dashboard"}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Dashboard
              </Link>
            )}
            <Link
              to="/appointments"
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600 p-2 rounded-xl hover:bg-gray-100 transition-all duration-300"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
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
                <Link
                  to={authService.isAdmin() ? "/admin/dashboard" : "/customer/dashboard"}
                  className="block px-4 py-3 text-green-600 hover:text-green-700 text-base font-medium transition-all duration-300 rounded-xl hover:bg-green-50 mx-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
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
