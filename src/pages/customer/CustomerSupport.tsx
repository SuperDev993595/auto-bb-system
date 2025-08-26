import React, { useState } from 'react';
import { Phone, Mail, MessageCircle, HelpCircle, FileText, Clock, CheckCircle, AlertTriangle, ChevronDown, ChevronUp, Search, Calendar, MapPin } from '../../utils/icons';
import ModalWrapper from '../../utils/ModalWrapper';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'appointments' | 'payments' | 'services' | 'technical';
}

const faqData: FAQItem[] = [
  {
    id: '1',
    question: 'How do I schedule an appointment?',
    answer: 'You can schedule an appointment through our online booking system, by calling us directly, or by visiting our service center. Online booking is available 24/7 and provides real-time availability.',
    category: 'appointments'
  },
  {
    id: '2',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express), debit cards, cash, and digital payments including Apple Pay and Google Pay. We also offer financing options for larger repairs.',
    category: 'payments'
  },
  {
    id: '3',
    question: 'How long does a typical service take?',
    answer: 'Service times vary depending on the type of work. Oil changes typically take 30-45 minutes, while major repairs can take several hours or days. We\'ll provide an estimated completion time when you book your appointment.',
    category: 'services'
  },
  {
    id: '4',
    question: 'Do you offer warranty on your services?',
    answer: 'Yes, we provide comprehensive warranties on all our services and parts. Our standard warranty covers parts and labor for 12 months or 12,000 miles, whichever comes first. Extended warranties are also available.',
    category: 'services'
  }
];

export default function CustomerSupport() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    category: 'general'
  });

  const categories = [
    { key: 'all', label: 'All Categories', count: faqData.length },
    { key: 'general', label: 'General', count: faqData.filter(faq => faq.category === 'general').length },
    { key: 'appointments', label: 'Appointments', count: faqData.filter(faq => faq.category === 'appointments').length },
    { key: 'payments', label: 'Payments', count: faqData.filter(faq => faq.category === 'payments').length },
    { key: 'services', label: 'Services', count: faqData.filter(faq => faq.category === 'services').length },
    { key: 'technical', label: 'Technical', count: faqData.filter(faq => faq.category === 'technical').length }
  ];

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleContactSubmit = () => {
    console.log('Contact form submitted:', contactForm);
    setShowContactForm(false);
    setContactForm({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: '',
      category: 'general'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-l-4 border-blue-500">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Support</h1>
            <p className="text-gray-600">Get help and contact support</p>
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Phone className="w-4 h-4" />
              Call Support
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <MessageCircle className="w-4 h-4" />
              Live Chat
            </button>
          </div>
        </div>
      </div>

      {/* Quick Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Phone className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Phone Support</h3>
              <p className="text-sm text-gray-600">Speak with our experts</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-2">1-800-CAR-HELP</p>
          <p className="text-sm text-gray-600 mb-4">Available Mon-Fri 8AM-6PM</p>
          <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            Call Now
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Live Chat</h3>
              <p className="text-sm text-gray-600">Instant online support</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-2">24/7 Available</p>
          <p className="text-sm text-gray-600 mb-4">Get help anytime, anywhere</p>
          <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
            Start Chat
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">Email Support</h3>
              <p className="text-sm text-gray-600">Send us a message</p>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 mb-2">support@carhelp.com</p>
          <p className="text-sm text-gray-600 mb-4">Response within 24 hours</p>
          <button 
            onClick={() => setShowContactForm(true)}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Send Email
          </button>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Frequently Asked Questions</h2>
              <p className="text-gray-600">Find answers to common questions</p>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.key}
                onClick={() => setActiveCategory(category.key)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  activeCategory === category.key
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {category.label} ({category.count})
              </button>
            ))}
          </div>
        </div>

        {/* FAQ List */}
        <div className="divide-y divide-gray-200">
          {filteredFAQs.map((faq) => (
            <div key={faq.id} className="p-6">
              <button
                onClick={() => setExpandedFAQ(expandedFAQ === faq.id ? null : faq.id)}
                className="w-full flex justify-between items-start text-left"
              >
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{faq.question}</h3>
                  {expandedFAQ === faq.id && (
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  )}
                </div>
                <div className="ml-4 flex-shrink-0">
                  {expandedFAQ === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Service Center Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Service Center Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Location & Hours</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Main Service Center</p>
                  <p className="text-gray-600">123 Auto Repair Lane<br />City, State 12345</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Business Hours</p>
                  <p className="text-gray-600">
                    Monday - Friday: 8:00 AM - 6:00 PM<br />
                    Saturday: 9:00 AM - 4:00 PM<br />
                    Sunday: Closed
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Emergency Support</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium text-gray-900">24/7 Emergency Line</p>
                  <p className="text-gray-600">1-800-EMERGENCY</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900">Roadside Assistance</p>
                  <p className="text-gray-600">Available for all customers</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Form Modal */}
      {showContactForm && (
        <ModalWrapper
          isOpen={showContactForm}
          onClose={() => setShowContactForm(false)}
          title="Contact Support"
          icon={<Mail className="w-5 h-5" />}
          submitText="Send Message"
          onSubmit={handleContactSubmit}
          submitColor="bg-blue-600"
          size="md"
        >
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                required
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <input
                type="text"
                required
                value={contactForm.subject}
                onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
              <textarea
                required
                rows={4}
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
}
