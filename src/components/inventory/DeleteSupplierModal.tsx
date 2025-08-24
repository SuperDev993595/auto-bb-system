import React, { useState } from 'react'
import { Supplier } from '../../services/inventory'
import {
  HiExclamation,
  HiTrash
} from 'react-icons/hi'
import ModalWrapper from '../../utils/ModalWrapper'

interface DeleteSupplierModalProps {
  supplier: Supplier
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

const DeleteSupplierModal: React.FC<DeleteSupplierModalProps> = ({
  supplier,
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
      await onDelete(supplier.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete supplier')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Supplier"
      submitText="Delete Supplier"
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
              This action cannot be undone. This will permanently delete the supplier.
            </p>
          </div>
        </div>

        <div className="bg-secondary-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Supplier Name:</span>
              <span className="text-sm font-medium text-secondary-900">{supplier.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Contact Person:</span>
              <span className="text-sm font-medium text-secondary-900">{supplier.contactPerson}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Email:</span>
              <span className="text-sm font-medium text-secondary-900">{supplier.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Phone:</span>
              <span className="text-sm font-medium text-secondary-900">{supplier.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Address:</span>
              <span className="text-sm font-medium text-secondary-900">
                {supplier.address?.street}, {supplier.address?.city}, {supplier.address?.state} {supplier.address?.zipCode}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Status:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">
                {supplier.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded text-sm">
          <p className="font-medium mb-1">⚠️ Warning:</p>
          <p>Deleting this supplier will also affect:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Associated inventory items</li>
            <li>Purchase order history</li>
            <li>Cost tracking data</li>
            <li>Supplier performance metrics</li>
          </ul>
        </div>
      </div>
    </ModalWrapper>
  )
}

export default DeleteSupplierModal
