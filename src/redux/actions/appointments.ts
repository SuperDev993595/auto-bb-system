import { createAsyncThunk } from '@reduxjs/toolkit';
import { appointmentService } from '../../services/appointments';

export const deleteAppointment = createAsyncThunk(
  'appointments/deleteAppointment',
  async (appointmentId: string, { rejectWithValue }) => {
    try {
      const response = await appointmentService.deleteAppointment(appointmentId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete appointment');
    }
  }
);

export const updateAppointment = createAsyncThunk(
  'appointments/updateAppointment',
  async ({ id, appointmentData }: { id: string; appointmentData: any }, { rejectWithValue }) => {
    try {
      const response = await appointmentService.updateAppointment(id, appointmentData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update appointment';
      return rejectWithValue(message);
    }
  }
);
