import { useState, useEffect } from 'react'
import ModalWrapper from '../../utils/ModalWrapper'
import { HiClock, HiUser, HiMail, HiPhone, HiCalendar, HiTemplate } from 'react-icons/hi'
import { ReminderTemplate } from '../../redux/reducer/remindersReducer'

interface TemplateFormData {
  name: string
  type: ReminderTemplate['type']
  subject: string
  message: string
  timing: {
    value: number
    unit: 'minutes' | 'hours' | 'days' | 'weeks'
    when: 'before' | 'after'
  }
  methods: ReminderTemplate['methods']
  isActive: boolean
}

interface Props {
  onClose: () => void
  onSave: (data: TemplateFormData) => void
  isLoading?: boolean
  template?: ReminderTemplate
  isEditing?: boolean
}

export default function CreateTemplateModal({ 
  onClose, 
  onSave, 
  isLoading = false, 
  template, 
  isEditing = false 
}: Props) {
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    type: 'appointment',
    subject: '',
    message: '',
    timing: {
      value: 24,
      unit: 'hours',
      when: 'before'
    },
    methods: ['email'],
    isActive: true
  })

  useEffect(() => {
    if (template && isEditing) {
      setFormData({
        name: template.name,
        type: template.type,
        subject: template.subject,
        message: template.message,
        timing: template.timing,
        methods: template.methods,
        isActive: template.isActive
      })
    }
  }, [template, isEditing])

  const handleChange = (field: keyof TemplateFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTimingChange = (field: keyof TemplateFormData['timing'], value: any) => {
    setFormData(prev => ({
      ...prev,
      timing: {
        ...prev.timing,
        [field]: value
      }
    }))
  }

  const handleMethodToggle = (method: 'email' | 'sms') => {
    setFormData(prev => ({
      ...prev,
      methods: prev.methods.includes(method)
        ? prev.methods.filter(m => m !== method)
        : [...prev.methods, method]
    }))
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.subject || !formData.message) {
      alert('Please fill in all required fields.')
      return
    }
    if (formData.methods.length === 0) {
      alert('Please select at least one notification method.')
      return
    }
    onSave(formData)
  }

  const getTypeIcon = (type: ReminderTemplate['type']) => {
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
      title={isEditing ? 'Edit Template' : 'Create New Template'}
      icon={<HiTemplate className="w-5 h-5" />}
      submitLabel={isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Template' : 'Create Template')}
    >
      <div className="space-y-6">
          {/* Template Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Appointment Reminder - 24 Hours"
            />
          </div>

          {/* Template Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Type *
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

          {/* Timing Configuration */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Timing Configuration</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Value</label>
                <input
                  type="number"
                  value={formData.timing.value}
                  onChange={(e) => handleTimingChange('value', parseInt(e.target.value))}
                  min="1"
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
                <select
                  value={formData.timing.unit}
                  onChange={(e) => handleTimingChange('unit', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="minutes">Minutes</option>
                  <option value="hours">Hours</option>
                  <option value="days">Days</option>
                  <option value="weeks">Weeks</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">When</label>
                <select
                  value={formData.timing.when}
                  onChange={(e) => handleTimingChange('when', e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="before">Before</option>
                  <option value="after">After</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Example: {formData.timing.value} {formData.timing.unit} {formData.timing.when} the event
            </p>
          </div>

          {/* Notification Methods */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Methods *
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => handleMethodToggle('email')}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  formData.methods.includes('email')
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <HiMail className="w-4 h-4" />
                Email
              </button>
              <button
                type="button"
                onClick={() => handleMethodToggle('sms')}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                  formData.methods.includes('sms')
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <HiPhone className="w-4 h-4" />
                SMS
              </button>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., Appointment Reminder - {'{{businessName}}'}"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Template *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => handleChange('message', e.target.value)}
              rows={8}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter the message template with placeholders like {'{{customerName}}'}, {'{{appointmentDate}}'}, etc."
            />
            <div className="mt-2 text-xs text-gray-500">
              <p className="font-medium mb-1">Available placeholders:</p>
              <div className="grid grid-cols-2 gap-1">
                <span>• {'{{customerName}}'} - Customer's full name</span>
                <span>• {'{{businessName}}'} - Your business name</span>
                <span>• {'{{appointmentDate}}'} - Appointment date</span>
                <span>• {'{{appointmentTime}}'} - Appointment time</span>
                <span>• {'{{serviceType}}'} - Type of service</span>
                <span>• {'{{businessPhone}}'} - Business phone</span>
                <span>• {'{{vehicleInfo}}'} - Vehicle details</span>
                <span>• {'{{technicianName}}'} - Technician name</span>
              </div>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700">Active Status</span>
              <p className="text-xs text-gray-500">Enable this template for automatic reminders</p>
            </div>
            <button
              onClick={() => handleChange('isActive', !formData.isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                formData.isActive ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                formData.isActive ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>
    </ModalWrapper>
  )
}
