import React, { useState } from 'react'
import { Payment } from '../../services/payments'
import {
  HiExclamation,
  HiCreditCard
} from 'react-icons/hi'
import ModalWrapper from '../../utils/ModalWrapper'

interface DeletePaymentModalProps {
  payment: Payment
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

const DeletePaymentModal: React.FC<DeletePaymentModalProps> = ({
  payment,
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
      await onDelete(payment.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete payment')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Payment"
      submitText="Delete Payment"
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
              This action cannot be undone. This will permanently delete the payment record.
            </p>
          </div>
        </div>

        <div className="bg-secondary-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Customer:</span>
              <span className="text-sm font-medium text-secondary-900">{payment.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Amount:</span>
              <span className="text-sm font-medium text-secondary-900">
                ${payment.amount ? payment.amount.toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Payment Method:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{payment.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Status:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{payment.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Transaction ID:</span>
              <span className="text-sm font-medium text-secondary-900">{payment.transactionId || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Payment Date:</span>
              <span className="text-sm font-medium text-secondary-900">
                {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Created:</span>
              <span className="text-sm font-medium text-secondary-900">
                {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded text-sm">
          <p className="font-medium mb-1">⚠️ Warning:</p>
          <p>Deleting this payment will also affect:</p>
          <ul className="list-disc list-inside mt-1 space-y-1">
            <li>Customer payment history</li>
            <li>Financial reporting data</li>
            <li>Account balance calculations</li>
            <li>Transaction records</li>
            <li>Revenue tracking</li>
          </ul>
        </div>
      </div>
    </ModalWrapper>
  )
}

export default DeletePaymentModal
