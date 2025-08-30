import React, { useEffect, useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import PageTitle from '../components/Shared/PageTitle';
import ChatDashboard from '../components/Chat/ChatDashboard';
import { ChatProvider } from '../components/Chat/ChatProvider';
import { authService } from '../services/auth';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { MessageCircle, User, Clock } from '../utils/icons';
import socketService from '../services/socketService';

interface Customer {
  _id: string;
  name: string;
  email: string;
  lastActivity?: string;
  unreadCount?: number;
}

interface Message {
  _id?: string;
  sender: { name: string; email?: string; };
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  isRead: boolean;
  createdAt: string;
}

interface Chat {
  _id: string;
  customer: { name: string; email?: string; phone?: string; sessionId: string; };
  assignedTo?: { _id: string; name: string; email: string; };
  status: 'waiting' | 'active' | 'resolved' | 'closed';
  subject?: string;
  category: 'general' | 'service' | 'billing' | 'technical' | 'complaint' | 'other';
  messages: Message[];
  createdAt: string;
}

export default function LiveChatPage() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check authentication on component mount
    if (!authService.isAuthenticated()) {
      toast.error('Please login to access chat management');
      navigate('/auth/login');
      return;
    }

    // Connect to socket
    socketService.connect();
    
    // Join user room
    const user = authService.getCurrentUserFromStorage();
    if (user) {
      socketService.joinUser(user.id);
      console.log('Joined user room:', user.id);
    }

    // Load customers list
    loadCustomers();

    // Set up socket listeners
    const unsubscribeMessage = socketService.onMessage((data: any) => {
      console.log('Received new message via socket:', data);
      if (data.chatId === selectedChat?._id) {
        // Check if message already exists to prevent duplicates
        setSelectedChat(prev => {
          if (!prev) return null;
          
          // Check if this message already exists (by ID first, then by content and timestamp)
          const messageExists = prev.messages.some(msg => {
            // If both messages have IDs, compare by ID
            if (msg._id && data.message._id && msg._id === data.message._id) {
              return true;
            }
            // Fallback: check by content, sender, and timestamp
            return msg.content === data.message.content && 
                   msg.sender.name === data.message.sender.name &&
                   Math.abs(new Date(msg.createdAt).getTime() - new Date(data.message.createdAt).getTime()) < 1000; // Within 1 second
          });
          
          if (messageExists) {
            console.log('Message already exists, skipping duplicate');
            return prev;
          }
          
          // Add new message to current chat
          return {
            ...prev,
            messages: [...prev.messages, data.message]
          };
        });
        
        // Refresh customers list to update unread counts
        loadCustomers();
      }
    });

    const unsubscribeConnection = socketService.onConnection((connected: boolean) => {
      if (connected) {
        console.log('Socket connected successfully');
        toast.success('Real-time chat connected!');
      } else {
        console.log('Socket disconnected');
        toast.error('Real-time chat disconnected');
      }
    });

    // Cleanup
    return () => {
      unsubscribeMessage();
      unsubscribeConnection();
      if (selectedChat) {
        socketService.leaveChat(selectedChat._id);
      }
    };
  }, [navigate, selectedChat?._id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/chat');
      if (response.data.success) {
        // Extract unique customers from chats
        const customerMap = new Map();
        response.data.data.chats.forEach((chat: any) => {
          const customerId = chat.customer._id || chat.customer.email;
          if (!customerMap.has(customerId)) {
            customerMap.set(customerId, {
              _id: customerId,
              name: chat.customer.name,
              email: chat.customer.email,
              lastActivity: chat.lastActivity,
              unreadCount: chat.messages?.filter((m: any) => !m.isRead && m.sender.name === 'Customer').length || 0
            });
          } else {
            // Update unread count and last activity
            const existing = customerMap.get(customerId);
            existing.unreadCount += chat.messages?.filter((m: any) => !m.isRead && m.sender.name === 'Customer').length || 0;
            if (chat.lastActivity > existing.lastActivity) {
              existing.lastActivity = chat.lastActivity;
            }
          }
        });
        
        const customersList = Array.from(customerMap.values())
          .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
        
        setCustomers(customersList);
      }
    } catch (error) {
      console.error('Error loading customers:', error);
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerChat = async (customer: Customer) => {
    try {
      setSelectedCustomer(customer);
      
      // Leave previous chat room
      if (selectedChat) {
        socketService.leaveChat(selectedChat._id);
      }
      
      const response = await api.get(`/chat?customer=${customer.email}`);
      if (response.data.success && response.data.data.chats.length > 0) {
        // Get the most recent chat for this customer
        const chat = response.data.data.chats[0];
        setSelectedChat(chat);
        
        // Join new chat room
        socketService.joinChat(chat._id);
      } else {
        setSelectedChat(null);
      }
    } catch (error) {
      console.error('Error loading customer chat:', error);
      toast.error('Failed to load chat');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;

    setSendingMessage(true);
    try {
      const response = await api.post(`/chat/${selectedChat._id}/messages`, {
        content: newMessage,
        messageType: 'text'
      });

      const message = response.data.data.message;
      
      // Update local state immediately for better UX
      setSelectedChat(prev => prev ? {
        ...prev,
        messages: [...prev.messages, message]
      } : null);

      setNewMessage('');
      toast.success('Message sent!');
      
      // Note: We don't need to send via socket for our own messages
      // The API response already updated the database, and other users will receive it via socket
      // This prevents duplicate messages on our own side
      
      // Refresh customers list to update unread counts
      loadCustomers();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <PageTitle title="Live Chat Management" />
        <p className="text-gray-600">Manage and monitor live chat conversations with customers</p>
      </div>

      <div className="flex gap-6 h-[calc(100vh-200px)]">
        {/* Left Side - Customers List */}
        <div className="w-80 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Customers</h3>
            <p className="text-sm text-gray-600">{customers.length} active customers</p>
          </div>
          
          <div className="overflow-y-auto h-[calc(100%-80px)]">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading customers...</div>
            ) : customers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No customers found</div>
            ) : (
              customers.map((customer) => (
                <div
                  key={customer._id}
                  onClick={() => loadCustomerChat(customer)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedCustomer?._id === customer._id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{customer.name}</span>
                    </div>
                    {(customer.unreadCount || 0) > 0 && (
                      <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {customer.unreadCount || 0}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{customer.email}</p>
                  <div className="flex items-center space-x-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{customer.lastActivity ? formatDate(customer.lastActivity) : 'No activity'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side - Chat Interface */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200">
          {!selectedCustomer ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Customer</h3>
                <p className="text-gray-600">Choose a customer from the list to view their chat history</p>
              </div>
            </div>
          ) : !selectedChat ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Chat History</h3>
                <p className="text-gray-600">This customer hasn't started any chats yet</p>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              {/* Chat Header */}
              <div className="bg-blue-600 text-white p-4 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedCustomer.name}</h3>
                    <p className="text-sm text-blue-100">{selectedCustomer.email}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm bg-white bg-opacity-20 px-2 py-1 rounded">
                      {selectedChat.status}
                    </span>
                    <p className="text-xs text-blue-100 mt-1">
                      Started {formatDate(selectedChat.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {selectedChat.messages.map((message, index) => (
                  <div key={message._id || index} className={`mb-3 ${message.sender?.name === 'Customer' ? 'text-left' : 'text-right'}`}>
                    <div className={`inline-block max-w-xs px-3 py-2 rounded-lg ${
                      message.sender?.name === 'Customer' 
                        ? 'bg-white text-gray-900 border' 
                        : 'bg-blue-600 text-white'
                    }`}>
                      <div className="text-sm">{message.content}</div>
                      <div className={`text-xs mt-1 ${
                        message.sender?.name === 'Customer' ? 'text-gray-500' : 'text-blue-100'
                      }`}>
                        {formatTime(message.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        sendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 p-2 border rounded"
                    disabled={sendingMessage}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {sendingMessage ? 'Sending...' : 'Send'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
