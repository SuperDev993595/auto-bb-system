import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

// Types
export interface Chat {
  _id: string;
  customer: {
    name: string;
    email?: string;
    phone?: string;
    sessionId: string;
  };
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  status: 'waiting' | 'active' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject?: string;
  category: 'general' | 'service' | 'billing' | 'technical' | 'complaint' | 'other';
  messages: Array<{
    _id?: string;
    sender: {
      name: string;
      email?: string;
    };
    content: string;
    messageType: 'text' | 'image' | 'file' | 'system';
    isRead: boolean;
    createdAt: string;
    attachments?: Array<{
      filename: string;
      url: string;
      type: string;
    }>;
  }>;
  lastActivity: string;
  createdAt: string;
  rating?: {
    score: number;
    feedback: string;
    date: string;
  };
}

export interface ChatFilters {
  status: string;
  category: string;
  priority: string;
  search: string;
  page: number;
  limit: number;
}

export interface ChatStats {
  totalChats: number;
  activeChats: number;
  waitingChats: number;
  resolvedChats: number;
  avgResponseTime: number;
}

// Async thunks
export const fetchChats = createAsyncThunk(
  'chat/fetchChats',
  async (filters: ChatFilters) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== '') {
        params.append(key, value.toString());
      }
    });
    
    const response = await api.get(`/chat?${params}`);
    return response.data.data;
  }
);

export const fetchChat = createAsyncThunk(
  'chat/fetchChat',
  async (chatId: string) => {
    const response = await api.get(`/chat/${chatId}`);
    return response.data.data.chat;
  }
);

export const assignChat = createAsyncThunk(
  'chat/assignChat',
  async ({ chatId, assignedTo, reason }: { chatId: string; assignedTo: string; reason: string }) => {
    const response = await api.put(`/chat/${chatId}/assign`, { assignedTo, reason });
    return response.data.data.chat;
  }
);

export const resolveChat = createAsyncThunk(
  'chat/resolveChat',
  async ({ chatId, notes }: { chatId: string; notes: string }) => {
    const response = await api.put(`/chat/${chatId}/resolve`, { notes });
    return response.data.data.chat;
  }
);

export const closeChat = createAsyncThunk(
  'chat/closeChat',
  async (chatId: string) => {
    const response = await api.put(`/chat/${chatId}/close`);
    return response.data.data.chat;
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ chatId, content, messageType = 'text' }: { chatId: string; content: string; messageType?: string }) => {
    const response = await api.post(`/chat/${chatId}/messages`, { content, messageType });
    return { chatId, message: response.data.data.message };
  }
);

export const fetchChatStats = createAsyncThunk(
  'chat/fetchChatStats',
  async () => {
    const response = await api.get('/chat/stats');
    return response.data.data.stats;
  }
);

// Initial state
interface ChatState {
  chats: Chat[];
  selectedChat: Chat | null;
  loading: boolean;
  error: string | null;
  stats: ChatStats | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalChats: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

const initialState: ChatState = {
  chats: [],
  selectedChat: null,
  loading: false,
  error: null,
  stats: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalChats: 0,
    hasNextPage: false,
    hasPrevPage: false
  }
};

// Slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedChat: (state, action: PayloadAction<Chat | null>) => {
      state.selectedChat = action.payload;
    },
    addMessageToChat: (state, action: PayloadAction<{ chatId: string; message: any }>) => {
      const { chatId, message } = action.payload;
      const chat = state.chats.find(c => c._id === chatId);
      if (chat) {
        chat.messages.push(message);
        chat.lastActivity = new Date().toISOString();
      }
      if (state.selectedChat?._id === chatId) {
        state.selectedChat.messages.push(message);
        state.selectedChat.lastActivity = new Date().toISOString();
      }
    },
    updateChatStatus: (state, action: PayloadAction<{ chatId: string; status: string }>) => {
      const { chatId, status } = action.payload;
      const chat = state.chats.find(c => c._id === chatId);
      if (chat) {
        chat.status = status as any;
      }
      if (state.selectedChat?._id === chatId) {
        state.selectedChat.status = status as any;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch chats
      .addCase(fetchChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload.chats;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch chats';
      })
      // Fetch single chat
      .addCase(fetchChat.fulfilled, (state, action) => {
        state.selectedChat = action.payload;
      })
      // Assign chat
      .addCase(assignChat.fulfilled, (state, action) => {
        const updatedChat = action.payload;
        const index = state.chats.findIndex(c => c._id === updatedChat._id);
        if (index !== -1) {
          state.chats[index] = updatedChat;
        }
        if (state.selectedChat?._id === updatedChat._id) {
          state.selectedChat = updatedChat;
        }
      })
      // Resolve chat
      .addCase(resolveChat.fulfilled, (state, action) => {
        const updatedChat = action.payload;
        const index = state.chats.findIndex(c => c._id === updatedChat._id);
        if (index !== -1) {
          state.chats[index] = updatedChat;
        }
        if (state.selectedChat?._id === updatedChat._id) {
          state.selectedChat = updatedChat;
        }
      })
      // Close chat
      .addCase(closeChat.fulfilled, (state, action) => {
        const updatedChat = action.payload;
        const index = state.chats.findIndex(c => c._id === updatedChat._id);
        if (index !== -1) {
          state.chats[index] = updatedChat;
        }
        if (state.selectedChat?._id === updatedChat._id) {
          state.selectedChat = updatedChat;
        }
      })
      // Send message
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { chatId, message } = action.payload;
        const chat = state.chats.find(c => c._id === chatId);
        if (chat) {
          chat.messages.push(message);
          chat.lastActivity = new Date().toISOString();
        }
        if (state.selectedChat?._id === chatId) {
          state.selectedChat.messages.push(message);
          state.selectedChat.lastActivity = new Date().toISOString();
        }
      })
      // Fetch stats
      .addCase(fetchChatStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  }
});

export const { clearError, setSelectedChat, addMessageToChat, updateChatStatus } = chatSlice.actions;
export default chatSlice.reducer;
