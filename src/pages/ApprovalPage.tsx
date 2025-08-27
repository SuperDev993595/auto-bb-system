import React from 'react';
import ApprovalDashboard from '../components/Appointments/ApprovalDashboard';

const ApprovalPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ApprovalDashboard />
      </div>
    </div>
  );
};

export default ApprovalPage;
