import { useState, useEffect } from 'react'
import { HiCalendar } from 'react-icons/hi'
import { FaEdit, FaTrash } from 'react-icons/fa'
import { Customer } from '../../../services/customers'
import Pagination from '../../../utils/Pagination'
import NewAppointmentModal from '../modal/NewAppointmentModal'
import { toast } from 'react-hot-toast'
import api, { apiResponse } from '../../../services/api'

interface Appointment {
    _id: string
    date: string
    time: string
    status: string
    serviceType?: string
    notes?: string
    customer: {
        _id: string
        name: string
    }
    vehicle?: {
        _id: string
        make: string
        model: string
        year: number
    }
    technician?: {
        _id: string
        name: string
    }
    createdAt: string
}

export default function AppointmentsSection({ customer }: { customer: Customer }) {
    const [appointments, setAppointments] = useState<Appointment[]>([])
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalAppointments: 0,
        hasNextPage: false,
        hasPrevPage: false
    })
    const itemsPerPage = 8

    // Fetch customer appointments
    const fetchAppointments = async () => {
        setLoading(true)
        try {
            const response = await apiResponse(api.get(`/appointments?customer=${customer._id}&page=${currentPage}&limit=${itemsPerPage}&sortBy=date&sortOrder=desc`))
            setAppointments(response.data.appointments)
            setPagination(response.data.pagination)
        } catch (error: any) {
            toast.error('Failed to fetch appointments')
            console.error('Error fetching appointments:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAppointments()
    }, [customer._id, currentPage])

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
    }

    const handleAppointmentSuccess = () => {
        fetchAppointments()
    }

    const handleDeleteAppointment = async (appointmentId: string) => {
        if (!window.confirm('Are you sure you want to delete this appointment?')) {
            return
        }

        try {
            await apiResponse(api.delete(`/appointments/${appointmentId}`))
            toast.success('Appointment deleted successfully')
            fetchAppointments()
        } catch (error: any) {
            toast.error('Failed to delete appointment')
            console.error('Error deleting appointment:', error)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'scheduled':
                return 'bg-blue-100 text-blue-800'
            case 'confirmed':
                return 'bg-green-100 text-green-800'
            case 'in_progress':
                return 'bg-yellow-100 text-yellow-800'
            case 'completed':
                return 'bg-gray-100 text-gray-800'
            case 'cancelled':
                return 'bg-red-100 text-red-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const formatDateTime = (date: string, time: string) => {
        const dateObj = new Date(date)
        return {
            date: dateObj.toLocaleDateString(),
            time: time || 'TBD'
        }
    }

    return (
        <div>
            {open && (
                <NewAppointmentModal 
                    customerId={customer._id}
                    onClose={() => setOpen(false)} 
                    onSuccess={handleAppointmentSuccess}
                />
            )}

            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <HiCalendar className="text-indigo-600" /> 
                    Appointments
                    {pagination.totalAppointments > 0 && (
                        <span className="text-sm text-gray-500">
                            ({pagination.totalAppointments} appointments)
                        </span>
                    )}
                </h3>
                <button 
                    onClick={() => setOpen(true)} 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-medium"
                >
                    + Add Appointment
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
            ) : appointments.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                        {appointments.map((appointment) => {
                            const { date, time } = formatDateTime(appointment.date, appointment.time)
                            return (
                                <div key={appointment._id} className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <div className="flex gap-2 mb-1">
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(appointment.status)}`}>
                                                    {appointment.status}
                                                </span>
                                                {appointment.serviceType && (
                                                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                                        {appointment.serviceType}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteAppointment(appointment._id)}
                                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                            title="Delete Appointment"
                                        >
                                            <FaTrash className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-1">
                                        📅 {date} • {time}
                                    </p>
                                    {appointment.vehicle && (
                                        <p className="text-sm text-gray-600 mb-1">
                                            🚗 {appointment.vehicle.year} {appointment.vehicle.make} {appointment.vehicle.model}
                                        </p>
                                    )}
                                    {appointment.technician && (
                                        <p className="text-sm text-gray-600 mb-1">
                                            👨‍🔧 {appointment.technician.name}
                                        </p>
                                    )}
                                    {appointment.notes && (
                                        <p className="text-sm italic text-gray-500">
                                            {appointment.notes}
                                        </p>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {pagination.totalPages > 1 && (
                        <Pagination 
                            currentPage={pagination.currentPage} 
                            totalPages={pagination.totalPages} 
                            setCurrentPage={handlePageChange} 
                        />
                    )}
                </>
            ) : (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📅</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                    <p className="text-gray-600 mb-6">This customer hasn't scheduled any appointments yet.</p>
                    <button 
                        onClick={() => setOpen(true)} 
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
                    >
                        <HiCalendar className="w-4 h-4" />
                        Schedule First Appointment
                    </button>
                </div>
            )}
        </div>
    )
}
