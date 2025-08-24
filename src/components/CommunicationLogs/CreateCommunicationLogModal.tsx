import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../../redux'
import { fetchCustomers } from '../../redux/actions/customers'
import ModalWrapper from '../../utils/ModalWrapper'

interface Props {
  onClose: () => void
  onSave: (data: any) => void
  isLoading?: boolean
}

export default function CreateCommunicationLogModal({ onClose, onSave, isLoading = false }: Props) {
  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    type: 'phone' as 'phone' | 'email' | 'in-person' | 'sms',
    direction: 'outbound' as 'inbound' | 'outbound',
    subject: '',
    content: '',
    outcome: 'resolved' as 'resolved' | 'follow-up-needed' | 'appointment-scheduled' | 'no-answer' | 'callback-requested',
    employeeName: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    relatedService: ''
  })

  const { list: customers = [] } = useAppSelector(state => state.customers)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (!customers || customers.length === 0) {
      dispatch(fetchCustomers({}))
    }
  }, [dispatch, customers])

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
    if (!formData.customerId || !formData.subject || !formData.content || !formData.employeeName) {
      alert('Please fill in all required fields.')
      return
    }
    onSave(formData)
  }

  return (
    <ModalWrapper 
      isOpen={true}
      title="Log Communication" 
      onClose={onClose} 
      onSubmit={handleSubmit}
      submitText={isLoading ? 'Creating...' : 'Log Communication'}
    >
      <div className="p-4 space-y-4">
        <div>
          <label className="form-label">Customer *</label>
          <select value={formData.customerId} onChange={(e) => handleCustomerChange(e.target.value)} className="form-select" required>
            <option value="">Select a customer</option>
            {customers.map(customer => (
              <option key={(customer as any)._id} value={(customer as any)._id}>{(customer as any).name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Date *</label>
            <input type="date" value={formData.date} onChange={(e) => handleChange('date', e.target.value)} className="form-input" required />
          </div>
          <div>
            <label className="form-label">Time *</label>
            <input type="time" value={formData.time} onChange={(e) => handleChange('time', e.target.value)} className="form-input" required />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Type *</label>
            <select value={formData.type} onChange={(e) => handleChange('type', e.target.value)} className="form-select" required>
              <option value="phone">Phone</option>
              <option value="email">Email</option>
              <option value="in-person">In-Person</option>
              <option value="sms">SMS</option>
            </select>
          </div>
          <div>
            <label className="form-label">Direction *</label>
            <select value={formData.direction} onChange={(e) => handleChange('direction', e.target.value)} className="form-select" required>
              <option value="inbound">Inbound</option>
              <option value="outbound">Outbound</option>
            </select>
          </div>
        </div>

        <div>
          <label className="form-label">Subject *</label>
          <input type="text" value={formData.subject} onChange={(e) => handleChange('subject', e.target.value)} placeholder="Brief description" className="form-input" required />
        </div>

        <div>
          <label className="form-label">Content *</label>
          <textarea value={formData.content} onChange={(e) => handleChange('content', e.target.value)} placeholder="Detailed notes" rows={4} className="form-textarea" required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Outcome *</label>
            <select value={formData.outcome} onChange={(e) => handleChange('outcome', e.target.value)} className="form-select" required>
              <option value="resolved">Resolved</option>
              <option value="follow-up-needed">Follow-up Needed</option>
              <option value="appointment-scheduled">Appointment Scheduled</option>
              <option value="no-answer">No Answer</option>
              <option value="callback-requested">Callback Requested</option>
            </select>
          </div>
          <div>
            <label className="form-label">Priority *</label>
            <select value={formData.priority} onChange={(e) => handleChange('priority', e.target.value)} className="form-select" required>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Employee Name *</label>
            <input type="text" value={formData.employeeName} onChange={(e) => handleChange('employeeName', e.target.value)} placeholder="Who handled this" className="form-input" required />
          </div>
          <div>
            <label className="form-label">Related Service</label>
            <input type="text" value={formData.relatedService} onChange={(e) => handleChange('relatedService', e.target.value)} placeholder="e.g., Oil Change" className="form-input" />
          </div>
        </div>
      </div>
    </ModalWrapper>
  )
}
