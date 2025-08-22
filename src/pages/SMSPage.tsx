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
        priority: sendForm.priority as 'low' | 'normal' | 'high'
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
        return <HiCheckCircle className="w-5 h-5 text-success-500" />;
      case 'sent':
        return <HiClock className="w-5 h-5 text-info-500" />;
      case 'failed':
        return <HiXCircle className="w-5 h-5 text-error-500" />;
      default:
        return <HiExclamation className="w-5 h-5 text-warning-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'status-success';
      case 'sent':
        return 'status-info';
      case 'failed':
        return 'status-error';
      default:
        return 'status-warning';
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Loading SMS data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <PageTitle title="SMS Messaging" />
      </div>
      
      {/* Stats Overview */}
      <div className="grid-responsive mb-8">
        <div className="stats-card">
          <div className="flex items-center">
            <div className="stats-icon bg-info-100">
              <HiPhone className="w-6 h-6 text-info-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Total Sent</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.totalSent}</p>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center">
            <div className="stats-icon bg-success-100">
              <HiCheckCircle className="w-6 h-6 text-success-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Delivered</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.delivered}</p>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center">
            <div className="stats-icon bg-error-100">
              <HiXCircle className="w-6 h-6 text-error-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Failed</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.failed}</p>
            </div>
          </div>
        </div>

        <div className="stats-card">
          <div className="flex items-center">
            <div className="stats-icon bg-primary-100">
              <HiChartBar className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Delivery Rate</p>
              <p className="text-2xl font-bold text-secondary-900">{stats.deliveryRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card mb-6">
        <div className="tab-container">
          <div className="tab-header">
            <nav className="tab-buttons">
              {[
                { id: 'send', label: 'Send SMS', icon: HiPhone },
                { id: 'templates', label: 'Templates', icon: HiTemplate },
                { id: 'history', label: 'History', icon: HiClock },
                { id: 'analytics', label: 'Analytics', icon: HiChartBar }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`tab-button ${activeTab === tab.id ? 'tab-button-active' : 'tab-button-inactive'}`}
                >
                  <tab.icon className="w-5 h-5 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

        <div className="tab-content">
          {activeTab === 'send' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Single SMS */}
              <div>
                <h3 className="page-subtitle mb-4">Send Single SMS</h3>
                <form onSubmit={handleSendSMS} className="space-y-4">
                  <div>
                    <label className="form-label">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={sendForm.to}
                      onChange={(e) => setSendForm(prev => ({ ...prev, to: e.target.value }))}
                      className="input-field"
                      placeholder="+1234567890"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="form-label">
                      Message *
                    </label>
                    <textarea
                      value={sendForm.message}
                      onChange={(e) => setSendForm(prev => ({ ...prev, message: e.target.value }))}
                      rows={4}
                      className="input-field"
                      placeholder="Enter your message..."
                      maxLength={1600}
                      required
                    />
                    <p className="text-xs text-secondary-500 mt-1">
                      {sendForm.message.length}/1600 characters
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">
                        Schedule (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={sendForm.scheduledAt}
                        onChange={(e) => setSendForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
                        className="input-field"
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">
                        Priority
                      </label>
                      <select
                        value={sendForm.priority}
                        onChange={(e) => setSendForm(prev => ({ ...prev, priority: e.target.value }))}
                        className="select-field"
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="btn-primary w-full"
                  >
                    <HiPaperAirplane className="w-5 h-5 mr-2" />
                    Send SMS
                  </button>
                </form>
              </div>

              {/* Bulk SMS */}
              <div>
                <h3 className="page-subtitle mb-4">Send Bulk SMS</h3>
                <form onSubmit={handleBulkSMS} className="space-y-4">
                  <div>
                    <label className="form-label">
                      Phone Numbers *
                    </label>
                    <textarea
                      value={bulkForm.recipients}
                      onChange={(e) => setBulkForm(prev => ({ ...prev, recipients: e.target.value }))}
                      rows={3}
                      className="input-field"
                      placeholder="+1234567890, +1234567891, +1234567892"
                      required
                    />
                    <p className="text-xs text-secondary-500 mt-1">
                      Separate multiple phone numbers with commas
                    </p>
                  </div>
                  
                  <div>
                    <label className="form-label">
                      Message *
                    </label>
                    <textarea
                      value={bulkForm.message}
                      onChange={(e) => setBulkForm(prev => ({ ...prev, message: e.target.value }))}
                      rows={4}
                      className="input-field"
                      placeholder="Enter your message..."
                      maxLength={1600}
                      required
                    />
                    <p className="text-xs text-secondary-500 mt-1">
                      {bulkForm.message.length}/1600 characters
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">
                        Schedule (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        value={bulkForm.scheduledAt}
                        onChange={(e) => setBulkForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
                        className="input-field"
                      />
                    </div>
                    
                    <div>
                      <label className="form-label">
                        Priority
                      </label>
                      <select
                        value={bulkForm.priority}
                        onChange={(e) => setBulkForm(prev => ({ ...prev, priority: e.target.value }))}
                        className="select-field"
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                  
                  <button
                    type="submit"
                    className="btn-success w-full"
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
                <h3 className="page-subtitle">SMS Templates</h3>
                <button className="btn-primary">
                  <HiPlus className="h-5 w-5 mr-2" />
                  Create Template
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <div key={template._id} className="card hover-lift">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-medium text-secondary-900">{template.name}</h4>
                      <span className="status-badge bg-primary-100 text-primary-800">
                        {template.category}
                      </span>
                    </div>
                    <p className="text-sm text-secondary-600 mb-4 line-clamp-3">{template.message}</p>
                    <div className="flex justify-between items-center">
                      <button
                        onClick={() => handleTemplateSelect(template)}
                        className="text-primary-600 hover:text-primary-800 text-sm font-medium transition-colors"
                      >
                        Use Template
                      </button>
                      <div className="flex space-x-2">
                        <button className="text-secondary-600 hover:text-secondary-800 transition-colors">
                          <HiEye className="w-4 h-4" />
                        </button>
                        <button className="text-secondary-600 hover:text-secondary-800 transition-colors">
                          <HiPencil className="w-4 h-4" />
                        </button>
                        <button className="text-error-600 hover:text-error-800 transition-colors">
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
              <h3 className="page-subtitle mb-6">SMS History</h3>
              
              <div className="table-container">
                <table className="table">
                  <thead className="table-header">
                    <tr>
                      <th className="table-header-cell">Phone</th>
                      <th className="table-header-cell">Message</th>
                      <th className="table-header-cell">Status</th>
                      <th className="table-header-cell">Sent At</th>
                      <th className="table-header-cell">Delivered At</th>
                    </tr>
                  </thead>
                  <tbody className="table-body">
                    {smsHistory.map((sms) => (
                      <tr key={sms._id} className="table-row">
                        <td className="table-cell whitespace-nowrap text-secondary-900">
                          {sms.to}
                        </td>
                        <td className="table-cell">
                          <div className="text-sm text-secondary-900 max-w-xs truncate">
                            {sms.message}
                          </div>
                          {sms.errorMessage && (
                            <div className="text-xs text-error-600 mt-1">
                              Error: {sms.errorMessage}
                            </div>
                          )}
                        </td>
                        <td className="table-cell whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(sms.status)}
                            <span className={`ml-2 status-badge ${getStatusColor(sms.status)}`}>
                              {sms.status}
                            </span>
                          </div>
                        </td>
                        <td className="table-cell whitespace-nowrap text-secondary-500">
                          {sms.sentAt ? new Date(sms.sentAt).toLocaleString() : '-'}
                        </td>
                        <td className="table-cell whitespace-nowrap text-secondary-500">
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
              <h3 className="page-subtitle mb-6">SMS Analytics</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Metrics */}
                <div className="card">
                  <h4 className="page-subtitle mb-4">Performance Metrics</h4>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-secondary-600">Total Sent</span>
                      <span className="text-sm font-medium text-secondary-900">{stats.totalSent}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-secondary-600">Delivered</span>
                      <span className="text-sm font-medium text-secondary-900">{stats.delivered}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-secondary-600">Failed</span>
                      <span className="text-sm font-medium text-secondary-900">{stats.failed}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-secondary-600">Delivery Rate</span>
                      <span className="text-sm font-medium text-secondary-900">{stats.deliveryRate.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="card">
                  <h4 className="page-subtitle mb-4">Recent Activity</h4>
                  <div className="space-y-3">
                    {smsHistory.slice(0, 5).map((sms) => (
                      <div key={sms.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded">
                        <div>
                          <p className="text-sm font-medium text-secondary-900">{sms.to}</p>
                          <p className="text-xs text-secondary-500">
                            {sms.message.substring(0, 50)}...
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center">
                            {getStatusIcon(sms.status)}
                            <span className={`ml-1 status-badge ${getStatusColor(sms.status)}`}>
                              {sms.status}
                            </span>
                          </div>
                          <p className="text-xs text-secondary-500 mt-1">
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
