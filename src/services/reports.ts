import api, { apiResponse } from './api';

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  userId?: string;
  customerId?: string;
  type?: string;
  format?: 'json' | 'pdf' | 'excel';
}

export interface DailyProgressReport {
  date: string;
  marketing: {
    completed: number;
    total: number;
    percentage: number;
  };
  sales: {
    completed: number;
    total: number;
    percentage: number;
  };
  collections: {
    completed: number;
    total: number;
    percentage: number;
  };
  appointments: {
    completed: number;
    total: number;
    percentage: number;
  };
  totalCompleted: number;
  totalTasks: number;
  overallPercentage: number;
}

export interface UserPerformanceReport {
  userId: string;
  userName: string;
  email: string;
  role: string;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  averageTaskDuration: number;
  tasksByType: {
    marketing: number;
    sales: number;
    collections: number;
    appointments: number;
    followUp: number;
    maintenance: number;
  };
  tasksByPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  dailyProgress: DailyProgressReport[];
}

export interface CustomerReport {
  customerId: string;
  customerName: string;
  totalVehicles: number;
  totalServices: number;
  totalSpent: number;
  lastServiceDate?: string;
  upcomingServices: Array<{
    serviceType: string;
    dueDate: string;
    vehicle: string;
  }>;
  communicationHistory: Array<{
    date: string;
    type: string;
    summary: string;
  }>;
  serviceHistory: Array<{
    date: string;
    serviceType: string;
    cost: number;
    vehicle: string;
  }>;
}

export interface WorkCompletionReport {
  date: string;
  totalWorkOrders: number;
  completedWorkOrders: number;
  totalRevenue: number;
  averageWorkOrderValue: number;
  workOrdersByType: {
    [key: string]: number;
  };
  topServices: Array<{
    serviceType: string;
    count: number;
    revenue: number;
  }>;
  technicianPerformance: Array<{
    technicianName: string;
    completedWorkOrders: number;
    totalRevenue: number;
    averageRating: number;
  }>;
}

export interface SuperAdminDailyReport {
  date: string;
  systemOverview: {
    totalUsers: number;
    activeUsers: number;
    totalCustomers: number;
    totalTasks: number;
  };
  dailyProgress: DailyProgressReport;
  userPerformance: UserPerformanceReport[];
  topPerformers: Array<{
    userId: string;
    userName: string;
    completionRate: number;
    tasksCompleted: number;
  }>;
  systemHealth: {
    databaseConnections: number;
    averageResponseTime: number;
    errorRate: number;
    uptime: number;
  };
}

// Reports service
export const reportService = {
  // Get daily progress report
  async getDailyProgress(date?: string): Promise<{
    success: boolean;
    data: DailyProgressReport;
  }> {
    const params = date ? `?date=${date}` : '';
    const response = await apiResponse(api.get(`/reports/daily-progress${params}`));
    return response;
  },

  // Get user performance report
  async getUserPerformance(userId?: string, filters?: ReportFilters): Promise<{
    success: boolean;
    data: UserPerformanceReport;
  }> {
    const params = new URLSearchParams();
    if (userId) params.append('userId', userId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const response = await apiResponse(api.get(`/reports/user-performance?${params.toString()}`));
    return response;
  },

  // Get customer report
  async getCustomerReport(customerId: string): Promise<{
    success: boolean;
    data: CustomerReport;
  }> {
    const response = await apiResponse(api.get(`/reports/customer/${customerId}`));
    return response;
  },

  // Get work completion report
  async getWorkCompletionReport(filters?: ReportFilters): Promise<{
    success: boolean;
    data: WorkCompletionReport;
  }> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const response = await apiResponse(api.get(`/reports/work-completion?${params.toString()}`));
    return response;
  },

  // Get Super Admin daily report
  async getSuperAdminDailyReport(date?: string): Promise<{
    success: boolean;
    data: SuperAdminDailyReport;
  }> {
    const params = date ? `?date=${date}` : '';
    const response = await apiResponse(api.get(`/reports/super-admin-daily${params}`));
    return response;
  },

  // Generate PDF report
  async generatePDFReport(reportType: string, filters?: ReportFilters): Promise<{
    success: boolean;
    data: { pdfUrl: string; filename: string };
  }> {
    const response = await apiResponse(api.post('/reports/generate-pdf', {
      reportType,
      filters
    }));
    return response;
  },

  // Email PDF report
  async emailPDFReport(reportType: string, email: string, filters?: ReportFilters): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await apiResponse(api.post('/reports/email-pdf', {
      reportType,
      email,
      filters
    }));
    return response;
  },

  // Get weekly progress trends
  async getWeeklyProgressTrends(weeks: number = 4): Promise<{
    success: boolean;
    data: {
      trends: Array<{
        week: string;
        marketing: number;
        sales: number;
        collections: number;
        appointments: number;
      }>;
      averages: {
        marketing: number;
        sales: number;
        collections: number;
        appointments: number;
      };
    };
  }> {
    const response = await apiResponse(api.get(`/reports/weekly-trends?weeks=${weeks}`));
    return response;
  },

  // Get activity log
  async getActivityLog(filters?: ReportFilters): Promise<{
    success: boolean;
    data: {
      activities: Array<{
        _id: string;
        userId: string;
        userName: string;
        action: string;
        details: string;
        timestamp: string;
        ipAddress?: string;
      }>;
      pagination: {
        currentPage: number;
        totalPages: number;
        totalActivities: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
  }> {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.userId) params.append('userId', filters.userId);
    
    const response = await apiResponse(api.get(`/reports/activity-log?${params.toString()}`));
    return response;
  },

  // Get system statistics
  async getSystemStats(): Promise<{
    success: boolean;
    data: {
      totalUsers: number;
      totalCustomers: number;
      totalTasks: number;
      totalAppointments: number;
      systemUptime: number;
      databaseSize: number;
      lastBackup: string;
    };
  }> {
    const response = await apiResponse(api.get('/reports/system-stats'));
    return response;
  },

  // Export report data
  async exportReportData(reportType: string, format: 'csv' | 'excel' | 'json', filters?: ReportFilters): Promise<{
    success: boolean;
    data: { downloadUrl: string; filename: string };
  }> {
    const response = await apiResponse(api.post('/reports/export', {
      reportType,
      format,
      filters
    }));
    return response;
  }
};
