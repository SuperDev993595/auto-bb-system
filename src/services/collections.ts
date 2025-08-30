import api, { apiResponse } from './api';

// Collections Task Interface
export interface CollectionsTask {
  _id: string;
  title: string;
  description: string;
  type: 'collections';
  collectionsType: 'payment_reminder' | 'overdue_notice' | 'payment_plan' | 'negotiation' | 'legal_action' | 'other';
  amount: number;
  dueDate: string;
  assignedTo: string | { _id: string; name: string; email: string };
  assignedBy: string | { _id: string; name: string; email: string };
  customer: string | { _id: string; businessName?: string; name?: string };
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  paymentTerms?: string;
  invoice?: string | { _id: string; invoiceNumber: string; total: number };
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  escalationLevel: number;
  paymentPlan?: {
    totalAmount: number;
    installmentAmount: number;
    numberOfInstallments: number;
    installmentFrequency: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly';
    nextPaymentDate: string;
    paymentsMade: number;
    totalPaid: number;
  };
  communicationHistory: Array<{
    _id: string;
    method: 'phone' | 'email' | 'sms' | 'in_person' | 'letter';
    direction: 'inbound' | 'outbound';
    date: string;
    summary: string;
    outcome: 'no_answer' | 'left_message' | 'spoke_to_customer' | 'payment_promised' | 'payment_made' | 'refused' | 'other';
    nextAction?: string;
    nextActionDate?: string;
  }>;
  lastContactDate?: string;
  nextContactDate?: string;
  legalDocuments: Array<{
    _id: string;
    documentType: 'payment_agreement' | 'demand_letter' | 'legal_notice' | 'court_filing' | 'other';
    filename: string;
    originalName: string;
    path: string;
    uploadedBy: string;
    uploadedAt: string;
    description?: string;
  }>;
  auditTrail: Array<{
    _id: string;
    action: string;
    description: string;
    performedBy: string;
    performedAt: string;
    previousValue?: any;
    newValue?: any;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Create Collections Task Data
export interface CreateCollectionsTaskData {
  customer: string;
  title: string;
  description?: string;
  collectionsType: 'payment_reminder' | 'overdue_notice' | 'payment_plan' | 'negotiation' | 'legal_action' | 'other';
  amount: number;
  dueDate: string;
  assignedTo: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  paymentTerms?: string;
  invoice?: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  escalationLevel?: number;
  paymentPlan?: {
    totalAmount: number;
    installmentAmount: number;
    numberOfInstallments: number;
    installmentFrequency: 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly';
    nextPaymentDate: string;
  };
}

// Update Collections Task Data
export interface UpdateCollectionsTaskData {
  title?: string;
  description?: string;
  collectionsType?: 'payment_reminder' | 'overdue_notice' | 'payment_plan' | 'negotiation' | 'legal_action' | 'other';
  amount?: number;
  dueDate?: string;
  assignedTo?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  paymentTerms?: string;
  invoice?: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  escalationLevel?: number;
}

// Communication Record Data
export interface CommunicationRecordData {
  method: 'phone' | 'email' | 'sms' | 'in_person' | 'letter';
  direction: 'inbound' | 'outbound';
  summary: string;
  outcome: 'no_answer' | 'left_message' | 'spoke_to_customer' | 'payment_promised' | 'payment_made' | 'refused' | 'other';
  nextAction?: string;
  nextActionDate?: string;
}

// Payment Plan Update Data
export interface PaymentPlanUpdateData {
  paymentAmount: number;
}

// Collections Filters
export interface CollectionsFilters {
  page?: number;
  limit?: number;
  customer?: string;
  assignedTo?: string;
  collectionsType?: string;
  status?: string;
  riskLevel?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Collections Statistics
export interface CollectionsStats {
  collectionsTypeStats: Array<{
    _id: string;
    count: number;
    totalAmount: number;
    completed: number;
  }>;
  riskLevelStats: Array<{
    _id: string;
    count: number;
    totalAmount: number;
    completed: number;
  }>;
  overallStats: {
    totalTasks: number;
    totalAmount: number;
    completedTasks: number;
    completedAmount: number;
    overdueTasks: number;
  };
}

// Collections API Functions
export const collectionsApi = {
  // Get all collections tasks
  getCollections: async (filters: CollectionsFilters = {}): Promise<apiResponse<{
    collectionsTasks: CollectionsTask[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalTasks: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  }>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/collections?${params.toString()}`);
    return response.data;
  },

  // Create new collections task
  createCollectionsTask: async (data: CreateCollectionsTaskData): Promise<apiResponse<{
    collectionsTask: CollectionsTask;
  }>> => {
    const response = await api.post('/collections', data);
    return response.data;
  },

  // Update collections task
  updateCollectionsTask: async (id: string, data: UpdateCollectionsTaskData): Promise<apiResponse<{
    collectionsTask: CollectionsTask;
  }>> => {
    const response = await api.put(`/collections/${id}`, data);
    return response.data;
  },

  // Add communication record
  addCommunication: async (id: string, data: CommunicationRecordData): Promise<apiResponse<{
    communication: CommunicationRecordData;
  }>> => {
    const response = await api.post(`/collections/${id}/communication`, data);
    return response.data;
  },

  // Record payment
  recordPayment: async (id: string, data: PaymentPlanUpdateData): Promise<apiResponse<{
    paymentAmount: number;
    totalPaid: number;
    nextPaymentDate: string;
  }>> => {
    const response = await api.post(`/collections/${id}/payment`, data);
    return response.data;
  },

  // Get overdue collections
  getOverdueCollections: async (): Promise<apiResponse<{
    overdueCollections: CollectionsTask[];
    totalOverdue: number;
    count: number;
  }>> => {
    const response = await api.get('/collections/overdue');
    return response.data;
  },

  // Get collections statistics
  getCollectionsStats: async (filters: {
    startDate?: string;
    endDate?: string;
    assignedTo?: string;
  } = {}): Promise<apiResponse<CollectionsStats>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/collections/stats?${params.toString()}`);
    return response.data;
  },

  // Get collections for specific customer
  getCustomerCollections: async (customerId: string): Promise<apiResponse<{
    collectionsTasks: CollectionsTask[];
    totalOutstanding: number;
    count: number;
  }>> => {
    const response = await api.get(`/collections/customer/${customerId}`);
    return response.data;
  },

  // Get collections by risk level
  getCollectionsByRiskLevel: async (level: string): Promise<apiResponse<{
    collectionsTasks: CollectionsTask[];
    count: number;
  }>> => {
    const response = await api.get(`/collections/risk-level/${level}`);
    return response.data;
  },

  // Schedule automated reminder
  scheduleReminder: async (id: string, data: {
    type: 'email' | 'sms' | 'letter' | 'phone';
    scheduledDate: string;
    template?: string;
    recipient?: 'customer' | 'assigned_user' | 'manager';
  }): Promise<apiResponse<any>> => {
    const response = await api.post(`/collections/${id}/reminders`, data);
    return response.data;
  },

  // Get task reminders
  getTaskReminders: async (id: string): Promise<apiResponse<any[]>> => {
    const response = await api.get(`/collections/${id}/reminders`);
    return response.data;
  },

  // Cancel scheduled reminder
  cancelReminder: async (id: string, reminderId: string): Promise<apiResponse<void>> => {
    const response = await api.delete(`/collections/${id}/reminders/${reminderId}`);
    return response.data;
  },

  // Upload legal document
  uploadDocument: async (id: string, formData: FormData): Promise<apiResponse<any>> => {
    const response = await api.post(`/collections/${id}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get task documents
  getTaskDocuments: async (id: string): Promise<apiResponse<any[]>> => {
    const response = await api.get(`/collections/${id}/documents`);
    return response.data;
  },

  // Get aging report
  getAgingReport: async (filters?: { startDate?: string; endDate?: string; assignedTo?: string }): Promise<apiResponse<any>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    return api.get(`/collections/aging-report?${params.toString()}`);
  },

  // Get performance metrics
  getPerformanceMetrics: async (filters?: { startDate?: string; endDate?: string; assignedTo?: string }): Promise<apiResponse<any>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }
    return api.get(`/collections/performance-metrics?${params.toString()}`);
  }
};

export default collectionsApi;
