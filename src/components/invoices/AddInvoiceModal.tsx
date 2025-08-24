import { useState, useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../../redux'
import { createInvoice } from '../../redux/actions/invoices'
import { fetchCustomers } from '../../redux/actions/customers'
import { fetchWorkOrders, fetchServiceCatalog } from '../../redux/actions/services'
import { fetchVehicles } from '../../redux/actions/vehicles'
import { CreateInvoiceData } from '../../services/invoices'
import ModalWrapper from '../../utils/ModalWrapper'
import {
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
    <ModalWrapper
      isOpen={true}
      onClose={onClose}
      title="Create New Invoice"
      submitText="Create Invoice"
      onSubmit={handleSubmit}
      isLoading={loading}
    >
      <div className="p-4 space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Customer and Invoice Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">
              <HiUser className="w-4 h-4 inline mr-2" />
              Customer
            </label>
            <select
              value={formData.customerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="form-select"
              required
            >
              <option value="">Select Customer</option>
              {(customers && Array.isArray(customers) ? customers : []).map(customer => (
                <option key={customer._id} value={customer._id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">
              <HiDocumentText className="w-4 h-4 inline mr-2" />
              Invoice Number
            </label>
            <input
              type="text"
              value={formData.invoiceNumber}
              onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
              className="form-input"
              placeholder="Auto-generated"
            />
          </div>
        </div>

        {/* Vehicle and Service Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">
              <HiCalendar className="w-4 h-4 inline mr-2" />
              Vehicle
            </label>
            <select
              value={formData.vehicleId}
              onChange={(e) => handleInputChange('vehicleId', e.target.value)}
              className="form-select"
              required
              disabled={!formData.customerId}
            >
              <option value="">Select Vehicle</option>
              {customerVehicles.map(vehicle => (
                <option key={vehicle._id} value={vehicle._id}>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">
              <HiDocumentText className="w-4 h-4 inline mr-2" />
              Service Type
            </label>
            <input
              type="text"
              value={formData.serviceType}
              onChange={(e) => handleInputChange('serviceType', e.target.value)}
              className="form-input"
              placeholder="e.g., Oil Change, Brake Service"
              required
            />
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="form-label">
            <HiCalendar className="w-4 h-4 inline mr-2" />
            Due Date
          </label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleInputChange('dueDate', e.target.value)}
            className="form-input"
          />
        </div>

        {/* Invoice Items */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-secondary-900">Invoice Items</h4>
            <button
              type="button"
              onClick={addItem}
              className="btn-secondary btn-sm"
            >
              <HiPlus className="w-4 h-4 mr-1" />
              Add Item
            </button>
          </div>

          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-end p-4 border border-secondary-200 rounded-lg">
                <div className="col-span-5">
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                    className="form-input"
                    placeholder="Item description"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="form-label">Qty</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                    className="form-input"
                    min="1"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="form-label">Unit Price</label>
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="form-input"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="form-label">Total</label>
                  <input
                    type="number"
                    value={item.total}
                    className="form-input bg-secondary-50"
                    readOnly
                  />
                </div>
                <div className="col-span-1">
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="btn-error btn-sm"
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
          <div className="flex justify-between items-center mb-2">
            <span className="text-secondary-600">Subtotal:</span>
            <span className="font-medium">${formData.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-secondary-600">Tax:</span>
            <input
              type="number"
              value={formData.tax}
              onChange={(e) => handleInputChange('tax', parseFloat(e.target.value) || 0)}
              className="form-input w-24 text-right"
              min="0"
              step="0.01"
            />
          </div>
          <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
            <span>Total:</span>
            <span>${formData.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="form-label">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className="form-textarea"
            rows={3}
            placeholder="Additional notes for the invoice..."
          />
        </div>
      </div>
    </ModalWrapper>
  )
}
