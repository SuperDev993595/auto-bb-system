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
  workOrderNumber: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  services: Array<{
    service: {
      _id: string;
      name: string;
      description: string;
    };
    description?: string;
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
  vehicle: {
    make: string;
    model: string;
    year: number;
    vin?: string;
    licensePlate?: string;
    mileage?: number;
  };
  technician?: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedStartDate?: string;
  estimatedCompletionDate?: string;
  actualStartDate?: string;
  actualCompletionDate?: string;
  totalLaborHours: number;
  totalLaborCost: number;
  totalPartsCost: number;
  totalCost: number;
  notes?: string;
  customerNotes?: string;
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
  services?: Array<{
    service: string;
    description?: string;
    laborHours: number;
    laborRate: number;
    parts?: Array<{
      name: string;
      partNumber?: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      inStock: boolean;
    }>;
    totalCost: number;
  }>;
  technicianId?: string;
  status?: WorkOrder['status'];
  priority?: WorkOrder['priority'];
  estimatedStartDate?: string;
  estimatedCompletionDate?: string;
  actualStartDate?: string;
  actualCompletionDate?: string;
  notes?: string;
  customerNotes?: string;
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
    const response = await apiResponse(api.get(`/services/catalog?${params.toString()}`));
    console.log('getServiceCatalog API response:', response);
    return response;
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
    const response = await apiResponse(api.get('/services/catalog/stats/overview'));
    console.log('getServiceCatalogStats API response:', response);
    return response;
  }

  // Work Order Methods
  async getWorkOrders(filters: WorkOrderFilters = {}): Promise<{ data: WorkOrder[]; pagination: any }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    const response = await apiResponse(api.get(`/services/workorders?${params.toString()}`));
    console.log('getWorkOrders API response:', response);
    return response;
  }

  async getWorkOrder(id: string): Promise<WorkOrder> {
    return apiResponse(api.get(`/services/workorders/${id}`));
  }

  async createWorkOrder(data: CreateWorkOrderData): Promise<WorkOrder> {
    return apiResponse(api.post('/services/workorders', data));
  }

  async updateWorkOrder(id: string, data: UpdateWorkOrderData): Promise<WorkOrder> {
    return apiResponse(api.put(`/services/workorders/${id}`, data));
  }

  async deleteWorkOrder(id: string): Promise<{ message: string }> {
    return apiResponse(api.delete(`/services/workorders/${id}`));
  }

  async updateWorkOrderStatus(id: string, status: WorkOrder['status']): Promise<WorkOrder> {
    return apiResponse(api.patch(`/services/workorders/${id}/status`, { status }));
  }

  async assignTechnician(id: string, technicianId: string): Promise<WorkOrder> {
    return apiResponse(api.post(`/services/workorders/${id}/assign-technician`, { technicianId }));
  }

  async getWorkOrderStats(startDate?: string, endDate?: string): Promise<WorkOrderStats> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const response = await apiResponse(api.get(`/services/workorders/stats/overview?${params.toString()}`));
    console.log('getWorkOrderStats API response:', response);
    return response;
  }

  // Technician Methods
  async getTechnicians(filters: TechnicianFilters = {}): Promise<{ data: Technician[]; pagination: any }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    const response = await apiResponse(api.get(`/services/technicians?${params.toString()}`));
    console.log('getTechnicians API response:', response);
    return response;
  }

  async getTechnician(id: string): Promise<Technician> {
    return apiResponse(api.get(`/services/technicians/${id}`));
  }

  async createTechnician(data: CreateTechnicianData): Promise<Technician> {
    return apiResponse(api.post('/services/technicians', data));
  }

  async updateTechnician(id: string, data: UpdateTechnicianData): Promise<Technician> {
    return apiResponse(api.put(`/services/technicians/${id}`, data));
  }

  async deleteTechnician(id: string): Promise<{ message: string }> {
    return apiResponse(api.delete(`/services/technicians/${id}`));
  }

  async getTechnicianStats(): Promise<TechnicianStats> {
    const response = await apiResponse(api.get('/services/technicians/stats/overview'));
    console.log('getTechnicianStats API response:', response);
    return response;
  }

  async getAvailableTechnicians(date: string, timeSlot?: string): Promise<Technician[]> {
    const params = new URLSearchParams({ date });
    if (timeSlot) params.append('timeSlot', timeSlot);
    const response = await apiResponse(api.get(`/services/technicians/available?${params.toString()}`));
    console.log('getAvailableTechnicians API response:', response);
    return response;
  }

  // General Service Methods
  async getServiceCategories(): Promise<string[]> {
    const response = await apiResponse(api.get('/services/categories'));
    console.log('getServiceCategories API response:', response);
    return response;
  }

  async getSpecializations(): Promise<string[]> {
    const response = await apiResponse(api.get('/services/specializations'));
    console.log('getSpecializations API response:', response);
    return response;
  }
}

export const serviceManagementService = new ServiceManagementService();
export default serviceManagementService;
