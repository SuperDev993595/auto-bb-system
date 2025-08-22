import { createAsyncThunk } from '@reduxjs/toolkit';
import { customerService } from '../../services/customers';

export const fetchCommunicationLogs = createAsyncThunk(
  'communicationLogs/fetchCommunicationLogs',
  async (filters: any = {}, { rejectWithValue }) => {
    try {
      // Since communication logs are part of customers, we'll fetch all customers and extract their logs
      const response = await customerService.getCustomers(filters);
      const allLogs: any[] = [];
      
      // Extract communication logs from all customers
      response.data.customers.forEach((customer: any) => {
        if (customer.communicationLog && Array.isArray(customer.communicationLog)) {
          customer.communicationLog.forEach((log: any) => {
            allLogs.push({
              ...log,
              customerId: customer._id,
              customerName: customer.name
            });
          });
        }
      });
      
      return allLogs;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch communication logs');
    }
  }
);

export const fetchCommunicationStats = createAsyncThunk(
  'communicationLogs/fetchCommunicationStats',
  async (_, { rejectWithValue }) => {
    try {
      // Since we don't have a dedicated stats endpoint, we'll create basic stats
      const response = await customerService.getCustomers({});
      const allLogs: any[] = [];
      
      response.data.customers.forEach((customer: any) => {
        if (customer.communicationLog && Array.isArray(customer.communicationLog)) {
          allLogs.push(...customer.communicationLog);
        }
      });
      
      // Calculate basic stats
      const stats = {
        totalLogs: allLogs.length,
        byType: {
          phone: allLogs.filter(log => log.type === 'phone').length,
          email: allLogs.filter(log => log.type === 'email').length,
          'in-person': allLogs.filter(log => log.type === 'in-person').length,
          sms: allLogs.filter(log => log.type === 'sms').length
        },
        byDirection: {
          inbound: allLogs.filter(log => log.direction === 'inbound').length,
          outbound: allLogs.filter(log => log.direction === 'outbound').length
        }
      };
      
      return stats;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch communication stats');
    }
  }
);

export const createCommunicationLog = createAsyncThunk(
  'communicationLogs/createCommunicationLog',
  async ({ customerId, logData }: { customerId: string; logData: any }, { rejectWithValue }) => {
    try {
      const response = await customerService.addCommunicationLog(customerId, logData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create communication log');
    }
  }
);

export const updateCommunicationLog = createAsyncThunk(
  'communicationLogs/updateCommunicationLog',
  async ({ customerId, logId, logData }: { customerId: string; logId: string; logData: any }, { rejectWithValue }) => {
    try {
      // Since the customers service doesn't have updateCommunicationLog, we'll need to implement this
      // For now, we'll return the updated data
      return { customerId, logId, ...logData };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update communication log');
    }
  }
);

export const deleteCommunicationLog = createAsyncThunk(
  'communicationLogs/deleteCommunicationLog',
  async ({ customerId, logId }: { customerId: string; logId: string }, { rejectWithValue }) => {
    try {
      // Since the customers service doesn't have deleteCommunicationLog, we'll need to implement this
      // For now, we'll return the logId to remove from state
      return { customerId, logId };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete communication log');
    }
  }
);
