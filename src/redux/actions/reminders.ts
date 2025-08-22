import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { reminderService } from '../../services/reminders';

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
  async (reminderData: any, { rejectWithValue }) => {
    try {
      const response = await reminderService.createReminder(reminderData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create reminder');
    }
  }
);

export const updateReminder = createAsyncThunk(
  'reminders/updateReminder',
  async ({ id, reminderData }: { id: string; reminderData: any }, { rejectWithValue }) => {
    try {
      const response = await reminderService.updateReminder(id, reminderData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update reminder');
    }
  }
);

export const deleteReminder = createAsyncThunk(
  'reminders/deleteReminder',
  async (id: string, { rejectWithValue }) => {
    try {
      await reminderService.deleteReminder(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete reminder');
    }
  }
);

export const markReminderSent = createAsyncThunk(
  'reminders/markSent',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await reminderService.markAsSent(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark reminder as sent');
    }
  }
);

export const cancelReminder = createAsyncThunk(
  'reminders/cancelReminder',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await reminderService.cancelReminder(id);
      return response.data;
    } catch (error: any) {
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
      const response = await reminderService.getTemplates();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reminder templates');
    }
  }
);

export const createReminderTemplate = createAsyncThunk(
  'reminders/createTemplate',
  async (templateData: any, { rejectWithValue }) => {
    try {
      const response = await reminderService.createTemplate(templateData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create reminder template');
    }
  }
);

export const updateReminderTemplate = createAsyncThunk(
  'reminders/updateTemplate',
  async ({ id, templateData }: { id: string; templateData: any }, { rejectWithValue }) => {
    try {
      const response = await reminderService.updateTemplate(id, templateData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update reminder template');
    }
  }
);

export const deleteReminderTemplate = createAsyncThunk(
  'reminders/deleteTemplate',
  async (id: string, { rejectWithValue }) => {
    try {
      await reminderService.deleteTemplate(id);
      return id;
    } catch (error: any) {
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
  async (settingsData: any, { rejectWithValue }) => {
    try {
      const response = await reminderService.updateNotificationSettings(settingsData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update notification settings');
    }
  }
);

interface RemindersState {
  reminders: any[];
  templates: any[];
  notificationSettings: any | null;
  upcomingReminders: any[];
  overdueReminders: any[];
  stats: any | null;
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
