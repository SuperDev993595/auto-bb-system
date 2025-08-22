import { useState, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "../redux"
import AppointmentCard from "../components/Appointments/AppointmentCard"
import AppointmentCalendar from "../components/Appointments/AppointmentCalendar"
import AppointmentModal from "../components/Appointments/AppointmentModal"
import PageTitle from "../components/Shared/PageTitle"
import { Grid3X3, Calendar, Filter, Search, Plus, Loader2, RefreshCw, Clock, CheckCircle, AlertCircle, Users, TrendingUp } from "lucide-react"
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
            <div className="loading-container">
                <div className="text-center">
                    <Loader2 className="loading-spinner" />
                    <p className="loading-text">Loading appointments...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="page-container">
            {/* Header Section */}
            <div className="page-header">
                <div className="page-header-content">
                    <div className="page-header-text">
                        <h1 className="page-title">Appointment Management</h1>
                        <p className="page-subtitle">Schedule and manage customer appointments</p>
                    </div>
                    <div className="page-header-actions">
                        <button 
                            onClick={() => setShowNewAppointmentModal(true)}
                            className="btn-primary-outline"
                        >
                            <Plus className="w-5 h-5" />
                            New Appointment
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid-responsive">
                <div className="stats-card">
                    <div className="stats-card-header">
                        <div className="stats-card-icon bg-primary-500">
                            <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div className="stats-card-label">Today</div>
                        <div className="stats-card-value">
                            {(appointments && Array.isArray(appointments) ? appointments : []).filter(apt => apt.scheduledDate === new Date().toISOString().split('T')[0]).length}
                        </div>
                        <div className="stats-card-subtitle">Today's Appointments</div>
                    </div>
                </div>

                <div className="stats-card">
                    <div className="stats-card-header">
                        <div className="stats-card-icon bg-success-500">
                            <CheckCircle className="w-6 h-6 text-white" />
                        </div>
                        <div className="stats-card-label">Confirmed</div>
                        <div className="stats-card-value">
                            {(appointments && Array.isArray(appointments) ? appointments : []).filter(apt => apt.status === 'confirmed').length}
                        </div>
                        <div className="stats-card-subtitle">Confirmed Appointments</div>
                    </div>
                </div>

                <div className="stats-card">
                    <div className="stats-card-header">
                        <div className="stats-card-icon bg-warning-500">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div className="stats-card-label">In Progress</div>
                        <div className="stats-card-value">
                            {(appointments && Array.isArray(appointments) ? appointments : []).filter(apt => apt.status === 'in-progress').length}
                        </div>
                        <div className="stats-card-subtitle">In Progress</div>
                    </div>
                </div>

                <div className="stats-card">
                    <div className="stats-card-header">
                        <div className="stats-card-icon bg-info-500">
                            <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div className="stats-card-label">Completed</div>
                        <div className="stats-card-value">
                            {(appointments && Array.isArray(appointments) ? appointments : []).filter(apt => apt.status === 'completed').length}
                        </div>
                        <div className="stats-card-subtitle">Completed Today</div>
                    </div>
                </div>
            </div>

            {/* Unified Search and Filters */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Search className="w-4 h-4 text-blue-600" />
                            <h3 className="text-base font-semibold text-gray-800">Search & Filters</h3>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* View Toggle */}
                            <div className="flex bg-white rounded-lg p-1 shadow-sm">
                                <button
                                    onClick={() => setViewMode('calendar')}
                                    className={`p-1.5 rounded-md transition-all duration-200 ${
                                        viewMode === 'calendar' 
                                            ? 'bg-blue-100 text-blue-600' 
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                    title="Calendar View"
                                >
                                    <Calendar className="w-3.5 h-3.5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-1.5 rounded-md transition-all duration-200 ${
                                        viewMode === 'grid' 
                                            ? 'bg-blue-100 text-blue-600' 
                                            : 'text-gray-600 hover:text-gray-900'
                                    }`}
                                    title="Grid View"
                                >
                                    <Grid3X3 className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Refresh Button */}
                            <button
                                onClick={() => {
                                    fetchAppointments();
                                    fetchTechnicians();
                                }}
                                className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                                title="Refresh data"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
                
                <div className="p-6 space-y-6">
                    {/* Search Bar */}
                    <div className="relative">
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                            <Search className="w-5 h-5" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by customer, vehicle, service, technician, or notes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white text-gray-700"
                            autoComplete="off"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Filters Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                            >
                                <option value="all">All Status</option>
                                {(statuses && Array.isArray(statuses) ? statuses : []).map(status => (
                                    <option key={status} value={status} className="capitalize">
                                        {status.replace('-', ' ')}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Technician</label>
                            <select
                                value={technicianFilter}
                                onChange={(e) => setTechnicianFilter(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                            >
                                <option value="all">All Technicians</option>
                                {(technicians && Array.isArray(technicians) ? technicians : []).map(tech => (
                                    <option key={(tech as any).id || (tech as any)._id} value={(tech as any).id || (tech as any)._id}>
                                        {tech.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                        <div className="text-sm text-gray-500">
                            {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''} found
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('all');
                                    setTechnicianFilter('all');
                                }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 text-sm font-medium"
                            >
                                Clear All
                            </button>
                            <button
                                onClick={handleSearch}
                                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Results Indicator */}
            {searchTerm && (
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-3xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                                <Search className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium text-blue-700">Search Results</span>
                                    <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                                    <span className="text-sm text-blue-600">
                                        "{searchTerm}"
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-bold text-blue-800">
                                        {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''} found
                                    </span>
                                    {viewMode === 'calendar' && (
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                            Calendar view
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('all');
                                    setTechnicianFilter('all');
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg font-medium transition-all duration-200"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Clear All
                            </button>
                            <button
                                onClick={() => setSearchTerm('')}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                ✕
                                Clear Search
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            {viewMode === 'calendar' ? (
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">Calendar View</h3>
                                    <p className="text-sm text-gray-600">Interactive calendar for appointment scheduling</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                                    {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <AppointmentCalendar appointments={filteredAppointments} />
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                                    <Grid3X3 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">
                                        Appointments Grid
                                    </h3>
                                    <p className="text-sm text-gray-600">Card-based view of all appointments</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600">Active</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600">Pending</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm text-gray-600">Completed</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-8 bg-gradient-to-br from-gray-50 to-white">
                        {loading ? (
                            <div className="flex items-center justify-center py-24">
                                <div className="text-center">
                                    <div className="relative mb-6">
                                        <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                                        <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading Appointments</h3>
                                    <p className="text-gray-500">Please wait while we fetch your data...</p>
                                </div>
                            </div>
                        ) : filteredAppointments.length > 0 ? (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                                            <span className="text-white text-sm font-bold">{filteredAppointments.length}</span>
                                        </div>
                                        <span className="text-lg font-semibold text-gray-800">
                                            {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''} found
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <span>Showing all results</span>
                                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                        <span>Grid view</span>
                                    </div>
                                </div>
                                
                                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filteredAppointments.map((apt, index) => (
                                        <div key={apt.id} className="group relative">
                                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-500"></div>
                                            <div className="relative">
                                                <AppointmentCard 
                                                    appointment={apt}
                                                    onEdit={handleEditAppointment}
                                                    onView={handleViewAppointment}
                                                    onDelete={handleDeleteAppointment}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-24">
                                <div className="relative mb-8">
                                    <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto">
                                        <Calendar className="w-12 h-12 text-gray-400" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">!</span>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-700 mb-4">No appointments found</h3>
                                <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">
                                    {searchTerm || statusFilter !== 'all' || technicianFilter !== 'all' 
                                        ? 'Try adjusting your filters or search terms to find appointments.' 
                                        : 'Get started by creating your first appointment to begin scheduling.'}
                                </p>
                                {!searchTerm && statusFilter === 'all' && technicianFilter === 'all' && (
                                    <div className="flex items-center justify-center gap-4">
                                        <button 
                                            onClick={() => setShowNewAppointmentModal(true)}
                                            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
                                        >
                                            <Plus className="w-6 h-6" />
                                            Create First Appointment
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setSearchTerm('');
                                                setStatusFilter('all');
                                                setTechnicianFilter('all');
                                            }}
                                            className="inline-flex items-center gap-2 px-6 py-4 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-xl font-medium transition-all duration-200"
                                        >
                                            <RefreshCw className="w-5 h-5" />
                                            Reset Filters
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
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
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-t-3xl">
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold text-white">Appointment Details</h2>
                                <button
                                    onClick={handleCloseViewModal}
                                    className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/20 transition-all duration-200"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>
                        
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Customer</label>
                                    <p className="text-lg font-semibold text-gray-900">{selectedAppointment.customerName}</p>
                                </div>
                                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-2xl">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle</label>
                                    <p className="text-lg font-semibold text-gray-900">{selectedAppointment.vehicleInfo}</p>
                                </div>
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date & Time</label>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {selectedAppointment.scheduledDate} at {selectedAppointment.scheduledTime}
                                    </p>
                                </div>
                                <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-2xl">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Service</label>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {typeof selectedAppointment.serviceType === 'string' 
                                            ? selectedAppointment.serviceType 
                                            : selectedAppointment.serviceType?.name || 'Unknown Service'
                                        }
                                    </p>
                                </div>
                                <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 rounded-2xl">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                        selectedAppointment.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                        selectedAppointment.status === 'in-progress' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                                        selectedAppointment.status === 'completed' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                        'bg-gray-100 text-gray-800 border border-gray-200'
                                    }`}>
                                        {selectedAppointment.status?.replace('-', ' ')}
                                    </span>
                                </div>
                                <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-2xl">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
                                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                        selectedAppointment.priority === 'high' ? 'bg-red-100 text-red-800 border border-red-200' :
                                        selectedAppointment.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                                        'bg-green-100 text-green-800 border border-green-200'
                                    }`}>
                                        {selectedAppointment.priority}
                                    </span>
                                </div>
                                {selectedAppointment.technicianName && (
                                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-2xl">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Technician</label>
                                        <p className="text-lg font-semibold text-gray-900">{selectedAppointment.technicianName}</p>
                                    </div>
                                )}
                                <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-2xl">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Duration</label>
                                    <p className="text-lg font-semibold text-gray-900">{selectedAppointment.estimatedDuration} min</p>
                                </div>
                            </div>
                            
                            {selectedAppointment.notes && (
                                <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 rounded-2xl">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">Notes</label>
                                    <p className="text-gray-900 leading-relaxed">{selectedAppointment.notes}</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="flex justify-end gap-4 p-6 bg-gray-50 rounded-b-3xl">
                            <button
                                onClick={handleCloseViewModal}
                                className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-xl font-medium transition-all duration-200"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    setShowViewAppointmentModal(false)
                                    handleEditAppointment(selectedAppointment)
                                }}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Edit Appointment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Appointment Confirmation Modal */}
            {showDeleteAppointmentModal && selectedAppointment && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full">
                        <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-t-3xl">
                            <div className="flex items-center justify-center mb-4">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                                    <HiTrash className="h-8 w-8 text-white" />
                                </div>
                            </div>
                            <h3 className="text-xl font-bold text-white text-center">
                                Delete Appointment
                            </h3>
                        </div>
                        
                        <div className="p-8 text-center">
                            <p className="text-gray-700 mb-4">
                                Are you sure you want to delete the appointment for{' '}
                                <span className="font-semibold text-gray-900">
                                    {selectedAppointment.customerName}
                                </span>?
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                                This action cannot be undone and will permanently remove the appointment from the system.
                            </p>
                        </div>
                        
                        <div className="flex gap-4 p-6 bg-gray-50 rounded-b-3xl">
                            <button
                                onClick={handleCloseDeleteModal}
                                disabled={isDeletingAppointment}
                                className="flex-1 px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-xl font-medium disabled:opacity-50 transition-all duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                disabled={isDeletingAppointment}
                                className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-medium disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                            >
                                {isDeletingAppointment ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
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
