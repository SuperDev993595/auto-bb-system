import api, { apiResponse } from './api';

// Service Catalog Interfaces
export interface ServiceCatalogItem {
  _id: string;
  name: string;
  description: string;
  category: 'maintenance' | 'repair' | 'diagnostic' | 'inspection' | 'emergency' | 'preventive' | 'other';
  estimatedDuration: number;
  laborRate: number;
  parts?: {
    name: string;
    partNumber?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    inStock: boolean;
  }[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceCatalogData {
  name: string;
  description: string;
  category: ServiceCatalogItem['category'];
  estimatedDuration: number;
  laborRate: number;
  parts?: ServiceCatalogItem['parts'];
  isActive?: boolean;
}

export interface UpdateServiceCatalogData {
  name?: string;
  description?: string;
  category?: ServiceCatalogItem['category'];
  estimatedDuration?: number;
  laborRate?: number;
  parts?: ServiceCatalogItem['parts'];
  isActive?: boolean;
}

// Work Order Interfaces
export interface WorkOrder {
  _id: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  service: {
    _id: string;
    name: string;
    description: string;
  };
  vehicle: {
    make: string;
    model: string;
    year: string;
    vin: string;
  };
  technician?: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedStartDate: string;
  estimatedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  laborHours: number;
  laborRate: number;
  partsCost: number;
  totalCost: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Form data interface for the modal
export interface WorkOrderFormData {
  customerId: string;
  serviceId: string;
  vehicleId: string;
  technicianId: string;
  priority: WorkOrder['priority'];
  estimatedStartDate: string;
  estimatedEndDate: string;
  laborHours: number;
  laborRate: number;
  partsCost: number;
  notes: string;
}

export interface CreateWorkOrderData {
  customer: string;
  vehicle: {
    make: string;
    model: string;
    year: number;
    vin: string;
    licensePlate: string;
    mileage: number;
  };
  services: Array<{
    service: string;
    description: string;
    laborHours: number;
    laborRate: number;
    parts: Array<{
      name: string;
      partNumber?: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      inStock: boolean;
    }>;
    totalCost: number;
  }>;
  technician?: string;
  priority?: WorkOrder['priority'];
  estimatedStartDate: string;
  estimatedCompletionDate: string;
  notes?: string;
}

export interface UpdateWorkOrderData {
  serviceId?: string;
  technicianId?: string;
  status?: WorkOrder['status'];
  priority?: WorkOrder['priority'];
  estimatedStartDate?: string;
  estimatedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  laborHours?: number;
  laborRate?: number;
  partsCost?: number;
  notes?: string;
}

// Technician Interfaces
export interface Technician {
  _id: string;
  name: string;
  email: string;
  phone: string;
  specialization: string[];
  hourlyRate: number;
  isActive: boolean;
  skills: string[];
  certifications: string[];
  experience: number;
  availability: {
    monday: { start: string; end: string; available: boolean };
    tuesday: { start: string; end: string; available: boolean };
    wednesday: { start: string; end: string; available: boolean };
    thursday: { start: string; end: string; available: boolean };
    friday: { start: string; end: string; available: boolean };
    saturday: { start: string; end: string; available: boolean };
    sunday: { start: string; end: string; available: boolean };
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTechnicianData {
  name: string;
  email: string;
  phone: string;
  specialization: string[];
  hourlyRate: number;
  skills: string[];
  certifications: string[];
  experience: number;
  availability: Technician['availability'];
  isActive?: boolean;
}

export interface UpdateTechnicianData {
  name?: string;
  email?: string;
  phone?: string;
  specialization?: string[];
  hourlyRate?: number;
  skills?: string[];
  certifications?: string[];
  experience?: number;
  availability?: Technician['availability'];
  isActive?: boolean;
}

// Filter Interfaces
export interface ServiceCatalogFilters {
  category?: ServiceCatalogItem['category'];
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface WorkOrderFilters {
  status?: WorkOrder['status'];
  priority?: WorkOrder['priority'];
  customerId?: string;
  technicianId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TechnicianFilters {
  specialization?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// Statistics Interfaces
export interface ServiceStats {
  totalServices: number;
  activeServices: number;
  inactiveServices: number;
  byCategory: { category: string; count: number }[];
  avgLaborRate: number;
  totalEstimatedDuration: number;
}

export interface WorkOrderStats {
  totalWorkOrders: number;
  pendingCount: number;
  inProgressCount: number;
  completedCount: number;
  cancelledCount: number;
  onHoldCount: number;
  avgCompletionTime: number;
  totalRevenue: number;
  byStatus: { status: string; count: number }[];
  byPriority: { priority: string; count: number }[];
}

export interface TechnicianStats {
  totalTechnicians: number;
  activeTechnicians: number;
  inactiveTechnicians: number;
  avgHourlyRate: number;
  totalExperience: number;
  bySpecialization: { specialization: string; count: number }[];
}

class ServiceManagementService {
  // Service Catalog Methods
  async getServiceCatalog(filters: ServiceCatalogFilters = {}): Promise<{ data: ServiceCatalogItem[]; pagination: any }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    return apiResponse(api.get(`/services/catalog?${params.toString()}`));
  }

  async getServiceCatalogItem(id: string): Promise<ServiceCatalogItem> {
    return apiResponse(api.get(`/services/catalog/${id}`));
  }

  async createServiceCatalogItem(data: CreateServiceCatalogData): Promise<ServiceCatalogItem> {
    return apiResponse(api.post('/services/catalog', data));
  }

  async updateServiceCatalogItem(id: string, data: UpdateServiceCatalogData): Promise<ServiceCatalogItem> {
    return apiResponse(api.put(`/services/catalog/${id}`, data));
  }

  async deleteServiceCatalogItem(id: string): Promise<{ message: string }> {
    return apiResponse(api.delete(`/services/catalog/${id}`));
  }

  async getServiceCatalogStats(): Promise<ServiceStats> {
    return apiResponse(api.get('/services/catalog/stats/overview'));
  }

  // Work Order Methods
  async getWorkOrders(filters: WorkOrderFilters = {}): Promise<apiResponse<{ data: WorkOrder[]; pagination: any }>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    return api.get(`/services/workorders?${params.toString()}`);
  }

  async getWorkOrder(id: string): Promise<apiResponse<WorkOrder>> {
    return api.get(`/services/workorders/${id}`);
  }

  async createWorkOrder(data: CreateWorkOrderData): Promise<WorkOrder> {
    return apiResponse(api.post('/services/workorders', data));
  }

  async updateWorkOrder(id: string, data: UpdateWorkOrderData): Promise<apiResponse<WorkOrder>> {
    return api.put(`/services/workorders/${id}`, data);
  }

  async deleteWorkOrder(id: string): Promise<apiResponse<{ message: string }>> {
    return api.delete(`/services/workorders/${id}`);
  }

  async updateWorkOrderStatus(id: string, status: WorkOrder['status']): Promise<apiResponse<WorkOrder>> {
    return api.patch(`/services/workorders/${id}/status`, { status });
  }

  async assignTechnician(id: string, technicianId: string): Promise<apiResponse<WorkOrder>> {
    return api.post(`/services/workorders/${id}/assign-technician`, { technicianId });
  }

  async getWorkOrderStats(startDate?: string, endDate?: string): Promise<apiResponse<WorkOrderStats>> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/services/workorders/stats/overview?${params.toString()}`);
  }

  // Technician Methods
  async getTechnicians(filters: TechnicianFilters = {}): Promise<apiResponse<{ data: Technician[]; pagination: any }>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    return api.get(`/services/technicians?${params.toString()}`);
  }

  async getTechnician(id: string): Promise<apiResponse<Technician>> {
    return api.get(`/services/technicians/${id}`);
  }

  async createTechnician(data: CreateTechnicianData): Promise<apiResponse<Technician>> {
    return api.post('/services/technicians', data);
  }

  async updateTechnician(id: string, data: UpdateTechnicianData): Promise<apiResponse<Technician>> {
    return api.put(`/services/technicians/${id}`, data);
  }

  async deleteTechnician(id: string): Promise<apiResponse<{ message: string }>> {
    return api.delete(`/services/technicians/${id}`);
  }

  async getTechnicianStats(): Promise<apiResponse<TechnicianStats>> {
    return api.get('/services/technicians/stats/overview');
  }

  async getAvailableTechnicians(date: string, timeSlot?: string): Promise<apiResponse<Technician[]>> {
    const params = new URLSearchParams({ date });
    if (timeSlot) params.append('timeSlot', timeSlot);
    return api.get(`/services/technicians/available?${params.toString()}`);
  }

  // General Service Methods
  async getServiceCategories(): Promise<apiResponse<string[]>> {
    return api.get('/services/categories');
  }

  async getSpecializations(): Promise<apiResponse<string[]>> {
    return api.get('/services/specializations');
  }
}

export const serviceManagementService = new ServiceManagementService();
export default serviceManagementService;
