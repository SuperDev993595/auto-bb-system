import React, { useState } from 'react';
import { HiX, HiMail, HiPhone, HiUsers } from 'react-icons/hi';
import { CreateCampaignData } from '../../services/marketing';
import ModalWrapper from '../../utils/ModalWrapper';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (campaignData: CreateCampaignData) => void;
  isLoading?: boolean;
}

export default function CreateCampaignModal({ 
  isOpen, 
  onClose, 
  onSave, 
  isLoading = false 
}: CreateCampaignModalProps) {
  const [formData, setFormData] = useState<CreateCampaignData>({
    name: '',
    type: 'email',
    subject: '',
    content: '',
    recipients: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Campaign name is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    }

    if (formData.type === 'email' && !formData.subject?.trim()) {
      newErrors.subject = 'Subject is required for email campaigns';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    // Clean up form data - remove empty subject for non-email campaigns
    const cleanFormData = { ...formData };
    if (cleanFormData.type !== 'email' || !cleanFormData.subject?.trim()) {
      delete cleanFormData.subject;
    }

    onSave(cleanFormData);
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Create New Campaign"
      icon={<HiMail className="w-5 h-5" />}
      submitText={isLoading ? 'Creating...' : 'Create Campaign'}
    >
      <div className="p-6 space-y-8">
        {/* Campaign Details Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-secondary-900 border-b border-secondary-200 pb-2">
            Campaign Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="form-label">
                Campaign Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`form-input ${errors.name ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                placeholder="Enter campaign name"
              />
              {errors.name && <p className="text-error-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <label className="form-label">
                Campaign Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value as any)}
                className="form-select"
              >
                <option value="email">Email Campaign</option>
                <option value="sms">SMS Campaign</option>
                <option value="mailchimp">MailChimp Campaign</option>
              </select>
            </div>
          </div>
        </div>

        {/* Email Subject Section - Only show for email campaigns */}
        {formData.type === 'email' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-secondary-900 border-b border-secondary-200 pb-2">
              Email Settings
            </h3>
            <div className="space-y-2">
              <label className="form-label">
                Subject Line *
              </label>
              <input
                type="text"
                value={formData.subject || ''}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className={`form-input ${errors.subject ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
                placeholder="Enter email subject"
              />
              {errors.subject && <p className="text-error-500 text-sm mt-1">{errors.subject}</p>}
            </div>
          </div>
        )}

        {/* Content Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-secondary-900 border-b border-secondary-200 pb-2">
            Campaign Content
          </h3>
          <div className="space-y-2">
            <label className="form-label">
              Content *
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              rows={6}
              className={`form-textarea ${errors.content ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
              placeholder={`Enter your ${formData.type} content here...`}
            />
            {errors.content && <p className="text-error-500 text-sm mt-1">{errors.content}</p>}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
