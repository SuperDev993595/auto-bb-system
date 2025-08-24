import React, { useState } from 'react'
import { Invoice } from '../../services/invoices'
import {
  HiExclamation,
  HiTrash
} from 'react-icons/hi'
import ModalWrapper from '../../utils/ModalWrapper'

interface DeleteInvoiceModalProps {
  invoice: Invoice
  onClose: () => void
  onDelete: (id: string) => Promise<void>
}

const DeleteInvoiceModal: React.FC<DeleteInvoiceModalProps> = ({
  invoice,
  onClose,
  onDelete
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    try {
      setLoading(true)
      setError(null)
      await onDelete(invoice.id)
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete invoice')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalWrapper
      isOpen={true}
      onClose={onClose}
      title="Delete Invoice"
      submitText="Delete Invoice"
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
              This action cannot be undone. This will permanently delete the invoice.
            </p>
          </div>
        </div>

        <div className="bg-secondary-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Invoice Number:</span>
              <span className="text-sm font-medium text-secondary-900">#{invoice.invoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Customer:</span>
              <span className="text-sm font-medium text-secondary-900">{invoice.customer?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Amount:</span>
              <span className="text-sm font-medium text-secondary-900">${invoice.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Status:</span>
              <span className="text-sm font-medium text-secondary-900 capitalize">{invoice.status}</span>
            </div>
          </div>
        </div>
      </div>
    </ModalWrapper>
  )
}

export default DeleteInvoiceModal
