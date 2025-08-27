import React, { useState, useEffect } from 'react';
import { CalendarMonth, AccessTime, Person, AttachMoney } from '@mui/icons-material';
import { appointmentService } from '../../services/appointments';

interface PendingApprovalsListProps {
  onApprovalAction: (appointmentId: string) => void;
}

const PendingApprovalsList: React.FC<PendingApprovalsListProps> = ({ onApprovalAction }) => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPendingApprovals();
  }, [currentPage]);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      const response = await appointmentService.getPendingApprovals(currentPage, 10);
      
      if (response.success) {
        setAppointments(response.data.appointments);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending_approval: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending Approval' },
      pending: { color: 'bg-blue-100 text-blue-800', text: 'Pending' },
      requires_followup: { color: 'bg-orange-100 text-orange-800', text: 'Requires Follow-up' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { color: 'bg-green-100 text-green-800', text: 'Low' },
      medium: { color: 'bg-yellow-100 text-yellow-800', text: 'Medium' },
      high: { color: 'bg-orange-100 text-orange-800', text: 'High' },
      urgent: { color: 'bg-red-100 text-red-800', text: 'Urgent' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">No appointments pending approval</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Pending Approvals ({appointments.length})
        </h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {appointments.map((appointment) => (
          <div key={appointment._id} className="p-6 hover:bg-gray-50">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h4 className="text-lg font-medium text-gray-900">
                    {appointment.customer?.name}
                  </h4>
                  {getStatusBadge(appointment.status)}
                  {getPriorityBadge(appointment.priority)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                  <div className="flex items-center gap-2">
                    <Person className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {appointment.customer?.businessName || 'Individual Customer'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CalendarMonth className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {new Date(appointment.scheduledDate).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <AccessTime className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {appointment.scheduledTime}
                    </span>
                  </div>
                </div>
                
                <div className="mb-3">
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Service:</strong> {appointment.serviceType?.name}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Vehicle:</strong> {appointment.vehicle?.year} {appointment.vehicle?.make} {appointment.vehicle?.model}
                  </p>
                  {appointment.notes && (
                    <p className="text-sm text-gray-600">
                      <strong>Notes:</strong> {appointment.notes}
                    </p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <AttachMoney className="w-4 h-4 text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">
                    Estimated Cost: ${appointment.estimatedCost?.total?.toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div className="ml-4">
                <button
                  onClick={() => onApprovalAction(appointment._id)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Review & Approve
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingApprovalsList;
