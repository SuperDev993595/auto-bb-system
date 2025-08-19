import { useState } from 'react'
import { useAppDispatch } from '../../redux'
import { deleteInvoice } from '../../redux/actions/invoices'
import { Invoice } from '../../services/invoices'
import {
  HiX,
  HiExclamation,
  HiTrash
} from 'react-icons/hi'

interface DeleteInvoiceModalProps {
  invoice: Invoice | null
  onClose: () => void
  onSuccess: () => void
}

export default function DeleteInvoiceModal({ invoice, onClose, onSuccess }: DeleteInvoiceModalProps) {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    if (!invoice) return

    setLoading(true)
    setError('')

    try {
      await dispatch(deleteInvoice(invoice._id)).unwrap()
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to delete invoice')
    } finally {
      setLoading(false)
    }
  }

  if (!invoice) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Delete Invoice</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
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
              <h4 className="font-medium text-gray-900">Are you sure?</h4>
              <p className="text-sm text-gray-600">
                This action cannot be undone. This will permanently delete the invoice.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Invoice Number:</span>
                <span className="text-sm font-medium">#{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Customer:</span>
                <span className="text-sm font-medium">{invoice.customer?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="text-sm font-medium">${invoice.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span className="text-sm font-medium capitalize">{invoice.status}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <HiTrash className="w-4 h-4" />
              {loading ? 'Deleting...' : 'Delete Invoice'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
