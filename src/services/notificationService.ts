import api from './api'

export interface Notification {
  id: string
  type: 'warranty_expiry' | 'membership_expiry' | 'warranty_mileage' | 'membership_renewal'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high'
  read: boolean
  createdAt: string
  data?: any
}

export interface NotificationSettings {
  emailNotifications: boolean
  smsNotifications: boolean
  pushNotifications: boolean
  warrantyExpiryDays: number
  membershipExpiryDays: number
  mileageWarningPercentage: number
}

class NotificationService {
  // Get all notifications
  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await api.get('/notifications')
      return response.data
    } catch (error) {
      console.error('Error fetching notifications:', error)
      return []
    }
  }

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await api.patch(`/notifications/${notificationId}/read`)
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Mark all notifications as read
  async markAllAsRead(): Promise<void> {
    try {
      await api.patch('/notifications/read-all')
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  // Get notification settings
  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const response = await api.get('/notifications/settings')
      return response.data
    } catch (error) {
      console.error('Error fetching notification settings:', error)
      return {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        warrantyExpiryDays: 30,
        membershipExpiryDays: 7,
        mileageWarningPercentage: 90
      }
    }
  }

  // Update notification settings
  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<void> {
    try {
      await api.put('/notifications/settings', settings)
    } catch (error) {
      console.error('Error updating notification settings:', error)
    }
  }

  // Get expiring warranties
  async getExpiringWarranties(days: number = 30): Promise<any[]> {
    try {
      const response = await api.get(`/warranties/expiring?days=${days}`)
      return response.data
    } catch (error) {
      console.error('Error fetching expiring warranties:', error)
      return []
    }
  }

  // Get expiring memberships
  async getExpiringMemberships(days: number = 7): Promise<any[]> {
    try {
      const response = await api.get(`/memberships/expiring?days=${days}`)
      return response.data
    } catch (error) {
      console.error('Error fetching expiring memberships:', error)
      return []
    }
  }

  // Get warranties approaching mileage limit
  async getWarrantiesApproachingMileage(percentage: number = 90): Promise<any[]> {
    try {
      const response = await api.get(`/warranties/mileage-warning?percentage=${percentage}`)
      return response.data
    } catch (error) {
      console.error('Error fetching warranties approaching mileage limit:', error)
      return []
    }
  }

  // Send test notification
  async sendTestNotification(type: 'email' | 'sms' | 'push'): Promise<void> {
    try {
      await api.post('/notifications/test', { type })
    } catch (error) {
      console.error('Error sending test notification:', error)
    }
  }

  // Get notification statistics
  async getNotificationStats(): Promise<any> {
    try {
      const response = await api.get('/notifications/stats')
      return response.data
    } catch (error) {
      console.error('Error fetching notification stats:', error)
      return {
        total: 0,
        unread: 0,
        byType: {},
        byPriority: {}
      }
    }
  }
}

export default new NotificationService()
