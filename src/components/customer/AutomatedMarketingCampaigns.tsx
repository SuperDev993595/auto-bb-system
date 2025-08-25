import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  MessageSquare, 
  Bell, 
  Target, 
  Calendar,
  Users,
  TrendingUp,
  Settings,
  Play,
  Pause,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

interface MarketingCampaign {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'in-app';
  status: 'active' | 'paused' | 'draft' | 'completed';
  targetAudience: string;
  trigger: string;
  sentCount: number;
  openRate: number;
  clickRate: number;
  conversionRate: number;
  createdAt: string;
  scheduledFor?: string;
  lastSent?: string;
}

interface AutomatedMarketingCampaignsProps {
  customerId: string;
}

export default function AutomatedMarketingCampaigns({ 
  customerId 
}: AutomatedMarketingCampaignsProps) {
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<MarketingCampaign | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, [customerId]);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockCampaigns: MarketingCampaign[] = [
        {
          id: '1',
          name: 'Welcome Series',
          type: 'email',
          status: 'active',
          targetAudience: 'New Customers',
          trigger: 'Account Creation',
          sentCount: 234,
          openRate: 68.5,
          clickRate: 23.4,
          conversionRate: 12.8,
          createdAt: '2024-01-15T10:00:00Z',
          lastSent: '2024-01-20T14:30:00Z'
        },
        {
          id: '2',
          name: 'Appointment Reminders',
          type: 'sms',
          status: 'active',
          targetAudience: 'All Customers',
          trigger: '24h Before Appointment',
          sentCount: 156,
          openRate: 95.2,
          clickRate: 45.8,
          conversionRate: 89.3,
          createdAt: '2024-01-10T09:00:00Z',
          lastSent: '2024-01-21T08:15:00Z'
        },
        {
          id: '3',
          name: 'Membership Renewal',
          type: 'email',
          status: 'paused',
          targetAudience: 'Expiring Memberships',
          trigger: '30 Days Before Expiry',
          sentCount: 45,
          openRate: 72.1,
          clickRate: 18.9,
          conversionRate: 34.2,
          createdAt: '2024-01-05T11:30:00Z',
          lastSent: '2024-01-18T16:45:00Z'
        },
        {
          id: '4',
          name: 'Service Promotions',
          type: 'push',
          status: 'draft',
          targetAudience: 'VIP Customers',
          trigger: 'Seasonal Campaign',
          sentCount: 0,
          openRate: 0,
          clickRate: 0,
          conversionRate: 0,
          createdAt: '2024-01-22T13:20:00Z',
          scheduledFor: '2024-02-01T10:00:00Z'
        }
      ];
      
      setCampaigns(mockCampaigns);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCampaignTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return <Mail className="w-5 h-5 text-blue-600" />;
      case 'sms':
        return <MessageSquare className="w-5 h-5 text-green-600" />;
      case 'push':
        return <Bell className="w-5 h-5 text-purple-600" />;
      case 'in-app':
        return <Target className="w-5 h-5 text-orange-600" />;
      default:
        return <Mail className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'paused':
        return 'text-yellow-600 bg-yellow-100';
      case 'draft':
        return 'text-gray-600 bg-gray-100';
      case 'completed':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Play className="w-4 h-4" />;
      case 'paused':
        return <Pause className="w-4 h-4" />;
      case 'draft':
        return <Edit className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCampaignAction = async (campaignId: string, action: 'activate' | 'pause' | 'delete') => {
    try {
      // Mock API call - replace with actual implementation
      setCampaigns(prev => 
        prev.map(campaign => {
          if (campaign.id === campaignId) {
            switch (action) {
              case 'activate':
                return { ...campaign, status: 'active' as const };
              case 'pause':
                return { ...campaign, status: 'paused' as const };
              default:
                return campaign;
            }
          }
          return campaign;
        })
      );
    } catch (error) {
      console.error('Error updating campaign:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Automated Marketing Campaigns</h2>
          <p className="text-gray-600">Manage automated customer engagement campaigns</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Mail className="w-4 h-4" />
          <span>Create Campaign</span>
        </button>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
              <p className="text-2xl font-bold text-gray-900">
                {campaigns.filter(c => c.status === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Play className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              {campaigns.filter(c => c.status === 'active').length} of {campaigns.length} total
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900">
                {campaigns.reduce((sum, c) => sum + c.sentCount, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Mail className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Across all campaigns
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Open Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(campaigns.reduce((sum, c) => sum + c.openRate, 0) / campaigns.length)}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Eye className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Industry average: 21.5%
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Conversion</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(campaigns.reduce((sum, c) => sum + c.conversionRate, 0) / campaigns.length)}%
              </p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Across all campaigns
            </p>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Campaigns</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Campaign
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Sent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                      <div className="text-sm text-gray-500">{campaign.targetAudience}</div>
                      <div className="text-xs text-gray-400">Trigger: {campaign.trigger}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getCampaignTypeIcon(campaign.type)}
                      <span className="text-sm text-gray-900 capitalize">{campaign.type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                      {getStatusIcon(campaign.status)}
                      <span className="ml-1 capitalize">{campaign.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      <div className="flex items-center space-x-4">
                        <div>
                          <span className="text-xs text-gray-500">Sent</span>
                          <div className="font-medium">{campaign.sentCount.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Open</span>
                          <div className="font-medium">{campaign.openRate}%</div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Click</span>
                          <div className="font-medium">{campaign.clickRate}%</div>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500">Convert</span>
                          <div className="font-medium">{campaign.conversionRate}%</div>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {campaign.lastSent ? formatDate(campaign.lastSent) : 'Not sent yet'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedCampaign(campaign)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setSelectedCampaign(campaign)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {campaign.status === 'active' ? (
                        <button
                          onClick={() => handleCampaignAction(campaign.id, 'pause')}
                          className="text-yellow-600 hover:text-yellow-900"
                        >
                          <Pause className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleCampaignAction(campaign.id, 'activate')}
                          className="text-green-600 hover:text-green-900"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleCampaignAction(campaign.id, 'delete')}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Campaign Templates */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Campaign Templates</h3>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              name: 'Welcome Series',
              description: '3-email sequence for new customers',
              type: 'email',
              estimatedOpenRate: 68,
              estimatedConversion: 15
            },
            {
              name: 'Appointment Reminders',
              description: 'SMS reminders before appointments',
              type: 'sms',
              estimatedOpenRate: 95,
              estimatedConversion: 85
            },
            {
              name: 'Membership Renewal',
              description: 'Email campaign for expiring memberships',
              type: 'email',
              estimatedOpenRate: 72,
              estimatedConversion: 35
            },
            {
              name: 'Service Promotions',
              description: 'Push notifications for special offers',
              type: 'push',
              estimatedOpenRate: 45,
              estimatedConversion: 25
            },
            {
              name: 'Feedback Request',
              description: 'Post-service feedback collection',
              type: 'email',
              estimatedOpenRate: 58,
              estimatedConversion: 42
            },
            {
              name: 'Birthday Wishes',
              description: 'Personalized birthday messages',
              type: 'email',
              estimatedOpenRate: 78,
              estimatedConversion: 18
            }
          ].map((template, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-3 mb-3">
                {getCampaignTypeIcon(template.type)}
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{template.name}</h4>
                  <p className="text-xs text-gray-500">{template.description}</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                <span>Est. Open Rate: {template.estimatedOpenRate}%</span>
                <span>Est. Conversion: {template.estimatedConversion}%</span>
              </div>
              <button className="w-full bg-blue-50 text-blue-600 text-sm py-2 rounded-md hover:bg-blue-100 transition-colors">
                Use Template
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">High Engagement</p>
              <p className="text-sm text-gray-600">
                SMS campaigns show 95% open rate and 89% conversion rate - excellent for urgent communications.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Target className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Targeted Success</p>
              <p className="text-sm text-gray-600">
                Welcome series achieves 68% open rate with 12.8% conversion - strong onboarding performance.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Optimization Opportunity</p>
              <p className="text-sm text-gray-600">
                Membership renewal campaign paused - consider A/B testing to improve conversion rates.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Settings className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Automation Benefits</p>
              <p className="text-sm text-gray-600">
                Automated campaigns save 15+ hours weekly and maintain consistent customer communication.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
