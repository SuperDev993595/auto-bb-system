import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import ModalWrapper from '../../utils/ModalWrapper'
import PartsEditor from './PartsEditor'
import { Edit, Plus, Trash2 } from '../../utils/icons'
import { updateWorkOrder } from '../../redux/actions/services'
import { useAppDispatch, useAppSelector } from '../../redux'
import { WorkOrder, UpdateWorkOrderData } from '../../services/services'
import { customerService } from '../../services/customers'

interface Props {
  workOrder: WorkOrder | null
  onClose: () => void
  onSuccess: () => void
}

interface Vehicle {
  _id: string
  id: string
  year: number
  make: string
  model: string
  vin: string
  licensePlate: string
  color: string
  mileage: number
  status: string
  fuelType: string
  transmission: string
  lastServiceDate?: string
  nextServiceDate?: string
  createdAt: string
  updatedAt: string
}

export default function EditWorkOrderModal({ workOrder, onClose, onSuccess }: Props) {
  const dispatch = useAppDispatch()
  const { catalog, technicians } = useAppSelector(state => state.services)
  const { list: customers } = useAppSelector(state => state.customers)
  
  const [loading, setLoading] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [formData, setFormData] = useState<UpdateWorkOrderData>({
    services: [],
    technicianId: '',
    priority: 'medium',
    estimatedStartDate: '',
    estimatedCompletionDate: '',
    actualStartDate: '',
    actualCompletionDate: '',
    notes: '',
    customerNotes: ''
  })

  useEffect(() => {
    if (workOrder) {
      setFormData({
        services: workOrder.services.map(service => ({
          service: service.service._id,
          description: service.description || '',
          laborHours: service.laborHours,
          laborRate: service.laborRate,
          parts: service.parts || [],
          totalCost: service.totalCost
        })),
        technicianId: workOrder.technician?._id || '',
        priority: workOrder.priority,
        estimatedStartDate: workOrder.estimatedStartDate || '',
        estimatedCompletionDate: workOrder.estimatedCompletionDate || '',
        actualStartDate: workOrder.actualStartDate || '',
        actualCompletionDate: workOrder.actualCompletionDate || '',
        notes: workOrder.notes || '',
        customerNotes: workOrder.customerNotes || ''
      })

      // Load vehicles for this customer
      if (workOrder.customer._id) {
        loadVehiclesByCustomer(workOrder.customer._id)
      }
    }
  }, [workOrder])

  const loadVehiclesByCustomer = async (customerId: string) => {
    try {
      const response = await customerService.getVehiclesByCustomerId(customerId)
      if (response.success) {
        setVehicles(response.data.vehicles)
        // Don't automatically set selectedVehicle - let user choose if they want to change
      }
    } catch (error) {
      console.error('Error loading vehicles:', error)
      toast.error('Failed to load customer vehicles')
    }
  }

  const handleInputChange = (field: keyof UpdateWorkOrderData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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

  const calculateServiceCost = (index: number) => {
    const service = formData.services[index]
    const laborCost = service.laborHours * service.laborRate
    const partsCost = service.parts.reduce((sum, part) => sum + part.totalPrice, 0)
    const totalCost = laborCost + partsCost
    
    handleServiceChange(index, 'totalCost', totalCost)
  }

  const handleSubmit = async () => {
    if (!workOrder) return

    setLoading(true)
    try {
      await dispatch(updateWorkOrder(workOrder._id, formData))
      toast.success('Work order updated successfully')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error updating work order:', error)
      toast.error('Failed to update work order')
    } finally {
      setLoading(false)
    }
  }

  if (!workOrder) return null

  return (
    <ModalWrapper
      isOpen={true}
      onClose={onClose}
      title="Edit Work Order"
      submitText={loading ? "Updating..." : "Update Work Order"}
      onSubmit={handleSubmit}
      submitColor="bg-blue-600"
      size="2xl"
    >
      <div className="p-6 space-y-6">
        {/* Customer and Current Vehicle Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Customer & Current Vehicle</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <span className="text-gray-500 text-sm">Customer:</span>
              <p className="font-medium">{workOrder.customer.name}</p>
              <p className="text-sm text-gray-600">{workOrder.customer.email}</p>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Phone:</span>
              <p className="font-medium">{workOrder.customer.phone}</p>
            </div>
          </div>

          <div className="p-4 bg-white rounded border">
            <h4 className="font-medium text-gray-900 mb-3">Current Vehicle</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Make/Model:</span>
                <p className="font-medium">{workOrder.vehicle.make} {workOrder.vehicle.model}</p>
              </div>
              <div>
                <span className="text-gray-500">Year:</span>
                <p className="font-medium">{workOrder.vehicle.year}</p>
              </div>
              <div>
                <span className="text-gray-500">Color:</span>
                <p className="font-medium">{(workOrder.vehicle as any).color || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">License Plate:</span>
                <p className="font-medium">{workOrder.vehicle.licensePlate || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">VIN:</span>
                <p className="font-medium font-mono text-xs">{workOrder.vehicle.vin || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-500">Mileage:</span>
                <p className="font-medium">{workOrder.vehicle.mileage ? workOrder.vehicle.mileage.toLocaleString() : 'N/A'} miles</p>
              </div>
            </div>
          </div>

          {/* Vehicle Selection (if customer has multiple vehicles) */}
          {vehicles.length > 1 && (
            <div className="mt-4">
              <label className="form-label">Select Different Vehicle (Optional)</label>
              <select
                value={selectedVehicle?._id || ""}
                onChange={(e) => {
                  const vehicle = vehicles.find(v => v._id === e.target.value)
                  setSelectedVehicle(vehicle || null)
                }}
                className="form-select"
              >
                <option value="">Keep current vehicle</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Selected Vehicle Details (if different from work order vehicle) */}
          {selectedVehicle && (
            <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-3">Selected Vehicle Details</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-600">Make/Model:</span>
                  <p className="font-medium">{selectedVehicle.make} {selectedVehicle.model}</p>
                </div>
                <div>
                  <span className="text-blue-600">Year:</span>
                  <p className="font-medium">{selectedVehicle.year}</p>
                </div>
                <div>
                  <span className="text-blue-600">Color:</span>
                  <p className="font-medium">{selectedVehicle.color}</p>
                </div>
                <div>
                  <span className="text-blue-600">License Plate:</span>
                  <p className="font-medium">{selectedVehicle.licensePlate}</p>
                </div>
                <div>
                  <span className="text-blue-600">VIN:</span>
                  <p className="font-medium font-mono text-xs">{selectedVehicle.vin}</p>
                </div>
                <div>
                  <span className="text-blue-600">Mileage:</span>
                  <p className="font-medium">{selectedVehicle.mileage.toLocaleString()} miles</p>
                </div>
                <div>
                  <span className="text-blue-600">Fuel Type:</span>
                  <p className="font-medium capitalize">{selectedVehicle.fuelType}</p>
                </div>
                <div>
                  <span className="text-blue-600">Transmission:</span>
                  <p className="font-medium capitalize">{selectedVehicle.transmission}</p>
                </div>
              </div>
            </div>
          )}
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
          
          {formData.services?.map((service, index) => (
            <div key={index} className="border rounded-lg p-4 mb-4 bg-white">
              <div className="flex justify-between items-center mb-3">
                <h6 className="font-medium">Service {index + 1}</h6>
                {formData.services && formData.services.length > 1 && (
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
                    className="form-select"
                    required
                  >
                    <option value="">Select Service</option>
                    {catalog?.map(cat => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
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
                    onChange={(e) => {
                      handleServiceChange(index, 'laborRate', parseFloat(e.target.value) || 0)
                      calculateServiceCost(index)
                    }}
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
                <div className="lg:col-span-2">
                  <label className="form-label">Parts</label>
                  <PartsEditor
                    parts={service.parts || []}
                    onChange={(parts) => handleServiceChange(index, 'parts', parts)}
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
                value={formData.technicianId}
                onChange={(e) => handleInputChange('technicianId', e.target.value)}
                className="form-select"
              >
                <option value="">Select Technician</option>
                {technicians?.filter(tech => tech.isActive).map(technician => (
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
                onChange={(e) => handleInputChange('priority', e.target.value)}
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
                type="datetime-local"
                value={formData.estimatedStartDate}
                onChange={(e) => handleInputChange('estimatedStartDate', e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Estimated Completion Date</label>
              <input
                type="datetime-local"
                value={formData.estimatedCompletionDate}
                onChange={(e) => handleInputChange('estimatedCompletionDate', e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="form-label">Actual Start Date</label>
              <input
                type="datetime-local"
                value={formData.actualStartDate}
                onChange={(e) => handleInputChange('actualStartDate', e.target.value)}
                className="form-input"
              />
            </div>
            <div>
              <label className="form-label">Actual Completion Date</label>
              <input
                type="datetime-local"
                value={formData.actualCompletionDate}
                onChange={(e) => handleInputChange('actualCompletionDate', e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="form-label">Internal Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="form-textarea"
              rows={3}
              placeholder="Internal notes about the work order"
            />
          </div>

          <div className="mt-4">
            <label className="form-label">Customer Notes</label>
            <textarea
              value={formData.customerNotes}
              onChange={(e) => handleInputChange('customerNotes', e.target.value)}
              className="form-textarea"
              rows={3}
              placeholder="Notes visible to the customer"
            />
          </div>
        </div>
      </div>
    </ModalWrapper>
  )
}
