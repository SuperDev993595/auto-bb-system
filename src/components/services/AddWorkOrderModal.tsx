import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import ModalWrapper from '../../utils/ModalWrapper'
import { ClipboardList } from '../../utils/icons'
import { createWorkOrder } from '../../redux/actions/services'
import { fetchCustomers } from '../../redux/actions/customers'
import { useAppDispatch, useAppSelector } from '../../redux'
import { WorkOrderFormData, CreateWorkOrderData, ServiceCatalogItem, Technician } from '../../services/services'

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export default function AddWorkOrderModal({ onClose, onSuccess }: Props) {
  const dispatch = useAppDispatch()
  const { catalog, technicians } = useAppSelector(state => state.services)
  const { list: customers, loading: customersLoading } = useAppSelector(state => state.customers)
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<WorkOrderFormData>({
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

  // Load customers when modal opens
  useEffect(() => {
    console.log('AddWorkOrderModal: customers.length =', customers.length)
    console.log('AddWorkOrderModal: customersLoading =', customersLoading)
    if (customers.length === 0) {
      console.log('AddWorkOrderModal: Dispatching fetchCustomers')
      dispatch(fetchCustomers({ limit: 100 }))
    }
  }, [dispatch, customers.length])

  // Add a timeout to show error if customers don't load
  useEffect(() => {
    if (customersLoading) {
      const timeout = setTimeout(() => {
        if (customers.length === 0) {
          console.error('AddWorkOrderModal: Customers failed to load after timeout')
        }
      }, 5000)
      return () => clearTimeout(timeout)
    }
  }, [customersLoading, customers.length])

  // Get selected customer's vehicles
  const selectedCustomer = customers?.find(customer => customer._id === formData.customerId)
  const customerVehicles = selectedCustomer?.vehicles || []

  const handleInputChange = (field: keyof WorkOrderFormData, value: any) => {
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
          laborHours: formData.laborHours,
          laborRate: formData.laborRate,
          partsCost: formData.partsCost
        }],
        technician: formData.technicianId,
        priority: formData.priority,
        estimatedStartDate: formData.estimatedStartDate,
        estimatedEndDate: formData.estimatedEndDate,
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
      isOpen={true}
      title="Create Work Order"
      icon={<ClipboardList className="w-5 h-5" />}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitText={loading ? 'Creating...' : 'Create Work Order'}
      submitColor="bg-gradient-to-r from-blue-600 to-indigo-600"
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer *
          </label>
          <select
            value={formData.customerId}
            onChange={(e) => handleInputChange('customerId', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
            required
          >
            <option value="">Select a customer</option>
            {customers?.map(customer => (
              <option key={customer._id} value={customer._id}>
                {customer.firstName} {customer.lastName} - {customer.phone}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Vehicle *
          </label>
          <select
            value={formData.vehicleId}
            onChange={(e) => handleInputChange('vehicleId', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
            required
            disabled={!formData.customerId}
          >
            <option value="">Select a vehicle</option>
            {customerVehicles?.map(vehicle => (
              <option key={vehicle._id} value={vehicle._id}>
                {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service *
          </label>
          <select
            value={formData.serviceId}
            onChange={(e) => handleInputChange('serviceId', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
            required
          >
            <option value="">Select a service</option>
            {catalog?.map(service => (
              <option key={service._id} value={service._id}>
                {service.name} - ${service.laborRate}/hr
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Technician
          </label>
          <select
            value={formData.technicianId}
            onChange={(e) => handleInputChange('technicianId', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
          >
            <option value="">Select a technician</option>
            {technicians?.map(technician => (
              <option key={technician._id} value={technician._id}>
                {technician.firstName} {technician.lastName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) => handleInputChange('priority', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Start Date *
            </label>
            <input
              type="datetime-local"
              value={formData.estimatedStartDate}
              onChange={(e) => handleInputChange('estimatedStartDate', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated End Date *
            </label>
            <input
              type="datetime-local"
              value={formData.estimatedEndDate}
              onChange={(e) => handleInputChange('estimatedEndDate', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Labor Hours
            </label>
            <input
              type="number"
              value={formData.laborHours}
              onChange={(e) => handleInputChange('laborHours', parseFloat(e.target.value))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              min="0.5"
              step="0.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Labor Rate ($/hr)
            </label>
            <input
              type="number"
              value={formData.laborRate}
              onChange={(e) => handleInputChange('laborRate', parseFloat(e.target.value))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parts Cost ($)
            </label>
            <input
              type="number"
              value={formData.partsCost}
              onChange={(e) => handleInputChange('partsCost', parseFloat(e.target.value))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
            rows={3}
            placeholder="Additional notes about the work order"
          />
        </div>
      </div>
    </ModalWrapper>
  )
}
