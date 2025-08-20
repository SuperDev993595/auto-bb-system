import { useState } from 'react'
import { HiCheck, HiClock, HiX } from 'react-icons/hi'
import { Task } from '../../services/tasks'

interface TaskStatusUpdateProps {
  task: Task
  onStatusUpdate: (taskId: string, status: Task['status']) => void
  isLoading?: boolean
}

export default function TaskStatusUpdate({ task, onStatusUpdate, isLoading = false }: TaskStatusUpdateProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <HiCheck className="w-4 h-4" />
      case 'in_progress': return <HiClock className="w-4 h-4" />
      case 'cancelled': return <HiX className="w-4 h-4" />
      default: return <HiClock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleStatusChange = (newStatus: Task['status']) => {
    onStatusUpdate(task._id, newStatus)
    setShowDropdown(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isLoading}
        className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)} hover:opacity-80 transition-opacity flex items-center gap-1`}
      >
        {getStatusIcon(task.status)}
        {task.status.replace('_', ' ')}
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
          <div className="py-1">
            {task.status !== 'pending' && (
              <button
                onClick={() => handleStatusChange('pending')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <HiClock className="w-4 h-4" />
                Pending
              </button>
            )}
            {task.status !== 'in_progress' && (
              <button
                onClick={() => handleStatusChange('in_progress')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <HiClock className="w-4 h-4" />
                In Progress
              </button>
            )}
            {task.status !== 'completed' && (
              <button
                onClick={() => handleStatusChange('completed')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <HiCheck className="w-4 h-4" />
                Completed
              </button>
            )}
            {task.status !== 'cancelled' && (
              <button
                onClick={() => handleStatusChange('cancelled')}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
              >
                <HiX className="w-4 h-4" />
                Cancelled
              </button>
            )}
          </div>
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  )
}
