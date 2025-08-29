import { useState, useEffect } from 'react';

interface SmartFeaturesProps {
  currentRole: 'admin' | 'customer';
  isLoginMode: boolean;
}

export default function SmartFeatures({ currentRole, isLoginMode }: SmartFeaturesProps) {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const features = [
    {
      title: 'Smart Role Detection',
      description: 'Automatically detects your account type and provides relevant features',
      icon: '🎯',
      color: 'from-blue-500 to-purple-500'
    },
    {
      title: 'Real-time Validation',
      description: 'Instant feedback on form inputs with helpful suggestions',
      icon: '⚡',
      color: 'from-green-500 to-blue-500'
    },
    {
      title: 'Password Strength Analyzer',
      description: 'Advanced password strength checker with improvement suggestions',
      icon: '🔒',
      color: 'from-red-500 to-orange-500'
    },
    {
      title: 'Smart Redirects',
      description: 'Automatically redirects to the appropriate dashboard based on your role',
      icon: '🔄',
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Responsive Design',
      description: 'Perfect experience on all devices - desktop, tablet, and mobile',
      icon: '📱',
      color: 'from-indigo-500 to-purple-500'
    }
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (isLoginMode) {
    return (
      <div className="hidden lg:block w-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Welcome Back!
          </h3>
          <p className="text-gray-600">
            Sign in to access your {currentRole === 'admin' ? 'business dashboard' : 'vehicle management portal'}
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-lg">🚀</span>
              </div>
              <div>
                <h6 className="font-medium text-gray-800">Quick Access</h6>
                <p className="text-sm text-gray-600">Get to your dashboard in seconds</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-lg">🔐</span>
              </div>
              <div>
                <h6 className="font-medium text-gray-800">Secure Login</h6>
                <p className="text-sm text-gray-600">Your data is protected with industry-standard security</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-lg">📱</span>
              </div>
              <div>
                <h6 className="font-medium text-gray-800">Mobile Ready</h6>
                <p className="text-sm text-gray-600">Access your account from any device</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden lg:block w-96 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          Smart Features
        </h3>
        <p className="text-gray-600">
          Experience the next generation of authentication
        </p>
      </div>

      {/* Feature Showcase */}
      <div className="relative h-64 bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 opacity-10"></div>
        
        <div className="relative p-6 h-full flex flex-col justify-center items-center text-center">
          <div className={`text-4xl mb-4 transition-all duration-500 ${isVisible ? 'scale-100' : 'scale-75'}`}>
            {features[currentFeature].icon}
          </div>
          
          <h4 className={`font-semibold text-gray-800 mb-2 transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            {features[currentFeature].title}
          </h4>
          
          <p className={`text-sm text-gray-600 transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
          }`}>
            {features[currentFeature].description}
          </p>
        </div>

        {/* Feature Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentFeature(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentFeature 
                  ? 'bg-blue-600 scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Role-specific Benefits */}
      <div className="mt-6 space-y-3">
        <h4 className="font-medium text-gray-800 mb-3">
          {currentRole === 'admin' ? 'Admin Benefits' : 'Customer Benefits'}
        </h4>
        
        {currentRole === 'admin' ? (
          <>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Manage business operations</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>Access customer management tools</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              <span>View analytics and reports</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Manage your vehicles</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Schedule appointments</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              <span>Track service history</span>
            </div>
          </>
        )}
      </div>

      {/* Security Badge */}
      <div className="mt-6 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg p-4 text-white text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="font-semibold">Enterprise Security</span>
        </div>
        <p className="text-sm opacity-90">
          Your data is protected with bank-level encryption
        </p>
      </div>
    </div>
  );
}
