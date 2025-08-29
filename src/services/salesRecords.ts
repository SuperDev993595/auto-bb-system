import { apiRequest } from './api';

export interface SalesRecordItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface SalesRecord {
  _id: string;
  recordNumber: string;
  customer: {
    _id: string;
    businessName: string;
    contactPerson: {
      name: string;
    };
    email?: string;
  };
  salesType: 'product' | 'service' | 'package' | 'consultation' | 'other';
  items: SalesRecordItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded';
  paymentMethod?: 'cash' | 'credit_card' | 'debit_card' | 'check' | 'bank_transfer' | 'online' | 'other';
  paymentDate?: string;
  paymentReference?: string;
  salesSource: 'walk_in' | 'phone' | 'online' | 'referral' | 'marketing_campaign' | 'repeat_customer' | 'other';
  convertedFromLead?: boolean;
  originalLeadId?: string;
  status: 'draft' | 'confirmed' | 'completed' | 'cancelled' | 'refunded';
  saleDate: string;
  completionDate?: string;
  notes?: string;
  nextFollowUp?: string;
  followUpStatus?: 'scheduled' | 'completed' | 'cancelled' | 'overdue';
  customerSatisfaction?: {
    rating?: number;
    feedback?: string;
    date?: string;
  };
  warranty?: {
    hasWarranty?: boolean;
    warrantyPeriod?: number;
    warrantyExpiry?: string;
    warrantyNotes?: string;
  };
  salesPerson: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateSalesRecordData {
  customer: string;
  salesType: SalesRecord['salesType'];
  items: SalesRecordItem[];
  subtotal: number;
  tax?: number;
  discount?: number;
  total: number;
  paymentStatus?: SalesRecord['paymentStatus'];
  paymentMethod?: SalesRecord['paymentMethod'];
  paymentDate?: string;
  paymentReference?: string;
  salesSource?: SalesRecord['salesSource'];
  convertedFromLead?: boolean;
  originalLeadId?: string;
  status?: SalesRecord['status'];
  saleDate?: string;
  completionDate?: string;
  notes?: string;
  nextFollowUp?: string;
  followUpStatus?: SalesRecord['followUpStatus'];
  customerSatisfaction?: SalesRecord['customerSatisfaction'];
  warranty?: SalesRecord['warranty'];
}

export interface UpdateSalesRecordData extends Partial<CreateSalesRecordData> {}

export interface SalesRecordsResponse {
  success: boolean;
  data: {
    salesRecords: SalesRecord[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalRecords: number;
    };
  };
}

export interface SalesRecordResponse {
  success: boolean;
  data: {
    salesRecord: SalesRecord;
  };
}

// Get all sales records with filtering and pagination
export const getSalesRecords = async (params?: {
  page?: number;
  limit?: number;
  customer?: string;
  status?: string;
  search?: string;
}): Promise<SalesRecordsResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.customer) queryParams.append('customer', params.customer);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.search) queryParams.append('search', params.search);

  const url = `/api/sales-records${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiRequest(url);
};

// Get single sales record by ID
export const getSalesRecord = async (id: string): Promise<SalesRecordResponse> => {
  return apiRequest(`/api/sales-records/${id}`);
};

// Create new sales record
export const createSalesRecord = async (data: CreateSalesRecordData): Promise<SalesRecordResponse> => {
  return apiRequest('/api/sales-records', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

// Update sales record
export const updateSalesRecord = async (id: string, data: UpdateSalesRecordData): Promise<SalesRecordResponse> => {
  return apiRequest(`/api/sales-records/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

// Delete sales record
export const deleteSalesRecord = async (id: string): Promise<{ success: boolean; message: string }> => {
  return apiRequest(`/api/sales-records/${id}`, {
    method: 'DELETE'
  });
};

// Get sales records for a specific customer
export const getCustomerSalesRecords = async (customerId: string, params?: {
  page?: number;
  limit?: number;
}): Promise<SalesRecordsResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const url = `/api/sales-records/customer/${customerId}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  return apiRequest(url);
};
