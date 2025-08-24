import React, { useState } from 'react'
import { ServiceCatalogItem } from '../../services/services'
import {
  HiExclamation,
  HiTrash
} from 'react-icons/hi'
import ModalWrapper from '../../utils/ModalWrapper'

interface DeleteServiceModalProps {
  service: ServiceCatalogItem | null
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

const DeleteServiceModal: React.FC<DeleteServiceModalProps> = ({
  service,
  isOpen,
  onClose,
  onDelete
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!service) return
    
    try {
      setLoading(true)
      setError(null)
      await onDelete(service._id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete service')
    } finally {
      setLoading(false)
    }
  }

  // Don't render if service is null - moved after all hooks
  if (!service) return null

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Service"
      submitText="Delete Service"
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
              This action cannot be undone. This will permanently delete the service.
            </p>
          </div>
        </div>

        <div className="bg-secondary-50 p-6 rounded-lg border border-secondary-200">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Service Name:</span>
              <span className="text-sm font-medium text-secondary-900">{service.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Category:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{service.category || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Labor Rate:</span>
              <span className="text-sm font-medium text-secondary-900">
                ${service.laborRate ? service.laborRate.toFixed(2) : '0.00'}/hr
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Status:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">
                {service.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-lg">
          <p className="font-medium mb-2">⚠️ Warning:</p>
          <p>Deleting this service will also affect:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Service catalog</li>
            <li>Work orders using this service</li>
            <li>Customer bookings</li>
            <li>Pricing calculations</li>
          </ul>
        </div>
      </div>
    </ModalWrapper>
  )
}

export default DeleteServiceModal
