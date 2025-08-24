import React, { useState } from 'react'
import { ServiceCatalogItem } from '../../services/services'
import ModalWrapper from '../../utils/ModalWrapper'

interface AddServiceModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (service: Partial<ServiceCatalogItem>) => Promise<void>
}

const AddServiceModal: React.FC<AddServiceModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    laborRate: 0,
    estimatedDuration: 0,
    category: '' as ServiceCatalogItem['category'],
    isActive: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError(null)
      await onSubmit(formData)
      onClose()
      setFormData({
        name: '',
        description: '',
        laborRate: 0,
        estimatedDuration: 0,
        category: '' as ServiceCatalogItem['category'],
        isActive: true
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create service')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.checked
    }))
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Service"
      submitText="Create Service"
      onSubmit={handleSubmit}
      submitColor="bg-blue-600"
    >
      <div className="p-8 space-y-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label htmlFor="name" className="form-label">
              Service Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter service name"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="category" className="form-label">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Select category</option>
              <option value="maintenance">Maintenance</option>
              <option value="repair">Repair</option>
              <option value="diagnostic">Diagnostic</option>
              <option value="inspection">Inspection</option>
              <option value="emergency">Emergency</option>
              <option value="preventive">Preventive</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="form-textarea"
            placeholder="Enter service description"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label htmlFor="laborRate" className="form-label">
              Labor Rate ($/hr) *
            </label>
            <input
              type="number"
              id="laborRate"
              name="laborRate"
              value={formData.laborRate}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="form-input"
              placeholder="0.00"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="estimatedDuration" className="form-label">
              Estimated Duration (hours)
            </label>
            <input
              type="number"
              id="estimatedDuration"
              name="estimatedDuration"
              value={formData.estimatedDuration}
              onChange={handleChange}
              min="0"
              step="0.5"
              className="form-input"
              placeholder="2.0"
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 pt-4">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleCheckboxChange}
            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="text-sm text-secondary-700">
            Service is active and available for booking
          </label>
        </div>
      </div>
    </ModalWrapper>
  )
}

export default AddServiceModal
