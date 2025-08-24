import React, { useState } from 'react'
import { Towing } from '../../services/towing'
import {
  HiExclamation,
  HiTruck
} from 'react-icons/hi'
import ModalWrapper from '../../utils/ModalWrapper'

interface DeleteTowingModalProps {
  towing: Towing
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

const DeleteTowingModal: React.FC<DeleteTowingModalProps> = ({
  towing,
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
      await onDelete(towing.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete towing record')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Towing Record"
      submitText="Delete Record"
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
              This action cannot be undone. This will permanently delete the towing record.
            </p>
          </div>
        </div>

        <div className="bg-secondary-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Customer:</span>
              <span className="text-sm font-medium text-secondary-900">{towing.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Vehicle:</span>
              <span className="text-sm font-medium text-secondary-900">
                {towing.vehicleYear} {towing.vehicleMake} {towing.vehicleModel}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">License Plate:</span>
              <span className="text-sm font-medium text-secondary-900">{towing.licensePlate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Pickup Location:</span>
              <span className="text-sm font-medium text-secondary-900">{towing.pickupLocation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Destination:</span>
              <span className="text-sm font-medium text-secondary-900">{towing.destination}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Service Type:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{towing.serviceType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Status:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{towing.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Requested Date:</span>
              <span className="text-sm font-medium text-secondary-900">
                {towing.requestedDate ? new Date(towing.requestedDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Cost:</span>
              <span className="text-sm font-medium text-secondary-900">
                ${towing.cost ? towing.cost.toFixed(2) : '0.00'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded text-sm">
          <p className="font-medium mb-1">⚠️ Warning:</p>
          <p>Deleting this towing record will also affect:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Customer service history</li>
            <li>Vehicle towing records</li>
            <li>Billing and invoicing data</li>
            <li>Service scheduling information</li>
            <li>Customer communication logs</li>
          </ul>
        </div>
      </div>
    </ModalWrapper>
  )
}

export default DeleteTowingModal
