import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Star,
  Shield,
  CheckCircle,
  AlertTriangle,
  Clock
} from '../../utils/icons';
import { MembershipStats } from '../../services/memberships';

interface MembershipAnalyticsProps {
  customerId: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
}

interface AnalyticsData {
  totalMemberships: number;
  activeMemberships: number;
  expiringSoon: number;
  totalRevenue: number;
  monthlyGrowth: number;
  topPlans: Array<{
    name: string;
    count: number;
    revenue: number;
    percentage: number;
  }>;
  statusBreakdown: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    memberships: number;
    revenue: number;
  }>;
  benefitsUsage: Array<{
    benefit: string;
    used: number;
    available: number;
    percentage: number;
  }>;
}

export default function MembershipAnalytics({ 
  customerId, 
  timeRange = '30d' 
}: MembershipAnalyticsProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);

  useEffect(() => {
    loadAnalyticsData();
  }, [customerId, selectedTimeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockData: AnalyticsData = {
        totalMemberships: 156,
        activeMemberships: 142,
        expiringSoon: 8,
        totalRevenue: 15680.50,
        monthlyGrowth: 12.5,
        topPlans: [
          { name: 'Premium Plan', count: 67, revenue: 6700, percentage: 43 },
          { name: 'VIP Plan', count: 45, revenue: 6750, percentage: 29 },
          { name: 'Basic Plan', count: 32, revenue: 1920, percentage: 21 },
          { name: 'Enterprise Plan', count: 12, revenue: 3600, percentage: 7 }
        ],
        statusBreakdown: [
          { status: 'Active', count: 142, percentage: 91 },
          { status: 'Expired', count: 8, percentage: 5 },
          { status: 'Cancelled', count: 4, percentage: 3 },
          { status: 'Suspended', count: 2, percentage: 1 }
        ],
        monthlyTrends: [
          { month: 'Jan', memberships: 145, revenue: 14500 },
          { month: 'Feb', memberships: 148, revenue: 14800 },
          { month: 'Mar', memberships: 152, revenue: 15200 },
          { month: 'Apr', memberships: 156, revenue: 15680 }
        ],
        benefitsUsage: [
          { benefit: 'Free Inspections', used: 89, available: 200, percentage: 44.5 },
          { benefit: 'Priority Booking', used: 156, available: 300, percentage: 52 },
          { benefit: 'Roadside Assistance', used: 12, available: 50, percentage: 24 },
          { benefit: 'Concierge Service', used: 23, available: 100, percentage: 23 }
        ]
      };
      
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'expired':
        return 'text-red-600 bg-red-100';
      case 'cancelled':
        return 'text-gray-600 bg-gray-100';
      case 'suspended':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-600">No analytics data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Membership Analytics</h2>
          <p className="text-gray-600">Comprehensive insights into your membership performance</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Memberships</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.totalMemberships)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Crown className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            {getGrowthIcon(analyticsData.monthlyGrowth)}
            <span className={`text-sm font-medium ${getGrowthColor(analyticsData.monthlyGrowth)}`}>
              {analyticsData.monthlyGrowth > 0 ? '+' : ''}{analyticsData.monthlyGrowth}%
            </span>
            <span className="text-sm text-gray-500">vs last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Memberships</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.activeMemberships)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Active Rate</span>
              <span className="font-medium text-gray-900">
                {Math.round((analyticsData.activeMemberships / analyticsData.totalMemberships) * 100)}%
              </span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${(analyticsData.activeMemberships / analyticsData.totalMemberships) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analyticsData.totalRevenue)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Avg: {formatCurrency(analyticsData.totalRevenue / analyticsData.totalMemberships)} per membership
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(analyticsData.expiringSoon)}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Next 30 days</p>
          </div>
        </div>
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Plans */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Top Membership Plans</h3>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {analyticsData.topPlans.map((plan, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{plan.name}</p>
                    <p className="text-xs text-gray-500">{formatNumber(plan.count)} members</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(plan.revenue)}</p>
                  <p className="text-xs text-gray-500">{plan.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Status Breakdown</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {analyticsData.statusBreakdown.map((status, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(status.status)}`}></div>
                  <span className="text-sm font-medium text-gray-900 capitalize">{status.status}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">{formatNumber(status.count)}</span>
                  <span className="text-sm text-gray-500">({status.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Trends</h3>
          <Activity className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Membership Growth</h4>
            <div className="space-y-3">
              {analyticsData.monthlyTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{trend.month}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-900">{formatNumber(trend.memberships)}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(trend.memberships / Math.max(...analyticsData.monthlyTrends.map(t => t.memberships))) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Revenue Trends</h4>
            <div className="space-y-3">
              {analyticsData.monthlyTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{trend.month}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(trend.revenue)}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ 
                          width: `${(trend.revenue / Math.max(...analyticsData.monthlyTrends.map(t => t.revenue))) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Usage */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Benefits Usage</h3>
          <Star className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {analyticsData.benefitsUsage.map((benefit, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{benefit.benefit}</span>
                <span className="text-sm text-gray-500">
                  {benefit.used}/{benefit.available}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${benefit.percentage}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{formatNumber(benefit.used)} used</span>
                <span>{benefit.percentage}% utilization</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Strong Growth</p>
              <p className="text-sm text-gray-600">
                Membership growth is up {analyticsData.monthlyGrowth}% this month, indicating strong customer retention.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <DollarSign className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Revenue Optimization</p>
              <p className="text-sm text-gray-600">
                Premium and VIP plans generate {Math.round((analyticsData.topPlans[0].revenue + analyticsData.topPlans[1].revenue) / analyticsData.totalRevenue * 100)}% of total revenue.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Renewal Opportunity</p>
              <p className="text-sm text-gray-600">
                {analyticsData.expiringSoon} memberships expiring soon - consider proactive renewal campaigns.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Benefits Utilization</p>
              <p className="text-sm text-gray-600">
                Priority booking is the most used benefit at {analyticsData.benefitsUsage[1].percentage}% utilization.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
