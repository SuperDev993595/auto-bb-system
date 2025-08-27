import React, { useState, useEffect } from 'react'
import { WorkOrder, CreateWorkOrderData } from '../../services/services'
import ModalWrapper from '../../utils/ModalWrapper'
import { toast } from 'react-hot-toast'
import { API_ENDPOINTS, getAuthHeaders } from '../../services/api'

interface AddWorkOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (workOrder: CreateWorkOrderData) => Promise<void>
}

interface Customer {
  _id: string
  name: string
  email: string
  phone: string
}

interface Technician {
  _id: string
  name: string
  email: string
  hourlyRate: number
}

interface ServiceCatalogItem {
  _id: string
  name: string
  description: string
  estimatedDuration: number
  category: string
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
    priority: 'medium',
    estimatedStartDate: '',
    estimatedCompletionDate: '',
    notes: ''
  })

  const [customers, setCustomers] = useState<Customer[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [serviceCatalog, setServiceCatalog] = useState<ServiceCatalogItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Load data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadFormData()
    }
  }, [isOpen])

  const loadFormData = async () => {
    try {
      setLoading(true)
      
      // Load customers, technicians, and service catalog
      const [customersRes, techniciansRes, servicesRes] = await Promise.all([
        fetch(`${API_ENDPOINTS.CUSTOMERS}`, { headers: getAuthHeaders() }),
        fetch(`${API_ENDPOINTS.SERVICES}/technicians`, { headers: getAuthHeaders() }),
        fetch(`${API_ENDPOINTS.SERVICES}/catalog`, { headers: getAuthHeaders() })
      ])

      if (customersRes.ok) {
        const customersData = await customersRes.json()
        setCustomers(customersData.data?.customers || [])
      }

      if (techniciansRes.ok) {
        const techniciansData = await techniciansRes.json()
        setTechnicians(techniciansData.data?.technicians || [])
      }

      if (servicesRes.ok) {
        const servicesData = await servicesRes.json()
        setServiceCatalog(servicesData.data?.services || [])
      }
    } catch (error) {
      console.error('Error loading form data:', error)
      toast.error('Failed to load form data')
    } finally {
      setLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.customer) {
      errors.customer = 'Customer is required'
    }

    if (!formData.vehicle.make) {
      errors.vehicleMake = 'Vehicle make is required'
    }

    if (!formData.vehicle.model) {
      errors.vehicleModel = 'Vehicle model is required'
    }

    if (!formData.vehicle.year || formData.vehicle.year < 1900 || formData.vehicle.year > new Date().getFullYear() + 1) {
      errors.vehicleYear = 'Valid vehicle year is required'
    }

    if (!formData.services.length) {
      errors.services = 'At least one service is required'
    } else {
      formData.services.forEach((service, index) => {
        if (!service.service) {
          errors[`service${index}`] = 'Service type is required'
        }
        if (service.laborHours < 0) {
          errors[`laborHours${index}`] = 'Labor hours cannot be negative'
        }
        if (service.laborRate < 0) {
          errors[`laborRate${index}`] = 'Labor rate cannot be negative'
        }
        if (service.totalCost < 0) {
          errors[`totalCost${index}`] = 'Total cost cannot be negative'
        }
      })
    }

    if (formData.estimatedStartDate && formData.estimatedCompletionDate) {
      const startDate = new Date(formData.estimatedStartDate)
      const completionDate = new Date(formData.estimatedCompletionDate)
      if (completionDate <= startDate) {
        errors.completionDate = 'Completion date must be after start date'
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError(null)
      
      if (!validateForm()) {
        toast.error('Please fix the form errors')
        return
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
      priority: 'medium',
      estimatedStartDate: '',
      estimatedCompletionDate: '',
      notes: ''
    })
    setError(null)
    setFormErrors({})
  }

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleVehicleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      vehicle: {
        ...prev.vehicle,
        [field]: value
      }
    }))
    // Clear error when user starts typing
    if (formErrors[`vehicle${field.charAt(0).toUpperCase() + field.slice(1)}`]) {
      setFormErrors(prev => ({ ...prev, [`vehicle${field.charAt(0).toUpperCase() + field.slice(1)}`]: '' }))
    }
  }

  const handleServiceChange = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      )
    }))
    // Clear error when user starts typing
    if (formErrors[`${field}${index}`]) {
      setFormErrors(prev => ({ ...prev, [`${field}${index}`]: '' }))
    }
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

  const calculateServiceCost = (index: number) => {
    const service = formData.services[index]
    const laborCost = service.laborHours * service.laborRate
    const partsCost = service.parts.reduce((sum, part) => sum + part.totalPrice, 0)
    const totalCost = laborCost + partsCost
    
    handleServiceChange(index, 'totalCost', totalCost)
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Work Order"
      submitText={loading ? "Creating..." : "Create Work Order"}
      onSubmit={handleSubmit}
      submitColor="bg-blue-600"
      size="2xl"
    >
      <div className="p-6 space-y-6">
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
            className={`form-select ${formErrors.customer ? 'border-red-500' : ''}`}
            required
          >
            <option value="">Select Customer</option>
            {customers.map(customer => (
              <option key={customer._id} value={customer._id}>
                {customer.name} - {customer.email}
              </option>
            ))}
          </select>
          {formErrors.customer && (
            <p className="text-red-500 text-sm mt-1">{formErrors.customer}</p>
          )}
        </div>

        {/* Vehicle Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Vehicle Information</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Vehicle Make *</label>
              <input
                type="text"
                value={formData.vehicle.make}
                onChange={(e) => handleVehicleChange('make', e.target.value)}
                className={`form-input ${formErrors.vehicleMake ? 'border-red-500' : ''}`}
                placeholder="e.g., Toyota"
                required
              />
              {formErrors.vehicleMake && (
                <p className="text-red-500 text-sm mt-1">{formErrors.vehicleMake}</p>
              )}
            </div>
            <div>
              <label className="form-label">Vehicle Model *</label>
              <input
                type="text"
                value={formData.vehicle.model}
                onChange={(e) => handleVehicleChange('model', e.target.value)}
                className={`form-input ${formErrors.vehicleModel ? 'border-red-500' : ''}`}
                placeholder="e.g., Camry"
                required
              />
              {formErrors.vehicleModel && (
                <p className="text-red-500 text-sm mt-1">{formErrors.vehicleModel}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
            <div>
              <label className="form-label">Year *</label>
              <input
                type="number"
                value={formData.vehicle.year}
                onChange={(e) => handleVehicleChange('year', parseInt(e.target.value))}
                className={`form-input ${formErrors.vehicleYear ? 'border-red-500' : ''}`}
                min="1900"
                max={new Date().getFullYear() + 1}
                required
              />
              {formErrors.vehicleYear && (
                <p className="text-red-500 text-sm mt-1">{formErrors.vehicleYear}</p>
              )}
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
          </div>


        </div>

        {/* Services */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Services *</h3>
            <button
              type="button"
              onClick={addService}
              className="btn-secondary text-sm"
            >
              Add Service
            </button>
          </div>
          
          {formData.services.map((service, index) => (
            <div key={index} className="border rounded-lg p-4 mb-4 bg-white">
              <div className="flex justify-between items-center mb-3">
                <h6 className="font-medium">Service {index + 1}</h6>
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
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Service Type *</label>
                  <select
                    value={service.service}
                    onChange={(e) => handleServiceChange(index, 'service', e.target.value)}
                    className={`form-select ${formErrors[`service${index}`] ? 'border-red-500' : ''}`}
                    required
                  >
                    <option value="">Select Service</option>
                    {serviceCatalog.map(serviceItem => (
                      <option key={serviceItem._id} value={serviceItem._id}>
                        {serviceItem.name}
                      </option>
                    ))}
                  </select>
                  {formErrors[`service${index}`] && (
                    <p className="text-red-500 text-sm mt-1">{formErrors[`service${index}`]}</p>
                  )}
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
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
                <div>
                  <label className="form-label">Labor Hours *</label>
                  <input
                    type="number"
                    value={service.laborHours}
                    onChange={(e) => {
                      handleServiceChange(index, 'laborHours', parseFloat(e.target.value) || 0)
                      calculateServiceCost(index)
                    }}
                    className={`form-input ${formErrors[`laborHours${index}`] ? 'border-red-500' : ''}`}
                    min="0"
                    step="0.5"
                    required
                  />
                  {formErrors[`laborHours${index}`] && (
                    <p className="text-red-500 text-sm mt-1">{formErrors[`laborHours${index}`]}</p>
                  )}
                </div>
                <div>
                  <label className="form-label">Labor Rate ($/hr) *</label>
                  <input
                    type="number"
                    value={service.laborRate}
                    onChange={(e) => {
                      handleServiceChange(index, 'laborRate', parseFloat(e.target.value) || 0)
                      calculateServiceCost(index)
                    }}
                    className={`form-input ${formErrors[`laborRate${index}`] ? 'border-red-500' : ''}`}
                    min="0"
                    step="0.01"
                    required
                  />
                  {formErrors[`laborRate${index}`] && (
                    <p className="text-red-500 text-sm mt-1">{formErrors[`laborRate${index}`]}</p>
                  )}
                </div>
                                 <div>
                   <label className="form-label">Total Cost *</label>
                   <input
                     type="number"
                     value={service.totalCost}
                     onChange={(e) => handleServiceChange(index, 'totalCost', parseFloat(e.target.value) || 0)}
                     className={`form-input ${formErrors[`totalCost${index}`] ? 'border-red-500' : ''}`}
                     min="0"
                     step="0.01"
                     required
                   />
                   {formErrors[`totalCost${index}`] && (
                     <p className="text-red-500 text-sm mt-1">{formErrors[`totalCost${index}`]}</p>
                   )}
                 </div>
                 <div>
                   <label className="form-label">Parts Count</label>
                   <input
                     type="number"
                     value={service.parts.length}
                     className="form-input bg-gray-50"
                     disabled
                     placeholder="0"
                   />
                 </div>
              </div>
            </div>
          ))}
        </div>

        {/* Work Order Details */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Work Order Details</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                    {technician.name} - ${technician.hourlyRate}/hr
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
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
                className={`form-input ${formErrors.completionDate ? 'border-red-500' : ''}`}
              />
              {formErrors.completionDate && (
                <p className="text-red-500 text-sm mt-1">{formErrors.completionDate}</p>
              )}
            </div>
          </div>

          <div className="mt-4">
            <label className="form-label">Internal Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="form-textarea"
              rows={3}
              placeholder="Internal notes about the work order"
            />
          </div>


        </div>
      </div>
    </ModalWrapper>
  )
}

export default AddWorkOrderModal
