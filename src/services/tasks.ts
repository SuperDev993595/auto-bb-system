import api, { apiResponse } from './api';

export interface Task {
  _id: string;
  title: string;
  description: string;
  type: 'marketing' | 'sales' | 'collections' | 'appointments' | 'follow-up' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  assignedTo: string;
  assignedBy: string;
  customer?: string;
  dueDate: string;
  completedDate?: string;
  progress: number; // 0-100
  notes: Array<{
    _id: string;
    content: string;
    createdBy: string;
    createdAt: string;
  }>;
  attachments?: Array<{
    _id: string;
    filename: string;
    url: string;
    uploadedBy: string;
    uploadedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  description: string;
  type: 'marketing' | 'sales' | 'collections' | 'appointments' | 'follow-up' | 'maintenance';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string;
  customer?: string;
  dueDate: string;
  notes?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  type?: 'marketing' | 'sales' | 'collections' | 'appointments' | 'follow-up' | 'maintenance';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  customer?: string;
  dueDate?: string;
  progress?: number;
}

export interface TaskFilters {
  page?: number;
  limit?: number;
  status?: string;
  type?: string;
  priority?: string;
  assignedTo?: string;
  customer?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dueDateFrom?: string;
  dueDateTo?: string;
}

export interface TaskStats {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
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
}

export interface DailyProgress {
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
}

// Tasks service
export const taskService = {
  // Get all tasks with filtering and pagination
  async getTasks(filters: TaskFilters = {}): Promise<{
    success: boolean;
    data: {
      tasks: Task[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalTasks: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
  }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await apiResponse(api.get(`/tasks?${params.toString()}`));
    return response;
  },

  // Get single task by ID
  async getTask(id: string): Promise<{
    success: boolean;
    data: { task: Task };
  }> {
    const response = await apiResponse(api.get(`/tasks/${id}`));
    return response;
  },

  // Create new task
  async createTask(taskData: CreateTaskData): Promise<{
    success: boolean;
    message: string;
    data: { task: Task };
  }> {
    const response = await apiResponse(api.post('/tasks', taskData));
    return response;
  },

  // Update task
  async updateTask(id: string, taskData: UpdateTaskData): Promise<{
    success: boolean;
    message: string;
    data: { task: Task };
  }> {
    const response = await apiResponse(api.put(`/tasks/${id}`, taskData));
    return response;
  },

  // Delete task
  async deleteTask(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await apiResponse(api.delete(`/tasks/${id}`));
    return response;
  },

  // Update task status
  async updateTaskStatus(id: string, status: Task['status']): Promise<{
    success: boolean;
    message: string;
    data: { task: Task };
  }> {
    const response = await apiResponse(api.patch(`/tasks/${id}/status`, { status }));
    return response;
  },

  // Update task progress
  async updateTaskProgress(id: string, progress: number): Promise<{
    success: boolean;
    message: string;
    data: { task: Task };
  }> {
    const response = await apiResponse(api.patch(`/tasks/${id}/progress`, { progress }));
    return response;
  },

  // Add note to task
  async addTaskNote(id: string, note: string): Promise<{
    success: boolean;
    message: string;
    data: { task: Task };
  }> {
    const response = await apiResponse(api.post(`/tasks/${id}/notes`, { content: note }));
    return response;
  },

  // Get task statistics
  async getTaskStats(): Promise<{
    success: boolean;
    data: TaskStats;
  }> {
    const response = await apiResponse(api.get('/tasks/stats'));
    return response;
  },

  // Get daily progress
  async getDailyProgress(date?: string): Promise<{
    success: boolean;
    data: DailyProgress;
  }> {
    const params = date ? `?date=${date}` : '';
    const response = await apiResponse(api.get(`/tasks/daily-progress${params}`));
    return response;
  },

  // Get tasks by type
  async getTasksByType(type: Task['type']): Promise<{
    success: boolean;
    data: { tasks: Task[] };
  }> {
    const response = await apiResponse(api.get(`/tasks/type/${type}`));
    return response;
  },

  // Get overdue tasks
  async getOverdueTasks(): Promise<{
    success: boolean;
    data: { tasks: Task[] };
  }> {
    const response = await apiResponse(api.get('/tasks/overdue'));
    return response;
  },

  // Get my tasks (for Sub Admins)
  async getMyTasks(filters: Omit<TaskFilters, 'assignedTo'> = {}): Promise<{
    success: boolean;
    data: {
      tasks: Task[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalTasks: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
  }> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await apiResponse(api.get(`/tasks/my-tasks?${params.toString()}`));
    return response;
  },

  // Bulk update tasks
  async bulkUpdateTasks(taskIds: string[], updates: UpdateTaskData): Promise<{
    success: boolean;
    message: string;
    data: { updatedCount: number };
  }> {
    const response = await apiResponse(api.put('/tasks/bulk-update', { taskIds, updates }));
    return response;
  },

  // Search tasks
  async searchTasks(query: string): Promise<{
    success: boolean;
    data: { tasks: Task[] };
  }> {
    const response = await apiResponse(api.get(`/tasks/search?q=${encodeURIComponent(query)}`));
    return response;
  }
};
