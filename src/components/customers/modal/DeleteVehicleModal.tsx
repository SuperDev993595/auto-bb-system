import React, { useState } from 'react'
import { Vehicle } from '../../../services/customers'
import {
  HiExclamation,
  HiTrash
} from 'react-icons/hi'
import ModalWrapper from '../../../utils/ModalWrapper'

interface DeleteVehicleModalProps {
  vehicle: Vehicle
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

const DeleteVehicleModal: React.FC<DeleteVehicleModalProps> = ({
  vehicle,
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
      await onDelete(vehicle.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete vehicle')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Vehicle"
      submitText="Delete Vehicle"
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
              This action cannot be undone. This will permanently delete the vehicle.
            </p>
          </div>
        </div>

        <div className="bg-secondary-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Vehicle:</span>
              <span className="text-sm font-medium text-secondary-900">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">VIN:</span>
              <span className="text-sm font-medium text-secondary-900">{vehicle.vin}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">License Plate:</span>
              <span className="text-sm font-medium text-secondary-900">{vehicle.licensePlate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Color:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{vehicle.color}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Mileage:</span>
              <span className="text-sm font-medium text-secondary-900">{vehicle.mileage?.toLocaleString()} miles</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Engine:</span>
              <span className="text-sm font-medium text-secondary-900">{vehicle.engine}</span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded text-sm">
          <p className="font-medium mb-1">⚠️ Warning:</p>
          <p>Deleting this vehicle will also remove:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Service history</li>
            <li>Appointment records</li>
            <li>Maintenance logs</li>
            <li>Repair records</li>
          </ul>
        </div>
      </div>
    </ModalWrapper>
  )
}

export default DeleteVehicleModal
