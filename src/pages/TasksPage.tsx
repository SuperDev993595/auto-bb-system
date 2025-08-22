import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../redux'
import PageTitle from '../components/Shared/PageTitle'
import TaskModal from '../components/Tasks/TaskModal'
import DeleteTaskModal from '../components/Tasks/DeleteTaskModal'
import TaskStatusUpdate from '../components/Tasks/TaskStatusUpdate'
import {
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  User,
  Calendar,
  Filter,
  Search,
  Edit,
  Trash2,
  CheckSquare,
  Square,
  TrendingUp,
  Loader2,
  RefreshCw,
  Settings,
  Grid3X3,
  List
} from 'lucide-react'
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl p-6 text-white">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold mb-1">Task Management</h1>
            <p className="text-indigo-100 text-base">Organize and track your team's tasks and projects</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                dispatch(fetchTasks({}))
                dispatch(fetchTaskStats())
              }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-medium transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button 
              onClick={handleAddTask}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl border border-white/30 hover:border-white/50"
            >
              <Plus className="w-5 h-5" />
              Add Task
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                <CheckSquare className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.overview?.totalTasks || tasks?.length || 0}</p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600">All Tasks</p>
            <p className="text-lg font-semibold text-indigo-600">Active</p>
          </div>
        </div>
        
        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.overview?.pendingTasks || filteredTasks.filter(t => t.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600">Awaiting Action</p>
            <p className="text-lg font-semibold text-amber-600">Needs Attention</p>
          </div>
        </div>
        
        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.overview?.inProgressTasks || filteredTasks.filter(t => t.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600">Active Work</p>
            <p className="text-lg font-semibold text-blue-600">Ongoing</p>
          </div>
        </div>
        
        <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats?.overview?.completedTasks || filteredTasks.filter(t => t.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600">Finished</p>
            <p className="text-lg font-semibold text-emerald-600">Success</p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-gray-600" />
              <h3 className="text-base font-semibold text-gray-800">Search & Filters</h3>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Search tasks by title, description, or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
              />
            </div>
            
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="lg:w-48 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
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
              className="lg:w-48 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 bg-white"
            >
              <option value="all">All Priority</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-gray-600" />
              <h3 className="text-base font-semibold text-gray-800">Task List</h3>
            </div>
            <div className="text-sm text-gray-500">
              {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} found
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-indigo-600" />
                <p className="text-gray-600">Loading tasks...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map(task => (
                <div key={task._id} className="group bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-4">
                      <div className="mt-1">
                        {getCategoryIcon(task.type)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">{task.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                        <div className="flex items-center gap-1 mb-2">
                          <User className="w-4 h-4 text-gray-400" />
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
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>Assigned to: <strong className="text-gray-700">{typeof task.assignedTo === 'string' ? task.assignedTo : task.assignedTo.name}</strong></span>
                          <span className="capitalize">Type: <strong className="text-gray-700">{task.type.replace('-', ' ')}</strong></span>
                          {task.progress !== undefined && (
                            <span>Progress: <strong className="text-gray-700">{task.progress}%</strong></span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <TaskStatusUpdate
                        task={task}
                        onStatusUpdate={handleStatusUpdate}
                        isLoading={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>Due: {formatDate(task.dueDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
                        title="Edit task"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(task)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                        title="Delete task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {!loading && filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No tasks found</h3>
              <p className="text-gray-500 mb-4">Try adjusting your filters or create a new task.</p>
              <button
                onClick={handleAddTask}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200"
              >
                <Plus className="w-5 h-5" />
                Create First Task
              </button>
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
