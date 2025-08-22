import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'react-hot-toast';
import { 
  taskService, 
  Task, 
  CreateTaskData, 
  UpdateTaskData, 
  TaskFilters,
  TaskStats,
  DailyProgress 
} from '../../services/tasks';

// Async thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (filters: TaskFilters = {}, { rejectWithValue }) => {
    try {
      const response = await taskService.getTasks(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);

export const fetchTask = createAsyncThunk(
  'tasks/fetchTask',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await taskService.getTask(id);
      return response.data.task;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch task');
    }
  }
);

export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData: CreateTaskData, { rejectWithValue }) => {
    try {
      const response = await taskService.createTask(taskData);
      return response.data.task;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to create task';
      return rejectWithValue(message);
    }
  }
);

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ id, taskData }: { id: string; taskData: UpdateTaskData }, { rejectWithValue }) => {
    try {
      const response = await taskService.updateTask(id, taskData);
      return response.data.task;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update task';
      return rejectWithValue(message);
    }
  }
);

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (id: string, { rejectWithValue }) => {
    try {
      await taskService.deleteTask(id);
      return id;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete task';
      return rejectWithValue(message);
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  'tasks/updateStatus',
  async ({ id, status }: { id: string; status: Task['status'] }, { rejectWithValue }) => {
    try {
      const response = await taskService.updateTaskStatus(id, status);
      return response.data.task;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update task status';
      return rejectWithValue(message);
    }
  }
);

export const updateTaskProgress = createAsyncThunk(
  'tasks/updateProgress',
  async ({ id, progress }: { id: string; progress: number }, { rejectWithValue }) => {
    try {
      const response = await taskService.updateTaskProgress(id, progress);
      return response.data.task;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update task progress';
      return rejectWithValue(message);
    }
  }
);

export const addTaskNote = createAsyncThunk(
  'tasks/addNote',
  async ({ id, note }: { id: string; note: string }, { rejectWithValue }) => {
    try {
      const response = await taskService.addTaskNote(id, note);
      return response.data.task;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add note';
      return rejectWithValue(message);
    }
  }
);

export const fetchTaskStats = createAsyncThunk(
  'tasks/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await taskService.getTaskStats();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch task stats');
    }
  }
);

export const fetchDailyProgress = createAsyncThunk(
  'tasks/fetchDailyProgress',
  async (date: string | undefined, { rejectWithValue }) => {
    try {
      const response = await taskService.getDailyProgress(date);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch daily progress');
    }
  }
);

export const fetchMyTasks = createAsyncThunk(
  'tasks/fetchMyTasks',
  async (filters: Omit<TaskFilters, 'assignedTo'> = {}, { rejectWithValue }) => {
    try {
      const response = await taskService.getMyTasks(filters);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch my tasks');
    }
  }
);

export const searchTasks = createAsyncThunk(
  'tasks/searchTasks',
  async (query: string, { rejectWithValue }) => {
    try {
      const response = await taskService.searchTasks(query);
      return response.data.tasks;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search tasks');
    }
  }
);

// Task slice
interface TaskState {
  list: Task[];
  currentTask: Task | null;
  stats: TaskStats | null;
  dailyProgress: DailyProgress | null;
  myTasks: Task[];
  searchResults: Task[];
  loading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalTasks: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null;
  searchLoading: boolean;
}

const initialState: TaskState = {
  list: [],
  currentTask: null,
  stats: null,
  dailyProgress: null,
  myTasks: [],
  searchResults: [],
  loading: false,
  error: null,
  pagination: null,
  searchLoading: false,
};

const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    },
    setCurrentTask: (state, action: PayloadAction<Task>) => {
      state.currentTask = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch tasks
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.tasks;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch single task
    builder
      .addCase(fetchTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTask.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload;
      })
      .addCase(fetchTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create task
    builder
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload);
        if (state.pagination) {
          state.pagination.totalTasks += 1;
        }
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update task
    builder
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex(task => task._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.currentTask?._id === action.payload._id) {
          state.currentTask = action.payload;
        }
        // Update in myTasks as well
        const myTaskIndex = state.myTasks.findIndex(task => task._id === action.payload._id);
        if (myTaskIndex !== -1) {
          state.myTasks[myTaskIndex] = action.payload;
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete task
    builder
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.list = state.list.filter(task => task._id !== action.payload);
        state.myTasks = state.myTasks.filter(task => task._id !== action.payload);
        if (state.pagination) {
          state.pagination.totalTasks -= 1;
        }
        if (state.currentTask?._id === action.payload) {
          state.currentTask = null;
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update task status
    builder
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const index = state.list.findIndex(task => task._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.currentTask?._id === action.payload._id) {
          state.currentTask = action.payload;
        }
        const myTaskIndex = state.myTasks.findIndex(task => task._id === action.payload._id);
        if (myTaskIndex !== -1) {
          state.myTasks[myTaskIndex] = action.payload;
        }
      });

    // Update task progress
    builder
      .addCase(updateTaskProgress.fulfilled, (state, action) => {
        const index = state.list.findIndex(task => task._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.currentTask?._id === action.payload._id) {
          state.currentTask = action.payload;
        }
        const myTaskIndex = state.myTasks.findIndex(task => task._id === action.payload._id);
        if (myTaskIndex !== -1) {
          state.myTasks[myTaskIndex] = action.payload;
        }
      });

    // Add task note
    builder
      .addCase(addTaskNote.fulfilled, (state, action) => {
        const index = state.list.findIndex(task => task._id === action.payload._id);
        if (index !== -1) {
          state.list[index] = action.payload;
        }
        if (state.currentTask?._id === action.payload._id) {
          state.currentTask = action.payload;
        }
        const myTaskIndex = state.myTasks.findIndex(task => task._id === action.payload._id);
        if (myTaskIndex !== -1) {
          state.myTasks[myTaskIndex] = action.payload;
        }
      });

    // Fetch stats
    builder
      .addCase(fetchTaskStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchTaskStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch daily progress
    builder
      .addCase(fetchDailyProgress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDailyProgress.fulfilled, (state, action) => {
        state.loading = false;
        state.dailyProgress = action.payload;
      })
      .addCase(fetchDailyProgress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch my tasks
    builder
      .addCase(fetchMyTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.myTasks = action.payload.tasks;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchMyTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Search tasks
    builder
      .addCase(searchTasks.pending, (state) => {
        state.searchLoading = true;
        state.error = null;
      })
      .addCase(searchTasks.fulfilled, (state, action) => {
        state.searchLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchTasks.rejected, (state, action) => {
        state.searchLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentTask, clearSearchResults, setCurrentTask } = taskSlice.actions;
export default taskSlice.reducer;
