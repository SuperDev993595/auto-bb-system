import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../../redux'
import { fetchCustomers, fetchCustomerStats, deleteCustomer } from '../../redux/actions/customers'
import { Grid, List, Plus, Search, Car, Calendar, Edit, Trash2, Car as CarSide, Users, TrendingUp, Filter, RefreshCw, Eye, Phone, Mail, MapPin } from '../../utils/icons'
import PageTitle from '../../components/Shared/PageTitle'
import { toast } from 'react-hot-toast'

function CustomerList() {
  const dispatch = useAppDispatch();
  const { list: customers, loading, pagination, stats } = useAppSelector((state) => state.customers);
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    city: '',
    state: '',
    sortBy: 'createdAt',
    sortOrder: 'desc' as 'asc' | 'desc'
  })

  // Load customers on component mount
  useEffect(() => {
    dispatch(fetchCustomers({ page: currentPage, limit: 8, ...filters }));
    dispatch(fetchCustomerStats());
  }, [dispatch, currentPage, filters]);

  // Handle search
  const handleSearch = () => {
    dispatch(fetchCustomers({ 
      page: 1, 
      limit: 8, 
      search: searchTerm,
      ...filters 
    }));
    setCurrentPage(1);
  };

  // Handle filter changes
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle delete customer
  const handleDeleteCustomer = async (customerId: string, customerName: string) => {
    if (window.confirm(`Are you sure you want to delete ${customerName}? This action cannot be undone.`)) {
      try {
        await dispatch(deleteCustomer(customerId)).unwrap();
        toast.success('Customer deleted successfully');
        // Refresh the list
        dispatch(fetchCustomers({ page: currentPage, limit: 8, ...filters }));
        dispatch(fetchCustomerStats());
      } catch (error) {
        toast.error('Failed to delete customer');
      }
    }
  };

  // Helper function to format address
  const formatAddress = (address: any) => {
    if (!address) return 'N/A';
    
    const parts = [];
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.zipCode) parts.push(address.zipCode);
    
    return parts.length > 0 ? parts.join(', ') : 'N/A';
  };

  // Filter customers based on search (client-side for immediate feedback)
  const filteredCustomers = (customers && Array.isArray(customers) ? customers : []).filter(customer => {
    const searchLower = searchTerm.toLowerCase();
    const addressText = formatAddress(customer.address).toLowerCase();
    
    return (
      (customer.businessName?.toLowerCase() || customer.name?.toLowerCase() || '').includes(searchLower) ||
      (customer.phone || '').includes(searchTerm) ||
      (customer.email?.toLowerCase() || '').includes(searchLower) ||
      addressText.includes(searchLower)
    );
  })

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Customer Management</h1>
            <p className="text-gray-600">Manage and organize your customer database</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
              className="p-3 bg-white text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors"
              title="Toggle View"
            >
              {view === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
            </button>
            <button
              onClick={() => {
                dispatch(fetchCustomers({ page: currentPage, limit: 8, ...filters }));
                dispatch(fetchCustomerStats());
              }}
              className="p-3 bg-white text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <Link
              to="/admin/dashboard/customers/new"
              className="p-3 bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-colors"
              title="New Customer"
            >
              <Plus className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Customers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalCustomers || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Active Customers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Customers</p>
              <p className="text-2xl font-bold text-green-600">{stats?.activeCustomers || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* New This Month */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New This Month</p>
              <p className="text-2xl font-bold text-purple-600">{stats?.customersThisMonth || 0}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Total Vehicles */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
              <p className="text-2xl font-bold text-orange-600">{stats?.totalVehicles || 0}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Unified Search and Filters */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-600" />
              <h3 className="text-base font-semibold text-gray-800">Search & Filters</h3>
            </div>

          </div>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search customers by name, email, phone, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="form-input pl-12 pr-4"
            />
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="form-label">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="form-input"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="prospect">Prospect</option>
              </select>
            </div>

            <div>
              <label className="form-label">City</label>
              <input
                type="text"
                placeholder="Filter by city"
                value={filters.city}
                onChange={(e) => handleFilterChange('city', e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">State</label>
              <input
                type="text"
                placeholder="Filter by state"
                value={filters.state}
                onChange={(e) => handleFilterChange('state', e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="form-input"
              >
                <option value="createdAt">Date Created</option>
                <option value="name">Name</option>
                <option value="businessName">Business Name</option>
                <option value="email">Email</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''} found
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilters({
                    status: '',
                    city: '',
                    state: '',
                    sortBy: 'createdAt',
                    sortOrder: 'desc'
                  });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 text-sm font-medium"
              >
                Clear All
              </button>
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Grid/List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {view === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCustomers.map((customer) => (
                <div key={customer._id} className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 mb-1">{customer.name}</h3>
                        {customer.businessName && (
                          <p className="text-sm text-gray-600">{customer.businessName}</p>
                        )}
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link
                          to={`/admin/dashboard/customers/${customer._id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          to={`/admin/dashboard/customers/${customer._id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                          title="Edit Customer"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteCustomer(customer._id || customer.id || '', customer.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                      <Mail className="w-4 h-4 text-blue-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-medium">Email</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">{customer.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                      <Phone className="w-4 h-4 text-blue-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-medium">Phone</p>
                        <p className="text-sm font-semibold text-gray-800">{customer.phone || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                      <MapPin className="w-4 h-4 text-blue-500" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 font-medium">Address</p>
                        <p className="text-sm font-semibold text-gray-800 truncate">{formatAddress(customer.address)}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        customer.status === 'active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        customer.status === 'inactive' ? 'bg-red-100 text-red-800 border border-red-200' :
                        'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {customer.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {customer.vehicles?.length || 0} vehicles
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Address</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCustomers.map((customer) => (
                      <tr key={customer._id} className="hover:bg-gray-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{customer.name}</div>
                            {customer.businessName && (
                              <div className="text-sm text-gray-500">{customer.businessName}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{customer.email}</div>
                          <div className="text-sm text-gray-500">{customer.phone || 'No phone'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{formatAddress(customer.address)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                            customer.status === 'active' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                            customer.status === 'inactive' ? 'bg-red-100 text-red-800 border border-red-200' :
                            'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}>
                            {customer.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <Link
                              to={`/admin/dashboard/customers/${customer._id || customer.id || ''}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              to={`/admin/dashboard/customers/${customer._id || customer.id || ''}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              title="Edit Customer"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteCustomer(customer._id || customer.id || '', customer.name)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                              title="Delete Customer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center">
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-6 py-3 rounded-xl transition-all duration-200 shadow-lg ${
                      page === currentPage
                        ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white'
                        : 'text-gray-700 bg-white border border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}


    </div>
  )
}

export default CustomerList
