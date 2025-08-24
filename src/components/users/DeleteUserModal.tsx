import React, { useState } from 'react'
import { User } from '../../services/users'
import {
  HiExclamation,
  HiTrash
} from 'react-icons/hi'
import ModalWrapper from '../../utils/ModalWrapper'

interface DeleteUserModalProps {
  user: User
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

const DeleteUserModal: React.FC<DeleteUserModalProps> = ({
  user,
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
      await onDelete(user.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Delete User"
      submitText="Delete User"
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
              This action cannot be undone. This will permanently delete the user account.
            </p>
          </div>
        </div>

        <div className="bg-secondary-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">User Name:</span>
              <span className="text-sm font-medium text-secondary-900">
                {user.firstName} {user.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Email:</span>
              <span className="text-sm font-medium text-secondary-900">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Username:</span>
              <span className="text-sm font-medium text-secondary-900">{user.username}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Role:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{user.role}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Department:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{user.department || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Status:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Last Login:</span>
              <span className="text-sm font-medium text-secondary-900">
                {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Created:</span>
              <span className="text-sm font-medium text-secondary-900">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded text-sm">
          <p className="font-medium mb-1">⚠️ Warning:</p>
          <p>Deleting this user will also affect:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>All assigned tasks and appointments</li>
            <li>Work order assignments</li>
            <li>System access and permissions</li>
            <li>Performance tracking data</li>
            <li>User activity logs</li>
          </ul>
        </div>
      </div>
    </ModalWrapper>
  )
}

export default DeleteUserModal
