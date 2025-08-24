import React, { useState } from 'react'
import { Notification } from '../../services/notifications'
import {
  HiExclamation,
  HiBell
} from 'react-icons/hi'
import ModalWrapper from '../../utils/ModalWrapper'

interface DeleteNotificationModalProps {
  notification: Notification
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

const DeleteNotificationModal: React.FC<DeleteNotificationModalProps> = ({
  notification,
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
      await onDelete(notification.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete notification')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Notification"
      submitText="Delete Notification"
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
              This action cannot be undone. This will permanently delete the notification.
            </p>
          </div>
        </div>

        <div className="bg-secondary-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Title:</span>
              <span className="text-sm font-medium text-secondary-900">{notification.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Type:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{notification.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Priority:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{notification.priority}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Status:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{notification.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Recipient:</span>
              <span className="text-sm font-medium text-secondary-900">{notification.recipientName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Channel:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{notification.channel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Created:</span>
              <span className="text-sm font-medium text-secondary-900">
                {notification.createdAt ? new Date(notification.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Sent:</span>
              <span className="text-sm font-medium text-secondary-900">
                {notification.sentAt ? new Date(notification.sentAt).toLocaleDateString() : 'Not sent'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Read:</span>
              <span className="text-sm font-medium text-secondary-900">
                {notification.readAt ? new Date(notification.readAt).toLocaleDateString() : 'Not read'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded text-sm">
          <p className="font-medium mb-1">⚠️ Warning:</p>
          <p>Deleting this notification will also affect:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>User notification history</li>
            <li>Communication tracking</li>
            <li>Notification analytics</li>
            <li>User preference data</li>
            <li>System audit logs</li>
          </ul>
        </div>
      </div>
    </ModalWrapper>
  )
}

export default DeleteNotificationModal
