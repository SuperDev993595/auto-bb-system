import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { HiPlus, HiMail, HiUsers, HiChartBar, HiEye, HiPencil, HiTrash, HiPaperAirplane, HiX } from 'react-icons/hi';
import PageTitle from '../components/Shared/PageTitle';
import MailChimpCampaignModal from '../components/Marketing/MailChimpCampaignModal';
import ModalWrapper from '../utils/ModalWrapper';
import api from '../services/api';

interface MailChimpCampaign {
  _id: string;
  name: string;
  subject: string;
  status: string;
  type: string;
  analytics: {
    opens: number;
    openRate: number;
    clicks: number;
    clickRate: number;
  };
  recipients: {
    recipientCount: number;
    listId: string;
    listName: string;
  };
  settings: {
    fromName: string;
    fromEmail: string;
    replyTo: string;
  };
  content: {
    html: string;
    plainText: string;
  };
  createdAt: string;
  createdBy: {
    name: string;
  };
}

interface CampaignFormData {
  name: string;
  subject: string;
  type: string;
  content: {
    html: string;
    plainText: string;
  };
  settings: {
    fromName: string;
    fromEmail: string;
    replyTo: string;
  };
  recipients: {
    listId: string;
    listName: string;
    recipientCount: number;
  };
}

export default function MailChimpPage() {
  const [campaigns, setCampaigns] = useState<MailChimpCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<MailChimpCampaign | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    subject: '',
    type: 'regular',
    content: {
      html: '',
      plainText: ''
    },
    settings: {
      fromName: '',
      fromEmail: '',
      replyTo: ''
    },
    recipients: {
      listId: '',
      listName: '',
      recipientCount: 0
    }
  });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await api.get('/mailchimp/campaigns');
      if (response.data.success) {
        setCampaigns(response.data.data.campaigns);
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast.error('Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.post('/mailchimp/campaigns', formData);
      if (response.data.success) {
        toast.success('Campaign created successfully');
        setShowCreateModal(false);
        resetForm();
        fetchCampaigns();
      }
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      toast.error(error.response?.data?.message || 'Failed to create campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCampaign) return;

    setIsSubmitting(true);

    try {
      const response = await api.put(`/mailchimp/campaigns/${selectedCampaign._id}`, formData);
      if (response.data.success) {
        toast.success('Campaign updated successfully');
        setShowEditModal(false);
        resetForm();
        fetchCampaigns();
      }
    } catch (error: any) {
      console.error('Error updating campaign:', error);
      toast.error(error.response?.data?.message || 'Failed to update campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCampaign = async () => {
    if (!selectedCampaign) return;

    setIsSubmitting(true);

    try {
      const response = await api.delete(`/mailchimp/campaigns/${selectedCampaign._id}`);
      if (response.data.success) {
        toast.success('Campaign deleted successfully');
        setShowDeleteModal(false);
        setSelectedCampaign(null);
        fetchCampaigns();
      }
    } catch (error: any) {
      console.error('Error deleting campaign:', error);
      toast.error(error.response?.data?.message || 'Failed to delete campaign');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendCampaign = async (campaignId: string) => {
    try {
      const response = await api.post(`/mailchimp/campaigns/${campaignId}/send`);
      if (response.data.success) {
        toast.success('Campaign sent successfully');
        fetchCampaigns();
      }
    } catch (error) {
      toast.error('Failed to send campaign');
    }
  };

  const openCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const openEditModal = (campaign: MailChimpCampaign) => {
    setSelectedCampaign(campaign);
    setFormData({
      name: campaign.name,
      subject: campaign.subject,
      type: campaign.type,
      content: campaign.content,
      settings: campaign.settings,
      recipients: campaign.recipients
    });
    setShowEditModal(true);
  };

  const openDeleteModal = (campaign: MailChimpCampaign) => {
    setSelectedCampaign(campaign);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      subject: '',
      type: 'regular',
      content: {
        html: '',
        plainText: ''
      },
      settings: {
        fromName: '',
        fromEmail: '',
        replyTo: ''
      },
      recipients: {
        listId: '',
        listName: '',
        recipientCount: 0
      }
    });
  };

  const handleInputChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev as any)[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'status-success';
      case 'sending':
        return 'status-info';
      case 'save':
        return 'status-secondary';
      case 'schedule':
        return 'status-warning';
      default:
        return 'status-secondary';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">MailChimp Integration</h1>
            <p className="text-gray-600">Manage email marketing campaigns and automation</p>
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
              Total Subscribers: {totalSubscribers}
            </span>
            <span className="text-sm text-gray-500">
              Active Campaigns: {activeCampaigns}
            </span>
            <span className="text-sm text-gray-500">
              Open Rate: {openRate}%
            </span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="campaigns">Campaigns</option>
              <option value="subscribers">Subscribers</option>
              <option value="analytics">Analytics</option>
              <option value="settings">Settings</option>
            </select>
          </div>
        </div>
      </div>
      
      <div className="card">
        <div className="p-6 border-b border-secondary-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-secondary-900">Marketing Campaigns</h2>
            <button 
              onClick={openCreateModal}
              className="btn-primary"
            >
              <HiPlus className="h-5 w-5 mr-2" />
              Create Campaign
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header-cell">Campaign</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Recipients</th>
                <th className="table-header-cell">Performance</th>
                <th className="table-header-cell">Created</th>
                <th className="table-header-cell text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-secondary-500">Loading campaigns...</td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-secondary-500">No campaigns found</td>
                </tr>
              ) : (
                campaigns.map((campaign) => (
                  <tr key={campaign._id} className="hover:bg-secondary-50">
                    <td className="table-cell">
                      <div>
                        <div className="text-sm font-medium text-secondary-900">{campaign.name}</div>
                        <div className="text-sm text-secondary-500">{campaign.subject}</div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <span className={`status-badge ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="table-cell text-sm text-secondary-900">
                      {campaign.recipients.recipientCount.toLocaleString()}
                    </td>
                    <td className="table-cell">
                      <div className="text-sm text-secondary-900">
                        <div>Opens: {campaign.analytics.opens}</div>
                        <div>Clicks: {campaign.analytics.clicks}</div>
                      </div>
                    </td>
                    <td className="table-cell text-sm text-secondary-500">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </td>
                    <td className="table-cell text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => openEditModal(campaign)}
                          className="text-primary-600 hover:text-primary-900 transition-colors"
                          title="Edit Campaign"
                        >
                          <HiPencil className="w-4 h-4" />
                        </button>
                        {campaign.status === 'save' && (
                          <button
                            onClick={() => handleSendCampaign(campaign._id)}
                            className="text-success-600 hover:text-success-900 transition-colors"
                            title="Send Campaign"
                          >
                            <HiPaperAirplane className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => openDeleteModal(campaign)}
                          className="text-error-600 hover:text-error-900 transition-colors"
                          title="Delete Campaign"
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
      {showCreateModal && (
        <MailChimpCampaignModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateCampaign}
          isSubmitting={isSubmitting}
          formData={formData}
          handleInputChange={handleInputChange}
          isEditing={false}
        />
      )}

      {/* Edit Campaign Modal */}
      {showEditModal && selectedCampaign && (
        <MailChimpCampaignModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditCampaign}
          isSubmitting={isSubmitting}
          formData={formData}
          handleInputChange={handleInputChange}
          isEditing={true}
        />
      )}

      {/* Delete Campaign Modal */}
      {showDeleteModal && selectedCampaign && (
        <ModalWrapper
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onSubmit={handleDeleteCampaign}
          title="Delete Campaign"
          icon={<HiTrash className="w-5 h-5" />}
          submitText={isSubmitting ? 'Deleting...' : 'Delete Campaign'}
        >
          <div className="p-6">
            <p className="text-secondary-600 mb-4">
              Are you sure you want to delete the campaign <strong>"{selectedCampaign.name}"</strong>?
            </p>
            <p className="text-sm text-secondary-500">
              This action cannot be undone.
            </p>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
}
