import api from './api';

// Define the API response type
type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

export interface Appointment {
  _id: string;
  customer: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  date: string;
  time: string;
  service: string;
  vehicle: {
    make: string;
    model: string;
    year: string;
    vin: string;
  };
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  estimatedCost?: number;
  actualCost?: number;
  technician?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentData {
  customerId: string;
  scheduledDate: string;
  scheduledTime: string;
  serviceType: string;
  vehicleId: string;
  notes?: string;
  estimatedDuration?: number;
  technicianId?: string;
}

export interface UpdateAppointmentData {
  scheduledDate?: string;
  scheduledTime?: string;
  service?: string;
  status?: Appointment['status'];
  notes?: string;
  estimatedCost?: number;
  actualCost?: number;
  technicianId?: string;
}

export interface AppointmentFilters {
  date?: string;
  status?: Appointment['status'];
  customerId?: string;
  technicianId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface AppointmentStats {
  totalAppointments: number;
  scheduledCount: number;
  confirmedCount: number;
  inProgressCount: number;
  completedCount: number;
  cancelledCount: number;
  noShowCount: number;
  todayAppointments: number;
  weeklyAppointments: number;
  monthlyAppointments: number;
}

class AppointmentService {
  // Get all appointments with filters
  async getAppointments(filters: AppointmentFilters = {}): Promise<{ success: boolean; data: { appointments: Appointment[]; pagination: any }; message?: string }> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Map technicianId to technician for backend compatibility
        const paramKey = key === 'technicianId' ? 'technician' : key;
        params.append(paramKey, value.toString());
      }
    });

    const response = await api.get(`/appointments?${params.toString()}`);
    return response.data;
  }

  // Get single appointment by ID
  async getAppointment(id: string): Promise<ApiResponse<{ appointment: Appointment }>> {
    const response = await api.get(`/appointments/${id}`);
    return response.data;
  }

  // Create new appointment
  async createAppointment(data: CreateAppointmentData): Promise<ApiResponse<{ appointment: Appointment }>> {
    const response = await api.post('/appointments', data);
    return response.data;
  }

  // Update appointment
  async updateAppointment(id: string, data: UpdateAppointmentData): Promise<ApiResponse<{ appointment: Appointment }>> {
    const response = await api.put(`/appointments/${id}`, data);
    return response.data;
  }

  // Delete appointment
  async deleteAppointment(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await api.delete(`/appointments/${id}`);
    return response.data;
  }

  // Update appointment status
  async updateStatus(id: string, status: Appointment['status']): Promise<ApiResponse<{ appointment: Appointment }>> {
    const response = await api.patch(`/appointments/${id}/status`, { status });
    return response.data;
  }

  // Get appointment statistics
  async getStats(startDate?: string, endDate?: string): Promise<ApiResponse<{ stats: AppointmentStats }>> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get(`/appointments/stats/overview?${params.toString()}`);
    return response.data;
  }

  // Get appointments by date range
  async getAppointmentsByDateRange(startDate: string, endDate: string): Promise<ApiResponse<Appointment[]>> {
    const response = await api.get(`/appointments/date-range?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  }

  // Get today's appointments
  async getTodayAppointments(): Promise<ApiResponse<Appointment[]>> {
    const response = await api.get('/appointments/today');
    return response.data;
  }

  // Get upcoming appointments
  async getUpcomingAppointments(days: number = 7): Promise<ApiResponse<Appointment[]>> {
    const response = await api.get(`/appointments/upcoming?days=${days}`);
    return response.data;
  }

  // Confirm appointment
  async confirmAppointment(id: string): Promise<ApiResponse<{ appointment: Appointment }>> {
    const response = await api.post(`/appointments/${id}/confirm`);
    return response.data;
  }

  // Cancel appointment
  async cancelAppointment(id: string, reason?: string): Promise<ApiResponse<{ appointment: Appointment }>> {
    const response = await api.post(`/appointments/${id}/cancel`, { reason });
    return response.data;
  }

  // Mark as no-show
  async markAsNoShow(id: string): Promise<ApiResponse<{ appointment: Appointment }>> {
    const response = await api.post(`/appointments/${id}/no-show`);
    return response.data;
  }

  // Assign technician
  async assignTechnician(id: string, technicianId: string): Promise<ApiResponse<{ appointment: Appointment }>> {
    const response = await api.post(`/appointments/${id}/assign-technician`, { technicianId });
    return response.data;
  }

  // Get available time slots
  async getAvailableTimeSlots(date: string, serviceId?: string): Promise<ApiResponse<string[]>> {
    const params = new URLSearchParams({ date });
    if (serviceId) params.append('serviceId', serviceId);
    
    const response = await api.get(`/appointments/available-slots?${params.toString()}`);
    return response.data;
  }


}

export const appointmentService = new AppointmentService();
export default appointmentService;
