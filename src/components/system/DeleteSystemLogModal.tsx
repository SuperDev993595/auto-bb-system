import React, { useState } from 'react'
import { SystemLog } from '../../services/systemLogs'
import {
  HiExclamation,
  HiDocumentText
} from 'react-icons/hi'
import ModalWrapper from '../../utils/ModalWrapper'

interface DeleteSystemLogModalProps {
  systemLog: SystemLog
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

const DeleteSystemLogModal: React.FC<DeleteSystemLogModalProps> = ({
  systemLog,
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
      await onDelete(systemLog.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete system log')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Delete System Log"
      submitText="Delete Log"
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
              This action cannot be undone. This will permanently delete the system log entry.
            </p>
          </div>
        </div>

        <div className="bg-secondary-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Level:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{systemLog.level}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Category:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{systemLog.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Source:</span>
              <span className="text-sm font-medium text-secondary-900">{systemLog.source}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">User:</span>
              <span className="text-sm font-medium text-secondary-900">{systemLog.userName || 'System'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">IP Address:</span>
              <span className="text-sm font-medium text-secondary-900">{systemLog.ipAddress || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">User Agent:</span>
              <span className="text-sm font-medium text-secondary-900 max-w-xs truncate">
                {systemLog.userAgent || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Timestamp:</span>
              <span className="text-sm font-medium text-secondary-900">
                {systemLog.timestamp ? new Date(systemLog.timestamp).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Message:</span>
              <span className="text-sm font-medium text-secondary-900 max-w-xs truncate">
                {systemLog.message ? systemLog.message.substring(0, 50) + '...' : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded text-sm">
          <p className="font-medium mb-1">⚠️ Warning:</p>
          <p>Deleting this system log will also affect:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>System audit trail</li>
            <li>Security monitoring</li>
            <li>Compliance reporting</li>
            <li>Debugging information</li>
            <li>System performance analysis</li>
          </ul>
        </div>
      </div>
    </ModalWrapper>
  )
}

export default DeleteSystemLogModal
