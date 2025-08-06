import { useState, useMemo } from 'react'
import { useAppSelector } from '../../redux'
import { Appointment } from '../../utils/CustomerTypes'
import {
  HiChevronLeft,
  HiChevronRight,
  HiCalendar,
  HiClock,
  HiUser,
  HiTruck
} from 'react-icons/hi'

type CalendarView = 'month' | 'week' | 'day'

export default function AppointmentCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>('month')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  
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
          onClick={() => setSelectedDate(day.date)}
        >
          <div className={`text-sm font-medium mb-1 ${day.isToday ? 'text-blue-600' : ''}`}>
            {day.date.getDate()}
          </div>
          <div className="space-y-1">
            {day.appointments.slice(0, 2).map(apt => (
              <div
                key={apt.id}
                className={`text-xs p-1 rounded border-l-2 ${getPriorityColor(apt.priority)} bg-gray-100 truncate`}
                title={`${apt.customerName} - ${apt.serviceType}`}
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
          </div>
        </div>
      ))}
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
                <div className="flex-1 p-2 min-h-12">
                  {hourAppointments.map(apt => (
                    <div
                      key={apt.id}
                      className={`p-3 mb-2 rounded-lg border-l-4 ${getPriorityColor(apt.priority)} bg-white shadow-sm`}
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
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            + New Appointment
          </button>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="p-6">
        {view === 'month' && renderMonthView()}
        {view === 'day' && renderDayView()}
        {view === 'week' && (
          <div className="text-center py-8 text-gray-500">
            Week view coming soon...
          </div>
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
    </div>
  )
}
