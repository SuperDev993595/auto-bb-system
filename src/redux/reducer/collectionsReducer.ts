import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CollectionsTask } from '../../services/collections';
import * as collectionsActions from '../actions/collections';

interface CollectionsState {
  collectionsTasks: CollectionsTask[];
  overdueCollections: CollectionsTask[];
  customerCollections: { [customerId: string]: CollectionsTask[] };
  riskLevelCollections: { [level: string]: CollectionsTask[] };
  stats: {
    collectionsTypeStats: Array<{
      _id: string;
      count: number;
      totalAmount: number;
      completed: number;
    }>;
    riskLevelStats: Array<{
      _id: string;
      count: number;
      totalAmount: number;
      completed: number;
    }>;
    overallStats: {
      totalTasks: number;
      totalAmount: number;
      completedTasks: number;
      completedAmount: number;
      overdueTasks: number;
    };
  };
  pagination: {
    currentPage: number;
    totalPages: number;
    totalTasks: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  loading: boolean;
  error: string | null;
  filters: {
    customer: string;
    assignedTo: string;
    collectionsType: string;
    status: string;
    riskLevel: string;
    search: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
}

const initialState: CollectionsState = {
  collectionsTasks: [],
  overdueCollections: [],
  customerCollections: {},
  riskLevelCollections: {},
  stats: {
    collectionsTypeStats: [],
    riskLevelStats: [],
    overallStats: {
      totalTasks: 0,
      totalAmount: 0,
      completedTasks: 0,
      completedAmount: 0,
      overdueTasks: 0
    }
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalTasks: 0,
    hasNextPage: false,
    hasPrevPage: false
  },
  loading: false,
  error: null,
  filters: {
    customer: '',
    assignedTo: '',
    collectionsType: '',
    status: '',
    riskLevel: '',
    search: '',
    sortBy: 'dueDate',
    sortOrder: 'asc'
  }
};

const collectionsSlice = createSlice({
  name: 'collections',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<Partial<CollectionsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    updateCollectionsTask: (state, action: PayloadAction<CollectionsTask>) => {
      const index = state.collectionsTasks.findIndex(task => task._id === action.payload._id);
      if (index !== -1) {
        state.collectionsTasks[index] = action.payload;
      }
    },
    removeCollectionsTask: (state, action: PayloadAction<string>) => {
      state.collectionsTasks = state.collectionsTasks.filter(task => task._id !== action.payload);
    }
  },
  extraReducers: (builder) => {
    // Fetch Collections
    builder
      .addCase(collectionsActions.fetchCollections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(collectionsActions.fetchCollections.fulfilled, (state, action) => {
        state.loading = false;
        state.collectionsTasks = action.payload.collectionsTasks;
        state.pagination = action.payload.pagination;
      })
      .addCase(collectionsActions.fetchCollections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Collections Task
    builder
      .addCase(collectionsActions.createCollectionsTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(collectionsActions.createCollectionsTask.fulfilled, (state, action) => {
        state.loading = false;
        state.collectionsTasks.unshift(action.payload);
        state.pagination.totalTasks += 1;
      })
      .addCase(collectionsActions.createCollectionsTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update Collections Task
    builder
      .addCase(collectionsActions.updateCollectionsTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(collectionsActions.updateCollectionsTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.collectionsTasks.findIndex(task => task._id === action.payload._id);
        if (index !== -1) {
          state.collectionsTasks[index] = action.payload;
        }
      })
      .addCase(collectionsActions.updateCollectionsTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add Communication
    builder
      .addCase(collectionsActions.addCommunication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(collectionsActions.addCommunication.fulfilled, (state, action) => {
        state.loading = false;
        const task = state.collectionsTasks.find(t => t._id === action.payload.id);
        if (task) {
          task.communicationHistory.push(action.payload.communication);
        }
      })
      .addCase(collectionsActions.addCommunication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Record Payment
    builder
      .addCase(collectionsActions.recordPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(collectionsActions.recordPayment.fulfilled, (state, action) => {
        state.loading = false;
        const task = state.collectionsTasks.find(t => t._id === action.payload.id);
        if (task && task.paymentPlan) {
          task.paymentPlan.totalPaid = action.payload.paymentData.totalPaid;
          task.paymentPlan.nextPaymentDate = action.payload.paymentData.nextPaymentDate;
        }
      })
      .addCase(collectionsActions.recordPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Overdue Collections
    builder
      .addCase(collectionsActions.fetchOverdueCollections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(collectionsActions.fetchOverdueCollections.fulfilled, (state, action) => {
        state.loading = false;
        state.overdueCollections = action.payload.overdueCollections;
      })
      .addCase(collectionsActions.fetchOverdueCollections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Collections Stats
    builder
      .addCase(collectionsActions.fetchCollectionsStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(collectionsActions.fetchCollectionsStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(collectionsActions.fetchCollectionsStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Customer Collections
    builder
      .addCase(collectionsActions.fetchCustomerCollections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(collectionsActions.fetchCustomerCollections.fulfilled, (state, action) => {
        state.loading = false;
        state.customerCollections[action.payload.customerId] = action.payload.collectionsTasks;
      })
      .addCase(collectionsActions.fetchCustomerCollections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Collections by Risk Level
    builder
      .addCase(collectionsActions.fetchCollectionsByRiskLevel.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(collectionsActions.fetchCollectionsByRiskLevel.fulfilled, (state, action) => {
        state.loading = false;
        state.riskLevelCollections[action.payload.level] = action.payload.collectionsTasks;
      })
      .addCase(collectionsActions.fetchCollectionsByRiskLevel.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { 
  clearError, 
  setFilters, 
  clearFilters, 
  updateCollectionsTask, 
  removeCollectionsTask 
} = collectionsSlice.actions;

export default collectionsSlice.reducer;
