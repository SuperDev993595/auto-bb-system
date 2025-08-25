import { useState } from 'react'
import { toast } from 'react-hot-toast'
import ModalWrapper from '../../../utils/ModalWrapper'
import { Truck } from '../../../utils/icons'
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
            isOpen={true}
            onClose={onClose}
            title="New Towing Service"
            icon={<Truck className="w-5 h-5" />}
            submitText="Schedule Towing"
            submitColor="bg-orange-600"
            onSubmit={handleSubmit}
        >
            <div className="p-6 grid gap-6">
                <label className="block">
                    <span className="text-sm font-medium text-gray-700 mb-2 block">Date</span>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:bg-white"
                    />
                </label>
                <div className="grid grid-cols-2 gap-6">
                    <label className="block">
                        <span className="text-sm font-medium text-gray-700 mb-2 block">Status</span>
                        <select value={status} onChange={e => setStatus(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:bg-white"
                        >
                            <option value="scheduled">Scheduled</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </label>
                    <label className="block">
                        <span className="text-sm font-medium text-gray-700 mb-2 block">Cost ($)</span>
                        <input type="number" value={cost} onChange={e => setCost(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:bg-white"
                            min="0"
                            step="0.01"
                        />
                    </label>
                </div>
                <label className="block">
                    <span className="text-sm font-medium text-gray-700 mb-2 block">Location *</span>
                    <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:bg-white"
                        required
                    />
                </label>
                <label className="block">
                    <span className="text-sm font-medium text-gray-700 mb-2 block">Destination</span>
                    <input type="text" value={destination} onChange={e => setDestination(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:bg-white"
                    />
                </label>
                <label className="block">
                    <span className="text-sm font-medium text-gray-700 mb-2 block">Vehicle</span>
                    <input type="text" value={vehicle} onChange={e => setVehicle(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:bg-white"
                    />
                </label>
                <label className="block">
                    <span className="text-sm font-medium text-gray-700 mb-2 block">Notes</span>
                    <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 hover:bg-white resize-none"
                    />
                </label>
            </div>
        </ModalWrapper>
    )
}
