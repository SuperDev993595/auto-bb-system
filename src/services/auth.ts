import api, { apiResponse } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'sub_admin';
  permissions: string[];
  avatar?: string;
  phone?: string;
  lastLogin?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'super_admin' | 'sub_admin';
  permissions?: string[];
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Authentication service
export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiResponse(api.post<AuthResponse>('/auth/login', credentials));
    if (response.success) {
      localStorage.setItem('authToken', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      // Also set role and email separately for backward compatibility
      localStorage.setItem('role', response.data.user.role);
      localStorage.setItem('email', response.data.user.email);
    }
    return response;
  },

  // Register new user (Super Admin only)
  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await apiResponse(api.post<AuthResponse>('/auth/register', userData));
    return response;
  },

  // Get current user
  async getCurrentUser(): Promise<{ success: boolean; data: { user: User } }> {
    const response = await apiResponse(api.get<{ success: boolean; data: { user: User } }>('/auth/me'));
    return response;
  },

  // Change password
  async changePassword(passwordData: ChangePasswordData): Promise<{ success: boolean; message: string }> {
    const response = await apiResponse(api.put<{ success: boolean; message: string }>('/auth/change-password', passwordData));
    return response;
  },

  // Logout user
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    window.location.href = '/admin/login';
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  },

  // Get current user from localStorage
  getCurrentUserFromStorage(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Get auth token
  getToken(): string | null {
    return localStorage.getItem('authToken');
  },

  // Check if user has permission
  hasPermission(permission: string): boolean {
    const user = this.getCurrentUserFromStorage();
    return user?.permissions?.includes(permission) || user?.role === 'super_admin' || false;
  },

  // Check if user is Super Admin
  isSuperAdmin(): boolean {
    const user = this.getCurrentUserFromStorage();
    return user?.role === 'super_admin';
  },

  // Check if user is Sub Admin
  isSubAdmin(): boolean {
    const user = this.getCurrentUserFromStorage();
    return user?.role === 'sub_admin';
  }
};
