import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Chat, ChatMessage } from '../../services/chatService';
import { API_ENDPOINTS, getAuthHeaders } from '../../services/api';

interface ChatContextType {
  activeChats: Chat[];
  unreadCount: number;
  isConnected: boolean;
  joinChat: (chatId: string) => void;
  leaveChat: (chatId: string) => void;
  sendMessage: (chatId: string, message: string) => Promise<void>;
  markAsRead: (chatId: string) => void;
  updateChatStatus: (chatId: string, status: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: React.ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [activeChats, setActiveChats] = useState<Chat[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    // Initialize Socket.io connection
    if (typeof window !== 'undefined' && (window as any).io) {
      const newSocket = (window as any).io('http://localhost:3001');
      setSocket(newSocket);

      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('Chat provider connected to server');
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Chat provider disconnected from server');
      });

      newSocket.on('new-message', (data: { chatId: string; message: ChatMessage }) => {
        setActiveChats(prev => 
          prev.map(chat => 
            chat._id === data.chatId 
              ? {
                  ...chat,
                  messages: [...chat.messages, data.message],
                  lastActivity: new Date().toISOString()
                }
              : chat
          )
        );
        setUnreadCount(prev => prev + 1);
      });

      newSocket.on('chat-status-updated', (data: { chatId: string; status: string }) => {
        setActiveChats(prev => 
          prev.map(chat => 
            chat._id === data.chatId 
              ? { ...chat, status: data.status as any }
              : chat
          )
        );
      });

      newSocket.on('chat-assigned', (data: { chatId: string; assignedTo: string }) => {
        setActiveChats(prev => 
          prev.map(chat => 
            chat._id === data.chatId 
              ? { ...chat, assignedTo: { _id: data.assignedTo, name: '', email: '' } }
              : chat
          )
        );
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, []);

  const joinChat = useCallback((chatId: string) => {
    if (socket) {
      socket.emit('join-chat', chatId);
    }
  }, [socket]);

  const leaveChat = useCallback((chatId: string) => {
    if (socket) {
      socket.emit('leave-chat', chatId);
    }
  }, [socket]);

  const sendMessage = useCallback(async (chatId: string, message: string) => {
    if (socket) {
      socket.emit('send-message', {
        chatId,
        content: message,
        messageType: 'text'
      });
    }
  }, [socket]);

    const markAsRead = useCallback(async (chatId: string) => {
    try {
      console.log('ChatProvider: Marking messages as read for chat:', chatId);
      
      // Call server API to mark messages as read
      const response = await fetch(`${API_ENDPOINTS.CHAT}/${chatId}/mark-read`, {
        method: 'PUT',
        headers: getAuthHeaders(),
      });

      console.log('ChatProvider: Mark as read response status:', response.status);
      if (response.ok) {
        // Update local state
        setActiveChats(prev => 
          prev.map(chat => 
            chat._id === chatId 
              ? {
                  ...chat,
                  messages: chat.messages.map(msg => ({ ...msg, isRead: true }))
                }
              : chat
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, []);

  const updateChatStatus = useCallback((chatId: string, status: string) => {
    if (socket) {
      socket.emit('update-chat-status', { chatId, status });
    }
  }, [socket]);

  const value: ChatContextType = {
    activeChats,
    unreadCount,
    isConnected,
    joinChat,
    leaveChat,
    sendMessage,
    markAsRead,
    updateChatStatus
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
