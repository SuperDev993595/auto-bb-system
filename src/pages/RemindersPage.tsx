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
import EditReminderModal from '../components/Reminders/EditReminderModal'
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
  HiPencil,
  HiUser
} from 'react-icons/hi'

type TabType = 'reminders' | 'templates' | 'settings'

export default function RemindersPage() {
  const [activeTab, setActiveTab] = useState<TabType>('reminders')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  
  // Modal states
  const [showCreateReminderModal, setShowCreateReminderModal] = useState(false)
  const [showEditReminderModal, setShowEditReminderModal] = useState(false)
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ReminderTemplate | null>(null)
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null)
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

  // Debug: Log reminders state
  useEffect(() => {
    console.log('Current reminders state:', reminders)
    console.log('Filtered reminders:', filteredReminders)
  }, [reminders, filteredReminders])

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

  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminder(reminder)
    setShowEditReminderModal(true)
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
    console.log('Creating reminder with data:', reminderData)
    dispatch(createReminder(reminderData)).then((result) => {
      console.log('Create reminder result:', result)
      if (result.meta.requestStatus === 'fulfilled') {
        console.log('Reminder created successfully, refreshing list...')
        dispatch(fetchReminders())
      }
    })
    setShowCreateReminderModal(false)
  }

  const handleUpdateReminder = (data: any) => {
    if (!editingReminder) return
    
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
    console.log('Updating reminder with data:', reminderData)
    dispatch(updateReminder({ id: (editingReminder as any)._id || editingReminder.id, reminderData })).then((result) => {
      console.log('Update reminder result:', result)
      if (result.meta.requestStatus === 'fulfilled') {
        console.log('Reminder updated successfully, refreshing list...')
        dispatch(fetchReminders())
      }
    })
    setShowEditReminderModal(false)
    setEditingReminder(null)
  }

  const handleCreateTemplate = (data: any) => {
    if (editingTemplate) {
      console.log('Updating template with data:', data)
      dispatch(updateReminderTemplate({ id: editingTemplate.id, templateData: data })).then((result) => {
        console.log('Update template result:', result)
        if (result.meta.requestStatus === 'fulfilled') {
          console.log('Template updated successfully, refreshing list...')
          dispatch(fetchReminderTemplates())
        }
      })
      setEditingTemplate(null)
    } else {
      console.log('Creating template with data:', data)
      dispatch(createReminderTemplate(data)).then((result) => {
        console.log('Create template result:', result)
        if (result.meta.requestStatus === 'fulfilled') {
          console.log('Template created successfully, refreshing list...')
          dispatch(fetchReminderTemplates())
        }
      })
    }
    setShowCreateTemplateModal(false)
  }

  const handleConfirmDelete = () => {
    if (deleteItem) {
      if (deleteItem.type === 'reminder') {
        console.log('Deleting reminder:', deleteItem.id)
        dispatch(deleteReminder(deleteItem.id)).then((result) => {
          console.log('Delete reminder result:', result)
          if (result.meta.requestStatus === 'fulfilled') {
            console.log('Reminder deleted successfully, refreshing list...')
            dispatch(fetchReminders())
          }
        })
      } else {
        console.log('Deleting template:', deleteItem.id)
        dispatch(deleteReminderTemplate(deleteItem.id)).then((result) => {
          console.log('Delete template result:', result)
          if (result.meta.requestStatus === 'fulfilled') {
            console.log('Template deleted successfully, refreshing list...')
            dispatch(fetchReminderTemplates())
          }
        })
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
      console.log('Toggling template:', id, 'isActive:', !template.isActive)
      dispatch(updateReminderTemplate({ 
        id, 
        templateData: { isActive: !template.isActive } 
      })).then((result) => {
        console.log('Toggle template result:', result)
        if (result.meta.requestStatus === 'fulfilled') {
          console.log('Template toggled successfully, refreshing list...')
          dispatch(fetchReminderTemplates())
        }
      })
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
      case 'pending': return 'status-pending'
      case 'sent': return 'status-active'
      case 'acknowledged': return 'status-active'
      case 'completed': return 'status-active'
      case 'cancelled': return 'status-inactive'
      case 'delivered': return 'status-active'
      case 'failed': return 'status-inactive'
      default: return 'status-inactive'
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
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-text">
            <h2 className="page-title">Active Reminders</h2>
            <p className="page-subtitle">Manage and track customer notifications</p>
          </div>
          <div className="page-header-actions">
            <button className="btn-secondary">
              <HiRefresh className="w-4 h-4" />
              Process Queue
            </button>
            <button 
              onClick={() => setShowCreateReminderModal(true)}
              className="btn-primary-outline"
            >
              <HiPlus className="w-4 h-4" />
              Create Reminder
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex gap-4 items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="select-field"
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
            className="select-field"
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
      <div className="grid-responsive">
        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-label">Pending</div>
            <div className="stats-card-value text-warning-600">
              {reminders.filter(r => r.status === 'pending').length}
            </div>
          </div>
          <div className="stats-card-icon bg-warning-500">
            <HiClock className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-label">Sent Today</div>
            <div className="stats-card-value text-success-600">
              {reminders.filter(r => r.status === 'sent').length}
            </div>
          </div>
          <div className="stats-card-icon bg-success-500">
            <HiCheck className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-label">Failed</div>
            <div className="stats-card-value text-error-600">
              {reminders.filter(r => r.status === 'failed').length}
            </div>
          </div>
          <div className="stats-card-icon bg-error-500">
            <HiX className="w-6 h-6 text-white" />
          </div>
        </div>
        
        <div className="stats-card">
          <div className="stats-card-header">
            <div className="stats-card-label">Active Templates</div>
            <div className="stats-card-value text-info-600">
              {templates.filter(t => t.isActive).length}
            </div>
          </div>
          <div className="stats-card-icon bg-info-500">
            <HiTemplate className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>

      {/* Reminders Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Customer</th>
                <th className="table-header-cell">Title</th>
                <th className="table-header-cell">Due Date</th>
                <th className="table-header-cell">Method</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredReminders.map(reminder => (
                <tr key={(reminder as any)._id || reminder.id} className="table-row">
                  <td className="table-cell">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <HiUser className="w-4 h-4 text-primary-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-secondary-900">
                          {(reminder as any).customer?.name || reminder.customerName || 'Unknown Customer'}
                        </div>
                        <div className="text-sm text-secondary-500 capitalize">
                          {(reminder.type || '').replace('-', ' ')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm text-secondary-900 max-w-xs truncate">
                      {(reminder as any).title || reminder.message || 'No title'}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="text-sm text-secondary-900">
                      {new Date((reminder as any).dueDate || reminder.scheduledDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-secondary-500">
                      {new Date((reminder as any).dueDate || reminder.scheduledDate).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      {(() => {
                        const methods = (reminder as any).notificationMethods || [reminder.method];
                        const hasEmail = methods.includes('email');
                        const hasSms = methods.includes('sms');
                        
                        if (hasEmail && hasSms) {
                          return (
                            <>
                              <HiMail className="w-4 h-4 text-info-500" />
                              <HiPhone className="w-4 h-4 text-success-500" />
                              <span className="text-sm text-secondary-900">Email, SMS</span>
                            </>
                          );
                        } else if (hasEmail) {
                          return (
                            <>
                              <HiMail className="w-4 h-4 text-info-500" />
                              <span className="text-sm text-secondary-900">Email</span>
                            </>
                          );
                        } else if (hasSms) {
                          return (
                            <>
                              <HiPhone className="w-4 h-4 text-success-500" />
                              <span className="text-sm text-secondary-900">SMS</span>
                            </>
                          );
                        } else {
                          // Fallback for old data structure
                          const method = reminder.method || 'email';
                          return (
                            <>
                              {method === 'email' ? (
                                <HiMail className="w-4 h-4 text-info-500" />
                              ) : (
                                <HiPhone className="w-4 h-4 text-success-500" />
                              )}
                              <span className="text-sm text-secondary-900 capitalize">{method}</span>
                            </>
                          );
                        }
                      })()}
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className={`status-badge ${getStatusColor(reminder.status)}`}>
                      {reminder.status}
                    </span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2">
                      <button 
                        className="text-primary-600 hover:text-primary-900 transition-colors"
                        title="View details"
                      >
                        <HiEye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleEditReminder(reminder)}
                        className="text-warning-600 hover:text-warning-900 transition-colors"
                        title="Edit reminder"
                      >
                        <HiPencil className="w-4 h-4" />
                      </button>
                      {reminder.status === 'pending' && (
                        <button 
                          onClick={() => handleStatusUpdate((reminder as any)._id || reminder.id, 'sent')}
                          className="text-success-600 hover:text-success-900 transition-colors"
                          title="Mark as sent"
                        >
                          <HiCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteReminder((reminder as any)._id || reminder.id, (reminder as any).customer?.name || reminder.customerName || 'Unknown Customer')}
                        className="text-error-600 hover:text-error-900 transition-colors"
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
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-text">
            <h2 className="page-title">Reminder Templates</h2>
            <p className="page-subtitle">Manage automated reminder templates</p>
          </div>
          <div className="page-header-actions">
            <button 
              onClick={() => setShowCreateTemplateModal(true)}
              className="btn-primary-outline"
            >
              <HiPlus className="w-4 h-4" />
              Create Template
            </button>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid-responsive">
        {templates.map(template => (
          <div key={template.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                {getTypeIcon(template.type)}
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900">{template.name}</h3>
                  <span className="text-sm text-secondary-500 capitalize">
                    {(template.type || '').replace('-', ' ')} reminder
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleTemplate(template.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    template.isActive 
                      ? 'text-success-600 bg-success-100 hover:bg-success-200' 
                      : 'text-secondary-400 bg-secondary-100 hover:bg-secondary-200'
                  }`}
                  title={template.isActive ? 'Disable template' : 'Enable template'}
                >
                  {template.isActive ? <HiPlay className="w-4 h-4" /> : <HiPause className="w-4 h-4" />}
                </button>
                <button className="p-2 text-secondary-400 hover:text-primary-600 transition-colors">
                  <HiCog className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-secondary-700">Timing</p>
                <p className="text-sm text-secondary-600">
                  {template.timing?.value || 0} {template.timing?.unit || 'hours'} {template.timing?.when || 'before'} event
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-secondary-700">Methods</p>
                <div className="flex gap-2 mt-1">
                  {(template.methods || []).map(method => (
                    <span key={method} className="inline-flex items-center gap-1 text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded">
                      {method === 'email' ? <HiMail className="w-3 h-3" /> : <HiPhone className="w-3 h-3" />}
                      {method}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-secondary-700">Subject</p>
                <p className="text-sm text-secondary-600 truncate">{template.subject || 'No subject'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-secondary-700">Message Preview</p>
                <p className="text-sm text-secondary-600 line-clamp-3">{template.message || 'No message'}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-secondary-200 flex justify-between items-center">
              <span className={`status-badge ${
                template.isActive ? 'status-active' : 'status-inactive'
              }`}>
                {template.isActive ? 'Active' : 'Inactive'}
              </span>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleEditTemplate(template)}
                  className="text-primary-600 hover:text-primary-900 text-sm flex items-center gap-1 transition-colors"
                >
                  <HiPencil className="w-3 h-3" />
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteTemplate(template.id, template.name || 'Unknown Template')}
                  className="text-error-600 hover:text-error-900 text-sm flex items-center gap-1 transition-colors"
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
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-text">
            <h2 className="page-title">Notification Settings</h2>
            <p className="page-subtitle">Configure email and SMS notification providers</p>
          </div>
        </div>
      </div>

      <div className="grid-responsive">
        {/* Email Settings */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <HiMail className="w-6 h-6 text-info-600" />
            <div>
              <h3 className="text-lg font-semibold text-secondary-900">Email Configuration</h3>
              <p className="text-sm text-secondary-600">SMTP settings for email notifications</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-secondary-700">Enable Email</span>
              <button 
                onClick={() => handleSettingsChange('emailEnabled', !settingsForm.emailEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settingsForm.emailEnabled ? 'bg-primary-600' : 'bg-secondary-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settingsForm.emailEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            
            <div>
              <label className="form-label">SMTP Server</label>
              <input
                type="text"
                value={settingsForm.emailProvider.smtp}
                onChange={(e) => handleEmailProviderChange('smtp', e.target.value)}
                className="input-field"
                placeholder="smtp.gmail.com"
              />
            </div>
            
            <div>
              <label className="form-label">Port</label>
              <input
                type="number"
                value={settingsForm.emailProvider.port}
                onChange={(e) => handleEmailProviderChange('port', e.target.value)}
                className="input-field"
                placeholder="587"
              />
            </div>
            
            <div>
              <label className="form-label">Username</label>
              <input
                type="email"
                value={settingsForm.emailProvider.username}
                onChange={(e) => handleEmailProviderChange('username', e.target.value)}
                className="input-field"
                placeholder="your-email@gmail.com"
              />
            </div>
            
            <div>
              <label className="form-label">Password</label>
              <input
                type="password"
                value={settingsForm.emailProvider.password}
                onChange={(e) => handleEmailProviderChange('password', e.target.value)}
                className="input-field"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        {/* SMS Settings */}
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            <HiPhone className="w-6 h-6 text-success-600" />
            <div>
              <h3 className="text-lg font-semibold text-secondary-900">SMS Configuration</h3>
              <p className="text-sm text-secondary-600">SMS provider settings</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-secondary-700">Enable SMS</span>
              <button 
                onClick={() => handleSettingsChange('smsEnabled', !settingsForm.smsEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settingsForm.smsEnabled ? 'bg-success-600' : 'bg-secondary-200'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                  settingsForm.smsEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>
            
            <div>
              <label className="form-label">Service Provider</label>
              <select className="select-field">
                <option value="twilio">Twilio</option>
                <option value="nexmo">Nexmo</option>
                <option value="aws-sns">AWS SNS</option>
              </select>
            </div>
            
            <div>
              <label className="form-label">API Key</label>
              <input
                type="password"
                value={settingsForm.smsProvider.apiKey}
                onChange={(e) => handleSmsProviderChange('apiKey', e.target.value)}
                className="input-field"
                placeholder="••••••••••••••••"
              />
            </div>
            
            <div className="p-4 bg-warning-50 border border-warning-200 rounded-lg">
              <p className="text-sm text-warning-800">
                <strong>Note:</strong> SMS notifications require a valid API key from your chosen provider. 
                Charges may apply based on your provider's pricing.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Business Information */}
      <div className="card">
        <h3 className="text-lg font-semibold text-secondary-900 mb-4">Business Information</h3>
        <p className="text-sm text-secondary-600 mb-4">This information will be used in reminder templates</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Business Name</label>
            <input
              type="text"
              value={settingsForm.businessInfo.name}
              onChange={(e) => handleBusinessInfoChange('name', e.target.value)}
              className="input-field"
            />
          </div>
          
          <div>
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              value={settingsForm.businessInfo.phone}
              onChange={(e) => handleBusinessInfoChange('phone', e.target.value)}
              className="input-field"
            />
          </div>
          
          <div>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              value={settingsForm.businessInfo.email}
              onChange={(e) => handleBusinessInfoChange('email', e.target.value)}
              className="input-field"
            />
          </div>
          
          <div>
            <label className="form-label">Website (Optional)</label>
            <input
              type="url"
              value={settingsForm.businessInfo.website || ''}
              onChange={(e) => handleBusinessInfoChange('website', e.target.value)}
              className="input-field"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="form-label">Address</label>
            <textarea
              value={settingsForm.businessInfo.address}
              onChange={(e) => handleBusinessInfoChange('address', e.target.value)}
              className="input-field"
              rows={2}
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button 
            onClick={handleSaveSettings}
            className="btn-primary"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <div className="page-container">
        <div className="page-header">
          <div className="page-header-content">
            <div className="page-header-text">
              <PageTitle title="Reminders & Notifications" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="card">
          <div className="tab-container">
            <div className="tab-header">
              <nav className="tab-buttons">
                {[
                  { key: 'reminders', label: 'Active Reminders', count: reminders.length },
                  { key: 'templates', label: 'Templates', count: templates.length },
                  { key: 'settings', label: 'Settings', count: 0 }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as TabType)}
                    className={`tab-button ${
                      activeTab === tab.key
                        ? 'tab-button-active'
                        : 'tab-button-inactive'
                    }`}
                  >
                    {tab.label} {tab.count > 0 && `(${tab.count})`}
                  </button>
                ))}
              </nav>
            </div>

            <div className="tab-content">
              {activeTab === 'reminders' && renderReminders()}
              {activeTab === 'templates' && renderTemplates()}
              {activeTab === 'settings' && renderSettings()}
            </div>
          </div>
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

      {showEditReminderModal && editingReminder && (
        <EditReminderModal
          onClose={() => {
            setShowEditReminderModal(false)
            setEditingReminder(null)
          }}
          onSave={handleUpdateReminder}
          isLoading={remindersLoading}
          reminder={editingReminder}
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
    </>
  )
}
