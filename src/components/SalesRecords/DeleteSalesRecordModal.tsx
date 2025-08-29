import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { SalesRecord } from '../../services/salesRecords';

interface DeleteSalesRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  salesRecord: SalesRecord;
}

const DeleteSalesRecordModal: React.FC<DeleteSalesRecordModalProps> = ({
  isOpen,
  onClose,
  onDelete,
  salesRecord
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Delete Sales Record</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Are you sure?</h3>
            <p className="text-sm text-gray-600">
              This action cannot be undone. This will permanently delete the sales record.
            </p>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Record Number:</span>
              <span className="text-sm text-gray-900">{salesRecord.recordNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Customer:</span>
              <span className="text-sm text-gray-900">
                {salesRecord.customer.businessName || salesRecord.customer.contactPerson.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Total Amount:</span>
              <span className="text-sm font-medium text-gray-900">{formatCurrency(salesRecord.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium text-gray-700">Items:</span>
              <span className="text-sm text-gray-900">{salesRecord.items.length} item(s)</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center gap-2"
          >
            <Trash2 size={16} />
            Delete Record
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteSalesRecordModal;
