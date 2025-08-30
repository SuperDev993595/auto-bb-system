import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  User, 
  Cog,
  ChevronDown,
  AlertCircle,
  Paperclip,
  Smile,
  Clock,
  CheckCircle,
  Minimize2,
  Maximize2,
  Volume2,
  VolumeX
} from '../../utils/icons';
import { chatService, Chat, ChatMessage, CreateChatData } from '../../services/chatService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent' | 'system';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
}

interface ChatWidgetProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  theme?: 'light' | 'dark' | 'auto';
  size?: 'small' | 'medium' | 'large';
  autoOpen?: boolean;
  welcomeMessage?: string;
  companyName?: string;
  companyLogo?: string;
  primaryColor?: string;
  onChatStart?: (chatId: string) => void;
  onMessageSend?: (message: string) => void;
  onChatEnd?: () => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({
  position = 'bottom-right',
  theme = 'light',
  size = 'medium',
  autoOpen = false,
  welcomeMessage = "Hello! Welcome to our support chat. How can we help you today?",
  companyName = "Auto Repair Pro",
  companyLogo,
  primaryColor = "#3B82F6",
  onChatStart,
  onMessageSend,
  onChatEnd
}) => {
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [showCustomerForm, setShowCustomerForm] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Socket.io connection management
  useEffect(() => {
    const initializeSocket = () => {
      if (typeof window !== 'undefined' && (window as any).io) {
        const socket = (window as any).io('http://localhost:3001');
        
        socket.on('connect', () => {
          setIsConnected(true);
          console.log('Chat widget connected to server');
        });

        socket.on('disconnect', () => {
          setIsConnected(false);
          console.log('Chat widget disconnected from server');
        });

        socket.on('new-message', (data: { chatId: string; message: ChatMessage }) => {
          if (currentChat && data.chatId === currentChat._id) {
            const newMessage: Message = {
              id: data.message._id || Date.now().toString(),
              text: data.message.content,
              sender: data.message.sender.name === 'Customer' ? 'user' : 'agent',
              timestamp: new Date(data.message.createdAt),
              status: 'delivered'
            };
            setMessages(prev => [...prev, newMessage]);
            setUnreadCount(prev => prev + 1);
            
            // Play notification sound if not muted
            if (!isMuted) {
              playNotificationSound();
            }
          }
        });

        socket.on('agent-typing', (data: { chatId: string; isTyping: boolean }) => {
          if (currentChat && data.chatId === currentChat._id) {
            setIsTyping(data.isTyping);
          }
        });

        return () => {
          socket.disconnect();
        };
      }
    };

    const cleanup = initializeSocket();
    return cleanup;
  }, [currentChat, isMuted]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current && !showCustomerForm) {
      inputRef.current.focus();
    }
  }, [isOpen, showCustomerForm]);

  // Generate unique session ID for customer
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/sounds/notification.mp3');
      audio.volume = 0.3;
      audio.play().catch(() => {
        // Fallback: create a simple beep sound
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(context.destination);
        
        oscillator.frequency.value = 800;
        gainNode.gain.value = 0.1;
        
        oscillator.start();
        setTimeout(() => oscillator.stop(), 200);
      });
    } catch (error) {
      console.log('Could not play notification sound');
    }
  };

  const handleCustomerInfoSubmit = async () => {
    if (!customerInfo.name.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const chatData: CreateChatData = {
        customer: {
          name: customerInfo.name,
          email: customerInfo.email || undefined,
          phone: customerInfo.phone || undefined,
          sessionId: generateSessionId()
        },
        subject: 'Customer Inquiry',
        category: 'general',
        priority: 'medium',
        initialMessage: 'Hello! I need assistance.'
      };

      const response = await chatService.createChat(chatData);
      
      if (response.success) {
        setCurrentChat(response.data.chat);
        setShowCustomerForm(false);
        
        // Add welcome message
        setMessages([
          {
            id: '1',
            text: welcomeMessage,
            sender: 'agent',
            timestamp: new Date(),
            status: 'delivered'
          }
        ]);

        // Join chat room
        if (typeof window !== 'undefined' && (window as any).io) {
          const socket = (window as any).io('http://localhost:3001');
          socket.emit('join-chat', response.data.chat._id);
        }

        onChatStart?.(response.data.chat._id);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      setError('Failed to start chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentChat) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending'
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputMessage;
    setInputMessage('');

    try {
      // Send message to backend
      const response = await chatService.sendMessage(currentChat._id, {
        content: messageToSend,
        messageType: 'text'
      });

      if (response.success) {
        // Update message status to sent
        setMessages(prev => 
          prev.map(msg => 
            msg.id === userMessage.id 
              ? { ...msg, status: 'sent' as const }
              : msg
          )
        );

        onMessageSend?.(messageToSend);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Update message status to error
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: 'error' as const }
            : msg
        )
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (showCustomerForm) {
        handleCustomerInfoSubmit();
      } else {
        handleSendMessage();
      }
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowCustomerForm(true);
    setMessages([]);
    setCurrentChat(null);
    setCustomerInfo({ name: '', email: '', phone: '' });
    setError(null);
    setUnreadCount(0);
    onChatEnd?.();
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    setIsMaximized(false);
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
    setIsMinimized(false);
  };

  // Position classes
  const getPositionClasses = () => {
    switch (position) {
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      default:
        return 'bottom-4 right-4';
    }
  };

  // Size classes
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-72 h-80';
      case 'large':
        return 'w-96 h-[500px]';
      default:
        return 'w-80 h-96';
    }
  };

  // Theme classes
  const getThemeClasses = () => {
    switch (theme) {
      case 'dark':
        return 'bg-gray-900 text-white';
      case 'auto':
        return 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white';
      default:
        return 'bg-white text-gray-900';
    }
  };

  if (isMinimized) {
    return (
      <div className={`fixed ${getPositionClasses()} z-50`}>
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 relative"
          style={{ backgroundColor: primaryColor }}
        >
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] text-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed ${getPositionClasses()} z-50`}>
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center space-x-2 hover:scale-105"
          style={{ backgroundColor: primaryColor }}
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-sm font-medium">Chat with us</span>
        </button>
      ) : (
        <div className={`${getSizeClasses()} ${getThemeClasses()} rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col`}>
          {/* Header */}
          <div 
            className="text-white p-4 rounded-t-xl flex justify-between items-center"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center space-x-3">
              {companyLogo && (
                <img src={companyLogo} alt={companyName} className="w-8 h-8 rounded-full" />
              )}
              <div>
                <div className="font-semibold">{companyName}</div>
                <div className="text-xs opacity-90 flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
                  <span>{isConnected ? 'Online' : 'Offline'}</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-1">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="hover:bg-white hover:bg-opacity-20 p-1 rounded transition-all duration-300"
                title={isMuted ? 'Unmute notifications' : 'Mute notifications'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                onClick={handleMaximize}
                className="hover:bg-white hover:bg-opacity-20 p-1 rounded transition-all duration-300"
                title={isMaximized ? 'Restore' : 'Maximize'}
              >
                {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={handleMinimize}
                className="hover:bg-white hover:bg-opacity-20 p-1 rounded transition-all duration-300"
                title="Minimize"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={handleClose}
                className="hover:bg-white hover:bg-opacity-20 p-1 rounded transition-all duration-300"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            {showCustomerForm ? (
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Start a Chat</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Please provide your information to begin</p>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      onKeyPress={handleKeyPress}
                      placeholder="Your name"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                      onKeyPress={handleKeyPress}
                      placeholder="your.email@example.com"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Phone (optional)
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      onKeyPress={handleKeyPress}
                      placeholder="(555) 123-4567"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center space-x-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  onClick={handleCustomerInfoSubmit}
                  disabled={isLoading || !customerInfo.name.trim()}
                  className="w-full py-2 px-4 rounded-lg transition-all duration-300 disabled:cursor-not-allowed text-white font-medium"
                  style={{ 
                    backgroundColor: isLoading || !customerInfo.name.trim() ? '#9CA3AF' : primaryColor 
                  }}
                >
                  {isLoading ? 'Starting chat...' : 'Start Chat'}
                </button>
              </div>
            ) : (
              <>
                {/* Messages */}
                <div className="space-y-3 mb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-3 rounded-xl shadow-sm ${
                          message.sender === 'user'
                            ? 'text-white'
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700'
                        }`}
                        style={message.sender === 'user' ? { backgroundColor: primaryColor } : {}}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          {message.sender === 'user' ? (
                            <User className="w-3 h-3" />
                          ) : (
                            <Cog className="w-3 h-3" />
                          )}
                          <span className="text-xs opacity-75">
                            {message.sender === 'user' ? 'You' : companyName}
                          </span>
                          {message.status && (
                            <span className="text-xs opacity-75">
                              {message.status === 'sending' && <Clock className="w-3 h-3" />}
                              {message.status === 'sent' && <CheckCircle className="w-3 h-3" />}
                              {message.status === 'error' && <AlertCircle className="w-3 h-3" />}
                            </span>
                          )}
                        </div>
                        <p className="text-sm">{message.text}</p>
                        <p className="text-xs opacity-75 mt-2">
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {isTyping && (
                    <div className="flex justify-start">
                      <div className="bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-2">
                          <Cog className="w-3 h-3" />
                          <span className="text-xs">Agent is typing...</span>
                        </div>
                        <div className="flex space-x-1 mt-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex space-x-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim()}
                      className="p-2 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-none text-white disabled:opacity-50"
                      style={{ backgroundColor: !inputMessage.trim() ? '#9CA3AF' : primaryColor }}
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Press Enter to send • Usually responds in a few seconds
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
