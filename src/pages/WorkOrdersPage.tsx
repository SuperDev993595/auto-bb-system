import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Grid3X3, 
  List, 
  Edit, 
  Trash2,
  Eye,
  Filter
} from '../utils/icons'
import { 
  fetchWorkOrders, 
  createWorkOrder, 
  updateWorkOrder, 
  deleteWorkOrder 
} from '../redux/actions/services'
import { CreateWorkOrderData, UpdateWorkOrderData } from '../services/services'
import { toast } from 'react-hot-toast'
import AddWorkOrderModal from '../components/services/AddWorkOrderModal'
import EditWorkOrderModal from '../components/services/EditWorkOrderModal'
import DeleteWorkOrderModal from '../components/services/DeleteWorkOrderModal'
import { RootState } from '../redux/store'
import { useAppDispatch, useAppSelector } from '../redux'

const WorkOrdersPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const { workOrders, workOrdersLoading: loading, workOrdersError: error } = useAppSelector((state: RootState) => state.services)
  
  // State management
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<any>(null)

  // Load work orders on component mount
  useEffect(() => {
    dispatch(fetchWorkOrders({}))
  }, [dispatch])

  // Filter work orders based on search and filters
  const filteredWorkOrders = workOrders.filter(workOrder => {
    const matchesSearch = searchTerm === '' || 
      workOrder.workOrderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workOrder.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workOrder.vehicle?.make?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workOrder.vehicle?.model?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || workOrder.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || workOrder.priority === priorityFilter
    
    return matchesSearch && matchesStatus && matchesPriority
  })

  // Handle work order creation
  const handleCreateWorkOrder = async (workOrderData: CreateWorkOrderData) => {
    try {
      await dispatch(createWorkOrder(workOrderData)).unwrap()
      setShowAddModal(false)
      toast.success('Work order created successfully')
    } catch (error) {
      console.error('Error creating work order:', error)
      toast.error('Failed to create work order')
      throw error
    }
  }

  // Handle work order update
  const handleUpdateWorkOrder = async (workOrderData: UpdateWorkOrderData) => {
    if (!selectedWorkOrder) return
    
    try {
      await dispatch(updateWorkOrder({ id: selectedWorkOrder._id, data: workOrderData })).unwrap()
      setShowEditModal(false)
      setSelectedWorkOrder(null)
      toast.success('Work order updated successfully')
    } catch (error) {
      console.error('Error updating work order:', error)
      toast.error('Failed to update work order')
      throw error
    }
  }

  // Handle work order deletion
  const handleDeleteWorkOrder = async () => {
    if (!selectedWorkOrder) return
    
    try {
      await dispatch(deleteWorkOrder(selectedWorkOrder._id)).unwrap()
      setShowDeleteModal(false)
      setSelectedWorkOrder(null)
      toast.success('Work order deleted successfully')
    } catch (error) {
      console.error('Error deleting work order:', error)
      toast.error('Failed to delete work order')
    }
  }

  // Open edit modal
  const openEditModal = (workOrder: any) => {
    setSelectedWorkOrder(workOrder)
    setShowEditModal(true)
  }

  // Open delete modal
  const openDeleteModal = (workOrder: any) => {
    setSelectedWorkOrder(workOrder)
    setShowDeleteModal(true)
  }

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'on_hold': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'urgent': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Work Orders</h1>
            <p className="text-gray-600">Manage and track work orders</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-3 bg-white text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors"
              title="Toggle View"
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid3X3 className="w-5 h-5" />}
            </button>
            {/* <button
               onClick={() => setShowAddModal(true)}
               className="btn-primary flex items-center gap-2"
               title="Add New Work Order"
             >
               <Plus className="w-5 h-5" />
               New Work Order
             </button> */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Controls Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Header Section */}
                         <div className="flex items-center gap-2">
               <ClipboardList className="w-5 h-5 text-primary-600" />
               <h3 className="text-lg font-semibold text-gray-900">Work Order Management</h3>
             </div>
            
            {/* Controls Section */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* View Toggle */}
                             <div className="flex bg-gray-100 rounded-lg p-1">
                 <button
                   onClick={() => setViewMode('grid')}
                   className={`p-1.5 rounded-md transition-all duration-200 ${
                     viewMode === 'grid' 
                       ? 'bg-primary-600 text-white' 
                       : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                   }`}
                   title="Grid View"
                 >
                   <Grid3X3 className="w-4 h-4" />
                 </button>
                 <button
                   onClick={() => setViewMode('list')}
                   className={`p-1.5 rounded-md transition-all duration-200 ${
                     viewMode === 'list' 
                       ? 'bg-primary-600 text-white' 
                       : 'text-gray-600 hover:text-gray-900 hover:bg-white'
                   }`}
                   title="List View"
                 >
                   <List className="w-4 h-4" />
                 </button>
               </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {/* Search and Filters */}
          <div className="bg-white rounded-xl mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search Bar */}
              <div className="flex-1 relative max-w-md">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Search className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder="Search work orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Filter Section */}
              <div className="flex gap-3 items-center">
                {/* Status Filter */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-8 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Priority Filter */}
                <div className="relative">
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-8 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 cursor-pointer"
                  >
                    <option value="all">All Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                {/* Clear Filters Button */}
                {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('all')
                      setPriorityFilter('all')
                    }}
                    className="px-3 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear
                  </button>
                )}
              </div>
            </div>
            
            {/* Active Filters Display */}
            {(searchTerm || statusFilter !== 'all' || priorityFilter !== 'all') && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm text-gray-500">Active filters:</span>
                  {searchTerm && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                      Search: "{searchTerm}"
                      <button
                        onClick={() => setSearchTerm('')}
                        className="ml-1 hover:text-primary-600"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {statusFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                      Status: {statusFilter}
                      <button
                        onClick={() => setStatusFilter('all')}
                        className="ml-1 hover:text-purple-600"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                  {priorityFilter !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                      Priority: {priorityFilter}
                      <button
                        onClick={() => setPriorityFilter('all')}
                        className="ml-1 hover:text-orange-600"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Work Orders List */}
          {filteredWorkOrders.length === 0 ? (
            <div className="text-center py-16">
              <ClipboardList className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">No work orders found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all' 
                  ? 'Try adjusting your search or filters to find what you\'re looking for' 
                  : 'Get started by creating your first work order to begin managing your automotive services'}
              </p>
                             {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && (
                 <button
                   onClick={() => setShowAddModal(true)}
                   className="btn-primary"
                 >
                   Create Work Order
                 </button>
               )}
            </div>
          ) : (
            <>
              {/* List View Header */}
              {viewMode === 'list' && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                      <div className="md:col-span-1">
                        <h6 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Work Order
                        </h6>
                      </div>
                      <div className="md:col-span-1">
                        <h6 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Vehicle
                        </h6>
                      </div>
                      <div className="md:col-span-1">
                        <h6 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Status & Priority
                        </h6>
                      </div>
                      <div className="md:col-span-1">
                        <h6 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Services & Cost
                        </h6>
                      </div>
                      <div className="md:col-span-1">
                        <h6 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          Dates
                        </h6>
                      </div>
                    </div>
                    <div className="ml-4 w-20">
                      <h6 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Actions
                      </h6>
                    </div>
                  </div>
                </div>
              )}

              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-3'}>
                {filteredWorkOrders.map((workOrder) => (
                <div
                  key={workOrder._id}
                  className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${
                    viewMode === 'list' ? 'p-4' : 'p-6'
                  }`}
                >
                  {viewMode === 'list' ? (
                    // List View Layout
                    <div className="flex items-center justify-between">
                      {/* Left Section - Main Info */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                        {/* Work Order Number & Customer */}
                        <div className="md:col-span-1">
                          <h6 className="font-semibold text-gray-900 text-sm">
                            {workOrder.workOrderNumber}
                          </h6>
                          <p className="text-xs text-gray-600 truncate">
                            {workOrder.customer?.name}
                          </p>
                        </div>

                        {/* Vehicle Info */}
                        <div className="md:col-span-1">
                          <p className="text-sm font-medium text-gray-900">
                            {workOrder.vehicle?.year} {workOrder.vehicle?.make} {workOrder.vehicle?.model}
                          </p>
                          {workOrder.vehicle?.licensePlate && (
                            <p className="text-xs text-gray-500">
                              {workOrder.vehicle.licensePlate}
                            </p>
                          )}
                        </div>

                        {/* Status and Priority */}
                        <div className="md:col-span-1">
                          <div className="flex flex-col gap-1">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full w-fit ${getStatusColor(workOrder.status)}`}>
                              {workOrder.status?.replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full w-fit ${getPriorityColor(workOrder.priority)}`}>
                              {workOrder.priority}
                            </span>
                          </div>
                        </div>

                        {/* Services & Cost */}
                        <div className="md:col-span-1">
                          <p className="text-sm text-gray-600">
                            {workOrder.services?.length || 0} service{workOrder.services?.length !== 1 ? 's' : ''}
                          </p>
                          <p className="text-sm font-semibold text-gray-900">
                            ${workOrder.totalCost?.toFixed(2) || '0.00'}
                          </p>
                        </div>

                        {/* Dates */}
                        <div className="md:col-span-1">
                          {workOrder.estimatedStartDate && (
                            <div className="text-xs text-gray-500">
                              <div>Start: {new Date(workOrder.estimatedStartDate).toLocaleDateString()}</div>
                              {workOrder.estimatedCompletionDate && (
                                <div>Due: {new Date(workOrder.estimatedCompletionDate).toLocaleDateString()}</div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Section - Actions */}
                      <div className="flex gap-1 ml-4">
                        <button
                          onClick={() => openEditModal(workOrder)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(workOrder)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Grid View Layout (existing)
                    <>
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h6 className="font-semibold text-gray-900 mb-1">
                            {workOrder.workOrderNumber}
                          </h6>
                          <p className="text-sm text-gray-600">
                            {workOrder.customer?.name}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEditModal(workOrder)}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeleteModal(workOrder)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Vehicle Info */}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-900">
                          {workOrder.vehicle?.year} {workOrder.vehicle?.make} {workOrder.vehicle?.model}
                        </p>
                        {workOrder.vehicle?.licensePlate && (
                          <p className="text-xs text-gray-500">
                            {workOrder.vehicle.licensePlate}
                          </p>
                        )}
                      </div>

                      {/* Status and Priority */}
                      <div className="flex gap-2 mb-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(workOrder.status)}`}>
                          {workOrder.status?.replace('_', ' ')}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(workOrder.priority)}`}>
                          {workOrder.priority}
                        </span>
                      </div>

                      {/* Services Summary */}
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-1">
                          {workOrder.services?.length || 0} service{workOrder.services?.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          Total: ${workOrder.totalCost?.toFixed(2) || '0.00'}
                        </p>
                      </div>

                      {/* Dates */}
                      {workOrder.estimatedStartDate && (
                        <div className="text-xs text-gray-500">
                          Start: {new Date(workOrder.estimatedStartDate).toLocaleDateString()}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddWorkOrderModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateWorkOrder}
      />

      {selectedWorkOrder && (
        <EditWorkOrderModal
          workOrder={selectedWorkOrder}
          onClose={() => {
            setShowEditModal(false)
            setSelectedWorkOrder(null)
          }}
          onSuccess={() => {
            setShowEditModal(false)
            setSelectedWorkOrder(null)
          }}
        />
      )}

      {selectedWorkOrder && (
        <DeleteWorkOrderModal
          workOrder={selectedWorkOrder}
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedWorkOrder(null)
          }}
          onDelete={handleDeleteWorkOrder}
        />
      )}
    </div>
  )
}

export default WorkOrdersPage
