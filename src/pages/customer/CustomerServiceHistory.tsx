import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { customerService } from '../../services/customers';
import { toast } from 'react-hot-toast';
import { 
  FileText, 
  Calendar, 
  Car, 
  DollarSign, 
  User, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Filter,
  Search,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Star,
  Wrench,
  Battery,
  Droplets,
  AlertCircle
} from '../../utils/icons';

interface ServiceRecord {
  _id: string;
  date: string | null;
  serviceType: string | null;
  description: string | null;
  cost: number | null;
  vehicle: {
    make: string;
    model: string;
    year: number;
    vin: string;
  } | null;
  technician: string | null;
  status: string | null;
  notes?: string;
  createdAt: string;
}

interface ServiceStats {
  totalServices: number;
  totalSpent: number;
  averageCost: number;
  lastServiceDate?: string | null;
  nextServiceDue?: string;
  mostCommonService: string;
}

export default function CustomerServiceHistory() {
  const { user } = useAuth();
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [filteredServices, setFilteredServices] = useState<ServiceRecord[]>([]);
  const [stats, setStats] = useState<ServiceStats>({
    totalServices: 0,
    totalSpent: 0,
    averageCost: 0,
    mostCommonService: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedServiceType, setSelectedServiceType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'cost' | 'serviceType'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedService, setExpandedService] = useState<string | null>(null);

  // Get service icon based on service type
  const getServiceIcon = (serviceType: string | null) => {
    if (!serviceType) return <Wrench className="w-5 h-5" />;
    const type = serviceType.toLowerCase();
    if (type.includes('oil')) return <Droplets className="w-5 h-5" />;
    if (type.includes('battery')) return <Battery className="w-5 h-5" />;
    if (type.includes('tire') || type.includes('wheel')) return <AlertCircle className="w-5 h-5" />;
    if (type.includes('brake')) return <AlertTriangle className="w-5 h-5" />;
    if (type.includes('engine') || type.includes('transmission')) return <Wrench className="w-5 h-5" />;
    return <Wrench className="w-5 h-5" />;
  };

  // Get status badge
  const getStatusBadge = (status: string | null) => {
    if (!status) status = 'unknown';
    
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" /> },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-4 h-4" /> },
      cancelled: { color: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4" /> },
      in_progress: { color: 'bg-blue-100 text-blue-800', icon: <Clock className="w-4 h-4" /> },
      unknown: { color: 'bg-gray-100 text-gray-800', icon: <AlertCircle className="w-4 h-4" /> }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.unknown;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount: number | null | undefined) => {
    if (amount === null || amount === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Calculate stats
  const calculateStats = (services: ServiceRecord[]) => {
    if (services.length === 0) return stats;

    const totalSpent = services.reduce((sum, service) => sum + (service.cost || 0), 0);
    const averageCost = totalSpent / services.length;
    
    // Find most common service type
    const serviceCounts = services.reduce((acc, service) => {
      const serviceType = service.serviceType || 'Unknown';
      acc[serviceType] = (acc[serviceType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommonService = Object.entries(serviceCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || '';

    // Find last service date
    const lastServiceDate = services
      .filter(service => service.date) // Filter out services with null dates
      .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())[0]?.date;

    return {
      totalServices: services.length,
      totalSpent,
      averageCost,
      lastServiceDate,
      mostCommonService
    };
  };

  // Filter and sort services
  const filterAndSortServices = () => {
    let filtered = services.filter(service => {
      const matchesSearch = (service.serviceType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (service.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (service.vehicle?.make || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (service.vehicle?.model || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesYear = selectedYear === 'all' || 
                         (service.date && new Date(service.date).getFullYear().toString() === selectedYear);
      
      const matchesServiceType = selectedServiceType === 'all' || 
                                (service.serviceType && service.serviceType === selectedServiceType);
      
      return matchesSearch && matchesYear && matchesServiceType;
    });

    // Sort services
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'date':
          aValue = a.date ? new Date(a.date).getTime() : 0;
          bValue = b.date ? new Date(b.date).getTime() : 0;
          break;
        case 'cost':
          aValue = a.cost || 0;
          bValue = b.cost || 0;
          break;
        case 'serviceType':
          aValue = (a.serviceType || '').toLowerCase();
          bValue = (b.serviceType || '').toLowerCase();
          break;
        default:
          aValue = a.date ? new Date(a.date).getTime() : 0;
          bValue = b.date ? new Date(b.date).getTime() : 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredServices(filtered);
  };

  // Load service history
  const loadServiceHistory = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await customerService.getCustomerServiceHistory();
      
      if (response.success) {
        // Debug logging to see what we're receiving
        console.log('Service history response:', response.data.services);
        console.log('First service vehicle data:', response.data.services[0]?.vehicle);
        
        setServices(response.data.services);
        setFilteredServices(response.data.services);
        setStats(calculateStats(response.data.services));
      } else {
        setError('Failed to load service history');
        toast.error('Failed to load service history');
      }
    } catch (err) {
      console.error('Error loading service history:', err);
      setError('An error occurred while loading service history');
      toast.error('An error occurred while loading service history');
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique years from services
  const getUniqueYears = () => {
    const years = [...new Set(services
      .filter(service => service.date) // Filter out services with null dates
      .map(service => 
        new Date(service.date!).getFullYear().toString()
      ))];
    return years.sort((a, b) => parseInt(b) - parseInt(a));
  };

  // Get unique service types
  const getUniqueServiceTypes = () => {
    return [...new Set(services.map(service => service.serviceType || 'Unknown'))].sort();
  };

  // Export service history
  const exportServiceHistory = () => {
    const csvContent = [
      ['Date', 'Service Type', 'Description', 'Cost', 'Vehicle', 'Technician', 'Status'],
      ...filteredServices.map(service => [
        formatDate(service.date),
        service.serviceType || 'Unknown',
        service.description || 'No description',
        formatCurrency(service.cost),
        service.vehicle ? 
          `${service.vehicle.year || ''} ${service.vehicle.make || ''} ${service.vehicle.model || ''}`.trim() :
          'Vehicle info not available',
        service.technician || 'Unknown',
        service.status || 'Unknown'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `service-history-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast.success('Service history exported successfully');
  };

  // Load data on component mount
  useEffect(() => {
    loadServiceHistory();
  }, []);

  // Filter and sort when filters change
  useEffect(() => {
    filterAndSortServices();
  }, [services, searchTerm, selectedYear, selectedServiceType, sortBy, sortOrder]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Service History</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={loadServiceHistory}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Service History</h1>
              <p className="text-gray-600">View your complete service history and maintenance records</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={exportServiceHistory}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <button
                onClick={loadServiceHistory}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Services</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalServices}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Wrench className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalSpent)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Cost</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.averageCost)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Service</p>
                <p className="text-xl font-bold text-gray-900">
                  {stats.lastServiceDate ? formatDate(stats.lastServiceDate) : 'N/A'}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Years</option>
                {getUniqueYears().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Service Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
              <select
                value={selectedServiceType}
                onChange={(e) => setSelectedServiceType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Services</option>
                {getUniqueServiceTypes().map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-') as ['date' | 'cost' | 'serviceType', 'asc' | 'desc'];
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date-desc">Date (Newest)</option>
                <option value="date-asc">Date (Oldest)</option>
                <option value="cost-desc">Cost (High to Low)</option>
                <option value="cost-asc">Cost (Low to High)</option>
                <option value="serviceType-asc">Service Type (A-Z)</option>
                <option value="serviceType-desc">Service Type (Z-A)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Service History List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Service Records ({filteredServices.length})
            </h3>
          </div>

          {filteredServices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Service Records Found</h3>
              <p className="text-gray-600">
                {services.length === 0 
                  ? "You don't have any service records yet." 
                  : "No services match your current filters."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredServices.map((service) => (
                <div key={service._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {getServiceIcon(service.serviceType)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{service.serviceType || 'Unknown Service'}</h4>
                          {getStatusBadge(service.status || 'unknown')}
                        </div>
                        
                        <p className="text-gray-600 mb-3">{service.description || 'No description available'}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{formatDate(service.date)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Car className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {service.vehicle ? 
                                `${service.vehicle.year || ''} ${service.vehicle.make || ''} ${service.vehicle.model || ''}`.trim() :
                                'Vehicle info not available'
                              }
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 font-semibold">{formatCurrency(service.cost)}</span>
                          </div>
                        </div>

                        {expandedService === service._id && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="font-medium text-gray-700 mb-1">Technician</p>
                                <p className="text-gray-600">{service.technician || 'Unknown'}</p>
                              </div>
                              <div>
                                <p className="font-medium text-gray-700 mb-1">VIN</p>
                                <p className="text-gray-600 font-mono">{service.vehicle?.vin || 'N/A'}</p>
                              </div>
                              {service.notes && (
                                <div className="md:col-span-2">
                                  <p className="font-medium text-gray-700 mb-1">Notes</p>
                                  <p className="text-gray-600">{service.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => setExpandedService(
                          expandedService === service._id ? null : service._id
                        )}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {expandedService === service._id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
