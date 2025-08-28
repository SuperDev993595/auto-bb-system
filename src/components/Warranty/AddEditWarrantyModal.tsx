import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import ModalWrapper from '../../utils/ModalWrapper'
import { Shield, Plus, X } from '../../utils/icons'

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.customer || !formData.vehicle || !formData.name || !formData.endDate) {
      toast.error('Please fill in all required fields')
      return
    }

    const submitData = {
      ...formData,
      mileageLimit: formData.mileageLimit ? parseInt(formData.mileageLimit) : undefined,
      currentMileage: parseInt(formData.currentMileage),
      deductible: parseFloat(formData.deductible),
      maxClaimAmount: formData.maxClaimAmount ? parseFloat(formData.maxClaimAmount) : undefined
    }

    onSubmit(submitData)
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
    <ModalWrapper isOpen={true} onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'create' ? 'Create New Warranty' : 'Edit Warranty'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer *
              </label>
              <select
                value={formData.customer}
                onChange={(e) => setFormData(prev => ({ ...prev, customer: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Customer</option>
                {/* Customer options would be populated from API */}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle *
              </label>
              <select
                value={formData.vehicle}
                onChange={(e) => setFormData(prev => ({ ...prev, vehicle: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select Vehicle</option>
                {/* Vehicle options would be populated from API */}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warranty Type *
              </label>
              <select
                value={formData.warrantyType}
                onChange={(e) => setFormData(prev => ({ ...prev, warrantyType: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="manufacturer">Manufacturer</option>
                <option value="extended">Extended</option>
                <option value="powertrain">Powertrain</option>
                <option value="bumper_to_bumper">Bumper to Bumper</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Warranty Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Premium Extended Warranty"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the warranty coverage..."
            />
          </div>

          {/* Dates and Mileage */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mileage Limit
              </label>
              <input
                type="number"
                value={formData.mileageLimit}
                onChange={(e) => setFormData(prev => ({ ...prev, mileageLimit: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 100000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Mileage
              </label>
              <input
                type="number"
                value={formData.currentMileage}
                onChange={(e) => setFormData(prev => ({ ...prev, currentMileage: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 50000"
              />
            </div>
          </div>

          {/* Coverage Options */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Coverage Options</h3>
            
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
                  <span className="ml-2 text-sm text-gray-700 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Financial Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deductible ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.deductible}
                onChange={(e) => setFormData(prev => ({ ...prev, deductible: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Claim Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.maxClaimAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, maxClaimAmount: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Provider Information */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Provider Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider Name
                </label>
                <input
                  type="text"
                  value={formData.provider.name}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    provider: { ...prev.provider, name: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Warranty Provider Name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider Phone
                </label>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider Email
                </label>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="provider@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provider Address
                </label>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123 Provider St, City, State"
                />
              </div>
            </div>
          </div>

          {/* Terms and Exclusions */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Terms and Exclusions</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Terms and Conditions
              </label>
              <textarea
                value={formData.terms}
                onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter warranty terms and conditions..."
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exclusions
              </label>
              <div className="space-y-2">
                {formData.exclusions.map((exclusion, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={exclusion}
                      onChange={(e) => {
                        const newExclusions = [...formData.exclusions]
                        newExclusions[index] = e.target.value
                        setFormData(prev => ({ ...prev, exclusions: newExclusions }))
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => removeExclusion(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newExclusion}
                    onChange={(e) => setNewExclusion(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add new exclusion..."
                  />
                  <button
                    type="button"
                    onClick={addExclusion}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional notes..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              {mode === 'create' ? 'Create Warranty' : 'Update Warranty'}
            </button>
          </div>
        </form>
      </div>
    </ModalWrapper>
  )
}
