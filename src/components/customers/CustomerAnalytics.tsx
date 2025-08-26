import { useState, useEffect } from 'react'
import { TrendingUp, Users, Car, DollarSign, Calendar, MapPin, Activity, Star, Target } from '../../utils/icons'

interface CustomerMetrics {
  totalCustomers: number
  activeCustomers: number
  newThisMonth: number
  totalVehicles: number
  averageVehiclesPerCustomer: number
  totalRevenue: number
  averageRevenuePerCustomer: number
  topPerformingCustomers: Array<{
    id: string
    name: string
    revenue: number
    vehicles: number
    appointments: number
  }>
  customerRetentionRate: number
  geographicDistribution: Array<{
    city: string
    count: number
    percentage: number
  }>
  monthlyGrowth: Array<{
    month: string
    customers: number
    revenue: number
  }>
}

interface Props {
  customerId?: string // Optional: if provided, show individual customer analytics
}

export default function CustomerAnalytics({ customerId }: Props) {
  const [metrics, setMetrics] = useState<CustomerMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  useEffect(() => {
    // In a real app, this would fetch from an API
    // For now, using mock data
    const fetchMetrics = async () => {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockMetrics: CustomerMetrics = {
        totalCustomers: 1247,
        activeCustomers: 892,
        newThisMonth: 45,
        totalVehicles: 2156,
        averageVehiclesPerCustomer: 1.73,
        totalRevenue: 284750.50,
        averageRevenuePerCustomer: 228.35,
        topPerformingCustomers: [
          { id: '1', name: 'John Smith', revenue: 12500.00, vehicles: 3, appointments: 12 },
          { id: '2', name: 'ABC Company', revenue: 8900.00, vehicles: 8, appointments: 15 },
          { id: '3', name: 'Sarah Johnson', revenue: 7200.00, vehicles: 2, appointments: 8 },
          { id: '4', name: 'XYZ Fleet', revenue: 6800.00, vehicles: 12, appointments: 22 },
          { id: '5', name: 'Mike Wilson', revenue: 5400.00, vehicles: 1, appointments: 6 }
        ],
        customerRetentionRate: 87.5,
        geographicDistribution: [
          { city: 'New York', count: 234, percentage: 18.8 },
          { city: 'Los Angeles', count: 189, percentage: 15.2 },
          { city: 'Chicago', count: 156, percentage: 12.5 },
          { city: 'Houston', count: 134, percentage: 10.7 },
          { city: 'Phoenix', count: 98, percentage: 7.9 }
        ],
        monthlyGrowth: [
          { month: 'Jan', customers: 1200, revenue: 265000 },
          { month: 'Feb', customers: 1220, revenue: 268000 },
          { month: 'Mar', customers: 1240, revenue: 272000 },
          { month: 'Apr', customers: 1247, revenue: 284750 }
        ]
      }
      
      setMetrics(mockMetrics)
      setLoading(false)
    }

    fetchMetrics()
  }, [customerId, timeRange])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Customer Analytics</h2>
          <p className="text-gray-600">Performance metrics and insights</p>
        </div>
        
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.totalCustomers.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+{metrics.newThisMonth} this month</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Customers</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.activeCustomers.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">
              {((metrics.activeCustomers / metrics.totalCustomers) * 100).toFixed(1)}% retention
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
              <p className="text-3xl font-bold text-gray-900">{metrics.totalVehicles.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Car className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">
              {metrics.averageVehiclesPerCustomer.toFixed(1)} per customer
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">${(metrics.totalRevenue / 1000).toFixed(0)}k</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-gray-600">
              ${metrics.averageRevenuePerCustomer.toFixed(0)} avg per customer
            </span>
          </div>
        </div>
      </div>

      {/* Charts and Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Customers */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Performing Customers</h3>
            <Star className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="space-y-3">
            {metrics.topPerformingCustomers.map((customer, index) => (
              <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-600">{customer.vehicles} vehicles • {customer.appointments} appointments</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">${customer.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Geographic Distribution</h3>
            <MapPin className="w-5 h-5 text-blue-500" />
          </div>
          <div className="space-y-3">
            {metrics.geographicDistribution.map((location) => (
              <div key={location.city} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">{location.city}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${location.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {location.count} ({location.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Growth Chart */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Growth</h3>
          <Target className="w-5 h-5 text-green-500" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {metrics.monthlyGrowth.map((month) => (
            <div key={month.month} className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600">{month.month}</p>
              <p className="text-xl font-bold text-gray-900">{month.customers}</p>
              <p className="text-sm text-green-600">${(month.revenue / 1000).toFixed(0)}k</p>
            </div>
          ))}
        </div>
      </div>

      {/* Customer Retention Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Customer Retention Insights</h3>
            <p className="text-gray-600">Key metrics for customer loyalty and satisfaction</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{metrics.customerRetentionRate}%</p>
            <p className="text-sm text-gray-600">Retention Rate</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{metrics.averageVehiclesPerCustomer.toFixed(1)}</p>
            <p className="text-sm text-gray-600">Avg Vehicles/Customer</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">${metrics.averageRevenuePerCustomer.toFixed(0)}</p>
            <p className="text-sm text-gray-600">Avg Revenue/Customer</p>
          </div>
        </div>
      </div>
    </div>
  )
}
