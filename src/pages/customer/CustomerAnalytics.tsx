import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Car, 
  Calendar, 
  Clock, 
  BarChart3, 
  PieChart, 
  Activity, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Filter,
  Download,
  RefreshCw,
  Eye,
  FileText,
  Wrench,
  Fuel,
  Gauge,
  MapPin,
  Users,
  Star
} from '../../utils/icons';

interface ServiceMetrics {
  totalServices: number;
  totalSpent: number;
  averageServiceCost: number;
  servicesThisYear: number;
  servicesLastYear: number;
  yearOverYearChange: number;
}

interface VehicleMetrics {
  totalVehicles: number;
  averageAge: number;
  totalMileage: number;
  averageMileage: number;
  nextServiceDue: number;
  overdueServices: number;
}

interface ServiceHistory {
  month: string;
  services: number;
  cost: number;
  type: string;
}

interface ServiceTypeBreakdown {
  type: string;
  count: number;
  totalCost: number;
  percentage: number;
}

interface MaintenanceSchedule {
  vehicle: string;
  serviceType: string;
  dueDate: string;
  estimatedCost: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export default function CustomerAnalytics() {
  const [serviceMetrics, setServiceMetrics] = useState<ServiceMetrics | null>(null);
  const [vehicleMetrics, setVehicleMetrics] = useState<VehicleMetrics | null>(null);
  const [serviceHistory, setServiceHistory] = useState<ServiceHistory[]>([]);
  const [serviceTypeBreakdown, setServiceTypeBreakdown] = useState<ServiceTypeBreakdown[]>([]);
  const [maintenanceSchedule, setMaintenanceSchedule] = useState<MaintenanceSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('1y');
  const [selectedVehicle, setSelectedVehicle] = useState('all');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange, selectedVehicle]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      const mockServiceMetrics: ServiceMetrics = {
        totalServices: 45,
        totalSpent: 8750.50,
        averageServiceCost: 194.46,
        servicesThisYear: 12,
        servicesLastYear: 8,
        yearOverYearChange: 50
      };

      const mockVehicleMetrics: VehicleMetrics = {
        totalVehicles: 3,
        averageAge: 4.2,
        totalMileage: 125000,
        averageMileage: 41667,
        nextServiceDue: 2,
        overdueServices: 1
      };

      const mockServiceHistory: ServiceHistory[] = [
        { month: 'Jan', services: 3, cost: 450, type: 'Maintenance' },
        { month: 'Feb', services: 2, cost: 320, type: 'Repair' },
        { month: 'Mar', services: 1, cost: 180, type: 'Inspection' },
        { month: 'Apr', services: 2, cost: 280, type: 'Maintenance' },
        { month: 'May', services: 1, cost: 150, type: 'Repair' },
        { month: 'Jun', services: 3, cost: 520, type: 'Maintenance' }
      ];

      const mockServiceTypeBreakdown: ServiceTypeBreakdown[] = [
        { type: 'Maintenance', count: 25, totalCost: 4200, percentage: 55.6 },
        { type: 'Repair', count: 12, totalCost: 2800, percentage: 26.7 },
        { type: 'Inspection', count: 5, totalCost: 750, percentage: 11.1 },
        { type: 'Emergency', count: 3, totalCost: 1000, percentage: 6.7 }
      ];

      const mockMaintenanceSchedule: MaintenanceSchedule[] = [
        {
          vehicle: '2020 Toyota Camry',
          serviceType: 'Oil Change',
          dueDate: '2024-02-15',
          estimatedCost: 89.99,
          priority: 'medium'
        },
        {
          vehicle: '2018 Honda Civic',
          serviceType: 'Brake Inspection',
          dueDate: '2024-02-20',
          estimatedCost: 120.00,
          priority: 'high'
        },
        {
          vehicle: '2020 Toyota Camry',
          serviceType: 'Tire Rotation',
          dueDate: '2024-03-01',
          estimatedCost: 45.00,
          priority: 'low'
        }
      ];

      setServiceMetrics(mockServiceMetrics);
      setVehicleMetrics(mockVehicleMetrics);
      setServiceHistory(mockServiceHistory);
      setServiceTypeBreakdown(mockServiceTypeBreakdown);
      setMaintenanceSchedule(mockMaintenanceSchedule);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-l-4 border-blue-500">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive insights into your vehicle maintenance and service history</p>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last Year</option>
              <option value="2y">Last 2 Years</option>
            </select>
            <button
              onClick={loadAnalytics}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Wrench className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Services</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(serviceMetrics?.totalServices || 0)}</p>
                <div className="flex items-center text-sm">
                  {serviceMetrics?.yearOverYearChange && serviceMetrics.yearOverYearChange > 0 ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={serviceMetrics?.yearOverYearChange && serviceMetrics.yearOverYearChange > 0 ? 'text-green-600' : 'text-red-600'}>
                    {Math.abs(serviceMetrics?.yearOverYearChange || 0)}% vs last year
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(serviceMetrics?.totalSpent || 0)}</p>
                <p className="text-sm text-gray-500">Avg: {formatCurrency(serviceMetrics?.averageServiceCost || 0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Car className="w-8 h-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Vehicles</p>
                <p className="text-2xl font-bold text-gray-900">{vehicleMetrics?.totalVehicles}</p>
                <p className="text-sm text-gray-500">Avg Age: {vehicleMetrics?.averageAge} years</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-8 h-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Due Soon</p>
                <p className="text-2xl font-bold text-gray-900">{vehicleMetrics?.nextServiceDue}</p>
                <p className="text-sm text-gray-500">{vehicleMetrics?.overdueServices} overdue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Service History Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Service History</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {serviceHistory.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 text-sm text-gray-500">{item.month}</div>
                    <div className="w-20 text-sm font-medium text-gray-900">{item.services} services</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 text-sm text-gray-600">{formatCurrency(item.cost)}</div>
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(item.cost / Math.max(...serviceHistory.map(s => s.cost))) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Service Type Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Service Type Breakdown</h3>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {serviceTypeBreakdown.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: `hsl(${index * 60}, 70%, 60%)` }}></div>
                    <div className="w-24 text-sm font-medium text-gray-900">{item.type}</div>
                    <div className="w-12 text-sm text-gray-500">{item.count}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 text-sm text-gray-600">{formatCurrency(item.totalCost)}</div>
                    <div className="w-12 text-sm text-gray-500">{item.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Maintenance Schedule */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Maintenance</h3>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedVehicle}
                  onChange={(e) => setSelectedVehicle(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Vehicles</option>
                  <option value="camry">Toyota Camry</option>
                  <option value="civic">Honda Civic</option>
                </select>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estimated Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {maintenanceSchedule.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.vehicle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.serviceType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(item.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(item.estimatedCost)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                        {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Calendar className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
