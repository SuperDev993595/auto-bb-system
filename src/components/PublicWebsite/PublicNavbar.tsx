import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaPhone } from 'react-icons/fa';
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
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to={isAuthenticated ? "/admin/dashboard" : "/"} className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
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
                  className={`px-3 py-2 rounded-md text-sm font-medium transition duration-300 ${
                    isActive(item.href)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact Info and CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center text-gray-600">
              <FaPhone className="mr-2" />
              <span className="text-sm font-medium">(555) 123-4567</span>
            </div>
            {!isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/auth/login"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition duration-300"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-300"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              <Link
                to={authService.isAdmin() ? "/admin/dashboard" : "/customer/dashboard"}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-300"
              >
                Dashboard
              </Link>
            )}
            <Link
              to="/appointments"
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-300"
            >
              Book Now
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
            >
              {isMenuOpen ? (
                <FaTimes className="h-6 w-6" />
              ) : (
                <FaBars className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium transition duration-300 ${
                  isActive(item.href)
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center px-3 py-2 text-gray-600">
                <FaPhone className="mr-2" />
                <span className="text-sm font-medium">(555) 123-4567</span>
              </div>
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/auth/login"
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600 text-base font-medium transition duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth/register"
                    className="block px-3 py-2 text-blue-600 hover:text-blue-700 text-base font-medium transition duration-300"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                                 <Link
                   to={authService.isAdmin() ? "/admin/dashboard" : "/customer/dashboard"}
                   className="block px-3 py-2 text-green-600 hover:text-green-700 text-base font-medium transition duration-300"
                   onClick={() => setIsMenuOpen(false)}
                 >
                   Dashboard
                 </Link>
              )}
              <Link
                to="/appointments"
                className="block mt-2 mx-3 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-center font-medium transition duration-300"
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
