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
      case 'active': return 'status-active'
      case 'scheduled': return 'status-pending'
      case 'ended': return 'status-inactive'
      case 'paused': return 'status-pending'
      default: return 'status-inactive'
    }
  }

  const getTypeColor = (type: Promotion['type']) => {
    switch (type) {
      case 'discount': return 'bg-primary-100 text-primary-800'
      case 'service': return 'bg-info-100 text-info-800'
      case 'referral': return 'bg-success-100 text-success-800'
      case 'seasonal': return 'bg-warning-100 text-warning-800'
      default: return 'bg-secondary-100 text-secondary-800'
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
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading promotions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-text">
            <PageTitle title="Marketing & Promotions" />
          </div>
          <div className="page-header-actions">
            <button 
              onClick={handleAddPromotion}
              className="btn-primary-outline"
            >
              <HiPlus className="w-4 h-4" />
              Create Promotion
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid-responsive">
        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-label">Active Promotions</div>
            <div className="stats-card-value text-success-600">
              {stats?.overview?.activePromotions || filteredPromotions.filter(p => p.status === 'active' && p.isActive !== false).length}
            </div>
          </div>
          <div className="stats-card-icon bg-success-500">
            <HiSpeakerphone className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-label">Total Usage</div>
            <div className="stats-card-value text-info-600">
              {stats?.overview?.totalUsage || filteredPromotions.filter(p => p.isActive !== false).reduce((sum, p) => sum + p.usageCount, 0)}
            </div>
          </div>
          <div className="stats-card-icon bg-info-500">
            <HiUsers className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-label">Scheduled</div>
            <div className="stats-card-value text-warning-600">
              {stats?.overview?.scheduledPromotions || filteredPromotions.filter(p => p.status === 'scheduled' && p.isActive !== false).length}
            </div>
          </div>
          <div className="stats-card-icon bg-warning-500">
            <HiCalendar className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-label">Avg Savings</div>
            <div className="stats-card-value text-primary-600">
              ${Math.round(stats?.overview?.avgDiscountValue || 0)}
            </div>
          </div>
          <div className="stats-card-icon bg-primary-500">
            <HiCurrencyDollar className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <HiSearch className="input-icon" />
            <input
              type="text"
              placeholder="Search promotions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field-with-icon"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-field"
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
            className="select-field"
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
      <div className="grid-responsive">
        {filteredPromotions.map(promotion => (
          <div key={promotion._id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-secondary-900">{promotion.title}</h3>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`status-badge ${getTypeColor(promotion.type)}`}>
                    {promotion.type}
                  </span>
                  <span className={`status-badge ${getStatusColor(promotion.status)}`}>
                    {promotion.status}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleEditPromotion(promotion)}
                  className="p-2 text-secondary-400 hover:text-primary-600 transition-colors"
                  title="Edit promotion"
                >
                  <HiPencil className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteClick(promotion)}
                  className="p-2 text-secondary-400 hover:text-error-600 transition-colors"
                  title="Delete promotion"
                >
                  <HiTrash className="w-4 h-4" />
                </button>
                {promotion.status === 'active' ? (
                  <button 
                    onClick={() => handleStatusUpdate(promotion._id, 'paused')}
                    className="p-2 text-secondary-400 hover:text-warning-600 transition-colors"
                    title="Pause promotion"
                  >
                    <HiPause className="w-4 h-4" />
                  </button>
                ) : promotion.status === 'paused' ? (
                  <button 
                    onClick={() => handleStatusUpdate(promotion._id, 'active')}
                    className="p-2 text-secondary-400 hover:text-success-600 transition-colors"
                    title="Activate promotion"
                  >
                    <HiPlay className="w-4 h-4" />
                  </button>
                ) : null}
              </div>
            </div>
            
            <p className="text-secondary-600 text-sm mb-4">{promotion.description}</p>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-secondary-500">Discount</span>
                <span className="font-medium text-secondary-900">
                  {promotion.discountType === 'percentage' 
                    ? `${promotion.discountValue}% off`
                    : promotion.discountValue === 0
                    ? 'Free'
                    : `$${promotion.discountValue} off`
                  }
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-secondary-500">Valid Period</span>
                <span className="font-medium text-secondary-900">
                  {formatDate(promotion.startDate)} - {formatDate(promotion.endDate)}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-secondary-500">Target</span>
                <span className="font-medium text-secondary-900">{promotion.targetAudience}</span>
              </div>
              
              {promotion.maxUsage && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-secondary-500">Usage</span>
                    <span className="font-medium text-secondary-900">{promotion.usageCount}/{promotion.maxUsage}</span>
                  </div>
                  <div className="w-full bg-secondary-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${calculateProgress(promotion.usageCount, promotion.maxUsage)}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {promotion.conditions && (
                <div className="text-xs text-secondary-500 bg-secondary-50 p-2 rounded">
                  <strong>Conditions:</strong> {promotion.conditions}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {!loading && filteredPromotions.length === 0 && (
        <div className="empty-state">
          <HiSpeakerphone className="empty-state-icon" />
          <h3 className="empty-state-title">No promotions found</h3>
          <p className="empty-state-description">Try adjusting your filters or create a new promotion.</p>
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
