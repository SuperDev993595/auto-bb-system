import React, { useState, useEffect } from 'react'
import { WorkOrder, CreateWorkOrderData } from '../../services/services'
import ModalWrapper from '../../utils/ModalWrapper'
import { toast } from 'react-hot-toast'

interface AddWorkOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (workOrder: CreateWorkOrderData) => Promise<void>
}

const AddWorkOrderModal: React.FC<AddWorkOrderModalProps> = ({
  isOpen,
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<CreateWorkOrderData>({
    customer: '',
    vehicle: {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      vin: '',
      licensePlate: '',
      mileage: 0
    },
    services: [{
      service: '',
      description: '',
      laborHours: 0,
      laborRate: 100,
      parts: [],
      totalCost: 0
    }],
    technician: '',
    status: 'pending',
    priority: 'medium',
    estimatedStartDate: '',
    estimatedCompletionDate: '',
    notes: '',
    customerNotes: ''
  })

  const [customers, setCustomers] = useState<any[]>([])
  const [technicians, setTechnicians] = useState<any[]>([])
  const [serviceCatalog, setServiceCatalog] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadFormData()
    }
  }, [isOpen])

  const loadFormData = async () => {
    try {
      // Load customers, technicians, and service catalog
      const [customersRes, techniciansRes, servicesRes] = await Promise.all([
        fetch('/api/customers'),
        fetch('/api/services/technicians'),
        fetch('/api/services/catalog')
      ])

      const customersData = await customersRes.json()
      const techniciansData = await techniciansRes.json()
      const servicesData = await servicesRes.json()

      setCustomers(customersData.data?.customers || [])
      setTechnicians(techniciansData.data?.technicians || [])
      setServiceCatalog(servicesData.data?.services || [])
    } catch (error) {
      console.error('Error loading form data:', error)
      toast.error('Failed to load form data')
    }
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Validate required fields
      if (!formData.customer) {
        throw new Error('Customer is required')
      }
      if (!formData.vehicle.make || !formData.vehicle.model || !formData.vehicle.year) {
        throw new Error('Vehicle make, model, and year are required')
      }
      if (!formData.services.length || !formData.services[0].service) {
        throw new Error('At least one service is required')
      }

      await onSubmit(formData)
      onClose()
      resetForm()
      toast.success('Work order created successfully')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create work order'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      customer: '',
      vehicle: {
        make: '',
        model: '',
        year: new Date().getFullYear(),
        vin: '',
        licensePlate: '',
        mileage: 0
      },
      services: [{
        service: '',
        description: '',
        laborHours: 0,
        laborRate: 100,
        parts: [],
        totalCost: 0
      }],
      technician: '',
      status: 'pending',
      priority: 'medium',
      estimatedStartDate: '',
      estimatedCompletionDate: '',
      notes: '',
      customerNotes: ''
    })
    setError(null)
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleVehicleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      vehicle: {
        ...prev.vehicle,
        [field]: value
      }
    }))
  }

  const handleServiceChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      )
    }))
  }

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, {
        service: '',
        description: '',
        laborHours: 0,
        laborRate: 100,
        parts: [],
        totalCost: 0
      }]
    }))
  }

  const removeService = (index: number) => {
    if (formData.services.length > 1) {
      setFormData(prev => ({
        ...prev,
        services: prev.services.filter((_, i) => i !== index)
      }))
    }
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Work Order"
      submitText={loading ? "Creating..." : "Create Work Order"}
      onSubmit={handleSubmit}
      submitColor="bg-blue-600"
    >
      <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Customer Selection */}
        <div>
          <label className="form-label">Customer *</label>
          <select
            value={formData.customer}
            onChange={(e) => handleChange('customer', e.target.value)}
            className="form-select"
            required
          >
            <option value="">Select Customer</option>
            {customers.map(customer => (
              <option key={customer._id} value={customer._id}>
                {customer.name} - {customer.email}
              </option>
            ))}
          </select>
        </div>

        {/* Vehicle Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Vehicle Make *</label>
            <input
              type="text"
              value={formData.vehicle.make}
              onChange={(e) => handleVehicleChange('make', e.target.value)}
              className="form-input"
              placeholder="e.g., Toyota"
              required
            />
          </div>
          <div>
            <label className="form-label">Vehicle Model *</label>
            <input
              type="text"
              value={formData.vehicle.model}
              onChange={(e) => handleVehicleChange('model', e.target.value)}
              className="form-input"
              placeholder="e.g., Camry"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Year *</label>
            <input
              type="number"
              value={formData.vehicle.year}
              onChange={(e) => handleVehicleChange('year', parseInt(e.target.value))}
              className="form-input"
              min="1900"
              max={new Date().getFullYear() + 1}
              required
            />
          </div>
          <div>
            <label className="form-label">VIN</label>
            <input
              type="text"
              value={formData.vehicle.vin}
              onChange={(e) => handleVehicleChange('vin', e.target.value)}
              className="form-input"
              placeholder="Vehicle Identification Number"
            />
          </div>
          <div>
            <label className="form-label">License Plate</label>
            <input
              type="text"
              value={formData.vehicle.licensePlate}
              onChange={(e) => handleVehicleChange('licensePlate', e.target.value)}
              className="form-input"
              placeholder="License Plate"
            />
          </div>
        </div>

        <div>
          <label className="form-label">Mileage</label>
          <input
            type="number"
            value={formData.vehicle.mileage}
            onChange={(e) => handleVehicleChange('mileage', parseInt(e.target.value) || 0)}
            className="form-input"
            min="0"
            placeholder="Current mileage"
          />
        </div>

        {/* Services */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="form-label">Services *</label>
            <button
              type="button"
              onClick={addService}
              className="btn-secondary text-sm"
            >
              Add Service
            </button>
          </div>
          
          {formData.services.map((service, index) => (
            <div key={index} className="border rounded-lg p-4 mb-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium">Service {index + 1}</h4>
                {formData.services.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Service Type *</label>
                  <select
                    value={service.service}
                    onChange={(e) => handleServiceChange(index, 'service', e.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="">Select Service</option>
                    {serviceCatalog.map(serviceItem => (
                      <option key={serviceItem._id} value={serviceItem._id}>
                        {serviceItem.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    value={service.description}
                    onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                    className="form-input"
                    placeholder="Service description"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="form-label">Labor Hours *</label>
                  <input
                    type="number"
                    value={service.laborHours}
                    onChange={(e) => handleServiceChange(index, 'laborHours', parseFloat(e.target.value) || 0)}
                    className="form-input"
                    min="0"
                    step="0.5"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Labor Rate ($/hr) *</label>
                  <input
                    type="number"
                    value={service.laborRate}
                    onChange={(e) => handleServiceChange(index, 'laborRate', parseFloat(e.target.value) || 0)}
                    className="form-input"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Total Cost *</label>
                  <input
                    type="number"
                    value={service.totalCost}
                    onChange={(e) => handleServiceChange(index, 'totalCost', parseFloat(e.target.value) || 0)}
                    className="form-input"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Work Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Technician</label>
            <select
              value={formData.technician}
              onChange={(e) => handleChange('technician', e.target.value)}
              className="form-select"
            >
              <option value="">Select Technician</option>
              {technicians.map(technician => (
                <option key={technician._id} value={technician._id}>
                  {technician.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => handleChange('priority', e.target.value)}
              className="form-select"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Estimated Start Date</label>
            <input
              type="date"
              value={formData.estimatedStartDate}
              onChange={(e) => handleChange('estimatedStartDate', e.target.value)}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Estimated Completion Date</label>
            <input
              type="date"
              value={formData.estimatedCompletionDate}
              onChange={(e) => handleChange('estimatedCompletionDate', e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <div>
          <label className="form-label">Internal Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            className="form-textarea"
            rows={3}
            placeholder="Internal notes about the work order"
          />
        </div>

        <div>
          <label className="form-label">Customer Notes</label>
          <textarea
            value={formData.customerNotes}
            onChange={(e) => handleChange('customerNotes', e.target.value)}
            className="form-textarea"
            rows={3}
            placeholder="Notes visible to the customer"
          />
        </div>
      </div>
    </ModalWrapper>
  )
}

export default AddWorkOrderModal
