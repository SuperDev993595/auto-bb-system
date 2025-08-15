import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { HiChat, HiUsers, HiClock, HiCheckCircle, HiXCircle, HiEye, HiUserAdd } from 'react-icons/hi';
import PageTitle from '../components/Shared/PageTitle';
import api from '../services/api';

interface Chat {
  _id: string;
  customer: {
    name: string;
    email?: string;
    phone?: string;
    sessionId: string;
  };
  assignedTo?: {
    name: string;
    email: string;
  };
  status: 'waiting' | 'active' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject?: string;
  category: 'general' | 'service' | 'billing' | 'technical' | 'complaint' | 'other';
  messages: Array<{
    _id: string;
    sender: {
      name: string;
    };
    content: string;
    messageType: 'text' | 'image' | 'file' | 'system';
    isRead: boolean;
    createdAt: string;
  }>;
  lastActivity: string;
  createdAt: string;
  unreadCount: number;
}

export default function LiveChatPage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    search: ''
  });

  useEffect(() => {
    fetchChats();
  }, [filters]);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...filters
      });

      const response = await api.get(`/chat?${params}`);
      if (response.data.success) {
        setChats(response.data.data.chats);
      }
    } catch (error) {
      console.error('Error fetching chats:', error);
      toast.error('Failed to fetch chats');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignChat = async (chatId: string, userId: string) => {
    try {
      const response = await api.put(`/chat/${chatId}/assign`, {
        assignedTo: userId,
        reason: 'Manual assignment'
      });
      if (response.data.success) {
        toast.success('Chat assigned successfully');
        fetchChats();
      }
    } catch (error) {
      toast.error('Failed to assign chat');
    }
  };

  const handleResolveChat = async (chatId: string) => {
    try {
      const response = await api.put(`/chat/${chatId}/resolve`, {
        notes: 'Chat resolved'
      });
      if (response.data.success) {
        toast.success('Chat resolved successfully');
        fetchChats();
      }
    } catch (error) {
      toast.error('Failed to resolve chat');
    }
  };

  const handleCloseChat = async (chatId: string) => {
    try {
      const response = await api.put(`/chat/${chatId}/close`);
      if (response.data.success) {
        toast.success('Chat closed successfully');
        fetchChats();
      }
    } catch (error) {
      toast.error('Failed to close chat');
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

  return (
    <div className="space-y-6">
      <PageTitle title="Live Chat Support" icon={HiChat} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Active Chats</h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {chats.filter(chat => chat.status === 'active' || chat.status === 'waiting').length}
                </span>
              </div>
              
              {/* Filters */}
              <div className="mt-4 space-y-2">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">All Status</option>
                  <option value="waiting">Waiting</option>
                  <option value="active">Active</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>

                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
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
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500">Loading chats...</div>
              ) : chats.length === 0 ? (
                <div className="p-4 text-center text-gray-500">No chats found</div>
              ) : (
                chats.map((chat) => (
                  <div
                    key={chat._id}
                    onClick={() => setSelectedChat(chat)}
                    className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                      selectedChat?._id === chat._id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(chat.status)}`}>
                            {chat.status}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(chat.priority)}`}>
                            {chat.priority}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {chat.customer.name}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {chat.subject || 'No subject'}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">
                            {new Date(chat.lastActivity).toLocaleTimeString()}
                          </span>
                          {chat.unreadCount > 0 && (
                            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                              {chat.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
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
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedChat.status)}`}>
                      {selectedChat.status}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedChat.priority)}`}>
                      {selectedChat.priority}
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {selectedChat.messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${message.sender.name === 'Customer' ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender.name === 'Customer'
                          ? 'bg-gray-100 text-gray-900'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      <div className="text-sm font-medium mb-1">
                        {message.sender.name}
                      </div>
                      <div className="text-sm">{message.content}</div>
                      <div className={`text-xs mt-1 ${
                        message.sender.name === 'Customer' ? 'text-gray-500' : 'text-blue-100'
                      }`}>
                        {new Date(message.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Actions */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {selectedChat.status === 'waiting' && (
                      <button
                        onClick={() => handleAssignChat(selectedChat._id, 'current-user-id')}
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
                    <button
                      onClick={() => handleCloseChat(selectedChat._id)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <HiXCircle className="h-4 w-4 mr-1" />
                      Close
                    </button>
                  </div>
                  <div className="text-sm text-gray-500">
                    Started {new Date(selectedChat.createdAt).toLocaleDateString()}
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
