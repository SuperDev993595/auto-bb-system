import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';
import { vehicleService, Vehicle, VehicleFilters } from '../../services/vehicles';

// Async thunks for Vehicles
export const fetchVehicles = createAsyncThunk(
  'vehicles/fetchVehicles',
  async (filters: VehicleFilters = {}, { rejectWithValue }) => {
    try {
      const response = await vehicleService.getVehicles(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch vehicles');
    }
  }
);

export const fetchVehicle = createAsyncThunk(
  'vehicles/fetchVehicle',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await vehicleService.getVehicle(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch vehicle');
    }
  }
);

export const fetchCustomerVehicles = createAsyncThunk(
  'vehicles/fetchCustomerVehicles',
  async (customerId: string, { rejectWithValue }) => {
    try {
      const response = await vehicleService.getCustomerVehicles(customerId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer vehicles');
    }
  }
);

// Vehicles slice
interface VehiclesState {
  list: Vehicle[];
  selectedVehicle: Vehicle | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalVehicles: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null;
}

const initialState: VehiclesState = {
  list: [],
  selectedVehicle: null,
  loading: false,
  error: null,
  pagination: null
};

const vehiclesSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    clearVehicles: (state) => {
      state.list = [];
      state.selectedVehicle = null;
      state.pagination = null;
    },
    setSelectedVehicle: (state, action: PayloadAction<Vehicle | null>) => {
      state.selectedVehicle = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        const payload: any = action.payload as any;
        const vehicles = payload?.data?.vehicles || payload?.vehicles || [];
        state.list = vehicles;
        state.pagination = payload?.data?.pagination || payload?.pagination || null;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchVehicle.fulfilled, (state, action) => {
        const payload: any = action.payload as any;
        const vehicle = payload?.data?.vehicle || payload?.vehicle;
        if (vehicle) {
          const index = state.list.findIndex(v => v._id === vehicle._id);
          if (index !== -1) {
            state.list[index] = vehicle;
          } else {
            state.list.push(vehicle);
          }
        }
      })
      .addCase(fetchCustomerVehicles.fulfilled, (state, action) => {
        const payload: any = action.payload as any;
        const vehicles = payload?.data?.vehicles || payload?.vehicles || [];
        // Merge with existing vehicles, avoiding duplicates
        vehicles.forEach(vehicle => {
          const existingIndex = state.list.findIndex(v => v._id === vehicle._id);
          if (existingIndex !== -1) {
            state.list[existingIndex] = vehicle;
          } else {
            state.list.push(vehicle);
          }
        });
      });
  }
});

export const { clearVehicles, setSelectedVehicle } = vehiclesSlice.actions;
export default vehiclesSlice.reducer;
