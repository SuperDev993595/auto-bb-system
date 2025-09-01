import { createAsyncThunk } from '@reduxjs/toolkit';
import { invoiceService } from '../../services/invoices';
import { downloadPDF } from '../../utils/pdfDownload';

export const fetchInvoices = createAsyncThunk(
  'invoices/fetchInvoices',
  async (filters: any = {}, { rejectWithValue }) => {
    try {
      const response = await invoiceService.getInvoices(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch invoices');
    }
  }
);

export const fetchInvoiceStats = createAsyncThunk(
  'invoices/fetchInvoiceStats',
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
      const response = await invoiceService.getPaymentStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment stats');
    }
  }
);

export const fetchInvoiceTemplates = createAsyncThunk(
  'invoices/fetchInvoiceTemplates',
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
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await invoiceService.markAsOverdue();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark invoice as overdue');
    }
  }
);

export const downloadInvoicePDF = createAsyncThunk(
  'invoices/downloadInvoicePDF',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await invoiceService.downloadInvoicePDF(id);
      
      // Download the PDF file
      downloadPDF(response.data, `invoice-${id}.pdf`);
      
      return { success: true, message: 'PDF downloaded successfully' };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to download invoice PDF');
    }
  }
);

export const sendInvoiceEmail = createAsyncThunk(
  'invoices/sendInvoiceEmail',
  async ({ id, emailData }: { id: string; emailData: any }, { rejectWithValue }) => {
    try {
      const response = await invoiceService.sendInvoiceEmail(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send invoice email');
    }
  }
);

export const createInvoice = createAsyncThunk(
  'invoices/createInvoice',
  async (invoiceData: any, { rejectWithValue }) => {
    try {
      const response = await invoiceService.createInvoice(invoiceData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create invoice');
    }
  }
);

export const updateInvoice = createAsyncThunk(
  'invoices/updateInvoice',
  async ({ id, invoiceData }: { id: string; invoiceData: any }, { rejectWithValue }) => {
    try {
      const response = await invoiceService.updateInvoice(id, invoiceData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update invoice');
    }
  }
);

export const deleteInvoice = createAsyncThunk(
  'invoices/deleteInvoice',
  async (id: string, { rejectWithValue }) => {
    try {
      await invoiceService.deleteInvoice(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete invoice');
    }
  }
);

export const sendInvoice = createAsyncThunk(
  'invoices/sendInvoice',
  async ({ id, emailData }: { id: string; emailData: any }, { rejectWithValue }) => {
    try {
      const response = await invoiceService.sendInvoice(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send invoice');
    }
  }
);

export const addPayment = createAsyncThunk(
  'invoices/addPayment',
  async ({ id, paymentData }: { id: string; paymentData: any }, { rejectWithValue }) => {
    try {
      const response = await invoiceService.addPayment(id, paymentData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add payment');
    }
  }
);
