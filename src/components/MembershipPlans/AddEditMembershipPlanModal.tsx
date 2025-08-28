import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import ModalWrapper from '../../utils/ModalWrapper'
import { Crown, Plus, X } from '../../utils/icons'

interface MembershipPlan {
  _id: string
  name: string
  description: string
  tier: 'basic' | 'premium' | 'vip' | 'enterprise'
  price: number
  billingCycle: 'monthly' | 'quarterly' | 'yearly'
  features: Array<{
    name: string
    description: string
    included: boolean
  }>
  benefits: {
    discountPercentage: number
    priorityBooking: boolean
    freeInspections: number
    roadsideAssistance: boolean
    extendedWarranty: boolean
    conciergeService: boolean
  }
  maxVehicles: number
  isActive: boolean
}

interface Props {
  onClose: () => void
  onSubmit: (data: any) => void
  mode: 'create' | 'edit'
  plan?: MembershipPlan | null
}

export default function AddEditMembershipPlanModal({ onClose, onSubmit, mode, plan }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tier: 'basic' as 'basic' | 'premium' | 'vip' | 'enterprise',
    price: '',
    billingCycle: 'monthly' as 'monthly' | 'quarterly' | 'yearly',
    maxVehicles: 1,
    isActive: true,
    benefits: {
      discountPercentage: 0,
      priorityBooking: false,
      freeInspections: 0,
      roadsideAssistance: false,
      extendedWarranty: false,
      conciergeService: false
    },
    features: [] as Array<{
      name: string
      description: string
      included: boolean
    }>
  })

  const [newFeature, setNewFeature] = useState({ name: '', description: '', included: true })

  useEffect(() => {
    if (plan && mode === 'edit') {
      setFormData({
        name: plan.name,
        description: plan.description,
        tier: plan.tier,
        price: plan.price.toString(),
        billingCycle: plan.billingCycle,
        maxVehicles: plan.maxVehicles,
        isActive: plan.isActive,
        benefits: plan.benefits,
        features: plan.features
      })
    }
  }, [plan, mode])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.price) {
      toast.error('Please fill in all required fields')
      return
    }

    const submitData = {
      ...formData,
      price: parseFloat(formData.price),
      maxVehicles: parseInt(formData.maxVehicles.toString())
    }

    onSubmit(submitData)
  }

  const addFeature = () => {
    if (!newFeature.name) {
      toast.error('Please enter a feature name')
      return
    }

    setFormData(prev => ({
      ...prev,
      features: [...prev.features, { ...newFeature }]
    }))
    setNewFeature({ name: '', description: '', included: true })
  }

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const updateFeature = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => 
        i === index ? { ...feature, [field]: value } : feature
      )
    }))
  }

  return (
    <ModalWrapper isOpen={true} onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'create' ? 'Create New Membership Plan' : 'Edit Membership Plan'}
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
                Plan Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Premium Auto Care"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tier *
              </label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData(prev => ({ ...prev, tier: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="vip">VIP</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Billing Cycle *
              </label>
              <select
                value={formData.billingCycle}
                onChange={(e) => setFormData(prev => ({ ...prev, billingCycle: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Vehicles
              </label>
              <input
                type="number"
                min="1"
                value={formData.maxVehicles}
                onChange={(e) => setFormData(prev => ({ ...prev, maxVehicles: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'active' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
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
              placeholder="Describe the benefits and features of this plan..."
            />
          </div>

          {/* Benefits Configuration */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Benefits Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Discount Percentage (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.benefits.discountPercentage}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    benefits: { ...prev.benefits, discountPercentage: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Free Inspections
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.benefits.freeInspections}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    benefits: { ...prev.benefits, freeInspections: parseInt(e.target.value) }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.benefits.priorityBooking}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    benefits: { ...prev.benefits, priorityBooking: e.target.checked }
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Priority Booking</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.benefits.roadsideAssistance}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    benefits: { ...prev.benefits, roadsideAssistance: e.target.checked }
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Roadside Assistance</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.benefits.extendedWarranty}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    benefits: { ...prev.benefits, extendedWarranty: e.target.checked }
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Extended Warranty Coverage</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.benefits.conciergeService}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    benefits: { ...prev.benefits, conciergeService: e.target.checked }
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Concierge Services</span>
              </label>
            </div>
          </div>

          {/* Custom Features */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Custom Features</h3>
            
            <div className="space-y-4">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={feature.name}
                      onChange={(e) => updateFeature(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                      placeholder="Feature name"
                    />
                    <input
                      type="text"
                      value={feature.description}
                      onChange={(e) => updateFeature(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Feature description"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={feature.included}
                        onChange={(e) => updateFeature(index, 'included', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Included</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <input
                    type="text"
                    value={newFeature.name}
                    onChange={(e) => setNewFeature(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                    placeholder="New feature name"
                  />
                  <input
                    type="text"
                    value={newFeature.description}
                    onChange={(e) => setNewFeature(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="New feature description"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newFeature.included}
                      onChange={(e) => setNewFeature(prev => ({ ...prev, included: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Included</span>
                  </label>
                  <button
                    type="button"
                    onClick={addFeature}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
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
              {mode === 'create' ? 'Create Plan' : 'Update Plan'}
            </button>
          </div>
        </form>
      </div>
    </ModalWrapper>
  )
}
