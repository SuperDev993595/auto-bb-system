import api, { apiResponse } from './api';

// Reminder Interfaces
export interface Reminder {
  _id: string;
  title: string;
  description?: string;
  type: 'appointment' | 'service_due' | 'follow_up' | 'payment' | 'custom';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  reminderDate: string;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  customer?: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  appointment?: {
    _id: string;
    date: string;
    time: string;
    service: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'pending' | 'sent' | 'acknowledged' | 'completed' | 'cancelled';
  notificationMethods: ('email' | 'sms' | 'push' | 'in_app')[];
  notes?: string;
  sentHistory: {
    method: string;
    sentAt: string;
    status: 'success' | 'failed';
    errorMessage?: string;
  }[];
  acknowledgments: {
    acknowledgedBy: {
      _id: string;
      name: string;
      email: string;
    };
    acknowledgedAt: string;
    notes?: string;
  }[];
  completions: {
    completedBy: {
      _id: string;
      name: string;
      email: string;
    };
    completedAt: string;
    notes?: string;
  }[];
  cancellations: {
    cancelledBy: {
      _id: string;
      name: string;
      email: string;
    };
    cancelledAt: string;
    reason?: string;
  }[];
  nextReminderDate?: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  updatedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateReminderData {
  title: string;
  description?: string;
  type: Reminder['type'];
  priority?: Reminder['priority'];
  dueDate: string;
  reminderDate: string;
  frequency?: Reminder['frequency'];
  customerId?: string;
  appointmentId?: string;
  assignedTo?: string;
  notificationMethods: Reminder['notificationMethods'];
  notes?: string;
}

export interface UpdateReminderData {
  title?: string;
  description?: string;
  type?: Reminder['type'];
  priority?: Reminder['priority'];
  dueDate?: string;
  reminderDate?: string;
  frequency?: Reminder['frequency'];
  customerId?: string;
  appointmentId?: string;
  assignedTo?: string;
  status?: Reminder['status'];
  notificationMethods?: Reminder['notificationMethods'];
  notes?: string;
}

// Reminder Template Interfaces
export interface ReminderTemplate {
  _id: string;
  name: string;
  description: string;
  type: Reminder['type'];
  title: string;
  message: string;
  frequency: Reminder['frequency'];
  notificationMethods: Reminder['notificationMethods'];
  isActive: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateData {
  name: string;
  description: string;
  type: Reminder['type'];
  title: string;
  message: string;
  frequency: Reminder['frequency'];
  notificationMethods: Reminder['notificationMethods'];
  isActive?: boolean;
}

export interface UpdateTemplateData {
  name?: string;
  description?: string;
  type?: Reminder['type'];
  title?: string;
  message?: string;
  frequency?: Reminder['frequency'];
  notificationMethods?: Reminder['notificationMethods'];
  isActive?: boolean;
}

// Notification Settings Interfaces
export interface NotificationSettings {
  _id: string;
  userId: string;
  emailNotifications: {
    enabled: boolean;
    types: string[];
    frequency: 'immediate' | 'daily' | 'weekly';
  };
  smsNotifications: {
    enabled: boolean;
    types: string[];
    phoneNumber: string;
  };
  pushNotifications: {
    enabled: boolean;
    types: string[];
  };
  inAppNotifications: {
    enabled: boolean;
    types: string[];
  };
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  };
  updatedAt: string;
}

export interface UpdateNotificationSettingsData {
  emailNotifications?: {
    enabled?: boolean;
    types?: string[];
    frequency?: 'immediate' | 'daily' | 'weekly';
  };
  smsNotifications?: {
    enabled?: boolean;
    types?: string[];
    phoneNumber?: string;
  };
  pushNotifications?: {
    enabled?: boolean;
    types?: string[];
  };
  inAppNotifications?: {
    enabled?: boolean;
    types?: string[];
  };
  quietHours?: {
    enabled?: boolean;
    startTime?: string;
    endTime?: string;
    timezone?: string;
  };
}

// Filter Interfaces
export interface ReminderFilters {
  status?: Reminder['status'];
  type?: Reminder['type'];
  priority?: Reminder['priority'];
  assignedTo?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TemplateFilters {
  type?: Reminder['type'];
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

// Statistics Interfaces
export interface ReminderStats {
  totalReminders: number;
  pendingCount: number;
  sentCount: number;
  completedCount: number;
  cancelledCount: number;
  byType: { type: string; count: number; completedCount: number }[];
  byPriority: { priority: string; count: number; overdueCount: number }[];
  monthly: {
    year: number;
    month: number;
    count: number;
    completedCount: number;
  }[];
}

class ReminderService {
  // Reminder Methods
  async getReminders(filters: ReminderFilters = {}): Promise<apiResponse<{ data: Reminder[]; pagination: any }>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    return api.get(`/reminders?${params.toString()}`);
  }

  async getReminder(id: string): Promise<apiResponse<Reminder>> {
    return api.get(`/reminders/${id}`);
  }

  async createReminder(data: CreateReminderData): Promise<apiResponse<Reminder>> {
    return api.post('/reminders', data);
  }

  async updateReminder(id: string, data: UpdateReminderData): Promise<apiResponse<Reminder>> {
    return api.put(`/reminders/${id}`, data);
  }

  async deleteReminder(id: string): Promise<apiResponse<{ message: string }>> {
    return api.delete(`/reminders/${id}`);
  }

  async markAsSent(id: string): Promise<apiResponse<Reminder>> {
    return api.post(`/reminders/${id}/mark-sent`);
  }

  async acknowledgeReminder(id: string, notes?: string): Promise<apiResponse<Reminder>> {
    return api.post(`/reminders/${id}/acknowledge`, { notes });
  }

  async completeReminder(id: string, notes?: string): Promise<apiResponse<Reminder>> {
    return api.post(`/reminders/${id}/complete`, { notes });
  }

  async cancelReminder(id: string, reason?: string): Promise<apiResponse<Reminder>> {
    return api.post(`/reminders/${id}/cancel`, { reason });
  }

  async getUpcomingReminders(days: number = 7, assignedTo?: string): Promise<apiResponse<Reminder[]>> {
    const params = new URLSearchParams({ days: days.toString() });
    if (assignedTo) params.append('assignedTo', assignedTo);
    return api.get(`/reminders/upcoming/list?${params.toString()}`);
  }

  async getOverdueReminders(assignedTo?: string): Promise<apiResponse<Reminder[]>> {
    const params = new URLSearchParams();
    if (assignedTo) params.append('assignedTo', assignedTo);
    return api.get(`/reminders/overdue/list?${params.toString()}`);
  }

  async getReminderStats(startDate?: string, endDate?: string): Promise<apiResponse<ReminderStats>> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/reminders/stats/overview?${params.toString()}`);
  }

  async createBulkReminders(reminders: CreateReminderData[]): Promise<apiResponse<{ data: Reminder[]; errors: any[] }>> {
    return api.post('/reminders/bulk', { reminders });
  }

  // Reminder Template Methods
  async getTemplates(filters: TemplateFilters = {}): Promise<apiResponse<{ data: ReminderTemplate[]; pagination: any }>> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value.toString());
      }
    });
    return api.get(`/reminders/templates?${params.toString()}`);
  }

  async getTemplate(id: string): Promise<apiResponse<ReminderTemplate>> {
    return api.get(`/reminders/templates/${id}`);
  }

  async createTemplate(data: CreateTemplateData): Promise<apiResponse<ReminderTemplate>> {
    return api.post('/reminders/templates', data);
  }

  async updateTemplate(id: string, data: UpdateTemplateData): Promise<apiResponse<ReminderTemplate>> {
    return api.put(`/reminders/templates/${id}`, data);
  }

  async deleteTemplate(id: string): Promise<apiResponse<{ message: string }>> {
    return api.delete(`/reminders/templates/${id}`);
  }

  async toggleTemplate(id: string): Promise<apiResponse<ReminderTemplate>> {
    return api.patch(`/reminders/templates/${id}/toggle`);
  }

  // Notification Settings Methods
  async getNotificationSettings(): Promise<apiResponse<NotificationSettings>> {
    return api.get('/reminders/notification-settings');
  }

  async updateNotificationSettings(data: UpdateNotificationSettingsData): Promise<apiResponse<NotificationSettings>> {
    return api.put('/reminders/notification-settings', data);
  }

  // Reminder Generation Methods
  async generateFromTemplate(templateId: string, data: {
    customerId?: string;
    appointmentId?: string;
    assignedTo?: string;
    dueDate: string;
    customData?: Record<string, any>;
  }): Promise<apiResponse<Reminder>> {
    return api.post(`/reminders/generate-from-template/${templateId}`, data);
  }

  async generateServiceDueReminders(customerId: string, serviceType: string, dueDate: string): Promise<apiResponse<Reminder[]>> {
    return api.post('/reminders/generate-service-due', { customerId, serviceType, dueDate });
  }

  async generateFollowUpReminders(customerId: string, appointmentId: string, followUpDate: string): Promise<apiResponse<Reminder[]>> {
    return api.post('/reminders/generate-follow-up', { customerId, appointmentId, followUpDate });
  }

  async generatePaymentReminders(invoiceId: string, dueDate: string): Promise<apiResponse<Reminder[]>> {
    return api.post('/reminders/generate-payment', { invoiceId, dueDate });
  }

  // Reminder Scheduling Methods
  async scheduleReminder(id: string, scheduleDate: string): Promise<apiResponse<Reminder>> {
    return api.post(`/reminders/${id}/schedule`, { scheduleDate });
  }

  async rescheduleReminder(id: string, newDate: string): Promise<apiResponse<Reminder>> {
    return api.post(`/reminders/${id}/reschedule`, { newDate });
  }

  // Reminder Notification Methods
  async sendReminderNotification(id: string, method: 'email' | 'sms' | 'push'): Promise<apiResponse<{ message: string }>> {
    return api.post(`/reminders/${id}/send-notification`, { method });
  }

  async sendBulkNotifications(reminderIds: string[], method: 'email' | 'sms' | 'push'): Promise<apiResponse<{ sent: number; failed: number; errors: any[] }>> {
    return api.post('/reminders/bulk/send-notifications', { reminderIds, method });
  }

  // Reminder Analytics
  async getReminderAnalytics(startDate?: string, endDate?: string): Promise<apiResponse<any>> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    return api.get(`/reminders/analytics?${params.toString()}`);
  }

  async getCustomerReminderHistory(customerId: string): Promise<apiResponse<Reminder[]>> {
    return api.get(`/reminders/customer/${customerId}/history`);
  }

  // Reminder Search
  async searchReminders(query: string, filters?: ReminderFilters): Promise<apiResponse<Reminder[]>> {
    const params = new URLSearchParams({ query });
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    return api.get(`/reminders/search?${params.toString()}`);
  }

  // Reminder Duplication
  async duplicateReminder(id: string): Promise<apiResponse<Reminder>> {
    return api.post(`/reminders/${id}/duplicate`);
  }

  // Reminder Archiving
  async archiveReminder(id: string): Promise<apiResponse<{ message: string }>> {
    return api.post(`/reminders/${id}/archive`);
  }

  async unarchiveReminder(id: string): Promise<apiResponse<{ message: string }>> {
    return api.post(`/reminders/${id}/unarchive`);
  }

  async getArchivedReminders(filters?: ReminderFilters): Promise<apiResponse<{ data: Reminder[]; pagination: any }>> {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }
    return api.get(`/reminders/archived?${params.toString()}`);
  }
}

export const reminderService = new ReminderService();
export default reminderService;
