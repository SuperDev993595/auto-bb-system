import React, { useState } from 'react'
import { Backup } from '../../services/backup'
import {
  HiExclamation,
  HiDatabase
} from 'react-icons/hi'
import ModalWrapper from '../../utils/ModalWrapper'

interface DeleteBackupModalProps {
  backup: Backup
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

const DeleteBackupModal: React.FC<DeleteBackupModalProps> = ({
  backup,
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
      await onDelete(backup.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete backup')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Backup"
      submitText="Delete Backup"
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
              This action cannot be undone. This will permanently delete the backup file.
            </p>
          </div>
        </div>

        <div className="bg-secondary-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Name:</span>
              <span className="text-sm font-medium text-secondary-900">{backup.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Type:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{backup.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Size:</span>
              <span className="text-sm font-medium text-secondary-900">
                {backup.size ? `${(backup.size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Status:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{backup.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Location:</span>
              <span className="text-sm font-medium text-secondary-900">{backup.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Created:</span>
              <span className="text-sm font-medium text-secondary-900">
                {backup.createdAt ? new Date(backup.createdAt).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Description:</span>
              <span className="text-sm font-medium text-secondary-900 max-w-xs truncate">
                {backup.description || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded text-sm">
          <p className="font-medium mb-1">⚠️ Warning:</p>
          <p>Deleting this backup will also affect:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Data recovery options</li>
            <li>System restore points</li>
            <li>Backup retention policy</li>
            <li>Disaster recovery plans</li>
            <li>Compliance requirements</li>
          </ul>
        </div>
      </div>
    </ModalWrapper>
  )
}

export default DeleteBackupModal
