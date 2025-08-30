import React, { useState, useEffect } from 'react';
import { MessageCircle, Bell } from '../../utils/icons';
import { chatService } from '../../services/chatService';
import { API_ENDPOINTS, getAuthHeaders } from '../../services/api';

interface ChatNotificationBadgeProps {
  className?: string;
}

const ChatNotificationBadge: React.FC<ChatNotificationBadgeProps> = ({ className = '' }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.CHAT}/unread-count`, {
          headers: getAuthHeaders(),
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            const count = data.data.unreadCount;
            setUnreadCount(count);
            setIsVisible(count > 0);
          }
        }
      } catch (error) {
        console.error('Error fetching unread chat count:', error);
      }
    };

    // Initial fetch
    fetchUnreadCount();

    // Set up polling for real-time updates
    const interval = setInterval(fetchUnreadCount, 15000); // Check every 15 seconds

    // Set up WebSocket connection for real-time updates
    if (typeof window !== 'undefined' && (window as any).io) {
      const socket = (window as any).io('http://localhost:3001');
      
      socket.on('new-chat', () => {
        // New chat created, increment count
        setUnreadCount(prev => {
          const newCount = prev + 1;
          setIsVisible(newCount > 0);
          return newCount;
        });
      });

      socket.on('chat-assigned', () => {
        // Chat assigned, refresh count
        fetchUnreadCount();
      });

      socket.on('chat-resolved', () => {
        // Chat resolved, refresh count
        fetchUnreadCount();
      });

      socket.on('chat-message-read', () => {
        // Message marked as read, refresh count
        fetchUnreadCount();
      });

      return () => {
        clearInterval(interval);
        socket.disconnect();
      };
    }

    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <MessageCircle className="w-6 h-6 text-gray-600 hover:text-blue-600 transition-colors cursor-pointer" />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      </div>
    </div>
  );
};

export default ChatNotificationBadge;
