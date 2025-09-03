import React, { useState } from 'react'
import { InventoryItem } from '../../utils/CustomerTypes'
import {
  HiExclamation,
  HiCube
} from 'react-icons/hi'
import ModalWrapper from '../../utils/ModalWrapper'

interface DeleteInventoryModalProps {
  item: InventoryItem
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

const DeleteInventoryModal: React.FC<DeleteInventoryModalProps> = ({
  item,
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
      await onDelete(item._id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete inventory item')
    } finally {
      setLoading(false)
    }
  }

  // Don't render if no item is provided
  if (!item) {
    return null
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Inventory Item"
      submitText="Delete Item"
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
              This action cannot be undone. This will permanently delete the inventory item.
            </p>
          </div>
        </div>

        <div className="bg-secondary-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Item Name:</span>
              <span className="text-sm font-medium text-secondary-900">{item.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">SKU:</span>
              <span className="text-sm font-medium text-secondary-900">{item.partNumber || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Category:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{item.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Current Stock:</span>
              <span className="text-sm font-medium text-secondary-900">{item.currentStock}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Unit Price:</span>
              <span className="text-sm font-medium text-secondary-900">${item.costPrice?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Supplier:</span>
              <span className="text-sm font-medium text-secondary-900">
                {typeof item.supplier === 'object' ? item.supplier.name : item.supplier || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Location:</span>
              <span className="text-sm font-medium text-secondary-900">
                {typeof item.location === 'object' 
                  ? `${item.location.warehouse || ''} ${item.location.shelf || ''} ${item.location.bin || ''}`.trim()
                  : item.location || 'N/A'
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Created:</span>
              <span className="text-sm font-medium text-secondary-900">
                {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded text-sm">
          <p className="font-medium mb-1">⚠️ Warning:</p>
          <p>Deleting this inventory item will also remove:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Stock history</li>
            <li>Purchase order references</li>
            <li>Usage records</li>
            <li>Cost tracking data</li>
            <li>Inventory adjustments</li>
          </ul>
        </div>
      </div>
    </ModalWrapper>
  )
}

export default DeleteInventoryModal
