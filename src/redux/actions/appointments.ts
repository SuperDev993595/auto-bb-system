import { createAsyncThunk } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';
import appointmentService from '../../services/appointments';
import { removeAppointment } from '../reducer/appointmentsReducer';

export const deleteAppointment = createAsyncThunk(
  'appointments/deleteAppointment',
  async (id: string, { dispatch, rejectWithValue }) => {
    try {
      // Check if this is a fake ID (for sample data or local storage)
      if (id.startsWith('apt') && !id.match(/^[0-9a-fA-F]{24}$/)) {
        // This is a fake ID - just remove from Redux store
        dispatch(removeAppointment(id));
        toast.success('Appointment deleted successfully!');
        return id;
      }
      
      // This is a real MongoDB ObjectId - try to delete from database
      const response = await appointmentService.deleteAppointment(id);
      
      if (response.success) {
        // Remove from Redux store
        dispatch(removeAppointment(id));
        toast.success('Appointment deleted successfully!');
        return id;
      } else {
        toast.error(response.message || 'Failed to delete appointment');
        return rejectWithValue(response.message || 'Failed to delete appointment');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete appointment';
      toast.error(message);
      return rejectWithValue(message);
    }
  }
);
