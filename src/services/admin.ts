import api from './api';

// Types
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'sub_admin' | 'user';
  phone?: string;
  isActive: boolean;
  permissions?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  password?: string;
  role: 'super_admin' | 'sub_admin' | 'user';
  phone?: string;
  isActive?: boolean;
  permissions?: Record<string, any>;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: 'super_admin' | 'sub_admin' | 'user';
  phone?: string;
  isActive?: boolean;
  permissions?: Record<string, any>;
}

export interface UserStats {
  overview: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
  };
  roleDistribution: Array<{
    _id: string;
    count: number;
  }>;
  recentUsers: User[];
}

export interface SystemSettings {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  companyAddress: string;
  businessHours: {
    monday: { open: string; close: string };
    tuesday: { open: string; close: string };
    wednesday: { open: string; close: string };
    thursday: { open: string; close: string };
    friday: { open: string; close: string };
    saturday: { open: string; close: string };
    sunday: { open: string; close: string };
  };
  notificationSettings: {
    emailNotifications: boolean;
    smsNotifications: boolean;
    appointmentReminders: boolean;
    paymentReminders: boolean;
    systemAlerts: boolean;
  };
  securitySettings: {
    sessionTimeout: number;
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
    twoFactorAuth: boolean;
    loginAttempts: number;
  };
  backupSettings: {
    autoBackup: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    backupRetention: number;
    backupLocation: string;
  };
}

export interface SystemLog {
  id: number;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface SystemHealth {
  status: string;
  timestamp: string;
  uptime: number;
  memory: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  database: string;
  services: {
    auth: string;
    email: string;
    fileUpload: string;
    pdfGeneration: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalDocs?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
    total?: number;
  };
}

// Admin Service Class
class AdminService {
  // User Management
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: string;
  }): Promise<PaginatedResponse<User>> {
    const response = await api.get('/admin/users', { params });
    return response.data;
  }

  async getUserById(id: string): Promise<User> {
    const response = await api.get(`/admin/users/${id}`);
    return response.data.data;
  }

  async createUser(userData: CreateUserData): Promise<User> {
    const response = await api.post('/admin/users', userData);
    return response.data.data;
  }

  async updateUser(id: string, userData: UpdateUserData): Promise<User> {
    const response = await api.put(`/admin/users/${id}`, userData);
    return response.data.data;
  }

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/admin/users/${id}`);
  }

  async toggleUserStatus(id: string): Promise<{ isActive: boolean }> {
    const response = await api.patch(`/admin/users/${id}/toggle-status`);
    return response.data.data;
  }

  async getUserStats(): Promise<UserStats> {
    const response = await api.get('/admin/users/stats');
    return response.data.data;
  }

  // System Settings
  async getSystemSettings(): Promise<SystemSettings> {
    const response = await api.get('/admin/settings');
    return response.data.data;
  }

  async updateSystemSettings(settings: SystemSettings): Promise<SystemSettings> {
    const response = await api.put('/admin/settings', settings);
    return response.data.data;
  }

  // System Logs
  async getSystemLogs(params?: {
    page?: number;
    limit?: number;
    level?: string;
    search?: string;
  }): Promise<PaginatedResponse<SystemLog>> {
    const response = await api.get('/admin/logs', { params });
    return response.data;
  }

  // System Health
  async getSystemHealth(): Promise<SystemHealth> {
    const response = await api.get('/admin/health');
    return response.data.data;
  }
}

export default new AdminService();
