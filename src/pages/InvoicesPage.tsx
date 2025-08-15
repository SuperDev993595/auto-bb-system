import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../redux'
import {
  fetchInvoices,
  fetchInvoiceStats,
  fetchPaymentStats,
  fetchInvoiceTemplates,
  updateInvoice,
  deleteInvoice,
  addPayment,
  sendInvoice,
  createInvoice
} from '../redux/actions/invoices'
import { Invoice } from '../utils/CustomerTypes'
import PageTitle from '../components/Shared/PageTitle'
import {
  HiDocumentText,
  HiCurrencyDollar,
  HiExclamation,
  HiCheck,
  HiClock,
  HiX,
  HiEye,
  HiPencil,
  HiTrash,
  HiDownload,
  HiMail,
  HiPrinter,
  HiPlus,
  HiSearch,
  HiFilter,
  HiRefresh,
  HiCog
} from 'react-icons/hi'

type TabType = 'invoices' | 'payments' | 'settings'

export default function InvoicesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('invoices')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  
  const { 
    invoices, 
    templates, 
    stats, 
    paymentStats,
    invoicesLoading,
    templatesLoading,
    statsLoading
  } = useAppSelector(state => state.invoices)
  const customers = useAppSelector(state => state.customers.list)
  const workOrders = useAppSelector(state => state.services.workOrders)
  const dispatch = useAppDispatch()

  // Load data on component mount
  useEffect(() => {
    dispatch(fetchInvoices())
    dispatch(fetchInvoiceStats())
    dispatch(fetchPaymentStats())
    dispatch(fetchInvoiceTemplates())
  }, [dispatch])

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Calculate metrics
  const totalInvoices = invoices.length
  const paidInvoices = invoices.filter(inv => inv.status === 'paid').length
  const overdueInvoices = invoices.filter(inv => inv.status === 'overdue').length
  const totalRevenue = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0)
  const outstandingAmount = invoices.filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
    .reduce((sum, inv) => sum + (inv.total - (inv.paidAmount || 0)), 0)

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'cancelled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleStatusUpdate = (id: string, status: Invoice['status']) => {
    dispatch(updateInvoice({ id, invoiceData: { status } }))
  }

  const handlePaymentRecord = (invoiceId: string, amount: number, method: string) => {
    dispatch(addPayment({
      invoiceId,
      paymentData: {
        amount,
        method,
        date: new Date().toISOString()
      }
    }))
    setShowPaymentModal(false)
    setSelectedInvoice(null)
  }

  const handleDeleteInvoice = (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      dispatch(deleteInvoice(id))
    }
  }

  const handleGenerateFromWorkOrder = (workOrderId: string) => {
    const workOrder = workOrders.find(wo => wo.id === workOrderId)
    const customer = customers.find(c => c.id === workOrder?.customerId)
    
    if (workOrder && customer) {
      // Create invoice from work order
      const invoiceData = {
        customerId: customer.id,
        customerName: customer.name,
        workOrderId: workOrder.id,
        items: workOrder.services.map(service => ({
          description: service.name,
          quantity: 1,
          unitPrice: service.price,
          total: service.price
        })),
        subtotal: workOrder.services.reduce((sum, service) => sum + service.price, 0),
        tax: 0,
        total: workOrder.services.reduce((sum, service) => sum + service.price, 0),
        status: 'draft' as const
      }
      dispatch(createInvoice(invoiceData))
    }
  }

  const renderInvoices = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Invoices</h2>
          <p className="text-gray-600">Manage customer invoices and payments</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => dispatch(markAsOverdue())}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          >
            <HiRefresh className="w-4 h-4" />
            Update Overdue
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <HiPlus className="w-4 h-4" />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{totalInvoices}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <HiDocumentText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Paid</p>
              <p className="text-2xl font-bold text-green-600">{paidInvoices}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <HiCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{overdueInvoices}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <HiExclamation className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-blue-600">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <HiCurrencyDollar className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Outstanding</p>
              <p className="text-2xl font-bold text-yellow-600">${outstandingAmount.toLocaleString()}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <HiClock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <HiSearch className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer & Vehicle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.map(invoice => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">#{invoice.id}</div>
                      <div className="text-sm text-gray-500">WO: {invoice.workOrderId}</div>
                      {invoice.notes && (
                        <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                          {invoice.notes}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{invoice.customerName}</div>
                      <div className="text-sm text-gray-500">{invoice.vehicleInfo}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm text-gray-900">
                        Created: {new Date(invoice.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        Due: {new Date(invoice.dueDate).toLocaleDateString()}
                      </div>
                      {invoice.paymentDate && (
                        <div className="text-sm text-green-600">
                          Paid: {new Date(invoice.paymentDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        ${invoice.total.toFixed(2)}
                      </div>
                      {invoice.paidAmount > 0 && invoice.paidAmount < invoice.total && (
                        <div className="text-sm text-blue-600">
                          Paid: ${invoice.paidAmount.toFixed(2)}
                        </div>
                      )}
                      {invoice.status === 'paid' && (
                        <div className="text-xs text-green-600 font-medium">
                          {invoice.paymentMethod}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button 
                        className="text-blue-600 hover:text-blue-900"
                        title="View invoice"
                      >
                        <HiEye className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-green-600 hover:text-green-900"
                        title="Download PDF"
                      >
                        <HiDownload className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-purple-600 hover:text-purple-900"
                        title="Send email"
                      >
                        <HiMail className="w-4 h-4" />
                      </button>
                      {invoice.status !== 'paid' && (
                        <button 
                          onClick={() => {
                            setSelectedInvoice(invoice)
                            setShowPaymentModal(true)
                          }}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Record payment"
                        >
                          <HiCurrencyDollar className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        className="text-gray-600 hover:text-gray-900"
                        title="Edit"
                      >
                        <HiPencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteInvoice(invoice.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <HiTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderPayments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Payment History</h2>
          <p className="text-gray-600">Track all payments received</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices
                .filter(inv => inv.status === 'paid' && inv.paymentDate)
                .sort((a, b) => new Date(b.paymentDate!).getTime() - new Date(a.paymentDate!).getTime())
                .map(invoice => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(invoice.paymentDate!).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(invoice.paymentDate!).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{invoice.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{invoice.customerName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        ${invoice.paidAmount.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 capitalize">
                        {invoice.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900">
                        <HiEye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Invoice Settings</h2>
        <p className="text-gray-600">Configure invoice templates and defaults</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Company Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={settings.companyInfo.name}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <textarea
                value={settings.companyInfo.address}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={settings.companyInfo.phone}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={settings.companyInfo.email}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID</label>
                <input
                  type="text"
                  value={settings.companyInfo.taxId || ''}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License #</label>
                <input
                  type="text"
                  value={settings.companyInfo.license || ''}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Defaults */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Invoice Defaults</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.invoiceDefaults.taxRate}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option value="Net 30">Net 30</option>
                  <option value="Net 15">Net 15</option>
                  <option value="Due on Receipt">Due on Receipt</option>
                  <option value="Net 60">Net 60</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Prefix</label>
                <input
                  type="text"
                  value={settings.invoiceDefaults.invoicePrefix}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Next Invoice #</label>
                <input
                  type="number"
                  value={settings.invoiceDefaults.nextInvoiceNumber}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Late Fee Penalty (%)</label>
              <input
                type="number"
                step="0.1"
                value={settings.invoiceDefaults.lateFeePenalty}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              />
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Accepted Payment Methods</h3>
          
          <div className="space-y-3">
            {Object.entries(settings.paymentMethods).map(([method, enabled]) => (
              <div key={method} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {method.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <button className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  enabled ? 'bg-blue-600' : 'bg-gray-200'
                }`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    enabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Template Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Template Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.template.primaryColor}
                  className="w-12 h-10 border border-gray-300 rounded"
                />
                <input
                  type="text"
                  value={settings.template.primaryColor}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Show Company Logo</span>
                <button className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings.template.showCompanyLogo ? 'bg-blue-600' : 'bg-gray-200'
                }`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.template.showCompanyLogo ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Show Tax Breakdown</span>
                <button className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings.template.showTaxBreakdown ? 'bg-blue-600' : 'bg-gray-200'
                }`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.template.showTaxBreakdown ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Show Labor Details</span>
                <button className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  settings.template.showLaborDetails ? 'bg-blue-600' : 'bg-gray-200'
                }`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    settings.template.showLaborDetails ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Footer Text</label>
              <textarea
                value={settings.template.footerText}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                rows={3}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium">
          Save Settings
        </button>
      </div>
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      <PageTitle title="Invoices & Billing" />

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: 'invoices', label: 'Invoices', count: invoices.length },
              { key: 'payments', label: 'Payments', count: invoices.filter(i => i.status === 'paid').length },
              { key: 'settings', label: 'Settings', count: 0 }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} {tab.count > 0 && `(${tab.count})`}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'invoices' && renderInvoices()}
          {activeTab === 'payments' && renderPayments()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Record Payment</h3>
              <button 
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiX className="w-6 h-6" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Invoice: #{selectedInvoice.id}</p>
                <p className="text-sm text-gray-600">Customer: {selectedInvoice.customerName}</p>
                <p className="text-sm font-medium">Amount Due: ${(selectedInvoice.total - (selectedInvoice.paidAmount || 0)).toFixed(2)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Amount</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="0.00"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option value="cash">Cash</option>
                  <option value="check">Check</option>
                  <option value="credit card">Credit Card</option>
                  <option value="debit card">Debit Card</option>
                  <option value="bank transfer">Bank Transfer</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handlePaymentRecord(selectedInvoice.id, 100, 'cash')}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                  Record Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
