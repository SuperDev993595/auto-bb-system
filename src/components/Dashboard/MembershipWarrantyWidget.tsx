import { useState, useEffect } from 'react'
import { Crown, Shield, TrendingUp, AlertTriangle, Plus, Eye } from '../utils/icons'
import { Link } from 'react-router-dom'

interface DashboardStats {
  totalMemberships: number
  activeMemberships: number
  totalWarranties: number
  expiringWarranties: number
  expiringMemberships: number
  recentActivity: Array<{
    id: string
    type: 'membership' | 'warranty'
    action: string
    description: string
    date: string
    status: 'success' | 'warning' | 'error'
  }>
}

export default function MembershipWarrantyWidget() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMemberships: 0,
    activeMemberships: 0,
    totalWarranties: 0,
    expiringWarranties: 0,
    expiringMemberships: 0,
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)

  // Mock data for demonstration
  useEffect(() => {
    const mockStats: DashboardStats = {
      totalMemberships: 156,
      activeMemberships: 142,
      totalWarranties: 89,
      expiringWarranties: 12,
      expiringMemberships: 8,
      recentActivity: [
        {
          id: '1',
          type: 'membership',
          action: 'Renewed',
          description: 'Premium membership renewed for John Smith',
          date: '2024-03-15',
          status: 'success'
        },
        {
          id: '2',
          type: 'warranty',
          action: 'Claim Filed',
          description: 'Extended warranty claim for Toyota Camry',
          date: '2024-03-14',
          status: 'warning'
        },
        {
          id: '3',
          type: 'membership',
          action: 'Upgraded',
          description: 'Basic to Premium upgrade for Sarah Johnson',
          date: '2024-03-13',
          status: 'success'
        },
        {
          id: '4',
          type: 'warranty',
          action: 'Expired',
          description: 'Manufacturer warranty expired for Honda CR-V',
          date: '2024-03-12',
          status: 'error'
        }
      ]
    }
    
    // Simulate API call
    setTimeout(() => {
      setStats(mockStats)
      setLoading(false)
    }, 500)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-100'
      case 'warning':
        return 'text-yellow-600 bg-yellow-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'membership':
        return <Crown className="w-4 h-4" />
      case 'warranty':
        return <Shield className="w-4 h-4" />
      default:
        return <Eye className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Memberships & Warranties</h3>
          <p className="text-sm text-gray-600">Overview of customer plans and coverage</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/membership-plans"
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Memberships"
          >
            <Crown className="w-4 h-4" />
          </Link>
          <Link
            to="/warranty-management"
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="View Warranties"
          >
            <Shield className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Memberships */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Crown className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
              {stats.expiringMemberships} expiring
            </span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{stats.totalMemberships}</div>
          <div className="text-sm text-blue-600">Total Memberships</div>
          <div className="text-xs text-blue-500 mt-1">
            {stats.activeMemberships} active
          </div>
        </div>

        {/* Warranties */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
              {stats.expiringWarranties} expiring
            </span>
          </div>
          <div className="text-2xl font-bold text-green-900">{stats.totalWarranties}</div>
          <div className="text-sm text-green-600">Total Warranties</div>
          <div className="text-xs text-green-500 mt-1">
            {stats.totalWarranties - stats.expiringWarranties} active
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2 mb-6">
        <Link
          to="/membership-plans"
          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Membership
        </Link>
        <Link
          to="/warranty-management"
          className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Warranty
        </Link>
      </div>

      {/* Recent Activity */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Recent Activity</h4>
        <div className="space-y-3">
          {stats.recentActivity.slice(0, 4).map((activity) => (
            <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className={`p-1 rounded ${getStatusColor(activity.status)}`}>
                {getTypeIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">{activity.action}</span>
                  <span className="text-xs text-gray-500">
                    {new Date(activity.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-gray-600 truncate">{activity.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View All Link */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <Link
          to="/membership-plans"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
        >
          View all memberships and warranties
          <TrendingUp className="w-3 h-3" />
        </Link>
      </div>
    </div>
  )
}
