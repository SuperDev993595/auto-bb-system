import React, { useState, useEffect } from 'react';
import { Promotion, CreatePromotionData, UpdatePromotionData } from '../../services/promotions';
import ModalWrapper from '../../utils/ModalWrapper';

interface AddPromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (promotionData: CreatePromotionData | UpdatePromotionData) => void;
  promotion?: Promotion | null;
  isLoading?: boolean;
}

export default function AddPromotionModal({ 
  isOpen, 
  onClose, 
  onSave, 
  promotion, 
  isLoading = false 
}: AddPromotionModalProps) {
  const [formData, setFormData] = useState<CreatePromotionData>({
    title: '',
    description: '',
    type: 'discount',
    discountValue: 0,
    discountType: 'percentage',
    startDate: '',
    endDate: '',
    status: 'scheduled',
    targetAudience: '',
    maxUsage: undefined,
    conditions: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (promotion) {
      setFormData({
        title: promotion.title,
        description: promotion.description,
        type: promotion.type,
        discountValue: promotion.discountValue,
        discountType: promotion.discountType,
        startDate: promotion.startDate.split('T')[0],
        endDate: promotion.endDate.split('T')[0],
        status: promotion.status,
        targetAudience: promotion.targetAudience,
        maxUsage: promotion.maxUsage,
        conditions: promotion.conditions || ''
      });
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'discount',
        discountValue: 0,
        discountType: 'percentage',
        startDate: '',
        endDate: '',
        status: 'scheduled',
        targetAudience: '',
        maxUsage: undefined,
        conditions: ''
      });
    }
    setErrors({});
  }, [promotion, isOpen]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.targetAudience.trim()) {
      newErrors.targetAudience = 'Target audience is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (formData.discountValue < 0) {
      newErrors.discountValue = 'Discount value cannot be negative';
    }

    if (formData.discountType === 'percentage' && formData.discountValue > 100) {
      newErrors.discountValue = 'Percentage cannot exceed 100%';
    }

    if (formData.maxUsage !== undefined && formData.maxUsage < 1) {
      newErrors.maxUsage = 'Max usage must be at least 1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={promotion ? 'Edit Promotion' : 'Create New Promotion'}
      submitText={promotion ? 'Update Promotion' : 'Create Promotion'}
      onSubmit={handleSubmit}
      submitColor="bg-blue-600"
      size="lg"
    >
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter promotion title"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="discount">Discount</option>
              <option value="service">Service</option>
              <option value="referral">Referral</option>
              <option value="seasonal">Seasonal</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter promotion description"
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Type *
            </label>
            <select
              value={formData.discountType}
              onChange={(e) => handleInputChange('discountType', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="percentage">Percentage</option>
              <option value="fixed">Fixed Amount</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Value *
            </label>
            <input
              type="number"
              value={formData.discountValue}
              onChange={(e) => handleInputChange('discountValue', parseFloat(e.target.value) || 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.discountValue ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={formData.discountType === 'percentage' ? '0-100' : '0'}
              min="0"
              max={formData.discountType === 'percentage' ? '100' : undefined}
            />
            {errors.discountValue && <p className="text-red-500 text-xs mt-1">{errors.discountValue}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="scheduled">Scheduled</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="ended">Ended</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.startDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date *
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.endDate ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Target Audience *
            </label>
            <input
              type="text"
              value={formData.targetAudience}
              onChange={(e) => handleInputChange('targetAudience', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.targetAudience ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., All Customers, Students, etc."
            />
            {errors.targetAudience && <p className="text-red-500 text-xs mt-1">{errors.targetAudience}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Usage (Optional)
            </label>
            <input
              type="number"
              value={formData.maxUsage || ''}
              onChange={(e) => handleInputChange('maxUsage', e.target.value ? parseInt(e.target.value) : 0)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.maxUsage ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Leave empty for unlimited"
              min="1"
            />
            {errors.maxUsage && <p className="text-red-500 text-xs mt-1">{errors.maxUsage}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Conditions (Optional)
          </label>
          <textarea
            value={formData.conditions}
            onChange={(e) => handleInputChange('conditions', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter any special conditions or requirements"
          />
        </div>
      </div>
    </ModalWrapper>
  );
}
