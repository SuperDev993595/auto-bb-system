import React, { useState } from 'react'
import { Arrangement } from '../../services/arrangements'
import {
  HiExclamation,
  HiCalendar
} from 'react-icons/hi'
import ModalWrapper from '../../utils/ModalWrapper'

interface DeleteArrangementModalProps {
  arrangement: Arrangement
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

const DeleteArrangementModal: React.FC<DeleteArrangementModalProps> = ({
  arrangement,
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
      await onDelete(arrangement.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete arrangement')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Arrangement"
      submitText="Delete Arrangement"
      onSubmit={handleDelete}
      isLoading={loading}
      submitButtonVariant="error"
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
              This action cannot be undone. This will permanently delete the arrangement.
            </p>
          </div>
        </div>

        <div className="bg-secondary-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Customer:</span>
              <span className="text-sm font-medium text-secondary-900">{arrangement.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Type:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{arrangement.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Amount:</span>
              <span className="text-sm font-medium text-secondary-900">
                ${arrangement.amount ? arrangement.amount.toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Payment Plan:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{arrangement.paymentPlan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Status:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{arrangement.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Start Date:</span>
              <span className="text-sm font-medium text-secondary-900">
                {arrangement.startDate ? new Date(arrangement.startDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Due Date:</span>
              <span className="text-sm font-medium text-secondary-900">
                {arrangement.dueDate ? new Date(arrangement.dueDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Created:</span>
              <span className="text-sm font-medium text-secondary-900">
                {arrangement.createdAt ? new Date(arrangement.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded text-sm">
          <p className="font-medium mb-1">⚠️ Warning:</p>
          <p>Deleting this arrangement will also affect:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Payment plan records</li>
            <li>Customer billing history</li>
            <li>Financial reporting data</li>
            <li>Payment schedule information</li>
            <li>Customer account balance</li>
          </ul>
        </div>
      </div>
    </ModalWrapper>
  )
}

export default DeleteArrangementModal
