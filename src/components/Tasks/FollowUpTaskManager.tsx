import React, { useState, useEffect } from 'react';
import { CalendarMonth, Phone, Email, CheckCircle } from '@mui/icons-material';
import { taskService } from '../../services/tasks';

interface FollowUpTaskManagerProps {
  userId: string;
}

interface Task {
  _id: string;
  title: string;
  description: string;
  status: string;
  dueDate: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  notes: Array<{
    content: string;
    createdAt: string;
  }>;
  appointment: {
    _id: string;
    scheduledDate: string;
    serviceType: {
      name: string;
    };
    estimatedCost: {
      total: number;
    };
  };
}

const FollowUpTaskManager: React.FC<FollowUpTaskManagerProps> = ({ userId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskNotes, setTaskNotes] = useState('');
  const [followUpOutcome, setFollowUpOutcome] = useState('');

  useEffect(() => {
    fetchFollowUpTasks();
  }, [userId]);

  const fetchFollowUpTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getMyTasks({ 
        type: 'follow_up',
        assignedTo: userId 
      });
      
      if (response.success) {
        setTasks(response.data.tasks);
      }
    } catch (error) {
      console.error('Error fetching follow-up tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTaskAction = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleUpdateTask = async () => {
    if (!selectedTask || !taskNotes.trim()) return;

    try {
      // Use the existing updateTask method from taskService
      const response = await taskService.updateTask(selectedTask._id, {
        status: 'completed',
        progress: 100,
        result: followUpOutcome,
        notes: taskNotes,
      });

      if (response.success) {
        setShowTaskModal(false);
        setTaskNotes('');
        setFollowUpOutcome('');
        setSelectedTask(null);
        fetchFollowUpTasks(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      in_progress: { color: 'bg-blue-100 text-blue-800', text: 'In Progress' },
      completed: { color: 'bg-green-100 text-green-800', text: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <p className="text-gray-500">No follow-up tasks assigned</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Follow-up Tasks ({tasks.length})
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Call back customers and re-offer services for declined appointments
        </p>
      </div>
      
      <div className="divide-y divide-gray-200">
        {tasks.map((task) => (
          <div key={task._id} className="p-6 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h4 className="text-lg font-medium text-gray-900">
                    {task.title}
                  </h4>
                  {getStatusBadge(task.status)}
                </div>
                
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Customer:</strong> {task.customer.name}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Service:</strong> {task.appointment.serviceType.name}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Original Appointment:</strong> {new Date(task.appointment.scheduledDate).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Estimated Cost:</strong> ${task.appointment.estimatedCost.total.toFixed(2)}
                  </p>
                </div>
                
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{task.customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Email className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{task.customer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarMonth className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                {task.notes.length > 0 && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Latest Notes:</strong>
                    </p>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-sm text-gray-700">
                        {task.notes[task.notes.length - 1].content}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(task.notes[task.notes.length - 1].createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="ml-4">
                <button
                  onClick={() => handleTaskAction(task)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Update Task
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Task Update Modal */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Update Follow-up Task</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Follow-up Outcome
              </label>
              <select
                value={followUpOutcome}
                onChange={(e) => setFollowUpOutcome(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              >
                <option value="">Select outcome</option>
                <option value="customer_contacted">Customer Contacted</option>
                <option value="service_rebooked">Service Rebooked</option>
                <option value="customer_declined">Customer Declined</option>
                <option value="rescheduled">Rescheduled</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Follow-up Notes
              </label>
              <textarea
                value={taskNotes}
                onChange={(e) => setTaskNotes(e.target.value)}
                placeholder="Enter follow-up details..."
                className="w-full p-3 border border-gray-300 rounded-lg h-24 resize-none"
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowTaskModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateTask}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Update Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUpTaskManager;
