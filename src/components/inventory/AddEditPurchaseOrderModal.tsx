import React, { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../redux';
import { createPurchaseOrder, updatePurchaseOrder, fetchPurchaseOrders } from '../../redux/actions/inventory';
import { InventoryItem } from '../../services/inventory'
import type { PurchaseOrder, Supplier } from '../../redux/reducer/inventoryReducer';
import { Save, Plus, Trash2 } from '../../utils/icons';
import ModalWrapper from '../../utils/ModalWrapper';
import { toast } from 'react-hot-toast';

interface AddEditPurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrder?: PurchaseOrder | null;
  mode: 'add' | 'edit';
}

interface PurchaseOrderItem {
  item: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface CreatePurchaseOrderData {
  poNumber?: string;
  supplierId: string;
  items: {
    itemId: string;
    quantity: number;
    unitPrice: number;
  }[];
  expectedDeliveryDate: string;
  tax?: number;
  shipping?: number;
  notes?: string;
}

interface UpdatePurchaseOrderData {
  poNumber?: string;
  supplierId?: string;
  items?: {
    itemId: string;
    quantity: number;
    unitPrice: number;
  }[];
  expectedDeliveryDate?: string;
  tax?: number;
  shipping?: number;
  notes?: string;
}

export default function AddEditPurchaseOrderModal({ isOpen, onClose, purchaseOrder, mode }: AddEditPurchaseOrderModalProps) {
  const dispatch = useAppDispatch();
  const { suppliers, items } = useAppSelector(state => state.inventory);
  
  const [formData, setFormData] = useState<CreatePurchaseOrderData>({
    poNumber: '',
    supplierId: '',
    items: [],
    expectedDeliveryDate: new Date().toISOString().split('T')[0],
    tax: 0,
    shipping: 0,
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (purchaseOrder && mode === 'edit') {
      console.log('Editing purchase order:', purchaseOrder); // Debug log
      
      // Transform items to ensure they have the correct structure
      const transformedItems = (purchaseOrder.items || []).map((item: any) => {
        console.log('Processing item:', item); // Debug log
        
        // Handle different possible item structures
        let itemId = '';
        if (typeof item === 'object') {
          if (item.item) {
            // If item.item is an object (populated), get its _id, otherwise use the string
            itemId = typeof item.item === 'object' ? item.item._id || item.item.id : item.item;
          } else if (item._id) {
            // Direct item object
            itemId = item._id;
          }
        } else if (typeof item === 'string') {
          itemId = item;
        }
        
        return {
          itemId: itemId,
          quantity: typeof item === 'object' ? item.quantity || 1 : 1,
          unitPrice: typeof item === 'object' ? item.unitPrice || 0 : 0
        };
      });
      
      // Handle supplier - could be populated object or string ID
      let supplierId = '';
      if (typeof purchaseOrder.supplier === 'object' && purchaseOrder.supplier) {
        supplierId = (purchaseOrder.supplier as any)._id || (purchaseOrder.supplier as any).id;
      } else {
        supplierId = purchaseOrder.supplier || '';
      }
      
      setFormData({
        poNumber: purchaseOrder.poNumber || '',
        supplierId: supplierId,
        items: transformedItems,
        expectedDeliveryDate: purchaseOrder.expectedDate ? purchaseOrder.expectedDate.split('T')[0] : new Date().toISOString().split('T')[0],
        tax: purchaseOrder.tax || 0,
        shipping: purchaseOrder.shipping || 0,
        notes: purchaseOrder.notes || ''
      });
    } else {
      setFormData({
        poNumber: '',
        supplierId: '',
        items: [],
        expectedDeliveryDate: new Date().toISOString().split('T')[0], // Set today as default
        tax: 0,
        shipping: 0,
        notes: ''
      });
    }
    setErrors({});
  }, [purchaseOrder, mode, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.supplierId.trim()) newErrors.supplierId = 'Supplier is required';
    if (!formData.expectedDeliveryDate) newErrors.expectedDeliveryDate = 'Expected delivery date is required';
    if (formData.items.length === 0) newErrors.items = 'At least one item is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      if (mode === 'add') {
        await dispatch(createPurchaseOrder(formData)).unwrap();
        toast.success('Purchase order created successfully!');
      } else {
        if (!purchaseOrder?.id) {
          toast.error('Purchase order ID is missing');
          return;
        }
        const updateData: UpdatePurchaseOrderData = {
          ...formData
        };
        await dispatch(updatePurchaseOrder({ id: purchaseOrder.id, purchaseOrderData: updateData })).unwrap();
        toast.success('Purchase order updated successfully!');
      }
      
      // Refresh the purchase orders list
      dispatch(fetchPurchaseOrders({}));
      onClose();
    } catch (error: any) {
      console.error('Error saving purchase order:', error);
      toast.error(error.message || 'Failed to save purchase order');
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
    const newItem = {
      itemId: '',
      quantity: 1,
      unitPrice: 0
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

  const updateItem = (index: number, field: 'itemId' | 'quantity' | 'unitPrice', value: any) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      return {
        ...prev,
        items: newItems
      };
    });
  };

  const handleItemSelect = (index: number, itemId: string) => {
    const selectedItem = (items && Array.isArray(items) ? items : []).find(item => {
      const currentItemId = item._id || item.id;
      return currentItemId === itemId;
    });
    if (selectedItem) {
      updateItem(index, 'itemId', itemId);
      updateItem(index, 'unitPrice', selectedItem.costPrice || 0);
    }
  };

  // Debug function to log current form state
  const logFormState = () => {
    console.log('Current form data:', formData);
    console.log('Available suppliers:', suppliers);
    console.log('Available items:', items);
  };

  if (!isOpen) return null;

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'add' ? 'Create Purchase Order' : 'Edit Purchase Order'}
      submitText={mode === 'add' ? 'Create PO' : 'Save Changes'}
      onSubmit={handleSubmit}
      submitColor="bg-blue-600"
      size="xl"
    >
      <div className="p-8 space-y-8">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PO Number
              </label>
              <input
                type="text"
                value={formData.poNumber}
                onChange={(e) => handleInputChange('poNumber', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                placeholder="Auto-generated if empty"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier *
              </label>
              <select
                value={formData.supplierId}
                onChange={(e) => handleInputChange('supplierId', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white ${
                  errors.supplierId ? 'border-red-500' : 'border-gray-200'
                }`}
              >
                <option value="">Select supplier</option>
                {(suppliers && Array.isArray(suppliers) ? suppliers : []).map(supplier => {
                  const supplierId = supplier._id || supplier.id;
                  return (
                    <option key={supplierId} value={supplierId}>
                      {supplier.name}
                    </option>
                  );
                })}
              </select>
              {errors.supplierId && <p className="mt-1 text-sm text-red-600">{errors.supplierId}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Delivery Date *
              </label>
              <input
                type="date"
                value={formData.expectedDeliveryDate}
                onChange={(e) => handleInputChange('expectedDeliveryDate', e.target.value)}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white ${
                  errors.expectedDeliveryDate ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.expectedDeliveryDate && <p className="mt-1 text-sm text-red-600">{errors.expectedDeliveryDate}</p>}
            </div>
          </div>

          {/* Additional Costs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  value={formData.tax}
                  onChange={(e) => handleInputChange('tax', parseFloat(e.target.value) || 0)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Cost
              </label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-gray-500">$</span>
                <input
                  type="number"
                  value={formData.shipping}
                  onChange={(e) => handleInputChange('shipping', parseFloat(e.target.value) || 0)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 hover:bg-white"
              placeholder="Additional notes for this purchase order..."
            />
          </div>

          {/* Items */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Items</h3>
              <button
                type="button"
                onClick={addItem}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all duration-200 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            {formData.items.map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-4 mb-4 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-medium text-gray-900">Item {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Item *
                    </label>
                    <select
                      value={item.itemId}
                      onChange={(e) => updateItem(index, 'itemId', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:bg-gray-50"
                    >
                      <option value="">Select item</option>
                      {(items && Array.isArray(items) ? items : []).map(inventoryItem => {
                        const itemId = inventoryItem._id || inventoryItem.id;
                        return (
                          <option key={itemId} value={itemId}>
                            {inventoryItem.name} - {inventoryItem.partNumber}
                          </option>
                        );
                      })}
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:bg-gray-50"
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
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:bg-gray-50"
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
                      value={item.quantity * item.unitPrice}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-100"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex justify-end">
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">
                  Total: ${(formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) + (formData.tax || 0) + (formData.shipping || 0)).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>
    </ModalWrapper>
  );
}
