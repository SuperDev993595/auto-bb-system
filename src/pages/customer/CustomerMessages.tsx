import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { authService } from '../../services/auth';
import { customerApiService, Message as MessageType } from '../../services/customerApi';
import { MessageCircle, X, FileText, MessageSquare, Tag, Flag } from '../../utils/icons';
import ModalWrapper from '../../utils/ModalWrapper';

interface Message {
  id: string;
  sender: 'customer' | 'admin';
  senderName: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  attachments?: string[];
}

interface Conversation {
  id: string;
  subject: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: 'open' | 'closed' | 'pending';
  messages: Message[];
}

export default function CustomerMessages() {
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<MessageType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'read'>('all');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [newMessage, setNewMessage] = useState({
    subject: '',
    message: '',
    type: 'general' as const,
    priority: 'medium' as const
  });

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const response = await customerApiService.getMessages();
      if (response.success) {
        setMessages(response.data.messages);
      } else {
        toast.error(response.message || 'Failed to load messages');
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredMessages = messages.filter(message => {
    switch (activeTab) {
      case 'unread':
        return !message.isRead;
      case 'read':
        return message.isRead;
      default:
        return true;
    }
  });

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const response = await customerApiService.markMessageAsRead(messageId);
      if (!response.success) {
        toast.error(response.message || 'Failed to mark message as read');
        return;
      }
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, isRead: true } : msg
        )
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
      toast.error('Failed to mark message as read');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.subject.trim() || !newMessage.message.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await customerApiService.sendMessage({
        subject: newMessage.subject,
        message: newMessage.message,
        type: newMessage.type,
        priority: newMessage.priority
      });

      if (response.success) {
        setMessages(prev => [response.data.message, ...prev]);
      } else {
        toast.error(response.message || 'Failed to send message');
        return;
      }
      setNewMessage({ subject: '', message: '', type: 'general', priority: 'medium' });
      setShowNewMessageModal(false);
      toast.success('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const response = await customerApiService.deleteMessage(messageId);
      if (!response.success) {
        toast.error(response.message || 'Failed to delete message');
        return;
      }
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
      }
      toast.success('Message deleted successfully');
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-l-4 border-blue-500">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            <p className="text-gray-600">View messages from our service team</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowNewMessageModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              New Message
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
        {/* Messages List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <div className="flex space-x-2">
              {[
                { key: 'all', label: 'All', count: messages.length },
                { key: 'unread', label: 'Unread', count: messages.filter(m => !m.isRead).length },
                { key: 'read', label: 'Read', count: messages.filter(m => m.isRead).length }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-3 py-1 text-sm rounded-lg ${
                    activeTab === tab.key
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-y-auto h-80 custom-scrollbar">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                onClick={() => {
                  setSelectedMessage(message);
                  if (!message.isRead) {
                    handleMarkAsRead(message.id);
                  }
                }}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-900 truncate">
                    {message.subject}
                  </h3>
                  {!message.isRead && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      New
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 truncate mb-1">
                  {message.message}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {new Date(message.date).toLocaleDateString()}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    message.type === 'appointment' ? 'bg-blue-100 text-blue-700' :
                    message.type === 'reminder' ? 'bg-yellow-100 text-yellow-700' :
                    message.type === 'service' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {message.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Detail */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow">
          {selectedMessage ? (
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedMessage.subject}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      selectedMessage.type === 'appointment' ? 'bg-blue-100 text-blue-700' :
                      selectedMessage.type === 'reminder' ? 'bg-yellow-100 text-yellow-700' :
                      selectedMessage.type === 'service' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {selectedMessage.type}
                    </span>
                    <button
                      onClick={() => handleDeleteMessage(selectedMessage.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  From: {selectedMessage.from} • {new Date(selectedMessage.date).toLocaleString()}
                </div>
              </div>

              {/* Message Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-8 h-8 text-gray-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a message</h3>
                <p className="text-gray-600">Choose a message from the list to view its details.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Message Modal */}
      {showNewMessageModal && (
        <ModalWrapper
          isOpen={showNewMessageModal}
          onClose={() => setShowNewMessageModal(false)}
          title="Send New Message"
          icon={<MessageSquare className="w-5 h-5" />}
          submitText="Send Message"
          onSubmit={handleSendMessage}
          submitColor="bg-blue-600"
          size="lg"
        >
          <div className="p-6 space-y-6">
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Subject *
              </label>
              <input
                type="text"
                value={newMessage.subject}
                onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 hover:bg-white"
                placeholder="Enter message subject"
                required
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Message *
              </label>
              <textarea
                value={newMessage.message}
                onChange={(e) => setNewMessage(prev => ({ ...prev, message: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 hover:bg-white resize-none"
                rows={4}
                placeholder="Enter your message"
                required
              />
            </div>

            {/* Type and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Type
                </label>
                <select
                  value={newMessage.type}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 hover:bg-white"
                >
                  <option value="general">General</option>
                  <option value="appointment">Appointment</option>
                  <option value="service">Service</option>
                  <option value="support">Support</option>
                  <option value="reminder">Reminder</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Flag className="w-4 h-4" />
                  Priority
                </label>
                <select
                  value={newMessage.priority}
                  onChange={(e) => setNewMessage(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 hover:bg-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
}
