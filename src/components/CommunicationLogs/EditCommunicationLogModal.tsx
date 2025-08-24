import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../../redux'
import { fetchCustomers } from '../../redux/actions/customers'
import ModalWrapper from '../../utils/ModalWrapper'
import { CommunicationLog } from '../../utils/CustomerTypes'

interface Props {
  onClose: () => void
  onSave: (data: any) => void
  isLoading?: boolean
  log: CommunicationLog
}

export default function EditCommunicationLogModal({ onClose, onSave, isLoading = false, log }: Props) {
  // Extract customerId and customerName from log.customerId (which can be object or string)
  const getCustomerIdFromLog = () => {
    if (typeof log.customerId === 'object' && log.customerId !== null) {
      return (log.customerId as any)._id || (log.customerId as any).id
    }
    return log.customerId as string
  }

  const getCustomerNameFromLog = () => {
    if (typeof log.customerId === 'object' && log.customerId !== null) {
      return (log.customerId as any).name || ''
    }
    return (log as any).customerName || ''
  }

  const [formData, setFormData] = useState({
    customerId: getCustomerIdFromLog(),
    customerName: getCustomerNameFromLog(),
    date: log.date,
    time: (log as any).time || '09:00',
    type: log.type,
    direction: log.direction,
    subject: log.subject || '',
    content: log.content,
    outcome: (log as any).outcome || 'resolved',
    employeeName: log.employeeName,
    priority: (log as any).priority || 'medium',
    relatedService: (log as any).relatedService || ''
  })

  const { list: customers = [] } = useAppSelector(state => state.customers)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!customers || customers.length === 0) {
      dispatch(fetchCustomers({}))
    }
  }, [dispatch, customers])

  useEffect(() => {
    setFormData({
      customerId: getCustomerIdFromLog(),
      customerName: getCustomerNameFromLog(),
      date: log.date,
      time: (log as any).time || '09:00',
      type: log.type,
      direction: log.direction,
      subject: log.subject || '',
      content: log.content,
      outcome: (log as any).outcome || 'resolved',
      employeeName: log.employeeName,
      priority: (log as any).priority || 'medium',
      relatedService: (log as any).relatedService || ''
    })
  }, [log])

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => (c as any)._id === customerId || (c as any).id === customerId)
    setFormData(prev => ({
      ...prev,
      customerId,
      customerName: customer?.name || ''
    }))
  }

  const handleSubmit = () => {
    if (!formData.customerId || !formData.date || !formData.content || !formData.employeeName) {
      alert('Please fill in all required fields.')
      return
    }
    onSave(formData)
  }

  return (
    <ModalWrapper 
      isOpen={true}
      onClose={onClose} 
      title="Edit Communication Log" 
      onSubmit={handleSubmit}
      submitText={isLoading ? 'Updating...' : 'Update Communication Log'}
    >
      <div className="p-4 space-y-6">
        <div>
          <label className="form-label">Customer *</label>
          <select
            value={formData.customerId}
            onChange={(e) => handleCustomerChange(e.target.value)}
            className="form-select"
          >
            <option value="">Select a customer</option>
            {customers.map(customer => (
              <option key={(customer as any)._id} value={(customer as any)._id}>
                {(customer as any).name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Date *</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="form-label">Time</label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => handleChange('time', e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Type *</label>
            <select
              value={formData.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="form-select"
              required
            >
              <option value="phone">Phone</option>
              <option value="email">Email</option>
              <option value="in-person">In-Person</option>
              <option value="sms">SMS</option>
            </select>
          </div>
          <div>
            <label className="form-label">Direction *</label>
            <select
              value={formData.direction}
              onChange={(e) => handleChange('direction', e.target.value)}
              className="form-select"
              required
            >
              <option value="inbound">Inbound</option>
              <option value="outbound">Outbound</option>
            </select>
          </div>
        </div>

        <div>
          <label className="form-label">Subject</label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) => handleChange('subject', e.target.value)}
            placeholder="Enter subject"
            className="form-input"
          />
        </div>

        <div>
          <label className="form-label">Content *</label>
          <textarea
            value={formData.content}
            onChange={(e) => handleChange('content', e.target.value)}
            placeholder="Enter communication content"
            rows={4}
            className="form-textarea"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Outcome</label>
            <select
              value={formData.outcome}
              onChange={(e) => handleChange('outcome', e.target.value)}
              className="form-select"
            >
              <option value="resolved">Resolved</option>
              <option value="follow-up-needed">Follow-up Needed</option>
              <option value="appointment-scheduled">Appointment Scheduled</option>
              <option value="no-answer">No Answer</option>
              <option value="callback-requested">Callback Requested</option>
            </select>
          </div>
          <div>
            <label className="form-label">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              className="form-select"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Employee Name *</label>
            <input
              type="text"
              value={formData.employeeName}
              onChange={(e) => handleChange('employeeName', e.target.value)}
              placeholder="Enter employee name"
              className="form-input"
              required
            />
          </div>
          <div>
            <label className="form-label">Related Service</label>
            <input
              type="text"
              value={formData.relatedService}
              onChange={(e) => handleChange('relatedService', e.target.value)}
              placeholder="Enter related service"
              className="form-input"
            />
          </div>
        </div>


      </div>
    </ModalWrapper>
  )
}
