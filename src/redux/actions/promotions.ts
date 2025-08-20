import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { promotionService, Promotion, CreatePromotionData, UpdatePromotionData, PromotionFilters } from '../../services/promotions';

// Async thunks
export const fetchPromotions = createAsyncThunk(
  'promotions/fetchPromotions',
  async (filters: PromotionFilters = {}, { rejectWithValue }) => {
    try {
      const response = await promotionService.getPromotions(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch promotions');
    }
  }
);

export const fetchPromotion = createAsyncThunk(
  'promotions/fetchPromotion',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await promotionService.getPromotion(id);
      return response.data.promotion;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch promotion');
    }
  }
);

export const createPromotion = createAsyncThunk(
  'promotions/createPromotion',
  async (promotionData: CreatePromotionData, { rejectWithValue }) => {
    try {
      const response = await promotionService.createPromotion(promotionData);
      return response.data.promotion;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create promotion');
    }
  }
);

export const updatePromotion = createAsyncThunk(
  'promotions/updatePromotion',
  async ({ id, promotionData }: { id: string; promotionData: UpdatePromotionData }, { rejectWithValue }) => {
    try {
      const response = await promotionService.updatePromotion(id, promotionData);
      return response.data.promotion;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update promotion');
    }
  }
);

export const deletePromotion = createAsyncThunk(
  'promotions/deletePromotion',
  async (id: string, { rejectWithValue }) => {
    try {
      await promotionService.deletePromotion(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete promotion');
    }
  }
);

export const updatePromotionStatus = createAsyncThunk(
  'promotions/updatePromotionStatus',
  async ({ id, status }: { id: string; status: Promotion['status'] }, { rejectWithValue }) => {
    try {
      const response = await promotionService.updatePromotionStatus(id, status);
      return response.data.promotion;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update promotion status');
    }
  }
);

export const fetchPromotionStats = createAsyncThunk(
  'promotions/fetchPromotionStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await promotionService.getPromotionStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch promotion stats');
    }
  }
);

export const fetchActivePromotions = createAsyncThunk(
  'promotions/fetchActivePromotions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await promotionService.getActivePromotions();
      return response.data.activePromotions;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch active promotions');
    }
  }
);

// Initial state
interface PromotionsState {
  list: Promotion[];
  current: Promotion | null;
  active: Promotion[];
  stats: any;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPromotions: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null;
}

const initialState: PromotionsState = {
  list: [],
  current: null,
  active: [],
  stats: null,
  loading: false,
  error: null,
  pagination: null
};

// Slice
const promotionsSlice = createSlice({
  name: 'promotions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrent: (state) => {
      state.current = null;
    },
    clearActive: (state) => {
      state.active = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch promotions
      .addCase(fetchPromotions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPromotions.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.promotions;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchPromotions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch single promotion
      .addCase(fetchPromotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPromotion.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload;
      })
      .addCase(fetchPromotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create promotion
      .addCase(createPromotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPromotion.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload);
      })
      .addCase(createPromotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update promotion
      .addCase(updatePromotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePromotion.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.current?._id === action.payload._id) {
          state.current = action.payload;
        }
      })
      .addCase(updatePromotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete promotion
      .addCase(deletePromotion.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePromotion.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter(p => p._id !== action.payload);
        if (state.current?._id === action.payload) {
          state.current = null;
        }
      })
      .addCase(deletePromotion.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update promotion status
      .addCase(updatePromotionStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePromotionStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.current?._id === action.payload._id) {
          state.current = action.payload;
        }
      })
      .addCase(updatePromotionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch promotion stats
      .addCase(fetchPromotionStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPromotionStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchPromotionStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch active promotions
      .addCase(fetchActivePromotions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivePromotions.fulfilled, (state, action) => {
        state.loading = false;
        state.active = action.payload;
      })
      .addCase(fetchActivePromotions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError, clearCurrent, clearActive } = promotionsSlice.actions;
export default promotionsSlice.reducer;
