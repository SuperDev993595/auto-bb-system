import { useState, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../redux'
import { toast } from 'react-hot-toast'
import {
  fetchInvoices,
  fetchInvoiceStats,
  fetchPaymentStats,
  fetchInvoiceTemplates,
  updateInvoice,
  deleteInvoice,
  addPayment,
  sendInvoice,
  createInvoice,
  markAsOverdue,
  downloadInvoicePDF,
  sendInvoiceEmail
} from '../redux/actions/invoices'
import { fetchWorkOrders } from '../redux/actions/services'
import { Invoice } from '../redux/reducer/invoicesReducer'
import PageTitle from '../components/Shared/PageTitle'
import AddInvoiceModal from '../components/invoices/AddInvoiceModal'
import EditInvoiceModal from '../components/invoices/EditInvoiceModal'
import DeleteInvoiceModal from '../components/invoices/DeleteInvoiceModal'
import PaymentModal from '../components/invoices/PaymentModal';
import ViewInvoiceModal from '../components/invoices/ViewInvoiceModal';
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
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cash')
  
  // Invoice modal states
  const [showAddInvoiceModal, setShowAddInvoiceModal] = useState(false)
  const [showEditInvoiceModal, setShowEditInvoiceModal] = useState(false)
  const [showDeleteInvoiceModal, setShowDeleteInvoiceModal] = useState(false)
  const [showViewInvoiceModal, setShowViewInvoiceModal] = useState(false)
  
  const { 
    invoices, 
    templates, 
    stats, 
    paymentStats,
    loading,
    settings
  } = useAppSelector(state => state.invoices)
  const customers = useAppSelector(state => state.customers.list)
  const workOrders = useAppSelector(state => state.services.workOrders)
  const dispatch = useAppDispatch()

  // Load data on component mount
  useEffect(() => {
    dispatch(fetchInvoices({}))
    dispatch(fetchInvoiceStats())
    dispatch(fetchPaymentStats())
    dispatch(fetchInvoiceTemplates())
    dispatch(fetchWorkOrders({}))
  }, [dispatch])

  // Filter invoices with safety check
  const filteredInvoices = (invoices || []).filter(invoice => {
    const customerName = typeof invoice.customerId === 'object' ? invoice.customerId.name : 
                        invoice.customer?.name || invoice.customerName || ''
    const matchesSearch = customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (invoice._id || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Calculate metrics with safety checks
  const totalInvoices = (invoices || []).length
  const paidInvoices = (invoices || []).filter(inv => inv.status === 'paid').length
  const overdueInvoices = (invoices || []).filter(inv => inv.status === 'overdue').length
  const totalRevenue = (invoices || []).filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + (inv.total || 0), 0)
  const outstandingAmount = (invoices || []).filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
    .reduce((sum, inv) => sum + ((inv.total || 0) - (inv.paidAmount || 0)), 0)

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

  const handlePaymentRecord = (invoiceId: string) => {
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
      toast.error('Please enter a valid payment amount')
      return
    }
    
    dispatch(addPayment({
      id: invoiceId,
      paymentData: {
        amount: parseFloat(paymentAmount),
        paymentMethod: paymentMethod,
        date: new Date().toISOString()
      }
    }))
    setShowPaymentModal(false)
    setSelectedInvoice(null)
    setPaymentAmount('')
    setPaymentMethod('cash')
  }

  const handleDeleteInvoice = (id: string) => {
    const invoice = invoices.find(inv => inv._id === id)
    if (invoice) {
      setSelectedInvoice(invoice)
      setShowDeleteInvoiceModal(true)
    }
  }

  const handleOpenPaymentModal = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowPaymentModal(true)
    setPaymentAmount('')
    setPaymentMethod('cash')
  }

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false)
    setSelectedInvoice(null)
    setPaymentAmount('')
    setPaymentMethod('cash')
  }

  const handleDownloadPDF = (invoiceId: string) => {
    toast.promise(
      dispatch(downloadInvoicePDF(invoiceId)).unwrap(),
      {
        loading: 'Downloading PDF...',
        success: 'PDF downloaded successfully!',
        error: 'Failed to download PDF'
      }
    )
  }

  const handleSendEmail = (invoiceId: string) => {
    toast.promise(
      dispatch(sendInvoiceEmail({ id: invoiceId, emailData: {} })).unwrap(),
      {
        loading: 'Sending email...',
        success: 'Email sent successfully!',
        error: 'Failed to send email'
      }
    )
  }

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setShowViewInvoiceModal(true)
  }

  const handleInvoiceSuccess = () => {
    dispatch(fetchInvoices({}))
    dispatch(fetchInvoiceStats())
    dispatch(fetchWorkOrders({}))
  }

  const handleGenerateFromWorkOrder = (workOrderId: string) => {
    const workOrder = workOrders.find(wo => wo._id === workOrderId)
    const customer = customers.find(c => c._id === workOrder?.customer?._id)
    
    if (workOrder && customer) {
      // Create invoice from work order
      const invoiceData = {
        customerId: customer._id,
        customerName: customer.name,
        workOrderId: workOrder._id,
        items: workOrder.services.map(service => ({
          description: service.service?.name || service.description || 'Service',
          quantity: 1,
          unitPrice: service.laborRate,
          total: service.totalCost
        })),
        subtotal: workOrder.services.reduce((sum, service) => sum + service.totalCost, 0),
        tax: 0,
        total: workOrder.services.reduce((sum, service) => sum + service.totalCost, 0),
        status: 'draft' as const
      }
      dispatch(createInvoice(invoiceData))
    }
  }

  const renderInvoices = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
        <div className="mb-4 lg:mb-0">
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">Invoices</h2>
          <p className="text-secondary-600">Manage customer invoices and payments</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => dispatch(markAsOverdue('all'))}
            className="btn-secondary"
          >
            <HiRefresh className="w-4 h-4" />
            Update Overdue
          </button>
          <button 
            onClick={() => setShowAddInvoiceModal(true)}
            className="btn-primary"
          >
            <HiPlus className="w-4 h-4" />
            Create Invoice
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Invoices</p>
              <p className="text-2xl font-bold text-gray-900">{totalInvoices}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <HiDocumentText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paid Invoices</p>
              <p className="text-2xl font-bold text-green-600">{paidInvoices}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <HiCheck className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue Invoices</p>
              <p className="text-2xl font-bold text-red-600">{overdueInvoices}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <HiExclamation className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-purple-600">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <HiCurrencyDollar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <HiSearch className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400" />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input w-full pl-10 pr-4 py-2"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-input"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Invoices Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table-container">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">
                  Invoice Details
                </th>
                <th className="table-header-cell">
                  Customer & Vehicle
                </th>
                <th className="table-header-cell">
                  Dates
                </th>
                <th className="table-header-cell">
                  Amount
                </th>
                <th className="table-header-cell">
                  Status
                </th>
                <th className="table-header-cell">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredInvoices.map(invoice => (
                <tr key={invoice._id} className="table-row hover:bg-secondary-50">
                  <td className="table-cell">
                     <div>
                       <div className="text-xs font-medium text-secondary-900">#{invoice.invoiceNumber || invoice._id}</div>
                       <div className="text-xs text-secondary-600">
                         WO: {(() => {
                           const workOrder = workOrders.find(wo => wo._id === invoice.workOrderId);
                           return workOrder ? workOrder.workOrderNumber : (invoice.workOrderId || 'N/A');
                         })()}
                       </div>
                     </div>
                  </td>
                  <td className="table-cell">
                    <div>
                      <div className="text-xs font-medium text-secondary-900">
                        {typeof invoice.customerId === 'object' ? invoice.customerId.name : 
                         invoice.customer?.name || invoice.customerName || 'Customer not available'}
                      </div>
                      <div className="text-xs text-secondary-600">
                        {typeof invoice.vehicleId === 'object' ? invoice.vehicleId.fullName :
                         invoice.vehicle?.fullName || invoice.vehicleInfo || 'Vehicle info not available'}
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <div>
                      <div className="text-xs text-secondary-900">
                        Created: {new Date(invoice.date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-secondary-600">
                        Due: {new Date(invoice.dueDate).toLocaleDateString()}
                      </div>
                      {invoice.paidDate && (
                        <div className="text-sm text-green-600">
                          Paid: {new Date(invoice.paidDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="table-cell">
                    <div>
                      <div className="text-sm font-medium text-secondary-900">
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
                  <td className="table-cell">
                    <span className={`status-badge ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="table-cell text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleViewInvoice(invoice)}
                        className="text-secondary-600 hover:text-secondary-900"
                        title="View invoice"
                      >
                        <HiEye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDownloadPDF(invoice._id)}
                        className="text-secondary-600 hover:text-secondary-900"
                        title="Download PDF"
                      >
                        <HiDownload className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleSendEmail(invoice._id)}
                        className="text-secondary-600 hover:text-secondary-900"
                        title="Send email"
                      >
                        <HiMail className="w-4 h-4" />
                      </button>
                      {invoice.status !== 'paid' && (
                        <button 
                          onClick={() => handleOpenPaymentModal(invoice)}
                          className="text-secondary-600 hover:text-secondary-900"
                          title="Record payment"
                        >
                          <HiCurrencyDollar className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => {
                          setSelectedInvoice(invoice)
                          setShowEditInvoiceModal(true)
                        }}
                        className="text-secondary-600 hover:text-secondary-900"
                        title="Edit"
                      >
                        <HiPencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteInvoice(invoice._id)}
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

      <div className="card">
        <div className="overflow-x-auto">
          <table className="table-container">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">
                  Payment Date
                </th>
                <th className="table-header-cell">
                  Invoice
                </th>
                <th className="table-header-cell">
                  Customer
                </th>
                <th className="table-header-cell">
                  Amount
                </th>
                <th className="table-header-cell">
                  Method
                </th>
                <th className="table-header-cell">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="table-body">
              {(invoices || [])
                .filter(inv => inv.status === 'paid' && inv.paidDate)
                .sort((a, b) => new Date(b.paidDate!).getTime() - new Date(a.paidDate!).getTime())
                .map(invoice => (
                  <tr key={invoice._id} className="table-row hover:bg-secondary-50">
                    <td className="table-cell whitespace-nowrap">
                      <div className="text-sm text-secondary-900">
                        {new Date(invoice.paidDate!).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-secondary-500">
                        {new Date(invoice.paidDate!).toLocaleTimeString()}
                      </div>
                    </td>
                                         <td className="table-cell whitespace-nowrap">
                       <div className="text-sm font-medium text-secondary-900">#{invoice.invoiceNumber || invoice._id}</div>
                     </td>
                    <td className="table-cell whitespace-nowrap">
                      <div className="text-sm text-secondary-900">{invoice.customerName}</div>
                    </td>
                    <td className="table-cell whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        ${invoice.paidAmount.toFixed(2)}
                      </div>
                    </td>
                    <td className="table-cell whitespace-nowrap">
                      <span className="status-badge status-secondary capitalize">
                        {invoice.paymentMethod}
                      </span>
                    </td>
                    <td className="table-cell whitespace-nowrap text-sm font-medium">
                      <button className="text-secondary-600 hover:text-secondary-900">
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
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-secondary-800 mb-4">Company Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="form-label">Company Name</label>
              <input
                type="text"
                value={settings.companyInfo.name}
                className="form-input"
              />
            </div>
            
            <div>
              <label className="form-label">Address</label>
              <textarea
                value={settings.companyInfo.address}
                className="form-textarea"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Phone</label>
                <input
                  type="tel"
                  value={settings.companyInfo.phone}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input
                  type="email"
                  value={settings.companyInfo.email}
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Tax ID</label>
                <input
                  type="text"
                  value={(settings.companyInfo as any).taxId || ''}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">License #</label>
                <input
                  type="text"
                  value={(settings.companyInfo as any).license || ''}
                  className="form-input"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Defaults */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-secondary-800 mb-4">Invoice Defaults</h3>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settings.invoiceDefaults.taxRate}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Payment Terms</label>
                <select className="form-select">
                  <option value="Net 30">Net 30</option>
                  <option value="Net 15">Net 15</option>
                  <option value="Due on Receipt">Due on Receipt</option>
                  <option value="Net 60">Net 60</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label">Invoice Prefix</label>
                <input
                  type="text"
                  value={settings.invoiceDefaults.invoicePrefix}
                  className="form-input"
                />
              </div>
              <div>
                <label className="form-label">Next Invoice #</label>
                <input
                  type="number"
                  value={settings.invoiceDefaults.nextInvoiceNumber}
                  className="form-input"
                />
              </div>
            </div>
            
            <div>
              <label className="form-label">Late Fee Penalty (%)</label>
              <input
                type="number"
                step="0.1"
                value={(settings.invoiceDefaults as any).lateFeePenalty || 0}
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-secondary-800 mb-4">Accepted Payment Methods</h3>
          
          <div className="space-y-3">
            {Object.entries(settings.paymentMethods || {
              cash: true,
              check: true,
              creditCard: true,
              bankTransfer: true,
              online: true
            }).map(([method, enabled]) => (
              <div key={method} className="flex items-center justify-between">
                <span className="text-sm font-medium text-secondary-700 capitalize">
                  {method.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <button className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  enabled ? 'bg-blue-600' : 'bg-secondary-200'
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
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-secondary-800 mb-4">Template Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="form-label">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={(settings.template as any).primaryColor || settings.template.headerColor}
                  className="w-12 h-10 border border-secondary-300 rounded"
                />
                <input
                  type="text"
                  value={(settings.template as any).primaryColor || settings.template.headerColor}
                  className="form-input flex-1"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-secondary-700">Show Company Logo</span>
                <button className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  (settings.template as any).showCompanyLogo || settings.template.includeLogo ? 'bg-blue-600' : 'bg-secondary-200'
                }`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    (settings.template as any).showCompanyLogo || settings.template.includeLogo ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-secondary-700">Show Tax Breakdown</span>
                <button className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  (settings.template as any).showTaxBreakdown ? 'bg-blue-600' : 'bg-secondary-200'
                }`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    (settings.template as any).showTaxBreakdown ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-secondary-700">Show Labor Details</span>
                <button className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                  (settings.template as any).showLaborDetails ? 'bg-blue-600' : 'bg-secondary-200'
                }`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    (settings.template as any).showLaborDetails ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
            
            <div>
              <label className="form-label">Footer Text</label>
              <textarea
                value={settings.template.footerText}
                className="form-textarea"
                rows={3}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="btn-primary">
          Save Settings
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Invoices & Billing</h1>
            <p className="text-gray-600">Manage customer invoices and payments</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddInvoiceModal(true)}
              className="p-3 bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-colors"
              title="New Invoice"
            >
              <HiPlus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Total Invoices: {totalInvoices}
            </span>
            <span className="text-sm text-gray-500">
              Paid: {paidInvoices}
            </span>
            <span className="text-sm text-gray-500">
              Outstanding: ${outstandingAmount.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as TabType)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="invoices">Invoices</option>
              <option value="payments">Payments</option>
              <option value="settings">Settings</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card">
        <div className="tab-header">
          <nav className="tab-buttons">
            {[
              { key: 'invoices', label: 'Invoices', count: (invoices || []).length },
              { key: 'payments', label: 'Payments', count: (invoices || []).filter(i => i.status === 'paid').length },
              { key: 'settings', label: 'Settings', count: 0 }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={`tab-button ${activeTab === tab.key ? 'tab-button-active' : 'tab-button-inactive'}`}
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
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={handleClosePaymentModal}
          invoice={selectedInvoice}
          paymentAmount={paymentAmount}
          setPaymentAmount={setPaymentAmount}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          onConfirm={handlePaymentRecord}
          isLoading={loading}
        />
      )}

      {/* Invoice Modals */}
      {showAddInvoiceModal && (
        <AddInvoiceModal
          onClose={() => setShowAddInvoiceModal(false)}
          onSuccess={handleInvoiceSuccess}
        />
      )}

      {showEditInvoiceModal && (
        <EditInvoiceModal
          invoice={selectedInvoice}
          onClose={() => {
            setShowEditInvoiceModal(false)
            setSelectedInvoice(null)
          }}
          onSuccess={handleInvoiceSuccess}
        />
      )}

      {showDeleteInvoiceModal && (
        <DeleteInvoiceModal
          invoice={selectedInvoice}
          onClose={() => {
            setShowDeleteInvoiceModal(false)
            setSelectedInvoice(null)
          }}
          onSuccess={handleInvoiceSuccess}
        />
      )}

      {showViewInvoiceModal && (
        <ViewInvoiceModal
          invoice={selectedInvoice}
          onClose={() => {
            setShowViewInvoiceModal(false)
            setSelectedInvoice(null)
          }}
          onDownload={handleDownloadPDF}
          onSendEmail={handleSendEmail}
        />
      )}
    </div>
  )
}
