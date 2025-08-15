import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaWrench, 
  FaCar, 
  FaClock, 
  FaPhone, 
  FaMapMarkerAlt,
  FaStar,
  FaCheckCircle,
  FaUsers,
  FaShieldAlt,
  FaTools
} from 'react-icons/fa';

const HomePage: React.FC = () => {
  const services = [
    {
      icon: <FaCar className="text-4xl text-blue-600" />,
      title: "Engine Diagnostics",
      description: "Advanced computer diagnostics to identify engine issues quickly and accurately."
    },
    {
      icon: <FaWrench className="text-4xl text-blue-600" />,
      title: "Brake Service",
      description: "Complete brake system inspection, repair, and replacement services."
    },
    {
      icon: <FaTools className="text-4xl text-blue-600" />,
      title: "Oil Change",
      description: "Professional oil change service with quality filters and lubricants."
    },
    {
      icon: <FaShieldAlt className="text-4xl text-blue-600" />,
      title: "Preventive Maintenance",
      description: "Regular maintenance to keep your vehicle running smoothly and safely."
    }
  ];

  const testimonials = [
    {
      name: "John Smith",
      rating: 5,
      text: "Excellent service! They fixed my transmission issues quickly and at a fair price. Highly recommended!",
      vehicle: "2018 Toyota Camry"
    },
    {
      name: "Sarah Johnson",
      rating: 5,
      text: "Very professional and honest. They explained everything clearly and didn't try to sell unnecessary repairs.",
      vehicle: "2020 Honda CR-V"
    },
    {
      name: "Mike Davis",
      rating: 5,
      text: "Fast turnaround time and great communication throughout the entire process. Will definitely return!",
      vehicle: "2019 Ford F-150"
    }
  ];

  const stats = [
    { number: "5000+", label: "Happy Customers" },
    { number: "15+", label: "Years Experience" },
    { number: "24/7", label: "Emergency Service" },
    { number: "100%", label: "Satisfaction Guarantee" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Professional Auto Repair Services
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Expert mechanics, quality parts, and honest service. Your vehicle deserves the best care.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/appointments"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-center transition duration-300"
                >
                  Book Appointment
                </Link>
                <Link
                  to="/services"
                  className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-3 rounded-lg font-semibold text-center transition duration-300"
                >
                  Our Services
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8">
                <h3 className="text-2xl font-semibold mb-4">Quick Contact</h3>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <FaPhone className="text-blue-300 mr-3" />
                    <span>(555) 123-4567</span>
                  </div>
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="text-blue-300 mr-3" />
                    <span>123 Auto Repair St, City, State 12345</span>
                  </div>
                  <div className="flex items-center">
                    <FaClock className="text-blue-300 mr-3" />
                    <span>Mon-Fri: 8AM-6PM, Sat: 9AM-4PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide comprehensive auto repair and maintenance services to keep your vehicle running at its best.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition duration-300">
                <div className="flex justify-center mb-4">
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              to="/services"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition duration-300"
            >
              View All Services
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-blue-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-xl text-gray-600">
              Don't just take our word for it - hear from our satisfied customers.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.text}"</p>
                <div className="border-t pt-4">
                  <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.vehicle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Us?
            </h2>
            <p className="text-xl text-gray-600">
              We're committed to providing the best auto repair experience.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start">
              <FaCheckCircle className="text-green-500 text-2xl mr-4 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Certified Technicians</h3>
                <p className="text-gray-600">Our team consists of ASE-certified mechanics with years of experience.</p>
              </div>
            </div>
            <div className="flex items-start">
              <FaCheckCircle className="text-green-500 text-2xl mr-4 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Parts</h3>
                <p className="text-gray-600">We use only high-quality OEM and aftermarket parts for all repairs.</p>
              </div>
            </div>
            <div className="flex items-start">
              <FaCheckCircle className="text-green-500 text-2xl mr-4 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Warranty</h3>
                <p className="text-gray-600">All our work comes with a comprehensive warranty for your peace of mind.</p>
              </div>
            </div>
            <div className="flex items-start">
              <FaCheckCircle className="text-green-500 text-2xl mr-4 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Transparent Pricing</h3>
                <p className="text-gray-600">No hidden fees or surprises - we provide clear, upfront pricing.</p>
              </div>
            </div>
            <div className="flex items-start">
              <FaCheckCircle className="text-green-500 text-2xl mr-4 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Service</h3>
                <p className="text-gray-600">Most repairs completed same-day or within 24 hours.</p>
              </div>
            </div>
            <div className="flex items-start">
              <FaCheckCircle className="text-green-500 text-2xl mr-4 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Customer Service</h3>
                <p className="text-gray-600">Dedicated customer service team to answer all your questions.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Schedule your appointment today and experience the difference professional auto care makes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/appointments"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition duration-300"
            >
              Book Appointment
            </Link>
            <Link
              to="/contact"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-3 rounded-lg font-semibold transition duration-300"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
