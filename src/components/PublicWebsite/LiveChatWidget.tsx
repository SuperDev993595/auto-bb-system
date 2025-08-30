import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  User, 
  Cog,
  ChevronDown,
  AlertCircle
} from '../../utils/icons';
import { chatService, Chat, ChatMessage, CreateChatData } from '../../services/chatService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

const LiveChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current && !showCustomerForm) {
      inputRef.current.focus();
    }
  }, [isOpen, showCustomerForm]);

  // Generate unique session ID for customer
  const generateSessionId = () => {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
        
        // Add initial messages
        setMessages([
          {
            id: '1',
            text: 'Hello! Welcome to Auto Repair Pro. How can we help you today?',
            sender: 'agent',
            timestamp: new Date()
          },
          {
            id: '2',
            text: 'Thank you for contacting us. An agent will be with you shortly.',
            sender: 'agent',
            timestamp: new Date()
          }
        ]);
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
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Send message to backend
      await chatService.sendMessage(currentChat._id, {
        content: inputMessage,
        messageType: 'text'
      });

      // Simulate agent response (in real implementation, this would come from socket.io)
      setTimeout(() => {
        const agentMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: getAutoResponse(inputMessage),
          sender: 'agent',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, agentMessage]);
        setIsTyping(false);
      }, 1000 + Math.random() * 2000);

    } catch (error) {
      console.error('Error sending message:', error);
      setIsTyping(false);
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, there was an error sending your message. Please try again.',
        sender: 'agent',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const getAutoResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('appointment') || message.includes('book') || message.includes('schedule')) {
      return 'Great! You can book an appointment through our website or call us at (555) 123-4567. What type of service do you need?';
    }
    
    if (message.includes('price') || message.includes('cost') || message.includes('quote')) {
      return 'Our prices vary depending on the service needed. You can view our service prices on our website, or call us for a detailed quote. What specific service are you looking for?';
    }
    
    if (message.includes('hours') || message.includes('open') || message.includes('time')) {
      return 'We\'re open Monday through Friday from 8:00 AM to 6:00 PM, and Saturdays from 9:00 AM to 4:00 PM. We\'re closed on Sundays.';
    }
    
    if (message.includes('emergency') || message.includes('urgent') || message.includes('help')) {
      return 'For emergency services, please call our emergency line at (555) 123-4568. We provide 24/7 roadside assistance and emergency repairs.';
    }
    
    if (message.includes('location') || message.includes('address') || message.includes('where')) {
      return 'We\'re located at 123 Auto Repair Street, City, State 12345. You can find directions on our website or call us for assistance.';
    }
    
    return 'Thank you for your message! A live agent will be with you shortly. In the meantime, you can also call us at (555) 123-4567 for immediate assistance.';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
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
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-3 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center space-x-2 hover:scale-105"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-sm font-medium">Chat with us</span>
        </button>
      ) : (
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 w-80 h-96 flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-xl flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span className="font-semibold">Live Chat</span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setIsMinimized(true)}
                className="hover:bg-blue-700 p-1 rounded-lg transition-all duration-300"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
              <button
                onClick={handleClose}
                className="hover:bg-blue-700 p-1 rounded-lg transition-all duration-300"
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
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Start a Chat</h3>
                  <p className="text-sm text-gray-600">Please provide your information to begin</p>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      onKeyPress={handleKeyPress}
                      placeholder="Your name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email (optional)
                    </label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                      onKeyPress={handleKeyPress}
                      placeholder="your.email@example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone (optional)
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      onKeyPress={handleKeyPress}
                      placeholder="(555) 123-4567"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-2 px-4 rounded-lg transition-all duration-300 disabled:cursor-not-allowed"
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
                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                            : 'bg-gray-50 text-gray-800 border border-gray-200'
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-2">
                          {message.sender === 'user' ? (
                            <User className="w-3 h-3" />
                          ) : (
                            <Cog className="w-3 h-3" />
                          )}
                          <span className="text-xs opacity-75">
                            {message.sender === 'user' ? 'You' : 'Auto Repair Pro'}
                          </span>
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
                      <div className="bg-gray-50 text-gray-800 px-4 py-3 rounded-xl border border-gray-200">
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
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex space-x-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim()}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white p-2 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-none"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
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

export default LiveChatWidget;
