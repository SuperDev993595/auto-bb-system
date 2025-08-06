import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type Appointment = {
    id: string;
    customer: string;
    vehicle: string;
    date: string;
    serviceType: string;
    notes?: string;
};

type AppointmentsState = {
    data: Appointment[];
};

const initialState: AppointmentsState = {
    data: [],
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
    },
});

export const {
    addAppointment,
    removeAppointment,
    updateAppointment,
} = appointmentsSlice.actions;

export default appointmentsSlice.reducer;
