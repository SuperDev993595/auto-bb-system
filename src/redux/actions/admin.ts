import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminService, {
  User,
  CreateUserData,
  UpdateUserData,
  UserStats,
  SystemSettings,
  SystemLog,
  SystemHealth,
  PaginatedResponse
} from '../../services/admin';

// Async thunks
export const fetchUsers = createAsyncThunk(
  'admin/fetchUsers',
  async (params?: { page?: number; limit?: number; search?: string; role?: string; isActive?: string }) => {
    const response = await adminService.getUsers(params);
    return response;
  }
);

export const fetchUserById = createAsyncThunk(
  'admin/fetchUserById',
  async (id: string) => {
    const response = await adminService.getUserById(id);
    return response;
  }
);

export const createUser = createAsyncThunk(
  'admin/createUser',
  async (userData: CreateUserData) => {
    const response = await adminService.createUser(userData);
    return response;
  }
);

export const updateUser = createAsyncThunk(
  'admin/updateUser',
  async ({ id, userData }: { id: string; userData: UpdateUserData }) => {
    const response = await adminService.updateUser(id, userData);
    return response;
  }
);

export const deleteUser = createAsyncThunk(
  'admin/deleteUser',
  async (id: string) => {
    await adminService.deleteUser(id);
    return id;
  }
);

export const toggleUserStatus = createAsyncThunk(
  'admin/toggleUserStatus',
  async (id: string) => {
    const response = await adminService.toggleUserStatus(id);
    return { id, isActive: response.isActive };
  }
);

export const fetchUserStats = createAsyncThunk(
  'admin/fetchUserStats',
  async () => {
    const response = await adminService.getUserStats();
    return response;
  }
);

export const fetchSystemSettings = createAsyncThunk(
  'admin/fetchSystemSettings',
  async () => {
    const response = await adminService.getSystemSettings();
    return response;
  }
);

export const updateSystemSettings = createAsyncThunk(
  'admin/updateSystemSettings',
  async (settings: SystemSettings) => {
    const response = await adminService.updateSystemSettings(settings);
    return response;
  }
);

export const fetchSystemLogs = createAsyncThunk(
  'admin/fetchSystemLogs',
  async (params?: { page?: number; limit?: number; level?: string; search?: string }) => {
    const response = await adminService.getSystemLogs(params);
    return response;
  }
);

export const fetchSystemHealth = createAsyncThunk(
  'admin/fetchSystemHealth',
  async () => {
    const response = await adminService.getSystemHealth();
    return response;
  }
);

// State interface
interface AdminState {
  // User Management
  users: User[];
  selectedUser: User | null;
  userStats: UserStats | null;
  usersLoading: boolean;
  userStatsLoading: boolean;
  createUserLoading: boolean;
  updateUserLoading: boolean;
  deleteUserLoading: boolean;
  
  // System Settings
  systemSettings: SystemSettings | null;
  systemSettingsLoading: boolean;
  updateSettingsLoading: boolean;
  
  // System Logs
  systemLogs: SystemLog[];
  systemLogsLoading: boolean;
  
  // System Health
  systemHealth: SystemHealth | null;
  systemHealthLoading: boolean;
  
  // Pagination
  pagination: {
    page: number;
    limit: number;
    totalDocs?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
  
  // Error handling
  error: string | null;
}

const initialState: AdminState = {
  users: [],
  selectedUser: null,
  userStats: null,
  usersLoading: false,
  userStatsLoading: false,
  createUserLoading: false,
  updateUserLoading: false,
  deleteUserLoading: false,
  
  systemSettings: null,
  systemSettingsLoading: false,
  updateSettingsLoading: false,
  
  systemLogs: [],
  systemLogsLoading: false,
  
  systemHealth: null,
  systemHealthLoading: false,
  
  pagination: {
    page: 1,
    limit: 10,
    totalDocs: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
  
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    setPagination: (state, action) => {
      state.pagination = { ...state.pagination, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    // Fetch Users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.usersLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.users = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.usersLoading = false;
        state.error = action.error.message || 'Failed to fetch users';
      });

    // Fetch User by ID
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to fetch user';
      });

    // Create User
    builder
      .addCase(createUser.pending, (state) => {
        state.createUserLoading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.createUserLoading = false;
        state.users.unshift(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.createUserLoading = false;
        state.error = action.error.message || 'Failed to create user';
      });

    // Update User
    builder
      .addCase(updateUser.pending, (state) => {
        state.updateUserLoading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.updateUserLoading = false;
        const index = state.users.findIndex(user => user._id === action.payload._id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.selectedUser?._id === action.payload._id) {
          state.selectedUser = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.updateUserLoading = false;
        state.error = action.error.message || 'Failed to update user';
      });

    // Delete User
    builder
      .addCase(deleteUser.pending, (state) => {
        state.deleteUserLoading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.deleteUserLoading = false;
        state.users = state.users.filter(user => user._id !== action.payload);
        if (state.selectedUser?._id === action.payload) {
          state.selectedUser = null;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.deleteUserLoading = false;
        state.error = action.error.message || 'Failed to delete user';
      });

    // Toggle User Status
    builder
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user._id === action.payload.id);
        if (index !== -1) {
          state.users[index].isActive = action.payload.isActive;
        }
        if (state.selectedUser?._id === action.payload.id) {
          state.selectedUser.isActive = action.payload.isActive;
        }
      })
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to toggle user status';
      });

    // Fetch User Stats
    builder
      .addCase(fetchUserStats.pending, (state) => {
        state.userStatsLoading = true;
        state.error = null;
      })
      .addCase(fetchUserStats.fulfilled, (state, action) => {
        state.userStatsLoading = false;
        state.userStats = action.payload;
      })
      .addCase(fetchUserStats.rejected, (state, action) => {
        state.userStatsLoading = false;
        state.error = action.error.message || 'Failed to fetch user stats';
      });

    // Fetch System Settings
    builder
      .addCase(fetchSystemSettings.pending, (state) => {
        state.systemSettingsLoading = true;
        state.error = null;
      })
      .addCase(fetchSystemSettings.fulfilled, (state, action) => {
        state.systemSettingsLoading = false;
        state.systemSettings = action.payload;
      })
      .addCase(fetchSystemSettings.rejected, (state, action) => {
        state.systemSettingsLoading = false;
        state.error = action.error.message || 'Failed to fetch system settings';
      });

    // Update System Settings
    builder
      .addCase(updateSystemSettings.pending, (state) => {
        state.updateSettingsLoading = true;
        state.error = null;
      })
      .addCase(updateSystemSettings.fulfilled, (state, action) => {
        state.updateSettingsLoading = false;
        state.systemSettings = action.payload;
      })
      .addCase(updateSystemSettings.rejected, (state, action) => {
        state.updateSettingsLoading = false;
        state.error = action.error.message || 'Failed to update system settings';
      });

    // Fetch System Logs
    builder
      .addCase(fetchSystemLogs.pending, (state) => {
        state.systemLogsLoading = true;
        state.error = null;
      })
      .addCase(fetchSystemLogs.fulfilled, (state, action) => {
        state.systemLogsLoading = false;
        state.systemLogs = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchSystemLogs.rejected, (state, action) => {
        state.systemLogsLoading = false;
        state.error = action.error.message || 'Failed to fetch system logs';
      });

    // Fetch System Health
    builder
      .addCase(fetchSystemHealth.pending, (state) => {
        state.systemHealthLoading = true;
        state.error = null;
      })
      .addCase(fetchSystemHealth.fulfilled, (state, action) => {
        state.systemHealthLoading = false;
        state.systemHealth = action.payload;
      })
      .addCase(fetchSystemHealth.rejected, (state, action) => {
        state.systemHealthLoading = false;
        state.error = action.error.message || 'Failed to fetch system health';
      });
  },
});

export const { clearError, clearSelectedUser, setPagination } = adminSlice.actions;
export default adminSlice.reducer;
