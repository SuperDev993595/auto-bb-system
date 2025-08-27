import React, { useState } from 'react';
import PendingApprovalsList from '../components/Appointments/PendingApprovalsList';
import ApprovalWorkflow from '../components/Appointments/ApprovalWorkflow';
import ApprovalAnalytics from '../components/Appointments/ApprovalAnalytics';
import SmartAlerts from '../components/Appointments/SmartAlerts';

const ApprovalDashboard: React.FC = () => {
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

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
    <div className="min-h-screen bg-secondary-50 p-6 space-y-8">
      
      {/* Page Header */}
      <div className="min-h-32 flex flex-col lg:flex-row justify-between items-start lg:items-center p-6">
        <div className="mb-4 lg:mb-0">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Approval Dashboard</h1>
          <p className="text-secondary-600">Review and manage appointments that require approval</p>
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
