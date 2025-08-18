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
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiClock,
  HiUser,
  HiCurrencyDollar,
  HiSearch,
  HiFilter,
  HiEye,
  HiCog,
  HiClipboardList,
  HiUsers,
  HiExclamation,
  HiCheckCircle,
  HiXCircle
} from "react-icons/hi"

type TabType = 'catalog' | 'workorders' | 'technicians'

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('catalog')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

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
    specializations
  } = useAppSelector(state => state.services)
  const dispatch = useAppDispatch()

  // Load data on component mount
  useEffect(() => {
    dispatch(fetchServiceCatalog({}))
    dispatch(fetchWorkOrders({}))
    dispatch(fetchTechnicians({}))
    dispatch(fetchServiceCatalogStats())
    dispatch(fetchWorkOrderStats({}))
    dispatch(fetchTechnicianStats())
    dispatch(fetchServiceCategories())
    dispatch(fetchSpecializations())
  }, [dispatch])

  // Filter service catalog
  const filteredCatalog = (catalog || []).filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (service.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || service.category === categoryFilter
    return matchesSearch && matchesCategory && service.isActive
  })

  // Filter work orders
  const filteredWorkOrders = (workOrders || []).filter(order => {
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

  // Statistics calculations
  const totalServices = catalog?.length || 0
  const activeServices = catalog?.filter(s => s.isActive).length || 0
  const totalWorkOrders = workOrders?.length || 0
  const completedWorkOrders = workOrders?.filter(w => w.status === 'completed').length || 0
  const totalTechnicians = technicians?.length || 0
  const activeTechnicians = technicians?.filter(t => t.isActive).length || 0

  const renderStatistics = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {/* Service Catalog Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Service Catalog</p>
            <p className="text-2xl font-bold text-gray-900">{totalServices}</p>
            <p className="text-sm text-green-600">{activeServices} active</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <HiCog className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Work Orders Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Work Orders</p>
            <p className="text-2xl font-bold text-gray-900">{totalWorkOrders}</p>
            <p className="text-sm text-green-600">{completedWorkOrders} completed</p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <HiClipboardList className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Technicians Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Technicians</p>
            <p className="text-2xl font-bold text-gray-900">{totalTechnicians}</p>
            <p className="text-sm text-green-600">{activeTechnicians} active</p>
          </div>
          <div className="p-3 bg-purple-100 rounded-full">
            <HiUsers className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>
    </div>
  )

  const renderServiceCatalog = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Service Catalog</h2>
          <p className="text-gray-600">Manage your service offerings and pricing</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <HiPlus className="w-4 h-4" />
          Add Service
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <HiSearch className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="all">All Categories</option>
            {safeAvailableCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Service Grid */}
      {catalogLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredCatalog.length === 0 ? (
        <div className="text-center py-12">
          <HiExclamation className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || categoryFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by adding your first service'
            }
          </p>
          {!searchTerm && categoryFilter === 'all' && (
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Add First Service
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCatalog.map(service => (
          <div key={service._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{service.name}</h3>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                  {service.category}
                </span>
              </div>
              <div className="flex gap-2">
                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                  <HiPencil className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                  <HiTrash className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">{service.description}</p>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-500">
                  <HiClock className="w-4 h-4" />
                  Duration
                </span>
                <span className="font-medium">{service.estimatedDuration} min</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-gray-500">
                  <HiCurrencyDollar className="w-4 h-4" />
                  Labor Rate
                </span>
                <span className="font-medium">${service.laborRate}/hr</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Parts</span>
                <span className="font-medium">{(service.parts || []).length} items</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-800">
                  ${((service.estimatedDuration / 60) * service.laborRate + 
                    (service.parts || []).reduce((sum, part) => sum + part.totalPrice, 0)).toFixed(2)}
                </span>
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm transition-colors">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  )

  const renderWorkOrders = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Work Orders</h2>
          <p className="text-gray-600">Track and manage ongoing service work</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <HiPlus className="w-4 h-4" />
          Create Work Order
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-4">
          <HiFilter className="w-5 h-5 text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
                                            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>
      </div>

      {/* Work Orders Table */}
      {workOrdersLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredWorkOrders.length === 0 ? (
        <div className="text-center py-12">
          <HiClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No work orders found</h3>
          <p className="text-gray-600 mb-4">
            {statusFilter !== 'all' 
              ? 'No work orders match the selected status'
              : 'Get started by creating your first work order'
            }
          </p>
          {statusFilter === 'all' && (
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
              Create First Work Order
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Work Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Technician
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredWorkOrders.map(order => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">#{order._id}</div>
                        <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.customer?.name || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.vehicle?.make} {order.vehicle?.model}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.technician?.name || 'Unassigned'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'completed' ? 'bg-green-100 text-green-800' :
                        order.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'on_hold' ? 'bg-orange-100 text-orange-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status === 'completed' && <HiCheckCircle className="w-3 h-3 mr-1" />}
                        {order.status === 'cancelled' && <HiXCircle className="w-3 h-3 mr-1" />}
                        {order.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">${order.totalCost.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3 transition-colors">
                        <HiEye className="w-4 h-4" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 transition-colors">
                        <HiPencil className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )

  const renderTechnicians = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Technicians</h2>
          <p className="text-gray-600">Manage your service technicians</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <HiPlus className="w-4 h-4" />
          Add Technician
        </button>
      </div>

      {/* Technicians Grid */}
      {techniciansLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (technicians || []).filter(tech => tech.isActive).length === 0 ? (
        <div className="text-center py-12">
          <HiUsers className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No technicians found</h3>
          <p className="text-gray-600 mb-4">Get started by adding your first technician</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            Add First Technician
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(technicians || []).filter(tech => tech.isActive).map(technician => (
            <div key={technician._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <HiUser className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{technician.name}</h3>
                    <p className="text-gray-600 text-sm">{technician.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                    <HiPencil className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Phone</span>
                  <span className="font-medium">{technician.phone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Hourly Rate</span>
                  <span className="font-medium">${technician.hourlyRate}/hr</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Specializations</span>
                  <span className="font-medium">{technician.specialization.length} areas</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-wrap gap-1">
                  {technician.specialization.slice(0, 3).map((spec: string) => (
                    <span key={spec} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                      {spec}
                    </span>
                  ))}
                  {technician.specialization.length > 3 && (
                    <span className="inline-block text-gray-500 text-xs px-2 py-1">
                      +{technician.specialization.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      <PageTitle title="Service Management" />

      {/* Statistics Cards */}
      {renderStatistics()}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'catalog', label: 'Service Catalog', count: (catalog || []).filter(s => s.isActive).length },
              { key: 'workorders', label: 'Work Orders', count: (workOrders || []).length },
              { key: 'technicians', label: 'Technicians', count: (technicians || []).filter(t => t.isActive).length }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'catalog' && renderServiceCatalog()}
          {activeTab === 'workorders' && renderWorkOrders()}
          {activeTab === 'technicians' && renderTechnicians()}
        </div>
      </div>
    </div>
  )
}
