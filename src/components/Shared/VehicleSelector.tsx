import { useState, useEffect } from 'react'
import { Search, Car, Calendar, MapPin, Wrench } from '../utils/icons'
import { Vehicle } from '../../utils/CustomerTypes'

interface VehicleSelectorProps {
  selectedVehicleId?: string
  customerId?: string
  onVehicleSelect: (vehicle: Vehicle) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export default function VehicleSelector({
  selectedVehicleId,
  customerId,
  onVehicleSelect,
  placeholder = "Select a vehicle...",
  className = "",
  disabled = false
}: VehicleSelectorProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)

  // Fetch vehicles
  const fetchVehicles = async (search?: string) => {
    try {
      setLoading(true)
      // Note: This would need to be implemented in the vehicle service
      // For now, we'll use a mock approach
      const mockVehicles: Vehicle[] = [
        {
          id: '1',
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          vin: '1HGBH41JXMN109186',
          licensePlate: 'ABC123',
          mileage: 45000,
          color: 'Silver',
          status: 'active',
          engineType: '2.5L 4-Cylinder',
          transmission: 'automatic',
          fuelType: 'gasoline',
          lastServiceDate: '2024-01-15',
          nextServiceDate: '2024-04-15',
          lastServiceMileage: 42000,
          nextServiceMileage: 48000
        },
        {
          id: '2',
          make: 'Honda',
          model: 'CR-V',
          year: 2019,
          vin: '5FNRL38467B411146',
          licensePlate: 'XYZ789',
          mileage: 62000,
          color: 'Blue',
          status: 'active',
          engineType: '1.5L Turbo',
          transmission: 'automatic',
          fuelType: 'gasoline',
          lastServiceDate: '2024-02-20',
          nextServiceDate: '2024-05-20',
          lastServiceMileage: 59000,
          nextServiceMileage: 65000
        }
      ]
      
      // Filter by customer if specified
      let filteredVehicles = mockVehicles
      if (customerId) {
        filteredVehicles = mockVehicles.filter(v => v.customerId === customerId)
      }
      
      // Filter by search term
      if (search) {
        filteredVehicles = filteredVehicles.filter(v =>
          v.make.toLowerCase().includes(search.toLowerCase()) ||
          v.model.toLowerCase().includes(search.toLowerCase()) ||
          v.licensePlate.toLowerCase().includes(search.toLowerCase()) ||
          v.vin.toLowerCase().includes(search.toLowerCase())
        )
      }
      
      setVehicles(filteredVehicles)
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch selected vehicle details if ID is provided
  useEffect(() => {
    if (selectedVehicleId && !selectedVehicle) {
      const vehicle = vehicles.find(v => v.id === selectedVehicleId || v._id === selectedVehicleId)
      if (vehicle) {
        setSelectedVehicle(vehicle)
      }
    }
  }, [selectedVehicleId, selectedVehicle, vehicles])

  // Initial fetch
  useEffect(() => {
    fetchVehicles()
  }, [customerId])

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (term.length >= 2) {
      fetchVehicles(term)
    } else if (term.length === 0) {
      fetchVehicles()
    }
  }

  // Handle vehicle selection
  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    onVehicleSelect(vehicle)
    setIsOpen(false)
    setSearchTerm('')
  }

  // Filter vehicles based on search
  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.vin.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Get status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Selected Vehicle Display */}
      {selectedVehicle && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Car className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                </div>
                <div className="text-sm text-gray-600 flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Car className="w-3 h-3" />
                    {selectedVehicle.licensePlate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Wrench className="w-3 h-3" />
                    {selectedVehicle.mileage.toLocaleString()} miles
                  </span>
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Next service: {selectedVehicle.nextServiceDate ? new Date(selectedVehicle.nextServiceDate).toLocaleDateString() : 'Not scheduled'}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedVehicle.status)}`}>
                    {selectedVehicle.status || 'Unknown'}
                  </span>
                </div>
                {selectedVehicle.color && (
                  <div className="text-sm text-gray-500 mt-1">
                    Color: {selectedVehicle.color}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedVehicle(null)
                onVehicleSelect({} as Vehicle)
              }}
              className="text-gray-400 hover:text-red-600 transition-colors"
              disabled={disabled}
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Vehicle Selector */}
      {!selectedVehicle && (
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
                  <p className="mt-2">Loading vehicles...</p>
                </div>
              ) : filteredVehicles.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? 'No vehicles found matching your search.' : 'No vehicles available.'}
                </div>
              ) : (
                <div className="py-2">
                  {filteredVehicles.map((vehicle) => (
                    <button
                      key={vehicle.id || vehicle._id}
                      onClick={() => handleVehicleSelect(vehicle)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Car className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {vehicle.year} {vehicle.make} {vehicle.model}
                          </div>
                          <div className="text-sm text-gray-600 truncate">
                            {vehicle.licensePlate} • {vehicle.mileage.toLocaleString()} miles
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {vehicle.color} • {vehicle.engineType}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                            {vehicle.status || 'Unknown'}
                          </span>
                          {vehicle.nextServiceDate && (
                            <span className="text-xs text-gray-500">
                              Service: {new Date(vehicle.nextServiceDate).toLocaleDateString()}
                            </span>
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
