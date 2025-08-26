import React from 'react';
import { Phone, Mail, MessageCircle } from '../../utils/icons';

export default function CustomerSupport() {
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
    </div>
  );
}
