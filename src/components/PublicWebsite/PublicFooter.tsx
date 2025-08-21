import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Share2,
  MessageCircle,
  Heart,
  Link as LinkIcon,
  ChevronRight
} from '../../utils/icons';

const PublicFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: 'Home', href: '/' },
    { name: 'Services', href: '/services' },
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Appointments', href: '/appointments' }
  ];

  const services = [
    { name: 'Oil Change', href: '/services' },
    { name: 'Brake Service', href: '/services' },
    { name: 'Engine Diagnostics', href: '/services' },
    { name: 'Tire Service', href: '/services' },
    { name: 'AC/Heating', href: '/services' }
  ];

  const socialLinks = [
    { icon: <Share2 className="w-4 h-4" />, href: '#', label: 'Share' },
    { icon: <MessageCircle className="w-4 h-4" />, href: '#', label: 'Message' },
    { icon: <Heart className="w-4 h-4" />, href: '#', label: 'Like' },
    { icon: <LinkIcon className="w-4 h-4" />, href: '#', label: 'Link' }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div>
                <div className="text-xl font-bold">Auto Repair Pro</div>
                <div className="text-sm text-gray-400">Professional Auto Care</div>
              </div>
            </div>
            <p className="text-gray-400 mb-6">
              Your trusted partner in automotive care for over 15 years. We're committed to providing honest, reliable, and professional auto repair services.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 bg-gray-800 hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600 text-white rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-white transition-all duration-300 flex items-center group"
                  >
                    <ChevronRight className="w-3 h-3 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Our Services</h3>
            <ul className="space-y-2">
              {services.map((service, index) => (
                <li key={index}>
                  <Link
                    to={service.href}
                    className="text-gray-400 hover:text-white transition-all duration-300 flex items-center group"
                  >
                    <ChevronRight className="w-3 h-3 mr-2 group-hover:translate-x-1 transition-transform duration-300" />
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <Phone className="text-blue-500 mr-3 mt-1 w-4 h-4" />
                <div>
                  <p className="text-gray-400">Phone</p>
                  <p className="text-white">(555) 123-4567</p>
                  <p className="text-white">(555) 123-4568 (Emergency)</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="text-blue-500 mr-3 mt-1 w-4 h-4" />
                <div>
                  <p className="text-gray-400">Email</p>
                  <p className="text-white">info@autorepair.com</p>
                  <p className="text-white">service@autorepair.com</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="text-blue-500 mr-3 mt-1 w-4 h-4" />
                <div>
                  <p className="text-gray-400">Address</p>
                  <p className="text-white">123 Auto Repair Street</p>
                  <p className="text-white">City, State 12345</p>
                </div>
              </div>
              <div className="flex items-start">
                <Clock className="text-blue-500 mr-3 mt-1 w-4 h-4" />
                <div>
                  <p className="text-gray-400">Hours</p>
                  <p className="text-white">Mon-Fri: 8AM-6PM</p>
                  <p className="text-white">Sat: 9AM-4PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="bg-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Stay Updated</h3>
            <p className="text-gray-400 mb-4">
              Subscribe to our newsletter for maintenance tips and special offers.
            </p>
            <div className="max-w-md mx-auto flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-l-xl border-0 focus:ring-2 focus:ring-blue-500 text-gray-900 transition-all duration-200"
              />
              <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-r-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="bg-gray-950 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm">
              © {currentYear} Auto Repair Pro. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-all duration-300 hover:scale-105">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-all duration-300 hover:scale-105">
                Terms of Service
              </Link>
              <Link to="/sitemap" className="text-gray-400 hover:text-white text-sm transition-all duration-300 hover:scale-105">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default PublicFooter;
