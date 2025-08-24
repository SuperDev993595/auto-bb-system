import React, { useState } from 'react'
import { CommunicationLog } from '../../services/communicationLogs'
import {
  HiExclamation,
  HiTrash
} from 'react-icons/hi'
import ModalWrapper from '../../utils/ModalWrapper'

interface DeleteCommunicationLogModalProps {
  communicationLog: CommunicationLog
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

const DeleteCommunicationLogModal: React.FC<DeleteCommunicationLogModalProps> = ({
  communicationLog,
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
      await onDelete(communicationLog.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete communication log')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Communication Log"
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
              This action cannot be undone. This will permanently delete the communication log.
            </p>
          </div>
        </div>

        <div className="bg-secondary-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Customer:</span>
              <span className="text-sm font-medium text-secondary-900">
                {communicationLog.customer?.firstName} {communicationLog.customer?.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Type:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{communicationLog.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Method:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{communicationLog.method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Date:</span>
              <span className="text-sm font-medium text-secondary-900">
                {communicationLog.date ? new Date(communicationLog.date).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Time:</span>
              <span className="text-sm font-medium text-secondary-900">
                {communicationLog.time || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Subject:</span>
              <span className="text-sm font-medium text-secondary-900">{communicationLog.subject}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Notes:</span>
              <span className="text-sm font-medium text-secondary-900">
                {communicationLog.notes ? communicationLog.notes.substring(0, 50) + '...' : 'No notes'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Status:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{communicationLog.status}</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded text-sm">
          <p className="font-medium mb-1">⚠️ Warning:</p>
          <p>Deleting this communication log will also remove:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Communication history</li>
            <li>Follow-up reminders</li>
            <li>Customer interaction records</li>
            <li>Audit trail data</li>
          </ul>
        </div>
      </div>
    </ModalWrapper>
  )
}

export default DeleteCommunicationLogModal
