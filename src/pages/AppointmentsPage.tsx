import { useState } from "react"
import { useAppSelector, useAppDispatch } from "../redux"
import AppointmentCard from "../components/Appointments/AppointmentCard"
import AppointmentCalendar from "../components/Appointments/AppointmentCalendar"
import AppointmentModal from "../components/Appointments/AppointmentModal"
import PageTitle from "../components/Shared/PageTitle"
import { HiViewGrid, HiCalendar, HiFilter } from "react-icons/hi"
import { addAppointment } from "../redux/reducer/appointmentsReducer"
import { toast } from "react-hot-toast"

type ViewMode = 'calendar' | 'grid'

export default function AppointmentsPage() {
    const dispatch = useAppDispatch()
    const [viewMode, setViewMode] = useState<ViewMode>('calendar')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [technicianFilter, setTechnicianFilter] = useState<string>('all')
    const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false)
    const [isCreatingAppointment, setIsCreatingAppointment] = useState(false)
    
    const appointments = useAppSelector(state => state.appointments.data)
    const technicians = useAppSelector(state => state.services.technicians)
    
    // Filter appointments
    const filteredAppointments = appointments.filter(apt => {
        if (statusFilter !== 'all' && apt.status !== statusFilter) return false
        if (technicianFilter !== 'all' && apt.technicianId !== technicianFilter) return false
        return true
    })

    // Get unique statuses for filter
    const statuses = Array.from(new Set(appointments.map(apt => apt.status)))

    // Handle new appointment creation
    const handleCreateAppointment = async (appointmentData: any) => {
        try {
            setIsCreatingAppointment(true)
            
            // Validate required fields
            if (!appointmentData.customer || !appointmentData.vehicle || !appointmentData.date || !appointmentData.serviceType) {
                toast.error('Please fill in all required fields');
                return;
            }

            const newAppointment = {
                id: `apt${Date.now()}`, // Generate unique ID
                customerId: `customer${Date.now()}`,
                customerName: appointmentData.customer,
                vehicleId: `vehicle${Date.now()}`,
                vehicleInfo: appointmentData.vehicle,
                date: appointmentData.date.split('T')[0], // Extract date part
                time: appointmentData.date.split('T')[1]?.substring(0, 5) || '09:00', // Extract time part
                estimatedDuration: 60, // Default duration
                serviceType: appointmentData.serviceType,
                description: appointmentData.serviceType,
                status: 'scheduled' as const,
                priority: 'medium' as const,
                createdDate: new Date().toISOString().split('T')[0],
                notes: appointmentData.notes || '',
                technicianId: technicians.length > 0 ? technicians[0].id : undefined,
                technicianName: technicians.length > 0 ? technicians[0].name : undefined,
            }

            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 500))
            
            dispatch(addAppointment(newAppointment))
            toast.success('Appointment created successfully!')
            setShowNewAppointmentModal(false)
        } catch (error) {
            console.error('Error creating appointment:', error)
            toast.error('Failed to create appointment. Please try again.')
        } finally {
            setIsCreatingAppointment(false)
        }
    }

    const handleCloseModal = () => {
        setShowNewAppointmentModal(false)
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <PageTitle title="Appointments" />
                
                <div className="flex items-center gap-4">
                    {/* Filters */}
                    <div className="flex items-center gap-2">
                        <HiFilter className="w-5 h-5 text-gray-500" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="all">All Status</option>
                            {statuses.map(status => (
                                <option key={status} value={status} className="capitalize">
                                    {status.replace('-', ' ')}
                                </option>
                            ))}
                        </select>
                        
                        <select
                            value={technicianFilter}
                            onChange={(e) => setTechnicianFilter(e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                        >
                            <option value="all">All Technicians</option>
                            {technicians.map(tech => (
                                <option key={tech.id} value={tech.id}>
                                    {tech.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    {/* View Toggle */}
                    <div className="flex bg-gray-100 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium ${
                                viewMode === 'calendar' 
                                    ? 'bg-white text-gray-900 shadow-sm' 
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <HiCalendar className="w-4 h-4" />
                            Calendar
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium ${
                                viewMode === 'grid' 
                                    ? 'bg-white text-gray-900 shadow-sm' 
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <HiViewGrid className="w-4 h-4" />
                            Grid
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Today's Appointments</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {appointments.filter(apt => apt.date === new Date().toISOString().split('T')[0]).length}
                            </p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <HiCalendar className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Confirmed</p>
                            <p className="text-2xl font-bold text-green-600">
                                {appointments.filter(apt => apt.status === 'confirmed').length}
                            </p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <div className="w-6 h-6 bg-green-600 rounded-full"></div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">In Progress</p>
                            <p className="text-2xl font-bold text-yellow-600">
                                {appointments.filter(apt => apt.status === 'in-progress').length}
                            </p>
                        </div>
                        <div className="bg-yellow-100 p-3 rounded-full">
                            <div className="w-6 h-6 bg-yellow-600 rounded-full"></div>
                        </div>
                    </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Completed</p>
                            <p className="text-2xl font-bold text-gray-600">
                                {appointments.filter(apt => apt.status === 'completed').length}
                            </p>
                        </div>
                        <div className="bg-gray-100 p-3 rounded-full">
                            <div className="w-6 h-6 bg-gray-600 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            {viewMode === 'calendar' ? (
                <AppointmentCalendar />
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-800">
                            Appointments ({filteredAppointments.length})
                        </h3>
                        <button 
                            onClick={() => setShowNewAppointmentModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                            + New Appointment
                        </button>
                    </div>
                    
                    {filteredAppointments.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredAppointments.map((apt) => (
                                <AppointmentCard 
                                    key={apt.id} 
                                    customer={apt.customerName}
                                    vehicle={apt.vehicleInfo}
                                    date={apt.date}
                                    service={apt.serviceType}
                                    status={apt.status}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <HiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-500 mb-2">No appointments found</h3>
                            <p className="text-gray-400">Try adjusting your filters or create a new appointment.</p>
                        </div>
                    )}
                </div>
            )}

            {/* New Appointment Modal */}
            {showNewAppointmentModal && (
                <AppointmentModal
                    onClose={handleCloseModal}
                    onSave={handleCreateAppointment}
                    isLoading={isCreatingAppointment}
                />
            )}
        </div>
    );
}
