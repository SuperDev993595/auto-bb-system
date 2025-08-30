import React, { useState } from 'react';
import { useAppDispatch } from '../../redux';
import { CollectionsTask } from '../../services/collections';
import { collectionsApi } from '../../services/collections';
import { X, Calendar, Clock, User, MessageSquare, Phone, Mail, FileText } from '../../utils/icons';
import { toast } from 'react-hot-toast';

interface ScheduleReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: CollectionsTask;
}

const ScheduleReminderModal: React.FC<ScheduleReminderModalProps> = ({
  isOpen,
  onClose,
  task
}) => {
  const dispatch = useAppDispatch();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: 'email' as const,
    scheduledDate: '',
    scheduledTime: '',
    template: 'default',
    recipient: 'customer' as const,
    customMessage: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.scheduledDate || !formData.scheduledTime) {
      toast.error('Please select both date and time for the reminder');
      return;
    }

    setIsSubmitting(true);
    try {
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      
      if (scheduledDateTime <= new Date()) {
        toast.error('Reminder must be scheduled for a future date and time');
        return;
      }

      const reminderData = {
        type: formData.type,
        scheduledDate: scheduledDateTime.toISOString(),
        template: formData.template,
        recipient: formData.recipient
      };

      await collectionsApi.scheduleReminder(task._id, reminderData);
      toast.success('Reminder scheduled successfully');
      onClose();
      resetForm();
    } catch (error: any) {
      toast.error(error.message || 'Failed to schedule reminder');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'email',
      scheduledDate: '',
      scheduledTime: '',
      template: 'default',
      recipient: 'customer',
      customMessage: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Schedule Automated Reminder</h2>
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
          {/* Reminder Type and Recipient */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reminder Type <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="letter">Letter</option>
                <option value="phone">Phone</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipient <span className="text-red-500">*</span>
              </label>
              <select
                name="recipient"
                value={formData.recipient}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="customer">Customer</option>
                <option value="assigned_user">Assigned User</option>
                <option value="manager">Manager</option>
              </select>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="time"
                  name="scheduledTime"
                  value={formData.scheduledTime}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Template */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template
            </label>
            <select
              name="template"
              value={formData.template}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="default">Default</option>
              <option value="friendly">Friendly</option>
              <option value="formal">Formal</option>
              <option value="urgent">Urgent</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Custom Message */}
          {formData.template === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Message
              </label>
              <textarea
                name="customMessage"
                value={formData.customMessage}
                onChange={handleInputChange}
                placeholder="Enter your custom message..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* Reminder Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Reminder Preview</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="w-24 font-medium">Type:</span>
                <span className="flex items-center">
                  {formData.type === 'email' && <Mail className="w-4 h-4 mr-2" />}
                  {formData.type === 'sms' && <MessageSquare className="w-4 h-4 mr-2" />}
                  {formData.type === 'letter' && <FileText className="w-4 h-4 mr-2" />}
                  {formData.type === 'phone' && <Phone className="w-4 h-4 mr-2" />}
                  {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
                </span>
              </div>
              <div className="flex items-center">
                <span className="w-24 font-medium">Recipient:</span>
                <span className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  {formData.recipient === 'customer' ? 'Customer' : 
                   formData.recipient === 'assigned_user' ? 'Assigned User' : 'Manager'}
                </span>
              </div>
              <div className="flex items-center">
                <span className="w-24 font-medium">Scheduled:</span>
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  {formData.scheduledDate && formData.scheduledTime ? 
                    `${formData.scheduledDate} at ${formData.scheduledTime}` : 'Not set'}
                </span>
              </div>
            </div>
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
                  Scheduling...
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 mr-2" />
                  Schedule Reminder
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleReminderModal;
