import { useState, useEffect } from 'react'
import { HiX, HiCalendar, HiUser, HiClock, HiExclamation } from 'react-icons/hi'
import { Task, CreateTaskData, UpdateTaskData } from '../../services/tasks'
import { useAppSelector, useAppDispatch } from '../../redux'
import { fetchCustomers } from '../../redux/actions/customers'
import { fetchTechnicians } from '../../redux/actions/services'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (taskData: CreateTaskData | UpdateTaskData) => void
  task?: Task | null
  isLoading?: boolean
}

export default function TaskModal({ isOpen, onClose, onSave, task, isLoading = false }: TaskModalProps) {
  const dispatch = useAppDispatch()
  const { list: customers } = useAppSelector(state => state.customers)
  const { technicians } = useAppSelector(state => state.services)
  
  const [formData, setFormData] = useState<CreateTaskData>({
    title: '',
    description: '',
    type: 'follow_up',
    priority: 'medium',
    assignedTo: '',
    customer: undefined,
    dueDate: ''
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch customers and technicians when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(fetchCustomers({ limit: 100 })) // Fetch up to 100 customers for dropdown
      dispatch(fetchTechnicians({ limit: 100 })) // Fetch up to 100 technicians for dropdown
    }
  }, [isOpen, dispatch])

  // Reset form when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title,
        description: task.description || '',
        type: task.type,
        priority: task.priority,
        assignedTo: typeof task.assignedTo === 'string' ? task.assignedTo : task.assignedTo._id,
        customer: typeof task.customer === 'string' ? task.customer : task.customer?._id || undefined,
        dueDate: task.dueDate.split('T')[0]
      })
    } else {
      setFormData({
        title: '',
        description: '',
        type: 'follow_up',
        priority: 'medium',
        assignedTo: '',
        customer: undefined,
        dueDate: ''
      })
    }
    setErrors({})
  }, [task, isOpen])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.assignedTo) {
      newErrors.assignedTo = 'Assigned to is required'
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      // Prepare task data, removing empty fields that aren't allowed by backend
      const taskData = { ...formData }
      
      // Remove empty customer field as backend doesn't allow empty strings
      if (!taskData.customer || taskData.customer.trim() === '') {
        delete taskData.customer
      }
      
      onSave(taskData)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {task ? 'Edit Task' : 'Add New Task'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter task title"
              required
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task description"
            />
          </div>

          {/* Type and Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Type
              </label>
                             <select
                 value={formData.type}
                 onChange={(e) => handleInputChange('type', e.target.value)}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                 required
               >
                 <option value="follow_up">Follow Up</option>
                 <option value="marketing">Marketing</option>
                 <option value="sales">Sales</option>
                 <option value="collections">Collections</option>
                 <option value="appointments">Appointments</option>
                 <option value="research">Research</option>
                 <option value="other">Other</option>
               </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

                     {/* Assigned To and Due Date */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
                               <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned To (Technician) *
                </label>
                               <select
                  value={formData.assignedTo}
                  onChange={(e) => handleInputChange('assignedTo', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.assignedTo ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                >
                                                       <option value="">Select a technician</option>
                  {technicians?.map(technician => (
                    <option key={technician._id} value={technician._id}>
                      {technician.name} {technician.specializations && technician.specializations.length > 0 ? `(${technician.specializations.join(', ')})` : ''}
                    </option>
                  ))}
                </select>
               {errors.assignedTo && (
                 <p className="mt-1 text-sm text-red-600">{errors.assignedTo}</p>
               )}
             </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.dueDate ? 'border-red-500' : 'border-gray-300'
                }`}
                required
              />
              {errors.dueDate && (
                <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
              )}
            </div>
          </div>

                     {/* Customer */}
           <div>
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Customer (Optional)
             </label>
             <select
               value={formData.customer || ''}
               onChange={(e) => handleInputChange('customer', e.target.value)}
               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
             >
                               <option value="">Select a customer (optional)</option>
                {customers?.map(customer => (
                  <option key={customer._id} value={customer._id}>
                    {customer.businessName || customer.name} {customer.businessName && `(${customer.name})`}
                  </option>
                ))}
             </select>
           </div>



          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  {task ? 'Update Task' : 'Create Task'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
