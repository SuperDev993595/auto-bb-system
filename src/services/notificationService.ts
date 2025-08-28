import api from './api'

export interface NotificationTemplate {
  id: string
  name: string
  type: 'email' | 'sms'
  subject?: string
  body: string
  variables: string[]
  isActive: boolean
}

export interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  membershipExpiryDays: number
  warrantyExpiryDays: number
  dailyDigest: boolean
  weeklyReport: boolean
}

export interface Notification {
  id: string
  type: 'membership_expiry' | 'warranty_expiry' | 'membership_renewal' | 'warranty_claim' | 'system_alert'
  title: string
  message: string
  recipient: {
    id: string
    name: string
    email: string
    phone?: string
  }
  metadata: {
    membershipId?: string
    warrantyId?: string
    expiryDate?: string
    daysUntilExpiry?: number
  }
  status: 'pending' | 'sent' | 'failed' | 'cancelled'
  sentAt?: string
  createdAt: string
}

export interface ExpiryNotification {
  id: string
  type: 'membership' | 'warranty'
  customerName: string
  customerEmail: string
  customerPhone?: string
  itemName: string
  expiryDate: string
  daysUntilExpiry: number
  status: 'active' | 'expired' | 'expiring_soon'
}

class NotificationService {
  private baseUrl = '/notifications'

  // Get notification settings
  async getSettings(): Promise<NotificationSettings> {
    try {
      const response = await api.get(`${this.baseUrl}/settings`)
      return response.data
    } catch (error) {
      console.error('Error fetching notification settings:', error)
      // Return default settings
      return {
        emailNotifications: true,
        smsNotifications: false,
        membershipExpiryDays: 30,
        warrantyExpiryDays: 30,
        dailyDigest: true,
        weeklyReport: true
      }
    }
  }

  // Update notification settings
  async updateSettings(settings: Partial<NotificationSettings>): Promise<boolean> {
    try {
      await api.put(`${this.baseUrl}/settings`, settings)
      return true
    } catch (error) {
      console.error('Error updating notification settings:', error)
      return false
    }
  }

  // Get notification templates
  async getTemplates(): Promise<NotificationTemplate[]> {
    try {
      const response = await api.get(`${this.baseUrl}/templates`)
      return response.data
    } catch (error) {
      console.error('Error fetching notification templates:', error)
      return []
    }
  }

  // Create notification template
  async createTemplate(template: Omit<NotificationTemplate, 'id'>): Promise<NotificationTemplate | null> {
    try {
      const response = await api.post(`${this.baseUrl}/templates`, template)
      return response.data
    } catch (error) {
      console.error('Error creating notification template:', error)
      return null
    }
  }

  // Update notification template
  async updateTemplate(id: string, template: Partial<NotificationTemplate>): Promise<boolean> {
    try {
      await api.put(`${this.baseUrl}/templates/${id}`, template)
      return true
    } catch (error) {
      console.error('Error updating notification template:', error)
      return false
    }
  }

  // Delete notification template
  async deleteTemplate(id: string): Promise<boolean> {
    try {
      await api.delete(`${this.baseUrl}/templates/${id}`)
      return true
    } catch (error) {
      console.error('Error deleting notification template:', error)
      return false
    }
  }

  // Send email notification
  async sendEmail(recipient: string, subject: string, body: string, metadata?: any): Promise<boolean> {
    try {
      await api.post(`${this.baseUrl}/send-email`, {
        recipient,
        subject,
        body,
        metadata
      })
      return true
    } catch (error) {
      console.error('Error sending email notification:', error)
      return false
    }
  }

  // Send SMS notification
  async sendSMS(recipient: string, message: string, metadata?: any): Promise<boolean> {
    try {
      await api.post(`${this.baseUrl}/send-sms`, {
        recipient,
        message,
        metadata
      })
      return true
    } catch (error) {
      console.error('Error sending SMS notification:', error)
      return false
    }
  }

  // Get expiring memberships and warranties
  async getExpiryNotifications(): Promise<ExpiryNotification[]> {
    try {
      const response = await api.get(`${this.baseUrl}/expiry-notifications`)
      return response.data
    } catch (error) {
      console.error('Error fetching expiry notifications:', error)
      return []
    }
  }

  // Send expiry notifications
  async sendExpiryNotifications(): Promise<{ success: number; failed: number }> {
    try {
      const response = await api.post(`${this.baseUrl}/send-expiry-notifications`)
      return response.data
    } catch (error) {
      console.error('Error sending expiry notifications:', error)
      return { success: 0, failed: 0 }
    }
  }

  // Get notification history
  async getNotificationHistory(filters?: {
    type?: string
    status?: string
    recipientId?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }): Promise<{ notifications: Notification[]; total: number; page: number; totalPages: number }> {
    try {
      const params = new URLSearchParams()
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== '') {
            params.append(key, value.toString())
          }
        })
      }
      
      const response = await api.get(`${this.baseUrl}/history?${params.toString()}`)
      return response.data
    } catch (error) {
      console.error('Error fetching notification history:', error)
      return { notifications: [], total: 0, page: 1, totalPages: 1 }
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<boolean> {
    try {
      await api.patch(`${this.baseUrl}/history/${notificationId}/read`)
      return true
    } catch (error) {
      console.error('Error marking notification as read:', error)
      return false
    }
  }

  // Test notification delivery
  async testNotification(type: 'email' | 'sms', recipient: string): Promise<boolean> {
    try {
      await api.post(`${this.baseUrl}/test`, { type, recipient })
      return true
    } catch (error) {
      console.error('Error testing notification:', error)
      return false
    }
  }

  // Get notification statistics
  async getNotificationStats(): Promise<{
    totalSent: number
    totalFailed: number
    successRate: number
    sentToday: number
    sentThisWeek: number
    sentThisMonth: number
    byType: { [key: string]: number }
  }> {
    try {
      const response = await api.get(`${this.baseUrl}/stats`)
      return response.data
    } catch (error) {
      console.error('Error fetching notification statistics:', error)
      return {
        totalSent: 0,
        totalFailed: 0,
        successRate: 0,
        sentToday: 0,
        sentThisWeek: 0,
        sentThisMonth: 0,
        byType: {}
      }
    }
  }

  // Schedule notification
  async scheduleNotification(notification: {
    type: string
    recipient: string
    title: string
    message: string
    scheduledFor: string
    metadata?: any
  }): Promise<string | null> {
    try {
      const response = await api.post(`${this.baseUrl}/schedule`, notification)
      return response.data.scheduledId
    } catch (error) {
      console.error('Error scheduling notification:', error)
      return null
    }
  }

  // Cancel scheduled notification
  async cancelScheduledNotification(scheduledId: string): Promise<boolean> {
    try {
      await api.delete(`${this.baseUrl}/schedule/${scheduledId}`)
      return true
    } catch (error) {
      console.error('Error cancelling scheduled notification:', error)
      return false
    }
  }

  // Bulk send notifications
  async bulkSend(notifications: Array<{
    type: 'email' | 'sms'
    recipient: string
    title: string
    message: string
    metadata?: any
  }>): Promise<{ success: number; failed: number; results: Array<{ success: boolean; error?: string }> }> {
    try {
      const response = await api.post(`${this.baseUrl}/bulk-send`, { notifications })
      return response.data
    } catch (error) {
      console.error('Error bulk sending notifications:', error)
      return { success: 0, failed: notifications.length, results: notifications.map(() => ({ success: false, error: 'Request failed' })) }
    }
  }
}

export const notificationService = new NotificationService()
export default notificationService
