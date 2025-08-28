import React, { useState, useEffect, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Package, 
  User, 
  Car, 
  RefreshCw,
  Search,
  Filter,
  Eye,
  Wrench,
  TrendingUp,
  Calendar,
  DollarSign,
  Zap
} from '../utils/icons';
import { workOrderService, WorkOrder, JobBoardFilters } from '../services/workOrders';
import WorkOrderDetailsModal from '../components/Shared/WorkOrderDetailsModal';

interface WorkOrderCardProps {
  workOrder: WorkOrder;
  onStartWork: (id: string) => void;
  onUpdateProgress: (id: string) => void;
  onComplete: (id: string) => void;
  onCheckParts: (id: string) => void;
  onViewDetails: (workOrder: WorkOrder) => void;
}

const WorkOrderCard: React.FC<WorkOrderCardProps> = ({
  workOrder,
  onStartWork,
  onUpdateProgress,
  onComplete,
  onCheckParts,
  onViewDetails
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-4 h-4" />, label: 'Pending' };
      case 'in_progress':
        return { color: 'bg-blue-100 text-blue-800', icon: <Play className="w-4 h-4" />, label: 'In Progress' };
      case 'completed':
        return { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" />, label: 'Completed' };
      case 'cancelled':
        return { color: 'bg-red-100 text-red-800', icon: <AlertTriangle className="w-4 h-4" />, label: 'Cancelled' };
      case 'on_hold':
        return { color: 'bg-orange-100 text-orange-800', icon: <Pause className="w-4 h-4" />, label: 'On Hold' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: <Clock className="w-4 h-4" />, label: 'Unknown' };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { color: 'bg-red-500', label: 'Urgent' };
      case 'high':
        return { color: 'bg-orange-500', label: 'High' };
      case 'medium':
        return { color: 'bg-yellow-500', label: 'Medium' };
      case 'low':
        return { color: 'bg-green-500', label: 'Low' };
      default:
        return { color: 'bg-gray-500', label: 'Unknown' };
    }
  };

  const statusConfig = getStatusConfig(workOrder.status);
  const priorityConfig = getPriorityConfig(workOrder.priority);

  const totalLaborHours = workOrder.services.reduce((sum, service) => sum + service.laborHours, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">{workOrder.workOrderNumber}</h3>
            <p className="text-sm text-gray-600">{workOrder.customer.name}</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${priorityConfig.color}`} title={priorityConfig.label}></div>
            <span className={`px-2 py-1 text-xs rounded-full font-medium flex items-center gap-1 ${statusConfig.color}`}>
              {statusConfig.icon}
              {statusConfig.label}
            </span>
          </div>
        </div>
        
        {/* Vehicle Info */}
        <div className="flex items-center space-x-3 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Car className="w-4 h-4" />
            <span>{workOrder.vehicle.year} {workOrder.vehicle.make} {workOrder.vehicle.model}</span>
          </div>
          {workOrder.technician && (
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>{workOrder.technician.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Services */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900 text-sm">Services</h4>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Wrench className="w-3 h-3" />
            <span>{workOrder.services.length} service{workOrder.services.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
        <div className="space-y-1">
          {workOrder.services.slice(0, 2).map((service, index) => (
            <div key={index} className="text-sm text-gray-600 flex justify-between">
              <span className="truncate">{service.service.name}</span>
              <span className="text-gray-500">{service.laborHours}h</span>
            </div>
          ))}
          {workOrder.services.length > 2 && (
            <div className="text-xs text-gray-500">
              +{workOrder.services.length - 2} more services
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center space-x-1 text-gray-600">
            <Clock className="w-3 h-3" />
            <span>{totalLaborHours}h total</span>
          </div>
          <div className="flex items-center space-x-1 text-gray-600">
            <DollarSign className="w-3 h-3" />
            <span>${workOrder.totalCost.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 space-y-2">
        {workOrder.status === 'pending' && (
          <button
            onClick={() => onStartWork(workOrder._id)}
            className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
          >
            <Play className="w-4 h-4" />
            <span>Start Work</span>
          </button>
        )}
        
        {workOrder.status === 'on_hold' && (
          <button
            onClick={() => onCheckParts(workOrder._id)}
            className="w-full px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
          >
            <Package className="w-4 h-4" />
            <span>Check Parts</span>
          </button>
        )}
        
        {workOrder.status === 'in_progress' && (
          <div className="space-y-2">
            <button
              onClick={() => onUpdateProgress(workOrder._id)}
              className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
            >
              <TrendingUp className="w-4 h-4" />
              <span>Update Progress</span>
            </button>
            <button
              onClick={() => onComplete(workOrder._id)}
              className="w-full px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Complete</span>
            </button>
          </div>
        )}
        
        <button
          onClick={() => onViewDetails(workOrder)}
          className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center justify-center space-x-2"
        >
          <Eye className="w-4 h-4" />
          <span>View Details</span>
        </button>
      </div>
    </div>
  );
};

export default function JobBoardPage() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<JobBoardFilters>({
    status: 'all',
    priority: 'all',
    search: ''
  });
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch work orders
  const fetchWorkOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await workOrderService.getJobBoardWorkOrders(filters);
      if (response.success) {
        setWorkOrders(response.data.workOrders);
        setError(null);
      } else {
        setError('Failed to fetch work orders');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch work orders');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Initial fetch and auto-refresh
  useEffect(() => {
    fetchWorkOrders();
  }, [fetchWorkOrders]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchWorkOrders();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, fetchWorkOrders]);

  // Action handlers
  const handleStartWork = async (workOrderId: string) => {
    try {
      const response = await workOrderService.startWork(workOrderId, 'current-user-id');
      if (response.success) {
        await fetchWorkOrders();
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start work');
    }
  };

  const handleUpdateProgress = async (workOrderId: string) => {
    // This would open a progress update modal
    console.log('Update progress for:', workOrderId);
  };

  const handleComplete = async (workOrderId: string) => {
    // This would open a completion modal
    console.log('Complete work order:', workOrderId);
  };

  const handleCheckParts = async (workOrderId: string) => {
    try {
      const response = await workOrderService.checkPartsAvailability(workOrderId);
      if (response.success) {
        await fetchWorkOrders();
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check parts');
    }
  };

  const handleViewDetails = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder);
    setShowDetailsModal(true);
  };

  // Filter work orders
  const filteredWorkOrders = workOrders.filter(wo => {
    const searchTerm = filters.search || '';
    const matchesSearch = 
      wo.workOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wo.vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'all' || wo.status === filters.status;
    const matchesPriority = filters.priority === 'all' || wo.priority === filters.priority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Calculate stats
  const stats = {
    total: workOrders.length,
    pending: workOrders.filter(wo => wo.status === 'pending').length,
    inProgress: workOrders.filter(wo => wo.status === 'in_progress').length,
    completed: workOrders.filter(wo => wo.status === 'completed').length,
    onHold: workOrders.filter(wo => wo.status === 'on_hold').length
  };

  if (loading && workOrders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Board</h1>
          <p className="text-gray-600">Manage work orders and track progress</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              autoRefresh ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            <span>Auto-refresh {autoRefresh ? 'ON' : 'OFF'}</span>
          </button>
          <button
            onClick={fetchWorkOrders}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Wrench className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Play className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">On Hold</p>
              <p className="text-2xl font-bold text-orange-600">{stats.onHold}</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Pause className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search work orders..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Work Orders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredWorkOrders.map((workOrder) => (
          <WorkOrderCard
            key={workOrder._id}
            workOrder={workOrder}
            onStartWork={handleStartWork}
            onUpdateProgress={handleUpdateProgress}
            onComplete={handleComplete}
            onCheckParts={handleCheckParts}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {filteredWorkOrders.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wrench className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg font-medium">No work orders found</p>
          <p className="text-gray-400">Try adjusting your filters or search terms</p>
        </div>
      )}

      {/* Work Order Details Modal */}
      {showDetailsModal && selectedWorkOrder && (
        <WorkOrderDetailsModal
          workOrder={selectedWorkOrder}
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  );
}
