import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, Eye } from '../../utils/icons';
import { toast } from 'react-hot-toast';

interface ApprovalDashboardProps {
  appointments: any[];
  loading: boolean;
  onApprove: (appointmentId: string, notes: string) => Promise<void>;
  onDecline: (appointmentId: string, reason: string, assignedTo: string) => Promise<void>;
  onViewDetails: (appointmentId: string) => void;
}

export default function ApprovalDashboard({
  appointments,
  loading,
  onApprove,
  onDecline,
  onViewDetails
}: ApprovalDashboardProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApprove = async () => {
    if (!selectedAppointment) return;
    
    try {
      setIsSubmitting(true);
      await onApprove(selectedAppointment._id, approvalNotes);
      setShowApprovalModal(false);
      setSelectedAppointment(null);
      setApprovalNotes('');
      toast.success('Appointment approved successfully!');
    } catch (error) {
      toast.error('Failed to approve appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDecline = async () => {
    if (!selectedAppointment || !declineReason || !assignedTo) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await onDecline(selectedAppointment._id, declineReason, assignedTo);
      setShowDeclineModal(false);
      setSelectedAppointment(null);
      setDeclineReason('');
      setAssignedTo('');
      toast.success('Appointment declined and follow-up task created!');
    } catch (error) {
      toast.error('Failed to decline appointment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Approval Dashboard</h2>
          <p className="text-gray-600">
            {appointments.length} appointment{appointments.length !== 1 ? 's' : ''} requiring approval
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {appointments.map((appointment) => (
          <div
            key={appointment._id}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {appointment.customer?.name || 'Unknown Customer'}
                  </h3>
                  <span className="px-3 py-1 text-xs font-semibold rounded-full border bg-orange-100 text-orange-800 border-orange-200">
                    {appointment.approvalStatus || appointment.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div>Date: {new Date(appointment.scheduledDate).toLocaleDateString()}</div>
                  <div>Vehicle: {appointment.vehicle?.make} {appointment.vehicle?.model}</div>
                  <div>Cost: ${appointment.estimatedCost?.total || 0}</div>
                </div>

                {appointment.serviceDescription && (
                  <p className="text-gray-600 mt-3">
                    <strong>Service:</strong> {appointment.serviceDescription}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => onViewDetails(appointment._id)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  title="View details"
                >
                  <Eye className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => {
                    setSelectedAppointment(appointment);
                    setShowApprovalModal(true);
                  }}
                  className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                  title="Approve"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => {
                    setSelectedAppointment(appointment);
                    setShowDeclineModal(true);
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  title="Decline"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {appointments.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No appointments require approval</h3>
          <p className="text-gray-500">All appointments are up to date!</p>
        </div>
      )}

      {/* Approval Modal */}
      {showApprovalModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Approve Appointment</h3>
            <p className="text-gray-600 mb-4">
              Approve appointment for {selectedAppointment.customer?.name}?
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approval Notes (Optional)
              </label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Add any notes about the approval..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleApprove}
                disabled={isSubmitting}
                className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Approving...' : 'Approve'}
              </button>
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setSelectedAppointment(null);
                  setApprovalNotes('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Modal */}
      {showDeclineModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Decline Appointment</h3>
            <p className="text-gray-600 mb-4">
              Decline appointment for {selectedAppointment.customer?.name}?
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Decline *
              </label>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Explain why this appointment is being declined..."
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Follow-up To *
              </label>
              <input
                type="text"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter user ID for follow-up task"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleDecline}
                disabled={isSubmitting || !declineReason || !assignedTo}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Declining...' : 'Decline & Create Follow-up'}
              </button>
              <button
                onClick={() => {
                  setShowDeclineModal(false);
                  setSelectedAppointment(null);
                  setDeclineReason('');
                  setAssignedTo('');
                }}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
