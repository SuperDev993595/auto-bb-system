import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  BarChart3,
  Calendar,
  Search,
  Eye,
  Share2,
  Mail,
  Printer,
  FileSpreadsheet,
  FileType,
  Database,
  RefreshCw,
  Edit,
  Trash2,
  Plus,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Car,
  Wrench
} from '../../utils/icons';

interface Report {
  id: string;
  name: string;
  type: 'financial' | 'operational' | 'customer' | 'vehicle' | 'service';
  description: string;
  lastGenerated: string;
  nextScheduled?: string;
  status: 'active' | 'paused' | 'draft';
  format: 'pdf' | 'excel' | 'csv' | 'json';
  data: any;
}

interface AdvancedReportingExportProps {
  customerId: string;
}

export default function AdvancedReportingExport({
  customerId
}: AdvancedReportingExportProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    loadReports();
  }, [customerId]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const mockReports: Report[] = [
        {
          id: '1',
          name: 'Monthly Financial Summary',
          type: 'financial',
          description: 'Comprehensive financial overview including revenue, expenses, and profit margins',
          lastGenerated: '2024-01-31T10:00:00Z',
          nextScheduled: '2024-02-29T10:00:00Z',
          status: 'active',
          format: 'pdf',
          data: { revenue: 125000, expenses: 85000, profit: 40000 }
        },
        {
          id: '2',
          name: 'Customer Service Analytics',
          type: 'customer',
          description: 'Customer satisfaction scores and service quality metrics',
          lastGenerated: '2024-01-30T15:30:00Z',
          status: 'active',
          format: 'excel',
          data: { satisfaction: 4.8, responseTime: '2.3 hours', resolutionRate: 94.2 }
        },
        {
          id: '3',
          name: 'Vehicle Maintenance Report',
          type: 'vehicle',
          description: 'Vehicle fleet status and maintenance schedules',
          lastGenerated: '2024-01-29T09:15:00Z',
          nextScheduled: '2024-02-28T09:15:00Z',
          status: 'active',
          format: 'csv',
          data: { totalVehicles: 45, maintenanceDue: 8, avgServiceCost: 285 }
        }
      ];
      
      setReports(mockReports);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportId: string) => {
    console.log(`Generating report: ${reportId}`);
  };

  const exportReport = async (report: Report, format: string) => {
    console.log(`Exporting report ${report.id} in ${format} format`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'financial': return <DollarSign className="w-4 h-4" />;
      case 'customer': return <Users className="w-4 h-4" />;
      case 'vehicle': return <Car className="w-4 h-4" />;
      case 'service': return <Wrench className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <FileType className="w-4 h-4" />;
      case 'excel': return <FileSpreadsheet className="w-4 h-4" />;
      case 'csv': return <FileText className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || report.type === filterType;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Advanced Reporting & Export</h2>
          <p className="text-gray-600">Generate comprehensive reports and export data</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Create Report</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="financial">Financial</option>
            <option value="customer">Customer</option>
            <option value="vehicle">Vehicle</option>
            <option value="service">Service</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    {getTypeIcon(report.type)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{report.name}</h3>
                    <p className="text-sm text-gray-600">{report.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="text-xs text-gray-500">
                        Last: {formatDate(report.lastGenerated)}
                      </span>
                      {report.nextScheduled && (
                        <span className="text-xs text-gray-500">
                          Next: {formatDate(report.nextScheduled)}
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => generateReport(report.id)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    <RefreshCw className="w-4 h-4 inline mr-1" />
                    Generate
                  </button>
                  <button
                    onClick={() => exportReport(report, report.format)}
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    <Download className="w-4 h-4 inline mr-1" />
                    Export
                  </button>
                  <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                    <Eye className="w-4 h-4 inline mr-1" />
                    View
                  </button>
                </div>
              </div>

                             {/* Report Data Preview */}
               <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                 {Object.entries(report.data).map(([key, value]) => (
                   <div key={key} className="bg-gray-50 rounded-lg p-3">
                     <p className="text-xs text-gray-500 uppercase tracking-wide">{key}</p>
                     <p className="text-sm font-medium text-gray-900">
                       {typeof value === 'number' && (key.includes('revenue') || key.includes('cost') || key.includes('profit'))
                         ? `$${(value as number).toLocaleString()}`
                         : typeof value === 'number' && (key.includes('rate') || key.includes('satisfaction'))
                         ? `${value}%`
                         : String(value)}
                     </p>
                   </div>
                 ))}
               </div>

              {/* Export Options */}
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Export as:</span>
                  {['pdf', 'excel', 'csv', 'json'].map((format) => (
                    <button
                      key={format}
                      onClick={() => exportReport(report, format)}
                      className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900"
                    >
                      {getFormatIcon(format)}
                      <span className="uppercase">{format}</span>
                    </button>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                    <Share2 className="w-4 h-4 inline mr-1" />
                    Share
                  </button>
                  <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                    <Mail className="w-4 h-4 inline mr-1" />
                    Email
                  </button>
                  <button className="text-gray-600 hover:text-gray-700 text-sm font-medium">
                    <Printer className="w-4 h-4 inline mr-1" />
                    Print
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Reports</p>
              <p className="text-2xl font-bold text-gray-900">
                {reports.filter(r => r.status === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Scheduled</p>
              <p className="text-2xl font-bold text-gray-900">
                {reports.filter(r => r.nextScheduled).length}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
