import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../redux'
import { fetchCommunicationLogs, createCommunicationLog, updateCommunicationLog, deleteCommunicationLog, fetchCommunicationStats } from '../redux/actions/communicationLogs'
import { fetchCustomers } from '../redux/actions/customers'
import PageTitle from '../components/Shared/PageTitle'
import CreateCommunicationLogModal from '../components/CommunicationLogs/CreateCommunicationLogModal'
import EditCommunicationLogModal from '../components/CommunicationLogs/EditCommunicationLogModal'
import DeleteCommunicationLogModal from '../components/CommunicationLogs/DeleteCommunicationLogModal';
import ViewCommunicationLogModal from '../components/CommunicationLogs/ViewCommunicationLogModal';
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
    
    // Extract customerId as string - handle both object and string cases
    let customerId: string
    if (typeof editingLog.customerId === 'object' && editingLog.customerId !== null) {
      customerId = (editingLog.customerId as any)._id || (editingLog.customerId as any).id
    } else {
      customerId = editingLog.customerId as string
    }
    
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
    
    // Extract customerId as string - handle both object and string cases
    let customerId: string
    if (typeof log.customerId === 'object' && log.customerId !== null) {
      customerId = (log.customerId as any)._id || (log.customerId as any).id
    } else {
      customerId = log.customerId as string
    }
    
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
      <div className="min-h-screen bg-secondary-50 p-6 space-y-8">
        {/* Page Header */}
        <div className="min-h-32 flex flex-col lg:flex-row justify-between items-start lg:items-center p-6">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold text-secondary-900 mb-2">Customer Communication Logs</h1>
            <p className="text-secondary-600">Track and manage all customer interactions</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <HiPlus className="w-4 h-4" />
              Log Communication
            </button>
          </div>
        </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Contacts</p>
              <p className="text-2xl font-bold text-gray-900">{communicationLogs.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <HiChatAlt className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Phone Calls</p>
              <p className="text-2xl font-bold text-green-600">
                {communicationLogs.filter(log => log.type === 'phone').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <HiPhone className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Emails</p>
              <p className="text-2xl font-bold text-purple-600">
                {communicationLogs.filter(log => log.type === 'email').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <HiMail className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In-Person</p>
              <p className="text-2xl font-bold text-orange-600">
                {communicationLogs.filter(log => log.type === 'in-person').length}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <HiUser className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 relative">
              <HiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search communications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-input w-full pl-12 pr-4 py-3"
              />
            </div>
            
            <div className="relative">
              <HiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="form-input pl-10 pr-8 py-3 min-w-[160px]"
              >
                <option value="all">All Types</option>
                <option value="phone">Phone</option>
                <option value="email">Email</option>
                <option value="in-person">In-Person</option>
                <option value="sms">SMS</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Communication Logs */}
      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600 border-2 border-primary-600 border-t-transparent rounded-full"></div>
              <p className="text-secondary-600">Loading communication logs...</p>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-header-cell">Type</th>
                  <th className="table-header-cell">Subject</th>
                  <th className="table-header-cell">Customer</th>
                  <th className="table-header-cell">Employee</th>
                  <th className="table-header-cell">Date</th>
                  <th className="table-header-cell">Direction</th>
                  <th className="table-header-cell">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${getTypeColor(log.type)}`}>
                          {getTypeIcon(log.type)}
                        </div>
                        <span className="text-sm font-medium text-secondary-900 capitalize">{log.type}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div>
                        <div className="font-medium text-secondary-900">{log.subject || 'No Subject'}</div>
                        <div className="text-sm text-secondary-600 truncate max-w-xs">{log.content}</div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="font-medium text-secondary-900">{getCustomerName(log.customerId)}</div>
                    </td>
                    <td className="table-cell">
                      <div className="font-medium text-secondary-900">{log.employeeName}</div>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm text-secondary-900">{log.date}</div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        {log.direction === 'inbound' ? (
                          <HiArrowDown className="w-4 h-4 text-success-600" />
                        ) : (
                          <HiArrowUp className="w-4 h-6 text-info-600" />
                        )}
                        <span className="text-sm text-secondary-700 capitalize">{log.direction}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setSelectedLog(log)}
                          className="p-2 text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-lg transition-all duration-200"
                          title="View Details"
                        >
                          <HiEye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditLog(log)}
                          className="p-2 text-secondary-600 hover:text-secondary-800 hover:bg-secondary-50 rounded-lg transition-all duration-200"
                          title="Edit"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => setDeleteLogId(log.id || (log as any)._id)}
                          className="p-2 text-error-600 hover:text-error-800 hover:bg-error-50 rounded-lg transition-all duration-200"
                          title="Delete"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredLogs.length === 0 && (
              <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mb-4">
                  <HiChatAlt className="w-8 h-8 text-secondary-400" />
                </div>
                <h3 className="text-lg font-semibold text-secondary-900 mb-2">No communication logs found</h3>
                <p className="text-secondary-600">Try adjusting your filters or log a new communication.</p>
              </div>
            )}
          </div>
        )}
      </div>
      </div>

      {/* Modal for viewing details */}
      {selectedLog && (
        <ViewCommunicationLogModal
          isOpen={!!selectedLog}
          onClose={() => setSelectedLog(null)}
          log={selectedLog}
          getCustomerName={getCustomerName}
          getTypeIcon={getTypeIcon}
        />
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
        <DeleteCommunicationLogModal
          isOpen={!!deleteLogId}
          onClose={() => setDeleteLogId(null)}
          onConfirm={() => handleDeleteLog(deleteLogId)}
          isLoading={loading}
        />
      )}
    </>
  )
}
