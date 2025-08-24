import { useState, useEffect } from 'react'
import ModalWrapper from '../../../utils/ModalWrapper'
import { Calendar, Clock, User, Truck } from '../../../utils/icons'
import { API_ENDPOINTS, getAuthHeaders } from '../../../services/api'

interface Props {
    customerId: string
    onClose: () => void
    onSuccess?: () => void
}

export default function NewAppointmentModal({ customerId, onClose, onSuccess }: Props) {
    const [date, setDate] = useState('')
    const [time, setTime] = useState('')
    const [serviceType, setServiceType] = useState('')
    const [vehicle, setVehicle] = useState('')
    const [estimatedDuration, setEstimatedDuration] = useState('60')
    const [priority, setPriority] = useState('medium')
    const [status, setStatus] = useState('scheduled')
    const [notes, setNotes] = useState('')
    const [technicianId, setTechnicianId] = useState('')
    const [technicians, setTechnicians] = useState<any[]>([])

    // Fetch technicians when modal loads
    useEffect(() => {
        const fetchTechnicians = async () => {
            try {
                const response = await fetch(`${API_ENDPOINTS.CUSTOMERS}/technicians`, {
                    headers: getAuthHeaders()
                });
                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        setTechnicians(data.data.technicians || []);
                    }
                }
            } catch (error) {
                console.error('Error loading technicians:', error);
                setTechnicians([]);
            }
        };
        
        fetchTechnicians();
    }, []);

    const handleSubmit = () => {
        if (!date || !time || !serviceType || !vehicle) {
            alert('Please complete all required fields.')
            return
        }
        console.log({ 
            date, 
            time, 
            serviceType, 
            vehicle, 
            estimatedDuration, 
            priority, 
            status, 
            notes,
            technicianId
        })
        onClose()
    }

    return (
        <ModalWrapper
            isOpen={true}
            onClose={onClose}
            title="New Appointment"
            icon={<Calendar className="w-5 h-5" />}
            submitText="Create Appointment"
            submitColor="bg-blue-600"
            onSubmit={handleSubmit}
        >
            <div className="grid gap-6">
                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-6">
                    <label className="block">
                        <span className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-indigo-600" />
                            Date *
                        </span>
                        <input 
                            type="date" 
                            value={date} 
                            onChange={e => setDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:bg-white"
                            required
                        />
                    </label>
                    <label className="block">
                        <span className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                            <Clock className="w-4 h-4 text-indigo-600" />
                            Time *
                        </span>
                        <input 
                            type="time" 
                            value={time} 
                            onChange={e => setTime(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:bg-white"
                            required
                        />
                    </label>
                </div>

                {/* Service Type */}
                <label className="block">
                    <span className="text-sm font-medium text-gray-700 mb-2 block">Service Type *</span>
                    <select 
                        value={serviceType} 
                        onChange={e => setServiceType(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:bg-white"
                        required
                    >
                        <option value="">Select Service</option>
                        <option value="oil_change">Oil Change</option>
                        <option value="brake_service">Brake Service</option>
                        <option value="tire_rotation">Tire Rotation</option>
                        <option value="transmission_service">Transmission Service</option>
                        <option value="engine_repair">Engine Repair</option>
                        <option value="electrical_repair">Electrical Repair</option>
                        <option value="diagnostic">Diagnostic</option>
                        <option value="inspection">Inspection</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="emergency_repair">Emergency Repair</option>
                        <option value="other">Other</option>
                    </select>
                </label>

                {/* Technician */}
                <label className="block">
                    <span className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                        <User className="w-4 h-4 text-indigo-600" />
                        Assign Technician
                    </span>
                    <select 
                        value={technicianId} 
                        onChange={e => setTechnicianId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:bg-white"
                    >
                        <option value="">Select a technician (optional)</option>
                        {technicians.filter(tech => tech.isActive).map((technician) => (
                            <option key={(technician as any).id || (technician as any)._id} value={(technician as any).id || (technician as any)._id}>
                                {technician.name} - {Array.isArray(technician.specializations) ? technician.specializations.join(', ') : technician.specializations}
                            </option>
                        ))}
                    </select>
                </label>

                {/* Vehicle */}
                <label className="block">
                    <span className="text-sm font-medium text-gray-700 mb-2 block flex items-center gap-2">
                        <Truck className="w-4 h-4 text-indigo-600" />
                        Vehicle *
                    </span>
                    <input 
                        type="text" 
                        placeholder="e.g., 2020 Toyota Camry"
                        value={vehicle} 
                        onChange={e => setVehicle(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:bg-white"
                        required
                    />
                </label>

                {/* Duration and Priority */}
                <div className="grid grid-cols-2 gap-6">
                    <label className="block">
                        <span className="text-sm font-medium text-gray-700 mb-2 block">Duration (minutes)</span>
                        <input 
                            type="number" 
                            min="15" 
                            max="480"
                            value={estimatedDuration} 
                            onChange={e => setEstimatedDuration(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:bg-white"
                        />
                    </label>
                    <label className="block">
                        <span className="text-sm font-medium text-gray-700 mb-2 block">Priority</span>
                        <select 
                            value={priority} 
                            onChange={e => setPriority(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:bg-white"
                        >
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </label>
                </div>

                {/* Status */}
                <label className="block">
                    <span className="text-sm font-medium text-gray-700 mb-2 block">Status</span>
                    <select 
                        value={status} 
                        onChange={e => setStatus(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:bg-white"
                    >
                        <option value="scheduled">Scheduled</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </label>

                {/* Notes */}
                <label className="block">
                    <span className="text-sm font-medium text-gray-700 mb-2 block">Notes</span>
                    <textarea 
                        rows={3} 
                        value={notes} 
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Any special instructions or notes..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:bg-white resize-none"
                    />
                </label>
            </div>
        </ModalWrapper>
    )
}
