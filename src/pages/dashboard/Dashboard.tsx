import React, { useState, useEffect, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { fetchDashboardStats } from '../../redux/actions/dashboard';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Wrench,
  TrendingUp,
  BarChart3,
  PieChart,
  Download,
  Filter,
  Settings,
  RefreshCw,
  Eye,
  EyeOff
} from '../../utils/icons';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  const { stats, loading, error } = useAppSelector((state) => state.dashboard);
  
  // Real-time update state
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(60000); // 60 seconds
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  // Custom report builder state
  const [showReportBuilder, setShowReportBuilder] = useState(false);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie' | 'doughnut'>('line');
  
  // Advanced filtering state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: '7d',
    serviceType: 'all',
    technician: 'all',
    status: 'all'
  });

  // Fetch dashboard data
  const fetchData = useCallback(() => {
    dispatch(fetchDashboardStats(filters));
    setLastUpdate(new Date());
  }, [dispatch, filters]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);

  // Real-time data simulation
  useEffect(() => {
    if (!autoRefresh) return;

    const wsInterval = setInterval(() => {
      // Simulate real-time updates
      if (stats) {
        // Update some stats randomly to simulate real-time data
        const updatedStats = {
          ...stats,
          totalRevenue: stats.totalRevenue + Math.random() * 100,
          totalAppointments: stats.totalAppointments + Math.floor(Math.random() * 5),
          pendingTasks: Math.max(0, stats.pendingTasks - Math.floor(Math.random() * 2))
        };
        // In a real app, this would come from WebSocket or Server-Sent Events
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(wsInterval);
  }, [autoRefresh, stats]);

  // Chart data
  const revenueData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Revenue',
        data: [12000, 19000, 15000, 25000, 22000, 30000],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const serviceData = {
    labels: ['Oil Change', 'Brake Service', 'Tire Rotation', 'Engine Repair', 'Other'],
    datasets: [
      {
        data: [30, 25, 20, 15, 10],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const appointmentData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Appointments',
        data: [12, 19, 15, 25, 22, 18, 14],
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: 'rgb(16, 185, 129)',
        borderWidth: 1,
      },
    ],
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Real-time overview of your auto repair business</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-3 rounded-xl transition-colors ${
                showFilters 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              } border border-gray-200`}
            >
              <Filter className="w-5 h-5" />
            </button>
            <button
              onClick={fetchData}
              className="p-3 bg-white text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowReportBuilder(!showReportBuilder)}
              className="p-3 bg-white text-gray-600 hover:bg-gray-50 rounded-xl border border-gray-200 transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${autoRefresh ? 'bg-green-500' : 'bg-gray-400'}`}></div>
              <span className="text-sm text-gray-600">
                {autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded-lg transition-colors ${
                autoRefresh 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {autoRefresh ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
            <select
              value={refreshInterval / 1000}
              onChange={(e) => setRefreshInterval(parseInt(e.target.value) * 1000)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={30}>30s</option>
              <option value={60}>1m</option>
              <option value={300}>5m</option>
              <option value={600}>10m</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${stats?.totalRevenue?.toLocaleString() || '0'}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            +12.5% from last month
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalCustomers || '0'}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            +8.2% from last month
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalAppointments || '0'}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            +15.3% from last month
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.pendingTasks || '0'}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-xl">
              <Wrench className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-red-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            +5.7% from last month
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Trends */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
            <div className="flex items-center gap-2">
              <TrendingUp className="text-blue-600" />
              <span className="text-sm text-gray-600">Last 6 months</span>
            </div>
          </div>
          <div className="h-64">
            <Line 
              data={revenueData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return '$' + value.toLocaleString();
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Service Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Service Distribution</h3>
            <div className="flex items-center gap-2">
              <PieChart className="text-blue-600" />
              <span className="text-sm text-gray-600">This month</span>
            </div>
          </div>
          <div className="h-64">
            <Doughnut 
              data={serviceData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                }
              }}
            />
          </div>
        </div>

        {/* Appointment Trends */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Weekly Appointments</h3>
            <div className="flex items-center gap-2">
              <BarChart3 className="text-blue-600" />
              <span className="text-sm text-gray-600">This week</span>
            </div>
          </div>
          <div className="h-64">
            <Bar 
              data={appointmentData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                  }
                }
              }}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-medium">View Today's Appointments</span>
                <Calendar className="text-blue-600" />
              </div>
            </button>
            <button className="w-full text-left p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-medium">Generate Monthly Report</span>
                <Download className="text-green-600" />
              </div>
            </button>
            <button className="w-full text-left p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-medium">View Pending Tasks</span>
                <Wrench className="text-red-600" />
              </div>
            </button>
            <button className="w-full text-left p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-medium">Customer Analytics</span>
                <Users className="text-purple-600" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
