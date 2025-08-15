import api, { apiResponse } from './api';

export interface Customer {
  _id: string;
  businessName: string;
  contactPerson: {
    name: string;
    phone: string;
    email: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  vehicles: Array<{
    _id: string;
    make: string;
    model: string;
    year: number;
    vin: string;
    licensePlate: string;
    mileage: number;
    color: string;
  }>;
  serviceHistory: Array<{
    _id: string;
    date: string;
    serviceType: string;
    description: string;
    cost: number;
    vehicleId: string;
    technician: string;
  }>;
  communicationLog: Array<{
    _id: string;
    date: string;
    type: 'phone' | 'email' | 'in-person';
    summary: string;
    notes: string;
    followUpDate?: string;
  }>;
  notes: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerData {
  businessName: string;
  contactPerson: {
    name: string;
    phone: string;
    email: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  notes?: string;
}

export interface UpdateCustomerData extends Partial<CreateCustomerData> {
  status?: 'active' | 'inactive';
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
    
    const response = await apiResponse(api.get(`/customers?${params.toString()}`));
    return response;
  },

  // Get single customer by ID
  async getCustomer(id: string): Promise<{
    success: boolean;
    data: { customer: Customer };
  }> {
    const response = await apiResponse(api.get(`/customers/${id}`));
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
  }
};
