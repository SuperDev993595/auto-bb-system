import { toast } from 'react-hot-toast';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'approval' | 'urgent';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'approval' | 'followup' | 'system' | 'reminder';
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  inApp: boolean;
  categories: string[];
}

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: Array<(notifications: Notification[]) => void> = [];
  private ws: WebSocket | null = null;

  constructor() {
    this.initializeWebSocket();
    this.loadNotifications();
  }

  private initializeWebSocket() {
    try {
      // Connect to WebSocket for real-time notifications
      this.ws = new WebSocket(`${process.env.REACT_APP_WS_URL || 'ws://localhost:3001'}/notifications`);
      
      this.ws.onmessage = (event) => {
        const notification = JSON.parse(event.data);
        this.addNotification(notification);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        // Reconnect after 5 seconds
        setTimeout(() => this.initializeWebSocket(), 5000);
      };
    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
    }
  }

  // Add a new notification
  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      read: false,
    };

    this.notifications.unshift(newNotification);
    this.notifyListeners();
    this.showToast(newNotification);
    this.saveNotifications();
  }

  // Show toast notification
  private showToast(notification: Notification) {
    const toastOptions = {
      duration: notification.priority === 'urgent' ? 8000 : 4000,
      position: 'top-right' as const,
    };

    switch (notification.type) {
      case 'success':
        toast.success(notification.message, toastOptions);
        break;
      case 'error':
        toast.error(notification.message, toastOptions);
        break;
      case 'warning':
        toast(notification.message, { ...toastOptions, icon: '⚠️' });
        break;
      case 'approval':
        toast(notification.message, { 
          ...toastOptions, 
          icon: '📋',
          style: { background: '#3B82F6', color: 'white' }
        });
        break;
      case 'urgent':
        toast(notification.message, { 
          ...toastOptions, 
          icon: '🚨',
          style: { background: '#DC2626', color: 'white' }
        });
        break;
      default:
        toast(notification.message, toastOptions);
    }
  }

  // Get all notifications
  getNotifications(): Notification[] {
    return this.notifications;
  }

  // Get unread notifications
  getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.read);
  }

  // Get notifications by category
  getNotificationsByCategory(category: string): Notification[] {
    return this.notifications.filter(n => n.category === category);
  }

  // Get urgent notifications
  getUrgentNotifications(): Notification[] {
    return this.notifications.filter(n => n.priority === 'urgent' && !n.read);
  }

  // Mark notification as read
  markAsRead(id: string) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.notifyListeners();
      this.saveNotifications();
    }
  }

  // Mark all notifications as read
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.notifyListeners();
    this.saveNotifications();
  }

  // Delete notification
  deleteNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
    this.saveNotifications();
  }

  // Clear all notifications
  clearAllNotifications() {
    this.notifications = [];
    this.notifyListeners();
    this.saveNotifications();
  }

  // Subscribe to notification changes
  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners
  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  // Generate unique ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Save notifications to localStorage
  private saveNotifications() {
    try {
      localStorage.setItem('notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Failed to save notifications:', error);
    }
  }

  // Load notifications from localStorage
  private loadNotifications() {
    try {
      const saved = localStorage.getItem('notifications');
      if (saved) {
        this.notifications = JSON.parse(saved).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    }
  }

  // Send approval request notification
  sendApprovalRequest(customerName: string, serviceName: string, cost: number) {
    this.addNotification({
      type: 'approval',
      title: 'Approval Required',
      message: `${customerName} - ${serviceName} ($${cost}) requires approval`,
      priority: cost > 1000 ? 'urgent' : 'high',
      category: 'approval',
      actionUrl: '/admin/dashboard/approvals'
    });
  }

  // Send follow-up task notification
  sendFollowUpTaskNotification(customerName: string, assignedTo: string) {
    this.addNotification({
      type: 'warning',
      title: 'Follow-up Task Assigned',
      message: `Follow-up task for ${customerName} assigned to ${assignedTo}`,
      priority: 'medium',
      category: 'followup',
      actionUrl: '/admin/dashboard/tasks'
    });
  }

  // Send urgent reminder
  sendUrgentReminder(message: string, actionUrl?: string) {
    this.addNotification({
      type: 'urgent',
      title: 'Urgent Reminder',
      message,
      priority: 'urgent',
      category: 'reminder',
      actionUrl
    });
  }

  // Get notification count
  getNotificationCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  // Get urgent notification count
  getUrgentNotificationCount(): number {
    return this.notifications.filter(n => n.priority === 'urgent' && !n.read).length;
  }
}

export default new NotificationService();
