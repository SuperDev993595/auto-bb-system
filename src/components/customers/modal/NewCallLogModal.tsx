import { useState } from 'react'
import { toast } from 'react-hot-toast'
import ModalWrapper from '../../../utils/ModalWrapper'
import { Phone } from '../../../utils/icons'
import { customerService } from '../../../services/customers'

interface Props {
    customerId: string
    onClose: () => void
    onSuccess: () => void
}

export default function NewCallLogModal({ customerId, onClose, onSuccess }: Props) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [type, setType] = useState('inbound')
    const [duration, setDuration] = useState('')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [summary, setSummary] = useState('')
    const [notes, setNotes] = useState('')
    const [followUpRequired, setFollowUpRequired] = useState(false)
    const [followUpDate, setFollowUpDate] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!type) {
            toast.error('Please fill all required fields')
            return
        }

        setLoading(true)

        try {
            // Convert duration from MM:SS format to seconds
            let durationSeconds = 0
            if (duration) {
                const parts = duration.split(':')
                if (parts.length === 2) {
                    durationSeconds = parseInt(parts[0]) * 60 + parseInt(parts[1])
                } else {
                    durationSeconds = parseInt(duration) * 60 // Assume minutes if no colon
                }
            }

            await customerService.addCallLog(customerId, {
                date: date || new Date().toISOString(),
                type: type as 'inbound' | 'outbound' | 'missed' | 'voicemail',
                duration: durationSeconds,
                phoneNumber: phoneNumber || undefined,
                summary: summary || undefined,
                notes: notes || undefined,
                followUpRequired: followUpRequired,
                followUpDate: followUpDate || undefined
            })
            
            toast.success('Call log added successfully!')
            onSuccess()
            onClose()
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to add call log'
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <ModalWrapper
            isOpen={true}
            onClose={onClose}
            title="New Call Log"
            icon={<Phone className="w-5 h-5" />}
            submitText="Log Call"
            submitColor="bg-blue-600"
            onSubmit={handleSubmit}
        >
            <div className="grid gap-6">
                <label className="block">
                    <span className="text-sm font-medium text-gray-700 mb-2 block">Date</span>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 hover:bg-white"
                    />
                </label>

                <div className="grid grid-cols-2 gap-6">
                    <label className="block">
                        <span className="text-sm font-medium text-gray-700 mb-2 block">Call Type *</span>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 hover:bg-white"
                            required
                        >
                            <option value="inbound">Inbound</option>
                            <option value="outbound">Outbound</option>
                            <option value="missed">Missed</option>
                            <option value="voicemail">Voicemail</option>
                        </select>
                    </label>
                    <label className="block">
                        <span className="text-sm font-medium text-gray-700 mb-2 block">Duration (MM:SS)</span>
                        <input
                            type="text"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            placeholder="e.g. 05:30"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 hover:bg-white"
                        />
                    </label>
                </div>
                <label className="block">
                    <span className="text-sm font-medium text-gray-700 mb-2 block">Phone Number</span>
                    <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="e.g. (555) 123-4567"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 hover:bg-white"
                    />
                </label>
                <label className="block">
                    <span className="text-sm font-medium text-gray-700 mb-2 block">Summary</span>
                    <input
                        type="text"
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        placeholder="Brief summary of the call"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 hover:bg-white"
                    />
                </label>

                <div className="grid grid-cols-2 gap-6">
                    <label className="block">
                        <span className="text-sm font-medium text-gray-700 mb-2 block">Follow-up Required</span>
                        <div className="flex items-center mt-2">
                            <input
                                type="checkbox"
                                checked={followUpRequired}
                                onChange={(e) => setFollowUpRequired(e.target.checked)}
                                className="mr-3 w-4 h-4 text-teal-600 bg-gray-100 border-gray-300 rounded focus:ring-teal-500 focus:ring-2"
                            />
                            <span className="text-sm text-gray-600">Mark for follow-up</span>
                        </div>
                    </label>
                    <label className="block">
                        <span className="text-sm font-medium text-gray-700 mb-2 block">Follow-up Date</span>
                        <input
                            type="date"
                            value={followUpDate}
                            onChange={(e) => setFollowUpDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={!followUpRequired}
                        />
                    </label>
                </div>
                <label className="block">
                    <span className="text-sm font-medium text-gray-700 mb-2 block">Notes</span>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 hover:bg-white resize-none"
                        rows={3}
                        placeholder="Detailed notes about the call..."
                    />
                </label>
            </div>
        </ModalWrapper>
    )
}
