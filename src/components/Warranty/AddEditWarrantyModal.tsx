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

  // Fetch customers and vehicles
  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true)
        const [customersResponse, vehiclesResponse] = await Promise.all([
          api.get('/customers'),
          api.get('/vehicles')
        ])
        
        // Ensure we get arrays from the API responses
        const customersData = Array.isArray(customersResponse.data) ? customersResponse.data : 
                           Array.isArray(customersResponse.data?.data) ? customersResponse.data.data : []
        const vehiclesData = Array.isArray(vehiclesResponse.data) ? vehiclesResponse.data : 
                           Array.isArray(vehiclesResponse.data?.data) ? vehiclesResponse.data.data : []
        
        setCustomers(customersData)
        setVehicles(vehiclesData)
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to fetch customers and vehicles')
        setCustomers([])
        setVehicles([])
      } finally {
        setDataLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (warranty && mode === 'edit') {
      setFormData({
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
      })
    }
  }, [warranty, mode])

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
          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-2 block">Customer *</span>
            <select
              value={formData.customer}
              onChange={(e) => setFormData(prev => ({ ...prev, customer: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-white"
              required
              disabled={loading || dataLoading}
            >
              <option value="">{dataLoading ? 'Loading...' : 'Select Customer'}</option>
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
              disabled={loading || dataLoading}
            >
              <option value="">{dataLoading ? 'Loading...' : 'Select Vehicle'}</option>
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
