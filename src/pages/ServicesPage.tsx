import { useState, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "../redux"
import { ServiceCatalogItem, WorkOrder, Technician } from "../services/services"
import PageTitle from "../components/Shared/PageTitle"
import {
  fetchServiceCatalog,
  fetchWorkOrders,
  fetchTechnicians,
  fetchServiceCatalogStats,
  fetchWorkOrderStats,
  fetchTechnicianStats,
  fetchServiceCategories,
  fetchSpecializations
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

  const handleDeleteService = (service: ServiceCatalogItem) => {
    setSelectedService(service)
    setShowDeleteModal(true)
  }

  const handleServiceSuccess = () => {
    dispatch(fetchServiceCatalog({}))
    dispatch(fetchServiceCatalogStats())
  }

  // Work Order modal handlers
  const handleAddWorkOrder = () => {
    setShowAddWorkOrderModal(true)
  }

  const handleEditWorkOrder = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder)
    setShowEditWorkOrderModal(true)
  }

  const handleDeleteWorkOrder = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder)
    setShowDeleteWorkOrderModal(true)
  }

  const handleWorkOrderSuccess = () => {
    dispatch(fetchWorkOrders({}))
    dispatch(fetchWorkOrderStats({}))
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
        return 'bg-emerald-100 text-emerald-800 border-emerald-200'
      case 'pending':
      case 'scheduled':
        return 'bg-amber-100 text-amber-800 border-amber-200'
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'cancelled':
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getTabButtonStyle = (tab: TabType) => {
    return activeTab === tab 
      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
      : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold mb-1">Service Management</h1>
            <p className="text-emerald-100 text-base">Manage services, work orders, and technicians</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-medium transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button 
              onClick={() => {
                if (activeTab === 'catalog') handleAddService()
                else if (activeTab === 'workorders') handleAddWorkOrder()
                else if (activeTab === 'technicians') setShowAddTechnicianModal(true)
              }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl border border-white/30 hover:border-white/50"
            >
              <Plus className="w-5 h-5" />
              {activeTab === 'catalog' ? 'Add Service' : 
               activeTab === 'workorders' ? 'Add Work Order' : 'Add Technician'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{totalServices}</p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600">Active Services</p>
            <p className="text-lg font-semibold text-emerald-600">{activeServices}</p>
          </div>
        </div>

        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{totalWorkOrders}</p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600">Pending Orders</p>
            <p className="text-lg font-semibold text-blue-600">{pendingWorkOrders}</p>
          </div>
        </div>

        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{totalTechnicians}</p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600">Active Technicians</p>
            <p className="text-lg font-semibold text-purple-600">{activeTechnicians}</p>
          </div>
        </div>

        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${catalogStats?.totalRevenue?.toLocaleString() || '0'}
                </p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600">This Month</p>
            <p className="text-lg font-semibold text-amber-600">
              +{catalogStats?.monthlyGrowth || 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-gray-600" />
              <h3 className="text-base font-semibold text-gray-800">Service Management</h3>
            </div>
            <div className="flex items-center gap-2">
              {/* View Toggle */}
              <div className="flex bg-white rounded-lg p-1 shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-md transition-all duration-200 ${
                    viewMode === 'grid' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                  title="Grid View"
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-md transition-all duration-200 ${
                    viewMode === 'list' 
                      ? 'bg-blue-100 text-blue-600' 
                      : 'text-gray-600 hover:text-gray-900'
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
          <div className="flex space-x-2 mb-6">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 border ${getTabButtonStyle('catalog')}`}
            >
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4" />
                Service Catalog
              </div>
            </button>
            <button
              onClick={() => setActiveTab('workorders')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 border ${getTabButtonStyle('workorders')}`}
            >
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                Work Orders
              </div>
            </button>
            <button
              onClick={() => setActiveTab('technicians')}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 border ${getTabButtonStyle('technicians')}`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Technicians
              </div>
            </button>
          </div>

          {/* Search and Filters */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder={`Search ${activeTab}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                />
              </div>
              
              {activeTab === 'catalog' && (
                <div className="lg:w-64">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
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
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
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
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {activeTab === 'catalog' && (
              <div className="p-6">
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
                      <h3 className="text-lg font-semibold text-gray-800">
                        {filteredCatalog.length} service{filteredCatalog.length !== 1 ? 's' : ''} found
                      </h3>
                    </div>
                    
                    {viewMode === 'grid' ? (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCatalog.map((service) => (
                          <div key={service._id} className="group bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 overflow-hidden">
                            <div className="p-6">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  <h4 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h4>
                                  <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                                  <div className="flex items-center gap-2 mb-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(service.isActive ? 'active' : 'inactive')}`}>
                                      {service.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                      {service.category}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="w-4 h-4" />
                                      <span>${service.price}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Clock className="w-4 h-4" />
                                      <span>{service.duration} min</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                                <button
                                  onClick={() => handleEditService(service)}
                                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                  title="Edit Service"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteService(service)}
                                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                  title="Delete Service"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredCatalog.map((service) => (
                          <div key={service._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                                <Wrench className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-900">{service.name}</h4>
                                <p className="text-sm text-gray-600">{service.category}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-sm font-medium text-gray-900">${service.price}</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(service.isActive ? 'active' : 'inactive')}`}>
                                {service.isActive ? 'Active' : 'Inactive'}
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleEditService(service)}
                                  className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteService(service)}
                                  className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Wrench className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No services found</h3>
                    <p className="text-gray-500 mb-4">Get started by adding your first service</p>
                    <button
                      onClick={handleAddService}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-semibold transition-all duration-200"
                    >
                      <Plus className="w-5 h-5" />
                      Add Service
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'workorders' && (
              <div className="p-6">
                {workOrdersLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                      <p className="text-gray-600">Loading work orders...</p>
                    </div>
                  </div>
                ) : filteredWorkOrders.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {filteredWorkOrders.length} work order{filteredWorkOrders.length !== 1 ? 's' : ''} found
                      </h3>
                    </div>
                    
                    <div className="space-y-3">
                      {filteredWorkOrders.map((workOrder) => (
                        <div key={workOrder._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                              <ClipboardList className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{workOrder.title}</h4>
                              <p className="text-sm text-gray-600">{workOrder.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(workOrder.status)}`}>
                              {workOrder.status}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEditWorkOrder(workOrder)}
                                className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteWorkOrder(workOrder)}
                                className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ClipboardList className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No work orders found</h3>
                    <p className="text-gray-500 mb-4">Get started by creating your first work order</p>
                    <button
                      onClick={handleAddWorkOrder}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-200"
                    >
                      <Plus className="w-5 h-5" />
                      Add Work Order
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'technicians' && (
              <div className="p-6">
                {techniciansLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                      <p className="text-gray-600">Loading technicians...</p>
                    </div>
                  </div>
                ) : (Array.isArray(technicians) ? technicians : []).length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {(Array.isArray(technicians) ? technicians : []).length} technician{(Array.isArray(technicians) ? technicians : []).length !== 1 ? 's' : ''} found
                      </h3>
                    </div>
                    
                    <div className="space-y-3">
                      {(Array.isArray(technicians) ? technicians : []).map((technician) => (
                        <div key={technician._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">{technician.name}</h4>
                              <p className="text-sm text-gray-600">{technician.specialization}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(technician.isActive ? 'active' : 'inactive')}`}>
                              {technician.isActive ? 'Active' : 'Inactive'}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedTechnician(technician)
                                  setShowEditTechnicianModal(true)
                                }}
                                className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedTechnician(technician)
                                  setShowDeleteTechnicianModal(true)
                                }}
                                className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No technicians found</h3>
                    <p className="text-gray-500 mb-4">Get started by adding your first technician</p>
                    <button
                      onClick={() => setShowAddTechnicianModal(true)}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-semibold transition-all duration-200"
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
      {showAddModal && (
        <AddServiceModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleServiceSuccess}
        />
      )}

      {showEditModal && selectedService && (
        <EditServiceModal
          service={selectedService}
          onClose={() => {
            setShowEditModal(false)
            setSelectedService(null)
          }}
          onSuccess={handleServiceSuccess}
        />
      )}

      {showDeleteModal && selectedService && (
        <DeleteServiceModal
          service={selectedService}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedService(null)
          }}
          onSuccess={handleServiceSuccess}
        />
      )}

      {showAddWorkOrderModal && (
        <AddWorkOrderModal
          onClose={() => setShowAddWorkOrderModal(false)}
          onSuccess={handleWorkOrderSuccess}
        />
      )}

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

      {showDeleteWorkOrderModal && selectedWorkOrder && (
        <DeleteWorkOrderModal
          workOrder={selectedWorkOrder}
          onClose={() => {
            setShowDeleteWorkOrderModal(false)
            setSelectedWorkOrder(null)
          }}
          onSuccess={handleWorkOrderSuccess}
        />
      )}

      {showAddTechnicianModal && (
        <AddTechnicianModal
          onClose={() => setShowAddTechnicianModal(false)}
          onSuccess={handleTechnicianSuccess}
        />
      )}

      {showEditTechnicianModal && selectedTechnician && (
        <EditTechnicianModal
          technician={selectedTechnician}
          onClose={() => {
            setShowEditTechnicianModal(false)
            setSelectedTechnician(null)
          }}
          onSuccess={handleTechnicianSuccess}
        />
      )}

      {showDeleteTechnicianModal && selectedTechnician && (
        <DeleteTechnicianModal
          technician={selectedTechnician}
          onClose={() => {
            setShowDeleteTechnicianModal(false)
            setSelectedTechnician(null)
          }}
          onSuccess={handleTechnicianSuccess}
        />
      )}
    </div>
  )
}
