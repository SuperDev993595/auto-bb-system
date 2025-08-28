import { Shield, AlertTriangle, CheckCircle, Clock } from '../../utils/icons'

interface WarrantyStats {
  totalWarranties: number
  activeWarranties: number
  expiringSoon: number
  mileageExpiring: number
  statusBreakdown: Array<{
    _id: string
    count: number
    totalClaims: number
    totalClaimAmount: number
  }>
}

interface Props {
  stats: WarrantyStats
}

export default function WarrantyStats({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Warranties */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Total Warranties</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalWarranties}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-lg">
            <Shield className="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Active Warranties */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Active Warranties</p>
            <p className="text-2xl font-bold text-gray-900">{stats.activeWarranties}</p>
          </div>
          <div className="p-3 bg-green-100 rounded-lg">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Expiring Soon */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
            <p className="text-2xl font-bold text-gray-900">{stats.expiringSoon}</p>
          </div>
          <div className="p-3 bg-orange-100 rounded-lg">
            <Clock className="w-6 h-6 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Mileage Expiring */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Mileage Expiring</p>
            <p className="text-2xl font-bold text-gray-900">{stats.mileageExpiring}</p>
          </div>
          <div className="p-3 bg-yellow-100 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
          </div>
        </div>
      </div>
    </div>
  )
}
