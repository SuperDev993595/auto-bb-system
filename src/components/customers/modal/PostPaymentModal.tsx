import { useState } from 'react'
import { toast } from 'react-hot-toast'
import ModalWrapper from '../../../utils/ModalWrapper'
import { HiCreditCard } from 'react-icons/hi'
import { customerService } from '../../../services/customers'

interface Props {
    customerId: string
    onClose: () => void
    onSuccess: () => void
}

export default function PostPaymentModal({ customerId, onClose, onSuccess }: Props) {
    const [amount, setAmount] = useState('')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [method, setMethod] = useState('')
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!amount || !method) {
            toast.error('Please fill all required fields')
            return
        }

        setLoading(true)

        try {
            await customerService.addPayment(customerId, {
                amount: parseFloat(amount),
                date: date || new Date().toISOString(),
                method: method as 'cash' | 'card' | 'check' | 'bank_transfer' | 'online' | 'other',
                notes: notes || undefined
            })
            
            toast.success('Payment added successfully!')
            onSuccess()
            onClose()
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to add payment'
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <ModalWrapper
            title="Post New Payment"
            icon={<HiCreditCard className="text-blue-600 w-5 h-5" />}
            submitLabel={loading ? "Saving..." : "Save Payment"}
            submitColor="bg-blue-600"
            onClose={onClose}
            onSubmit={handleSubmit}
            disabled={loading}
        >
            <div className="grid gap-4">
                <label className="block">
                    <span className="text-sm font-medium">Amount ($) *</span>
                    <input
                        type="number"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </label>

                <label className="block">
                    <span className="text-sm font-medium">Date</span>
                    <input
                        type="date"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </label>

                <label className="block">
                    <span className="text-sm font-medium">Payment Method *</span>
                    <select
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                        required
                    >
                        <option value="">Select Method</option>
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="check">Check</option>
                        <option value="bank_transfer">Bank Transfer</option>
                        <option value="online">Online</option>
                        <option value="other">Other</option>
                    </select>
                </label>

                <label className="block">
                    <span className="text-sm font-medium">Notes</span>
                    <textarea
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all resize-none"
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                </label>
            </div>
        </ModalWrapper>
    )
}
