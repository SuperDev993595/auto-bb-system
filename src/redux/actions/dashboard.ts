import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Types
export interface DashboardStats {
  totalCustomers: number;
  totalAppointments: number;
  totalRevenue: number;
  pendingTasks: number;
  completedServices: number;
  averageRating: number;
  monthlyGrowth: number;
  topServices: Array<{
    name: string;
    count: number;
    revenue: number;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    amount?: number;
  }>;
}

export interface DashboardFilters {
  dateRange: string;
  serviceType: string;
  technician: string;
  status: string;
}

export interface CustomReport {
  metrics: string[];
  dateRange: { start: string; end: string };
  chartType: 'line' | 'bar' | 'pie' | 'doughnut';
  data: any;
  generatedAt: string;
}

interface DashboardState {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  realTimeEnabled: boolean;
  lastUpdate: string | null;
  customReports: CustomReport[];
}

const initialState: DashboardState = {
  stats: null,
  loading: false,
  error: null,
  realTimeEnabled: true,
  lastUpdate: null,
  customReports: [],
};

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (filters?: DashboardFilters) => {
    const params = filters ? new URLSearchParams(filters as any).toString() : '';
    const response = await api.get(`/dashboard/stats${params ? `?${params}` : ''}`);
    return response.data;
  }
);

export const generateCustomReport = createAsyncThunk(
  'dashboard/generateReport',
  async (reportConfig: Omit<CustomReport, 'generatedAt' | 'data'>) => {
    const response = await api.post('/dashboard/reports', reportConfig);
    return response.data;
  }
);

export const exportDashboardData = createAsyncThunk(
  'dashboard/exportData',
  async (format: 'json' | 'csv' | 'pdf') => {
    const response = await api.get(`/dashboard/export?format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  }
);

export const getRealTimeUpdates = createAsyncThunk(
  'dashboard/realTimeUpdates',
  async (_, { getState }) => {
    const response = await api.get('/dashboard/realtime');
    return response.data;
  }
);

// Slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setRealTimeEnabled: (state, action) => {
      state.realTimeEnabled = action.payload;
    },
    updateLastUpdate: (state) => {
      state.lastUpdate = new Date().toISOString();
    },
    addCustomReport: (state, action) => {
      state.customReports.push(action.payload);
    },
    clearError: (state) => {
      state.error = null;
    },
    // Real-time update simulation
    simulateRealTimeUpdate: (state) => {
      if (state.stats) {
        state.stats = {
          ...state.stats,
          totalCustomers: state.stats.totalCustomers + Math.floor(Math.random() * 3) - 1,
          totalAppointments: state.stats.totalAppointments + Math.floor(Math.random() * 2),
          totalRevenue: state.stats.totalRevenue + Math.floor(Math.random() * 100),
          pendingTasks: state.stats.pendingTasks + Math.floor(Math.random() * 2) - 1,
        };
        state.lastUpdate = new Date().toISOString();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
        state.lastUpdate = new Date().toISOString();
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch dashboard stats';
      })
      
      // Generate custom report
      .addCase(generateCustomReport.fulfilled, (state, action) => {
        state.customReports.push(action.payload);
      })
      
      // Real-time updates
      .addCase(getRealTimeUpdates.fulfilled, (state, action) => {
        if (state.realTimeEnabled) {
          state.stats = { ...state.stats, ...action.payload };
          state.lastUpdate = new Date().toISOString();
        }
      });
  },
});

export const {
  setRealTimeEnabled,
  updateLastUpdate,
  addCustomReport,
  clearError,
  simulateRealTimeUpdate,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
