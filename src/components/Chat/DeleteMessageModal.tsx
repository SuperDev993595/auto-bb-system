import React, { useState } from 'react'
import { Message } from '../../services/chat'
import {
  HiExclamation,
  HiChat
} from 'react-icons/hi'
import ModalWrapper from '../../utils/ModalWrapper'

interface DeleteMessageModalProps {
  message: Message
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

const DeleteMessageModal: React.FC<DeleteMessageModalProps> = ({
  message,
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
      await onDelete(message.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Message"
      submitText="Delete Message"
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
              This action cannot be undone. This will permanently delete the message.
            </p>
          </div>
        </div>

        <div className="bg-secondary-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Sender:</span>
              <span className="text-sm font-medium text-secondary-900">{message.senderName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Type:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{message.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Status:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{message.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Sent:</span>
              <span className="text-sm font-medium text-secondary-900">
                {message.sentAt ? new Date(message.sentAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Read:</span>
              <span className="text-sm font-medium text-secondary-900">
                {message.readAt ? new Date(message.readAt).toLocaleDateString() : 'Not read'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Content Preview:</span>
              <span className="text-sm font-medium text-secondary-900 max-w-xs truncate">
                {message.content ? message.content.substring(0, 50) + '...' : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded text-sm">
          <p className="font-medium mb-1">⚠️ Warning:</p>
          <p>Deleting this message will also affect:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Chat conversation history</li>
            <li>Message threading</li>
            <li>Communication logs</li>
            <li>Customer service records</li>
            <li>Chat analytics data</li>
          </ul>
        </div>
      </div>
    </ModalWrapper>
  )
}

export default DeleteMessageModal
