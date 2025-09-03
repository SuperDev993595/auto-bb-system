import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { customerApiService, Invoice as InvoiceType, Vehicle as VehicleType } from '../../services/customerApi';
import { HiEye, HiDownload, HiCreditCard, HiCheckCircle, HiCurrencyDollar, HiDocumentText, HiLockClosed } from 'react-icons/hi';
import ModalWrapper from '../../utils/ModalWrapper';
import { downloadPDF } from '../../utils/pdfDownload';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getStripePublishableKey } from '../../config/stripe';

// Initialize Stripe
const stripePromise = loadStripe(getStripePublishableKey());

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
    // This will be handled by the Stripe payment form
  };

  // Stripe Payment Form Component
  const StripePaymentForm = ({ invoice, onSuccess, onClose }: { 
    invoice: InvoiceType; 
    onSuccess: () => void; 
    onClose: () => void; 
  }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentReference, setPaymentReference] = useState('');

    const handleSubmit = async (event: React.FormEvent) => {
      event.preventDefault();

      if (!stripe || !elements) {
        toast.error('Stripe is not loaded');
        return;
      }

      setIsProcessing(true);

      try {
        // Create payment intent on your backend
        const response = await customerApiService.createPaymentIntent(invoice.id, {
          amount: invoice.total,
          currency: 'usd',
          paymentReference
        });

        if (!response.success) {
          toast.error(response.message || 'Failed to create payment intent');
          return;
        }

        // Confirm the payment with Stripe
        const { error, paymentIntent } = await stripe.confirmCardPayment(response.data.clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement)!,
            billing_details: {
              name: 'Customer',
              email: 'customer@example.com'
            }
          }
        });

        if (error) {
          toast.error(error.message || 'Payment failed');
        } else if (paymentIntent.status === 'succeeded') {
          // Confirm payment with backend
          try {
            const confirmResponse = await customerApiService.confirmPayment(invoice.id, {
              paymentIntentId: paymentIntent.id,
              paymentReference
            });

            if (confirmResponse.success) {
              // Update local state
              setInvoices(prev => 
                prev.map(inv => 
                  inv.id === invoice.id 
                    ? { ...inv, status: 'paid', paymentDate: new Date().toISOString() }
                    : inv
                )
              );
              
              toast.success('Payment processed successfully!');
              onSuccess();
            } else {
              toast.error(confirmResponse.message || 'Failed to confirm payment');
            }
          } catch (confirmError) {
            console.error('Error confirming payment:', confirmError);
            toast.error('Payment processed but failed to update invoice status');
          }
        }
      } catch (error) {
        console.error('Error processing payment:', error);
        toast.error('Failed to process payment');
      } finally {
        setIsProcessing(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice Details */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <HiDocumentText className="w-4 h-4" />
            Invoice Details
          </h4>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Invoice #:</span> {invoice.invoiceNumber}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Amount:</span> ${invoice.total.toFixed(2)}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Due Date:</span> {new Date(invoice.dueDate).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Items:</span> {invoice.items && invoice.items.length > 0 ? invoice.items.map(item => item.description).join(', ') : 'N/A'}
            </p>
          </div>
        </div>
        
        {/* Payment Reference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <HiDocumentText className="w-4 h-4" />
            Payment Reference (Optional)
          </label>
          <input
            type="text"
            value={paymentReference}
            onChange={(e) => setPaymentReference(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all duration-200 hover:bg-white"
            placeholder="Transaction ID or reference number"
          />
          <p className="text-xs text-gray-500 mt-2">Provide a reference number for tracking purposes</p>
        </div>

        {/* Stripe Card Element */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
            <HiCreditCard className="w-4 h-4" />
            Card Information *
          </label>
          <div className="p-4 border border-gray-200 rounded-lg bg-white">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#374151',
                    '::placeholder': {
                      color: '#9CA3AF',
                    },
                  },
                },
              }}
            />
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <HiLockClosed className="w-3 h-3" />
            <span>Your payment information is secure and encrypted</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              <>
                <HiCreditCard className="w-4 h-4" />
                Pay ${invoice.total.toFixed(2)}
              </>
            )}
          </button>
        </div>
      </form>
    );
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
                      <div className="text-xs font-medium text-gray-900">{invoice.invoiceNumber}</div>
                      <div className="text-xs text-gray-500">Due: {new Date(invoice.dueDate).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                      {(() => {
                        const vehicle = vehicles.find(v => v.id === invoice.vehicleId);
                        return vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle';
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
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
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-900">
                      {new Date(invoice.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-gray-900">
                      ${invoice.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleViewInvoice(invoice)}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Invoice"
                        >
                          <HiEye className="w-4 h-4" />
                        </button>
                        {(invoice.status === 'pending' || invoice.status === 'sent' || invoice.status === 'overdue') && (
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
          title="Secure Payment with Stripe"
          icon={<HiCreditCard className="w-5 h-5" />}
          size="lg"
        >
          <div className="p-6">
            <Elements stripe={stripePromise}>
              <StripePaymentForm
                invoice={selectedInvoice}
                onSuccess={() => {
                  setShowPaymentModal(false);
                  setSelectedInvoice(null);
                  setPaymentData({ paymentMethod: 'credit_card', paymentReference: '' });
                }}
                onClose={() => setShowPaymentModal(false)}
              />
            </Elements>
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
          <div className="p-6 space-y-6 max-h-96 overflow-y-auto">
            {/* Invoice Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Invoice #{selectedInvoice.invoiceNumber}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Automotive Service
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedInvoice.status)}`}>
                    <span className="capitalize">{selectedInvoice.status}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Customer & Vehicle Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <HiEye className="w-5 h-5 text-blue-600 mr-2" />
                  <h6 className="font-semibold text-gray-900">Customer Information</h6>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> You</p>
                  <p><span className="font-medium">Type:</span> Customer</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <HiDocumentText className="w-5 h-5 text-green-600 mr-2" />
                  <h6 className="font-semibold text-gray-900">Vehicle Information</h6>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Vehicle:</span> {(() => {
                    const vehicle = vehicles.find(v => v.id === selectedInvoice.vehicleId);
                    return vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : 'Unknown Vehicle';
                  })()}</p>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <HiDocumentText className="w-5 h-5 text-purple-600 mr-2" />
                <h6 className="font-semibold text-gray-900">Important Dates</h6>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Created Date</p>
                  <p className="text-gray-900">{new Date(selectedInvoice.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Due Date</p>
                  <p className="text-gray-900">{new Date(selectedInvoice.dueDate).toLocaleDateString()}</p>
                </div>
                {selectedInvoice.paymentDate && (
                  <div>
                    <p className="font-medium text-gray-700">Paid Date</p>
                    <p className="text-green-600">{new Date(selectedInvoice.paymentDate).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Financial Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <HiCurrencyDollar className="w-5 h-5 text-green-600 mr-2" />
                <h6 className="font-semibold text-gray-900">Detailed Financial Summary</h6>
              </div>
              
              {/* Invoice Items Breakdown */}
              {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                <div className="space-y-3 mb-4">
                  <h6 className="font-medium text-gray-700 text-sm">Service Breakdown:</h6>
                  
                  {/* Group items by type for better organization */}
                  {(() => {
                    const laborItems = selectedInvoice.items.filter(item => item.type === 'labor');
                    const partItems = selectedInvoice.items.filter(item => item.type === 'part');
                    const overheadItems = selectedInvoice.items.filter(item => item.type === 'overhead');
                    const otherItems = selectedInvoice.items.filter(item => !item.type || item.type === 'service');
                    
                    return (
                      <div className="space-y-4">
                        {/* Labor Items */}
                        {laborItems.length > 0 && (
                          <div>
                            <h6 className="font-medium text-blue-700 text-sm mb-2">Labor Charges:</h6>
                            <div className="space-y-2">
                              {laborItems.map((item, index) => (
                                <div key={index} className="flex justify-between items-center text-sm bg-blue-50 px-3 py-2 rounded">
                                  <div className="flex-1">
                                    <span className="font-medium">{item.description}</span>
                                    {item.quantity > 1 && (
                                      <span className="text-gray-600 ml-2">
                                        ({item.quantity} hrs)
                                      </span>
                                    )}
                                  </div>
                                  <span className="font-medium">${item.total.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Parts Items */}
                        {partItems.length > 0 && (
                          <div>
                            <h6 className="font-medium text-green-700 text-sm mb-2">Parts Used:</h6>
                            <div className="space-y-2">
                              {partItems.map((item, index) => (
                                <div key={index} className="flex justify-between items-center text-sm bg-green-50 px-3 py-2 rounded">
                                  <div className="flex-1">
                                    <div className="flex items-center">
                                      <span className="font-medium">{item.description.replace('Part: ', '')}</span>
                                      {item.partNumber && (
                                        <span className="text-gray-500 text-xs ml-2 bg-gray-100 px-2 py-1 rounded">
                                          #{item.partNumber}
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-gray-600 text-xs">
                                      {item.quantity} × ${item.unitPrice.toFixed(2)} each
                                    </span>
                                  </div>
                                  <span className="font-medium">${item.total.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Overhead Items */}
                        {overheadItems.length > 0 && (
                          <div>
                            <h6 className="font-medium text-purple-700 text-sm mb-2">Service Overhead:</h6>
                            <div className="space-y-2">
                              {overheadItems.map((item, index) => (
                                <div key={index} className="flex justify-between items-center text-sm bg-purple-50 px-3 py-2 rounded">
                                  <span className="font-medium">{item.description}</span>
                                  <span className="font-medium">${item.total.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Other/Service Items */}
                        {otherItems.length > 0 && (
                          <div>
                            <h6 className="font-medium text-gray-700 text-sm mb-2">Other Services:</h6>
                            <div className="space-y-2">
                              {otherItems.map((item, index) => (
                                <div key={index} className="flex justify-between items-center text-sm bg-gray-50 px-3 py-2 rounded">
                                  <span className="font-medium">{item.description}</span>
                                  <span className="font-medium">${item.total.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="text-gray-500 text-sm mb-4">No detailed items available</div>
              )}
              
              {/* Totals Summary */}
              <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${selectedInvoice.subtotal.toFixed(2)}</span>
                </div>
                {selectedInvoice.tax > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">${selectedInvoice.tax.toFixed(2)}</span>
                  </div>
                )}
                {selectedInvoice.discount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Discount:</span>
                    <span className="font-medium text-green-600">-${selectedInvoice.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="font-semibold text-gray-900">Total:</span>
                  <span className="font-bold text-lg text-gray-900">${selectedInvoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {selectedInvoice.notes && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h6 className="font-semibold text-gray-900 mb-2">Notes</h6>
                <p className="text-sm text-gray-700">{selectedInvoice.notes}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleDownloadInvoice(selectedInvoice.id)}
                className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <HiDownload className="w-4 h-4 mr-2" />
                Download PDF
              </button>
            </div>
          </div>
        </ModalWrapper>
      )}
    </div>
  );
}
