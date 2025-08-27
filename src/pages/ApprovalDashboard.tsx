import React, { useState } from 'react';
import { HiPlus } from 'react-icons/hi';
import PendingApprovalsList from '../components/Appointments/PendingApprovalsList';
import ApprovalWorkflow from '../components/Appointments/ApprovalWorkflow';
import ApprovalAnalytics from '../components/Appointments/ApprovalAnalytics';
import SmartAlerts from '../components/Appointments/SmartAlerts';

const ApprovalDashboard: React.FC = () => {
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Mock data - replace with actual API calls
  const pendingApprovals = 12;
  const approvedToday = 8;
  const rejectedToday = 2;

  const handleApprovalAction = (appointmentId: string) => {
    setSelectedAppointmentId(appointmentId);
  };

  const handleApprovalComplete = () => {
    setSelectedAppointmentId(null);
    // Refresh the pending approvals list
    setRefreshKey(prev => prev + 1);
  };

  const handleBackToList = () => {
    setSelectedAppointmentId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Approval Dashboard</h1>
            <p className="text-gray-600">Review and manage appointments that require approval</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {/* Add new approval functionality */}}
              className="p-3 bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-colors"
              title="New Approval"
            >
              <HiPlus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Pending Approvals: {pendingApprovals}
            </span>
            <span className="text-sm text-gray-500">
              Approved Today: {approvedToday}
            </span>
            <span className="text-sm text-gray-500">
              Rejected Today: {rejectedToday}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      {selectedAppointmentId ? (
        <div>
          <div className="mb-4">
            <button
              onClick={handleBackToList}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Back to Pending Approvals
            </button>
          </div>
          <ApprovalWorkflow
            appointmentId={selectedAppointmentId}
            onApprovalComplete={handleApprovalComplete}
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Smart Alerts */}
          <SmartAlerts />
          
          {/* Analytics Dashboard */}
          <ApprovalAnalytics />
          
          {/* Pending Approvals List */}
          <PendingApprovalsList
            key={refreshKey}
            onApprovalAction={handleApprovalAction}
          />
        </div>
      )}
    </div>
  );
};

export default ApprovalDashboard;
