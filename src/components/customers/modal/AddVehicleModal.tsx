import { useState } from 'react'
import { useAppDispatch } from '../../../redux'
import { Customer, customerService } from '../../../services/customers'
import { toast } from 'react-hot-toast'
import { Save, Car, Calendar, Hash, Tag, Gauge, Palette } from '../../../utils/icons'
import ModalWrapper from '../../../utils/ModalWrapper'

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

  const handleSubmit = async () => {
    setLoading(true)

    try {
      // Call the customer service to add vehicle
      const customerId = customer._id || customer.id
      if (!customerId) {
        throw new Error('Customer ID is required')
      }
      const result = await customerService.addVehicle(customerId, formData)
      
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

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Vehicle to ${customer.name}`}
      submitText="Add Vehicle"
      onSubmit={handleSubmit}
      submitColor="bg-blue-600"
    >
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Make *
            </label>
            <input
              type="text"
              value={formData.make}
              onChange={(e) => handleInputChange('make', e.target.value)}
              className="form-input"
              required
              placeholder="e.g., Toyota"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Model *
            </label>
            <input
              type="text"
              value={formData.model}
              onChange={(e) => handleInputChange('model', e.target.value)}
              className="form-input"
              required
              placeholder="e.g., Camry"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Year *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                className="form-input pl-10"
                required
                min="1900"
                max={new Date().getFullYear() + 1}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Color *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Palette className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                className="form-input pl-10"
                required
                placeholder="e.g., Red"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              VIN (Vehicle Identification Number) *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Hash className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={formData.vin}
                onChange={(e) => handleInputChange('vin', e.target.value.toUpperCase())}
                className="form-input pl-10"
                required
                placeholder="17-character VIN"
                maxLength={17}
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              License Plate *
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Tag className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={formData.licensePlate}
                onChange={(e) => handleInputChange('licensePlate', e.target.value.toUpperCase())}
                className="form-input pl-10"
                required
                placeholder="License plate number"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Current Mileage *
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Gauge className="w-4 h-4" />
            </div>
            <input
              type="number"
              value={formData.mileage}
              onChange={(e) => handleInputChange('mileage', parseInt(e.target.value))}
              className="form-input pl-10"
              min="0"
              placeholder="0"
              required
            />
          </div>
        </div>
      </div>
    </ModalWrapper>
  )
}
