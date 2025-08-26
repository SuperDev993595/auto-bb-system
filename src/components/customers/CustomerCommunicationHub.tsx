import { useState, useEffect } from 'react'
import { Phone, Mail, MessageSquare, Calendar, Clock, User, PhoneCall, Voicemail, Send, Plus } from '../../utils/icons'

interface CommunicationRecord {
  id: string
  type: 'call' | 'email' | 'sms' | 'appointment' | 'note'
  direction: 'inbound' | 'outbound'
  status: 'completed' | 'scheduled' | 'missed' | 'pending'
  subject?: string
  content: string
  timestamp: string
  duration?: number
  followUpRequired: boolean
  followUpDate?: string
  assignedTo?: string
  tags: string[]
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  preferredContact: 'phone' | 'email' | 'sms'
  lastContact: string
  totalInteractions: number
}

interface Props {
  customerId: string
  onClose?: () => void
}

export default function CustomerCommunicationHub({ customerId, onClose }: Props) {
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [communications, setCommunications] = useState<CommunicationRecord[]>([])
  const [activeTab, setActiveTab] = useState<'all' | 'calls' | 'emails' | 'sms' | 'appointments' | 'notes'>('all')
  const [loading, setLoading] = useState(true)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newCommunication, setNewCommunication] = useState({
    type: 'call' as const,
    direction: 'outbound' as const,
    subject: '',
    content: '',
    followUpRequired: false,
    followUpDate: '',
    tags: [] as string[]
  })

  useEffect(() => {
    // In a real app, this would fetch customer and communication data
    const fetchData = async () => {
      setLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock customer data
      setCustomer({
        id: customerId,
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+1 (555) 123-4567',
        preferredContact: 'phone',
        lastContact: '2024-01-15T10:30:00Z',
        totalInteractions: 24
      })

      // Mock communication records
      setCommunications([
        {
          id: '1',
          type: 'call',
          direction: 'inbound',
          status: 'completed',
          content: 'Customer called to schedule oil change for 2020 Toyota Camry',
          timestamp: '2024-01-15T10:30:00Z',
          duration: 180,
          followUpRequired: false,
          tags: ['service', 'oil-change']
        },
        {
          id: '2',
          type: 'email',
          direction: 'outbound',
          status: 'completed',
          subject: 'Appointment Confirmation',
          content: 'Your appointment has been confirmed for tomorrow at 2:00 PM',
          timestamp: '2024-01-14T14:00:00Z',
          followUpRequired: false,
          tags: ['appointment', 'confirmation']
        },
        {
          id: '3',
          type: 'sms',
          direction: 'outbound',
          status: 'completed',
          content: 'Reminder: Your appointment is tomorrow at 2:00 PM',
          timestamp: '2024-01-14T16:00:00Z',
          followUpRequired: false,
          tags: ['reminder', 'appointment']
        },
        {
          id: '4',
          type: 'appointment',
          direction: 'inbound',
          status: 'completed',
          content: 'Oil change completed successfully. Vehicle ready for pickup',
          timestamp: '2024-01-13T15:30:00Z',
          followUpRequired: true,
          followUpDate: '2024-01-20T10:00:00Z',
          tags: ['service', 'completed', 'follow-up']
        }
      ])
      
      setLoading(false)
    }

    fetchData()
  }, [customerId])

  const filteredCommunications = communications.filter(comm => 
    activeTab === 'all' || comm.type === activeTab
  )

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4" />
      case 'email': return <Mail className="w-4 h-4" />
      case 'sms': return <MessageSquare className="w-4 h-4" />
      case 'appointment': return <Calendar className="w-4 h-4" />
      case 'note': return <MessageSquare className="w-4 h-4" />
      default: return <MessageSquare className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'call': return 'bg-blue-100 text-blue-700'
      case 'email': return 'bg-green-100 text-green-700'
      case 'sms': return 'bg-purple-100 text-purple-700'
      case 'appointment': return 'bg-orange-100 text-orange-700'
      case 'note': return 'bg-gray-100 text-gray-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getDirectionIcon = (direction: string) => {
    if (direction === 'inbound') {
      return <PhoneCall className="w-4 h-4 text-green-600" />
    }
    return <Send className="w-4 h-4 text-blue-600" />
  }

  const handleNewCommunication = () => {
    // In a real app, this would save to the backend
    const newComm: CommunicationRecord = {
      id: Date.now().toString(),
      type: newCommunication.type,
      direction: newCommunication.direction,
      status: 'completed',
      subject: newCommunication.subject,
      content: newCommunication.content,
      timestamp: new Date().toISOString(),
      followUpRequired: newCommunication.followUpRequired,
      followUpDate: newCommunication.followUpDate,
      tags: newCommunication.tags
    }
    
    setCommunications([newComm, ...communications])
    setShowNewForm(false)
    setNewCommunication({
      type: 'call',
      direction: 'outbound',
      subject: '',
      content: '',
      followUpRequired: false,
      followUpDate: '',
      tags: []
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Customer not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Communication Hub</h2>
            <p className="text-gray-600">All customer interactions in one place</p>
          </div>
          <button
            onClick={() => setShowNewForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            New Communication
          </button>
        </div>

        {/* Customer Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <User className="w-5 h-5 text-blue-500" />
            <div>
              <p className="text-sm text-gray-600">Customer</p>
              <p className="font-semibold text-gray-900">{customer.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Phone className="w-5 h-5 text-green-500" />
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-semibold text-gray-900">{customer.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Mail className="w-5 h-5 text-purple-500" />
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-semibold text-gray-900">{customer.email}</p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{customer.totalInteractions}</p>
            <p className="text-sm text-blue-600">Total Interactions</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {communications.filter(c => c.followUpRequired).length}
            </p>
            <p className="text-sm text-green-600">Follow-ups Required</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">
              {communications.filter(c => c.type === 'call').length}
            </p>
            <p className="text-sm text-purple-600">Phone Calls</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">
              {communications.filter(c => c.type === 'email').length}
            </p>
            <p className="text-sm text-orange-600">Emails</p>
          </div>
        </div>
      </div>

      {/* New Communication Form */}
      {showNewForm && (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">New Communication</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
              <select
                value={newCommunication.type}
                onChange={(e) => setNewCommunication({...newCommunication, type: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="call">Phone Call</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="note">Note</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Direction</label>
              <select
                value={newCommunication.direction}
                onChange={(e) => setNewCommunication({...newCommunication, direction: e.target.value as any})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="inbound">Inbound</option>
                <option value="outbound">Outbound</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                value={newCommunication.subject}
                onChange={(e) => setNewCommunication({...newCommunication, subject: e.target.value})}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter subject..."
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                value={newCommunication.content}
                onChange={(e) => setNewCommunication({...newCommunication, content: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter communication details..."
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="followUpRequired"
                checked={newCommunication.followUpRequired}
                onChange={(e) => setNewCommunication({...newCommunication, followUpRequired: e.target.checked})}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="followUpRequired" className="text-sm text-gray-700">
                Follow-up Required
              </label>
            </div>
            {newCommunication.followUpRequired && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Date</label>
                <input
                  type="datetime-local"
                  value={newCommunication.followUpDate}
                  onChange={(e) => setNewCommunication({...newCommunication, followUpDate: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleNewCommunication}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
            >
              Save Communication
            </button>
            <button
              onClick={() => setShowNewForm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Communication Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {(['all', 'calls', 'emails', 'sms', 'appointments', 'notes'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {tab === 'all' ? communications.length : communications.filter(c => c.type === tab).length}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Communication List */}
        <div className="p-6">
          {filteredCommunications.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No communications found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCommunications.map((comm) => (
                <div key={comm.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${getTypeColor(comm.type)}`}>
                        {getTypeIcon(comm.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-900">
                            {comm.type.charAt(0).toUpperCase() + comm.type.slice(1)}
                          </span>
                          {getDirectionIcon(comm.direction)}
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            comm.status === 'completed' ? 'bg-green-100 text-green-700' :
                            comm.status === 'scheduled' ? 'bg-yellow-100 text-yellow-700' :
                            comm.status === 'missed' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {comm.status}
                          </span>
                          {comm.followUpRequired && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                              Follow-up Required
                            </span>
                          )}
                        </div>
                        
                        {comm.subject && (
                          <p className="font-medium text-gray-900 mb-2">{comm.subject}</p>
                        )}
                        
                        <p className="text-gray-700 mb-3">{comm.content}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {new Date(comm.timestamp).toLocaleString()}
                          </div>
                          {comm.duration && (
                            <div className="flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {Math.floor(comm.duration / 60)}:{(comm.duration % 60).toString().padStart(2, '0')}
                            </div>
                          )}
                          {comm.followUpDate && (
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Follow-up: {new Date(comm.followUpDate).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        
                        {comm.tags.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {comm.tags.map((tag) => (
                              <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
