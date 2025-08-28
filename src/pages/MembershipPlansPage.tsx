import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import AddEditMembershipPlanModal from './../components/MembershipPlans/AddEditMembershipPlanModal'
import DeleteMembershipPlanModal from './../components/MembershipPlans/DeleteMembershipPlanModal'
import {
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  Crown,
  Star,
  Shield,
  Users,
  DollarSign,
  Car,
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar
} from '../utils/icons'
import api from '../services/api'

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
  createdBy: {
    name: string
    email: string
  }
  createdAt: string
  updatedAt: string
}

interface MembershipStats {
  totalPlans: number
  activePlans: number
  totalMembers: number
  revenueByTier: Array<{
    tier: string
    count: number
    revenue: number
  }>
  popularPlans: Array<{
    planId: string
    planName: string
    memberCount: number
  }>
}

interface MembershipPlanCardProps {
  plan: MembershipPlan
  onEdit: (plan: MembershipPlan) => void
  onDelete: (plan: MembershipPlan) => void
}

const MembershipPlanCard: React.FC<MembershipPlanCardProps> = ({
  plan,
  onEdit,
  onDelete
}) => {
  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'basic':
        return <Shield className="w-5 h-5 text-blue-500" />
      case 'premium':
        return <Star className="w-5 h-5 text-yellow-500" />
      case 'vip':
        return <Crown className="w-5 h-5 text-purple-500" />
      case 'enterprise':
        return <Users className="w-5 h-5 text-green-500" />
      default:
        return <Shield className="w-5 h-5 text-gray-500" />
    }
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'premium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'vip':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'enterprise':
        return 'bg-green-100 text-green-800 border-green-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getBillingIcon = (cycle: string) => {
    switch (cycle) {
      case 'monthly':
        return <Calendar className="w-4 h-4" />
      case 'quarterly':
        return <TrendingUp className="w-4 h-4" />
      case 'yearly':
        return <DollarSign className="w-4 h-4" />
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden ${
      !plan.isActive ? 'opacity-75' : ''
    }`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {getTierIcon(plan.tier)}
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTierColor(plan.tier)}`}>
                {plan.tier.charAt(0).toUpperCase() + plan.tier.slice(1)}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onEdit(plan)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit Plan"
            >
              <Edit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(plan)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete Plan"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-4">{plan.description}</p>

        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold text-gray-900">
            ${plan.price}
            <span className="text-sm font-normal text-gray-500 ml-1">
              /{plan.billingCycle}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Car className="w-4 h-4" />
            <span>{plan.maxVehicles} vehicles</span>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="p-6">
        <h4 className="font-medium text-gray-900 mb-3">Key Benefits</h4>
        <div className="space-y-2 mb-4">
          {plan.benefits.discountPercentage > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>{plan.benefits.discountPercentage}% discount on services</span>
            </div>
          )}
          {plan.benefits.priorityBooking && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Priority booking</span>
            </div>
          )}
          {plan.benefits.freeInspections > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>{plan.benefits.freeInspections} free inspections</span>
            </div>
          )}
          {plan.benefits.roadsideAssistance && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Roadside assistance</span>
            </div>
          )}
          {plan.benefits.extendedWarranty && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Extended warranty coverage</span>
            </div>
          )}
          {plan.benefits.conciergeService && (
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>Concierge services</span>
            </div>
          )}
        </div>

        {/* Status and Actions */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {plan.isActive ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className={`text-sm font-medium ${
                plan.isActive ? 'text-green-600' : 'text-red-600'
              }`}>
                {plan.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              {getBillingIcon(plan.billingCycle)}
              <span>{plan.billingCycle}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MembershipPlansPage() {
  const [plans, setPlans] = useState<MembershipPlan[]>([])
  const [stats, setStats] = useState<MembershipStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [tierFilter, setTierFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [billingFilter, setBillingFilter] = useState('all')

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null)

  // Fetch membership plans
  const fetchPlans = async () => {
    try {
      setLoading(true)
      const response = await api.get('/memberships/plans')
      setPlans(response.data)
    } catch (error) {
      console.error('Error fetching membership plans:', error)
      toast.error('Failed to fetch membership plans')
    } finally {
      setLoading(false)
    }
  }

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await api.get('/memberships/stats')
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching membership stats:', error)
    }
  }

  useEffect(() => {
    fetchPlans()
    fetchStats()
  }, [])

  // Filter plans
  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTier = tierFilter === 'all' || plan.tier === tierFilter
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && plan.isActive) ||
                         (statusFilter === 'inactive' && !plan.isActive)
    const matchesBilling = billingFilter === 'all' || plan.billingCycle === billingFilter

    return matchesSearch && matchesTier && matchesStatus && matchesBilling
  })

  // Handle plan operations
  const handleCreatePlan = async (planData: any) => {
    try {
      await api.post('/memberships/plans', planData)
      toast.success('Membership plan created successfully')
      fetchPlans()
      fetchStats()
      setShowAddModal(false)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create membership plan')
    }
  }

  const handleUpdatePlan = async (planData: any) => {
    if (!selectedPlan) return
    
    try {
      await api.put(`/memberships/plans/${selectedPlan._id}`, planData)
      toast.success('Membership plan updated successfully')
      fetchPlans()
      fetchStats()
      setShowEditModal(false)
      setSelectedPlan(null)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update membership plan')
    }
  }

  const handleDeletePlan = async () => {
    if (!selectedPlan) return
    
    try {
      await api.delete(`/memberships/plans/${selectedPlan._id}`)
      toast.success('Membership plan deleted successfully')
      fetchPlans()
      fetchStats()
      setShowDeleteModal(false)
      setSelectedPlan(null)
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete membership plan')
    }
  }

  const handleEdit = (plan: MembershipPlan) => {
    setSelectedPlan(plan)
    setShowEditModal(true)
  }

  const handleDelete = (plan: MembershipPlan) => {
    setSelectedPlan(plan)
    setShowDeleteModal(true)
  }

  // Calculate stats
  const planStats = {
    total: plans.length,
    active: plans.filter(plan => plan.isActive).length,
    inactive: plans.filter(plan => !plan.isActive).length,
    totalRevenue: stats?.revenueByTier?.reduce((sum, tier) => sum + tier.revenue, 0) || 0
  }

  if (loading && plans.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Membership Plans</h1>
          <p className="text-gray-600">Manage membership tiers and benefits</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={fetchPlans}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            <span>Add Plan</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Plans</p>
              <p className="text-2xl font-bold text-gray-900">{planStats.total}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Crown className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Plans</p>
              <p className="text-2xl font-bold text-green-600">{planStats.active}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inactive Plans</p>
              <p className="text-2xl font-bold text-red-600">{planStats.inactive}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">${planStats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tier</label>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Tiers</option>
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
              <option value="vip">VIP</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Billing Cycle</label>
            <select
              value={billingFilter}
              onChange={(e) => setBillingFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Billing</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search plans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredPlans.map((plan) => (
          <MembershipPlanCard
            key={plan._id}
            plan={plan}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Empty State */}
      {!loading && filteredPlans.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg font-medium">No membership plans found</p>
          <p className="text-gray-400 mb-4">
            {searchTerm || tierFilter !== 'all' || statusFilter !== 'all' || billingFilter !== 'all'
              ? 'Try adjusting your filters or search terms.'
              : 'Get started by creating your first membership plan.'}
          </p>
          {!searchTerm && tierFilter === 'all' && statusFilter === 'all' && billingFilter === 'all' && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              Create First Plan
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddEditMembershipPlanModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleCreatePlan}
          mode="create"
        />
      )}

      {showEditModal && selectedPlan && (
        <AddEditMembershipPlanModal
          onClose={() => {
            setShowEditModal(false)
            setSelectedPlan(null)
          }}
          onSubmit={handleUpdatePlan}
          mode="edit"
          plan={selectedPlan}
        />
      )}

      {showDeleteModal && selectedPlan && (
        <DeleteMembershipPlanModal
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedPlan(null)
          }}
          onConfirm={handleDeletePlan}
          plan={selectedPlan}
        />
      )}
    </div>
  )
}
