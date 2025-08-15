import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';
import {
  invoiceService,
  Invoice,
  InvoiceItem,
  Payment,
  InvoiceStats,
  PaymentStats
} from '../../services/invoices';

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
  async (invoiceData: Partial<Invoice>, { rejectWithValue }) => {
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
  async ({ id, invoiceData }: { id: string; invoiceData: Partial<Invoice> }, { rejectWithValue }) => {
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
  async ({ id, emailData }: { id: string; emailData: any }, { rejectWithValue }) => {
    try {
      const response = await invoiceService.sendInvoice(id, emailData);
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
  async ({ invoiceId, paymentData }: { invoiceId: string; paymentData: Partial<Payment> }, { rejectWithValue }) => {
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
      const response = await invoiceService.getPaymentStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch payment stats');
    }
  }
);

// Async thunks for Invoice Items
export const addInvoiceItem = createAsyncThunk(
  'invoices/addItem',
  async ({ invoiceId, itemData }: { invoiceId: string; itemData: Partial<InvoiceItem> }, { rejectWithValue }) => {
    try {
      const response = await invoiceService.addInvoiceItem(invoiceId, itemData);
      toast.success('Item added to invoice successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add item to invoice');
      return rejectWithValue(error.response?.data?.message || 'Failed to add item to invoice');
    }
  }
);

export const updateInvoiceItem = createAsyncThunk(
  'invoices/updateItem',
  async ({ invoiceId, itemId, itemData }: { invoiceId: string; itemId: string; itemData: Partial<InvoiceItem> }, { rejectWithValue }) => {
    try {
      const response = await invoiceService.updateInvoiceItem(invoiceId, itemId, itemData);
      toast.success('Invoice item updated successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update invoice item');
      return rejectWithValue(error.response?.data?.message || 'Failed to update invoice item');
    }
  }
);

export const removeInvoiceItem = createAsyncThunk(
  'invoices/removeItem',
  async ({ invoiceId, itemId }: { invoiceId: string; itemId: string }, { rejectWithValue }) => {
    try {
      const response = await invoiceService.removeInvoiceItem(invoiceId, itemId);
      toast.success('Item removed from invoice successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to remove item from invoice');
      return rejectWithValue(error.response?.data?.message || 'Failed to remove item from invoice');
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

interface InvoicesState {
  invoices: Invoice[];
  templates: any[];
  stats: InvoiceStats | null;
  paymentStats: PaymentStats | null;
  invoicesLoading: boolean;
  templatesLoading: boolean;
  statsLoading: boolean;
  error: string | null;
}

const initialState: InvoicesState = {
  invoices: [],
  templates: [],
  stats: null,
  paymentStats: null,
  invoicesLoading: false,
  templatesLoading: false,
  statsLoading: false,
  error: null
};

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    clearInvoicesError: (state) => {
      state.error = null;
    },
    clearInvoices: (state) => {
      state.invoices = [];
    },
    clearTemplates: (state) => {
      state.templates = [];
    }
  },
  extraReducers: (builder) => {
    // Invoices
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.invoicesLoading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.invoicesLoading = false;
        state.invoices = action.payload;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.invoicesLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.invoices.push(action.payload);
      })
      .addCase(updateInvoice.fulfilled, (state, action) => {
        const index = state.invoices.findIndex(invoice => invoice.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      })
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.invoices = state.invoices.filter(invoice => invoice.id !== action.payload);
      })
      .addCase(sendInvoice.fulfilled, (state, action) => {
        const index = state.invoices.findIndex(invoice => invoice.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      })
      .addCase(addPayment.fulfilled, (state, action) => {
        const index = state.invoices.findIndex(invoice => invoice.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      });

    // Invoice Items
    builder
      .addCase(addInvoiceItem.fulfilled, (state, action) => {
        const index = state.invoices.findIndex(invoice => invoice.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      })
      .addCase(updateInvoiceItem.fulfilled, (state, action) => {
        const index = state.invoices.findIndex(invoice => invoice.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      })
      .addCase(removeInvoiceItem.fulfilled, (state, action) => {
        const index = state.invoices.findIndex(invoice => invoice.id === action.payload.id);
        if (index !== -1) {
          state.invoices[index] = action.payload;
        }
      });

    // Invoice Templates
    builder
      .addCase(fetchInvoiceTemplates.pending, (state) => {
        state.templatesLoading = true;
        state.error = null;
      })
      .addCase(fetchInvoiceTemplates.fulfilled, (state, action) => {
        state.templatesLoading = false;
        state.templates = action.payload;
      })
      .addCase(fetchInvoiceTemplates.rejected, (state, action) => {
        state.templatesLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createInvoiceTemplate.fulfilled, (state, action) => {
        state.templates.push(action.payload);
      })
      .addCase(updateInvoiceTemplate.fulfilled, (state, action) => {
        const index = state.templates.findIndex(template => template.id === action.payload.id);
        if (index !== -1) {
          state.templates[index] = action.payload;
        }
      })
      .addCase(deleteInvoiceTemplate.fulfilled, (state, action) => {
        state.templates = state.templates.filter(template => template.id !== action.payload);
      });

    // Stats
    builder
      .addCase(fetchInvoiceStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchInvoiceStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchInvoiceStats.rejected, (state) => {
        state.statsLoading = false;
      })
      .addCase(fetchPaymentStats.fulfilled, (state, action) => {
        state.paymentStats = action.payload;
      });
  }
});

export const {
  clearInvoicesError,
  clearInvoices,
  clearTemplates
} = invoicesSlice.actions;

export default invoicesSlice.reducer;
