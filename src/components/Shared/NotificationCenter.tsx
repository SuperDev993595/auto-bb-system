import React, { useState, useEffect } from 'react';
import { 
  Notifications, 
  CheckCircle, 
  Warning, 
  Error, 
  Info,
  Close,
  Delete,
  MarkEmailRead
} from '@mui/icons-material';
import notificationService, { Notification } from '../../services/notificationService';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'urgent'>('all');

  useEffect(() => {
    if (isOpen) {
      const unsubscribe = notificationService.subscribe(setNotifications);
      return unsubscribe;
    }
  }, [isOpen]);

  const handleMarkAsRead = (id: string) => {
    notificationService.markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
  };

  const handleDeleteNotification = (id: string) => {
    notificationService.deleteNotification(id);
  };

  const handleClearAll = () => {
    notificationService.clearAllNotifications();
  };

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'urgent':
        return notifications.filter(n => n.priority === 'urgent');
      default:
        return notifications;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <Warning className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <Error className="w-5 h-5 text-red-600" />;
      case 'urgent':
        return <Warning className="w-5 h-5 text-red-600" />;
      case 'approval':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500';
      case 'high': return 'border-orange-500';
      case 'medium': return 'border-yellow-500';
      case 'low': return 'border-blue-500';
      default: return 'border-gray-300';
    }
  };

  if (!isOpen) return null;

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;
  const urgentCount = notifications.filter(n => n.priority === 'urgent' && !n.read).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-end p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Notifications className="w-6 h-6 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Close className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {[
            { key: 'all', label: 'All', count: notifications.length },
            { key: 'unread', label: 'Unread', count: unreadCount },
            { key: 'urgent', label: 'Urgent', count: urgentCount }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors flex items-center space-x-1"
            >
              <MarkEmailRead className="w-4 h-4" />
              <span>Mark all read</span>
            </button>
            <button
              onClick={handleClearAll}
              className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors flex items-center space-x-1"
            >
              <Delete className="w-4 h-4" />
              <span>Clear all</span>
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto max-h-96">
          {filteredNotifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Notifications className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p>No notifications</p>
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
                        <p className={`text-sm font-medium ${
                          !notification.read ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {notification.title}
                        </p>
                        <span className="text-xs text-gray-500">
                          {new Date(notification.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      
                      {notification.actionUrl && (
                        <button
                          onClick={() => {
                            window.location.href = notification.actionUrl!;
                            onClose();
                          }}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium mt-2 transition-colors"
                        >
                          View Details →
                        </button>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="Mark as read"
                        >
                          <MarkEmailRead className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteNotification(notification.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete notification"
                      >
                        <Delete className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Priority indicator */}
                  <div className={`mt-2 w-full h-1 rounded-full ${getPriorityColor(notification.priority)}`}></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;
