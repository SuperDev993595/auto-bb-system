import React, { useState, useEffect } from 'react'
import { Service } from '../../services/services'
import ModalWrapper from '../../utils/ModalWrapper'

interface EditServiceModalProps {
  service: Service
  isOpen: boolean
  onClose: () => void
  onSubmit: (id: string, service: Partial<Service>) => Promise<void>
}

const EditServiceModal: React.FC<EditServiceModalProps> = ({
  service,
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    laborRate: 0,
    estimatedTime: '',
    category: '',
    isActive: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        description: service.description || '',
        laborRate: service.laborRate || 0,
        estimatedTime: service.estimatedTime || '',
        category: service.category || '',
        isActive: service.isActive !== undefined ? service.isActive : true
      })
    }
  }, [service])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      await onSubmit(service.id, formData)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update service')
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
      title="Edit Service"
      submitText="Update Service"
      onSubmit={handleSubmit}
      isLoading={loading}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
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

          <div>
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
              <option value="diagnostic">Diagnostic</option>
              <option value="repair">Repair</option>
              <option value="maintenance">Maintenance</option>
              <option value="inspection">Inspection</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="form-textarea"
            placeholder="Enter service description"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
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

          <div>
            <label htmlFor="estimatedTime" className="form-label">
              Estimated Time
            </label>
            <input
              type="text"
              id="estimatedTime"
              name="estimatedTime"
              value={formData.estimatedTime}
              onChange={handleChange}
              className="form-input"
              placeholder="e.g., 2 hours"
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleCheckboxChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-secondary-700">
            Service is active and available for booking
          </label>
        </div>
      </form>
    </ModalWrapper>
  )
}

export default EditServiceModal
