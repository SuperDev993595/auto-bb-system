import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import {
  fetchEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  deleteEmailTemplate,
  fetchEmailCampaigns,
  createEmailCampaign,
  sendEmailCampaign,
  sendEmail,
  fetchEmailAnalytics,
  clearError
} from '../redux/actions/email';
import PageTitle from '../components/Shared/PageTitle';
import { 
  FaEnvelope, FaFileAlt, FaChartBar, FaPlus, FaEdit, FaTrash, 
  FaPaperPlane, FaEye, FaUsers, FaCalendarAlt, FaCheckCircle,
  FaTimesCircle, FaExclamationTriangle, FaArrowUp, FaArrowDown
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const EmailManagementPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    templates,
    campaigns,
    analytics,
    templatesLoading,
    campaignsLoading,
    analyticsLoading,
    sendEmailLoading,
    error
  } = useSelector((state: RootState) => state.email);

  const [activeTab, setActiveTab] = useState('compose');
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  // Form states
  const [emailForm, setEmailForm] = useState({
    to: [''],
    cc: [''],
    bcc: [''],
    subject: '',
    content: '',
    trackOpens: true,
    trackClicks: true
  });

  const [templateForm, setTemplateForm] = useState({
    name: '',
    subject: '',
    content: '',
    category: 'general',
    isActive: true
  });

  const [campaignForm, setCampaignForm] = useState({
    name: '',
    subject: '',
    content: '',
    recipients: [''],
    scheduledAt: ''
  });

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = () => {
    switch (activeTab) {
      case 'templates':
        dispatch(fetchEmailTemplates());
        break;
      case 'campaigns':
        dispatch(fetchEmailCampaigns());
        break;
      case 'analytics':
        dispatch(fetchEmailAnalytics());
        break;
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const emailData = {
        ...emailForm,
        to: emailForm.to.filter(email => email.trim()),
        cc: emailForm.cc.filter(email => email.trim()),
        bcc: emailForm.bcc.filter(email => email.trim())
      };

      if (emailData.to.length === 0) {
        toast.error('At least one recipient is required');
        return;
      }

      await dispatch(sendEmail(emailData)).unwrap();
      toast.success('Email sent successfully');
      setEmailForm({
        to: [''],
        cc: [''],
        bcc: [''],
        subject: '',
        content: '',
        trackOpens: true,
        trackClicks: true
      });
    } catch (error) {
      toast.error('Failed to send email');
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(createEmailTemplate(templateForm)).unwrap();
      toast.success('Template created successfully');
      setShowTemplateModal(false);
      setTemplateForm({
        name: '',
        subject: '',
        content: '',
        category: 'general',
        isActive: true
      });
    } catch (error) {
      toast.error('Failed to create template');
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const campaignData = {
        ...campaignForm,
        recipients: campaignForm.recipients.filter(email => email.trim())
      };

      if (campaignData.recipients.length === 0) {
        toast.error('At least one recipient is required');
        return;
      }

      await dispatch(createEmailCampaign(campaignData)).unwrap();
      toast.success('Campaign created successfully');
      setShowCampaignModal(false);
      setCampaignForm({
        name: '',
        subject: '',
        content: '',
        recipients: [''],
        scheduledAt: ''
      });
    } catch (error) {
      toast.error('Failed to create campaign');
    }
  };

  const handleSendCampaign = async (campaignId: string) => {
    if (window.confirm('Are you sure you want to send this campaign?')) {
      try {
        await dispatch(sendEmailCampaign(campaignId)).unwrap();
        toast.success('Campaign sent successfully');
      } catch (error) {
        toast.error('Failed to send campaign');
      }
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await dispatch(deleteEmailTemplate(templateId)).unwrap();
        toast.success('Template deleted successfully');
      } catch (error) {
        toast.error('Failed to delete template');
      }
    }
  };

  const addEmailField = (field: 'to' | 'cc' | 'bcc') => {
    setEmailForm(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeEmailField = (field: 'to' | 'cc' | 'bcc', index: number) => {
    setEmailForm(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateEmailField = (field: 'to' | 'cc' | 'bcc', index: number, value: string) => {
    setEmailForm(prev => ({
      ...prev,
      [field]: prev[field].map((email, i) => i === index ? value : email)
    }));
  };

  const addCampaignRecipient = () => {
    setCampaignForm(prev => ({
      ...prev,
      recipients: [...prev.recipients, '']
    }));
  };

  const removeCampaignRecipient = (index: number) => {
    setCampaignForm(prev => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index)
    }));
  };

  const updateCampaignRecipient = (index: number, value: string) => {
    setCampaignForm(prev => ({
      ...prev,
      recipients: prev.recipients.map((email, i) => i === index ? value : email)
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <FaCheckCircle className="text-green-500" />;
      case 'scheduled':
        return <FaCalendarAlt className="text-blue-500" />;
      case 'draft':
        return <FaFileAlt className="text-gray-500" />;
      default:
        return <FaExclamationTriangle className="text-yellow-500" />;
    }
  };

  return (
    <div className="p-6">
      <PageTitle title="Email Management" icon={FaEnvelope} />
      
      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('compose')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'compose'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaEnvelope className="w-4 h-4" />
              <span>Compose Email</span>
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'templates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaFileAlt className="w-4 h-4" />
              <span>Email Templates</span>
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'campaigns'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaUsers className="w-4 h-4" />
              <span>Email Campaigns</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaChartBar className="w-4 h-4" />
              <span>Analytics</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Compose Email Tab */}
      {activeTab === 'compose' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Compose New Email</h3>
            <form onSubmit={handleSendEmail} className="space-y-4">
              {/* To Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
                {emailForm.to.map((email, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => updateEmailField('to', index, e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="recipient@example.com"
                    />
                    {emailForm.to.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEmailField('to', index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        <FaTimesCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addEmailField('to')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add recipient
                </button>
              </div>

              {/* CC Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CC</label>
                {emailForm.cc.map((email, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => updateEmailField('cc', index, e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="cc@example.com"
                    />
                    <button
                      type="button"
                      onClick={() => removeEmailField('cc', index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      <FaTimesCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addEmailField('cc')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add CC
                </button>
              </div>

              {/* BCC Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">BCC</label>
                {emailForm.bcc.map((email, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => updateEmailField('bcc', index, e.target.value)}
                      className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="bcc@example.com"
                    />
                    <button
                      type="button"
                      onClick={() => removeEmailField('bcc', index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      <FaTimesCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addEmailField('bcc')}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  + Add BCC
                </button>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email subject"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={emailForm.content}
                  onChange={(e) => setEmailForm({...emailForm, content: e.target.value})}
                  rows={8}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Email content..."
                  required
                />
              </div>

              {/* Tracking Options */}
              <div className="flex space-x-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={emailForm.trackOpens}
                    onChange={(e) => setEmailForm({...emailForm, trackOpens: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Track opens</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={emailForm.trackClicks}
                    onChange={(e) => setEmailForm({...emailForm, trackClicks: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Track clicks</span>
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={sendEmailLoading}
                  className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center space-x-2"
                >
                  <FaPaperPlane className="w-4 h-4" />
                  <span>{sendEmailLoading ? 'Sending...' : 'Send Email'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Email Templates Tab */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Email Templates</h3>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center space-x-2"
            >
              <FaPlus className="w-4 h-4" />
              <span>Create Template</span>
            </button>
          </div>

          {templatesLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading templates...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-medium text-gray-900">{template.name}</h4>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedTemplate(template);
                          setTemplateForm({
                            name: template.name,
                            subject: template.subject,
                            content: template.content,
                            category: template.category || 'general',
                            isActive: template.isActive
                          });
                          setShowTemplateModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
                  <div className="text-xs text-gray-500 mb-4">
                    <span className={`inline-flex px-2 py-1 rounded-full ${
                      template.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {template.category && (
                      <span className="ml-2 text-gray-600">{template.category}</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-700 line-clamp-3" dangerouslySetInnerHTML={{ __html: template.content }} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Email Campaigns Tab */}
      {activeTab === 'campaigns' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Email Campaigns</h3>
            <button
              onClick={() => setShowCampaignModal(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center space-x-2"
            >
              <FaPlus className="w-4 h-4" />
              <span>Create Campaign</span>
            </button>
          </div>

          {campaignsLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading campaigns...</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Campaign
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Recipients
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Performance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {campaigns.map((campaign) => (
                      <tr key={campaign.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                            <div className="text-sm text-gray-500">{campaign.subject}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getStatusIcon(campaign.status)}
                            <span className="ml-2 text-sm text-gray-900 capitalize">{campaign.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {campaign.recipients}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div>Sent: {campaign.sent}</div>
                            <div>Opened: {campaign.opened}</div>
                            <div>Clicked: {campaign.clicked}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(campaign.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {campaign.status === 'draft' && (
                            <button
                              onClick={() => handleSendCampaign(campaign.id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FaPaperPlane className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">Email Analytics</h3>

          {analyticsLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading analytics...</p>
            </div>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center">
                    <FaEnvelope className="text-blue-500 text-2xl mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Total Emails</p>
                      <p className="text-2xl font-bold">{analytics.overview.totalEmails}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center">
                    <FaCheckCircle className="text-green-500 text-2xl mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Delivered</p>
                      <p className="text-2xl font-bold">{analytics.overview.delivered}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center">
                    <FaEye className="text-purple-500 text-2xl mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Opened</p>
                      <p className="text-2xl font-bold">{analytics.overview.opened}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center">
                    <FaArrowUp className="text-orange-500 text-2xl mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Clicked</p>
                      <p className="text-2xl font-bold">{analytics.overview.clicked}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Key Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Open Rate</span>
                      <span className="text-sm font-medium">{analytics.metrics.openRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Click Rate</span>
                      <span className="text-sm font-medium">{analytics.metrics.clickRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Bounce Rate</span>
                      <span className="text-sm font-medium">{analytics.metrics.bounceRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Unsubscribe Rate</span>
                      <span className="text-sm font-medium">{analytics.metrics.unsubscribeRate}%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Top Templates</h4>
                  <div className="space-y-3">
                    {analytics.topTemplates?.map((template, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{template.name}</p>
                          <p className="text-xs text-gray-500">{template.sent} sent</p>
                        </div>
                        <span className="text-sm font-medium text-green-600">{template.openRate}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedTemplate ? 'Edit Template' : 'Create New Template'}
              </h3>
              <form onSubmit={handleCreateTemplate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Template Name</label>
                  <input
                    type="text"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <input
                    type="text"
                    value={templateForm.subject}
                    onChange={(e) => setTemplateForm({...templateForm, subject: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Content</label>
                  <textarea
                    value={templateForm.content}
                    onChange={(e) => setTemplateForm({...templateForm, content: e.target.value})}
                    rows={6}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={templateForm.category}
                    onChange={(e) => setTemplateForm({...templateForm, category: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="general">General</option>
                    <option value="appointments">Appointments</option>
                    <option value="payments">Payments</option>
                    <option value="services">Services</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTemplateModal(false);
                      setSelectedTemplate(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    {selectedTemplate ? 'Update Template' : 'Create Template'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Campaign</h3>
              <form onSubmit={handleCreateCampaign} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Campaign Name</label>
                  <input
                    type="text"
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm({...campaignForm, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Subject</label>
                  <input
                    type="text"
                    value={campaignForm.subject}
                    onChange={(e) => setCampaignForm({...campaignForm, subject: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Content</label>
                  <textarea
                    value={campaignForm.content}
                    onChange={(e) => setCampaignForm({...campaignForm, content: e.target.value})}
                    rows={6}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Recipients</label>
                  {campaignForm.recipients.map((email, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => updateCampaignRecipient(index, e.target.value)}
                        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="recipient@example.com"
                      />
                      <button
                        type="button"
                        onClick={() => removeCampaignRecipient(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        <FaTimesCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addCampaignRecipient}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    + Add recipient
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Schedule (Optional)</label>
                  <input
                    type="datetime-local"
                    value={campaignForm.scheduledAt}
                    onChange={(e) => setCampaignForm({...campaignForm, scheduledAt: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCampaignModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Create Campaign
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailManagementPage;
