import React, { useState } from 'react';
import { useAppDispatch } from '../../redux';
import { addCommunication } from '../../redux/actions/collections';
import { CollectionsTask, CommunicationRecordData } from '../../services/collections';
import { X, MessageSquare, Phone, Mail, Calendar } from '../../utils/icons';
import { toast } from 'react-hot-toast';

interface CommunicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: CollectionsTask;
}

const CommunicationModal: React.FC<CommunicationModalProps> = ({
  isOpen,
  onClose,
  task
}) => {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CommunicationRecordData>({
    method: 'phone',
    direction: 'outbound',
    summary: '',
    outcome: 'no_answer',
    nextAction: '',
    nextActionDate: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.summary) {
      toast.error('Please provide a summary of the communication');
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(addCommunication({ id: task._id, data: formData })).unwrap();
      toast.success('Communication record added successfully');
      onClose();
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add communication record');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      method: 'phone',
      direction: 'outbound',
      summary: '',
      outcome: 'no_answer',
      nextAction: '',
      nextActionDate: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Add Communication Record</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Task: {task.title} - {typeof task.customer === 'object' ? task.customer.businessName || task.customer.name : 'Unknown'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
          {/* Communication Method and Direction */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Communication Method <span className="text-red-500">*</span>
              </label>
              <select
                name="method"
                value={formData.method}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="phone">Phone</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="in_person">In Person</option>
                <option value="letter">Letter</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Direction <span className="text-red-500">*</span>
              </label>
              <select
                name="direction"
                value={formData.direction}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="inbound">Inbound</option>
                <option value="outbound">Outbound</option>
              </select>
            </div>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              name="summary"
              value={formData.summary}
              onChange={handleInputChange}
              placeholder="Provide a summary of the communication..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Outcome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Outcome <span className="text-red-500">*</span>
            </label>
            <select
              name="outcome"
              value={formData.outcome}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="no_answer">No Answer</option>
              <option value="left_message">Left Message</option>
              <option value="spoke_to_customer">Spoke to Customer</option>
              <option value="payment_promised">Payment Promised</option>
              <option value="payment_made">Payment Made</option>
              <option value="refused">Refused</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Next Action */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Next Action
            </label>
            <input
              type="text"
              name="nextAction"
              value={formData.nextAction}
              onChange={handleInputChange}
              placeholder="e.g., Follow up in 3 days, Send payment reminder..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Next Action Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Next Action Date
            </label>
            <input
              type="datetime-local"
              name="nextActionDate"
              value={formData.nextActionDate}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
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
                  Adding...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Add Communication
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CommunicationModal;
