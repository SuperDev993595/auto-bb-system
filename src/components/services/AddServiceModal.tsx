import { useState } from 'react'
import { toast } from 'react-hot-toast'
import ModalWrapper from '../../utils/ModalWrapper'
import { Settings } from '../../utils/icons'
import { createServiceCatalogItem } from '../../redux/actions/services'
import { useAppDispatch } from '../../redux'
import { CreateServiceCatalogData } from '../../services/services'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export default function AddServiceModal({ onClose, onSuccess }: Props) {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateServiceCatalogData>({
    name: '',
    description: '',
    category: 'maintenance',
    estimatedDuration: 60,
    laborRate: 120,
    parts: [],
    isActive: true
  })

  const handleInputChange = (field: keyof CreateServiceCatalogData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.description) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      await dispatch(createServiceCatalogItem(formData)).unwrap()
      toast.success('Service created successfully')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Failed to create service:', error)
      toast.error(error.message || 'Failed to create service')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalWrapper
      isOpen={true}
      title="Add New Service"
      icon={<Settings className="w-5 h-5" />}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitText={loading ? 'Creating...' : 'Create Service'}
      submitColor="bg-gradient-to-r from-blue-600 to-indigo-600"
    >
      <div className="space-y-6 p-4">
        <div className="space-y-2">
          <label className="form-label">
            Service Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="form-input"
            placeholder="e.g., Oil Change, Brake Inspection"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="form-label">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="form-textarea"
            rows={3}
            placeholder="Describe the service in detail"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="form-label">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="form-select"
            required
          >
            <option value="maintenance">Maintenance</option>
            <option value="repair">Repair</option>
            <option value="diagnostic">Diagnostic</option>
            <option value="inspection">Inspection</option>
            <option value="emergency">Emergency</option>
            <option value="preventive">Preventive</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="form-label">
              Estimated Duration (minutes) *
            </label>
            <input
              type="number"
              value={formData.estimatedDuration}
              onChange={(e) => handleInputChange('estimatedDuration', parseInt(e.target.value))}
              className="form-input"
              min="15"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="form-label">
              Labor Rate ($/hour) *
            </label>
            <input
              type="number"
              value={formData.laborRate}
              onChange={(e) => handleInputChange('laborRate', parseFloat(e.target.value))}
              className="form-input"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="flex items-center space-x-3 pt-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => handleInputChange('isActive', e.target.checked)}
            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-md"
          />
          <label htmlFor="isActive" className="text-sm text-gray-700">
            Service is active and available
          </label>
        </div>
      </div>
    </ModalWrapper>
  )
}
