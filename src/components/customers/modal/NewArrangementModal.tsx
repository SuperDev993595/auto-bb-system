import { useState } from 'react'
import { toast } from 'react-hot-toast'
import ModalWrapper from '../../../utils/ModalWrapper'
import { FileText } from '../../../utils/icons'
import { customerService } from '../../../services/customers'

interface Props {
    customerId: string
    onClose: () => void
    onSuccess: () => void
}

export default function NewArrangementModal({ customerId, onClose, onSuccess }: Props) {
    const [amount, setAmount] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [status, setStatus] = useState('pending')
    const [type, setType] = useState('installment')
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!amount || !dueDate) {
            toast.error('Please fill all required fields')
            return
        }

        setLoading(true)

        try {
            await customerService.addArrangement(customerId, {
                amount: parseFloat(amount),
                dueDate: dueDate,
                status: status as 'pending' | 'active' | 'completed' | 'cancelled',
                type: type as 'installment' | 'payment_plan' | 'deferred' | 'other',
                notes: notes || undefined
            })
            
            toast.success('Arrangement added successfully!')
            onSuccess()
            onClose()
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to add arrangement'
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <ModalWrapper
            isOpen={true}
            onClose={onClose}
            title="New Payment Arrangement"
            icon={<FileText className="w-5 h-5" />}
            submitText="Create Arrangement"
            submitColor="bg-green-600"
            onSubmit={handleSubmit}
        >
            <div className="grid gap-6">
                <label className="block">
                    <span className="text-sm font-medium text-gray-700 mb-2 block">Amount ($) *</span>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:bg-white"
                        required
                    />
                </label>
                <label className="block">
                    <span className="text-sm font-medium text-gray-700 mb-2 block">Due Date *</span>
                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:bg-white"
                        required
                    />
                </label>
                <div className="grid grid-cols-2 gap-6">
                    <label className="block">
                        <span className="text-sm font-medium text-gray-700 mb-2 block">Type</span>
                        <select value={type} onChange={e => setType(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:bg-white"
                        >
                            <option value="installment">Installment</option>
                            <option value="payment_plan">Payment Plan</option>
                            <option value="deferred">Deferred</option>
                            <option value="other">Other</option>
                        </select>
                    </label>
                    <label className="block">
                        <span className="text-sm font-medium text-gray-700 mb-2 block">Status</span>
                        <select value={status} onChange={e => setStatus(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:bg-white"
                        >
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </label>
                </div>
                <label className="block">
                    <span className="text-sm font-medium text-gray-700 mb-2 block">Notes</span>
                    <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 hover:bg-white resize-none"
                    />
                </label>
            </div>
        </ModalWrapper>
    )
}
