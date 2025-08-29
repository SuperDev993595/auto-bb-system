import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import ModalWrapper from '../../utils/ModalWrapper'
import { Shield, Plus, X } from '../../utils/icons'
import api from '../../services/api'

interface Customer {
  _id: string
  name: string
  email: string
}

interface Vehicle {
  _id: string
  make: string
  model: string
  year: number
  vin: string
}

interface Warranty {
  _id: string
  customer: {
    _id: string
    name: string
  }
  vehicle: {
    _id: string
    make: string
    model: string
    year: number
  }
  warrantyType: 'manufacturer' | 'extended' | 'powertrain' | 'bumper_to_bumper' | 'custom'
  name: string
  description: string
  startDate: string
  endDate: string
  mileageLimit?: number
  currentMileage: number
  coverage: {
    engine: boolean
    transmission: boolean
    electrical: boolean
    suspension: boolean
    brakes: boolean
    cooling: boolean
    fuel: boolean
    exhaust: boolean
    interior: boolean
    exterior: boolean
  }
  deductible: number
  maxClaimAmount?: number
  provider: {
    name: string
    contact: {
      phone: string
      email: string
      address: string
    }
  }
  terms: string
  exclusions: string[]
  notes: string
}

interface Props {
  onClose: () => void
  onSubmit: (data: any) => void
  mode: 'create' | 'edit'
  warranty?: Warranty | null
}

export default function AddEditWarrantyModal({ onClose, onSubmit, mode, warranty }: Props) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    customer: '',
    vehicle: '',
    warrantyType: 'extended' as 'manufacturer' | 'extended' | 'powertrain' | 'bumper_to_bumper' | 'custom',
    name: '',
    description: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    mileageLimit: '',
    currentMileage: '',
    coverage: {
      engine: false,
      transmission: false,
      electrical: false,
      suspension: false,
      brakes: false,
      cooling: false,
      fuel: false,
      exhaust: false,
      interior: false,
      exterior: false
    },
    deductible: '',
    maxClaimAmount: '',
    provider: {
      name: '',
      contact: {
        phone: '',
        email: '',
        address: ''
      }
    },
    terms: '',
    exclusions: [] as string[],
    notes: ''
  })

  const [newExclusion, setNewExclusion] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [vehiclesLoading, setVehiclesLoading] = useState(false)

  // Fetch customers only
  useEffect(() => {
    const fetchCustomers = async () => {
      let customersResponse: any
      try {
        setDataLoading(true)
        
        // Try to fetch customers with retry logic
        const maxRetries = 3
        let lastError: any = null
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            console.log(`Attempt ${attempt} to fetch customers`)
            
            // Try different endpoints based on user role
            const userRole = localStorage.getItem('role') || sessionStorage.getItem('role')
            console.log('Current user role:', userRole)
            
            let customersEndpoint = '/customers'
            
            // If user is a customer, try customer-specific endpoints
            if (userRole === 'customer') {
              customersEndpoint = '/customers/profile'
            }
            
            console.log(`Using customers endpoint: ${customersEndpoint}`)
            
            customersResponse = await api.get(customersEndpoint)
            break // Success, exit retry loop
          } catch (error: any) {
            lastError = error
            console.error(`Attempt ${attempt} failed:`, error.response?.status, error.response?.data)
            
            if (attempt === maxRetries) {
              throw error // Re-throw on final attempt
            }
            
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
          }
        }
        
        // Extract data from API responses - handle nested data structure
        const customersData = customersResponse.data?.data?.customers || 
                           customersResponse.data?.customers || 
                           (Array.isArray(customersResponse.data) ? customersResponse.data : [])
        
        console.log('Customers response structure:', {
          hasData: !!customersResponse.data,
          hasDataData: !!customersResponse.data?.data,
          hasCustomers: !!customersResponse.data?.data?.customers,
          customersLength: customersData?.length || 0
        })
        console.log('Full customers response:', customersResponse)
        console.log('Customers data:', customersData)
        
        setCustomers(customersData)
        
        // Log success
        console.log(`Successfully loaded ${customersData.length} customers`)
      } catch (error: any) {
        console.error('Error fetching customers:', error)
        console.error('Customers response:', customersResponse)
        
        // Show more specific error message
        if (error.response?.status === 401) {
          toast.error('Authentication required. Please login again.')
        } else if (error.response?.status === 403) {
          toast.error('Access denied. Admin privileges required.')
        } else {
          toast.error('Failed to fetch customers')
        }
        
        // Try to load sample data as fallback
        try {
          console.log('Attempting to load sample customers as fallback...')
          const sampleCustomersResponse = await api.get('/customers/sample')
          
          const sampleCustomers = sampleCustomersResponse.data?.data || sampleCustomersResponse.data || []
          
          if (sampleCustomers.length > 0) {
            console.log('Loaded sample customers as fallback')
            setCustomers(sampleCustomers)
            return
          }
        } catch (fallbackError) {
          console.log('Sample customers fallback also failed:', fallbackError)
        }
        
        setCustomers([])
      } finally {
        setDataLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  // Fetch vehicles for selected customer
  const fetchVehiclesForCustomer = async (customerId: string) => {
    if (!customerId) {
      setVehicles([])
      return
    }

    try {
      setVehiclesLoading(true)
      console.log(`Fetching vehicles for customer: ${customerId}`)
      
      // Try different endpoints based on user role
      const userRole = localStorage.getItem('role') || sessionStorage.getItem('role')
      let vehiclesEndpoint = `/customers/${customerId}/vehicles`
      
      // If user is a customer, try customer-specific endpoints
      if (userRole === 'customer') {
        vehiclesEndpoint = '/customers/vehicles'
      }
      
      console.log(`Using vehicles endpoint: ${vehiclesEndpoint}`)
      
      const vehiclesResponse = await api.get(vehiclesEndpoint)
      
      // Extract data from API responses - handle nested data structure
      const vehiclesData = vehiclesResponse.data?.data?.vehicles || 
                         vehiclesResponse.data?.vehicles || 
                         (Array.isArray(vehiclesResponse.data) ? vehiclesResponse.data : [])
      
        console.log('Vehicles response structure:', {
          hasData: !!vehiclesResponse.data,
          hasDataData: !!vehiclesResponse.data?.data,
          hasVehicles: !!vehiclesResponse.data?.data?.vehicles,
          vehiclesLength: vehiclesData?.length || 0
        })
        console.log('Full vehicles response:', vehiclesResponse)
        console.log('Vehicles data:', vehiclesData)
        
        setVehicles(vehiclesData)
        
        // Log success
        console.log(`Successfully loaded ${vehiclesData.length} vehicles for customer ${customerId}`)
        
        // In edit mode, ensure the vehicle is still selected after loading
        if (mode === 'edit' && warranty && warranty.vehicle._id) {
          console.log('Edit mode: Ensuring vehicle selection is maintained')
          // The vehicle should already be selected in formData, but let's verify
          if (formData.vehicle !== warranty.vehicle._id) {
            console.log('Vehicle selection mismatch, updating...')
            setFormData(prev => ({ ...prev, vehicle: warranty.vehicle._id }))
          }
        }
    } catch (error: any) {
      console.error('Error fetching vehicles for customer:', error)
      
      // Show more specific error message
      if (error.response?.status === 401) {
        toast.error('Authentication required. Please login again.')
      } else if (error.response?.status === 403) {
        toast.error('Access denied. Admin privileges required.')
      } else {
        toast.error('Failed to fetch vehicles for selected customer')
      }
      
      setVehicles([])
    } finally {
      setVehiclesLoading(false)
    }
  }

  // Handle customer selection change
  useEffect(() => {
    if (formData.customer) {
      fetchVehiclesForCustomer(formData.customer)
      // Only clear vehicle selection when customer changes (not in edit mode)
      if (mode !== 'edit') {
        setFormData(prev => ({ ...prev, vehicle: '' }))
      }
    } else {
      setVehicles([])
    }
  }, [formData.customer, mode])

  useEffect(() => {
    if (warranty && mode === 'edit') {
      const editFormData = {
        customer: warranty.customer._id,
        vehicle: warranty.vehicle._id,
        warrantyType: warranty.warrantyType,
        name: warranty.name,
        description: warranty.description,
        startDate: warranty.startDate.split('T')[0],
        endDate: warranty.endDate.split('T')[0],
        mileageLimit: warranty.mileageLimit?.toString() || '',
        currentMileage: warranty.currentMileage.toString(),
        coverage: warranty.coverage,
        deductible: warranty.deductible.toString(),
        maxClaimAmount: warranty.maxClaimAmount?.toString() || '',
        provider: warranty.provider,
        terms: warranty.terms,
        exclusions: warranty.exclusions,
        notes: warranty.notes
      }
      
      setFormData(editFormData)
      
      // Fetch vehicles for the customer in edit mode
      if (warranty.customer._id) {
        fetchVehiclesForCustomer(warranty.customer._id)
      }
    }
  }, [warranty, mode])

  // Handle vehicle selection in edit mode when vehicles are loaded
  useEffect(() => {
    if (mode === 'edit' && warranty && vehicles.length > 0 && formData.vehicle !== warranty.vehicle._id) {
      console.log('Edit mode: Vehicles loaded, ensuring correct vehicle is selected')
      setFormData(prev => ({ ...prev, vehicle: warranty.vehicle._id }))
    }
  }, [vehicles, mode, warranty, formData.vehicle])

  const handleSubmit = async () => {
    if (!formData.customer || !formData.vehicle || !formData.name || !formData.endDate) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const submitData = {
        ...formData,
        mileageLimit: formData.mileageLimit ? parseInt(formData.mileageLimit) : undefined,
        currentMileage: parseInt(formData.currentMileage),
        deductible: parseFloat(formData.deductible),
        maxClaimAmount: formData.maxClaimAmount ? parseFloat(formData.maxClaimAmount) : undefined
      }

      await onSubmit(submitData)
      onClose()
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to save warranty'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const addExclusion = () => {
    if (!newExclusion.trim()) {
      toast.error('Please enter an exclusion')
      return
    }

    setFormData(prev => ({
      ...prev,
      exclusions: [...prev.exclusions, newExclusion.trim()]
    }))
    setNewExclusion('')
  }

  const removeExclusion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      exclusions: prev.exclusions.filter((_, i) => i !== index)
    }))
  }

  return (
    <ModalWrapper
      isOpen={true}
      onClose={onClose}
      title={mode === 'create' ? 'Create New Warranty' : 'Edit Warranty'}
      icon={<Shield className="w-5 h-5" />}
      submitText={mode === 'create' ? 'Create Warranty' : 'Update Warranty'}
      submitColor="bg-blue-600"
      onSubmit={handleSubmit}
      submitDisabled={loading || dataLoading}
      size="xl"
    >
      <div className="p-6 space-y-6">
        {/* Customer and Vehicle Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {customers.length === 0 && !dataLoading && (
            <div className="col-span-2 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Admin privileges are required to access customer data. 
                If you're not seeing any customers, please contact your administrator or ensure you have the proper permissions.
              </p>
            </div>
          )}
          {formData.customer && vehicles.length === 0 && !vehiclesLoading && (
            <div className="col-span-2 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-800">
                <strong>Info:</strong> No vehicles found for the selected customer. 
                You may need to add vehicles to this customer's profile first.
              </p>
            </div>
          )}
          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-2 block">Customer *</span>
            <select
              value={formData.customer}
              onChange={(e) => setFormData(prev => ({ ...prev, customer: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-white"
              required
              disabled={loading || dataLoading}
            >
              <option value="">
                {dataLoading ? 'Loading...' : 
                 customers.length === 0 ? 'No customers available (Admin access required)' : 'Select Customer'}
              </option>
              {Array.isArray(customers) && customers.map(customer => (
                <option key={customer._id} value={customer._id}>
                  {customer.name} ({customer.email})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-2 block">Vehicle *</span>
            <select
              value={formData.vehicle}
              onChange={(e) => setFormData(prev => ({ ...prev, vehicle: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-white"
              required
              disabled={loading || dataLoading || vehiclesLoading || !formData.customer}
            >
              <option value="">
                {!formData.customer ? 'Please select a customer first' :
                 vehiclesLoading ? 'Loading vehicles...' : 
                 vehicles.length === 0 ? 'No vehicles available for this customer' : 'Select Vehicle'}
              </option>
              {Array.isArray(vehicles) && vehicles.map(vehicle => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.year} {vehicle.make} {vehicle.model} ({vehicle.vin})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-2 block">Warranty Type *</span>
            <select
              value={formData.warrantyType}
              onChange={(e) => setFormData(prev => ({ ...prev, warrantyType: e.target.value as any }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-white"
            >
              <option value="manufacturer">Manufacturer</option>
              <option value="extended">Extended</option>
              <option value="powertrain">Powertrain</option>
              <option value="bumper_to_bumper">Bumper to Bumper</option>
              <option value="custom">Custom</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-2 block">Warranty Name *</span>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-white"
              placeholder="e.g., Premium Extended Warranty"
              required
            />
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-700 mb-2 block">Description</span>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-white resize-none"
            placeholder="Describe the warranty coverage..."
          />
        </label>

        {/* Dates and Mileage */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-2 block">Start Date *</span>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-white"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-2 block">End Date *</span>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-white"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-2 block">Mileage Limit</span>
            <input
              type="number"
              min="0"
              value={formData.mileageLimit}
              onChange={(e) => setFormData(prev => ({ ...prev, mileageLimit: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-white"
              placeholder="e.g., 50000"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-2 block">Current Mileage</span>
            <input
              type="number"
              min="0"
              value={formData.currentMileage}
              onChange={(e) => setFormData(prev => ({ ...prev, currentMileage: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-white"
              placeholder="e.g., 25000"
            />
          </label>
        </div>

        {/* Coverage Details */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Coverage Details</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(formData.coverage).map(([key, value]) => (
              <label key={key} className="flex items-center">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    coverage: { ...prev.coverage, [key]: e.target.checked }
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700 capitalize">{key}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Financial Details */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 mb-2 block">Deductible ($)</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.deductible}
                onChange={(e) => setFormData(prev => ({ ...prev, deductible: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-white"
                placeholder="0.00"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700 mb-2 block">Max Claim Amount ($)</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.maxClaimAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, maxClaimAmount: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-white"
                placeholder="0.00"
              />
            </label>
          </div>
        </div>

        {/* Provider Information */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Provider Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 mb-2 block">Provider Name</span>
              <input
                type="text"
                value={formData.provider.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  provider: { ...prev.provider, name: e.target.value }
                }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-white"
                placeholder="Provider name"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700 mb-2 block">Provider Phone</span>
              <input
                type="tel"
                value={formData.provider.contact.phone}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  provider: {
                    ...prev.provider,
                    contact: { ...prev.provider.contact, phone: e.target.value }
                  }
                }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-white"
                placeholder="Phone number"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700 mb-2 block">Provider Email</span>
              <input
                type="email"
                value={formData.provider.contact.email}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  provider: {
                    ...prev.provider,
                    contact: { ...prev.provider.contact, email: e.target.value }
                  }
                }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-white"
                placeholder="Email address"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700 mb-2 block">Provider Address</span>
              <input
                type="text"
                value={formData.provider.contact.address}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  provider: {
                    ...prev.provider,
                    contact: { ...prev.provider.contact, address: e.target.value }
                  }
                }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-white"
                placeholder="Address"
              />
            </label>
          </div>
        </div>

        {/* Terms and Conditions */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Terms and Conditions</h3>
          
          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-2 block">Terms</span>
            <textarea
              value={formData.terms}
              onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-white resize-none"
              placeholder="Enter warranty terms and conditions..."
            />
          </label>
        </div>

        {/* Exclusions */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Exclusions</h3>
          
          <div className="space-y-4">
            {formData.exclusions.map((exclusion, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <span className="flex-1 text-sm text-gray-800">{exclusion}</span>
                <button
                  type="button"
                  onClick={() => removeExclusion(index)}
                  className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-all duration-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <input
                type="text"
                value={newExclusion}
                onChange={(e) => setNewExclusion(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="Add new exclusion"
                onKeyPress={(e) => e.key === 'Enter' && addExclusion()}
              />
              <button
                type="button"
                onClick={addExclusion}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="border-t border-gray-200 pt-6">
          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-2 block">Notes</span>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-white resize-none"
              placeholder="Additional notes..."
            />
          </label>
        </div>
      </div>
    </ModalWrapper>
  )
}
