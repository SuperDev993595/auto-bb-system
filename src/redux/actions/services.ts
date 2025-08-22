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
      return response;
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
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch service item');
    }
  }
);

export const createServiceCatalogItem = createAsyncThunk(
  'services/createServiceCatalogItem',
  async (serviceData: any, { rejectWithValue }) => {
    try {
      const response = await serviceManagementService.createServiceCatalogItem(serviceData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create service');
    }
  }
);

export const updateServiceCatalogItem = createAsyncThunk(
  'services/updateServiceCatalogItem',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }) => {
    try {
      const response = await serviceManagementService.updateServiceCatalogItem(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update service');
    }
  }
);

export const deleteServiceCatalogItem = createAsyncThunk(
  'services/deleteServiceCatalogItem',
  async (id: string, { rejectWithValue }) => {
    try {
      await serviceManagementService.deleteServiceCatalogItem(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete service');
    }
  }
);

export const fetchServiceCatalogStats = createAsyncThunk(
  'services/fetchServiceCatalogStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await serviceManagementService.getServiceCatalogStats();
      return response;
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
      return response;
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
      return response;
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
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create work order');
    }
  }
);

export const updateWorkOrder = createAsyncThunk(
  'services/updateWorkOrder',
  async ({ id, data }: { id: string; data: UpdateWorkOrderData }, { rejectWithValue }) => {
    try {
      const response = await serviceManagementService.updateWorkOrder(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update work order');
    }
  }
);

export const deleteWorkOrder = createAsyncThunk(
  'services/deleteWorkOrder',
  async (id: string, { rejectWithValue }) => {
    try {
      await serviceManagementService.deleteWorkOrder(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete work order');
    }
  }
);

export const updateWorkOrderStatus = createAsyncThunk(
  'services/updateWorkOrderStatus',
  async ({ id, status }: { id: string; status: WorkOrder['status'] }, { rejectWithValue }) => {
    try {
      const response = await serviceManagementService.updateWorkOrderStatus(id, status);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update work order status');
    }
  }
);

export const assignTechnician = createAsyncThunk(
  'services/assignTechnician',
  async ({ workOrderId, technicianId }: { workOrderId: string; technicianId: string }, { rejectWithValue }) => {
    try {
      const response = await serviceManagementService.assignTechnician(workOrderId, technicianId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign technician');
    }
  }
);

export const fetchWorkOrderStats = createAsyncThunk(
  'services/fetchWorkOrderStats',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await serviceManagementService.getWorkOrderStats(startDate, endDate);
      return response;
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
      return response;
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
      return response;
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
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create technician');
    }
  }
);

export const updateTechnician = createAsyncThunk(
  'services/updateTechnician',
  async ({ id, data }: { id: string; data: UpdateTechnicianData }, { rejectWithValue }) => {
    try {
      const response = await serviceManagementService.updateTechnician(id, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update technician');
    }
  }
);

export const deleteTechnician = createAsyncThunk(
  'services/deleteTechnician',
  async (id: string, { rejectWithValue }) => {
    try {
      await serviceManagementService.deleteTechnician(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete technician');
    }
  }
);

export const fetchTechnicianStats = createAsyncThunk(
  'services/fetchTechnicianStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await serviceManagementService.getTechnicianStats();
      return response;
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
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch available technicians');
    }
  }
);

// Async thunks for General Services
export const fetchServiceCategories = createAsyncThunk(
  'services/fetchServiceCategories',
  async (_, { rejectWithValue }) => {
    try {
      const response = await serviceManagementService.getServiceCategories();
      return response;
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
      return response;
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
        const payload: any = action.payload as any;
        console.log('fetchServiceCatalog.fulfilled payload:', payload);
        const normalized = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data?.services)
          ? payload.data.services
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.services)
          ? payload.services
          : [];
        console.log('fetchServiceCatalog.fulfilled normalized:', normalized);
        state.catalog = normalized;
      })
      .addCase(fetchServiceCatalog.rejected, (state, action) => {
        state.catalogLoading = false;
        state.catalogError = action.payload as string;
      })
      .addCase(fetchServiceCatalogItem.fulfilled, (state, action) => {
        const payload: any = action.payload as any;
        const service = payload?.data?.service || payload;
        const index = state.catalog.findIndex(item => item._id === service._id);
        if (index !== -1) {
          state.catalog[index] = service;
        } else {
          state.catalog.push(service);
        }
      })
      .addCase(createServiceCatalogItem.fulfilled, (state, action) => {
        const payload: any = action.payload as any;
        const service = payload?.data?.service || payload;
        state.catalog.push(service);
      })
      .addCase(updateServiceCatalogItem.fulfilled, (state, action) => {
        const payload: any = action.payload as any;
        const service = payload?.data?.service || payload;
        const index = state.catalog.findIndex(item => item._id === service._id);
        if (index !== -1) {
          state.catalog[index] = service;
        }
      })
      .addCase(deleteServiceCatalogItem.fulfilled, (state, action) => {
        state.catalog = state.catalog.filter(item => item._id !== action.payload);
      })
      .addCase(fetchServiceCatalogStats.fulfilled, (state, action) => {
        const payload: any = action.payload as any;
        state.catalogStats = payload?.data || payload;
      });

    // Work Orders reducers
    builder
      .addCase(fetchWorkOrders.pending, (state) => {
        state.workOrdersLoading = true;
        state.workOrdersError = null;
      })
      .addCase(fetchWorkOrders.fulfilled, (state, action) => {
        state.workOrdersLoading = false;
        const payload: any = action.payload as any;
        console.log('fetchWorkOrders.fulfilled payload:', payload);
        const normalized = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data?.workOrders)
          ? payload.data.workOrders
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.workOrders)
          ? payload.workOrders
          : [];
        console.log('fetchWorkOrders.fulfilled normalized:', normalized);
        state.workOrders = normalized;
      })
      .addCase(fetchWorkOrders.rejected, (state, action) => {
        state.workOrdersLoading = false;
        state.workOrdersError = action.payload as string;
      })
      .addCase(fetchWorkOrder.fulfilled, (state, action) => {
        const payload: any = action.payload as any;
        const workOrder = payload?.data?.workOrder || payload;
        const index = state.workOrders.findIndex(order => order._id === workOrder._id);
        if (index !== -1) {
          state.workOrders[index] = workOrder;
        } else {
          state.workOrders.push(workOrder);
        }
      })
      .addCase(createWorkOrder.fulfilled, (state, action) => {
        const payload: any = action.payload as any;
        const workOrder = payload?.data?.workOrder || payload;
        state.workOrders.push(workOrder);
      })
      .addCase(updateWorkOrder.fulfilled, (state, action) => {
        const payload: any = action.payload as any;
        const workOrder = payload?.data?.workOrder || payload;
        const index = state.workOrders.findIndex(order => order._id === workOrder._id);
        if (index !== -1) {
          state.workOrders[index] = workOrder;
        }
      })
      .addCase(deleteWorkOrder.fulfilled, (state, action) => {
        state.workOrders = state.workOrders.filter(order => order._id !== action.payload);
      })
      .addCase(updateWorkOrderStatus.fulfilled, (state, action) => {
        const payload: any = action.payload as any;
        const workOrder = payload?.data?.workOrder || payload;
        const index = state.workOrders.findIndex(order => order._id === workOrder._id);
        if (index !== -1) {
          state.workOrders[index] = workOrder;
        }
      })
      .addCase(assignTechnician.fulfilled, (state, action) => {
        const payload: any = action.payload as any;
        const workOrder = payload?.data?.workOrder || payload;
        const index = state.workOrders.findIndex(order => order._id === workOrder._id);
        if (index !== -1) {
          state.workOrders[index] = workOrder;
        }
      })
      .addCase(fetchWorkOrderStats.fulfilled, (state, action) => {
        const payload: any = action.payload as any;
        state.workOrderStats = payload?.data || payload;
      });

    // Technicians reducers
    builder
      .addCase(fetchTechnicians.pending, (state) => {
        state.techniciansLoading = true;
        state.techniciansError = null;
      })
      .addCase(fetchTechnicians.fulfilled, (state, action) => {
        state.techniciansLoading = false;
        const payload: any = action.payload as any;
        console.log('fetchTechnicians.fulfilled payload:', payload);
        const normalized = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data?.technicians)
          ? payload.data.technicians
          : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.technicians)
          ? payload.technicians
          : [];
        console.log('fetchTechnicians.fulfilled normalized:', normalized);
        state.technicians = normalized;
      })
      .addCase(fetchTechnicians.rejected, (state, action) => {
        state.techniciansLoading = false;
        state.techniciansError = action.payload as string;
      })
      .addCase(fetchTechnician.fulfilled, (state, action) => {
        const payload: any = action.payload as any;
        const technician = payload?.data?.technician || payload;
        const index = state.technicians.findIndex(tech => tech._id === technician._id);
        if (index !== -1) {
          state.technicians[index] = technician;
        } else {
          state.technicians.push(technician);
        }
      })
      .addCase(createTechnician.fulfilled, (state, action) => {
        const payload: any = action.payload as any;
        const technician = payload?.data?.technician || payload;
        state.technicians.push(technician);
      })
      .addCase(updateTechnician.fulfilled, (state, action) => {
        const payload: any = action.payload as any;
        const technician = payload?.data?.technician || payload;
        const index = state.technicians.findIndex(tech => tech._id === technician._id);
        if (index !== -1) {
          state.technicians[index] = technician;
        }
      })
      .addCase(deleteTechnician.fulfilled, (state, action) => {
        state.technicians = state.technicians.filter(tech => tech._id !== action.payload);
      })
      .addCase(fetchTechnicianStats.fulfilled, (state, action) => {
        const payload: any = action.payload as any;
        state.technicianStats = payload?.data || payload;
      })
      .addCase(fetchAvailableTechnicians.fulfilled, (state, action) => {
        // This could be used to update a separate availableTechnicians state
        // For now, we'll just log it
        const payload: any = action.payload as any;
        const technicians = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
        console.log('Available technicians:', technicians);
      });

    // General reducers
    builder
      .addCase(fetchServiceCategories.fulfilled, (state, action) => {
        const payload: any = action.payload as any;
        state.categories = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
      })
      .addCase(fetchSpecializations.fulfilled, (state, action) => {
        const payload: any = action.payload as any;
        state.specializations = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
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
