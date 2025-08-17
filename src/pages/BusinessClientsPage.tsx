import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  HiPlus, 
  HiSearch, 
  HiFilter, 
  HiEye, 
  HiPencil, 
  HiTrash,
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiExclamation,
  HiBuilding,
  HiPhone,
  HiMail,
  HiLocationMarker,
  HiCalendar,
  HiCurrencyDollar,
  HiUsers,
  HiChartBar
} from 'react-icons/hi';
import PageTitle from '../components/Shared/PageTitle';
import businessClientService, { 
  BusinessClient, 
  BusinessClientFilters, 
  BusinessClientStats,
  CreateBusinessClientData 
} from '../services/businessClients';
import ConfirmDialog from '../components/Shared/ConfirmDialog';

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'danger' | 'warning' | 'info' | 'success';
  onConfirm: () => void;
}

export default function BusinessClientsPage() {
  const [businessClients, setBusinessClients] = useState<BusinessClient[]>([]);
  const [stats, setStats] = useState<BusinessClientStats>({
    totalClients: 0,
    activeClients: 0,
    trialClients: 0,
    suspendedClients: 0,
    newThisMonth: 0,
    expiringThisMonth: 0,
    monthlyRecurringRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<BusinessClientFilters>({
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
    limit: 10
  });
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    message: '',
    type: 'danger',
    onConfirm: () => {}
  });

  useEffect(() => {
    loadBusinessClients();
    loadStats();
  }, [filters]);

  const loadBusinessClients = async () => {
    try {
      setLoading(true);
      const response = await businessClientService.getBusinessClients(filters);
      setBusinessClients(response.businessClients);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error loading business clients:', error);
      toast.error('Failed to load business clients');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await businessClientService.getBusinessClientStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleFilterChange = (key: keyof BusinessClientFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleActivateClient = async (clientId: string) => {
    try {
      await businessClientService.activateBusinessClient(clientId, {});
      toast.success('Business client activated successfully');
      loadBusinessClients();
      loadStats();
    } catch (error) {
      console.error('Error activating business client:', error);
      toast.error('Failed to activate business client');
    }
  };

  const handleSuspendClient = async (clientId: string) => {
    try {
      await businessClientService.suspendBusinessClient(clientId);
      toast.success('Business client suspended successfully');
      loadBusinessClients();
      loadStats();
    } catch (error) {
      console.error('Error suspending business client:', error);
      toast.error('Failed to suspend business client');
    }
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      await businessClientService.deleteBusinessClient(clientId);
      toast.success('Business client deleted successfully');
      loadBusinessClients();
      loadStats();
    } catch (error) {
      console.error('Error deleting business client:', error);
      toast.error('Failed to delete business client');
    }
  };

  const showConfirmDialog = (title: string, message: string, type: 'danger' | 'warning' | 'info' | 'success', onConfirm: () => void) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      type,
      onConfirm
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <HiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <HiClock className="w-5 h-5 text-yellow-500" />;
      case 'suspended':
        return <HiXCircle className="w-5 h-5 text-red-500" />;
      case 'inactive':
        return <HiExclamation className="w-5 h-5 text-gray-500" />;
      default:
        return <HiExclamation className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubscriptionStatusColor = (status: string) => {
    return businessClientService.getSubscriptionStatusColor(status);
  };

  if (loading && businessClients.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <PageTitle title="Business Clients" />
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <HiBuilding className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <HiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Clients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeClients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <HiClock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Trial Clients</p>
              <p className="text-2xl font-bold text-gray-900">{stats.trialClients}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <HiCurrencyDollar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                {businessClientService.formatCurrency(stats.monthlyRecurringRevenue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search business clients..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={filters.businessType || ''}
                onChange={(e) => handleFilterChange('businessType', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                <option value="auto_repair">Auto Repair</option>
                <option value="tire_shop">Tire Shop</option>
                <option value="oil_change">Oil Change</option>
                <option value="brake_shop">Brake Shop</option>
                <option value="general_repair">General Repair</option>
                <option value="dealership">Dealership</option>
                <option value="specialty_shop">Specialty Shop</option>
                <option value="other">Other</option>
              </select>

              <select
                value={filters.subscriptionStatus || ''}
                onChange={(e) => handleFilterChange('subscriptionStatus', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Subscriptions</option>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="suspended">Suspended</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <HiPlus className="h-5 w-5 mr-2" />
              Add Business Client
            </button>
          </div>
        </div>

        {/* Business Clients Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subscription</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {businessClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No business clients found. Create your first business client to get started.
                  </td>
                </tr>
              ) : (
                businessClients.map((client) => (
                  <tr key={client._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{client.businessName}</div>
                        <div className="text-sm text-gray-500">
                          {businessClientService.getBusinessTypeLabel(client.businessType)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{client.contactPerson.name}</div>
                        <div className="text-sm text-gray-500">{client.contactPerson.email}</div>
                        <div className="text-sm text-gray-500">{client.contactPerson.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(client.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(client.status)}`}>
                          {client.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {businessClientService.getPlanLabel(client.subscription.plan)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {businessClientService.formatCurrency(client.subscription.monthlyFee)}
                        </div>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSubscriptionStatusColor(client.subscription.status)}`}>
                          {client.subscription.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>{client.address.city}, {client.address.state}</div>
                        <div className="text-gray-500">{client.address.zipCode}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {businessClientService.formatDate(client.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <HiEye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <HiPencil className="w-4 h-4" />
                        </button>
                        {client.subscription.status === 'trial' && (
                          <button 
                            onClick={() => showConfirmDialog(
                              'Activate Client',
                              `Are you sure you want to activate ${client.businessName}?`,
                              'success',
                              () => handleActivateClient(client._id)
                            )}
                            className="text-green-600 hover:text-green-900"
                          >
                            <HiCheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {client.subscription.status === 'active' && (
                          <button 
                            onClick={() => showConfirmDialog(
                              'Suspend Client',
                              `Are you sure you want to suspend ${client.businessName}?`,
                              'warning',
                              () => handleSuspendClient(client._id)
                            )}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            <HiXCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => showConfirmDialog(
                            'Delete Client',
                            `Are you sure you want to delete ${client.businessName}? This action cannot be undone.`,
                            'danger',
                            () => handleDeleteClient(client._id)
                          )}
                          className="text-red-600 hover:text-red-900"
                        >
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)} of{' '}
                {pagination.totalItems} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-700">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type={confirmDialog.type}
        onConfirm={() => {
          confirmDialog.onConfirm();
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
