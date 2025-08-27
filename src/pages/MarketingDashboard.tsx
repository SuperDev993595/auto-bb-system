import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Mail, 
  Phone, 
  Users, 
  BarChart3, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Send,
  FileText,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from '../utils/icons';
import PageTitle from '../components/Shared/PageTitle';
import { useAppSelector, useAppDispatch } from '../redux';
import { 
  fetchCampaigns, 
  fetchCampaignStats, 
  createCampaign, 
  deleteCampaign, 
  updateCampaignStatus 
} from '../redux/actions/marketing';
import { MarketingCampaign, CreateCampaignData } from '../services/marketing';
import CreateCampaignModal from '../components/Marketing/CreateCampaignModal';
import DeleteCampaignModal from '../components/Marketing/DeleteCampaignModal';

export default function MarketingDashboard() {
  const dispatch = useAppDispatch();
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<MarketingCampaign | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { campaigns, stats, loading } = useAppSelector(state => state.marketing);

  // Fetch campaigns and stats on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await Promise.all([
          dispatch(fetchCampaigns({
            status: statusFilter !== 'all' ? statusFilter : undefined,
            type: typeFilter !== 'all' ? typeFilter : undefined,
            search: searchTerm || undefined
          })),
          dispatch(fetchCampaignStats())
        ]);
      } catch (error) {
        console.error('Error loading marketing data:', error);
        toast.error('Failed to load marketing data');
      }
    };

    loadData();
  }, [dispatch]);

  // Refetch campaigns when filters change
  useEffect(() => {
    if (!loading) {
      dispatch(fetchCampaigns({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        search: searchTerm || undefined
      }));
    }
  }, [statusFilter, typeFilter, searchTerm, dispatch]);

  const handleCreateCampaign = async (campaignData: CreateCampaignData) => {
    try {
      setIsSubmitting(true);
      await dispatch(createCampaign(campaignData));
      toast.success('Campaign created successfully!');
      setShowCreateModal(false);
      
      // Refresh data
      dispatch(fetchCampaigns({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        search: searchTerm || undefined
      }));
      dispatch(fetchCampaignStats());
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error('Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClick = (campaign: MarketingCampaign) => {
    setSelectedCampaign(campaign);
    setShowDeleteModal(true);
  };

  const handleDeleteCampaign = async (campaignId: string) => {
    try {
      setIsSubmitting(true);
      await dispatch(deleteCampaign(campaignId));
      toast.success('Campaign deleted successfully!');
      setShowDeleteModal(false);
      setSelectedCampaign(null);
      
      // Refresh data
      dispatch(fetchCampaigns({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        search: searchTerm || undefined
      }));
      dispatch(fetchCampaignStats());
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast.error('Failed to delete campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusUpdate = async (campaignId: string, status: MarketingCampaign['status']) => {
    try {
      await dispatch(updateCampaignStatus({ id: campaignId, status }));
      toast.success('Campaign status updated successfully!');
      
      // Refresh data
      dispatch(fetchCampaignStats());
    } catch (error) {
      console.error('Error updating campaign status:', error);
      toast.error('Failed to update campaign status');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-5 h-5 text-success-500" />;
      case 'scheduled':
        return <Clock className="w-5 h-5 text-info-500" />;
      case 'draft':
        return <Edit className="w-5 h-5 text-secondary-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-error-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-warning-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'status-active';
      case 'scheduled':
        return 'status-pending';
      case 'draft':
        return 'status-inactive';
      case 'failed':
        return 'status-inactive';
      default:
        return 'status-pending';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-5 h-5 text-info-500" />;
      case 'sms':
        return <Phone className="w-5 h-5 text-success-500" />;
      case 'mailchimp':
        return <Users className="w-5 h-5 text-primary-500" />;
      default:
        return <Mail className="w-5 h-5 text-secondary-500" />;
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading marketing data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Marketing Dashboard</h1>
            <p className="text-gray-600">Manage marketing campaigns and track performance</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {/* Add new campaign functionality */}}
              className="p-3 bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-colors"
              title="New Campaign"
            >
              <HiPlus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Active Campaigns: {activeCampaigns}
            </span>
            <span className="text-sm text-gray-500">
              Total Leads: {totalLeads}
            </span>
            <span className="text-sm text-gray-500">
              Conversion Rate: {conversionRate}%
            </span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-info-100 rounded-xl mx-auto mb-4">
            <Mail className="w-6 h-6 text-info-600" />
          </div>
          <p className="text-sm font-medium text-secondary-600">Total</p>
          <p className="text-2xl font-bold text-secondary-900">{stats?.totalCampaigns || 0}</p>
          <div className="mt-2">
            <p className="text-sm text-secondary-600">Total Campaigns</p>
          </div>
        </div>

        <div className="card p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-success-100 rounded-xl mx-auto mb-4">
            <Users className="w-6 h-6 text-success-600" />
          </div>
          <p className="text-sm font-medium text-secondary-600">Recipients</p>
          <p className="text-2xl font-bold text-secondary-900">{(stats?.totalRecipients || 0).toLocaleString()}</p>
          <div className="mt-2">
            <p className="text-sm text-secondary-600">Total Recipients</p>
          </div>
        </div>

        <div className="card p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-xl mx-auto mb-4">
            <BarChart3 className="w-6 h-6 text-primary-600" />
          </div>
          <p className="text-sm font-medium text-secondary-600">Delivery</p>
          <p className="text-2xl font-bold text-secondary-900">
            {stats?.totalRecipients && stats.totalRecipients > 0 
              ? ((stats.totalSent / stats.totalRecipients) * 100).toFixed(1) 
              : '0.0'}%
          </p>
          <div className="mt-2">
            <p className="text-sm text-secondary-600">Delivery Rate</p>
          </div>
        </div>

        <div className="card p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-warning-100 rounded-xl mx-auto mb-4">
            <Eye className="w-6 h-6 text-warning-600" />
          </div>
          <p className="text-sm font-medium text-secondary-600">Open Rate</p>
          <p className="text-2xl font-bold text-secondary-900">
            {stats?.totalSent && stats.totalSent > 0 
              ? ((stats.totalOpened / stats.totalSent) * 100).toFixed(1) 
              : '0.0'}%
          </p>
          <div className="mt-2">
            <p className="text-sm text-secondary-600">Open Rate</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="form-label">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-input"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          
          <div>
            <label className="form-label">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="form-input"
            >
              <option value="all">All Types</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="mailchimp">MailChimp</option>
            </select>
          </div>
          
          <div>
            <label className="form-label">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search campaigns..."
              className="form-input"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setStatusFilter('all');
                setTypeFilter('all');
                setSearchTerm('');
              }}
              className="btn-secondary w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button 
          onClick={() => setShowCreateModal(true)}
          className="card p-6 text-left hover:bg-secondary-50 transition-colors"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-info-100 rounded-xl flex items-center justify-center mr-4">
              <Mail className="w-6 h-6 text-info-600" />
            </div>
            <div>
              <p className="font-medium text-secondary-900">Create Email Campaign</p>
              <p className="text-sm text-secondary-600">Send to your customer list</p>
            </div>
          </div>
        </button>

        <button 
          onClick={() => setShowCreateModal(true)}
          className="card p-6 text-left hover:bg-secondary-50 transition-colors"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center mr-4">
              <Phone className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <p className="font-medium text-secondary-900">Send SMS</p>
              <p className="text-sm text-secondary-600">Quick text message</p>
            </div>
          </div>
        </button>

        <button 
          onClick={() => setShowCreateModal(true)}
          className="card p-6 text-left hover:bg-secondary-50 transition-colors"
        >
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mr-4">
              <FileText className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-secondary-900">Create Template</p>
              <p className="text-sm text-secondary-600">Design reusable templates</p>
            </div>
          </div>
        </button>
      </div>

      {/* Campaigns Table */}
      <div className="card">
        <div className="p-6 border-b border-secondary-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-secondary-900">Recent Campaigns</h2>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Campaign
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header-cell">Campaign</th>
                <th className="table-header-cell">Type</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Recipients</th>
                <th className="table-header-cell">Performance</th>
                <th className="table-header-cell">Created</th>
                <th className="table-header-cell text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-secondary-500">
                    No campaigns found. Create your first campaign to get started.
                  </td>
                </tr>
              ) : (
                campaigns.map((campaign) => (
                  <tr key={campaign._id} className="hover:bg-secondary-50">
                    <td className="table-cell">
                      <div>
                        <div className="text-sm font-medium text-secondary-900">{campaign.name}</div>
                        <div className="text-sm text-secondary-500">{campaign.type}</div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center">
                        {getTypeIcon(campaign.type)}
                        <span className="ml-2 text-sm text-secondary-900 capitalize">{campaign.type}</span>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center">
                        {getStatusIcon(campaign.status)}
                        <span className={`ml-2 status-badge ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </div>
                    </td>
                    <td className="table-cell text-sm text-secondary-900">
                      {campaign.recipientCount.toLocaleString()}
                    </td>
                    <td className="table-cell">
                      <div className="text-sm text-secondary-900">
                        {campaign.sentCount} sent
                        {campaign.openedCount > 0 && ` • ${campaign.openedCount} opened`}
                        {campaign.clickedCount > 0 && ` • ${campaign.clickedCount} clicked`}
                      </div>
                    </td>
                    <td className="table-cell text-sm text-secondary-500">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </td>
                    <td className="table-cell text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleStatusUpdate(campaign._id, 'sent')}
                          disabled={campaign.status === 'sent'}
                          className="text-info-600 hover:text-info-900 disabled:text-secondary-400 transition-colors"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            // TODO: Implement view campaign details
                            toast.success('View campaign details - Coming soon!');
                          }}
                          className="text-secondary-600 hover:text-secondary-900 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            // TODO: Implement edit campaign
                            toast.success('Edit campaign - Coming soon!');
                          }}
                          className="text-secondary-600 hover:text-secondary-900 transition-colors"
                          title="Edit Campaign"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(campaign)}
                          className="text-error-600 hover:text-error-900 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateCampaign}
        isLoading={isSubmitting}
      />

      {/* Delete Campaign Modal */}
      {selectedCampaign && (
        <DeleteCampaignModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedCampaign(null);
          }}
          onDelete={handleDeleteCampaign}
          campaign={selectedCampaign}
        />
      )}
    </div>
  );
}
