import { useEffect } from 'react'
import { HiExclamation, HiTrash } from 'react-icons/hi'
import ModalWrapper from '../../utils/ModalWrapper'

interface Props {
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  itemName?: string
  isLoading?: boolean
}

export default function DeleteConfirmationModal({ 
  onClose, 
  onConfirm, 
  title, 
  message, 
  itemName,
  isLoading = false 
}: Props) {
  // Close modal on ESC key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <ModalWrapper
      isOpen={true}
      onClose={onClose}
      title={title}
      icon={<HiExclamation className="w-5 h-5" />}
      submitText={isLoading ? 'Deleting...' : 'Delete'}
      onSubmit={onConfirm}
      submitColor="bg-red-600"
    >
      <div className="p-4 space-y-4">
        <p className="text-sm text-gray-500">{message}</p>
        
        {itemName && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Item to delete:</span> {itemName}
            </p>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            <strong>Warning:</strong> This action cannot be undone. The item will be permanently deleted.
          </p>
        </div>
      </div>
    </ModalWrapper>
  )
}
