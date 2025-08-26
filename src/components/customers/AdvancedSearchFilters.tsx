import { useState } from 'react'
import { Search, Filter, X, Calendar, MapPin, Car, DollarSign, User, Building2 } from '../../utils/icons'

interface AdvancedFilters {
  search: string
  status: string
  city: string
  state: string
  zipCode: string
  hasVehicles: boolean
  hasAppointments: boolean
  hasPayments: boolean
  dateRange: {
    start: string
    end: string
  }
  minVehicles: number
  maxVehicles: number
  businessType: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

interface Props {
  filters: AdvancedFilters
  onFiltersChange: (filters: AdvancedFilters) => void
  onSearch: () => void
  onClear: () => void
  totalResults: number
}

export default function AdvancedSearchFilters({ 
  filters, 
  onFiltersChange, 
  onSearch, 
  onClear, 
  totalResults 
}: Props) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleFilterChange = (key: keyof AdvancedFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    })
  }

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: value
      }
    })
  }

  const clearFilters = () => {
    const clearedFilters: AdvancedFilters = {
      search: '',
      status: '',
      city: '',
      state: '',
      zipCode: '',
      hasVehicles: false,
      hasAppointments: false,
      hasPayments: false,
      dateRange: { start: '', end: '' },
      minVehicles: 0,
      maxVehicles: 0,
      businessType: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }
    onFiltersChange(clearedFilters)
    onClear()
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-blue-600" />
            <h3 className="text-base font-semibold text-gray-800">Advanced Search & Filters</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-lg transition-all duration-200"
            >
              <Filter className="w-4 h-4" />
              {showAdvanced ? 'Hide' : 'Show'} Advanced
            </button>
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Basic Search */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Search customers by name, email, phone, business, or address..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white text-gray-700"
          />
        </div>

        {/* Basic Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="prospect">Prospect</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
            <input
              type="text"
              placeholder="Filter by city"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
            <input
              type="text"
              placeholder="Filter by state"
              value={filters.state}
              onChange={(e) => handleFilterChange('state', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
            >
              <option value="createdAt">Date Created</option>
              <option value="name">Name</option>
              <option value="businessName">Business Name</option>
              <option value="email">Email</option>
              <option value="lastActivity">Last Activity</option>
              <option value="totalSpent">Total Spent</option>
            </select>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-6 pt-6 border-t border-gray-200">
            {/* Location Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  ZIP Code
                </label>
                <input
                  type="text"
                  placeholder="Filter by ZIP"
                  value={filters.zipCode}
                  onChange={(e) => handleFilterChange('zipCode', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-gray-500" />
                  Business Type
                </label>
                <select
                  value={filters.businessType}
                  onChange={(e) => handleFilterChange('businessType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                >
                  <option value="">All Types</option>
                  <option value="individual">Individual</option>
                  <option value="business">Business</option>
                  <option value="fleet">Fleet</option>
                  <option value="dealer">Dealer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => handleDateRangeChange('start', e.target.value)}
                    className="px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white text-sm"
                  />
                  <input
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => handleDateRangeChange('end', e.target.value)}
                    className="px-3 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Vehicle & Activity Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Car className="w-4 h-4 text-gray-500" />
                  Vehicle Filters
                </h4>
                
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="hasVehicles"
                    checked={filters.hasVehicles}
                    onChange={(e) => handleFilterChange('hasVehicles', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="hasVehicles" className="text-sm text-gray-700">
                    Has Vehicles
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Min Vehicles</label>
                    <input
                      type="number"
                      min="0"
                      value={filters.minVehicles}
                      onChange={(e) => handleFilterChange('minVehicles', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Max Vehicles</label>
                    <input
                      type="number"
                      min="0"
                      value={filters.maxVehicles}
                      onChange={(e) => handleFilterChange('maxVehicles', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  Activity Filters
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="hasAppointments"
                      checked={filters.hasAppointments}
                      onChange={(e) => handleFilterChange('hasAppointments', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="hasAppointments" className="text-sm text-gray-700">
                      Has Appointments
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="hasPayments"
                      checked={filters.hasPayments}
                      onChange={(e) => handleFilterChange('hasPayments', e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="hasPayments" className="text-sm text-gray-700">
                      Has Payment History
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results & Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-500">
            {totalResults} customer{totalResults !== 1 ? 's' : ''} found
          </div>
          <div className="flex gap-3">
            <button
              onClick={onSearch}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              <Search className="w-4 h-4 inline mr-2" />
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
