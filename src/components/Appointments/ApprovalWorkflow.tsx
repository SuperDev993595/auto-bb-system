import React, { useState, useEffect } from 'react';
import useRoleAccess from '../../hooks/useRoleAccess';
import notificationService from '../../services/notificationService';
import { appointmentService } from '../../services/appointments';
import { workOrderService } from '../../services/workOrders';
import { 
  HiCheckCircle, 
  HiXCircle, 
  HiClock, 
  HiUser, 
  HiTruck, 
  HiCurrencyDollar, 
  HiCalendar, 
  HiExclamationCircle,
  HiDocumentText,
  HiCheck,
  HiX,
  HiCog
} from 'react-icons/hi';

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
  const [showWorkOrderModal, setShowWorkOrderModal] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [workOrderCreating, setWorkOrderCreating] = useState(false);
  const [workOrderCreated, setWorkOrderCreated] = useState(false);
  const [workOrderData, setWorkOrderData] = useState<any>(null);
  const [hasExistingWorkOrder, setHasExistingWorkOrder] = useState(false);
  const { canApproveAppointments, canDeclineAppointments } = useRoleAccess();

  useEffect(() => {
    fetchAppointment();
  }, [appointmentId]);

  const fetchAppointment = async () => {
    try {
      const response = await appointmentService.getAppointment(appointmentId);
      if (response.success) {
        setAppointment(response.data.appointment);
        // Debug: Log service type data to check labor rate
        console.log('Appointment data:', response.data.appointment);
        console.log('Service Type:', (response.data.appointment as any).serviceType);
        console.log('Labor Rate:', (response.data.appointment as any).serviceType?.laborRate);
      }
    } catch (error) {
      console.error('Error fetching appointment:', error);
    }
  };

  const handleApprove = async () => {
    if (!approvalNotes.trim()) return;

    setLoading(true);
    try {
      const response = await appointmentService.approveAppointment(appointmentId, approvalNotes, true);
      if (response.success) {
        // Close modal and reset form immediately after successful approval
        setShowApprovalModal(false);
        setApprovalNotes('');
        onApprovalComplete();
      } else {
        console.error('Appointment approval failed:', response);
      }
    } catch (error) {
      console.error('Error approving appointment:', error);
      // Keep modal open on error so user can try again
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!declineReason.trim() || !assignedTo) return;

    setLoading(true);
    try {
      const response = await appointmentService.declineAppointment(appointmentId, declineReason, assignedTo, true);

      if (response.success) {
        // Close modal and reset form immediately after successful decline
        setShowDeclineModal(false);
        setDeclineReason('');
        setAssignedTo('');
        onApprovalComplete();
      } else {
        console.error('Appointment decline failed:', response);
      }
    } catch (error) {
      console.error('Error declining appointment:', error);
      // Keep modal open on error so user can try again
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkOrder = async () => {
    setWorkOrderCreating(true);
    try {
      const response = await workOrderService.createFromAppointment(appointmentId);
      
      if (response.success) {
        setWorkOrderData(response);
        setWorkOrderCreated(true);
        setShowWorkOrderModal(true);
        // Refresh appointment data to show updated status
        await fetchAppointment();
      } else {
        console.error('Work order creation failed:', response);
      }
    } catch (error: any) {
      console.error('Error creating work order:', error);
      // Show user-friendly error message
      const errorMessage = error.message || 'Failed to create work order';
      
      // Provide more specific error messages
      if (errorMessage.includes('valid service type')) {
        alert('Cannot create work order: Appointment must have a valid service type selected.');
      } else if (errorMessage.includes('already been created')) {
        alert('A work order has already been created from this appointment.');
      } else if (errorMessage.includes('must be approved')) {
        alert('Cannot create work order: Appointment must be approved first.');
      } else {
        alert(errorMessage);
      }
    } finally {
      setWorkOrderCreating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', text: 'Pending Review' },
      approved: { color: 'bg-green-100 text-green-800 border-green-200', text: 'Approved' },
      declined: { color: 'bg-red-100 text-red-800 border-red-200', text: 'Declined' },
      requires_followup: { color: 'bg-orange-100 text-orange-800 border-orange-200', text: 'Follow-up Required' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { color: 'bg-gray-100 text-gray-800 border-gray-200', text: 'Low' },
      medium: { color: 'bg-blue-100 text-blue-800 border-blue-200', text: 'Medium' },
      high: { color: 'bg-orange-100 text-orange-800 border-orange-200', text: 'High' },
      urgent: { color: 'bg-red-100 text-red-800 border-red-200', text: 'Urgent' }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (!appointment) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading appointment details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <HiDocumentText className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Approval Workflow</h3>
              <p className="text-sm text-gray-600">Review and manage appointment approval</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(appointment.approvalStatus || 'pending')}
            {getPriorityBadge(appointment.priority || 'medium')}
          </div>
        </div>
      </div>

      {/* Appointment Details */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Customer Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <HiUser className="h-5 w-5 text-blue-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900">Customer Information</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium text-gray-900">{appointment.customer?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-gray-900">{appointment.customer?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium text-gray-900">{appointment.customer?.phone || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Vehicle Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <HiTruck className="h-5 w-5 text-green-600" />
              </div>
              <h4 className="text-lg font-medium text-gray-900">Vehicle Information</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Vehicle:</span>
                <span className="font-medium text-gray-900">
                  {appointment.vehicle ? 
                    `${appointment.vehicle.year || ''} ${appointment.vehicle.make || ''} ${appointment.vehicle.model || ''}`.trim() || 'N/A' 
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">VIN:</span>
                <span className="font-medium text-gray-900 font-mono text-sm">{appointment.vehicle?.vin || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">License Plate:</span>
                <span className="font-medium text-gray-900">{appointment.vehicle?.licensePlate || 'N/A'}</span>
              </div>
              {appointment.vehicle?.mileage && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Mileage:</span>
                  <span className="font-medium text-gray-900">{appointment.vehicle.mileage.toLocaleString()} mi</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Service & Cost Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <HiDocumentText className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Service Type</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">{appointment.serviceType?.name || 'N/A'}</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <HiCurrencyDollar className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Estimated Cost</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              ${appointment.estimatedCost?.total?.toFixed(2) || '0.00'}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <HiCurrencyDollar className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Labor Rate</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              ${(() => {
                // Try multiple sources for labor rate
                const rate = appointment.serviceType?.laborRate || 
                           appointment.laborRate || 
                           appointment.technician?.hourlyRate ||
                           100; // Default fallback
                return rate;
              })()}/hr
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {appointment.serviceType?.laborRate ? 'From service type' : 
               appointment.laborRate ? 'From appointment' :
               appointment.technician?.hourlyRate ? 'From technician' : 'Default rate'}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <HiClock className="h-4 w-4 text-orange-600" />
              </div>
              <span className="text-sm font-medium text-gray-600">Duration</span>
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {appointment.estimatedDuration || 0} min
            </p>
          </div>
        </div>

        {/* Schedule Information */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <HiCalendar className="h-5 w-5 text-blue-600" />
            </div>
            <h4 className="text-lg font-medium text-gray-900">Schedule Details</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-600">Date:</span>
              <p className="font-medium text-gray-900">
                {appointment.scheduledDate ? new Date(appointment.scheduledDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'N/A'}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Time:</span>
              <p className="font-medium text-gray-900">
                {appointment.scheduledTime || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {appointment.notes && (
                      <div className="bg-yellow-50 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <HiExclamationCircle className="h-5 w-5 text-yellow-600" />
                </div>
                <h4 className="text-lg font-medium text-gray-900">Additional Notes</h4>
              </div>
              <p className="text-gray-700">{appointment.notes}</p>
            </div>
        )}

        {/* Action Buttons */}
        {appointment.approvalStatus === 'pending' && (
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            {canApproveAppointments && (
              <button
                onClick={() => setShowApprovalModal(true)}
                className="flex-1 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                <HiCheck className="h-5 w-5" />
                <span>Approve Appointment</span>
              </button>
            )}
            {canDeclineAppointments && (
              <button
                onClick={() => setShowDeclineModal(true)}
                className="flex-1 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
              >
                <HiX className="h-5 w-5" />
                <span>Decline Appointment</span>
              </button>
            )}
          </div>
        )}

        {/* Create Work Order Button for Approved Appointments */}
        {appointment.approvalStatus === 'approved' && !workOrderCreated && !hasExistingWorkOrder && (
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={handleCreateWorkOrder}
              disabled={workOrderCreating}
              className="flex-1 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <HiCog className="h-5 w-5" />
              <span>{workOrderCreating ? 'Creating Work Order...' : 'Create Work Order'}</span>
            </button>
          </div>
        )}

        {/* Work Order Created Success Message */}
        {(workOrderCreated || hasExistingWorkOrder) && workOrderData && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <HiCheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="text-lg font-medium text-green-900">Work Order Available</h4>
                <p className="text-sm text-green-700">
                  Work Order #{workOrderData.workOrder?.workOrderNumber} is associated with this appointment.
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Status: {workOrderData.workOrder?.status === 'on_hold' ? 'On Hold (Parts Unavailable)' : 'Ready to Start'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="bg-green-50 px-6 py-4 rounded-t-xl border-b border-green-200">
              <div className="flex items-center space-x-3">
                              <div className="p-2 bg-green-100 rounded-lg">
                <HiCheckCircle className="h-6 w-6 text-green-600" />
              </div>
                <h4 className="text-lg font-semibold text-green-900">Approve Appointment</h4>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approval Notes <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="Enter approval notes, special instructions, or any additional information..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                  rows={4}
                  required
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowApprovalModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleApprove} 
                  disabled={loading || !approvalNotes.trim()}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Approving...' : 'Approve'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="bg-red-50 px-6 py-4 rounded-t-xl border-b border-red-200">
              <div className="flex items-center space-x-3">
                              <div className="p-2 bg-red-100 rounded-lg">
                <HiXCircle className="h-6 w-6 text-red-600" />
              </div>
                <h4 className="text-lg font-semibold text-red-900">Decline Appointment</h4>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Decline <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  placeholder="Please provide a detailed reason for declining this appointment..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                  rows={3}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign Follow-up To
                </label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  placeholder="Enter assignee name or ID for follow-up task"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeclineModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDecline} 
                  disabled={loading || !declineReason.trim() || !assignedTo.trim()}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Declining...' : 'Decline'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Work Order Creation Modal */}
      {showWorkOrderModal && workOrderData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="bg-green-50 px-6 py-4 rounded-t-xl border-b border-green-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <HiCheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-green-900">Work Order Created Successfully!</h4>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">Work Order Details</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Work Order #:</span>
                      <span className="font-medium text-gray-900">{workOrderData.workOrder?.workOrderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium ${
                        workOrderData.workOrder?.status === 'on_hold' ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {workOrderData.workOrder?.status === 'on_hold' ? 'On Hold (Parts Unavailable)' : 'Ready to Start'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priority:</span>
                      <span className="font-medium text-gray-900 capitalize">{workOrderData.workOrder?.priority}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimated Start:</span>
                      <span className="font-medium text-gray-900">
                        {workOrderData.workOrder?.estimatedStartDate ? 
                          new Date(workOrderData.workOrder.estimatedStartDate).toLocaleDateString() : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </div>

                {workOrderData.partsAvailability && !workOrderData.partsAvailability.allAvailable && (
                  <div className="bg-orange-50 rounded-lg p-4">
                    <h5 className="font-medium text-orange-900 mb-2">Parts Availability Warning</h5>
                    <p className="text-sm text-orange-700 mb-2">
                      {workOrderData.partsAvailability.totalMissing} parts are currently unavailable.
                    </p>
                    <div className="text-xs text-orange-600">
                      <p>Missing parts:</p>
                      <ul className="list-disc list-inside mt-1">
                        {workOrderData.partsAvailability.missingParts?.map((part: any, index: number) => (
                          <li key={index}>{part.name} (Qty: {part.quantity})</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-600">
                  <p>The work order has been created and is ready for assignment to a technician.</p>
                  {workOrderData.workOrder?.status === 'on_hold' && (
                    <p className="text-orange-600 mt-1">
                      Note: The work order is on hold due to missing parts. Please order the required parts before starting work.
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setShowWorkOrderModal(false)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalWorkflow;
