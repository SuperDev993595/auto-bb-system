import React, { useState, useEffect } from 'react'
import { Technician } from '../../services/services'
import ModalWrapper from '../../utils/ModalWrapper'

interface EditTechnicianModalProps {
  technician: Technician
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
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialization: '',
    hourlyRate: 0,
    isActive: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (technician) {
      setFormData({
        firstName: technician.firstName || '',
        lastName: technician.lastName || '',
        email: technician.email || '',
        phone: technician.phone || '',
        specialization: technician.specialization || '',
        hourlyRate: technician.hourlyRate || 0,
        isActive: technician.isActive !== undefined ? technician.isActive : true
      })
    }
  }, [technician])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      await onSubmit(technician.id, formData)
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
      title="Edit Technician"
      submitText="Update Technician"
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
            <label htmlFor="firstName" className="form-label">
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter first name"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="form-label">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Enter last name"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
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

          <div>
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="specialization" className="form-label">
              Specialization
            </label>
            <select
              id="specialization"
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Select specialization</option>
              <option value="engine">Engine</option>
              <option value="transmission">Transmission</option>
              <option value="electrical">Electrical</option>
              <option value="brakes">Brakes</option>
              <option value="suspension">Suspension</option>
              <option value="diagnostic">Diagnostic</option>
              <option value="general">General</option>
            </select>
          </div>

          <div>
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
            Technician is active and available for work
          </label>
        </div>
      </form>
    </ModalWrapper>
  )
}

export default EditTechnicianModal
