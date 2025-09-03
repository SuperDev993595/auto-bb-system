import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { customerApiService, Invoice as InvoiceType, Vehicle as VehicleType } from '../../services/customerApi';
import { HiEye, HiDownload, HiCreditCard, HiCheckCircle, HiCurrencyDollar, HiDocumentText } from 'react-icons/hi';
import ModalWrapper from '../../utils/ModalWrapper';
import { downloadPDF } from '../../utils/pdfDownload';

export default function CustomerInvoices() {
  const [invoices, setInvoices] = useState<InvoiceType[]>([]);
  const [vehicles, setVehicles] = useState<VehicleType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
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
      
      console.log('Invoices Response:', invoicesResponse);
      console.log('Vehicles Response:', vehiclesResponse);
      
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
      toast.loading('Generating and downloading PDF...');
      
      const response = await customerApiService.downloadInvoice(invoiceId);
      
      if (response.success) {
        // Download the PDF file using the utility function
        downloadPDF(response.data, `invoice-${invoiceId}.pdf`);
        toast.success('PDF downloaded successfully!');
      } else {
        toast.error(response.message || 'Failed to download invoice');
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast.error('Failed to download invoice');
    }
  };

  const handleBulkDownload = async () => {
    if (invoices.length === 0) {
      toast.error('No invoices to download');
      return;
    }

    try {
      toast.loading(`Generating and downloading ${invoices.length} invoices...`);
      
      const invoiceIds = invoices.map(invoice => invoice.id);
      const response = await customerApiService.downloadBulkInvoices(invoiceIds);
      
      if (response.success) {
        // Download the bulk PDF file
        downloadPDF(response.data, `invoices-bulk-${new Date().toISOString().split('T')[0]}.pdf`);
        toast.success(`Successfully downloaded ${invoices.length} invoices!`);
      } else {
        toast.error(response.message || 'Failed to download invoices');
      }
    } catch (error) {
      console.error('Error downloading invoices:', error);
      toast.error('Failed to download invoices');
    }
  };

  const handleViewInvoice = (invoice: InvoiceType) => {
    setSelectedInvoice(invoice);
    setShowViewModal(true);
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
            <button 
              onClick={handleBulkDownload}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <HiDocumentText className="w-4 h-4" />
              Download All ({invoices.length})
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <HiDocumentText className="w-8 h-8 text-blue-600" />
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
              <HiCheckCircle className="w-8 h-8 text-green-600" />
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
              <HiCurrencyDollar className="w-8 h-8 text-orange-600" />
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
              <option value="all">All Status ({invoices.length})</option>
              <option value="paid">Paid ({invoices.filter(inv => inv.status === 'paid').length})</option>
              <option value="pending">Pending ({invoices.filter(inv => inv.status === 'pending').length})</option>
              <option value="overdue">Overdue ({invoices.filter(inv => inv.status === 'overdue').length})</option>
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
                       {(() => {
                         // Try to get service type from work order or service data
                         // For now, we'll show a more descriptive service type
                         if (invoice.serviceType && invoice.serviceType !== 'Automotive Repair') {
                           return invoice.serviceType;
                         }
                         // If it's the generic "Automotive Repair" or missing, show more specific info
                         if (invoice.items && invoice.items.length > 0) {
                           const serviceNames = invoice.items
                             .filter(item => item.description && !item.description.includes('Part:'))
                             .map(item => item.description)
                             .slice(0, 2); // Show first 2 service descriptions
                           return serviceNames.length > 0 ? serviceNames.join(', ') : 'General Service';
                         }
                         return 'General Service';
                       })()}
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
                        <button 
                          onClick={() => handleViewInvoice(invoice)}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Invoice"
                        >
                          <HiEye className="w-4 h-4" />
                        </button>
                        {invoice.status === 'pending' && (
                          <button 
                            onClick={() => handlePayInvoice(invoice)}
                            className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                            title="Pay Invoice"
                          >
                            <HiCreditCard className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => handleDownloadInvoice(invoice.id)}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                          title="Download Invoice"
                        >
                          <HiDownload className="w-4 h-4" />
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
                <HiDocumentText className="w-12 h-12 text-gray-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
              <p className="text-gray-600">
                {selectedStatus === 'all' 
                  ? 'Your invoices will appear here after service appointments.'
                  : `No invoices found with status "${selectedStatus}".`
                }
              </p>
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
          icon={<HiCreditCard className="w-5 h-5" />}
          submitText="Process Payment"
          onSubmit={handleProcessPayment}
          submitColor="bg-green-600"
          size="lg"
        >
          <div className="p-6 space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
            {/* Invoice Details */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <HiDocumentText className="w-4 h-4" />
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
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Items:</span> {selectedInvoice.items && selectedInvoice.items.length > 0 ? selectedInvoice.items.map(item => item.description).join(', ') : 'N/A'}
                </p>
              </div>
            </div>
            
            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <HiCreditCard className="w-4 h-4" />
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
                <HiDocumentText className="w-4 h-4" />
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

      {/* View Invoice Modal */}
      {showViewModal && selectedInvoice && (
        <ModalWrapper
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="Invoice Details"
          icon={<HiDocumentText className="w-5 h-5" />}
          size="xl"
        >
          <div className="p-6 space-y-6">
            {/* Invoice Details */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <HiDocumentText className="w-4 h-4" />
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
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Status:</span> {selectedInvoice.status}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Date:</span> {new Date(selectedInvoice.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Payment Date:</span> {selectedInvoice.paymentDate ? new Date(selectedInvoice.paymentDate).toLocaleDateString() : 'Not paid yet'}
                </p>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <HiDocumentText className="w-4 h-4" />
                Vehicle Details
              </h4>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Vehicle:</span> {(() => {
                    const vehicle = vehicles.find(v => v.id === selectedInvoice.vehicleId);
                    return vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle';
                  })()}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Service Type:</span> {selectedInvoice.serviceType}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Items:</span> {selectedInvoice.items && selectedInvoice.items.length > 0 ? selectedInvoice.items.map(item => item.description).join(', ') : 'N/A'}
                </p>
              </div>
            </div>

            {/* Payment Information */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <HiDocumentText className="w-4 h-4" />
                Payment Information
              </h4>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Payment Method:</span> {selectedInvoice.paymentMethod || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Payment Reference:</span> {selectedInvoice.paymentReference || 'N/A'}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Payment Date:</span> {selectedInvoice.paymentDate ? new Date(selectedInvoice.paymentDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
}
