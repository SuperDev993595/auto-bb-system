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
  HiEnvelope, HiDocumentText, HiChartBar, HiPlus, HiPencil, HiTrash, 
  HiPaperAirplane, HiEye, HiUsers, HiCalendar, HiCheckCircle,
  HiXCircle, HiExclamationTriangle, HiArrowUp, HiArrowDown, HiX
} from 'react-icons/hi';
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
        return <HiCheckCircle className="text-success-600" />;
      case 'scheduled':
        return <HiCalendar className="text-info-600" />;
      case 'draft':
        return <HiDocumentText className="text-secondary-500" />;
      default:
        return <HiExclamationTriangle className="text-warning-600" />;
    }
  };

  return (
    <div className="page-container">
      <PageTitle title="Email Management" icon={HiEnvelope} />
      
      {/* Tab Navigation */}
      <div className="card">
        <div className="tab-container">
          <div className="tab-header">
            <div className="tab-buttons">
              <button
                onClick={() => setActiveTab('compose')}
                className={`tab-button ${activeTab === 'compose' ? 'tab-button-active' : 'tab-button-inactive'}`}
              >
                <HiEnvelope className="w-4 h-4" />
                <span>Compose Email</span>
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`tab-button ${activeTab === 'templates' ? 'tab-button-active' : 'tab-button-inactive'}`}
              >
                <HiDocumentText className="w-4 h-4" />
                <span>Email Templates</span>
              </button>
              <button
                onClick={() => setActiveTab('campaigns')}
                className={`tab-button ${activeTab === 'campaigns' ? 'tab-button-active' : 'tab-button-inactive'}`}
              >
                <HiUsers className="w-4 h-4" />
                <span>Email Campaigns</span>
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`tab-button ${activeTab === 'analytics' ? 'tab-button-active' : 'tab-button-inactive'}`}
              >
                <HiChartBar className="w-4 h-4" />
                <span>Analytics</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Compose Email Tab */}
      {activeTab === 'compose' && (
        <div className="space-y-6">
          <div className="card">
            <h3 className="page-subtitle">Compose New Email</h3>
            <form onSubmit={handleSendEmail} className="space-y-4">
              {/* To Field */}
              <div>
                <label className="form-label">To</label>
                {emailForm.to.map((email, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => updateEmailField('to', index, e.target.value)}
                      className="input-field flex-1"
                      placeholder="recipient@example.com"
                    />
                    {emailForm.to.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEmailField('to', index)}
                        className="p-2 text-error-600 hover:text-error-800 transition-colors"
                      >
                        <HiXCircle className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addEmailField('to')}
                  className="text-primary-600 hover:text-primary-800 text-sm transition-colors"
                >
                  + Add recipient
                </button>
              </div>

              {/* CC Field */}
              <div>
                <label className="form-label">CC</label>
                {emailForm.cc.map((email, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => updateEmailField('cc', index, e.target.value)}
                      className="input-field flex-1"
                      placeholder="cc@example.com"
                    />
                    <button
                      type="button"
                      onClick={() => removeEmailField('cc', index)}
                      className="p-2 text-error-600 hover:text-error-800 transition-colors"
                    >
                      <HiXCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addEmailField('cc')}
                  className="text-primary-600 hover:text-primary-800 text-sm transition-colors"
                >
                  + Add CC
                </button>
              </div>

              {/* BCC Field */}
              <div>
                <label className="form-label">BCC</label>
                {emailForm.bcc.map((email, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => updateEmailField('bcc', index, e.target.value)}
                      className="input-field flex-1"
                      placeholder="bcc@example.com"
                    />
                    <button
                      type="button"
                      onClick={() => removeEmailField('bcc', index)}
                      className="p-2 text-error-600 hover:text-error-800 transition-colors"
                    >
                      <HiXCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addEmailField('bcc')}
                  className="text-primary-600 hover:text-primary-800 text-sm transition-colors"
                >
                  + Add BCC
                </button>
              </div>

              {/* Subject */}
              <div>
                <label className="form-label">Subject</label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
                  className="input-field"
                  placeholder="Email subject"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="form-label">Content</label>
                <textarea
                  value={emailForm.content}
                  onChange={(e) => setEmailForm({...emailForm, content: e.target.value})}
                  rows={8}
                  className="input-field"
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
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                  />
                  <span className="ml-2 text-sm text-secondary-700">Track opens</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={emailForm.trackClicks}
                    onChange={(e) => setEmailForm({...emailForm, trackClicks: e.target.checked})}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-secondary-300 rounded"
                  />
                  <span className="ml-2 text-sm text-secondary-700">Track clicks</span>
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={sendEmailLoading}
                  className="btn-primary flex items-center space-x-2"
                >
                  <HiPaperAirplane className="w-4 h-4" />
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
            <h3 className="page-subtitle">Email Templates</h3>
            <button
              onClick={() => setShowTemplateModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <HiPlus className="w-4 h-4" />
              <span>Create Template</span>
            </button>
          </div>

          {templatesLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading templates...</p>
            </div>
          ) : (
            <div className="grid-responsive">
              {templates.map((template) => (
                <div key={template.id} className="card hover-lift">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-medium text-secondary-900">{template.name}</h4>
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
                        className="text-primary-600 hover:text-primary-800 transition-colors"
                      >
                        <HiPencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-error-600 hover:text-error-800 transition-colors"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-secondary-600 mb-2">{template.subject}</p>
                  <div className="text-xs text-secondary-500 mb-4">
                    <span className={`status-badge ${
                      template.isActive ? 'status-success' : 'status-error'
                    }`}>
                      {template.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {template.category && (
                      <span className="ml-2 text-secondary-600">{template.category}</span>
                    )}
                  </div>
                  <div className="text-sm text-secondary-700 line-clamp-3" dangerouslySetInnerHTML={{ __html: template.content }} />
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
            <h3 className="page-subtitle">Email Campaigns</h3>
            <button
              onClick={() => setShowCampaignModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <HiPlus className="w-4 h-4" />
              <span>Create Campaign</span>
            </button>
          </div>

          {campaignsLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading campaigns...</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Campaign</th>
                    <th className="table-header-cell">Status</th>
                    <th className="table-header-cell">Recipients</th>
                    <th className="table-header-cell">Performance</th>
                    <th className="table-header-cell">Created</th>
                    <th className="table-header-cell text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {campaigns.map((campaign) => (
                    <tr key={campaign.id} className="table-row">
                      <td className="table-cell">
                        <div>
                          <div className="text-sm font-medium text-secondary-900">{campaign.name}</div>
                          <div className="text-sm text-secondary-500">{campaign.subject}</div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center">
                          {getStatusIcon(campaign.status)}
                          <span className="ml-2 text-sm text-secondary-900 capitalize">{campaign.status}</span>
                        </div>
                      </td>
                      <td className="table-cell text-sm text-secondary-900">
                        {campaign.recipients}
                      </td>
                      <td className="table-cell">
                        <div className="text-sm text-secondary-900">
                          <div>Sent: {campaign.sent}</div>
                          <div>Opened: {campaign.opened}</div>
                          <div>Clicked: {campaign.clicked}</div>
                        </div>
                      </td>
                      <td className="table-cell text-sm text-secondary-500">
                        {new Date(campaign.createdAt).toLocaleDateString()}
                      </td>
                      <td className="table-cell text-right text-sm font-medium">
                        {campaign.status === 'draft' && (
                          <button
                            onClick={() => handleSendCampaign(campaign.id)}
                            className="text-primary-600 hover:text-primary-900 transition-colors"
                          >
                            <HiPaperAirplane className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <h3 className="page-subtitle">Email Analytics</h3>

          {analyticsLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading analytics...</p>
            </div>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Overview Stats */}
              <div className="grid-responsive">
                <div className="stats-card">
                  <div className="stats-icon bg-primary-100 text-primary-600">
                    <HiEnvelope className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="stats-label">Total Emails</p>
                    <p className="stats-value">{analytics.overview.totalEmails}</p>
                  </div>
                </div>
                <div className="stats-card">
                  <div className="stats-icon bg-success-100 text-success-600">
                    <HiCheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="stats-label">Delivered</p>
                    <p className="stats-value">{analytics.overview.delivered}</p>
                  </div>
                </div>
                <div className="stats-card">
                  <div className="stats-icon bg-info-100 text-info-600">
                    <HiEye className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="stats-label">Opened</p>
                    <p className="stats-value">{analytics.overview.opened}</p>
                  </div>
                </div>
                <div className="stats-card">
                  <div className="stats-icon bg-warning-100 text-warning-600">
                    <HiArrowUp className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="stats-label">Clicked</p>
                    <p className="stats-value">{analytics.overview.clicked}</p>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card">
                  <h4 className="page-subtitle">Key Metrics</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-secondary-600">Open Rate</span>
                      <span className="text-sm font-medium text-secondary-900">{analytics.metrics.openRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-secondary-600">Click Rate</span>
                      <span className="text-sm font-medium text-secondary-900">{analytics.metrics.clickRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-secondary-600">Bounce Rate</span>
                      <span className="text-sm font-medium text-secondary-900">{analytics.metrics.bounceRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-secondary-600">Unsubscribe Rate</span>
                      <span className="text-sm font-medium text-secondary-900">{analytics.metrics.unsubscribeRate}%</span>
                    </div>
                  </div>
                </div>

                <div className="card">
                  <h4 className="page-subtitle">Top Templates</h4>
                  <div className="space-y-3">
                    {analytics.topTemplates?.map((template, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <div>
                          <p className="text-sm font-medium text-secondary-900">{template.name}</p>
                          <p className="text-xs text-secondary-500">{template.sent} sent</p>
                        </div>
                        <span className="text-sm font-medium text-success-600">{template.openRate}%</span>
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
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">
                {selectedTemplate ? 'Edit Template' : 'Create New Template'}
              </h3>
              <button
                onClick={() => {
                  setShowTemplateModal(false);
                  setSelectedTemplate(null);
                }}
                className="modal-close"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-content">
              <form onSubmit={handleCreateTemplate} className="space-y-4">
                <div>
                  <label className="form-label">Template Name</label>
                  <input
                    type="text"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({...templateForm, name: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    value={templateForm.subject}
                    onChange={(e) => setTemplateForm({...templateForm, subject: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Content</label>
                  <textarea
                    value={templateForm.content}
                    onChange={(e) => setTemplateForm({...templateForm, content: e.target.value})}
                    rows={6}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Category</label>
                  <select
                    value={templateForm.category}
                    onChange={(e) => setTemplateForm({...templateForm, category: e.target.value})}
                    className="select-field"
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
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
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
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">Create New Campaign</h3>
              <button
                onClick={() => setShowCampaignModal(false)}
                className="modal-close"
              >
                <HiX className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-content">
              <form onSubmit={handleCreateCampaign} className="space-y-4">
                <div>
                  <label className="form-label">Campaign Name</label>
                  <input
                    type="text"
                    value={campaignForm.name}
                    onChange={(e) => setCampaignForm({...campaignForm, name: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Subject</label>
                  <input
                    type="text"
                    value={campaignForm.subject}
                    onChange={(e) => setCampaignForm({...campaignForm, subject: e.target.value})}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Content</label>
                  <textarea
                    value={campaignForm.content}
                    onChange={(e) => setCampaignForm({...campaignForm, content: e.target.value})}
                    rows={6}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Recipients</label>
                  {campaignForm.recipients.map((email, index) => (
                    <div key={index} className="flex space-x-2 mb-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => updateCampaignRecipient(index, e.target.value)}
                        className="input-field flex-1"
                        placeholder="recipient@example.com"
                      />
                      <button
                        type="button"
                        onClick={() => removeCampaignRecipient(index)}
                        className="p-2 text-error-600 hover:text-error-800 transition-colors"
                      >
                        <HiXCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addCampaignRecipient}
                    className="text-primary-600 hover:text-primary-800 text-sm transition-colors"
                  >
                    + Add recipient
                  </button>
                </div>
                <div>
                  <label className="form-label">Schedule (Optional)</label>
                  <input
                    type="datetime-local"
                    value={campaignForm.scheduledAt}
                    onChange={(e) => setCampaignForm({...campaignForm, scheduledAt: e.target.value})}
                    className="input-field"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCampaignModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
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
