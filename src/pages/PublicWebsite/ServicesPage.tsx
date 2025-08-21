import React from 'react';
import { 
  Cog, 
  Car, 
  Clock, 
  DollarSign, 
  Check, 
  Settings, 
  Shield, 
  Droplets, 
  Settings as SettingsIcon, 
  Gauge, 
  AlertTriangle, 
  ChevronRight 
} from '../../utils/icons';

const ServicesPage: React.FC = () => {
  const services = [
    {
      id: 1,
      name: "Oil Change Service",
      icon: <Droplets className="w-8 h-8 text-blue-600" />,
      description: "Complete oil change service with premium quality oil and filter replacement.",
      price: "$29.99",
      duration: "30-45 min",
      features: [
        "Premium quality oil",
        "Oil filter replacement",
        "Multi-point inspection",
        "Free top-off service"
      ]
    },
    {
      id: 2,
      name: "Brake Service",
      icon: <AlertTriangle className="w-8 h-8 text-red-600" />,
      description: "Complete brake system inspection and repair including pads, rotors, and fluid.",
      price: "$149.99",
      duration: "2-3 hours",
      features: [
        "Brake pad replacement",
        "Rotor inspection/resurfacing",
        "Brake fluid check",
        "Caliper inspection"
      ]
    },
    {
      id: 3,
      name: "Engine Diagnostics",
      icon: <Settings className="w-8 h-8 text-green-600" />,
      description: "Computer diagnostics to identify engine problems and performance issues.",
      price: "$89.99",
      duration: "1-2 hours",
      features: [
        "Computer scan",
        "Error code reading",
        "Performance analysis",
        "Detailed report"
      ]
    },
    {
      id: 4,
      name: "Tire Service",
      icon: <Car className="w-8 h-8 text-gray-600" />,
      description: "Tire rotation, balancing, and replacement services for optimal performance.",
      price: "$39.99",
      duration: "1 hour",
      features: [
        "Tire rotation",
        "Wheel balancing",
        "Tire pressure check",
        "Tread depth inspection"
      ]
    },
    {
      id: 5,
      name: "AC/Heating Service",
      icon: <Gauge className="w-8 h-8 text-purple-600" />,
      description: "Complete air conditioning and heating system service and repair.",
      price: "$129.99",
      duration: "2-4 hours",
      features: [
        "AC system check",
        "Refrigerant recharge",
        "Heater core inspection",
        "Thermostat replacement"
      ]
    },
    {
      id: 6,
      name: "Warranty Service",
      icon: <Shield className="w-8 h-8 text-blue-400" />,
      description: "Factory warranty service and extended warranty claim processing.",
      price: "Varies",
      duration: "Varies",
      features: [
        "Warranty verification",
        "Claim processing",
        "Factory parts",
        "Labor coverage"
      ]
    },
    {
      id: 7,
      name: "General Repairs",
      icon: <Cog className="w-8 h-8 text-yellow-600" />,
      description: "General automotive repairs and maintenance for all makes and models.",
      price: "Varies",
      duration: "Varies",
      features: [
        "All makes and models",
        "Quality parts",
        "Expert technicians",
        "Warranty included"
      ]
    },
    {
      id: 8,
      name: "Custom Work",
      icon: <Cog className="w-8 h-8 text-orange-600" />,
      description: "Custom modifications and specialty work for performance and appearance.",
      price: "Varies",
      duration: "Varies",
      features: [
        "Performance upgrades",
        "Custom modifications",
        "Specialty work",
        "Expert consultation"
      ]
    }
  ];

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
            {/* Categories would go here if implemented */}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map(service => (
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
                      <DollarSign className="mr-1" />
                      {service.price}
                    </div>
                    <div className="flex items-center text-gray-500">
                      <Clock className="mr-1" />
                      {service.duration}
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Includes:</h4>
                    <ul className="space-y-1">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <Check className="text-green-500 mr-2 text-xs" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Book Service button would go here */}
                  <button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold text-center transition duration-300 flex items-center justify-center"
                  >
                    Book Service
                    <ChevronRight className="ml-2" />
                  </button>
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
                  <Check className="text-green-500 mr-2" />
                  Oil Change
                </li>
                <li className="flex items-center justify-center">
                  <Check className="text-green-500 mr-2" />
                  Tire Rotation
                </li>
                <li className="flex items-center justify-center">
                  <Check className="text-green-500 mr-2" />
                  Multi-point Inspection
                </li>
                <li className="flex items-center justify-center">
                  <Check className="text-green-500 mr-2" />
                  Fluid Level Check
                </li>
              </ul>
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition duration-300"
              >
                Book Package
              </button>
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
                  <Check className="mr-2" />
                  Everything in Basic
                </li>
                <li className="flex items-center justify-center">
                  <Check className="mr-2" />
                  Brake Inspection
                </li>
                <li className="flex items-center justify-center">
                  <Check className="mr-2" />
                  AC System Check
                </li>
                <li className="flex items-center justify-center">
                  <Check className="mr-2" />
                  Battery Test
                </li>
                <li className="flex items-center justify-center">
                  <Check className="mr-2" />
                  Engine Diagnostics
                </li>
              </ul>
              <button
                className="w-full bg-white text-blue-600 hover:bg-gray-100 py-3 px-6 rounded-lg font-semibold transition duration-300"
              >
                Book Package
              </button>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ultimate Package</h3>
              <div className="text-4xl font-bold text-blue-600 mb-6">$349.99</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center justify-center">
                  <Check className="text-green-500 mr-2" />
                  Everything in Premium
                </li>
                <li className="flex items-center justify-center">
                  <Check className="text-green-500 mr-2" />
                  Transmission Service
                </li>
                <li className="flex items-center justify-center">
                  <Check className="text-green-500 mr-2" />
                  Coolant Flush
                </li>
                <li className="flex items-center justify-center">
                  <Check className="text-green-500 mr-2" />
                  Fuel System Clean
                </li>
                <li className="flex items-center justify-center">
                  <Check className="text-green-500 mr-2" />
                  Full Detail
                </li>
              </ul>
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition duration-300"
              >
                Book Package
              </button>
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
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition duration-300"
            >
              Contact Us
            </button>
            <button
              className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-3 rounded-lg font-semibold transition duration-300"
            >
              Book Appointment
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
