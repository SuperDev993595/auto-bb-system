import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  fetchSalesRecords,
  fetchSalesRecord,
  createSalesRecordAction,
  updateSalesRecordAction,
  deleteSalesRecordAction,
  fetchCustomerSalesRecords
} from '../actions/salesRecords';
import { SalesRecord } from '../../services/salesRecords';

interface SalesRecordsState {
  salesRecords: SalesRecord[];
  currentSalesRecord: SalesRecord | null;
  customerSalesRecords: SalesRecord[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
  };
  customerPagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
  };
}

const initialState: SalesRecordsState = {
  salesRecords: [],
  currentSalesRecord: null,
  customerSalesRecords: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0
  },
  customerPagination: {
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0
  }
};

const salesRecordsSlice = createSlice({
  name: 'salesRecords',
  initialState,
  reducers: {
    clearCurrentSalesRecord: (state) => {
      state.currentSalesRecord = null;
    },
    clearCustomerSalesRecords: (state) => {
      state.customerSalesRecords = [];
      state.customerPagination = {
        currentPage: 1,
        totalPages: 1,
        totalRecords: 0
      };
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Fetch all sales records
    builder
      .addCase(fetchSalesRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.salesRecords = action.payload.salesRecords;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchSalesRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch sales records';
      });

    // Fetch single sales record
    builder
      .addCase(fetchSalesRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSalesRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSalesRecord = action.payload;
      })
      .addCase(fetchSalesRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch sales record';
      });

    // Create sales record
    builder
      .addCase(createSalesRecordAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSalesRecordAction.fulfilled, (state, action) => {
        state.loading = false;
        state.salesRecords.unshift(action.payload);
        state.pagination.totalRecords += 1;
      })
      .addCase(createSalesRecordAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create sales record';
      });

    // Update sales record
    builder
      .addCase(updateSalesRecordAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSalesRecordAction.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.salesRecords.findIndex(record => record._id === action.payload._id);
        if (index !== -1) {
          state.salesRecords[index] = action.payload;
        }
        if (state.currentSalesRecord?._id === action.payload._id) {
          state.currentSalesRecord = action.payload;
        }
        const customerIndex = state.customerSalesRecords.findIndex(record => record._id === action.payload._id);
        if (customerIndex !== -1) {
          state.customerSalesRecords[customerIndex] = action.payload;
        }
      })
      .addCase(updateSalesRecordAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update sales record';
      });

    // Delete sales record
    builder
      .addCase(deleteSalesRecordAction.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSalesRecordAction.fulfilled, (state, action) => {
        state.loading = false;
        state.salesRecords = state.salesRecords.filter(record => record._id !== action.payload);
        if (state.currentSalesRecord?._id === action.payload) {
          state.currentSalesRecord = null;
        }
        state.customerSalesRecords = state.customerSalesRecords.filter(record => record._id !== action.payload);
        state.pagination.totalRecords = Math.max(0, state.pagination.totalRecords - 1);
        state.customerPagination.totalRecords = Math.max(0, state.customerPagination.totalRecords - 1);
      })
      .addCase(deleteSalesRecordAction.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete sales record';
      });

    // Fetch customer sales records
    builder
      .addCase(fetchCustomerSalesRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCustomerSalesRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.customerSalesRecords = action.payload.salesRecords;
        state.customerPagination = action.payload.pagination;
      })
      .addCase(fetchCustomerSalesRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch customer sales records';
      });
  }
});

export const {
  clearCurrentSalesRecord,
  clearCustomerSalesRecords,
  setError,
  clearError
} = salesRecordsSlice.actions;

export default salesRecordsSlice.reducer;
