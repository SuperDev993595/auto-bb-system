import React, { useState } from 'react'
import { Task } from '../../services/tasks'
import {
  HiExclamation,
  HiClipboardList
} from 'react-icons/hi'
import ModalWrapper from '../../utils/ModalWrapper'

interface DeleteTaskModalProps {
  task: Task
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

const DeleteTaskModal: React.FC<DeleteTaskModalProps> = ({
  task,
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
      await onDelete(task._id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task')
    } finally {
      setLoading(false)
    }
  }

  // Don't render if no task is provided
  if (!task) {
    return null
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Task"
      submitText="Delete Task"
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
              This action cannot be undone. This will permanently delete the task.
            </p>
          </div>
        </div>

        <div className="bg-secondary-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Task Title:</span>
              <span className="text-sm font-medium text-secondary-900">{task.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Description:</span>
              <span className="text-sm font-medium text-secondary-900">
                {task.description ? task.description.substring(0, 50) + '...' : 'No description'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Priority:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{task.priority}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Status:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{task.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Due Date:</span>
              <span className="text-sm font-medium text-secondary-900">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Assigned To:</span>
              <span className="text-sm font-medium text-secondary-900">
                {task.assignedTo || 'Unassigned'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Created:</span>
              <span className="text-sm font-medium text-secondary-900">
                {task.createdAt ? new Date(task.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded text-sm">
          <p className="font-medium mb-1">⚠️ Warning:</p>
          <p>Deleting this task will also affect:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Task tracking and progress</li>
            <li>Workflow management</li>
            <li>Team collaboration</li>
            <li>Project timelines</li>
            <li>Performance metrics</li>
          </ul>
        </div>
      </div>
    </ModalWrapper>
  )
}

export default DeleteTaskModal
