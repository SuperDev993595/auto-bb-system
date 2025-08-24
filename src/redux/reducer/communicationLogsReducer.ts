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
    totalLogs: number
    byType: {
      phone: number
      email: number
      'in-person': number
      sms: number
    }
    byDirection: {
      inbound: number
      outbound: number
    }
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
    totalLogs: 0,
    byType: {
      phone: 0,
      email: 0,
      'in-person': 0,
      sms: 0
    },
    byDirection: {
      inbound: 0,
      outbound: 0
    }
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
        const logsWithId = (action.payload || []).map((log: any) => ({
          ...log,
          id: log._id || log.id
        }))
        
        state.logs = logsWithId
        state.pagination = {
          currentPage: 1,
          totalPages: 1,
          totalItems: logsWithId.length,
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
        const newLog = action.payload as any
        
        // Ensure the log has both id and _id for consistency
        if (newLog) {
          newLog.id = newLog._id || newLog.id
        }
        
        // Handle customer data properly
        if (newLog && newLog.customer) {
          const logWithId = {
            ...newLog,
            id: newLog._id || newLog.id,
            customerId: newLog.customer._id || newLog.customer.id || newLog.customer
          }
          state.logs.unshift(logWithId)
        } else {
          state.logs.unshift(newLog)
        }
        
        state.error = null
      })
      .addCase(createCommunicationLog.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // Update Communication Log
    builder
      .addCase(updateCommunicationLog.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCommunicationLog.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload) {
          // Map _id to id for consistency with frontend interface
          const logWithId = {
            ...action.payload,
            id: action.payload._id || action.payload.id
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
        // action.payload is now { customerId, logId }
        const logId = action.payload.logId
        state.logs = state.logs.filter(log => log.id !== logId && (log as any)._id !== logId)
        state.stats.totalLogs = Math.max(0, state.stats.totalLogs - 1)
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
        state.stats = action.payload || state.stats
      })
      .addCase(fetchCommunicationStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || 'Failed to fetch communication statistics'
      })
  }
})

export const { clearError, setLoading } = communicationLogsSlice.actions
export default communicationLogsSlice.reducer
