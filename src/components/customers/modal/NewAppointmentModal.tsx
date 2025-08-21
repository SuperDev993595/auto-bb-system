import { useState, useEffect } from 'react'
import ModalWrapper from '../../../utils/ModalWrapper'
import { HiCalendar, HiClock, HiUser, HiTruck } from 'react-icons/hi'
import { API_ENDPOINTS, getAuthHeaders } from '../../../services/api'

export default function NewAppointmentModal({ onClose }: { onClose: () => void }) {
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
            title="Schedule New Appointment"
            icon={<HiCalendar className="text-indigo-500 w-5 h-5" />}
            submitLabel="Schedule"
            submitColor="bg-indigo-600"
            onClose={onClose}
            onSubmit={handleSubmit}
        >
            <div className="grid gap-4">
                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                        <span className="text-sm font-medium flex items-center gap-1">
                            <HiCalendar className="w-4 h-4" />
                            Date *
                        </span>
                        <input 
                            type="date" 
                            value={date} 
                            onChange={e => setDate(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            required
                        />
                    </label>
                    <label className="block">
                        <span className="text-sm font-medium flex items-center gap-1">
                            <HiClock className="w-4 h-4" />
                            Time *
                        </span>
                        <input 
                            type="time" 
                            value={time} 
                            onChange={e => setTime(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            required
                        />
                    </label>
                </div>

                {/* Service Type */}
                <label className="block">
                    <span className="text-sm font-medium">Service Type *</span>
                    <select 
                        value={serviceType} 
                        onChange={e => setServiceType(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                    <span className="text-sm font-medium flex items-center gap-1">
                        <HiUser className="w-4 h-4" />
                        Assign Technician
                    </span>
                    <select 
                        value={technicianId} 
                        onChange={e => setTechnicianId(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                    <span className="text-sm font-medium flex items-center gap-1">
                        <HiTruck className="w-4 h-4" />
                        Vehicle *
                    </span>
                    <input 
                        type="text" 
                        placeholder="e.g., 2020 Toyota Camry"
                        value={vehicle} 
                        onChange={e => setVehicle(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        required
                    />
                </label>

                {/* Duration and Priority */}
                <div className="grid grid-cols-2 gap-4">
                    <label className="block">
                        <span className="text-sm font-medium">Duration (minutes)</span>
                        <input 
                            type="number" 
                            min="15" 
                            max="480"
                            value={estimatedDuration} 
                            onChange={e => setEstimatedDuration(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                    </label>
                    <label className="block">
                        <span className="text-sm font-medium">Priority</span>
                        <select 
                            value={priority} 
                            onChange={e => setPriority(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                    <span className="text-sm font-medium">Status</span>
                    <select 
                        value={status} 
                        onChange={e => setStatus(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                    <span className="text-sm font-medium">Notes</span>
                    <textarea 
                        rows={3} 
                        value={notes} 
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Any special instructions or notes..."
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                    />
                </label>
            </div>
        </ModalWrapper>
    )
}
