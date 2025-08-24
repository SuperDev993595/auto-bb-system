import { useState, useEffect } from 'react'
import { Users, Search, Filter, Plus, BarChart3, Tag, Bell, FileText, Settings, Activity } from '../../utils/icons'
import CustomerList from '../../pages/customers/CustomerList'
import CustomerDetail from '../../pages/customers/CustomerDetail'
import CustomerAnalytics from './CustomerAnalytics'
import CustomerSegmentation from './CustomerSegmentation'
import CustomerWorkflows from './CustomerWorkflows'
import CustomerReporting from './CustomerReporting'
import CustomerPerformanceOptimizer from './CustomerPerformanceOptimizer'
import CustomerErrorBoundary from './CustomerErrorBoundary'
import AdvancedSearchFilters from './AdvancedSearchFilters'
import EnhancedCustomerForm from './EnhancedCustomerForm'

interface CustomerManagementStats {
  totalCustomers: number
  activeCustomers: number
  newCustomersThisMonth: number
  totalRevenue: number
  averageCustomerValue: number
  customerSatisfaction: number
}

interface Props {
  initialView?: 'list' | 'detail' | 'analytics' | 'segmentation' | 'workflows' | 'reporting' | 'performance'
}

export default function CustomerManagementDashboard({ initialView = 'list' }: Props) {
  const [activeView, setActiveView] = useState(initialView)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({})
  const [stats, setStats] = useState<CustomerManagementStats>({
    totalCustomers: 0,
    activeCustomers: 0,
    newCustomersThisMonth: 0,
    totalRevenue: 0,
    averageCustomerValue: 0,
    customerSatisfaction: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setStats({
      totalCustomers: 1247,
      activeCustomers: 892,
      newCustomersThisMonth: 45,
      totalRevenue: 1250000,
      averageCustomerValue: 1004,
      customerSatisfaction: 4.6
    })
    setLoading(false)
  }

  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomerId(customerId)
    setActiveView('detail')
  }

  const handleViewChange = (view: string) => {
    setActiveView(view as any)
    if (view !== 'detail') {
      setSelectedCustomerId(null)
    }
  }

  const renderView = () => {
    switch (activeView) {
      case 'list':
        return (
          <CustomerList 
            onCustomerSelect={handleCustomerSelect}
            searchQuery={searchQuery}
            filters={filters}
          />
        )
      case 'detail':
        return selectedCustomerId ? (
          <CustomerDetail customerId={selectedCustomerId} />
        ) : (
          <div className="text-center py-20">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Customer Selected</h3>
            <p className="text-gray-500">Please select a customer from the list to view details</p>
          </div>
        )
      case 'analytics':
        return <CustomerAnalytics />
      case 'segmentation':
        return <CustomerSegmentation />
      case 'workflows':
        return <CustomerWorkflows />
      case 'reporting':
        return <CustomerReporting />
      case 'performance':
        return <CustomerPerformanceOptimizer />
      default:
        return <CustomerList onCustomerSelect={handleCustomerSelect} />
    }
  }

  const getViewIcon = (view: string) => {
    switch (view) {
      case 'list': return <Users className="w-4 h-4" />
      case 'analytics': return <BarChart3 className="w-4 h-4" />
      case 'segmentation': return <Tag className="w-4 h-4" />
      case 'workflows': return <Bell className="w-4 h-4" />
      case 'reporting': return <FileText className="w-4 h-4" />
      case 'performance': return <Activity className="w-4 h-4" />
      default: return <Users className="w-4 h-4" />
    }
  }

  const getViewLabel = (view: string) => {
    switch (view) {
      case 'list': return 'Customer List'
      case 'detail': return 'Customer Detail'
      case 'analytics': return 'Analytics'
      case 'segmentation': return 'Segmentation'
      case 'workflows': return 'Workflows'
      case 'reporting': return 'Reporting'
      case 'performance': return 'Performance'
      default: return 'Customer List'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <CustomerErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search customers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200">
                  <Plus className="w-4 h-4" />
                  Add Customer
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.totalCustomers.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Total Customers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.activeCustomers.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Active Customers</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{stats.newCustomersThisMonth}</p>
                <p className="text-sm text-gray-600">New This Month</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">${(stats.totalRevenue / 1000).toFixed(0)}k</p>
                <p className="text-sm text-gray-600">Total Revenue</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">${stats.averageCustomerValue.toFixed(0)}</p>
                <p className="text-sm text-gray-600">Avg Customer Value</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-pink-600">{stats.customerSatisfaction}</p>
                <p className="text-sm text-gray-600">Satisfaction Score</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              {(['list', 'analytics', 'segmentation', 'workflows', 'reporting', 'performance'] as const).map((view) => (
                <button
                  key={view}
                  onClick={() => handleViewChange(view)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                    activeView === view
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {getViewIcon(view)}
                    {getViewLabel(view)}
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {renderView()}
        </div>

        {/* Quick Actions Floating Button */}
        <div className="fixed bottom-8 right-8">
          <div className="relative group">
            <button className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center">
              <Plus className="w-6 h-6" />
            </button>
            
            {/* Quick Actions Menu */}
            <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
              <div className="space-y-1">
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Add Customer
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Create Segment
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2">
                  <Bell className="w-4 h-4" />
                  New Workflow
                </button>
                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CustomerErrorBoundary>
  )
}
