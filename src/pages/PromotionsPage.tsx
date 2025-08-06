import { useState } from 'react'
import PageTitle from '../components/Shared/PageTitle'
import {
  HiPlus,
  HiEye,
  HiPencil,
  HiTrash,
  HiMail,
  HiPhone,
  HiGlobeAlt,
  HiSpeakerphone,
  HiCalendar,
  HiCurrencyDollar,
  HiUsers,
  HiTrendingUp,
  HiPlay,
  HiPause
} from 'react-icons/hi'

interface Promotion {
  id: string
  title: string
  description: string
  type: 'discount' | 'service' | 'referral' | 'seasonal'
  discountValue: number
  discountType: 'percentage' | 'fixed'
  startDate: string
  endDate: string
  status: 'active' | 'scheduled' | 'ended' | 'paused'
  targetAudience: string
  usageCount: number
  maxUsage?: number
  conditions?: string
}

export default function PromotionsPage() {
  const [statusFilter, setStatusFilter] = useState('all')

  const promotions: Promotion[] = [
    {
      id: '1',
      title: 'Summer Oil Change Special',
      description: 'Get 20% off your oil change service during the hot summer months. Includes filter replacement and fluid top-off.',
      type: 'service',
      discountValue: 20,
      discountType: 'percentage',
      startDate: '2025-06-01',
      endDate: '2025-08-31',
      status: 'active',
      targetAudience: 'All Customers',
      usageCount: 45,
      maxUsage: 100,
      conditions: 'Valid for synthetic oil only'
    },
    {
      id: '2',
      title: 'Brake Safety Check',
      description: 'Free brake inspection with any service. Ensure your family\'s safety on the road.',
      type: 'service',
      discountValue: 0,
      discountType: 'fixed',
      startDate: '2025-07-01',
      endDate: '2025-09-30',
      status: 'active',
      targetAudience: 'All Customers',
      usageCount: 28,
      conditions: 'Must be combined with another service'
    },
    {
      id: '3',
      title: 'Customer Referral Program',
      description: 'Refer a friend and both of you get $25 off your next service. The more you refer, the more you save!',
      type: 'referral',
      discountValue: 25,
      discountType: 'fixed',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      status: 'active',
      targetAudience: 'Existing Customers',
      usageCount: 15,
      conditions: 'Referred customer must complete service'
    },
    {
      id: '4',
      title: 'Back to School Special',
      description: '15% off any service for students and teachers. Valid with student/teacher ID.',
      type: 'discount',
      discountValue: 15,
      discountType: 'percentage',
      startDate: '2025-08-15',
      endDate: '2025-09-15',
      status: 'scheduled',
      targetAudience: 'Students & Teachers',
      usageCount: 0,
      maxUsage: 50,
      conditions: 'Must present valid student or teacher ID'
    },
    {
      id: '5',
      title: 'Winter Tire Installation',
      description: 'Free tire installation with purchase of 4 winter tires. Get ready for the cold season!',
      type: 'seasonal',
      discountValue: 80,
      discountType: 'fixed',
      startDate: '2024-11-01',
      endDate: '2025-01-31',
      status: 'ended',
      targetAudience: 'All Customers',
      usageCount: 32,
      maxUsage: 40,
      conditions: 'Must purchase 4 tires of same brand'
    }
  ]

  const filteredPromotions = promotions.filter(promo => 
    statusFilter === 'all' || promo.status === statusFilter
  )

  const getStatusColor = (status: Promotion['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'ended': return 'bg-gray-100 text-gray-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: Promotion['type']) => {
    switch (type) {
      case 'discount': return 'bg-purple-100 text-purple-800'
      case 'service': return 'bg-blue-100 text-blue-800'
      case 'referral': return 'bg-green-100 text-green-800'
      case 'seasonal': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const calculateProgress = (used: number, max?: number) => {
    if (!max) return 0
    return (used / max) * 100
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <PageTitle title="Marketing & Promotions" />
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <HiPlus className="w-4 h-4" />
          Create Promotion
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Promotions</p>
              <p className="text-2xl font-bold text-green-600">
                {promotions.filter(p => p.status === 'active').length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <HiSpeakerphone className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Usage</p>
              <p className="text-2xl font-bold text-blue-600">
                {promotions.reduce((sum, p) => sum + p.usageCount, 0)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <HiUsers className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-purple-600">
                {promotions.filter(p => p.status === 'scheduled').length}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <HiCalendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Savings</p>
              <p className="text-2xl font-bold text-yellow-600">$32</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <HiCurrencyDollar className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex gap-4 items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="scheduled">Scheduled</option>
            <option value="ended">Ended</option>
            <option value="paused">Paused</option>
          </select>
        </div>
      </div>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPromotions.map(promotion => (
          <div key={promotion.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{promotion.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(promotion.type)}`}>
                    {promotion.type}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(promotion.status)}`}>
                    {promotion.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-gray-400 hover:text-blue-600">
                  <HiEye className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-green-600">
                  <HiPencil className="w-4 h-4" />
                </button>
                {promotion.status === 'active' ? (
                  <button className="p-2 text-gray-400 hover:text-yellow-600">
                    <HiPause className="w-4 h-4" />
                  </button>
                ) : promotion.status === 'paused' ? (
                  <button className="p-2 text-gray-400 hover:text-green-600">
                    <HiPlay className="w-4 h-4" />
                  </button>
                ) : null}
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">{promotion.description}</p>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Discount</span>
                <span className="font-medium">
                  {promotion.discountType === 'percentage' 
                    ? `${promotion.discountValue}% off`
                    : promotion.discountValue === 0
                    ? 'Free'
                    : `$${promotion.discountValue} off`
                  }
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Valid Period</span>
                <span className="font-medium">
                  {new Date(promotion.startDate).toLocaleDateString()} - {new Date(promotion.endDate).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Target</span>
                <span className="font-medium">{promotion.targetAudience}</span>
              </div>
              
              {promotion.maxUsage && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Usage</span>
                    <span className="font-medium">{promotion.usageCount}/{promotion.maxUsage}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${calculateProgress(promotion.usageCount, promotion.maxUsage)}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {promotion.conditions && (
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  <strong>Conditions:</strong> {promotion.conditions}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredPromotions.length === 0 && (
        <div className="text-center py-12">
          <HiSpeakerphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">No promotions found</h3>
          <p className="text-gray-400">Try adjusting your filters or create a new promotion.</p>
        </div>
      )}
    </div>
  )
}
