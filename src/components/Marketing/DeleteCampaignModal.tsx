import React from 'react';
import { HiX, HiExclamationTriangle } from 'react-icons/hi';

interface DeleteCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  campaignName?: string;
  isLoading?: boolean;
}

export default function DeleteCampaignModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  campaignName = 'this campaign',
  isLoading = false 
}: DeleteCampaignModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Delete Campaign
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <HiExclamationTriangle className="w-8 h-8 text-red-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              Are you sure?
            </h3>
            <p className="text-sm text-gray-500">
              This action cannot be undone. This will permanently delete{' '}
              <span className="font-medium text-gray-900">"{campaignName}"</span>.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Deleting...' : 'Delete Campaign'}
          </button>
        </div>
      </div>
    </div>
  );
}
