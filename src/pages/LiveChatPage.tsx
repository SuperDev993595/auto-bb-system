import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { HiChat, HiUsers, HiClock, HiCheckCircle, HiXCircle, HiEye, HiUserAdd, HiPaperAirplane, HiRefresh } from 'react-icons/hi';
import PageTitle from '../components/Shared/PageTitle';
import api from '../services/api';
import { authService } from '../services/auth';
import { useNavigate } from 'react-router-dom';

interface Chat {
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

interface ChatFilters {
  status: string;
  category: string;
  priority: string;
  search: string;
  page: number;
  limit: number;
}

export default function LiveChatPage() {
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [filters, setFilters] = useState<ChatFilters>({
    status: '',
    category: '',
    priority: '',
    search: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalChats: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  useEffect(() => {
    // Check authentication on component mount
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchChats();
    }
  }, [filters, currentUser]);

  const checkAuthentication = () => {
    if (!authService.isAuthenticated()) {
      toast.error('Please login to access chat management');
      navigate('/admin/login');
      return;
    }

    const user = authService.getCurrentUserFromStorage();
    if (!user) {
      toast.error('User information not found');
      navigate('/admin/login');
      return;
    }

    // Check if user has admin role
    if (user.role !== 'super_admin' && user.role !== 'sub_admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/admin/login');
      return;
    }

    setCurrentUser(user);
  };

  const fetchChats = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // Only add non-empty filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== '') {
          params.append(key, value.toString());
        }
      });

      const response = await api.get(`/chat?${params}`);
      if (response.data.success) {
        setChats(response.data.data.chats);
        setPagination(response.data.data.pagination);
      }
    } catch (error: any) {
      console.error('Error fetching chats:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        navigate('/admin/login');
      } else if (error.response?.status === 403) {
        toast.error('Access denied. You don\'t have permission to view chats.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to fetch chats');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAssignChat = async (chatId: string) => {
    try {
      if (!currentUser?.id) {
        toast.error('User not authenticated');
        return;
      }

      const response = await api.put(`/chat/${chatId}/assign`, {
        assignedTo: currentUser.id,
        reason: 'Manual assignment'
      });
      
      if (response.data.success) {
        toast.success('Chat assigned successfully');
        fetchChats();
        // Update selected chat if it's the one being assigned
        if (selectedChat?._id === chatId) {
          setSelectedChat(response.data.data.chat);
        }
      }
    } catch (error) {
      console.error('Error assigning chat:', error);
      toast.error('Failed to assign chat');
    }
  };

  const handleResolveChat = async (chatId: string) => {
    try {
      const response = await api.put(`/chat/${chatId}/resolve`, {
        notes: 'Chat resolved by admin'
      });
      
      if (response.data.success) {
        toast.success('Chat resolved successfully');
        fetchChats();
        // Update selected chat if it's the one being resolved
        if (selectedChat?._id === chatId) {
          setSelectedChat(response.data.data.chat);
        }
      }
    } catch (error) {
      console.error('Error resolving chat:', error);
      toast.error('Failed to resolve chat');
    }
  };

  const handleCloseChat = async (chatId: string) => {
    try {
      const response = await api.put(`/chat/${chatId}/close`);
      
      if (response.data.success) {
        toast.success('Chat closed successfully');
        fetchChats();
        // Update selected chat if it's the one being closed
        if (selectedChat?._id === chatId) {
          setSelectedChat(response.data.data.chat);
        }
      }
    } catch (error) {
      console.error('Error closing chat:', error);
      toast.error('Failed to close chat');
    }
  };

  const handleSendMessage = async () => {
    if (!selectedChat || !newMessage.trim()) return;

    try {
      setSendingMessage(true);
      const response = await api.post(`/chat/${selectedChat._id}/messages`, {
        content: newMessage.trim(),
        messageType: 'text'
      });

      if (response.data.success) {
        setNewMessage('');
        // Update the selected chat with the new message
        if (selectedChat) {
          setSelectedChat({
            ...selectedChat,
            messages: [...selectedChat.messages, response.data.data.message],
            lastActivity: new Date().toISOString()
          });
        }
        toast.success('Message sent successfully');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'service': return 'bg-purple-100 text-purple-800';
      case 'billing': return 'bg-indigo-100 text-indigo-800';
      case 'technical': return 'bg-blue-100 text-blue-800';
      case 'complaint': return 'bg-red-100 text-red-800';
      case 'other': return 'bg-gray-100 text-gray-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  const getUnreadCount = (chat: Chat) => {
    return chat.messages.filter(msg => !msg.isRead && msg.sender.name !== 'Customer').length;
  };

  const handleLogout = () => {
    authService.logout();
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <PageTitle title="Live Chat Support" icon={HiChat} />
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Welcome, <span className="font-medium">{currentUser.name}</span>
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {currentUser.role === 'super_admin' ? 'Super Admin' : 'Sub Admin'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
          >
            Logout
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Active Chats</h3>
                <div className="flex items-center space-x-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {chats.filter(chat => chat.status === 'active' || chat.status === 'waiting').length}
                  </span>
                  <button
                    onClick={fetchChats}
                    disabled={loading}
                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  >
                    <HiRefresh className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
              
              {/* Filters */}
              <div className="mt-4 space-y-2">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="waiting">Waiting</option>
                  <option value="active">Active</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>

                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Categories</option>
                  <option value="general">General</option>
                  <option value="service">Service</option>
                  <option value="billing">Billing</option>
                  <option value="technical">Technical</option>
                  <option value="complaint">Complaint</option>
                  <option value="other">Other</option>
                </select>

                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value, page: 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>

                <input
                  type="text"
                  placeholder="Search chats..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading chats...</div>
              ) : chats.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No chats found</div>
              ) : (
                chats.map((chat) => {
                  const unreadCount = getUnreadCount(chat);
                  return (
                    <div
                      key={chat._id}
                      onClick={() => setSelectedChat(chat)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedChat?._id === chat._id ? 'bg-blue-50 border-blue-200' : ''
                      } ${unreadCount > 0 ? 'bg-yellow-50' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(chat.status)}`}>
                              {chat.status}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(chat.priority)}`}>
                              {chat.priority}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(chat.category)}`}>
                              {chat.category}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {chat.customer.name}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {chat.subject || 'No subject'}
                          </p>
                          {chat.assignedTo && (
                            <p className="text-xs text-blue-600 mt-1">
                              Assigned to: {chat.assignedTo.name}
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-400">
                              {formatTime(chat.lastActivity)}
                            </span>
                            {unreadCount > 0 && (
                              <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                    disabled={!pagination.hasPrevPage}
                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                    disabled={!pagination.hasNextPage}
                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Details */}
        <div className="lg:col-span-2">
          {selectedChat ? (
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{selectedChat.customer.name}</h3>
                    <p className="text-sm text-gray-500">
                      {selectedChat.customer.email && `${selectedChat.customer.email} • `}
                      {selectedChat.customer.phone && `${selectedChat.customer.phone} • `}
                      Session: {selectedChat.customer.sessionId.slice(-8)}
                    </p>
                    {selectedChat.assignedTo && (
                      <p className="text-sm text-blue-600 mt-1">
                        Assigned to: {selectedChat.assignedTo.name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedChat.status)}`}>
                      {selectedChat.status}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedChat.priority)}`}>
                      {selectedChat.priority}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(selectedChat.category)}`}>
                      {selectedChat.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {selectedChat.messages.map((message, index) => (
                  <div
                    key={message._id || index}
                    className={`flex ${message.sender.name === 'Customer' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender.name === 'Customer'
                          ? 'bg-gray-100 text-gray-900'
                          : message.messageType === 'system'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      <div className="text-sm font-medium mb-1">
                        {message.sender.name}
                      </div>
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {message.attachments.map((attachment, idx) => (
                            <a
                              key={idx}
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-xs text-blue-600 hover:underline"
                            >
                              📎 {attachment.filename}
                            </a>
                          ))}
                        </div>
                      )}
                      <div className={`text-xs mt-1 ${
                        message.sender.name === 'Customer' ? 'text-gray-500' : 'text-blue-100'
                      }`}>
                        {formatTime(message.createdAt)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              {selectedChat.status !== 'closed' && selectedChat.status !== 'resolved' && (
                <div className="p-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={2}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      <HiPaperAirplane className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Chat Actions */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {selectedChat.status === 'waiting' && (
                      <button
                        onClick={() => handleAssignChat(selectedChat._id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <HiUserAdd className="h-4 w-4 mr-1" />
                        Assign to Me
                      </button>
                    )}
                    {selectedChat.status === 'active' && (
                      <button
                        onClick={() => handleResolveChat(selectedChat._id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        <HiCheckCircle className="h-4 w-4 mr-1" />
                        Resolve
                      </button>
                    )}
                    {selectedChat.status !== 'closed' && (
                      <button
                        onClick={() => handleCloseChat(selectedChat._id)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <HiXCircle className="h-4 w-4 mr-1" />
                        Close
                      </button>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    Started {new Date(selectedChat.createdAt).toLocaleDateString()}
                    {selectedChat.rating && (
                      <span className="ml-2">
                        • Rating: {selectedChat.rating.score}/5
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <HiChat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Chat</h3>
              <p className="text-gray-500">Choose a chat from the list to view the conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
