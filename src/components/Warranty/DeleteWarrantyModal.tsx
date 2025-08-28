import ModalWrapper from '../../utils/ModalWrapper'
import { AlertTriangle } from '../../utils/icons'

interface Warranty {
  _id: string
  name: string
  customer: {
    name: string
  }
  vehicle: {
    make: string
    model: string
    year: number
  }
  totalClaims: number
}

interface Props {
  onClose: () => void
  onConfirm: () => void
  warranty: Warranty
}

export default function DeleteWarrantyModal({ onClose, onConfirm, warranty }: Props) {
  return (
    <ModalWrapper isOpen={true} onClose={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Delete Warranty</h2>
        </div>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Are you sure?</h3>
              <p className="text-sm text-gray-600">
                This action cannot be undone. This will permanently delete the warranty.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <strong>Warranty:</strong> {warranty.name}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Customer:</strong> {warranty.customer.name}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Vehicle:</strong> {warranty.vehicle.year} {warranty.vehicle.make} {warranty.vehicle.model}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Total Claims:</strong> {warranty.totalClaims}
            </p>
          </div>

          {warranty.totalClaims > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> This warranty has {warranty.totalClaims} claim(s). 
                Deleting it will remove all claim history.
              </p>
            </div>
          )}

          <div className="flex items-center justify-end gap-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Delete Warranty
            </button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  )
}
