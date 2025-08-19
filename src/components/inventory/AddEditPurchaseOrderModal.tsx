import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../redux';
import { createPurchaseOrder, updatePurchaseOrder } from '../../redux/actions/inventory';
import { InventoryItem } from '../../utils/CustomerTypes'
import type { PurchaseOrder, Supplier } from '../../redux/reducer/inventoryReducer';
import { HiX, HiSave, HiPlus, HiTrash } from 'react-icons/hi';

interface AddEditPurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrder?: PurchaseOrder | null;
  mode: 'add' | 'edit';
}

interface PurchaseOrderItem {
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface CreatePurchaseOrderData {
  supplierName: string;
  orderDate: string;
  expectedDate?: string;
  items: PurchaseOrderItem[];
  total: number;
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';
}

interface UpdatePurchaseOrderData {
  supplierName?: string;
  orderDate?: string;
  expectedDate?: string;
  items?: PurchaseOrderItem[];
  total?: number;
  status?: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';
}

export default function AddEditPurchaseOrderModal({ isOpen, onClose, purchaseOrder, mode }: AddEditPurchaseOrderModalProps) {
  const dispatch = useAppDispatch();
  const { suppliers, items } = useAppSelector(state => state.inventory);
  
  const [formData, setFormData] = useState<CreatePurchaseOrderData>({
    supplierName: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDate: '',
    items: [],
    total: 0,
    status: 'draft'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (purchaseOrder && mode === 'edit') {
      setFormData({
        supplierName: purchaseOrder.supplierName,
        orderDate: purchaseOrder.orderDate.split('T')[0],
        expectedDate: purchaseOrder.expectedDate ? purchaseOrder.expectedDate.split('T')[0] : '',
        items: purchaseOrder.items || [],
        total: purchaseOrder.total,
        status: purchaseOrder.status
      });
    } else {
      setFormData({
        supplierName: '',
        orderDate: new Date().toISOString().split('T')[0],
        expectedDate: '',
        items: [],
        total: 0,
        status: 'draft'
      });
    }
    setErrors({});
  }, [purchaseOrder, mode, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.supplierName.trim()) newErrors.supplierName = 'Supplier is required';
    if (!formData.orderDate) newErrors.orderDate = 'Order date is required';
    if (formData.items.length === 0) newErrors.items = 'At least one item is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (mode === 'add') {
        await dispatch(createPurchaseOrder(formData)).unwrap();
      } else if (purchaseOrder) {
        const updateData: UpdatePurchaseOrderData = { ...formData };
        await dispatch(updatePurchaseOrder({ id: purchaseOrder._id || purchaseOrder.id, purchaseOrderData: updateData })).unwrap();
      }
      onClose();
    } catch (error) {
      console.error('Error saving purchase order:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreatePurchaseOrderData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const addItem = () => {
    const newItem: PurchaseOrderItem = {
      itemId: '',
      name: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    };
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: keyof PurchaseOrderItem, value: any) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      // Recalculate total price for this item
      if (field === 'quantity' || field === 'unitPrice') {
        newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice;
      }
      
      // Recalculate total for all items
      const total = newItems.reduce((sum, item) => sum + item.totalPrice, 0);
      
      return {
        ...prev,
        items: newItems,
        total
      };
    });
  };

  const handleItemSelect = (index: number, itemId: string) => {
    const selectedItem = (items && Array.isArray(items) ? items : []).find(item => (item._id || item.id) === itemId);
    if (selectedItem) {
      updateItem(index, 'itemId', itemId);
      updateItem(index, 'name', selectedItem.name);
      updateItem(index, 'unitPrice', selectedItem.costPrice || 0);
      updateItem(index, 'totalPrice', (selectedItem.costPrice || 0) * formData.items[index].quantity);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'add' ? 'Create Purchase Order' : 'Edit Purchase Order'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier *
              </label>
              <select
                value={formData.supplierName}
                onChange={(e) => handleInputChange('supplierName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.supplierName ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select supplier</option>
                {(suppliers && Array.isArray(suppliers) ? suppliers : []).map(supplier => (
                  <option key={supplier._id || supplier.id} value={supplier.name}>
                    {supplier.name}
                  </option>
                ))}
              </select>
              {errors.supplierName && <p className="mt-1 text-sm text-red-600">{errors.supplierName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Date *
              </label>
              <input
                type="date"
                value={formData.orderDate}
                onChange={(e) => handleInputChange('orderDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.orderDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.orderDate && <p className="mt-1 text-sm text-red-600">{errors.orderDate}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Date
              </label>
              <input
                type="date"
                value={formData.expectedDate}
                onChange={(e) => handleInputChange('expectedDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => handleInputChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="confirmed">Confirmed</option>
              <option value="received">Received</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Items */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
              >
                <HiPlus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            {errors.items && <p className="text-sm text-red-600">{errors.items}</p>}

            {formData.items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-gray-900">Item {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <HiTrash className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item *
                    </label>
                    <select
                      value={item.itemId}
                      onChange={(e) => handleItemSelect(index, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select item</option>
                      {(items && Array.isArray(items) ? items : []).map(inventoryItem => (
                        <option key={inventoryItem._id || inventoryItem.id} value={inventoryItem._id || inventoryItem.id}>
                          {inventoryItem.name} - {inventoryItem.partNumber}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unit Price *
                    </label>
                    <input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Price
                    </label>
                    <input
                      type="number"
                      value={item.totalPrice}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex justify-end">
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">
                  Total: ${formData.total.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <HiSave className="w-4 h-4" />
                  <span>{mode === 'add' ? 'Create PO' : 'Save Changes'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
