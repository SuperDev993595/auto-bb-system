import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  Phone,
  Video,
  Send,
  Paperclip,
  Smile,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Bot,
  Headphones,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Volume2,
  VolumeX,
  Settings,
  Minimize,
  Maximize
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'customer' | 'agent' | 'system';
  content: string;
  timestamp: string;
  type: 'text' | 'image' | 'file' | 'voice';
  status: 'sent' | 'delivered' | 'read';
  attachments?: string[];
}

interface Agent {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'busy' | 'offline';
  department: string;
  rating: number;
}

interface RealTimeCommunicationProps {
  customerId: string;
  onClose?: () => void;
}

export default function RealTimeCommunication({
  customerId,
  onClose
}: RealTimeCommunicationProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [chatStatus, setChatStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeChat();
    scrollToBottom();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      // Simulate connecting to chat
      setTimeout(() => {
        setChatStatus('connected');
        setCurrentAgent({
          id: '1',
          name: 'Sarah Johnson',
          avatar: '/avatars/agent1.jpg',
          status: 'online',
          department: 'Technical Support',
          rating: 4.8
        });
        
        // Add welcome message
        addMessage({
          id: '1',
          sender: 'system',
          content: 'Welcome! You are now connected to our support team.',
          timestamp: new Date().toISOString(),
          type: 'text',
          status: 'read'
        });
      }, 2000);
    } catch (error) {
      console.error('Error initializing chat:', error);
      setChatStatus('disconnected');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: 'customer',
      content: newMessage,
      timestamp: new Date().toISOString(),
      type: 'text',
      status: 'sent'
    };

    addMessage(message);
    setNewMessage('');
    setIsTyping(false);

    // Simulate agent response
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        const agentResponse: Message = {
          id: (Date.now() + 1).toString(),
          sender: 'agent',
          content: 'Thank you for your message. I\'m here to help you with any questions or concerns you may have.',
          timestamp: new Date().toISOString(),
          type: 'text',
          status: 'read'
        };
        addMessage(agentResponse);
        setIsTyping(false);
      }, 2000);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-600';
      case 'busy':
        return 'text-yellow-600';
      case 'offline':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Clock className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCircle className="w-3 h-3 text-blue-500" />;
      case 'read':
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      default:
        return null;
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-900">Live Chat</span>
            <button
              onClick={() => setIsMinimized(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-lg shadow-xl border border-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <h3 className="font-semibold">Live Support</h3>
              <p className="text-sm text-blue-100">
                {chatStatus === 'connected' ? 'Connected' : 
                 chatStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="text-blue-100 hover:text-white"
            >
              <Minimize className="w-4 h-4" />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="text-blue-100 hover:text-white"
              >
                ×
              </button>
            )}
          </div>
        </div>
        
        {/* Agent Info */}
        {currentAgent && (
          <div className="mt-3 flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">{currentAgent.name}</p>
              <p className="text-xs text-blue-100">{currentAgent.department}</p>
            </div>
            <div className="flex items-center space-x-1">
              <span className={`w-2 h-2 rounded-full ${getStatusColor(currentAgent.status)}`}></span>
              <span className="text-xs">{currentAgent.status}</span>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-3 py-2 rounded-lg ${
                message.sender === 'customer'
                  ? 'bg-blue-600 text-white'
                  : message.sender === 'system'
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs opacity-70">
                  {formatTime(message.timestamp)}
                </span>
                {message.sender === 'customer' && (
                  <div className="ml-2">
                    {getMessageStatusIcon(message.status)}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-900 px-3 py-2 rounded-lg">
              <div className="flex items-center space-x-1">
                <span className="text-sm">Agent is typing</span>
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-gray-600 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-gray-400 hover:text-gray-600"
          >
            <Smile className="w-5 h-5" />
          </button>
          <button className="text-gray-400 hover:text-gray-600">
            <Paperclip className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={1}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button className="text-gray-400 hover:text-gray-600">
              <Phone className="w-4 h-4" />
            </button>
            <button className="text-gray-400 hover:text-gray-600">
              <Video className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`${isMuted ? 'text-red-500' : 'text-gray-400'} hover:text-gray-600`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
