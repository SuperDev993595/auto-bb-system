import React, { useState } from 'react'
import { YellowPagesLead } from '../../services/yellowpages'
import {
  HiExclamation,
  HiTrash
} from 'react-icons/hi'
import ModalWrapper from '../../utils/ModalWrapper'

interface DeleteYellowPagesLeadModalProps {
  lead: YellowPagesLead
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

const DeleteYellowPagesLeadModal: React.FC<DeleteYellowPagesLeadModalProps> = ({
  lead,
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
      await onDelete(lead.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete YellowPages lead')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Delete YellowPages Lead"
      submitText="Delete Lead"
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
              This action cannot be undone. This will permanently delete the YellowPages lead.
            </p>
          </div>
        </div>

        <div className="bg-secondary-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Lead Name:</span>
              <span className="text-sm font-medium text-secondary-900">
                {lead.firstName} {lead.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Phone:</span>
              <span className="text-sm font-medium text-secondary-900">{lead.phone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Email:</span>
              <span className="text-sm font-medium text-secondary-900">{lead.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Service Interest:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{lead.serviceInterest}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Source:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{lead.source}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Date Received:</span>
              <span className="text-sm font-medium text-secondary-900">
                {lead.dateReceived ? new Date(lead.dateReceived).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Status:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{lead.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Notes:</span>
              <span className="text-sm font-medium text-secondary-900">
                {lead.notes ? lead.notes.substring(0, 50) + '...' : 'No notes'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded text-sm">
          <p className="font-medium mb-1">⚠️ Warning:</p>
          <p>Deleting this lead will also remove:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Lead tracking information</li>
            <li>Follow-up history</li>
            <li>Conversion data</li>
            <li>Marketing attribution</li>
          </ul>
        </div>
      </div>
    </ModalWrapper>
  )
}

export default DeleteYellowPagesLeadModal
