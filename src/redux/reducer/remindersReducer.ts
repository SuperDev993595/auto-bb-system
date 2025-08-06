import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Reminder } from '../../utils/CustomerTypes'

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
  reminders: [
    {
      id: 'r1',
      type: 'appointment',
      customerId: '1',
      customerName: 'John Smith',
      appointmentId: 'apt1',
      scheduledDate: '2025-08-04T09:00:00Z',
      message: 'Reminder: You have an oil change appointment tomorrow at 9:00 AM.',
      status: 'pending',
      method: 'email',
      createdDate: '2025-08-03T10:00:00Z'
    },
    {
      id: 'r2',
      type: 'service-due',
      customerId: '1',
      customerName: 'John Smith',
      vehicleId: 'v1',
      scheduledDate: '2025-08-15T08:00:00Z',
      message: 'Your 2020 Toyota Camry is due for service. Current mileage: 45,000 miles.',
      status: 'pending',
      method: 'sms',
      createdDate: '2025-08-03T10:00:00Z'
    }
  ],
  templates: [
    {
      id: 't1',
      name: 'Appointment Reminder - 24 Hours',
      type: 'appointment',
      subject: 'Appointment Reminder - {{businessName}}',
      message: 'Hi {{customerName}},\n\nThis is a reminder that you have a {{serviceType}} appointment scheduled for {{appointmentDate}} at {{appointmentTime}}.\n\nVehicle: {{vehicleInfo}}\nTechnician: {{technicianName}}\n\nIf you need to reschedule, please call us at {{businessPhone}}.\n\nThank you!\n{{businessName}}',
      timing: { value: 24, unit: 'hours', when: 'before' },
      methods: ['email', 'sms'],
      isActive: true
    },
    {
      id: 't2',
      name: 'Service Due Reminder',
      type: 'service-due',
      subject: 'Service Reminder - {{vehicleInfo}}',
      message: 'Hi {{customerName}},\n\nYour {{vehicleInfo}} is due for service based on:\n- Mileage: {{currentMileage}} miles\n- Last service: {{lastServiceDate}}\n- Recommended service: {{recommendedService}}\n\nSchedule your appointment today!\nCall: {{businessPhone}}\nWebsite: {{businessWebsite}}\n\nBest regards,\n{{businessName}}',
      timing: { value: 1, unit: 'weeks', when: 'before' },
      methods: ['email'],
      isActive: true
    },
    {
      id: 't3',
      name: 'Follow-up After Service',
      type: 'follow-up',
      subject: 'How was your service experience?',
      message: 'Hi {{customerName}},\n\nThank you for choosing {{businessName}} for your {{serviceType}}.\n\nWe hope you\'re satisfied with our service. If you have any questions or concerns, please don\'t hesitate to contact us.\n\nYour next recommended service: {{nextServiceDue}}\n\nWe appreciate your business!\n{{businessName}}',
      timing: { value: 2, unit: 'days', when: 'after' },
      methods: ['email'],
      isActive: true
    },
    {
      id: 't4',
      name: 'Payment Due Reminder',
      type: 'payment-due',
      subject: 'Payment Reminder - Invoice #{{invoiceNumber}}',
      message: 'Hi {{customerName}},\n\nThis is a friendly reminder that payment for Invoice #{{invoiceNumber}} is due on {{dueDate}}.\n\nAmount due: ${{amountDue}}\nService: {{serviceDescription}}\nVehicle: {{vehicleInfo}}\n\nYou can pay online at {{businessWebsite}} or call us at {{businessPhone}}.\n\nThank you!\n{{businessName}}',
      timing: { value: 3, unit: 'days', when: 'before' },
      methods: ['email', 'sms'],
      isActive: true
    }
  ],
  settings: {
    emailEnabled: true,
    smsEnabled: false,
    emailProvider: {
      smtp: 'smtp.gmail.com',
      port: 587,
      username: '',
      password: ''
    },
    smsProvider: {
      apiKey: '',
      serviceName: 'twilio'
    },
    businessInfo: {
      name: 'B&B Auto Repair Shop',
      phone: '(555) 123-4567',
      email: 'info@bbautorepair.com',
      address: '123 Main Street, Anytown, ST 12345',
      website: 'https://bbautorepair.com'
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
