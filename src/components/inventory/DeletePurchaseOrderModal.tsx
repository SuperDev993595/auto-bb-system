import React, { useState } from 'react'
import { PurchaseOrder } from '../../services/inventory'
import {
  HiExclamation,
  HiShoppingCart
} from 'react-icons/hi'
import ModalWrapper from '../../utils/ModalWrapper'

interface DeletePurchaseOrderModalProps {
  purchaseOrder: PurchaseOrder
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

const DeletePurchaseOrderModal: React.FC<DeletePurchaseOrderModalProps> = ({
  purchaseOrder,
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
      await onDelete(purchaseOrder._id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete purchase order')
    } finally {
      setLoading(false)
    }
  }

  // Don't render if no purchase order is provided
  if (!purchaseOrder) {
    return null
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Purchase Order"
      submitText="Delete Purchase Order"
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
              This action cannot be undone. This will permanently delete the purchase order.
            </p>
          </div>
        </div>

        <div className="bg-secondary-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">PO Number:</span>
              <span className="text-sm font-medium text-secondary-900">#{purchaseOrder.poNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Supplier:</span>
              <span className="text-sm font-medium text-secondary-900">{purchaseOrder.supplier?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Order Date:</span>
              <span className="text-sm font-medium text-secondary-900">
                {purchaseOrder.orderDate ? new Date(purchaseOrder.orderDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Expected Delivery:</span>
              <span className="text-sm font-medium text-secondary-900">
                {purchaseOrder.expectedDelivery ? new Date(purchaseOrder.expectedDelivery).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Total Amount:</span>
              <span className="text-sm font-medium text-secondary-900">${purchaseOrder.totalAmount?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Status:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{purchaseOrder.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Items:</span>
              <span className="text-sm font-medium text-secondary-900">
                {purchaseOrder.items?.length || 0} item(s)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Created:</span>
              <span className="text-sm font-medium text-secondary-900">
                {purchaseOrder.createdAt ? new Date(purchaseOrder.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded text-sm">
          <p className="font-medium mb-1">⚠️ Warning:</p>
          <p>Deleting this purchase order will also remove:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>All line items</li>
            <li>Delivery tracking</li>
            <li>Payment records</li>
            <li>Inventory adjustments</li>
            <li>Supplier order history</li>
          </ul>
        </div>
      </div>
    </ModalWrapper>
  )
}

export default DeletePurchaseOrderModal
