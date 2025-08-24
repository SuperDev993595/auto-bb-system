import { useState, useEffect } from 'react'
import { HiX, HiCalendar, HiUser, HiClock, HiExclamation } from 'react-icons/hi'
import { Task, CreateTaskData, UpdateTaskData } from '../../services/tasks'
import { useAppSelector, useAppDispatch } from '../../redux'
import { fetchCustomers } from '../../redux/actions/customers'
import { fetchTechnicians } from '../../redux/actions/services'
import ModalWrapper from '../../utils/ModalWrapper'

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
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={task ? 'Edit Task' : 'Add New Task'}
      submitText="Save"
      onSubmit={handleSubmit}
      isLoading={isLoading}
    >
      <div className="p-4 space-y-4">
        {/* Title */}
        <div>
          <label className="form-label">Task Title *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`form-input ${errors.title ? 'border-red-500' : ''}`}
            placeholder="Enter task title"
            required
          />
          {errors.title && (
            <p className="form-error">{errors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="form-label">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className="form-textarea"
            placeholder="Enter task description"
          />
        </div>

        {/* Type and Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Task Type</label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="form-select"
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
            <label className="form-label">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="form-select"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Assigned To */}
        <div>
          <label className="form-label">Assigned To *</label>
          <select
            value={formData.assignedTo}
            onChange={(e) => handleInputChange('assignedTo', e.target.value)}
            className={`form-select ${errors.assignedTo ? 'border-red-500' : ''}`}
            required
          >
            <option value="">Select technician</option>
            {technicians.map((technician: any) => (
              <option key={technician._id} value={technician._id}>
                {technician.name}
              </option>
            ))}
          </select>
          {errors.assignedTo && (
            <p className="form-error">{errors.assignedTo}</p>
          )}
        </div>

        {/* Customer */}
        <div>
          <label className="form-label">Customer</label>
          <select
            value={formData.customer || ''}
            onChange={(e) => handleInputChange('customer', e.target.value)}
            className="form-select"
          >
            <option value="">Select customer (optional)</option>
            {customers.map((customer: any) => (
              <option key={customer._id} value={customer._id}>
                {customer.firstName} {customer.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* Due Date */}
        <div>
          <label className="form-label">Due Date *</label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleInputChange('dueDate', e.target.value)}
            className={`form-input ${errors.dueDate ? 'border-red-500' : ''}`}
            required
          />
          {errors.dueDate && (
            <p className="form-error">{errors.dueDate}</p>
          )}
        </div>
      </div>
    </ModalWrapper>
  )
}
