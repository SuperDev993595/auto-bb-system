import { createAsyncThunk } from '@reduxjs/toolkit';
import collectionsApi, { 
  CollectionsFilters, 
  CreateCollectionsTaskData, 
  UpdateCollectionsTaskData,
  CommunicationRecordData,
  PaymentPlanUpdateData
} from '../../services/collections';

// Fetch collections tasks
export const fetchCollections = createAsyncThunk(
  'collections/fetchCollections',
  async (filters: CollectionsFilters = {}, { rejectWithValue }) => {
    try {
      const response = await collectionsApi.getCollections(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch collections');
    }
  }
);

// Create collections task
export const createCollectionsTask = createAsyncThunk(
  'collections/createCollectionsTask',
  async (data: CreateCollectionsTaskData, { rejectWithValue }) => {
    try {
      const response = await collectionsApi.createCollectionsTask(data);
      return response.data.collectionsTask;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create collections task');
    }
  }
);

// Update collections task
export const updateCollectionsTask = createAsyncThunk(
  'collections/updateCollectionsTask',
  async ({ id, data }: { id: string; data: UpdateCollectionsTaskData }, { rejectWithValue }) => {
    try {
      const response = await collectionsApi.updateCollectionsTask(id, data);
      return response.data.collectionsTask;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update collections task');
    }
  }
);

// Add communication record
export const addCommunication = createAsyncThunk(
  'collections/addCommunication',
  async ({ id, data }: { id: string; data: CommunicationRecordData }, { rejectWithValue }) => {
    try {
      const response = await collectionsApi.addCommunication(id, data);
      return { id, communication: response.data.communication };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add communication');
    }
  }
);

// Record payment
export const recordPayment = createAsyncThunk(
  'collections/recordPayment',
  async ({ id, data }: { id: string; data: PaymentPlanUpdateData }, { rejectWithValue }) => {
    try {
      const response = await collectionsApi.recordPayment(id, data);
      return { id, paymentData: response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to record payment');
    }
  }
);

// Fetch overdue collections
export const fetchOverdueCollections = createAsyncThunk(
  'collections/fetchOverdueCollections',
  async (_, { rejectWithValue }) => {
    try {
      const response = await collectionsApi.getOverdueCollections();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch overdue collections');
    }
  }
);

// Fetch collections statistics
export const fetchCollectionsStats = createAsyncThunk(
  'collections/fetchCollectionsStats',
  async (filters: { startDate?: string; endDate?: string; assignedTo?: string } = {}, { rejectWithValue }) => {
    try {
      const response = await collectionsApi.getCollectionsStats(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch collections statistics');
    }
  }
);

// Fetch customer collections
export const fetchCustomerCollections = createAsyncThunk(
  'collections/fetchCustomerCollections',
  async (customerId: string, { rejectWithValue }) => {
    try {
      const response = await collectionsApi.getCustomerCollections(customerId);
      return { customerId, ...response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch customer collections');
    }
  }
);

// Fetch collections by risk level
export const fetchCollectionsByRiskLevel = createAsyncThunk(
  'collections/fetchCollectionsByRiskLevel',
  async (level: string, { rejectWithValue }) => {
    try {
      const response = await collectionsApi.getCollectionsByRiskLevel(level);
      return { level, ...response.data };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch collections by risk level');
    }
  }
);
