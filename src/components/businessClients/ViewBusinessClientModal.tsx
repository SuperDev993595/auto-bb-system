import React from 'react';
import { X, Building } from 'lucide-react';
import { BusinessClient } from '../../services/businessClients';

interface ViewBusinessClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessClient: BusinessClient | null;
}

export default function ViewBusinessClientModal({ isOpen, onClose, businessClient }: ViewBusinessClientModalProps) {
  if (!isOpen || !businessClient) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Business Client Details
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Business Name</label>
            <p className="text-gray-900 font-medium">{businessClient.businessName}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contact Person</label>
            <p className="text-gray-900">{businessClient.contactPerson?.name}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <p className="text-gray-900">{businessClient.contactPerson?.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Phone</label>
            <p className="text-gray-900">{businessClient.contactPerson?.phone}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Address</label>
            <p className="text-gray-900">
              {businessClient.address?.street}, {businessClient.address?.city}, {businessClient.address?.state} {businessClient.address?.zipCode}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Status</label>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
              businessClient.status === 'active' ? 'bg-green-100 text-green-800' :
              businessClient.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {businessClient.status}
            </span>
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
