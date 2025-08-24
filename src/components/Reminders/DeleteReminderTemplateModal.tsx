import React, { useState } from 'react'
import { ReminderTemplate } from '../../services/reminders'
import {
  HiExclamation,
  HiTrash
} from 'react-icons/hi'
import ModalWrapper from '../../utils/ModalWrapper'

interface DeleteReminderTemplateModalProps {
  template: ReminderTemplate
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

const DeleteReminderTemplateModal: React.FC<DeleteReminderTemplateModalProps> = ({
  template,
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
      await onDelete(template.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete reminder template')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Reminder Template"
      submitText="Delete Template"
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
              This action cannot be undone. This will permanently delete the reminder template.
            </p>
          </div>
        </div>

        <div className="bg-secondary-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Template Name:</span>
              <span className="text-sm font-medium text-secondary-900">{template.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Type:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{template.type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Category:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{template.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Subject:</span>
              <span className="text-sm font-medium text-secondary-900">{template.subject}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Message:</span>
              <span className="text-sm font-medium text-secondary-900">
                {template.message ? template.message.substring(0, 50) + '...' : 'No message'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Timing:</span>
              <span className="text-sm font-medium text-secondary-900">
                {template.timing} {template.timingUnit}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Status:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">
                {template.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded text-sm">
          <p className="font-medium mb-1">⚠️ Warning:</p>
          <p>Deleting this template will also affect:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Active reminders using this template</li>
            <li>Scheduled notifications</li>
            <li>Automated reminder workflows</li>
            <li>Customer communication consistency</li>
          </ul>
        </div>
      </div>
    </ModalWrapper>
  )
}

export default DeleteReminderTemplateModal
