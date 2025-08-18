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
    services: [],
    technicianId: '',
    priority: 'medium',
    estimatedStartDate: '',
    estimatedCompletionDate: '',
    actualStartDate: '',
    actualCompletionDate: '',
    notes: '',
    customerNotes: ''
  })

  useEffect(() => {
    if (workOrder) {
      setFormData({
        services: workOrder.services.map(service => ({
          service: service.service._id,
          description: service.description || '',
          laborHours: service.laborHours,
          laborRate: service.laborRate,
          parts: service.parts || [],
          totalCost: service.totalCost
        })),
        technicianId: workOrder.technician?._id || '',
        priority: workOrder.priority,
        estimatedStartDate: workOrder.estimatedStartDate || '',
        estimatedCompletionDate: workOrder.estimatedCompletionDate || '',
        actualStartDate: workOrder.actualStartDate || '',
        actualCompletionDate: workOrder.actualCompletionDate || '',
        notes: workOrder.notes || '',
        customerNotes: workOrder.customerNotes || ''
      })
    }
  }, [workOrder])

  const handleInputChange = (field: keyof UpdateWorkOrderData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleServiceChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services?.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      ) || []
    }))
  }

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...(prev.services || []), {
        service: '',
        description: '',
        laborHours: 1,
        laborRate: 120,
        parts: [],
        totalCost: 0
      }]
    }))
  }

  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services?.filter((_, i) => i !== index) || []
    }))
  }

  const handleSubmit = async () => {
    if (!workOrder?._id) {
      toast.error('Work order ID is missing')
      return
    }

    if (!formData.services || formData.services.length === 0) {
      toast.error('Please add at least one service')
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
            Vehicle
          </label>
          <div className="px-3 py-2 bg-gray-100 rounded-lg text-sm">
            {workOrder.vehicle.make} {workOrder.vehicle.model} ({workOrder.vehicle.year})
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Services *
          </label>
          {formData.services?.map((service, index) => (
            <div key={index} className="border border-gray-300 rounded-lg p-3 mb-3">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Service {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeService(index)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Service</label>
                  <select
                    value={service.service}
                    onChange={(e) => handleServiceChange(index, 'service', e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    required
                  >
                    <option value="">Select Service</option>
                    {catalog?.filter(cat => cat.isActive).map(cat => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name} - ${cat.laborRate}/hr
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Labor Hours</label>
                  <input
                    type="number"
                    value={service.laborHours}
                    onChange={(e) => handleServiceChange(index, 'laborHours', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    min="0"
                    step="0.5"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Labor Rate ($/hr)</label>
                  <input
                    type="number"
                    value={service.laborRate}
                    onChange={(e) => handleServiceChange(index, 'laborRate', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    min="0"
                    step="0.01"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Total Cost</label>
                  <input
                    type="number"
                    value={service.totalCost}
                    onChange={(e) => handleServiceChange(index, 'totalCost', parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <div className="mt-2">
                <label className="block text-xs text-gray-600 mb-1">Description</label>
                <textarea
                  value={service.description}
                  onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  rows={2}
                />
              </div>
            </div>
          ))}
          
          <button
            type="button"
            onClick={addService}
            className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-800"
          >
            + Add Service
          </button>
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
            <option value="">Select Technician</option>
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
              Estimated Start Date
            </label>
            <input
              type="datetime-local"
              value={formData.estimatedStartDate}
              onChange={(e) => handleInputChange('estimatedStartDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estimated Completion Date
            </label>
            <input
              type="datetime-local"
              value={formData.estimatedCompletionDate}
              onChange={(e) => handleInputChange('estimatedCompletionDate', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Customer Notes
          </label>
          <textarea
            value={formData.customerNotes}
            onChange={(e) => handleInputChange('customerNotes', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
          />
        </div>
      </div>
    </ModalWrapper>
  )
}
