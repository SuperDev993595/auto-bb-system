import React, { useState } from 'react'
import { Appointment } from '../../services/appointments'
import {
  HiExclamation,
  HiTrash
} from 'react-icons/hi'
import ModalWrapper from '../../utils/ModalWrapper'

interface DeleteAppointmentModalProps {
  appointment: Appointment
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

const DeleteAppointmentModal: React.FC<DeleteAppointmentModalProps> = ({
  appointment,
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
      await onDelete(appointment.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete appointment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Appointment"
      submitText="Delete Appointment"
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
              This action cannot be undone. This will permanently delete the appointment.
            </p>
          </div>
        </div>

        <div className="bg-secondary-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Customer:</span>
              <span className="text-sm font-medium text-secondary-900">
                {appointment.customer?.firstName} {appointment.customer?.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Vehicle:</span>
              <span className="text-sm font-medium text-secondary-900">
                {appointment.vehicle?.year} {appointment.vehicle?.make} {appointment.vehicle?.model}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Service:</span>
              <span className="text-sm font-medium text-secondary-900">{appointment.service?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Date:</span>
              <span className="text-sm font-medium text-secondary-900">
                {appointment.appointmentDate ? new Date(appointment.appointmentDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Time:</span>
              <span className="text-sm font-medium text-secondary-900">
                {appointment.appointmentTime || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Status:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{appointment.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Technician:</span>
              <span className="text-sm font-medium text-secondary-900">
                {appointment.technician?.firstName} {appointment.technician?.lastName} || 'Unassigned'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded text-sm">
          <p className="font-medium mb-1">⚠️ Warning:</p>
          <p>Deleting this appointment will also remove:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Service records</li>
            <li>Time slot reservation</li>
            <li>Customer notification history</li>
            <li>Technician assignment</li>
          </ul>
        </div>
      </div>
    </ModalWrapper>
  )
}

export default DeleteAppointmentModal
