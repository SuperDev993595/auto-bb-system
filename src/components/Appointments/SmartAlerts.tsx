import React, { useState, useEffect } from 'react';
import { 
  Warning, 
  Schedule, 
  PriorityHigh, 
  CheckCircle,
  Close,
  Notifications
} from '@mui/icons-material';

interface Alert {
  id: string;
  type: 'urgent' | 'deadline' | 'reminder' | 'info';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  timestamp: Date;
  actionUrl?: string;
  dismissed: boolean;
}

const SmartAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
    // Refresh alerts every 5 minutes
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      
      // Mock data for now - replace with actual API call
      const mockAlerts: Alert[] = [
        {
          id: '1',
          type: 'urgent',
          title: 'Urgent Approval Required',
          message: 'High-value appointment ($2,500) waiting for approval - customer is waiting',
          priority: 'urgent',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          actionUrl: '/admin/dashboard/approvals',
          dismissed: false
        },
        {
          id: '2',
          type: 'deadline',
          title: 'Approval Deadline Approaching',
          message: '3 appointments will exceed 24-hour approval window in the next 2 hours',
          priority: 'high',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
          actionUrl: '/admin/dashboard/approvals',
          dismissed: false
        },
        {
          id: '3',
          type: 'reminder',
          title: 'Follow-up Tasks Due',
          message: '5 follow-up tasks are due today for declined appointments',
          priority: 'medium',
          timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          actionUrl: '/admin/dashboard/tasks',
          dismissed: false
        }
      ];
      
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? { ...alert, dismissed: true } : alert
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-red-500 bg-red-50';
      case 'high': return 'border-orange-500 bg-orange-50';
      case 'medium': return 'border-yellow-500 bg-yellow-50';
      case 'low': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <PriorityHigh className="w-5 h-5 text-red-600" />;
      case 'high': return <Warning className="w-5 h-5 text-orange-600" />;
      case 'medium': return <Schedule className="w-5 h-5 text-yellow-600" />;
      case 'low': return <Notifications className="w-5 h-5 text-blue-600" />;
      default: return <Notifications className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const activeAlerts = alerts.filter(alert => !alert.dismissed);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (activeAlerts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">All Clear!</h3>
        <p className="text-gray-500">No urgent alerts at this time</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-full">
              <PriorityHigh className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Smart Alerts</h3>
              <p className="text-sm text-gray-600">
                {activeAlerts.length} active alert{activeAlerts.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Auto-refresh: 5min</span>
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="divide-y divide-gray-200">
        {activeAlerts.map((alert) => (
          <div 
            key={alert.id} 
            className={`p-6 border-l-4 ${getPriorityColor(alert.priority)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getPriorityIcon(alert.priority)}
                  <h6 className="font-medium text-gray-900">{alert.title}</h6>
                  <span className="text-xs text-gray-500">
                    {getTimeAgo(alert.timestamp)}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-3">{alert.message}</p>
                
                {alert.actionUrl && (
                  <button 
                    onClick={() => window.location.href = alert.actionUrl!}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                  >
                    Take Action →
                  </button>
                )}
              </div>
              
              <button
                onClick={() => dismissAlert(alert.id)}
                className="ml-4 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="Dismiss alert"
              >
                <Close className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {activeAlerts.length} of {alerts.length} total alerts
          </span>
          <button
            onClick={() => setAlerts(prev => prev.map(alert => ({ ...alert, dismissed: true })))}
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Dismiss All
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartAlerts;
