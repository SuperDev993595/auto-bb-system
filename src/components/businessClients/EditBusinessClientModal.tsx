import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Building } from '../../../utils/icons';
import businessClientService, { BusinessClient, UpdateBusinessClientData } from '../../services/businessClients';
import ModalWrapper from '../../utils/ModalWrapper';

interface EditBusinessClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  businessClient: BusinessClient | null;
}

export default function EditBusinessClientModal({ isOpen, onClose, onSuccess, businessClient }: EditBusinessClientModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UpdateBusinessClientData>({
    businessName: '',
    businessType: 'auto_repair',
    contactPerson: { name: '', title: '', email: '', phone: '' },
    address: { street: '', city: '', state: '', zipCode: '', country: 'USA' },
    businessInfo: { website: '', hours: '' },
    subscription: { plan: 'basic', billingCycle: 'monthly', monthlyFee: 0 },
    branding: { primaryColor: '#3B82F6', secondaryColor: '#1F2937', companyName: '', tagline: '' },
    settings: { timezone: 'America/New_York', currency: 'USD', dateFormat: 'MM/DD/YYYY', timeFormat: '12h' },
    status: 'pending',
    notes: ''
  } as UpdateBusinessClientData);

  useEffect(() => {
    if (businessClient) {
      setFormData({
        businessName: businessClient.businessName || '',
        businessType: businessClient.businessType || 'auto_repair',
        contactPerson: {
          name: businessClient.contactPerson?.name || '',
          title: businessClient.contactPerson?.title || '',
          email: businessClient.contactPerson?.email || '',
          phone: businessClient.contactPerson?.phone || ''
        },
        address: {
          street: businessClient.address?.street || '',
          city: businessClient.address?.city || '',
          state: businessClient.address?.state || '',
          zipCode: businessClient.address?.zipCode || '',
          country: businessClient.address?.country || 'USA'
        },
        businessInfo: {
          website: businessClient.businessInfo?.website || '',
          hours: businessClient.businessInfo?.hours || ''
        },
        subscription: {
          plan: businessClient.subscription?.plan || 'basic',
          billingCycle: businessClient.subscription?.billingCycle || 'monthly',
          monthlyFee: businessClient.subscription?.monthlyFee || 0
        },
        branding: {
          primaryColor: businessClient.branding?.primaryColor || '#3B82F6',
          secondaryColor: businessClient.branding?.secondaryColor || '#1F2937',
          companyName: businessClient.branding?.companyName || '',
          tagline: businessClient.branding?.tagline || ''
        },
        settings: {
          timezone: businessClient.settings?.timezone || 'America/New_York',
          currency: businessClient.settings?.currency || 'USD',
          dateFormat: businessClient.settings?.dateFormat || 'MM/DD/YYYY',
          timeFormat: businessClient.settings?.timeFormat || '12h'
        },
        status: businessClient.status || 'pending',
        notes: businessClient.notes || ''
      });
    }
  }, [businessClient]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContactPersonChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contactPerson: { 
        ...(prev.contactPerson || { name: '', title: '', email: '', phone: '' }), 
        [field]: value 
      }
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: { 
        ...(prev.address || { street: '', city: '', state: '', zipCode: '', country: 'USA' }), 
        [field]: value 
      }
    }));
  };

  const handleSubmit = async () => {
    if (!formData.businessName || !formData.contactPerson.name || !formData.contactPerson.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!businessClient?._id) {
      toast.error('Business client ID is missing');
      return;
    }

    try {
      setLoading(true);
      await businessClientService.updateBusinessClient(businessClient._id, formData);
      toast.success('Business client updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating business client:', error);
      toast.error('Failed to update business client');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !businessClient) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Business Client"
      submitText="Update Business Client"
      onSubmit={handleSubmit}
      submitColor="bg-blue-600"
      size="lg"
    >
      <div className="p-6 space-y-4">
        <div>
          <label className="form-label">Business Name *</label>
          <input
            type="text"
            value={formData.businessName}
            onChange={(e) => handleInputChange('businessName', e.target.value)}
            className="form-input"
            required
          />
        </div>

        <div>
          <label className="form-label">Contact Name *</label>
          <input
            type="text"
            value={formData.contactPerson?.name || ''}
            onChange={(e) => handleContactPersonChange('name', e.target.value)}
            className="form-input"
            required
          />
        </div>

        <div>
          <label className="form-label">Email *</label>
          <input
            type="email"
            value={formData.contactPerson?.email || ''}
            onChange={(e) => handleContactPersonChange('email', e.target.value)}
            className="form-input"
            required
          />
        </div>

        <div>
          <label className="form-label">Phone *</label>
          <input
            type="tel"
            value={formData.contactPerson?.phone || ''}
            onChange={(e) => handleContactPersonChange('phone', e.target.value)}
            className="form-input"
            required
          />
        </div>

        <div>
          <label className="form-label">Street Address *</label>
          <input
            type="text"
            value={formData.address?.street || ''}
            onChange={(e) => handleAddressChange('street', e.target.value)}
            className="form-input"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">City *</label>
            <input
              type="text"
              value={formData.address?.city || ''}
              onChange={(e) => handleAddressChange('city', e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="form-label">State *</label>
            <input
              type="text"
              value={formData.address?.state || ''}
              onChange={(e) => handleAddressChange('state', e.target.value)}
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">ZIP Code *</label>
            <input
              type="text"
              value={formData.address?.zipCode || ''}
              onChange={(e) => handleAddressChange('zipCode', e.target.value)}
              className="form-input"
              required
            />
          </div>

          <div>
            <label className="form-label">Status</label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="form-select"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
