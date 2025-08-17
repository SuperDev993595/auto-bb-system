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
import api from '../services/api';

interface MarketingCampaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'mailchimp';
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  recipients: number;
  sent: number;
  opened?: number;
  clicked?: number;
  delivered?: number;
  failed?: number;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
}

interface MarketingStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalRecipients: number;
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
}

export default function MarketingDashboard() {
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [stats, setStats] = useState<MarketingStats>({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalRecipients: 0,
    totalSent: 0,
    totalOpened: 0,
    totalClicked: 0,
    deliveryRate: 0,
    openRate: 0,
    clickRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'campaigns' | 'templates' | 'analytics'>('overview');

  useEffect(() => {
    loadMarketingData();
  }, []);

  const loadMarketingData = async () => {
    try {
      setLoading(true);
      
      // Load campaigns from different sources
      const [emailCampaigns, smsAnalytics, mailchimpCampaigns] = await Promise.all([
        api.get('/email/campaigns').catch(() => ({ data: { data: [] } })),
        api.get('/sms/analytics').catch(() => ({ data: { data: { overview: {} } } })),
        api.get('/mailchimp/campaigns').catch(() => ({ data: { data: { campaigns: [] } } }))
      ]);

      // Combine and format campaigns
      const allCampaigns: MarketingCampaign[] = [
        ...(emailCampaigns.data.data || []).map((campaign: any) => ({
          ...campaign,
          type: 'email' as const
        })),
        ...(mailchimpCampaigns.data.data.campaigns || []).map((campaign: any) => ({
          ...campaign,
          type: 'mailchimp' as const
        }))
      ];

      setCampaigns(allCampaigns);

      // Calculate stats
      const totalCampaigns = allCampaigns.length;
      const activeCampaigns = allCampaigns.filter(c => c.status === 'scheduled').length;
      const totalRecipients = allCampaigns.reduce((sum, c) => sum + c.recipients, 0);
      const totalSent = allCampaigns.reduce((sum, c) => sum + c.sent, 0);
      const totalOpened = allCampaigns.reduce((sum, c) => sum + (c.opened || 0), 0);
      const totalClicked = allCampaigns.reduce((sum, c) => sum + (c.clicked || 0), 0);

      setStats({
        totalCampaigns,
        activeCampaigns,
        totalRecipients,
        totalSent,
        totalOpened,
        totalClicked,
        deliveryRate: totalRecipients > 0 ? (totalSent / totalRecipients) * 100 : 0,
        openRate: totalSent > 0 ? (totalOpened / totalSent) * 100 : 0,
        clickRate: totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0
      });

    } catch (error) {
      console.error('Error loading marketing data:', error);
      toast.error('Failed to load marketing data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendCampaign = async (campaignId: string, type: string) => {
    try {
      let endpoint = '';
      switch (type) {
        case 'email':
          endpoint = `/email/campaigns/${campaignId}/send`;
          break;
        case 'mailchimp':
          endpoint = `/mailchimp/campaigns/${campaignId}/send`;
          break;
        default:
          toast.error('Unsupported campaign type');
          return;
      }

      await api.post(endpoint);
      toast.success('Campaign sent successfully');
      loadMarketingData();
    } catch (error) {
      toast.error('Failed to send campaign');
    }
  };

  const handleDeleteCampaign = async (campaignId: string, type: string) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return;

    try {
      let endpoint = '';
      switch (type) {
        case 'email':
          endpoint = `/email/campaigns/${campaignId}`;
          break;
        case 'mailchimp':
          endpoint = `/mailchimp/campaigns/${campaignId}`;
          break;
        default:
          toast.error('Unsupported campaign type');
          return;
      }

      await api.delete(endpoint);
      toast.success('Campaign deleted successfully');
      loadMarketingData();
    } catch (error) {
      toast.error('Failed to delete campaign');
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
              <p className="text-2xl font-bold text-gray-900">{stats.totalCampaigns}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.totalRecipients.toLocaleString()}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.deliveryRate.toFixed(1)}%</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.openRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
          <HiMail className="w-6 h-6 text-blue-600 mr-3" />
          <div className="text-left">
            <p className="font-medium text-gray-900">Create Email Campaign</p>
            <p className="text-sm text-gray-600">Send to your customer list</p>
          </div>
        </button>

        <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors">
          <HiPhone className="w-6 h-6 text-green-600 mr-3" />
          <div className="text-left">
            <p className="font-medium text-gray-900">Send SMS</p>
            <p className="text-sm text-gray-600">Quick text message</p>
          </div>
        </button>

        <button className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors">
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
                  <tr key={campaign.id}>
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
                      {campaign.recipients.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {campaign.sent} sent
                        {campaign.opened && ` • ${campaign.opened} opened`}
                        {campaign.clicked && ` • ${campaign.clicked} clicked`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleSendCampaign(campaign.id, campaign.type)}
                          disabled={campaign.status === 'sent'}
                          className="text-blue-600 hover:text-blue-900 disabled:text-gray-400"
                        >
                          <HiPaperAirplane className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <HiEye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <HiPencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCampaign(campaign.id, campaign.type)}
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
    </div>
  );
}
