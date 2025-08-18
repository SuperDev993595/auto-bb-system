import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Customer, CustomerStats } from '../../services/customers'
import {
  fetchCustomers,
  fetchCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  fetchCustomerStats,
  searchCustomers
} from '../actions/customers'

interface CustomersState {
  list: Customer[]
  loading: boolean
  error: string | null
  selectedCustomer: Customer | null
  pagination: {
    currentPage: number
    totalPages: number
    totalCustomers: number
    hasNextPage: boolean
    hasPrevPage: boolean
  } | null
  stats: CustomerStats | null
}

const initialState: CustomersState = {
  list: [],
  loading: false,
  error: null,
  selectedCustomer: null,
  pagination: null,
  stats: null
}

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setSelectedCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.selectedCustomer = action.payload
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    // fetchCustomers
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false
        console.log('fetchCustomers.fulfilled payload:', action.payload)
        const payload: any = action.payload as any
        const normalized = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.customers)
          ? payload.customers
          : Array.isArray(payload?.data?.customers)
          ? payload.data.customers
          : []
        console.log('fetchCustomers.fulfilled normalized:', normalized)
        state.list = normalized
        state.pagination = payload?.pagination || payload?.data?.pagination || null
        state.error = null
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // fetchCustomer
    builder
      .addCase(fetchCustomer.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCustomer.fulfilled, (state, action) => {
        state.loading = false
        state.selectedCustomer = action.payload
        state.error = null
      })
      .addCase(fetchCustomer.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // createCustomer
    builder
      .addCase(createCustomer.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false
        state.list.unshift(action.payload)
        state.error = null
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // updateCustomer
    builder
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.loading = false
        const index = state.list.findIndex(c => c._id === action.payload._id)
        if (index !== -1) {
          state.list[index] = action.payload
        }
        if (state.selectedCustomer?._id === action.payload._id) {
          state.selectedCustomer = action.payload
        }
        state.error = null
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // deleteCustomer
    builder
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.loading = false
        state.list = state.list.filter(c => c._id !== action.payload)
        if (state.selectedCustomer?._id === action.payload) {
          state.selectedCustomer = null
        }
        state.error = null
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // fetchCustomerStats
    builder
      .addCase(fetchCustomerStats.pending, (state) => {
        state.error = null
      })
      .addCase(fetchCustomerStats.fulfilled, (state, action) => {
        state.stats = action.payload
        state.error = null
      })
      .addCase(fetchCustomerStats.rejected, (state, action) => {
        state.error = action.payload as string
      })

    // searchCustomers
    builder
      .addCase(searchCustomers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(searchCustomers.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload
        state.error = null
      })
      .addCase(searchCustomers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  }
})

export const {
  setSelectedCustomer,
  clearError
} = customersSlice.actions

export default customersSlice.reducer
