import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Car, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Activity
} from 'lucide-react';

interface WarrantyAnalyticsProps {
  customerId: string;
  timeRange?: '7d' | '30d' | '90d' | '1y';
}

export default function WarrantyAnalytics({ 
  customerId, 
  timeRange = '30d' 
}: WarrantyAnalyticsProps) {
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
      console.error('Error loading warranty analytics data:', error);
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
          <h2 className="text-2xl font-bold text-gray-900">Warranty Analytics</h2>
          <p className="text-gray-600">Warranty performance insights and metrics</p>
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
              <p className="text-sm font-medium text-gray-600">Total Warranties</p>
              <p className="text-2xl font-bold text-gray-900">89</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Active Rate</span>
              <span className="font-medium text-gray-900">85%</span>
            </div>
            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Claims</p>
              <p className="text-2xl font-bold text-gray-900">23</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">87.5% success rate</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Claim Amount</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(12450.75)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              Avg: {formatCurrency(541.34)} per claim
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
              <p className="text-2xl font-bold text-gray-900">5</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">3 by mileage</p>
          </div>
        </div>
      </div>

      {/* Top Warranty Types */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Top Warranty Types</h3>
          <BarChart3 className="w-5 h-5 text-gray-400" />
        </div>
        <div className="space-y-4">
          {[
            { type: 'Extended Warranty', count: 34, claims: 12, amount: 6800, percentage: 38 },
            { type: 'Powertrain Warranty', count: 28, claims: 8, amount: 4200, percentage: 31 },
            { type: 'Bumper to Bumper', count: 18, claims: 2, amount: 1200, percentage: 20 },
            { type: 'Manufacturer Warranty', count: 9, claims: 1, amount: 250.75, percentage: 11 }
          ].map((type, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{type.type}</p>
                  <p className="text-xs text-gray-500">{formatNumber(type.count)} warranties</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{formatCurrency(type.amount)}</p>
                <p className="text-xs text-gray-500">{type.claims} claims</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Claims Trends */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Claims Trends</h3>
          <Activity className="w-5 h-5 text-gray-400" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Claims Volume</h4>
            <div className="space-y-3">
              {[
                { month: 'Jan', claims: 3, amount: 1800 },
                { month: 'Feb', claims: 5, amount: 2800 },
                { month: 'Mar', claims: 4, amount: 2200 },
                { month: 'Apr', claims: 6, amount: 3200 },
                { month: 'May', claims: 5, amount: 2450.75 }
              ].map((claim, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{claim.month}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-900">{formatNumber(claim.claims)}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(claim.claims / 6) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-4">Claim Amounts</h4>
            <div className="space-y-3">
              {[
                { month: 'Jan', claims: 3, amount: 1800 },
                { month: 'Feb', claims: 5, amount: 2800 },
                { month: 'Mar', claims: 4, amount: 2200 },
                { month: 'Apr', claims: 6, amount: 3200 },
                { month: 'May', claims: 5, amount: 2450.75 }
              ].map((claim, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{claim.month}</span>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(claim.amount)}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(claim.amount / 3200) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">High Success Rate</p>
              <p className="text-sm text-gray-600">
                87.5% claim success rate indicates excellent warranty coverage and service quality.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <DollarSign className="w-5 h-5 text-purple-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Cost Management</p>
              <p className="text-sm text-gray-600">
                Average claim amount of {formatCurrency(541.34)} shows effective cost control.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Renewal Opportunities</p>
              <p className="text-sm text-gray-600">
                5 warranties expiring soon - focus on retention strategies.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gray-900">Coverage Optimization</p>
              <p className="text-sm text-gray-600">
                Extended and powertrain warranties represent 69% of total warranties.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
