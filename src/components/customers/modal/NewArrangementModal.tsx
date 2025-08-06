import { useState } from 'react'
import ModalWrapper from '../../../utils/ModalWrapper'
import { HiDocumentText } from 'react-icons/hi'

export default function NewArrangementModal({ onClose }: { onClose: () => void }) {
    const [amount, setAmount] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [status, setStatus] = useState('')
    const [notes, setNotes] = useState('')

    const handleSubmit = () => {
        if (!amount || !dueDate || !status) {
            alert('All required fields must be filled.')
            return
        }
        console.log({ amount, dueDate, status, notes })
        onClose()
    }

    return (
        <ModalWrapper
            title="Create New Payment Arrangement"
            icon={<HiDocumentText className="text-purple-600 w-5 h-5" />}
            submitLabel="Save Arrangement"
            submitColor="bg-purple-600"
            onClose={onClose}
            onSubmit={handleSubmit}
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
                <label className="block">
                    <span className="text-sm font-medium">Status</span>
                    <select value={status} onChange={e => setStatus(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                    >
                        <option value="">Select</option>
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                    </select>
                </label>
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
