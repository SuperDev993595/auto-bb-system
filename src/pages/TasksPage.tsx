import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../redux'
import PageTitle from '../components/Shared/PageTitle'
import TaskModal from '../components/Tasks/TaskModal'
import DeleteTaskModal from '../components/Tasks/DeleteTaskModal'
import TaskStatusUpdate from '../components/Tasks/TaskStatusUpdate'
import {
  HiPlus,
  HiCheck,
  HiClock,
  HiExclamation,
  HiUser,
  HiCalendar,
  HiFilter,
  HiSearch,
  HiPencil,
  HiTrash
} from 'react-icons/hi'
import { fetchTasks, fetchTaskStats, createTask, updateTask, deleteTask } from '../redux/actions/tasks'
import { toast } from 'react-hot-toast'
import { Task, CreateTaskData, UpdateTaskData } from '../services/tasks'

export default function TasksPage() {
  const dispatch = useAppDispatch()
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  // Modal states
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { list: tasks, loading, stats } = useAppSelector(state => state.tasks)

  // Fetch tasks and stats on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        await Promise.all([
          dispatch(fetchTasks({
            status: statusFilter !== 'all' ? statusFilter : undefined,
            priority: priorityFilter !== 'all' ? priorityFilter : undefined,
            search: searchTerm || undefined
          })),
          dispatch(fetchTaskStats())
        ])
      } catch (error) {
        console.error('Error loading tasks:', error)
        toast.error('Failed to load tasks')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [dispatch])

  // Refetch tasks when filters change
  useEffect(() => {
    if (!isLoading) {
      dispatch(fetchTasks({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        search: searchTerm || undefined
      }))
    }
  }, [statusFilter, priorityFilter, searchTerm, dispatch])

  const filteredTasks = tasks || []
  
  // Debug: Log task data to see customer information
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      console.log('Tasks with customer data:', tasks.map(task => ({
        id: task._id,
        title: task.title,
        customer: task.customer,
        customerType: typeof task.customer
      })))
    }
  }, [tasks])

  // Handle task creation/editing
  const handleSaveTask = async (taskData: CreateTaskData | UpdateTaskData) => {
    try {
      setIsSubmitting(true)
      
      if (selectedTask) {
        // Update existing task
        await dispatch(updateTask({ id: selectedTask._id, taskData: taskData as UpdateTaskData }))
        toast.success('Task updated successfully!')
      } else {
        // Create new task
        await dispatch(createTask(taskData as CreateTaskData))
        toast.success('Task created successfully!')
      }
      
      setShowTaskModal(false)
      setSelectedTask(null)
      
      // Refresh tasks
      dispatch(fetchTasks({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        search: searchTerm || undefined
      }))
      dispatch(fetchTaskStats())
      
    } catch (error) {
      console.error('Error saving task:', error)
      toast.error('Failed to save task')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle task deletion
  const handleDeleteTask = async () => {
    if (!selectedTask) return
    
    try {
      setIsSubmitting(true)
      await dispatch(deleteTask(selectedTask._id))
      toast.success('Task deleted successfully!')
      
      setShowDeleteModal(false)
      setSelectedTask(null)
      
      // Refresh tasks
      dispatch(fetchTasks({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        search: searchTerm || undefined
      }))
      dispatch(fetchTaskStats())
      
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error('Failed to delete task')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle status update
  const handleStatusUpdate = async (taskId: string, status: Task['status']) => {
    try {
      await dispatch(updateTask({ id: taskId, taskData: { status } }))
      toast.success('Task status updated successfully!')
      
      // Refresh tasks
      dispatch(fetchTasks({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        priority: priorityFilter !== 'all' ? priorityFilter : undefined,
        search: searchTerm || undefined
      }))
      dispatch(fetchTaskStats())
      
    } catch (error) {
      console.error('Error updating task status:', error)
      toast.error('Failed to update task status')
    }
  }

  // Open edit modal
  const handleEditTask = (task: Task) => {
    setSelectedTask(task)
    setShowTaskModal(true)
  }

  // Open delete modal
  const handleDeleteClick = (task: Task) => {
    setSelectedTask(task)
    setShowDeleteModal(true)
  }

  // Open create modal
  const handleAddTask = () => {
    setSelectedTask(null)
    setShowTaskModal(true)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
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

  const getCategoryIcon = (type: string) => {
    switch (type) {
      case 'maintenance': return <HiClock className="w-4 h-4" />
      case 'repair': return <HiExclamation className="w-4 h-4" />
      case 'inspection': return <HiCheck className="w-4 h-4" />
      case 'follow_up': return <HiUser className="w-4 h-4" />
      case 'marketing': return <HiCalendar className="w-4 h-4" />
      case 'sales': return <HiCalendar className="w-4 h-4" />
      case 'collections': return <HiCalendar className="w-4 h-4" />
      case 'appointments': return <HiCalendar className="w-4 h-4" />
      case 'research': return <HiExclamation className="w-4 h-4" />
      case 'other': return <HiClock className="w-4 h-4" />
      default: return <HiCalendar className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="text-gray-600">Loading tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <PageTitle title="Task Management" />
        <button 
          onClick={handleAddTask}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
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
              <p className="text-2xl font-bold text-gray-900">{stats?.overview?.totalTasks || tasks?.length || 0}</p>
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
                {stats?.overview?.pendingTasks || filteredTasks.filter(t => t.status === 'pending').length}
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
                {stats?.overview?.inProgressTasks || filteredTasks.filter(t => t.status === 'in_progress').length}
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
                {stats?.overview?.completedTasks || filteredTasks.filter(t => t.status === 'completed').length}
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
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
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
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 animate-spin text-blue-600 border-2 border-blue-600 border-t-transparent rounded-full"></div>
              <span className="ml-2 text-gray-600">Loading tasks...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map(task => (
                <div key={task._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getCategoryIcon(task.type)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                        <p className="text-gray-600 text-sm mt-1">{task.description}</p>
                                                 <div className="flex items-center gap-1 mt-2">
                           <HiUser className="w-4 h-4 text-gray-400" />
                           <span className="text-gray-500 text-sm">
                                                           {task.customer ? (
                                typeof task.customer === 'string' ? (
                                  `Customer ID: ${task.customer}`
                                ) : (
                                  `Customer: ${task.customer.businessName || task.customer.name || 'Unknown'}`
                                )
                              ) : (
                                'No customer assigned'
                              )}
                           </span>
                         </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <TaskStatusUpdate
                        task={task}
                        onStatusUpdate={handleStatusUpdate}
                        isLoading={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span>Assigned to: <strong>{typeof task.assignedTo === 'string' ? task.assignedTo : task.assignedTo.name}</strong></span>
                      <span className="capitalize">Type: <strong>{task.type.replace('-', ' ')}</strong></span>
                      {task.progress !== undefined && (
                        <span>Progress: <strong>{task.progress}%</strong></span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <HiCalendar className="w-4 h-4" />
                        <span>Due: {formatDate(task.dueDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditTask(task)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit task"
                        >
                          <HiPencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(task)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete task"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {!loading && filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <HiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No tasks found</h3>
              <p className="text-gray-400">Try adjusting your filters or create a new task.</p>
            </div>
          )}
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false)
          setSelectedTask(null)
        }}
        onSave={handleSaveTask}
        task={selectedTask}
        isLoading={isSubmitting}
      />

      {/* Delete Confirmation Modal */}
      <DeleteTaskModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setSelectedTask(null)
        }}
        onConfirm={handleDeleteTask}
        taskTitle={selectedTask?.title || ''}
        isLoading={isSubmitting}
      />
    </div>
  )
}
