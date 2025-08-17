import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';

interface DashboardStats {
  totalVehicles: number;
  upcomingAppointments: number;
  pendingInvoices: number;
  unreadMessages: number;
  unreadNotifications: number;
  lastServiceDate?: string;
  nextServiceDue?: string;
  totalSpent: number;
  loyaltyPoints: number;
}

interface RecentActivity {
  id: string;
  type: 'appointment' | 'service' | 'payment' | 'message' | 'reminder' | 'promotion';
  title: string;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'cancelled' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  actionRequired?: boolean;
}

interface SmartRecommendation {
  id: string;
  type: 'service' | 'appointment' | 'maintenance' | 'promotion';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimatedCost?: number;
  urgency: 'routine' | 'soon' | 'urgent';
  action: string;
  actionUrl: string;
}

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalVehicles: 0,
    upcomingAppointments: 1,
    pendingInvoices: 0,
    unreadMessages: 2,
    unreadNotifications: 0,
    totalSpent: 0,
    loyaltyPoints: 0
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<string[]>([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data - in real app, this would come from API
        setStats({
          totalVehicles: 2,
          upcomingAppointments: 1,
          pendingInvoices: 0,
          unreadMessages: 2,
          unreadNotifications: 3,
          lastServiceDate: '2024-01-10',
          nextServiceDue: '2024-03-15',
          totalSpent: 1250.00,
          loyaltyPoints: 450
        });

        setRecentActivities([
          {
            id: '1',
            type: 'appointment',
            title: 'Oil Change Appointment',
            description: 'Scheduled for Toyota Camry 2020',
            date: '2024-01-15',
            status: 'pending',
            priority: 'medium',
            actionRequired: true
          },
          {
            id: '2',
            type: 'service',
            title: 'Brake Inspection Completed',
            description: 'Honda Civic 2019 - All brakes in good condition',
            date: '2024-01-10',
            status: 'completed',
            priority: 'low'
          },
          {
            id: '3',
            type: 'payment',
            title: 'Payment Received',
            description: 'Invoice #1234 - $85.00',
            date: '2024-01-08',
            status: 'completed',
            priority: 'low'
          },
          {
            id: '4',
            type: 'reminder',
            title: 'Service Due Soon',
            description: 'Honda Civic due for 30,000 mile service',
            date: '2024-02-15',
            status: 'pending',
            priority: 'high',
            actionRequired: true
          }
        ]);

        setRecommendations([
          {
            id: '1',
            type: 'maintenance',
            title: 'Schedule 30,000 Mile Service',
            description: 'Your Honda Civic is approaching the 30,000 mile mark. Book your service now to maintain warranty coverage.',
            priority: 'high',
            estimatedCost: 150,
            urgency: 'soon',
            action: 'Book Service',
            actionUrl: '/customer/dashboard/appointments'
          },
          {
            id: '2',
            type: 'service',
            title: 'Tire Rotation & Balance',
            description: 'Based on your driving patterns, your tires should be rotated every 6,000 miles.',
            priority: 'medium',
            estimatedCost: 45,
            urgency: 'routine',
            action: 'Schedule Now',
            actionUrl: '/customer/dashboard/appointments'
          },
          {
            id: '3',
            type: 'promotion',
            title: '20% Off Brake Service',
            description: 'Special offer for loyal customers. Valid until end of month.',
            priority: 'low',
            urgency: 'routine',
            action: 'View Details',
            actionUrl: '/customer/dashboard/services'
          }
        ]);

        // Check for urgent notifications
        const urgentNotifications = [];
        if (stats.pendingInvoices > 0) {
          urgentNotifications.push('You have pending invoices that require attention');
        }
        if (stats.unreadMessages > 0) {
          urgentNotifications.push(`You have ${stats.unreadMessages} unread messages from the shop`);
        }
        if (stats.upcomingAppointments > 0) {
          urgentNotifications.push('You have upcoming appointments - please confirm details');
        }
        
        setNotifications(urgentNotifications);

      } catch (error) {
        toast.error('Failed to load dashboard data');
        console.error('Dashboard data loading error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'appointment': return '📅';
      case 'service': return '🔧';
      case 'payment': return '💰';
      case 'message': return '💬';
      case 'reminder': return '⏰';
      case 'promotion': return '🎉';
      default: return '📋';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'urgent': return 'text-red-600 bg-red-100';
      case 'soon': return 'text-orange-600 bg-orange-100';
      case 'routine': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Smart Welcome Section with Notifications */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow p-6 border-l-4 border-blue-500">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.name || 'Customer'}! 👋
            </h1>
            <p className="text-gray-600 mb-3">
              Here's what's happening with your vehicles and appointments.
            </p>
            
            {/* Smart Notifications */}
            {notifications.length > 0 && (
              <div className="space-y-2">
                {notifications.map((notification, index) => (
                  <div key={index} className="flex items-center text-sm text-amber-700 bg-amber-100 px-3 py-2 rounded-lg">
                    <span className="mr-2">⚠️</span>
                    {notification}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Loyalty Points Display */}
          <div className="text-right">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl font-bold text-purple-600">{stats.loyaltyPoints}</div>
              <div className="text-sm text-gray-600">Loyalty Points</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">🚗</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">My Vehicles</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalVehicles}</p>
              {stats.nextServiceDue && (
                <p className="text-xs text-gray-500">Next service: {new Date(stats.nextServiceDue).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{stats.upcomingAppointments}</p>
              <p className="text-xs text-gray-500">Click to view details</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingInvoices}</p>
              <p className="text-xs text-gray-500">All caught up!</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">💬</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Unread Messages</p>
              <p className="text-2xl font-bold text-gray-900">{stats.unreadMessages}</p>
              <p className="text-xs text-gray-500">Requires attention</p>
            </div>
          </div>
        </div>
      </div>

      {/* Smart Recommendations */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Smart Recommendations</h2>
          <span className="text-sm text-gray-500">AI-powered suggestions</span>
        </div>
        
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div key={rec.id} className="flex items-start space-x-4 p-4 border border-gray-100 rounded-lg hover:border-blue-200 hover:bg-blue-50 transition-colors">
              <div className="flex-shrink-0">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getUrgencyColor(rec.urgency)}`}>
                  {rec.urgency}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900">{rec.title}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(rec.priority)}`}>
                    {rec.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {rec.estimatedCost && (
                      <span className="text-sm font-medium text-green-600">
                        Est. {formatCurrency(rec.estimatedCost)}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}
                    </span>
                  </div>
                  <Link
                    to={rec.actionUrl}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {rec.action}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/customer/dashboard/appointments"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
          >
            <span className="text-2xl mr-3 group-hover:scale-110 transition-transform">📅</span>
            <div>
              <p className="font-medium text-gray-900">Schedule Appointment</p>
              <p className="text-sm text-gray-600">Book a service</p>
            </div>
          </Link>

          <Link
            to="/customer/dashboard/vehicles"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
          >
            <span className="text-2xl mr-3 group-hover:scale-110 transition-transform">🚗</span>
            <div>
              <p className="font-medium text-gray-900">View Vehicles</p>
              <p className="text-sm text-gray-600">Manage your cars</p>
            </div>
          </Link>

          <Link
            to="/customer/dashboard/invoices"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
          >
            <span className="text-2xl mr-3 group-hover:scale-110 transition-transform">💰</span>
            <div>
              <p className="font-medium text-gray-900">Pay Invoice</p>
              <p className="text-sm text-gray-600">View & pay bills</p>
            </div>
          </Link>

          <Link
            to="/customer/dashboard/messages"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group"
          >
            <span className="text-2xl mr-3 group-hover:scale-110 transition-transform">💬</span>
            <div>
              <p className="font-medium text-gray-900">Send Message</p>
              <p className="text-sm text-gray-600">Contact the shop</p>
            </div>
          </Link>

          <Link
            to="/customer/dashboard/notifications"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group relative"
          >
            <span className="text-2xl mr-3 group-hover:scale-110 transition-transform">🔔</span>
            <div>
              <p className="font-medium text-gray-900">Notifications</p>
              <p className="text-sm text-gray-600">{stats.unreadNotifications} unread</p>
            </div>
            {stats.unreadNotifications > 0 && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {stats.unreadNotifications}
              </div>
            )}
          </Link>
        </div>
      </div>

      {/* Enhanced Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <Link
            to="/customer/dashboard/activity"
            className="text-sm text-blue-600 hover:text-blue-500"
          >
            View all
          </Link>
        </div>
        
        <div className="space-y-4">
          {recentActivities.map((activity) => (
            <div key={activity.id} className={`flex items-start space-x-4 p-4 border rounded-lg transition-colors ${
              activity.actionRequired 
                ? 'border-orange-200 bg-orange-50' 
                : 'border-gray-100 hover:border-gray-200'
            }`}>
              <div className="flex-shrink-0">
                <span className="text-2xl">{getActivityIcon(activity.type)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                      {activity.status}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(activity.priority)}`}>
                      {activity.priority}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">
                    {new Date(activity.date).toLocaleDateString()}
                  </p>
                  {activity.actionRequired && (
                    <span className="text-xs text-orange-600 font-medium">Action Required</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-sm p-6 border-l-4 border-green-500">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalSpent)}</div>
            <div className="text-sm text-gray-600">Total Spent This Year</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.loyaltyPoints}</div>
            <div className="text-sm text-gray-600">Loyalty Points Earned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{formatCurrency(stats.pendingInvoices)}</div>
            <div className="text-sm text-gray-600">Outstanding Balance</div>
          </div>
        </div>
      </div>
    </div>
  );
}
