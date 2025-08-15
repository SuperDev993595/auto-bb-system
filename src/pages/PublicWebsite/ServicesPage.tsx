import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaWrench, 
  FaCar, 
  FaClock, 
  FaDollarSign,
  FaCheck,
  FaTools,
  FaShieldAlt,
  FaOilCan,
  FaCog,
  FaTachometerAlt,
  FaExclamationTriangle,
  FaArrowRight
} from 'react-icons/fa';

const ServicesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Services' },
    { id: 'maintenance', name: 'Maintenance' },
    { id: 'repair', name: 'Repair' },
    { id: 'diagnostic', name: 'Diagnostics' },
    { id: 'emergency', name: 'Emergency' }
  ];

  const services = [
    {
      id: 1,
      name: "Oil Change Service",
      category: "maintenance",
      description: "Complete oil change service including filter replacement and multi-point inspection.",
      price: "$29.99",
      duration: "30-45 min",
      icon: <FaOilCan className="text-3xl text-blue-600" />,
      features: [
        "Synthetic or conventional oil",
        "Oil filter replacement",
        "Multi-point inspection",
        "Tire pressure check",
        "Fluid level check"
      ]
    },
    {
      id: 2,
      name: "Brake Service",
      category: "repair",
      description: "Complete brake system inspection, repair, and replacement services.",
      price: "From $89.99",
      duration: "2-4 hours",
      icon: <FaExclamationTriangle className="text-3xl text-red-600" />,
      features: [
        "Brake pad replacement",
        "Rotor inspection/resurfacing",
        "Brake fluid check",
        "Caliper inspection",
        "Brake line inspection"
      ]
    },
    {
      id: 3,
      name: "Engine Diagnostics",
      category: "diagnostic",
      description: "Advanced computer diagnostics to identify engine issues quickly and accurately.",
      price: "$49.99",
      duration: "1-2 hours",
      icon: <FaCog className="text-3xl text-green-600" />,
      features: [
        "Computer code reading",
        "Engine performance analysis",
        "Emission system check",
        "Detailed diagnostic report",
        "Repair recommendations"
      ]
    },
    {
      id: 4,
      name: "Tire Service",
      category: "maintenance",
      description: "Tire rotation, balancing, and replacement services.",
      price: "From $19.99",
      duration: "1-2 hours",
      icon: <FaCar className="text-3xl text-gray-600" />,
      features: [
        "Tire rotation",
        "Wheel balancing",
        "Tire pressure monitoring",
        "Tread depth check",
        "Tire replacement"
      ]
    },
    {
      id: 5,
      name: "Transmission Service",
      category: "repair",
      description: "Transmission fluid change and transmission system maintenance.",
      price: "From $129.99",
      duration: "2-3 hours",
      icon: <FaTachometerAlt className="text-3xl text-purple-600" />,
      features: [
        "Transmission fluid change",
        "Filter replacement",
        "Pan cleaning",
        "Gasket replacement",
        "Transmission inspection"
      ]
    },
    {
      id: 6,
      name: "AC/Heating Service",
      category: "repair",
      description: "Air conditioning and heating system diagnosis and repair.",
      price: "From $79.99",
      duration: "1-3 hours",
      icon: <FaShieldAlt className="text-3xl text-blue-400" />,
      features: [
        "AC system diagnosis",
        "Refrigerant recharge",
        "Compressor inspection",
        "Heater core check",
        "Thermostat replacement"
      ]
    },
    {
      id: 7,
      name: "Battery Service",
      category: "emergency",
      description: "Battery testing, replacement, and jump start services.",
      price: "From $39.99",
      duration: "30-60 min",
      icon: <FaTools className="text-3xl text-yellow-600" />,
      features: [
        "Battery testing",
        "Battery replacement",
        "Jump start service",
        "Terminal cleaning",
        "Charging system check"
      ]
    },
    {
      id: 8,
      name: "Preventive Maintenance",
      category: "maintenance",
      description: "Comprehensive maintenance packages to keep your vehicle running smoothly.",
      price: "From $149.99",
      duration: "2-4 hours",
      icon: <FaWrench className="text-3xl text-orange-600" />,
      features: [
        "Full inspection",
        "Fluid changes",
        "Filter replacements",
        "Belt inspection",
        "Safety check"
      ]
    }
  ];

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(service => service.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Our Services
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Comprehensive auto repair and maintenance services to keep your vehicle running at peak performance.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2 rounded-full font-semibold transition duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map(service => (
              <div key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      {service.icon}
                      <h3 className="text-xl font-semibold text-gray-900 ml-3">
                        {service.name}
                      </h3>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">
                    {service.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-green-600 font-semibold">
                      <FaDollarSign className="mr-1" />
                      {service.price}
                    </div>
                    <div className="flex items-center text-gray-500">
                      <FaClock className="mr-1" />
                      {service.duration}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Includes:</h4>
                    <ul className="space-y-1">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <FaCheck className="text-green-500 mr-2 text-xs" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Link
                    to={`/appointments?service=${service.id}`}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold text-center transition duration-300 flex items-center justify-center"
                  >
                    Book Service
                    <FaArrowRight className="ml-2" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Packages */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Service Packages
            </h2>
            <p className="text-xl text-gray-600">
              Save money with our comprehensive service packages.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Basic Package</h3>
              <div className="text-4xl font-bold text-blue-600 mb-6">$99.99</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center justify-center">
                  <FaCheck className="text-green-500 mr-2" />
                  Oil Change
                </li>
                <li className="flex items-center justify-center">
                  <FaCheck className="text-green-500 mr-2" />
                  Tire Rotation
                </li>
                <li className="flex items-center justify-center">
                  <FaCheck className="text-green-500 mr-2" />
                  Multi-point Inspection
                </li>
                <li className="flex items-center justify-center">
                  <FaCheck className="text-green-500 mr-2" />
                  Fluid Level Check
                </li>
              </ul>
              <Link
                to="/appointments?package=basic"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition duration-300"
              >
                Book Package
              </Link>
            </div>
            
            <div className="bg-blue-600 rounded-lg p-8 text-center text-white relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-red-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4">Premium Package</h3>
              <div className="text-4xl font-bold mb-6">$199.99</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center justify-center">
                  <FaCheck className="mr-2" />
                  Everything in Basic
                </li>
                <li className="flex items-center justify-center">
                  <FaCheck className="mr-2" />
                  Brake Inspection
                </li>
                <li className="flex items-center justify-center">
                  <FaCheck className="mr-2" />
                  AC System Check
                </li>
                <li className="flex items-center justify-center">
                  <FaCheck className="mr-2" />
                  Battery Test
                </li>
                <li className="flex items-center justify-center">
                  <FaCheck className="mr-2" />
                  Engine Diagnostics
                </li>
              </ul>
              <Link
                to="/appointments?package=premium"
                className="w-full bg-white text-blue-600 hover:bg-gray-100 py-3 px-6 rounded-lg font-semibold transition duration-300"
              >
                Book Package
              </Link>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ultimate Package</h3>
              <div className="text-4xl font-bold text-blue-600 mb-6">$349.99</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center justify-center">
                  <FaCheck className="text-green-500 mr-2" />
                  Everything in Premium
                </li>
                <li className="flex items-center justify-center">
                  <FaCheck className="text-green-500 mr-2" />
                  Transmission Service
                </li>
                <li className="flex items-center justify-center">
                  <FaCheck className="text-green-500 mr-2" />
                  Coolant Flush
                </li>
                <li className="flex items-center justify-center">
                  <FaCheck className="text-green-500 mr-2" />
                  Fuel System Clean
                </li>
                <li className="flex items-center justify-center">
                  <FaCheck className="text-green-500 mr-2" />
                  Full Detail
                </li>
              </ul>
              <Link
                to="/appointments?package=ultimate"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition duration-300"
              >
                Book Package
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Need a Custom Service?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Contact us for custom service packages or specific repairs not listed above.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition duration-300"
            >
              Contact Us
            </Link>
            <Link
              to="/appointments"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-3 rounded-lg font-semibold transition duration-300"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
