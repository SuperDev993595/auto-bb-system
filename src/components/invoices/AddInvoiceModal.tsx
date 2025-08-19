import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../redux'
import { createInvoice } from '../../redux/actions/invoices'
import { fetchCustomers } from '../../redux/actions/customers'
import { fetchWorkOrders, fetchServiceCatalog } from '../../redux/actions/services'
import { fetchVehicles } from '../../redux/actions/vehicles'
import { CreateInvoiceData } from '../../services/invoices'
import {
  HiX,
  HiUser,
  HiDocumentText,
  HiCurrencyDollar,
  HiCalendar,
  HiPlus,
  HiTrash
} from 'react-icons/hi'

interface AddInvoiceModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function AddInvoiceModal({ onClose, onSuccess }: AddInvoiceModalProps) {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const customers = useAppSelector(state => state.customers.list)
  const workOrders = useAppSelector(state => state.services.workOrders)
  const serviceCatalog = useAppSelector(state => state.services.catalog)
  const serviceCatalogLoading = useAppSelector(state => state.services.catalogLoading)
  const vehicles = useAppSelector(state => state.vehicles.list)
  const vehiclesLoading = useAppSelector(state => state.vehicles.loading)
  
  const [formData, setFormData] = useState<CreateInvoiceData>({
    customerId: '',
    invoiceNumber: '',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    vehicleId: '', // Required by backend
    serviceType: '', // Required by backend
    items: [
      {
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0
      }
    ],
    subtotal: 0,
    tax: 0, // Changed from taxAmount
    total: 0, // Changed from totalAmount
    notes: ''
  })

  // Filter vehicles for the selected customer
  const customerVehicles = vehicles.filter(vehicle => 
    vehicle.customer?._id === formData.customerId
  )
  


  useEffect(() => {
    dispatch(fetchCustomers())
    dispatch(fetchWorkOrders({}))
    dispatch(fetchServiceCatalog({}))
    dispatch(fetchVehicles({}))
  }, [dispatch])

  const handleInputChange = (field: keyof CreateInvoiceData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items]
    newItems[index] = { ...newItems[index], [field]: value }
    
    // Calculate total for this item
    if (field === 'quantity' || field === 'unitPrice') {
      const item = newItems[index]
      newItems[index] = { ...item, total: item.quantity * item.unitPrice }
    }
    
    setFormData(prev => ({
      ...prev,
      items: newItems,
      subtotal: newItems.reduce((sum, item) => sum + item.total, 0),
      total: newItems.reduce((sum, item) => sum + item.total, 0) + formData.tax
    }))
  }

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, {
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0
      }]
    }))
  }

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        items: newItems,
        subtotal: newItems.reduce((sum, item) => sum + item.total, 0),
        total: newItems.reduce((sum, item) => sum + item.total, 0) + formData.tax
      }))
    }
  }

  const handleCustomerChange = (customerId: string) => {
    setFormData(prev => ({
      ...prev,
      customerId,
      vehicleId: '' // Reset vehicle selection when customer changes
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.customerId) {
      setError('Please select a customer')
      return
    }

    if (formData.items.some(item => !item.description || item.unitPrice <= 0)) {
      setError('Please fill in all item details')
      return
    }

    if (!formData.serviceType) {
      setError('Please enter a service type')
      return
    }

    if (!formData.vehicleId) {
      setError('Please select a vehicle')
      return
    }



    setLoading(true)
    setError('')

    try {
      await dispatch(createInvoice(formData)).unwrap()
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to create invoice')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Create New Invoice</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <HiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

                     {/* Customer and Invoice Details */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 <HiUser className="w-4 h-4 inline mr-2" />
                 Customer
               </label>
               <select
                 value={formData.customerId}
                 onChange={(e) => handleCustomerChange(e.target.value)}
                 className="w-full border border-gray-300 rounded-lg px-3 py-2"
                 required
               >
                 <option value="">Select Customer</option>
                 {customers.map(customer => (
                   <option key={customer._id} value={customer._id}>
                     {customer.name}
                   </option>
                 ))}
               </select>
             </div>

             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 <HiDocumentText className="w-4 h-4 inline mr-2" />
                 Invoice Number
               </label>
               <input
                 type="text"
                 value={formData.invoiceNumber}
                 onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                 className="w-full border border-gray-300 rounded-lg px-3 py-2"
                 placeholder="INV-001"
                 required
               />
             </div>
           </div>

           {/* Service Type and Vehicle */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Service Type
              </label>
                                            <select
                 value={formData.serviceType}
                 onChange={(e) => handleInputChange('serviceType', e.target.value)}
                 className="w-full border border-gray-300 rounded-lg px-3 py-2"
                 required
                 disabled={serviceCatalogLoading}
               >
                 <option value="">
                   {serviceCatalogLoading ? 'Loading services...' : 'Select Service Type'}
                 </option>
                 {serviceCatalog.map(service => (
                   <option key={service._id} value={service.name}>
                     {service.name}
                   </option>
                 ))}
                 <option value="Other">Other</option>
               </select>
            </div>

                           <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vehicle
                </label>
                <select
                  value={formData.vehicleId}
                  onChange={(e) => handleInputChange('vehicleId', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                  disabled={vehiclesLoading || !formData.customerId}
                >
                  <option value="">
                    {vehiclesLoading ? 'Loading vehicles...' : 
                     !formData.customerId ? 'Select a customer first' :
                     customerVehicles.length === 0 ? 'No vehicles found for this customer' :
                     'Select Vehicle'}
                  </option>
                  {customerVehicles.map(vehicle => (
                    <option key={vehicle._id} value={vehicle._id}>
                      {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                    </option>
                  ))}
                </select>
              </div>
           </div>

          {/* Invoice Items */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-md font-medium">Invoice Items</h4>
              <button
                type="button"
                onClick={addItem}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
              >
                <HiPlus className="w-4 h-4" />
                Add Item
              </button>
            </div>

            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      min="1"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Price"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                                     <div className="col-span-2">
                     <input
                       type="number"
                       value={(item.quantity * item.unitPrice).toFixed(2)}
                       className="w-full border border-gray-300 rounded px-3 py-2 text-sm bg-gray-50"
                       readOnly
                     />
                   </div>
                  <div className="col-span-1">
                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="border-t pt-4">
            <div className="flex justify-end space-y-2">
              <div className="w-64 space-y-2">
                                 <div className="flex justify-between">
                   <span className="text-sm text-gray-600">Subtotal:</span>
                   <span className="text-sm font-medium">${formData.subtotal.toFixed(2)}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-sm text-gray-600">Tax:</span>
                   <input
                     type="number"
                     value={formData.tax}
                     onChange={(e) => {
                       const tax = parseFloat(e.target.value) || 0
                       handleInputChange('tax', tax)
                       handleInputChange('total', formData.subtotal + tax)
                     }}
                     className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                     step="0.01"
                     min="0"
                   />
                 </div>
                 <div className="flex justify-between border-t pt-2">
                   <span className="text-sm font-medium">Total:</span>
                   <span className="text-sm font-bold">${formData.total.toFixed(2)}</span>
                 </div>
              </div>
            </div>
          </div>

                     {/* Due Date and Notes */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 <HiCalendar className="w-4 h-4 inline mr-2" />
                 Due Date
               </label>
               <input
                 type="date"
                 value={formData.dueDate}
                 onChange={(e) => handleInputChange('dueDate', e.target.value)}
                 className="w-full border border-gray-300 rounded-lg px-3 py-2"
                 required
               />
             </div>
           </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
