import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../redux';
import { 
  fetchCollections, 
  fetchOverdueCollections, 
  fetchCollectionsStats,
  setFilters,
  clearFilters 
} from '../redux/actions/collections';
import { 
  DollarSign, 
  AlertTriangle, 
  Users, 
  TrendingUp, 
  Filter, 
  Search, 
  Plus, 
  RefreshCw,
  Calendar,
  Phone,
  Mail,
  FileText,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  MessageSquare
} from '../utils/icons';
import PageTitle from '../components/Shared/PageTitle';
import { toast } from 'react-hot-toast';
import CreateCollectionsTaskModal from '../components/Collections/CreateCollectionsTaskModal';
import CollectionsTaskModal from '../components/Collections/CollectionsTaskModal';
import CommunicationModal from '../components/Collections/CommunicationModal';
import PaymentModal from '../components/Collections/PaymentModal';
import ScheduleReminderModal from '../components/Collections/ScheduleReminderModal';
import DocumentUploadModal from '../components/Collections/DocumentUploadModal';

const CollectionsManagementPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    collectionsTasks, 
    overdueCollections, 
    stats, 
    pagination, 
    loading, 
    error,
    filters 
  } = useAppSelector((state) => state.collections);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchCollections(filters));
    dispatch(fetchOverdueCollections());
    dispatch(fetchCollectionsStats());
  }, [dispatch, filters]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSearch = () => {
    dispatch(setFilters({ search: searchTerm, page: 1 }));
  };

  const handleFilterChange = (key: string, value: string) => {
    dispatch(setFilters({ [key]: value, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    dispatch(setFilters({ page }));
  };

  const handleClearFilters = () => {
    dispatch(clearFilters());
    setSearchTerm('');
  };

  const openTaskModal = (task: any) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const openCommunicationModal = (task: any) => {
    setSelectedTask(task);
    setShowCommunicationModal(true);
  };

  const openPaymentModal = (task: any) => {
    setSelectedTask(task);
    setShowPaymentModal(true);
  };

  const openReminderModal = (task: any) => {
    setSelectedTask(task);
    setShowReminderModal(true);
  };

  const openDocumentModal = (task: any) => {
    setSelectedTask(task);
    setShowDocumentModal(true);
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCollectionsTypeIcon = (type: string) => {
    switch (type) {
      case 'payment_reminder': return <Mail className="w-4 h-4" />;
      case 'overdue_notice': return <AlertTriangle className="w-4 h-4" />;
      case 'payment_plan': return <Calendar className="w-4 h-4" />;
      case 'negotiation': return <MessageSquare className="w-4 h-4" />;
      case 'legal_action': return <FileText className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <PageTitle title="Collections Management" />

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Outstanding</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats.overallStats.totalAmount - stats.overallStats.completedAmount)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overallStats.overdueTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overallStats.completedTasks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overallStats.totalTasks}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search collections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </button>
          </div>
        </div>

        {/* Filter Options */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <select
            value={filters.collectionsType}
            onChange={(e) => handleFilterChange('collectionsType', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="payment_reminder">Payment Reminder</option>
            <option value="overdue_notice">Overdue Notice</option>
            <option value="payment_plan">Payment Plan</option>
            <option value="negotiation">Negotiation</option>
            <option value="legal_action">Legal Action</option>
            <option value="other">Other</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filters.riskLevel}
            onChange={(e) => handleFilterChange('riskLevel', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Risk Levels</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="dueDate">Sort by Due Date</option>
            <option value="amount">Sort by Amount</option>
            <option value="priority">Sort by Priority</option>
            <option value="createdAt">Sort by Created</option>
          </select>
        </div>
      </div>

      {/* Collections Tasks Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Collections Tasks</h3>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer & Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status & Risk
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {collectionsTasks.map((task) => (
                  <tr key={task._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getCollectionsTypeIcon(task.collectionsType)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{task.title}</div>
                          <div className="text-sm text-gray-500">{task.description}</div>
                          <div className="text-xs text-gray-400">
                            {task.collectionsType.replace('_', ' ').toUpperCase()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {typeof task.customer === 'object' ? task.customer.businessName || task.customer.name : 'Unknown'}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(task.amount)}
                      </div>
                      {task.paymentPlan && (
                        <div className="text-xs text-gray-500">
                          Plan: {task.paymentPlan.paymentsMade}/{task.paymentPlan.numberOfInstallments} payments
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                          {task.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(task.riskLevel)}`}>
                          {task.riskLevel.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(task.dueDate).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openTaskModal(task)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openCommunicationModal(task)}
                          className="text-green-600 hover:text-green-900"
                          title="Add Communication"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openReminderModal(task)}
                          className="text-orange-600 hover:text-orange-900"
                          title="Schedule Reminder"
                        >
                          <Clock className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openDocumentModal(task)}
                          className="text-purple-600 hover:text-purple-900"
                          title="Upload Document"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        {task.paymentPlan && (
                          <button
                            onClick={() => openPaymentModal(task)}
                            className="text-purple-600 hover:text-purple-900"
                            title="Record Payment"
                          >
                            <DollarSign className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.currentPage - 1) * 10) + 1} to {Math.min(pagination.currentPage * 10, pagination.totalTasks)} of {pagination.totalTasks} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateCollectionsTaskModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showTaskModal && selectedTask && (
        <CollectionsTaskModal
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          task={selectedTask}
        />
      )}

      {showCommunicationModal && selectedTask && (
        <CommunicationModal
          isOpen={showCommunicationModal}
          onClose={() => setShowCommunicationModal(false)}
          task={selectedTask}
        />
      )}

      {showPaymentModal && selectedTask && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          task={selectedTask}
        />
      )}

      {showReminderModal && selectedTask && (
        <ScheduleReminderModal
          isOpen={showReminderModal}
          onClose={() => setShowReminderModal(false)}
          task={selectedTask}
        />
      )}

      {showDocumentModal && selectedTask && (
        <DocumentUploadModal
          isOpen={showDocumentModal}
          onClose={() => setShowDocumentModal(false)}
          task={selectedTask}
        />
      )}
    </div>
  );
};

export default CollectionsManagementPage;
