import { useState } from 'react'
import { toast } from 'react-hot-toast'
import ModalWrapper from '../../../utils/ModalWrapper'
import { HiDocumentText } from 'react-icons/hi'
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
            title="Create New Payment Arrangement"
            icon={<HiDocumentText className="text-purple-600 w-5 h-5" />}
            submitLabel={loading ? "Saving..." : "Save Arrangement"}
            submitColor="bg-purple-600"
            onClose={onClose}
            onSubmit={handleSubmit}
            disabled={loading}
        >
            <div className="grid gap-4">
                <label className="block">
                    <span className="text-sm font-medium">Amount ($)</span>
                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                    />
                </label>
                <label className="block">
                    <span className="text-sm font-medium">Due Date</span>
                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                    />
                </label>
                <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                        <span className="text-sm font-medium">Type</span>
                        <select value={type} onChange={e => setType(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                        >
                            <option value="installment">Installment</option>
                            <option value="payment_plan">Payment Plan</option>
                            <option value="deferred">Deferred</option>
                            <option value="other">Other</option>
                        </select>
                    </label>
                    <label className="block">
                        <span className="text-sm font-medium">Status</span>
                        <select value={status} onChange={e => setStatus(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                        >
                            <option value="pending">Pending</option>
                            <option value="active">Active</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </label>
                </div>
                <label className="block">
                    <span className="text-sm font-medium">Notes</span>
                    <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all resize-none"
                    />
                </label>
            </div>
        </ModalWrapper>
    )
}
