import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Building, User, MapPin, CreditCard, Settings } from '../../../utils/icons';
import businessClientService, { CreateBusinessClientData } from '../../services/businessClients';
import ModalWrapper from '../../utils/ModalWrapper';

interface AddBusinessClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddBusinessClientModal({ isOpen, onClose, onSuccess }: AddBusinessClientModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateBusinessClientData>({
    businessName: '',
    businessType: 'auto_repair',
    contactPerson: {
      name: '',
      title: '',
      email: '',
      phone: ''
    },
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA'
    },
    businessInfo: {
      yearsInBusiness: undefined,
      employeeCount: undefined,
      website: '',
      hours: '',
      services: [],
      specialties: [],
      certifications: []
    },
    subscription: {
      plan: 'basic',
      billingCycle: 'monthly',
      monthlyFee: 0,
      features: []
    },
    branding: {
      primaryColor: '#3B82F6',
      secondaryColor: '#1F2937',
      companyName: '',
      tagline: '',
      customDomain: ''
    },
    settings: {
      timezone: 'America/New_York',
      currency: 'USD',
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      notifications: {
        email: true,
        sms: true,
        push: true
      }
    },
    status: 'pending',
    source: 'direct',
    notes: ''
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleContactPersonChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contactPerson: {
        ...prev.contactPerson,
        [field]: value
      }
    }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  const handleSubmit = async () => {
    if (!formData.businessName || !formData.contactPerson.name || !formData.contactPerson.email) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Clean up empty strings for optional fields
    const cleanedFormData = {
      ...formData,
      businessInfo: {
        ...formData.businessInfo,
        website: formData.businessInfo?.website || undefined,
        hours: formData.businessInfo?.hours || undefined
      },
      branding: {
        ...formData.branding,
        companyName: formData.branding?.companyName || undefined,
        tagline: formData.branding?.tagline || undefined,
        customDomain: formData.branding?.customDomain || undefined
      },
      notes: formData.notes || undefined
    };

    try {
      setLoading(true);
      await businessClientService.createBusinessClient(cleanedFormData);
      toast.success('Business client created successfully');
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        businessName: '',
        businessType: 'auto_repair',
        contactPerson: {
          name: '',
          title: '',
          email: '',
          phone: ''
        },
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'USA'
        },
        businessInfo: {
          yearsInBusiness: undefined,
          employeeCount: undefined,
          website: '',
          hours: '',
          services: [],
          specialties: [],
          certifications: []
        },
        subscription: {
          plan: 'basic',
          billingCycle: 'monthly',
          monthlyFee: 0,
          features: []
        },
        branding: {
          primaryColor: '#3B82F6',
          secondaryColor: '#1F2937',
          companyName: '',
          tagline: '',
          customDomain: ''
        },
        settings: {
          timezone: 'America/New_York',
          currency: 'USD',
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h',
          notifications: {
            email: true,
            sms: true,
            push: true
          }
        },
        status: 'pending',
        source: 'direct',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating business client:', error);
      toast.error('Failed to create business client');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Business Client"
      submitText="Create Business Client"
      onSubmit={handleSubmit}
      submitColor="bg-blue-600"
      size="xl"
    >
      <div className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Business Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Building className="w-4 h-4 mr-2" />
              Business Information
            </h3>
            
            <div>
              <label className="form-label">
                Business Name *
              </label>
              <input
                type="text"
                value={formData.businessName}
                onChange={(e) => handleInputChange('businessName', e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="form-label">
                Business Type
              </label>
              <select
                value={formData.businessType}
                onChange={(e) => handleInputChange('businessType', e.target.value)}
                className="form-select"
              >
                <option value="auto_repair">Auto Repair</option>
                <option value="tire_shop">Tire Shop</option>
                <option value="oil_change">Oil Change</option>
                <option value="brake_shop">Brake Shop</option>
                <option value="general_repair">General Repair</option>
                <option value="dealership">Dealership</option>
                <option value="specialty_shop">Specialty Shop</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="form-label">
                Website
              </label>
              <input
                type="url"
                value={formData.businessInfo?.website || ''}
                onChange={(e) => handleInputChange('businessInfo', { ...formData.businessInfo, website: e.target.value })}
                className="form-input"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="form-label">
                Business Hours
              </label>
              <input
                type="text"
                value={formData.businessInfo?.hours || ''}
                onChange={(e) => handleInputChange('businessInfo', { ...formData.businessInfo, hours: e.target.value })}
                className="form-input"
                placeholder="Mon-Fri 8AM-6PM, Sat 9AM-4PM"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <User className="w-4 h-4 mr-2" />
              Contact Information
            </h3>
            
            <div>
              <label className="form-label">
                Contact Name *
              </label>
              <input
                type="text"
                value={formData.contactPerson.name}
                onChange={(e) => handleContactPersonChange('name', e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="form-label">
                Title
              </label>
              <input
                type="text"
                value={formData.contactPerson.title}
                onChange={(e) => handleContactPersonChange('title', e.target.value)}
                className="form-input"
                placeholder="Manager, Owner, etc."
              />
            </div>

            <div>
              <label className="form-label">
                Email *
              </label>
              <input
                type="email"
                value={formData.contactPerson.email}
                onChange={(e) => handleContactPersonChange('email', e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div>
              <label className="form-label">
                Phone *
              </label>
              <input
                type="tel"
                value={formData.contactPerson.phone}
                onChange={(e) => handleContactPersonChange('phone', e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Address Information
            </h3>
            
            <div>
              <label className="form-label">
                Street Address *
              </label>
              <input
                type="text"
                value={formData.address.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">
                  City *
                </label>
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="form-label">
                  State *
                </label>
                <input
                  type="text"
                  value={formData.address.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={formData.address.zipCode}
                  onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div>
                <label className="form-label">
                  Country
                </label>
                <input
                  type="text"
                  value={formData.address.country}
                  onChange={(e) => handleAddressChange('country', e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          </div>

          {/* Subscription Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <CreditCard className="w-4 h-4 mr-2" />
              Subscription Information
            </h3>
            
            <div>
              <label className="form-label">
                Plan
              </label>
              <select
                value={formData.subscription?.plan}
                onChange={(e) => handleInputChange('subscription', { ...formData.subscription, plan: e.target.value })}
                className="form-select"
              >
                <option value="basic">Basic</option>
                <option value="professional">Professional</option>
                <option value="enterprise">Enterprise</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="form-label">
                Billing Cycle
              </label>
              <select
                value={formData.subscription?.billingCycle}
                onChange={(e) => handleInputChange('subscription', { ...formData.subscription, billingCycle: e.target.value })}
                className="form-select"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </div>

            <div>
              <label className="form-label">
                Monthly Fee ($)
              </label>
              <input
                type="number"
                value={formData.subscription?.monthlyFee || 0}
                onChange={(e) => handleInputChange('subscription', { ...formData.subscription, monthlyFee: parseFloat(e.target.value) || 0 })}
                className="form-input"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="mt-6">
          <label className="form-label">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows={3}
            className="form-textarea"
            placeholder="Additional notes about this business client..."
          />
        </div>
      </div>
    </ModalWrapper>
  );
}
