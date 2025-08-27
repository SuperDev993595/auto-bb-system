import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { MessageCircle, Users, Clock, CheckCircle, XCircle, Eye, UserPlus, Send, RefreshCw } from '../utils/icons';
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
      navigate('/auth/login');
      return;
    }

    const user = authService.getCurrentUserFromStorage();
    if (!user) {
      toast.error('User information not found');
      navigate('/auth/login');
      return;
    }

    // Check if user has admin role
    if (user.role !== 'super_admin' && user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/auth/login');
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
        navigate('/auth/login');
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
      case 'waiting': return 'status-pending';
      case 'active': return 'status-active';
      case 'resolved': return 'status-active';
      case 'closed': return 'status-inactive';
      default: return 'status-inactive';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-error-100 text-error-800';
      case 'high': return 'bg-warning-100 text-warning-800';
      case 'medium': return 'bg-primary-100 text-primary-800';
      case 'low': return 'bg-success-100 text-success-800';
      default: return 'bg-secondary-100 text-secondary-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'service': return 'bg-primary-100 text-primary-800';
      case 'billing': return 'bg-info-100 text-info-800';
      case 'technical': return 'bg-warning-100 text-warning-800';
      case 'complaint': return 'bg-error-100 text-error-800';
      case 'other': return 'bg-secondary-100 text-secondary-800';
      default: return 'bg-success-100 text-success-800';
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
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50 p-8 space-y-8">
      {/* Page Header */}
      <div className="min-h-32 flex flex-col lg:flex-row justify-between items-start lg:items-center p-6">
        <div className="mb-4 lg:mb-0">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Live Chat Management</h1>
          <p className="text-secondary-600">Manage customer conversations and support tickets</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-xl mx-auto mb-4">
                                    <MessageCircle className="w-6 h-6 text-primary-600" />
          </div>
          <p className="text-sm font-medium text-secondary-600">Total</p>
          <p className="text-2xl font-bold text-secondary-900">{pagination.totalChats}</p>
          <div className="mt-2">
            <p className="text-sm text-secondary-600">Total Chats</p>
          </div>
        </div>

        <div className="card p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-warning-100 rounded-xl mx-auto mb-4">
                                    <Clock className="w-6 h-6 text-warning-600" />
          </div>
          <p className="text-sm font-medium text-secondary-600">Waiting</p>
          <p className="text-2xl font-bold text-secondary-900">
            {chats.filter(chat => chat.status === 'waiting').length}
          </p>
          <div className="mt-2">
            <p className="text-sm text-secondary-600">Waiting</p>
          </div>
        </div>

        <div className="card p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-success-100 rounded-xl mx-auto mb-4">
                                    <CheckCircle className="w-6 h-6 text-success-600" />
          </div>
          <p className="text-sm font-medium text-secondary-600">Active</p>
          <p className="text-2xl font-bold text-secondary-900">
            {chats.filter(chat => chat.status === 'active').length}
          </p>
          <div className="mt-2">
            <p className="text-sm text-secondary-600">Active</p>
          </div>
        </div>

        <div className="card p-6 text-center">
          <div className="flex items-center justify-center w-12 h-12 bg-info-100 rounded-xl mx-auto mb-4">
                                    <Users className="w-6 h-6 text-info-600" />
          </div>
          <p className="text-sm font-medium text-secondary-600">Resolved</p>
          <p className="text-2xl font-bold text-secondary-900">
            {chats.filter(chat => chat.status === 'resolved').length}
          </p>
          <div className="mt-2">
            <p className="text-sm text-secondary-600">Resolved</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="form-label">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
              className="form-input"
            >
              <option value="">All Status</option>
              <option value="waiting">Waiting</option>
              <option value="active">Active</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          
          <div>
            <label className="form-label">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value, page: 1 }))}
              className="form-input"
            >
              <option value="">All Categories</option>
              <option value="general">General</option>
              <option value="service">Service</option>
              <option value="billing">Billing</option>
              <option value="technical">Technical</option>
              <option value="complaint">Complaint</option>
              <option value="other">Other</option>
            </select>
          </div>
          
          <div>
            <label className="form-label">Priority</label>
            <select
              value={filters.priority}
              onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value, page: 1 }))}
              className="form-input"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          
          <div>
            <label className="form-label">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
              placeholder="Search chats..."
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="card">
        <div className="p-6 border-b border-secondary-200">
          <h2 className="text-lg font-medium text-secondary-900">Active Conversations</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header-cell">Customer</th>
                <th className="table-header-cell">Subject</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Priority</th>
                <th className="table-header-cell">Last Activity</th>
                <th className="table-header-cell text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-secondary-500">Loading chats...</td>
                </tr>
              ) : chats.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-secondary-500">No chats found</td>
                </tr>
              ) : (
                chats.map((chat) => (
                  <tr key={chat._id} className="hover:bg-secondary-50">
                    <td className="table-cell">
                      <div>
                        <div className="text-sm font-medium text-secondary-900">{chat.customer.name}</div>
                        <div className="text-sm text-secondary-500">{chat.customer.email || chat.customer.phone}</div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm text-secondary-900">{chat.subject || 'No subject'}</div>
                      <div className="text-sm text-secondary-500">{chat.category}</div>
                    </td>
                    <td className="table-cell">
                      <span className={`status-badge ${getStatusColor(chat.status)}`}>
                        {chat.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`status-badge ${getPriorityColor(chat.priority)}`}>
                        {chat.priority}
                      </span>
                    </td>
                    <td className="table-cell text-sm text-secondary-500">
                      {new Date(chat.lastActivity).toLocaleDateString()}
                    </td>
                    <td className="table-cell text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => setSelectedChat(chat)}
                          className="text-secondary-600 hover:text-secondary-900 transition-colors"
                          title="View Chat"
                        >
                                                      <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleAssignChat(chat._id)}
                          className="text-primary-600 hover:text-primary-900 transition-colors"
                          title="Assign Chat"
                        >
                                                      <UserPlus className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chat Details */}
      <div className="lg:col-span-2">
        {selectedChat ? (
          <div className="card">
            <div className="p-4 border-b border-secondary-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-secondary-900">{selectedChat.customer.name}</h3>
                  <p className="text-sm text-secondary-500">
                    {selectedChat.customer.email && `${selectedChat.customer.email} • `}
                    {selectedChat.customer.phone && `${selectedChat.customer.phone} • `}
                    Session: {selectedChat.customer.sessionId.slice(-8)}
                  </p>
                  {selectedChat.assignedTo && (
                    <p className="text-sm text-info-600 mt-1">
                      Assigned to: {selectedChat.assignedTo.name}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`status-badge ${getStatusColor(selectedChat.status)}`}>
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
            <div className="h-96 overflow-y-auto custom-scrollbar p-4 space-y-4">
              {selectedChat.messages.map((message, index) => (
                <div
                  key={message._id || index}
                  className={`flex ${message.sender.name === 'Customer' ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender.name === 'Customer'
                        ? 'bg-secondary-100 text-secondary-900'
                        : message.messageType === 'system'
                        ? 'bg-warning-100 text-warning-800'
                        : 'bg-primary-600 text-white'
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
                            className="block text-xs text-primary-600 hover:underline"
                          >
                            📎 {attachment.filename}
                          </a>
                        ))}
                      </div>
                    )}
                    <div className={`text-xs mt-1 ${
                      message.sender.name === 'Customer' ? 'text-secondary-500' : 'text-primary-100'
                    }`}>
                      {formatTime(message.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            {selectedChat.status !== 'closed' && selectedChat.status !== 'resolved' && (
              <div className="p-4 border-t border-secondary-200">
                <div className="flex space-x-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="input-field flex-1 resize-none"
                    rows={2}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                                                <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Chat Actions */}
            <div className="p-4 border-t border-secondary-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {selectedChat.status === 'waiting' && (
                    <button
                      onClick={() => handleAssignChat(selectedChat._id)}
                      className="btn-primary"
                    >
                                                  <UserPlus className="h-4 w-4 mr-1" />
                      Assign to Me
                    </button>
                  )}
                  {selectedChat.status === 'active' && (
                    <button
                      onClick={() => handleResolveChat(selectedChat._id)}
                      className="btn-success"
                    >
                                                  <CheckCircle className="h-4 w-4 mr-1" />
                      Resolve
                    </button>
                  )}
                  {selectedChat.status !== 'closed' && (
                    <button
                      onClick={() => handleCloseChat(selectedChat._id)}
                      className="btn-secondary"
                    >
                                                  <XCircle className="h-4 w-4 mr-1" />
                      Close
                    </button>
                  )}
                </div>
                <div className="text-sm text-secondary-500">
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
          <div className="empty-state">
                                    <MessageCircle className="empty-state-icon" />
            <h3 className="empty-state-title">Select a Chat</h3>
            <p className="empty-state-description">Choose a chat from the list to view the conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}
