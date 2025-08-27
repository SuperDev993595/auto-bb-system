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
        // Try to find the vehicle that matches the work order vehicle
        const matchingVehicle = response.data.vehicles.find(v => 
          v.make === workOrder?.vehicle.make && 
          v.model === workOrder?.vehicle.model && 
          v.year === workOrder?.vehicle.year
        )
        if (matchingVehicle) {
          setSelectedVehicle(matchingVehicle)
        }
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
      services: prev.services?.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      ) || []
    }))
  }

  const addService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...(prev.services || []), {
        service: '',
        description: '',
        laborHours: 1,
        laborRate: 120,
        parts: [],
        totalCost: 0
      }]
    }))
  }

  const removeService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services?.filter((_, i) => i !== index) || []
    }))
  }

  const handleSubmit = async () => {
    if (!workOrder?._id) {
      toast.error('Work order ID is missing')
      return
    }

    if (!formData.services || formData.services.length === 0) {
      toast.error('Please add at least one service')
      return
    }

    setLoading(true)

    try {
      await dispatch(updateWorkOrder({ id: workOrder._id, data: formData })).unwrap()
      toast.success('Work order updated successfully')
      onSuccess()
      onClose()
    } catch (error: any) {
      console.error('Failed to update work order:', error)
      toast.error(error.message || 'Failed to update work order')
    } finally {
      setLoading(false)
    }
  }

  if (!workOrder) return null

  return (
    <ModalWrapper
      isOpen={true}
      title="Edit Work Order"
      icon={<Edit className="w-5 h-5" />}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitText={loading ? 'Updating...' : 'Update Work Order'}
      submitColor="bg-gradient-to-r from-blue-600 to-indigo-600"
    >
      <div className="space-y-6 p-4">
        {/* Customer and Vehicle Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Customer & Vehicle Information</h3>
          
          {/* Customer Information */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2">Customer</h4>
            <div className="bg-white p-3 rounded border">
              <p className="font-medium">{workOrder.customer.name}</p>
              <p className="text-sm text-gray-600">{workOrder.customer.email}</p>
              <p className="text-sm text-gray-600">{workOrder.customer.phone}</p>
            </div>
          </div>

          {/* Vehicle Information */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Vehicle</h4>
            <div className="bg-white p-3 rounded border">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Make/Model:</span>
                  <p className="font-medium">{workOrder.vehicle.make} {workOrder.vehicle.model}</p>
                </div>
                <div>
                  <span className="text-gray-500">Year:</span>
                  <p className="font-medium">{workOrder.vehicle.year}</p>
                </div>
                {workOrder.vehicle.licensePlate && (
                  <div>
                    <span className="text-gray-500">License Plate:</span>
                    <p className="font-medium">{workOrder.vehicle.licensePlate}</p>
                  </div>
                )}
                {workOrder.vehicle.mileage && (
                  <div>
                    <span className="text-gray-500">Mileage:</span>
                    <p className="font-medium">{workOrder.vehicle.mileage.toLocaleString()} miles</p>
                  </div>
                )}
                {workOrder.vehicle.vin && (
                  <div className="col-span-2">
                    <span className="text-gray-500">VIN:</span>
                    <p className="font-medium font-mono text-xs">{workOrder.vehicle.vin}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Vehicle Selection (if customer has multiple vehicles) */}
          {vehicles.length > 1 && (
            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Select Different Vehicle (Optional)
              </label>
              <select
                onChange={(e) => {
                  const vehicle = vehicles.find(v => v._id === e.target.value)
                  setSelectedVehicle(vehicle || null)
                }}
                className="form-select text-sm"
                defaultValue=""
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
            <div className="mt-4 bg-blue-50 p-3 rounded border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Selected Vehicle Details</h4>
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
              {selectedVehicle.lastServiceDate && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-blue-600">Last Service:</span>
                      <p className="font-medium">{new Date(selectedVehicle.lastServiceDate).toLocaleDateString()}</p>
                    </div>
                    {selectedVehicle.nextServiceDate && (
                      <div>
                        <span className="text-blue-600">Next Service Due:</span>
                        <p className="font-medium">{new Date(selectedVehicle.nextServiceDate).toLocaleDateString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="form-label">
            Services *
          </label>
          <div className="space-y-4">
            {formData.services?.map((service, index) => (
              <div key={index} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium text-gray-700">Service {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeService(index)}
                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600">
                      Service Type
                    </label>
                    <select
                      value={service.service}
                      onChange={(e) => handleServiceChange(index, 'service', e.target.value)}
                      className="form-select text-sm"
                    >
                      <option value="">Select Service</option>
                      {catalog?.map(cat => (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600">
                      Labor Hours
                    </label>
                    <input
                      type="number"
                      value={service.laborHours}
                      onChange={(e) => handleServiceChange(index, 'laborHours', parseFloat(e.target.value))}
                      className="form-input text-sm"
                      min="0.5"
                      step="0.5"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600">
                      Labor Rate ($/hr)
                    </label>
                    <input
                      type="number"
                      value={service.laborRate}
                      onChange={(e) => handleServiceChange(index, 'laborRate', parseFloat(e.target.value))}
                      className="form-input text-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-gray-600">
                      Total Cost
                    </label>
                    <input
                      type="number"
                      value={service.totalCost}
                      onChange={(e) => handleServiceChange(index, 'totalCost', parseFloat(e.target.value))}
                      className="form-input text-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
                
                <div className="mt-3 space-y-1">
                  <label className="block text-xs font-medium text-gray-600">
                    Description
                  </label>
                  <textarea
                    value={service.description}
                    onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                    className="form-textarea text-sm"
                    rows={2}
                    placeholder="Service description..."
                  />
                </div>
                
                <div className="mt-3 space-y-1">
                  <label className="block text-xs font-medium text-gray-600">
                    Parts
                  </label>
                  <PartsEditor
                    parts={service.parts || []}
                    onChange={(parts) => handleServiceChange(index, 'parts', parts)}
                  />
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addService}
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-gray-400 hover:text-gray-800 hover:bg-gray-50 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Service
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="form-label">
            Technician
          </label>
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

        <div className="space-y-2">
          <label className="form-label">
            Priority
          </label>
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

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="form-label">
              Estimated Start Date
            </label>
            <input
              type="datetime-local"
              value={formData.estimatedStartDate}
              onChange={(e) => handleInputChange('estimatedStartDate', e.target.value)}
              className="form-input"
            />
          </div>
          
          <div className="space-y-2">
            <label className="form-label">
              Estimated Completion Date
            </label>
            <input
              type="datetime-local"
              value={formData.estimatedCompletionDate}
              onChange={(e) => handleInputChange('estimatedCompletionDate', e.target.value)}
              className="form-input"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="form-label">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className="form-textarea"
            rows={3}
            placeholder="Internal notes about the work order..."
          />
        </div>

        <div className="space-y-2">
          <label className="form-label">
            Customer Notes
          </label>
          <textarea
            value={formData.customerNotes}
            onChange={(e) => handleInputChange('customerNotes', e.target.value)}
            className="form-textarea"
            rows={3}
            placeholder="Notes visible to the customer..."
          />
        </div>
      </div>
    </ModalWrapper>
  )
}
