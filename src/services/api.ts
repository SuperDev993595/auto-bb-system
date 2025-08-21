import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';

// API Response type
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// API Configuration
const API_BASE_URL = 'http://localhost:3001';

export const API_ENDPOINTS = {
  APPOINTMENTS: `${API_BASE_URL}/api/appointments`,
  CUSTOMERS: `${API_BASE_URL}/api/customers`,
  AUTH: `${API_BASE_URL}/api/auth`,
  SERVICES: `${API_BASE_URL}/api/services`,
  USERS: `${API_BASE_URL}/api/users`,
  TASKS: `${API_BASE_URL}/api/tasks`,
  INVENTORY: `${API_BASE_URL}/api/inventory`,
  INVOICES: `${API_BASE_URL}/api/invoices`,
  REMINDERS: `${API_BASE_URL}/api/reminders`,
  REPORTS: `${API_BASE_URL}/api/reports`,
  DASHBOARD: `${API_BASE_URL}/api/dashboard`,
  ADMIN: `${API_BASE_URL}/api/admin`,
  EMAIL: `${API_BASE_URL}/api/email`,
  UPLOAD: `${API_BASE_URL}/api/upload`,
  CHAT: `${API_BASE_URL}/api/chat`,
  MARKETING: `${API_BASE_URL}/api/marketing`,
  SALES: `${API_BASE_URL}/api/sales`,
  COLLECTIONS: `${API_BASE_URL}/api/collections`,
  YELLOWPAGES: `${API_BASE_URL}/api/yellowpages`,
  MAILCHIMP: `${API_BASE_URL}/api/mailchimp`,
  SMS: `${API_BASE_URL}/api/sms`,
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Helper function for API requests
export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(endpoint, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    console.log('API Request Interceptor - Token:', token ? 'Found' : 'Not found');
    console.log('API Request Interceptor - URL:', config.url);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('API Request Interceptor - Authorization header added');
    } else {
      console.log('API Request Interceptor - No token or headers, skipping Authorization');
    }
    return config;
  },
  (error) => {
    console.error('API Request Interceptor - Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    
    console.log('API Response Interceptor - Error Status:', error.response?.status);
    console.log('API Response Interceptor - Error URL:', error.config?.url);
    console.log('API Response Interceptor - Error Message:', message);
    
    // Handle authentication errors - only clear token for specific auth endpoints
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      console.log('API Response Interceptor - 401 Error on URL:', url);
      
      // Only clear token for auth-related endpoints, not for data endpoints
      if (url.includes('/auth/me') || url.includes('/auth/verify')) {
        console.log('API Response Interceptor - Clearing auth for auth endpoint');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        localStorage.removeItem('email');
        window.location.href = '/auth/login';
        toast.error('Session expired. Please login again.');
      } else {
        console.log('API Response Interceptor - 401 on data endpoint, not clearing token');
        toast.error('Authentication required. Please login again.');
      }
    } else if (error.response?.status === 403) {
      toast.error('Access denied. You don\'t have permission for this action.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// API response wrapper
export const apiResponse = async <T>(promise: Promise<AxiosResponse<T>>): Promise<T> => {
  try {
    const response = await promise;
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;
