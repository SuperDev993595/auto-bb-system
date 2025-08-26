import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  Filter, 
  Search, 
  Calendar, 
  DollarSign, 
  Car, 
  Wrench, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Eye, 
  Printer, 
  Share2, 
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Users,
  MapPin,
  Gauge,
  Fuel
} from 'lucide-react';

interface ServiceReport {
  id: string;
  title: string;
  type: 'service_history' | 'cost_analysis' | 'maintenance_schedule' | 'vehicle_performance' | 'warranty_status';
  description: string;
  dateRange: {
    start: string;
    end: string;
  };
  generatedDate: string;
  status: 'ready' | 'generating' | 'failed';
  fileSize?: string;
  downloadUrl?: string;
}

interface ReportData {
  totalServices: number;
  totalCost: number;
  averageServiceCost: number;
  servicesByType: Array<{
    type: string;
    count: number;
    totalCost: number;
    percentage: number;
  }>;
  servicesByVehicle: Array<{
    vehicle: string;
    count: number;
    totalCost: number;
    lastService: string;
  }>;
  monthlyTrends: Array<{
    month: string;
    services: number;
    cost: number;
  }>;
  upcomingServices: Array<{
    vehicle: string;
    serviceType: string;
    dueDate: string;
    estimatedCost: number;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }>;
}

export default function CustomerReports() {
  const [reports, setReports] = useState<ServiceReport[]>([]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ServiceReport | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateRange, setDateRange] = useState('1y');
  const [showGenerateReport, setShowGenerateReport] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      const mockReports: ServiceReport[] = [
        {
          id: '1',
          title: 'Service History Report - Q4 2023',
          type: 'service_history',
          description: 'Comprehensive service history for all vehicles',
          dateRange: {
            start: '2023-10-01',
            end: '2023-12-31'
          },
          generatedDate: '2024-01-15',
          status: 'ready',
          fileSize: '2.4 MB',
          downloadUrl: '/reports/service-history-q4-2023.pdf'
        },
        {
          id: '2',
          title: 'Cost Analysis Report - 2023',
          type: 'cost_analysis',
          description: 'Detailed cost breakdown and analysis',
          dateRange: {
            start: '2023-01-01',
            end: '2023-12-31'
          },
          generatedDate: '2024-01-10',
          status: 'ready',
          fileSize: '1.8 MB',
          downloadUrl: '/reports/cost-analysis-2023.pdf'
        },
        {
          id: '3',
          title: 'Maintenance Schedule Report',
          type: 'maintenance_schedule',
          description: 'Upcoming maintenance and service schedules',
          dateRange: {
            start: '2024-01-01',
            end: '2024-12-31'
          },
          generatedDate: '2024-01-20',
          status: 'ready',
          fileSize: '1.2 MB',
          downloadUrl: '/reports/maintenance-schedule-2024.pdf'
        }
      ];

      const mockReportData: ReportData = {
        totalServices: 45,
        totalCost: 8750.50,
        averageServiceCost: 194.46,
        servicesByType: [
          { type: 'Maintenance', count: 25, totalCost: 4200, percentage: 55.6 },
          { type: 'Repair', count: 12, totalCost: 2800, percentage: 26.7 },
          { type: 'Inspection', count: 5, totalCost: 750, percentage: 11.1 },
          { type: 'Emergency', count: 3, totalCost: 1000, percentage: 6.7 }
        ],
        servicesByVehicle: [
          { vehicle: '2020 Toyota Camry', count: 18, totalCost: 3200, lastService: '2024-01-15' },
          { vehicle: '2018 Honda Civic', count: 15, totalCost: 2800, lastService: '2023-12-10' },
          { vehicle: '2019 Ford F-150', count: 12, totalCost: 2750, lastService: '2024-01-05' }
        ],
        monthlyTrends: [
          { month: 'Jan', services: 3, cost: 450 },
          { month: 'Feb', services: 2, cost: 320 },
          { month: 'Mar', services: 1, cost: 180 },
          { month: 'Apr', services: 2, cost: 280 },
          { month: 'May', services: 1, cost: 150 },
          { month: 'Jun', services: 3, cost: 520 }
        ],
        upcomingServices: [
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
          }
        ]
      };

      setReports(mockReports);
      setReportData(mockReportData);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'service_history':
        return <Wrench className="w-5 h-5" />;
      case 'cost_analysis':
        return <DollarSign className="w-5 h-5" />;
      case 'maintenance_schedule':
        return <Calendar className="w-5 h-5" />;
      case 'vehicle_performance':
        return <Car className="w-5 h-5" />;
      case 'warranty_status':
        return <FileText className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'generating':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || report.type === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
              <p className="text-gray-600">Generate and manage comprehensive service reports and analytics</p>
            </div>
            <button
              onClick={() => setShowGenerateReport(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FileText className="w-4 h-4 mr-2" />
              Generate Report
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 w-full"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="service_history">Service History</option>
              <option value="cost_analysis">Cost Analysis</option>
              <option value="maintenance_schedule">Maintenance Schedule</option>
              <option value="vehicle_performance">Vehicle Performance</option>
              <option value="warranty_status">Warranty Status</option>
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="1m">Last Month</option>
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last Year</option>
              <option value="2y">Last 2 Years</option>
            </select>
          </div>
        </div>

        {/* Report Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Wrench className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Services</p>
                <p className="text-2xl font-bold text-gray-900">{reportData?.totalServices}</p>
                <p className="text-sm text-gray-500">This period</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Cost</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData?.totalCost || 0)}</p>
                <p className="text-sm text-gray-500">Avg: {formatCurrency(reportData?.averageServiceCost || 0)}</p>
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
                <p className="text-2xl font-bold text-gray-900">{reportData?.servicesByVehicle.length}</p>
                <p className="text-sm text-gray-500">In fleet</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="w-8 h-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">{reportData?.upcomingServices.length}</p>
                <p className="text-sm text-gray-500">Services due</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Generated Reports</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Report
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Generated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{report.title}</div>
                        <div className="text-sm text-gray-500">{report.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getReportTypeIcon(report.type)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">
                          {report.type.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(report.dateRange.start)} - {formatDate(report.dateRange.end)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(report.generatedDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        {report.status === 'ready' && (
                          <button className="text-green-600 hover:text-green-900">
                            <Download className="w-4 h-4" />
                          </button>
                        )}
                        <button className="text-gray-600 hover:text-gray-900">
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Service Type Breakdown */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Service Type Breakdown</h3>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {reportData?.servicesByType.map((item, index) => (
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

          {/* Upcoming Services */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Services</h3>
              <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {reportData?.upcomingServices.map((service, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{service.vehicle}</div>
                    <div className="text-sm text-gray-500">{service.serviceType}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-900">{formatDate(service.dueDate)}</div>
                    <div className="text-sm text-gray-500">{formatCurrency(service.estimatedCost)}</div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(service.priority)}`}>
                      {service.priority.charAt(0).toUpperCase() + service.priority.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
