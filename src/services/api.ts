import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem('authToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
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
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      localStorage.removeItem('email');
      window.location.href = '/admin/login';
      toast.error('Session expired. Please login again.');
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
