import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  AccessTime, 
  CheckCircle, 
  Cancel, 
  Warning,
  AttachMoney,
  People
} from '@mui/icons-material';

interface ApprovalMetrics {
  totalAppointments: number;
  pendingApprovals: number;
  approvedCount: number;
  declinedCount: number;
  approvalRate: number;
  totalValue: number;
  urgentApprovals: number;
}

const ApprovalAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<ApprovalMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch real analytics data from backend
      const response = await fetch('/api/appointments/stats/overview', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Calculate approval metrics from real data
        const stats = data.data;
        const totalAppointments = stats.totalAppointments || 0;
        const pendingAppointments = stats.scheduledAppointments || 0;
        const completedAppointments = stats.completedAppointments || 0;
        const cancelledAppointments = stats.cancelledAppointments || 0;
        
        // Calculate approval rate (completed vs total)
        const approvalRate = totalAppointments > 0 ? 
          ((completedAppointments / totalAppointments) * 100) : 0;
        
        const realMetrics: ApprovalMetrics = {
          totalAppointments,
          pendingApprovals: pendingAppointments,
          approvedCount: completedAppointments,
          declinedCount: cancelledAppointments,
          approvalRate: Math.round(approvalRate * 10) / 10, // Round to 1 decimal
          totalValue: stats.totalRevenue || 0,
          urgentApprovals: 0 // This would need a separate endpoint for urgent approvals
        };
        
        setMetrics(realMetrics);
      } else {
        throw new Error(data.message || 'Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Fallback to empty metrics on error
      setMetrics({
        totalAppointments: 0,
        pendingApprovals: 0,
        approvedCount: 0,
        declinedCount: 0,
        approvalRate: 0,
        totalValue: 0,
        urgentApprovals: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Approval Analytics</h2>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalAppointments}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <People className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-2xl font-bold text-orange-600">{metrics.pendingApprovals}</p>
              {metrics.urgentApprovals > 0 && (
                <p className="text-sm text-red-600 font-medium">
                  {metrics.urgentApprovals} urgent
                </p>
              )}
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AccessTime className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approval Rate</p>
              <p className="text-2xl font-bold text-green-600">{metrics.approvalRate}%</p>
              <p className="text-sm text-gray-500">
                {metrics.approvedCount} approved, {metrics.declinedCount} declined
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">${metrics.totalValue.toLocaleString()}</p>
              <p className="text-sm text-gray-500">
                Avg: ${Math.round(metrics.totalValue / metrics.totalAppointments).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <AttachMoney className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-green-600">{metrics.approvedCount}</p>
            <p className="text-sm text-gray-600">Approved</p>
          </div>
          
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <Cancel className="w-12 h-12 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-red-600">{metrics.declinedCount}</p>
            <p className="text-sm text-gray-600">Declined</p>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Warning className="w-12 h-12 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-orange-600">{metrics.pendingApprovals}</p>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <CheckCircle className="w-5 h-5 mr-2" />
            Review Pending Approvals
          </button>
          <button className="flex items-center justify-center p-4 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            <Warning className="w-5 h-5 mr-2" />
            View Urgent Items
          </button>
          <button className="flex items-center justify-center p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <TrendingUp className="w-5 h-5 mr-2" />
            Generate Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalAnalytics;
