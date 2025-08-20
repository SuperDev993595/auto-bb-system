import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../redux'
import PageTitle from '../components/Shared/PageTitle'
import AddPromotionModal from '../components/Promotions/AddPromotionModal'
import DeletePromotionModal from '../components/Promotions/DeletePromotionModal'
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

  const filteredPromotions = promotions || []

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
  const handleDeletePromotion = async () => {
    if (!selectedPromotion) return
    
    try {
      setIsSubmitting(true)
      await dispatch(deletePromotion(selectedPromotion._id))
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
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="text-gray-600">Loading promotions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <PageTitle title="Marketing & Promotions" />
        <button 
          onClick={handleAddPromotion}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
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
                {stats?.overview?.activePromotions || filteredPromotions.filter(p => p.status === 'active').length}
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
                {stats?.overview?.totalUsage || filteredPromotions.reduce((sum, p) => sum + p.usageCount, 0)}
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
                {stats?.overview?.scheduledPromotions || filteredPromotions.filter(p => p.status === 'scheduled').length}
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
              <p className="text-2xl font-bold text-yellow-600">
                ${Math.round(stats?.overview?.avgDiscountValue || 0)}
              </p>
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
          <div className="flex-1 relative">
            <HiSearch className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search promotions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          
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
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="all">All Types</option>
            <option value="discount">Discount</option>
            <option value="service">Service</option>
            <option value="referral">Referral</option>
            <option value="seasonal">Seasonal</option>
          </select>
        </div>
      </div>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredPromotions.map(promotion => (
          <div key={promotion._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                <button 
                  onClick={() => handleEditPromotion(promotion)}
                  className="p-2 text-gray-400 hover:text-blue-600"
                  title="Edit promotion"
                >
                  <HiPencil className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteClick(promotion)}
                  className="p-2 text-gray-400 hover:text-red-600"
                  title="Delete promotion"
                >
                  <HiTrash className="w-4 h-4" />
                </button>
                {promotion.status === 'active' ? (
                  <button 
                    onClick={() => handleStatusUpdate(promotion._id, 'paused')}
                    className="p-2 text-gray-400 hover:text-yellow-600"
                    title="Pause promotion"
                  >
                    <HiPause className="w-4 h-4" />
                  </button>
                ) : promotion.status === 'paused' ? (
                  <button 
                    onClick={() => handleStatusUpdate(promotion._id, 'active')}
                    className="p-2 text-gray-400 hover:text-green-600"
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
                  {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
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

      {!loading && filteredPromotions.length === 0 && (
        <div className="text-center py-12">
          <HiSpeakerphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-500 mb-2">No promotions found</h3>
          <p className="text-gray-400">Try adjusting your filters or create a new promotion.</p>
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
      <DeletePromotionModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedPromotion(null)
        }}
        onConfirm={handleDeletePromotion}
        promotionTitle={selectedPromotion?.title || ''}
        isLoading={isSubmitting}
      />
    </div>
  )
}
