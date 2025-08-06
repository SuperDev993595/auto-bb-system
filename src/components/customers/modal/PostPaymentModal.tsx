import { useState } from 'react'
import ModalWrapper from '../../../utils/ModalWrapper'
import { HiCreditCard } from 'react-icons/hi'

export default function PostPaymentModal({ onClose }: { onClose: () => void }) {
    const [amount, setAmount] = useState('')
    const [date, setDate] = useState('')
    const [method, setMethod] = useState('')
    const [notes, setNotes] = useState('')

    const handleSubmit = () => {
        if (!amount || !date || !method) {
            alert('Please fill all required fields')
            return
        }

        console.log({ amount, date, method, notes })
        onClose()
    }

    return (
        <ModalWrapper
            title="Post New Payment"
            icon={<HiCreditCard className="text-blue-600 w-5 h-5" />}
            submitLabel="Save Payment"
            submitColor="bg-blue-600"
            onClose={onClose}
            onSubmit={handleSubmit}
        >
            <div className="grid gap-4">
                <label className="block">
                    <span className="text-sm font-medium">Amount ($)</span>
                    <input
                        type="number"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
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
                    <span className="text-sm font-medium">Payment Method</span>
                    <select
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                    >
                        <option value="">Select Method</option>
                        <option value="Cash">Cash</option>
                        <option value="Card">Card</option>
                        <option value="Check">Check</option>
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
