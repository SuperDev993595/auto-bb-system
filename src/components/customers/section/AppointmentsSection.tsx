import { useState, useEffect } from 'react'
import { Customer } from '../../../services/customers'
import Pagination from '../../../utils/Pagination'
import NewAppointmentModal from '../modal/NewAppointmentModal'
import { Calendar, Edit, Trash2 } from '../../../utils/icons'
import { toast } from 'react-hot-toast'
import api, { apiResponse } from '../../../services/api'

interface Appointment {
    _id: string
    scheduledDate: string
    scheduledTime: string
    status: string
    serviceType?: string | {
        _id: string
        name: string
        category?: string
        estimatedDuration?: number
    }
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

    const formatDateTime = (scheduledDate: string, scheduledTime: string) => {
        try {
            const dateObj = new Date(scheduledDate)
            if (isNaN(dateObj.getTime())) {
                return {
                    date: 'Invalid Date',
                    time: scheduledTime || 'TBD'
                }
            }
            return {
                date: dateObj.toLocaleDateString(),
                time: scheduledTime || 'TBD'
            }
        } catch (error) {
            console.error('Error formatting date/time:', error)
            return {
                date: 'Invalid Date',
                time: scheduledTime || 'TBD'
            }
        }
    }

    return (
        <div>
            {open && (
                <NewAppointmentModal 
                    customerId={customer._id || customer.id || ''}
                    onClose={() => setOpen(false)} 
                    onSuccess={handleAppointmentSuccess}
                />
            )}

            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                        <Calendar className="text-indigo-600 w-5 h-5" />
                    </div>
                    Appointments
                    {pagination.totalAppointments > 0 && (
                        <span className="text-sm text-gray-500">
                            ({pagination.totalAppointments} appointments)
                        </span>
                    )}
                </h3>
                <button 
                    onClick={() => setOpen(true)} 
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        {appointments.map((appointment) => {
                            try {
                                const { date, time } = formatDateTime(appointment.scheduledDate, appointment.scheduledTime)
                                return (
                                    <div key={appointment._id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex-1">
                                                <div className="flex gap-2 mb-2">
                                                    <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${getStatusColor(appointment.status || 'scheduled')}`}>
                                                        {appointment.status || 'scheduled'}
                                                    </span>
                                                    {appointment.serviceType && (
                                                        <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg">
                                                            {typeof appointment.serviceType === 'string' 
                                                                ? appointment.serviceType 
                                                                : appointment.serviceType?.name || 'Unknown Service'
                                                            }
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDeleteAppointment(appointment._id)}
                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                                title="Delete Appointment"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">
                                            📅 {date} • {time}
                                        </p>
                                        {appointment.vehicle && (
                                            <p className="text-sm text-gray-600 mb-2">
                                                🚗 {appointment.vehicle.year || 'N/A'} {appointment.vehicle.make || 'Unknown'} {appointment.vehicle.model || 'Unknown'}
                                            </p>
                                        )}
                                        {appointment.technician && appointment.technician.name && (
                                            <p className="text-sm text-gray-600 mb-2">
                                                👨‍🔧 {appointment.technician.name}
                                            </p>
                                        )}
                                        {appointment.notes && appointment.notes.trim() && (
                                            <p className="text-sm italic text-gray-500">
                                                {appointment.notes}
                                            </p>
                                        )}
                                    </div>
                                )
                            } catch (error) {
                                console.error('Error rendering appointment:', error, appointment)
                                return (
                                    <div key={appointment._id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-lg">
                                        <p className="text-sm text-red-600">Error displaying appointment</p>
                                        <p className="text-xs text-gray-500">ID: {appointment._id}</p>
                                    </div>
                                )
                            }
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
                <div className="text-center py-16">
                    <div className="text-gray-400 text-6xl mb-6">📅</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">No appointments found</h3>
                    <p className="text-gray-600 mb-8">This customer hasn't scheduled any appointments yet.</p>
                    <button 
                        onClick={() => setOpen(true)} 
                        className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl inline-flex items-center gap-3 shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                    >
                        <Calendar className="w-5 h-5" />
                        Schedule First Appointment
                    </button>
                </div>
            )}
        </div>
    )
}
