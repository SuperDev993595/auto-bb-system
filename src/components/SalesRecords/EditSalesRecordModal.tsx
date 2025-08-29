import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import { updateSalesRecordAction } from '../../redux/actions/salesRecords';
import { RootState } from '../../redux/store';
import { SalesRecord, UpdateSalesRecordData } from '../../services/salesRecords';

interface EditSalesRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  salesRecord: SalesRecord;
}

interface FormItem {
  type: 'inventory' | 'service';
  itemId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

const EditSalesRecordModal: React.FC<EditSalesRecordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  salesRecord
}) => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state: RootState) => state.salesRecords);
  const { list: customers } = useSelector((state: RootState) => state.customers);
  const { items: inventory } = useSelector((state: RootState) => state.inventory);
  const { catalog: services } = useSelector((state: RootState) => state.services);

  const [formData, setFormData] = useState<Partial<UpdateSalesRecordData>>({
    customer: '',
    salesType: 'product',
    items: [],
    subtotal: 0,
    tax: 0,
    discount: 0,
    total: 0,
    paymentStatus: 'pending',
    paymentMethod: undefined,
    paymentDate: undefined,
    paymentReference: '',
    salesSource: 'walk_in',
    convertedFromLead: false,
    originalLeadId: '',
    status: 'completed',
    saleDate: new Date().toISOString().split('T')[0],
    completionDate: undefined,
    notes: '',
    nextFollowUp: undefined,
    followUpStatus: 'scheduled',
    customerSatisfaction: {
      rating: undefined,
      feedback: '',
      date: undefined
    },
    warranty: {
      hasWarranty: false,
      warrantyPeriod: undefined,
      warrantyExpiry: undefined,
      warrantyNotes: ''
    }
  });

  const [formItems, setFormItems] = useState<FormItem[]>([]);
  const [selectedItemType, setSelectedItemType] = useState<'inventory' | 'service'>('inventory');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemUnitPrice, setItemUnitPrice] = useState(0);

  useEffect(() => {
    if (isOpen && salesRecord) {
      // Populate form with existing data
      setFormData({
        customer: salesRecord.customer._id,
        salesType: salesRecord.salesType,
        items: salesRecord.items,
        subtotal: salesRecord.subtotal,
        tax: salesRecord.tax,
        discount: salesRecord.discount,
        total: salesRecord.total,
        paymentStatus: salesRecord.paymentStatus,
        salesSource: salesRecord.salesSource,
        status: salesRecord.status,
        notes: salesRecord.notes || ''
      });

      // Convert existing items to form format
      const existingItems: FormItem[] = salesRecord.items.map(item => ({
        type: 'inventory', // Default to inventory, could be enhanced to detect type
        itemId: '',
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.totalPrice
      }));
      setFormItems(existingItems);
    }
  }, [isOpen, salesRecord]);

  useEffect(() => {
    // Calculate totals when items change
    const subtotal = formItems.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax - (formData.discount || 0);

    setFormData(prev => ({
      ...prev,
      subtotal,
      tax,
      total
    }));
  }, [formItems, formData.discount]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addItem = () => {
    if (!selectedItemId || itemQuantity <= 0 || itemUnitPrice <= 0) {
      toast.error('Please fill in all item details');
      return;
    }

    const selectedItem = selectedItemType === 'inventory' 
      ? inventory.find((item: any) => item._id === selectedItemId)
      : services.find((service: any) => service._id === selectedItemId);

    if (!selectedItem) {
      toast.error('Selected item not found');
      return;
    }

    const newItem: FormItem = {
      type: selectedItemType,
      itemId: selectedItemId,
      name: selectedItem.name,
      quantity: itemQuantity,
      unitPrice: itemUnitPrice,
      total: itemQuantity * itemUnitPrice
    };

    setFormItems(prev => [...prev, newItem]);
    
    // Reset item form
    setSelectedItemId('');
    setItemQuantity(1);
    setItemUnitPrice(0);
  };

  const removeItem = (index: number) => {
    setFormItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customer) {
      toast.error('Please select a customer');
      return;
    }

    if (formItems.length === 0) {
      toast.error('Please add at least one item');
      return;
    }

    const updateData: UpdateSalesRecordData = {
      ...formData as UpdateSalesRecordData,
      items: formItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.total
      }))
    };

    try {
      await dispatch(updateSalesRecordAction({ id: salesRecord._id, data: updateData }) as any);
      toast.success('Sales record updated successfully');
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error updating sales record:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Edit Sales Record</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer *
              </label>
              <select
                value={formData.customer}
                onChange={(e) => handleInputChange('customer', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Customer</option>
                {customers.map((customer: any) => (
                  <option key={customer._id} value={customer._id}>
                    {customer.name} - {customer.phone}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sales Type
              </label>
              <select
                value={formData.salesType}
                onChange={(e) => handleInputChange('salesType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="product">Product</option>
                <option value="service">Service</option>
                <option value="both">Product & Service</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sales Source
              </label>
              <select
                value={formData.salesSource}
                onChange={(e) => handleInputChange('salesSource', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="walk_in">Walk-in</option>
                <option value="phone">Phone</option>
                <option value="online">Online</option>
                <option value="referral">Referral</option>
                <option value="appointment">Appointment</option>
              </select>
            </div>
          </div>

          {/* Items Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Items</h3>
            
            {/* Add Item Form */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Type
                  </label>
                  <select
                    value={selectedItemType}
                    onChange={(e) => setSelectedItemType(e.target.value as 'inventory' | 'service')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="inventory">Inventory Item</option>
                    <option value="service">Service</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item
                  </label>
                  <select
                    value={selectedItemId}
                    onChange={(e) => {
                      setSelectedItemId(e.target.value);
                      const item = selectedItemType === 'inventory'
                        ? inventory.find((item: any) => item._id === e.target.value)
                        : services.find((service: any) => service._id === e.target.value);
                      setItemUnitPrice(selectedItemType === 'inventory' ? (item as any)?.sellingPrice || 0 : (item as any)?.laborRate || 0);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Item</option>
                    {selectedItemType === 'inventory' 
                      ? inventory.map((item: any) => (
                          <option key={item._id} value={item._id}>
                            {item.name} - ${item.sellingPrice}
                          </option>
                        ))
                      : services.map((service: any) => (
                          <option key={service._id} value={service._id}>
                            {service.name} - ${service.laborRate}
                          </option>
                        ))
                    }
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={itemQuantity}
                    onChange={(e) => setItemQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Price
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={itemUnitPrice}
                    onChange={(e) => setItemUnitPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={addItem}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center justify-center"
                >
                  <Plus size={16} className="mr-2" />
                  Add
                </button>
              </div>
            </div>

            {/* Items List */}
            {formItems.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Type</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Item</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Qty</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Unit Price</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Total</th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formItems.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="px-4 py-2 text-sm">{item.type}</td>
                        <td className="px-4 py-2 text-sm">{item.name}</td>
                        <td className="px-4 py-2 text-sm">{item.quantity}</td>
                        <td className="px-4 py-2 text-sm">${item.unitPrice.toFixed(2)}</td>
                        <td className="px-4 py-2 text-sm">${item.total.toFixed(2)}</td>
                        <td className="px-4 py-2">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Financial Summary */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Financial Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtotal
                  </label>
                  <input
                    type="number"
                    value={formData.subtotal?.toFixed(2)}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tax (10%)
                  </label>
                  <input
                    type="number"
                    value={formData.tax?.toFixed(2)}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discount
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discount || 0}
                    onChange={(e) => handleInputChange('discount', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total
                  </label>
                  <input
                    type="number"
                    value={formData.total?.toFixed(2)}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-semibold text-lg"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Status
                  </label>
                  <select
                    value={formData.paymentStatus}
                    onChange={(e) => handleInputChange('paymentStatus', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="partial">Partial</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {formData.paymentStatus === 'paid' && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method *
                  </label>
                  <select
                    value={formData.paymentMethod || ''}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={formData.paymentStatus === 'paid'}
                  >
                    <option value="">Select Payment Method</option>
                    <option value="cash">Cash</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="check">Check</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="online">Online Payment</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    value={formData.paymentDate || ''}
                    onChange={(e) => handleInputChange('paymentDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={formData.paymentStatus === 'paid'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Reference
                  </label>
                  <input
                    type="text"
                    value={formData.paymentReference || ''}
                    onChange={(e) => handleInputChange('paymentReference', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Transaction ID, check number, etc."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Lead Conversion */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Lead Conversion</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="convertedFromLead"
                  checked={formData.convertedFromLead || false}
                  onChange={(e) => handleInputChange('convertedFromLead', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="convertedFromLead" className="ml-2 block text-sm text-gray-900">
                  Converted from Lead
                </label>
              </div>
              
              {formData.convertedFromLead && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Original Lead ID
                  </label>
                  <input
                    type="text"
                    value={formData.originalLeadId || ''}
                    onChange={(e) => handleInputChange('originalLeadId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter the original lead ID"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Follow-up Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Follow-up Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Next Follow-up Date
                </label>
                <input
                  type="date"
                  value={formData.nextFollowUp || ''}
                  onChange={(e) => handleInputChange('nextFollowUp', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Follow-up Status
                </label>
                <select
                  value={formData.followUpStatus || 'scheduled'}
                  onChange={(e) => handleInputChange('followUpStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>

          {/* Customer Satisfaction */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Customer Satisfaction</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating (1-5)
                </label>
                <select
                  value={formData.customerSatisfaction?.rating || ''}
                  onChange={(e) => handleInputChange('customerSatisfaction', {
                    ...formData.customerSatisfaction,
                    rating: e.target.value ? Number(e.target.value) : undefined
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Rating</option>
                  <option value="1">1 - Poor</option>
                  <option value="2">2 - Fair</option>
                  <option value="3">3 - Good</option>
                  <option value="4">4 - Very Good</option>
                  <option value="5">5 - Excellent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback
                </label>
                <textarea
                  value={formData.customerSatisfaction?.feedback || ''}
                  onChange={(e) => handleInputChange('customerSatisfaction', {
                    ...formData.customerSatisfaction,
                    feedback: e.target.value
                  })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Customer feedback..."
                />
              </div>
            </div>
          </div>

          {/* Warranty Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Warranty Information</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="hasWarranty"
                  checked={formData.warranty?.hasWarranty || false}
                  onChange={(e) => handleInputChange('warranty', {
                    ...formData.warranty,
                    hasWarranty: e.target.checked
                  })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="hasWarranty" className="ml-2 block text-sm text-gray-900">
                  Has Warranty
                </label>
              </div>
              
              {formData.warranty?.hasWarranty && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Warranty Period (months)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.warranty?.warrantyPeriod || ''}
                      onChange={(e) => handleInputChange('warranty', {
                        ...formData.warranty,
                        warrantyPeriod: e.target.value ? Number(e.target.value) : undefined
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Warranty Expiry Date
                    </label>
                    <input
                      type="date"
                      value={formData.warranty?.warrantyExpiry || ''}
                      onChange={(e) => handleInputChange('warranty', {
                        ...formData.warranty,
                        warrantyExpiry: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Warranty Notes
                    </label>
                    <textarea
                      value={formData.warranty?.warrantyNotes || ''}
                      onChange={(e) => handleInputChange('warranty', {
                        ...formData.warranty,
                        warrantyNotes: e.target.value
                      })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Warranty terms and conditions..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes about this sale..."
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="border-t pt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Sales Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSalesRecordModal;
