import { useState } from 'react'
import { toast } from 'react-hot-toast'
import ModalWrapper from '../../../utils/ModalWrapper'
import { HiTruck } from 'react-icons/hi'
import { customerService } from '../../../services/customers'

interface Props {
    customerId: string
    onClose: () => void
    onSuccess: () => void
}

export default function NewTowingModal({ customerId, onClose, onSuccess }: Props) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [status, setStatus] = useState('scheduled')
    const [location, setLocation] = useState('')
    const [destination, setDestination] = useState('')
    const [cost, setCost] = useState('')
    const [vehicle, setVehicle] = useState('')
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!location) {
            toast.error('Please fill all required fields')
            return
        }

        setLoading(true)

        try {
            await customerService.addTowing(customerId, {
                date: date || new Date().toISOString(),
                location: location,
                destination: destination || undefined,
                status: status as 'scheduled' | 'in_progress' | 'completed' | 'cancelled',
                cost: cost ? parseFloat(cost) : 0,
                vehicle: vehicle || undefined,
                notes: notes || undefined
            })
            
            toast.success('Towing record added successfully!')
            onSuccess()
            onClose()
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to add towing record'
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <ModalWrapper
            title="Record New Towing Service"
            icon={<HiTruck className="text-orange-500 w-5 h-5" />}
            submitLabel={loading ? "Saving..." : "Save Tow"}
            submitColor="bg-orange-600"
            onClose={onClose}
            onSubmit={handleSubmit}
            disabled={loading}
        >
            <div className="grid gap-4">
                <label className="block">
                    <span className="text-sm font-medium">Date</span>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                    />
                </label>
                <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                        <span className="text-sm font-medium">Status</span>
                        <select value={status} onChange={e => setStatus(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                        >
                            <option value="scheduled">Scheduled</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </label>
                    <label className="block">
                        <span className="text-sm font-medium">Cost ($)</span>
                        <input type="number" value={cost} onChange={e => setCost(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                            min="0"
                            step="0.01"
                        />
                    </label>
                </div>
                <label className="block">
                    <span className="text-sm font-medium">Location *</span>
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                        required
                    />
                </label>
                <label className="block">
                    <span className="text-sm font-medium">Destination</span>
                    <input type="text" value={destination} onChange={e => setDestination(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
                    />
                </label>
                <label className="block">
                    <span className="text-sm font-medium">Vehicle</span>
                    <input type="text" value={vehicle} onChange={e => setVehicle(e.target.value)}
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
