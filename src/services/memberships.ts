import api from './api';

export interface MembershipPlan {
  _id: string;
  name: string;
  description?: string;
  tier: 'basic' | 'premium' | 'vip' | 'enterprise';
  price: number;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  features: Array<{
    name: string;
    description?: string;
    included: boolean;
  }>;
  benefits: {
    discountPercentage: number;
    priorityBooking: boolean;
    freeInspections: number;
    roadsideAssistance: boolean;
    extendedWarranty: boolean;
    conciergeService: boolean;
  };
  isActive: boolean;
  maxVehicles: number;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CustomerMembership {
  _id: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  membershipPlan: MembershipPlan;
  status: 'active' | 'inactive' | 'suspended' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string;
  nextBillingDate: string;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  price: number;
  autoRenew: boolean;
  paymentMethod: 'credit_card' | 'debit_card' | 'bank_transfer' | 'paypal' | 'other';
  paymentStatus: 'paid' | 'pending' | 'failed' | 'overdue';
  lastPaymentDate?: string;
  nextPaymentAmount?: number;
  totalPaid: number;
  benefitsUsed: {
    inspections: number;
    roadsideAssistance: number;
    priorityBookings: number;
  };
  notes?: string;
  cancelledBy?: {
    _id: string;
    name: string;
    email: string;
  };
  cancellationReason?: string;
  cancellationDate?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  isExpired: boolean;
  daysUntilRenewal: number;
}

export interface MembershipStats {
  totalMemberships: number;
  activeMemberships: number;
  expiringSoon: number;
  statusBreakdown: Array<{
    _id: string;
    count: number;
    totalRevenue: number;
  }>;
}

class MembershipService {
  // Membership Plans
  async getMembershipPlans(): Promise<MembershipPlan[]> {
    const response = await api.get('/memberships/plans');
    return response.data;
  }

  async getMembershipPlan(id: string): Promise<MembershipPlan> {
    const response = await api.get(`/memberships/plans/${id}`);
    return response.data;
  }

  async createMembershipPlan(data: Partial<MembershipPlan>): Promise<MembershipPlan> {
    const response = await api.post('/memberships/plans', data);
    return response.data;
  }

  async updateMembershipPlan(id: string, data: Partial<MembershipPlan>): Promise<MembershipPlan> {
    const response = await api.put(`/memberships/plans/${id}`, data);
    return response.data;
  }

  async deleteMembershipPlan(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/memberships/plans/${id}`);
    return response.data;
  }

  // Customer Memberships
  async getCustomerMemberships(customerId: string): Promise<CustomerMembership[]> {
    const response = await api.get(`/memberships/customer/${customerId}`);
    return response.data;
  }

  async createCustomerMembership(customerId: string, data: Partial<CustomerMembership>): Promise<CustomerMembership> {
    const response = await api.post(`/memberships/customer/${customerId}`, data);
    return response.data;
  }

  async updateCustomerMembership(customerId: string, membershipId: string, data: Partial<CustomerMembership>): Promise<CustomerMembership> {
    const response = await api.put(`/memberships/customer/${customerId}/${membershipId}`, data);
    return response.data;
  }

  async cancelCustomerMembership(customerId: string, membershipId: string, cancellationReason: string): Promise<CustomerMembership> {
    const response = await api.patch(`/memberships/customer/${customerId}/${membershipId}/cancel`, {
      cancellationReason
    });
    return response.data;
  }

  // Statistics
  async getMembershipStats(): Promise<MembershipStats> {
    const response = await api.get('/memberships/stats');
    return response.data;
  }
}

export const membershipService = new MembershipService();
