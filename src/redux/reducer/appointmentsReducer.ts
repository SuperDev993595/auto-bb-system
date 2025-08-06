import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Appointment } from "../../utils/CustomerTypes";

type AppointmentsState = {
    data: Appointment[];
    loading: boolean;
    error: string | null;
    selectedAppointment: Appointment | null;
};

const initialState: AppointmentsState = {
    data: [
        {
            id: 'apt1',
            customerId: '1',
            customerName: 'John Smith',
            vehicleId: 'v1',
            vehicleInfo: '2020 Toyota Camry',
            date: '2025-08-05',
            time: '09:00',
            estimatedDuration: 30,
            serviceType: 'Oil Change',
            description: 'Regular oil change and filter replacement',
            status: 'confirmed',
            technicianId: 't1',
            technicianName: 'Mike Johnson',
            priority: 'medium',
            createdDate: '2025-08-01',
            notes: 'Customer prefers synthetic oil'
        },
        {
            id: 'apt2',
            customerId: '2',
            customerName: 'Lisa Brown',
            vehicleId: 'v2',
            vehicleInfo: '2019 Ford Escape',
            date: '2025-08-06',
            time: '14:30',
            estimatedDuration: 45,
            serviceType: 'Tire Rotation',
            description: 'Rotate all four tires and check pressure',
            status: 'scheduled',
            technicianId: 't2',
            technicianName: 'Tom Wilson',
            priority: 'low',
            createdDate: '2025-08-02'
        },
        {
            id: 'apt3',
            customerId: '1',
            customerName: 'John Smith',
            vehicleId: 'v1',
            vehicleInfo: '2020 Toyota Camry',
            date: '2025-08-07',
            time: '10:00',
            estimatedDuration: 60,
            serviceType: 'Brake Inspection',
            description: 'Complete brake system inspection',
            status: 'scheduled',
            priority: 'high',
            createdDate: '2025-08-03',
            notes: 'Customer reported squeaking noise'
        }
    ],
    loading: false,
    error: null,
    selectedAppointment: null,
};

const appointmentsSlice = createSlice({
    name: "appointments",
    initialState,
    reducers: {
        addAppointment: (state, action: PayloadAction<Appointment>) => {
            state.data.push(action.payload);
        },
        removeAppointment: (state, action: PayloadAction<string>) => {
            state.data = state.data.filter(appt => appt.id !== action.payload);
        },
        updateAppointment: (state, action: PayloadAction<Appointment>) => {
            const index = state.data.findIndex(appt => appt.id === action.payload.id);
            if (index !== -1) {
                state.data[index] = action.payload;
            }
        },
        setAppointments: (state, action: PayloadAction<Appointment[]>) => {
            state.data = action.payload;
            state.loading = false;
            state.error = null;
        },
        setSelectedAppointment: (state, action: PayloadAction<Appointment | null>) => {
            state.selectedAppointment = action.payload;
        },
        updateAppointmentStatus: (state, action: PayloadAction<{id: string, status: Appointment['status']}>) => {
            const index = state.data.findIndex(appt => appt.id === action.payload.id);
            if (index !== -1) {
                state.data[index].status = action.payload.status;
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.loading = false;
        },
    },
});

export const {
    addAppointment,
    removeAppointment,
    updateAppointment,
    setAppointments,
    setSelectedAppointment,
    updateAppointmentStatus,
    setLoading,
    setError,
} = appointmentsSlice.actions;

export default appointmentsSlice.reducer;
