import { useState, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "../redux"
import AppointmentCard from "../components/Appointments/AppointmentCard"
import AppointmentCalendar from "../components/Appointments/AppointmentCalendar"
import AppointmentModal from "../components/Appointments/AppointmentModal"
import PageTitle from "../components/Shared/PageTitle"
import { Grid3X3, Calendar, Filter, Search, Plus, Loader2 } from "lucide-react"
import { addAppointment, setAppointments, setLoading } from "../redux/reducer/appointmentsReducer"
import { toast } from "react-hot-toast"
import appointmentService from "../services/appointments"
import { API_ENDPOINTS, getAuthHeaders } from "../services/api"

type ViewMode = 'calendar' | 'grid'

export default function AppointmentsPage() {
    const dispatch = useAppDispatch()
    const [viewMode, setViewMode] = useState<ViewMode>('calendar')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const [technicianFilter, setTechnicianFilter] = useState<string>('all')
    const [searchTerm, setSearchTerm] = useState<string>('')
    const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false)
    const [isCreatingAppointment, setIsCreatingAppointment] = useState(false)
    const [isLoadingData, setIsLoadingData] = useState(true)
    
    const appointments = useAppSelector(state => state.appointments.data)
    const loading = useAppSelector(state => state.appointments.loading)
    const [technicians, setTechnicians] = useState<any[]>([])
    
    // Fetch technicians
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

    // Fetch appointments on component mount
    useEffect(() => {
        fetchAppointments()
        fetchTechnicians()
    }, [])

    const fetchAppointments = async () => {
        try {
            setIsLoadingData(true)
            dispatch(setLoading(true))
            
            const response = await appointmentService.getAppointments({
                status: statusFilter !== 'all' ? statusFilter as any : undefined,
                technicianId: technicianFilter !== 'all' ? technicianFilter : undefined,
                search: searchTerm || undefined
            })

            if (response.success) {
                console.log('Appointments API response:', response.data)
                // Transform backend data to frontend format
                const transformedAppointments = (response.data.appointments || []).map((apt: any) => {
                    // Extract customer name properly
                    let customerName = 'Unknown Customer'
                    if (apt.customer) {
                        if (typeof apt.customer === 'string') {
                            customerName = apt.customer
                        } else if (apt.customer.name) {
                            customerName = apt.customer.name
                        } else if (apt.customer.contactPerson?.name) {
                            customerName = apt.customer.contactPerson.name
                        } else if (apt.customer.businessName) {
                            customerName = apt.customer.businessName
                        }
                    } else if (apt.customerName) {
                        customerName = apt.customerName
                    }

                    // Extract vehicle info properly
                    let vehicleInfo = 'Unknown Vehicle'
                    if (apt.vehicle) {
                        if (typeof apt.vehicle === 'string') {
                            vehicleInfo = apt.vehicle
                        } else if (apt.vehicle.year && apt.vehicle.make && apt.vehicle.model) {
                            vehicleInfo = `${apt.vehicle.year} ${apt.vehicle.make} ${apt.vehicle.model}`
                        }
                    } else if (apt.vehicleInfo) {
                        vehicleInfo = apt.vehicleInfo
                    }

                    // Extract service type properly
                    let serviceType = 'Unknown Service'
                    if (apt.serviceType) {
                        serviceType = apt.serviceType
                    } else if (apt.serviceDescription) {
                        serviceType = apt.serviceDescription
                    } else if (apt.service) {
                        serviceType = apt.service
                    }

                    return {
                        id: apt._id || apt.id,
                        customerId: apt.customer?._id || apt.customerId,
                        customerName,
                        vehicleId: apt.vehicle?._id || apt.vehicleId,
                        vehicleInfo,
                        date: apt.scheduledDate ? new Date(apt.scheduledDate).toISOString().split('T')[0] : apt.date,
                        time: apt.scheduledTime || apt.time,
                        estimatedDuration: apt.estimatedDuration || 60,
                        serviceType,
                        description: apt.serviceDescription || apt.description || serviceType,
                        status: apt.status || 'scheduled',
                        technicianId: apt.technician?._id || apt.technicianId,
                        technicianName: apt.technician?.name || apt.technicianName,
                        priority: apt.priority || 'medium',
                        createdDate: apt.createdAt ? new Date(apt.createdAt).toISOString().split('T')[0] : apt.createdDate,
                        notes: apt.notes || ''
                    }
                })
                console.log('Transformed appointments:', transformedAppointments)
                dispatch(setAppointments(transformedAppointments))
            } else {
                console.error('Appointments API error:', response)
                toast.error(response.message || 'Failed to fetch appointments')
            }
        } catch (error) {
            console.error('Error fetching appointments:', error)
            toast.error('Failed to load appointments')
        } finally {
            setIsLoadingData(false)
            dispatch(setLoading(false))
        }
    }

    // Refetch appointments when filters change
    useEffect(() => {
        fetchAppointments()
    }, [statusFilter, technicianFilter, searchTerm])
    
    // Filter appointments (client-side filtering for immediate UI updates)
    const filteredAppointments = appointments.filter(apt => {
        if (statusFilter !== 'all' && apt.status !== statusFilter) return false
        if (technicianFilter !== 'all' && apt.technicianId !== technicianFilter) return false
        if (searchTerm && !apt.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) && 
            !apt.vehicleInfo?.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !apt.serviceType?.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !apt.technicianName?.toLowerCase().includes(searchTerm.toLowerCase())) return false
        return true
    })

    // Debug logging for technician filtering
    if (technicianFilter !== 'all') {
        console.log('Technician filter active:', {
            filterValue: technicianFilter,
            totalAppointments: appointments.length,
            filteredCount: filteredAppointments.length,
            appointmentsWithTechnician: appointments.filter(apt => apt.technicianId).map(apt => ({
                id: apt.id,
                technicianId: apt.technicianId,
                technicianName: apt.technicianName
            }))
        });
    }

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

            // Prepare data for API using the service interface
            const appointmentPayload = {
                customerId: appointmentData.customerId,
                date: appointmentData.date.split('T')[0],
                time: appointmentData.date.split('T')[1]?.substring(0, 5) || '09:00',
                service: appointmentData.serviceType,
                vehicleId: appointmentData.vehicleId,
                notes: appointmentData.notes || '',
                technicianId: appointmentData.technicianId || (technicians.length > 0 ? technicians[0].id : undefined)
            }

            const response = await appointmentService.createAppointment(appointmentPayload)

            if (response.success) {
                // Add to Redux store
                const newAppointment = {
                    id: response.data.appointment._id || `apt${Date.now()}`,
                    customerId: appointmentData.customerId,
                    customerName: appointmentData.customer,
                    vehicleId: appointmentData.vehicleId,
                    vehicleInfo: appointmentData.vehicle,
                    date: appointmentData.date.split('T')[0],
                    time: appointmentData.date.split('T')[1]?.substring(0, 5) || '09:00',
                    estimatedDuration: 60,
                    serviceType: appointmentData.serviceType,
                    description: appointmentData.serviceType,
                    status: 'scheduled' as const,
                    priority: 'medium' as const,
                    createdDate: new Date().toISOString().split('T')[0],
                    notes: appointmentData.notes || '',
                    technicianId: appointmentData.technicianId || (technicians.length > 0 ? technicians[0].id : undefined),
                    technicianName: appointmentData.technicianName || (technicians.length > 0 ? technicians[0].name : undefined),
                }
                
                dispatch(addAppointment(newAppointment))
                toast.success('Appointment created successfully!')
                setShowNewAppointmentModal(false)
                
                // Refresh appointments list
                fetchAppointments()
            } else {
                toast.error(response.message || 'Failed to create appointment')
            }
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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        fetchAppointments()
    }

    if (isLoadingData) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
                    <p className="text-gray-600">Loading appointments...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <PageTitle title="Appointments" />
                
                <div className="flex items-center gap-4">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search appointments..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                        >
                            Search
                        </button>
                    </form>

                    {/* Filters */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-500" />
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
                                <option key={(tech as any).id || (tech as any)._id} value={(tech as any).id || (tech as any)._id}>
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
                            <Calendar className="w-4 h-4" />
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
                            <Grid3X3 className="w-4 h-4" />
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
                            <Calendar className="w-6 h-6 text-blue-600" />
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
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            New Appointment
                        </button>
                    </div>
                    
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            <span className="ml-2 text-gray-600">Loading...</span>
                        </div>
                    ) : filteredAppointments.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredAppointments.map((apt) => (
                                <AppointmentCard 
                                    key={apt.id} 
                                    appointment={apt}
                                    onEdit={(appointment) => {
                                        // Handle edit - you can implement this later
                                        console.log('Edit appointment:', appointment)
                                    }}
                                    onView={(appointment) => {
                                        // Handle view - you can implement this later
                                        console.log('View appointment:', appointment)
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-500 mb-2">No appointments found</h3>
                            <p className="text-gray-400">
                                {searchTerm || statusFilter !== 'all' || technicianFilter !== 'all' 
                                    ? 'Try adjusting your filters or search terms.' 
                                    : 'Create a new appointment to get started.'}
                            </p>
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
