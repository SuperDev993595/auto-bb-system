import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import ModalWrapper from '../../utils/ModalWrapper';
import { TrendingUp } from '../../utils/icons';
import { workOrderService } from '../../services/workOrders';

interface ProgressUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  workOrderId: string;
  currentProgress?: number;
  onSuccess: () => void;
}

export default function ProgressUpdateModal({
  isOpen,
  onClose,
  workOrderId,
  currentProgress = 0,
  onSuccess
}: ProgressUpdateModalProps) {
  const [progress, setProgress] = useState(currentProgress);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (progress < 0 || progress > 100) {
      toast.error('Progress must be between 0 and 100');
      return;
    }

    setLoading(true);

    try {
      await workOrderService.updateProgress(workOrderId, {
        progress,
        notes: notes.trim() || undefined
      });

      toast.success('Progress updated successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating progress:', error);
      toast.error(error.message || 'Failed to update progress');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setProgress(currentProgress);
      setNotes('');
      onClose();
    }
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleClose}
      title="Update Work Progress"
      icon={<TrendingUp className="w-6 h-6" />}
      submitText="Update Progress"
      onSubmit={handleSubmit}
      submitDisabled={loading}
      size="md"
    >
      <div className="p-6 space-y-6">
        {/* Progress Slider */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Progress: {progress}%
          </label>
          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              disabled={loading}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Progress Input */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Progress Percentage
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter progress percentage"
            disabled={loading}
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
            placeholder="Add any notes about the work progress..."
            disabled={loading}
          />
        </div>

        {/* Auto-completion Warning */}
        {progress >= 100 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Auto-completion Notice
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Setting progress to 100% will automatically mark this work order as completed.
                    Make sure all work has been finished and quality control checks are complete.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
}
