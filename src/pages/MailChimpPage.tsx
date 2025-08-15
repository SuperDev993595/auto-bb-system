import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { HiPlus, HiMail, HiUsers, HiChartBar, HiEye, HiPencil, HiTrash, HiPaperAirplane } from 'react-icons/hi';
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
  };
  createdAt: string;
  createdBy: {
    name: string;
  };
}

export default function MailChimpPage() {
  const [campaigns, setCampaigns] = useState<MailChimpCampaign[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleDeleteCampaign = async (campaignId: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      const response = await api.delete(`/mailchimp/campaigns/${campaignId}`);
      if (response.data.success) {
        toast.success('Campaign deleted successfully');
        fetchCampaigns();
      }
    } catch (error) {
      toast.error('Failed to delete campaign');
    }
  };

  return (
    <div className="space-y-6">
      <PageTitle title="MailChimp Integration" icon={HiMail} />
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Marketing Campaigns</h2>
            <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                        campaign.status === 'sending' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {campaign.recipients.recipientCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div>Opens: {campaign.analytics.opens.toLocaleString()}</div>
                        <div>Rate: {campaign.analytics.openRate ? `${campaign.analytics.openRate.toFixed(1)}%` : 'N/A'}</div>
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
                        <button className="text-gray-600 hover:text-gray-900">
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
                          onClick={() => handleDeleteCampaign(campaign._id)}
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
    </div>
  );
}
