import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';
import { 
  customerService, 
  Customer, 
  CreateCustomerData, 
  UpdateCustomerData, 
  CustomerFilters,
  CustomerStats 
} from '../../services/customers';

// Async thunks
export const fetchCustomers = createAsyncThunk(
  'customers/fetchCustomers',
  async (filters: CustomerFilters = {}, { rejectWithValue }) => {
    try {
      console.log('fetchCustomers: Calling customerService.getCustomers with filters:', filters)
      const response = await customerService.getCustomers(filters);
      console.log('fetchCustomers: Response from API:', response)
      return response.data;
    } catch (error: any) {
      console.error('fetchCustomers: Error:', error)
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customers');
    }
  }
);

export const fetchCustomer = createAsyncThunk(
  'customers/fetchCustomer',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await customerService.getCustomer(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer');
    }
  }
);

export const createCustomer = createAsyncThunk(
  'customers/createCustomer',
  async (customerData: CreateCustomerData, { rejectWithValue }) => {
    try {
      const response = await customerService.createCustomer(customerData);
      toast.success('Customer created successfully!');
      return response.data.customer;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create customer';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const updateCustomer = createAsyncThunk(
  'customers/updateCustomer',
  async ({ id, customerData }: { id: string; customerData: UpdateCustomerData }, { rejectWithValue }) => {
    try {
      const response = await customerService.updateCustomer(id, customerData);
      toast.success('Customer updated successfully!');
      return response.data.customer;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update customer';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const deleteCustomer = createAsyncThunk(
  'customers/deleteCustomer',
  async (id: string, { rejectWithValue }) => {
    try {
      await customerService.deleteCustomer(id);
      toast.success('Customer deleted successfully!');
      return id;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete customer';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);

export const fetchCustomerStats = createAsyncThunk(
  'customers/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await customerService.getCustomerStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer stats');
    }
  }
);

export const searchCustomers = createAsyncThunk(
  'customers/searchCustomers',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await customerService.searchCustomers(query);
      return response.data.customers;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search customers');
    }
  }
);

// Customer slice
interface CustomerState {
  list: Customer[];
  selectedCustomer: Customer | null;
  stats: CustomerStats | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCustomers: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null;
  searchResults: Customer[];
  searchLoading: boolean;
}

const initialState: CustomerState = {
  list: [],
  selectedCustomer: null,
  stats: null,
  loading: false,
  error: null,
  pagination: null,
  searchResults: [],
  searchLoading: false,
};

const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedCustomer: (state) => {
      state.selectedCustomer = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    setSelectedCustomer: (state, action: PayloadAction<Customer>) => {
      state.selectedCustomer = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch customers
    builder
      .addCase(fetchCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.customers;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch single customer
    builder
      .addCase(fetchCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCustomer = action.payload;
      })
      .addCase(fetchCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create customer
    builder
      .addCase(createCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload);
        if (state.pagination) {
          state.pagination.totalCustomers += 1;
        }
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update customer
    builder
      .addCase(updateCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(customer => customer._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.selectedCustomer?._id === action.payload._id) {
          state.selectedCustomer = action.payload;
        }
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete customer
    builder
      .addCase(deleteCustomer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter(customer => customer._id !== action.payload);
        if (state.pagination) {
          state.pagination.totalCustomers -= 1;
        }
        if (state.selectedCustomer?._id === action.payload) {
          state.selectedCustomer = null;
        }
      })
      .addCase(deleteCustomer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch stats
    builder
      .addCase(fetchCustomerStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchCustomerStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Search customers
    builder
      .addCase(searchCustomers.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(searchCustomers.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchCustomers.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSelectedCustomer, clearSearchResults, setSelectedCustomer } = customerSlice.actions;
export default customerSlice.reducer;
