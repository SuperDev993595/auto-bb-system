import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import ModalWrapper from '../../utils/ModalWrapper'
import { Edit, Plus, Trash2 } from '../../utils/icons'
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
      isOpen={true}
      title="Edit Work Order"
      icon={<Edit className="w-5 h-5" />}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitText={loading ? 'Updating...' : 'Update Work Order'}
      submitColor="bg-gradient-to-r from-blue-600 to-indigo-600"
    >
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Services *
          </label>
          <div className="space-y-4">
            {formData.services?.map((service, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Service {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Service Type
                    </label>
                    <select
                      value={service.service}
                      onChange={(e) => handleServiceChange(index, 'service', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:bg-gray-50"
                    >
                      <option value="">Select Service</option>
                      {catalog?.map(cat => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Labor Hours
                    </label>
                    <input
                      type="number"
                      value={service.laborHours}
                      onChange={(e) => handleServiceChange(index, 'laborHours', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:bg-gray-50"
                      min="0.5"
                      step="0.5"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Labor Rate ($/hr)
                    </label>
                    <input
                      type="number"
                      value={service.laborRate}
                      onChange={(e) => handleServiceChange(index, 'laborRate', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:bg-gray-50"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Total Cost
                    </label>
                    <input
                      type="number"
                      value={service.totalCost}
                      onChange={(e) => handleServiceChange(index, 'totalCost', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:bg-gray-50"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Description
                  </label>
                  <textarea
                    value={service.description}
                    onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:bg-gray-50"
                    rows={2}
                    placeholder="Service description..."
                  />
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addService}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 hover:text-gray-800 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Service
            </button>
          </div>
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
            <option value="">Select Technician</option>
            {technicians?.filter(tech => tech.isActive).map(technician => (
              <option key={technician._id} value={technician._id}>
                {technician.name} - ${technician.hourlyRate}/hr
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
              Estimated Start Date
            </label>
            <input
              type="datetime-local"
              value={formData.estimatedStartDate}
              onChange={(e) => handleInputChange('estimatedStartDate', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estimated Completion Date
            </label>
            <input
              type="datetime-local"
              value={formData.estimatedCompletionDate}
              onChange={(e) => handleInputChange('estimatedCompletionDate', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
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
            placeholder="Internal notes about the work order..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer Notes
          </label>
          <textarea
            value={formData.customerNotes}
            onChange={(e) => handleInputChange('customerNotes', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
            rows={3}
            placeholder="Notes visible to the customer..."
          />
        </div>
      </div>
    </ModalWrapper>
  )
}
