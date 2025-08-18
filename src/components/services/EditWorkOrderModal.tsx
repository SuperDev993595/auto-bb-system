import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import ModalWrapper from '../../utils/ModalWrapper'
import { HiPencil } from 'react-icons/hi'
import { updateWorkOrder } from '../../redux/actions/services'
import { useAppDispatch, useAppSelector } from '../../redux'
import { WorkOrder, UpdateWorkOrderData } from '../../services/services'

interface Props {
  workOrder: WorkOrder | null
  onClose: () => void
  onSuccess: () => void
}

export default function EditWorkOrderModal({ workOrder, onClose, onSuccess }: Props) {
  const dispatch = useAppDispatch()
  const { catalog, technicians } = useAppSelector(state => state.services)
  const { list: customers } = useAppSelector(state => state.customers)
  
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<UpdateWorkOrderData>({
    serviceId: '',
    technicianId: '',
    priority: 'medium',
    estimatedStartDate: '',
    estimatedEndDate: '',
    actualStartDate: '',
    actualEndDate: '',
    laborHours: 1,
    laborRate: 120,
    partsCost: 0,
    notes: ''
  })

  useEffect(() => {
    if (workOrder) {
      setFormData({
        serviceId: workOrder.service._id,
        technicianId: workOrder.technician?._id || '',
        priority: workOrder.priority,
        estimatedStartDate: workOrder.estimatedStartDate,
        estimatedEndDate: workOrder.estimatedEndDate,
        actualStartDate: workOrder.actualStartDate || '',
        actualEndDate: workOrder.actualEndDate || '',
        laborHours: workOrder.laborHours,
        laborRate: workOrder.laborRate,
        partsCost: workOrder.partsCost,
        notes: workOrder.notes || ''
      })
    }
  }, [workOrder])

  const handleInputChange = (field: keyof UpdateWorkOrderData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!workOrder?._id) {
      toast.error('Work order ID is missing')
      return
    }

    if (!formData.serviceId) {
      toast.error('Please select a service')
      return
    }

    setLoading(true)

    try {
      await dispatch(updateWorkOrder({ id: workOrder._id, data: formData })).unwrap()
      toast.success('Work order updated successfully')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Failed to update work order:', error)
      toast.error(error.message || 'Failed to update work order')
    } finally {
      setLoading(false)
    }
  }

  if (!workOrder) return null

  return (
    <ModalWrapper
      title="Edit Work Order"
      icon={<HiPencil className="w-5 h-5" />}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={loading ? 'Updating...' : 'Update Work Order'}
      submitColor="bg-blue-600"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer
          </label>
          <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm">
            {workOrder.customer.name} - {workOrder.customer.email}
          </div>
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
            Vehicle
          </label>
          <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm">
            {workOrder.vehicle.make} {workOrder.vehicle.model} ({workOrder.vehicle.year})
          </div>
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
            Status
          </label>
          <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm">
            {workOrder.status.replace('_', ' ')}
          </div>
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

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Actual Start Date
            </label>
            <input
              type="datetime-local"
              value={formData.actualStartDate}
              onChange={(e) => handleInputChange('actualStartDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Actual End Date
            </label>
            <input
              type="datetime-local"
              value={formData.actualEndDate}
              onChange={(e) => handleInputChange('actualEndDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
