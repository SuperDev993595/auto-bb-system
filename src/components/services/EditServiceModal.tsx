import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import ModalWrapper from '../../utils/ModalWrapper'
import { Edit } from '../../utils/icons'
import { updateServiceCatalogItem } from '../../redux/actions/services'
import { useAppDispatch } from '../../redux'
import { ServiceCatalogItem, UpdateServiceCatalogData } from '../../services/services'

interface Props {
  service: ServiceCatalogItem | null
  onClose: () => void
  onSuccess: () => void
}

export default function EditServiceModal({ service, onClose, onSuccess }: Props) {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<UpdateServiceCatalogData>({
    name: '',
    description: '',
    category: 'maintenance',
    estimatedDuration: 60,
    laborRate: 120,
    isActive: true
  })

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description,
        category: service.category,
        estimatedDuration: service.estimatedDuration,
        laborRate: service.laborRate,
        isActive: service.isActive
      })
    }
  }, [service])

  const handleInputChange = (field: keyof UpdateServiceCatalogData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!service?._id) {
      toast.error('Service ID is missing')
      return
    }

    if (!formData.name || !formData.description) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      await dispatch(updateServiceCatalogItem({ id: service._id, data: formData })).unwrap()
      toast.success('Service updated successfully')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Failed to update service:', error)
      toast.error(error.message || 'Failed to update service')
    } finally {
      setLoading(false)
    }
  }

  if (!service) return null

  return (
    <ModalWrapper
      title="Edit Service"
      icon={<Edit className="w-5 h-5" />}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={loading ? 'Updating...' : 'Update Service'}
      submitColor="bg-gradient-to-r from-blue-600 to-indigo-600"
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
            placeholder="e.g., Oil Change, Brake Inspection"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
            rows={3}
            placeholder="Describe the service in detail"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Duration (minutes) *
            </label>
            <input
              type="number"
              value={formData.estimatedDuration}
              onChange={(e) => handleInputChange('estimatedDuration', parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              min="15"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Labor Rate ($/hour) *
            </label>
            <input
              type="number"
              value={formData.laborRate}
              onChange={(e) => handleInputChange('laborRate', parseFloat(e.target.value))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              min="0"
              step="0.01"
              required
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => handleInputChange('isActive', e.target.checked)}
            className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-md"
          />
          <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
            Service is active and available
          </label>
        </div>
      </div>
    </ModalWrapper>
  )
}
