import React, { useState, useEffect, useCallback } from 'react';
import { useAppSelector, useAppDispatch } from '../../redux/hooks';
import { fetchDashboardStats } from '../../redux/actions/dashboard';
import { 
  FaUsers, 
  FaCalendarAlt, 
  FaDollarSign, 
  FaWrench,
  FaChartLine,
  FaChartBar,
  FaChartPie,
  FaDownload,
  FaFilter,
  FaCog,
  FaSync,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
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
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
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
        // Update stats with small random changes to simulate real-time data
        const updatedStats = {
          ...stats,
          totalCustomers: stats.totalCustomers + Math.floor(Math.random() * 3) - 1,
          totalAppointments: stats.totalAppointments + Math.floor(Math.random() * 2),
          totalRevenue: stats.totalRevenue + Math.floor(Math.random() * 100),
          pendingTasks: stats.pendingTasks + Math.floor(Math.random() * 2) - 1
        };
        
        // In a real app, this would come from WebSocket or Server-Sent Events
        console.log('Real-time update:', updatedStats);
      }
    }, 5000);

    return () => clearInterval(wsInterval);
  }, [autoRefresh, stats]);

  // Chart data for revenue trends
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

  // Chart data for service distribution
  const serviceData = {
    labels: ['Oil Change', 'Brake Service', 'Engine Repair', 'AC Service', 'Tire Service'],
    datasets: [
      {
        data: [30, 25, 20, 15, 10],
        backgroundColor: [
          '#3B82F6',
          '#EF4444',
          '#10B981',
          '#F59E0B',
          '#8B5CF6',
        ],
      },
    ],
  };

  // Chart data for appointment trends
  const appointmentData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Appointments',
        data: [12, 19, 15, 25, 22, 18, 8],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  // Custom report builder
  const generateCustomReport = () => {
    const reportData = {
      metrics: selectedMetrics,
      dateRange,
      chartType,
      data: revenueData, // This would be filtered based on selections
      generatedAt: new Date().toISOString()
    };
    
    // Export report
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Advanced filtering
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error loading dashboard: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {/* Real-time controls */}
          <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`p-2 rounded ${autoRefresh ? 'text-green-600' : 'text-gray-400'}`}
              title={autoRefresh ? 'Disable auto-refresh' : 'Enable auto-refresh'}
            >
              {autoRefresh ? <FaEye /> : <FaEyeSlash />}
            </button>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="text-sm border rounded px-2 py-1"
            >
              <option value={10000}>10s</option>
              <option value={30000}>30s</option>
              <option value={60000}>1m</option>
              <option value={300000}>5m</option>
            </select>
            <button
              onClick={fetchData}
              className="p-2 text-blue-600 hover:text-blue-700"
              title="Refresh now"
            >
                                      <FaSync />
            </button>
          </div>

          {/* Advanced filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm border hover:bg-gray-50"
          >
            <FaFilter />
            <span>Filters</span>
          </button>

          {/* Custom report builder */}
          <button
            onClick={() => setShowReportBuilder(!showReportBuilder)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <FaCog />
            <span>Custom Report</span>
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Advanced Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Type
              </label>
              <select
                value={filters.serviceType}
                onChange={(e) => handleFilterChange('serviceType', e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="all">All Services</option>
                <option value="maintenance">Maintenance</option>
                <option value="repair">Repair</option>
                <option value="diagnostic">Diagnostic</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Technician
              </label>
              <select
                value={filters.technician}
                onChange={(e) => handleFilterChange('technician', e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="all">All Technicians</option>
                <option value="john">John Smith</option>
                <option value="sarah">Sarah Johnson</option>
                <option value="mike">Mike Davis</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Custom Report Builder */}
      {showReportBuilder && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Custom Report Builder</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Metrics
              </label>
              <div className="space-y-2">
                {['Revenue', 'Appointments', 'Customers', 'Services'].map(metric => (
                  <label key={metric} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedMetrics.includes(metric)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMetrics([...selectedMetrics, metric]);
                        } else {
                          setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
                        }
                      }}
                      className="mr-2"
                    />
                    {metric}
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Chart Type
              </label>
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as any)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="doughnut">Doughnut Chart</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={generateCustomReport}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <FaDownload />
              Generate Report
            </button>
            <button
              onClick={() => setShowReportBuilder(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalCustomers || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <FaUsers className="text-blue-600 text-xl" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600">+12% from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalAppointments || 0}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <FaCalendarAlt className="text-green-600 text-xl" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600">+8% from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">${stats?.totalRevenue?.toLocaleString() || 0}</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-full">
              <FaDollarSign className="text-yellow-600 text-xl" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600">+15% from last month</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.pendingTasks || 0}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <FaWrench className="text-red-600 text-xl" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-red-600">-5% from last month</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trends */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
            <div className="flex items-center gap-2">
              <FaChartLine className="text-blue-600" />
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
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Service Distribution</h3>
            <div className="flex items-center gap-2">
              <FaChartPie className="text-blue-600" />
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
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Weekly Appointments</h3>
            <div className="flex items-center gap-2">
              <FaChartBar className="text-blue-600" />
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
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-medium">View Today's Appointments</span>
                <FaCalendarAlt className="text-blue-600" />
              </div>
            </button>
            <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-medium">Generate Monthly Report</span>
                <FaDownload className="text-green-600" />
              </div>
            </button>
            <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-medium">View Pending Tasks</span>
                <FaWrench className="text-red-600" />
              </div>
            </button>
            <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-medium">Customer Analytics</span>
                <FaUsers className="text-purple-600" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
