import { createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';
import {
  getSalesRecords,
  getSalesRecord,
  createSalesRecord,
  updateSalesRecord,
  deleteSalesRecord,
  getCustomerSalesRecords,
  SalesRecord,
  CreateSalesRecordData,
  UpdateSalesRecordData
} from '../../services/salesRecords';

// Get all sales records
export const fetchSalesRecords = createAsyncThunk(
  'salesRecords/fetchSalesRecords',
  async (params?: {
    page?: number;
    limit?: number;
    customer?: string;
    status?: string;
    search?: string;
  }) => {
    try {
      const response = await getSalesRecords(params);
      return response.data;
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch sales records');
      throw error;
    }
  }
);

// Get single sales record
export const fetchSalesRecord = createAsyncThunk(
  'salesRecords/fetchSalesRecord',
  async (id: string) => {
    try {
      const response = await getSalesRecord(id);
      return response.data.salesRecord;
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch sales record');
      throw error;
    }
  }
);

// Create sales record
export const createSalesRecordAction = createAsyncThunk(
  'salesRecords/createSalesRecord',
  async (data: CreateSalesRecordData) => {
    try {
      const response = await createSalesRecord(data);
      toast.success('Sales record created successfully');
      return response.data.salesRecord;
    } catch (error: any) {
      toast.error(error.message || 'Failed to create sales record');
      throw error;
    }
  }
);

// Update sales record
export const updateSalesRecordAction = createAsyncThunk(
  'salesRecords/updateSalesRecord',
  async ({ id, data }: { id: string; data: UpdateSalesRecordData }) => {
    try {
      const response = await updateSalesRecord(id, data);
      toast.success('Sales record updated successfully');
      return response.data.salesRecord;
    } catch (error: any) {
      toast.error(error.message || 'Failed to update sales record');
      throw error;
    }
  }
);

// Delete sales record
export const deleteSalesRecordAction = createAsyncThunk(
  'salesRecords/deleteSalesRecord',
  async (id: string) => {
    try {
      await deleteSalesRecord(id);
      toast.success('Sales record deleted successfully');
      return id;
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete sales record');
      throw error;
    }
  }
);

// Get customer sales records
export const fetchCustomerSalesRecords = createAsyncThunk(
  'salesRecords/fetchCustomerSalesRecords',
  async ({ customerId, params }: { customerId: string; params?: { page?: number; limit?: number } }) => {
    try {
      const response = await getCustomerSalesRecords(customerId, params);
      return response.data;
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch customer sales records');
      throw error;
    }
  }
);
