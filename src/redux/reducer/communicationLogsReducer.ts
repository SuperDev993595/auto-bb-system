import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { CommunicationLog } from '../../utils/CustomerTypes'
import {
  fetchCommunicationLogs,
  createCommunicationLog,
  updateCommunicationLog,
  deleteCommunicationLog,
  fetchCommunicationStats
} from '../actions/communicationLogs'

interface CommunicationLogsState {
  logs: CommunicationLog[]
  stats: {
    totalContacts: number
    phoneCalls: number
    emails: number
    followUpsNeeded: number
    resolved: number
  }
  loading: boolean
  error: string | null
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

const initialState: CommunicationLogsState = {
  logs: [],
  stats: {
    totalContacts: 0,
    phoneCalls: 0,
    emails: 0,
    followUpsNeeded: 0,
    resolved: 0
  },
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false
  }
}

const communicationLogsSlice = createSlice({
  name: 'communicationLogs',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    }
  },
  extraReducers: (builder) => {
    // Fetch Communication Logs
    builder
      .addCase(fetchCommunicationLogs.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCommunicationLogs.fulfilled, (state, action) => {
        state.loading = false
        // Map _id to id for consistency with frontend interface
        const logsWithId = (action.payload.data || []).map((log: any) => ({
          ...log,
          id: log._id || log.id
        }))
        state.logs = logsWithId
        state.pagination = action.payload.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          hasNextPage: false,
          hasPrevPage: false
        }
      })
      .addCase(fetchCommunicationLogs.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || 'Failed to fetch communication logs'
      })

    // Create Communication Log
    builder
      .addCase(createCommunicationLog.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCommunicationLog.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.data) {
          // Map _id to id for consistency with frontend interface
          const logWithId = {
            ...action.payload.data,
            id: action.payload.data._id || action.payload.data.id
          }
          state.logs.unshift(logWithId)
          state.stats.totalContacts += 1
        }
      })
      .addCase(createCommunicationLog.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || 'Failed to create communication log'
      })

    // Update Communication Log
    builder
      .addCase(updateCommunicationLog.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCommunicationLog.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload.data) {
          // Map _id to id for consistency with frontend interface
          const logWithId = {
            ...action.payload.data,
            id: action.payload.data._id || action.payload.data.id
          }
          const index = state.logs.findIndex(log => log.id === logWithId.id || (log as any)._id === logWithId.id)
          if (index !== -1) {
            state.logs[index] = logWithId
          }
        }
      })
      .addCase(updateCommunicationLog.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || 'Failed to update communication log'
      })

    // Delete Communication Log
    builder
      .addCase(deleteCommunicationLog.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteCommunicationLog.fulfilled, (state, action) => {
        state.loading = false
        state.logs = state.logs.filter(log => log.id !== action.payload && (log as any)._id !== action.payload)
        state.stats.totalContacts = Math.max(0, state.stats.totalContacts - 1)
      })
      .addCase(deleteCommunicationLog.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || 'Failed to delete communication log'
      })

    // Fetch Communication Stats
    builder
      .addCase(fetchCommunicationStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCommunicationStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload.data || state.stats
      })
      .addCase(fetchCommunicationStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || 'Failed to fetch communication statistics'
      })
  }
})

export const { clearError, setLoading } = communicationLogsSlice.actions
export default communicationLogsSlice.reducer
