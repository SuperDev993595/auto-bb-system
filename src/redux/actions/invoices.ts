import { createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';
import { invoiceService } from '../../services/invoices';
import { Invoice, InvoiceItem } from '../../utils/CustomerTypes';

// Async thunks for Invoices
export const fetchInvoices = createAsyncThunk(
  'invoices/fetchInvoices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await invoiceService.getInvoices();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch invoices');
    }
  }
);

export const createInvoice = createAsyncThunk(
  'invoices/createInvoice',
  async (invoiceData: any, { rejectWithValue }) => {
    try {
      const response = await invoiceService.createInvoice(invoiceData);
      toast.success('Invoice created successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create invoice');
      return rejectWithValue(error.response?.data?.message || 'Failed to create invoice');
    }
  }
);

export const updateInvoice = createAsyncThunk(
  'invoices/updateInvoice',
  async ({ id, invoiceData }: { id: string; invoiceData: any }, { rejectWithValue }) => {
    try {
      const response = await invoiceService.updateInvoice(id, invoiceData);
      toast.success('Invoice updated successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update invoice');
      return rejectWithValue(error.response?.data?.message || 'Failed to update invoice');
    }
  }
);

export const deleteInvoice = createAsyncThunk(
  'invoices/deleteInvoice',
  async (id: string, { rejectWithValue }) => {
    try {
      await invoiceService.deleteInvoice(id);
      toast.success('Invoice deleted successfully');
      return id;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete invoice');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete invoice');
    }
  }
);

export const sendInvoice = createAsyncThunk(
  'invoices/sendInvoice',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await invoiceService.sendInvoice(id);
      toast.success('Invoice sent successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send invoice');
      return rejectWithValue(error.response?.data?.message || 'Failed to send invoice');
    }
  }
);

export const addPayment = createAsyncThunk(
  'invoices/addPayment',
  async ({ invoiceId, paymentData }: { invoiceId: string; paymentData: any }, { rejectWithValue }) => {
    try {
      const response = await invoiceService.addPayment(invoiceId, paymentData);
      toast.success('Payment added successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add payment');
      return rejectWithValue(error.response?.data?.message || 'Failed to add payment');
    }
  }
);

export const fetchInvoiceStats = createAsyncThunk(
  'invoices/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await invoiceService.getInvoiceStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch invoice stats');
    }
  }
);

export const fetchPaymentStats = createAsyncThunk(
  'invoices/fetchPaymentStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await invoiceService.getPaymentAnalytics();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment stats');
    }
  }
);



// Async thunks for Invoice Templates
export const fetchInvoiceTemplates = createAsyncThunk(
  'invoices/fetchTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await invoiceService.getInvoiceTemplates();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch invoice templates');
    }
  }
);

export const markAsOverdue = createAsyncThunk(
  'invoices/markAsOverdue',
  async (_, { rejectWithValue }) => {
    try {
      const response = await invoiceService.markAsOverdue();
      toast.success('Overdue invoices updated successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update overdue invoices');
      return rejectWithValue(error.response?.data?.message || 'Failed to update overdue invoices');
    }
  }
);

export const createInvoiceTemplate = createAsyncThunk(
  'invoices/createTemplate',
  async (templateData: any, { rejectWithValue }) => {
    try {
      const response = await invoiceService.createInvoiceTemplate(templateData);
      toast.success('Invoice template created successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create invoice template');
      return rejectWithValue(error.response?.data?.message || 'Failed to create invoice template');
    }
  }
);

export const updateInvoiceTemplate = createAsyncThunk(
  'invoices/updateTemplate',
  async ({ id, templateData }: { id: string; templateData: any }, { rejectWithValue }) => {
    try {
      const response = await invoiceService.updateInvoiceTemplate(id, templateData);
      toast.success('Invoice template updated successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update invoice template');
      return rejectWithValue(error.response?.data?.message || 'Failed to update invoice template');
    }
  }
);

export const deleteInvoiceTemplate = createAsyncThunk(
  'invoices/deleteTemplate',
  async (id: string, { rejectWithValue }) => {
    try {
      await invoiceService.deleteInvoiceTemplate(id);
      toast.success('Invoice template deleted successfully');
      return id;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete invoice template');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete invoice template');
    }
  }
);
