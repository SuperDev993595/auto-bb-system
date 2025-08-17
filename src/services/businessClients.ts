import api from './api';

// Business Client Types
export interface BusinessClient {
  _id: string;
  businessName: string;
  businessType: 'auto_repair' | 'tire_shop' | 'oil_change' | 'brake_shop' | 'general_repair' | 'dealership' | 'specialty_shop' | 'other';
  contactPerson: {
    name: string;
    title?: string;
    email: string;
    phone: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  businessInfo?: {
    yearsInBusiness?: number;
    employeeCount?: number;
    website?: string;
    hours?: string;
    services?: string[];
    specialties?: string[];
    certifications?: string[];
  };
  subscription: {
    plan: 'basic' | 'professional' | 'enterprise' | 'custom';
    status: 'active' | 'trial' | 'suspended' | 'cancelled' | 'expired';
    startDate: string;
    endDate?: string;
    billingCycle: 'monthly' | 'quarterly' | 'annually';
    monthlyFee: number;
    features?: string[];
  };
  branding?: {
    logo?: string;
    primaryColor: string;
    secondaryColor: string;
    companyName?: string;
    tagline?: string;
    customDomain?: string;
  };
  settings?: {
    timezone: string;
    currency: string;
    dateFormat: string;
    timeFormat: '12h' | '24h';
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    integrations: {
      quickbooks: {
        enabled: boolean;
        connected: boolean;
      };
      stripe: {
        enabled: boolean;
        connected: boolean;
      };
      mailchimp: {
        enabled: boolean;
        connected: boolean;
      };
    };
  };
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  source: 'direct' | 'referral' | 'advertising' | 'partnership' | 'other';
  notes?: string;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  lastContact?: string;
  nextFollowUp?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBusinessClientData {
  businessName: string;
  businessType?: 'auto_repair' | 'tire_shop' | 'oil_change' | 'brake_shop' | 'general_repair' | 'dealership' | 'specialty_shop' | 'other';
  contactPerson: {
    name: string;
    title?: string;
    email: string;
    phone: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
  businessInfo?: {
    yearsInBusiness?: number;
    employeeCount?: number;
    website?: string;
    hours?: string;
    services?: string[];
    specialties?: string[];
    certifications?: string[];
  };
  subscription?: {
    plan?: 'basic' | 'professional' | 'enterprise' | 'custom';
    billingCycle?: 'monthly' | 'quarterly' | 'annually';
    monthlyFee?: number;
    features?: string[];
  };
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    companyName?: string;
    tagline?: string;
    customDomain?: string;
  };
  settings?: {
    timezone?: string;
    currency?: string;
    dateFormat?: string;
    timeFormat?: '12h' | '24h';
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
  };
  status?: 'active' | 'inactive' | 'pending' | 'suspended';
  source?: 'direct' | 'referral' | 'advertising' | 'partnership' | 'other';
  notes?: string;
}

export interface UpdateBusinessClientData extends Partial<CreateBusinessClientData> {}

export interface BusinessClientFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  businessType?: string;
  subscriptionStatus?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BusinessClientStats {
  totalClients: number;
  activeClients: number;
  trialClients: number;
  suspendedClients: number;
  newThisMonth: number;
  expiringThisMonth: number;
  monthlyRecurringRevenue: number;
}

export interface BusinessClientListResponse {
  businessClients: BusinessClient[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    limit: number;
  };
}

// Business Client Service
class BusinessClientService {
  // Get all business clients with filtering and pagination
  async getBusinessClients(filters: BusinessClientFilters = {}): Promise<BusinessClientListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(`/business-clients?${params.toString()}`);
    return response.data.data;
  }

  // Get business client by ID
  async getBusinessClient(id: string): Promise<BusinessClient> {
    const response = await api.get(`/business-clients/${id}`);
    return response.data.data.businessClient;
  }

  // Create new business client
  async createBusinessClient(data: CreateBusinessClientData): Promise<BusinessClient> {
    const response = await api.post('/business-clients', data);
    return response.data.data.businessClient;
  }

  // Update business client
  async updateBusinessClient(id: string, data: UpdateBusinessClientData): Promise<BusinessClient> {
    const response = await api.put(`/business-clients/${id}`, data);
    return response.data.data.businessClient;
  }

  // Delete business client
  async deleteBusinessClient(id: string): Promise<void> {
    await api.delete(`/business-clients/${id}`);
  }

  // Activate business client subscription
  async activateBusinessClient(id: string, data: {
    subscriptionEndDate?: string;
    plan?: string;
    monthlyFee?: number;
  }): Promise<BusinessClient> {
    const response = await api.post(`/business-clients/${id}/activate`, data);
    return response.data.data.businessClient;
  }

  // Suspend business client subscription
  async suspendBusinessClient(id: string): Promise<BusinessClient> {
    const response = await api.post(`/business-clients/${id}/suspend`);
    return response.data.data.businessClient;
  }

  // Get business client statistics
  async getBusinessClientStats(): Promise<BusinessClientStats> {
    const response = await api.get('/business-clients/stats/overview');
    return response.data.data;
  }

  // Get subscription days remaining
  getSubscriptionDaysRemaining(businessClient: BusinessClient): number | null {
    if (!businessClient.subscription.endDate) return null;
    
    const now = new Date();
    const endDate = new Date(businessClient.subscription.endDate);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  // Check if subscription is expired
  isSubscriptionExpired(businessClient: BusinessClient): boolean {
    if (!businessClient.subscription.endDate) return false;
    return new Date() > new Date(businessClient.subscription.endDate);
  }

  // Check if subscription is active
  isSubscriptionActive(businessClient: BusinessClient): boolean {
    return ['active', 'trial'].includes(businessClient.subscription.status);
  }

  // Get subscription status color
  getSubscriptionStatusColor(status: string): string {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'trial':
        return 'text-blue-600 bg-blue-100';
      case 'suspended':
        return 'text-red-600 bg-red-100';
      case 'cancelled':
        return 'text-gray-600 bg-gray-100';
      case 'expired':
        return 'text-orange-600 bg-orange-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  // Get business type label
  getBusinessTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      auto_repair: 'Auto Repair',
      tire_shop: 'Tire Shop',
      oil_change: 'Oil Change',
      brake_shop: 'Brake Shop',
      general_repair: 'General Repair',
      dealership: 'Dealership',
      specialty_shop: 'Specialty Shop',
      other: 'Other'
    };
    return labels[type] || type;
  }

  // Get plan label
  getPlanLabel(plan: string): string {
    const labels: Record<string, string> = {
      basic: 'Basic',
      professional: 'Professional',
      enterprise: 'Enterprise',
      custom: 'Custom'
    };
    return labels[plan] || plan;
  }

  // Format currency
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  // Format date
  formatDate(date: string | Date, format: string = 'MM/DD/YYYY'): string {
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const year = d.getFullYear();
    
    return format
      .replace('MM', month)
      .replace('DD', day)
      .replace('YYYY', year.toString());
  }
}

export default new BusinessClientService();
