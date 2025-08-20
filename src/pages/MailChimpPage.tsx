import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { HiPlus, HiMail, HiUsers, HiChartBar, HiEye, HiPencil, HiTrash, HiPaperAirplane, HiX } from 'react-icons/hi';
import PageTitle from '../components/Shared/PageTitle';
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
          ...prev[parent as keyof CampaignFormData],
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
        return 'bg-green-100 text-green-800';
      case 'sending':
        return 'bg-blue-100 text-blue-800';
      case 'save':
        return 'bg-gray-100 text-gray-800';
      case 'schedule':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <PageTitle title="MailChimp Integration" icon={HiMail} />
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Marketing Campaigns</h2>
            <button 
              onClick={openCreateModal}
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipients</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">Loading campaigns...</td>
                </tr>
              ) : campaigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No campaigns found</td>
                </tr>
              ) : (
                campaigns.map((campaign) => (
                  <tr key={campaign._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                        <div className="text-sm text-gray-500">{campaign.subject}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {campaign.recipients.recipientCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div>Opens: {campaign.analytics?.opens?.toLocaleString() || '0'}</div>
                        <div>Rate: {campaign.analytics?.openRate ? `${campaign.analytics.openRate.toFixed(1)}%` : 'N/A'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <HiEye className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => openEditModal(campaign)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <HiPencil className="h-5 w-5" />
                        </button>
                        {campaign.status === 'save' && (
                          <button
                            onClick={() => handleSendCampaign(campaign._id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            <HiPaperAirplane className="h-5 w-5" />
                          </button>
                        )}
                        <button
                          onClick={() => openDeleteModal(campaign)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <HiTrash className="h-5 w-5" />
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Create New Campaign</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiX className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line *</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Name *</label>
                  <input
                    type="text"
                    value={formData.settings.fromName}
                    onChange={(e) => handleInputChange('settings.fromName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Email *</label>
                  <input
                    type="email"
                    value={formData.settings.fromEmail}
                    onChange={(e) => handleInputChange('settings.fromEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reply To</label>
                  <input
                    type="email"
                    value={formData.settings.replyTo}
                    onChange={(e) => handleInputChange('settings.replyTo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HTML Content</label>
                <textarea
                  value={formData.content.html}
                  onChange={(e) => handleInputChange('content.html', e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="<h1>Hello World</h1>"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plain Text Content</label>
                <textarea
                  value={formData.content.plainText}
                  onChange={(e) => handleInputChange('content.plainText', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Hello World"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">List ID *</label>
                  <input
                    type="text"
                    value={formData.recipients.listId}
                    onChange={(e) => handleInputChange('recipients.listId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., list123456"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">List Name</label>
                  <input
                    type="text"
                    value={formData.recipients.listName}
                    onChange={(e) => handleInputChange('recipients.listName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Newsletter Subscribers"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Campaign Modal */}
      {showEditModal && selectedCampaign && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Edit Campaign</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiX className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleEditCampaign} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Campaign Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line *</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Name *</label>
                  <input
                    type="text"
                    value={formData.settings.fromName}
                    onChange={(e) => handleInputChange('settings.fromName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Email *</label>
                  <input
                    type="email"
                    value={formData.settings.fromEmail}
                    onChange={(e) => handleInputChange('settings.fromEmail', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reply To</label>
                  <input
                    type="email"
                    value={formData.settings.replyTo}
                    onChange={(e) => handleInputChange('settings.replyTo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">HTML Content</label>
                <textarea
                  value={formData.content.html}
                  onChange={(e) => handleInputChange('content.html', e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plain Text Content</label>
                <textarea
                  value={formData.content.plainText}
                  onChange={(e) => handleInputChange('content.plainText', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Hello World"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">List ID *</label>
                  <input
                    type="text"
                    value={formData.recipients.listId}
                    onChange={(e) => handleInputChange('recipients.listId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., list123456"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">List Name</label>
                  <input
                    type="text"
                    value={formData.recipients.listName}
                    onChange={(e) => handleInputChange('recipients.listName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Newsletter Subscribers"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Update Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Campaign Modal */}
      {showDeleteModal && selectedCampaign && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Delete Campaign</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiX className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600">
                Are you sure you want to delete the campaign <strong>"{selectedCampaign.name}"</strong>?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCampaign}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Deleting...' : 'Delete Campaign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
