import api, { apiResponse } from './api';

export interface WorkOrder {
  _id: string;
  workOrderNumber: string;
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
    licensePlate: string;
    mileage: number;
  };
  services: Array<{
    service: {
      _id: string;
      name: string;
      description: string;
    };
    description: string;
    laborHours: number;
    laborRate: number;
    parts: Array<{
      name: string;
      partNumber: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      inStock: boolean;
    }>;
    totalCost: number;
  }>;
  technician?: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  progress?: number; // Progress percentage (0-100)
  estimatedStartDate: string;
  estimatedCompletionDate: string;
  actualStartDate?: string;
  actualCompletionDate?: string;
  notes: string;
  customerNotes: string;
  totalLaborHours: number;
  totalLaborCost: number;
  totalPartsCost: number;
  totalCost: number;
  partsAvailability?: {
    allAvailable: boolean;
    missingParts: Array<any>;
    availableParts: Array<any>;
    totalMissing: number;
  };
  createdAt: string;
  updatedAt: string;
  hasInvoice?: boolean;
  invoiceId?: string;
  appointmentId?: string;
}

export interface JobBoardFilters {
  status?: string;
  technician?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ProgressUpdateData {
  progress: number;
  notes?: string;
}

export interface QCData {
  testDrive: boolean;
  visualInspection: boolean;
  notes?: string;
  actualCosts?: {
    parts: number;
    labor: number;
    total: number;
  };
}

// Work Orders service
export const workOrderService = {
  // Get work orders for job board
  async getJobBoardWorkOrders(filters: JobBoardFilters = {}): Promise<{
    success: boolean;
    data: {
      workOrders: WorkOrder[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalWorkOrders: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
  }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await apiResponse(api.get(`/services/workorders/jobboard?${params}`));
    return response;
  },

  // Get all work orders
  async getWorkOrders(filters: JobBoardFilters = {}): Promise<{
    success: boolean;
    data: {
      workOrders: WorkOrder[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalWorkOrders: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
  }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    const response = await apiResponse(api.get(`/services/workorders?${params}`));
    return response;
  },

  // Get work order by ID
  async getWorkOrder(id: string): Promise<{
    success: boolean;
    data: { workOrder: WorkOrder };
  }> {
    const response = await apiResponse(api.get(`/services/workorders/${id}`));
    return response;
  },

  // Start work on a work order
  async startWork(workOrderId: string, technicianId: string): Promise<{
    success: boolean;
    message: string;
    data: { workOrder: WorkOrder };
  }> {
    const response = await apiResponse(api.put(`/services/workorders/${workOrderId}/start`, {
      technicianId
    }));
    return response;
  },

  // Update work order progress
  async updateProgress(workOrderId: string, data: ProgressUpdateData): Promise<{
    success: boolean;
    message: string;
    data: { workOrder: WorkOrder };
  }> {
    const response = await apiResponse(api.put(`/services/workorders/${workOrderId}/progress`, data));
    return response;
  },

  // Complete work order with quality control
  async completeWorkOrder(workOrderId: string, qcData: QCData): Promise<{
    success: boolean;
    message: string;
    data: { workOrder: WorkOrder };
  }> {
    const response = await apiResponse(api.put(`/services/workorders/${workOrderId}/complete`, qcData));
    return response;
  },

  // Check parts availability
  async checkPartsAvailability(workOrderId: string): Promise<{
    success: boolean;
    message: string;
    data: {
      partsAvailability: {
        allAvailable: boolean;
        missingParts: Array<any>;
        availableParts: Array<any>;
        totalMissing: number;
      };
      workOrder: WorkOrder;
    };
  }> {
    const response = await apiResponse(api.put(`/services/workorders/${workOrderId}/check-parts`));
    return response;
  },

  // Create work order from appointment
  async createFromAppointment(appointmentId: string): Promise<{
    success: boolean;
    workOrder: WorkOrder;
    appointment: any;
    partsAvailability: any;
  }> {
    const response = await apiResponse(api.post(`/services/workorders/from-appointment`, {
      appointmentId
    }));
    return response;
  },

  // Update work order
  async updateWorkOrder(id: string, data: Partial<WorkOrder>): Promise<{
    success: boolean;
    message: string;
    data: { workOrder: WorkOrder };
  }> {
    const response = await apiResponse(api.put(`/services/workorders/${id}`, data));
    return response;
  },

  // Delete work order
  async deleteWorkOrder(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await apiResponse(api.delete(`/services/workorders/${id}`));
    return response;
  }
};
