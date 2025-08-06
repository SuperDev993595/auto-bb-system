import { useState } from 'react'
import { useAppSelector } from '../redux'
import PageTitle from '../components/Shared/PageTitle'
import {
  HiPlus,
  HiCheck,
  HiClock,
  HiExclamation,
  HiUser,
  HiCalendar,
  HiFilter,
  HiSearch
} from 'react-icons/hi'

interface Task {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in-progress' | 'completed'
  assignedTo: string
  dueDate: string
  category: 'maintenance' | 'repair' | 'inspection' | 'follow-up' | 'admin'
  relatedCustomer?: string
  relatedVehicle?: string
}

export default function TasksPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Sample tasks for auto repair shop
  const tasks: Task[] = [
    {
      id: '1',
      title: 'Oil Change Reminder - John Smith',
      description: '2020 Toyota Camry due for oil change (45,000 miles)',
      priority: 'medium',
      status: 'pending',
      assignedTo: 'Mike Johnson',
      dueDate: '2025-08-10',
      category: 'maintenance',
      relatedCustomer: 'John Smith',
      relatedVehicle: '2020 Toyota Camry'
    },
    {
      id: '2',
      title: 'Follow-up: Brake Service',
      description: 'Check customer satisfaction for brake service completed last week',
      priority: 'low',
      status: 'pending',
      assignedTo: 'Sarah Davis',
      dueDate: '2025-08-08',
      category: 'follow-up',
      relatedCustomer: 'Lisa Brown'
    },
    {
      id: '3',
      title: 'Inventory Restock',
      description: 'Order brake pads - stock running low (5 units remaining)',
      priority: 'high',
      status: 'in-progress',
      assignedTo: 'Tom Wilson',
      dueDate: '2025-08-06',
      category: 'admin'
    },
    {
      id: '4',
      title: 'Annual Inspection Due',
      description: 'Schedule annual inspection for fleet vehicles',
      priority: 'urgent',
      status: 'pending',
      assignedTo: 'Mike Johnson',
      dueDate: '2025-08-05',
      category: 'inspection'
    },
    {
      id: '5',
      title: 'Engine Diagnostic Complete',
      description: 'Completed diagnostic on 2018 Ford Focus - customer notified',
      priority: 'medium',
      status: 'completed',
      assignedTo: 'Tom Wilson',
      dueDate: '2025-08-03',
      category: 'repair',
      relatedCustomer: 'Mike Rodriguez'
    }
  ]

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesPriority && matchesSearch
  })

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'pending': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: Task['category']) => {
    switch (category) {
      case 'maintenance': return <HiClock className="w-4 h-4" />
      case 'repair': return <HiExclamation className="w-4 h-4" />
      case 'inspection': return <HiCheck className="w-4 h-4" />
      case 'follow-up': return <HiUser className="w-4 h-4" />
      case 'admin': return <HiCalendar className="w-4 h-4" />
      default: return <HiCalendar className="w-4 h-4" />
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <PageTitle title="Task Management" />
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <HiPlus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{tasks.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <HiCalendar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {tasks.filter(t => t.status === 'pending').length}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <HiClock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">
                {tasks.filter(t => t.status === 'in-progress').length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {tasks.filter(t => t.status === 'completed').length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <HiCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <HiSearch className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="space-y-4">
            {filteredTasks.map(task => (
              <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getCategoryIcon(task.category)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                      <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                      {task.relatedCustomer && (
                        <p className="text-blue-600 text-sm mt-1">
                          Customer: {task.relatedCustomer}
                          {task.relatedVehicle && ` | Vehicle: ${task.relatedVehicle}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                      {task.status.replace('-', ' ')}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>Assigned to: <strong>{task.assignedTo}</strong></span>
                    <span className="capitalize">Category: <strong>{task.category}</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <HiCalendar className="w-4 h-4" />
                    <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <HiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No tasks found</h3>
              <p className="text-gray-400">Try adjusting your filters or create a new task.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
