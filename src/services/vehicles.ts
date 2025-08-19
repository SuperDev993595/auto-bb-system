import api, { apiResponse } from './api';

export interface Vehicle {
  _id: string;
  year: number;
  make: string;
  model: string;
  vin: string;
  licensePlate: string;
  color: string;
  mileage: number;
  status: 'active' | 'inactive' | 'maintenance';
  fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric' | 'other';
  transmission: 'automatic' | 'manual' | 'cvt' | 'other';
  lastServiceDate?: string;
  nextServiceDate?: string;
  customer?: {
    _id: string;
    name: string;
    email: string;
    businessName?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface VehicleFilters {
  page?: number;
  limit?: number;
  customer?: string;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const vehicleService = {
  // Get all vehicles with filtering and pagination
  async getVehicles(filters: VehicleFilters = {}): Promise<{
    success: boolean;
    data: {
      vehicles: Vehicle[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalVehicles: number;
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
    
    const response = await apiResponse(api.get(`/customers/vehicles/all?${params.toString()}`));
    return response;
  },

  // Get single vehicle by ID
  async getVehicle(id: string): Promise<{
    success: boolean;
    data: { vehicle: Vehicle };
  }> {
    const response = await apiResponse(api.get(`/customers/vehicles/${id}`));
    return response;
  },

  // Get vehicles for a specific customer
  async getCustomerVehicles(customerId: string): Promise<{
    success: boolean;
    data: { vehicles: Vehicle[] };
  }> {
    const response = await apiResponse(api.get(`/customers/${customerId}/vehicles`));
    return response;
  }
};
