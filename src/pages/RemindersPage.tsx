import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../redux'
import {
  fetchReminders,
  fetchReminderTemplates,
  fetchNotificationSettings,
  createReminder,
  updateReminder,
  deleteReminder,
  createReminderTemplate,
  updateReminderTemplate,
  deleteReminderTemplate,
  updateNotificationSettings
} from '../redux/actions/reminders'
import { ReminderTemplate, NotificationSettings } from '../redux/reducer/remindersReducer'
import { Reminder } from '../utils/CustomerTypes'
import PageTitle from '../components/Shared/PageTitle'
import CreateReminderModal from '../components/Reminders/CreateReminderModal'
import CreateTemplateModal from '../components/Reminders/CreateTemplateModal'
import DeleteConfirmationModal from '../components/Reminders/DeleteConfirmationModal'
import {
  HiBell,
  HiMail,
  HiPhone,
  HiClock,
  HiCheck,
  HiX,
  HiEye,
  HiTrash,
  HiCog,
  HiTemplate,
  HiPlay,
  HiPause,
  HiPlus,
  HiRefresh,
  HiPencil
} from 'react-icons/hi'

type TabType = 'reminders' | 'templates' | 'settings'

export default function RemindersPage() {
  const [activeTab, setActiveTab] = useState<TabType>('reminders')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  
  // Modal states
  const [showCreateReminderModal, setShowCreateReminderModal] = useState(false)
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ReminderTemplate | null>(null)
  const [deleteItem, setDeleteItem] = useState<{ type: 'reminder' | 'template', id: string, name: string } | null>(null)
  
  const [settingsForm, setSettingsForm] = useState({
    emailEnabled: false,
    smsEnabled: false,
    emailProvider: {
      smtp: '',
      port: '',
      username: '',
      password: ''
    },
    smsProvider: {
      apiKey: ''
    },
    businessInfo: {
      name: '',
      phone: '',
      email: '',
      website: '',
      address: ''
    }
  })
  
  const { 
    reminders, 
    templates, 
    settings: notificationSettings = {
      emailEnabled: false,
      smsEnabled: false,
      emailProvider: {
        smtp: '',
        port: 587,
        username: '',
        password: ''
      },
      smsProvider: {
        apiKey: '',
        serviceName: 'twilio'
      },
      businessInfo: {
        name: '',
        phone: '',
        email: '',
        address: '',
        website: ''
      }
    }, 
    loading: remindersLoading
  } = useAppSelector(state => state.reminders)
  const dispatch = useAppDispatch()

  // Load data on component mount
  useEffect(() => {
    dispatch(fetchReminders())
    dispatch(fetchReminderTemplates())
    dispatch(fetchNotificationSettings())
  }, [dispatch])

  // Initialize settings form when notificationSettings are loaded
  useEffect(() => {
    if (notificationSettings) {
      setSettingsForm({
        emailEnabled: notificationSettings.emailEnabled || false,
        smsEnabled: notificationSettings.smsEnabled || false,
        emailProvider: { 
          smtp: notificationSettings.emailProvider?.smtp || '',
          port: notificationSettings.emailProvider?.port?.toString() || '587',
          username: notificationSettings.emailProvider?.username || '',
          password: notificationSettings.emailProvider?.password || ''
        },
        smsProvider: { 
          apiKey: notificationSettings.smsProvider?.apiKey || ''
        },
        businessInfo: { 
          name: notificationSettings.businessInfo?.name || '',
          phone: notificationSettings.businessInfo?.phone || '',
          email: notificationSettings.businessInfo?.email || '',
          website: notificationSettings.businessInfo?.website || '',
          address: notificationSettings.businessInfo?.address || ''
        }
      })
    }
  }, [notificationSettings])

  // Filter reminders
  const filteredReminders = reminders.filter(reminder => {
    if (statusFilter !== 'all' && reminder.status !== statusFilter) return false
    if (typeFilter !== 'all' && reminder.type !== typeFilter) return false
    return true
  })

  const handleStatusUpdate = (id: string, status: 'pending' | 'sent' | 'delivered' | 'failed') => {
    dispatch(updateReminder({ 
      id, 
      reminderData: { 
        status: status as any
      }
    }))
  }

  const handleDeleteReminder = (id: string, name: string) => {
    setDeleteItem({ type: 'reminder', id, name })
    setShowDeleteModal(true)
  }

  const handleDeleteTemplate = (id: string, name: string) => {
    setDeleteItem({ type: 'template', id, name })
    setShowDeleteModal(true)
  }

  const handleEditTemplate = (template: ReminderTemplate) => {
    setEditingTemplate(template)
    setShowCreateTemplateModal(true)
  }

  const handleCreateReminder = (data: any) => {
    const reminderData = {
      title: data.title,
      description: data.description,
      type: data.type,
      priority: data.priority,
      dueDate: data.dueDate,
      reminderDate: data.reminderDate,
      customerId: data.customerId,
      notificationMethods: data.notificationMethods,
      notes: data.notes || ''
    }
    dispatch(createReminder(reminderData))
    setShowCreateReminderModal(false)
  }

  const handleCreateTemplate = (data: any) => {
    if (editingTemplate) {
      dispatch(updateReminderTemplate({ id: editingTemplate.id, templateData: data }))
      setEditingTemplate(null)
    } else {
      dispatch(createReminderTemplate(data))
    }
    setShowCreateTemplateModal(false)
  }

  const handleConfirmDelete = () => {
    if (deleteItem) {
      if (deleteItem.type === 'reminder') {
        dispatch(deleteReminder(deleteItem.id))
      } else {
        dispatch(deleteReminderTemplate(deleteItem.id))
      }
      setDeleteItem(null)
      setShowDeleteModal(false)
    }
  }

  const handleToggleTemplate = (id: string) => {
    // This would need to be implemented with a modal or form
    // For now, we'll just update the template
    const template = templates.find(t => t.id === id)
    if (template) {
      dispatch(updateReminderTemplate({ 
        id, 
        templateData: { isActive: !template.isActive } 
      }))
    }
  }

  const handleSettingsChange = (field: string, value: any) => {
    setSettingsForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleEmailProviderChange = (field: string, value: string) => {
    setSettingsForm(prev => ({
      ...prev,
      emailProvider: {
        ...prev.emailProvider,
        [field]: value
      }
    }))
  }

  const handleSmsProviderChange = (field: string, value: string) => {
    setSettingsForm(prev => ({
      ...prev,
      smsProvider: {
        ...prev.smsProvider,
        [field]: value
      }
    }))
  }

  const handleBusinessInfoChange = (field: string, value: string) => {
    setSettingsForm(prev => ({
      ...prev,
      businessInfo: {
        ...prev.businessInfo,
        [field]: value
      }
    }))
  }

  const handleSaveSettings = () => {
    // Create a proper mapping to match the expected interface
    const updateData = {
      emailNotifications: {
        enabled: settingsForm.emailEnabled,
        types: ['appointment', 'service-due', 'follow-up', 'payment-due'],
        frequency: 'immediate' as const
      },
      smsNotifications: {
        enabled: settingsForm.smsEnabled,
        types: ['appointment', 'service-due', 'follow-up', 'payment-due'],
        phoneNumber: settingsForm.businessInfo.phone
      },
      pushNotifications: {
        enabled: false,
        types: ['appointment', 'service-due']
      },
      inAppNotifications: {
        enabled: true,
        types: ['appointment', 'service-due', 'follow-up', 'payment-due']
      },
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00',
        timezone: 'UTC'
      }
    }
    dispatch(updateNotificationSettings(updateData))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'sent': return 'bg-green-100 text-green-800'
      case 'acknowledged': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'delivered': return 'bg-blue-100 text-blue-800'
      case 'failed': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: Reminder['type']) => {
    switch (type) {
      case 'appointment': return <HiClock className="w-4 h-4" />
      case 'service-due': return <HiCog className="w-4 h-4" />
      case 'follow-up': return <HiCheck className="w-4 h-4" />
      case 'payment-due': return <HiBell className="w-4 h-4" />
      default: return <HiBell className="w-4 h-4" />
    }
  }

  const renderReminders = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Active Reminders</h2>
          <p className="text-gray-600">Manage and track customer notifications</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <HiRefresh className="w-4 h-4" />
            Process Queue
          </button>
          <button 
            onClick={() => setShowCreateReminderModal(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <HiPlus className="w-4 h-4" />
            Create Reminder
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex gap-4 items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="sent">Sent</option>
            <option value="delivered">Delivered</option>
            <option value="failed">Failed</option>
          </select>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="all">All Types</option>
            <option value="appointment">Appointment</option>
            <option value="service-due">Service Due</option>
            <option value="follow-up">Follow-up</option>
            <option value="payment-due">Payment Due</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {reminders.filter(r => r.status === 'pending').length}
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
              <p className="text-sm text-gray-600">Sent Today</p>
              <p className="text-2xl font-bold text-green-600">
                {reminders.filter(r => r.status === 'sent').length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <HiCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">
                {reminders.filter(r => r.status === 'failed').length}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <HiX className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Templates</p>
              <p className="text-2xl font-bold text-blue-600">
                {templates.filter(t => t.isActive).length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <HiTemplate className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Reminders List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type & Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Scheduled
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReminders.map(reminder => (
                <tr key={reminder.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(reminder.type)}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {reminder.customerName}
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                          {reminder.type.replace('-', ' ')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {reminder.message}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(reminder.scheduledDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(reminder.scheduledDate).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {reminder.method === 'email' ? (
                        <HiMail className="w-4 h-4 text-blue-500" />
                      ) : (
                        <HiPhone className="w-4 h-4 text-green-500" />
                      )}
                      <span className="text-sm text-gray-900 capitalize">
                        {reminder.method}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reminder.status)}`}>
                      {reminder.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900"
                        title="View details"
                      >
                        <HiEye className="w-4 h-4" />
                      </button>
                      {reminder.status === 'pending' && (
                        <button 
                          onClick={() => handleStatusUpdate(reminder.id, 'sent')}
                          className="text-green-600 hover:text-green-900"
                          title="Mark as sent"
                        >
                          <HiCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteReminder(reminder.id, reminder.customerName)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete reminder"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderTemplates = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Reminder Templates</h2>
          <p className="text-gray-600">Manage automated reminder templates</p>
        </div>
        <button 
          onClick={() => setShowCreateTemplateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
        >
          <HiPlus className="w-4 h-4" />
          Create Template
        </button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {templates.map(template => (
          <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                {getTypeIcon(template.type)}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{template.name}</h3>
                  <span className="text-sm text-gray-500 capitalize">
                    {template.type.replace('-', ' ')} reminder
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleTemplate(template.id)}
                  className={`p-2 rounded-lg ${
                    template.isActive 
                      ? 'text-green-600 bg-green-100 hover:bg-green-200' 
                      : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                  }`}
                  title={template.isActive ? 'Disable template' : 'Enable template'}
                >
                  {template.isActive ? <HiPlay className="w-4 h-4" /> : <HiPause className="w-4 h-4" />}
                </button>
                <button className="p-2 text-gray-400 hover:text-blue-600">
                  <HiCog className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Timing</p>
                <p className="text-sm text-gray-600">
                  {template.timing.value} {template.timing.unit} {template.timing.when} event
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Methods</p>
                <div className="flex gap-2 mt-1">
                  {template.methods.map(method => (
                    <span key={method} className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                      {method === 'email' ? <HiMail className="w-3 h-3" /> : <HiPhone className="w-3 h-3" />}
                      {method}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Subject</p>
                <p className="text-sm text-gray-600 truncate">{template.subject}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Message Preview</p>
                <p className="text-sm text-gray-600 line-clamp-3">{template.message}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {template.isActive ? 'Active' : 'Inactive'}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEditTemplate(template)}
                  className="text-blue-600 hover:text-blue-900 text-sm flex items-center gap-1"
                >
                  <HiPencil className="w-3 h-3" />
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteTemplate(template.id, template.name)}
                  className="text-red-600 hover:text-red-900 text-sm flex items-center gap-1"
                >
                  <HiTrash className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Notification Settings</h2>
        <p className="text-gray-600">Configure email and SMS notification providers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <HiMail className="w-6 h-6 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Email Configuration</h3>
              <p className="text-sm text-gray-600">SMTP settings for email notifications</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Enable Email</span>
              <button 
                onClick={() => handleSettingsChange('emailEnabled', !settingsForm.emailEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settingsForm.emailEnabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settingsForm.emailEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Server</label>
              <input
                type="text"
                value={settingsForm.emailProvider.smtp}
                onChange={(e) => handleEmailProviderChange('smtp', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="smtp.gmail.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
              <input
                type="number"
                value={settingsForm.emailProvider.port}
                onChange={(e) => handleEmailProviderChange('port', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="587"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="email"
                value={settingsForm.emailProvider.username}
                onChange={(e) => handleEmailProviderChange('username', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="your-email@gmail.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={settingsForm.emailProvider.password}
                onChange={(e) => handleEmailProviderChange('password', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        {/* SMS Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <HiPhone className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">SMS Configuration</h3>
              <p className="text-sm text-gray-600">SMS provider settings</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Enable SMS</span>
              <button 
                onClick={() => handleSettingsChange('smsEnabled', !settingsForm.smsEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settingsForm.smsEnabled ? 'bg-green-600' : 'bg-gray-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settingsForm.smsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Provider</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="twilio">Twilio</option>
                <option value="nexmo">Nexmo</option>
                <option value="aws-sns">AWS SNS</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <input
                type="password"
                value={settingsForm.smsProvider.apiKey}
                onChange={(e) => handleSmsProviderChange('apiKey', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="••••••••••••••••"
              />
            </div>
            
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> SMS notifications require a valid API key from your chosen provider. 
                Charges may apply based on your provider's pricing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Business Information</h3>
        <p className="text-sm text-gray-600 mb-4">This information will be used in reminder templates</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
            <input
              type="text"
              value={settingsForm.businessInfo.name}
              onChange={(e) => handleBusinessInfoChange('name', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={settingsForm.businessInfo.phone}
              onChange={(e) => handleBusinessInfoChange('phone', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={settingsForm.businessInfo.email}
              onChange={(e) => handleBusinessInfoChange('email', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Website (Optional)</label>
            <input
              type="url"
              value={settingsForm.businessInfo.website || ''}
              onChange={(e) => handleBusinessInfoChange('website', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              value={settingsForm.businessInfo.address}
              onChange={(e) => handleBusinessInfoChange('address', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              rows={2}
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button 
            onClick={handleSaveSettings}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      <PageTitle title="Reminders & Notifications" />

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'reminders', label: 'Active Reminders', count: reminders.length },
              { key: 'templates', label: 'Templates', count: templates.length },
              { key: 'settings', label: 'Settings', count: 0 }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} {tab.count > 0 && `(${tab.count})`}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'reminders' && renderReminders()}
          {activeTab === 'templates' && renderTemplates()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </div>

      {/* Modals */}
      {showCreateReminderModal && (
        <CreateReminderModal
          onClose={() => setShowCreateReminderModal(false)}
          onSave={handleCreateReminder}
          isLoading={remindersLoading}
        />
      )}

      {showCreateTemplateModal && (
        <CreateTemplateModal
          onClose={() => {
            setShowCreateTemplateModal(false)
            setEditingTemplate(null)
          }}
          onSave={handleCreateTemplate}
          isLoading={remindersLoading}
          template={editingTemplate || undefined}
          isEditing={!!editingTemplate}
        />
      )}

      {showDeleteModal && deleteItem && (
        <DeleteConfirmationModal
          onClose={() => {
            setShowDeleteModal(false)
            setDeleteItem(null)
          }}
          onConfirm={handleConfirmDelete}
          title={`Delete ${deleteItem.type === 'reminder' ? 'Reminder' : 'Template'}`}
          message={`Are you sure you want to delete this ${deleteItem.type}? This action cannot be undone.`}
          itemName={deleteItem.name}
          isLoading={remindersLoading}
        />
      )}
    </div>
  )
}
