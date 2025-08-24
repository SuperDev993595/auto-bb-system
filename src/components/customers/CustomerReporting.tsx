import { useState, useEffect } from 'react'
import { Download, FileText, BarChart3, PieChart, TrendingUp, Filter, Calendar, Users, DollarSign, Car } from 'lucide-react'

interface ReportTemplate {
  id: string
  name: string
  description: string
  type: 'customer' | 'financial' | 'service' | 'geographic' | 'custom'
  lastGenerated: string
  schedule: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'manual'
  recipients: string[]
}

interface ExportFormat {
  id: string
  name: string
  extension: string
  description: string
}

interface Props {
  customerId?: string
}

export default function CustomerReporting({ customerId }: Props) {
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([])
  const [exportFormats, setExportFormats] = useState<ExportFormat[]>([])
  const [activeTab, setActiveTab] = useState<'reports' | 'exports' | 'analytics'>('reports')
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<string>('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  useEffect(() => {
    fetchReportingData()
  }, [customerId])

  const fetchReportingData = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const mockReportTemplates: ReportTemplate[] = [
      {
        id: '1',
        name: 'Customer Summary Report',
        description: 'Comprehensive overview of all customers with key metrics',
        type: 'customer',
        lastGenerated: '2024-01-15T10:00:00Z',
        schedule: 'weekly',
        recipients: ['admin@company.com', 'manager@company.com']
      },
      {
        id: '2',
        name: 'Financial Performance Report',
        description: 'Revenue analysis and payment tracking by customer',
        type: 'financial',
        lastGenerated: '2024-01-14T14:00:00Z',
        schedule: 'monthly',
        recipients: ['finance@company.com', 'ceo@company.com']
      },
      {
        id: '3',
        name: 'Service History Report',
        description: 'Detailed service records and maintenance schedules',
        type: 'service',
        lastGenerated: '2024-01-13T09:00:00Z',
        schedule: 'weekly',
        recipients: ['service@company.com', 'technicians@company.com']
      },
      {
        id: '4',
        name: 'Geographic Distribution Report',
        description: 'Customer distribution by location and regional performance',
        type: 'geographic',
        lastGenerated: '2024-01-12T16:00:00Z',
        schedule: 'quarterly',
        recipients: ['marketing@company.com', 'sales@company.com']
      }
    ]

    const mockExportFormats: ExportFormat[] = [
      {
        id: '1',
        name: 'Excel Spreadsheet',
        extension: '.xlsx',
        description: 'Microsoft Excel format with multiple sheets and formatting'
      },
      {
        id: '2',
        name: 'CSV File',
        extension: '.csv',
        description: 'Comma-separated values for data import into other systems'
      },
      {
        id: '3',
        name: 'PDF Report',
        extension: '.pdf',
        description: 'Formatted PDF with charts and professional layout'
      },
      {
        id: '4',
        name: 'JSON Data',
        extension: '.json',
        description: 'Structured data format for API integration'
      }
    ]

    setReportTemplates(mockReportTemplates)
    setExportFormats(mockExportFormats)
    setLoading(false)
  }

  const generateReport = (templateId: string) => {
    // In a real app, this would trigger report generation
    console.log(`Generating report: ${templateId}`)
    // Show success message or redirect to report view
  }

  const exportData = (format: string) => {
    // In a real app, this would trigger data export
    console.log(`Exporting data in ${format} format`)
    // Show download progress or trigger download
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Customer Reporting & Analytics</h2>
            <p className="text-gray-600">Generate insights and export customer data</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200">
              <FileText className="w-4 h-4" />
              New Report
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200">
              <Download className="w-4 h-4" />
              Export Data
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{reportTemplates.length}</p>
            <p className="text-sm text-blue-600">Report Templates</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{exportFormats.length}</p>
            <p className="text-sm text-green-600">Export Formats</p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">4</p>
            <p className="text-sm text-purple-600">Scheduled Reports</p>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">12</p>
            <p className="text-sm text-orange-600">Reports This Month</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {(['reports', 'exports', 'analytics'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              {/* Report Generation Controls */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Report</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Report Template</label>
                    <select
                      value={selectedReport}
                      onChange={(e) => setSelectedReport(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a report template</option>
                      {reportTemplates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => generateReport(selectedReport)}
                    disabled={!selectedReport || !dateRange.start || !dateRange.end}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Generate Report
                  </button>
                </div>
              </div>

              {/* Report Templates */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Report Templates</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reportTemplates.map((template) => (
                    <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-all duration-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-lg font-semibold text-gray-900">{template.name}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              template.type === 'customer' ? 'bg-blue-100 text-blue-700' :
                              template.type === 'financial' ? 'bg-green-100 text-green-700' :
                              template.type === 'service' ? 'bg-purple-100 text-purple-700' :
                              'bg-orange-100 text-orange-700'
                            }`}>
                              {template.type}
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{template.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Schedule:</span>
                              <span className="ml-2 font-medium text-gray-700">{template.schedule}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Last Generated:</span>
                              <span className="ml-2 font-medium text-gray-700">
                                {new Date(template.lastGenerated).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <span className="text-gray-500 text-sm">Recipients:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {template.recipients.map((recipient, index) => (
                                <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                  {recipient}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Exports Tab */}
          {activeTab === 'exports' && (
            <div className="space-y-6">
              {/* Export Controls */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Customer Data</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data Type</label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>All Customer Data</option>
                      <option>Customer Profiles Only</option>
                      <option>Vehicle Information</option>
                      <option>Service History</option>
                      <option>Payment Records</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                    <select className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                      <option>Excel (.xlsx)</option>
                      <option>CSV (.csv)</option>
                      <option>PDF (.pdf)</option>
                      <option>JSON (.json)</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200">
                    Export Data
                  </button>
                </div>
              </div>

              {/* Export Formats */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Export Formats</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {exportFormats.map((format) => (
                    <div key={format.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{format.name}</h4>
                          <p className="text-gray-600">{format.description}</p>
                          <p className="text-sm text-gray-500 mt-1">Extension: {format.extension}</p>
                        </div>
                        <button
                          onClick={() => exportData(format.extension)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
                          title={`Export as ${format.extension}`}
                        >
                          <Download className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              {/* Analytics Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <BarChart3 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Customer Growth</h3>
                  <p className="text-2xl font-bold text-blue-600">+12.5%</p>
                  <p className="text-sm text-gray-600">vs. last month</p>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Revenue Growth</h3>
                  <p className="text-2xl font-bold text-green-600">+8.3%</p>
                  <p className="text-sm text-gray-600">vs. last month</p>
                </div>
                
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Customer Retention</h3>
                  <p className="text-2xl font-bold text-purple-600">87.2%</p>
                  <p className="text-sm text-gray-600">12-month average</p>
                </div>
              </div>

              {/* Chart Placeholders */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Distribution by Type</h3>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <PieChart className="w-16 h-16 text-gray-400" />
                    <p className="text-gray-500 ml-4">Chart visualization would go here</p>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Customer Acquisition</h3>
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-16 h-16 text-gray-400" />
                    <p className="text-gray-500 ml-4">Chart visualization would go here</p>
                  </div>
                </div>
              </div>

              {/* Quick Insights */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Top Performing Customers</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• John Smith - $12,500 revenue</li>
                      <li>• ABC Company - $8,900 revenue</li>
                      <li>• Sarah Johnson - $7,200 revenue</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Service Trends</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Oil changes: 45% of services</li>
                      <li>• Brake service: 23% of services</li>
                      <li>• Tire replacement: 18% of services</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
