import api, { apiResponse } from './api';

// Invoice Interfaces
export interface Invoice {
  _id: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  };
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  totalPaid: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentTerms: string;
  notes?: string;
  terms?: string;
  sentDate?: string;
  paidDate?: string;
  payments: Payment[];
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  sentBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  itemType: 'service' | 'product';
  itemId: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
}

export interface Payment {
  amount: number;
  paymentMethod: 'cash' | 'credit_card' | 'bank_transfer' | 'check' | 'online';
  reference?: string;
  notes?: string;
  date: string;
  processedBy: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface CreateInvoiceData {
  customerId: string;
  invoiceNumber: string;
  dueDate: string;
  items: {
    itemType: 'service' | 'product';
    itemId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    tax?: number;
  }[];
  subtotal: number;
  taxAmount: number;
  discountAmount?: number;
  totalAmount: number;
  paymentTerms?: string;
  notes?: string;
  terms?: string;
}

export interface UpdateInvoiceData {
  customerId?: string;
  invoiceNumber?: string;
  dueDate?: string;
  items?: CreateInvoiceData['items'];
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
  status?: Invoice['status'];
  paymentTerms?: string;
  notes?: string;
  terms?: string;
}

export interface AddPaymentData {
  amount: number;
  paymentMethod: Payment['paymentMethod'];
  reference?: string;
  notes?: string;
}

// Filter Interfaces
export interface InvoiceFilters {
  status?: Invoice['status'];
  customerId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// Statistics Interfaces
export interface InvoiceStats {
  totalInvoices: number;
  totalAmount: number;
  totalPaid: number;
  totalOutstanding: number;
  avgInvoiceValue: number;
  byStatus: { status: string; count: number; totalAmount: number }[];
  monthly: {
    year: number;
    month: number;
    count: number;
    totalAmount: number;
    totalPaid: number;
  }[];
}

class InvoiceService {
  // Invoice Methods
  async getInvoices(filters: InvoiceFilters = {}): Promise<apiResponse<{ data: Invoice[]; pagination: any }>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    return api.get(`/invoices?${params.toString()}`);
  }

  async getInvoice(id: string): Promise<apiResponse<Invoice>> {
    return api.get(`/invoices/${id}`);
  }

  async createInvoice(data: CreateInvoiceData): Promise<apiResponse<Invoice>> {
    return api.post('/invoices', data);
  }

  async updateInvoice(id: string, data: UpdateInvoiceData): Promise<apiResponse<Invoice>> {
    return api.put(`/invoices/${id}`, data);
  }

  async deleteInvoice(id: string): Promise<apiResponse<{ message: string }>> {
    return api.delete(`/invoices/${id}`);
  }

  async sendInvoice(id: string): Promise<apiResponse<Invoice>> {
    return api.post(`/invoices/${id}/send`);
  }

  async addPayment(id: string, paymentData: AddPaymentData): Promise<apiResponse<Invoice>> {
    return api.post(`/invoices/${id}/payments`, paymentData);
  }

  async getInvoiceStats(startDate?: string, endDate?: string): Promise<apiResponse<InvoiceStats>> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/invoices/stats/overview?${params.toString()}`);
  }

  // Invoice Generation Methods
  async generateInvoiceFromWorkOrder(workOrderId: string): Promise<apiResponse<Invoice>> {
    return api.post('/invoices/generate-from-workorder', { workOrderId });
  }

  async generateInvoiceFromAppointment(appointmentId: string): Promise<apiResponse<Invoice>> {
    return api.post('/invoices/generate-from-appointment', { appointmentId });
  }

  // Invoice Templates
  async getInvoiceTemplates(): Promise<apiResponse<any[]>> {
    return api.get('/invoices/templates');
  }

  async createInvoiceTemplate(template: any): Promise<apiResponse<any>> {
    return api.post('/invoices/templates', template);
  }

  async updateInvoiceTemplate(id: string, template: any): Promise<apiResponse<any>> {
    return api.put(`/invoices/templates/${id}`, template);
  }

  async deleteInvoiceTemplate(id: string): Promise<apiResponse<{ message: string }>> {
    return api.delete(`/invoices/templates/${id}`);
  }

  // Invoice Export/Print
  async exportInvoice(id: string, format: 'pdf' | 'excel' = 'pdf'): Promise<apiResponse<{ downloadUrl: string }>> {
    return api.get(`/invoices/${id}/export?format=${format}`);
  }

  async printInvoice(id: string): Promise<apiResponse<{ printUrl: string }>> {
    return api.get(`/invoices/${id}/print`);
  }

  // Bulk Operations
  async sendBulkInvoices(invoiceIds: string[]): Promise<apiResponse<{ sent: number; failed: number; errors: any[] }>> {
    return api.post('/invoices/bulk/send', { invoiceIds });
  }

  async exportBulkInvoices(invoiceIds: string[], format: 'pdf' | 'excel' = 'pdf'): Promise<apiResponse<{ downloadUrl: string }>> {
    return api.post('/invoices/bulk/export', { invoiceIds, format });
  }

  // Invoice Reminders
  async sendPaymentReminder(id: string): Promise<apiResponse<{ message: string }>> {
    return api.post(`/invoices/${id}/send-reminder`);
  }

  async sendBulkReminders(invoiceIds: string[]): Promise<apiResponse<{ sent: number; failed: number; errors: any[] }>> {
    return api.post('/invoices/bulk/send-reminders', { invoiceIds });
  }

  // Invoice Analytics
  async getPaymentAnalytics(startDate?: string, endDate?: string): Promise<apiResponse<any>> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/invoices/analytics/payments?${params.toString()}`);
  }

  async getCustomerPaymentHistory(customerId: string): Promise<apiResponse<Invoice[]>> {
    return api.get(`/invoices/customer/${customerId}/payment-history`);
  }

  // Invoice Settings
  async getInvoiceSettings(): Promise<apiResponse<any>> {
    return api.get('/invoices/settings');
  }

  async updateInvoiceSettings(settings: any): Promise<apiResponse<any>> {
    return api.put('/invoices/settings', settings);
  }

  // Invoice Number Generation
  async generateInvoiceNumber(): Promise<apiResponse<{ invoiceNumber: string }>> {
    return api.get('/invoices/generate-number');
  }

  // Invoice Validation
  async validateInvoiceNumber(invoiceNumber: string): Promise<apiResponse<{ isValid: boolean; message?: string }>> {
    return api.post('/invoices/validate-number', { invoiceNumber });
  }

  // Invoice Search
  async searchInvoices(query: string, filters?: InvoiceFilters): Promise<apiResponse<Invoice[]>> {
    const params = new URLSearchParams({ query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    return api.get(`/invoices/search?${params.toString()}`);
  }

  // Invoice Duplication
  async duplicateInvoice(id: string): Promise<apiResponse<Invoice>> {
    return api.post(`/invoices/${id}/duplicate`);
  }

  // Invoice Archiving
  async archiveInvoice(id: string): Promise<apiResponse<{ message: string }>> {
    return api.post(`/invoices/${id}/archive`);
  }

  async unarchiveInvoice(id: string): Promise<apiResponse<{ message: string }>> {
    return api.post(`/invoices/${id}/unarchive`);
  }

  async getArchivedInvoices(filters?: InvoiceFilters): Promise<apiResponse<{ data: Invoice[]; pagination: any }>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    return api.get(`/invoices/archived?${params.toString()}`);
  }
}

export const invoiceService = new InvoiceService();
export default invoiceService;
