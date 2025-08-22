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
      case 'phone': return 'bg-success-100 text-success-800'
      case 'email': return 'bg-info-100 text-info-800'
      case 'in-person': return 'bg-warning-100 text-warning-800'
      case 'sms': return 'bg-primary-100 text-primary-800'
      default: return 'bg-secondary-100 text-secondary-800'
    }
  }

  const handleCreateLog = (data: any) => {
    // Extract customerId from the data
    const customerId = data.customerId
    dispatch(createCommunicationLog({ customerId, logData: data })).then((result) => {
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
    const customerId = editingLog.customerId
    
    dispatch(updateCommunicationLog({ customerId, logId, logData: data })).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setShowEditModal(false)
        setEditingLog(null)
        dispatch(fetchCommunicationLogs({}))
      }
    })
  }

  const handleDeleteLog = (id: string) => {
    // We need to find the log to get the customerId
    const log = communicationLogs.find(log => log.id === id || (log as any)._id === id)
    if (!log) return
    
    const customerId = log.customerId
    dispatch(deleteCommunicationLog({ customerId, logId: id })).then((result) => {
      if (result.meta.requestStatus === 'fulfilled') {
        setDeleteLogId(null)
        dispatch(fetchCommunicationLogs({}))
      }
    })
  }

  const getCustomerName = (customerId: string | any) => {
    // Debug: Log the customerId and available customers
    console.log('=== getCustomerName Debug ===')
    console.log('Looking for customer with ID/Object:', customerId)
    console.log('Type of customerId:', typeof customerId)
    
    // If customerId is already a populated customer object, return its name directly
    if (typeof customerId === 'object' && customerId !== null && customerId.name) {
      console.log('✅ CustomerId is a customer object, returning name:', customerId.name)
      return customerId.name
    }
    
    // If customerId is a string, try to find the customer in the list
    if (typeof customerId === 'string') {
      console.log('CustomerId is string, searching in customer list...')
      console.log('Available customers count:', customers.length)
      
      if (customers.length === 0) {
        console.log('⚠️ No customers loaded yet!')
        return 'Loading...'
      }
      
      // Try to find customer by id (now mapped from _id) or fallback to _id
      const customer = customers.find(c => (c as any).id === customerId || (c as any)._id === customerId)
      
      if (!customer) {
        console.log('❌ Customer not found for ID:', customerId)
        console.log('Available customer IDs:', customers.map(c => (c as any).id || (c as any)._id))
      } else {
        console.log('✅ Found customer:', customer)
      }
      
      return customer?.name || 'Unknown Customer'
    }
    
    console.log('❌ CustomerId is neither string nor valid object:', customerId)
    return 'Unknown Customer'
  }

  return (
    <>
      <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-text">
            <PageTitle title="Customer Communication Logs" />
          </div>
          <div className="page-header-actions">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary-outline"
            >
              <HiPlus className="w-4 h-4" />
              Log Communication
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid-responsive">
        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-label">Total Contacts</div>
            <div className="stats-card-value">{communicationLogs.length}</div>
          </div>
          <div className="stats-card-icon bg-info-500">
            <HiChatAlt className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-label">Phone Calls</div>
            <div className="stats-card-value text-success-600">
              {communicationLogs.filter(log => log.type === 'phone').length}
            </div>
          </div>
          <div className="stats-card-icon bg-success-500">
            <HiPhone className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-label">Emails</div>
            <div className="stats-card-value text-info-600">
              {communicationLogs.filter(log => log.type === 'email').length}
            </div>
          </div>
          <div className="stats-card-icon bg-info-500">
            <HiMail className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-label">In-Person</div>
            <div className="stats-card-value text-warning-600">
              {communicationLogs.filter(log => log.type === 'in-person').length}
            </div>
          </div>
          <div className="stats-card-icon bg-warning-500">
            <HiUser className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <HiSearch className="input-icon" />
            <input
              type="text"
              placeholder="Search communications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field-with-icon"
            />
          </div>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="select-field"
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
      <div className="table-container">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Loading communication logs...</p>
          </div>
        ) : (
            <div className="space-y-4">
              {filteredLogs.map(log => (
                <div key={log.id} className="card hover-lift">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${getTypeColor(log.type)}`}>
                        {getTypeIcon(log.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-secondary-900">{log.subject || 'No Subject'}</h3>
                          <div className="flex items-center gap-1">
                            {log.direction === 'inbound' ? (
                              <HiArrowDown className="w-4 h-4 text-success-600" />
                            ) : (
                              <HiArrowUp className="w-4 h-4 text-info-600" />
                            )}
                            <span className="text-xs text-secondary-500 capitalize">{log.direction}</span>
                          </div>
                        </div>
                        <p className="text-secondary-700 text-sm mb-2">{log.content}</p>
                        <div className="flex items-center gap-4 text-sm text-secondary-500">
                          <span>Customer: <strong>{getCustomerName(log.customerId)}</strong></span>
                          <span>Employee: <strong>{log.employeeName}</strong></span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEditLog(log)}
                        className="text-primary-600 hover:text-primary-800 transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => setDeleteLogId(log.id || (log as any)._id)}
                        className="text-error-600 hover:text-error-800 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-secondary-500 pt-2 border-t border-secondary-100">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <HiCalendar className="w-4 h-4" />
                        <span>{log.date}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedLog(log)}
                      className="text-primary-600 hover:text-primary-800 flex items-center gap-1 transition-colors"
                    >
                      <HiEye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
              
              {filteredLogs.length === 0 && (
                <div className="empty-state">
                  <HiChatAlt className="empty-state-icon" />
                  <h3 className="empty-state-title">No communication logs found</h3>
                  <p className="empty-state-description">Try adjusting your filters or log a new communication.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal for viewing details */}
      {selectedLog && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">Communication Details</h3>
              <button 
                onClick={() => setSelectedLog(null)}
                className="modal-close"
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Customer</label>
                  <p className="form-value">{getCustomerName(selectedLog.customerId)}</p>
                </div>
                <div>
                  <label className="form-label">Employee</label>
                  <p className="form-value">{selectedLog.employeeName}</p>
                </div>
                <div>
                  <label className="form-label">Date</label>
                  <p className="form-value">{selectedLog.date}</p>
                </div>
                <div>
                  <label className="form-label">Type</label>
                  <div className="flex items-center gap-2 mt-1">
                    {getTypeIcon(selectedLog.type)}
                    <span className="text-sm text-secondary-900 capitalize">{selectedLog.type}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="form-label">Subject</label>
                <p className="form-value">{selectedLog.subject || 'No Subject'}</p>
              </div>
              
              <div>
                <label className="form-label">Content</label>
                <p className="form-value bg-secondary-50 p-3 rounded">{selectedLog.content}</p>
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
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">Confirm Delete</h3>
            </div>
            <div className="modal-content">
              <p className="text-secondary-600 mb-6">Are you sure you want to delete this communication log? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setDeleteLogId(null)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteLog(deleteLogId)}
                  className="btn-error"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
