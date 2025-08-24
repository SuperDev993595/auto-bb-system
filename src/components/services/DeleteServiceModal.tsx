import { useState } from 'react'
import { toast } from 'react-hot-toast'
import ModalWrapper from '../../utils/ModalWrapper'
import { Trash2 } from '../../utils/icons'
import { deleteServiceCatalogItem } from '../../redux/actions/services'
import { useAppDispatch } from '../../redux'
import { ServiceCatalogItem } from '../../services/services'

interface Props {
  service: ServiceCatalogItem | null
  onClose: () => void
  onSuccess: () => void
}

export default function DeleteServiceModal({ service, onClose, onSuccess }: Props) {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const handleSubmit = async () => {
    if (!service?._id) {
      toast.error('Service ID is missing')
      return
    }

    if (confirmText !== service.name) {
      toast.error('Please type the service name exactly to confirm deletion')
      return
    }

    setLoading(true)

    try {
      await dispatch(deleteServiceCatalogItem(service._id)).unwrap()
      toast.success('Service deleted successfully')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Failed to delete service:', error)
      toast.error(error.message || 'Failed to delete service')
    } finally {
      setLoading(false)
    }
  }

  if (!service) return null

  return (
    <ModalWrapper
      isOpen={true}
      title="Delete Service"
      icon={<Trash2 className="w-5 h-5" />}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitText={loading ? 'Deleting...' : 'Delete Service'}
      submitColor="bg-gradient-to-r from-red-600 to-pink-600"
    >
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex">
            <div className="p-2 bg-red-100 rounded-lg">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Are you sure you want to delete this service?
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>This action cannot be undone. This will permanently delete the service:</p>
                <p className="font-semibold mt-1">{service.name}</p>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Service Details
          </label>
          <div className="bg-gray-50 rounded-xl p-4 text-sm border border-gray-200">
            <p><span className="font-medium">Name:</span> {service.name}</p>
            <p><span className="font-medium">Category:</span> {service.category}</p>
            <p><span className="font-medium">Duration:</span> {service.estimatedDuration} minutes</p>
            <p><span className="font-medium">Labor Rate:</span> ${service.laborRate}/hour</p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type the service name to confirm deletion
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 bg-gray-50 hover:bg-white"
            placeholder={`Type "${service.name}" to confirm`}
            required
          />
        </div>

        <div className="text-sm text-gray-600">
          <p>⚠️ This action will:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Permanently delete the service from the catalog</li>
            <li>Remove it from all future work orders</li>
            <li>Cannot be undone</li>
          </ul>
        </div>
      </div>
    </ModalWrapper>
  )
}
