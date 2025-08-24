import React, { useState } from 'react'
import { YellowPagesData } from '../../services/yellowPages'
import {
  HiExclamation,
  HiTrash
} from 'react-icons/hi'
import ModalWrapper from '../../utils/ModalWrapper'

interface DeleteYellowPagesDataModalProps {
  data: YellowPagesData
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

const DeleteYellowPagesDataModal: React.FC<DeleteYellowPagesDataModalProps> = ({
  data,
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
      await onDelete(data.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete Yellow Pages data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Yellow Pages Data"
      submitText="Delete Data"
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
              This action cannot be undone. This will permanently delete the Yellow Pages data entry.
            </p>
          </div>
        </div>

        <div className="bg-secondary-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Business Name:</span>
              <span className="text-sm font-medium text-secondary-900">{data.businessName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Category:</span>
              <span className="text-sm font-medium text-secondary-900">{data.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Location:</span>
              <span className="text-sm font-medium text-secondary-900">{data.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Phone:</span>
              <span className="text-sm font-medium text-secondary-900">{data.phone || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Website:</span>
              <span className="text-sm font-medium text-secondary-900">{data.website || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Rating:</span>
              <span className="text-sm font-medium text-secondary-900">{data.rating || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Status:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">
                {data.status || 'Active'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Created:</span>
              <span className="text-sm font-medium text-secondary-900">
                {data.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded text-sm">
          <p className="font-medium mb-1">⚠️ Warning:</p>
          <p>Deleting this Yellow Pages data will also affect:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Business listing information</li>
            <li>Category associations</li>
            <li>Location data</li>
            <li>Contact information</li>
            <li>Rating and review data</li>
          </ul>
        </div>
      </div>
    </ModalWrapper>
  )
}

export default DeleteYellowPagesDataModal
