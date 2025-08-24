import React, { useState } from 'react'
import { Reminder } from '../../services/reminders'
import {
  HiExclamation,
  HiTrash
} from 'react-icons/hi'
import ModalWrapper from '../../utils/ModalWrapper'

interface DeleteReminderModalProps {
  reminder: Reminder
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

const DeleteReminderModal: React.FC<DeleteReminderModalProps> = ({
  reminder,
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
      await onDelete(reminder.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete reminder')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Reminder"
      submitText="Delete Reminder"
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
              This action cannot be undone. This will permanently delete the reminder.
            </p>
          </div>
        </div>

        <div className="bg-secondary-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Title:</span>
              <span className="text-sm font-medium text-secondary-900">{reminder.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Type:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{reminder.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Customer:</span>
              <span className="text-sm font-medium text-secondary-900">
                {reminder.customer?.firstName} {reminder.customer?.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Due Date:</span>
              <span className="text-sm font-medium text-secondary-900">
                {reminder.dueDate ? new Date(reminder.dueDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Priority:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{reminder.priority}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Status:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{reminder.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Description:</span>
              <span className="text-sm font-medium text-secondary-900">
                {reminder.description ? reminder.description.substring(0, 50) + '...' : 'No description'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded text-sm">
          <p className="font-medium mb-1">⚠️ Warning:</p>
          <p>Deleting this reminder will also remove:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Notification history</li>
            <li>Follow-up records</li>
            <li>Customer communication logs</li>
            <li>Scheduled notifications</li>
          </ul>
        </div>
      </div>
    </ModalWrapper>
  )
}

export default DeleteReminderModal
