import React, { useState } from 'react';
import { useAppDispatch } from '../../redux';
import { deleteInventoryItem } from '../../redux/actions/inventory';
import { InventoryItem } from '../../services/inventory';
import { X, Trash2, AlertTriangle } from '../../utils/icons';

interface DeleteInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}

export default function DeleteInventoryModal({ isOpen, onClose, item }: DeleteInventoryModalProps) {
  const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!item) return;

    setIsDeleting(true);
    try {
      await dispatch(deleteInventoryItem(item._id)).unwrap();
      onClose();
    } catch (error) {
      console.error('Error deleting inventory item:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-red-50 to-pink-50">
          <h2 className="text-xl font-semibold text-gray-900">Delete Inventory Item</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-center mb-6">
            <div className="flex-shrink-0">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-gray-900">Are you sure?</h3>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-sm text-gray-600">
              You are about to delete the inventory item <strong>"{item.name}"</strong> (Part #: {item.partNumber}).
            </p>
            <p className="text-sm text-gray-600 mt-2">
              This action cannot be undone. All associated data will be permanently removed.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Item Details:</h4>
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Name:</strong> {item.name}</p>
              <p><strong>Part Number:</strong> {item.partNumber}</p>
              <p><strong>Category:</strong> {item.category}</p>
              <p><strong>Current Stock:</strong> {item.quantityOnHand}</p>
              <p><strong>Location:</strong> {item.location || 'N/A'}</p>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Item</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
