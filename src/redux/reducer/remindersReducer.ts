import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Reminder } from '../../utils/CustomerTypes'
import { 
  fetchReminders, 
  fetchReminderTemplates, 
  fetchNotificationSettings 
} from '../actions/reminders'

interface RemindersState {
  reminders: Reminder[]
  templates: ReminderTemplate[]
  settings: NotificationSettings
  loading: boolean
  error: string | null
}

export interface ReminderTemplate {
  id: string
  name: string
  type: Reminder['type']
  subject: string
  message: string
  timing: {
    value: number
    unit: 'minutes' | 'hours' | 'days' | 'weeks'
    when: 'before' | 'after'
  }
  methods: Reminder['method'][]
  isActive: boolean
}

export interface NotificationSettings {
  emailEnabled: boolean
  smsEnabled: boolean
  emailProvider: {
    smtp: string
    port: number
    username: string
    password: string
  }
  smsProvider: {
    apiKey: string
    serviceName: string
  }
  businessInfo: {
    name: string
    phone: string
    email: string
    address: string
    website?: string
  }
}

const initialState: RemindersState = {
  reminders: [],
  templates: [],
  settings: {
    emailEnabled: true,
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
  loading: false,
  error: null
}

const remindersSlice = createSlice({
  name: 'reminders',
  initialState,
  reducers: {
    // Reminder Actions
    addReminder: (state, action: PayloadAction<Reminder>) => {
      state.reminders.push(action.payload)
    },
    updateReminder: (state, action: PayloadAction<Reminder>) => {
      const index = state.reminders.findIndex(r => r.id === action.payload.id)
      if (index !== -1) {
        state.reminders[index] = action.payload
      }
    },
    deleteReminder: (state, action: PayloadAction<string>) => {
      state.reminders = state.reminders.filter(r => r.id !== action.payload)
    },
    updateReminderStatus: (state, action: PayloadAction<{id: string, status: Reminder['status'], sentDate?: string}>) => {
      const reminder = state.reminders.find(r => r.id === action.payload.id)
      if (reminder) {
        reminder.status = action.payload.status
        if (action.payload.sentDate) {
          reminder.sentDate = action.payload.sentDate
        }
      }
    },
    
    // Template Actions
    addTemplate: (state, action: PayloadAction<ReminderTemplate>) => {
      state.templates.push(action.payload)
    },
    updateTemplate: (state, action: PayloadAction<ReminderTemplate>) => {
      const index = state.templates.findIndex(t => t.id === action.payload.id)
      if (index !== -1) {
        state.templates[index] = action.payload
      }
    },
    deleteTemplate: (state, action: PayloadAction<string>) => {
      state.templates = state.templates.filter(t => t.id !== action.payload)
    },
    toggleTemplate: (state, action: PayloadAction<string>) => {
      const template = state.templates.find(t => t.id === action.payload)
      if (template) {
        template.isActive = !template.isActive
      }
    },
    
    // Settings Actions
    updateNotificationSettings: (state, action: PayloadAction<Partial<NotificationSettings>>) => {
      state.settings = { ...state.settings, ...action.payload }
    },
    
    // Bulk Actions
    markAllAsSent: (state, action: PayloadAction<string[]>) => {
      action.payload.forEach(id => {
        const reminder = state.reminders.find(r => r.id === id)
        if (reminder) {
          reminder.status = 'sent'
          reminder.sentDate = new Date().toISOString()
        }
      })
    },
    
    // General Actions
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    }
  },
  extraReducers: (builder) => {
    // Fetch Reminders
    builder
      .addCase(fetchReminders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchReminders.fulfilled, (state, action) => {
        state.loading = false
        state.reminders = action.payload.data || []
      })
      .addCase(fetchReminders.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch reminders'
      })

    // Fetch Templates
    builder
      .addCase(fetchReminderTemplates.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchReminderTemplates.fulfilled, (state, action) => {
        state.loading = false
        state.templates = action.payload.data || []
      })
      .addCase(fetchReminderTemplates.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch templates'
      })

    // Fetch Notification Settings
    builder
      .addCase(fetchNotificationSettings.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchNotificationSettings.fulfilled, (state, action) => {
        state.loading = false
        state.settings = action.payload || state.settings
      })
      .addCase(fetchNotificationSettings.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch notification settings'
      })
  }
})

export const {
  addReminder,
  updateReminder,
  deleteReminder,
  updateReminderStatus,
  addTemplate,
  updateTemplate,
  deleteTemplate,
  toggleTemplate,
  updateNotificationSettings,
  markAllAsSent,
  setLoading,
  setError
} = remindersSlice.actions

export default remindersSlice.reducer
