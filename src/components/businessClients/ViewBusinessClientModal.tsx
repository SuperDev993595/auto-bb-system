import React from 'react';
import { Building } from '../../../utils/icons';
import { BusinessClient } from '../../services/businessClients';
import ModalWrapper from '../../utils/ModalWrapper';

interface ViewBusinessClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessClient: BusinessClient | null;
}

export default function ViewBusinessClientModal({ isOpen, onClose, businessClient }: ViewBusinessClientModalProps) {
  if (!isOpen || !businessClient) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Business Client Details"
      icon={<Building className="w-5 h-5" />}
    >
      <div className="p-6 space-y-4">
        <div>
          <label className="form-label">Business Name</label>
          <p className="text-gray-900 font-medium">{businessClient.businessName}</p>
        </div>

        <div>
          <label className="form-label">Contact Person</label>
          <p className="text-gray-900">{businessClient.contactPerson?.name}</p>
        </div>

        <div>
          <label className="form-label">Email</label>
          <p className="text-gray-900">{businessClient.contactPerson?.email}</p>
        </div>

        <div>
          <label className="form-label">Phone</label>
          <p className="text-gray-900">{businessClient.contactPerson?.phone}</p>
        </div>

        <div>
          <label className="form-label">Address</label>
          <p className="text-gray-900">
            {businessClient.address?.street}, {businessClient.address?.city}, {businessClient.address?.state} {businessClient.address?.zipCode}
          </p>
        </div>

        <div>
          <label className="form-label">Status</label>
          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            businessClient.status === 'active' ? 'bg-green-100 text-green-800' :
            businessClient.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {businessClient.status}
          </span>
        </div>
      </div>
    </ModalWrapper>
  );
}
