import React, { useState } from 'react'
import { WorkOrder } from '../../services/services'
import {
  HiExclamation,
  HiTrash
} from 'react-icons/hi'
import ModalWrapper from '../../utils/ModalWrapper'

interface DeleteWorkOrderModalProps {
  workOrder: WorkOrder | null
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
    if (!workOrder) return
    
    try {
      setLoading(true)
      setError(null)
      await onDelete(workOrder._id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete work order')
    } finally {
      setLoading(false)
    }
  }

  // Don't render if workOrder is null - moved after all hooks
  if (!workOrder) return null

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Work Order"
      submitText="Delete Work Order"
      onSubmit={handleDelete}
      submitColor="bg-red-600"
    >
      <div className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-full">
            <HiExclamation className="w-7 h-7 text-red-600" />
          </div>
          <div>
            <h4 className="font-medium text-secondary-900 text-lg">Are you sure?</h4>
            <p className="text-sm text-secondary-600 mt-1">
              This action cannot be undone. This will permanently delete the work order.
            </p>
          </div>
        </div>

        <div className="bg-secondary-50 p-6 rounded-lg border border-secondary-200">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Work Order Number:</span>
              <span className="text-sm font-medium text-secondary-900">#{workOrder.workOrderNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Customer:</span>
              <span className="text-sm font-medium text-secondary-900">
                {workOrder.customer?.name || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Vehicle:</span>
              <span className="text-sm font-medium text-secondary-900">
                {workOrder.vehicle ? 
                  `${workOrder.vehicle.make || 'N/A'} ${workOrder.vehicle.model || 'N/A'} (${workOrder.vehicle.year || 'N/A'})` 
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Status:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{workOrder.status || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Priority:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{workOrder.priority || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Total Cost:</span>
              <span className="text-sm font-medium text-secondary-900">
                ${workOrder.totalCost ? workOrder.totalCost.toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-lg">
          <p className="font-medium mb-2">⚠️ Warning:</p>
          <p>Deleting this work order will also affect:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Customer service history</li>
            <li>Technician assignments</li>
            <li>Parts inventory</li>
            <li>Financial records</li>
            <li>Service scheduling</li>
          </ul>
        </div>
      </div>
    </ModalWrapper>
  )
}

export default DeleteWorkOrderModal
