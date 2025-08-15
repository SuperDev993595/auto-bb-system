import api, { apiResponse } from './api';

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
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
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
  date: string;
  time: string;
  service: string;
  vehicleId: string;
  notes?: string;
  estimatedCost?: number;
  technicianId?: string;
}

export interface UpdateAppointmentData {
  date?: string;
  time?: string;
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
  async getAppointments(filters: AppointmentFilters = {}): Promise<apiResponse<{ data: Appointment[]; pagination: any }>> {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });

    return api.get(`/appointments?${params.toString()}`);
  }

  // Get single appointment by ID
  async getAppointment(id: string): Promise<apiResponse<Appointment>> {
    return api.get(`/appointments/${id}`);
  }

  // Create new appointment
  async createAppointment(data: CreateAppointmentData): Promise<apiResponse<Appointment>> {
    return api.post('/appointments', data);
  }

  // Update appointment
  async updateAppointment(id: string, data: UpdateAppointmentData): Promise<apiResponse<Appointment>> {
    return api.put(`/appointments/${id}`, data);
  }

  // Delete appointment
  async deleteAppointment(id: string): Promise<apiResponse<{ message: string }>> {
    return api.delete(`/appointments/${id}`);
  }

  // Update appointment status
  async updateStatus(id: string, status: Appointment['status']): Promise<apiResponse<Appointment>> {
    return api.patch(`/appointments/${id}/status`, { status });
  }

  // Get appointment statistics
  async getStats(startDate?: string, endDate?: string): Promise<apiResponse<AppointmentStats>> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return api.get(`/appointments/stats/overview?${params.toString()}`);
  }

  // Get appointments by date range
  async getAppointmentsByDateRange(startDate: string, endDate: string): Promise<apiResponse<Appointment[]>> {
    return api.get(`/appointments/date-range?startDate=${startDate}&endDate=${endDate}`);
  }

  // Get today's appointments
  async getTodayAppointments(): Promise<apiResponse<Appointment[]>> {
    return api.get('/appointments/today');
  }

  // Get upcoming appointments
  async getUpcomingAppointments(days: number = 7): Promise<apiResponse<Appointment[]>> {
    return api.get(`/appointments/upcoming?days=${days}`);
  }

  // Confirm appointment
  async confirmAppointment(id: string): Promise<apiResponse<Appointment>> {
    return api.post(`/appointments/${id}/confirm`);
  }

  // Cancel appointment
  async cancelAppointment(id: string, reason?: string): Promise<apiResponse<Appointment>> {
    return api.post(`/appointments/${id}/cancel`, { reason });
  }

  // Mark as no-show
  async markAsNoShow(id: string): Promise<apiResponse<Appointment>> {
    return api.post(`/appointments/${id}/no-show`);
  }

  // Assign technician
  async assignTechnician(id: string, technicianId: string): Promise<apiResponse<Appointment>> {
    return api.post(`/appointments/${id}/assign-technician`, { technicianId });
  }

  // Get available time slots
  async getAvailableTimeSlots(date: string, serviceId?: string): Promise<apiResponse<string[]>> {
    const params = new URLSearchParams({ date });
    if (serviceId) params.append('serviceId', serviceId);
    
    return api.get(`/appointments/available-slots?${params.toString()}`);
  }

  // Check for scheduling conflicts
  async checkConflicts(data: CreateAppointmentData): Promise<apiResponse<{ hasConflicts: boolean; conflicts: any[] }>> {
    return api.post('/appointments/check-conflicts', data);
  }
}

export const appointmentService = new AppointmentService();
export default appointmentService;
