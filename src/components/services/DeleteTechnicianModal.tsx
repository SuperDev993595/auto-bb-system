import { useState } from 'react'
import { useAppDispatch } from '../../redux'
import { deleteTechnician } from '../../redux/actions/services'
import { Technician } from '../../services/services'
import {
  X,
  AlertTriangle,
  Trash2
} from '../../utils/icons'

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
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">Delete Technician</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 mb-4">
              {error}
            </div>
          )}

          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <Trash2 className="h-8 w-8 text-red-600" />
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Delete Technician
            </h3>
            
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete <strong>{technician.name}</strong>? 
              This action cannot be undone and will remove all associated data.
            </p>

            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
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
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl hover:from-red-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
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
