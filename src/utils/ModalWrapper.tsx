import { X } from '../utils/icons'
import { ReactNode } from 'react'

interface ModalWrapperProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  icon?: ReactNode
  submitText?: string
  onSubmit?: () => void
  submitColor?: string
  disableOutsideClose?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function ModalWrapper({
  isOpen,
  onClose,
  children,
  title,
  icon,
  submitText,
  onSubmit,
  submitColor = 'bg-blue-600',
  disableOutsideClose = false,
  size = 'md'
}: ModalWrapperProps) {
  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-xl',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !disableOutsideClose) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn`}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center gap-3">
              {icon && <div className="text-blue-600">{icon}</div>}
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {children}
        </div>

        {/* Footer */}
        {submitText && onSubmit && (
          <div className="flex justify-end gap-3 p-6 border-t border-gray-100">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              className={`${submitColor} text-white text-sm px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium`}
            >
              {submitText}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
