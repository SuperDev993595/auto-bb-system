import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  HiMail, 
  HiPhone, 
  HiUsers, 
  HiChartBar, 
  HiPlus, 
  HiEye, 
  HiPencil, 
  HiTrash, 
  HiPaperAirplane,
  HiTemplate,
  HiCalendar,
  HiClock,
  HiCheckCircle,
  HiXCircle,
  HiExclamation
} from 'react-icons/hi';
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

  const handleDeleteCampaign = async () => {
    if (!selectedCampaign) return;

    try {
      setIsSubmitting(true);
      await dispatch(deleteCampaign(selectedCampaign._id));
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
        return <HiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'scheduled':
        return <HiClock className="w-5 h-5 text-blue-500" />;
      case 'draft':
        return <HiPencil className="w-5 h-5 text-gray-500" />;
      case 'failed':
        return <HiXCircle className="w-5 h-5 text-red-500" />;
      default:
        return <HiExclamation className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <HiMail className="w-5 h-5 text-blue-500" />;
      case 'sms':
        return <HiPhone className="w-5 h-5 text-green-500" />;
      case 'mailchimp':
        return <HiUsers className="w-5 h-5 text-purple-500" />;
      default:
        return <HiMail className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
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
      <PageTitle title="Marketing Dashboard" />
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <HiMail className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalCampaigns || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <HiUsers className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Recipients</p>
              <p className="text-2xl font-bold text-gray-900">{(stats?.totalRecipients || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <HiChartBar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalRecipients && stats.totalRecipients > 0 
                  ? ((stats.totalSent / stats.totalRecipients) * 100).toFixed(1) 
                  : '0.0'}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <HiEye className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Open Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalSent && stats.totalSent > 0 
                  ? ((stats.totalOpened / stats.totalSent) * 100).toFixed(1) 
                  : '0.0'}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="sent">Sent</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="mailchimp">MailChimp</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search campaigns..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-end">
            <button
              onClick={() => {
                setStatusFilter('all');
                setTypeFilter('all');
                setSearchTerm('');
              }}
              className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
        >
          <HiMail className="w-6 h-6 text-blue-600 mr-3" />
          <div className="text-left">
            <p className="font-medium text-gray-900">Create Email Campaign</p>
            <p className="text-sm text-gray-600">Send to your customer list</p>
          </div>
        </button>

        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
        >
          <HiPhone className="w-6 h-6 text-green-600 mr-3" />
          <div className="text-left">
            <p className="font-medium text-gray-900">Send SMS</p>
            <p className="text-sm text-gray-600">Quick text message</p>
          </div>
        </button>

        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors"
        >
          <HiTemplate className="w-6 h-6 text-purple-600 mr-3" />
          <div className="text-left">
            <p className="font-medium text-gray-900">Create Template</p>
            <p className="text-sm text-gray-600">Design reusable templates</p>
          </div>
        </button>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Recent Campaigns</h2>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <HiPlus className="h-5 w-5 mr-2" />
              Create Campaign
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipients</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No campaigns found. Create your first campaign to get started.
                  </td>
                </tr>
              ) : (
                campaigns.map((campaign) => (
                  <tr key={campaign._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                        <div className="text-sm text-gray-500">{campaign.type}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTypeIcon(campaign.type)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">{campaign.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(campaign.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                          {campaign.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {campaign.recipientCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {campaign.sentCount} sent
                        {campaign.openedCount > 0 && ` • ${campaign.openedCount} opened`}
                        {campaign.clickedCount > 0 && ` • ${campaign.clickedCount} clicked`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleStatusUpdate(campaign._id, 'sent')}
                          disabled={campaign.status === 'sent'}
                          className="text-blue-600 hover:text-blue-900 disabled:text-gray-400"
                        >
                          <HiPaperAirplane className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            // TODO: Implement view campaign details
                            toast.success('View campaign details - Coming soon!');
                          }}
                          className="text-gray-600 hover:text-gray-900"
                          title="View Details"
                        >
                          <HiEye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            // TODO: Implement edit campaign
                            toast.success('Edit campaign - Coming soon!');
                          }}
                          className="text-gray-600 hover:text-gray-900"
                          title="Edit Campaign"
                        >
                          <HiPencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(campaign)}
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
      </div>

      {/* Create Campaign Modal */}
      <CreateCampaignModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateCampaign}
        isLoading={isSubmitting}
      />

      {/* Delete Campaign Modal */}
      <DeleteCampaignModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCampaign(null);
        }}
        onConfirm={handleDeleteCampaign}
        campaignName={selectedCampaign?.name}
        isLoading={isSubmitting}
      />
    </div>
  );
}
