import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { customerService } from '../../services/customers';
import { toast } from 'react-hot-toast';
import { 
  CreditCard, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Clock,
  Download,
  RefreshCw,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Star,
  FileText,
  Banknote,
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Edit,
  Trash2
} from '../../utils/icons';

interface Invoice {
  _id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  serviceType: string;
  subtotal: number;
  tax: number;
  total: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  paymentMethod?: string;
  paymentDate?: string;
  paymentReference?: string;
  appointmentId?: {
    _id: string;
    date: string;
    serviceType: string;
  };
  createdAt: string;
}

interface PaymentStats {
  totalInvoices: number;
  totalPaid: number;
  totalOutstanding: number;
  overdueAmount: number;
  averageInvoiceAmount: number;
  lastPaymentDate?: string;
  nextPaymentDue?: string;
}

interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'bank_account' | 'paypal';
  name: string;
  last4?: string;
  expiryDate?: string;
  isDefault: boolean;
  isActive: boolean;
}

export default function CustomerPayments() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalInvoices: 0,
    totalPaid: 0,
    totalOutstanding: 0,
    overdueAmount: 0,
    averageInvoiceAmount: 0
  });
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status' | 'dueDate'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);

  // Get status badge
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { color: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-4 h-4" /> },
      overdue: { color: 'bg-red-100 text-red-800', icon: <AlertTriangle className="w-4 h-4" /> },
      sent: { color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-4 h-4" /> },
      draft: { color: 'bg-gray-100 text-gray-800', icon: <FileText className="w-4 h-4" /> },
      cancelled: { color: 'bg-red-100 text-red-800', icon: <XCircle className="w-4 h-4" /> }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Calculate stats
  const calculateStats = (invoices: Invoice[]) => {
    if (invoices.length === 0) return stats;

    const totalPaid = invoices
      .filter(invoice => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + invoice.total, 0);
    
    const totalOutstanding = invoices
      .filter(invoice => invoice.status !== 'paid' && invoice.status !== 'cancelled')
      .reduce((sum, invoice) => sum + invoice.total, 0);
    
    const overdueAmount = invoices
      .filter(invoice => invoice.status === 'overdue')
      .reduce((sum, invoice) => sum + invoice.total, 0);
    
    const averageInvoiceAmount = invoices.reduce((sum, invoice) => sum + invoice.total, 0) / invoices.length;

    // Find last payment date
    const lastPaymentDate = invoices
      .filter(invoice => invoice.status === 'paid' && invoice.paymentDate)
      .sort((a, b) => new Date(b.paymentDate!).getTime() - new Date(a.paymentDate!).getTime())[0]?.paymentDate;

    // Find next payment due
    const nextPaymentDue = invoices
      .filter(invoice => invoice.status !== 'paid' && invoice.status !== 'cancelled')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]?.dueDate;

    return {
      totalInvoices: invoices.length,
      totalPaid,
      totalOutstanding,
      overdueAmount,
      averageInvoiceAmount,
      lastPaymentDate,
      nextPaymentDue
    };
  };

  // Filter and sort invoices
  const filterAndSortInvoices = () => {
    let filtered = invoices.filter(invoice => {
      const matchesSearch = invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           invoice.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === 'all' || invoice.status === selectedStatus;
      
      const matchesYear = selectedYear === 'all' || 
                         new Date(invoice.date).getFullYear().toString() === selectedYear;
      
      return matchesSearch && matchesStatus && matchesYear;
    });

    // Sort invoices
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
          break;
        case 'amount':
          aValue = a.total;
          bValue = b.total;
          break;
        case 'status':
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case 'dueDate':
          aValue = new Date(a.dueDate).getTime();
          bValue = new Date(b.dueDate).getTime();
          break;
        default:
          aValue = new Date(a.date).getTime();
          bValue = new Date(b.date).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredInvoices(filtered);
  };

  // Load payment data
  const loadPaymentData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await customerService.getCustomerInvoices();
      
      if (response.success) {
        setInvoices(response.data.invoices);
        setFilteredInvoices(response.data.invoices);
        setStats(calculateStats(response.data.invoices));
      } else {
        setError('Failed to load payment data');
        toast.error('Failed to load payment data');
      }
    } catch (err) {
      console.error('Error loading payment data:', err);
      setError('An error occurred while loading payment data');
      toast.error('An error occurred while loading payment data');
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique years from invoices
  const getUniqueYears = () => {
    const years = [...new Set(invoices.map(invoice => 
      new Date(invoice.date).getFullYear().toString()
    ))];
    return years.sort((a, b) => parseInt(b) - parseInt(a));
  };

  // Download invoice
  const downloadInvoice = async (invoiceId: string) => {
    try {
      // In a real implementation, this would trigger a PDF download
      toast.success('Invoice download initiated');
    } catch (err) {
      toast.error('Failed to download invoice');
    }
  };

  // Process payment
  const processPayment = async (invoiceId: string, paymentMethod: string) => {
    try {
      // In a real implementation, this would integrate with a payment processor
      toast.success('Payment processed successfully');
      await loadPaymentData(); // Refresh data
    } catch (err) {
      toast.error('Failed to process payment');
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadPaymentData();
  }, []);

  // Filter and sort when filters change
  useEffect(() => {
    filterAndSortInvoices();
  }, [invoices, searchTerm, selectedStatus, selectedYear, sortBy, sortOrder]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Payment Data</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={loadPaymentData}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payments & Invoices</h1>
              <p className="text-gray-600">Manage your payment methods and view payment history</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAddPaymentMethod(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Payment Method
              </button>
              <button
                onClick={loadPaymentData}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalInvoices}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalPaid)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Outstanding</p>
                <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.totalOutstanding)}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.overdueAmount)}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Methods Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Payment Methods</h2>
            <button
              onClick={() => setShowAddPaymentMethod(true)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Add New
            </button>
          </div>
          
          {paymentMethods.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payment Methods</h3>
              <p className="text-gray-600 mb-4">Add a payment method to make payments easier</p>
              <button
                onClick={() => setShowAddPaymentMethod(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Payment Method
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-900">{method.name}</span>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    {method.last4 && <p>•••• {method.last4}</p>}
                    {method.expiryDate && <p>Expires {method.expiryDate}</p>}
                    <div className="flex items-center gap-2">
                      {method.isDefault && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Default
                        </span>
                      )}
                      {!method.isActive && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="sent">Sent</option>
                <option value="overdue">Overdue</option>
                <option value="draft">Draft</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Year Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Years</option>
                {getUniqueYears().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-') as ['date' | 'amount' | 'status' | 'dueDate', 'asc' | 'desc'];
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date-desc">Date (Newest)</option>
                <option value="date-asc">Date (Oldest)</option>
                <option value="amount-desc">Amount (High to Low)</option>
                <option value="amount-asc">Amount (Low to High)</option>
                <option value="dueDate-asc">Due Date (Soonest)</option>
                <option value="dueDate-desc">Due Date (Latest)</option>
                <option value="status-asc">Status (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Invoices List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Invoices ({filteredInvoices.length})
            </h3>
          </div>

          {filteredInvoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Invoices Found</h3>
              <p className="text-gray-600">
                {invoices.length === 0 
                  ? "You don't have any invoices yet." 
                  : "No invoices match your current filters."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <div key={invoice._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="text-lg font-semibold text-gray-900">{invoice.invoiceNumber}</h4>
                          {getStatusBadge(invoice.status)}
                        </div>
                        
                        <p className="text-gray-600 mb-3">{invoice.serviceType}</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">{formatDate(invoice.date)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">Due: {formatDate(invoice.dueDate)}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600 font-semibold">{formatCurrency(invoice.total)}</span>
                          </div>

                          {invoice.paymentMethod && (
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{invoice.paymentMethod}</span>
                            </div>
                          )}
                        </div>

                        {expandedInvoice === invoice._id && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="font-medium text-gray-700 mb-1">Subtotal</p>
                                <p className="text-gray-600">{formatCurrency(invoice.subtotal)}</p>
                              </div>
                              <div>
                                <p className="font-medium text-gray-700 mb-1">Tax</p>
                                <p className="text-gray-600">{formatCurrency(invoice.tax)}</p>
                              </div>
                              {invoice.paymentReference && (
                                <div>
                                  <p className="font-medium text-gray-700 mb-1">Payment Reference</p>
                                  <p className="text-gray-600 font-mono">{invoice.paymentReference}</p>
                                </div>
                              )}
                              {invoice.paymentDate && (
                                <div>
                                  <p className="font-medium text-gray-700 mb-1">Payment Date</p>
                                  <p className="text-gray-600">{formatDate(invoice.paymentDate)}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                        <button
                          onClick={() => processPayment(invoice._id, 'online')}
                          className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <DollarSign className="w-4 h-4" />
                          Pay Now
                        </button>
                      )}
                      
                      <button
                        onClick={() => downloadInvoice(invoice._id)}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                      
                      <button
                        onClick={() => setExpandedInvoice(
                          expandedInvoice === invoice._id ? null : invoice._id
                        )}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {expandedInvoice === invoice._id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
