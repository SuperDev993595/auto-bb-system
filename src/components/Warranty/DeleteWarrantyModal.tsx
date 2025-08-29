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
    <ModalWrapper
      isOpen={true}
      onClose={onClose}
      title="Delete Warranty"
      icon={<AlertTriangle className="w-5 h-5" />}
      submitText="Delete Warranty"
      submitColor="bg-red-600 hover:bg-red-700"
      onSubmit={onConfirm}
      size="md"
    >
      <div className="p-6 space-y-6">
        {/* Warning Message */}
        <div className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="p-2 bg-red-100 rounded-lg flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-red-900 mb-2">Are you sure?</h3>
            <p className="text-sm text-red-700">
              This action cannot be undone. This will permanently delete the warranty and all associated data.
            </p>
          </div>
        </div>

        {/* Warranty Details */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <h4 className="font-medium text-gray-900 mb-3">Warranty Details</h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Warranty Name:</span>
              <span className="font-medium text-gray-900">{warranty.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Customer:</span>
              <span className="font-medium text-gray-900">{warranty.customer.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Vehicle:</span>
              <span className="font-medium text-gray-900">
                {warranty.vehicle.year} {warranty.vehicle.make} {warranty.vehicle.model}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Claims:</span>
              <span className="font-medium text-gray-900">{warranty.totalClaims}</span>
            </div>
          </div>
        </div>

        {/* Warning for warranties with claims */}
        {warranty.totalClaims > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-yellow-800 mb-1">Warning</p>
                <p className="text-sm text-yellow-700">
                  This warranty has {warranty.totalClaims} claim(s). Deleting it will permanently remove all claim history and cannot be recovered.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Additional warning */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-700">
            <strong>Final Warning:</strong> Once deleted, this warranty and all its associated data will be permanently removed from the system.
          </p>
        </div>
      </div>
    </ModalWrapper>
  )
}
