import { useState } from 'react'
import ModalWrapper from '../../../utils/ModalWrapper'
import { HiTruck } from 'react-icons/hi'

export default function NewTowingModal({ onClose }: { onClose: () => void }) {
    const [date, setDate] = useState('')
    const [status, setStatus] = useState('')
    const [location, setLocation] = useState('')
    const [notes, setNotes] = useState('')

    const handleSubmit = () => {
        if (!date || !status || !location) {
            alert('Please fill all required fields')
            return
        }
        console.log({ date, status, location, notes })
        onClose()
    }

    return (
        <ModalWrapper
            title="Record New Towing Service"
            icon={<HiTruck className="text-orange-500 w-5 h-5" />}
            submitLabel="Save Tow"
            submitColor="bg-orange-600"
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
                    <span className="text-sm font-medium">Status</span>
                    <select value={status} onChange={e => setStatus(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                    >
                        <option value="">Select</option>
                        <option>Scheduled</option>
                        <option>Completed</option>
                    </select>
                </label>
                <label className="block">
                    <span className="text-sm font-medium">Location</span>
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                    />
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
