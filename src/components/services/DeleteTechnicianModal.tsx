import React, { useState } from 'react'
import { Technician } from '../../services/services'
import {
  HiExclamation,
  HiTrash
} from 'react-icons/hi'
import ModalWrapper from '../../utils/ModalWrapper'

interface DeleteTechnicianModalProps {
  technician: Technician | null
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

const DeleteTechnicianModal: React.FC<DeleteTechnicianModalProps> = ({
  technician,
  isOpen,
  onClose,
  onDelete
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!technician) return
    
    try {
      setLoading(true)
      setError(null)
      await onDelete(technician._id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete technician')
    } finally {
      setLoading(false)
    }
  }

  // Don't render if technician is null - moved after all hooks
  if (!technician) return null

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Technician"
      submitText="Delete Technician"
      onSubmit={handleDelete}
      submitColor="bg-red-600"
    >
      <div className="p-6 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-100 rounded-full">
            <HiExclamation className="w-7 h-7 text-red-600" />
          </div>
          <div>
            <h4 className="font-medium text-secondary-900 text-lg">Are you sure?</h4>
            <p className="text-sm text-secondary-600 mt-1">
              This action cannot be undone. This will permanently delete the technician.
            </p>
          </div>
        </div>

        <div className="bg-secondary-50 p-6 rounded-lg border border-secondary-200">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Name:</span>
              <span className="text-sm font-medium text-secondary-900">
                {technician.name || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Email:</span>
              <span className="text-sm font-medium text-secondary-900">{technician.email || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Phone:</span>
              <span className="text-sm font-medium text-secondary-900">{technician.phone || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Specialization:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">
                {technician.specialization && technician.specialization.length > 0 
                  ? technician.specialization.join(', ') 
                  : 'None specified'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Hourly Rate:</span>
              <span className="text-sm font-medium text-secondary-900">
                ${technician.hourlyRate ? technician.hourlyRate.toFixed(2) : '0.00'}/hr
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Status:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">
                {technician.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-6 py-4 rounded-lg">
          <p className="font-medium mb-2">⚠️ Warning:</p>
          <p>Deleting this technician will also affect:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Work order assignments</li>
            <li>Service scheduling</li>
            <li>Performance tracking</li>
            <li>Team management</li>
          </ul>
        </div>
      </div>
    </ModalWrapper>
  )
}

export default DeleteTechnicianModal
