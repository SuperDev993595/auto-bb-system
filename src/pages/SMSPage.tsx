import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  HiPhone, 
  HiUsers, 
  HiTemplate, 
  HiPaperAirplane, 
  HiPlus, 
  HiEye, 
  HiPencil, 
  HiTrash,
  HiClock,
  HiCheckCircle,
  HiXCircle,
  HiExclamation,
  HiChartBar
} from 'react-icons/hi';
import PageTitle from '../components/Shared/PageTitle';
import smsService, { 
  SMSTemplate, 
  SMSRecord, 
  SMSStats, 
  SendSMSData, 
  BulkSMSData,
  SMSFilters,
  SMSTemplateFilters
} from '../services/sms';

export default function SMSPage() {
  const [templates, setTemplates] = useState<SMSTemplate[]>([]);
  const [smsHistory, setSmsHistory] = useState<SMSRecord[]>([]);
  const [stats, setStats] = useState<SMSStats>({
    totalSent: 0,
    delivered: 0,
    failed: 0,
    pending: 0,
    deliveryRate: 0,
    totalCost: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'send' | 'templates' | 'history' | 'analytics'>('send');
  
  // Form states
  const [sendForm, setSendForm] = useState({
    to: '',
    message: '',
    scheduledAt: '',
    priority: 'normal'
  });
  
  const [bulkForm, setBulkForm] = useState({
    recipients: '',
    message: '',
    scheduledAt: '',
    priority: 'normal'
  });

  useEffect(() => {
    loadSMSData();
  }, []);

  const loadSMSData = async () => {
    try {
      setLoading(true);
      
      const [templatesRes, analyticsRes, historyRes] = await Promise.all([
        smsService.getTemplates().catch(() => ({ success: true, data: [] })),
        smsService.getAnalytics().catch(() => ({ success: true, data: { overview: stats } })),
        smsService.getHistory().catch(() => ({ data: [], pagination: { currentPage: 1, totalPages: 1, totalRecords: 0, hasNext: false, hasPrev: false } }))
      ]);

      setTemplates(templatesRes.data || []);
      setSmsHistory(historyRes.data || []);
      
      if (analyticsRes.data?.overview) {
        setStats(analyticsRes.data.overview);
      }

    } catch (error) {
      console.error('Error loading SMS data:', error);
      toast.error('Failed to load SMS data');
    } finally {
      setLoading(false);
    }
  };

  const handleSendSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sendForm.to || !sendForm.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const response = await smsService.sendSMS({
        to: sendForm.to,
        message: sendForm.message,
        scheduledAt: sendForm.scheduledAt || undefined,
        priority: sendForm.priority
      });

      if (response.success) {
        toast.success('SMS sent successfully');
        setSendForm({ to: '', message: '', scheduledAt: '', priority: 'normal' });
        loadSMSData();
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast.error('Failed to send SMS');
    }
  };

  const handleBulkSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bulkForm.recipients || !bulkForm.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Parse recipients (comma-separated phone numbers)
    const recipients = bulkForm.recipients.split(',').map(phone => phone.trim()).filter(phone => phone);
    
    if (recipients.length === 0) {
      toast.error('Please enter at least one valid phone number');
      return;
    }

    try {
      const response = await smsService.sendBulkSMS({
        recipients: recipients.map(phone => ({ phone })),
        message: bulkForm.message,
        scheduledAt: bulkForm.scheduledAt || undefined,
        priority: bulkForm.priority as 'low' | 'normal' | 'high'
      });

      if (response.success) {
        toast.success(`Bulk SMS sent to ${recipients.length} recipients`);
        setBulkForm({ recipients: '', message: '', scheduledAt: '', priority: 'normal' });
        loadSMSData();
      }
    } catch (error) {
      console.error('Error sending bulk SMS:', error);
      toast.error('Failed to send bulk SMS');
    }
  };

  const handleTemplateSelect = (template: SMSTemplate) => {
    setSendForm(prev => ({
      ...prev,
      message: template.message
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <HiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'sent':
        return <HiClock className="w-5 h-5 text-blue-500" />;
      case 'failed':
        return <HiXCircle className="w-5 h-5 text-red-500" />;
      default:
        return <HiExclamation className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <PageTitle title="SMS Messaging" />
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <HiPhone className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Sent</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSent}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <HiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Delivered</p>
              <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <HiXCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.failed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <HiChartBar className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Delivery Rate</p>
              <p className="text-2xl font-bold text-gray-900">{stats.deliveryRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'send', label: 'Send SMS', icon: HiPhone },
              { id: 'templates', label: 'Templates', icon: HiTemplate },
              { id: 'history', label: 'History', icon: HiClock },
              { id: 'analytics', label: 'Analytics', icon: HiChartBar }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'send' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Single SMS */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Send Single SMS</h3>
                <form onSubmit={handleSendSMS} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={sendForm.to}
                      onChange={(e) => setSendForm(prev => ({ ...prev, to: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+1234567890"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      value={sendForm.message}
                      onChange={(e) => setSendForm(prev => ({ ...prev, message: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your message..."
                      maxLength={1600}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {sendForm.message.length}/1600 characters
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Schedule (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={sendForm.scheduledAt}
                        onChange={(e) => setSendForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        value={sendForm.priority}
                        onChange={(e) => setSendForm(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                  >
                    <HiPaperAirplane className="w-5 h-5 mr-2" />
                    Send SMS
                  </button>
                </form>
              </div>

              {/* Bulk SMS */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Send Bulk SMS</h3>
                <form onSubmit={handleBulkSMS} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Numbers *
                    </label>
                    <textarea
                      value={bulkForm.recipients}
                      onChange={(e) => setBulkForm(prev => ({ ...prev, recipients: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+1234567890, +1234567891, +1234567892"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Separate multiple phone numbers with commas
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message *
                    </label>
                    <textarea
                      value={bulkForm.message}
                      onChange={(e) => setBulkForm(prev => ({ ...prev, message: e.target.value }))}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your message..."
                      maxLength={1600}
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {bulkForm.message.length}/1600 characters
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Schedule (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={bulkForm.scheduledAt}
                        onChange={(e) => setBulkForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        value={bulkForm.priority}
                        onChange={(e) => setBulkForm(prev => ({ ...prev, priority: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center"
                  >
                    <HiUsers className="w-5 h-5 mr-2" />
                    Send Bulk SMS
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">SMS Templates</h3>
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <HiPlus className="h-5 w-5 mr-2" />
                  Create Template
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <div key={template.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-gray-900">{template.name}</h4>
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {template.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-3">{template.message}</p>
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => handleTemplateSelect(template)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Use Template
                      </button>
                      <div className="flex space-x-2">
                        <button className="text-gray-600 hover:text-gray-800">
                          <HiEye className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-800">
                          <HiPencil className="w-4 h-4" />
                        </button>
                        <button className="text-red-600 hover:text-red-800">
                          <HiTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-6">SMS History</h3>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sent At</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivered At</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {smsHistory.map((sms) => (
                      <tr key={sms.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {sms.to}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {sms.message}
                          </div>
                          {sms.errorMessage && (
                            <div className="text-xs text-red-600 mt-1">
                              Error: {sms.errorMessage}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(sms.status)}
                            <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(sms.status)}`}>
                              {sms.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(sms.sentAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sms.deliveredAt ? new Date(sms.deliveredAt).toLocaleString() : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-6">SMS Analytics</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Metrics */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Sent</span>
                      <span className="text-sm font-medium text-gray-900">{stats.totalSent}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Delivered</span>
                      <span className="text-sm font-medium text-gray-900">{stats.delivered}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Failed</span>
                      <span className="text-sm font-medium text-gray-900">{stats.failed}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Delivery Rate</span>
                      <span className="text-sm font-medium text-gray-900">{stats.deliveryRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow p-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h4>
                  <div className="space-y-3">
                    {smsHistory.slice(0, 5).map((sms) => (
                      <div key={sms.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{sms.to}</p>
                          <p className="text-xs text-gray-500">
                            {sms.message.substring(0, 50)}...
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center">
                            {getStatusIcon(sms.status)}
                            <span className={`ml-1 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(sms.status)}`}>
                              {sms.status}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(sms.sentAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
