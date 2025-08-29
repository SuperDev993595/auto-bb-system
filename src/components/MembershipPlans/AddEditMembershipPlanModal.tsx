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
  const [loading, setLoading] = useState(false)
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

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        maxVehicles: parseInt(formData.maxVehicles.toString())
      }

      await onSubmit(submitData)
      onClose()
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to save membership plan'
      toast.error(message)
    } finally {
      setLoading(false)
    }
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
    <ModalWrapper
      isOpen={true}
      onClose={onClose}
      title={mode === 'create' ? 'Create New Membership Plan' : 'Edit Membership Plan'}
      icon={<Crown className="w-5 h-5" />}
      submitText={mode === 'create' ? 'Create Plan' : 'Update Plan'}
      submitColor="bg-blue-600"
      onSubmit={handleSubmit}
      
      submitDisabled={loading}
      size="xl"
    >
      <div className="p-6 space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-2 block">Plan Name *</span>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-white"
              placeholder="e.g., Premium Auto Care"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-2 block">Tier *</span>
            <select
              value={formData.tier}
              onChange={(e) => setFormData(prev => ({ ...prev, tier: e.target.value as any }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-white"
            >
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="vip">VIP</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-2 block">Price *</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-white"
              placeholder="0.00"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-2 block">Billing Cycle *</span>
            <select
              value={formData.billingCycle}
              onChange={(e) => setFormData(prev => ({ ...prev, billingCycle: e.target.value as any }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-white"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-2 block">Max Vehicles</span>
            <input
              type="number"
              min="1"
              value={formData.maxVehicles}
              onChange={(e) => setFormData(prev => ({ ...prev, maxVehicles: parseInt(e.target.value) }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-white"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-2 block">Status</span>
            <select
              value={formData.isActive ? 'active' : 'inactive'}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'active' }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
        </div>

        <label className="block">
          <span className="text-sm font-medium text-gray-700 mb-2 block">Description</span>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-white resize-none"
            placeholder="Describe the benefits and features of this plan..."
          />
        </label>

        {/* Benefits Configuration */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Benefits Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 mb-2 block">Discount Percentage (%)</span>
              <input
                type="number"
                min="0"
                max="100"
                value={formData.benefits.discountPercentage}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  benefits: { ...prev.benefits, discountPercentage: parseInt(e.target.value) }
                }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-white"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700 mb-2 block">Free Inspections</span>
              <input
                type="number"
                min="0"
                value={formData.benefits.freeInspections}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  benefits: { ...prev.benefits, freeInspections: parseInt(e.target.value) }
                }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:bg-white"
              />
            </label>
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
              <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex-1">
                  <input
                    type="text"
                    value={feature.name}
                    onChange={(e) => updateFeature(index, 'name', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 mb-2"
                    placeholder="Feature name"
                  />
                  <input
                    type="text"
                    value={feature.description}
                    onChange={(e) => updateFeature(index, 'description', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-all duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex-1">
                <input
                  type="text"
                  value={newFeature.name}
                  onChange={(e) => setNewFeature(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 mb-2"
                  placeholder="New feature name"
                />
                <input
                  type="text"
                  value={newFeature.description}
                  onChange={(e) => setNewFeature(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
                  className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ModalWrapper>
  )
}
