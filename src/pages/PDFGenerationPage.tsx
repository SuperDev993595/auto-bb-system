import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import PageTitle from '../components/Shared/PageTitle';
import { HiDocumentText, HiDownload, HiMail, HiCog, HiPlus, HiPencil, HiTrash, HiEye, HiX, HiChartBar } from 'react-icons/hi';
import { toast } from 'react-hot-toast';

interface PDFTemplate {
  id: string;
  name: string;
  type: 'daily_activity' | 'customer_report' | 'work_completion' | 'super_admin_daily';
  description: string;
  isDefault: boolean;
  createdAt: string;
}

interface PDFReport {
  id: string;
  name: string;
  type: string;
  status: 'generating' | 'completed' | 'failed';
  downloadUrl?: string;
  createdAt: string;
}

const PDFGenerationPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const [activeTab, setActiveTab] = useState('templates');
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [showGenerateReportModal, setShowGenerateReportModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<PDFTemplate | null>(null);
  const [loading, setLoading] = useState(false);

  // Mock data for templates and reports
  const [templates, setTemplates] = useState<PDFTemplate[]>([
    {
      id: '1',
      name: 'Daily Activity Report',
      type: 'daily_activity',
      description: 'Standard daily activity report for employees',
      isDefault: true,
      createdAt: '2024-01-01'
    },
    {
      id: '2',
      name: 'Customer Report',
      type: 'customer_report',
      description: 'Comprehensive customer information and history',
      isDefault: true,
      createdAt: '2024-01-01'
    },
    {
      id: '3',
      name: 'Work Completion Summary',
      type: 'work_completion',
      description: 'Daily work completion summary for customers',
      isDefault: true,
      createdAt: '2024-01-01'
    },
    {
      id: '4',
      name: 'Super Admin Daily Report',
      type: 'super_admin_daily',
      description: 'Comprehensive daily report for super admins',
      isDefault: true,
      createdAt: '2024-01-01'
    }
  ]);

  const [reports, setReports] = useState<PDFReport[]>([]);

  const [templateForm, setTemplateForm] = useState({
    name: '',
    type: 'daily_activity' as PDFTemplate['type'],
    description: ''
  });

  const [reportForm, setReportForm] = useState({
    templateId: '',
    customerId: '',
    userId: '',
    date: new Date().toISOString().split('T')[0],
    email: ''
  });

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newTemplate: PDFTemplate = {
        id: Date.now().toString(),
        name: templateForm.name,
        type: templateForm.type,
        description: templateForm.description,
        isDefault: false,
        createdAt: new Date().toISOString()
      };
      
      setTemplates([...templates, newTemplate]);
      setShowCreateTemplateModal(false);
      setTemplateForm({ name: '', type: 'daily_activity', description: '' });
      toast.success('Template created successfully');
    } catch (error) {
      toast.error('Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newReport: PDFReport = {
        id: Date.now().toString(),
        name: `Report_${Date.now()}`,
        type: reportForm.templateId,
        status: 'completed',
        downloadUrl: '#',
        createdAt: new Date().toISOString()
      };
      
      setReports([newReport, ...reports]);
      setShowGenerateReportModal(false);
      setReportForm({
        templateId: '',
        customerId: '',
        userId: '',
        date: new Date().toISOString().split('T')[0],
        email: ''
      });
      toast.success('Report generated successfully');
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter(t => t.id !== templateId));
      toast.success('Template deleted successfully');
    }
  };

  const handleDownloadReport = (report: PDFReport) => {
    // Mock download
    toast.success('Download started');
  };

  const handleEmailReport = async (report: PDFReport) => {
    try {
      // Mock email API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Report sent via email');
    } catch (error) {
      toast.error('Failed to send email');
    }
  };

  const getReportTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      'daily_activity': 'Daily Activity',
      'customer_report': 'Customer Report',
      'work_completion': 'Work Completion',
      'super_admin_daily': 'Super Admin Daily'
    };
    return typeMap[type] || type;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <PageTitle title="PDF Generation" icon={HiDocumentText} />
      </div>

      {/* Tab Navigation */}
      <div className="card mb-6">
        <div className="tab-container">
          <div className="tab-header">
            <nav className="tab-buttons">
              <button
                onClick={() => setActiveTab('templates')}
                className={`tab-button ${activeTab === 'templates' ? 'tab-button-active' : 'tab-button-inactive'}`}
              >
                <HiDocumentText className="w-4 h-4" />
                <span>PDF Templates</span>
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`tab-button ${activeTab === 'reports' ? 'tab-button-active' : 'tab-button-inactive'}`}
              >
                <HiChartBar className="w-4 h-4" />
                <span>Reports</span>
              </button>
            </nav>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {activeTab === 'templates' && (
          <div>
            {/* Templates Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="page-subtitle">PDF Templates</h2>
              <button
                onClick={() => setShowCreateTemplateModal(true)}
                className="btn-primary"
              >
                <HiPlus className="w-4 h-4" />
                <span>Create Template</span>
              </button>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="card hover-lift">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-secondary-900">{template.name}</h3>
                      <p className="text-sm text-secondary-600">{getReportTypeName(template.type)}</p>
                    </div>
                    {template.isDefault && (
                      <span className="status-badge bg-success-100 text-success-800">
                        Default
                      </span>
                    )}
                  </div>
                  
                  <p className="text-secondary-700 mb-4">{template.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-secondary-500">
                      Created: {new Date(template.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedTemplate(template)}
                        className="text-primary-600 hover:text-primary-800 transition-colors"
                      >
                        <HiEye className="w-4 h-4" />
                      </button>
                      {!template.isDefault && (
                        <>
                          <button className="text-secondary-600 hover:text-secondary-800 transition-colors">
                            <HiPencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="text-error-600 hover:text-error-800 transition-colors"
                          >
                            <HiTrash className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            {/* Reports Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="page-subtitle">Generated Reports</h2>
              <button
                onClick={() => setShowGenerateReportModal(true)}
                className="btn-success"
              >
                <HiPlus className="w-4 h-4" />
                <span>Generate Report</span>
              </button>
            </div>

            {/* Reports Table */}
            <div className="card">
              {reports.length === 0 ? (
                <div className="p-8 text-center">
                  <HiDocumentText className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
                  <p className="text-secondary-600">No reports generated yet</p>
                  <button
                    onClick={() => setShowGenerateReportModal(true)}
                    className="mt-4 btn-primary"
                  >
                    Generate Your First Report
                  </button>
                </div>
              ) : (
                <div className="table-container">
                  <table className="table">
                    <thead className="table-header">
                      <tr>
                        <th className="table-header-cell">Report Name</th>
                        <th className="table-header-cell">Type</th>
                        <th className="table-header-cell">Status</th>
                        <th className="table-header-cell">Created</th>
                        <th className="table-header-cell text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="table-body">
                      {reports.map((report) => (
                        <tr key={report.id} className="table-row">
                          <td className="table-cell whitespace-nowrap text-sm font-medium text-secondary-900">
                            {report.name}
                          </td>
                          <td className="table-cell whitespace-nowrap text-sm text-secondary-500">
                            {getReportTypeName(report.type)}
                          </td>
                          <td className="table-cell whitespace-nowrap">
                            <span className={`status-badge ${
                              report.status === 'completed'
                                ? 'status-success'
                                : report.status === 'generating'
                                ? 'status-warning'
                                : 'status-error'
                            }`}>
                              {report.status}
                            </span>
                          </td>
                          <td className="table-cell whitespace-nowrap text-sm text-secondary-500">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </td>
                          <td className="table-cell whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              {report.status === 'completed' && (
                                <>
                                  <button
                                    onClick={() => handleDownloadReport(report)}
                                    className="text-primary-600 hover:text-primary-900 transition-colors"
                                    title="Download"
                                  >
                                    <HiDownload className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleEmailReport(report)}
                                    className="text-success-600 hover:text-success-900 transition-colors"
                                    title="Email"
                                  >
                                    <HiMail className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Template Modal */}
      {showCreateTemplateModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">Create PDF Template</h3>
              <button
                onClick={() => setShowCreateTemplateModal(false)}
                className="modal-close"
              >
                <HiX className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTemplate} className="modal-content space-y-4">
              <div>
                <label className="form-label">Template Name</label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="form-label">Report Type</label>
                <select
                  value={templateForm.type}
                  onChange={(e) => setTemplateForm({ ...templateForm, type: e.target.value as PDFTemplate['type'] })}
                  className="select-field"
                  required
                >
                  <option value="daily_activity">Daily Activity Report</option>
                  <option value="customer_report">Customer Report</option>
                  <option value="work_completion">Work Completion Summary</option>
                  <option value="super_admin_daily">Super Admin Daily Report</option>
                </select>
              </div>
              <div>
                <label className="form-label">Description</label>
                <textarea
                  value={templateForm.description}
                  onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                  rows={3}
                  className="input-field"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateTemplateModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Creating...' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Report Modal */}
      {showGenerateReportModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3 className="modal-title">Generate PDF Report</h3>
              <button
                onClick={() => setShowGenerateReportModal(false)}
                className="modal-close"
              >
                <HiX className="h-6 w-6" />
              </button>
            </div>
            
            <form onSubmit={handleGenerateReport} className="modal-content space-y-4">
              <div>
                <label className="form-label">Template</label>
                <select
                  value={reportForm.templateId}
                  onChange={(e) => setReportForm({ ...reportForm, templateId: e.target.value })}
                  className="select-field"
                  required
                >
                  <option value="">Select a template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Date</label>
                <input
                  type="date"
                  value={reportForm.date}
                  onChange={(e) => setReportForm({ ...reportForm, date: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="form-label">Customer ID (Optional)</label>
                <input
                  type="text"
                  value={reportForm.customerId}
                  onChange={(e) => setReportForm({ ...reportForm, customerId: e.target.value })}
                  className="input-field"
                  placeholder="Enter customer ID"
                />
              </div>
              <div>
                <label className="form-label">User ID (Optional)</label>
                <input
                  type="text"
                  value={reportForm.userId}
                  onChange={(e) => setReportForm({ ...reportForm, userId: e.target.value })}
                  className="input-field"
                  placeholder="Enter user ID"
                />
              </div>
              <div>
                <label className="form-label">Email (Optional)</label>
                <input
                  type="email"
                  value={reportForm.email}
                  onChange={(e) => setReportForm({ ...reportForm, email: e.target.value })}
                  className="input-field"
                  placeholder="Enter email to send report"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowGenerateReportModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-success"
                >
                  {loading ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFGenerationPage;
