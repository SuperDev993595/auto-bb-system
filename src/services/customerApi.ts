import api from './api';

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  businessName?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  preferences: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    reminders: {
      appointments: boolean;
      maintenance: boolean;
      payments: boolean;
    };
    privacy: {
      shareData: boolean;
      marketing: boolean;
    };
  };
  createdAt: string;
  lastLogin: string;
}

export interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  vin: string;
  licensePlate: string;
  color: string;
  mileage: number;
  engineType?: string;
  transmission?: string;
  fuelType?: string;
  lastServiceDate?: string;
  nextServiceDate?: string;
  lastServiceMileage?: number;
  nextServiceMileage?: number;
  status: 'active' | 'inactive' | 'maintenance';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  date: string;
  time: string;
  serviceType: string;
  vehicleId: string;
  vehicleInfo?: string;
  notes?: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  estimatedDuration?: string;
  technician?: string;
  totalCost?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRecord {
  id: string;
  date: string;
  vehicleId: string;
  vehicleInfo?: string;
  serviceType: string;
  description: string;
  technician: string;
  mileage: number;
  cost: number;
  nextServiceDate?: string;
  nextServiceMileage?: number;
  status: 'completed' | 'in-progress' | 'scheduled';
  parts?: Array<{
    name: string;
    partNumber?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  notes?: string;
  warranty?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  vehicleId: string;
  vehicleInfo?: string;
  serviceType: string;
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'pending' | 'overdue' | 'cancelled';
  paymentMethod?: string;
  paymentDate?: string;
  paymentReference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  subject: string;
  message: string;
  from: string;
  date: string;
  isRead: boolean;
  type: 'appointment' | 'reminder' | 'general' | 'service';
}

export interface Notification {
  id: string;
  type: 'service_reminder' | 'appointment_reminder' | 'appointment_confirmation' | 'payment_reminder' | 'maintenance_alert' | 'warranty_expiry' | 'follow_up' | 'marketing' | 'general';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channel: 'email' | 'sms' | 'push' | 'in_app';
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'read';
  scheduledFor: string;
  sentAt?: string;
  readAt?: string;
  relatedData?: {
    vehicleId?: string;
    appointmentId?: string;
    serviceId?: string;
    invoiceId?: string;
  };
  metadata?: {
    mileage?: number;
    serviceType?: string;
    dueDate?: string;
    amount?: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  stats: {
    vehicles: number;
    appointments: number;
    services: number;
    invoices: number;
    outstandingAmount: number;
  };
  recentAppointments: Appointment[];
  upcomingAppointments: Appointment[];
  recentServices: ServiceRecord[];
  outstandingInvoices: Invoice[];
}

class CustomerApiService {
  // Profile Management
  async getProfile(): Promise<{ success: boolean; data: { user: any; profile: CustomerProfile }; message?: string }> {
    const response = await api.get('/customers/profile');
    return response.data;
  }

  async updateProfile(profileData: Partial<CustomerProfile>): Promise<{ success: boolean; data: { user: any }; message?: string }> {
    const response = await api.put('/customers/profile', profileData);
    return response.data;
  }

  // Vehicle Management
  async getVehicles(): Promise<{ success: boolean; data: { vehicles: Vehicle[] }; message?: string }> {
    const response = await api.get('/customers/vehicles');
    return response.data;
  }

  async addVehicle(vehicleData: Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; data: { vehicle: Vehicle }; message?: string }> {
    const response = await api.post('/customers/vehicles', vehicleData);
    return response.data;
  }

  async updateVehicle(id: string, vehicleData: Partial<Vehicle>): Promise<{ success: boolean; data: { vehicle: Vehicle }; message?: string }> {
    const response = await api.put(`/customers/vehicles/${id}`, vehicleData);
    return response.data;
  }

  async deleteVehicle(id: string): Promise<{ success: boolean; message?: string }> {
    const response = await api.delete(`/customers/vehicles/${id}`);
    return response.data;
  }

  // Appointment Management
  async getAppointments(): Promise<{ success: boolean; data: { appointments: Appointment[] }; message?: string }> {
    const response = await api.get('/customers/appointments');
    return response.data;
  }

  async createAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; data: { appointment: Appointment }; message?: string }> {
    const response = await api.post('/customers/appointments', appointmentData);
    return response.data;
  }

  async updateAppointment(id: string, appointmentData: Partial<Appointment>): Promise<{ success: boolean; data: { appointment: Appointment }; message?: string }> {
    const response = await api.put(`/customers/appointments/${id}`, appointmentData);
    return response.data;
  }

  async cancelAppointment(id: string): Promise<{ success: boolean; data: { appointment: Appointment }; message?: string }> {
    const response = await api.delete(`/customers/appointments/${id}`);
    return response.data;
  }

  async confirmAppointment(id: string): Promise<{ success: boolean; data: { appointment: Appointment }; message?: string }> {
    const response = await api.put(`/customers/appointments/${id}/confirm`);
    return response.data;
  }

  // Service History
  async getServices(): Promise<{ success: boolean; data: { services: ServiceRecord[] }; message?: string }> {
    const response = await api.get('/customers/services');
    return response.data;
  }

  // Invoice Management
  async getInvoices(): Promise<{ success: boolean; data: { invoices: Invoice[] }; message?: string }> {
    const response = await api.get('/customers/invoices');
    return response.data;
  }

  async payInvoice(id: string, paymentData: { paymentMethod?: string; paymentReference?: string }): Promise<{ success: boolean; data: { invoice: Invoice }; message?: string }> {
    const response = await api.post(`/customers/invoices/${id}/pay`, paymentData);
    return response.data;
  }

  async downloadInvoice(id: string): Promise<{ success: boolean; data: { downloadUrl: string }; message?: string }> {
    const response = await api.get(`/customers/invoices/${id}/download`);
    return response.data;
  }

  // Messages
  async getMessages(): Promise<{ success: boolean; data: { messages: Message[] }; message?: string }> {
    const response = await api.get('/customers/messages');
    return response.data;
  }

  async sendMessage(messageData: Omit<Message, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; data: { message: Message }; message?: string }> {
    const response = await api.post('/customers/messages', messageData);
    return response.data;
  }

  async markMessageAsRead(id: string): Promise<{ success: boolean; data: { message: Message }; message?: string }> {
    const response = await api.put(`/customers/messages/${id}/read`);
    return response.data;
  }

  async deleteMessage(id: string): Promise<{ success: boolean; message?: string }> {
    const response = await api.delete(`/customers/messages/${id}`);
    return response.data;
  }

  // Dashboard Data
  async getDashboardData(): Promise<{ success: boolean; data: DashboardData; message?: string }> {
    const response = await api.get('/customers/dashboard');
    return response.data;
  }

  // Notifications
  async getNotifications(page = 1, limit = 20, type?: string, status?: string): Promise<{ success: boolean; data: { notifications: Notification[], unreadCount: number, pagination: any }; message?: string }> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (type) params.append('type', type);
    if (status) params.append('status', status);
    
    const response = await api.get(`/customers/notifications?${params}`);
    return response.data;
  }

  async markNotificationAsRead(id: string): Promise<{ success: boolean; data: { notification: Notification }; message?: string }> {
    const response = await api.put(`/customers/notifications/${id}/read`);
    return response.data;
  }

  async markAllNotificationsAsRead(): Promise<{ success: boolean; message?: string }> {
    const response = await api.put('/customers/notifications/read-all');
    return response.data;
  }

  // Technicians
  async getTechnicians(): Promise<{ success: boolean; data: { technicians: any[] }; message?: string }> {
    const response = await api.get('/customers/technicians');
    return response.data;
  }
}

export const customerApiService = new CustomerApiService();
