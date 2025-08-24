import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  fetchCustomers,
  fetchCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  fetchCustomerStats,
  searchCustomers
} from '../actions/customers'
import { Customer, CustomerStats } from '../../services/customers'

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
  searchResults: Customer[]
  searchLoading: boolean
}

const initialState: CustomersState = {
  list: [],
  loading: false,
  error: null,
  selectedCustomer: null,
  pagination: null,
  stats: null,
  searchResults: [],
  searchLoading: false
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
    },
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null
    },
    clearSearchResults: (state) => {
      state.searchResults = []
      state.searchLoading = false
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
        
        // The payload structure is: { customers: Customer[], pagination: {...} }
        const customers = payload?.customers || []
        console.log('fetchCustomers.fulfilled customers:', customers)
        
        // Map _id to id for consistency with frontend interface
        const customersWithId = customers.map((customer: any) => ({
          ...customer,
          id: customer._id || customer.id
        }))
        
        state.list = customersWithId
        state.pagination = payload?.pagination || null
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
        // Ensure the customer has both id and _id for consistency
        const customer = action.payload as any
        if (customer) {
          customer.id = customer._id || customer.id
        }
        state.selectedCustomer = customer
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
        const customer = action.payload as any
        if (customer) {
          customer.id = customer._id || customer.id
        }
        state.list.unshift(customer)
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
        const updatedCustomer = action.payload as any
        if (updatedCustomer) {
          updatedCustomer.id = updatedCustomer._id || updatedCustomer.id
        }
        
        const index = state.list.findIndex(c => c._id === updatedCustomer._id || c.id === updatedCustomer.id)
        if (index !== -1) {
          state.list[index] = updatedCustomer
        }
        if (state.selectedCustomer && (state.selectedCustomer._id === updatedCustomer._id || state.selectedCustomer.id === updatedCustomer.id)) {
          state.selectedCustomer = updatedCustomer
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
        const deletedId = action.payload as string
        state.list = state.list.filter(c => c._id !== deletedId && c.id !== deletedId)
        if (state.selectedCustomer && (state.selectedCustomer._id === deletedId || state.selectedCustomer.id === deletedId)) {
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
        state.loading = true
        state.error = null
      })
      .addCase(fetchCustomerStats.fulfilled, (state, action) => {
        state.loading = false
        state.stats = action.payload as CustomerStats
        state.error = null
      })
      .addCase(fetchCustomerStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })

    // searchCustomers
    builder
      .addCase(searchCustomers.pending, (state) => {
        state.searchLoading = true
        state.error = null
      })
      .addCase(searchCustomers.fulfilled, (state, action) => {
        state.searchLoading = false
        const customers = action.payload as any[] || []
        // Map _id to id for consistency
        const customersWithId = customers.map((customer: any) => ({
          ...customer,
          id: customer._id || customer.id
        }))
        state.searchResults = customersWithId
        state.error = null
      })
      .addCase(searchCustomers.rejected, (state, action) => {
        state.searchLoading = false
        state.error = action.payload as string
      })
  }
})

export const { setSelectedCustomer, clearError, clearSelectedCustomer, clearSearchResults } = customersSlice.actions
export default customersSlice.reducer
