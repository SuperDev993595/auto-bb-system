import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../../redux'
import { fetchCustomers, fetchCustomerStats, deleteCustomer } from '../../redux/actions/customers'
import { FaTh, FaList, FaPlus, FaSearch, FaCar, FaCalendarAlt, FaEdit, FaTrash, FaCarSide } from 'react-icons/fa'
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
    <div className="p-6 space-y-6">
      <PageTitle title="Customers" />

      {/* Header with Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filters */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          >
            <option value="createdAt">Date Created</option>
            <option value="businessName">Business Name</option>
            <option value="name">Contact Name</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded ${view === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
            >
                              <FaTh className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded ${view === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
            >
              <FaList className="w-4 h-4" />
            </button>
          </div>

          {/* Add Customer Button */}
          <Link
            to="/admin/dashboard/customers/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            Add Customer
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalCustomers || 0}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaTh className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalVehicles || 0}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaCar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.activeCustomers || 0}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <FaCalendarAlt className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Growth Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.growthRate || 0}%</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FaSearch className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Customer Grid/List */}
      {!loading && (
        <>
          {view === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCustomers.map((customer) => (
                <div key={customer._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <Link
                      to={`/admin/dashboard/customers/${customer._id}`}
                      className="flex-1"
                    >
                      <h3 className="font-semibold text-gray-900 truncate hover:text-blue-600 transition-colors">
                        {customer.businessName || customer.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        customer.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {customer.status}
                      </span>
                      <div className="flex gap-1">
                        <Link
                          to={`/admin/dashboard/customers/${customer._id}`}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="View Details"
                        >
                          <FaEdit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDeleteCustomer(customer._id, customer.name)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete Customer"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Contact:</span>
                      {customer.name || 'N/A'}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Phone:</span>
                      {customer.phone || 'N/A'}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Vehicles:</span>
                      {customer.vehicles?.length || 0}
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="font-medium">Address:</span>
                      {formatAddress(customer.address)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicles
                    </th>
                                         <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                       Address
                     </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCustomers.map((customer) => (
                    <tr key={customer._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/admin/dashboard/customers/${customer._id}`}
                          className="text-sm font-medium text-gray-900 hover:text-blue-600"
                        >
                          {customer.businessName || customer.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.name || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {customer.vehicles?.length || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatAddress(customer.address)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          customer.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {customer.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex gap-2">
                          <Link
                            to={`/admin/dashboard/customers/${customer._id}`}
                            className="text-blue-600 hover:text-blue-800"
                            title="View Details"
                          >
                            <FaEdit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDeleteCustomer(customer._id, customer.name)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete Customer"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={!pagination.hasPrevPage}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="px-3 py-2 text-sm text-gray-700">
                Page {currentPage} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
          <p className="text-gray-600 mb-6">Get started by adding your first customer.</p>
          <Link
            to="/admin/dashboard/customers/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            Add Customer
          </Link>
        </div>
      )}
    </div>
  )
}

export default CustomerList
