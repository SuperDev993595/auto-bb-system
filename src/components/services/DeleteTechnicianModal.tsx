import { useState } from 'react'
import { useAppDispatch } from '../../redux'
import { deleteTechnician } from '../../redux/actions/services'
import { Technician } from '../../services/services'
import {
  HiX,
  HiExclamation,
  HiTrash
} from 'react-icons/hi'

interface DeleteTechnicianModalProps {
  technician: Technician | null
  onClose: () => void
  onSuccess: () => void
}

export default function DeleteTechnicianModal({ technician, onClose, onSuccess }: DeleteTechnicianModalProps) {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    if (!technician) return

    setLoading(true)
    setError('')

    try {
      await dispatch(deleteTechnician(technician._id)).unwrap()
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to delete technician')
    } finally {
      setLoading(false)
    }
  }

  if (!technician) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <HiExclamation className="w-5 h-5 text-red-500" />
            Delete Technician
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <HiTrash className="h-6 w-6 text-red-600" />
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Delete Technician
            </h3>
            
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete <strong>{technician.name}</strong>? 
              This action cannot be undone and will remove all associated data.
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-2">Technician Details:</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Name:</strong> {technician.name}</p>
                <p><strong>Email:</strong> {technician.email}</p>
                <p><strong>Phone:</strong> {technician.phone || 'N/A'}</p>
                <p><strong>Hourly Rate:</strong> ${technician.hourlyRate}/hr</p>
                <p><strong>Specializations:</strong> {(technician.specialization || []).length} areas</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <HiTrash className="w-4 h-4" />
                  Delete Technician
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
