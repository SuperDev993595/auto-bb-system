import { useState, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "../redux"
import AppointmentCard from "../components/Appointments/AppointmentCard"
import AppointmentCalendar from "../components/Appointments/AppointmentCalendar"
import AppointmentModal from "../components/Appointments/AppointmentModal"
import PageTitle from "../components/Shared/PageTitle"
import { Grid3X3, Calendar, Filter, Search, Plus, Loader2 } from "lucide-react"
import { HiTrash } from "react-icons/hi"
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
    const [showEditAppointmentModal, setShowEditAppointmentModal] = useState(false)
    const [showViewAppointmentModal, setShowViewAppointmentModal] = useState(false)
    const [showDeleteAppointmentModal, setShowDeleteAppointmentModal] = useState(false)
    const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
    const [isCreatingAppointment, setIsCreatingAppointment] = useState(false)
    const [isLoadingData, setIsLoadingData] = useState(true)
    const [isDeletingAppointment, setIsDeletingAppointment] = useState(false)
    
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
                technicianId: technicianFilter !== 'all' ? technicianFilter : undefined
                // Remove search from backend call - we'll do client-side filtering
            })

            if (response.success) {
                console.log('Appointments API response:', response.data)
                // Transform backend data to frontend format
                const transformedAppointments = (response.data.appointments || []).map((apt: any, index: number) => {
                    try {
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
                        if (typeof apt.serviceType === 'string') {
                            serviceType = apt.serviceType
                        } else if (apt.serviceType.name) {
                            serviceType = apt.serviceType.name
                        } else if (apt.serviceType.category) {
                            serviceType = apt.serviceType.category
                        }
                    } else if (apt.serviceDescription) {
                        serviceType = apt.serviceDescription
                    } else if (apt.service) {
                        serviceType = apt.service
                    }

                    return {
                        id: apt._id || apt.id || `apt_${Date.now()}_${Math.random()}`,
                        customerId: apt.customer?._id || apt.customerId || '',
                        customerName: customerName || 'Unknown Customer',
                        vehicleId: apt.vehicle?._id || apt.vehicleId || '',
                        vehicleInfo: vehicleInfo || 'Unknown Vehicle',
                        scheduledDate: apt.scheduledDate ? new Date(apt.scheduledDate).toISOString().split('T')[0] : apt.date || new Date().toISOString().split('T')[0],
                        scheduledTime: apt.scheduledTime || apt.time || '09:00',
                        estimatedDuration: apt.estimatedDuration || 60,
                        serviceType: serviceType || 'Unknown Service',
                        description: apt.serviceDescription || apt.description || serviceType || 'No description',
                        status: apt.status || 'scheduled',
                        technicianId: apt.technician?._id || apt.technicianId || '',
                        technicianName: apt.technician?.name || apt.technicianName || '',
                        priority: apt.priority || 'medium',
                        createdDate: apt.createdAt ? new Date(apt.createdAt).toISOString().split('T')[0] : apt.createdDate || new Date().toISOString().split('T')[0],
                        notes: apt.notes || ''
                    }
                    } catch (error) {
                        console.error(`Error transforming appointment at index ${index}:`, error, apt);
                        // Return a safe fallback appointment object
                        return {
                            id: `error_apt_${index}_${Date.now()}`,
                            customerId: '',
                            customerName: 'Error Loading Customer',
                            vehicleId: '',
                            vehicleInfo: 'Error Loading Vehicle',
                            scheduledDate: new Date().toISOString().split('T')[0],
                            scheduledTime: '09:00',
                            estimatedDuration: 60,
                            serviceType: 'Error Loading Service',
                            description: 'Error loading appointment data',
                            status: 'scheduled' as const,
                            technicianId: '',
                            technicianName: '',
                            priority: 'medium' as const,
                            createdDate: new Date().toISOString().split('T')[0],
                            notes: 'Error occurred while loading this appointment'
                        };
                    }
                })
                console.log('Transformed appointments:', transformedAppointments)
                console.log('Sample appointment for search testing:', transformedAppointments[0])
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

    // Refetch appointments when filters change (but not search term - that's client-side)
    useEffect(() => {
        fetchAppointments()
    }, [statusFilter, technicianFilter])
    
    // Filter appointments (client-side filtering for immediate UI updates)
    const filteredAppointments = (appointments && Array.isArray(appointments) ? appointments : []).filter(apt => {
        try {
            // Status filter
            if (statusFilter !== 'all' && apt.status !== statusFilter) return false
            
            // Technician filter
            if (technicianFilter !== 'all' && apt.technicianId !== technicianFilter) return false
            
            // Search filter - if search term exists, check if any field matches
            if (searchTerm && searchTerm.trim()) {
                const searchLower = searchTerm.toLowerCase().trim()
                
                // Check customer name
                const customerNameMatch = apt.customerName?.toLowerCase().includes(searchLower) || false
                
                // Check vehicle info
                const vehicleInfoMatch = apt.vehicleInfo?.toLowerCase().includes(searchLower) || false
                
                // Check service type (handle both string and object)
                const serviceTypeMatch = (typeof apt.serviceType === 'string' 
                    ? apt.serviceType.toLowerCase().includes(searchLower)
                    : apt.serviceType?.name?.toLowerCase().includes(searchLower) || false) || false
                
                // Check technician name
                const technicianNameMatch = apt.technicianName?.toLowerCase().includes(searchLower) || false
                
                // Check notes
                const notesMatch = apt.notes?.toLowerCase().includes(searchLower) || false
                
                // Check description
                const descriptionMatch = apt.description?.toLowerCase().includes(searchLower) || false
                
                // Debug logging for search
                if (searchTerm && (customerNameMatch || vehicleInfoMatch || serviceTypeMatch || technicianNameMatch || notesMatch || descriptionMatch)) {
                    console.log('Search match found:', {
                        searchTerm,
                        appointmentId: apt.id,
                        customerName: apt.customerName,
                        vehicleInfo: apt.vehicleInfo,
                        serviceType: apt.serviceType,
                        technicianName: apt.technicianName,
                        matches: {
                            customerNameMatch,
                            vehicleInfoMatch,
                            serviceTypeMatch,
                            technicianNameMatch,
                            notesMatch,
                            descriptionMatch
                        }
                    })
                }
                
                // If none of the fields match, exclude this appointment
                if (!customerNameMatch && !vehicleInfoMatch && !serviceTypeMatch && 
                    !technicianNameMatch && !notesMatch && !descriptionMatch) {
                    return false
                }
            }
            
            return true
        } catch (error) {
            console.error('Error filtering appointment:', error, apt);
            // If there's an error filtering, include the appointment to be safe
            return true;
        }
    })

    // Debug logging for search results
    if (searchTerm && searchTerm.trim()) {
        console.log('Search results:', {
            searchTerm: searchTerm.trim(),
            totalAppointments: appointments?.length || 0,
            filteredCount: filteredAppointments.length,
            searchFields: ['customerName', 'vehicleInfo', 'serviceType', 'technicianName', 'notes', 'description']
        })
    }

    // Debug logging for technician filtering
    if (technicianFilter !== 'all') {
        console.log('Technician filter active:', {
            filterValue: technicianFilter,
            totalAppointments: appointments.length,
            filteredCount: filteredAppointments.length,
            appointmentsWithTechnician: (appointments && Array.isArray(appointments) ? appointments : []).filter(apt => apt.technicianId).map(apt => ({
                id: apt.id,
                technicianId: apt.technicianId,
                technicianName: apt.technicianName
            }))
        });
    }

    // Get unique statuses for filter
    const statuses = Array.from(new Set((appointments && Array.isArray(appointments) ? appointments : []).map(apt => apt.status)))

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
                    scheduledDate: appointmentData.date.split('T')[0],
                    scheduledTime: appointmentData.date.split('T')[1]?.substring(0, 5) || '09:00',
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

    const handleEditAppointment = (appointment: any) => {
        console.log('Editing appointment:', appointment);
        console.log('Appointment ID:', appointment.id);
        setSelectedAppointment(appointment)
        setShowEditAppointmentModal(true)
    }

    const handleUpdateAppointment = async (appointmentData: any) => {
        try {
            setIsCreatingAppointment(true)
            
            console.log('Update appointment data received:', appointmentData);
            
            // When editing, appointmentData might be the saved appointment from database
            // or the form data, so we need to handle both cases
            let updatePayload: any = {};
            
            if (appointmentData.scheduledDate && appointmentData.scheduledTime) {
                // This is the saved appointment data from database
                // Extract serviceTypeId from serviceType object if it exists
                let serviceTypeId = appointmentData.serviceType;
                if (typeof appointmentData.serviceType === 'object' && appointmentData.serviceType !== null) {
                    serviceTypeId = appointmentData.serviceType._id || appointmentData.serviceType.id;
                }
                
                updatePayload = {
                    scheduledDate: appointmentData.scheduledDate,
                    scheduledTime: appointmentData.scheduledTime,
                    serviceType: serviceTypeId,
                    technicianId: appointmentData.technicianId || undefined,
                    priority: appointmentData.priority || 'medium',
                    estimatedDuration: appointmentData.estimatedDuration || 60
                };
                
                // Only include notes if it has actual content
                if (appointmentData.notes && appointmentData.notes.trim()) {
                    updatePayload.notes = appointmentData.notes.trim();
                }
            } else if (appointmentData.date) {
                // This is form data with date field
                updatePayload = {
                    scheduledDate: appointmentData.date.split('T')[0],
                    scheduledTime: appointmentData.date.split('T')[1]?.substring(0, 5) || '09:00',
                    serviceType: appointmentData.serviceTypeId || appointmentData.serviceType,
                    technicianId: appointmentData.technicianId || undefined,
                    priority: appointmentData.priority || 'medium',
                    estimatedDuration: appointmentData.estimatedDuration || 60
                };
                
                // Only include notes if it has actual content
                if (appointmentData.notes && appointmentData.notes.trim()) {
                    updatePayload.notes = appointmentData.notes.trim();
                }
            } else {
                // Fallback validation
                if (!appointmentData.scheduledDate || !appointmentData.scheduledTime) {
                    toast.error('Date and time are required');
                    return;
                }
                
                // Extract serviceTypeId from serviceType object if it exists
                let serviceTypeId = appointmentData.serviceType;
                if (typeof appointmentData.serviceType === 'object' && appointmentData.serviceType !== null) {
                    serviceTypeId = appointmentData.serviceType._id || appointmentData.serviceType.id;
                }
                
                updatePayload = {
                    scheduledDate: appointmentData.scheduledDate,
                    scheduledTime: appointmentData.scheduledTime,
                    serviceType: serviceTypeId,
                    technicianId: appointmentData.technicianId || undefined,
                    priority: appointmentData.priority || 'medium',
                    estimatedDuration: appointmentData.estimatedDuration || 60
                };
                
                // Only include notes if it has actual content
                if (appointmentData.notes && appointmentData.notes.trim()) {
                    updatePayload.notes = appointmentData.notes.trim();
                }
            }

            console.log('Sending update payload:', updatePayload);
            console.log('Service type processing:', {
                original: appointmentData.serviceType,
                extractedId: updatePayload.serviceType,
                isObject: typeof appointmentData.serviceType === 'object'
            });
            console.log('Updating appointment ID:', selectedAppointment?.id);
            
            // Call the update API - use API_ENDPOINTS constant
            const response = await fetch(`${API_ENDPOINTS.APPOINTMENTS}/${selectedAppointment?.id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(updatePayload)
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            
            const result = await response.json();
            console.log('Response result:', result);

            if (result.success) {
                toast.success('Appointment updated successfully!')
                setShowEditAppointmentModal(false)
                setSelectedAppointment(null)
                
                // Refresh appointments list
                fetchAppointments()
            } else {
                toast.error(result.message || 'Failed to update appointment')
            }
        } catch (error) {
            console.error('Error updating appointment:', error)
            toast.error('Failed to update appointment. Please try again.')
        } finally {
            setIsCreatingAppointment(false)
        }
    }

    const handleViewAppointment = (appointment: any) => {
        setSelectedAppointment(appointment)
        setShowViewAppointmentModal(true)
    }

    const handleDeleteAppointment = (appointment: any) => {
        setSelectedAppointment(appointment)
        setShowDeleteAppointmentModal(true)
    }

    const handleConfirmDelete = async () => {
        if (!selectedAppointment?.id) {
            toast.error('No appointment selected for deletion')
            return
        }

        try {
            setIsDeletingAppointment(true)
            
            const response = await fetch(`${API_ENDPOINTS.APPOINTMENTS}/${selectedAppointment.id}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            })

            const result = await response.json()

            if (result.success) {
                toast.success('Appointment deleted successfully!')
                setShowDeleteAppointmentModal(false)
                setSelectedAppointment(null)
                
                // Refresh appointments list
                fetchAppointments()
            } else {
                toast.error(result.message || 'Failed to delete appointment')
            }
        } catch (error) {
            console.error('Error deleting appointment:', error)
            toast.error('Failed to delete appointment. Please try again.')
        } finally {
            setIsDeletingAppointment(false)
        }
    }

    const handleCloseEditModal = () => {
        setShowEditAppointmentModal(false)
        setSelectedAppointment(null)
    }

    const handleCloseViewModal = () => {
        setShowViewAppointmentModal(false)
        setSelectedAppointment(null)
    }

    const handleCloseDeleteModal = () => {
        setShowDeleteAppointmentModal(false)
        setSelectedAppointment(null)
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        // Search is handled by client-side filtering, no need to fetch from backend
        // The filteredAppointments will automatically update based on searchTerm
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
                                placeholder="Search by customer, vehicle, service, technician, or notes..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                                autoComplete="off"
                            />
                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            )}
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
                            {(statuses && Array.isArray(statuses) ? statuses : []).map(status => (
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
                            {(technicians && Array.isArray(technicians) ? technicians : []).map(tech => (
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
                                {(appointments && Array.isArray(appointments) ? appointments : []).filter(apt => apt.scheduledDate === new Date().toISOString().split('T')[0]).length}
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
                                {(appointments && Array.isArray(appointments) ? appointments : []).filter(apt => apt.status === 'confirmed').length}
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
                                {(appointments && Array.isArray(appointments) ? appointments : []).filter(apt => apt.status === 'in-progress').length}
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
                                {(appointments && Array.isArray(appointments) ? appointments : []).filter(apt => apt.status === 'completed').length}
                            </p>
                        </div>
                        <div className="bg-gray-100 p-3 rounded-full">
                            <div className="w-6 h-6 bg-gray-600 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Results Indicator */}
            {searchTerm && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Search className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-blue-800">
                                Search results for "<strong>{searchTerm}</strong>": 
                                <strong className="ml-1">{filteredAppointments.length}</strong> appointment{filteredAppointments.length !== 1 ? 's' : ''} found
                                {viewMode === 'calendar' && (
                                    <span className="ml-2 text-blue-600">
                                        (Calendar view will show filtered results)
                                    </span>
                                )}
                            </span>
                        </div>
                        <button
                            onClick={() => setSearchTerm('')}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Clear search
                        </button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            {viewMode === 'calendar' ? (
                <AppointmentCalendar appointments={filteredAppointments} />
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
                                    onEdit={handleEditAppointment}
                                    onView={handleViewAppointment}
                                    onDelete={handleDeleteAppointment}
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

            {/* Edit Appointment Modal */}
            {showEditAppointmentModal && selectedAppointment && (
                <AppointmentModal
                    appointment={selectedAppointment}
                    isEditing={true}
                    onClose={handleCloseEditModal}
                    onSave={handleUpdateAppointment}
                    isLoading={isCreatingAppointment}
                />
            )}

            {/* View Appointment Modal */}
            {showViewAppointmentModal && selectedAppointment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold text-gray-900">Appointment Details</h2>
                            <button
                                onClick={handleCloseViewModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Customer</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedAppointment.customerName}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Vehicle</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedAppointment.vehicleInfo}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Date & Time</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {selectedAppointment.scheduledDate} at {selectedAppointment.scheduledTime}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Service</label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {typeof selectedAppointment.serviceType === 'string' 
                                            ? selectedAppointment.serviceType 
                                            : selectedAppointment.serviceType?.name || 'Unknown Service'
                                        }
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <p className="mt-1 text-sm text-gray-900 capitalize">
                                        {selectedAppointment.status?.replace('-', ' ')}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Priority</label>
                                    <p className="mt-1 text-sm text-gray-900 capitalize">{selectedAppointment.priority}</p>
                                </div>
                                {selectedAppointment.technicianName && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Technician</label>
                                        <p className="mt-1 text-sm text-gray-900">{selectedAppointment.technicianName}</p>
                                </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Duration</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedAppointment.estimatedDuration} min</p>
                                </div>
                            </div>
                            
                            {selectedAppointment.notes && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                                    <p className="mt-1 text-sm text-gray-900">{selectedAppointment.notes}</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowViewAppointmentModal(false)
                                    handleEditAppointment(selectedAppointment)
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                            >
                                Edit Appointment
                            </button>
                            <button
                                onClick={handleCloseViewModal}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Appointment Confirmation Modal */}
            {showDeleteAppointmentModal && selectedAppointment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center mb-4">
                            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                <HiTrash className="h-6 w-6 text-red-600" />
                            </div>
                        </div>
                        
                        <div className="text-center mb-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Delete Appointment
                            </h3>
                            <p className="text-sm text-gray-500">
                                Are you sure you want to delete the appointment for{' '}
                                <span className="font-medium text-gray-900">
                                    {selectedAppointment.customerName}
                                </span>?
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                                This action cannot be undone.
                            </p>
                        </div>
                        
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={handleCloseDeleteModal}
                                disabled={isDeletingAppointment}
                                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg text-sm font-medium disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={isDeletingAppointment}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                            >
                                {isDeletingAppointment ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete Appointment'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
