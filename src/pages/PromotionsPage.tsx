import { useState, useEffect, useMemo } from 'react'
import { useAppSelector, useAppDispatch } from '../redux'
import PageTitle from '../components/Shared/PageTitle'
import AddPromotionModal from '../components/Promotions/AddPromotionModal'
import DeletePromotionModal from '../components/Promotions/DeletePromotionModal'
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiSpeakerphone,
  HiCalendar,
  HiCurrencyDollar,
  HiUsers,
  HiPlay,
  HiPause,
  HiSearch
} from 'react-icons/hi'
import { fetchPromotions, fetchPromotionStats, createPromotion, updatePromotion, deletePromotion, updatePromotionStatus } from '../redux/actions/promotions'
import { toast } from 'react-hot-toast'
import { Promotion, CreatePromotionData, UpdatePromotionData } from '../services/promotions'

export default function PromotionsPage() {
  const dispatch = useAppDispatch()
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { list: promotions, loading, stats } = useAppSelector(state => state.promotions)

  // Memoized filtered promotions
  const filteredPromotions = useMemo(() => {
    if (!promotions) return []
    
    return promotions.filter(promotion => {
      const matchesStatus = statusFilter === 'all' || promotion.status === statusFilter
      const matchesType = typeFilter === 'all' || promotion.type === typeFilter
      const matchesSearch = !searchTerm || 
        promotion.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        promotion.description.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesStatus && matchesType && matchesSearch
    })
  }, [promotions, statusFilter, typeFilter, searchTerm])

  // Memoized stats calculations
  const calculatedStats = useMemo(() => {
    const activePromotions = filteredPromotions.filter(p => p.status === 'active' && p.isActive !== false).length
    const totalUsage = filteredPromotions.filter(p => p.isActive !== false).reduce((sum, p) => sum + p.usageCount, 0)
    const scheduledPromotions = filteredPromotions.filter(p => p.status === 'scheduled' && p.isActive !== false).length
    
    return {
      activePromotions,
      totalUsage,
      scheduledPromotions
    }
  }, [filteredPromotions])

  // Fetch promotions and stats on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        await Promise.all([
          dispatch(fetchPromotions({
            status: statusFilter !== 'all' ? statusFilter : undefined,
            type: typeFilter !== 'all' ? typeFilter : undefined,
            search: searchTerm || undefined
          })),
          dispatch(fetchPromotionStats())
        ])
      } catch (error) {
        console.error('Error loading promotions:', error)
        toast.error('Failed to load promotions')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [dispatch])

  // Refetch promotions when filters change
  useEffect(() => {
    if (!isLoading) {
      dispatch(fetchPromotions({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        search: searchTerm || undefined
      }))
    }
  }, [statusFilter, typeFilter, searchTerm, dispatch])

  // Handle promotion creation/editing
  const handleSavePromotion = async (promotionData: CreatePromotionData | UpdatePromotionData) => {
    try {
      setIsSubmitting(true)
      
      if (selectedPromotion) {
        // Update existing promotion
        await dispatch(updatePromotion({ id: selectedPromotion._id, promotionData: promotionData as UpdatePromotionData }))
        toast.success('Promotion updated successfully!')
      } else {
        // Create new promotion
        await dispatch(createPromotion(promotionData as CreatePromotionData))
        toast.success('Promotion created successfully!')
      }
      
      setShowAddModal(false)
      setSelectedPromotion(null)
      
      // Refresh promotions
      dispatch(fetchPromotions({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        search: searchTerm || undefined
      }))
      dispatch(fetchPromotionStats())
      
    } catch (error) {
      console.error('Error saving promotion:', error)
      toast.error('Failed to save promotion')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle promotion deletion
  const handleDeletePromotion = async (promotionId: string) => {
    try {
      setIsSubmitting(true)
      await dispatch(deletePromotion(promotionId))
      toast.success('Promotion deleted successfully!')
      
      setShowDeleteModal(false)
      setSelectedPromotion(null)
      
      // Refresh promotions
      dispatch(fetchPromotions({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        search: searchTerm || undefined
      }))
      dispatch(fetchPromotionStats())
      
    } catch (error) {
      console.error('Error deleting promotion:', error)
      toast.error('Failed to delete promotion')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle status update
  const handleStatusUpdate = async (promotionId: string, status: Promotion['status']) => {
    try {
      await dispatch(updatePromotionStatus({ id: promotionId, status }))
      toast.success('Promotion status updated successfully!')
      
      // Refresh promotions
      dispatch(fetchPromotions({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        search: searchTerm || undefined
      }))
      dispatch(fetchPromotionStats())
      
    } catch (error) {
      console.error('Error updating promotion status:', error)
      toast.error('Failed to update promotion status')
    }
  }

  // Open edit modal
  const handleEditPromotion = (promotion: Promotion) => {
    setSelectedPromotion(promotion)
    setShowAddModal(true)
  }

  // Open delete modal
  const handleDeleteClick = (promotion: Promotion) => {
    setSelectedPromotion(promotion)
    setShowDeleteModal(true)
  }

  // Open create modal
  const handleAddPromotion = () => {
    setSelectedPromotion(null)
    setShowAddModal(true)
  }

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="text-gray-600">Loading promotions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Marketing & Promotions</h1>
            <p className="text-gray-600">Manage marketing campaigns and promotional offers</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleAddPromotion}
              className="p-3 bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-colors"
              title="Create Promotion"
            >
              <HiPlus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Active Promotions: {stats?.overview?.activePromotions || calculatedStats.activePromotions}
            </span>
            <span className="text-sm text-gray-500">
              Total Usage: {stats?.overview?.totalUsage || calculatedStats.totalUsage}
            </span>
            <span className="text-sm text-gray-500">
              Scheduled: {stats?.overview?.scheduledPromotions || calculatedStats.scheduledPromotions}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="ended">Ended</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Promotions</p>
              <p className="text-2xl font-bold text-green-600">
                {stats?.overview?.activePromotions || calculatedStats.activePromotions}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <HiSpeakerphone className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Usage</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats?.overview?.totalUsage || calculatedStats.totalUsage}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <HiUsers className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats?.overview?.scheduledPromotions || calculatedStats.scheduledPromotions}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <HiCalendar className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Savings</p>
              <p className="text-2xl font-bold text-blue-600">
                ${Math.round(stats?.overview?.avgDiscountValue || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <HiCurrencyDollar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search promotions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="scheduled">Scheduled</option>
          <option value="ended">Ended</option>
          <option value="paused">Paused</option>
        </select>
        
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Types</option>
          <option value="discount">Discount</option>
          <option value="service">Service</option>
          <option value="referral">Referral</option>
          <option value="seasonal">Seasonal</option>
        </select>
      </div>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPromotions.map(promotion => (
          <div key={promotion._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{promotion.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(promotion.type)}`}>
                    {promotion.type}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(promotion.status)}`}>
                    {promotion.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleEditPromotion(promotion)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Edit promotion"
                >
                  <HiPencil className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteClick(promotion)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete promotion"
                >
                  <HiTrash className="w-4 h-4" />
                </button>
                {promotion.status === 'active' ? (
                  <button 
                    onClick={() => handleStatusUpdate(promotion._id, 'paused')}
                    className="p-2 text-gray-400 hover:text-yellow-600 transition-colors"
                    title="Pause promotion"
                  >
                    <HiPause className="w-4 h-4" />
                  </button>
                ) : promotion.status === 'paused' ? (
                  <button 
                    onClick={() => handleStatusUpdate(promotion._id, 'active')}
                    className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                    title="Activate promotion"
                  >
                    <HiPlay className="w-4 h-4" />
                  </button>
                ) : null}
              </div>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">{promotion.description}</p>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Discount</span>
                <span className="font-medium text-gray-900">
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
                <span className="font-medium text-gray-900">
                  {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Target</span>
                <span className="font-medium text-gray-900">{promotion.targetAudience}</span>
              </div>
              
              {promotion.maxUsage && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">Usage</span>
                    <span className="font-medium text-gray-900">{promotion.usageCount}/{promotion.maxUsage}</span>
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

      {!loading && filteredPromotions.length === 0 && (
        <div className="text-center py-12">
          <HiSpeakerphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No promotions found</h3>
          <p className="text-gray-500">Try adjusting your filters or create a new promotion.</p>
        </div>
      )}

      {/* Add/Edit Promotion Modal */}
      <AddPromotionModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false)
          setSelectedPromotion(null)
        }}
        onSave={handleSavePromotion}
        promotion={selectedPromotion}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      {selectedPromotion && (
        <DeletePromotionModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setSelectedPromotion(null)
          }}
          onDelete={handleDeletePromotion}
          promotion={selectedPromotion}
        />
      )}
    </div>
  )
}
