import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppSelector } from '../../redux'
import { FaThLarge, FaList } from 'react-icons/fa'

function CustomerList() {
  const customers = useAppSelector((state) => state.customers.list)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)

  const itemsPerPage = 4
  const totalPages = Math.ceil(customers.length / itemsPerPage)
  const paginatedCustomers = customers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Customer List</h1>
        <button
          onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
          className="text-sm bg-blue-100 text-blue-700 px-3 py-1.5 rounded hover:bg-blue-200 flex items-center space-x-2"
        >
          {view === 'grid' ? <FaList /> : <FaThLarge />}
          <span>{view === 'grid' ? 'List View' : 'Grid View'}</span>
        </button>
      </div>

      {/* Customer Cards */}
      <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}>
        {paginatedCustomers.map((customer) => (
          <div
            key={customer.id}
            className={`group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm
              transition duration-200 transform hover:scale-[1.015] hover:shadow-lg hover:border-blue-400 hover:bg-blue-50
              hover:ring-2 hover:ring-blue-300 hover:ring-offset-2 cursor-pointer
              ${view === 'list' ? 'flex flex-col md:flex-row items-start justify-between p-5' : 'p-6'}`}
          >
            {/* Highlight bar */}
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-purple-500 rounded-r transition-all duration-300 group-hover:w-2" />

            <div className="w-full">
              {/* Name & Vehicle */}
              <div className="flex flex-wrap items-center justify-between mb-2">
                <h2 className="text-lg font-bold text-gray-800">{customer.name}</h2>
                <span className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium shadow-sm">
                  {customer.vehicle}
                </span>
              </div>

              {/* Debt Info */}
              <div className="mb-4 text-sm space-y-1 text-gray-600">
                <div><strong>Account:</strong> {customer.accountNumber}</div>
                <div><strong>Original Debt:</strong> ${customer.originalDebt?.toLocaleString()}</div>
                <div><strong>Current Debt:</strong> <span className="text-red-600 font-semibold">${customer.currentDebt?.toLocaleString()}</span></div>
              </div>

              {/* Contact Info */}
              <div className="flex flex-wrap gap-3 text-xs mb-4">
                <span className="bg-gray-100 px-3 py-1 rounded-full">📞 {customer.phone}</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">📧 {customer.email}</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full">📍 {customer.address}</span>
              </div>

              {/* View Button */}
              <Link
                to={`/customer/${customer.id}`}
                className="inline-flex items-center gap-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-full transition"
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

      {/* Pagination */}
      <div className="mt-8 flex justify-center items-center gap-2 flex-wrap">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Previous
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded-full font-medium transition ${currentPage === i + 1
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 hover:bg-blue-100'
              }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default CustomerList
