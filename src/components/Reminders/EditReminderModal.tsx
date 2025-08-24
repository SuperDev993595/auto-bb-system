import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../../redux'
import { fetchCustomers } from '../../redux/actions/customers'
import ModalWrapper from '../../utils/ModalWrapper'
import { HiClock, HiUser, HiMail, HiPhone, HiCalendar } from 'react-icons/hi'
import { Customer } from '../../utils/CustomerTypes'
import { Reminder } from '../../utils/CustomerTypes'
import { CreateReminderData as ServiceCreateReminderData } from '../../services/reminders'

interface Props {
  onClose: () => void
  onSave: (data: ServiceCreateReminderData) => void
  isLoading?: boolean
  reminder: Reminder
}

export default function EditReminderModal({ onClose, onSave, isLoading = false, reminder }: Props) {
  const [formData, setFormData] = useState<ServiceCreateReminderData>({
    title: (reminder as any).title || reminder.message || '',
    description: (reminder as any).description || '',
    type: reminder.type === 'service-due' ? 'service_due' : 
          reminder.type === 'follow-up' ? 'follow_up' : 
          reminder.type === 'payment-due' ? 'payment' : 
          (reminder as any).type === 'service_due' ? 'service_due' :
          (reminder as any).type === 'follow_up' ? 'follow_up' :
          (reminder as any).type === 'payment' ? 'payment' : 'appointment',
    priority: (reminder as any).priority || 'medium',
    dueDate: (reminder as any).dueDate ? (reminder as any).dueDate.split('T')[0] : 
             reminder.scheduledDate ? reminder.scheduledDate.split('T')[0] : '',
    reminderDate: (reminder as any).reminderDate ? (reminder as any).reminderDate.split('T')[0] : 
                  reminder.scheduledDate ? reminder.scheduledDate.split('T')[0] : '',
    customerId: (reminder as any).customer?._id || (reminder as any).customerId || reminder.customerId || '',
    notificationMethods: (reminder as any).notificationMethods || 
                        (reminder.method === 'phone' ? ['sms'] : 
                         reminder.method === 'email' ? ['email'] : 
                         reminder.method === 'sms' ? ['sms'] : ['email']),
    notes: (reminder as any).notes || ''
  })

  const { list: customers = [] } = useAppSelector(state => state.customers)
  const dispatch = useAppDispatch()

  // Load customers if not already loaded
  useEffect(() => {
    if (!customers || customers.length === 0) {
      dispatch(fetchCustomers({}))
    }
  }, [dispatch, customers])

  // Debug: Log customers and form data
  useEffect(() => {
    console.log('EditReminderModal - Available customers:', customers)
    console.log('EditReminderModal - Current form data:', formData)
  }, [customers, formData])

  // Update form data when reminder changes
  useEffect(() => {
    console.log('EditReminderModal - Reminder data:', reminder)
    console.log('EditReminderModal - Customer data:', (reminder as any).customer)
    console.log('EditReminderModal - Customer ID:', (reminder as any).customer?._id || (reminder as any).customerId || reminder.customerId)
    
    setFormData({
      title: (reminder as any).title || reminder.message || '',
      description: (reminder as any).description || '',
      type: reminder.type === 'service-due' ? 'service_due' : 
            reminder.type === 'follow-up' ? 'follow_up' : 
            reminder.type === 'payment-due' ? 'payment' : 
            (reminder as any).type === 'service_due' ? 'service_due' :
            (reminder as any).type === 'follow_up' ? 'follow_up' :
            (reminder as any).type === 'payment' ? 'payment' : 'appointment',
      priority: (reminder as any).priority || 'medium',
      dueDate: (reminder as any).dueDate ? (reminder as any).dueDate.split('T')[0] : 
               reminder.scheduledDate ? reminder.scheduledDate.split('T')[0] : '',
      reminderDate: (reminder as any).reminderDate ? (reminder as any).reminderDate.split('T')[0] : 
                    reminder.scheduledDate ? reminder.scheduledDate.split('T')[0] : '',
      customerId: (reminder as any).customer?._id || (reminder as any).customerId || reminder.customerId || '',
      notificationMethods: (reminder as any).notificationMethods || 
                          (reminder.method === 'phone' ? ['sms'] : 
                           reminder.method === 'email' ? ['email'] : 
                           reminder.method === 'sms' ? ['sms'] : ['email']),
      notes: (reminder as any).notes || ''
    })
  }, [reminder])

  const handleChange = (field: keyof ServiceCreateReminderData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCustomerChange = (customerId: string) => {
    setFormData(prev => ({
      ...prev,
      customerId
    }))
  }

  const handleSubmit = () => {
    if (!formData.title || !formData.dueDate || !formData.reminderDate || !formData.customerId) {
      alert('Please fill in all required fields including customer selection.')
      return
    }
    onSave(formData)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'appointment': return <HiCalendar className="w-4 h-4" />
      case 'service_due': return <HiClock className="w-4 h-4" />
      case 'follow_up': return <HiUser className="w-4 h-4" />
      case 'payment': return <HiMail className="w-4 h-4" />
      case 'custom': return <HiClock className="w-4 h-4" />
      default: return <HiClock className="w-4 h-4" />
    }
  }

  return (
    <ModalWrapper 
      isOpen={true}
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Edit Reminder"
      icon={<HiClock className="w-5 h-5" />}
      submitText={isLoading ? 'Updating...' : 'Update Reminder'}
    >
      <div className="p-4 space-y-6">
          {/* Customer Selection */}
          <div>
            <label className="form-label">
              Customer *
            </label>
            <select
              value={formData.customerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="form-select"
            >
              <option value="">Select a customer</option>
              {customers && customers.length > 0 ? (
                customers.map(customer => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name} - {customer.email}
                  </option>
                ))
              ) : (
                <option value="" disabled>No customers available</option>
              )}
            </select>
          </div>

          {/* Reminder Type */}
          <div>
            <label className="form-label">
              Reminder Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
                             {[
                 { value: 'appointment', label: 'Appointment', icon: <HiCalendar className="w-4 h-4" /> },
                 { value: 'service_due', label: 'Service Due', icon: <HiClock className="w-4 h-4" /> },
                 { value: 'follow_up', label: 'Follow-up', icon: <HiUser className="w-4 h-4" /> },
                 { value: 'payment', label: 'Payment Due', icon: <HiMail className="w-4 h-4" /> }
               ].map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleChange('type', type.value)}
                  className={`p-3 border rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                    formData.type === type.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-secondary-300 text-secondary-700 hover:border-secondary-400'
                  }`}
                >
                  {type.icon}
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="form-label">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="form-input"
              placeholder="Enter reminder title..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="form-label">
              Description
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              className="form-textarea"
              placeholder="Enter reminder description..."
            />
          </div>

          {/* Due Date and Reminder Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date *
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reminder Date *
              </label>
              <input
                type="date"
                value={formData.reminderDate}
                onChange={(e) => handleChange('reminderDate', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Notification Methods */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Methods *
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  const methods = formData.notificationMethods.includes('email') 
                    ? formData.notificationMethods.filter(m => m !== 'email')
                    : [...formData.notificationMethods, 'email']
                  handleChange('notificationMethods', methods)
                }}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  formData.notificationMethods.includes('email')
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <HiMail className="w-4 h-4" />
                Email
              </button>
              <button
                type="button"
                onClick={() => {
                  const methods = formData.notificationMethods.includes('sms') 
                    ? formData.notificationMethods.filter(m => m !== 'sms')
                    : [...formData.notificationMethods, 'sms']
                  handleChange('notificationMethods', methods)
                }}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  formData.notificationMethods.includes('sms')
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <HiPhone className="w-4 h-4" />
                SMS
              </button>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes..."
            />
          </div>
        </div>
    </ModalWrapper>
  )
}
