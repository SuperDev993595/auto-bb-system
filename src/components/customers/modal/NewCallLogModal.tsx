import { useState } from 'react'
import ModalWrapper from '../../../utils/ModalWrapper'
import { HiPhone } from 'react-icons/hi'

type Props = {
    onClose: () => void
}

export default function NewCallLogModal({ onClose }: Props) {
    const [date, setDate] = useState('')
    const [type, setType] = useState('')
    const [duration, setDuration] = useState('')
    const [notes, setNotes] = useState('')

    const handleSubmit = () => {
        if (!date || !type || !duration) {
            alert('Please fill all required fields')
            return
        }

        console.log({ date, type, duration, notes })
        onClose()
    }

    return (
        <ModalWrapper
            title="Log a Call"
            icon={<HiPhone className="text-teal-600 w-5 h-5" />}
            submitLabel="Save Log"
            submitColor="bg-teal-600"
            onClose={onClose}
            onSubmit={handleSubmit}
        >
            <div className="grid gap-4">
                <label className="block">
                    <span className="text-sm font-medium">Date</span>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                    />
                </label>

                <label className="block">
                    <span className="text-sm font-medium">Call Type</span>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                    >
                        <option value="">Select</option>
                        <option value="Inbound">Inbound</option>
                        <option value="Outbound">Outbound</option>
                    </select>
                </label>

                <label className="block">
                    <span className="text-sm font-medium">Duration (minutes)</span>
                    <input
                        type="text"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="e.g. 5 min"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                    />
                </label>

                <label className="block">
                    <span className="text-sm font-medium">Notes</span>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all resize-none"
                        rows={3}
                    />
                </label>
            </div>
        </ModalWrapper>
    )
}
