import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import PageTitle from '../components/Shared/PageTitle';
import { FaFileAlt, FaDownload, FaEnvelope, FaCog, FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
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
    <div className="p-6">
      <PageTitle title="PDF Generation" icon={FaFileAlt} />

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
              activeTab === 'templates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FaCog className="w-4 h-4" />
            <span>Templates</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
              activeTab === 'reports'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
                            <FaFileAlt className="w-4 h-4" />
            <span>Generated Reports</span>
          </button>
        </nav>
      </div>

      <div className="space-y-6">
        {activeTab === 'templates' && (
          <div>
            {/* Templates Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">PDF Templates</h2>
              <button
                onClick={() => setShowCreateTemplateModal(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center space-x-2"
              >
                <FaPlus className="w-4 h-4" />
                <span>Create Template</span>
              </button>
            </div>

            {/* Templates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="bg-white rounded-lg shadow-md p-6 border">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                      <p className="text-sm text-gray-600">{getReportTypeName(template.type)}</p>
                    </div>
                    {template.isDefault && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-700 mb-4">{template.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">
                      Created: {new Date(template.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedTemplate(template)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                      {!template.isDefault && (
                        <>
                          <button className="text-gray-600 hover:text-gray-800">
                            <FaEdit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTrash className="w-4 h-4" />
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
              <h2 className="text-xl font-semibold text-gray-900">Generated Reports</h2>
              <button
                onClick={() => setShowGenerateReportModal(true)}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center space-x-2"
              >
                <FaPlus className="w-4 h-4" />
                <span>Generate Report</span>
              </button>
            </div>

            {/* Reports Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              {reports.length === 0 ? (
                <div className="p-8 text-center">
                  <FaFileAlt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No reports generated yet</p>
                  <button
                    onClick={() => setShowGenerateReportModal(true)}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                  >
                    Generate Your First Report
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Report Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
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
                      {reports.map((report) => (
                        <tr key={report.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {report.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {getReportTypeName(report.type)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              report.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : report.status === 'generating'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {report.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              {report.status === 'completed' && (
                                <>
                                  <button
                                    onClick={() => handleDownloadReport(report)}
                                    className="text-blue-600 hover:text-blue-900"
                                    title="Download"
                                  >
                                    <FaDownload className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleEmailReport(report)}
                                    className="text-green-600 hover:text-green-900"
                                    title="Email"
                                  >
                                    <FaEnvelope className="w-4 h-4" />
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
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create PDF Template</h3>
              <form onSubmit={handleCreateTemplate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Template Name</label>
                  <input
                    type="text"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Report Type</label>
                  <select
                    value={templateForm.type}
                    onChange={(e) => setTemplateForm({ ...templateForm, type: e.target.value as PDFTemplate['type'] })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="daily_activity">Daily Activity Report</option>
                    <option value="customer_report">Customer Report</option>
                    <option value="work_completion">Work Completion Summary</option>
                    <option value="super_admin_daily">Super Admin Daily Report</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={templateForm.description}
                    onChange={(e) => setTemplateForm({ ...templateForm, description: e.target.value })}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateTemplateModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Template'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Generate Report Modal */}
      {showGenerateReportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Generate PDF Report</h3>
              <form onSubmit={handleGenerateReport} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Template</label>
                  <select
                    value={reportForm.templateId}
                    onChange={(e) => setReportForm({ ...reportForm, templateId: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700">Date</label>
                  <input
                    type="date"
                    value={reportForm.date}
                    onChange={(e) => setReportForm({ ...reportForm, date: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer ID (Optional)</label>
                  <input
                    type="text"
                    value={reportForm.customerId}
                    onChange={(e) => setReportForm({ ...reportForm, customerId: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter customer ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">User ID (Optional)</label>
                  <input
                    type="text"
                    value={reportForm.userId}
                    onChange={(e) => setReportForm({ ...reportForm, userId: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter user ID"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email (Optional)</label>
                  <input
                    type="email"
                    value={reportForm.email}
                    onChange={(e) => setReportForm({ ...reportForm, email: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter email to send report"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowGenerateReportModal(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                  >
                    {loading ? 'Generating...' : 'Generate Report'}
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

export default PDFGenerationPage;
