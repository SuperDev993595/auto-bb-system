import { Users, DollarSign, TrendingUp, Crown } from '../../utils/icons'

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

interface Props {
  stats?: MembershipStats
  loading?: boolean
}

export default function MembershipPlanStats({ stats, loading = false }: Props) {
  // Add default values and null checks
  const safeStats = {
    totalPlans: stats?.totalPlans || 0,
    activePlans: stats?.activePlans || 0,
    totalMembers: stats?.totalMembers || 0,
    revenueByTier: stats?.revenueByTier || [],
    popularPlans: stats?.popularPlans || []
  }

  if (loading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'bg-blue-500'
      case 'premium': return 'bg-yellow-500'
      case 'vip': return 'bg-purple-500'
      case 'enterprise': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Plans */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Plans</p>
            <p className="text-2xl font-bold text-gray-900">{safeStats.totalPlans}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <Crown className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Active Plans */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Active Plans</p>
            <p className="text-2xl font-bold text-gray-900">{safeStats.activePlans}</p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Total Members */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Members</p>
            <p className="text-2xl font-bold text-gray-900">{safeStats.totalMembers}</p>
          </div>
          <div className="p-3 bg-purple-100 rounded-lg">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Revenue by Tier */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Revenue by Tier</p>
            <p className="text-2xl font-bold text-gray-900">
              ${safeStats.revenueByTier.reduce((sum, tier) => sum + tier.revenue, 0).toLocaleString()}
            </p>
          </div>
          <div className="p-3 bg-yellow-100 rounded-lg">
            <DollarSign className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
      </div>
    </div>
  )
}
