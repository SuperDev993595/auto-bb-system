import api, { apiResponse } from './api';
import { rateLimitManager } from '../utils/rateLimitHelper';
import { Customer as CustomerType } from '../utils/CustomerTypes';

// Use the unified Customer interface
export type Customer = CustomerType;

export interface CreateCustomerData {
  name: string;
  email: string;
  phone: string;
  businessName?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  status?: 'active' | 'inactive' | 'prospect';
  notes?: string;
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  status?: 'active' | 'inactive' | 'prospect';
}

export interface CustomerFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  city?: string;
  state?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CustomerStats {
  totalCustomers: number;
  activeCustomers: number;
  totalVehicles: number;
  averageVehiclesPerCustomer: number;
  customersThisMonth: number;
  customersLastMonth: number;
  growthRate: number;
}

// Customers service
export const customerService = {
  // Get all customers with filtering and pagination
  async getCustomers(filters: CustomerFilters = {}): Promise<{
    success: boolean;
    data: {
      customers: Customer[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalCustomers: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
  }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const endpoint = `/customers?${params.toString()}`;
    rateLimitManager.trackRequest(endpoint);
    
    console.log('customerService.getCustomers: Making API call to /customers with params:', params.toString())
    const response = await apiResponse(api.get(endpoint));
    console.log('customerService.getCustomers: API response:', response)
    return response;
  },

  // Get single customer by ID
  async getCustomer(id: string): Promise<{
    success: boolean;
    data: Customer;
  }> {
    const endpoint = `/customers/${id}`;
    rateLimitManager.trackRequest(endpoint);
    
    const response = await apiResponse(api.get(endpoint));
    return response;
  },

  // Create new customer
  async createCustomer(customerData: CreateCustomerData): Promise<{
    success: boolean;
    message: string;
    data: { customer: Customer };
  }> {
    const response = await apiResponse(api.post('/customers', customerData));
    return response;
  },

  // Update customer
  async updateCustomer(id: string, customerData: UpdateCustomerData): Promise<{
    success: boolean;
    message: string;
    data: { customer: Customer };
  }> {
    const response = await apiResponse(api.put(`/customers/${id}`, customerData));
    return response;
  },

  // Delete customer
  async deleteCustomer(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await apiResponse(api.delete(`/customers/${id}`));
    return response;
  },

  // Add vehicle to customer
  async addVehicle(customerId: string, vehicleData: {
    make: string;
    model: string;
    year: number;
    vin: string;
    licensePlate: string;
    mileage: number;
    color: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: { customer: Customer };
  }> {
    const response = await apiResponse(api.post(`/customers/${customerId}/vehicles`, vehicleData));
    return response;
  },

  // Update vehicle
  async updateVehicle(customerId: string, vehicleId: string, vehicleData: {
    make?: string;
    model?: string;
    year?: number;
    vin?: string;
    licensePlate?: string;
    mileage?: number;
    color?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: { customer: Customer };
  }> {
    const response = await apiResponse(api.put(`/customers/${customerId}/vehicles/${vehicleId}`, vehicleData));
    return response;
  },

  // Delete vehicle
  async deleteVehicle(customerId: string, vehicleId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await apiResponse(api.delete(`/customers/${customerId}/vehicles/${vehicleId}`));
    return response;
  },

  // Add service history
  async addServiceHistory(customerId: string, serviceData: {
    date: string;
    serviceType: string;
    description: string;
    cost: number;
    vehicleId: string;
    technician: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: { customer: Customer };
  }> {
    const response = await apiResponse(api.post(`/customers/${customerId}/service-history`, serviceData));
    return response;
  },

  // Add communication log
  async addCommunicationLog(customerId: string, logData: {
    type: 'phone' | 'email' | 'in-person';
    summary: string;
    notes: string;
    followUpDate?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: { customer: Customer };
  }> {
    const response = await apiResponse(api.post(`/customers/${customerId}/communication-log`, logData));
    return response;
  },

  // Get customer statistics
  async getCustomerStats(): Promise<{
    success: boolean;
    data: CustomerStats;
  }> {
    const response = await apiResponse(api.get('/customers/stats/overview'));
    return response;
  },

  // Search customers
  async searchCustomers(query: string): Promise<{
    success: boolean;
    data: { customers: Customer[] };
  }> {
    const response = await apiResponse(api.get(`/customers/search?q=${encodeURIComponent(query)}`));
    return response;
  },

  // Get payments for customer
  async getCustomerPayments(customerId: string, filters: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{
    success: boolean;
    data: {
      payments: Array<{
        _id: string;
        amount: number;
        date: string;
        method: string;
        reference?: string;
        notes?: string;
        status: string;
        createdAt: string;
      }>;
      pagination: {
        currentPage: number;
        totalPages: number;
        totalPayments: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
  }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await apiResponse(api.get(`/customers/${customerId}/payments?${params.toString()}`));
    return response;
  },

  // Add payment for customer
  async addPayment(customerId: string, paymentData: {
    amount: number;
    date?: string;
    method: 'cash' | 'card' | 'check' | 'bank_transfer' | 'online' | 'other';
    reference?: string;
    notes?: string;
    status?: 'pending' | 'completed' | 'failed' | 'refunded';
  }): Promise<{
    success: boolean;
    message: string;
    data: { payment: any; payments: any[] };
  }> {
    const response = await apiResponse(api.post(`/customers/${customerId}/payments`, paymentData));
    return response;
  },

  // Update payment for customer
  async updatePayment(customerId: string, paymentId: string, paymentData: {
    amount?: number;
    date?: string;
    method?: 'cash' | 'card' | 'check' | 'bank_transfer' | 'online' | 'other';
    reference?: string;
    notes?: string;
    status?: 'pending' | 'completed' | 'failed' | 'refunded';
  }): Promise<{
    success: boolean;
    message: string;
    data: { payment: any; payments: any[] };
  }> {
    const response = await apiResponse(api.put(`/customers/${customerId}/payments/${paymentId}`, paymentData));
    return response;
  },

  // Delete payment for customer
  async deletePayment(customerId: string, paymentId: string): Promise<{
    success: boolean;
    message: string;
    data: { payments: any[] };
  }> {
    const response = await apiResponse(api.delete(`/customers/${customerId}/payments/${paymentId}`));
    return response;
  },

  // ==================== ARRANGEMENTS ====================

  // Get arrangements for customer
  async getCustomerArrangements(customerId: string, filters: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{
    success: boolean;
    data: {
      arrangements: Array<{
        _id: string;
        date: string;
        amount: number;
        notes?: string;
        status: string;
        type: string;
        dueDate: string;
        createdAt: string;
      }>;
      pagination: {
        currentPage: number;
        totalPages: number;
        totalArrangements: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
  }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await apiResponse(api.get(`/customers/${customerId}/arrangements?${params.toString()}`));
    return response;
  },

  // Add arrangement for customer
  async addArrangement(customerId: string, arrangementData: {
    date?: string;
    amount: number;
    notes?: string;
    status?: 'pending' | 'active' | 'completed' | 'cancelled';
    type?: 'installment' | 'payment_plan' | 'deferred' | 'other';
    dueDate: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: { arrangement: any; arrangements: any[] };
  }> {
    const response = await apiResponse(api.post(`/customers/${customerId}/arrangements`, arrangementData));
    return response;
  },

  // Update arrangement for customer
  async updateArrangement(customerId: string, arrangementId: string, arrangementData: {
    date?: string;
    amount?: number;
    notes?: string;
    status?: 'pending' | 'active' | 'completed' | 'cancelled';
    type?: 'installment' | 'payment_plan' | 'deferred' | 'other';
    dueDate?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: { arrangement: any; arrangements: any[] };
  }> {
    const response = await apiResponse(api.put(`/customers/${customerId}/arrangements/${arrangementId}`, arrangementData));
    return response;
  },

  // Delete arrangement for customer
  async deleteArrangement(customerId: string, arrangementId: string): Promise<{
    success: boolean;
    message: string;
    data: { arrangements: any[] };
  }> {
    const response = await apiResponse(api.delete(`/customers/${customerId}/arrangements/${arrangementId}`));
    return response;
  },

  // ==================== TOWING ====================

  // Get towing records for customer
  async getCustomerTowing(customerId: string, filters: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{
    success: boolean;
    data: {
      towingRecords: Array<{
        _id: string;
        date: string;
        location: string;
        destination?: string;
        status: string;
        notes?: string;
        cost: number;
        vehicle?: string;
        createdAt: string;
      }>;
      pagination: {
        currentPage: number;
        totalPages: number;
        totalTowingRecords: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
  }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await apiResponse(api.get(`/customers/${customerId}/towing?${params.toString()}`));
    return response;
  },

  // Add towing record for customer
  async addTowing(customerId: string, towingData: {
    date?: string;
    location: string;
    destination?: string;
    status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    notes?: string;
    cost?: number;
    vehicle?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: { towingRecord: any; towingRecords: any[] };
  }> {
    const response = await apiResponse(api.post(`/customers/${customerId}/towing`, towingData));
    return response;
  },

  // Update towing record for customer
  async updateTowing(customerId: string, towingId: string, towingData: {
    date?: string;
    location?: string;
    destination?: string;
    status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
    notes?: string;
    cost?: number;
    vehicle?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: { towingRecord: any; towingRecords: any[] };
  }> {
    const response = await apiResponse(api.put(`/customers/${customerId}/towing/${towingId}`, towingData));
    return response;
  },

  // Delete towing record for customer
  async deleteTowing(customerId: string, towingId: string): Promise<{
    success: boolean;
    message: string;
    data: { towingRecords: any[] };
  }> {
    const response = await apiResponse(api.delete(`/customers/${customerId}/towing/${towingId}`));
    return response;
  },

  // ==================== CALL LOGS ====================

  // Get call logs for customer
  async getCustomerCallLogs(customerId: string, filters: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}): Promise<{
    success: boolean;
    data: {
      callLogs: Array<{
        _id: string;
        date: string;
        type: string;
        duration: number;
        notes?: string;
        summary?: string;
        followUpDate?: string;
        followUpRequired: boolean;
        phoneNumber?: string;
        createdAt: string;
      }>;
      pagination: {
        currentPage: number;
        totalPages: number;
        totalCallLogs: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
  }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await apiResponse(api.get(`/customers/${customerId}/call-logs?${params.toString()}`));
    return response;
  },

  // Add call log for customer
  async addCallLog(customerId: string, callLogData: {
    date?: string;
    type: 'inbound' | 'outbound' | 'missed' | 'voicemail';
    duration?: number;
    notes?: string;
    summary?: string;
    followUpDate?: string;
    followUpRequired?: boolean;
    phoneNumber?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: { callLog: any; callLogs: any[] };
  }> {
    const response = await apiResponse(api.post(`/customers/${customerId}/call-logs`, callLogData));
    return response;
  },

  // Update call log for customer
  async updateCallLog(customerId: string, callLogId: string, callLogData: {
    date?: string;
    type?: 'inbound' | 'outbound' | 'missed' | 'voicemail';
    duration?: number;
    notes?: string;
    summary?: string;
    followUpDate?: string;
    followUpRequired?: boolean;
    phoneNumber?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: { callLog: any; callLogs: any[] };
  }> {
    const response = await apiResponse(api.put(`/customers/${customerId}/call-logs/${callLogId}`, callLogData));
    return response;
  },

  // Delete call log for customer
  async deleteCallLog(customerId: string, callLogId: string): Promise<{
    success: boolean;
    message: string;
    data: { callLogs: any[] };
  }> {
    const response = await apiResponse(api.delete(`/customers/${customerId}/call-logs/${callLogId}`));
    return response;
  },

  // Get customer service history
  async getCustomerServiceHistory(): Promise<{
    success: boolean;
    data: {
      services: Array<{
        _id: string;
        date: string;
        serviceType: string;
        description: string;
        cost: number;
        vehicle: {
          make: string;
          model: string;
          year: number;
          vin: string;
        };
        technician: string;
        status: string;
        notes?: string;
        createdAt: string;
      }>;
    };
  }> {
    const response = await apiResponse(api.get('/customers/services'));
    return response;
  },

  // Get customer invoices
  async getCustomerInvoices(): Promise<{
    success: boolean;
    data: {
      invoices: Array<{
        _id: string;
        invoiceNumber: string;
        date: string;
        dueDate: string;
        serviceType: string;
        subtotal: number;
        tax: number;
        total: number;
        status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
        paymentMethod?: string;
        paymentDate?: string;
        paymentReference?: string;
        appointmentId?: {
          _id: string;
          date: string;
          serviceType: string;
        };
        createdAt: string;
      }>;
    };
  }> {
    const response = await apiResponse(api.get('/customers/invoices'));
    return response;
  },

  // Get customer rewards and membership
  async getCustomerRewards(): Promise<{
    success: boolean;
    data: {
      memberships: Array<{
        _id: string;
        status: 'active' | 'inactive' | 'suspended' | 'cancelled' | 'expired';
        startDate: string;
        endDate: string;
        nextBillingDate: string;
        billingCycle: 'monthly' | 'quarterly' | 'yearly';
        price: number;
        autoRenew: boolean;
        paymentStatus: 'paid' | 'pending' | 'failed' | 'overdue';
        totalPaid: number;
        benefitsUsed: {
          inspections: number;
          roadsideAssistance: number;
          priorityBookings: number;
        };
        membershipPlan: {
          _id: string;
          name: string;
          description: string;
          tier: 'basic' | 'premium' | 'vip' | 'enterprise';
          features: Array<{
            name: string;
            description: string;
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
        };
        createdAt: string;
      }>;
      availablePlans: Array<{
        _id: string;
        name: string;
        description: string;
        tier: 'basic' | 'premium' | 'vip' | 'enterprise';
        price: number;
        billingCycle: 'monthly' | 'quarterly' | 'yearly';
        features: Array<{
          name: string;
          description: string;
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
      }>;
    };
  }> {
    const response = await apiResponse(api.get('/memberships/customer/me'));
    return response;
  },

  // Get vehicles by customer ID
  async getVehiclesByCustomerId(customerId: string): Promise<{
    success: boolean;
    data: {
      vehicles: Array<{
        _id: string;
        id: string;
        year: number;
        make: string;
        model: string;
        vin: string;
        licensePlate: string;
        color: string;
        mileage: number;
        status: string;
        fuelType: string;
        transmission: string;
        lastServiceDate?: string;
        nextServiceDate?: string;
        createdAt: string;
        updatedAt: string;
      }>;
    };
  }> {
    const response = await apiResponse(api.get(`/customers/${customerId}/vehicles`));
    return response;
  },

  // ==================== PAYMENT METHODS ====================

  // Get customer's payment methods
  async getCustomerPaymentMethods(): Promise<{
    success: boolean;
    data: {
      paymentMethods: Array<{
        id: string;
        type: string;
        card?: {
          brand: string;
          last4: string;
          expMonth: number;
          expYear: number;
        };
        isDefault?: boolean;
        isActive?: boolean;
      }>;
    };
  }> {
    const response = await apiResponse(api.get('/payments/payment-methods'));
    return response;
  },

  // Add payment method for customer
  async addPaymentMethod(paymentMethodData: {
    type: 'card';
    card: {
      number: string;
      exp_month: number;
      exp_year: number;
      cvc: string;
    };
    billing_details?: {
      name?: string;
      email?: string;
    };
  }): Promise<{
    success: boolean;
    message: string;
    data: {
      paymentMethod: any;
      paymentMethods: any[];
    };
  }> {
    const response = await apiResponse(api.post('/payments/payment-methods', paymentMethodData));
    return response;
  },

  // Delete payment method for customer
  async deletePaymentMethod(paymentMethodId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await apiResponse(api.delete(`/payments/payment-methods/${paymentMethodId}`));
    return response;
  },

  // Set default payment method for customer
  async setDefaultPaymentMethod(paymentMethodId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await apiResponse(api.post(`/payments/payment-methods/${paymentMethodId}/default`));
    return response;
  },

  // ==================== ARRANGEMENTS/FINANCING ====================

  // Get customer's arrangements (financing options)
  async getCustomerArrangements(): Promise<{
    success: boolean;
    data: {
      arrangements: Array<{
        _id: string;
        date: string;
        amount: number;
        notes?: string;
        status: 'pending' | 'active' | 'completed' | 'cancelled';
        type: 'installment' | 'payment_plan' | 'deferred' | 'other';
        dueDate: string;
        createdAt: string;
        // Additional fields for financing display
        term?: number;
        interestRate?: number;
        monthlyPayment?: number;
        totalCost?: number;
        remainingBalance?: number;
        nextPaymentDate?: string;
      }>;
    };
  }> {
    // For customer view, we'll get their own arrangements
    const response = await apiResponse(api.get('/customers/me/arrangements'));
    return response;
  },

  // Add arrangement for customer
  async addArrangement(arrangementData: {
    date?: string;
    amount: number;
    notes?: string;
    status?: 'pending' | 'active' | 'completed' | 'cancelled';
    type?: 'installment' | 'payment_plan' | 'deferred' | 'other';
    dueDate: string;
    term?: number;
    interestRate?: number;
    monthlyPayment?: number;
    totalCost?: number;
  }): Promise<{
    success: boolean;
    message: string;
    data: {
      arrangement: any;
      arrangements: any[];
    };
  }> {
    const response = await apiResponse(api.post('/customers/me/arrangements', arrangementData));
    return response;
  },

  // Update arrangement for customer
  async updateArrangement(arrangementId: string, arrangementData: {
    date?: string;
    amount?: number;
    notes?: string;
    status?: 'pending' | 'active' | 'completed' | 'cancelled';
    type?: 'installment' | 'payment_plan' | 'deferred' | 'other';
    dueDate?: string;
    term?: number;
    interestRate?: number;
    monthlyPayment?: number;
    totalCost?: number;
  }): Promise<{
    success: boolean;
    message: string;
    data: {
      arrangement: any;
      arrangements: any[];
    };
  }> {
    const response = await apiResponse(api.put(`/customers/me/arrangements/${arrangementId}`, arrangementData));
    return response;
  },

  // Delete arrangement for customer
  async deleteArrangement(arrangementId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await apiResponse(api.delete(`/customers/me/arrangements/${arrangementId}`));
    return response;
  }
};
