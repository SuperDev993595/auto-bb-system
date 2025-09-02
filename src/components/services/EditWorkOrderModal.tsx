import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import ModalWrapper from '../../utils/ModalWrapper'
import PartsEditor from './PartsEditor'
import { Edit, Plus, Trash2 } from '../../utils/icons'
import { updateWorkOrder } from '../../redux/actions/services'
import { useAppDispatch, useAppSelector } from '../../redux'
import { WorkOrder, UpdateWorkOrderData } from '../../services/services'
import { customerService } from '../../services/customers'
import { fetchCustomers } from '../../redux/actions/customers'
import { fetchServiceCatalog, fetchTechnicians } from '../../redux/actions/services'
import { useAuth } from '../../context/AuthContext'

// Utility function to format date for datetime-local input
const formatDateForInput = (dateString: string | undefined): string => {
  if (!dateString) return ''
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''
    
    // Format as YYYY-MM-DDTHH:MM for datetime-local input
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day}T${hours}:${minutes}`
  } catch (error) {
    console.error('Error formatting date:', error)
    return ''
  }
}

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
  const { list: customers, loading: customersLoading, error: customersError } = useAppSelector(state => state.customers)
  const { user, isAnyAdmin } = useAuth()
  
  // Debug logging
  useEffect(() => {
    console.log('EditWorkOrderModal: customers state:', { customers, customersLoading, customersError })
    console.log('EditWorkOrderModal: services state:', { catalog, technicians })
    console.log('EditWorkOrderModal: user:', user)
    console.log('EditWorkOrderModal: user role:', user?.role, 'isAnyAdmin:', isAnyAdmin())
    
    // Debug specific data for dropdowns
    if (catalog && catalog.length > 0) {
      console.log('EditWorkOrderModal: Service catalog items:', catalog.map(cat => ({ id: cat._id, name: cat.name })))
    }
    if (technicians && technicians.length > 0) {
      console.log('EditWorkOrderModal: Technician items:', technicians.map(tech => ({ id: tech._id, name: tech.name, isActive: tech.isActive })))
    }
  }, [customers, customersLoading, customersError, catalog, technicians, user, user?.role, isAnyAdmin])
  
  const [loading, setLoading] = useState(false)
  const [formDataLoaded, setFormDataLoaded] = useState(false)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('')
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('')
  const [formData, setFormData] = useState<UpdateWorkOrderData>({
    services: [],
    technicianId: '',
    priority: 'medium',
    estimatedStartDate: '',
    estimatedCompletionDate: '',
    notes: ''
  })

  // Debug form data changes
  useEffect(() => {
    console.log('EditWorkOrderModal: formData changed:', formData)
    console.log('EditWorkOrderModal: selectedCustomerId:', selectedCustomerId)
    console.log('EditWorkOrderModal: selectedVehicleId:', selectedVehicleId)
    console.log('EditWorkOrderModal: formDataLoaded:', formDataLoaded)
    
    // Debug specific dropdown values
    if (formDataLoaded) {
      console.log('EditWorkOrderModal: Dropdown values when loaded:')
      console.log('  - Customer ID:', selectedCustomerId)
      console.log('  - Vehicle ID:', selectedVehicleId)
      console.log('  - Technician ID:', formData.technicianId)
      console.log('  - Services:', formData.services?.map(s => ({ service: s.service, description: s.description })))
    }
  }, [formData, selectedCustomerId, selectedVehicleId, formDataLoaded])

  // Debug vehicles state
  useEffect(() => {
    console.log('EditWorkOrderModal: vehicles state changed:', vehicles)
    console.log('EditWorkOrderModal: vehicles.length:', vehicles.length)
    console.log('EditWorkOrderModal: selectedCustomerId for vehicle check:', selectedCustomerId)
  }, [vehicles, selectedCustomerId])

  // Monitor catalog changes and trigger service matching
  useEffect(() => {
    if (catalog && catalog.length > 0 && workOrder && formDataLoaded) {
      console.log('EditWorkOrderModal: Catalog loaded, triggering service matching')
      matchServiceTypes(catalog)
    }
  }, [catalog, workOrder, formDataLoaded])

  // Debug Redux state changes
  useEffect(() => {
    console.log('EditWorkOrderModal: Redux state changed - catalog:', catalog)
    console.log('EditWorkOrderModal: Redux state changed - technicians:', technicians)
    console.log('EditWorkOrderModal: Redux state changed - catalog length:', catalog?.length)
    console.log('EditWorkOrderModal: Redux state changed - technicians length:', technicians?.length)
  }, [catalog, technicians])

  useEffect(() => {
    // Only load customers if user has admin access
    if (isAnyAdmin()) {
      console.log('EditWorkOrderModal: Dispatching fetchCustomers')
      dispatch(fetchCustomers({ page: 1, limit: 100 }))
        .unwrap()
        .then((result) => {
          console.log('EditWorkOrderModal: fetchCustomers success:', result)
        })
        .catch((error) => {
          console.error('EditWorkOrderModal: fetchCustomers error:', error)
        })
    } else {
      console.log('EditWorkOrderModal: User does not have admin access, skipping customers fetch')
    }
  }, [dispatch, isAnyAdmin])

  // Load service catalog and technicians
  useEffect(() => {
    console.log('EditWorkOrderModal: Loading service catalog and technicians')
    // These should be loaded regardless of admin status since they're needed for the form
    dispatch(fetchServiceCatalog({ page: 1, limit: 100 }))
      .unwrap()
      .then((result) => {
        console.log('EditWorkOrderModal: fetchServiceCatalog success:', result)
        console.log('EditWorkOrderModal: fetchServiceCatalog result structure:', result)
        // After catalog loads, try to match service types
        if (workOrder) {
          matchServiceTypes(result)
        }
      })
      .catch((error) => {
        console.error('EditWorkOrderModal: fetchServiceCatalog error:', error)
      })
    
    dispatch(fetchTechnicians({ page: 1, limit: 100 }))
      .unwrap()
      .then((result) => {
        console.log('EditWorkOrderModal: fetchTechnicians success:', result)
      })
      .catch((error) => {
        console.error('EditWorkOrderModal: fetchTechnicians error:', error)
      })
  }, [dispatch, workOrder])

  useEffect(() => {
    if (workOrder) {
      console.log('EditWorkOrderModal: Setting form data from work order:', workOrder)
      console.log('EditWorkOrderModal: workOrder.services:', workOrder.services)
      console.log('EditWorkOrderModal: workOrder.technician:', workOrder.technician)
      console.log('EditWorkOrderModal: workOrder.customer:', workOrder.customer)
      console.log('EditWorkOrderModal: workOrder.vehicle:', workOrder.vehicle)
      console.log('EditWorkOrderModal: workOrder.vehicle._id:', (workOrder.vehicle as any)?._id)
      console.log('EditWorkOrderModal: workOrder.vehicle.id:', (workOrder.vehicle as any)?.id)
      console.log('EditWorkOrderModal: workOrder.vehicle.keys:', workOrder.vehicle ? Object.keys(workOrder.vehicle) : 'No vehicle')
      
      // Debug date fields
      console.log('EditWorkOrderModal: workOrder.estimatedStartDate:', workOrder.estimatedStartDate)
      console.log('EditWorkOrderModal: workOrder.estimatedCompletionDate:', workOrder.estimatedCompletionDate)
      console.log('EditWorkOrderModal: Formatted estimatedStartDate:', formatDateForInput(workOrder.estimatedStartDate))
      console.log('EditWorkOrderModal: Formatted estimatedCompletionDate:', formatDateForInput(workOrder.estimatedCompletionDate))
      
      setFormData({
        services: workOrder.services.map(service => ({
          service: '', // We'll set this after the catalog loads
          description: service.description || '',
          laborHours: service.laborHours || 0,
          laborRate: service.laborRate || 100,
          parts: service.parts || [],
          totalCost: service.totalCost || 0
        })),
        technicianId: workOrder.technician?._id || '',
        priority: workOrder.priority || 'medium',
        estimatedStartDate: formatDateForInput(workOrder.estimatedStartDate),
        estimatedCompletionDate: formatDateForInput(workOrder.estimatedCompletionDate),
        notes: workOrder.notes || ''
      })

      // Initialize selected customer and vehicle
      setSelectedCustomerId(workOrder.customer._id || '')
      
      // We can't get vehicle ID directly from workOrder since it only has vehicle details
      // We'll need to find the vehicle ID after loading the customer's vehicles
      setSelectedVehicleId('')

      console.log('EditWorkOrderModal: Set selectedCustomerId:', workOrder.customer._id)
      console.log('EditWorkOrderModal: Set selectedVehicleId: (will be set after vehicles load)')
      console.log('EditWorkOrderModal: workOrder.vehicle details:', workOrder.vehicle)

      // Load vehicles for this customer
      if (workOrder.customer._id) {
        loadVehiclesByCustomer(workOrder.customer._id)
      }
      
      // Mark form data as loaded
      setFormDataLoaded(true)
    }
  }, [workOrder])

  const loadVehiclesByCustomer = async (customerId: string) => {
    try {
      console.log('EditWorkOrderModal: Loading vehicles for customer:', customerId)
      const response = await customerService.getVehiclesByCustomerId(customerId)
      console.log('EditWorkOrderModal: Vehicle loading response:', response)
      if (response.success) {
        console.log('EditWorkOrderModal: Setting vehicles:', response.data.vehicles)
        setVehicles(response.data.vehicles)
        
        // After vehicles are loaded, try to find the matching vehicle from workOrder
        if (workOrder && workOrder.vehicle) {
          const matchingVehicle = response.data.vehicles.find(vehicle => 
            vehicle.make === workOrder.vehicle.make &&
            vehicle.model === workOrder.vehicle.model &&
            vehicle.year === workOrder.vehicle.year
          )
          
          if (matchingVehicle) {
            console.log('EditWorkOrderModal: Found matching vehicle:', matchingVehicle)
            setSelectedVehicleId(matchingVehicle._id)
            setSelectedVehicle(matchingVehicle)
          } else {
            console.log('EditWorkOrderModal: No matching vehicle found for:', workOrder.vehicle)
          }
        }
      } else {
        console.error('EditWorkOrderModal: Vehicle loading failed:', response)
      }
    } catch (error) {
      console.error('EditWorkOrderModal: Error loading vehicles:', error)
      toast.error('Failed to load customer vehicles')
    }
  }

  const matchServiceTypes = (catalogData: any) => {
    if (!workOrder || !catalogData) return
    
    console.log('EditWorkOrderModal: Matching service types with catalog:', catalogData)
    console.log('EditWorkOrderModal: catalogData type:', typeof catalogData)
    console.log('EditWorkOrderModal: catalogData keys:', catalogData ? Object.keys(catalogData) : 'No data')
    console.log('EditWorkOrderModal: workOrder.services:', workOrder.services)
    
    // Handle different possible data structures
    let servicesArray = []
    if (Array.isArray(catalogData)) {
      servicesArray = catalogData
    } else if (catalogData && Array.isArray(catalogData.services)) {
      servicesArray = catalogData.services
    } else if (catalogData && Array.isArray(catalogData.data)) {
      servicesArray = catalogData.data
    } else {
      console.error('EditWorkOrderModal: Unexpected catalog data structure:', catalogData)
      return
    }
    
    console.log('EditWorkOrderModal: Services array to search:', servicesArray)
    console.log('EditWorkOrderModal: Services array length:', servicesArray.length)
    
    setFormData(prev => {
      const updatedServices = prev.services?.map((formService, index) => {
        const workOrderService = workOrder.services[index]
        if (!workOrderService) return formService
        
        console.log('EditWorkOrderModal: Processing service index:', index)
        console.log('EditWorkOrderModal: workOrderService:', workOrderService)
        console.log('EditWorkOrderModal: workOrderService.service:', workOrderService.service)
        
        // Try to find matching service in catalog
        const matchingCatalogItem = servicesArray.find((cat: any) => {
          console.log('EditWorkOrderModal: Checking catalog item:', cat)
          console.log('EditWorkOrderModal: Comparing names:', cat.name, 'vs', workOrderService.service.name)
          console.log('EditWorkOrderModal: Comparing IDs:', cat.id, 'vs', workOrderService.service._id)
          
          return cat.name === workOrderService.service.name ||
                 cat.id === workOrderService.service._id ||
                 cat._id === workOrderService.service._id
        })
        
        if (matchingCatalogItem) {
          console.log('EditWorkOrderModal: Found matching service:', matchingCatalogItem, 'for:', workOrderService.service)
          const serviceId = matchingCatalogItem.id || matchingCatalogItem._id || ''
          console.log('EditWorkOrderModal: Setting service ID to:', serviceId)
          return {
            ...formService,
            service: serviceId
          }
        } else {
          console.log('EditWorkOrderModal: No matching service found for:', workOrderService.service)
          return formService
        }
      }) || []
      
      console.log('EditWorkOrderModal: Updated services:', updatedServices)
      
      return {
        ...prev,
        services: updatedServices
      }
    })
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
        laborHours: 0,
        laborRate: 100,
        parts: [],
        totalCost: 0
      }]
    }))
  }

  const removeService = (index: number) => {
    if (formData.services && formData.services.length > 1) {
      setFormData(prev => ({
        ...prev,
        services: prev.services?.filter((_, i) => i !== index) || []
      }))
    }
  }

  const calculateServiceCost = (index: number, newLaborHours?: number, newLaborRate?: number) => {
    const service = formData.services?.[index]
    if (!service) return
    
    const laborHours = newLaborHours !== undefined ? newLaborHours : service.laborHours
    const laborRate = newLaborRate !== undefined ? newLaborRate : service.laborRate
    const laborCost = laborHours * laborRate
    const partsCost = service.parts?.reduce((sum, part) => sum + part.totalPrice, 0) || 0
    const totalCost = laborCost + partsCost
    
    console.log(`EditWorkOrderModal: Service ${index} calculation:`, {
      laborHours,
      laborRate,
      laborCost,
      partsCost,
      totalCost
    })
    
    handleServiceChange(index, 'totalCost', totalCost)
  }

  const handleSubmit = async () => {
    if (!workOrder) return
    
    // Check if user has admin access
    if (!isAnyAdmin()) {
      toast.error('Admin access required to update work orders')
      return
    }

    // Validate required fields
    if (!formData.technicianId) {
      toast.error('Please select a technician')
      return
    }

    setLoading(true)
    try {
      // Prepare the update data - only include fields that are allowed by the backend
      const updateData = {
        services: formData.services,
        technician: formData.technicianId, // Backend expects 'technician', not 'technicianId'
        priority: formData.priority,
        estimatedStartDate: formData.estimatedStartDate,
        estimatedCompletionDate: formData.estimatedCompletionDate,
        notes: formData.notes
      }
      
      console.log('EditWorkOrderModal: Submitting update data:', updateData)
      
      await dispatch(updateWorkOrder({ id: workOrder._id, data: updateData }))
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
      submitDisabled={!isAnyAdmin()}
    >
      <div className="p-6 space-y-6">
        {/* Admin Access Notice */}
        {!isAnyAdmin() && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Limited Access Mode
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>You are viewing this work order in read-only mode. Admin access is required to make changes.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form Loading Indicator */}
        {!formDataLoaded && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-blue-800">Loading work order data...</span>
            </div>
          </div>
        )}
        
        {/* Customer and Vehicle Selection */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Customer & Vehicle Selection</h3>
          
          {/* Customer Selection */}
          <div className="mb-4">
            <label className="form-label">Customer *</label>
            {!isAnyAdmin() ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 mb-3">
                  Admin access required to load customers. Please contact your administrator.
                </p>
                {workOrder?.customer && (
                  <div className="text-sm text-gray-700">
                    <p><strong>Current Customer:</strong> {workOrder.customer.name} - {workOrder.customer.email}</p>
                    <p><strong>Customer ID:</strong> {workOrder.customer._id}</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <select
                  value={formDataLoaded ? selectedCustomerId || '' : ''}
                  onChange={(e) => {
                    const customerId = e.target.value
                    setSelectedCustomerId(customerId)
                    setSelectedVehicleId('') // Reset vehicle when customer changes
                    setSelectedVehicle(null)
                    if (customerId) {
                      loadVehiclesByCustomer(customerId)
                    } else {
                      setVehicles([])
                    }
                  }}
                  className="form-select"
                  required
                  disabled={customersLoading || !isAnyAdmin() || !formDataLoaded}
                >
                  <option value="">
                    {!formDataLoaded ? 'Loading...' : customersLoading ? 'Loading customers...' : 'Select Customer'}
                  </option>
                  {customers && customers.length > 0 ? customers.map(customer => (
                    <option key={customer._id} value={customer._id}>
                      {customer.name} - {customer.email}
                    </option>
                  )) : (
                    <option value="" disabled>
                      {!formDataLoaded ? 'Loading...' : customersLoading ? 'Loading...' : 'No customers available'}
                    </option>
                  )}
                </select>
                {customersLoading && (
                  <p className="text-sm text-gray-500 mt-1">Loading customers...</p>
                )}
                {customersError && (
                  <div className="mt-1">
                    <p className="text-sm text-red-500">Error loading customers: {customersError}</p>
                    <button
                      type="button"
                      onClick={() => dispatch(fetchCustomers({ page: 1, limit: 100 }))}
                      className="text-sm text-blue-600 hover:text-blue-800 underline mt-1"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Vehicle Selection */}
          {selectedCustomerId && (
            <div className="mb-4">
              <label className="form-label">Select Vehicle *</label>
              <select
                value={formDataLoaded ? selectedVehicleId || '' : ''}
                onChange={(e) => {
                  const vehicleId = e.target.value
                  setSelectedVehicleId(vehicleId)
                  const vehicle = vehicles.find(v => v._id === vehicleId)
                  setSelectedVehicle(vehicle || null)
                }}
                className="form-select"
                required
                disabled={!isAnyAdmin() || !formDataLoaded}
              >
                <option value="">
                  {!formDataLoaded ? 'Loading...' : vehicles.length === 0 ? 'Loading vehicles...' : 'Choose a vehicle...'}
                </option>
                {vehicles.length > 0 ? vehicles.map(vehicle => (
                  <option key={vehicle._id} value={vehicle._id}>
                    {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                  </option>
                )) : (
                  <option value="" disabled>
                    {!formDataLoaded ? 'Loading...' : 'No vehicles available'}
                  </option>
                )}
              </select>
              {vehicles.length === 0 && formDataLoaded && (
                <p className="text-sm text-gray-500 mt-1">
                  {selectedCustomerId ? 'Loading vehicles for this customer...' : 'Please select a customer first'}
                </p>
              )}
            </div>
          )}
          
          {/* Show current vehicle info when user doesn't have admin access */}
          {!isAnyAdmin() && workOrder?.vehicle && (
            <div className="mb-4">
              <label className="form-label">Current Vehicle</label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Vehicle:</strong> {workOrder.vehicle.year} {workOrder.vehicle.make} {workOrder.vehicle.model}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>License Plate:</strong> {workOrder.vehicle.licensePlate}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>VIN:</strong> {workOrder.vehicle.vin}
                </p>
              </div>
            </div>
          )}

          {/* Selected Vehicle Details */}
          {selectedVehicle && (
            <div className="mt-4 p-4 ">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <span>Make/Model:</span>
                  <p className="font-medium">{selectedVehicle.make} {selectedVehicle.model}</p>
                </div>
                <div>
                  <span>Year:</span>
                  <p className="font-medium">{selectedVehicle.year}</p>
                </div>
                <div>
                  <span>Color:</span>
                  <p className="font-medium">{selectedVehicle.color}</p>
                </div>
                <div>
                  <span>License Plate:</span>
                  <p className="font-medium">{selectedVehicle.licensePlate}</p>
                </div>
                <div>
                  <span>VIN:</span>
                  <p className="font-medium font-mono text-xs">{selectedVehicle.vin}</p>
                </div>
                <div>
                  <span>Mileage:</span>
                  <p className="font-medium">{selectedVehicle.mileage.toLocaleString()} miles</p>
                </div>
                <div>
                  <span>Fuel Type:</span>
                  <p className="font-medium capitalize">{selectedVehicle.fuelType}</p>
                </div>
                <div>
                  <span>Transmission:</span>
                  <p className="font-medium capitalize">{selectedVehicle.transmission}</p>
                </div>
              </div>
            </div>
          )}

          {/* No vehicles message */}
          {selectedCustomerId && vehicles.length === 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                No vehicles found for this customer.
              </p>
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
              disabled={!isAnyAdmin()}
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
                    disabled={!isAnyAdmin()}
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Service Type *</label>
                  <select
                    value={formDataLoaded ? service.service || '' : ''}
                    onChange={(e) => handleServiceChange(index, 'service', e.target.value)}
                    className="form-select"
                    required
                    disabled={!isAnyAdmin() || !formDataLoaded}
                    data-debug={`service-${index}-value: ${service.service}, formDataLoaded: ${formDataLoaded}`}
                  >
                    <option value="">
                      {!formDataLoaded ? 'Loading...' : 'Select Service'}
                    </option>
                    {catalog && catalog.length > 0 ? catalog.map(cat => {
                      console.log('EditWorkOrderModal: Rendering catalog item:', cat)
                      return (
                        <option key={cat._id} value={cat._id}>
                          {cat.name}
                        </option>
                      )
                    }) : (
                      <option value="" disabled>
                        {!formDataLoaded ? 'Loading...' : 'No services available'}
                      </option>
                    )}
                  </select>
                  {(!catalog || catalog.length === 0) && (
                    <p className="text-sm text-red-500 mt-1">No service types available. Please contact your administrator.</p>
                  )}
                </div>
                <div>
                  <label className="form-label">Description</label>
                  <input
                    type="text"
                    value={service.description || ''}
                    onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                    className="form-input"
                    placeholder="Service description"
                    disabled={!isAnyAdmin()}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
                <div>
                  <label className="form-label">Labor Hours *</label>
                  <input
                    type="number"
                    value={service.laborHours || 0}
                    onChange={(e) => {
                      const newLaborHours = parseFloat(e.target.value) || 0
                      handleServiceChange(index, 'laborHours', newLaborHours)
                      calculateServiceCost(index, newLaborHours)
                    }}
                    className="form-input"
                    min="0"
                    step="0.5"
                    required
                    disabled={!isAnyAdmin()}
                  />
                </div>
                <div>
                  <label className="form-label">Labor Rate ($/hr) *</label>
                  <input
                    type="number"
                    value={service.laborRate || 100}
                    onChange={(e) => {
                      const newLaborRate = parseFloat(e.target.value) || 0
                      handleServiceChange(index, 'laborRate', newLaborRate)
                      calculateServiceCost(index, undefined, newLaborRate)
                    }}
                    className="form-input"
                    min="0"
                    step="0.01"
                    required
                    disabled={!isAnyAdmin()}
                  />
                </div>
                <div>
                  <label className="form-label">Total Cost *</label>
                  <input
                    type="number"
                    value={service.totalCost || 0}
                    onChange={(e) => handleServiceChange(index, 'totalCost', parseFloat(e.target.value) || 0)}
                    className="form-input"
                    min="0"
                    step="0.01"
                    required
                    disabled={!isAnyAdmin()}
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="form-label">Parts</label>
                  <PartsEditor
                    parts={service.parts || []}
                    onChange={(parts) => {
                      handleServiceChange(index, 'parts', parts)
                      calculateServiceCost(index)
                    }}
                    disabled={!isAnyAdmin()}
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
              <label className="form-label">Technician *</label>
              <select
                value={formDataLoaded ? formData.technicianId || '' : ''}
                onChange={(e) => handleInputChange('technicianId', e.target.value)}
                className="form-select"
                disabled={!isAnyAdmin() || !formDataLoaded}
                required
              >
                <option value="">
                  {!formDataLoaded ? 'Loading...' : 'Select Technician'}
                </option>
                {technicians && technicians.length > 0 ? technicians.filter(tech => tech.isActive).map(technician => {
                  console.log('EditWorkOrderModal: Rendering technician item:', technician)
                  return (
                    <option key={technician._id} value={technician._id}>
                      {technician.name} - ${technician.hourlyRate}/hr
                    </option>
                  )
                }) : (
                  <option value="" disabled>
                    {!formDataLoaded ? 'Loading...' : 'No technicians available'}
                  </option>
                )}
              </select>
              {(!technicians || technicians.length === 0) && (
                <p className="text-sm text-red-500 mt-1">No technicians available. Please contact your administrator.</p>
              )}
            </div>
            <div>
              <label className="form-label">Priority</label>
              <select
                value={formData.priority || 'medium'}
                onChange={(e) => handleInputChange('priority', e.target.value)}
                className="form-select"
                disabled={!isAnyAdmin()}
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
                value={formatDateForInput(formData.estimatedStartDate)}
                onChange={(e) => handleInputChange('estimatedStartDate', e.target.value)}
                className="form-input"
                disabled={!isAnyAdmin()}
              />
            </div>
            <div>
              <label className="form-label">Estimated Completion Date</label>
              <input
                type="datetime-local"
                value={formatDateForInput(formData.estimatedCompletionDate)}
                onChange={(e) => handleInputChange('estimatedCompletionDate', e.target.value)}
                className="form-input"
                disabled={!isAnyAdmin()}
              />
            </div>
          </div>





          <div className="mt-4">
            <label className="form-label">Internal Notes</label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="form-textarea"
              rows={3}
              placeholder="Internal notes about the work order"
              disabled={!isAnyAdmin()}
            />
          </div>




        </div>
      </div>
    </ModalWrapper>
  )
}
