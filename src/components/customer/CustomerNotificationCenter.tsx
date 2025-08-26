import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  Info, 
  XCircle,
  Clock,
  Star,
  Calendar,
  Car,
  DollarSign,
  Shield
} from '../../utils/icons';

interface Notification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: 'appointment' | 'billing' | 'warranty' | 'membership' | 'service' | 'general';
  actionUrl?: string;
  actionText?: string;
}

interface CustomerNotificationCenterProps {
  customerId: string;
  onNotificationClick?: (notification: Notification) => void;
}

export default function CustomerNotificationCenter({ 
  customerId, 
  onNotificationClick 
}: CustomerNotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    loadNotifications();
  }, [customerId]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'success',
          title: 'Appointment Confirmed',
          message: 'Your appointment for oil change on 2024-01-15 at 10:00 AM has been confirmed.',
          timestamp: '2024-01-10T09:30:00Z',
          read: false,
          category: 'appointment',
          actionUrl: '/customer/dashboard/appointments',
          actionText: 'View Appointment'
        },
        {
          id: '2',
          type: 'warning',
          title: 'Payment Due',
          message: 'Your membership payment of $99.99 is due in 3 days.',
          timestamp: '2024-01-09T14:20:00Z',
          read: false,
          category: 'billing',
          actionUrl: '/customer/dashboard/billing',
          actionText: 'Pay Now'
        },
        {
          id: '3',
          type: 'info',
          title: 'Warranty Expiring Soon',
          message: 'Your extended warranty for 2020 Honda Civic expires in 30 days.',
          timestamp: '2024-01-08T11:15:00Z',
          read: true,
          category: 'warranty',
          actionUrl: '/customer/dashboard/warranties',
          actionText: 'Renew Warranty'
        },
        {
          id: '4',
          type: 'success',
          title: 'Service Completed',
          message: 'Your brake inspection has been completed. No issues found.',
          timestamp: '2024-01-07T16:45:00Z',
          read: true,
          category: 'service'
        },
        {
          id: '5',
          type: 'info',
          title: 'Membership Benefits',
          message: 'You have 2 free inspections remaining this month.',
          timestamp: '2024-01-06T10:30:00Z',
          read: false,
          category: 'membership',
          actionUrl: '/customer/dashboard/memberships',
          actionText: 'View Benefits'
        }
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      // Mock API call - replace with actual implementation
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Mock API call - replace with actual implementation
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      // Mock API call - replace with actual implementation
      setNotifications(prev => 
        prev.filter(notification => notification.id !== notificationId)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'appointment':
        return <Calendar className="w-4 h-4" />;
      case 'billing':
        return <DollarSign className="w-4 h-4" />;
      case 'warranty':
        return <Shield className="w-4 h-4" />;
      case 'membership':
        return <Star className="w-4 h-4" />;
      case 'service':
        return <Car className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !notification.read) ||
      (filter === 'read' && notification.read);
    
    const matchesCategory = categoryFilter === 'all' || 
      notification.category === categoryFilter;
    
    return matchesFilter && matchesCategory;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Bell className="w-6 h-6 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={markAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Mark all as read
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Status:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="appointment">Appointments</option>
              <option value="billing">Billing</option>
              <option value="warranty">Warranty</option>
              <option value="membership">Membership</option>
              <option value="service">Service</option>
              <option value="general">General</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <Bell className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No notifications found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 transition-colors ${
                  !notification.read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-sm font-medium text-gray-900">
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        <div className="flex items-center space-x-1">
                          {getCategoryIcon(notification.category)}
                          <span className="text-xs text-gray-500 capitalize">
                            {notification.category}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center space-x-3 mt-3">
                      {notification.actionUrl && notification.actionText && (
                        <button
                          onClick={() => onNotificationClick?.(notification)}
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {notification.actionText}
                        </button>
                      )}
                      
                      {!notification.read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Mark as read
                        </button>
                      )}
                      
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="text-sm text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {filteredNotifications.length > 0 && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              Showing {filteredNotifications.length} of {notifications.length} notifications
            </span>
            <span>
              {unreadCount} unread
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
