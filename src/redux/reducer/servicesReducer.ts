import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ServiceCatalogItem, WorkOrder, Technician } from '../../utils/CustomerTypes'

interface ServicesState {
  catalog: ServiceCatalogItem[]
  workOrders: WorkOrder[]
  technicians: Technician[]
  loading: boolean
  error: string | null
}

const initialState: ServicesState = {
  catalog: [
    {
      id: 'svc1',
      name: 'Oil Change',
      description: 'Complete oil change with filter replacement',
      category: 'Maintenance',
      estimatedDuration: 30,
      laborRate: 120,
      parts: [
        {
          id: 'p1',
          name: 'Oil Filter',
          partNumber: 'OF-123',
          quantity: 1,
          unitPrice: 15.99,
          totalPrice: 15.99
        },
        {
          id: 'p2',
          name: 'Motor Oil (5qt)',
          partNumber: 'OIL-5W30',
          quantity: 1,
          unitPrice: 35.99,
          totalPrice: 35.99
        }
      ],
      isActive: true
    },
    {
      id: 'svc2',
      name: 'Tire Rotation',
      description: 'Rotate all four tires and check tire pressure',
      category: 'Maintenance',
      estimatedDuration: 45,
      laborRate: 120,
      parts: [],
      isActive: true
    },
    {
      id: 'svc3',
      name: 'Brake Inspection',
      description: 'Complete brake system inspection',
      category: 'Safety',
      estimatedDuration: 60,
      laborRate: 120,
      parts: [],
      isActive: true
    },
    {
      id: 'svc4',
      name: 'Transmission Service',
      description: 'Transmission fluid change and filter replacement',
      category: 'Maintenance',
      estimatedDuration: 90,
      laborRate: 120,
      parts: [
        {
          id: 'p3',
          name: 'Transmission Filter',
          partNumber: 'TF-456',
          quantity: 1,
          unitPrice: 45.99,
          totalPrice: 45.99
        },
        {
          id: 'p4',
          name: 'Transmission Fluid (4qt)',
          partNumber: 'ATF-DX',
          quantity: 1,
          unitPrice: 89.99,
          totalPrice: 89.99
        }
      ],
      isActive: true
    }
  ],
  workOrders: [
    {
      id: 'wo1',
      appointmentId: 'apt1',
      customerId: '1',
      vehicleId: 'v1',
      date: '2024-08-01',
      status: 'completed',
      services: [],
      partsUsed: [
        {
          id: 'p1',
          name: 'Oil Filter',
          partNumber: 'OF-123',
          quantity: 1,
          unitPrice: 15.99,
          totalPrice: 15.99
        }
      ],
      laborHours: 0.5,
      technicianId: 't1',
      technicianName: 'Mike Johnson',
      subtotal: 75.99,
      tax: 6.08,
      total: 82.07,
      completedDate: '2024-08-01'
    }
  ],
  technicians: [
    {
      id: 't1',
      name: 'Mike Johnson',
      email: 'mike.johnson@autorepair.com',
      phone: '(555) 111-2222',
      specializations: ['Engine', 'Oil Change', 'General Maintenance'],
      hourlyRate: 120,
      isActive: true
    },
    {
      id: 't2',
      name: 'Tom Wilson',
      email: 'tom.wilson@autorepair.com',
      phone: '(555) 333-4444',
      specializations: ['Tires', 'Brakes', 'Suspension'],
      hourlyRate: 125,
      isActive: true
    },
    {
      id: 't3',
      name: 'Sarah Davis',
      email: 'sarah.davis@autorepair.com',
      phone: '(555) 555-6666',
      specializations: ['Transmission', 'Electrical', 'Diagnostics'],
      hourlyRate: 135,
      isActive: true
    }
  ],
  loading: false,
  error: null
}

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    // Service Catalog Actions
    addServiceCatalogItem: (state, action: PayloadAction<ServiceCatalogItem>) => {
      state.catalog.push(action.payload)
    },
    updateServiceCatalogItem: (state, action: PayloadAction<ServiceCatalogItem>) => {
      const index = state.catalog.findIndex(s => s.id === action.payload.id)
      if (index !== -1) {
        state.catalog[index] = action.payload
      }
    },
    deleteServiceCatalogItem: (state, action: PayloadAction<string>) => {
      state.catalog = state.catalog.filter(s => s.id !== action.payload)
    },
    
    // Work Order Actions
    addWorkOrder: (state, action: PayloadAction<WorkOrder>) => {
      state.workOrders.push(action.payload)
    },
    updateWorkOrder: (state, action: PayloadAction<WorkOrder>) => {
      const index = state.workOrders.findIndex(w => w.id === action.payload.id)
      if (index !== -1) {
        state.workOrders[index] = action.payload
      }
    },
    deleteWorkOrder: (state, action: PayloadAction<string>) => {
      state.workOrders = state.workOrders.filter(w => w.id !== action.payload)
    },
    
    // Technician Actions
    addTechnician: (state, action: PayloadAction<Technician>) => {
      state.technicians.push(action.payload)
    },
    updateTechnician: (state, action: PayloadAction<Technician>) => {
      const index = state.technicians.findIndex(t => t.id === action.payload.id)
      if (index !== -1) {
        state.technicians[index] = action.payload
      }
    },
    deleteTechnician: (state, action: PayloadAction<string>) => {
      state.technicians = state.technicians.filter(t => t.id !== action.payload)
    },
    
    // General Actions
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.loading = false
    }
  }
})

export const {
  addServiceCatalogItem,
  updateServiceCatalogItem,
  deleteServiceCatalogItem,
  addWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
  addTechnician,
  updateTechnician,
  deleteTechnician,
  setLoading,
  setError
} = servicesSlice.actions

export default servicesSlice.reducer
