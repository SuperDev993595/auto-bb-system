import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Customer } from '../../utils/CustomerTypes'

interface CustomersState {
  list: Customer[]
  loading: boolean
  error: string | null
  selectedCustomer: Customer | null
}

const initialState: CustomersState = {
  list: [
    // Sample data for demonstration
    {
      id: '1',
      name: 'John Smith',
      phone: '(555) 123-4567',
      email: 'john.smith@email.com',
      address: '123 Main St, Anytown, ST 12345',
      dateCreated: '2024-01-15',
      lastVisit: '2024-08-01',
      vehicles: [
        {
          id: 'v1',
          make: 'Toyota',
          model: 'Camry',
          year: 2020,
          vin: '1HGBH41JXMN109186',
          licensePlate: 'ABC-123',
          mileage: 45000,
          color: 'Silver',
          customerId: '1'
        }
      ],
      serviceHistory: [
        {
          id: 's1',
          vehicleId: 'v1',
          customerId: '1',
          date: '2024-08-01',
          serviceType: 'Oil Change',
          description: 'Regular oil change and filter replacement',
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
          laborRate: 120,
          totalCost: 75.99,
          technicianId: 't1',
          technicianName: 'Mike Johnson',
          status: 'completed',
          nextServiceDue: '2024-11-01',
          nextServiceMileage: 48000
        }
      ],
      communicationLog: [
        {
          id: 'c1',
          customerId: '1',
          date: '2024-07-25',
          type: 'phone',
          direction: 'outbound',
          subject: 'Appointment Reminder',
          content: 'Called to remind about upcoming oil change appointment',
          employeeId: 'e1',
          employeeName: 'Sarah Davis'
        }
      ],
      notes: 'Prefers early morning appointments. Regular customer.',
      preferences: {
        preferredContactMethod: 'phone',
        reminderPreferences: {
          appointmentReminders: true,
          serviceReminders: true,
          followUpReminders: false
        }
      }
    },
    {
      id: '2',
      name: 'Lisa Brown',
      phone: '(555) 987-6543',
      email: 'lisa.brown@email.com',
      address: '456 Oak Ave, Somewhere, ST 67890',
      dateCreated: '2024-02-20',
      lastVisit: '2024-07-15',
      vehicles: [
        {
          id: 'v2',
          make: 'Ford',
          model: 'Escape',
          year: 2019,
          vin: '1FMCU9HD5KUA12345',
          licensePlate: 'XYZ-789',
          mileage: 62000,
          color: 'Blue',
          customerId: '2'
        }
      ],
      serviceHistory: [
        {
          id: 's2',
          vehicleId: 'v2',
          customerId: '2',
          date: '2024-07-15',
          serviceType: 'Tire Rotation',
          description: 'Rotated all four tires and checked pressure',
          partsUsed: [],
          laborHours: 0.75,
          laborRate: 120,
          totalCost: 90,
          technicianId: 't2',
          technicianName: 'Tom Wilson',
          status: 'completed',
          nextServiceDue: '2024-10-15',
          nextServiceMileage: 65000
        }
      ],
      communicationLog: [],
      notes: 'Very punctual. Prefers email communication.',
      preferences: {
        preferredContactMethod: 'email',
        reminderPreferences: {
          appointmentReminders: true,
          serviceReminders: true,
          followUpReminders: true
        }
      }
    }
  ],
  loading: false,
  error: null,
  selectedCustomer: null
}

const customersSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    setCustomers: (state, action: PayloadAction<Customer[]>) => {
      state.list = action.payload
      state.loading = false
      state.error = null
    },
    addCustomer: (state, action: PayloadAction<Customer>) => {
      state.list.push(action.payload)
    },
    updateCustomer: (state, action: PayloadAction<Customer>) => {
      const index = state.list.findIndex(c => c.id === action.payload.id)
      if (index !== -1) {
        state.list[index] = action.payload
      }
    },
    deleteCustomer: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter(c => c.id !== action.payload)
    },
    setSelectedCustomer: (state, action: PayloadAction<Customer | null>) => {
      state.selectedCustomer = action.payload
    },
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
  setCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  setSelectedCustomer,
  setLoading,
  setError
} = customersSlice.actions

export default customersSlice.reducer
