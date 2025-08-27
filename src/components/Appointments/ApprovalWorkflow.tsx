import React, { useState, useEffect } from 'react';
import useRoleAccess from '../../hooks/useRoleAccess';
import notificationService from '../../services/notificationService';

interface ApprovalWorkflowProps {
  appointmentId: string;
  onApprovalComplete: () => void;
}

const ApprovalWorkflow: React.FC<ApprovalWorkflowProps> = ({ 
  appointmentId, 
  onApprovalComplete 
}) => {
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [subAdmins, setSubAdmins] = useState<any[]>([]);
  const { canApproveAppointments, canDeclineAppointments } = useRoleAccess();

  useEffect(() => {
    fetchAppointment();
    fetchSubAdmins();
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`);
      const data = await response.json();
      if (data.success) {
        setAppointment(data.appointment);
      }
    } catch (error) {
      console.error('Error fetching appointment:', error);
    }
  };

  const fetchSubAdmins = async () => {
    try {
      const response = await fetch('/api/users?role=sub_admin');
      const data = await response.json();
      if (data.success) {
        setSubAdmins(data.users);
      }
    } catch (error) {
      console.error('Error fetching sub admins:', error);
    }
  };

  const handleApprove = async () => {
    if (!approvalNotes.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: approvalNotes, createWorkOrder: true }),
      });

      const data = await response.json();
      if (data.success) {
        // Send success notification
        notificationService.addNotification({
          type: 'success',
          title: 'Appointment Approved',
          message: `Appointment for ${appointment.customer?.name} has been approved and work order created`,
          priority: 'medium',
          category: 'approval'
        });
        
        setShowApprovalModal(false);
        setApprovalNotes('');
        onApprovalComplete();
      }
    } catch (error) {
      console.error('Error approving appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!declineReason.trim() || !assignedTo) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: declineReason,
          assignedTo: assignedTo,
          createFollowUpTask: true
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Send follow-up task notification
        notificationService.sendFollowUpTaskNotification(
          appointment.customer?.name || 'Customer',
          subAdmins.find(admin => admin._id === assignedTo)?.name || 'Sub Admin'
        );
        
        setShowDeclineModal(false);
        setDeclineReason('');
        setAssignedTo('');
        onApprovalComplete();
      }
    } catch (error) {
      console.error('Error declining appointment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!appointment) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">Approval Workflow</h3>
      
      <div className="mb-4">
        <p><strong>Customer:</strong> {appointment.customer?.name}</p>
        <p><strong>Service:</strong> {appointment.serviceType?.name}</p>
        <p><strong>Cost:</strong> ${appointment.estimatedCost?.total}</p>
      </div>

      {appointment.approvalStatus === 'pending' && (
        <div className="flex gap-4">
          {canApproveAppointments && (
            <button
              onClick={() => setShowApprovalModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              Approve
            </button>
          )}
          {canDeclineAppointments && (
            <button
              onClick={() => setShowDeclineModal(true)}
              className="bg-red-600 text-white px-4 py-2 rounded"
            >
              Decline
            </button>
          )}
        </div>
      )}

      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <h4>Approve Appointment</h4>
            <textarea
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              placeholder="Approval notes..."
              className="w-full p-2 border rounded mb-4"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowApprovalModal(false)}>Cancel</button>
              <button onClick={handleApprove} disabled={loading}>
                {loading ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeclineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <h4>Decline Appointment</h4>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Reason for decline..."
              className="w-full p-2 border rounded mb-4"
            />
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            >
              <option value="">Select Sub Admin</option>
              {subAdmins.map((admin) => (
                <option key={admin._id} value={admin._id}>
                  {admin.name}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <button onClick={() => setShowDeclineModal(false)}>Cancel</button>
              <button onClick={handleDecline} disabled={loading}>
                {loading ? 'Declining...' : 'Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalWorkflow;
