import { useState } from 'react'
import { toast } from 'react-hot-toast'
import ModalWrapper from '../../utils/ModalWrapper'
import { Trash2 } from '../../utils/icons'
import { deleteWorkOrder } from '../../redux/actions/services'
import { useAppDispatch } from '../../redux'
import { WorkOrder } from '../../services/services'

interface Props {
  workOrder: WorkOrder | null
  onClose: () => void
  onSuccess: () => void
}

export default function DeleteWorkOrderModal({ workOrder, onClose, onSuccess }: Props) {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const handleSubmit = async () => {
    if (!workOrder?._id) {
      toast.error('Work order ID is missing')
      return
    }

    if (confirmText !== 'DELETE') {
      toast.error('Please type "DELETE" to confirm deletion')
      return
    }

    setLoading(true)

    try {
      await dispatch(deleteWorkOrder(workOrder._id)).unwrap()
      toast.success('Work order deleted successfully')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Failed to delete work order:', error)
      toast.error(error.message || 'Failed to delete work order')
    } finally {
      setLoading(false)
    }
  }

  if (!workOrder) return null

  return (
    <ModalWrapper
      isOpen={true}
      title="Delete Work Order"
      icon={<Trash2 className="w-5 h-5" />}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitText={loading ? 'Deleting...' : 'Delete Work Order'}
      submitColor="bg-gradient-to-r from-red-600 to-pink-600"
    >
      <div className="space-y-6 p-4">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex">
            <div className="p-2 bg-red-100 rounded-lg">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Are you sure you want to delete this work order?
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>This action cannot be undone. This will permanently delete the work order:</p>
                <p className="font-semibold mt-1">#{workOrder._id}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="form-label">
            Work Order Details
          </label>
          <div className="bg-gray-50 rounded-xl p-4 text-sm border border-gray-200">
            <p><span className="font-medium">Customer:</span> {workOrder.customer.name}</p>
            <p><span className="font-medium">Service:</span> {workOrder.service.name}</p>
            <p><span className="font-medium">Vehicle:</span> {workOrder.vehicle.make} {workOrder.vehicle.model}</p>
            <p><span className="font-medium">Status:</span> {workOrder.status.replace('_', ' ')}</p>
            <p><span className="font-medium">Total Cost:</span> ${workOrder.totalCost.toFixed(2)}</p>
            <p><span className="font-medium">Created:</span> {new Date(workOrder.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="form-label">
            Type "DELETE" to confirm deletion
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="form-input"
            placeholder="Type DELETE to confirm"
            required
          />
        </div>

        <div className="text-sm text-gray-600 space-y-2">
          <p>⚠️ This action will:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Permanently delete the work order</li>
            <li>Remove all associated data and history</li>
            <li>Cannot be undone</li>
            <li>May affect customer records and billing</li>
          </ul>
        </div>
      </div>
    </ModalWrapper>
  )
}
