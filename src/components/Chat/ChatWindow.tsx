import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  User, 
  Cog, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Paperclip,
  Smile,
  Phone,
  Mail,
  Calendar,
  Tag,
  MessageSquare,
  Archive,
  CheckSquare
} from '../../utils/icons';
import { Chat, ChatMessage } from '../../services/chatService';
import { useChat } from './ChatProvider';

interface ChatWindowProps {
  chat: Chat;
  onClose: () => void;
  onAssign: (chatId: string, assignedTo: string) => void;
  onResolve: (chatId: string, notes?: string) => void;
  onCloseChat: (chatId: string, notes?: string) => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  onClose,
  onAssign,
  onResolve,
  onCloseChat
}) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [assignTo, setAssignTo] = useState('');
  const [notes, setNotes] = useState('');
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [actionType, setActionType] = useState<'resolve' | 'close' | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { sendMessage, markAsRead } = useChat();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Mark messages as read when chat is opened
  useEffect(() => {
    const markMessagesAsRead = async () => {
      await markAsRead(chat._id);
    };
    markMessagesAsRead();
  }, [chat._id, markAsRead]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const messageToSend = inputMessage;
    setInputMessage('');
    setIsTyping(true);

    try {
      await sendMessage(chat._id, messageToSend);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAssign = () => {
    if (assignTo.trim()) {
      onAssign(chat._id, assignTo);
      setAssignTo('');
      setShowActions(false);
    }
  };

  const handleResolve = () => {
    setActionType('resolve');
    setShowNotesModal(true);
  };

  const handleCloseChat = () => {
    setActionType('close');
    setShowNotesModal(true);
  };

  const handleActionConfirm = () => {
    if (actionType === 'resolve') {
      onResolve(chat._id, notes);
    } else if (actionType === 'close') {
      onCloseChat(chat._id, notes);
    }
    setShowNotesModal(false);
    setNotes('');
    setActionType(null);
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

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg shadow-lg">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h5 className="font-semibold text-gray-900">{chat.customer.name}</h5>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(chat.status)}`}>
                {chat.status}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(chat.priority)}`}>
                {chat.priority}
              </span>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              {chat.customer.email && (
                <div className="flex items-center space-x-1">
                  <Mail className="w-3 h-3" />
                  <span>{chat.customer.email}</span>
                </div>
              )}
              {chat.customer.phone && (
                <div className="flex items-center space-x-1">
                  <Phone className="w-3 h-3" />
                  <span>{chat.customer.phone}</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(chat.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
              title="Actions"
            >
              <Tag className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
              title="Close"
            >
              <AlertCircle className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Actions Dropdown */}
        {showActions && (
          <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign to
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={assignTo}
                    onChange={(e) => setAssignTo(e.target.value)}
                    placeholder="Enter user ID or name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleAssign}
                    disabled={!assignTo.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Assign
                  </button>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleResolve}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-1"
                >
                  <CheckSquare className="w-4 h-4" />
                  <span>Resolve</span>
                </button>
                <button
                  onClick={handleCloseChat}
                  className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-1"
                >
                  <Archive className="w-4 h-4" />
                  <span>Close</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chat.messages.map((message) => (
          <div
            key={message._id}
            className={`flex ${message.sender.name === 'Customer' ? 'justify-start' : 'justify-end'}`}
          >
            <div
              className={`max-w-xs px-4 py-3 rounded-xl shadow-sm ${
                message.sender.name === 'Customer'
                  ? 'bg-gray-50 text-gray-800 border border-gray-200'
                  : 'bg-blue-600 text-white'
              }`}
            >
              <div className="flex items-center space-x-2 mb-2">
                {message.sender.name === 'Customer' ? (
                  <User className="w-3 h-3" />
                ) : (
                  <Cog className="w-3 h-3" />
                )}
                <span className="text-xs opacity-75">
                  {message.sender.name === 'Customer' ? chat.customer.name : 'Agent'}
                </span>
                <span className="text-xs opacity-75">
                  {new Date(message.createdAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <p className={`text-sm ${message.sender.name === 'Customer' ? 'text-gray-800' : 'text-white'}`}>{message.content}</p>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-end">
            <div className="bg-blue-600 text-white px-4 py-3 rounded-xl">
              <div className="flex items-center space-x-2">
                <Cog className="w-3 h-3" />
                <span className="text-xs">Typing...</span>
              </div>
              <div className="flex space-x-1 mt-2">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 p-4">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">
              {actionType === 'resolve' ? 'Resolve Chat' : 'Close Chat'}
            </h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes (optional)..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              rows={3}
            />
            <div className="flex space-x-2">
              <button
                onClick={() => setShowNotesModal(false)}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleActionConfirm}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWindow;
