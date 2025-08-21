import { useState } from 'react'
import { useAppDispatch } from '../../../redux'
import { deleteCustomer } from '../../../redux/actions/customers'
import { Customer } from '../../../services/customers'
import { toast } from 'react-hot-toast'
import { X, Trash2, AlertTriangle, User } from '../../../utils/icons'
import { useNavigate } from 'react-router-dom'

interface DeleteCustomerModalProps {
  customer: Customer
  isOpen: boolean
  onClose: () => void
}

export default function DeleteCustomerModal({ customer, isOpen, onClose }: DeleteCustomerModalProps) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const handleDelete = async () => {
    if (confirmText !== customer.name) {
      toast.error('Please type the customer name exactly to confirm deletion')
      return
    }

    setLoading(true)

    try {
      await dispatch(deleteCustomer(customer._id)).unwrap()
      toast.success('Customer deleted successfully!')
      onClose()
      // Navigate back to customer list
      navigate('/admin/dashboard/customers')
    } catch (error) {
      console.error('Delete customer error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-red-50 to-pink-50">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            Delete Customer
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Are you sure you want to delete this customer?
              </h3>
              <p className="text-gray-600 mb-4">
                This action cannot be undone. This will permanently delete the customer and all associated data including:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 mb-4">
                <li>• Customer profile and contact information</li>
                <li>• Vehicle records</li>
                <li>• Service history</li>
                <li>• Appointment records</li>
                <li>• Payment history</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="text-blue-600 w-5 h-5" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{customer.name}</p>
                <p className="text-sm text-gray-600">{customer.email}</p>
                {customer.businessName && (
                  <p className="text-sm text-gray-600">{customer.businessName}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type <span className="font-bold text-red-600">{customer.name}</span> to confirm deletion:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="Enter customer name to confirm"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading || confirmText !== customer.name}
              className="px-4 py-2 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
            >
              <Trash2 className="w-4 h-4" />
              {loading ? 'Deleting...' : 'Delete Customer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
