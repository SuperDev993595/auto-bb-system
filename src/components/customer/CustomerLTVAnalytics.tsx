import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Star,
  Target,
  BarChart3,
  Activity,
  Crown,
  Clock,
  Award
} from '../../utils/icons';

interface CustomerLTVAnalyticsProps {
  customerId: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
}

export default function CustomerLTVAnalytics({ 
  customerId, 
  timeRange = '30d' 
}: CustomerLTVAnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);

  useEffect(() => {
    loadAnalyticsData();
  }, [customerId, selectedTimeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Error loading LTV analytics data:', error);
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
          <h2 className="text-2xl font-bold text-gray-900">Customer LTV Analytics</h2>
          <p className="text-gray-600">Customer lifetime value and retention insights</p>
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
              <p className="text-sm font-medium text-gray-600">Average LTV</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(2847.50)}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">+12.5%</span>
            <span className="text-sm text-gray-500">vs last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Customer Retention</p>
              <p className="text-2xl font-bold text-gray-900">87.3%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Retention Rate</span>
              <span className="font-medium text-gray-900">87.3%</span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '87.3%' }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Repeat Purchase Rate</p>
              <p className="text-2xl font-bold text-gray-900">73.8%</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">+8.2%</span>
            <span className="text-sm text-gray-500">vs last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">VIP Customers</p>
              <p className="text-2xl font-bold text-gray-900">156</p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Crown className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">15.6% of total customers</p>
          </div>
        </div>
      </div>

      {/* Customer Segments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Customer Segments by LTV</h3>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          {[
            { segment: 'VIP Customers', count: 156, avgLTV: 5847.50, percentage: 15.6, color: 'bg-yellow-500' },
            { segment: 'Premium Customers', count: 234, avgLTV: 3247.30, percentage: 23.4, color: 'bg-blue-500' },
            { segment: 'Regular Customers', count: 445, avgLTV: 1847.80, percentage: 44.5, color: 'bg-green-500' },
            { segment: 'New Customers', count: 165, avgLTV: 847.20, percentage: 16.5, color: 'bg-gray-500' }
          ].map((segment, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 ${segment.color} rounded-full`}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{segment.segment}</p>
                  <p className="text-xs text-gray-500">{formatNumber(segment.count)} customers</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{formatCurrency(segment.avgLTV)}</p>
                <p className="text-xs text-gray-500">{segment.percentage}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LTV Trends */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">LTV Trends</h3>
          <Activity className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Monthly LTV Growth</h4>
            <div className="space-y-3">
              {[
                { month: 'Jan', ltv: 2650, growth: 5.2 },
                { month: 'Feb', ltv: 2720, growth: 2.6 },
                { month: 'Mar', ltv: 2810, growth: 3.3 },
                { month: 'Apr', ltv: 2890, growth: 2.8 },
                { month: 'May', ltv: 2847, growth: -1.5 }
              ].map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{trend.month}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(trend.ltv)}</span>
                    <div className="flex items-center space-x-1">
                      {trend.growth >= 0 ? (
                        <TrendingUp className="w-3 h-3 text-green-600" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-600" />
                      )}
                      <span className={`text-xs font-medium ${trend.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {trend.growth > 0 ? '+' : ''}{trend.growth}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Retention Trends</h4>
            <div className="space-y-3">
              {[
                { month: 'Jan', retention: 85.2, churn: 14.8 },
                { month: 'Feb', retention: 86.1, churn: 13.9 },
                { month: 'Mar', retention: 87.8, churn: 12.2 },
                { month: 'Apr', retention: 88.3, churn: 11.7 },
                { month: 'May', retention: 87.3, churn: 12.7 }
              ].map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{trend.month}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-900">{trend.retention}%</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${trend.retention}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Customer Journey Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Acquisition Channels */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Acquisition Channels</h3>
            <Target className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {[
              { channel: 'Referrals', customers: 234, avgLTV: 3247, percentage: 23.4 },
              { channel: 'Online Ads', customers: 189, avgLTV: 2847, percentage: 18.9 },
              { channel: 'Direct Traffic', customers: 156, avgLTV: 2647, percentage: 15.6 },
              { channel: 'Social Media', customers: 145, avgLTV: 2447, percentage: 14.5 },
              { channel: 'Other', customers: 276, avgLTV: 2247, percentage: 27.6 }
            ].map((channel, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{channel.channel}</p>
                    <p className="text-xs text-gray-500">{formatNumber(channel.customers)} customers</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{formatCurrency(channel.avgLTV)}</p>
                  <p className="text-xs text-gray-500">{channel.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Lifetime Stages */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Customer Lifetime Stages</h3>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {[
              { stage: 'New Customer', count: 165, avgLTV: 847, duration: '0-3 months' },
              { stage: 'Growing Customer', count: 234, avgLTV: 1847, duration: '3-12 months' },
              { stage: 'Established Customer', count: 445, avgLTV: 3247, duration: '1-3 years' },
              { stage: 'Loyal Customer', count: 156, avgLTV: 5847, duration: '3+ years' }
            ].map((stage, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{stage.stage}</span>
                  <span className="text-sm text-gray-500">{formatCurrency(stage.avgLTV)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${(stage.count / 1000) * 100}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatNumber(stage.count)} customers</span>
                  <span>{stage.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strategic Insights */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategic Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <Star className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">VIP Customer Focus</p>
              <p className="text-sm text-gray-600">
                VIP customers represent 15.6% of total customers but generate 32% of total revenue.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Strong Retention</p>
              <p className="text-sm text-gray-600">
                87.3% retention rate indicates excellent customer satisfaction and loyalty.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Target className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Referral Opportunity</p>
              <p className="text-sm text-gray-600">
                Referral customers have the highest LTV at {formatCurrency(3247)} - focus on referral programs.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Award className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Lifetime Value Growth</p>
              <p className="text-sm text-gray-600">
                Average LTV increased by 12.5% this month, showing strong value creation.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
