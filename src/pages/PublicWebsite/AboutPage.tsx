import React from 'react';
import { 
  Cog, 
  Car, 
  Users, 
  Star, 
  Heart,
  Shield,
  Zap,
  Handshake,
  Star as StarIcon,
  CheckCircle
} from '../../utils/icons';

const AboutPage: React.FC = () => {
  const teamMembers = [
    {
      name: "John Smith",
      position: "Owner & Master Technician",
      experience: "20+ years",
      specialties: ["Engine Diagnostics", "Transmission Repair", "Electrical Systems"],
      image: "https://via.placeholder.com/200x200?text=John+Smith"
    },
    {
      name: "Sarah Johnson",
      position: "Service Manager",
      experience: "15+ years",
      specialties: ["Customer Service", "Service Coordination", "Quality Control"],
      image: "https://via.placeholder.com/200x200?text=Sarah+Johnson"
    },
    {
      name: "Mike Davis",
      position: "Senior Technician",
      experience: "12+ years",
      specialties: ["Brake Systems", "Suspension", "AC/Heating"],
      image: "https://via.placeholder.com/200x200?text=Mike+Davis"
    },
    {
      name: "Lisa Chen",
      position: "Diagnostic Specialist",
      experience: "10+ years",
      specialties: ["Computer Diagnostics", "Hybrid Vehicles", "Emission Systems"],
      image: "https://via.placeholder.com/200x200?text=Lisa+Chen"
    }
  ];

  const values = [
    {
      icon: <Heart className="w-8 h-8 text-red-500" />,
      title: "Passion for Excellence",
      description: "We're passionate about cars and committed to delivering the highest quality service to every customer."
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-500" />,
      title: "Integrity & Trust",
      description: "We believe in honest, transparent communication and building lasting relationships with our customers."
    },
    {
      icon: <Zap className="w-8 h-8 text-yellow-500" />,
      title: "Innovation",
      description: "We stay current with the latest automotive technology and continuously improve our processes."
    },
    {
      icon: <Handshake className="w-8 h-8 text-green-500" />,
      title: "Customer Focus",
      description: "Your satisfaction is our priority. We treat every vehicle as if it were our own."
    }
  ];

  const achievements = [
    {
      number: "5000+",
      label: "Happy Customers",
      description: "Satisfied customers who trust us with their vehicles"
    },
    {
      number: "15+",
      label: "Years Experience",
      description: "Decades of combined automotive expertise"
    },
    {
      number: "100%",
      label: "Satisfaction Rate",
      description: "Customer satisfaction guarantee on all work"
    },
    {
      number: "24/7",
      label: "Emergency Service",
      description: "Round-the-clock emergency roadside assistance"
    }
  ];

  const certifications = [
    "ASE Certified Master Technician",
    "BMW Certified Service Center",
    "Toyota Certified Service Center",
    "Honda Certified Service Center",
    "Ford Certified Service Center",
    "GM Certified Service Center",
    "EPA Certified Refrigerant Handler",
    "OSHA Safety Certified"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
              About Us
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Your trusted partner in automotive care for over 15 years. We're committed to providing honest, reliable, and professional auto repair services.
            </p>
          </div>
        </div>
      </section>

      {/* Company Story */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Founded in 2008, Auto Repair Pro has been serving the community with dedication and expertise. What started as a small family-owned shop has grown into one of the most trusted auto repair facilities in the region.
                </p>
                <p>
                  Our founder, John Smith, began his automotive career as an apprentice mechanic at the age of 16. His passion for cars and commitment to honest service led him to establish Auto Repair Pro with a simple mission: to provide reliable, affordable, and honest auto repair services.
                </p>
                <p>
                  Over the years, we've expanded our team, invested in state-of-the-art diagnostic equipment, and maintained our commitment to customer satisfaction. Today, we're proud to serve thousands of customers with the same dedication and integrity that started it all.
                </p>
              </div>
            </div>
            <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center text-gray-600">
                <Car className="text-6xl mx-auto mb-4" />
                <p className="text-lg font-semibold">Company Image</p>
                <p className="text-sm">(Shop photo would go here)</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600">
              The principles that guide everything we do.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="flex justify-center mb-4">
                  {value.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Our Achievements
            </h2>
            <p className="text-xl text-blue-100">
              Numbers that speak for themselves.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl md:text-5xl font-bold mb-2">{achievement.number}</div>
                <div className="text-xl font-semibold mb-2">{achievement.label}</div>
                <div className="text-blue-100">{achievement.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600">
              Experienced professionals dedicated to your vehicle's care.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-gray-50 rounded-lg overflow-hidden shadow-md">
                <div className="bg-gray-200 h-48 flex items-center justify-center">
                  <div className="text-center text-gray-600">
                    <Users className="text-4xl mx-auto mb-2" />
                    <p className="text-sm">Photo</p>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-blue-600 font-medium mb-2">
                    {member.position}
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    {member.experience} experience
                  </p>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Specialties:</h4>
                    <ul className="space-y-1">
                      {member.specialties.map((specialty, specIndex) => (
                        <li key={specIndex} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="text-green-500 mr-2 text-xs" />
                          {specialty}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Certifications & Training
            </h2>
            <p className="text-xl text-gray-600">
              Our team maintains the highest standards of professional certification.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                          {certifications.map((certification, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
                  <Star className="text-3xl text-blue-600 mx-auto mb-3" />
                  <p className="text-gray-900 font-medium">{certification}</p>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Auto Repair Pro?
            </h2>
            <p className="text-xl text-gray-600">
              We're not just another auto repair shop - we're your automotive partners.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start">
              <Star className="text-yellow-500 text-2xl mr-4 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Expert Technicians</h3>
                <p className="text-gray-600">Our ASE-certified technicians have years of experience and ongoing training to stay current with the latest automotive technology.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Star className="text-yellow-500 text-2xl mr-4 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Quality Parts</h3>
                <p className="text-gray-600">We use only high-quality OEM and aftermarket parts backed by manufacturer warranties.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Star className="text-yellow-500 text-2xl mr-4 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Honest Pricing</h3>
                <p className="text-gray-600">No hidden fees or surprises. We provide clear, upfront pricing and detailed estimates before any work begins.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Star className="text-yellow-500 text-2xl mr-4 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Warranty Protection</h3>
                <p className="text-gray-600">All our work comes with a comprehensive warranty for your peace of mind.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Star className="text-yellow-500 text-2xl mr-4 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Convenient Service</h3>
                <p className="text-gray-600">Online appointment booking, shuttle service, and loaner vehicles available for your convenience.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Star className="text-yellow-500 text-2xl mr-4 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Customer Focus</h3>
                <p className="text-gray-600">We treat every customer like family and every vehicle as if it were our own.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Experience the Difference?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of satisfied customers who trust Auto Repair Pro with their vehicles.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/appointments"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition duration-300"
            >
              Schedule Service
            </a>
            <a
              href="/contact"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-900 px-8 py-3 rounded-lg font-semibold transition duration-300"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
