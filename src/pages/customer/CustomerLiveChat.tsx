import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { MessageCircle, Send, Clock, RefreshCw, Phone, Mail } from '../../utils/icons';
import socketService from '../../services/socketService';
import api from '../../services/api';

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
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject?: string;
  category: 'general' | 'service' | 'billing' | 'technical' | 'complaint' | 'other';
  messages: Message[];
  lastActivity: string;
  createdAt: string;
}

export default function CustomerLiveChat() {
  const [chat, setChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '', email: '', phone: '', subject: '', category: 'general' as const
  });
  const [showCustomerForm, setShowCustomerForm] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(`customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    // Connect to socket service
    socketService.connect();
    
    // Set up event listeners
    const unsubscribeConnection = socketService.onConnection((connected) => {
      setIsConnected(connected);
    });

    const unsubscribeMessage = socketService.onMessage((data) => {
      if (data.chatId === chat?._id) {
        setChat(prev => prev ? {
          ...prev,
          messages: [...prev.messages, data.message],
          lastActivity: new Date().toISOString()
        } : null);
      }
    });

    const unsubscribeTyping = socketService.onTyping((data) => {
      if (data.userId !== sessionId.current) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    });

    const unsubscribeAssignment = socketService.onAssignment((data) => {
      if (data.chatId === chat?._id) {
        toast.success(`Chat assigned to ${data.assignedTo || 'an agent'}`);
        if (chat?._id) {
          fetchChat(chat._id);
        }
      }
    });

    const unsubscribeStatusChange = socketService.onStatusChange((data) => {
      if (data.chatId === chat?._id) {
        toast.success(`Chat status changed to ${data.status}`);
        if (chat?._id) {
          fetchChat(chat._id);
        }
      }
    });

    return () => {
      unsubscribeConnection();
      unsubscribeMessage();
      unsubscribeTyping();
      unsubscribeAssignment();
      unsubscribeStatusChange();
    };
  }, [chat?._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat?.messages]);

  const fetchChat = async (chatId: string) => {
    try {
      const response = await api.get(`/chat/${chatId}`);
      setChat(response.data.data.chat);
    } catch (error) {
      console.error('Error fetching chat:', error);
      toast.error('Failed to load chat');
    }
  };

  const createNewChat = async () => {
    if (!customerInfo.name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/chat', {
        customer: {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
          sessionId: sessionId.current
        },
        subject: customerInfo.subject,
        category: customerInfo.category,
        initialMessage: `Customer ${customerInfo.name} started a chat about: ${customerInfo.subject || 'General inquiry'}`
      });

      const newChat = response.data.data.chat;
      setChat(newChat);
      setShowCustomerForm(false);

      socketService.joinChat(newChat._id);

      toast.success('Chat started successfully!');
    } catch (error) {
      console.error('Error creating chat:', error);
      toast.error('Failed to start chat');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chat) return;

    setSendingMessage(true);
    try {
      const response = await api.post(`/chat/${chat._id}/messages`, {
        content: newMessage,
        messageType: 'text'
      });

      const message = response.data.data.message;

      setChat(prev => prev ? {
        ...prev,
        messages: [...prev.messages, message],
        lastActivity: new Date().toISOString()
      } : null);

      socketService.sendMessage(chat._id, message, sessionId.current);

      setNewMessage('');
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

  if (showCustomerForm) {
    return (
      <div className="space-y-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <MessageCircle className="w-8 h-8 text-blue-600" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Start a Live Chat</h1>
              <p className="text-gray-600">Get instant support from our team</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); createNewChat(); }} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={customerInfo.subject}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="What can we help you with?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={customerInfo.category}
                  onChange={(e) => setCustomerInfo(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="general">General Inquiry</option>
                  <option value="service">Service Request</option>
                  <option value="billing">Billing Question</option>
                  <option value="technical">Technical Support</option>
                  <option value="complaint">Complaint</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                    Starting Chat...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Start Chat
                  </div>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 rounded-full">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold">Live Chat Support</h1>
                  <div className="flex items-center space-x-4 text-sm text-blue-100">
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                      <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                    </div>
                    {chat && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-white bg-opacity-20">
                        {chat.status.charAt(0).toUpperCase() + chat.status.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {chat?.assignedTo && (
                <div className="text-right">
                  <p className="text-sm text-blue-100">Assigned to</p>
                  <p className="font-medium">{chat.assignedTo.name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="h-96 overflow-y-auto p-6 bg-gray-50">
            {chat?.messages.map((message, index) => (
              <div key={message._id || index} className={`mb-4 ${message.sender.name === 'Customer' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender.name === 'Customer' 
                    ? 'bg-blue-600 text-white' 
                    : message.messageType === 'system'
                    ? 'bg-gray-200 text-gray-700 text-center mx-auto'
                    : 'bg-white text-gray-900 border border-gray-200'
                }`}>
                  {message.messageType === 'system' ? (
                    <div className="flex items-center justify-center space-x-1 text-xs">
                      <Clock className="w-3 h-3" />
                      <span>{message.content}</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-sm font-medium mb-1">{message.sender.name}</div>
                      <div className="text-sm">{message.content}</div>
                      <div className={`text-xs mt-1 ${
                        message.sender.name === 'Customer' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.createdAt)}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="text-left mb-4">
                <div className="inline-block bg-white text-gray-900 border border-gray-200 px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-1 text-sm text-gray-600">
                    <span>Agent is typing</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!isConnected || sendingMessage}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || !isConnected || sendingMessage}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {sendingMessage ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Chat Info */}
        {chat && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Chat Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Customer</label>
                <p className="text-sm text-gray-900">{chat.customer.name}</p>
                {chat.customer.email && (
                  <p className="text-xs text-gray-500 flex items-center">
                    <Mail className="w-3 h-3 mr-1" />
                    {chat.customer.email}
                  </p>
                )}
                {chat.customer.phone && (
                  <p className="text-xs text-gray-500 flex items-center">
                    <Phone className="w-3 h-3 mr-1" />
                    {chat.customer.phone}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Subject</label>
                <p className="text-sm text-gray-900">{chat.subject || 'No subject'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <p className="text-sm text-gray-900 capitalize">{chat.category}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Started</label>
                <p className="text-sm text-gray-900">
                  {new Date(chat.createdAt).toLocaleDateString()} at {formatTime(chat.createdAt)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
