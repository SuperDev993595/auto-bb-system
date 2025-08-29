import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { authService } from '../../services/auth';
import { customerApiService, Invoice as InvoiceType, Vehicle as VehicleType } from '../../services/customerApi';
import { FileText, X, CheckCircle, DollarSign, CreditCard, Hash } from '../../utils/icons';
import ModalWrapper from '../../utils/ModalWrapper';

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  vehicleInfo: string;
  serviceType: string;
  total: number;
  status: 'paid' | 'pending' | 'overdue';
  paymentMethod?: string;
  paymentDate?: string;
}

export default function CustomerInvoices() {
  const [invoices, setInvoices] = useState<InvoiceType[]>([]);
  const [vehicles, setVehicles] = useState<VehicleType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceType | null>(null);
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'credit_card',
    paymentReference: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [invoicesResponse, vehiclesResponse] = await Promise.all([
        customerApiService.getInvoices(),
        customerApiService.getVehicles()
      ]);
      
      if (invoicesResponse.success) {
        setInvoices(invoicesResponse.data.invoices);
      } else {
        toast.error(invoicesResponse.message || 'Failed to load invoices');
      }
      
      if (vehiclesResponse.success) {
        setVehicles(vehiclesResponse.data.vehicles);
      } else {
        toast.error(vehiclesResponse.message || 'Failed to load vehicles');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load invoice data');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const handlePayInvoice = async (invoice: InvoiceType) => {
    setSelectedInvoice(invoice);
    setShowPaymentModal(true);
  };

  const handleProcessPayment = async () => {
    if (!selectedInvoice) return;

    try {
      const response = await customerApiService.payInvoice(selectedInvoice.id, paymentData);
      
      if (!response.success) {
        toast.error(response.message || 'Failed to process payment');
        return;
      }
      
      // Update local state
      setInvoices(prev => 
        prev.map(inv => 
          inv.id === selectedInvoice.id 
            ? { ...inv, status: 'paid', paymentDate: new Date().toISOString() }
            : inv
        )
      );
      
      setShowPaymentModal(false);
      setSelectedInvoice(null);
      setPaymentData({ paymentMethod: 'credit_card', paymentReference: '' });
      toast.success('Payment processed successfully!');
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Failed to process payment');
    }
  };

  const handleDownloadInvoice = async (invoiceId: string) => {
    try {
      const response = await customerApiService.downloadInvoice(invoiceId);
      
      if (response.success) {
        toast.success('Invoice download initiated');
        // In a real implementation, you would trigger the actual download here
        // For now, we'll just show a success message
        console.log('Download URL:', response.data.downloadUrl);
      } else {
        toast.error(response.message || 'Failed to download invoice');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    }
  };

  const filteredInvoices = selectedStatus === 'all' 
    ? invoices 
    : invoices.filter(invoice => invoice.status === selectedStatus);

  const totalInvoiced = invoices.reduce((sum, invoice) => sum + invoice.total, 0);
  const totalPaid = invoices.filter(inv => inv.status === 'paid').reduce((sum, invoice) => sum + invoice.total, 0);
  const totalOutstanding = totalInvoiced - totalPaid;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-l-4 border-blue-500">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Invoices & Payments</h1>
            <p className="text-gray-600">Manage your invoices and track payments</p>
          </div>
          <div className="flex gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <FileText className="w-4 h-4" />
              Download All
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Invoiced</p>
              <p className="text-2xl font-bold text-gray-900">${totalInvoiced.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-gray-900">${totalPaid.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <DollarSign className="w-8 h-8 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Outstanding</p>
              <p className="text-2xl font-bold text-gray-900">${totalOutstanding.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vehicle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
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
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{invoice.invoiceNumber}</div>
                      <div className="text-sm text-gray-500">Due: {new Date(invoice.dueDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(() => {
                        const vehicle = vehicles.find(v => v.id === invoice.vehicleId);
                        return vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle';
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.serviceType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(invoice.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${invoice.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">View</button>
                        {invoice.status === 'pending' && (
                          <button 
                            onClick={() => handlePayInvoice(invoice)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Pay
                          </button>
                        )}
                        <button 
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Download
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FileText className="w-12 h-12 text-gray-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
              <p className="text-gray-600">Your invoices will appear here after service appointments.</p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && selectedInvoice && (
        <ModalWrapper
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          title="Process Payment"
          icon={<CreditCard className="w-5 h-5" />}
          submitText="Process Payment"
          onSubmit={handleProcessPayment}
          submitColor="bg-green-600"
          size="lg"
        >
          <div className="p-6 space-y-6">
            {/* Invoice Details */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Invoice Details
              </h4>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Invoice #:</span> {selectedInvoice.invoiceNumber}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Amount:</span> ${selectedInvoice.total.toFixed(2)}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Due Date:</span> {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Payment Method *
              </label>
              <select
                value={paymentData.paymentMethod}
                onChange={(e) => setPaymentData(prev => ({ ...prev, paymentMethod: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 hover:bg-white"
                required
              >
                <option value="">Select payment method</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
              </select>
            </div>

            {/* Payment Reference */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Payment Reference (Optional)
              </label>
              <input
                type="text"
                value={paymentData.paymentReference}
                onChange={(e) => setPaymentData(prev => ({ ...prev, paymentReference: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 hover:bg-white"
                placeholder="Transaction ID or reference number"
              />
              <p className="text-xs text-gray-500 mt-2">Provide a reference number for tracking purposes</p>
            </div>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
}
