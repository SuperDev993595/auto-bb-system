import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';
import {
  reminderService,
  Reminder,
  ReminderTemplate,
  NotificationSettings,
  ReminderStats
} from '../../services/reminders';

// Async thunks for Reminders
export const fetchReminders = createAsyncThunk(
  'reminders/fetchReminders',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reminderService.getReminders();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reminders');
    }
  }
);

export const createReminder = createAsyncThunk(
  'reminders/createReminder',
  async (reminderData: Partial<Reminder>, { rejectWithValue }) => {
    try {
      const response = await reminderService.createReminder(reminderData);
      toast.success('Reminder created successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create reminder');
      return rejectWithValue(error.response?.data?.message || 'Failed to create reminder');
    }
  }
);

export const updateReminder = createAsyncThunk(
  'reminders/updateReminder',
  async ({ id, reminderData }: { id: string; reminderData: Partial<Reminder> }, { rejectWithValue }) => {
    try {
      const response = await reminderService.updateReminder(id, reminderData);
      toast.success('Reminder updated successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update reminder');
      return rejectWithValue(error.response?.data?.message || 'Failed to update reminder');
    }
  }
);

export const deleteReminder = createAsyncThunk(
  'reminders/deleteReminder',
  async (id: string, { rejectWithValue }) => {
    try {
      await reminderService.deleteReminder(id);
      toast.success('Reminder deleted successfully');
      return id;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete reminder');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete reminder');
    }
  }
);

export const markReminderSent = createAsyncThunk(
  'reminders/markSent',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await reminderService.markReminderSent(id);
      toast.success('Reminder marked as sent');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mark reminder as sent');
      return rejectWithValue(error.response?.data?.message || 'Failed to mark reminder as sent');
    }
  }
);

export const markReminderAcknowledged = createAsyncThunk(
  'reminders/markAcknowledged',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await reminderService.markReminderAcknowledged(id);
      toast.success('Reminder acknowledged');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to acknowledge reminder');
      return rejectWithValue(error.response?.data?.message || 'Failed to acknowledge reminder');
    }
  }
);

export const markReminderCompleted = createAsyncThunk(
  'reminders/markCompleted',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await reminderService.markReminderCompleted(id);
      toast.success('Reminder marked as completed');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to mark reminder as completed');
      return rejectWithValue(error.response?.data?.message || 'Failed to mark reminder as completed');
    }
  }
);

export const cancelReminder = createAsyncThunk(
  'reminders/cancelReminder',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await reminderService.cancelReminder(id);
      toast.success('Reminder cancelled');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to cancel reminder');
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel reminder');
    }
  }
);

export const fetchReminderStats = createAsyncThunk(
  'reminders/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reminderService.getReminderStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reminder stats');
    }
  }
);

export const fetchUpcomingReminders = createAsyncThunk(
  'reminders/fetchUpcoming',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reminderService.getUpcomingReminders();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch upcoming reminders');
    }
  }
);

export const fetchOverdueReminders = createAsyncThunk(
  'reminders/fetchOverdue',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reminderService.getOverdueReminders();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch overdue reminders');
    }
  }
);

// Async thunks for Reminder Templates
export const fetchReminderTemplates = createAsyncThunk(
  'reminders/fetchTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reminderService.getReminderTemplates();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reminder templates');
    }
  }
);

export const createReminderTemplate = createAsyncThunk(
  'reminders/createTemplate',
  async (templateData: Partial<ReminderTemplate>, { rejectWithValue }) => {
    try {
      const response = await reminderService.createReminderTemplate(templateData);
      toast.success('Reminder template created successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create reminder template');
      return rejectWithValue(error.response?.data?.message || 'Failed to create reminder template');
    }
  }
);

export const updateReminderTemplate = createAsyncThunk(
  'reminders/updateTemplate',
  async ({ id, templateData }: { id: string; templateData: Partial<ReminderTemplate> }, { rejectWithValue }) => {
    try {
      const response = await reminderService.updateReminderTemplate(id, templateData);
      toast.success('Reminder template updated successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update reminder template');
      return rejectWithValue(error.response?.data?.message || 'Failed to update reminder template');
    }
  }
);

export const deleteReminderTemplate = createAsyncThunk(
  'reminders/deleteTemplate',
  async (id: string, { rejectWithValue }) => {
    try {
      await reminderService.deleteReminderTemplate(id);
      toast.success('Reminder template deleted successfully');
      return id;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete reminder template');
      return rejectWithValue(error.response?.data?.message || 'Failed to delete reminder template');
    }
  }
);

// Async thunks for Notification Settings
export const fetchNotificationSettings = createAsyncThunk(
  'reminders/fetchNotificationSettings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await reminderService.getNotificationSettings();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notification settings');
    }
  }
);

export const updateNotificationSettings = createAsyncThunk(
  'reminders/updateNotificationSettings',
  async (settingsData: Partial<NotificationSettings>, { rejectWithValue }) => {
    try {
      const response = await reminderService.updateNotificationSettings(settingsData);
      toast.success('Notification settings updated successfully');
      return response.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update notification settings');
      return rejectWithValue(error.response?.data?.message || 'Failed to update notification settings');
    }
  }
);

interface RemindersState {
  reminders: Reminder[];
  templates: ReminderTemplate[];
  notificationSettings: NotificationSettings | null;
  upcomingReminders: Reminder[];
  overdueReminders: Reminder[];
  stats: ReminderStats | null;
  remindersLoading: boolean;
  templatesLoading: boolean;
  settingsLoading: boolean;
  statsLoading: boolean;
  error: string | null;
}

const initialState: RemindersState = {
  reminders: [],
  templates: [],
  notificationSettings: null,
  upcomingReminders: [],
  overdueReminders: [],
  stats: null,
  remindersLoading: false,
  templatesLoading: false,
  settingsLoading: false,
  statsLoading: false,
  error: null
};

const remindersSlice = createSlice({
  name: 'reminders',
  initialState,
  reducers: {
    clearRemindersError: (state) => {
      state.error = null;
    },
    clearReminders: (state) => {
      state.reminders = [];
    },
    clearTemplates: (state) => {
      state.templates = [];
    }
  },
  extraReducers: (builder) => {
    // Reminders
    builder
      .addCase(fetchReminders.pending, (state) => {
        state.remindersLoading = true;
        state.error = null;
      })
      .addCase(fetchReminders.fulfilled, (state, action) => {
        state.remindersLoading = false;
        state.reminders = action.payload;
      })
      .addCase(fetchReminders.rejected, (state, action) => {
        state.remindersLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createReminder.fulfilled, (state, action) => {
        state.reminders.push(action.payload);
      })
      .addCase(updateReminder.fulfilled, (state, action) => {
        const index = state.reminders.findIndex(reminder => reminder.id === action.payload.id);
        if (index !== -1) {
          state.reminders[index] = action.payload;
        }
      })
      .addCase(deleteReminder.fulfilled, (state, action) => {
        state.reminders = state.reminders.filter(reminder => reminder.id !== action.payload);
      })
      .addCase(markReminderSent.fulfilled, (state, action) => {
        const index = state.reminders.findIndex(reminder => reminder.id === action.payload.id);
        if (index !== -1) {
          state.reminders[index] = action.payload;
        }
      })
      .addCase(markReminderAcknowledged.fulfilled, (state, action) => {
        const index = state.reminders.findIndex(reminder => reminder.id === action.payload.id);
        if (index !== -1) {
          state.reminders[index] = action.payload;
        }
      })
      .addCase(markReminderCompleted.fulfilled, (state, action) => {
        const index = state.reminders.findIndex(reminder => reminder.id === action.payload.id);
        if (index !== -1) {
          state.reminders[index] = action.payload;
        }
      })
      .addCase(cancelReminder.fulfilled, (state, action) => {
        const index = state.reminders.findIndex(reminder => reminder.id === action.payload.id);
        if (index !== -1) {
          state.reminders[index] = action.payload;
        }
      });

    // Reminder Templates
    builder
      .addCase(fetchReminderTemplates.pending, (state) => {
        state.templatesLoading = true;
        state.error = null;
      })
      .addCase(fetchReminderTemplates.fulfilled, (state, action) => {
        state.templatesLoading = false;
        state.templates = action.payload;
      })
      .addCase(fetchReminderTemplates.rejected, (state, action) => {
        state.templatesLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createReminderTemplate.fulfilled, (state, action) => {
        state.templates.push(action.payload);
      })
      .addCase(updateReminderTemplate.fulfilled, (state, action) => {
        const index = state.templates.findIndex(template => template.id === action.payload.id);
        if (index !== -1) {
          state.templates[index] = action.payload;
        }
      })
      .addCase(deleteReminderTemplate.fulfilled, (state, action) => {
        state.templates = state.templates.filter(template => template.id !== action.payload);
      });

    // Notification Settings
    builder
      .addCase(fetchNotificationSettings.pending, (state) => {
        state.settingsLoading = true;
        state.error = null;
      })
      .addCase(fetchNotificationSettings.fulfilled, (state, action) => {
        state.settingsLoading = false;
        state.notificationSettings = action.payload;
      })
      .addCase(fetchNotificationSettings.rejected, (state, action) => {
        state.settingsLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateNotificationSettings.fulfilled, (state, action) => {
        state.notificationSettings = action.payload;
      });

    // Special Reminder Lists
    builder
      .addCase(fetchUpcomingReminders.fulfilled, (state, action) => {
        state.upcomingReminders = action.payload;
      })
      .addCase(fetchOverdueReminders.fulfilled, (state, action) => {
        state.overdueReminders = action.payload;
      });

    // Stats
    builder
      .addCase(fetchReminderStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchReminderStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchReminderStats.rejected, (state) => {
        state.statsLoading = false;
      });
  }
});

export const {
  clearRemindersError,
  clearReminders,
  clearTemplates
} = remindersSlice.actions;

export default remindersSlice.reducer;
