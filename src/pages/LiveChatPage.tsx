import React, { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import PageTitle from '../components/Shared/PageTitle';
import ChatDashboard from '../components/Chat/ChatDashboard';
import { ChatProvider } from '../components/Chat/ChatProvider';
import { authService } from '../services/auth';
import { useNavigate } from 'react-router-dom';

export default function LiveChatPage() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication on component mount
    if (!authService.isAuthenticated()) {
      toast.error('Please login to access chat management');
      navigate('/auth/login');
      return;
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <PageTitle title="Live Chat Management" />
        <p className="text-gray-600">Manage and monitor live chat conversations with customers</p>
      </div>

      {/* Chat Dashboard */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <ChatProvider>
          <ChatDashboard className="min-h-[calc(100vh-300px)]" />
        </ChatProvider>
      </div>
    </div>
  );
}
