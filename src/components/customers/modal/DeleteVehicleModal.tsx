import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { customerService } from '../../../services/customers'

interface Vehicle {
  _id: string
  make: string
  model: string
  year: number
  vin: string
}

interface Customer {
  _id: string
  name: string
}

interface Props {
  customer: Customer
  vehicle: Vehicle
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function DeleteVehicleModal({ customer, vehicle, isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const handleDelete = async () => {
    if (confirmText !== `${vehicle.year} ${vehicle.make} ${vehicle.model}`) {
      toast.error('Please type the vehicle name exactly to confirm deletion')
      return
    }

    setLoading(true)

    try {
      await customerService.deleteVehicle(customer._id, vehicle._id)
      toast.success('Vehicle deleted successfully!')
      onSuccess()
      onClose()
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete vehicle'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  const vehicleName = `${vehicle.year} ${vehicle.make} ${vehicle.model}`

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Delete Vehicle</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    This action cannot be undone
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      This will permanently delete the vehicle <strong>{vehicleName}</strong> and remove it from all associated records.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To confirm deletion, please type: <strong>{vehicleName}</strong>
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading || confirmText !== vehicleName}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Deleting...' : 'Delete Vehicle'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
