import React, { useState } from 'react'
import { WorkOrder } from '../../services/services'
import {
  HiExclamation,
  HiTrash
} from 'react-icons/hi'
import ModalWrapper from '../../utils/ModalWrapper'

interface DeleteWorkOrderModalProps {
  workOrder: WorkOrder
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

const DeleteWorkOrderModal: React.FC<DeleteWorkOrderModalProps> = ({
  workOrder,
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
      await onDelete(workOrder.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete work order')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Work Order"
      submitText="Delete Work Order"
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
              This action cannot be undone. This will permanently delete the work order.
            </p>
          </div>
        </div>

        <div className="bg-secondary-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Work Order Number:</span>
              <span className="text-sm font-medium text-secondary-900">#{workOrder.workOrderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Customer:</span>
              <span className="text-sm font-medium text-secondary-900">{workOrder.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Vehicle:</span>
              <span className="text-sm font-medium text-secondary-900">{workOrder.vehicleInfo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Status:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{workOrder.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Priority:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{workOrder.priority}</span>
            </div>
          </div>
        </div>
      </div>
    </ModalWrapper>
  )
}

export default DeleteWorkOrderModal
