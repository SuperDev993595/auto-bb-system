import { io, Socket } from 'socket.io-client';

export interface SocketMessage {
  chatId: string;
  message: any;
  senderId: string;
  timestamp: Date;
}

export interface TypingEvent {
  userId: string;
  isTyping: boolean;
}

export interface ChatAssignment {
  chatId: string;
  assignedTo?: string;
}

export interface ChatStatusChange {
  chatId: string;
  status: string;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  
  // Track processed messages to prevent duplicates
  private processedMessages = new Set<string>();

  // Event listeners
  private messageListeners: ((data: SocketMessage) => void)[] = [];
  private typingListeners: ((data: TypingEvent) => void)[] = [];
  private assignmentListeners: ((data: ChatAssignment) => void)[] = [];
  private statusChangeListeners: ((data: ChatStatusChange) => void)[] = [];
  private connectionListeners: ((connected: boolean) => void)[] = [];

  connect(url: string = import.meta.env.VITE_API_URL || 'http://localhost:3001') {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      timeout: 20000
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.notifyConnectionListeners(true);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.isConnected = false;
      this.notifyConnectionListeners(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    this.socket.on('new-message', (data: SocketMessage) => {
      // Create unique message identifier
      const messageKey = `${data.chatId}_${data.message._id || data.message.content}_${data.senderId}_${data.timestamp}`;
      
      // Check if this message was already processed
      if (this.processedMessages.has(messageKey)) {
        console.log('SocketService: Duplicate message detected, skipping:', messageKey);
        return;
      }
      
      // Mark message as processed
      this.processedMessages.add(messageKey);
      
      // Clean up old processed messages (keep only last 500)
      if (this.processedMessages.size > 500) {
        const messagesArray = Array.from(this.processedMessages);
        this.processedMessages.clear();
        messagesArray.slice(-250).forEach(msg => this.processedMessages.add(msg));
      }
      
      console.log('SocketService: Processing new message:', data.message.content);
      this.notifyMessageListeners(data);
    });

    this.socket.on('user-typing', (data: TypingEvent) => {
      this.notifyTypingListeners(data);
    });

    this.socket.on('chat-assigned', (data: ChatAssignment) => {
      this.notifyAssignmentListeners(data);
    });

    this.socket.on('chat-resolved', (data: ChatStatusChange) => {
      this.notifyStatusChangeListeners(data);
    });

    this.socket.on('chat-closed', (data: ChatStatusChange) => {
      this.notifyStatusChangeListeners(data);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Join/Leave rooms
  joinUser(userId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join-user', userId);
    }
  }

  joinChat(chatId: string) {
    if (this.socket?.connected) {
      this.socket.emit('join-chat', chatId);
    }
  }

  leaveChat(chatId: string) {
    if (this.socket?.connected) {
      this.socket.emit('leave-chat', chatId);
    }
  }

  // Send events
  sendMessage(chatId: string, message: any, senderId: string) {
    if (this.socket?.connected) {
      this.socket.emit('send-message', {
        chatId,
        message,
        senderId
      });
    }
  }

  sendTyping(chatId: string, userId: string, isTyping: boolean) {
    if (this.socket?.connected) {
      this.socket.emit('typing', {
        chatId,
        userId,
        isTyping
      });
    }
  }

  // Event listeners management
  onMessage(callback: (data: SocketMessage) => void) {
    this.messageListeners.push(callback);
    return () => {
      this.messageListeners = this.messageListeners.filter(cb => cb !== callback);
    };
  }

  onTyping(callback: (data: TypingEvent) => void) {
    this.typingListeners.push(callback);
    return () => {
      this.typingListeners = this.typingListeners.filter(cb => cb !== callback);
    };
  }

  onAssignment(callback: (data: ChatAssignment) => void) {
    this.assignmentListeners.push(callback);
    return () => {
      this.assignmentListeners = this.assignmentListeners.filter(cb => cb !== callback);
    };
  }

  onStatusChange(callback: (data: ChatStatusChange) => void) {
    this.statusChangeListeners.push(callback);
    return () => {
      this.statusChangeListeners = this.statusChangeListeners.filter(cb => cb !== callback);
    };
  }

  onConnection(callback: (connected: boolean) => void) {
    this.connectionListeners.push(callback);
    return () => {
      this.connectionListeners = this.connectionListeners.filter(cb => cb !== callback);
    };
  }

  // Notify listeners
  private notifyMessageListeners(data: SocketMessage) {
    this.messageListeners.forEach(callback => callback(data));
  }

  private notifyTypingListeners(data: TypingEvent) {
    this.typingListeners.forEach(callback => callback(data));
  }

  private notifyAssignmentListeners(data: ChatAssignment) {
    this.assignmentListeners.forEach(callback => callback(data));
  }

  private notifyStatusChangeListeners(data: ChatStatusChange) {
    this.statusChangeListeners.forEach(callback => callback(data));
  }

  private notifyConnectionListeners(connected: boolean) {
    this.connectionListeners.forEach(callback => callback(connected));
  }

  // Getters
  get connected() {
    return this.isConnected;
  }

  get socketId() {
    return this.socket?.id;
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;
