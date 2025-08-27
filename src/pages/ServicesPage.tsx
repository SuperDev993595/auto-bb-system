import { useState, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "../redux"
import { ServiceCatalogItem, WorkOrder, Technician, CreateWorkOrderData, UpdateWorkOrderData } from "../services/services"
import PageTitle from "../components/Shared/PageTitle"
import {
  fetchServiceCatalog,
  fetchWorkOrders,
  fetchTechnicians,
  fetchServiceCatalogStats,
  fetchWorkOrderStats,
  fetchTechnicianStats,
  fetchServiceCategories,
  fetchSpecializations,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder
} from "../redux/actions/services"
import AddServiceModal from "../components/services/AddServiceModal"
import EditServiceModal from "../components/services/EditServiceModal"
import DeleteServiceModal from "../components/services/DeleteServiceModal"
import AddWorkOrderModal from "../components/services/AddWorkOrderModal"
import EditWorkOrderModal from "../components/services/EditWorkOrderModal"
import DeleteWorkOrderModal from "../components/services/DeleteWorkOrderModal"
import AddTechnicianModal from "../components/services/AddTechnicianModal"
import EditTechnicianModal from "../components/services/EditTechnicianModal"
import DeleteTechnicianModal from "../components/services/DeleteTechnicianModal"
import { 
  Plus, 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  RefreshCw, 
  Wrench, 
  Users, 
  ClipboardList,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Settings,
  Eye,
  Edit,
  Trash2,
  Loader2
} from "lucide-react"
import { toast } from "react-hot-toast"

type TabType = 'catalog' | 'workorders' | 'technicians'

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('catalog')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showInactiveTechnicians, setShowInactiveTechnicians] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedService, setSelectedService] = useState<ServiceCatalogItem | null>(null)
  
  // Work Order modal states
  const [showAddWorkOrderModal, setShowAddWorkOrderModal] = useState(false)
  const [showEditWorkOrderModal, setShowEditWorkOrderModal] = useState(false)
  const [showDeleteWorkOrderModal, setShowDeleteWorkOrderModal] = useState(false)
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null)

  // Technician modal states
  const [showAddTechnicianModal, setShowAddTechnicianModal] = useState(false)
  const [showEditTechnicianModal, setShowEditTechnicianModal] = useState(false)
  const [showDeleteTechnicianModal, setShowDeleteTechnicianModal] = useState(false)
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null)

  const { 
    catalog, 
    workOrders, 
    technicians, 
    catalogLoading, 
    workOrdersLoading, 
    techniciansLoading,
    catalogStats,
    workOrderStats,
    technicianStats,
    categories,
    specializations,
    catalogError,
    workOrdersError,
    techniciansError
  } = useAppSelector(state => state.services)

  const dispatch = useAppDispatch()

  // Load data on component mount
  useEffect(() => {
    console.log('Loading services data...')
    dispatch(fetchServiceCatalog({}))
    dispatch(fetchWorkOrders({}))
    dispatch(fetchTechnicians({}))
    dispatch(fetchServiceCatalogStats())
    dispatch(fetchWorkOrderStats({}))
    dispatch(fetchTechnicianStats())
    dispatch(fetchServiceCategories())
    dispatch(fetchSpecializations())
  }, [dispatch])

  // Filter service catalog with safety check
  const filteredCatalog = (Array.isArray(catalog) ? catalog : []).filter(service => {
    const matchesSearch = (service.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (service.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter
    return matchesSearch && matchesCategory && service.isActive
  })

  // Filter work orders with safety check
  const filteredWorkOrders = (Array.isArray(workOrders) ? workOrders : []).filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesStatus
  })

  // Use categories from API with robust safety checks
  const availableCategories = (() => {
    // First, check if categories from API is a valid array
    if (Array.isArray(categories) && categories.length > 0) {
      return categories;
    }
    
    // Fallback to extracting categories from catalog
    if (Array.isArray(catalog) && catalog.length > 0) {
      const categorySet = new Set(catalog.map(service => service.category).filter(Boolean));
      return Array.from(categorySet);
    }
    
    // Final fallback to empty array
    return [];
  })()
  
  // Final safety check to ensure availableCategories is always an array
  const safeAvailableCategories = Array.isArray(availableCategories) ? availableCategories : []

  // Modal handlers
  const handleAddService = () => {
    setShowAddModal(true)
  }

  const handleEditService = (service: ServiceCatalogItem) => {
    setSelectedService(service)
    setShowEditModal(true)
  }

  const handleDeleteServiceClick = (service: ServiceCatalogItem) => {
    setSelectedService(service)
    setShowDeleteModal(true)
  }

  const handleServiceSuccess = () => {
    dispatch(fetchServiceCatalog({}))
    dispatch(fetchServiceCatalogStats())
  }

  // Handle service creation
  const handleCreateService = async (serviceData: Partial<ServiceCatalogItem>) => {
    try {
      // This would need to be implemented with the actual service creation action
      // For now, we'll just close the modal and refresh
      setShowAddModal(false)
      handleServiceSuccess()
    } catch (error) {
      console.error('Error creating service:', error)
      throw error
    }
  }

  // Handle service update
  const handleUpdateService = async (id: string, serviceData: Partial<ServiceCatalogItem>) => {
    try {
      // This would need to be implemented with the actual service update action
      setShowEditModal(false)
      setSelectedService(null)
      handleServiceSuccess()
    } catch (error) {
      console.error('Error updating service:', error)
      throw error
    }
  }

  // Handle service deletion
  const handleDeleteService = async (id: string) => {
    try {
      // This would need to be implemented with the actual service deletion action
      setShowDeleteModal(false)
      setSelectedService(null)
      handleServiceSuccess()
    } catch (error) {
      console.error('Error deleting service:', error)
      throw error
    }
  }

  // Handle work order creation
  const handleCreateWorkOrder = async (workOrderData: Partial<WorkOrder>) => {
    try {
      // This would need to be implemented with the actual work order creation action
      setShowAddWorkOrderModal(false)
      handleWorkOrderSuccess()
    } catch (error) {
      console.error('Error creating work order:', error)
      throw error
    }
  }

  // Handle work order update
  const handleUpdateWorkOrder = async (id: string, workOrderData: Partial<WorkOrder>) => {
    try {
      // This would need to be implemented with the actual work order update action
      setShowEditWorkOrderModal(false)
      setSelectedWorkOrder(null)
      handleWorkOrderSuccess()
    } catch (error) {
      console.error('Error updating work order:', error)
      throw error
    }
  }

  // Handle work order deletion
  const handleDeleteWorkOrder = async (id: string) => {
    try {
      // This would need to be implemented with the actual work order deletion action
      setShowDeleteWorkOrderModal(false)
      setSelectedWorkOrder(null)
      handleWorkOrderSuccess()
    } catch (error) {
      console.error('Error deleting work order:', error)
      throw error
    }
  }

  // Handle technician creation
  const handleCreateTechnician = async (technicianData: Partial<Technician>) => {
    try {
      // This would need to be implemented with the actual technician creation action
      setShowAddTechnicianModal(false)
      handleTechnicianSuccess()
    } catch (error) {
      console.error('Error creating technician:', error)
      throw error
    }
  }

  // Handle technician update
  const handleUpdateTechnician = async (id: string, technicianData: Partial<Technician>) => {
    try {
      // This would need to be implemented with the actual technician update action
      setShowEditTechnicianModal(false)
      setSelectedTechnician(null)
      handleTechnicianSuccess()
    } catch (error) {
      console.error('Error updating technician:', error)
      throw error
    }
  }

  // Handle technician deletion
  const handleDeleteTechnician = async (id: string) => {
    try {
      // This would need to be implemented with the actual technician deletion action
      setShowDeleteTechnicianModal(false)
      setSelectedTechnician(null)
      handleTechnicianSuccess()
    } catch (error) {
      console.error('Error deleting technician:', error)
      throw error
    }
  }

  // Work Order modal handlers
  const handleAddWorkOrder = () => {
    setShowAddWorkOrderModal(true)
  }

  const handleEditWorkOrder = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder)
    setShowEditWorkOrderModal(true)
  }

  const handleDeleteWorkOrderClick = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder)
    setShowDeleteWorkOrderModal(true)
  }

  const handleWorkOrderSuccess = () => {
    dispatch(fetchWorkOrders({}))
    dispatch(fetchWorkOrderStats({}))
  }

  // Technician modal handlers
  const handleAddTechnician = () => {
    setShowAddTechnicianModal(true)
  }

  const handleEditTechnician = (technician: Technician) => {
    setSelectedTechnician(technician)
    setShowEditTechnicianModal(true)
  }

  const handleDeleteTechnicianClick = (technician: Technician) => {
    setSelectedTechnician(technician)
    setShowDeleteTechnicianModal(true)
  }

  const handleTechnicianSuccess = () => {
    dispatch(fetchTechnicians({}))
    dispatch(fetchTechnicianStats())
  }

  // Statistics calculations with safety checks
  const totalServices = (Array.isArray(catalog) ? catalog.length : 0)
  const activeServices = (Array.isArray(catalog) ? catalog.filter(service => service.isActive).length : 0)
  const totalWorkOrders = (Array.isArray(workOrders) ? workOrders.length : 0)
  const pendingWorkOrders = (Array.isArray(workOrders) ? workOrders.filter(order => order.status === 'pending').length : 0)
  const totalTechnicians = (Array.isArray(technicians) ? technicians.length : 0)
  const activeTechnicians = (Array.isArray(technicians) ? technicians.filter(tech => tech.isActive).length : 0)

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'completed':
        return 'status-active'
      case 'pending':
      case 'scheduled':
        return 'status-pending'
      case 'in-progress':
        return 'status-in-progress'
      case 'cancelled':
      case 'inactive':
        return 'status-inactive'
      default:
        return 'status-pending'
    }
  }



  const handleRefresh = () => {
    dispatch(fetchServiceCatalog({}))
    dispatch(fetchWorkOrders({}))
    dispatch(fetchTechnicians({}))
    dispatch(fetchServiceCatalogStats())
    dispatch(fetchWorkOrderStats({}))
    dispatch(fetchTechnicianStats())
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Service Management</h1>
            <p className="text-gray-600">Manage services, work orders, and technicians</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-3 bg-white text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors"
              title="Toggle View"
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid3X3 className="w-5 h-5" />}
            </button>
            <button
              onClick={handleRefresh}
              className="p-3 bg-white text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                if (activeTab === 'catalog') handleAddService()
                else if (activeTab === 'workorders') handleAddWorkOrder()
                else if (activeTab === 'technicians') setShowAddTechnicianModal(true)
              }}
              className="p-3 bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-colors"
              title="Add New"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Active Tab: {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </span>
            <span className="text-sm text-gray-500">
              View Mode: {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as TabType)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="catalog">Service Catalog</option>
              <option value="workorders">Work Orders</option>
              <option value="technicians">Technicians</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Services</p>
              <p className="text-2xl font-bold text-gray-900">{totalServices}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wrench className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Work Orders</p>
              <p className="text-2xl font-bold text-green-600">{totalWorkOrders}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Technicians</p>
              <p className="text-2xl font-bold text-purple-600">{totalTechnicians}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-orange-600">
                ${(catalogStats as any)?.totalRevenue?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card">
        <div className="p-6 border-b border-secondary-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-primary-600" />
              <h3 className="text-base font-semibold text-secondary-900">Service Management</h3>
            </div>
            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex bg-secondary-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-secondary-600 hover:text-secondary-900 hover:bg-white'
                  }`}
                  title="Grid View"
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-primary-600 text-white' 
                      : 'text-secondary-600 hover:text-secondary-900 hover:bg-white'
                  }`}
                  title="List View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {/* Tab Buttons */}
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'catalog' 
                  ? 'bg-primary-100 text-primary-700 border border-primary-300' 
                  : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
              }`}
            >
              <Wrench className="w-4 h-4" />
              Service Catalog
            </button>
            <button
              onClick={() => setActiveTab('workorders')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'workorders' 
                  ? 'bg-primary-100 text-primary-700 border border-primary-300' 
                  : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Work Orders
            </button>
            <button
              onClick={() => setActiveTab('technicians')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === 'technicians' 
                  ? 'bg-primary-100 text-primary-700 border border-primary-300' 
                  : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
              }`}
            >
              <Users className="w-4 h-4" />
              Technicians
            </button>
          </div>

          {/* Search and Filters */}
          <div className="bg-gradient-to-r from-secondary-50 to-secondary-100 rounded-xl p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-secondary-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input w-full pl-12 pr-4 py-3"
                />
              </div>
              
              {activeTab === 'catalog' && (
                <div className="lg:w-64">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="form-select w-full"
                  >
                    <option value="all">All Categories</option>
                    {safeAvailableCategories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              )}
              
              {activeTab === 'workorders' && (
                <div className="lg:w-64">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="form-select w-full"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="space-y-6">
            {activeTab === 'catalog' && (
              <div className="space-y-6">
                {catalogLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                      <p className="text-gray-600">Loading service catalog...</p>
                    </div>
                  </div>
                ) : filteredCatalog.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-secondary-800">
                        {filteredCatalog.length} service{filteredCatalog.length !== 1 ? 's' : ''} found
                      </h3>
                    </div>
                    
                    {viewMode === 'grid' ? (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCatalog.map((service) => (
                          <div key={service._id} className="card p-6 hover:shadow-md transition-all duration-200">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h4 className="text-lg font-semibold text-secondary-900 mb-2">{service.name}</h4>
                                <p className="text-sm text-secondary-600 mb-3">{service.description}</p>
                                <div className="flex items-center gap-2 mb-3">
                                  <span className={`status-badge ${getStatusColor(service.isActive ? 'active' : 'inactive')}`}>
                                    {service.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                    {service.category}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-sm text-secondary-600">
                                  <div className="flex items-center gap-1">
                                    <DollarSign className="w-4 h-4" />
                                    <span>${service.laborRate || 'N/A'}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{service.estimatedDuration || 'N/A'} min</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-secondary-100">
                              <button
                                onClick={() => handleEditService(service)}
                                className="btn-ghost btn-sm text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100"
                                title="Edit Service"
                              >
                                <Edit className="w-4 h-4" />
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteServiceClick(service)}
                                className="btn-ghost btn-sm text-red-500 hover:text-red-700 hover:bg-red-50"
                                title="Delete Service"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredCatalog.map((service) => (
                          <div key={service._id} className="card p-4 hover:bg-secondary-50 transition-all duration-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Wrench className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                  <h6 className="font-semibold text-secondary-900">{service.name}</h6>
                                  <p className="text-sm text-secondary-600">{service.category}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-secondary-900">${service.laborRate || 'N/A'}</span>
                                <span className={`status-badge ${getStatusColor(service.isActive ? 'active' : 'inactive')}`}>
                                  {service.isActive ? 'Active' : 'Inactive'}
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleEditService(service)}
                                    className="btn-ghost btn-sm text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100"
                                  >
                                    <Edit className="w-4 h-4" />
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeleteServiceClick(service)}
                                    className="btn-ghost btn-sm text-red-500 hover:text-red-700 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <Wrench className="w-8 h-8" />
                    </div>
                    <h3 className="empty-state-title">No services found</h3>
                    <p className="empty-state-description">Get started by adding your first service</p>
                    <button
                      onClick={handleAddService}
                      className="btn-primary"
                    >
                      <Plus className="w-5 h-5" />
                      Add Service
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'workorders' && (
              <div className="space-y-6">
                {workOrdersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                      <p className="text-secondary-600">Loading work orders...</p>
                    </div>
                  </div>
                ) : filteredWorkOrders.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-secondary-800">
                        {filteredWorkOrders.length} work order{filteredWorkOrders.length !== 1 ? 's' : ''} found
                      </h3>
                    </div>
                    
                    <div className="space-y-3">
                      {filteredWorkOrders.map((workOrder) => (
                        <div key={workOrder._id} className="card p-4 hover:bg-secondary-50 transition-all duration-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <ClipboardList className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-secondary-900">{workOrder.workOrderNumber || 'Untitled'}</h4>
                                <p className="text-sm text-secondary-600">{workOrder.notes || 'No description'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`status-badge ${getStatusColor(workOrder.status)}`}>
                                {workOrder.status}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEditWorkOrder(workOrder)}
                                  className="btn-ghost btn-sm text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100"
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteWorkOrderClick(workOrder)}
                                  className="btn-ghost btn-sm text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <ClipboardList className="w-8 h-8" />
                    </div>
                    <h6 className="empty-state-title">No work orders found</h6>
                    <p className="empty-state-description">Get started by creating your first work order</p>
                    <button
                      onClick={handleAddWorkOrder}
                      className="btn-primary"
                    >
                      <Plus className="w-5 h-5" />
                      Add Work Order
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'technicians' && (
              <div className="space-y-6">
                {techniciansLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                      <p className="text-secondary-600">Loading technicians...</p>
                    </div>
                  </div>
                ) : (Array.isArray(technicians) ? technicians : []).length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-secondary-800">
                        {(Array.isArray(technicians) ? technicians : []).length} technician{(Array.isArray(technicians) ? technicians : []).length !== 1 ? 's' : ''} found
                      </h3>
                    </div>
                    
                    <div className="space-y-3">
                      {(Array.isArray(technicians) ? technicians : []).map((technician) => (
                        <div key={technician._id} className="card p-4 hover:bg-secondary-50 transition-all duration-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Users className="w-5 h-5 text-purple-600" />
                              </div>
                              <div>
                                <h6 className="font-normal text-secondary-900">{technician.name}</h6>
                                <p className="text-sm text-secondary-600">{technician.specialization}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`status-badge ${getStatusColor(technician.isActive ? 'active' : 'inactive')}`}>
                                {technician.isActive ? 'Active' : 'Inactive'}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedTechnician(technician)
                                    setShowEditTechnicianModal(true)
                                  }}
                                  className="btn-ghost btn-sm text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100"
                                  title="Edit Technician"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedTechnician(technician)
                                    setShowDeleteTechnicianModal(true)
                                  }}
                                  className="btn-ghost btn-sm text-red-500 hover:text-red-700 hover:bg-red-50"
                                  title="Delete Technician"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="empty-state">
                    <div className="empty-state-icon">
                      <Users className="w-8 h-8" />
                    </div>
                    <h3 className="empty-state-title">No technicians found</h3>
                    <p className="empty-state-description">Get started by adding your first technician</p>
                    <button
                      onClick={handleAddTechnician}
                      className="btn-primary"
                    >
                      <Plus className="w-5 h-5" />
                      Add Technician
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddServiceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateService}
      />

      <EditServiceModal
        isOpen={showEditModal}
        service={selectedService}
        onClose={() => {
          setShowEditModal(false)
          setSelectedService(null)
        }}
        onSubmit={handleUpdateService}
      />

      <DeleteServiceModal
        isOpen={showDeleteModal}
        service={selectedService}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedService(null)
        }}
        onDelete={handleDeleteService}
      />

      <AddWorkOrderModal
        isOpen={showAddWorkOrderModal}
        onClose={() => setShowAddWorkOrderModal(false)}
        onSubmit={handleCreateWorkOrder}
      />

      {showEditWorkOrderModal && selectedWorkOrder && (
        <EditWorkOrderModal
          workOrder={selectedWorkOrder}
          onClose={() => {
            setShowEditWorkOrderModal(false)
            setSelectedWorkOrder(null)
          }}
          onSuccess={handleWorkOrderSuccess}
        />
      )}

      <DeleteWorkOrderModal
        isOpen={showDeleteWorkOrderModal}
        workOrder={selectedWorkOrder}
        onClose={() => {
          setShowDeleteWorkOrderModal(false)
          setSelectedWorkOrder(null)
        }}
        onDelete={handleDeleteWorkOrder}
      />

      <AddTechnicianModal
        isOpen={showAddTechnicianModal}
        onClose={() => setShowAddTechnicianModal(false)}
        onSubmit={handleCreateTechnician}
      />

      <EditTechnicianModal
        isOpen={showEditTechnicianModal}
        technician={selectedTechnician}
        onClose={() => {
          setShowEditTechnicianModal(false)
          setSelectedTechnician(null)
        }}
        onSubmit={handleUpdateTechnician}
      />

      <DeleteTechnicianModal
        isOpen={showDeleteTechnicianModal}
        technician={selectedTechnician}
        onClose={() => {
          setShowDeleteTechnicianModal(false)
          setSelectedTechnician(null)
        }}
        onDelete={handleDeleteTechnician}
      />
    </div>
  )
}
