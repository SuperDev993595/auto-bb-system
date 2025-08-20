import api from './api';

export interface SMSTemplate {
  _id: string;
  name: string;
  message: string;
  variables: string[];
  category: string;
  description?: string;
  usageCount: number;
  isActive: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SMSRecord {
  _id: string;
  to: string;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  priority: 'low' | 'normal' | 'high';
  scheduledAt?: string;
  sentAt?: string;
  deliveredAt?: string;
  errorMessage?: string;
  provider: string;
  providerMessageId?: string;
  cost: number;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SMSStats {
  totalSent: number;
  delivered: number;
  failed: number;
  pending: number;
  deliveryRate: number;
  totalCost: number;
}

export interface SendSMSData {
  to: string;
  message: string;
  scheduledAt?: string;
  priority?: 'low' | 'normal' | 'high';
}

export interface BulkSMSData {
  recipients: Array<{ phone: string }>;
  message: string;
  scheduledAt?: string;
  priority?: 'low' | 'normal' | 'high';
}

export interface CreateTemplateData {
  name: string;
  message: string;
  variables?: string[];
  category: string;
  description?: string;
}

export interface UseTemplateData {
  variables: Record<string, string>;
}

export interface SMSFilters {
  status?: string;
  to?: string;
}

export interface SMSTemplateFilters {
  category?: string;
}

export interface SMSHistoryResponse {
  data: SMSRecord[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalRecords: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface BulkSMSResponse {
  total: number;
  successful: number;
  failed: number;
  results: any[];
}

export interface UseTemplateResponse {
  message: string;
  template: {
    id: string;
    name: string;
    category: string;
  };
}

class SMSService {
  // Send single SMS
  async sendSMS(data: SendSMSData): Promise<{ success: boolean; data: SMSRecord; message: string }> {
    const response = await api.post('/sms/send', data);
    return response.data;
  }

  // Send bulk SMS
  async sendBulkSMS(data: BulkSMSData): Promise<{ success: boolean; data: BulkSMSResponse; message: string }> {
    const response = await api.post('/sms/bulk', data);
    return response.data;
  }

  // Get SMS history
  async getHistory(filters: SMSFilters = {}, page: number = 1, limit: number = 20): Promise<SMSHistoryResponse> {
    const params = new URLSearchParams();
    if (filters.status) params.append('status', filters.status);
    if (filters.to) params.append('to', filters.to);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get(`/sms/history?${params.toString()}`);
    return response.data;
  }

  // Get SMS analytics
  async getAnalytics(): Promise<{ success: boolean; data: { overview: SMSStats } }> {
    const response = await api.get('/sms/analytics');
    return response.data;
  }

  // Get SMS templates
  async getTemplates(filters: SMSTemplateFilters = {}): Promise<{ success: boolean; data: SMSTemplate[] }> {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);

    const response = await api.get(`/sms/templates?${params.toString()}`);
    return response.data;
  }

  // Create SMS template
  async createTemplate(data: CreateTemplateData): Promise<{ success: boolean; data: SMSTemplate; message: string }> {
    const response = await api.post('/sms/templates', data);
    return response.data;
  }

  // Use SMS template
  async useTemplate(templateId: string, data: UseTemplateData): Promise<{ success: boolean; data: UseTemplateResponse }> {
    const response = await api.post(`/sms/templates/${templateId}/use`, data);
    return response.data;
  }
}

export default new SMSService();
