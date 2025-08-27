import React, { useState } from 'react';
import PendingApprovalsList from '../components/Appointments/PendingApprovalsList';
import ApprovalWorkflow from '../components/Appointments/ApprovalWorkflow';
import BreadcrumbNav from '../components/Shared/BreadcrumbNav';

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <BreadcrumbNav />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Approval Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Review and manage appointments that require approval
          </p>
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
          <PendingApprovalsList
            key={refreshKey}
            onApprovalAction={handleApprovalAction}
          />
        )}
      </div>
    </div>
  );
};

export default ApprovalDashboard;
