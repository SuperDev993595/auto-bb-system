import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { customerService } from '../../../services/customers'
import ModalWrapper from '../../../utils/ModalWrapper'

interface Vehicle {
  _id: string
  make: string
  model: string
  year: number
  vin: string
  licensePlate: string
  mileage: number
  color: string
  status?: string
}

interface Customer {
  _id: string
  name: string
}

interface Props {
  customer: Customer
  vehicle: Vehicle
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function EditVehicleModal({ customer, vehicle, isOpen, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    licensePlate: '',
    mileage: 0,
    color: '',
    status: 'active'
  })
  const [loading, setLoading] = useState(false)

  // Initialize form data when vehicle changes
  useEffect(() => {
    if (vehicle) {
      setFormData({
        make: vehicle.make || '',
        model: vehicle.model || '',
        year: vehicle.year || new Date().getFullYear(),
        vin: vehicle.vin || '',
        licensePlate: vehicle.licensePlate || '',
        mileage: vehicle.mileage || 0,
        color: vehicle.color || '',
        status: vehicle.status || 'active'
      })
    }
  }, [vehicle])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' || name === 'mileage' ? parseInt(value) || 0 : value
    }))
  }

  const handleSubmit = async () => {
    setLoading(true)

    try {
      await customerService.updateVehicle(customer._id, vehicle._id, formData)
      toast.success('Vehicle updated successfully!')
      onSuccess()
      onClose()
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update vehicle'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Vehicle"
      submitText="Update Vehicle"
      onSubmit={handleSubmit}
      submitColor="bg-blue-600"
    >
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="form-label">
              Make *
            </label>
            <input
              type="text"
              name="make"
              value={formData.make}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="form-label">
              Model *
            </label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="form-label">
              Year *
            </label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              className="form-input"
              required
              min="1900"
              max={new Date().getFullYear() + 1}
            />
          </div>

          <div className="space-y-3">
            <label className="form-label">
              Color *
            </label>
            <input
              type="text"
              name="color"
              value={formData.color}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="form-label">
              VIN *
            </label>
            <input
              type="text"
              name="vin"
              value={formData.vin}
              onChange={handleInputChange}
              className="form-input"
              required
              maxLength={17}
            />
          </div>

          <div className="space-y-3">
            <label className="form-label">
              License Plate *
            </label>
            <input
              type="text"
              name="licensePlate"
              value={formData.licensePlate}
              onChange={handleInputChange}
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="form-label">
              Mileage *
            </label>
            <input
              type="number"
              name="mileage"
              value={formData.mileage}
              onChange={handleInputChange}
              className="form-input"
              required
              min="0"
            />
          </div>

          <div className="space-y-3">
            <label className="form-label">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
        </div>
      </div>
    </ModalWrapper>
  )
}
