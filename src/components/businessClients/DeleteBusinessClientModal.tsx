import React, { useState } from 'react'
import { BusinessClient } from '../../services/businessClients'
import {
  HiExclamation,
  HiTrash
} from 'react-icons/hi'
import ModalWrapper from '../../utils/ModalWrapper'

interface DeleteBusinessClientModalProps {
  businessClient: BusinessClient
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

const DeleteBusinessClientModal: React.FC<DeleteBusinessClientModalProps> = ({
  businessClient,
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
      await onDelete(businessClient.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete business client')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Business Client"
      submitText="Delete Business Client"
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
              This action cannot be undone. This will permanently delete the business client.
            </p>
          </div>
        </div>

        <div className="bg-secondary-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Business Name:</span>
              <span className="text-sm font-medium text-secondary-900">{businessClient.businessName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Contact Person:</span>
              <span className="text-sm font-medium text-secondary-900">
                {businessClient.contactPerson?.firstName} {businessClient.contactPerson?.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Email:</span>
              <span className="text-sm font-medium text-secondary-900">{businessClient.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Phone:</span>
              <span className="text-sm font-medium text-secondary-900">{businessClient.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Industry:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{businessClient.industry}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Address:</span>
              <span className="text-sm font-medium text-secondary-900">
                {businessClient.address?.street}, {businessClient.address?.city}, {businessClient.address?.state} {businessClient.address?.zipCode}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Status:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">
                {businessClient.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded text-sm">
          <p className="font-medium mb-1">⚠️ Warning:</p>
          <p>Deleting this business client will also remove:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>All contact information</li>
            <li>Service history</li>
            <li>Contract details</li>
            <li>Communication logs</li>
            <li>Billing records</li>
          </ul>
        </div>
      </div>
    </ModalWrapper>
  )
}

export default DeleteBusinessClientModal
