import { API_ENDPOINTS } from './api';

export interface ChatMessage {
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
}

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
  messages: ChatMessage[];
  lastActivity: string;
  createdAt: string;
  rating?: {
    score: number;
    feedback: string;
    date: string;
  };
}

export interface ChatFilters {
  status?: string;
  category?: string;
  priority?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateChatData {
  customer: {
    name: string;
    email?: string;
    phone?: string;
    sessionId: string;
  };
  subject?: string;
  category?: string;
  priority?: string;
  initialMessage: string;
}

export interface SendMessageData {
  content: string;
  messageType?: 'text' | 'image' | 'file' | 'system';
  attachments?: Array<{
    filename: string;
    url: string;
    type: string;
  }>;
}

// Chat service for API calls
export const chatService = {
  // Create new chat (public)
  async createChat(chatData: CreateChatData): Promise<{ success: boolean; data: { chat: Chat } }> {
    try {
      const response = await fetch(API_ENDPOINTS.CHAT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Create chat error:', error);
      throw error;
    }
  },

  // Get all chats (admin only)
  async getChats(filters: ChatFilters = {}): Promise<{
    success: boolean;
    data: {
      chats: Chat[];
      pagination: {
        currentPage: number;
        totalPages: number;
        totalChats: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
      };
    };
  }> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });

      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const response = await fetch(`${API_ENDPOINTS.CHAT}?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get chats error:', error);
      throw error;
    }
  },

  // Get single chat
  async getChat(chatId: string): Promise<{ success: boolean; data: { chat: Chat } }> {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const response = await fetch(`${API_ENDPOINTS.CHAT}/${chatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Get chat error:', error);
      throw error;
    }
  },

  // Send message to chat
  async sendMessage(chatId: string, messageData: SendMessageData): Promise<{
    success: boolean;
    message: string;
    data: { message: ChatMessage };
  }> {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const response = await fetch(`${API_ENDPOINTS.CHAT}/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  },

  // Assign chat to user
  async assignChat(chatId: string, assignedTo: string, reason?: string): Promise<{
    success: boolean;
    message: string;
    data: { chat: Chat };
  }> {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const response = await fetch(`${API_ENDPOINTS.CHAT}/${chatId}/assign`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ assignedTo, reason }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Assign chat error:', error);
      throw error;
    }
  },

  // Resolve chat
  async resolveChat(chatId: string, notes?: string): Promise<{
    success: boolean;
    message: string;
    data: { chat: Chat };
  }> {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const response = await fetch(`${API_ENDPOINTS.CHAT}/${chatId}/resolve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Resolve chat error:', error);
      throw error;
    }
  },

  // Close chat
  async closeChat(chatId: string, notes?: string): Promise<{
    success: boolean;
    message: string;
    data: { chat: Chat };
  }> {
    try {
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
      const response = await fetch(`${API_ENDPOINTS.CHAT}/${chatId}/close`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Close chat error:', error);
      throw error;
    }
  },
};

// Socket.io service for real-time communication
export class ChatSocketService {
  private socket: any;
  private chatId: string | null = null;
  private onMessageCallback: ((message: ChatMessage) => void) | null = null;
  private onStatusChangeCallback: ((status: string) => void) | null = null;

  constructor() {
    // Initialize socket connection
    this.initializeSocket();
  }

  private initializeSocket() {
    // Check if socket.io is available
    if (typeof window !== 'undefined' && (window as any).io) {
      this.socket = (window as any).io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001');
      
      this.socket.on('connect', () => {
        console.log('Connected to chat socket');
      });

      this.socket.on('disconnect', () => {
        console.log('Disconnected from chat socket');
      });

      this.socket.on('new-message', (data: { chatId: string; message: ChatMessage }) => {
        if (this.chatId === data.chatId && this.onMessageCallback) {
          this.onMessageCallback(data.message);
        }
      });

      this.socket.on('chat-assigned', (data: { chatId: string; assignedTo: string }) => {
        if (this.chatId === data.chatId && this.onStatusChangeCallback) {
          this.onStatusChangeCallback('assigned');
        }
      });

      this.socket.on('chat-resolved', (data: { chatId: string }) => {
        if (this.chatId === data.chatId && this.onStatusChangeCallback) {
          this.onStatusChangeCallback('resolved');
        }
      });
    }
  }

  joinChat(chatId: string) {
    this.chatId = chatId;
    if (this.socket) {
      this.socket.emit('join-chat', chatId);
    }
  }

  leaveChat() {
    if (this.socket && this.chatId) {
      this.socket.emit('leave-chat', this.chatId);
      this.chatId = null;
    }
  }

  onMessage(callback: (message: ChatMessage) => void) {
    this.onMessageCallback = callback;
  }

  onStatusChange(callback: (status: string) => void) {
    this.onStatusChangeCallback = callback;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}

// Export singleton instance
export const chatSocketService = new ChatSocketService();
