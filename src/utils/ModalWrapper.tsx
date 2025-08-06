import { ReactNode, useEffect } from 'react'
import { HiX } from 'react-icons/hi'

type ModalWrapperProps = {
    title: string
    icon?: ReactNode
    children: ReactNode
    onClose: () => void
    onSubmit: () => void
    submitLabel?: string
    submitColor?: string
    disableOutsideClose?: boolean
}

export default function ModalWrapper({
    title,
    icon,
    children,
    onClose,
    onSubmit,
    submitLabel = 'Submit',
    submitColor = 'bg-blue-600',
    disableOutsideClose = false,
}: ModalWrapperProps) {
    // Close modal on ESC key
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        window.addEventListener('keydown', handleKey)
        return () => window.removeEventListener('keydown', handleKey)
    }, [onClose])

    // Close modal on click outside
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!disableOutsideClose && e.target === e.currentTarget) {
            onClose()
        }
    }

    return (
        <div
            onClick={handleBackdropClick}
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4"
        >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col animate-fadeIn">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                    <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                        {icon && <span className="text-xl">{icon}</span>}
                        <span>{title}</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-red-500 transition"
                        aria-label="Close modal"
                    >
                        <HiX className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 overflow-y-auto text-sm text-gray-700 space-y-4 flex-1">
                    {children}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 px-6 py-4 bg-gray-50 border-t">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSubmit}
                        className={`${submitColor} text-white text-sm px-4 py-2 rounded shadow-sm hover:brightness-110`}
                    >
                        {submitLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}
