import React, { useState } from 'react'
import { Chat } from '../../services/chat'
import {
  HiExclamation,
  HiTrash
} from 'react-icons/hi'
import ModalWrapper from '../../utils/ModalWrapper'

interface DeleteChatModalProps {
  chat: Chat
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

const DeleteChatModal: React.FC<DeleteChatModalProps> = ({
  chat,
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
      await onDelete(chat.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete chat')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Chat"
      submitText="Delete Chat"
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
              This action cannot be undone. This will permanently delete the chat and all messages.
            </p>
          </div>
        </div>

        <div className="bg-secondary-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Customer:</span>
              <span className="text-sm font-medium text-secondary-900">
                {chat.customer?.firstName} {chat.customer?.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Chat ID:</span>
              <span className="text-sm font-medium text-secondary-900">#{chat.chatId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Started:</span>
              <span className="text-sm font-medium text-secondary-900">
                {chat.startTime ? new Date(chat.startTime).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Ended:</span>
              <span className="text-sm font-medium text-secondary-900">
                {chat.endTime ? new Date(chat.endTime).toLocaleDateString() : 'Active'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Status:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{chat.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Agent:</span>
              <span className="text-sm font-medium text-secondary-900">
                {chat.agent?.firstName} {chat.agent?.lastName} || 'Unassigned'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Message Count:</span>
              <span className="text-sm font-medium text-secondary-900">
                {chat.messageCount || 0} messages
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Duration:</span>
              <span className="text-sm font-medium text-secondary-900">
                {chat.duration ? `${Math.round(chat.duration / 60)} minutes` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded text-sm">
          <p className="font-medium mb-1">⚠️ Warning:</p>
          <p>Deleting this chat will also remove:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>All chat messages</li>
            <li>Customer interaction history</li>
            <li>Agent performance data</li>
            <li>Chat analytics</li>
            <li>Resolution tracking</li>
          </ul>
        </div>
      </div>
    </ModalWrapper>
  )
}

export default DeleteChatModal
