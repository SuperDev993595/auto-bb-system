import React, { useState, useEffect } from 'react'
import { Technician } from '../../services/services'
import ModalWrapper from '../../utils/ModalWrapper'

interface EditTechnicianModalProps {
  technician: Technician | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (id: string, technician: Partial<Technician>) => Promise<void>
}

const EditTechnicianModal: React.FC<EditTechnicianModalProps> = ({
  technician,
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: [] as string[],
    hourlyRate: 0,
    isActive: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (technician) {
      setFormData({
        name: technician.name || '',
        email: technician.email || '',
        phone: technician.phone || '',
        specialization: technician.specialization || [],
        hourlyRate: technician.hourlyRate || 0,
        isActive: technician.isActive !== undefined ? technician.isActive : true
      })
    }
  }, [technician])

  const handleSubmit = async () => {
    if (!technician) return
    
    try {
      setLoading(true)
      setError(null)
      await onSubmit(technician._id, formData)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update technician')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }))
  }

  const handleSpecializationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFormData(prev => ({
      ...prev,
      specialization: value ? value.split(',').map(s => s.trim()).filter(s => s.length > 0) : []
    }))
  }

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.checked
    }))
  }

  // Don't render if technician is null - moved after all hooks
  if (!technician) return null

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Technician"
      submitText="Update Technician"
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
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter name"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="email" className="form-label">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter email address"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label htmlFor="phone" className="form-label">
              Phone *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter phone number"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="specialization" className="form-label">
              Specialization
            </label>
            <input
              type="text"
              id="specialization"
              name="specialization"
              value={formData.specialization.join(', ')}
              onChange={handleSpecializationChange}
              className="form-input"
              placeholder="Enter specializations (comma-separated)"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label htmlFor="hourlyRate" className="form-label">
              Hourly Rate ($/hr) *
            </label>
            <input
              type="number"
              id="hourlyRate"
              name="hourlyRate"
              value={formData.hourlyRate}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="form-input"
              placeholder="0.00"
            />
          </div>

          <div className="space-y-3">
            <label htmlFor="isActive" className="form-label">
              Status
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleCheckboxChange}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="text-sm text-secondary-700">
                Technician is active and available for work
              </label>
            </div>
          </div>
        </div>
      </div>
    </ModalWrapper>
  )
}

export default EditTechnicianModal
