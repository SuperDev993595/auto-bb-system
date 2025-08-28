import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { Bell, AlertTriangle, Clock, Shield, Crown, Car, Users } from '../utils/icons'
import notificationService from '../../services/notificationService'

interface ExpiringWarranty {
  _id: string
  name: string
  customer: {
    name: string
    email: string
  }
  vehicle: {
    make: string
    model: string
    year: number
  }
  endDate: string
  daysUntilExpiry: number
  currentMileage: number
  mileageLimit?: number
  mileagePercentage?: number
}

interface ExpiringMembership {
  _id: string
  membershipPlan: {
    name: string
    tier: string
  }
  customer: {
    name: string
    email: string
  }
  endDate: string
  daysUntilExpiry: number
  autoRenew: boolean
}

export default function NotificationDashboard() {
  const [expiringWarranties, setExpiringWarranties] = useState<ExpiringWarranty[]>([])
  const [expiringMemberships, setExpiringMemberships] = useState<ExpiringMembership[]>([])
  const [mileageWarnings, setMileageWarnings] = useState<ExpiringWarranty[]>([])
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState({
    warrantyExpiryDays: 30,
    membershipExpiryDays: 7,
    mileageWarningPercentage: 90
  })

  useEffect(() => {
    fetchNotifications()
    fetchSettings()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const [warranties, memberships, mileageWarningsData] = await Promise.all([
        notificationService.getExpiringWarranties(settings.warrantyExpiryDays),
        notificationService.getExpiringMemberships(settings.membershipExpiryDays),
        notificationService.getWarrantiesApproachingMileage(settings.mileageWarningPercentage)
      ])
      
      setExpiringWarranties(warranties)
      setExpiringMemberships(memberships)
      setMileageWarnings(mileageWarningsData)
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }

  const fetchSettings = async () => {
    try {
      const notificationSettings = await notificationService.getNotificationSettings()
      setSettings({
        warrantyExpiryDays: notificationSettings.warrantyExpiryDays,
        membershipExpiryDays: notificationSettings.membershipExpiryDays,
        mileageWarningPercentage: notificationSettings.mileageWarningPercentage
      })
    } catch (error) {
      console.error('Error fetching notification settings:', error)
    }
  }

  const getPriorityColor = (days: number) => {
    if (days <= 7) return 'text-red-600 bg-red-50 border-red-200'
    if (days <= 14) return 'text-orange-600 bg-orange-50 border-orange-200'
    return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  }

  const getMileageColor = (percentage: number) => {
    if (percentage >= 95) return 'text-red-600 bg-red-50 border-red-200'
    if (percentage >= 90) return 'text-orange-600 bg-orange-50 border-orange-200'
    return 'text-yellow-600 bg-yellow-50 border-yellow-200'
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const totalAlerts = expiringWarranties.length + expiringMemberships.length + mileageWarnings.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bell className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Notification Dashboard</h2>
            <p className="text-sm text-gray-600">Monitor expiring warranties and memberships</p>
          </div>
        </div>
        {totalAlerts > 0 && (
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium text-gray-900">
              {totalAlerts} alert{totalAlerts !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expiring Warranties</p>
              <p className="text-2xl font-bold text-gray-900">{expiringWarranties.length}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expiring Memberships</p>
              <p className="text-2xl font-bold text-gray-900">{expiringMemberships.length}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Crown className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mileage Warnings</p>
              <p className="text-2xl font-bold text-gray-900">{mileageWarnings.length}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Car className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Expiring Warranties */}
      {expiringWarranties.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-orange-500" />
              Expiring Warranties
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {expiringWarranties.map((warranty) => (
              <div key={warranty._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-gray-900">{warranty.name}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(warranty.daysUntilExpiry)}`}>
                        {warranty.daysUntilExpiry} day{warranty.daysUntilExpiry !== 1 ? 's' : ''} left
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Customer: {warranty.customer.name} • Vehicle: {warranty.vehicle.year} {warranty.vehicle.make} {warranty.vehicle.model}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Expires: {new Date(warranty.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {warranty.daysUntilExpiry} days
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expiring Memberships */}
      {expiringMemberships.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-500" />
              Expiring Memberships
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {expiringMemberships.map((membership) => (
              <div key={membership._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-gray-900">{membership.membershipPlan.name}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPriorityColor(membership.daysUntilExpiry)}`}>
                        {membership.daysUntilExpiry} day{membership.daysUntilExpiry !== 1 ? 's' : ''} left
                      </span>
                      {membership.autoRenew && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          Auto-renew
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Customer: {membership.customer.name} • Tier: {membership.membershipPlan.tier}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Expires: {new Date(membership.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      {membership.daysUntilExpiry} days
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mileage Warnings */}
      {mileageWarnings.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Car className="w-5 h-5 text-yellow-500" />
              Mileage Warnings
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {mileageWarnings.map((warranty) => (
              <div key={warranty._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-gray-900">{warranty.name}</h4>
                      {warranty.mileagePercentage && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getMileageColor(warranty.mileagePercentage)}`}>
                          {warranty.mileagePercentage}% of limit
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Customer: {warranty.customer.name} • Vehicle: {warranty.vehicle.year} {warranty.vehicle.make} {warranty.vehicle.model}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Mileage: {warranty.currentMileage.toLocaleString()}{warranty.mileageLimit ? ` / ${warranty.mileageLimit.toLocaleString()}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm text-gray-500">
                      {warranty.mileagePercentage}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalAlerts === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Bell className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No alerts</h3>
          <p className="text-gray-500">
            All warranties and memberships are up to date.
          </p>
        </div>
      )}
    </div>
  )
}
