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
  HiOfficeBuilding,
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
import AddBusinessClientModal from '../components/businessClients/AddBusinessClientModal';
import ViewBusinessClientModal from '../components/businessClients/ViewBusinessClientModal';
import EditBusinessClientModal from '../components/businessClients/EditBusinessClientModal';

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
  const [error, setError] = useState<string | null>(null);
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<BusinessClient | null>(null);

  useEffect(() => {
    loadBusinessClients();
    loadStats();
  }, [filters]);

  const loadBusinessClients = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await businessClientService.getBusinessClients(filters);
      setBusinessClients(response.businessClients);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error loading business clients:', error);
      setError('Failed to load business clients');
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
      // Don't show error toast for stats as it's not critical
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

  const handleViewClient = (clientId: string) => {
    const client = businessClients.find(c => c._id === clientId);
    if (client) {
      setSelectedClient(client);
      setShowViewModal(true);
    }
  };

  const handleEditClient = (clientId: string) => {
    const client = businessClients.find(c => c._id === clientId);
    if (client) {
      setSelectedClient(client);
      setShowEditModal(true);
    }
  };

  const handleAddClient = () => {
    setShowAddModal(true);
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
        return <HiCheckCircle className="w-5 h-5 text-success-500" />;
      case 'pending':
        return <HiClock className="w-5 h-5 text-warning-500" />;
      case 'suspended':
        return <HiXCircle className="w-5 h-5 text-error-500" />;
      case 'inactive':
        return <HiExclamation className="w-5 h-5 text-secondary-500" />;
      default:
        return <HiExclamation className="w-5 h-5 text-secondary-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'status-success';
      case 'pending':
        return 'status-warning';
      case 'suspended':
        return 'status-error';
      case 'inactive':
        return 'status-secondary';
      default:
        return 'status-secondary';
    }
  };

  const getSubscriptionStatusColor = (status: string) => {
    return businessClientService.getSubscriptionStatusColor(status);
  };

  if (loading && businessClients.length === 0) {
    return (
      <div className="min-h-screen bg-secondary-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600 border-2 border-primary-600 border-t-transparent rounded-full"></div>
          <p className="text-secondary-600">Loading business clients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 p-6 space-y-8">
      {/* Page Header */}
      <div className="min-h-32 flex flex-col lg:flex-row justify-between items-start lg:items-center p-6">
        <div className="mb-4 lg:mb-0">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Business Clients</h1>
          <p className="text-secondary-600">Manage business partnerships and corporate accounts</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <HiPlus className="w-5 h-5 mr-2" />
            Add Business Client
          </button>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-secondary-600 mb-1">Total Clients</p>
              <p className="text-3xl font-bold text-primary-600">{stats.totalClients}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <HiOfficeBuilding className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-secondary-600 mb-1">Active Clients</p>
              <p className="text-3xl font-bold text-success-600">{stats.activeClients}</p>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
              <HiCheckCircle className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-secondary-600 mb-1">Trial Clients</p>
              <p className="text-3xl font-bold text-warning-600">{stats.trialClients}</p>
            </div>
            <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
              <HiClock className="w-6 h-6 text-warning-600" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between p-6">
            <div>
              <p className="text-sm font-medium text-secondary-600 mb-1">Monthly Revenue</p>
              <p className="text-3xl font-bold text-info-600">
                {businessClientService.formatCurrency(stats.monthlyRecurringRevenue)}
              </p>
            </div>
            <div className="w-12 h-12 bg-info-100 rounded-xl flex items-center justify-center">
              <HiCurrencyDollar className="w-6 h-6 text-info-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-error-50 border border-error-200 rounded-lg p-4">
          <div className="flex">
            <HiExclamation className="w-5 h-5 text-error-400 mt-0.5" />
            <div className="ml-3">
              <p className="text-sm text-error-800">{error}</p>
              <button
                onClick={() => {
                  setError(null);
                  loadBusinessClients();
                }}
                className="mt-2 text-sm text-error-600 hover:text-error-500 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="card mb-6">
        <div className="p-6 border-b border-secondary-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <HiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search business clients..."
                  value={filters.search || ''}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="input-field pl-10"
                />
              </div>
              
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="select-field"
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
                className="select-field"
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
                className="select-field"
              >
                <option value="">All Subscriptions</option>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="suspended">Suspended</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <button 
              onClick={handleAddClient}
              className="btn-primary"
            >
              <HiPlus className="h-5 w-5 mr-2" />
              Add Business Client
            </button>
          </div>
        </div>

        {/* Business Clients Table */}
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Business</th>
                <th className="table-header-cell">Contact</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Subscription</th>
                <th className="table-header-cell">Location</th>
                <th className="table-header-cell">Created</th>
                <th className="table-header-cell text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {businessClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-cell text-center text-secondary-500">
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="loading-spinner mr-2"></div>
                        Loading business clients...
                      </div>
                    ) : (
                      <div>
                        <HiOfficeBuilding className="w-12 h-12 text-secondary-300 mx-auto mb-4" />
                        <p className="text-lg font-medium text-secondary-900 mb-2">No business clients found</p>
                        <p className="text-secondary-500 mb-4">Get started by creating your first business client.</p>
                        <button
                          onClick={handleAddClient}
                          className="btn-primary"
                        >
                          <HiPlus className="h-5 w-5 mr-2" />
                          Add Business Client
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                businessClients.map((client) => (
                  <tr key={client._id} className="table-row">
                    <td className="table-cell whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-secondary-900">{client.businessName}</div>
                        <div className="text-sm text-secondary-500">
                          {businessClientService.getBusinessTypeLabel(client.businessType)}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-secondary-900">{client.contactPerson.name}</div>
                        <div className="text-sm text-secondary-500">{client.contactPerson.email}</div>
                        <div className="text-sm text-secondary-500">{client.contactPerson.phone}</div>
                      </div>
                    </td>
                    <td className="table-cell whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(client.status)}
                        <span className={`ml-2 status-badge ${getStatusColor(client.status)}`}>
                          {client.status}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-secondary-900">
                          {businessClientService.getPlanLabel(client.subscription.plan)}
                        </div>
                        <div className="text-sm text-secondary-500">
                          {businessClientService.formatCurrency(client.subscription.monthlyFee)}
                        </div>
                        <span className={`status-badge ${getSubscriptionStatusColor(client.subscription.status)}`}>
                          {client.subscription.status}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell whitespace-nowrap">
                      <div className="text-sm text-secondary-900">
                        <div>{client.address.city}, {client.address.state}</div>
                        <div className="text-secondary-500">{client.address.zipCode}</div>
                      </div>
                    </td>
                    <td className="table-cell whitespace-nowrap text-sm text-secondary-500">
                      {businessClientService.formatDate(client.createdAt)}
                    </td>
                    <td className="table-cell whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => handleViewClient(client._id)}
                          className="text-primary-600 hover:text-primary-900 transition-colors"
                          title="View details"
                        >
                          <HiEye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditClient(client._id)}
                          className="text-secondary-600 hover:text-secondary-900 transition-colors"
                          title="Edit client"
                        >
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
                            className="text-success-600 hover:text-success-900 transition-colors"
                            title="Activate client"
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
                            className="text-warning-600 hover:text-warning-900 transition-colors"
                            title="Suspend client"
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
                          className="text-error-600 hover:text-error-900 transition-colors"
                          title="Delete client"
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
          <div className="px-6 py-4 border-t border-secondary-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-secondary-700">
                Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)} of{' '}
                {pagination.totalItems} results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-3 py-1 text-sm border border-secondary-300 rounded-md hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-secondary-700">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-1 text-sm border border-secondary-300 rounded-md hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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

      {/* Add Business Client Modal */}
      <AddBusinessClientModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          loadBusinessClients();
          loadStats();
        }}
      />

      {/* View Business Client Modal */}
      <ViewBusinessClientModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedClient(null);
        }}
        businessClient={selectedClient}
      />

      {/* Edit Business Client Modal */}
      <EditBusinessClientModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedClient(null);
        }}
        onSuccess={() => {
          setShowEditModal(false);
          setSelectedClient(null);
          loadBusinessClients();
          loadStats();
        }}
        businessClient={selectedClient}
      />
    </div>
  );
}
