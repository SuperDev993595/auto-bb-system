import React, { useState } from 'react'
import { Promotion } from '../../services/promotions'
import {
  HiExclamation,
  HiGift
} from 'react-icons/hi'
import ModalWrapper from '../../utils/ModalWrapper'

interface DeletePromotionModalProps {
  promotion: Promotion
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

const DeletePromotionModal: React.FC<DeletePromotionModalProps> = ({
  promotion,
  isOpen,
  onClose,
  onDelete
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    try {
      setLoading(true)
      setError(null)
      await onDelete(promotion._id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete promotion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Promotion"
      submitText="Delete Promotion"
      onSubmit={handleDelete}
      submitColor="bg-red-600"
    >
      <div className="p-4 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-full">
            <HiExclamation className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <h4 className="font-medium text-secondary-900">Are you sure?</h4>
            <p className="text-sm text-secondary-600">
              This action cannot be undone. This will permanently delete the promotion.
            </p>
          </div>
        </div>

        <div className="bg-secondary-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Title:</span>
              <span className="text-sm font-medium text-secondary-900">{promotion.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Type:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{promotion.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Discount:</span>
              <span className="text-sm font-medium text-secondary-900">
                {promotion.discountType === 'percentage' 
                  ? `${promotion.discountValue}%` 
                  : `$${promotion.discountValue}`
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Status:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{promotion.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Start Date:</span>
              <span className="text-sm font-medium text-secondary-900">
                {promotion.startDate ? new Date(promotion.startDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">End Date:</span>
              <span className="text-sm font-medium text-secondary-900">
                {promotion.endDate ? new Date(promotion.endDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Target Audience:</span>
              <span className="text-sm font-medium text-secondary-900">{promotion.targetAudience}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Usage Count:</span>
              <span className="text-sm font-medium text-secondary-900">{promotion.usageCount || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Max Usage:</span>
              <span className="text-sm font-medium text-secondary-900">
                {promotion.maxUsage ? promotion.maxUsage : 'Unlimited'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Created:</span>
              <span className="text-sm font-medium text-secondary-900">
                {promotion.createdAt ? new Date(promotion.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Description:</span>
              <span className="text-sm font-medium text-secondary-900 max-w-xs truncate">
                {promotion.description || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded text-sm">
          <p className="font-medium mb-1">⚠️ Warning:</p>
          <p>Deleting this promotion will also affect:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Active customer discounts</li>
            <li>Promotion tracking data</li>
            <li>Sales analytics</li>
            <li>Customer loyalty programs</li>
            <li>Marketing campaign effectiveness</li>
          </ul>
        </div>
      </div>
    </ModalWrapper>
  )
}

export default DeletePromotionModal
