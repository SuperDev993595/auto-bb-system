import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../redux'
import { fetchCommunicationLogs, createCommunicationLog, updateCommunicationLog, deleteCommunicationLog, fetchCommunicationStats } from '../redux/actions/communicationLogs'
import { fetchCustomers } from '../redux/actions/customers'
import PageTitle from '../components/Shared/PageTitle'
import CreateCommunicationLogModal from '../components/CommunicationLogs/CreateCommunicationLogModal'
import EditCommunicationLogModal from '../components/CommunicationLogs/EditCommunicationLogModal'
import { CommunicationLog } from '../utils/CustomerTypes'
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

export default function ContactLogsPage() {
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLog, setSelectedLog] = useState<CommunicationLog | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingLog, setEditingLog] = useState<CommunicationLog | null>(null)
  const [deleteLogId, setDeleteLogId] = useState<string | null>(null)

  const dispatch = useAppDispatch()
  const { logs: communicationLogs, stats, loading } = useAppSelector(state => state.communicationLogs)
  const customers = useAppSelector(state => state.customers.list)

  // Load data on component mount
  useEffect(() => {
    dispatch(fetchCommunicationLogs({}))
    dispatch(fetchCommunicationStats())
    dispatch(fetchCustomers({})) // Ensure customers are loaded
  }, [dispatch])

  const filteredLogs = communicationLogs.filter(log => {
    const matchesType = typeFilter === 'all' || log.type === typeFilter
    const matchesSearch = log.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (log.subject || '').toLowerCase().includes(searchTerm.toLowerCase())
    return matchesType && matchesSearch
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

  const handleCreateLog = (data: any) => {
    dispatch(createCommunicationLog(data)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setShowCreateModal(false)
        dispatch(fetchCommunicationLogs({}))
      }
    })
  }

  const handleEditLog = (log: CommunicationLog) => {
    setEditingLog(log)
    setShowEditModal(true)
  }

  const handleUpdateLog = (data: any) => {
    if (!editingLog) return
    
    // Use id if available, otherwise fall back to _id
    const logId = editingLog.id || (editingLog as any)._id
    
    dispatch(updateCommunicationLog({ id: logId, logData: data })).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setShowEditModal(false)
        setEditingLog(null)
        dispatch(fetchCommunicationLogs({}))
      }
    })
  }

  const handleDeleteLog = (id: string) => {
    dispatch(deleteCommunicationLog(id)).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setDeleteLogId(null)
        dispatch(fetchCommunicationLogs({}))
      }
    })
  }

  const getCustomerName = (customerId: string) => {
    // Debug: Log the customerId and available customers
    console.log('Looking for customer with ID:', customerId)
    console.log('Available customers:', customers)
    
    // Try to find customer by id (now mapped from _id) or fallback to _id
    const customer = customers.find(c => (c as any).id === customerId || (c as any)._id === customerId)
    
    if (!customer) {
      console.log('Customer not found for ID:', customerId)
    }
    
    return customer?.name || 'Unknown Customer'
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <PageTitle title="Customer Communication Logs" />
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
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
              <p className="text-sm text-gray-600">Emails</p>
              <p className="text-2xl font-bold text-blue-600">
                {communicationLogs.filter(log => log.type === 'email').length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <HiMail className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In-Person</p>
              <p className="text-2xl font-bold text-purple-600">
                {communicationLogs.filter(log => log.type === 'in-person').length}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <HiUser className="w-6 h-6 text-purple-600" />
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
        </div>
      </div>

      {/* Communication Logs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading communication logs...</p>
            </div>
          ) : (
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
                          <h3 className="text-lg font-semibold text-gray-800">{log.subject || 'No Subject'}</h3>
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
                          <span>Customer: <strong>{getCustomerName(log.customerId)}</strong></span>
                          <span>Employee: <strong>{log.employeeName}</strong></span>
                        </div>
                      </div>
                    </div>
                                         <div className="flex items-center gap-2">
                       <button 
                         onClick={() => handleEditLog(log)}
                         className="text-blue-600 hover:text-blue-800"
                       >
                         Edit
                       </button>
                                            <button 
                       onClick={() => setDeleteLogId(log.id || (log as any)._id)}
                       className="text-red-600 hover:text-red-800"
                     >
                       Delete
                     </button>
                     </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-gray-500 pt-2 border-t border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <HiCalendar className="w-4 h-4" />
                        <span>{log.date}</span>
                      </div>
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
              
              {filteredLogs.length === 0 && (
                <div className="text-center py-12">
                  <HiChatAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-500 mb-2">No communication logs found</h3>
                  <p className="text-gray-400">Try adjusting your filters or log a new communication.</p>
                </div>
              )}
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
                  <p className="mt-1 text-sm text-gray-900">{getCustomerName(selectedLog.customerId)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Employee</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLog.employeeName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLog.date}</p>
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
                <p className="mt-1 text-sm text-gray-900">{selectedLog.subject || 'No Subject'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded">{selectedLog.content}</p>
              </div>
            </div>
          </div>
        </div>
      )}

             {/* Create Modal */}
       {showCreateModal && (
         <CreateCommunicationLogModal
           onClose={() => setShowCreateModal(false)}
           onSave={handleCreateLog}
           isLoading={loading}
         />
       )}

       {/* Edit Modal */}
       {showEditModal && editingLog && (
         <EditCommunicationLogModal
           onClose={() => {
             setShowEditModal(false)
             setEditingLog(null)
           }}
           onSave={handleUpdateLog}
           isLoading={loading}
           log={editingLog}
         />
       )}

      {/* Delete Confirmation Modal */}
      {deleteLogId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this communication log? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteLogId(null)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteLog(deleteLogId)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
