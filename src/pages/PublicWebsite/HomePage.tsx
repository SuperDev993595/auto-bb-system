import React, { useMemo, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { 
  Cog, 
  Car, 
  Clock, 
  Phone, 
  MapPin,
  Star,
  CheckCircle,
  Shield,
  Settings
} from '../../utils/icons';
import { useAuth } from '../../context/AuthContext';

// Constants for better organization
const SERVICES_DATA = [
  {
    icon: Car,
    title: "Engine Diagnostics",
    description: "Advanced computer diagnostics to identify engine issues quickly and accurately."
  },
  {
    icon: Cog,
    title: "Brake Service", 
    description: "Complete brake system inspection, repair, and replacement services."
  },
  {
    icon: Settings,
    title: "Oil Change",
    description: "Professional oil change service with quality filters and lubricants."
  },
  {
    icon: Shield,
    title: "Preventive Maintenance",
    description: "Regular maintenance to keep your vehicle running smoothly and safely."
  }
] as const;

const TESTIMONIALS_DATA = [
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
] as const;

const STATS_DATA = [
  { number: "5000+", label: "Happy Customers" },
  { number: "15+", label: "Years Experience" },
  { number: "24/7", label: "Emergency Service" },
  { number: "100%", label: "Satisfaction Guarantee" }
] as const;

const FEATURES_DATA = [
  {
    icon: CheckCircle,
    title: "Certified Technicians",
    description: "Our team consists of ASE-certified mechanics with years of experience."
  },
  {
    icon: CheckCircle,
    title: "Quality Parts",
    description: "We use only high-quality OEM and aftermarket parts for all repairs."
  },
  {
    icon: CheckCircle,
    title: "Warranty",
    description: "All our work comes with a comprehensive warranty for your peace of mind."
  },
  {
    icon: CheckCircle,
    title: "Transparent Pricing",
    description: "No hidden fees or surprises - we provide clear, upfront pricing."
  },
  {
    icon: CheckCircle,
    title: "Fast Service",
    description: "Most repairs completed same-day or within 24 hours."
  },
  {
    icon: CheckCircle,
    title: "Customer Service",
    description: "Dedicated customer service team to answer all your questions."
  }
] as const;

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Memoized data to prevent unnecessary re-renders
  const services = useMemo(() => 
    SERVICES_DATA.map(service => ({
      ...service,
      icon: <service.icon className="text-4xl text-blue-600" />
    })), []
  );

  const features = useMemo(() =>
    FEATURES_DATA.map(feature => ({
      ...feature,
      icon: <feature.icon className="text-green-600 text-xl" />
    })), []
  );

  // Reusable Section Component
  const Section: React.FC<{
    children: React.ReactNode;
    className?: string;
    background?: string;
  }> = ({ children, className = "", background = "" }) => (
    <section className={`py-16 ${background} ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </section>
  );

  // Reusable Card Component
  const Card: React.FC<{
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
  }> = ({ children, className = "", hover = true }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${
      hover ? 'hover:shadow-lg hover:border-blue-300 transition-all duration-300' : ''
    } ${className}`}>
      {children}
    </div>
  );

  // Hero Section Component
  const HeroSection = () => (
    <section 
      className="relative text-white"
      style={{
        backgroundImage: 'url(/images/banner.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="absolute inset-0 bg-black opacity-60"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {isAuthenticated ? (
                <Link
                  to="/admin/dashboard"
                  className="text-yellow-400 hover:text-yellow-300 transition-colors cursor-pointer"
                  aria-label="Go to admin dashboard"
                >
                  Professional Auto Repair Services
                </Link>
              ) : (
                "Professional Auto Repair Services"
              )}
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Expert mechanics, quality parts, and honest service. Your vehicle deserves the best care.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/appointments"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-center transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                aria-label="Book an appointment"
              >
                Book Appointment
              </Link>
              {!isAuthenticated && (
                <Link
                  to="/auth/register"
                  className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold text-center transition duration-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  aria-label="Create an account"
                >
                  Join Now
                </Link>
              )}
              <Link
                to="/services"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-3 rounded-lg font-semibold text-center transition duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
                aria-label="View our services"
              >
                Our Services
              </Link>
            </div>
          </div>
          <div className="hidden lg:block">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <h3 className="text-2xl font-semibold mb-4 text-white">Quick Contact</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Phone className="text-blue-300 mr-3" aria-hidden="true" />
                  <span>(555) 123-4567</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="text-blue-300 mr-3" aria-hidden="true" />
                  <span>123 Auto Repair St, City, State 12345</span>
                </div>
                <div className="flex items-center">
                  <Clock className="text-blue-300 mr-3" aria-hidden="true" />
                  <span>Mon-Fri: 8AM-6PM, Sat: 9AM-4PM</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );

  // Services Section Component
  const ServicesSection = () => (
    <Section background="bg-gray-50">
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
          <Card key={index} className="text-center group">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors duration-300">
                {service.icon}
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {service.title}
            </h3>
            <p className="text-gray-600">
              {service.description}
            </p>
          </Card>
        ))}
      </div>
      <div className="text-center mt-12">
        <Link
          to="/services"
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          aria-label="View all our services"
        >
          View All Services
        </Link>
      </div>
    </Section>
  );

  // Stats Section Component
  const StatsSection = () => (
    <Section background="bg-blue-600 text-white">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        {STATS_DATA.map((stat, index) => (
          <div key={index}>
            <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
            <div className="text-blue-100">{stat.label}</div>
          </div>
        ))}
      </div>
    </Section>
  );

  // Testimonials Section Component
  const TestimonialsSection = () => (
    <Section background="bg-white">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          What Our Customers Say
        </h2>
        <p className="text-xl text-gray-600">
          Don't just take our word for it - hear from our satisfied customers.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {TESTIMONIALS_DATA.map((testimonial, index) => (
          <Card key={index} className="hover:shadow-md">
            <div className="flex mb-4" role="img" aria-label={`${testimonial.rating} star rating`}>
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="text-yellow-400 w-5 h-5" aria-hidden="true" />
              ))}
            </div>
            <blockquote className="text-gray-700 mb-4 italic text-lg">
              "{testimonial.text}"
            </blockquote>
            <div className="border-t border-gray-200 pt-4">
              <p className="font-semibold text-gray-900">{testimonial.name}</p>
              <p className="text-sm text-gray-600">{testimonial.vehicle}</p>
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );

  // Features Section Component
  const FeaturesSection = () => (
    <Section background="bg-gray-50">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Why Choose Us?
        </h2>
        <p className="text-xl text-gray-600">
          We're committed to providing the best auto repair experience.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start p-4 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
            <div className="p-2 bg-green-100 rounded-lg mr-4">
              {feature.icon}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );

  // CTA Section Component
  const CTASection = () => (
    <Section background="bg-blue-900 text-white">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
          Ready to Get Started?
        </h2>
        <p className="text-xl mb-8 text-blue-100">
          Schedule your appointment today and experience the difference professional auto care makes.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/appointments"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Book an appointment"
          >
            Book Appointment
          </Link>
          <Link
            to="/contact"
            className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-3 rounded-lg font-semibold transition duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
            aria-label="Contact us"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </Section>
  );

  // Login/Register CTA Section Component
  const AuthCTASection = () => (
    <Section background="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Join Our Community
        </h2>
        <p className="text-xl mb-8 text-purple-100">
          Create an account to manage your vehicles, track service history, and book appointments easily.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/auth/register"
            className="bg-white hover:bg-gray-100 text-purple-600 px-8 py-3 rounded-lg font-semibold transition duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
            aria-label="Create an account"
          >
            Create Account
          </Link>
          <Link
            to="/auth/login"
            className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-3 rounded-lg font-semibold transition duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
            aria-label="Sign in to your account"
          >
            Sign In
          </Link>
        </div>
        <div className="mt-6 text-sm text-purple-200">
          <p>For business owners and staff, create an admin account to manage operations.</p>
        </div>
      </div>
    </Section>
  );

  // Loading component for better UX
  const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <Suspense fallback={<LoadingSpinner />}>
        <HeroSection />
        <ServicesSection />
        <StatsSection />
        <TestimonialsSection />
        <FeaturesSection />
        {!isAuthenticated && <AuthCTASection />}
        <CTASection />
      </Suspense>
    </div>
  );
};

export default HomePage;
