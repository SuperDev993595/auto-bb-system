import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { marketingService, MarketingCampaign, CreateCampaignData, MarketingStats } from '../../services/marketing';

// Async thunks
export const fetchCampaigns = createAsyncThunk(
  'marketing/fetchCampaigns',
  async (filters: any = {}, { rejectWithValue }) => {
    try {
      const response = await marketingService.getCampaigns(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch campaigns');
    }
  }
);

export const createCampaign = createAsyncThunk(
  'marketing/createCampaign',
  async (campaignData: CreateCampaignData, { rejectWithValue }) => {
    try {
      const response = await marketingService.createCampaign(campaignData);
      return response.data.campaign;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create campaign');
    }
  }
);

export const deleteCampaign = createAsyncThunk(
  'marketing/deleteCampaign',
  async (id: string, { rejectWithValue }) => {
    try {
      await marketingService.deleteCampaign(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete campaign');
    }
  }
);

export const updateCampaignStatus = createAsyncThunk(
  'marketing/updateCampaignStatus',
  async ({ id, status }: { id: string; status: MarketingCampaign['status'] }, { rejectWithValue }) => {
    try {
      const response = await marketingService.updateCampaignStatus(id, status);
      return response.data.campaign;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update campaign status');
    }
  }
);

export const fetchCampaignStats = createAsyncThunk(
  'marketing/fetchCampaignStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await marketingService.getCampaignStats();
      return response.data.overview;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch campaign stats');
    }
  }
);

// Initial state
interface MarketingState {
  campaigns: MarketingCampaign[];
  stats: MarketingStats | null;
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCampaigns: number;
  } | null;
}

const initialState: MarketingState = {
  campaigns: [],
  stats: null,
  loading: false,
  error: null,
  pagination: null
};

// Slice
const marketingSlice = createSlice({
  name: 'marketing',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch campaigns
      .addCase(fetchCampaigns.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaigns.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns = action.payload.campaigns;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCampaigns.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create campaign
      .addCase(createCampaign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCampaign.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns.unshift(action.payload);
      })
      .addCase(createCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Delete campaign
      .addCase(deleteCampaign.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCampaign.fulfilled, (state, action) => {
        state.loading = false;
        state.campaigns = state.campaigns.filter(c => c._id !== action.payload);
      })
      .addCase(deleteCampaign.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Update campaign status
      .addCase(updateCampaignStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCampaignStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.campaigns.findIndex(c => c._id === action.payload._id);
        if (index !== -1) {
          state.campaigns[index] = action.payload;
        }
      })
      .addCase(updateCampaignStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch campaign stats
      .addCase(fetchCampaignStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCampaignStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchCampaignStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError } = marketingSlice.actions;
export default marketingSlice.reducer;
