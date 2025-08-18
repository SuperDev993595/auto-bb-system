import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import ModalWrapper from '../../utils/ModalWrapper'
import { HiClipboardList } from 'react-icons/hi'
import { createWorkOrder } from '../../redux/actions/services'
import { useAppDispatch, useAppSelector } from '../../redux'
import { CreateWorkOrderData, ServiceCatalogItem, Technician } from '../../services/services'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export default function AddWorkOrderModal({ onClose, onSuccess }: Props) {
  const dispatch = useAppDispatch()
  const { catalog, technicians } = useAppSelector(state => state.services)
  const { list: customers } = useAppSelector(state => state.customers)
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<CreateWorkOrderData>({
    customerId: '',
    serviceId: '',
    vehicleId: '',
    technicianId: '',
    priority: 'medium',
    estimatedStartDate: '',
    estimatedEndDate: '',
    laborHours: 1,
    laborRate: 120,
    partsCost: 0,
    notes: ''
  })

  // Get selected customer's vehicles
  const selectedCustomer = customers?.find(customer => customer._id === formData.customerId)
  const customerVehicles = selectedCustomer?.vehicles || []

  const handleInputChange = (field: keyof CreateWorkOrderData, value: any) => {
    setFormData(prev => ({ 
      ...prev, 
      [field]: value,
      // Reset vehicleId when customer changes
      ...(field === 'customerId' && { vehicleId: '' })
    }))
  }

  const handleSubmit = async () => {
    if (!formData.customerId || !formData.serviceId || !formData.vehicleId) {
      toast.error('Please fill in all required fields')
      return
    }

    // Get the selected customer, service, and vehicle data
    const selectedCustomer = customers?.find(customer => customer._id === formData.customerId)
    const selectedService = catalog?.find(service => service._id === formData.serviceId)
    const selectedVehicle = selectedCustomer?.vehicles?.find(vehicle => vehicle._id === formData.vehicleId)

    if (!selectedCustomer || !selectedService || !selectedVehicle) {
      toast.error('Invalid selection. Please try again.')
      return
    }

    setLoading(true)

    try {
      // Transform data to match backend expectations
      const workOrderData = {
        customer: formData.customerId,
        vehicle: {
          make: selectedVehicle.make,
          model: selectedVehicle.model,
          year: selectedVehicle.year,
          vin: selectedVehicle.vin,
          licensePlate: selectedVehicle.licensePlate,
          mileage: selectedVehicle.mileage
        },
        services: [{
          service: formData.serviceId,
          description: selectedService.description,
          laborHours: formData.laborHours,
          laborRate: formData.laborRate,
          parts: [],
          totalCost: (formData.laborHours * formData.laborRate) + (formData.partsCost || 0)
        }],
        technician: formData.technicianId || undefined,
        priority: formData.priority,
        estimatedStartDate: formData.estimatedStartDate,
        estimatedCompletionDate: formData.estimatedEndDate,
        notes: formData.notes
      }

      await dispatch(createWorkOrder(workOrderData)).unwrap()
      toast.success('Work order created successfully')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Failed to create work order:', error)
      toast.error(error.message || 'Failed to create work order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalWrapper
      title="Create New Work Order"
      icon={<HiClipboardList className="w-5 h-5" />}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={loading ? 'Creating...' : 'Create Work Order'}
      submitColor="bg-blue-600"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer *
          </label>
          <select
            value={formData.customerId}
            onChange={(e) => handleInputChange('customerId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Customer</option>
            {customers?.map(customer => (
              <option key={customer._id} value={customer._id}>
                {customer.name} - {customer.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service *
          </label>
          <select
            value={formData.serviceId}
            onChange={(e) => handleInputChange('serviceId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="">Select Service</option>
            {catalog?.filter(service => service.isActive).map(service => (
              <option key={service._id} value={service._id}>
                {service.name} - ${service.laborRate}/hr
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Vehicle *
          </label>
          <select
            value={formData.vehicleId}
            onChange={(e) => handleInputChange('vehicleId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            disabled={!formData.customerId}
          >
            <option value="">
              {!formData.customerId ? 'Select Customer First' : 'Select Vehicle'}
            </option>
            {customerVehicles.map(vehicle => (
              <option key={vehicle._id} value={vehicle._id}>
                {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
              </option>
            ))}
          </select>
          {formData.customerId && customerVehicles.length === 0 && (
            <p className="text-sm text-gray-500 mt-1">
              No vehicles found for this customer. Please add vehicles to the customer profile first.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Technician
          </label>
          <select
            value={formData.technicianId}
            onChange={(e) => handleInputChange('technicianId', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Technician (Optional)</option>
            {technicians?.filter(tech => tech.isActive).map(technician => (
              <option key={technician._id} value={technician._id}>
                {technician.name} - ${technician.hourlyRate}/hr
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) => handleInputChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Start Date *
            </label>
            <input
              type="datetime-local"
              value={formData.estimatedStartDate}
              onChange={(e) => handleInputChange('estimatedStartDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated End Date *
            </label>
            <input
              type="datetime-local"
              value={formData.estimatedEndDate}
              onChange={(e) => handleInputChange('estimatedEndDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Labor Hours
            </label>
            <input
              type="number"
              value={formData.laborHours}
              onChange={(e) => handleInputChange('laborHours', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0.5"
              step="0.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Labor Rate ($/hr)
            </label>
            <input
              type="number"
              value={formData.laborRate}
              onChange={(e) => handleInputChange('laborRate', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parts Cost ($)
            </label>
            <input
              type="number"
              value={formData.partsCost}
              onChange={(e) => handleInputChange('partsCost', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Additional notes about the work order"
          />
        </div>
      </div>
    </ModalWrapper>
  )
}
