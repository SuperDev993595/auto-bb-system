import { useState, useEffect } from 'react'
import { Clock, Calendar, Bell, CheckCircle, AlertCircle, Play, Pause, Settings, Plus } from '../../utils/icons'

interface WorkflowRule {
  id: string
  name: string
  description: string
  trigger: 'appointment' | 'payment' | 'service' | 'inactivity' | 'custom'
  conditions: string[]
  actions: string[]
  isActive: boolean
  lastTriggered: string
  triggerCount: number
}

interface Reminder {
  id: string
  customerId: string
  customerName: string
  type: 'follow-up' | 'payment' | 'service' | 'appointment' | 'custom'
  message: string
  dueDate: string
  status: 'pending' | 'sent' | 'completed' | 'overdue'
  priority: 'low' | 'medium' | 'high'
  assignedTo?: string
}

interface Props {
  customerId?: string
}

export default function CustomerWorkflows({ customerId }: Props) {
  const [workflows, setWorkflows] = useState<WorkflowRule[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [activeTab, setActiveTab] = useState<'workflows' | 'reminders' | 'templates'>('workflows')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWorkflowData()
  }, [customerId])

  const fetchWorkflowData = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mockWorkflows: WorkflowRule[] = [
      {
        id: '1',
        name: 'Service Follow-up',
        description: 'Automatically send follow-up emails after service completion',
        trigger: 'service',
        conditions: ['Service completed', 'No follow-up in 7 days'],
        actions: ['Send email reminder', 'Create follow-up task'],
        isActive: true,
        lastTriggered: '2024-01-15T10:00:00Z',
        triggerCount: 45
      },
      {
        id: '2',
        name: 'Payment Reminder',
        description: 'Send payment reminders for overdue invoices',
        trigger: 'payment',
        conditions: ['Invoice overdue', 'No payment received'],
        actions: ['Send SMS reminder', 'Create payment task'],
        isActive: true,
        lastTriggered: '2024-01-14T14:00:00Z',
        triggerCount: 23
      },
      {
        id: '3',
        name: 'Inactive Customer Re-engagement',
        description: 'Re-engage customers who haven\'t had service in 90 days',
        trigger: 'inactivity',
        conditions: ['No service in 90 days', 'Customer is active'],
        actions: ['Send promotional email', 'Create outreach task'],
        isActive: false,
        lastTriggered: '2024-01-10T09:00:00Z',
        triggerCount: 12
      }
    ]

    const mockReminders: Reminder[] = [
      {
        id: '1',
        customerId: 'cust-001',
        customerName: 'John Smith',
        type: 'follow-up',
        message: 'Follow up on oil change service - check if customer is satisfied',
        dueDate: '2024-01-20T10:00:00Z',
        status: 'pending',
        priority: 'medium',
        assignedTo: 'tech-001'
      },
      {
        id: '2',
        customerId: 'cust-002',
        customerName: 'ABC Company',
        type: 'payment',
        message: 'Payment reminder for invoice #INV-2024-001 ($450.00)',
        dueDate: '2024-01-18T14:00:00Z',
        status: 'overdue',
        priority: 'high',
        assignedTo: 'admin-001'
      },
      {
        id: '3',
        customerId: 'cust-003',
        customerName: 'Sarah Johnson',
        type: 'service',
        message: 'Schedule next maintenance appointment for 2020 Honda Civic',
        dueDate: '2024-01-25T16:00:00Z',
        status: 'pending',
        priority: 'low'
      }
    ]

    setWorkflows(mockWorkflows)
    setReminders(mockReminders)
    setLoading(false)
  }

  const toggleWorkflow = (workflowId: string) => {
    setWorkflows(workflows.map(wf => 
      wf.id === workflowId ? { ...wf, isActive: !wf.isActive } : wf
    ))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'sent': return 'bg-blue-100 text-blue-700'
      case 'completed': return 'bg-green-100 text-green-700'
      case 'overdue': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'high': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Customer Workflows & Reminders</h2>
            <p className="text-gray-600">Automate customer interactions and manage follow-ups</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200">
              <Plus className="w-4 h-4" />
              New Workflow
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200">
              <Plus className="w-4 h-4" />
              New Reminder
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{workflows.length}</p>
            <p className="text-sm text-blue-600">Active Workflows</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {workflows.filter(w => w.isActive).length}
            </p>
            <p className="text-sm text-green-600">Enabled</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{reminders.length}</p>
            <p className="text-sm text-purple-600">Total Reminders</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">
              {reminders.filter(r => r.status === 'overdue').length}
            </p>
            <p className="text-sm text-orange-600">Overdue</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {(['workflows', 'reminders', 'templates'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Workflows Tab */}
          {activeTab === 'workflows' && (
            <div className="space-y-4">
              {workflows.map((workflow) => (
                <div key={workflow.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          workflow.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {workflow.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{workflow.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Trigger</h4>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {workflow.trigger}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Last Triggered</h4>
                          <p className="text-xs text-gray-600">
                            {new Date(workflow.lastTriggered).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">Total Triggers</h4>
                          <p className="text-xs text-gray-600">{workflow.triggerCount}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Conditions</h4>
                          <div className="space-y-1">
                            {workflow.conditions.map((condition, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                <CheckCircle className="w-3 h-3 text-green-500" />
                                {condition}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Actions</h4>
                          <div className="space-y-1">
                            {workflow.actions.map((action, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                <Play className="w-3 h-3 text-blue-500" />
                                {action}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => toggleWorkflow(workflow.id)}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          workflow.isActive
                            ? 'text-orange-600 hover:bg-orange-50'
                            : 'text-green-600 hover:bg-green-50'
                        }`}
                        title={workflow.isActive ? 'Pause Workflow' : 'Activate Workflow'}
                      >
                        {workflow.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200" title="Edit Workflow">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reminders Tab */}
          {activeTab === 'reminders' && (
            <div className="space-y-4">
              {reminders.map((reminder) => (
                <div key={reminder.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{reminder.customerName}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(reminder.status)}`}>
                          {reminder.status}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(reminder.priority)}`}>
                          {reminder.priority}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{reminder.message}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          <span className="text-sm text-gray-600">
                            Due: {new Date(reminder.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-purple-500" />
                          <span className="text-sm text-gray-600">
                            {reminder.type.charAt(0).toUpperCase() + reminder.type.slice(1)}
                          </span>
                        </div>
                        {reminder.assignedTo && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-green-500" />
                            <span className="text-sm text-gray-600">Assigned to: {reminder.assignedTo}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200" title="Mark Complete">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200" title="Edit Reminder">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Templates Tab */}
          {activeTab === 'templates' && (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Reminder Templates</h3>
              <p className="text-gray-500">Create reusable templates for common reminders</p>
              <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200">
                Create Template
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
