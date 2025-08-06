import { useState } from 'react'
import ModalWrapper from '../../../utils/ModalWrapper'
import { HiCalendar } from 'react-icons/hi'

export default function NewAppointmentModal({ onClose }: { onClose: () => void }) {
    const [date, setDate] = useState('')
    const [time, setTime] = useState('')
    const [type, setType] = useState('')
    const [notes, setNotes] = useState('')

    const handleSubmit = () => {
        if (!date || !time || !type) {
            alert('Please complete all required fields.')
            return
        }
        console.log({ date, time, type, notes })
        onClose()
    }

    return (
        <ModalWrapper
            title="Schedule New Appointment"
            icon={<HiCalendar className="text-indigo-500 w-5 h-5" />}
            submitLabel="Schedule"
            submitColor="bg-indigo-600"
            onClose={onClose}
            onSubmit={handleSubmit}
        >
            <div className="grid gap-4">
                <label className="block">
                    <span className="text-sm font-medium">Date</span>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                    />
                </label>
                <label className="block">
                    <span className="text-sm font-medium">Time</span>
                    <input type="time" value={time} onChange={e => setTime(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                    />
                </label>
                <label className="block">
                    <span className="text-sm font-medium">Type</span>
                    <select value={type} onChange={e => setType(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                    >
                        <option value="">Select</option>
                        <option>Meeting</option>
                        <option>Phone Call</option>
                        <option>Inspection</option>
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
