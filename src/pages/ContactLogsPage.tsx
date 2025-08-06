import { useState } from 'react'
import { useAppSelector } from '../redux'
import PageTitle from '../components/Shared/PageTitle'
import {
  HiPhone,
  HiMail,
  HiUser,
  HiChatAlt,
  HiEye,
  HiPlus,
  HiSearch,
  HiFilter,
  HiCalendar,
  HiClock,
  HiArrowUp,
  HiArrowDown
} from 'react-icons/hi'

interface CommunicationLog {
  id: string
  customerId: string
  customerName: string
  date: string
  time: string
  type: 'phone' | 'email' | 'in-person' | 'sms'
  direction: 'inbound' | 'outbound'
  subject: string
  content: string
  outcome: 'resolved' | 'follow-up-needed' | 'appointment-scheduled' | 'no-answer' | 'callback-requested'
  employeeName: string
  priority: 'low' | 'medium' | 'high'
  relatedService?: string
}

export default function ContactLogsPage() {
  const [typeFilter, setTypeFilter] = useState('all')
  const [outcomeFilter, setOutcomeFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLog, setSelectedLog] = useState<CommunicationLog | null>(null)

  const customers = useAppSelector(state => state.customers.list)

  // Sample communication logs for auto repair shop
  const communicationLogs: CommunicationLog[] = [
    {
      id: '1',
      customerId: '1',
      customerName: 'John Smith',
      date: '2025-08-05',
      time: '10:30 AM',
      type: 'phone',
      direction: 'outbound',
      subject: 'Oil Change Reminder',
      content: 'Called to remind customer about upcoming oil change due at 45,000 miles. Customer appreciated the call and scheduled appointment for next week.',
      outcome: 'appointment-scheduled',
      employeeName: 'Sarah Davis',
      priority: 'medium',
      relatedService: 'Oil Change'
    },
    {
      id: '2',
      customerId: '2',
      customerName: 'Lisa Brown',
      date: '2025-08-04',
      time: '2:15 PM',
      type: 'email',
      direction: 'inbound',
      subject: 'Question about brake service',
      content: 'Customer emailed asking about brake service costs and what\'s included. Provided detailed breakdown and offered free inspection.',
      outcome: 'follow-up-needed',
      employeeName: 'Mike Johnson',
      priority: 'low',
      relatedService: 'Brake Service'
    },
    {
      id: '3',
      customerId: '1',
      customerName: 'John Smith',
      date: '2025-08-03',
      time: '4:45 PM',
      type: 'phone',
      direction: 'inbound',
      subject: 'Service completion notification',
      content: 'Customer called to confirm his vehicle was ready for pickup after oil change. Confirmed completion and provided service summary.',
      outcome: 'resolved',
      employeeName: 'Tom Wilson',
      priority: 'low'
    },
    {
      id: '4',
      customerId: '3',
      customerName: 'Mike Rodriguez',
      date: '2025-08-02',
      time: '11:20 AM',
      type: 'in-person',
      direction: 'inbound',
      subject: 'Engine diagnostic results',
      content: 'Customer came in to discuss diagnostic results for engine trouble. Explained findings and provided repair options with estimates.',
      outcome: 'follow-up-needed',
      employeeName: 'Mike Johnson',
      priority: 'high',
      relatedService: 'Engine Diagnostic'
    },
    {
      id: '5',
      customerId: '2',
      customerName: 'Lisa Brown',
      date: '2025-08-01',
      time: '9:00 AM',
      type: 'sms',
      direction: 'outbound',
      subject: 'Appointment reminder',
      content: 'Sent SMS reminder for tire rotation appointment scheduled for today at 2 PM.',
      outcome: 'resolved',
      employeeName: 'System',
      priority: 'low',
      relatedService: 'Tire Rotation'
    }
  ]

  const filteredLogs = communicationLogs.filter(log => {
    const matchesType = typeFilter === 'all' || log.type === typeFilter
    const matchesOutcome = outcomeFilter === 'all' || log.outcome === outcomeFilter
    const matchesSearch = log.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.content.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesOutcome && matchesSearch
  })

  const getTypeIcon = (type: CommunicationLog['type']) => {
    switch (type) {
      case 'phone': return <HiPhone className="w-4 h-4" />
      case 'email': return <HiMail className="w-4 h-4" />
      case 'in-person': return <HiUser className="w-4 h-4" />
      case 'sms': return <HiChatAlt className="w-4 h-4" />
      default: return <HiChatAlt className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: CommunicationLog['type']) => {
    switch (type) {
      case 'phone': return 'bg-green-100 text-green-800'
      case 'email': return 'bg-blue-100 text-blue-800'
      case 'in-person': return 'bg-purple-100 text-purple-800'
      case 'sms': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getOutcomeColor = (outcome: CommunicationLog['outcome']) => {
    switch (outcome) {
      case 'resolved': return 'bg-green-100 text-green-800'
      case 'appointment-scheduled': return 'bg-blue-100 text-blue-800'
      case 'follow-up-needed': return 'bg-yellow-100 text-yellow-800'
      case 'callback-requested': return 'bg-orange-100 text-orange-800'
      case 'no-answer': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: CommunicationLog['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <PageTitle title="Customer Communication Logs" />
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <HiPlus className="w-4 h-4" />
          Log Communication
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Contacts</p>
              <p className="text-2xl font-bold text-gray-900">{communicationLogs.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <HiChatAlt className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Phone Calls</p>
              <p className="text-2xl font-bold text-green-600">
                {communicationLogs.filter(log => log.type === 'phone').length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <HiPhone className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Follow-ups Needed</p>
              <p className="text-2xl font-bold text-yellow-600">
                {communicationLogs.filter(log => log.outcome === 'follow-up-needed').length}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <HiClock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-green-600">
                {communicationLogs.filter(log => log.outcome === 'resolved').length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <HiEye className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <HiSearch className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search communications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="all">All Types</option>
            <option value="phone">Phone</option>
            <option value="email">Email</option>
            <option value="in-person">In-Person</option>
            <option value="sms">SMS</option>
          </select>
          
          <select
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="all">All Outcomes</option>
            <option value="resolved">Resolved</option>
            <option value="follow-up-needed">Follow-up Needed</option>
            <option value="appointment-scheduled">Appointment Scheduled</option>
            <option value="callback-requested">Callback Requested</option>
            <option value="no-answer">No Answer</option>
          </select>
        </div>
      </div>

      {/* Communication Logs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="space-y-4">
            {filteredLogs.map(log => (
              <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${getTypeColor(log.type)}`}>
                      {getTypeIcon(log.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-800">{log.subject}</h3>
                        <div className="flex items-center gap-1">
                          {log.direction === 'inbound' ? (
                            <HiArrowDown className="w-4 h-4 text-green-600" />
                          ) : (
                            <HiArrowUp className="w-4 h-4 text-blue-600" />
                          )}
                          <span className="text-xs text-gray-500 capitalize">{log.direction}</span>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{log.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Customer: <strong>{log.customerName}</strong></span>
                        <span>Employee: <strong>{log.employeeName}</strong></span>
                        {log.relatedService && (
                          <span>Service: <strong>{log.relatedService}</strong></span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getOutcomeColor(log.outcome)}`}>
                      {log.outcome.replace('-', ' ')}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(log.priority) === 'text-red-600' ? 'bg-red-500' : getPriorityColor(log.priority) === 'text-yellow-600' ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-500 pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <HiCalendar className="w-4 h-4" />
                      <span>{log.date} at {log.time}</span>
                    </div>
                    <span className={`capitalize font-medium ${getPriorityColor(log.priority)}`}>
                      {log.priority} priority
                    </span>
                  </div>
                  <button 
                    onClick={() => setSelectedLog(log)}
                    className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <HiEye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <HiChatAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No communication logs found</h3>
              <p className="text-gray-400">Try adjusting your filters or log a new communication.</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for viewing details */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Communication Details</h3>
              <button 
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLog.customerName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employee</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLog.employeeName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLog.date} at {selectedLog.time}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Type</label>
                  <div className="flex items-center gap-2 mt-1">
                    {getTypeIcon(selectedLog.type)}
                    <span className="text-sm text-gray-900 capitalize">{selectedLog.type}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <p className="mt-1 text-sm text-gray-900">{selectedLog.subject}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">{selectedLog.content}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Outcome</label>
                  <span className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full ${getOutcomeColor(selectedLog.outcome)}`}>
                    {selectedLog.outcome.replace('-', ' ')}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Priority</label>
                  <p className={`mt-1 text-sm font-medium capitalize ${getPriorityColor(selectedLog.priority)}`}>
                    {selectedLog.priority}
                  </p>
                </div>
                {selectedLog.relatedService && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Related Service</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedLog.relatedService}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
