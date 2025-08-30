import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  MessageCircle, 
  Clock, 
  User, 
  Phone, 
  Mail,
  Calendar,
  Tag,
  AlertCircle,
  CheckCircle,
  Archive,
  RefreshCw
} from '../../utils/icons';
import { chatService, Chat, ChatFilters } from '../../services/chatService';
import ChatWindow from './ChatWindow';
import { useChat } from './ChatProvider';

interface ChatDashboardProps {
  className?: string;
}

const ChatDashboard: React.FC<ChatDashboardProps> = ({ className = '' }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [filters, setFilters] = useState<ChatFilters>({
    status: '',
    category: '',
    priority: '',
    search: '',
    page: 1,
    limit: 20
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalChats: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  const { isConnected } = useChat();

  // Load chats
  const loadChats = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatService.getChats(filters);
      if (response.success) {
        setChats(response.data.chats);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      setError('Failed to load chats');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, [filters]);

  // Handle chat actions
  const handleAssignChat = async (chatId: string, assignedTo: string) => {
    try {
      const response = await chatService.assignChat(chatId, assignedTo);
      if (response.success) {
        // Update the chat in the list
        setChats(prev => 
          prev.map(chat => 
            chat._id === chatId 
              ? { ...chat, assignedTo: response.data.chat.assignedTo }
              : chat
          )
        );
        if (selectedChat?._id === chatId) {
          setSelectedChat(response.data.chat);
        }
        // Refresh the chat list to get updated message statuses
        loadChats();
      }
    } catch (error) {
      console.error('Error assigning chat:', error);
    }
  };

  const handleResolveChat = async (chatId: string, notes?: string) => {
    try {
      const response = await chatService.resolveChat(chatId, notes);
      if (response.success) {
        // Update the chat in the list
        setChats(prev => 
          prev.map(prev => 
            prev._id === chatId 
              ? { ...prev, status: 'resolved' }
              : prev
          )
        );
        if (selectedChat?._id === chatId) {
          setSelectedChat(response.data.chat);
        }
        // Refresh the chat list to get updated message statuses
        loadChats();
      }
    } catch (error) {
      console.error('Error resolving chat:', error);
    }
  };

  const handleCloseChat = async (chatId: string, notes?: string) => {
    try {
      const response = await chatService.closeChat(chatId, notes);
      if (response.success) {
        // Update the chat in the list
        setChats(prev => 
          prev.map(chat => 
            chat._id === chatId 
              ? { ...chat, status: 'closed' }
              : chat
          )
        );
        if (selectedChat?._id === chatId) {
          setSelectedChat(response.data.chat);
        }
        // Refresh the chat list to get updated message statuses
        loadChats();
      }
    } catch (error) {
      console.error('Error closing chat:', error);
    }
  };

  const handleChatSelect = async (chat: Chat) => {
    setSelectedChat(chat);
    
    // Mark messages as read when chat is selected
    if (chat.messages.some(msg => !msg.isRead && msg.sender.name === 'Customer')) {
      try {
        // Call server API to mark messages as read
        console.log('Marking messages as read for chat:', chat._id);
        const token = localStorage.getItem('authToken');
        console.log('Auth token found:', !!token);
        
        const response = await fetch(`/api/chat/${chat._id}/mark-read`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Mark as read response status:', response.status);
        if (response.ok) {
          // Update the chat in the list to mark messages as read
          setChats(prev => 
            prev.map(c => 
              c._id === chat._id 
                ? {
                    ...c,
                    messages: c.messages.map(msg => ({
                      ...msg,
                      isRead: msg.sender.name === 'Customer' ? true : msg.isRead
                    }))
                  }
                : c
            )
          );
        }
      } catch (error) {
        console.error('Error marking messages as read:', error);
      }
    }
  };

  const handleFilterChange = (key: keyof ChatFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handleSearch = (searchTerm: string) => {
    handleFilterChange('search', searchTerm);
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
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'urgent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className={`flex h-full ${className}`}>
      {/* Chat List */}
      <div className="w-1/3 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Live Chats</h2>
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
              <span className="text-sm text-gray-600">{isConnected ? 'Online' : 'Offline'}</span>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search chats..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
            <button
              onClick={loadChats}
              className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="waiting">Waiting</option>
                  <option value="active">Active</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            </div>
          )}
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-32 text-red-600">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          ) : chats.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500">
              <MessageCircle className="w-8 h-8 mr-2" />
              No chats found
            </div>
          ) : (
            <div className="divide-y divide-gray-200 overflow-y-auto h-full">
              {chats.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => handleChatSelect(chat)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedChat?._id === chat._id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Left side - Main content */}
                    <div className="flex-1 min-w-0">
                      {/* Header row with name and tags */}
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h6 className="font-medium text-gray-900 truncate min-w-0 flex-1">
                          {chat.customer.name}
                        </h6>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusColor(chat.status)}`}>
                            {chat.status}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getPriorityColor(chat.priority)}`}>
                            {chat.priority}
                          </span>
                        </div>
                      </div>
                      
                      {/* Contact information */}
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2 flex-wrap">
                        {chat.customer.email && (
                          <div className="flex items-center gap-1 min-w-0">
                            <Mail className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{chat.customer.email}</span>
                          </div>
                        )}
                        {chat.customer.phone && (
                          <div className="flex items-center gap-1 min-w-0">
                            <Phone className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{chat.customer.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* Message preview */}
                      {chat.messages.length > 0 && (
                        <p className="text-sm text-gray-600 break-words line-clamp-1">
                          {chat.messages[chat.messages.length - 1].content}
                        </p>
                      )}
                    </div>

                    {/* Right side - Timestamp and unread count */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0 min-w-0">
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {formatTimeAgo(chat.lastActivity)}
                      </span>
                      {chat.messages.filter(msg => !msg.isRead && msg.sender.name === 'Customer').length > 0 && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full whitespace-nowrap">
                          {chat.messages.filter(msg => !msg.isRead && msg.sender.name === 'Customer').length}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Window */}
      <div className="flex-1">
        {selectedChat ? (
          <ChatWindow
            chat={selectedChat}
            onClose={() => {
              setSelectedChat(null);
              // Refresh chat list when closing chat window to update unread statuses
              loadChats();
            }}
            onAssign={handleAssignChat}
            onResolve={handleResolveChat}
            onCloseChat={handleCloseChat}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a chat</h3>
              <p className="text-gray-600">Choose a chat from the list to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatDashboard;
