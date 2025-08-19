import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../../redux'
import { fetchCustomers } from '../../redux/actions/customers'
import ModalWrapper from '../../utils/ModalWrapper'
import { HiClock, HiUser, HiMail, HiPhone, HiCalendar } from 'react-icons/hi'
import { Reminder, Customer } from '../../utils/CustomerTypes'

interface CreateReminderData {
  customerId: string
  customerName: string
  type: Reminder['type']
  message: string
  scheduledDate: string
  scheduledTime: string
  method: Reminder['method']
  priority: 'low' | 'medium' | 'high' | 'urgent'
  notes?: string
}

interface Props {
  onClose: () => void
  onSave: (data: CreateReminderData) => void
  isLoading?: boolean
}

export default function CreateReminderModal({ onClose, onSave, isLoading = false }: Props) {
  const [formData, setFormData] = useState<CreateReminderData>({
    customerId: '',
    customerName: '',
    type: 'appointment',
    message: '',
    scheduledDate: '',
    scheduledTime: '',
    method: 'email',
    priority: 'medium',
    notes: ''
  })

  const { list: customers = [] } = useAppSelector(state => state.customers)
  const dispatch = useAppDispatch()

  // Load customers if not already loaded
  useEffect(() => {
    if (!customers || customers.length === 0) {
      dispatch(fetchCustomers({}))
    }
  }, [dispatch, customers])

  const handleChange = (field: keyof CreateReminderData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleCustomerChange = (customerId: string) => {
    const customer = customers?.find(c => c._id === customerId)
    setFormData(prev => ({
      ...prev,
      customerId,
      customerName: customer ? customer.name : ''
    }))
  }

  const handleSubmit = () => {
    if (!formData.customerId || !formData.message || !formData.scheduledDate || !formData.scheduledTime) {
      alert('Please fill in all required fields.')
      return
    }
    onSave(formData)
  }

  const getTypeIcon = (type: Reminder['type']) => {
    switch (type) {
      case 'appointment': return <HiCalendar className="w-4 h-4" />
      case 'service-due': return <HiClock className="w-4 h-4" />
      case 'follow-up': return <HiUser className="w-4 h-4" />
      case 'payment-due': return <HiMail className="w-4 h-4" />
      default: return <HiClock className="w-4 h-4" />
    }
  }

  return (
    <ModalWrapper 
      onClose={onClose}
      onSubmit={handleSubmit}
      title="Create New Reminder"
      icon={<HiClock className="w-5 h-5" />}
      submitLabel={isLoading ? 'Creating...' : 'Create Reminder'}
    >
      <div className="space-y-6">
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer *
            </label>
            <select
              value={formData.customerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reminder Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'appointment', label: 'Appointment', icon: <HiCalendar className="w-4 h-4" /> },
                { value: 'service-due', label: 'Service Due', icon: <HiClock className="w-4 h-4" /> },
                { value: 'follow-up', label: 'Follow-up', icon: <HiUser className="w-4 h-4" /> },
                { value: 'payment-due', label: 'Payment Due', icon: <HiMail className="w-4 h-4" /> }
              ].map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleChange('type', type.value)}
                  className={`p-3 border rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                    formData.type === type.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  {type.icon}
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date *
              </label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => handleChange('scheduledDate', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time *
              </label>
              <input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => handleChange('scheduledTime', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Notification Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Method *
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleChange('method', 'email')}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  formData.method === 'email'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <HiMail className="w-4 h-4" />
                Email
              </button>
              <button
                type="button"
                onClick={() => handleChange('method', 'sms')}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  formData.method === 'sms'
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

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter the reminder message..."
            />
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
