import { createAsyncThunk } from '@reduxjs/toolkit'
import { toast } from 'react-hot-toast'
import { CommunicationLog } from '../../utils/CustomerTypes'
import { apiRequest } from '../../services/api'

// API base URL
const API_BASE = '/api/communication-logs'

// Fetch all communication logs
export const fetchCommunicationLogs = createAsyncThunk(
  'communicationLogs/fetchAll',
  async (filters: {
    type?: string
    outcome?: string
    customerId?: string
    dateFrom?: string
    dateTo?: string
    page?: number
    limit?: number
  } = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString())
        }
      })
      
      const data = await apiRequest(`${API_BASE}?${params.toString()}`)
      return data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch communication logs')
    }
  }
)

// Create new communication log
export const createCommunicationLog = createAsyncThunk(
  'communicationLogs/create',
  async (logData: {
    customerId: string
    customerName: string
    date: string
    time: string
    type: 'phone' | 'email' | 'in-person' | 'sms'
    direction: 'inbound' | 'outbound'
    subject: string
    content: string
    outcome: 'resolved' | 'follow-up-needed' | 'appointment-scheduled' | 'no-answer' | 'callback-requested'
    employeeName: string
    priority: 'low' | 'medium' | 'high'
    relatedService?: string
  }, { rejectWithValue }) => {
    try {
      const data = await apiRequest(API_BASE, {
        method: 'POST',
        body: JSON.stringify(logData),
      })
      
      toast.success('Communication log created successfully')
      return data
    } catch (error: any) {
      toast.error(error.message || 'Failed to create communication log')
      return rejectWithValue(error.message || 'Failed to create communication log')
    }
  }
)

// Update communication log
export const updateCommunicationLog = createAsyncThunk(
  'communicationLogs/update',
  async ({ id, logData }: { 
    id: string
    logData: Partial<CommunicationLog>
  }, { rejectWithValue }) => {
    try {
      const data = await apiRequest(`${API_BASE}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(logData),
      })
      
      toast.success('Communication log updated successfully')
      return data
    } catch (error: any) {
      toast.error(error.message || 'Failed to update communication log')
      return rejectWithValue(error.message || 'Failed to update communication log')
    }
  }
)

// Delete communication log
export const deleteCommunicationLog = createAsyncThunk(
  'communicationLogs/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiRequest(`${API_BASE}/${id}`, {
        method: 'DELETE',
      })
      
      toast.success('Communication log deleted successfully')
      return id
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete communication log')
      return rejectWithValue(error.message || 'Failed to delete communication log')
    }
  }
)

// Get communication log statistics
export const fetchCommunicationStats = createAsyncThunk(
  'communicationLogs/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const data = await apiRequest(`${API_BASE}/stats`)
      return data
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch communication statistics')
    }
  }
)
