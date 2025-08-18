import { useState } from 'react'
import { useAppDispatch } from '../../../redux'
import { Customer, customerService } from '../../../services/customers'
import { toast } from 'react-hot-toast'
import { FaTimes, FaSave, FaCar, FaCalendarAlt, FaHashtag, FaTag, FaTachometerAlt, FaPalette } from 'react-icons/fa'

interface AddVehicleModalProps {
  customer: Customer
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface VehicleData {
  make: string
  model: string
  year: number
  vin: string
  licensePlate: string
  mileage: number
  color: string
}

export default function AddVehicleModal({ customer, isOpen, onClose, onSuccess }: AddVehicleModalProps) {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<VehicleData>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    licensePlate: '',
    mileage: 0,
    color: ''
  })

  const handleInputChange = (field: keyof VehicleData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Call the customer service to add vehicle
      const result = await customerService.addVehicle(customer._id, formData)
      
      if (result.success) {
        toast.success('Vehicle added successfully!')
        onSuccess?.()
        onClose()
        // Reset form
        setFormData({
          make: '',
          model: '',
          year: new Date().getFullYear(),
          vin: '',
          licensePlate: '',
          mileage: 0,
          color: ''
        })
      } else {
        throw new Error(result.message || 'Failed to add vehicle')
      }
    } catch (error: any) {
      console.error('Add vehicle error:', error)
      toast.error(error.message || 'Failed to add vehicle')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <FaCar className="text-blue-600" />
            Add Vehicle to {customer.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Vehicle Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Make *
              </label>
              <input
                type="text"
                value={formData.make}
                onChange={(e) => handleInputChange('make', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="e.g., Toyota"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model *
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
                placeholder="e.g., Camry"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year *
              </label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="relative">
                <FaPalette className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Red"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                VIN (Vehicle Identification Number)
              </label>
              <div className="relative">
                <FaHashtag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={formData.vin}
                  onChange={(e) => handleInputChange('vin', e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="17-character VIN"
                  maxLength={17}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                License Plate
              </label>
              <div className="relative">
                <FaTag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={formData.licensePlate}
                  onChange={(e) => handleInputChange('licensePlate', e.target.value.toUpperCase())}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="License plate number"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Mileage
              </label>
              <div className="relative">
                <FaTachometerAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => handleInputChange('mileage', parseInt(e.target.value))}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FaSave className="w-4 h-4" />
              {loading ? 'Adding...' : 'Add Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
