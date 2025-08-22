import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { toast } from 'react-hot-toast'
import api from '../../services/api'

// Types
export interface SMSTemplate {
  _id: string
  name: string
  message: string
  variables: string[]
  category: string
  description?: string
  usageCount: number
  isActive: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface SMSRecord {
  _id: string
  to: string
  message: string
  status: 'pending' | 'sent' | 'delivered' | 'failed'
  priority: 'low' | 'normal' | 'high'
  scheduledAt?: string
  sentAt?: string
  deliveredAt?: string
  errorMessage?: string
  provider: string
  providerMessageId?: string
  cost: number
  createdBy: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface SMSStats {
  totalSent: number
  totalDelivered: number
  totalFailed: number
  deliveryRate: number
  totalCost: number
  pending: number
  todaySent: number
  thisWeekSent: number
  thisMonthSent: number
}

export interface SendSMSData {
  to: string
  message: string
  priority?: 'low' | 'normal' | 'high'
  scheduledAt?: string
}

export interface BulkSMSData {
  recipients: string[]
  message: string
  priority?: 'low' | 'normal' | 'high'
  scheduledAt?: string
}

export interface CreateTemplateData {
  name: string
  message: string
  variables: string[]
  category: string
  description?: string
}

export interface UseTemplateData {
  templateId: string
  variables: Record<string, string>
  recipients: string[]
  priority?: 'low' | 'normal' | 'high'
  scheduledAt?: string
}

export interface SMSFilters {
  status?: string
  priority?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

export interface SMSTemplateFilters {
  category?: string
  isActive?: boolean
  search?: string
}

export interface SMSHistoryResponse {
  success: boolean
  data: {
    records: SMSRecord[]
    pagination: {
      currentPage: number
      totalPages: number
      totalRecords: number
      hasNextPage: boolean
      hasPrevPage: boolean
    }
  }
}

export interface BulkSMSResponse {
  success: boolean
  data: {
    sentCount: number
    failedCount: number
    totalCost: number
    records: SMSRecord[]
  }
}

export interface UseTemplateResponse {
  success: boolean
  data: {
    sentCount: number
    failedCount: number
    totalCost: number
    records: SMSRecord[]
  }
}

// Async thunks
export const fetchSMSHistory = createAsyncThunk(
  'sms/fetchHistory',
  async (filters: SMSFilters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value)
      })
      
      const response = await api.get(`/sms/history?${params.toString()}`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch SMS history')
    }
  }
)

export const fetchSMSStats = createAsyncThunk(
  'sms/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/sms/analytics')
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch SMS stats')
    }
  }
)

export const sendSMS = createAsyncThunk(
  'sms/sendSMS',
  async (smsData: any, { rejectWithValue }) => {
    try {
      const response = await api.post('/sms/send', smsData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send SMS');
    }
  }
)

export const sendBulkSMS = createAsyncThunk(
  'sms/sendBulkSMS',
  async (bulkSmsData: any, { rejectWithValue }) => {
    try {
      const response = await api.post('/sms/bulk', bulkSmsData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send bulk SMS');
    }
  }
)

export const fetchSMSTemplates = createAsyncThunk(
  'sms/fetchTemplates',
  async (filters: SMSTemplateFilters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, value.toString())
      })
      
      const response = await api.get(`/sms/templates?${params.toString()}`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch SMS templates')
    }
  }
)

export const createSMSTemplate = createAsyncThunk(
  'sms/createTemplate',
  async (templateData: any, { rejectWithValue }) => {
    try {
      const response = await api.post('/sms/templates', templateData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create SMS template');
    }
  }
)

export const useSMSTemplate = createAsyncThunk(
  'sms/useTemplate',
  async ({ templateId, recipients }: { templateId: string; recipients: string[] }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/sms/templates/${templateId}/use`, { recipients });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to use SMS template');
    }
  }
)

// State interface
interface SMSState {
  history: SMSRecord[]
  templates: SMSTemplate[]
  stats: SMSStats | null
  loading: boolean
  error: string | null
  pagination: {
    currentPage: number
    totalPages: number
    totalRecords: number
    hasNextPage: boolean
    hasPrevPage: boolean
  } | null
}

// Initial state
const initialState: SMSState = {
  history: [],
  templates: [],
  stats: null,
  loading: false,
  error: null,
  pagination: null
}

// Slice
const smsSlice = createSlice({
  name: 'sms',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearHistory: (state) => {
      state.history = []
      state.pagination = null
    }
  },
  extraReducers: (builder) => {
    // Fetch SMS History
    builder
      .addCase(fetchSMSHistory.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSMSHistory.fulfilled, (state, action) => {
        state.loading = false
        state.history = action.payload.data.records
        state.pagination = action.payload.data.pagination
      })
      .addCase(fetchSMSHistory.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch SMS Stats
    builder
      .addCase(fetchSMSStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSMSStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload.data
      })
      .addCase(fetchSMSStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Send SMS
    builder
      .addCase(sendSMS.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(sendSMS.fulfilled, (state, action) => {
        state.loading = false
        // Add the new SMS record to history
        state.history.unshift(action.payload.data)
      })
      .addCase(sendSMS.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Send Bulk SMS
    builder
      .addCase(sendBulkSMS.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(sendBulkSMS.fulfilled, (state, action) => {
        state.loading = false
        // Add the new SMS records to history
        state.history.unshift(...action.payload.data.records)
      })
      .addCase(sendBulkSMS.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Fetch SMS Templates
    builder
      .addCase(fetchSMSTemplates.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSMSTemplates.fulfilled, (state, action) => {
        state.loading = false
        state.templates = action.payload.data
      })
      .addCase(fetchSMSTemplates.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Create SMS Template
    builder
      .addCase(createSMSTemplate.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createSMSTemplate.fulfilled, (state, action) => {
        state.loading = false
        state.templates.push(action.payload.data)
      })
      .addCase(createSMSTemplate.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Use SMS Template
    builder
      .addCase(useSMSTemplate.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(useSMSTemplate.fulfilled, (state, action) => {
        state.loading = false
        // Add the new SMS records to history
        state.history.unshift(...action.payload.data.records)
        // Update template usage count
        const templateId = action.meta.arg.templateId
        const template = state.templates.find(t => t._id === templateId)
        if (template) {
          template.usageCount += action.payload.data.sentCount
        }
      })
      .addCase(useSMSTemplate.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const { clearError, clearHistory } = smsSlice.actions
export default smsSlice.reducer
