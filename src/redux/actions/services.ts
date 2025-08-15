import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';
import { 
  serviceManagementService, 
  ServiceCatalogItem, 
  WorkOrder, 
  Technician,
  CreateServiceCatalogData, 
  UpdateServiceCatalogData,
  CreateWorkOrderData,
  UpdateWorkOrderData,
  CreateTechnicianData,
  UpdateTechnicianData,
  ServiceCatalogFilters,
  WorkOrderFilters,
  TechnicianFilters,
  ServiceStats,
  WorkOrderStats,
  TechnicianStats
} from '../../services/services';

// Async thunks for Service Catalog
export const fetchServiceCatalog = createAsyncThunk(
  'services/fetchServiceCatalog',
  async (filters: ServiceCatalogFilters = {}, { rejectWithValue }) => {
    try {
      const response = await serviceManagementService.getServiceCatalog(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch service catalog');
    }
  }
);

export const fetchServiceCatalogItem = createAsyncThunk(
  'services/fetchServiceCatalogItem',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await serviceManagementService.getServiceCatalogItem(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch service item');
    }
  }
);

export const createServiceCatalogItem = createAsyncThunk(
  'services/createServiceCatalogItem',
  async (data: CreateServiceCatalogData, { rejectWithValue }) => {
    try {
      const response = await serviceManagementService.createServiceCatalogItem(data);
      toast.success('Service created successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create service');
      return rejectWithValue(error.response?.data?.message || 'Failed to create service');
    }
  }
);

export const updateServiceCatalogItem = createAsyncThunk(
  'services/updateServiceCatalogItem',
  async ({ id, data }: { id: string; data: UpdateServiceCatalogData }, { rejectWithValue }) => {
    try {
      const response = await serviceManagementService.updateServiceCatalogItem(id, data);
      toast.success('Service updated successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update service');
      return rejectWithValue(error.response?.data?.message || 'Failed to update service');
    }
  }
);

export const deleteServiceCatalogItem = createAsyncThunk(
  'services/deleteServiceCatalogItem',
  async (id: string, { rejectWithValue }) => {
    try {
      await serviceManagementService.deleteServiceCatalogItem(id);
      toast.success('Service deleted successfully');
      return id;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete service');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete service');
    }
  }
);

export const fetchServiceCatalogStats = createAsyncThunk(
  'services/fetchServiceCatalogStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await serviceManagementService.getServiceCatalogStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch service stats');
    }
  }
);

// Async thunks for Work Orders
export const fetchWorkOrders = createAsyncThunk(
  'services/fetchWorkOrders',
  async (filters: WorkOrderFilters = {}, { rejectWithValue }) => {
    try {
      const response = await serviceManagementService.getWorkOrders(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch work orders');
    }
  }
);

export const fetchWorkOrder = createAsyncThunk(
  'services/fetchWorkOrder',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await serviceManagementService.getWorkOrder(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch work order');
    }
  }
);

export const createWorkOrder = createAsyncThunk(
  'services/createWorkOrder',
  async (data: CreateWorkOrderData, { rejectWithValue }) => {
    try {
      const response = await serviceManagementService.createWorkOrder(data);
      toast.success('Work order created successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create work order');
      return rejectWithValue(error.response?.data?.message || 'Failed to create work order');
    }
  }
);

export const updateWorkOrder = createAsyncThunk(
  'services/updateWorkOrder',
  async ({ id, data }: { id: string; data: UpdateWorkOrderData }, { rejectWithValue }) => {
    try {
      const response = await serviceManagementService.updateWorkOrder(id, data);
      toast.success('Work order updated successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update work order');
      return rejectWithValue(error.response?.data?.message || 'Failed to update work order');
    }
  }
);

export const deleteWorkOrder = createAsyncThunk(
  'services/deleteWorkOrder',
  async (id: string, { rejectWithValue }) => {
    try {
      await serviceManagementService.deleteWorkOrder(id);
      toast.success('Work order deleted successfully');
      return id;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete work order');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete work order');
    }
  }
);

export const updateWorkOrderStatus = createAsyncThunk(
  'services/updateWorkOrderStatus',
  async ({ id, status }: { id: string; status: WorkOrder['status'] }, { rejectWithValue }) => {
    try {
      const response = await serviceManagementService.updateWorkOrderStatus(id, status);
      toast.success('Work order status updated successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update work order status');
      return rejectWithValue(error.response?.data?.message || 'Failed to update work order status');
    }
  }
);

export const assignTechnician = createAsyncThunk(
  'services/assignTechnician',
  async ({ workOrderId, technicianId }: { workOrderId: string; technicianId: string }, { rejectWithValue }) => {
    try {
      const response = await serviceManagementService.assignTechnician(workOrderId, technicianId);
      toast.success('Technician assigned successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to assign technician');
      return rejectWithValue(error.response?.data?.message || 'Failed to assign technician');
    }
  }
);

export const fetchWorkOrderStats = createAsyncThunk(
  'services/fetchWorkOrderStats',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await serviceManagementService.getWorkOrderStats(startDate, endDate);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch work order stats');
    }
  }
);

// Async thunks for Technicians
export const fetchTechnicians = createAsyncThunk(
  'services/fetchTechnicians',
  async (filters: TechnicianFilters = {}, { rejectWithValue }) => {
    try {
      const response = await serviceManagementService.getTechnicians(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch technicians');
    }
  }
);

export const fetchTechnician = createAsyncThunk(
  'services/fetchTechnician',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await serviceManagementService.getTechnician(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch technician');
    }
  }
);

export const createTechnician = createAsyncThunk(
  'services/createTechnician',
  async (data: CreateTechnicianData, { rejectWithValue }) => {
    try {
      const response = await serviceManagementService.createTechnician(data);
      toast.success('Technician created successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create technician');
      return rejectWithValue(error.response?.data?.message || 'Failed to create technician');
    }
  }
);

export const updateTechnician = createAsyncThunk(
  'services/updateTechnician',
  async ({ id, data }: { id: string; data: UpdateTechnicianData }, { rejectWithValue }) => {
    try {
      const response = await serviceManagementService.updateTechnician(id, data);
      toast.success('Technician updated successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update technician');
      return rejectWithValue(error.response?.data?.message || 'Failed to update technician');
    }
  }
);

export const deleteTechnician = createAsyncThunk(
  'services/deleteTechnician',
  async (id: string, { rejectWithValue }) => {
    try {
      await serviceManagementService.deleteTechnician(id);
      toast.success('Technician deleted successfully');
      return id;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete technician');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete technician');
    }
  }
);

export const fetchTechnicianStats = createAsyncThunk(
  'services/fetchTechnicianStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await serviceManagementService.getTechnicianStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch technician stats');
    }
  }
);

export const fetchAvailableTechnicians = createAsyncThunk(
  'services/fetchAvailableTechnicians',
  async ({ date, timeSlot }: { date: string; timeSlot?: string }, { rejectWithValue }) => {
    try {
      const response = await serviceManagementService.getAvailableTechnicians(date, timeSlot);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch available technicians');
    }
  }
);

// General service methods
export const fetchServiceCategories = createAsyncThunk(
  'services/fetchServiceCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await serviceManagementService.getServiceCategories();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch service categories');
    }
  }
);

export const fetchSpecializations = createAsyncThunk(
  'services/fetchSpecializations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await serviceManagementService.getSpecializations();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch specializations');
    }
  }
);

// Services slice
interface ServicesState {
  // Service Catalog
  catalog: ServiceCatalogItem[];
  catalogStats: ServiceStats | null;
  catalogLoading: boolean;
  catalogError: string | null;
  
  // Work Orders
  workOrders: WorkOrder[];
  workOrderStats: WorkOrderStats | null;
  workOrdersLoading: boolean;
  workOrdersError: string | null;
  
  // Technicians
  technicians: Technician[];
  technicianStats: TechnicianStats | null;
  techniciansLoading: boolean;
  techniciansError: string | null;
  
  // General
  categories: string[];
  specializations: string[];
  generalLoading: boolean;
  generalError: string | null;
}

const initialState: ServicesState = {
  catalog: [],
  catalogStats: null,
  catalogLoading: false,
  catalogError: null,
  
  workOrders: [],
  workOrderStats: null,
  workOrdersLoading: false,
  workOrdersError: null,
  
  technicians: [],
  technicianStats: null,
  techniciansLoading: false,
  techniciansError: null,
  
  categories: [],
  specializations: [],
  generalLoading: false,
  generalError: null,
};

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    clearServicesError: (state) => {
      state.catalogError = null;
      state.workOrdersError = null;
      state.techniciansError = null;
      state.generalError = null;
    },
    clearServiceCatalog: (state) => {
      state.catalog = [];
      state.catalogStats = null;
    },
    clearWorkOrders: (state) => {
      state.workOrders = [];
      state.workOrderStats = null;
    },
    clearTechnicians: (state) => {
      state.technicians = [];
      state.technicianStats = null;
    },
  },
  extraReducers: (builder) => {
    // Service Catalog reducers
    builder
      .addCase(fetchServiceCatalog.pending, (state) => {
        state.catalogLoading = true;
        state.catalogError = null;
      })
      .addCase(fetchServiceCatalog.fulfilled, (state, action) => {
        state.catalogLoading = false;
        state.catalog = action.payload.data.services;
      })
      .addCase(fetchServiceCatalog.rejected, (state, action) => {
        state.catalogLoading = false;
        state.catalogError = action.payload as string;
      })
      .addCase(fetchServiceCatalogItem.fulfilled, (state, action) => {
        const index = state.catalog.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.catalog[index] = action.payload;
        } else {
          state.catalog.push(action.payload);
        }
      })
      .addCase(createServiceCatalogItem.fulfilled, (state, action) => {
        state.catalog.push(action.payload);
      })
      .addCase(updateServiceCatalogItem.fulfilled, (state, action) => {
        const index = state.catalog.findIndex(item => item._id === action.payload._id);
        if (index !== -1) {
          state.catalog[index] = action.payload;
        }
      })
      .addCase(deleteServiceCatalogItem.fulfilled, (state, action) => {
        state.catalog = state.catalog.filter(item => item._id !== action.payload);
      })
      .addCase(fetchServiceCatalogStats.fulfilled, (state, action) => {
        state.catalogStats = action.payload;
      });

    // Work Orders reducers
    builder
      .addCase(fetchWorkOrders.pending, (state) => {
        state.workOrdersLoading = true;
        state.workOrdersError = null;
      })
      .addCase(fetchWorkOrders.fulfilled, (state, action) => {
        state.workOrdersLoading = false;
        state.workOrders = action.payload.data.workOrders;
      })
      .addCase(fetchWorkOrders.rejected, (state, action) => {
        state.workOrdersLoading = false;
        state.workOrdersError = action.payload as string;
      })
      .addCase(fetchWorkOrder.fulfilled, (state, action) => {
        const index = state.workOrders.findIndex(order => order._id === action.payload._id);
        if (index !== -1) {
          state.workOrders[index] = action.payload;
        } else {
          state.workOrders.push(action.payload);
        }
      })
      .addCase(createWorkOrder.fulfilled, (state, action) => {
        state.workOrders.push(action.payload);
      })
      .addCase(updateWorkOrder.fulfilled, (state, action) => {
        const index = state.workOrders.findIndex(order => order._id === action.payload._id);
        if (index !== -1) {
          state.workOrders[index] = action.payload;
        }
      })
      .addCase(deleteWorkOrder.fulfilled, (state, action) => {
        state.workOrders = state.workOrders.filter(order => order._id !== action.payload);
      })
      .addCase(updateWorkOrderStatus.fulfilled, (state, action) => {
        const index = state.workOrders.findIndex(order => order._id === action.payload._id);
        if (index !== -1) {
          state.workOrders[index] = action.payload;
        }
      })
      .addCase(assignTechnician.fulfilled, (state, action) => {
        const index = state.workOrders.findIndex(order => order._id === action.payload._id);
        if (index !== -1) {
          state.workOrders[index] = action.payload;
        }
      })
      .addCase(fetchWorkOrderStats.fulfilled, (state, action) => {
        state.workOrderStats = action.payload;
      });

    // Technicians reducers
    builder
      .addCase(fetchTechnicians.pending, (state) => {
        state.techniciansLoading = true;
        state.techniciansError = null;
      })
      .addCase(fetchTechnicians.fulfilled, (state, action) => {
        state.techniciansLoading = false;
        state.technicians = action.payload.data.technicians;
      })
      .addCase(fetchTechnicians.rejected, (state, action) => {
        state.techniciansLoading = false;
        state.techniciansError = action.payload as string;
      })
      .addCase(fetchTechnician.fulfilled, (state, action) => {
        const index = state.technicians.findIndex(tech => tech._id === action.payload._id);
        if (index !== -1) {
          state.technicians[index] = action.payload;
        } else {
          state.technicians.push(action.payload);
        }
      })
      .addCase(createTechnician.fulfilled, (state, action) => {
        state.technicians.push(action.payload);
      })
      .addCase(updateTechnician.fulfilled, (state, action) => {
        const index = state.technicians.findIndex(tech => tech._id === action.payload._id);
        if (index !== -1) {
          state.technicians[index] = action.payload;
        }
      })
      .addCase(deleteTechnician.fulfilled, (state, action) => {
        state.technicians = state.technicians.filter(tech => tech._id !== action.payload);
      })
      .addCase(fetchTechnicianStats.fulfilled, (state, action) => {
        state.technicianStats = action.payload;
      });

    // General reducers
    builder
      .addCase(fetchServiceCategories.fulfilled, (state, action) => {
        state.categories = action.payload.data;
      })
      .addCase(fetchSpecializations.fulfilled, (state, action) => {
        state.specializations = action.payload.data;
      });
  },
});

export const {
  clearServicesError,
  clearServiceCatalog,
  clearWorkOrders,
  clearTechnicians,
} = servicesSlice.actions;

export default servicesSlice.reducer;
