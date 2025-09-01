import React, { useState } from 'react'
import { useAppDispatch } from '../../redux'
import { deleteInvoice } from '../../redux/actions/invoices'
import { Invoice } from '../../redux/reducer/invoicesReducer'
import {
  HiExclamation,
  HiTrash
} from 'react-icons/hi'
import ModalWrapper from '../../utils/ModalWrapper'
import { toast } from 'react-hot-toast'

interface DeleteInvoiceModalProps {
  invoice: Invoice | null
  onClose: () => void
  onSuccess?: () => void
}

const DeleteInvoiceModal: React.FC<DeleteInvoiceModalProps> = ({
  invoice,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dispatch = useAppDispatch()

  const handleDelete = async () => {
    if (!invoice) return
    
    try {
      setLoading(true)
      setError(null)
      
      // Dispatch the delete action
      const result = await dispatch(deleteInvoice(invoice._id))
      
      if (deleteInvoice.fulfilled.match(result)) {
        toast.success('Invoice deleted successfully')
        onSuccess?.()
        onClose()
      } else {
        setError('Failed to delete invoice')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete invoice')
    } finally {
      setLoading(false)
    }
  }

  if (!invoice) {
    return null
  }

  return (
    <ModalWrapper
      isOpen={true}
      onClose={onClose}
      title="Delete Invoice"
      submitText="Delete Invoice"
      onSubmit={handleDelete}
      submitColor="bg-red-600"
      submitDisabled={loading}
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
              <span className="text-sm text-secondary-600">Invoice ID:</span>
              <span className="text-sm font-medium text-secondary-900">#{invoice._id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-secondary-600">Customer:</span>
              <span className="text-sm font-medium text-secondary-900">{invoice.customerName}</span>
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
