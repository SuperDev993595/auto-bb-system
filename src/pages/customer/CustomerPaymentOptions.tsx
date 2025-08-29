import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Wallet, 
  DollarSign, 
  Calendar, 
  Download, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  Lock,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  Filter,
  Search,
  FileText,
  Calculator,
  TrendingUp,
  CreditCard as CreditCardIcon,
  Banknote,
  Smartphone
} from '../../utils/icons';

interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'bank_account' | 'digital_wallet';
  name: string;
  last4: string;
  expiryDate?: string;
  isDefault: boolean;
  isActive: boolean;
  brand?: string;
  bankName?: string;
  accountType?: string;
}

interface BillingHistory {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  paymentMethod: string;
  invoiceNumber?: string;
  serviceType?: string;
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

export default function CustomerPaymentOptions() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [billingHistory, setBillingHistory] = useState<BillingHistory[]>([]);
  const [financingOptions, setFinancingOptions] = useState<FinancingOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('payment-methods');
  const [showAddPaymentMethod, setShowAddPaymentMethod] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      const mockPaymentMethods: PaymentMethod[] = [
        {
          id: '1',
          type: 'credit_card',
          name: 'Visa ending in 1234',
          last4: '1234',
          expiryDate: '12/25',
          isDefault: true,
          isActive: true,
          brand: 'Visa'
        },
        {
          id: '2',
          type: 'bank_account',
          name: 'Chase Bank Account',
          last4: '5678',
          isDefault: false,
          isActive: true,
          bankName: 'Chase Bank',
          accountType: 'Checking'
        }
      ];

      const mockBillingHistory: BillingHistory[] = [
        {
          id: '1',
          date: '2024-01-15',
          description: 'Oil Change & Inspection',
          amount: 89.99,
          status: 'paid',
          paymentMethod: 'Visa ending in 1234',
          invoiceNumber: 'INV-2024-001',
          serviceType: 'Maintenance'
        },
        {
          id: '2',
          date: '2024-01-10',
          description: 'Brake Pad Replacement',
          amount: 245.50,
          status: 'paid',
          paymentMethod: 'Chase Bank Account',
          invoiceNumber: 'INV-2024-002',
          serviceType: 'Repair'
        }
      ];

      const mockFinancingOptions: FinancingOption[] = [
        {
          id: '1',
          name: 'Engine Rebuild Financing',
          type: 'payment_plan',
          amount: 2500,
          term: 12,
          interestRate: 0,
          monthlyPayment: 208.33,
          totalCost: 2500,
          status: 'active',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          remainingBalance: 1500,
          nextPaymentDate: '2024-02-01'
        }
      ];

      setPaymentMethods(mockPaymentMethods);
      setBillingHistory(mockBillingHistory);
      setFinancingOptions(mockFinancingOptions);
    } catch (error) {
      console.error('Error loading payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
      case 'debit_card':
        return <CreditCardIcon className="w-5 h-5" />;
      case 'bank_account':
        return <Banknote className="w-5 h-5" />;
      case 'digital_wallet':
        return <Smartphone className="w-5 h-5" />;
      default:
        return <Wallet className="w-5 h-5" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-l-4 border-blue-500">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payment Options</h1>
              <p className="text-gray-600">Manage your payment methods, view billing history, and track financing</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-sm text-gray-500">
                <Shield className="w-4 h-4 mr-1" />
                Secure Payments
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'payment-methods', name: 'Payment Methods', icon: CreditCard },
                { id: 'billing-history', name: 'Billing History', icon: FileText },
                { id: 'financing', name: 'Financing', icon: Calculator }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
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

        {/* Tab Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Payment Methods Tab */}
          {activeTab === 'payment-methods' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Payment Methods</h2>
                <button
                  onClick={() => setShowAddPaymentMethod(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment Method
                </button>
              </div>

              <div className="grid gap-4">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {getPaymentMethodIcon(method.type)}
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{method.name}</h3>
                          <p className="text-sm text-gray-500">
                            {method.type === 'credit_card' && `Expires ${method.expiryDate}`}
                            {method.type === 'bank_account' && `${method.bankName} ${method.accountType}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {method.isDefault && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Default
                          </span>
                        )}
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => setSelectedPaymentMethod(method)}
                            className="p-1 text-gray-400 hover:text-gray-600"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600">
                            <Edit className="w-4 h-4" />
                          </button>
                          {!method.isDefault && (
                            <button className="p-1 text-gray-400 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Billing History Tab */}
          {activeTab === 'billing-history' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Billing History</h2>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search transactions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {billingHistory.map((transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{transaction.description}</div>
                            {transaction.invoiceNumber && (
                              <div className="text-sm text-gray-500">#{transaction.invoiceNumber}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(transaction.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                            {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.paymentMethod}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-gray-600 hover:text-gray-900">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Financing Tab */}
          {activeTab === 'financing' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Financing Options</h2>
                <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <Plus className="w-4 h-4 mr-2" />
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
      </div>
    </div>
  );
}
