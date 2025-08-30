import React, { useState } from 'react';
import { useAppDispatch } from '../../redux';
import { updateCollectionsTask } from '../../redux/actions/collections';
import { CollectionsTask, UpdateCollectionsTaskData } from '../../services/collections';
import { X, Edit, Save, Calendar, DollarSign, User, AlertTriangle, MessageSquare, FileText } from '../../utils/icons';
import { toast } from 'react-hot-toast';

interface CollectionsTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: CollectionsTask;
}

const CollectionsTaskModal: React.FC<CollectionsTaskModalProps> = ({
  isOpen,
  onClose,
  task
}) => {
  const dispatch = useAppDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<UpdateCollectionsTaskData>({
    title: task.title,
    description: task.description,
    collectionsType: task.collectionsType,
    amount: task.amount,
    dueDate: task.dueDate,
    assignedTo: typeof task.assignedTo === 'string' ? task.assignedTo : task.assignedTo._id,
    priority: task.priority,
    status: task.status,
    paymentTerms: task.paymentTerms,
    riskLevel: task.riskLevel,
    escalationLevel: task.escalationLevel
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    try {
      await dispatch(updateCollectionsTask({ id: task._id, data: formData })).unwrap();
      toast.success('Collections task updated successfully');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update collections task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCollectionsTypeIcon = (type: string) => {
    switch (type) {
      case 'payment_reminder': return <MessageSquare className="w-4 h-4" />;
      case 'overdue_notice': return <AlertTriangle className="w-4 h-4" />;
      case 'payment_plan': return <Calendar className="w-4 h-4" />;
      case 'negotiation': return <MessageSquare className="w-4 h-4" />;
      case 'legal_action': return <FileText className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Collections Task Details</h2>
            <div className="flex items-center space-x-2">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1 text-blue-600 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors flex items-center"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </button>
              )}
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Collections Type
                </label>
                <select
                  name="collectionsType"
                  value={formData.collectionsType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="payment_reminder">Payment Reminder</option>
                  <option value="overdue_notice">Overdue Notice</option>
                  <option value="payment_plan">Payment Plan</option>
                  <option value="negotiation">Negotiation</option>
                  <option value="legal_action">Legal Action</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Risk Level
                </label>
                <select
                  name="riskLevel"
                  value={formData.riskLevel}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escalation Level
                </label>
                <input
                  type="number"
                  name="escalationLevel"
                  value={formData.escalationLevel}
                  onChange={handleInputChange}
                  min="1"
                  max="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Terms
              </label>
              <input
                type="text"
                name="paymentTerms"
                value={formData.paymentTerms}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="px-6 py-4 space-y-6">
            {/* Task Header */}
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                {getCollectionsTypeIcon(task.collectionsType)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                <p className="text-gray-600">{task.description}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                    {task.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRiskLevelColor(task.riskLevel)}`}>
                    {task.riskLevel.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500">
                    Escalation Level: {task.escalationLevel}
                  </span>
                </div>
              </div>
            </div>

            {/* Key Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Financial Details</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Amount:</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(task.amount)}</span>
                    </div>
                    {task.paymentTerms && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Payment Terms:</span>
                        <span className="text-sm text-gray-900">{task.paymentTerms}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Timeline</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Due Date:</span>
                      <span className="text-sm font-medium text-gray-900">{formatDate(task.dueDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Created:</span>
                      <span className="text-sm text-gray-900">{formatDate(task.createdAt)}</span>
                    </div>
                    {task.lastContactDate && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Last Contact:</span>
                        <span className="text-sm text-gray-900">{formatDate(task.lastContactDate)}</span>
                      </div>
                    )}
                    {task.nextContactDate && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Next Contact:</span>
                        <span className="text-sm text-gray-900">{formatDate(task.nextContactDate)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Assignment</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Assigned To:</span>
                      <span className="text-sm text-gray-900">
                        {typeof task.assignedTo === 'object' ? task.assignedTo.name : 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Priority:</span>
                      <span className="text-sm font-medium text-gray-900">{task.priority.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {task.paymentPlan && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Payment Plan</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Amount:</span>
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(task.paymentPlan.totalAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Installment Amount:</span>
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(task.paymentPlan.installmentAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Payments Made:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {task.paymentPlan.paymentsMade} / {task.paymentPlan.numberOfInstallments}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Paid:</span>
                        <span className="text-sm font-medium text-gray-900">{formatCurrency(task.paymentPlan.totalPaid)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Next Payment:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {task.paymentPlan.nextPaymentDate ? formatDate(task.paymentPlan.nextPaymentDate) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Communication History */}
            {task.communicationHistory && task.communicationHistory.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Communication History</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {task.communicationHistory.map((comm, index) => (
                    <div key={index} className="border-l-4 border-blue-500 pl-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{comm.summary}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {comm.method} • {comm.direction} • {formatDate(comm.date)}
                          </p>
                          {comm.outcome && (
                            <p className="text-xs text-gray-500 mt-1">Outcome: {comm.outcome.replace('_', ' ')}</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(comm.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Legal Documents */}
            {task.legalDocuments && task.legalDocuments.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Legal Documents</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {task.legalDocuments.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{doc.originalName}</p>
                        <p className="text-xs text-gray-600">{doc.documentType.replace('_', ' ')}</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Audit Trail */}
            {task.auditTrail && task.auditTrail.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Audit Trail</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {task.auditTrail.map((audit, index) => (
                    <div key={index} className="border-l-4 border-gray-300 pl-4">
                      <p className="text-sm text-gray-900">{audit.action}</p>
                      <p className="text-xs text-gray-600 mt-1">{audit.description}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(audit.performedAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionsTaskModal;
