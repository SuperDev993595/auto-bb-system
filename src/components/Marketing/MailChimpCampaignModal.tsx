import React from 'react';
import { HiMail } from 'react-icons/hi';
import ModalWrapper from '../../utils/ModalWrapper';

interface MailChimpCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  formData: any;
  handleInputChange: (field: string, value: any) => void;
  isSubmitting: boolean;
  isEditing: boolean;
}

export default function MailChimpCampaignModal({
  isOpen,
  onClose,
  onSubmit,
  formData,
  handleInputChange,
  isSubmitting,
  isEditing
}: MailChimpCampaignModalProps) {
  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      title={isEditing ? 'Edit Campaign' : 'Create New Campaign'}
      icon={<HiMail className="w-5 h-5" />}
      submitText={isSubmitting ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Campaign' : 'Create Campaign')}
    >
      <div className="p-6 space-y-8">
        {/* Campaign Details Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-secondary-900 border-b border-secondary-200 pb-2">
            Campaign Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="form-label">Campaign Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="form-label">Subject Line *</label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                className="form-input"
                required
              />
            </div>
          </div>
        </div>

        {/* Sender Information Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-secondary-900 border-b border-secondary-200 pb-2">
            Sender Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="form-label">From Name *</label>
              <input
                type="text"
                value={formData.settings.fromName}
                onChange={(e) => handleInputChange('settings.fromName', e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="form-label">From Email *</label>
              <input
                type="email"
                value={formData.settings.fromEmail}
                onChange={(e) => handleInputChange('settings.fromEmail', e.target.value)}
                className="form-input"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="form-label">Reply To</label>
              <input
                type="email"
                value={formData.settings.replyTo}
                onChange={(e) => handleInputChange('settings.replyTo', e.target.value)}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-secondary-900 border-b border-secondary-200 pb-2">
            Campaign Content
          </h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="form-label">HTML Content</label>
              <textarea
                value={formData.content.html}
                onChange={(e) => handleInputChange('content.html', e.target.value)}
                rows={6}
                className="form-textarea"
                placeholder="<h1>Hello World</h1>"
              />
            </div>
            <div className="space-y-2">
              <label className="form-label">Plain Text Content</label>
              <textarea
                value={formData.content.plainText}
                onChange={(e) => handleInputChange('content.plainText', e.target.value)}
                rows={4}
                className="form-textarea"
                placeholder="Hello World"
              />
            </div>
          </div>
        </div>

        {/* Recipient List Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-secondary-900 border-b border-secondary-200 pb-2">
            Recipient List
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="form-label">List ID *</label>
              <input
                type="text"
                value={formData.recipients.listId}
                onChange={(e) => handleInputChange('recipients.listId', e.target.value)}
                className="form-input"
                placeholder="e.g., list123456"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="form-label">List Name</label>
              <input
                type="text"
                value={formData.recipients.listName}
                onChange={(e) => handleInputChange('recipients.listName', e.target.value)}
                className="form-input"
                placeholder="e.g., Newsletter Subscribers"
              />
            </div>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
