import { useState, useEffect } from 'react'
import { Search, User, Building, Phone, Mail, MapPin } from '../utils/icons'
import { customerService, Customer } from '../../services/customers'

interface CustomerSelectorProps {
  selectedCustomerId?: string
  onCustomerSelect: (customer: Customer) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export default function CustomerSelector({
  selectedCustomerId,
  onCustomerSelect,
  placeholder = "Select a customer...",
  className = "",
  disabled = false
}: CustomerSelectorProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)

  // Fetch customers
  const fetchCustomers = async (search?: string) => {
    try {
      setLoading(true)
      const response = await customerService.getCustomers({
        search: search || '',
        limit: 50,
        status: 'active'
      })
      
      if (response.success) {
        setCustomers(response.data.customers)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch selected customer details if ID is provided
  useEffect(() => {
    if (selectedCustomerId && !selectedCustomer) {
      const fetchSelectedCustomer = async () => {
        try {
          const response = await customerService.getCustomer(selectedCustomerId)
          if (response.success) {
            setSelectedCustomer(response.data)
          }
        } catch (error) {
          console.error('Error fetching selected customer:', error)
        }
      }
      fetchSelectedCustomer()
    }
  }, [selectedCustomerId, selectedCustomer])

  // Initial fetch
  useEffect(() => {
    fetchCustomers()
  }, [])

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (term.length >= 2) {
      fetchCustomers(term)
    } else if (term.length === 0) {
      fetchCustomers()
    }
  }

  // Handle customer selection
  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer)
    onCustomerSelect(customer)
    setIsOpen(false)
    setSearchTerm('')
  }

  // Filter customers based on search
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    (customer.businessName && customer.businessName.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className={`relative ${className}`}>
      {/* Selected Customer Display */}
      {selectedCustomer && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">{selectedCustomer.name}</div>
                <div className="text-sm text-gray-600 flex items-center gap-4">
                  {selectedCustomer.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {selectedCustomer.email}
                    </span>
                  )}
                  {selectedCustomer.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {selectedCustomer.phone}
                    </span>
                  )}
                </div>
                {selectedCustomer.businessName && (
                  <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <Building className="w-3 h-3" />
                    {selectedCustomer.businessName}
                  </div>
                )}
                {selectedCustomer.address && (
                  <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3" />
                    {[
                      selectedCustomer.address.street,
                      selectedCustomer.address.city,
                      selectedCustomer.address.state,
                      selectedCustomer.address.zipCode
                    ].filter(Boolean).join(', ')}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedCustomer(null)
                onCustomerSelect({} as Customer)
              }}
              className="text-gray-400 hover:text-red-600 transition-colors"
              disabled={disabled}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Customer Selector */}
      {!selectedCustomer && (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => setIsOpen(true)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={disabled}
            />
          </div>

          {/* Dropdown */}
          {isOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="mt-2">Loading customers...</p>
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? 'No customers found matching your search.' : 'No customers available.'}
                </div>
              ) : (
                <div className="py-2">
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id || customer._id}
                      onClick={() => handleCustomerSelect(customer)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">{customer.name}</div>
                          <div className="text-sm text-gray-600 truncate">
                            {customer.email} • {customer.phone}
                          </div>
                          {customer.businessName && (
                            <div className="text-xs text-gray-500 truncate">{customer.businessName}</div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
