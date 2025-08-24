import React, { useState } from 'react'
import { SystemHealth } from '../../services/systemHealth'
import {
  HiExclamation,
  HiHeart
} from 'react-icons/hi'
import ModalWrapper from '../../utils/ModalWrapper'

interface DeleteSystemHealthModalProps {
  systemHealth: SystemHealth
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

const DeleteSystemHealthModal: React.FC<DeleteSystemHealthModalProps> = ({
  systemHealth,
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
      await onDelete(systemHealth._id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete system health record')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Delete System Health Record"
      submitText="Delete Record"
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
              This action cannot be undone. This will permanently delete the system health record.
            </p>
          </div>
        </div>

        <div className="bg-secondary-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Status:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{systemHealth.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Component:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{systemHealth.component}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Severity:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{systemHealth.severity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">CPU Usage:</span>
              <span className="text-sm font-medium text-secondary-900">
                {systemHealth.cpuUsage ? `${systemHealth.cpuUsage}%` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Memory Usage:</span>
              <span className="text-sm font-medium text-secondary-900">
                {systemHealth.memoryUsage ? `${systemHealth.memoryUsage}%` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Disk Usage:</span>
              <span className="text-sm font-medium text-secondary-900">
                {systemHealth.diskUsage ? `${systemHealth.diskUsage}%` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Response Time:</span>
              <span className="text-sm font-medium text-secondary-900">
                {systemHealth.responseTime ? `${systemHealth.responseTime}ms` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Timestamp:</span>
              <span className="text-sm font-medium text-secondary-900">
                {systemHealth.timestamp ? new Date(systemHealth.timestamp).toLocaleString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Message:</span>
              <span className="text-sm font-medium text-secondary-900 max-w-xs truncate">
                {systemHealth.message || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded text-sm">
          <p className="font-medium mb-1">⚠️ Warning:</p>
          <p>Deleting this system health record will also affect:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>System monitoring history</li>
            <li>Performance tracking data</li>
            <li>Health trend analysis</li>
            <li>Alert history</li>
            <li>System diagnostics</li>
          </ul>
        </div>
      </div>
    </ModalWrapper>
  )
}

export default DeleteSystemHealthModal
