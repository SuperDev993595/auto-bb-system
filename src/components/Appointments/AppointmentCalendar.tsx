import { useState, useMemo, useEffect, useRef } from 'react'
import { useAppSelector, useAppDispatch } from '../../redux'
import { Appointment } from '../../utils/CustomerTypes'
import AppointmentModal from './AppointmentModal'
import { addAppointment, updateAppointment, setAppointments } from '../../redux/reducer/appointmentsReducer'
import { deleteAppointment } from '../../redux/actions/appointments'
import { toast } from 'react-hot-toast'
import { appointmentService } from '../../services/appointments'
import { getAuthHeaders } from '../../services/api'
import {
  HiChevronLeft,
  HiChevronRight,
  HiCalendar,
  HiClock,
  HiUser,
  HiTruck,
  HiPencil,
  HiEye,
  HiTrash
} from 'react-icons/hi'

type CalendarView = 'month' | 'week' | 'day'

interface AppointmentCalendarProps {
  appointments?: Appointment[]
}

export default function AppointmentCalendar({ appointments: propAppointments }: AppointmentCalendarProps) {
  const dispatch = useAppDispatch()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>('month')
  

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>('09:00')
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false)
  const [showEditAppointmentModal, setShowEditAppointmentModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  
  // Drag and drop state
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null)
  const dragRef = useRef<HTMLDivElement>(null)
  
  const reduxAppointments = useAppSelector(state => state.appointments.data)
  const appointments = propAppointments || reduxAppointments



  // Load appointments from backend when component mounts
  const loadAppointments = async () => {
    try {
      console.log('Loading appointments from backend...');
      const response = await appointmentService.getAppointments();
      
      if (response.success) {
        // Check if appointments array exists and has data
        if (!response.data.appointments || response.data.appointments.length === 0) {
          console.log('No appointments found, clearing Redux state');
          dispatch(setAppointments([]));
          return;
        }
        
        console.log(`Found ${response.data.appointments.length} appointments`);
        
        // Transform backend data to match our Appointment interface
        const transformedAppointments = response.data.appointments.map((apt: any) => {
          // Handle potential null/undefined values with proper type checking
          const customer = apt.customer || { _id: '', name: 'Unknown Customer' };
          const vehicle = apt.vehicle || { make: '', model: '', year: '', vin: '', licensePlate: '', mileage: 0 };
          const technician = apt.technician || { _id: '', name: '' };
          
          // Convert scheduledDate from ISO string to YYYY-MM-DD format
          const scheduledDate = apt.scheduledDate 
            ? new Date(apt.scheduledDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0];
          
          const transformed = {
            id: apt._id || `apt-${Date.now()}`,
            customerId: customer._id || '',
            customerName: customer.name || 'Unknown Customer',
            vehicleId: vehicle._id || vehicle.vin || '',
            vehicleInfo: vehicle.fullName || (vehicle.year && vehicle.make && vehicle.model 
              ? `${vehicle.year} ${vehicle.make} ${vehicle.model}`
              : 'Vehicle info unavailable'),
            scheduledDate: scheduledDate,
            scheduledTime: apt.scheduledTime || '09:00',
            estimatedDuration: apt.estimatedDuration || 60,
            serviceType: apt.serviceType || 'General Service',
            description: apt.serviceDescription || apt.serviceType || 'General Service',
            status: apt.status || 'scheduled',
            technicianId: technician._id || undefined,
            technicianName: technician.name || undefined,
            priority: apt.priority || 'medium' as const,
            createdDate: apt.createdAt ? new Date(apt.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            notes: apt.notes || '',
            vehicle: {
              id: vehicle._id || vehicle.vin || '',
              year: vehicle.year ? parseInt(vehicle.year.toString()) : 0,
              make: vehicle.make || '',
              model: vehicle.model || '',
              vin: vehicle.vin || '',
              licensePlate: vehicle.licensePlate || '',
              mileage: vehicle.mileage || 0
            }
          };
          
          return transformed;
        });
        
        console.log('Dispatching transformed appointments to Redux:', transformedAppointments.length);
        dispatch(setAppointments(transformedAppointments));
      } else {
        console.error('Failed to load appointments:', response);
        toast.error('Failed to load appointments');
      }
    } catch (error: any) {
      console.error('Error loading appointments:', error);
      
      // Handle specific error types
      if (error.response?.status === 401) {
        toast.error('Please log in to view appointments. Using local data.');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to view appointments. Using local data.');
      } else if (error.code === 'NETWORK_ERROR' || error.message?.includes('fetch')) {
        toast.error('Cannot connect to server. Using local data.');
      } else {
        toast.error('Error loading appointments. Using local data.');
      }
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [dispatch, refreshTrigger]);

  // Debug: Log when appointments change
  useEffect(() => {
    console.log('Appointments updated:', {
      count: appointments.length,
      refreshTrigger,
      appointments: appointments.map(apt => ({ id: apt.id, customerName: apt.customerName, scheduledDate: apt.scheduledDate }))
    });
  }, [appointments, refreshTrigger]);

  // Calendar navigation
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (view === 'month') {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1))
    } else if (view === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
    } else {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1))
    }
    setCurrentDate(newDate)
  }

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date): Appointment[] => {
    const dateStr = date.toISOString().split('T')[0]
    const filtered = appointments.filter(apt => {
      return apt.scheduledDate && apt.scheduledDate === dateStr;
    });
    
    // Debug logging for appointment filtering
    if (refreshTrigger > 0) {
      console.log(`Filtering appointments for ${dateStr}:`, {
        totalAppointments: appointments.length,
        filteredCount: filtered.length,
        refreshTrigger
      });
    }
    
    return filtered;
  }

  // Generate calendar days for month view
  const generateCalendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    const endDate = new Date(lastDay)

    // Adjust to show full weeks
    startDate.setDate(startDate.getDate() - startDate.getDay())
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))

    const days = []
    const currentDay = new Date(startDate)

    while (currentDay <= endDate) {
      days.push({
        date: new Date(currentDay),
        isCurrentMonth: currentDay.getMonth() === month,
        isToday: currentDay.toDateString() === new Date().toDateString(),
        appointments: getAppointmentsForDate(currentDay)
      })
      currentDay.setDate(currentDay.getDate() + 1)
    }

    return days
  }, [currentDate, appointments])

  // Generate week days for week view
  const generateWeekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
    
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push({
        date: day,
        isToday: day.toDateString() === new Date().toDateString(),
        appointments: getAppointmentsForDate(day)
      })
    }
    return days
  }, [currentDate, appointments])

  // Get status color
  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500'
      case 'scheduled': return 'bg-blue-500'
      case 'in-progress': return 'bg-yellow-500'
      case 'completed': return 'bg-gray-500'
      case 'cancelled': return 'bg-red-500'
      case 'no-show': return 'bg-red-400'
      default: return 'bg-gray-400'
    }
  }

  // Get priority color
  const getPriorityColor = (priority: Appointment['priority']) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-600'
      case 'high': return 'border-l-orange-500'
      case 'medium': return 'border-l-yellow-500'
      case 'low': return 'border-l-green-500'
      default: return 'border-l-gray-400'
    }
  }

  const formatTime = (time: string | undefined | null) => {
    if (!time) return '--:-- --'
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getServiceTypeName = (serviceType: any): string => {
    if (typeof serviceType === 'string') {
      return serviceType
    }
    if (serviceType && typeof serviceType === 'object' && serviceType.name) {
      return serviceType.name
    }
    return 'Unknown Service'
  }

  // Handle appointment click
  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setShowEditAppointmentModal(true)
  }

  // Handle appointment delete
  const handleDeleteAppointment = async (appointment: Appointment, event: React.MouseEvent) => {
    event.stopPropagation()
    
    if (window.confirm('Are you sure you want to delete this appointment? This action cannot be undone.')) {
      try {
        // First delete from backend
        await dispatch(deleteAppointment(appointment.id)).unwrap()
        
        // Close the edit modal if it's open
        if (showEditAppointmentModal) {
          setShowEditAppointmentModal(false)
          setSelectedAppointment(null)
        }
        
        // Show success message
        toast.success('Appointment deleted successfully!')
        
        // Small delay to ensure backend has processed the deletion
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Refresh appointments from backend to ensure we have the latest data
        await loadAppointments()
        
        // Force a re-render of the calendar
        setRefreshTrigger(prev => prev + 1)
      } catch (error) {
        console.error('Failed to delete appointment:', error)
        toast.error('Failed to delete appointment. Please try again.')
      }
    }
  }

  // Handle calendar slot click to create new appointment
  const handleCalendarSlotClick = (date: Date, time?: string) => {
    setSelectedDate(date)
    if (time) {
      setSelectedTime(time)
    } else {
      setSelectedTime('09:00') // Default time for day clicks
    }
    setShowNewAppointmentModal(true)
  }

  // Handle new appointment creation
  const handleCreateAppointment = async (appointmentData: any) => {
    try {
      setIsCreatingAppointment(true)
      
      // Check if this is saved appointment data from database or form data
      if (appointmentData._id) {
        // This is saved appointment data from database - use it directly
        const savedAppointment: Appointment = {
          id: appointmentData._id, // Use the real MongoDB ObjectId
          customerId: appointmentData.customer?._id || appointmentData.customer,
          customerName: appointmentData.customer?.name || appointmentData.customerName,
          vehicleId: appointmentData.vehicle?._id || appointmentData.vehicle,
          vehicleInfo: appointmentData.vehicle?.fullName || appointmentData.vehicleInfo,
          scheduledDate: new Date(appointmentData.scheduledDate).toISOString().split('T')[0],
          scheduledTime: appointmentData.scheduledTime,
          estimatedDuration: appointmentData.estimatedDuration,
          serviceType: appointmentData.serviceType,
          description: appointmentData.serviceDescription,
          status: appointmentData.status,
          priority: appointmentData.priority,
          createdDate: new Date(appointmentData.createdAt).toISOString().split('T')[0],
          notes: appointmentData.notes || '',
          technicianId: appointmentData.technician?._id || appointmentData.technicianId,
          technicianName: appointmentData.technician?.name || appointmentData.technicianName,
        }
        
              dispatch(addAppointment(savedAppointment))
      setShowNewAppointmentModal(false)
      // Refresh appointments from backend to ensure we have the latest data
      await loadAppointments()
      return
      }
      
      // Fallback for form data (when database save fails)
      // Validate required fields
      if (!appointmentData.customer || !appointmentData.vehicle || !appointmentData.date || !appointmentData.serviceType) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Extract date and time from the appointment data
      let appointmentDate: string;
      let appointmentTime: string;
      
      // The modal passes form data with separate date and time fields
      appointmentDate = appointmentData.scheduledDate || appointmentData.date;
      appointmentTime = appointmentData.scheduledTime || appointmentData.time || selectedTime || '09:00';

      const newAppointment: Appointment = {
        id: `apt${Date.now()}`, // Generate unique ID for local storage
        customerId: `customer${Date.now()}`,
        customerName: appointmentData.customer,
        vehicleId: `vehicle${Date.now()}`,
        vehicleInfo: appointmentData.vehicle,
        scheduledDate: appointmentDate,
        scheduledTime: appointmentTime,
        estimatedDuration: appointmentData.estimatedDuration || 60,
        serviceType: appointmentData.serviceType,
        description: appointmentData.serviceType,
        status: appointmentData.status || 'scheduled',
        priority: appointmentData.priority || 'medium',
        createdDate: new Date().toISOString().split('T')[0],
        notes: appointmentData.notes || '',
        technicianId: appointmentData.technicianId || undefined,
        technicianName: appointmentData.technicianName || undefined,
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      dispatch(addAppointment(newAppointment))
      setShowNewAppointmentModal(false)
      // Refresh appointments from backend to ensure we have the latest data
      await loadAppointments()
    } catch (error) {
      console.error('Error creating appointment:', error)
      toast.error('Failed to create appointment. Please try again.')
    } finally {
      setIsCreatingAppointment(false)
    }
  }

  // Handle appointment update
  const handleUpdateAppointment = async (appointmentData: any) => {
    try {
      if (!selectedAppointment) return;

      const updatedAppointment = {
        ...selectedAppointment,
        ...appointmentData
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      dispatch(updateAppointment(updatedAppointment))
      toast.success('Appointment updated successfully!')
      setShowEditAppointmentModal(false)
      setSelectedAppointment(null)
      // Refresh appointments from backend to ensure we have the latest data
      await loadAppointments()
    } catch (error) {
      console.error('Error updating appointment:', error)
      toast.error('Failed to update appointment. Please try again.')
    }
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, appointment: Appointment) => {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', appointment.id)
    setDraggedAppointment(appointment)
    setIsDragging(true)
    
    // Add drag effect styles
    const target = e.target as HTMLElement
    target.style.opacity = '0.5'
    target.style.transform = 'rotate(5deg) scale(1.05)'
    target.style.transition = 'all 0.2s ease'
    
    // Create a custom drag image
    if (dragRef.current) {
      e.dataTransfer.setDragImage(dragRef.current, 0, 0)
    }
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    setDraggedAppointment(null)
    setDragOverDate(null)
    
    // Reset all drag effect styles
    const draggedElements = document.querySelectorAll('[draggable="true"]')
    draggedElements.forEach((element) => {
      const el = element as HTMLElement
      el.style.opacity = ''
      el.style.transform = ''
      el.style.transition = ''
    })
  }

  const handleDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverDate(date)
    
    // Add visual feedback for valid drop zones
    const target = e.currentTarget as HTMLElement
    if (!target.classList.contains('drag-over')) {
      target.classList.add('drag-over')
      target.style.backgroundColor = '#dbeafe'
      target.style.borderColor = '#3b82f6'
      target.style.transform = 'scale(1.02)'
      target.style.transition = 'all 0.2s ease'
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Remove drag-over effects when leaving the drop zone
    const target = e.currentTarget as HTMLElement
    target.classList.remove('drag-over')
    target.style.backgroundColor = ''
    target.style.borderColor = ''
    target.style.transform = ''
    target.style.transition = ''
  }

  const handleDrop = async (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault()
    
    // Remove drag-over effects
    const target = e.currentTarget as HTMLElement
    target.classList.remove('drag-over')
    target.style.backgroundColor = ''
    target.style.borderColor = ''
    target.style.transform = ''
    target.style.transition = ''
    
    if (!draggedAppointment) return

    const newDate = targetDate.toISOString().split('T')[0]
    
    // Don't update if the date is the same
    if (draggedAppointment.scheduledDate === newDate) {
      setDragOverDate(null)
      return
    }

    try {
      // Update the appointment with the new date
      const updatedAppointment = {
        ...draggedAppointment,
        scheduledDate: newDate
      }

      // Use the existing API service to ensure proper authentication and URL handling
      // Only send the scheduledDate field to avoid validation errors with other fields
      const updateData = {
        scheduledDate: new Date(newDate).toISOString()
      };
      
      console.log('Sending update data:', updateData);
      
      const response = await appointmentService.updateAppointment(draggedAppointment.id, updateData)
      const result = response

      if (result.success) {
        // Update in Redux store
        dispatch(updateAppointment(updatedAppointment))
        toast.success('Appointment moved successfully!')
        
        // Refresh appointments from backend
        await loadAppointments()
      } else {
        toast.error(result.message || 'Failed to move appointment')
      }
    } catch (error) {
      console.error('Error moving appointment:', error)
      toast.error('Failed to move appointment. Please try again.')
    }

    setDragOverDate(null)
    
    // Remove all drag-over effects
    const dragOverElements = document.querySelectorAll('.drag-over')
    dragOverElements.forEach((element) => {
      const el = element as HTMLElement
      el.classList.remove('drag-over')
      el.style.backgroundColor = ''
      el.style.borderColor = ''
      el.style.transform = ''
      el.style.transition = ''
    })
  }

  const handleCloseModal = () => {
    setShowNewAppointmentModal(false)
    setShowEditAppointmentModal(false)
    setSelectedAppointment(null)
    // Force refresh when modal is closed
    setRefreshTrigger(prev => prev + 1)
  }

  const renderMonthView = () => (
    <div className="grid grid-cols-7 gap-1">
      {/* Day headers */}
      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
        <div key={day} className="p-2 text-center font-medium text-gray-500 text-sm">
          {day}
        </div>
      ))}
      
      {/* Calendar days */}
      {generateCalendarDays.map((day, index) => (
        <div
          key={index}
          className={`min-h-24 p-1 border border-gray-200 cursor-pointer hover:bg-gray-50 ${
            !day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
          } ${day.isToday ? 'bg-blue-50 border-blue-200' : ''} ${
            dragOverDate && dragOverDate.toDateString() === day.date.toDateString() ? 'bg-blue-100 border-blue-300' : ''
          }`}
          onClick={() => handleCalendarSlotClick(day.date)}
          onDragOver={(e) => handleDragOver(e, day.date)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, day.date)}
        >
          <div className={`text-sm font-medium mb-1 ${day.isToday ? 'text-blue-600' : ''}`}>
            {day.date.getDate()}
          </div>
          <div className="space-y-1">
            {day.appointments.filter(apt => apt.customerName && apt.serviceType).slice(0, 2).map(apt => (
              <div
                key={apt.id}
                className={`text-xs p-1 rounded border-l-2 ${getPriorityColor(apt.priority)} bg-gray-100 truncate cursor-pointer hover:bg-gray-200 ${
                  isDragging && draggedAppointment?.id === apt.id ? 'opacity-50' : ''
                }`}
                title={`${apt.customerName} - ${getServiceTypeName(apt.serviceType)}`}
                draggable
                onDragStart={(e) => handleDragStart(e, apt)}
                onDragEnd={handleDragEnd}
                onClick={(e) => {
                  e.stopPropagation()
                  handleAppointmentClick(apt)
                }}
              >
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(apt.status)}`}></div>
                  <span className="font-medium">{formatTime(apt.scheduledTime)}</span>
                </div>
                <div className="truncate">{apt.customerName}</div>
              </div>
            ))}
            {(() => {
              const validAppointments = day.appointments.filter(apt => apt.customerName && apt.serviceType);
              return validAppointments.length > 2 && (
                <div className="text-xs text-gray-500 font-medium">
                  +{validAppointments.length - 2} more
                </div>
              );
            })()}
            {/* Show "Click to add appointment" hint for empty days */}
            {day.appointments.filter(apt => apt.customerName && apt.serviceType).length === 0 && day.isCurrentMonth && (
              <div className="text-xs text-gray-400 text-center mt-2 opacity-0 hover:opacity-100 transition-opacity">
                Click to add appointment
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )

  const renderWeekView = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-8 gap-2">
        {/* Time column header */}
        <div className="p-2 text-sm font-medium text-gray-500"></div>
        
        {/* Day headers */}
        {generateWeekDays.map((day, index) => (
          <div key={index} className="p-2 text-center">
            <div className={`text-sm font-medium ${day.isToday ? 'text-blue-600' : 'text-gray-700'}`}>
              {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className={`text-lg font-bold ${day.isToday ? 'text-blue-600' : 'text-gray-900'}`}>
              {day.date.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Time slots */}
      <div className="grid grid-cols-8 gap-2">
        {/* Time labels */}
        <div className="space-y-2">
          {Array.from({ length: 12 }, (_, i) => i + 8).map(hour => (
            <div key={hour} className="h-16 text-xs text-gray-500 text-right pr-2 pt-1">
              {formatTime(`${hour.toString().padStart(2, '0')}:00`)}
            </div>
          ))}
        </div>

        {/* Day columns */}
        {generateWeekDays.map((day, dayIndex) => (
          <div key={dayIndex} className="space-y-2">
            {Array.from({ length: 12 }, (_, i) => i + 8).map(hour => {
              const timeStr = `${hour.toString().padStart(2, '0')}:00`
                          const hourAppointments = day.appointments.filter(apt => 
              apt.scheduledTime && apt.scheduledTime.startsWith(hour.toString().padStart(2, '0'))
            )
              
              return (
                <div 
                  key={hour} 
                  className={`h-16 border border-gray-100 relative cursor-pointer hover:bg-gray-50 transition-colors ${
                    dragOverDate && dragOverDate.toDateString() === day.date.toDateString() ? 'bg-blue-100 border-blue-300' : ''
                  }`}
                  onClick={() => handleCalendarSlotClick(day.date, timeStr)}
                  title={`Click to add appointment at ${formatTime(timeStr)}`}
                  onDragOver={(e) => handleDragOver(e, day.date)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, day.date)}
                >
                  {hourAppointments.filter(apt => apt.customerName && apt.serviceType).map((apt, aptIndex) => (
                    <div
                      key={apt.id}
                      className={`absolute inset-1 p-1 rounded text-xs cursor-pointer hover:bg-opacity-90 ${getPriorityColor(apt.priority)} bg-blue-100 ${
                        isDragging && draggedAppointment?.id === apt.id ? 'opacity-50' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAppointmentClick(apt)
                      }}
                      title={`${apt.customerName} - ${getServiceTypeName(apt.serviceType)}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, apt)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="font-medium truncate">{apt.customerName}</div>
                      <div className="text-gray-600 truncate">{getServiceTypeName(apt.serviceType)}</div>
                    </div>
                  ))}
                  {/* Show hint for empty slots */}
                  {hourAppointments.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <div className="text-xs text-gray-400">+</div>
                    </div>
                        )}

      {/* Enhanced drag preview element */}
      <div
        ref={dragRef}
        className="fixed -top-1000 left-0 w-56 p-3 bg-white border-2 border-blue-400 rounded-lg shadow-xl pointer-events-none opacity-0"
        style={{ zIndex: -1 }}
      >
        {draggedAppointment && (
          <div className="text-sm">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="font-semibold text-blue-700">{draggedAppointment.customerName}</div>
            </div>
            <div className="text-gray-700 font-medium">{getServiceTypeName(draggedAppointment.serviceType)}</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-500">⏰ {formatTime(draggedAppointment.scheduledTime)}</span>
              <span className="text-xs text-gray-500">📅 {draggedAppointment.scheduledDate}</span>
            </div>
            <div className="mt-2 text-xs text-blue-600 font-medium">
              Drop to reschedule appointment
            </div>
          </div>
        )}
      </div>
    </div>
  )
})}
          </div>
        ))}
      </div>
    </div>
  )

  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDate(currentDate)
    const hours = Array.from({ length: 24 }, (_, i) => i)

    return (
      <div className="space-y-2">
        <div className="text-lg font-semibold text-gray-800 mb-4">
          {currentDate.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
        
        <div className="space-y-1">
          {hours.map(hour => {
            const timeStr = `${hour.toString().padStart(2, '0')}:00`
            const hourAppointments = dayAppointments.filter(apt => 
              apt.scheduledTime && apt.scheduledTime.startsWith(hour.toString().padStart(2, '0'))
            )
            
            return (
              <div key={hour} className="flex border-b border-gray-100">
                <div className="w-20 p-2 text-sm text-gray-500 font-medium">
                  {formatTime(timeStr)}
                </div>
                <div 
                  className={`flex-1 p-2 min-h-12 cursor-pointer hover:bg-gray-50 transition-colors ${
                    dragOverDate && dragOverDate.toDateString() === currentDate.toDateString() ? 'bg-blue-100' : ''
                  }`}
                  onClick={() => handleCalendarSlotClick(currentDate, timeStr)}
                  title={`Click to add appointment at ${formatTime(timeStr)}`}
                  onDragOver={(e) => handleDragOver(e, currentDate)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, currentDate)}
                >
                  {hourAppointments.filter(apt => apt.customerName && apt.serviceType).map(apt => (
                    <div
                      key={apt.id}
                      className={`p-3 mb-2 rounded-lg border-l-4 ${getPriorityColor(apt.priority)} bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow ${
                        isDragging && draggedAppointment?.id === apt.id ? 'opacity-50' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAppointmentClick(apt)
                      }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, apt)}
                      onDragEnd={handleDragEnd}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-800">{apt.customerName}</h4>
                          <p className="text-sm text-gray-600">{getServiceTypeName(apt.serviceType)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            apt.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            apt.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            apt.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                            apt.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {apt.status}
                          </span>
                          <button
                            onClick={(e) => handleDeleteAppointment(apt, e)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Delete appointment"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <HiClock className="w-4 h-4" />
                          <span>{formatTime(apt.scheduledTime)} ({apt.estimatedDuration}min)</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <HiTruck className="w-4 h-4" />
                          <span>{apt.vehicleInfo}</span>
                        </div>
                        {apt.technicianName && (
                          <div className="flex items-center gap-1">
                            <HiUser className="w-4 h-4" />
                            <span>{apt.technicianName}</span>
                          </div>
                        )}
                      </div>
                      {apt.description && (
                        <p className="text-sm text-gray-600 mt-2">{apt.description}</p>
                      )}
                    </div>
                  ))}
                  {/* Show hint for empty slots */}
                  {hourAppointments.length === 0 && (
                    <div className="flex items-center justify-center h-12 text-gray-400 opacity-0 hover:opacity-100 transition-opacity">
                      <div className="text-sm">Click to add appointment</div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <HiCalendar className="w-6 h-6" />
            Appointment Calendar
          </h2>
          <div className="text-lg font-medium text-gray-600">
            {view === 'month' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            {view === 'week' && `Week of ${currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
            {view === 'day' && currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['month', 'week', 'day'] as CalendarView[]).map(viewType => (
              <button
                key={viewType}
                onClick={() => setView(viewType)}
                className={`px-3 py-1 rounded text-sm font-medium capitalize ${
                  view === viewType 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {viewType}
              </button>
            ))}
          </div>
          
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <HiChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              Today
            </button>
            <button
              onClick={() => navigateDate('next')}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <HiChevronRight className="w-5 h-5" />
            </button>
          </div>
          

          

          
          {/* Add Appointment Button */}
          <button 
            onClick={() => {
              setShowNewAppointmentModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            + New Appointment
          </button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="p-6">
        {/* Search Results Indicator */}
        {propAppointments && propAppointments.length !== reduxAppointments?.length && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <HiCalendar className="w-4 h-4" />
              <span>
                Showing <strong>{propAppointments.length}</strong> filtered appointments 
                (of {reduxAppointments?.length || 0} total)
              </span>
            </div>
          </div>
        )}
        
        {/* No Results Message */}
        {propAppointments && propAppointments.length === 0 && (
          <div className="text-center py-12">
            <HiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-500 mb-2">No appointments found</h3>
            <p className="text-gray-400">Try adjusting your search terms or filters.</p>
          </div>
        )}
        
        {/* Calendar Views */}
        {(!propAppointments || propAppointments.length > 0) && (
          <>
            {view === 'month' && renderMonthView()}
            {view === 'week' && renderWeekView()}
            {view === 'day' && renderDayView()}
          </>
        )}
      </div>

      {/* Legend */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center gap-6 text-sm">
          <span className="font-medium text-gray-700">Status:</span>
          {[
            { status: 'scheduled', color: 'bg-blue-500', label: 'Scheduled' },
            { status: 'confirmed', color: 'bg-green-500', label: 'Confirmed' },
            { status: 'in-progress', color: 'bg-yellow-500', label: 'In Progress' },
            { status: 'completed', color: 'bg-gray-500', label: 'Completed' }
          ].map(({ status, color, label }) => (
            <div key={status} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${color}`}></div>
              <span className="text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* New Appointment Modal */}
      {showNewAppointmentModal && (
        <AppointmentModal
          onClose={handleCloseModal}
          onSave={handleCreateAppointment}
          isLoading={isCreatingAppointment}
          selectedDate={selectedDate || undefined}
          selectedTime={selectedTime}
        />
      )}

      {/* Edit Appointment Modal */}
      {showEditAppointmentModal && selectedAppointment && (
        <AppointmentModal
          onClose={handleCloseModal}
          onSave={handleUpdateAppointment}
          isLoading={isCreatingAppointment}
          appointment={selectedAppointment}
          isEditing={true}
        />
      )}

      {/* Hidden drag preview element */}
      <div
        ref={dragRef}
        className="fixed -top-1000 left-0 w-48 p-2 bg-white border border-gray-300 rounded shadow-lg pointer-events-none opacity-0"
        style={{ zIndex: -1 }}
      >
        {draggedAppointment && (
          <div className="text-sm">
            <div className="font-medium">{draggedAppointment.customerName}</div>
            <div className="text-gray-600">{getServiceTypeName(draggedAppointment.serviceType)}</div>
            <div className="text-xs text-gray-500">{formatTime(draggedAppointment.scheduledTime)}</div>
          </div>
        )}
      </div>
    </div>
  )
}
