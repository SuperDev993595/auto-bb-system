import api from './api';

export interface Warranty {
  _id: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  vehicle: {
    _id: string;
    make: string;
    model: string;
    year: number;
    vin: string;
    mileage?: number;
  };
  warrantyType: 'manufacturer' | 'extended' | 'powertrain' | 'bumper_to_bumper' | 'custom';
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  mileageLimit?: number;
  currentMileage: number;
  coverage: {
    engine: boolean;
    transmission: boolean;
    electrical: boolean;
    suspension: boolean;
    brakes: boolean;
    cooling: boolean;
    fuel: boolean;
    exhaust: boolean;
    interior: boolean;
    exterior: boolean;
  };
  deductible: number;
  maxClaimAmount?: number;
  totalClaims: number;
  totalClaimAmount: number;
  status: 'active' | 'expired' | 'cancelled' | 'suspended';
  provider: {
    name?: string;
    contact?: {
      phone?: string;
      email?: string;
      address?: string;
    };
  };
  terms?: string;
  exclusions: string[];
  notes?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  isExpired: boolean;
  daysUntilExpiration: number;
  mileageRemaining?: number;
}

export interface WarrantyStats {
  totalWarranties: number;
  activeWarranties: number;
  expiringSoon: number;
  mileageExpiring: number;
  statusBreakdown: Array<{
    _id: string;
    count: number;
    totalClaims: number;
    totalClaimAmount: number;
  }>;
}

export interface WarrantyTypeStats {
  _id: string;
  count: number;
  activeCount: number;
  totalClaims: number;
  totalClaimAmount: number;
}

class WarrantyService {
  // Get all warranties with optional filters
  async getWarranties(filters?: {
    customer?: string;
    vehicle?: string;
    status?: string;
    warrantyType?: string;
  }): Promise<Warranty[]> {
    const params = new URLSearchParams();
    if (filters?.customer) params.append('customer', filters.customer);
    if (filters?.vehicle) params.append('vehicle', filters.vehicle);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.warrantyType) params.append('warrantyType', filters.warrantyType);

    const response = await api.get(`/warranties?${params.toString()}`);
    return response.data;
  }

  // Get a single warranty
  async getWarranty(id: string): Promise<Warranty> {
    const response = await api.get(`/warranties/${id}`);
    return response.data;
  }

  // Create a new warranty
  async createWarranty(data: Partial<Warranty>): Promise<Warranty> {
    const response = await api.post('/warranties', data);
    return response.data;
  }

  // Update a warranty
  async updateWarranty(id: string, data: Partial<Warranty>): Promise<Warranty> {
    const response = await api.put(`/warranties/${id}`, data);
    return response.data;
  }

  // Delete a warranty
  async deleteWarranty(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/warranties/${id}`);
    return response.data;
  }

  // Get customer warranties
  async getCustomerWarranties(customerId: string): Promise<Warranty[]> {
    const response = await api.get(`/warranties/customer/${customerId}`);
    return response.data;
  }

  // Get vehicle warranties
  async getVehicleWarranties(vehicleId: string): Promise<Warranty[]> {
    const response = await api.get(`/warranties/vehicle/${vehicleId}`);
    return response.data;
  }

  // Update warranty mileage
  async updateWarrantyMileage(id: string, currentMileage: number): Promise<Warranty> {
    const response = await api.patch(`/warranties/${id}/mileage`, { currentMileage });
    return response.data;
  }

  // Add warranty claim
  async addWarrantyClaim(id: string, claimAmount: number, claimDescription: string): Promise<Warranty> {
    const response = await api.patch(`/warranties/${id}/claim`, {
      claimAmount,
      claimDescription
    });
    return response.data;
  }

  // Get warranty statistics
  async getWarrantyStats(): Promise<WarrantyStats> {
    const response = await api.get('/warranties/stats/overview');
    return response.data;
  }

  // Get warranties by type
  async getWarrantyTypeStats(): Promise<WarrantyTypeStats[]> {
    const response = await api.get('/warranties/stats/by-type');
    return response.data;
  }
}

export const warrantyService = new WarrantyService();
