import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector } from '../../redux'
import { FaThLarge, FaList, FaPlus, FaSearch, FaCar, FaCalendarAlt } from 'react-icons/fa'
import PageTitle from '../../components/Shared/PageTitle'

function CustomerList() {
  const customers = useAppSelector((state) => state.customers.list)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const itemsPerPage = 8
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage)
  const paginatedCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

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
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView('grid')}
              className={`p-2 rounded ${view === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
            >
              <FaThLarge className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded ${view === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
            >
              <FaList className="w-4 h-4" />
            </button>
          </div>

          {/* Add Customer Button */}
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
            <FaPlus className="w-4 h-4" />
            Add Customer
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FaThLarge className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">
                {customers.reduce((sum, customer) => sum + (customer.vehicles?.length || 0), 0)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FaCar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Recent Visits</p>
              <p className="text-2xl font-bold text-gray-900">
                {customers.filter(c => c.lastVisit && new Date(c.lastVisit) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <FaCalendarAlt className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Service Records</p>
              <p className="text-2xl font-bold text-gray-900">
                {customers.reduce((sum, customer) => sum + (customer.serviceHistory?.length || 0), 0)}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <div className="w-6 h-6 bg-purple-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Cards */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {filteredCustomers.length > 0 ? (
          <>
            <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6' : 'divide-y divide-gray-200'}>
              {paginatedCustomers.map((customer) => (
                <div
                  key={customer.id}
                  className={`group relative overflow-hidden bg-white border border-gray-200 rounded-lg shadow-sm
                    transition duration-200 hover:shadow-lg hover:border-blue-300 
                    ${view === 'list' ? 'p-4 hover:bg-gray-50' : 'p-6'}`}
                >
                  <div className="w-full">
                    {/* Name & Status */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                        <p className="text-sm text-gray-500">
                          Customer since {new Date(customer.dateCreated).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {customer.lastVisit && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            Recent
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Vehicle Info */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <FaCar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">
                          {customer.vehicles?.length || 0} Vehicle{(customer.vehicles?.length || 0) !== 1 ? 's' : ''}
                        </span>
                      </div>
                      {customer.vehicles && customer.vehicles.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {customer.vehicles.slice(0, 2).map((vehicle) => (
                            <span key={vehicle.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {vehicle.year} {vehicle.make} {vehicle.model}
                            </span>
                          ))}
                          {customer.vehicles.length > 2 && (
                            <span className="text-xs text-gray-500 px-2 py-1">
                              +{customer.vehicles.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Contact Info */}
                    <div className="mb-4 space-y-1 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="w-4">📞</span>
                        <span>{customer.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4">📧</span>
                        <span className="truncate">{customer.email}</span>
                      </div>
                    </div>

                    {/* Service History */}
                    <div className="mb-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500">Service Records</span>
                        <span className="font-medium">{customer.serviceHistory?.length || 0}</span>
                      </div>
                      {customer.lastVisit && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-500">Last Visit</span>
                          <span className="font-medium">{new Date(customer.lastVisit).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <Link
                      to={`/admin/dashboard/customers/${customer.id}`}
                      className="inline-flex items-center gap-2 w-full justify-center text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 hover:border-blue-300 hover:bg-blue-50 px-4 py-2 rounded-lg transition"
                    >
                      View Details
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaThLarge className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-500 mb-2">No customers found</h3>
            <p className="text-gray-400">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first customer.'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length} customers
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 text-sm rounded font-medium transition ${currentPage === i + 1
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CustomerList
