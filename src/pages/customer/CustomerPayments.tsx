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
  Trash2,
  X,
  Save,
  Shield,
  Calculator,
  Eye
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
  type: 'credit_card' | 'debit_card' | 'bank_account' | 'paypal' | 'digital_wallet';
  name: string;
  last4?: string;
  expiryDate?: string;
  isDefault: boolean;
  isActive: boolean;
  brand?: string;
  bankName?: string;
  accountType?: string;
}

interface FinancingOption {
  id: string;
  name: string;
  type: 'loan' | 'lease' | 'payment_plan';
  amount: number;
  term: number;
  interestRate: number;
  monthlyPayment: number;
  totalCost: number;
  status: 'active' | 'completed' | 'defaulted';
  startDate: string;
  endDate: string;
  remainingBalance: number;
  nextPaymentDate: string;
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
  const [financingOptions, setFinancingOptions] = useState<FinancingOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'payment-methods' | 'invoices' | 'financing'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status' | 'dueDate'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedInvoice, setExpandedInvoice] = useState<string | null>(null);
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState({
    type: 'credit_card' as 'credit_card' | 'debit_card' | 'bank_account' | 'paypal' | 'digital_wallet',
    name: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    bankName: '',
    accountNumber: '',
    routingNumber: '',
    accountType: 'checking' as 'checking' | 'savings',
    isDefault: false
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Load payment data with retry logic
  const loadPaymentData = async (retryCount = 0) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await customerService.getCustomerInvoices();
      
      if (response.success) {
        setInvoices(response.data.invoices);
        setFilteredInvoices(response.data.invoices);
        setStats(calculateStats(response.data.invoices));
      } else {
        const errorMessage = 'Failed to load payment data';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err: any) {
      console.error('Error loading payment data:', err);
      
      // Handle specific error types
      let errorMessage = 'An error occurred while loading payment data';
      if (err.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Access denied. You do not have permission to view this data.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Payment data not found.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.code === 'NETWORK_ERROR' || !navigator.onLine) {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      setError(errorMessage);
      
      // Retry logic for network errors
      if (retryCount < 2 && (err.code === 'NETWORK_ERROR' || err.response?.status >= 500)) {
        toast.error(`${errorMessage} Retrying... (${retryCount + 1}/2)`);
        setTimeout(() => loadPaymentData(retryCount + 1), 2000 * (retryCount + 1));
        return;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Load payment methods from API with error handling
  const loadPaymentMethods = async () => {
    try {
      const response = await customerService.getCustomerPaymentMethods();
      
      if (response.success) {
        // Transform API data to match our interface
        const transformedMethods: PaymentMethod[] = response.data.paymentMethods.map((pm: any) => ({
          id: pm.id,
          type: pm.type === 'card' ? 'credit_card' : pm.type,
          name: pm.card ? `${pm.card.brand} ending in ${pm.card.last4}` : 'Payment Method',
          last4: pm.card?.last4 || '',
          expiryDate: pm.card ? `${pm.card.expMonth.toString().padStart(2, '0')}/${pm.card.expYear.toString().slice(-2)}` : undefined,
          isDefault: pm.isDefault || false,
          isActive: pm.isActive !== false,
          brand: pm.card?.brand,
          bankName: pm.type === 'bank_account' ? 'Bank Account' : undefined,
          accountType: pm.type === 'bank_account' ? 'Checking' : undefined
        }));
        setPaymentMethods(transformedMethods);
      } else {
        const errorMessage = 'Failed to load payment methods';
        console.error('Failed to load payment methods:', response);
        toast.error(errorMessage);
      }
    } catch (err: any) {
      console.error('Error loading payment methods:', err);
      
      let errorMessage = 'Error loading payment methods';
      if (err.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Access denied. You do not have permission to view payment methods.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.code === 'NETWORK_ERROR' || !navigator.onLine) {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      toast.error(errorMessage);
    }
  };

  // Load financing options from API with error handling
  const loadFinancingOptions = async () => {
    try {
      const response = await customerService.getCustomerArrangements();
      
      if (response.success) {
        // Transform API data to match our interface
        const transformedOptions: FinancingOption[] = response.data.arrangements.map((arrangement: any) => ({
          id: arrangement._id,
          name: arrangement.notes || `${arrangement.type.replace('_', ' ')} Plan`,
          type: arrangement.type === 'payment_plan' ? 'payment_plan' : 
                arrangement.type === 'installment' ? 'loan' : 'lease',
          amount: arrangement.amount,
          term: arrangement.term || 12,
          interestRate: arrangement.interestRate || 0,
          monthlyPayment: arrangement.monthlyPayment || (arrangement.amount / (arrangement.term || 12)),
          totalCost: arrangement.totalCost || arrangement.amount,
          status: arrangement.status === 'active' ? 'active' :
                  arrangement.status === 'completed' ? 'completed' : 'defaulted',
          startDate: arrangement.date || arrangement.createdAt,
          endDate: arrangement.dueDate,
          remainingBalance: arrangement.remainingBalance || arrangement.amount,
          nextPaymentDate: arrangement.nextPaymentDate || arrangement.dueDate
        }));
        setFinancingOptions(transformedOptions);
      } else {
        const errorMessage = 'Failed to load financing options';
        console.error('Failed to load financing options:', response);
        toast.error(errorMessage);
      }
    } catch (err: any) {
      console.error('Error loading financing options:', err);
      
      let errorMessage = 'Error loading financing options';
      if (err.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Access denied. You do not have permission to view financing options.';
      } else if (err.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (err.code === 'NETWORK_ERROR' || !navigator.onLine) {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      toast.error(errorMessage);
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
      // Use the existing invoice payment endpoint
      const response = await customerService.addPayment(user?.id || '', {
        amount: 0, // Will be set by the invoice amount
        method: paymentMethod as any,
        reference: `INV-${invoiceId}`,
        notes: `Payment for invoice ${invoiceId}`,
        status: 'completed'
      });
      
      if (response.success) {
        toast.success('Payment processed successfully');
        await loadPaymentData(); // Refresh data
      } else {
        toast.error(response.message || 'Failed to process payment');
      }
    } catch (err) {
      console.error('Error processing payment:', err);
      toast.error('Failed to process payment');
    }
  };

  // Form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (formData.type === 'credit_card' || formData.type === 'debit_card') {
      if (!formData.cardNumber.trim()) {
        errors.cardNumber = 'Card number is required';
      } else if (!/^\d{4}\s?\d{4}\s?\d{4}\s?\d{4}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
        errors.cardNumber = 'Please enter a valid 16-digit card number';
      }

      if (!formData.expiryDate.trim()) {
        errors.expiryDate = 'Expiry date is required';
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) {
        errors.expiryDate = 'Please enter expiry date in MM/YY format';
      }

      if (!formData.cvv.trim()) {
        errors.cvv = 'CVV is required';
      } else if (!/^\d{3,4}$/.test(formData.cvv)) {
        errors.cvv = 'Please enter a valid CVV';
      }
    }

    if (formData.type === 'bank_account') {
      if (!formData.bankName.trim()) {
        errors.bankName = 'Bank name is required';
      }
      if (!formData.accountNumber.trim()) {
        errors.accountNumber = 'Account number is required';
      }
      if (!formData.routingNumber.trim()) {
        errors.routingNumber = 'Routing number is required';
      } else if (!/^\d{9}$/.test(formData.routingNumber)) {
        errors.routingNumber = 'Please enter a valid 9-digit routing number';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission with comprehensive error handling
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Prepare payment method data for API
      const paymentMethodData = {
        type: 'card' as const,
        card: {
          number: formData.cardNumber.replace(/\s/g, ''),
          exp_month: parseInt(formData.expiryDate.split('/')[0]),
          exp_year: parseInt('20' + formData.expiryDate.split('/')[1]),
          cvc: formData.cvv
        },
        billing_details: {
          name: formData.name
        }
      };

      const response = await customerService.addPaymentMethod(paymentMethodData);
      
      if (response.success) {
        // Reload payment methods to get updated list
        await loadPaymentMethods();
        
        // If setting as default, set it as default
        if (formData.isDefault && response.data.paymentMethod) {
          try {
            await customerService.setDefaultPaymentMethod(response.data.paymentMethod.id);
            await loadPaymentMethods(); // Reload again to reflect default status
          } catch (defaultError) {
            console.warn('Failed to set default payment method:', defaultError);
            toast.error('Payment method added but failed to set as default. You can set it as default later.');
          }
        }
        
        setShowAddPaymentMethod(false);
        resetForm();
        toast.success('Payment method added successfully!');
      } else {
        const errorMessage = response.message || 'Error adding payment method. Please try again.';
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error adding payment method:', error);
      
      let errorMessage = 'Error adding payment method. Please try again.';
      if (error.response?.status === 400) {
        errorMessage = 'Invalid payment method data. Please check your card details.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. You do not have permission to add payment methods.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message?.includes('card')) {
        errorMessage = 'Invalid card information. Please check your card details and try again.';
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      type: 'credit_card',
      name: '',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      bankName: '',
      accountNumber: '',
      routingNumber: '',
      accountType: 'checking',
      isDefault: false
    });
    setFormErrors({});
  };

  // Handle delete payment method with error handling
  const handleDeletePaymentMethod = async (methodId: string) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      try {
        const response = await customerService.deletePaymentMethod(methodId);
        
        if (response.success) {
          // Reload payment methods to get updated list
          await loadPaymentMethods();
          toast.success('Payment method deleted successfully');
        } else {
          const errorMessage = response.message || 'Error deleting payment method';
          toast.error(errorMessage);
        }
      } catch (error: any) {
        console.error('Error deleting payment method:', error);
        
        let errorMessage = 'Error deleting payment method';
        if (error.response?.status === 401) {
          errorMessage = 'Authentication required. Please log in again.';
        } else if (error.response?.status === 403) {
          errorMessage = 'Access denied. You do not have permission to delete payment methods.';
        } else if (error.response?.status === 404) {
          errorMessage = 'Payment method not found.';
        } else if (error.response?.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
          errorMessage = 'Network error. Please check your internet connection.';
        }
        
        toast.error(errorMessage);
      }
    }
  };

  // Handle set default payment method with error handling
  const handleSetDefault = async (methodId: string) => {
    try {
      const response = await customerService.setDefaultPaymentMethod(methodId);
      
      if (response.success) {
        // Reload payment methods to get updated list
        await loadPaymentMethods();
        toast.success('Default payment method updated');
      } else {
        const errorMessage = response.message || 'Error updating default payment method';
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error('Error setting default payment method:', error);
      
      let errorMessage = 'Error updating default payment method';
      if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please log in again.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Access denied. You do not have permission to update payment methods.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Payment method not found.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
        errorMessage = 'Network error. Please check your internet connection.';
      }
      
      toast.error(errorMessage);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadPaymentData();
    loadPaymentMethods();
    loadFinancingOptions();
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
                onClick={() => loadPaymentData()}
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
    <div className="min-h-screen bg-gray-50 p-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-l-4 border-blue-500">
        <div className="flex justify-between items-start">
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
                onClick={() => loadPaymentData()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', name: 'Overview', icon: TrendingUp },
              { id: 'payment-methods', name: 'Payment Methods', icon: CreditCard },
              { id: 'invoices', name: 'Invoices', icon: FileText },
              { id: 'financing', name: 'Financing', icon: Calculator }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
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
          </>
        )}

        {/* Payment Methods Tab */}
        {activeTab === 'payment-methods' && (
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
                      <button 
                        onClick={() => setEditingPaymentMethod(method)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {!method.isDefault && (
                        <button 
                          onClick={() => handleDeletePaymentMethod(method.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      {!method.isDefault && (
                        <button 
                          onClick={() => handleSetDefault(method.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          title="Set as Default"
                        >
                          Set Default
                        </button>
                      )}
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
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <>
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
          </>
        )}

        {/* Financing Tab */}
        {activeTab === 'financing' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Financing Options</h2>
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                Apply for Financing
              </button>
            </div>

            <div className="grid gap-6">
              {financingOptions.map((option) => (
                <div
                  key={option.id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{option.name}</h3>
                      <p className="text-sm text-gray-500 capitalize">{option.type.replace('_', ' ')}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      option.status === 'active' ? 'bg-green-100 text-green-800' :
                      option.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {option.status.charAt(0).toUpperCase() + option.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Original Amount</p>
                      <p className="text-lg font-semibold text-gray-900">{formatCurrency(option.amount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Remaining Balance</p>
                      <p className="text-lg font-semibold text-gray-900">{formatCurrency(option.remainingBalance)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Monthly Payment</p>
                      <p className="text-lg font-semibold text-gray-900">{formatCurrency(option.monthlyPayment)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Next Payment</p>
                      <p className="text-lg font-semibold text-gray-900">{formatDate(option.nextPaymentDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-4">
                      <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </button>
                      <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <Download className="w-4 h-4 mr-2" />
                        Download Statement
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Term: {option.term} months</p>
                      <p className="text-sm text-gray-500">Rate: {option.interestRate}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Payment Method Modal */}
      {showAddPaymentMethod && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddPaymentMethod(false);
              resetForm();
            }
          }}
        >
          <div 
            className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">Add Payment Method</h3>
                <button
                  onClick={() => {
                    setShowAddPaymentMethod(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                {/* Payment Method Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="credit_card">Credit Card</option>
                    <option value="debit_card">Debit Card</option>
                    <option value="bank_account">Bank Account</option>
                    <option value="paypal">PayPal</option>
                    <option value="digital_wallet">Digital Wallet</option>
                  </select>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name on Card/Account
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter full name"
                  />
                  {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
                </div>

                {/* Credit/Debit Card Fields */}
                {(formData.type === 'credit_card' || formData.type === 'debit_card') && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={formData.cardNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                          setFormData({ ...formData, cardNumber: value });
                        }}
                        className={`w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.cardNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                      {formErrors.cardNumber && <p className="text-red-500 text-xs mt-1">{formErrors.cardNumber}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          value={formData.expiryDate}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').replace(/(.{2})/, '$1/');
                            setFormData({ ...formData, expiryDate: value });
                          }}
                          className={`w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                            formErrors.expiryDate ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                        {formErrors.expiryDate && <p className="text-red-500 text-xs mt-1">{formErrors.expiryDate}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          CVV
                        </label>
                        <input
                          type="text"
                          value={formData.cvv}
                          onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '') })}
                          className={`w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                            formErrors.cvv ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="123"
                          maxLength={4}
                        />
                        {formErrors.cvv && <p className="text-red-500 text-xs mt-1">{formErrors.cvv}</p>}
                      </div>
                    </div>
                  </>
                )}

                {/* Bank Account Fields */}
                {formData.type === 'bank_account' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        value={formData.bankName}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        className={`w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.bankName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter bank name"
                      />
                      {formErrors.bankName && <p className="text-red-500 text-xs mt-1">{formErrors.bankName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Account Number
                      </label>
                      <input
                        type="text"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                        className={`w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.accountNumber ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter account number"
                      />
                      {formErrors.accountNumber && <p className="text-red-500 text-xs mt-1">{formErrors.accountNumber}</p>}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Routing Number
                        </label>
                        <input
                          type="text"
                          value={formData.routingNumber}
                          onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value.replace(/\D/g, '') })}
                          className={`w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 ${
                            formErrors.routingNumber ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="123456789"
                          maxLength={9}
                        />
                        {formErrors.routingNumber && <p className="text-red-500 text-xs mt-1">{formErrors.routingNumber}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Account Type
                        </label>
                        <select
                          value={formData.accountType}
                          onChange={(e) => setFormData({ ...formData, accountType: e.target.value as 'checking' | 'savings' })}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="checking">Checking</option>
                          <option value="savings">Savings</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* Default Payment Method */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
                    Set as default payment method
                  </label>
                </div>

                {/* Security Notice */}
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Secure Payment Processing</p>
                    <p>Your payment information is encrypted and secure. We never store your full card details.</p>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddPaymentMethod(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Adding...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Add Payment Method
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
