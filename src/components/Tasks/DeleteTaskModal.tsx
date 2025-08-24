import { HiExclamation } from 'react-icons/hi'
import ModalWrapper from '../../utils/ModalWrapper'

interface DeleteTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  taskTitle: string
  isLoading?: boolean
}

export default function DeleteTaskModal({ isOpen, onClose, onConfirm, taskTitle, isLoading = false }: DeleteTaskModalProps) {
  if (!isOpen) return null

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Task"
      submitText="Delete Task"
      onSubmit={onConfirm}
      isLoading={isLoading}
      submitButtonVariant="error"
    >
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <HiExclamation className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-secondary-900">Are you sure?</h3>
            <p className="text-sm text-secondary-500">
              This action cannot be undone.
            </p>
          </div>
        </div>

        <p className="text-secondary-700">
          You are about to delete the task: <strong>"{taskTitle}"</strong>
        </p>
      </div>
    </ModalWrapper>
  )
}
