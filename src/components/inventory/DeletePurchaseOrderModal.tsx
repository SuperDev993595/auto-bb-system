import React, { useState } from 'react';
import { useAppDispatch } from '../../redux';
import { deletePurchaseOrder } from '../../redux/actions/inventory';
import type { PurchaseOrder } from '../../redux/reducer/inventoryReducer';
import { HiX, HiTrash, HiExclamation } from 'react-icons/hi';

interface DeletePurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrder: PurchaseOrder | null;
}

export default function DeletePurchaseOrderModal({ isOpen, onClose, purchaseOrder }: DeletePurchaseOrderModalProps) {
  const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!purchaseOrder) return;

    setIsDeleting(true);
    try {
      await dispatch(deletePurchaseOrder(purchaseOrder._id || purchaseOrder.id)).unwrap();
      onClose();
    } catch (error) {
      console.error('Error deleting purchase order:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !purchaseOrder) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Delete Purchase Order</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0">
              <HiExclamation className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">Are you sure?</h3>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600">
              You are about to delete the purchase order <strong>#{purchaseOrder.id}</strong>.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              This action cannot be undone. All associated data will be permanently removed.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Purchase Order Details:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>PO Number:</strong> #{purchaseOrder.id}</p>
              <p><strong>Supplier:</strong> {purchaseOrder.supplierName}</p>
              <p><strong>Order Date:</strong> {new Date(purchaseOrder.orderDate).toLocaleDateString()}</p>
              <p><strong>Status:</strong> {purchaseOrder.status}</p>
              <p><strong>Total:</strong> ${(purchaseOrder.total || 0).toFixed(2)}</p>
              <p><strong>Items:</strong> {(purchaseOrder.items && Array.isArray(purchaseOrder.items) ? purchaseOrder.items : []).length} items</p>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <HiTrash className="w-4 h-4" />
                  <span>Delete PO</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
