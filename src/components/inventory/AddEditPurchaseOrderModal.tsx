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

    if (!formData.supplierId.trim()) newErrors.supplierName = 'Supplier is required';
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
        console.log('Sending update data:', updateData); // Debug log
        await dispatch(updatePurchaseOrder({ id: purchaseOrder.id, purchaseOrderData: updateData })).unwrap();
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                   <div className="flex items-center justify-between p-6 border-b">
             <h2 className="text-xl font-semibold text-gray-900">
               {mode === 'add' ? 'Create Purchase Order' : 'Edit Purchase Order'}
             </h2>
             <div className="flex items-center gap-2">
               {mode === 'edit' && (
                 <button
                   type="button"
                   onClick={logFormState}
                   className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded"
                 >
                   Debug
                 </button>
               )}
               <button
                 onClick={onClose}
                 className="text-gray-400 hover:text-gray-600 transition-colors"
               >
                 <HiX className="w-6 h-6" />
               </button>
             </div>
           </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Auto-generated if empty"
                disabled={mode === 'edit'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supplier *
              </label>
              <select
                value={formData.supplierId}
                onChange={(e) => {
                  setFormData(prev => ({
                    ...prev,
                    supplierId: e.target.value
                  }));
                  if (errors.supplierName) {
                    setErrors(prev => ({ ...prev, supplierName: '' }));
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.supplierName ? 'border-red-500' : 'border-gray-300'
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
              {errors.supplierName && <p className="mt-1 text-sm text-red-600">{errors.supplierName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expected Delivery Date
              </label>
              <input
                type="date"
                value={formData.expectedDeliveryDate}
                onChange={(e) => handleInputChange('expectedDeliveryDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tax Amount
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.tax}
                onChange={(e) => handleInputChange('tax', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shipping Cost
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.shipping}
                onChange={(e) => handleInputChange('shipping', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional notes"
              />
            </div>
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
                       value={item.quantity * item.unitPrice}
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
                   Total: ${(formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) + (formData.tax || 0) + (formData.shipping || 0)).toFixed(2)}
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
