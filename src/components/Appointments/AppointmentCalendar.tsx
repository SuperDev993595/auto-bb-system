import { useState, useMemo } from 'react'
import { useAppSelector, useAppDispatch } from '../../redux'
import { Appointment } from '../../utils/CustomerTypes'
import AppointmentModal from './AppointmentModal'
import { addAppointment, updateAppointment } from '../../redux/reducer/appointmentsReducer'
import { deleteAppointment } from '../../redux/actions/appointments'
import { toast } from 'react-hot-toast'
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

export default function AppointmentCalendar() {
  const dispatch = useAppDispatch()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>('month')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string>('09:00')
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false)
  const [showEditAppointmentModal, setShowEditAppointmentModal] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false)
  
  const appointments = useAppSelector(state => state.appointments.data)

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
    return appointments.filter(apt => apt.date === dateStr)
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

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
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
        await dispatch(deleteAppointment(appointment.id)).unwrap()
      } catch (error) {
        console.error('Failed to delete appointment:', error)
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
        const savedAppointment = {
          id: appointmentData._id, // Use the real MongoDB ObjectId
          customerId: appointmentData.customer?._id || appointmentData.customer,
          customerName: appointmentData.customer?.name || appointmentData.customerName,
          vehicleId: appointmentData.vehicle?._id || appointmentData.vehicle,
          vehicleInfo: appointmentData.vehicle?.fullName || appointmentData.vehicleInfo,
          date: new Date(appointmentData.scheduledDate).toISOString().split('T')[0],
          time: appointmentData.scheduledTime,
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
      appointmentDate = appointmentData.date;
      appointmentTime = appointmentData.time || selectedTime || '09:00';

      const newAppointment = {
        id: `apt${Date.now()}`, // Generate unique ID for local storage
        customerId: `customer${Date.now()}`,
        customerName: appointmentData.customer,
        vehicleId: `vehicle${Date.now()}`,
        vehicleInfo: appointmentData.vehicle,
        date: appointmentDate,
        time: appointmentTime,
        estimatedDuration: appointmentData.estimatedDuration || 60,
        serviceType: appointmentData.serviceType,
        description: appointmentData.serviceType,
        status: appointmentData.status || 'scheduled' as const,
        priority: appointmentData.priority || 'medium' as const,
        createdDate: new Date().toISOString().split('T')[0],
        notes: appointmentData.notes || '',
                  technicianId: appointmentData.technicianId || undefined,
          technicianName: appointmentData.technicianName || undefined,
      }

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      dispatch(addAppointment(newAppointment))
      setShowNewAppointmentModal(false)
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
    } catch (error) {
      console.error('Error updating appointment:', error)
      toast.error('Failed to update appointment. Please try again.')
    }
  }

  const handleCloseModal = () => {
    setShowNewAppointmentModal(false)
    setShowEditAppointmentModal(false)
    setSelectedAppointment(null)
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
          } ${day.isToday ? 'bg-blue-50 border-blue-200' : ''}`}
          onClick={() => handleCalendarSlotClick(day.date)}
        >
          <div className={`text-sm font-medium mb-1 ${day.isToday ? 'text-blue-600' : ''}`}>
            {day.date.getDate()}
          </div>
          <div className="space-y-1">
            {day.appointments.slice(0, 2).map(apt => (
              <div
                key={apt.id}
                className={`text-xs p-1 rounded border-l-2 ${getPriorityColor(apt.priority)} bg-gray-100 truncate cursor-pointer hover:bg-gray-200`}
                title={`${apt.customerName} - ${apt.serviceType}`}
                onClick={(e) => {
                  e.stopPropagation()
                  handleAppointmentClick(apt)
                }}
              >
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(apt.status)}`}></div>
                  <span className="font-medium">{formatTime(apt.time)}</span>
                </div>
                <div className="truncate">{apt.customerName}</div>
              </div>
            ))}
            {day.appointments.length > 2 && (
              <div className="text-xs text-gray-500 font-medium">
                +{day.appointments.length - 2} more
              </div>
            )}
            {/* Show "Click to add appointment" hint for empty days */}
            {day.appointments.length === 0 && day.isCurrentMonth && (
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
                apt.time.startsWith(hour.toString().padStart(2, '0'))
              )
              
              return (
                <div 
                  key={hour} 
                  className="h-16 border border-gray-100 relative cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleCalendarSlotClick(day.date, timeStr)}
                  title={`Click to add appointment at ${formatTime(timeStr)}`}
                >
                  {hourAppointments.map((apt, aptIndex) => (
                    <div
                      key={apt.id}
                      className={`absolute inset-1 p-1 rounded text-xs cursor-pointer hover:bg-opacity-90 ${getPriorityColor(apt.priority)} bg-blue-100`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAppointmentClick(apt)
                      }}
                      title={`${apt.customerName} - ${apt.serviceType}`}
                    >
                      <div className="font-medium truncate">{apt.customerName}</div>
                      <div className="text-gray-600 truncate">{apt.serviceType}</div>
                    </div>
                  ))}
                  {/* Show hint for empty slots */}
                  {hourAppointments.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <div className="text-xs text-gray-400">+</div>
                    </div>
                  )}
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
              apt.time.startsWith(hour.toString().padStart(2, '0'))
            )
            
            return (
              <div key={hour} className="flex border-b border-gray-100">
                <div className="w-20 p-2 text-sm text-gray-500 font-medium">
                  {formatTime(timeStr)}
                </div>
                <div 
                  className="flex-1 p-2 min-h-12 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleCalendarSlotClick(currentDate, timeStr)}
                  title={`Click to add appointment at ${formatTime(timeStr)}`}
                >
                  {hourAppointments.map(apt => (
                    <div
                      key={apt.id}
                      className={`p-3 mb-2 rounded-lg border-l-4 ${getPriorityColor(apt.priority)} bg-white shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAppointmentClick(apt)
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-800">{apt.customerName}</h4>
                          <p className="text-sm text-gray-600">{apt.serviceType}</p>
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
                          <span>{formatTime(apt.time)} ({apt.estimatedDuration}min)</span>
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
        {view === 'month' && renderMonthView()}
        {view === 'week' && renderWeekView()}
        {view === 'day' && renderDayView()}
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
          selectedDate={selectedDate}
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
    </div>
  )
}
